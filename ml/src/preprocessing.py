"""
CareerPilot AI — ML Preprocessing Module
=========================================
Handles:
  - Configuration loading
  - Data integrity verification (SHA-256)
  - Sentinel value replacement (-1 → NaN for domain modules)
  - Target construction (SalaryTier tertile split from Salary column)
  - Feature set selection and column dropping
  - Full scikit-learn ColumnTransformer pipeline construction
  - Train / validation / test splitting (stratified, leak-free)
  - Saving processed artefacts to data/processed/

IMPORTANT DESIGN PRINCIPLES:
  1. No post-employment features are included as model inputs.
  2. Salary is ONLY used to derive SalaryTier; it is dropped before training.
  3. Thresholds for SalaryTier are computed exclusively from the TRAINING SET
     and applied to validation/test sets — no leakage.
  4. The full preprocessing Pipeline is embedded in the final model artefact.
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import yaml
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONFIG_PATH = PROJECT_ROOT / "ml" / "configs" / "training_config.yaml"


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

def load_config(config_path: Path | str = DEFAULT_CONFIG_PATH) -> dict[str, Any]:
    """Load and return the YAML training configuration."""
    config_path = Path(config_path)
    if not config_path.exists():
        raise FileNotFoundError(f"Config not found: {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    logger.info("Loaded config from %s", config_path)
    return cfg


# ---------------------------------------------------------------------------
# Data Integrity
# ---------------------------------------------------------------------------

def verify_sha256(file_path: Path, expected_hash: str) -> None:
    """Raise ValueError if the file's SHA-256 does not match expected_hash."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    actual = sha256.hexdigest()
    if actual != expected_hash:
        raise ValueError(
            f"SHA-256 mismatch for {file_path}!\n"
            f"  Expected: {expected_hash}\n"
            f"  Actual:   {actual}\n"
            "The raw data file has been modified. Restore from source."
        )
    logger.info("SHA-256 verified OK for %s", file_path)


# ---------------------------------------------------------------------------
# Data Loading
# ---------------------------------------------------------------------------

def load_raw_data(cfg: dict[str, Any], verify_hash: bool = True) -> pd.DataFrame:
    """
    Load the raw AMEO CSV, optionally verify its SHA-256, and return a DataFrame.
    The raw file is NEVER modified.
    """
    raw_path = PROJECT_ROOT / cfg["raw_data_path"]
    if not raw_path.exists():
        raise FileNotFoundError(f"Raw dataset not found: {raw_path}")
    if verify_hash:
        verify_sha256(raw_path, cfg["raw_data_sha256"])
    df = pd.read_csv(raw_path)
    logger.info("Loaded raw data: %s rows × %s columns", *df.shape)
    return df


# ---------------------------------------------------------------------------
# Target Construction
# ---------------------------------------------------------------------------

def build_salary_tier(
    df: pd.DataFrame,
    salary_col: str = "Salary",
    n_quantiles: int = 3,
    labels: list[str] | None = None,
    thresholds: list[float] | None = None,
) -> tuple[pd.Series, list[float]]:
    """
    Derive SalaryTier from Salary using tertile split.

    If `thresholds` is None, computes quantile cut-points from `df[salary_col]`
    (used on training set). If `thresholds` is provided, applies those fixed
    boundaries (used on val/test sets — prevents leakage).

    Returns:
        tier_series  — categorical Series with Low / Mid / High labels
        thresholds   — list of [p33, p66] boundaries used
    """
    if labels is None:
        labels = ["Low", "Mid", "High"]

    salary = df[salary_col]

    if thresholds is None:
        # Compute from this data (only call on training split!)
        q1 = salary.quantile(1 / n_quantiles)
        q2 = salary.quantile(2 / n_quantiles)
        thresholds = [q1, q2]
        logger.info(
            "Computed SalaryTier thresholds from training data: "
            "Low≤%.0f, %.0f<Mid≤%.0f, High>%.0f",
            q1, q1, q2, q2,
        )

    bins = [-np.inf] + thresholds + [np.inf]
    tier = pd.cut(salary, bins=bins, labels=labels, right=True)
    return tier.astype(str), thresholds


def report_target_distribution(y: pd.Series, label: str = "SalaryTier") -> None:
    """Log class counts and percentages for a target Series."""
    counts = y.value_counts().sort_index()
    total = len(y)
    logger.info("=== %s distribution ===", label)
    for cls, cnt in counts.items():
        logger.info("  %-6s : %4d  (%.1f%%)", cls, cnt, cnt / total * 100)
    logger.info("  TOTAL  : %4d", total)


# ---------------------------------------------------------------------------
# Feature Preparation
# ---------------------------------------------------------------------------

def prepare_features(df: pd.DataFrame, cfg: dict[str, Any]) -> pd.DataFrame:
    """
    1. Replace sentinel values (-1 → NaN) for domain modules.
    2. Drop all leakage / protected / administrative columns.
    3. Verify all required feature columns are present.

    Returns a copy of df with only model-input columns + SalaryTier target.
    """
    df = df.copy()

    # Step 1 — Replace -1 sentinels in domain modules
    for col in cfg.get("sentinel_columns", []):
        if col in df.columns:
            before = (df[col] == -1).sum()
            df[col] = df[col].replace(-1, np.nan)
            logger.info(
                "Replaced %d sentinel (-1) values in '%s' with NaN", before, col
            )

    # Step 2 — Drop leakage / administrative / protected columns
    cols_to_drop = [c for c in cfg["drop_columns"] if c in df.columns]
    df = df.drop(columns=cols_to_drop)
    logger.info("Dropped %d columns: %s", len(cols_to_drop), cols_to_drop)

    return df


def get_feature_columns(cfg: dict[str, Any]) -> dict[str, list[str]]:
    """Return the grouped feature column lists from config."""
    return {
        "numerical": cfg["numerical_features"] + cfg["ordinal_features"],
        "categorical": cfg["categorical_features"],
    }


# ---------------------------------------------------------------------------
# Preprocessing Pipeline
# ---------------------------------------------------------------------------

def build_preprocessor(feature_cols: dict[str, list[str]]) -> ColumnTransformer:
    """
    Build a ColumnTransformer that:
      - Numerical: median impute → StandardScaler
      - Categorical: constant impute ('missing') → OneHotEncoder (ignore unknown)

    The scaler is fit ONLY on training data inside the full Pipeline,
    preventing any data leakage to validation/test sets.
    """
    numerical_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="constant", fill_value="missing")),
            (
                "encoder",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
            ),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numerical_pipe, feature_cols["numerical"]),
            ("cat", categorical_pipe, feature_cols["categorical"]),
        ],
        remainder="drop",       # Silently drop any other columns not listed
        verbose_feature_names_out=True,
    )

    logger.info(
        "Built preprocessor: %d numerical + %d ordinal, %d categorical features",
        len(feature_cols["numerical"]) - 1,  # subtract ordinal
        1,
        len(feature_cols["categorical"]),
    )
    return preprocessor


def get_feature_names_out(
    preprocessor: ColumnTransformer, feature_cols: dict[str, list[str]]
) -> list[str]:
    """Extract human-readable feature names after preprocessing."""
    return list(preprocessor.get_feature_names_out())


# ---------------------------------------------------------------------------
# Train / Val / Test Split
# ---------------------------------------------------------------------------

def split_data(
    X: pd.DataFrame,
    y: pd.Series,
    cfg: dict[str, Any],
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
    """
    Perform a stratified two-stage split:
      1. Split off test_size as holdout test set.
      2. Split remainder into train + validation.

    Stratification ensures balanced class distribution in all three sets.
    Returns: X_train, X_val, X_test, y_train, y_val, y_test
    """
    seed = cfg["random_seed"]
    test_size = cfg["test_size"]
    val_size = cfg["val_size"]

    # Stage 1: carve out the final holdout test set
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=test_size, random_state=seed, stratify=y
    )

    # Stage 2: split remainder into train + val
    # val_size is defined as fraction of original; adjust relative to train_val pool
    relative_val_size = val_size / (1.0 - test_size)
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val,
        y_train_val,
        test_size=relative_val_size,
        random_state=seed,
        stratify=y_train_val,
    )

    logger.info(
        "Data split: train=%d, val=%d, test=%d (total=%d)",
        len(X_train), len(X_val), len(X_test), len(X),
    )
    for split_name, y_split in [("train", y_train), ("val", y_val), ("test", y_test)]:
        report_target_distribution(y_split, label=f"SalaryTier ({split_name})")

    return X_train, X_val, X_test, y_train, y_val, y_test


# ---------------------------------------------------------------------------
# Full Pipeline Orchestration
# ---------------------------------------------------------------------------

def run_preprocessing(
    cfg: dict[str, Any],
    verify_hash: bool = True,
    save_splits: bool = True,
) -> dict[str, Any]:
    """
    End-to-end preprocessing:
      1. Load raw data (optionally verify SHA-256)
      2. Replace sentinel values
      3. Drop leakage / protected columns
      4. Build SalaryTier target (from TRAINING data only — no leakage)
      5. Split into train / val / test
      6. Build ColumnTransformer preprocessor
      7. Optionally save splits to data/processed/
      8. Return all artefacts for use by train.py

    Returns a dict with keys:
      X_train, X_val, X_test, y_train, y_val, y_test,
      preprocessor, feature_cols, salary_thresholds, cfg
    """
    # 1. Load
    df_raw = load_raw_data(cfg, verify_hash=verify_hash)

    # 2 & 3. Sentinel + Drop
    df = prepare_features(df_raw, cfg)

    # 4. Build target
    salary_col = cfg["salary_source_column"]
    target_col = cfg["target_column"]

    # We need Salary to build target — it was dropped above,
    # so use df_raw for Salary, and only the feature df for inputs
    X_all = df.copy()
    # SalaryTier will be built from full data, thresholds from training split
    # We need a temporary holder first:
    salary_series = df_raw[salary_col]

    # 5. Split FIRST (before building target, to compute thresholds from train only)
    # Temporary: use raw salary as proxy for stratification (bin it quickly)
    salary_bin_temp = pd.qcut(
        salary_series, q=3, labels=["Low", "Mid", "High"], duplicates="drop"
    ).astype(str)

    X_train, X_val, X_test, y_bin_train, y_bin_val, y_bin_test = split_data(
        X_all, salary_bin_temp, cfg
    )

    # Now rebuild proper SalaryTier using TRAINING thresholds only
    # Get salary values per split (using the same indices)
    train_idx = X_train.index
    val_idx = X_val.index
    test_idx = X_test.index

    y_train, thresholds = build_salary_tier(
        df_raw.loc[train_idx],
        salary_col=salary_col,
        n_quantiles=cfg["target_n_quantiles"],
        labels=cfg["target_labels"],
        thresholds=None,  # compute from training data
    )
    y_val, _ = build_salary_tier(
        df_raw.loc[val_idx],
        salary_col=salary_col,
        thresholds=thresholds,  # apply training thresholds
        labels=cfg["target_labels"],
    )
    y_test, _ = build_salary_tier(
        df_raw.loc[test_idx],
        salary_col=salary_col,
        thresholds=thresholds,  # apply training thresholds
        labels=cfg["target_labels"],
    )

    logger.info(
        "SalaryTier thresholds (from train): Low≤%.0f | Mid≤%.0f | High>%.0f",
        thresholds[0], thresholds[1], thresholds[1],
    )

    # 6. Build preprocessor
    feature_cols = get_feature_columns(cfg)
    # Validate all expected features are present
    for col in feature_cols["numerical"] + feature_cols["categorical"]:
        if col not in X_train.columns:
            raise KeyError(
                f"Expected feature '{col}' not found in processed dataframe. "
                "Check drop_columns in config."
            )
    preprocessor = build_preprocessor(feature_cols)

    # 7. Optionally save
    if save_splits:
        processed_dir = PROJECT_ROOT / cfg["processed_dir"]
        processed_dir.mkdir(parents=True, exist_ok=True)

        for name, X_split, y_split in [
            ("train", X_train, y_train),
            ("val", X_val, y_val),
            ("test", X_test, y_test),
        ]:
            X_split_save = X_split[feature_cols["numerical"] + feature_cols["categorical"]].copy()
            X_split_save[target_col] = y_split.values
            out_path = processed_dir / f"{name}.csv"
            X_split_save.to_csv(out_path, index=False)
            logger.info("Saved %s split to %s (%d rows)", name, out_path, len(X_split_save))

        # Save threshold metadata
        meta = {
            "salary_thresholds": thresholds,
            "target_labels": cfg["target_labels"],
            "train_size": len(X_train),
            "val_size": len(X_val),
            "test_size": len(X_test),
        }
        meta_path = processed_dir / "split_metadata.json"
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)
        logger.info("Saved split metadata to %s", meta_path)

    return {
        "X_train": X_train,
        "X_val": X_val,
        "X_test": X_test,
        "y_train": y_train,
        "y_val": y_val,
        "y_test": y_test,
        "preprocessor": preprocessor,
        "feature_cols": feature_cols,
        "salary_thresholds": thresholds,
        "cfg": cfg,
    }
