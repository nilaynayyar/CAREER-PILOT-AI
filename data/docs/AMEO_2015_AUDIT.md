# Forensic Dataset Audit: AMEO 2015

**Dataset:** AMEO — Aspiring Minds Employment Outcomes 2015
**Project:** CareerPilot AI — Phase 1.7 (Forensic Dataset Audit)
**Audit Date:** 2026-10-03
**Auditor:** Antigravity IDE (Lead Software Architect & ML Engineer)
**Primary Source:** Zenodo DOI: `10.5281/zenodo.45735`
**Status:** CONDITIONAL PASS — APPROVED FOR TRAINING WITH SALARY TIER TARGET

## 1. Dataset Identity & Provenance

| Field | Value |
| :--- | :--- |
| **Official Title** | Aspiring Minds Employment Outcomes 2015 (AMEO) |
| **Zenodo Record** | https://zenodo.org/records/45735 |
| **License** | Creative Commons Attribution 4.0 International (CC BY 4.0) |
| **Local Filename** | data/raw/ameo_2015.csv |
| **File Size** | 1,143,977 bytes (1.09 MB) |
| **SHA-256 Hash** | 113f730100901dd24e550ffa33ee0b599e99d1f48bde1ae7f1041c903ad17d4b |
| **Raw File Status** | UNMODIFIED |

## 2. Dataset Dimensions

| Dimension | Value |
| :--- | :--- |
| **Total Rows** | 3,998 |
| **Total Columns** | 39 |
| **Total Missing Values** | 0 |
| **Exact Duplicate Rows** | 0 |

## 3. Target Variable Analysis

### Raw Designation (REJECTED)
- 419 unique job titles — too sparse for direct ML
- Top class: software engineer = 539 (13.5%)

### Consolidated Career Role (REJECTED — no signal)
- RF Accuracy: 0.598 vs majority baseline 0.601
- RF Macro-F1: 0.149 — near-total failure on minority classes

### SalaryTier Tertile (APPROVED)
- Low / Mid / High tertile split of first-year salary
- Distribution: Low=1342 (33.6%), Mid=1351 (33.8%), High=1305 (32.7%)
- RF Accuracy: 0.483 vs majority baseline 0.338 (+42.9% lift)
- RF Macro-F1: 0.478 — meaningful predictive signal

## 4. Feature Importances (Salary Tier Task)

| Feature | Importance | Pearson r with Salary |
| :--- | :--- | :--- |
| Quant | 0.103 | +0.231 |
| 10percentage | 0.095 | +0.177 |
| 12percentage | 0.091 | +0.170 |
| English | 0.087 | +0.178 |
| collegeGPA | 0.086 | +0.130 |
| nueroticism | 0.081 | -0.055 |
| Logical | 0.078 | +0.179 |
| openess_to_experience | 0.076 | -0.011 |
| ComputerProgramming | 0.076 | +0.164 |

All importances distributed — no single circular predictor.

## 5. Synthetic Data Check

- Balanced class sizes? NO (natural variation)
- Hard feature boundaries per class? NO
- Near-perfect accuracy? NO (48.3%)
- Single dominant circular feature? NO (12+ features contribute)
- Duplicate rows? NO (0 exact duplicates)
- Unverified provenance? NO (Zenodo DOI confirmed)

VERDICT: NO EVIDENCE OF SYNTHETIC DATA

## 6. Leakage Audit

Columns to DROP: Salary (use only for target derivation), DOJ, DOL, JobCity,
Designation (from inputs), ID, CollegeID, CollegeCityID, Gender, DOB

All remaining Group D pre-hire features: RETAIN

No circularity detected.

## 7. Domain Module Sentinels

ComputerProgramming: 868 rows with -1 (21.7%)
ElectronicsAndSemicon: 2854 rows with -1 (71.4%)
Remediation: Replace -1 with NaN then impute median.

## 8. Final Verdict

STATUS: CONDITIONAL PASS - APPROVED FOR ML TRAINING

Approved Target: SalaryTier (Low / Mid / High)
Rejected Target: Designation (too sparse)

Conditions:
1. Use SalaryTier (tertile split of Salary) as classification target
2. Drop all post-outcome, administrative, and protected columns
3. Replace domain sentinel -1 with NaN before imputation
4. Never use Salary as input feature
5. Report macro-F1, per-class F1, accuracy, and confusion matrix
6. Preserve data/raw/ameo_2015.csv unmodified
