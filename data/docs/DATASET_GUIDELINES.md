# Dataset Evaluation & Vetting Guidelines

**Project:** CareerPilot AI  
**Scope:** Dataset Acquisition, Quality Assessment & Acceptance Protocol  
**Phase:** Phase 1 (Foundation & Dataset Discovery)

---

## 1. Objective and Problem Alignment

CareerPilot AI is built upon a **genuine supervised machine learning classifier** that predicts suitable career paths or job role categories from structured student/candidate characteristics.

Before any dataset is accepted into `data/raw/` or used to train models, it must undergo strict empirical verification using `scripts/inspect_dataset.py` and meet the criteria outlined in this document.

> **Zero Tolerance Rule**: We do not synthesize rows, fabricate fake student data, or download arbitrary datasets simply because they contain the word "career". If a candidate dataset does not represent a valid mapping from student characteristics to career categories, it must be rejected.

---

## 2. Core Acceptance Criteria

### 2.1 Source Credibility & Provenance
- The dataset must originate from a verified, reputable source:
  - Recognized academic/research institutions or educational repositories (e.g., UCI Machine Learning Repository, Zenodo).
  - Legitimate public research surveys (e.g., student graduate destination surveys, government education portals).
  - Peer-reviewed research studies on educational data mining or career guidance.
  - Vetted, documented open-data portals.
- The original collection methodology must be documented (e.g., who was surveyed, sampling timeframe, geography, collection instruments).

### 2.2 Licensing & Usage Rights
- The dataset must be licensed under a permissive, open, or academic/research license (e.g., Creative Commons CC-BY, CC0, MIT, or Open Data Commons).
- It must not violate privacy, proprietary corporate confidentiality, or terms of service of the originating platform.

### 2.3 Target Variable Quality
- **Task Type**: Multi-class categorical target representing distinct career categories or job roles (e.g., *Data Scientist, Web Developer, Systems Analyst, Cyber Security Specialist*).
- **Target Integrity**:
  - The target must not be continuous numbers forced arbitrarily into buckets without semantic justification.
  - Target classes must represent distinct, professional career trajectories, not trivial administrative codes or uninterpretable numeric IDs.
  - Number of target classes should ideally range between **4 and 20** to permit meaningful classification and top-$k$ ranking.
  - Each target class must have sufficient support (minimum 30–50 samples per class) to allow stratified train/validation/test splits.

### 2.4 Feature Relevance & Domain Validity
Input features must reflect realistic attributes of a student or early-career profile:
- **Educational background**: Degree level, branch/major, academic performance indicators.
- **Technical & Domain Skills**: Languages, frameworks, databases, tools, or domain-specific ratings.
- **Competency / Proficiency**: Self-assessed or objectively assessed skill ratings (e.g., Likert scale 1–5 or binary possession).
- **Interests & Aptitudes**: Problem-solving styles, workplace preferences, subject interests.
- **Experience / Projects / Certifications**: Project counts, internship experience, certifications.

Datasets whose features are unrelated to education/skills (e.g., arbitrary salary brackets, HR attrition logs like IBM HR dataset) must be rejected because they solve employee churn or compensation prediction, not student career guidance.

### 2.5 Sample Size & Statistical Power
- **Minimum Threshold**: At least **1,000 to 10,000+ records** are preferred.
- Very small datasets (<300 rows) lack statistical power for multi-class classification and high-dimensional feature encoding, causing severe overfitting and unstable cross-validation scores.

### 2.6 Class Imbalance & Representation
- The dataset must be checked for extreme class imbalance.
- If the majority-to-minority class ratio exceeds **10:1**, resampling strategies, class weighting (`class_weight='balanced'`), or category grouping must be planned before model fitting.
- Macro F1-score must be used as the primary metric to ensure minority classes are not masked by high overall accuracy.

### 2.7 Missing Data Tolerances
- Total row missingness exceeding **40% across key predictive features** makes reliable imputation risky.
- Columns with >50% missing values should be considered for removal unless the missingness itself conveys a legitimate signal (e.g., absence of a specific certification).
- All imputation strategies must be learned **strictly on the training split**.

### 2.8 Duplicates & Data Contamination
- All exact duplicate records must be audited.
- Duplicates stemming from synthetic oversampling (e.g., existing SMOTE pre-applied to the dataset by an external author) must be **identified and rejected** because pre-oversampled datasets create severe data leakage across train/test splits.

### 2.9 Target Leakage & Tautology (Zero Tolerance)
A feature suffers from target leakage if it contains information that directly reveals the label or would not be available at the time of student inference:
- **Examples of Leakage**:
  - Columns such as `job_code`, `target_role_id`, `assigned_department`.
  - Post-hire performance metrics (e.g., `current_job_salary`, `years_in_current_role`).
  - Perfect 1-to-1 deterministic predictors that trivialise classification.
- Any feature exhibiting near-perfect correlation ($r > 0.98$) with the target must be thoroughly investigated and dropped if found to be leaky.

### 2.10 High-Cardinality & Free-Text Columns
- Categorical features with hundreds of unique unstructured values (e.g., free-text college names, arbitrary city names) must not be one-hot encoded blindly.
- If free-text columns are present (e.g., resume summaries), evaluate whether natural language processing / embeddings are required or whether structured features are sufficient. Structured tabular features are preferred for the scikit-learn ML core.

### 2.11 Reproducibility & Integrity
- Raw data stored in `data/raw/` must remain **immutable**.
- The raw dataset file must have a documented SHA-256 checksum recorded in `data/docs/` prior to any preprocessing.
- Preprocessing scripts must convert raw files to `data/processed/` deterministically with fixed random seeds.

### 2.12 Ethical & Fairness Considerations
- The dataset must not include protected demographic attributes (e.g., gender, race, caste, religion, socioeconomic proxies) as predictive features for career allocation.
- The model must recommend careers based on **skills, capabilities, and interests**, not perpetuate historical hiring biases.
- Recommendations must be framed as supportive guidance, not deterministic career decrees.

---

## 3. Dataset Audit Workflow

Every candidate dataset must follow this mandatory pipeline before Phase 2 acceptance:

```text
[1. Candidate Download to data/raw/]
             │
             ▼
[2. Execute scripts/inspect_dataset.py]
             │
             ▼
[3. Generate Inspection Report]
             │
             ▼
[4. Evaluate Against Guidelines Criteria]
             │
    ┌────────┴────────┐
    ▼                 ▼
[Rejected]        [Accepted]
(Log reasons)     (Create data/docs/<dataset_name>_AUDIT.md)
                  (Freeze SHA-256 Checksum)
                  (Proceed to Phase 2 Pipeline)
```

---

## 4. Inspection Report Template

When a candidate dataset is vetted, a report file (`data/docs/<dataset_name>_AUDIT.md`) must be logged with the following fields:

1. **Source & URL**: Where the data was obtained.
2. **License**: Explicit license type.
3. **Dimensions**: Total rows and columns.
4. **Target Column**: Name, description, number of classes, class distribution table.
5. **Key Predictive Features**: Education, skills, proficiencies, interests.
6. **Data Quality Warnings**: Missing values %, duplicate rows, high-cardinality flags.
7. **Leakage Audit**: Confirmation that post-hire or target-derived columns are absent.
8. **Final Decision**: Accepted / Rejected (with technical rationale).
