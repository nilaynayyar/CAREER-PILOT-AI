"""
CareerPilot AI — Phase 2 Main Entry Point
==========================================
Run the complete ML pipeline end-to-end:

    python -m ml.run_pipeline

Steps:
  1. Load config
  2. Preprocessing (load, sentinel replace, split, build preprocessor)
  3. Training (baselines, model comparison, tuning, serialization)
  4. Final holdout evaluation (run exactly once)
  5. Explainability (feature importances)
  6. Report generation

Usage:
    From project root:
        python -m ml.run_pipeline
        python -m ml.run_pipeline --config ml/configs/training_config.yaml
        python -m ml.run_pipeline --no-verify-hash   # skip SHA-256 check
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

from ml.src.preprocessing import load_config, run_preprocessing, get_feature_columns
from ml.src.train import run_training
from ml.src.evaluate import (
    evaluate_on_test,
    run_error_analysis,
    generate_evaluation_report,
    save_evaluation_report,
)
from ml.src.explain import (
    get_native_importances,
    get_permutation_importances,
    explain_single_prediction,
    generate_importance_report,
    save_importance_report,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="CareerPilot AI — Phase 2 ML Pipeline")
    parser.add_argument(
        "--config",
        type=str,
        default="ml/configs/training_config.yaml",
        help="Path to training config YAML",
    )
    parser.add_argument(
        "--no-verify-hash",
        action="store_true",
        default=False,
        help="Skip SHA-256 verification of raw data file",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    cfg = load_config(args.config)
    verify_hash = not args.no_verify_hash

    logger.info("=" * 70)
    logger.info("CareerPilot AI — Phase 2 ML Pipeline")
    logger.info("=" * 70)

    # -------------------------------------------------------------------------
    # Step 1: Preprocessing
    # -------------------------------------------------------------------------
    logger.info("\n[STEP 1] Preprocessing")
    data = run_preprocessing(cfg, verify_hash=verify_hash, save_splits=True)

    X_train = data["X_train"]
    X_val = data["X_val"]
    X_test = data["X_test"]
    y_train = data["y_train"]
    y_val = data["y_val"]
    y_test = data["y_test"]
    preprocessor = data["preprocessor"]
    feature_cols = data["feature_cols"]
    salary_thresholds = data["salary_thresholds"]

    # Annotate cfg with sizes for report
    cfg["_train_size"] = len(X_train)
    cfg["_val_size"] = len(X_val)
    cfg["_test_size"] = len(X_test)

    # -------------------------------------------------------------------------
    # Step 2: Training
    # -------------------------------------------------------------------------
    logger.info("\n[STEP 2] Training & Tuning")
    training_results = run_training(cfg, data)

    best_pipeline = training_results["tuned_pipeline"]
    model_path = training_results["model_path"]
    comparison_results = training_results["comparison_results"]
    baseline_results = training_results["baseline_results"]
    tuning_results = training_results["tuning_results"]

    # -------------------------------------------------------------------------
    # Step 3: Final Holdout Test Evaluation (exactly once)
    # -------------------------------------------------------------------------
    logger.info("\n[STEP 3] Final Holdout Test Evaluation")
    class_labels = sorted(cfg["target_labels"])  # ['High', 'Low', 'Mid'] alphabetical
    eval_results = evaluate_on_test(best_pipeline, X_test, y_test, class_labels)
    eval_results["eval_date"] = datetime.now(timezone.utc).isoformat()

    # Update model metadata with final test results
    meta_path = PROJECT_ROOT / cfg["models_dir"] / "model_metadata.json"
    if meta_path.exists():
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        meta["final_test_metrics"] = {
            k: v for k, v in eval_results.items()
            if k not in ("y_pred", "y_true", "y_proba", "confusion_matrix")
        }
        meta["final_test_metrics"]["confusion_matrix"] = eval_results["confusion_matrix"]
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2, default=str)

    # -------------------------------------------------------------------------
    # Step 4: Explainability
    # -------------------------------------------------------------------------
    logger.info("\n[STEP 4] Feature Importance")

    # Get feature names from the fitted preprocessor
    fitted_preprocessor = best_pipeline.named_steps["preprocessor"]
    feature_names_out = list(fitted_preprocessor.get_feature_names_out())

    native_df = get_native_importances(best_pipeline, feature_names_out)
    perm_df = get_permutation_importances(
        best_pipeline, X_val, y_val, feature_names_out,
        n_repeats=10, random_state=cfg["random_seed"],
    )

    # Save importance tables as JSON
    reports_dir = PROJECT_ROOT / cfg["reports_dir"]
    reports_dir.mkdir(parents=True, exist_ok=True)

    if native_df is not None:
        native_df.to_csv(reports_dir / "native_importances.csv", index=False)
    perm_df.to_csv(reports_dir / "permutation_importances.csv", index=False)

    # -------------------------------------------------------------------------
    # Step 5: Single prediction example (for testing / UI integration)
    # -------------------------------------------------------------------------
    logger.info("\n[STEP 5] Single-prediction explanation example")
    # Use the first test sample as an illustrative example
    sample_X = X_test.iloc[[0]]
    example_explanation = explain_single_prediction(
        best_pipeline, sample_X, feature_cols,
        native_df if native_df is not None else perm_df,
        class_labels,
    )
    example_path = reports_dir / "example_explanation.json"
    with open(example_path, "w", encoding="utf-8") as f:
        json.dump(example_explanation, f, indent=2)
    logger.info("Saved example explanation to %s", example_path)

    # -------------------------------------------------------------------------
    # Step 6: Reports
    # -------------------------------------------------------------------------
    logger.info("\n[STEP 6] Generating reports")

    eval_report_md = generate_evaluation_report(
        eval_results, run_error_analysis(eval_results, X_test, feature_cols),
        comparison_results, baseline_results, tuning_results, cfg,
    )
    eval_report_path = save_evaluation_report(eval_report_md, cfg)

    imp_report_md = generate_importance_report(native_df, perm_df, cfg)
    imp_report_path = save_importance_report(imp_report_md, cfg)

    # -------------------------------------------------------------------------
    # Final Summary
    # -------------------------------------------------------------------------
    logger.info("\n" + "=" * 70)
    logger.info("PHASE 2 COMPLETE")
    logger.info("=" * 70)
    logger.info("Dataset:            AMEO 2015 (N=%d usable samples)",
                len(X_train) + len(X_val) + len(X_test))
    logger.info("Train / Val / Test: %d / %d / %d",
                len(X_train), len(X_val), len(X_test))
    logger.info("Target:             SalaryTier (Low/Mid/High tertiles)")
    logger.info("Thresholds (INR):   Low≤%.0f | Mid≤%.0f | High>%.0f",
                salary_thresholds[0], salary_thresholds[1], salary_thresholds[1])
    logger.info("Best model:         %s", training_results["best_model_name"])
    logger.info("Test Accuracy:      %.4f", eval_results["accuracy"])
    logger.info("Test Macro-F1:      %.4f", eval_results["f1_macro"])
    logger.info("Test Weighted-F1:   %.4f", eval_results["f1_weighted"])
    logger.info("Serialized model:   %s", model_path)
    logger.info("Evaluation report:  %s", eval_report_path)
    logger.info("Importance report:  %s", imp_report_path)
    logger.info("=" * 70)


if __name__ == "__main__":
    main()
