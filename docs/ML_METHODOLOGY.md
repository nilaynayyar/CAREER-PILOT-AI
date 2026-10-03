# CareerPilot AI — ML Methodology

**Version:** 3.0.0  
**Model:** Logistic Regression (scikit-learn 1.5.2)  
**Training Date:** 2026-10-03  
**Source of Truth:** `ml/models/model_metadata.json`, `docs/PHASE_2_ML_REPORT.md`  

---

## IMPORTANT: What This Model Does and Does NOT Predict

### What it DOES:
- Estimates a salary tier (Low / Mid / High) from patterns learned from the AMEO 2015 historical dataset of Indian engineering graduates.
- Provides predicted class probabilities for each tier (these are `predict_proba()` outputs from Logistic Regression — not softmax from a neural network, not calibrated via Platt scaling or isotonic regression).
- Provides permutation feature importance showing which input dimensions were most statistically associated with salary outcomes in the training data.

### What it does NOT predict:
- The student's ideal career
- Future salary in absolute terms
- Guaranteed employment
- Career suitability for any specific occupation
- Individual potential or talent
- Market outcomes beyond the 2010–2015 AMEO population

---

## 1. Dataset

| Property | Value |
|---|---|
| **Name** | Aspiring Minds Employment Outcomes 2015 (AMEO 2015) |
| **Source** | Zenodo DOI: `10.5281/zenodo.45735` |
| **License** | Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0) |
| **Total records** | 3,998 Indian engineering graduates |
| **Population** | Engineering graduates surveyed 2010–2015 |
| **Raw file SHA-256** | `113f730100901dd24e550ffa33ee0b599e99d1f48bde1ae7f1041c903ad17d4b` |

### Dataset Splits

| Split | Records | Percentage |
|---|---|---|
| Training | 2,798 | 70% |
| Validation | 600 | 15% |
| Test (holdout) | 600 | 15% |
| **Total** | **3,998** | **100%** |

All splits are stratified by `SalaryTier` to maintain class balance. Thresholds are computed from the **training set only** — no test or validation data leaks into target construction.

---

## 2. Target Construction

The target variable `SalaryTier` is derived from the `Salary` column (annual INR salary) using **tertile splits computed on the training set only**:

| Tier | Threshold (INR/year) | Approx. LPA | Train Count | % |
|---|---|---|---|---|
| Low | ≤ ₹2,10,000 | ≤ ₹2.10 LPA | 940 | 33.6% |
| Mid | ₹2,10,001 – ₹3,35,000 | ₹2.10–₹3.35 LPA | 945 | 33.8% |
| High | > ₹3,35,000 | > ₹3.35 LPA | 913 | 32.6% |

**Important note:** These thresholds reflect 2010–2015 salary data and do not represent current market salary benchmarks.

---

## 3. Feature Set

All 15 features used by `final_model.joblib` (exact column names as in training data):

### Numerical / Ordinal Features (13)

| Feature Name | Description | Approximate Range |
|---|---|---|
| `10percentage` | 10th grade percentage | 40–100 |
| `12percentage` | 12th grade percentage | 40–100 |
| `collegeGPA` | College GPA on percentage scale | 40–100 |
| `CollegeTier` | College tier (1=Tier-1, 2=Tier-2) | 1 or 2 |
| `English` | AMCAT English aptitude score | 100–900 |
| `Logical` | AMCAT Logical reasoning score | 100–900 |
| `Quant` | AMCAT Quantitative aptitude score | 100–900 |
| `ComputerProgramming` | AMCAT Computer Programming score | 100–900 (optional) |
| `conscientiousness` | Big Five Conscientiousness (z-score) | ≈ -4 to +4 |
| `agreeableness` | Big Five Agreeableness (z-score) | ≈ -4 to +4 |
| `extraversion` | Big Five Extraversion (z-score) | ≈ -4 to +4 |
| `nueroticism` | Big Five Neuroticism (z-score; source spelling preserved) | ≈ -4 to +4 |
| `openess_to_experience` | Big Five Openness (z-score; source spelling preserved) | ≈ -4 to +4 |

### Categorical Features (2)

| Feature Name | Description | Valid Values |
|---|---|---|
| `Specialization` | Engineering discipline | 16 validated options |
| `Degree` | Degree type | 6 validated options (B.Tech/B.E., M.Tech./M.E., MCA, B.Sc., M.Sc., Other) |

### Excluded Features

The following columns are **strictly excluded** from model inputs to prevent data leakage and privacy concerns:

| Column | Reason |
|---|---|
| `Salary` | Target variable — excluded as input |
| `Designation`, `JobCity` | Post-employment outcomes — leakage |
| `DOJ`, `DOL` | Employment dates — post-outcome |
| `Gender`, `DOB` | Protected attributes — excluded for fairness |
| `ID`, `CollegeID`, `CollegeCityID` | Administrative identifiers |

---

## 4. Preprocessing Pipeline

The sklearn `Pipeline` includes a single `ColumnTransformer` followed by the classifier:

```python
Pipeline([
    ('preprocessor', ColumnTransformer([
        ('numerical', Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ]), NUMERICAL_FEATURES),
        ('categorical', Pipeline([
            ('imputer', SimpleImputer(strategy='constant', fill_value='Unknown')),
            ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ]), CATEGORICAL_FEATURES)
    ])),
    ('classifier', LogisticRegression(
        C=0.1, solver='lbfgs', max_iter=500, multi_class='auto'
    ))
])
```

The `SimpleImputer` with `strategy='median'` handles the `ComputerProgramming` feature, which is optional (some students did not take this AMCAT module).

---

## 5. Models Evaluated

All candidates evaluated inside the complete `Pipeline` using 5-fold stratified cross-validation. Primary optimisation metric: **Macro F1** (appropriate for near-balanced classes).

| Model | CV Accuracy | CV Macro-F1 | CV Weighted-F1 | CV Time |
|---|---|---|---|---|
| **Logistic Regression** | **0.511 ± 0.011** | **0.505 ± 0.011** | **0.505 ± 0.011** | 0.72s |
| Random Forest | 0.494 ± 0.022 | 0.488 ± 0.022 | 0.487 ± 0.022 | 2.84s |
| HistGradientBoosting | 0.479 ± 0.015 | 0.479 ± 0.017 | 0.478 ± 0.017 | 8.40s |
| Decision Tree | 0.437 ± 0.022 | 0.435 ± 0.023 | 0.435 ± 0.022 | 0.39s |

### Dummy Baselines

| Baseline | Accuracy | Macro-F1 |
|---|---|---|
| Always predict majority class (Mid) | 0.338 | 0.168 |
| Stratified random | 0.330 | 0.330 |
| Uniform random | 0.336 | 0.336 |

---

## 6. Why Logistic Regression Was Selected

Logistic Regression achieved the highest cross-validation Macro-F1 (0.505) among all four candidates. Additionally:

- **Interpretability**: Logistic Regression coefficients are inspectable, and permutation importance can be computed reliably.
- **Direct Probability Estimation**: Logistic Regression's `predict_proba()` outputs direct probability distributions over classes through cross-entropy loss minimisation — more straightforward than tree ensemble outputs without post-hoc processing.
- **Computational efficiency**: 0.72 seconds CV time vs 8.40 seconds for gradient boosting, making it suitable for real-time web inference.
- **Low variance**: Lowest standard deviation (±0.011) across CV folds, indicating more stable generalisation.
- **No overfitting risk** at the selected regularisation strength (C=0.1).

---

## 7. Hyperparameter Tuning

**Method:** `RandomizedSearchCV` (n_iter=8, 5-fold Stratified CV)  
**Search space:** C ∈ {0.01, 0.1, 1.0, 10.0}, solver ∈ {lbfgs, saga}

**Selected hyperparameters:**

| Parameter | Value |
|---|---|
| C (regularisation) | 0.1 |
| solver | lbfgs |
| max_iter | 500 |

**Best CV Macro-F1 after tuning:** 0.5077  
**Tuning time:** 9.42 seconds

---

## 8. Final Holdout Test Results

> Evaluated **exactly once** on the held-out test set (600 samples, never touched during training or tuning).

| Metric | Value | vs. Dummy Baseline (Majority) |
|---|---|---|
| **Accuracy** | **0.5217** | +18.4% absolute |
| **Macro-F1** | **0.5177** | +34.8% absolute |
| Weighted-F1 | 0.5167 | — |
| Macro-Precision | 0.5154 | — |
| Macro-Recall | 0.5229 | — |

### Per-Class Metrics (Holdout Test Set)

| Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| High | 0.573 | 0.602 | 0.587 | 196 |
| Low | 0.553 | 0.607 | 0.579 | 201 |
| Mid | 0.424 | 0.360 | 0.389 | 203 |
| **Macro avg** | **0.517** | **0.523** | **0.518** | 600 |

### Confusion Matrix

```
            High   Low   Mid
  Actual High: 118    27    51
  Actual Low:   31   122    48
  Actual Mid:   59    71    73
```

**Key observation:** The Mid tier is the hardest to classify (F1 = 0.389) because it spans a wide range of profiles that sit between Low and High boundaries. High and Low tiers are more reliably distinguished (F1 ≈ 0.58).

---

## 9. Permutation Feature Importance

Permutation importance measures the average drop in test-set Macro-F1 when each feature's values are randomly shuffled (run 10 times, using the held-out test set).

| Rank | Feature | Importance (Mean F1-drop) | Std | Display Name |
|---|---|---|---|---|
| 1 | Quant | 0.01796 | ±0.0089 | AMCAT Quantitative Score |
| 2 | English | 0.01540 | ±0.0134 | AMCAT English Score |
| 3 | 10percentage | 0.01362 | ±0.0082 | 10th Grade Score (%) |
| 4 | Specialization | 0.01223 | ±0.0136 | Specialization (field of study) |
| 5 | 12percentage | 0.01052 | ±0.0050 | 12th Grade Score (%) |
| 6 | CollegeTier | 0.00745 | ±0.0045 | College Tier |
| 7 | collegeGPA | 0.00441 | ±0.0072 | College GPA (%) |
| 8 | Degree | 0.00363 | ±0.0040 | Degree type |
| 9 | extraversion | 0.00180 | ±0.0031 | Extraversion (Big Five) |
| 10 | nueroticism | 0.00029 | ±0.0048 | Neuroticism (Big Five) |

**Interpretation:** These are **statistical associations** in training data, not causal pathways. They describe which features, when permuted, most disrupted the model's accuracy on the test set — nothing more.

**Note on probability outputs:** Probabilities are raw `predict_proba()` outputs from Logistic Regression. Logistic Regression inherently produces well-calibrated probability estimates through cross-entropy training. No separate post-hoc calibration procedure (Platt scaling, isotonic regression) was applied. These are documented strictly as "predicted class probabilities" — not "confidence scores" or "softmax outputs" (Logistic Regression is not a neural network).

---

## 10. Serialised Artefacts

| Artefact | Path |
|---|---|
| Trained sklearn Pipeline | `ml/models/final_model.joblib` |
| Model metadata | `ml/models/model_metadata.json` |
| Permutation importances | `docs/reports/permutation_importances.csv` |
| Training data | `data/processed/train.csv` (2,798 rows) |
| Validation data | `data/processed/val.csv` (600 rows) |
| Test data (holdout) | `data/processed/test.csv` (600 rows) |

---

## 11. Model Limitations

1. **Historical data**: AMEO 2015 covers 2010–2015 Indian engineering graduate employment. The model cannot reflect post-2015 market changes, remote work trends, or current technology demand.
2. **Population scope**: The model is validated only on the AMEO population. Results for students from different educational systems or countries may not generalise.
3. **Moderate performance**: Macro-F1 ≈ 0.52. The model performs better than random chance but not with high precision. All predictions should be treated as probabilistic guidance.
4. **Historical salary thresholds**: Salary tiers reflect 2015 INR salary distributions. Do not interpret tier boundaries as current salary targets.
5. **Association ≠ causation**: Feature importance scores reflect statistical associations, not causal mechanisms. Do not claim "higher Quant score causes higher salary."
6. **Fairness**: Gender and date-of-birth are excluded. The model is not validated for intersectional fairness across protected attributes.
