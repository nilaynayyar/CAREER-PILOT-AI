# CareerPilot AI — Phase 2 ML Report

**Project:** CareerPilot AI
**Phase:** Phase 2 — ML Model Training & Evaluation
**Date:** 2026-10-03
**Author:** Antigravity IDE (Lead Software Architect & ML Engineer)
**Status:** COMPLETE — Awaiting Phase 3 Approval

---

## 1. Dataset Facts

| Property | Value |
| :--- | :--- |
| Dataset | AMEO 2015 — Aspiring Minds Employment Outcomes |
| Source | Zenodo DOI: `10.5281/zenodo.45735` |
| License | CC BY 4.0 |
| Total records | 3,998 engineering graduates |
| Usable for ML | 3,998 (0 dropped — no missing values after sentinel handling) |
| Population | Indian engineering graduates, 2010–2015 |
| Raw file SHA-256 | `113f730100901dd24e550ffa33ee0b599e99d1f48bde1ae7f1041c903ad17d4b` |

---

## 2. ML Task

```
TASK TYPE:    Supervised Multi-Class Classification (3 classes)
TARGET:       SalaryTier ∈ {Low, Mid, High}
              Derived from first-year annual salary (INR) tertile split
              Thresholds computed from TRAINING SET ONLY (no leakage)
```

**Salary Tier Thresholds (training-set derived):**

| Tier | Threshold (INR/year) | Training Count | Val Count | Test Count |
| :--- | :--- | :---: | :---: | :---: |
| Low | ≤ 210,000 | 940 (33.6%) | 201 (33.5%) | 201 (33.5%) |
| Mid | 210,001 – 335,000 | 945 (33.8%) | 203 (33.8%) | 203 (33.8%) |
| High | > 335,000 | 913 (32.6%) | 196 (32.7%) | 196 (32.7%) |
| **Total** | | **2,798** | **600** | **600** |

---

## 3. Final Feature List

**Numerical / Ordinal (13 features):**
10percentage, 12percentage, collegeGPA, CollegeTier,
English, Logical, Quant, ComputerProgramming,
conscientiousness, agreeableness, extraversion, nueroticism, openess_to_experience

**Categorical (2 features):**
Specialization, Degree

**Dropped (post-employment / protected / administrative):**
Salary, Designation, JobCity, DOJ, DOL, Gender, DOB,
ID, CollegeID, CollegeCityID, and 13 others

---

## 4. Baselines (Cross-Validation)

| Baseline | Accuracy | Macro-F1 |
| :--- | :---: | :---: |
| dummy_majority (always predict Mid) | 0.338 | 0.169 |
| dummy_stratified | 0.334 | 0.333 |
| dummy_uniform | 0.333 | 0.333 |

---

## 5. Model Comparison (5-fold Stratified Cross-Validation)

All models evaluated inside full sklearn Pipeline (preprocessor + classifier).
Primary metric: **Macro-F1**.

| Model | Accuracy | Macro-F1 | Weighted-F1 | CV Time |
| :--- | :---: | :---: | :---: | :---: |
| logistic_regression | 0.509±0.010 | **0.505±0.010** | 0.508±0.010 | ~6s |
| decision_tree | 0.411±0.015 | 0.409±0.015 | 0.410±0.015 | ~0.2s |
| random_forest | 0.483±0.013 | 0.479±0.014 | 0.483±0.013 | ~5s |
| hist_gradient_boosting | 0.479±0.015 | 0.479±0.017 | 0.479±0.015 | ~8s |

**Winner: Logistic Regression** — highest Macro-F1 (0.505) with low variance.

---

## 6. Hyperparameter Tuning

**Model:** Logistic Regression
**Strategy:** RandomizedSearchCV (n_iter=8, 5-fold Stratified CV)
**Search space:** C ∈ {0.01, 0.1, 1.0, 10.0}, solver ∈ {lbfgs, saga}

**Best parameters:**

| Parameter | Selected Value |
| :--- | :--- |
| C (regularisation) | 0.1 |
| solver | lbfgs |
| max_iter | 500 |

**Best CV Macro-F1:** 0.5077

---

## 7. Final Holdout Test Results

> Evaluated EXACTLY ONCE on the held-out test set (600 samples).
> Not used for any tuning decision.

| Metric | Value | vs Dummy Baseline |
| :--- | :---: | :---: |
| Accuracy | **0.5217** | +18.4% absolute |
| Macro-F1 | **0.5177** | +34.8% absolute |
| Weighted-F1 | 0.5167 | — |
| Macro-Precision | 0.5154 | — |
| Macro-Recall | 0.5229 | — |

### Per-Class Metrics

| Class | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| High | 0.573 | 0.602 | 0.587 | 196 |
| Low | 0.553 | 0.607 | 0.579 | 201 |
| Mid | 0.424 | 0.360 | 0.389 | 203 |
| **macro avg** | **0.517** | **0.523** | **0.518** | 600 |

### Confusion Matrix

```
           High    Low    Mid
    High    118     27     51
     Low     31    122     48
     Mid     59     71     73
```

---

## 8. Feature Importance

### Permutation Importances (most reliable — model-agnostic)

| Rank | Feature | Mean F1-drop | Interpretation |
| :---: | :--- | :---: | :--- |
| 1 | AMCAT Quantitative Score | 0.0180 | Strongest aptitude signal |
| 2 | AMCAT English Score | 0.0154 | Verbal aptitude |
| 3 | 10th Grade Score (%) | 0.0136 | Long-run academic pattern |
| 4 | Specialization | 0.0122 | Field of engineering matters |
| 5 | 12th Grade Score (%) | 0.0105 | Pre-college attainment |
| 6 | College Tier | 0.0074 | Institution prestige |
| 7 | College GPA (%) | 0.0044 | In-college performance |
| 8 | Degree type | 0.0036 | B.Tech vs MCA etc. |
| 9 | Extraversion (Big Five) | 0.0018 | Personality (weak signal) |
| 10 | Neuroticism (Big Five) | 0.0003 | Personality (very weak) |

**Personality traits have very small permutation importances** — the model
learns primarily from aptitude scores and academic grades, consistent with
empirical HR research on cognitive ability as the primary predictor.

---

## 9. Error Analysis

**Most confused pair:** Mid → Low (71 cases, 35.0% of Mid actual)

The Mid tier is the hardest to classify because it spans the widest
range of profiles and sits between Low and High — boundary ambiguity
is expected and inherent to continuous salary tertile classification.

High and Low tiers are classified more reliably (F1 = 0.587 and 0.579).

---

## 10. Model Limitations

> IMPORTANT: These limitations must be displayed in the CareerPilot UI.

1. **Historical scope**: Covers Indian engineering graduates, 2010–2015.
   Does not reflect current market conditions or non-engineering disciplines.
2. **Moderate performance**: Macro-F1 = 0.52. The model is better than random
   guessing but predictions carry substantial uncertainty.
3. **Causal claims prohibited**: Feature importances are statistical associations,
   not causal pathways. Do not claim "improving Quant score causes higher salary."
4. **Fairness**: Gender and date-of-birth are excluded from inputs.
5. **Generalisation**: Not validated on students outside the AMEO population.

---

## 11. Serialized Artefacts

| Artefact | Path |
| :--- | :--- |
| Trained pipeline (.joblib) | `ml/models/final_model.joblib` |
| Model metadata (.json) | `ml/models/model_metadata.json` |
| Evaluation report | `docs/reports/evaluation_report.md` |
| Feature importance report | `docs/reports/feature_importance.md` |
| Native importances (.csv) | `docs/reports/native_importances.csv` |
| Permutation importances (.csv) | `docs/reports/permutation_importances.csv` |
| Example explanation (.json) | `docs/reports/example_explanation.json` |
| Train split | `data/processed/train.csv` (2,798 rows) |
| Val split | `data/processed/val.csv` (600 rows) |
| Test split | `data/processed/test.csv` (600 rows) |

---

## 12. Tests Passed

**36 / 36 tests PASSED** (pytest, 3.16s)

Categories covered:
- Config integrity (no leakage in feature list)
- Raw data integrity (shape, no duplicates, salary positive)
- Target construction (3 classes, no nulls, balanced, thresholds ordered)
- Preprocessing (no post-outcome columns, sentinel replaced, disjoint splits, total rows preserved)
- Model predictions (valid classes, proba sums to 1.0, no NaN)
- Representative profile inference (valid output, high-aptitude → not Low)
- Serialized model (file exists, metadata complete, no Salary in features)

---

## 13. STOP — Awaiting Phase 3 Approval

Phase 2 (ML layer) is complete.

The following are NOT yet built:
- Gemini / LLM agents
- Skill gap analysis
- Learning roadmap generation
- O*NET integration
- FastAPI prediction endpoint
- Frontend / UI

These will be implemented in Phase 3 (Agentic AI Layer) upon approval.
