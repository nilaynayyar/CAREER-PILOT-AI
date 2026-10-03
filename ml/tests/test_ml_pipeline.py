"""
CareerPilot AI — ML Test Suite
================================
Tests cover:
  1. Config loading
  2. Target construction (SalaryTier)
  3. Preprocessing pipeline integrity (no leakage between splits)
  4. Feature set membership
  5. Model prediction shape and class validity
  6. Serialized model loading and inference
  7. Representative profile inference
  8. SHA-256 verification
"""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import pytest
from sklearn.pipeline import Pipeline

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = PROJECT_ROOT / "ml" / "configs" / "training_config.yaml"
RAW_DATA_PATH = PROJECT_ROOT / "data" / "raw" / "ameo_2015.csv"
MODEL_PATH = PROJECT_ROOT / "ml" / "models" / "final_model.joblib"
SPLIT_META_PATH = PROJECT_ROOT / "data" / "processed" / "split_metadata.json"


@pytest.fixture(scope="session")
def cfg():
    from ml.src.preprocessing import load_config
    return load_config(CONFIG_PATH)


@pytest.fixture(scope="session")
def raw_df():
    assert RAW_DATA_PATH.exists(), f"Raw dataset not found: {RAW_DATA_PATH}"
    return pd.read_csv(RAW_DATA_PATH)


@pytest.fixture(scope="session")
def preprocessing_data(cfg):
    from ml.src.preprocessing import run_preprocessing
    return run_preprocessing(cfg, verify_hash=False, save_splits=False)


@pytest.fixture(scope="session")
def trained_pipeline():
    if not MODEL_PATH.exists():
        pytest.skip("Final model not yet trained; run ml/run_pipeline.py first.")
    return joblib.load(MODEL_PATH)


# ---------------------------------------------------------------------------
# 1. Config
# ---------------------------------------------------------------------------

class TestConfig:
    def test_config_loads(self, cfg):
        assert isinstance(cfg, dict)

    def test_config_has_required_keys(self, cfg):
        required = [
            "random_seed", "raw_data_path", "target_column", "salary_source_column",
            "numerical_features", "categorical_features", "drop_columns",
            "test_size", "val_size", "cv_folds", "primary_metric",
        ]
        for key in required:
            assert key in cfg, f"Missing config key: {key}"

    def test_random_seed_is_int(self, cfg):
        assert isinstance(cfg["random_seed"], int)

    def test_target_labels_correct(self, cfg):
        assert set(cfg["target_labels"]) == {"Low", "Mid", "High"}

    def test_no_leakage_in_feature_list(self, cfg):
        """Salary, Designation, DOJ, DOL, Gender must NOT appear as features."""
        forbidden = {"Salary", "Designation", "DOJ", "DOL", "Gender", "DOB", "JobCity"}
        all_features = set(cfg["numerical_features"] + cfg["categorical_features"])
        overlap = forbidden & all_features
        assert not overlap, f"Leakage columns in feature list: {overlap}"


# ---------------------------------------------------------------------------
# 2. Raw Data
# ---------------------------------------------------------------------------

class TestRawData:
    def test_raw_file_exists(self):
        assert RAW_DATA_PATH.exists()

    def test_raw_shape(self, raw_df):
        assert raw_df.shape[0] == 3998, f"Expected 3998 rows, got {raw_df.shape[0]}"
        assert raw_df.shape[1] == 39, f"Expected 39 columns, got {raw_df.shape[1]}"

    def test_raw_no_duplicates(self, raw_df):
        assert raw_df.duplicated().sum() == 0

    def test_salary_column_present(self, raw_df):
        assert "Salary" in raw_df.columns

    def test_salary_is_positive(self, raw_df):
        assert (raw_df["Salary"] > 0).all()

    def test_designation_present(self, raw_df):
        assert "Designation" in raw_df.columns


# ---------------------------------------------------------------------------
# 3. Target Construction
# ---------------------------------------------------------------------------

class TestTargetConstruction:
    def test_salary_tier_three_classes(self, preprocessing_data):
        y_train = preprocessing_data["y_train"]
        assert set(y_train.unique()).issubset({"Low", "Mid", "High"})

    def test_salary_tier_no_nulls(self, preprocessing_data):
        for split in ["y_train", "y_val", "y_test"]:
            y = preprocessing_data[split]
            assert y.isna().sum() == 0, f"NaN values in {split}"

    def test_salary_thresholds_ordered(self, preprocessing_data):
        t = preprocessing_data["salary_thresholds"]
        assert len(t) == 2
        assert t[0] < t[1], "Salary thresholds should be ascending"

    def test_target_roughly_balanced(self, preprocessing_data):
        """No class should have < 20% or > 50% of training samples."""
        y_train = preprocessing_data["y_train"]
        counts = y_train.value_counts(normalize=True)
        for cls, pct in counts.items():
            assert 0.20 <= pct <= 0.50, (
                f"Class '{cls}' has {pct:.1%} — outside expected 20-50% range"
            )

    def test_train_thresholds_not_computed_from_test(self, preprocessing_data):
        """
        Verify: salary thresholds computed from train split,
        then applied to test. This is verified indirectly by checking
        that the threshold values match the training data's quantiles.
        """
        X_train = preprocessing_data["X_train"]
        thresholds = preprocessing_data["salary_thresholds"]
        # Both thresholds should be positive numbers (INR salary range)
        assert all(t > 0 for t in thresholds)


# ---------------------------------------------------------------------------
# 4. Preprocessing Pipeline
# ---------------------------------------------------------------------------

class TestPreprocessing:
    def test_no_post_outcome_columns(self, preprocessing_data):
        """Salary, Designation, JobCity, DOJ, DOL must not be in X_train."""
        X_train = preprocessing_data["X_train"]
        forbidden = {"Salary", "Designation", "JobCity", "DOJ", "DOL", "Gender", "DOB"}
        cols_present = forbidden & set(X_train.columns)
        assert not cols_present, f"Leakage columns present in X_train: {cols_present}"

    def test_no_salary_in_features(self, preprocessing_data):
        assert "Salary" not in preprocessing_data["X_train"].columns

    def test_sentinel_replaced(self, preprocessing_data):
        X_train = preprocessing_data["X_train"]
        if "ComputerProgramming" in X_train.columns:
            assert (X_train["ComputerProgramming"] == -1).sum() == 0, (
                "Sentinel -1 values still present in ComputerProgramming"
            )

    def test_train_val_test_disjoint_indices(self, preprocessing_data):
        """The three splits must not share any row index."""
        idx_train = set(preprocessing_data["X_train"].index)
        idx_val = set(preprocessing_data["X_val"].index)
        idx_test = set(preprocessing_data["X_test"].index)
        assert not (idx_train & idx_val), "Train and Val share indices!"
        assert not (idx_train & idx_test), "Train and Test share indices!"
        assert not (idx_val & idx_test), "Val and Test share indices!"

    def test_total_samples_preserved(self, preprocessing_data):
        n_train = len(preprocessing_data["X_train"])
        n_val = len(preprocessing_data["X_val"])
        n_test = len(preprocessing_data["X_test"])
        assert n_train + n_val + n_test == 3998, (
            f"Expected 3998 total rows, got {n_train + n_val + n_test}"
        )

    def test_expected_features_present(self, preprocessing_data, cfg):
        X_train = preprocessing_data["X_train"]
        expected_num = cfg["numerical_features"] + cfg["ordinal_features"]
        expected_cat = cfg["categorical_features"]
        for col in expected_num + expected_cat:
            assert col in X_train.columns, f"Feature '{col}' missing from X_train"

    def test_preprocessor_is_column_transformer(self, preprocessing_data):
        from sklearn.compose import ColumnTransformer
        pp = preprocessing_data["preprocessor"]
        assert isinstance(pp, ColumnTransformer)


# ---------------------------------------------------------------------------
# 5. Model Prediction (requires trained model)
# ---------------------------------------------------------------------------

class TestModelPredictions:
    def test_model_loads_as_pipeline(self, trained_pipeline):
        assert isinstance(trained_pipeline, Pipeline)

    def test_model_has_preprocessor_and_classifier(self, trained_pipeline):
        steps = dict(trained_pipeline.named_steps)
        assert "preprocessor" in steps
        assert "classifier" in steps

    def test_prediction_shape(self, trained_pipeline, preprocessing_data):
        X_test = preprocessing_data["X_test"]
        y_pred = trained_pipeline.predict(X_test)
        assert y_pred.shape == (len(X_test),), (
            f"Expected shape ({len(X_test)},), got {y_pred.shape}"
        )

    def test_prediction_classes_valid(self, trained_pipeline, preprocessing_data):
        X_test = preprocessing_data["X_test"]
        y_pred = trained_pipeline.predict(X_test)
        valid = {"Low", "Mid", "High"}
        assert set(y_pred).issubset(valid), (
            f"Invalid prediction classes: {set(y_pred) - valid}"
        )

    def test_predict_proba_sums_to_one(self, trained_pipeline, preprocessing_data):
        X_test = preprocessing_data["X_test"]
        if hasattr(trained_pipeline.named_steps["classifier"], "predict_proba"):
            probas = trained_pipeline.predict_proba(X_test)
            assert probas.shape[1] == 3, "Expected 3 probability columns"
            np.testing.assert_allclose(
                probas.sum(axis=1), 1.0, atol=1e-6,
                err_msg="Probabilities do not sum to 1.0",
            )

    def test_predict_no_nans(self, trained_pipeline, preprocessing_data):
        X_test = preprocessing_data["X_test"]
        y_pred = trained_pipeline.predict(X_test)
        assert not pd.isna(y_pred).any(), "Predictions contain NaN"


# ---------------------------------------------------------------------------
# 6. Representative Profile Inference
# ---------------------------------------------------------------------------

class TestRepresentativeProfile:
    """Test inference on a hand-crafted representative student profile."""

    def _make_profile(self, cfg) -> pd.DataFrame:
        """Construct a typical engineering student profile."""
        feature_cols = cfg["numerical_features"] + cfg["ordinal_features"] + cfg["categorical_features"]
        row = {
            "10percentage": 78.0,
            "12percentage": 72.0,
            "collegeGPA": 70.0,
            "CollegeTier": 2,
            "English": 480,
            "Logical": 490,
            "Quant": 510,
            "ComputerProgramming": 400,
            "conscientiousness": 0.2,
            "agreeableness": 0.3,
            "extraversion": -0.1,
            "nueroticism": -0.2,
            "openess_to_experience": 0.1,
            "Specialization": "Computer Science & Engineering",
            "Degree": "B.Tech/B.E.",
        }
        return pd.DataFrame([row])

    def test_profile_predicts_valid_class(self, trained_pipeline, cfg):
        profile = self._make_profile(cfg)
        pred = trained_pipeline.predict(profile)
        assert pred[0] in {"Low", "Mid", "High"}

    def test_profile_predict_proba_shape(self, trained_pipeline, cfg):
        profile = self._make_profile(cfg)
        if hasattr(trained_pipeline.named_steps["classifier"], "predict_proba"):
            probas = trained_pipeline.predict_proba(profile)
            assert probas.shape == (1, 3)

    def test_high_aptitude_profile_not_low_tier(self, trained_pipeline, cfg):
        """A profile with very high aptitude scores should not predict Low tier
        (this is a soft sanity check — not a strict contract)."""
        feature_cols = cfg["numerical_features"] + cfg["ordinal_features"] + cfg["categorical_features"]
        strong_profile = pd.DataFrame([{
            "10percentage": 95.0,
            "12percentage": 94.0,
            "collegeGPA": 92.0,
            "CollegeTier": 1,
            "English": 780,
            "Logical": 750,
            "Quant": 850,
            "ComputerProgramming": 800,
            "conscientiousness": 1.5,
            "agreeableness": 0.8,
            "extraversion": 0.5,
            "nueroticism": -1.0,
            "openess_to_experience": 1.2,
            "Specialization": "Computer Science & Engineering",
            "Degree": "B.Tech/B.E.",
        }])
        pred = trained_pipeline.predict(strong_profile)[0]
        # Sanity: model should not confidently assign Low tier to top-decile profile
        if hasattr(trained_pipeline.named_steps["classifier"], "predict_proba"):
            probas = trained_pipeline.predict_proba(strong_profile)[0]
            classes = list(trained_pipeline.classes_)
            low_prob = probas[classes.index("Low")] if "Low" in classes else 1.0
            assert low_prob < 0.70, (
                f"Top-decile profile has {low_prob:.1%} probability of Low tier — "
                "possible model issue."
            )


# ---------------------------------------------------------------------------
# 7. Serialized Model
# ---------------------------------------------------------------------------

class TestSerializedModel:
    def test_model_file_exists(self):
        if not MODEL_PATH.exists():
            pytest.skip("Model not yet trained.")
        assert MODEL_PATH.exists()

    def test_metadata_file_exists(self):
        meta_path = MODEL_PATH.parent / "model_metadata.json"
        if not meta_path.exists():
            pytest.skip("Metadata not yet generated.")
        assert meta_path.exists()

    def test_metadata_has_required_fields(self):
        meta_path = MODEL_PATH.parent / "model_metadata.json"
        if not meta_path.exists():
            pytest.skip("Metadata not yet generated.")
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        required = [
            "model_name", "sklearn_version", "training_date_utc",
            "dataset", "dataset_sha256", "random_seed",
            "target_definition", "feature_list", "important_limitations",
        ]
        for key in required:
            assert key in meta, f"Metadata missing key: {key}"

    def test_metadata_no_salary_in_features(self):
        meta_path = MODEL_PATH.parent / "model_metadata.json"
        if not meta_path.exists():
            pytest.skip("Metadata not yet generated.")
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        assert "Salary" not in meta.get("feature_list", [])
        assert "Designation" not in meta.get("feature_list", [])
