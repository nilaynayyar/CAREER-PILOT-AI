"""
CareerPilot AI — ML Inference Service
=======================================
Loads the serialized sklearn Pipeline ONCE at startup and exposes
a thread-safe predict() method.

ARCHITECTURAL GUARANTEE:
  - The ML model is the sole authority for SalaryTier prediction.
  - No agent, LLM, or external service can override salary_tier.
  - The pipeline includes all preprocessing; no re-processing is done here.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from backend.app.core.config import settings
from backend.app.schemas import (
    FeatureExplanation,
    MLPrediction,
    SalaryTier,
    StudentProfile,
)

logger = logging.getLogger(__name__)

# Global model state (loaded once at startup)
_pipeline = None
_metadata: dict[str, Any] = {}
_feature_importances: list[dict[str, Any]] = []


def load_model() -> None:
    """
    Load the serialized sklearn Pipeline and model metadata.
    Called once at application startup via FastAPI lifespan.
    Raises RuntimeError if the model file is missing.
    """
    global _pipeline, _metadata, _feature_importances

    model_path = settings.model_path
    meta_path = settings.model_metadata_path

    if not model_path.exists():
        raise RuntimeError(
            f"ML model not found at {model_path}. "
            "Run 'python -m ml.run_pipeline' to train the model first."
        )

    _pipeline = joblib.load(model_path)
    logger.info("ML Pipeline loaded from %s", model_path)

    if meta_path.exists():
        with open(meta_path, "r", encoding="utf-8") as f:
            _metadata = json.load(f)
        logger.info("Model metadata loaded: %s", _metadata.get("model_name"))
    else:
        logger.warning("Model metadata not found at %s", meta_path)

    # Load permutation importances if available
    perm_path = Path(settings.model_path).parents[1] / "docs" / "reports" / "permutation_importances.csv"
    if not perm_path.exists():
        # Try relative to project root
        from backend.app.core.config import PROJECT_ROOT
        perm_path = PROJECT_ROOT / "docs" / "reports" / "permutation_importances.csv"

    if perm_path.exists():
        perm_df = pd.read_csv(perm_path)
        _feature_importances = perm_df.head(10).to_dict(orient="records")
        logger.info("Feature importances loaded (%d features)", len(_feature_importances))
    else:
        logger.warning("Permutation importances CSV not found; using empty list.")


def is_loaded() -> bool:
    return _pipeline is not None


def predict(profile: StudentProfile) -> MLPrediction:
    """
    Run ML inference on a validated StudentProfile.
    Returns an MLPrediction with salary_tier and probabilities.

    IMPORTANT: The returned salary_tier must never be modified downstream.
    """
    if _pipeline is None:
        raise RuntimeError("ML model is not loaded. Check application startup logs.")

    # Convert to DataFrame with exact column names expected by the pipeline
    input_dict = profile.to_model_dict()
    df = pd.DataFrame([input_dict])

    # Run prediction through the complete sklearn Pipeline
    # (includes imputation, scaling, encoding)
    predicted_class = _pipeline.predict(df)[0]
    probas_array = _pipeline.predict_proba(df)[0]
    class_order = list(_pipeline.classes_)  # e.g. ['High', 'Low', 'Mid']

    probabilities = {
        cls: round(float(p), 4)
        for cls, p in zip(class_order, probas_array)
    }

    return MLPrediction(
        salary_tier=SalaryTier(predicted_class),
        probabilities=probabilities,
        model_name=_metadata.get("model_name", "LogisticRegression"),
    )


def get_explanation() -> FeatureExplanation:
    """
    Return global feature importance information.
    Uses permutation importances from Phase 2 evaluation.
    """
    if not _feature_importances:
        return FeatureExplanation(
            method="not_available",
            top_features=[],
            note=(
                "Feature importance data is not available. "
                "Run the full ML pipeline to generate it."
            ),
        )

    return FeatureExplanation(
        method="permutation_importance",
        top_features=_feature_importances,
    )


def get_metadata() -> dict[str, Any]:
    return _metadata


def get_salary_thresholds() -> list[float]:
    """Return the training-set salary thresholds used to define tiers."""
    return _metadata.get("target_definition", {}).get("thresholds_inr", [])
