# Empirical Forensic Audit: Candidate 1 Dataset

**Dataset Title:** Student Career Prediction using RIASEC Dataset (`career_data.csv`)  
**Investigated For:** CareerPilot AI — Phase 1.5 Dataset Discovery & Vetting  
**Audit Date:** 2026-10-03  
**Auditor:** Antigravity IDE (Lead Software Architect & ML Engineer)

---

## 1. Dataset Identity & Metadata

- **Dataset Title:** Student Career Prediction using RIASEC Dataset
- **Author / Uploader:** S. Venkatesh Kumar
- **Platform / Source URL:** `https://www.kaggle.com/datasets/svenkateshkumar/student-career-prediction-using-riasec-dataset`
- **File Name in Repository:** `data/raw/career_data_riasec.csv`
- **File Size:** 86,764 bytes (84.73 KB)
- **SHA-256 Hash:** `65c212baee1880e5af9107d8aa98534b38d6a35472a83462c82bf371107396d0`

---

## 2. Source & Provenance Forensics

- **Origin Analysis:** Published on Kaggle as a standalone CSV for educational data mining and Explainable AI (XAI) experiments.
- **Survey / Collection Documentation:** No original survey instrument, questionnaire questions, IRB approval, sampling frame, or participating educational institutions are documented.
- **Provenance Status:** **Provenance Unverified**. There is no documented empirical study showing how 2,400 students across 6 distinct careers were administered tests or verified in post-graduation employment.

---

## 3. Dimensions & High-Level Summary

- **Total Rows:** 2,400
- **Total Columns:** 12 (11 numerical features + 1 categorical target)
- **Total Missing Values:** 0 across all 2,400 rows (0.00%)
- **Total Exact Duplicate Rows:** 0 (0.00%)

---

## 4. Full Feature Inventory

| # | Column Name | Type | Min | Max | Mean | Std | Description & Semantic Role |
|---|---|---|---|---|---|---|---|
| 1 | `Math_Score` | int64 | 60 | 97 | 79.66 | 9.69 | Academic mathematics test score (0–100 scale). |
| 2 | `Science_Score` | int64 | 60 | 97 | 79.19 | 10.24 | Academic science test score (0–100 scale). |
| 3 | `Programming_Skill` | int64 | 2 | 5 | 3.22 | 0.95 | Assessed programming proficiency (Likert scale 2–5). |
| 4 | `Communication_Skill` | int64 | 2 | 5 | 3.51 | 1.02 | Assessed communication proficiency (Likert scale 2–5). |
| 5 | `Logical_Ability` | int64 | 2 | 5 | 3.73 | 1.03 | Assessed logical reasoning ability (Likert scale 2–5). |
| 6 | `R_score` | int64 | 0 | 8 | 3.03 | 1.88 | Realistic personality dimension score (Holland code). |
| 7 | `I_score` | int64 | 0 | 10 | 5.01 | 2.85 | Investigative personality dimension score (Holland code). |
| 8 | `A_score` | int64 | 0 | 8 | 3.15 | 1.89 | Artistic personality dimension score (Holland code). |
| 9 | `S_score` | int64 | 0 | 10 | 4.14 | 2.72 | Social personality dimension score (Holland code). |
| 10 | `E_score` | int64 | 0 | 10 | 3.43 | 2.49 | Enterprising personality dimension score (Holland code). |
| 11 | `C_score` | int64 | 0 | 10 | 4.75 | 2.65 | Conventional personality dimension score (Holland code). |
| 12 | `Career` | object | — | — | — | — | Target variable: 6 career classes. |

---

## 5. Target Analysis: "Career"

- **Number of Target Classes:** 6
- **Class Balance:** Perfectly balanced. Every class has exactly 400 rows ($400 \times 6 = 2,400$):
  - `Entrepreneur`: 400 (16.67%)
  - `Accountant`: 400 (16.67%)
  - `Teacher`: 400 (16.67%)
  - `Software Engineer`: 400 (16.67%)
  - `Doctor`: 400 (16.67%)
  - `Data Scientist`: 400 (16.67%)
- **Imbalance Ratio:** 1.00 : 1.00.
- **Target Semantics:** The target represents career archetype labels rather than observed employment destinations or student self-choices.

---

## 6. RIASEC Validity & Feature Analysis

Holland’s RIASEC model posits that career interests fall into six spheres: Realistic, Investigative, Artistic, Social, Enterprising, and Conventional.

In this dataset, the six dimensions are represented as discrete integer scores from 0 to 10. However, forensic analysis of the per-class feature profiles reveals that the RIASEC values were not collected from genuine psychometric inventories:
- For `Entrepreneur`, $E$ is constrained to $[6, 10]$ while $I, S, C$ are capped at $[0, 5]$.
- For `Teacher`, $S$ is constrained to $[6, 10]$ while $I, E, C$ are capped at $[0, 5]$.
- For `Accountant`, $C$ is constrained to $[6, 10]$ while $I, E, S$ are capped at $[0, 5]$.
- For `Data Scientist`, $I$ is constrained to $[6, 10]$, $C$ is in $[5, 9]$, and $E, S$ are capped at $[0, 5]$.

In genuine human psychometric testing, traits exist along a continuous, correlated spectrum (e.g. students frequently exhibit multi-letter Holland codes such as SIA, ECI, or RIE). Real human responses do not exhibit artificial hard ceilings (e.g. exactly 0–5 for non-target traits and exactly 6–10 for target traits).

---

## 7. Synthetic Data Investigation (Critical Finding)

Our empirical investigation reveals that **this dataset was generated through parameterized rule-based simulation**:

### Evidence 1: Hard Boundary Constraints per Class
Examining feature minimums and maximums grouped by `Career` shows non-overlapping, artificial bounds:

| Career | Defining Feature Rules | Off-Target Feature Bounds |
| :--- | :--- | :--- |
| **Entrepreneur** | `E_score`: min 6, max 10 | `I_score`, `S_score`, `C_score`: max 5 |
| **Accountant** | `C_score`: min 6, max 10; `Math_Score`: min 75 | `I_score`, `E_score`, `S_score`: max 5 |
| **Teacher** | `S_score`: min 6, max 10 | `I_score`, `E_score`, `C_score`: max 5 |
| **Doctor** | `Science_Score`: min 80, max 97; `I_score`, `S_score`: min 5 | `E_score`, `C_score`: max 5 |
| **Data Scientist** | `I_score`: min 6, max 10; `Math_Score`: min 75 | `E_score`, `S_score`: max 5 |
| **Software Engineer** | `Programming_Skill`: min 4, max 5; `I_score`: min 5 | `E_score`, `S_score`: max 5 |

### Evidence 2: Exactly Equal Class Sizes
Real survey data never produces exactly 400 respondents across 6 diverse occupational categories without artificial quota sampling. A perfectly uniform $N=400$ across all 6 classes is a hallmark of programmatic generation loops (`for career in careers: generate_400_rows()`).

---

## 8. Predictive Signal Sanity Check

We conducted a diagnostic sanity check to test model predictability:

- **Majority-Class Baseline (Chance):** **16.67%** accuracy ($1/6$).
- **Logistic Regression (no tuning):** **96.04%** accuracy (Macro F1: **0.960**).
- **Decision Tree (depth=4):** **91.88%** accuracy.

### Diagnostic Analysis
The models achieve near-perfect classification because the target is a **direct circular mapping** from the hard-bounded feature intervals. The only slight confusion occurs between `Data Scientist` and `Software Engineer` (both require high `I_score` and high `Logical_Ability`), which is resolved by `Programming_Skill` (set to 4–5 for Software Engineers).

---

## 9. Leakage & Circular Prediction Analysis

| Feature | Suspicious? | Reason | Recommended Action |
| :--- | :--- | :--- | :--- |
| `E_score` | Yes (Circular) | Artificially elevated exclusively for Entrepreneur; hard capped $\le 5$ for others. | Circular predictor. |
| `S_score` | Yes (Circular) | Artificially elevated exclusively for Teacher and Doctor. | Circular predictor. |
| `C_score` | Yes (Circular) | Artificially elevated exclusively for Accountant and Data Scientist. | Circular predictor. |
| `Science_Score` | Yes (Circular) | Exclusively bounded $[80, 97]$ for Doctor; $[60, 94]$ for all others. | Circular predictor. |
| `Programming_Skill` | Yes (Circular) | Exclusively set to 4–5 for Software Engineer; $\le 3$ for all others. | Circular predictor. |

### Circularity Assessment
The target `Career` was generated from the features using deterministic rule intervals. Training an ML model on this dataset is essentially **re-learning the author's programmatic rules**, not discovering empirical patterns from real student trajectories.

---

## 10. Student-Input Feasibility Breakdown

| Feasibility Category | Features |
| :--- | :--- |
| **A. Directly Obtainable** | `Math_Score`, `Science_Score` (from high school transcript). |
| **B. Obtainable through Assessment** | `Programming_Skill`, `Communication_Skill`, `Logical_Ability` (via standardized test); `R`, `I`, `A`, `S`, `E`, `C` scores (via RIASEC questionnaire). |
| **C. Requires External Verification** | None. |
| **D. Unsuitable / Irrelevant** | None (all 11 features are academically and ethically appropriate). |
| **E. Potential Leakage / Circularity** | The combination of bounded RIASEC scores and domain marks acts as a deterministic formula. |

---

## 11. Ethical & Practical Considerations

Unlike Candidate 2, Candidate 1 contains **zero offensive, intrusive, or irrelevant personal features**:
- No relationship questions.
- No behavioral/attitude judgments ("gentle vs tough").
- All features are legitimate educational and psychological dimensions.

---

## 12. O*NET Integration Implications

If Candidate 1 were adopted, mapping to O*NET would look like:
1. `Data Scientist` $\rightarrow$ O*NET SOC 15-2051.00
2. `Software Engineer` $\rightarrow$ O*NET SOC 15-1252.00
3. `Accountant` $\rightarrow$ O*NET SOC 13-2011.00
4. `Doctor` $\rightarrow$ O*NET SOC 29-1216.00
5. `Teacher` $\rightarrow$ O*NET SOC 25-2031.00
6. `Entrepreneur` $\rightarrow$ O*NET SOC 11-1021.00 (General and Operations Managers)

However, predicting only 6 broad societal roles (Doctor, Teacher, Accountant, etc.) significantly limits CareerPilot AI's purpose as a modern tech/engineering career advisor.

---

## 13. Critical Decision & Final Audit Conclusion

In accordance with Section 14 of the project guidelines:
> *"Candidate 1 must be rejected if: it is demonstrably synthetic/random; the target is derived directly from the input features in a circular way; provenance is too weak to defend academically."*

While Candidate 1 has clean, ethically sound features, it is **demonstrably a rule-synthesized dataset** with circular target definitions. Training a supervised ML classifier on it means learning an inverted heuristic formula rather than genuine statistical patterns.

```text
STATUS: FAIL — DO NOT USE
```

### Technical Summary
Candidate 1 (`career_data_riasec.csv`) is rejected because the 2,400 records were generated via a programmatic rule recipe (400 per class with hard feature bounding), creating a circular prediction problem where features deterministically dictate the label.