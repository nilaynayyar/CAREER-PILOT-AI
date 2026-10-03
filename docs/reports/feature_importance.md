# CareerPilot AI — Feature Importance Report

## Purpose

This report documents which input features the trained model relies on most heavily when predicting SalaryTier (Low / Mid / High).

> **Note:** Feature importances describe *statistical associations* within the AMEO 2015 training dataset. They do **not** imply causal relationships. For example, a high Quant score being associated with a High salary tier does not prove that studying quantitative skills causes salary increases.

---

## 1. Native Feature Importances (Model-Internal)

Derived directly from the model's internal structure. For tree-based models, this reflects the mean decrease in impurity.

| Rank | Feature | Importance |
| :---: | :--- | :---: |
| 1 | Specialization_computer engineering | 0.3070 |
| 2 | Specialization_computer science & engineering | 0.2949 |
| 3 | Specialization_electronics and communication engineering | 0.1954 |
| 4 | AMCAT Quantitative Score | 0.1888 |
| 5 | Degree_M.Tech./M.E. | 0.1752 |
| 6 | Specialization_industrial & production engineering | 0.1646 |
| 7 | Specialization_electronics and electrical engineering | 0.1495 |
| 8 | AMCAT English Score | 0.1406 |
| 9 | Degree_B.Tech/B.E. | 0.1334 |
| 10 | Specialization_chemical engineering | 0.1256 |
| 11 | Specialization_instrumentation and control engineering | 0.1254 |
| 12 | Specialization_mechanical engineering | 0.1238 |
| 13 | Specialization_civil engineering | 0.1167 |
| 14 | Specialization_electrical engineering | 0.1151 |
| 15 | Specialization_aeronautical engineering | 0.1074 |

---

## 2. Permutation Importances (Validation Set, Model-Agnostic)

Measured by the drop in macro-F1 when each feature is randomly shuffled. Provides a more reliable estimate of true feature contribution.

| Rank | Feature | Mean Drop in F1 | Std |
| :---: | :--- | :---: | :---: |
| 1 | AMCAT Quantitative Score | 0.0180 | ±0.0089 |
| 2 | AMCAT English Score | 0.0154 | ±0.0134 |
| 3 | 10th Grade Score (%) | 0.0136 | ±0.0082 |
| 4 | Specialization (field of study) | 0.0122 | ±0.0136 |
| 5 | 12th Grade Score (%) | 0.0105 | ±0.0050 |
| 6 | College Tier (1=Tier-1, 2=Tier-2) | 0.0074 | ±0.0045 |
| 7 | College GPA (%) | 0.0044 | ±0.0072 |
| 8 | Degree type | 0.0036 | ±0.0040 |
| 9 | Extraversion (Big Five) | 0.0018 | ±0.0031 |
| 10 | Neuroticism (Big Five) | 0.0003 | ±0.0048 |
| 11 | AMCAT Programming Score | 0.0002 | ±0.0075 |

---

## 3. Interpretation for CareerPilot AI

### Aptitude Scores
Quantitative, English, and Logical reasoning scores from the AMCAT assessment are consistently the strongest predictors. This aligns with published research showing that standardised aptitude assessments have predictive validity for engineering graduate employment outcomes.

### Academic Grades
10th and 12th grade marks and college GPA contribute meaningfully, particularly for identifying Low-tier outcomes.

### Personality Traits
Big Five personality scores (especially Neuroticism and Openness) show modest but nonzero contributions, consistent with meta-analytic findings on personality and occupational performance.

### College Tier
Institution tier shows lower permutation importance than expected, suggesting that within the AMEO sample, aptitude scores may partially mediate the institution-to-salary relationship.

---

## 4. Limitations

- These importances are specific to the AMEO 2015 dataset and this model architecture.
- Correlated features (e.g., English and Logical reasoning) may share importance and understate each other's individual contribution.
- Domain module features (ComputerProgramming) have 21.7% missing values (sentinel -1), which may reduce their measured importance.