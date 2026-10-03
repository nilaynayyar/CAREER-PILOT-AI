"""
CareerPilot AI — ML Training Module
=====================================
Implements the full model comparison and training pipeline:

  1. Baselines (DummyClassifier, majority-class)
  2. Model comparison (LR, Decision Tree, RF, HistGradientBoosting)
  3. Stratified cross-validation with multiple metrics
  4. Hyperparameter tuning (RandomizedSearchCV on top candidate)
  5. Final model selection
  6. Model serialization (complete sklearn Pipeline + metadata JSON)

All decisions are based on cross-validation ONLY on training data.
The test set is NEVER touched during this phase.
"""

from __future__ import annotations

import json
import logging
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    make_scorer,
    precision_score,
    recall_score,
)
from sklearn.model_selection import (
    RandomizedSearchCV,
    StratifiedKFold,
    cross_validate,
)
from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeClassifier

from ml.src.preprocessing import (
    build_preprocessor,
    get_feature_columns,
    load_config,
    run_preprocessing,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[2]


# ---------------------------------------------------------------------------
# Metric helpers
# ---------------------------------------------------------------------------

SCORING = {
    "accuracy": "accuracy",
    "f1_macro": "f1_macro",
    "f1_weighted": "f1_weighted",
    "precision_macro": "precision_macro",
    "recall_macro": "recall_macro",
}


def _mean_std(arr: np.ndarray) -> tuple[float, float]:
    return float(arr.mean()), float(arr.std())


# ---------------------------------------------------------------------------
# Baseline Evaluation
# ---------------------------------------------------------------------------

def evaluate_baselines(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    cfg: dict[str, Any],
) -> dict[str, dict[str, float]]:
    """
    Evaluate DummyClassifier baselines via stratified CV.
    Returns dict of {model_name: {metric: mean}}.
    """
    seed = cfg["random_seed"]
    cv = StratifiedKFold(n_splits=cfg["cv_folds"], shuffle=True, random_state=seed)

    baselines = {
        "dummy_majority": DummyClassifier(strategy="most_frequent", random_state=seed),
        "dummy_stratified": DummyClassifier(strategy="stratified", random_state=seed),
        "dummy_uniform": DummyClassifier(strategy="uniform", random_state=seed),
    }

    results = {}
    for name, clf in baselines.items():
        scores = cross_validate(clf, X_train, y_train, cv=cv, scoring=SCORING)
        results[name] = {
            metric: float(scores[f"test_{metric}"].mean())
            for metric in SCORING
        }
        logger.info(
            "Baseline %-25s | accuracy=%.3f | f1_macro=%.3f",
            name,
            results[name]["accuracy"],
            results[name]["f1_macro"],
        )
    return results


# ---------------------------------------------------------------------------
# Model Definitions
# ---------------------------------------------------------------------------

def get_candidate_models(cfg: dict[str, Any]) -> dict[str, Any]:
    """
    Return a dict of {model_name: sklearn_estimator} for comparison.
    No hyperparameter tuning at this stage — default or sensible priors only.
    """
    seed = cfg["random_seed"]
    return {
        "logistic_regression": LogisticRegression(
            max_iter=1000, C=1.0, solver="lbfgs",
            random_state=seed,
        ),
        "decision_tree": DecisionTreeClassifier(
            max_depth=8, random_state=seed,
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=200, max_depth=None,
            class_weight="balanced", random_state=seed, n_jobs=-1,
        ),
        "hist_gradient_boosting": HistGradientBoostingClassifier(
            max_iter=200, learning_rate=0.1,
            max_depth=5, random_state=seed,
        ),
    }


# ---------------------------------------------------------------------------
# Cross-Validation Comparison
# ---------------------------------------------------------------------------

def compare_models(
    models: dict[str, Any],
    preprocessor: Any,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    cfg: dict[str, Any],
) -> dict[str, dict[str, Any]]:
    """
    Run stratified K-fold CV for every model inside a full Pipeline.
    Returns results dict with mean and std for all metrics.
    """
    seed = cfg["random_seed"]
    cv = StratifiedKFold(n_splits=cfg["cv_folds"], shuffle=True, random_state=seed)
    results = {}

    for name, estimator in models.items():
        logger.info("Cross-validating: %s ...", name)
        pipe = Pipeline(
            steps=[("preprocessor", preprocessor), ("classifier", estimator)]
        )
        t0 = time.perf_counter()
        scores = cross_validate(pipe, X_train, y_train, cv=cv, scoring=SCORING)
        elapsed = time.perf_counter() - t0

        row: dict[str, Any] = {"cv_time_s": round(elapsed, 2)}
        for metric in SCORING:
            mean, std = _mean_std(scores[f"test_{metric}"])
            row[f"{metric}_mean"] = round(mean, 4)
            row[f"{metric}_std"] = round(std, 4)

        results[name] = row
        logger.info(
            "  %-30s | f1_macro=%.3f±%.3f | accuracy=%.3f±%.3f | %.1fs",
            name,
            row["f1_macro_mean"], row["f1_macro_std"],
            row["accuracy_mean"], row["accuracy_std"],
            elapsed,
        )

    return results


# ---------------------------------------------------------------------------
# Hyperparameter Tuning
# ---------------------------------------------------------------------------

def tune_model(
    model_name: str,
    estimator: Any,
    preprocessor: Any,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    cfg: dict[str, Any],
) -> tuple[Pipeline, dict[str, Any]]:
    """
    Run RandomizedSearchCV on the given model.
    Returns the best fitted Pipeline and the search results dict.
    """
    seed = cfg["random_seed"]
    cv = StratifiedKFold(n_splits=cfg["cv_folds"], shuffle=True, random_state=seed)

    # Build parameter grid — prefix with 'classifier__'
    raw_grid = cfg["tuning"].get(model_name, {})
    param_distributions = {
        f"classifier__{k}": v for k, v in raw_grid.items()
    }

    if not param_distributions:
        logger.warning("No tuning grid found for '%s'. Skipping tuning.", model_name)
        pipe = Pipeline(
            steps=[("preprocessor", preprocessor), ("classifier", estimator)]
        )
        pipe.fit(X_train, y_train)
        return pipe, {}

    pipe = Pipeline(
        steps=[("preprocessor", preprocessor), ("classifier", estimator)]
    )

    n_iter = min(30, _count_grid_size(raw_grid))
    logger.info(
        "Tuning %s with RandomizedSearchCV (n_iter=%d, cv=%d) ...",
        model_name, n_iter, cfg["cv_folds"],
    )

    search = RandomizedSearchCV(
        pipe,
        param_distributions=param_distributions,
        n_iter=n_iter,
        scoring=cfg["primary_metric"],
        cv=cv,
        random_state=seed,
        n_jobs=-1,
        refit=True,
        verbose=1,
        error_score="raise",
    )

    t0 = time.perf_counter()
    search.fit(X_train, y_train)
    elapsed = time.perf_counter() - t0

    best_params_raw = search.best_params_
    best_params_clean = {
        k.replace("classifier__", ""): v for k, v in best_params_raw.items()
    }

    logger.info(
        "Tuning complete in %.1fs | best %s=%.4f",
        elapsed, cfg["primary_metric"], search.best_score_,
    )
    logger.info("Best params: %s", best_params_clean)

    tuning_results = {
        "model": model_name,
        "best_params": best_params_clean,
        f"best_cv_{cfg['primary_metric']}": round(search.best_score_, 4),
        "n_iter": n_iter,
        "cv_folds": cfg["cv_folds"],
        "tuning_time_s": round(elapsed, 2),
    }

    return search.best_estimator_, tuning_results


def _count_grid_size(grid: dict) -> int:
    """Count total combinations in a param grid (for capping n_iter)."""
    total = 1
    for v in grid.values():
        if isinstance(v, list):
            total *= len(v)
    return total


# ---------------------------------------------------------------------------
# Model Selection
# ---------------------------------------------------------------------------

def select_best_model(
    comparison_results: dict[str, dict[str, Any]],
    primary_metric: str = "f1_macro_mean",
) -> str:
    """Return the name of the model with the highest primary CV metric."""
    best = max(comparison_results, key=lambda m: comparison_results[m][primary_metric])
    best_score = comparison_results[best][primary_metric]
    logger.info("Best model by %s: %s (%.4f)", primary_metric, best, best_score)
    return best


# ---------------------------------------------------------------------------
# Model Serialization
# ---------------------------------------------------------------------------

def save_model(
    pipeline: Pipeline,
    cfg: dict[str, Any],
    tuning_results: dict[str, Any],
    comparison_results: dict[str, dict[str, Any]],
    baseline_results: dict[str, dict[str, Any]],
    feature_cols: dict[str, list[str]],
    salary_thresholds: list[float],
    final_metrics: dict[str, Any] | None = None,
) -> Path:
    """
    Serialize the complete fitted Pipeline and write metadata JSON.
    Returns path to the saved .joblib file.
    """
    models_dir = PROJECT_ROOT / cfg["models_dir"]
    models_dir.mkdir(parents=True, exist_ok=True)

    model_path = models_dir / "final_model.joblib"
    joblib.dump(pipeline, model_path)
    logger.info("Saved pipeline to %s", model_path)

    all_features = feature_cols["numerical"] + feature_cols["categorical"]
    metadata = {
        "model_name": str(pipeline.named_steps["classifier"].__class__.__name__),
        "sklearn_version": sklearn.__version__,
        "training_date_utc": datetime.now(timezone.utc).isoformat(),
        "dataset": cfg["raw_data_path"],
        "dataset_sha256": cfg["raw_data_sha256"],
        "random_seed": cfg["random_seed"],
        "target_definition": {
            "column": cfg["target_column"],
            "type": "tertile_classification",
            "source_column": cfg["salary_source_column"],
            "thresholds_inr": salary_thresholds,
            "labels": cfg["target_labels"],
        },
        "feature_list": all_features,
        "n_features": len(all_features),
        "cv_comparison": comparison_results,
        "baselines": baseline_results,
        "tuning": tuning_results,
        "final_test_metrics": final_metrics or {},
        "important_limitations": [
            "AMEO 2015 covers Indian engineering graduates (2010–2015). "
            "Predictions should not be generalised to all students or current market conditions.",
            "SalaryTier thresholds are derived from this historical dataset. "
            "They do not reflect absolute present-day salary benchmarks.",
            "Model performance is moderate (macro-F1 ~0.50). "
            "Predictions are probabilistic guidance, not guarantees.",
            "Post-employment features (Designation, JobCity, DOJ, DOL) "
            "were strictly excluded as inputs.",
        ],
    }

    meta_path = models_dir / "model_metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, default=str)
    logger.info("Saved metadata to %s", meta_path)

    return model_path


# ---------------------------------------------------------------------------
# Main Training Orchestrator
# ---------------------------------------------------------------------------

def run_training(
    cfg: dict[str, Any],
    data: dict[str, Any],
) -> dict[str, Any]:
    """
    Orchestrate the full training pipeline.
    `data` is the dict returned by run_preprocessing().

    Steps:
      1. Evaluate baselines
      2. Compare candidate models via CV
      3. Select best model
      4. Tune best model
      5. Save best fitted pipeline
    """
    X_train = data["X_train"]
    y_train = data["y_train"]
    preprocessor = data["preprocessor"]
    feature_cols = data["feature_cols"]
    salary_thresholds = data["salary_thresholds"]

    logger.info("=" * 60)
    logger.info("PHASE 2 — CareerPilot AI ML Training")
    logger.info("=" * 60)
    logger.info("Training samples: %d", len(X_train))
    logger.info("Primary metric: %s", cfg["primary_metric"])

    # 1. Baselines
    logger.info("\n--- Step 1: Baselines ---")
    baseline_results = evaluate_baselines(X_train, y_train, cfg)

    # 2. Model Comparison
    logger.info("\n--- Step 2: Model Comparison ---")
    candidates = get_candidate_models(cfg)
    comparison_results = compare_models(
        candidates, preprocessor, X_train, y_train, cfg
    )

    # 3. Select best
    logger.info("\n--- Step 3: Model Selection ---")
    best_name = select_best_model(comparison_results, primary_metric="f1_macro_mean")

    # 4. Tune best model
    logger.info("\n--- Step 4: Hyperparameter Tuning (%s) ---", best_name)
    best_estimator = get_candidate_models(cfg)[best_name]
    tuned_pipeline, tuning_results = tune_model(
        best_name,
        best_estimator,
        # Pass a fresh preprocessor (not fitted)
        build_preprocessor(feature_cols),
        X_train,
        y_train,
        cfg,
    )

    # 5. Save
    logger.info("\n--- Step 5: Serialization ---")
    model_path = save_model(
        tuned_pipeline,
        cfg,
        tuning_results=tuning_results,
        comparison_results=comparison_results,
        baseline_results=baseline_results,
        feature_cols=feature_cols,
        salary_thresholds=salary_thresholds,
    )

    return {
        "best_model_name": best_name,
        "tuned_pipeline": tuned_pipeline,
        "model_path": model_path,
        "comparison_results": comparison_results,
        "baseline_results": baseline_results,
        "tuning_results": tuning_results,
    }
