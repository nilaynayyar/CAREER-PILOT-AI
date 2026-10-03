# CareerPilot AI — Phase 2 ML Evaluation Report

**Dataset:** AMEO 2015 (Aspiring Minds Employment Outcomes)  
**Target:** SalaryTier ∈ {Low, Mid, High} (first-year salary tertiles)  
**Evaluated:** N/A  
**Final Model:** logistic_regression  

---

## 1. Dataset Facts

- Source: Zenodo DOI `10.5281/zenodo.45735` (CC BY 4.0)
- Population: 3,998 Indian engineering graduates, 2010–2015
- Task: 3-class salary tier classification from pre-employment features
- Training set: 2798 samples
- Validation set: 600 samples
- Test set: 600 samples (held out — evaluated once)

---

## 2. Baseline Metrics (Cross-Validation)

| Baseline | Accuracy | Macro-F1 |
| :--- | :---: | :---: |
| dummy_majority | 0.338 | 0.168 |
| dummy_stratified | 0.330 | 0.330 |
| dummy_uniform | 0.336 | 0.336 |

---

## 3. Cross-Validation Model Comparison

All models evaluated on training data only using Stratified K-Fold (k=5). Primary metric: **Macro-F1**.

| Model | Accuracy | Macro-F1 | Weighted-F1 | Macro-Prec | Macro-Rec | CV Time |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| logistic_regression | 0.511±0.011 | **0.505±0.011** | 0.505±0.011 | 0.505±0.012 | 0.511±0.011 | 0.7s |
| decision_tree | 0.437±0.022 | **0.435±0.023** | 0.435±0.022 | 0.438±0.023 | 0.437±0.022 | 0.4s |
| random_forest | 0.494±0.022 | **0.488±0.022** | 0.487±0.022 | 0.489±0.023 | 0.495±0.022 | 2.8s |
| hist_gradient_boosting | 0.479±0.015 | **0.479±0.017** | 0.478±0.017 | 0.479±0.018 | 0.480±0.015 | 8.4s |

---

## 4. Hyperparameter Tuning

**Model tuned:** logistic_regression  
**Search strategy:** RandomizedSearchCV (n_iter=8, cv=5)  
**Best CV Macro-F1:** 0.5077  

**Best Parameters:**
```
  solver: lbfgs
  max_iter: 500
  C: 0.1
```

---

## 5. Final Holdout Test Results

> **This section reports results on the untouched test set, evaluated exactly once.**

| Metric | Value |
| :--- | :---: |
| Accuracy | **0.5217** |
| Macro-F1 | **0.5177** |
| Weighted-F1 | 0.5167 |
| Macro-Precision | 0.5154 |
| Macro-Recall | 0.5229 |
| Dummy (majority) Macro-F1 | 0.1683 |
| **F1 improvement over baseline** | **+0.3494** |

### Per-Class Metrics

| Class | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| High | 0.567 | 0.602 | 0.584 | 196 |
| Low | 0.555 | 0.607 | 0.580 | 201 |
| Mid | 0.424 | 0.360 | 0.389 | 203 |

### Confusion Matrix

Rows = true class, Columns = predicted class  
Labels: ['High', 'Low', 'Mid']

```
                High     Low     Mid
          High     118      27      51
           Low      31     122      48
           Mid      59      71      73
```

---

## 6. Error Analysis

### Most Confused Class Pairs

| True Class | Predicted | Count | Error Rate |
| :--- | :--- | :---: | :---: |
| Mid | Low | 71 | 35.0% |
| Mid | High | 59 | 29.1% |
| High | Mid | 51 | 26.0% |
| Low | Mid | 48 | 23.9% |
| Low | High | 31 | 15.4% |
| High | Low | 27 | 13.8% |

### Per-Class Accuracy

| Class | Accuracy |
| :--- | :---: |
| High | 0.602 |
| Low | 0.607 |
| Mid | 0.360 |

### Observations

- Mid-tier is typically the hardest class to predict, as it spans the widest range of profiles.
- Low↔Mid confusion is expected: aptitude scores show continuous distributions with no hard boundary.
- High-tier predictions benefit from strong Quant and English scores.

---

## 7. Model Limitations

> [!WARNING]
> **Do not interpret model predictions as personal salary guarantees or career prescriptions.**

1. **Historical dataset**: AMEO 2015 reflects the Indian engineering job market from 2010–2015. Economic and technology sector conditions have changed substantially.
2. **Population scope**: Covers engineering graduates who underwent AMCAT assessment. Results may not generalise to arts, commerce, or other disciplines.
3. **Moderate performance**: Macro-F1 ≈ 0.50 means meaningful uncertainty remains. The model provides probabilistic guidance, not deterministic outcomes.
4. **Causal limitations**: Feature importances describe statistical associations within this dataset. They do not prove that, e.g., improving Quant score causes a salary increase.
5. **Protected attributes excluded**: Gender and date-of-birth were excluded from model inputs for fairness. The model cannot and should not be used to predict outcomes by demographic group.

---

## 8. Disclaimer for CareerPilot UI

```
CareerPilot AI uses a machine learning model trained on the AMEO 2015
dataset (Aspiring Minds, CC BY 4.0). Predictions reflect statistical
patterns in historical employment data from Indian engineering graduates
(2010–2015) and are intended as educational guidance only.

They do not predict or guarantee your future salary, career success,
or employment outcome. Individual results will vary based on many factors
not captured in this model.
```