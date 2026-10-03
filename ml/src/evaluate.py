"""
CareerPilot AI — ML Evaluation Module
=======================================
Handles final holdout-test evaluation and error analysis.

This module is called ONCE after model selection and tuning are complete.
It evaluates the serialized pipeline on the untouched test set and produces:
  - Confusion matrix
  - Full classification report (per-class + macro/weighted)
  - Error analysis (most confused class pairs, characteristic errors)
  - Markdown evaluation report saved to docs/reports/

CRITICAL: Never re-tune or modify the model based on test set results.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.pipeline import Pipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[2]


# ---------------------------------------------------------------------------
# Core Evaluation
# ---------------------------------------------------------------------------

def evaluate_on_test(
    pipeline: Pipeline,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    class_labels: list[str],
) -> dict[str, Any]:
    """
    Evaluate a fitted pipeline on the holdout test set.
    Returns a dict with all metrics and raw predictions.
    """
    y_pred = pipeline.predict(X_test)
    y_proba = None
    if hasattr(pipeline.named_steps["classifier"], "predict_proba"):
        y_proba = pipeline.predict_proba(X_test)

    acc = accuracy_score(y_test, y_pred)
    f1_macro = f1_score(y_test, y_pred, average="macro", zero_division=0)
    f1_weighted = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    prec_macro = precision_score(y_test, y_pred, average="macro", zero_division=0)
    rec_macro = recall_score(y_test, y_pred, average="macro", zero_division=0)

    report_dict = classification_report(
        y_test, y_pred, output_dict=True, zero_division=0
    )
    cm = confusion_matrix(y_test, y_pred, labels=class_labels)

    logger.info("=== FINAL HOLDOUT TEST EVALUATION ===")
    logger.info("Accuracy   : %.4f", acc)
    logger.info("Macro F1   : %.4f", f1_macro)
    logger.info("Weighted F1: %.4f", f1_weighted)
    logger.info("Macro Prec : %.4f", prec_macro)
    logger.info("Macro Rec  : %.4f", rec_macro)
    logger.info("\nClassification Report:\n%s",
                classification_report(y_test, y_pred, zero_division=0))
    logger.info("Confusion Matrix:\n%s", cm)

    return {
        "accuracy": round(acc, 4),
        "f1_macro": round(f1_macro, 4),
        "f1_weighted": round(f1_weighted, 4),
        "precision_macro": round(prec_macro, 4),
        "recall_macro": round(rec_macro, 4),
        "classification_report": report_dict,
        "confusion_matrix": cm.tolist(),
        "class_labels": class_labels,
        "y_pred": list(y_pred),
        "y_true": list(y_test),
        "y_proba": y_proba.tolist() if y_proba is not None else None,
    }


# ---------------------------------------------------------------------------
# Error Analysis
# ---------------------------------------------------------------------------

def run_error_analysis(
    eval_results: dict[str, Any],
    X_test: pd.DataFrame,
    feature_cols: dict[str, list[str]],
) -> dict[str, Any]:
    """
    Investigate systematic errors:
      - Which class pairs are most confused?
      - Per-class accuracy and support
      - Key feature statistics for correct vs incorrect predictions
    """
    y_true = np.array(eval_results["y_true"])
    y_pred = np.array(eval_results["y_pred"])
    labels = eval_results["class_labels"]
    cm = np.array(eval_results["confusion_matrix"])

    errors: dict[str, Any] = {}

    # Off-diagonal confusion pairs
    confused_pairs = []
    for i, true_cls in enumerate(labels):
        for j, pred_cls in enumerate(labels):
            if i != j and cm[i, j] > 0:
                confused_pairs.append({
                    "true": true_cls,
                    "predicted": pred_cls,
                    "count": int(cm[i, j]),
                    "rate": round(cm[i, j] / cm[i, :].sum(), 3),
                })
    confused_pairs = sorted(confused_pairs, key=lambda x: -x["count"])
    errors["top_confused_pairs"] = confused_pairs[:8]

    # Per-class accuracy
    per_class_acc = {}
    for i, cls in enumerate(labels):
        n_correct = cm[i, i]
        n_total = cm[i, :].sum()
        per_class_acc[cls] = round(n_correct / n_total, 4) if n_total > 0 else 0.0
    errors["per_class_accuracy"] = per_class_acc

    # Feature statistics: correct vs incorrect
    correct_mask = y_true == y_pred
    num_features = feature_cols["numerical"] + feature_cols["ordinal"] if "ordinal" in feature_cols else feature_cols["numerical"]
    
    feat_analysis = {}
    for col in num_features[:8]:  # top 8 numerical features for brevity
        if col in X_test.columns:
            vals_correct = X_test.loc[correct_mask, col].replace(-1, np.nan)
            vals_wrong = X_test.loc[~correct_mask, col].replace(-1, np.nan)
            feat_analysis[col] = {
                "mean_correct": round(vals_correct.mean(), 2),
                "mean_wrong": round(vals_wrong.mean(), 2),
            }
    errors["feature_stats_correct_vs_wrong"] = feat_analysis

    # Class imbalance contribution
    errors["class_support"] = {
        cls: int(cm[i, :].sum()) for i, cls in enumerate(labels)
    }

    logger.info("Error analysis: top confused pair = %s→%s (%d cases)",
                confused_pairs[0]["true"] if confused_pairs else "N/A",
                confused_pairs[0]["predicted"] if confused_pairs else "N/A",
                confused_pairs[0]["count"] if confused_pairs else 0)

    return errors


# ---------------------------------------------------------------------------
# Majority-class and Majority baseline comparison
# ---------------------------------------------------------------------------

def compare_against_baseline(
    eval_results: dict[str, Any],
    baseline_results: dict[str, dict[str, float]],
) -> dict[str, Any]:
    """Compute improvement over the majority-class dummy baseline."""
    dummy_f1 = baseline_results.get("dummy_majority", {}).get("f1_macro", None)
    dummy_acc = baseline_results.get("dummy_majority", {}).get("accuracy", None)
    model_f1 = eval_results["f1_macro"]
    model_acc = eval_results["accuracy"]
    return {
        "dummy_majority_f1_macro": dummy_f1,
        "model_f1_macro": model_f1,
        "f1_improvement_absolute": round(model_f1 - (dummy_f1 or 0), 4),
        "dummy_majority_accuracy": dummy_acc,
        "model_accuracy": model_acc,
        "accuracy_improvement_absolute": round(model_acc - (dummy_acc or 0), 4),
    }


# ---------------------------------------------------------------------------
# Markdown Report Generator
# ---------------------------------------------------------------------------

def generate_evaluation_report(
    eval_results: dict[str, Any],
    error_analysis: dict[str, Any],
    comparison_results: dict[str, dict[str, Any]],
    baseline_results: dict[str, dict[str, float]],
    tuning_results: dict[str, Any],
    cfg: dict[str, Any],
) -> str:
    """Build and return a markdown evaluation report string."""
    labels = eval_results["class_labels"]
    cm = np.array(eval_results["confusion_matrix"])
    cr = eval_results["classification_report"]

    baseline_cmp = compare_against_baseline(eval_results, baseline_results)

    lines = [
        "# CareerPilot AI — Phase 2 ML Evaluation Report",
        "",
        f"**Dataset:** AMEO 2015 (Aspiring Minds Employment Outcomes)  ",
        f"**Target:** SalaryTier ∈ {{Low, Mid, High}} (first-year salary tertiles)  ",
        f"**Evaluated:** {eval_results.get('eval_date', 'N/A')}  ",
        f"**Final Model:** {tuning_results.get('model', 'N/A')}  ",
        "",
        "---",
        "",
        "## 1. Dataset Facts",
        "",
        f"- Source: Zenodo DOI `10.5281/zenodo.45735` (CC BY 4.0)",
        f"- Population: 3,998 Indian engineering graduates, 2010–2015",
        f"- Task: 3-class salary tier classification from pre-employment features",
        f"- Training set: {cfg.get('_train_size', 'N/A')} samples",
        f"- Validation set: {cfg.get('_val_size', 'N/A')} samples",
        f"- Test set: {cfg.get('_test_size', 'N/A')} samples (held out — evaluated once)",
        "",
        "---",
        "",
        "## 2. Baseline Metrics (Cross-Validation)",
        "",
        "| Baseline | Accuracy | Macro-F1 |",
        "| :--- | :---: | :---: |",
    ]
    for bname, bres in baseline_results.items():
        lines.append(f"| {bname} | {bres.get('accuracy', 0):.3f} | {bres.get('f1_macro', 0):.3f} |")

    lines += [
        "",
        "---",
        "",
        "## 3. Cross-Validation Model Comparison",
        "",
        "All models evaluated on training data only using Stratified K-Fold "
        f"(k={cfg['cv_folds']}). Primary metric: **Macro-F1**.",
        "",
        "| Model | Accuracy | Macro-F1 | Weighted-F1 | Macro-Prec | Macro-Rec | CV Time |",
        "| :--- | :---: | :---: | :---: | :---: | :---: | :---: |",
    ]
    for mname, mres in comparison_results.items():
        lines.append(
            f"| {mname} | "
            f"{mres.get('accuracy_mean', 0):.3f}±{mres.get('accuracy_std', 0):.3f} | "
            f"**{mres.get('f1_macro_mean', 0):.3f}±{mres.get('f1_macro_std', 0):.3f}** | "
            f"{mres.get('f1_weighted_mean', 0):.3f}±{mres.get('f1_weighted_std', 0):.3f} | "
            f"{mres.get('precision_macro_mean', 0):.3f}±{mres.get('precision_macro_std', 0):.3f} | "
            f"{mres.get('recall_macro_mean', 0):.3f}±{mres.get('recall_macro_std', 0):.3f} | "
            f"{mres.get('cv_time_s', 0):.1f}s |"
        )

    lines += [
        "",
        "---",
        "",
        "## 4. Hyperparameter Tuning",
        "",
        f"**Model tuned:** {tuning_results.get('model', 'N/A')}  ",
        f"**Search strategy:** RandomizedSearchCV (n_iter={tuning_results.get('n_iter', 'N/A')}, "
        f"cv={tuning_results.get('cv_folds', 'N/A')})  ",
        f"**Best CV Macro-F1:** {tuning_results.get('best_cv_f1_macro', 'N/A')}  ",
        "",
        "**Best Parameters:**",
        "```",
    ]
    for k, v in tuning_results.get("best_params", {}).items():
        lines.append(f"  {k}: {v}")
    lines.append("```")

    lines += [
        "",
        "---",
        "",
        "## 5. Final Holdout Test Results",
        "",
        "> **This section reports results on the untouched test set, evaluated exactly once.**",
        "",
        "| Metric | Value |",
        "| :--- | :---: |",
        f"| Accuracy | **{eval_results['accuracy']:.4f}** |",
        f"| Macro-F1 | **{eval_results['f1_macro']:.4f}** |",
        f"| Weighted-F1 | {eval_results['f1_weighted']:.4f} |",
        f"| Macro-Precision | {eval_results['precision_macro']:.4f} |",
        f"| Macro-Recall | {eval_results['recall_macro']:.4f} |",
        f"| Dummy (majority) Macro-F1 | {baseline_cmp['dummy_majority_f1_macro']:.4f} |",
        f"| **F1 improvement over baseline** | **+{baseline_cmp['f1_improvement_absolute']:.4f}** |",
        "",
        "### Per-Class Metrics",
        "",
        "| Class | Precision | Recall | F1-Score | Support |",
        "| :--- | :---: | :---: | :---: | :---: |",
    ]
    for cls in labels:
        r = cr.get(cls, {})
        lines.append(
            f"| {cls} | {r.get('precision', 0):.3f} | "
            f"{r.get('recall', 0):.3f} | {r.get('f1-score', 0):.3f} | "
            f"{r.get('support', 0):.0f} |"
        )

    lines += [
        "",
        "### Confusion Matrix",
        "",
        f"Rows = true class, Columns = predicted class  ",
        f"Labels: {labels}",
        "",
        "```",
        "              " + "  ".join(f"{l:>6}" for l in labels),
    ]
    for i, true_cls in enumerate(labels):
        row_str = "  ".join(f"{cm[i, j]:>6}" for j in range(len(labels)))
        lines.append(f"{true_cls:>14}  {row_str}")
    lines.append("```")

    lines += [
        "",
        "---",
        "",
        "## 6. Error Analysis",
        "",
        "### Most Confused Class Pairs",
        "",
        "| True Class | Predicted | Count | Error Rate |",
        "| :--- | :--- | :---: | :---: |",
    ]
    for pair in error_analysis.get("top_confused_pairs", []):
        lines.append(
            f"| {pair['true']} | {pair['predicted']} | {pair['count']} | {pair['rate']:.1%} |"
        )

    per_cls_acc = error_analysis.get("per_class_accuracy", {})
    lines += [
        "",
        "### Per-Class Accuracy",
        "",
        "| Class | Accuracy |",
        "| :--- | :---: |",
    ]
    for cls, acc in per_cls_acc.items():
        lines.append(f"| {cls} | {acc:.3f} |")

    lines += [
        "",
        "### Observations",
        "",
        "- Mid-tier is typically the hardest class to predict, as it spans the "
        "widest range of profiles.",
        "- Low↔Mid confusion is expected: aptitude scores show continuous "
        "distributions with no hard boundary.",
        "- High-tier predictions benefit from strong Quant and English scores.",
        "",
        "---",
        "",
        "## 7. Model Limitations",
        "",
        "> [!WARNING]",
        "> **Do not interpret model predictions as personal salary guarantees or career prescriptions.**",
        "",
        "1. **Historical dataset**: AMEO 2015 reflects the Indian engineering job market "
        "from 2010–2015. Economic and technology sector conditions have changed substantially.",
        "2. **Population scope**: Covers engineering graduates who underwent AMCAT assessment. "
        "Results may not generalise to arts, commerce, or other disciplines.",
        "3. **Moderate performance**: Macro-F1 ≈ 0.50 means meaningful uncertainty remains. "
        "The model provides probabilistic guidance, not deterministic outcomes.",
        "4. **Causal limitations**: Feature importances describe statistical associations "
        "within this dataset. They do not prove that, e.g., improving Quant score "
        "causes a salary increase.",
        "5. **Protected attributes excluded**: Gender and date-of-birth were excluded "
        "from model inputs for fairness. The model cannot and should not be used "
        "to predict outcomes by demographic group.",
        "",
        "---",
        "",
        "## 8. Disclaimer for CareerPilot UI",
        "",
        "```",
        "CareerPilot AI uses a machine learning model trained on the AMEO 2015",
        "dataset (Aspiring Minds, CC BY 4.0). Predictions reflect statistical",
        "patterns in historical employment data from Indian engineering graduates",
        "(2010–2015) and are intended as educational guidance only.",
        "",
        "They do not predict or guarantee your future salary, career success,",
        "or employment outcome. Individual results will vary based on many factors",
        "not captured in this model.",
        "```",
    ]

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Save Report
# ---------------------------------------------------------------------------

def save_evaluation_report(report_md: str, cfg: dict[str, Any]) -> Path:
    """Write the markdown evaluation report to docs/reports/."""
    reports_dir = PROJECT_ROOT / cfg["reports_dir"]
    reports_dir.mkdir(parents=True, exist_ok=True)
    report_path = reports_dir / "evaluation_report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_md)
    logger.info("Saved evaluation report to %s", report_path)
    return report_path
