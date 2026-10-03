#!/usr/bin/env python3
"""Dataset Inspection & Audit Utility for CareerPilot AI.

This script inspects candidate tabular datasets (CSV, TSV, Parquet) and generates
a comprehensive quality and suitability report. It does NOT modify the underlying data.

Usage:
    python scripts/inspect_dataset.py --file path/to/dataset.csv
    python scripts/inspect_dataset.py --file path/to/dataset.csv --target Career
    python scripts/inspect_dataset.py --file path/to/dataset.csv --target Career --output report.md
"""

from __future__ import annotations

import argparse
import hashlib
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd


def compute_file_hash(filepath: Path) -> str:
    """Compute SHA-256 hash of a file for integrity tracking."""
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            sha256.update(chunk)
    return sha256.hexdigest()


def load_dataset(filepath: Path) -> pd.DataFrame:
    """Load dataset into a pandas DataFrame based on file extension."""
    if not filepath.exists():
        raise FileNotFoundError(f"File not found: {filepath}")

    ext = filepath.suffix.lower()
    if ext in (".csv", ".txt"):
        # Auto-detect delimiter
        return pd.read_csv(filepath)
    elif ext == ".tsv":
        return pd.read_csv(filepath, sep="\t")
    elif ext in (".parquet", ".pq"):
        return pd.read_parquet(filepath)
    else:
        # Default fallback to read_csv
        return pd.read_csv(filepath)


def inspect_dataset(
    df: pd.DataFrame,
    filepath: Path,
    target_column: Optional[str] = None,
    top_categories: int = 10,
) -> Dict[str, Any]:
    """Execute complete diagnostic inspection on the DataFrame.

    Returns:
        Structured dictionary of diagnostic findings.
    """
    total_rows, total_cols = df.shape
    file_size_bytes = filepath.stat().st_size
    file_size_mb = file_size_bytes / (1024 * 1024)
    file_hash = compute_file_hash(filepath)

    # Missing value analysis
    missing_counts = df.isnull().sum()
    missing_pct = (missing_counts / total_rows) * 100 if total_rows > 0 else 0

    col_inventory: List[Dict[str, Any]] = []
    for col in df.columns:
        col_inventory.append(
            {
                "name": col,
                "dtype": str(df[col].dtype),
                "non_null": int(df[col].count()),
                "missing_count": int(missing_counts[col]),
                "missing_pct": float(round(missing_pct[col], 2)),
                "unique_count": int(df[col].nunique(dropna=True)),
            }
        )

    # Duplicate row analysis
    duplicate_rows = int(df.duplicated().sum())
    duplicate_pct = (duplicate_rows / total_rows) * 100 if total_rows > 0 else 0.0

    # Numerical feature statistics
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    num_stats: List[Dict[str, Any]] = []
    if num_cols:
        desc = df[num_cols].describe().T
        for col in num_cols:
            num_stats.append(
                {
                    "column": col,
                    "mean": round(float(desc.loc[col, "mean"]), 3),
                    "std": round(float(desc.loc[col, "std"]), 3),
                    "min": round(float(desc.loc[col, "min"]), 3),
                    "p25": round(float(desc.loc[col, "25%"]), 3),
                    "median": round(float(desc.loc[col, "50%"]), 3),
                    "p75": round(float(desc.loc[col, "75%"]), 3),
                    "max": round(float(desc.loc[col, "max"]), 3),
                }
            )

    # Categorical & object feature analysis
    cat_cols = df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()
    cat_summary: List[Dict[str, Any]] = []
    for col in cat_cols:
        val_counts = df[col].value_counts(dropna=False, normalize=False)
        top_vals = [
            {"value": str(k), "count": int(v), "pct": round(float(v / total_rows * 100), 2)}
            for k, v in val_counts.head(top_categories).items()
        ]
        cat_summary.append(
            {
                "column": col,
                "unique_count": int(df[col].nunique(dropna=True)),
                "has_nulls": bool(df[col].isnull().any()),
                "top_values": top_vals,
            }
        )

    # Heuristic detections: Potential ID columns, High Cardinality, Text fields
    potential_id_cols: List[str] = []
    high_cardinality_cols: List[str] = []
    potential_text_cols: List[str] = []

    id_regex = re.compile(r"(^id$|_id$|^uuid$|^index$|^student_id$|^roll)", re.IGNORECASE)

    for col in df.columns:
        n_unique = df[col].nunique(dropna=True)
        # Check potential ID
        if id_regex.search(col) or (total_rows > 50 and n_unique == total_rows):
            potential_id_cols.append(col)

        # Check high-cardinality categorical
        if col in cat_cols and col not in potential_id_cols:
            if n_unique > 50 and (n_unique / total_rows) > 0.1:
                high_cardinality_cols.append(col)

        # Check free-text / unstructured text
        if df[col].dtype == "object":
            # Sample non-null strings to check average character length
            sample = df[col].dropna().astype(str).head(100)
            if not sample.empty:
                avg_len = sample.str.len().mean()
                if avg_len > 60:
                    potential_text_cols.append(col)

    # Target column analysis (if provided)
    target_analysis: Optional[Dict[str, Any]] = None
    leakage_indicators: List[str] = []

    if target_column:
        if target_column not in df.columns:
            target_analysis = {
                "error": f"Target column '{target_column}' does not exist in dataset."
            }
        else:
            target_series = df[target_column]
            target_counts = target_series.value_counts(dropna=False)
            target_unique = target_series.nunique(dropna=True)

            # Imbalance ratio: majority class count / minority class count
            valid_counts = target_series.value_counts(dropna=True)
            if len(valid_counts) > 1 and valid_counts.min() > 0:
                imbalance_ratio = round(float(valid_counts.max() / valid_counts.min()), 2)
            else:
                imbalance_ratio = 1.0

            target_analysis = {
                "column_name": target_column,
                "dtype": str(target_series.dtype),
                "num_classes": int(target_unique),
                "missing_target_count": int(target_series.isnull().sum()),
                "imbalance_ratio": imbalance_ratio,
                "class_distribution": [
                    {
                        "class": str(k),
                        "count": int(v),
                        "pct": round(float(v / total_rows * 100), 2),
                    }
                    for k, v in target_counts.items()
                ],
            }

            # Check for possible leakage
            for col in df.columns:
                if col == target_column:
                    continue
                # If a column has identical unique mapping or high correlation
                if df[col].dtype == "object" and df[target_column].dtype == "object":
                    # Check cross-tabulation purity
                    grouped = df.groupby(col)[target_column].nunique()
                    if len(grouped) > 2 and (grouped == 1).all():
                        leakage_indicators.append(
                            f"Column '{col}' uniquely determines '{target_column}' (100% deterministic mapping)."
                        )
                # Check suspicious names
                if re.search(r"(career_pred|job_target|label|outcome|placement_status)", col, re.I):
                    leakage_indicators.append(
                        f"Column name '{col}' strongly suggests post-outcome or target-derived data."
                    )

    # Data Quality Warnings
    quality_warnings: List[str] = []
    if total_rows == 0:
        quality_warnings.append("CRITICAL: Dataset contains 0 rows.")
    elif total_rows < 300:
        quality_warnings.append(
            f"WARNING: Low sample size ({total_rows} rows). Supervised classification may overfit."
        )

    if duplicate_rows > 0:
        quality_warnings.append(
            f"WARNING: Found {duplicate_rows} duplicate rows ({duplicate_pct:.2f}% of dataset)."
        )

    cols_high_missing = [c["name"] for c in col_inventory if c["missing_pct"] > 30.0]
    if cols_high_missing:
        quality_warnings.append(
            f"WARNING: High missingness (>30%) in columns: {', '.join(cols_high_missing)}"
        )

    if target_analysis and "error" not in target_analysis:
        if target_analysis["num_classes"] < 2:
            quality_warnings.append(
                f"CRITICAL: Target has only {target_analysis['num_classes']} unique class."
            )
        elif target_analysis["imbalance_ratio"] > 10.0:
            quality_warnings.append(
                f"WARNING: Severe class imbalance (ratio {target_analysis['imbalance_ratio']}:1)."
            )

    return {
        "file_name": filepath.name,
        "file_path": str(filepath.resolve()),
        "file_size_mb": round(file_size_mb, 3),
        "file_sha256": file_hash,
        "total_rows": total_rows,
        "total_columns": total_cols,
        "column_inventory": col_inventory,
        "duplicate_rows": duplicate_rows,
        "duplicate_pct": round(duplicate_pct, 2),
        "numerical_stats": num_stats,
        "categorical_summary": cat_summary,
        "potential_id_columns": potential_id_cols,
        "high_cardinality_columns": high_cardinality_cols,
        "potential_text_columns": potential_text_cols,
        "target_analysis": target_analysis,
        "leakage_indicators": leakage_indicators,
        "quality_warnings": quality_warnings,
    }


def format_report(results: Dict[str, Any]) -> str:
    """Format diagnostic inspection dictionary into a clean, human-readable terminal report."""
    lines: List[str] = []
    banner = "=" * 80

    lines.append(banner)
    lines.append("              CAREERPILOT AI - DATASET AUDIT & INSPECTION REPORT")
    lines.append(banner)
    lines.append(f" File Name:      {results['file_name']}")
    lines.append(f" File Path:      {results['file_path']}")
    lines.append(f" File Size:      {results['file_size_mb']} MB")
    lines.append(f" SHA-256 Hash:   {results['file_sha256']}")
    lines.append(f" Total Rows:     {results['total_rows']:,}")
    lines.append(f" Total Columns:  {results['total_columns']}")
    lines.append(f" Duplicate Rows: {results['duplicate_rows']:,} ({results['duplicate_pct']}%)")
    lines.append("-" * 80)

    # Quality Warnings
    lines.append("DATA QUALITY WARNINGS:")
    if results["quality_warnings"]:
        for w in results["quality_warnings"]:
            lines.append(f"  [!] {w}")
    else:
        lines.append("  [OK] No immediate critical data quality issues identified.")
    lines.append("-" * 80)

    # Column Inventory
    lines.append("COLUMN INVENTORY:")
    lines.append(
        f"  {'Column Name':<30} {'Dtype':<12} {'Non-Null':<10} {'Missing':<10} {'Missing %':<10} {'Unique':<8}"
    )
    lines.append("  " + "-" * 76)
    for col in results["column_inventory"]:
        lines.append(
            f"  {col['name']:<30} {col['dtype']:<12} {col['non_null']:<10} {col['missing_count']:<10} {col['missing_pct']:<10.2f} {col['unique_count']:<8}"
        )
    lines.append("-" * 80)

    # Heuristic Flags
    lines.append("STRUCTURAL FEATURE AUDIT:")
    lines.append(
        f"  Potential ID Columns:       {', '.join(results['potential_id_columns']) if results['potential_id_columns'] else 'None'}"
    )
    lines.append(
        f"  High-Cardinality Features:  {', '.join(results['high_cardinality_columns']) if results['high_cardinality_columns'] else 'None'}"
    )
    lines.append(
        f"  Free-Text / Long Fields:    {', '.join(results['potential_text_columns']) if results['potential_text_columns'] else 'None'}"
    )
    lines.append("-" * 80)

    # Target Column Analysis
    if results.get("target_analysis"):
        t = results["target_analysis"]
        lines.append("TARGET VARIABLE AUDIT:")
        if "error" in t:
            lines.append(f"  [ERROR] {t['error']}")
        else:
            lines.append(f"  Target Column:    {t['column_name']} (dtype: {t['dtype']})")
            lines.append(f"  Unique Classes:   {t['num_classes']}")
            lines.append(f"  Missing Labels:   {t['missing_target_count']}")
            lines.append(f"  Imbalance Ratio:  {t['imbalance_ratio']}:1 (majority : minority)")
            lines.append("\n  Class Distribution:")
            for cls_info in t["class_distribution"]:
                lines.append(
                    f"    - {cls_info['class']:<32}: {cls_info['count']:>6} ({cls_info['pct']:>5.2f}%)"
                )
        lines.append("-" * 80)

    # Leakage Indicators
    if results.get("leakage_indicators"):
        lines.append("TARGET LEAKAGE AUDIT:")
        for leak in results["leakage_indicators"]:
            lines.append(f"  [!] {leak}")
        lines.append("-" * 80)

    # Numerical Summary
    if results.get("numerical_stats"):
        lines.append("NUMERICAL STATISTICS (Summary):")
        lines.append(
            f"  {'Column':<24} {'Mean':<10} {'Std':<10} {'Min':<8} {'Median':<8} {'Max':<8}"
        )
        lines.append("  " + "-" * 72)
        for stat in results["numerical_stats"][:15]:  # limit to top 15 numerical
            lines.append(
                f"  {stat['column']:<24} {stat['mean']:<10.2f} {stat['std']:<10.2f} {stat['min']:<8.2f} {stat['median']:<8.2f} {stat['max']:<8.2f}"
            )
        if len(results["numerical_stats"]) > 15:
            lines.append(f"  ... and {len(results['numerical_stats']) - 15} more numerical columns.")
        lines.append("-" * 80)

    # Categorical Summary
    if results.get("categorical_summary"):
        lines.append("CATEGORICAL VALUE SAMPLING:")
        for cat in results["categorical_summary"][:10]:
            top_strs = [f"{v['value']} ({v['count']})" for v in cat["top_values"][:4]]
            lines.append(f"  {cat['column']} (Unique: {cat['unique_count']}): {', '.join(top_strs)}")
        if len(results["categorical_summary"]) > 10:
            lines.append(
                f"  ... and {len(results['categorical_summary']) - 10} more categorical columns."
            )
        lines.append("-" * 80)

    lines.append("RECOMMENDED NEXT ACTION:")
    if results["quality_warnings"]:
        lines.append(
            "  Review warnings above against data/docs/DATASET_GUIDELINES.md before proceeding."
        )
    else:
        lines.append(
            "  Dataset passed baseline sanity checks. Verify feature semantics before pipeline design."
        )
    lines.append(banner)

    return "\n".join(lines)


def main() -> int:
    """CLI entrypoint."""
    parser = argparse.ArgumentParser(
        description="Inspect and audit candidate tabular datasets for CareerPilot AI."
    )
    parser.add_argument(
        "--file", "-f", required=True, type=str, help="Path to tabular dataset (CSV/TSV/Parquet)."
    )
    parser.add_argument(
        "--target",
        "-t",
        type=str,
        default=None,
        help="Optional target column name for multi-class audit and leakage detection.",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default=None,
        help="Optional filepath to save formatted report (e.g., report.txt or report.md).",
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=8,
        help="Number of top categories to display per categorical column (default: 8).",
    )

    args = parser.parse_args()
    filepath = Path(args.file)

    try:
        df = load_dataset(filepath)
    except Exception as e:
        print(f"\n[ERROR] Failed to read dataset: {e}", file=sys.stderr)
        return 1

    results = inspect_dataset(
        df=df,
        filepath=filepath,
        target_column=args.target,
        top_categories=args.top_k,
    )

    report_text = format_report(results)
    print(report_text)

    if args.output:
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(report_text, encoding="utf-8")
        print(f"\nReport written to: {out_path.resolve()}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
