# CareerPilot AI — Datasets and Data Sources

**Version:** 3.0.0  
**Verified:** 2026-10-03  

---

## 1. AMEO 2015 — Machine Learning Training Dataset

### 1.1 Dataset Identity

| Property | Value |
|---|---|
| **Full Name** | Aspiring Minds Employment Outcomes 2015 (AMEO 2015) |
| **Publisher** | Aspiring Minds (now Wheebox) |
| **Repository** | Zenodo |
| **DOI** | `10.5281/zenodo.45735` |
| **URL** | https://zenodo.org/record/45735 |
| **License** | Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (**CC BY-NC-SA 4.0**) |
| **File SHA-256** | `113f730100901dd24e550ffa33ee0b599e99d1f48bde1ae7f1041c903ad17d4b` |
| **Local path** | `data/raw/ameo_2015.csv` |

### 1.2 Dataset Contents

| Property | Value |
|---|---|
| **Total records** | 3,998 engineering graduates |
| **Population** | Indian engineering graduates surveyed 2010–2015 |
| **Academic data** | 10th/12th percentages, college GPA, college tier, degree, specialisation |
| **Aptitude data** | AMCAT standardised test scores: English, Logical, Quantitative, Computer Programming |
| **Personality data** | Big Five OCEAN personality trait scores (z-score standardised) |
| **Employment data** | First-year annual salary (INR), job city, designation, employer domain |
| **Target column used** | `Salary` → derived into `SalaryTier` (Low / Mid / High tertiles) |

### 1.3 Purpose in CareerPilot AI

The AMEO 2015 dataset is used exclusively to train the supervised ML classifier (`final_model.joblib`). It is used for:

1. Constructing the `SalaryTier` classification target (tertile split on training set)
2. Training and cross-validating the scikit-learn Logistic Regression pipeline
3. Computing permutation feature importances on the held-out test set

The dataset is **not** used as live data, reference data, or to populate the UI. The trained model serialised to `final_model.joblib` is the only runtime artefact derived from AMEO 2015.

### 1.4 Important Limitations

> These limitations are documented in model_metadata.json and displayed in the CareerPilot UI.

1. **Historical scope**: Data covers 2010–2015 first-year employment outcomes. The dataset does not reflect post-2015 market conditions, remote work trends, or current technology demands.
2. **Population specificity**: Covers Indian engineering graduates. Predictions should not be generalised to other educational systems, countries, or disciplines.
3. **Salary thresholds are historical**: The tier boundaries (₹2.10 LPA, ₹3.35 LPA) reflect 2015 salary distributions — not current Indian salary benchmarks.
4. **Moderate model accuracy**: Macro-F1 ≈ 0.52 on the holdout test set. Predictions are probabilistic guidance, not deterministic outcomes.
5. **Missing features**: The dataset does not capture extracurricular activities, internships, communication skills, or soft skills beyond the OCEAN personality traits.
6. **Causal claims are not supported**: Feature importance scores are statistical associations only.

### 1.5 License Compliance

CareerPilot AI uses the AMEO 2015 dataset exclusively for **non-commercial, educational research purposes** consistent with CC BY-NC-SA 4.0:

- The dataset is not redistributed.
- The raw `data/raw/ameo_2015.csv` file is excluded from version control (`.gitignore`).
- Only the trained model artefact (`final_model.joblib`) is committed — not raw data.
- Full attribution is present in `README.md`, this document, and the application's About page.

---

## 2. O*NET 28.0 — Occupational Knowledge Base

### 2.1 Dataset Identity

| Property | Value |
|---|---|
| **Full Name** | O*NET Database, Release 28.0 |
| **Publisher** | National Center for O*NET Development, on behalf of U.S. Department of Labor, Employment and Training Administration (USDOL/ETA) |
| **Primary URL** | https://www.onetonline.org |
| **Resource Centre** | https://www.onetcenter.org |
| **Taxonomy Framework** | 2018 Standard Occupational Classification (SOC) / O*NET-SOC 2019 |
| **Database Release** | **O*NET 28.0** |
| **License** | Creative Commons Attribution 4.0 International (**CC BY 4.0**) |
| **Attribution** | "Occupational information provided by O*NET OnLine (onetonline.org), developed by the National Center for O*NET Development under the US Department of Labor. Licensed CC BY 4.0." |
| **Retrieval date** | October 2026 |
| **Local path** | `data/onet/occupations.json` |

> **Version verification:** The O*NET database version is documented as 28.0 in `docs/ONET_PROVENANCE.md` and is based on the database release used during the curation process in October 2026. The local dataset is a manually curated snapshot — no live O*NET API calls are made at runtime.

### 2.2 Curated Occupations

CareerPilot AI uses a **curated local subset** of 10 engineering- and technology-relevant occupations. This approach:

- Eliminates runtime network dependencies
- Prevents API downtime from affecting core functionality
- Allows verified, attribution-compliant use of O*NET data

| # | SOC Code | Occupation Title |
|---|---|---|
| 1 | 15-1252.00 | Software Developers |
| 2 | 15-1251.00 | Computer Programmers |
| 3 | 15-1211.00 | Computer Systems Analysts |
| 4 | 15-2051.00 | Data Scientists |
| 5 | 15-1244.00 | Network and Computer Systems Administrators |
| 6 | 15-1231.00 | Computer Network Support Specialists |
| 7 | 15-1299.08 | Business Intelligence Analysts |
| 8 | 17-2061.00 | Computer Hardware Engineers |
| 9 | 13-1161.00 | Market Research Analysts and Marketing Specialists |
| 10 | 13-2011.00 | Accountants and Auditors |

### 2.3 Extracted Fields

For each occupation, the following verified O*NET Content Model fields are stored:

| Field | Source in O*NET Content Model |
|---|---|
| `soc_code` | Standard 8-character SOC 2018 identifier |
| `title` | Official O*NET occupational title (verbatim) |
| `description` | Exact O*NET OnLine occupational summary statement |
| `skills` | Core transferable skills (e.g., Programming, Systems Analysis) |
| `knowledge_areas` | Major instructional domains (e.g., Computers and Electronics) |
| `tech_skills` | Technology skills and Hot Technologies from O*NET |
| `tasks` | Representative generalised work activities |
| `related_soc_codes` | Cross-referenced SOC codes from O*NET "Related Occupations" |

### 2.4 How O*NET Data is Used

- **Agent 1 (Career Analysis)**: All 10 occupations are provided as context. Agents suggest only from this verified list.
- **Agent 2 (Skill Gap)**: The selected occupation's `skills`, `knowledge_areas`, and `tech_skills` form the reference set for gap identification.
- **Agent 4 (Projects)**: The selected occupation's `tech_skills` inform project technology suggestions.
- **Career Exploration UI**: All 10 occupations are displayed with their O*NET descriptions and skill sets.
- **Attribution**: O*NET CC BY 4.0 attribution is included in all API responses and the UI footer.

### 2.5 Integrity Guarantees

From `docs/ONET_PROVENANCE.md`:
- Descriptions are verbatim O*NET occupational summary statements — not AI-generated.
- Skill labels are taken directly from O*NET skill lists.
- No O*NET content is embellished, merged, or generated by AI.
- Every skill gap identified by Agent 2 originates from verified O*NET skill lists.

---

## 3. Source Attribution Summary

| Source | Used For | License | Attribution Required |
|---|---|---|---|
| AMEO 2015 (Zenodo DOI: 10.5281/zenodo.45735) | ML model training | CC BY-NC-SA 4.0 | Yes — in README, About page, all reports |
| O*NET 28.0 (USDOL/ETA) | Occupational knowledge base | CC BY 4.0 | Yes — in API responses, UI footer, this document |
| scikit-learn, FastAPI, Next.js, React | Application framework | BSD/MIT (open source) | As per respective licenses |
| Google Gemini API | Optional AI guidance layer | Google Terms of Service | Not redistributed |
