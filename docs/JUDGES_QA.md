# CareerPilot AI — Judges' Q&A

**Audience:** IBM project evaluation judges  
**Principle:** All answers are based strictly on the actual implementation.

---

## Q1. What problem are you solving?

Engineering students in India face a significant information gap when preparing for employment. They receive generic career advice, have little visibility into which skills employers actually require for specific occupations, and lack a structured, personalised path to develop those skills.

CareerPilot AI provides three specific things: a data-driven estimate of employment-outcome tier based on the student's academic and aptitude profile, a skills gap analysis grounded in verified O*NET occupational knowledge, and a personalised learning roadmap and project recommendations to address those gaps.

---

## Q2. Why is this an ML project?

The system uses a genuinely trained supervised machine learning classifier — Logistic Regression, implemented in scikit-learn — trained on 3,998 real graduate employment records from the AMEO 2015 dataset. The model was developed through a complete ML pipeline: data cleaning, target construction, stratified train/val/test splits, cross-validation comparison of four candidate classifiers, hyperparameter tuning, held-out evaluation, and permutation feature importance analysis. The trained model is serialised and served in production via a FastAPI backend.

---

## Q3. What exactly does your ML model predict?

The model predicts a **salary tier** — Low, Mid, or High — from the student's academic and aptitude profile. Specifically, it classifies a profile into one of three categories derived from first-year annual salary tertiles in the AMEO 2015 dataset:

- **Low**: ≤ ₹2.10 LPA (historical 2015 data)
- **Mid**: ₹2.10–₹3.35 LPA
- **High**: > ₹3.35 LPA

The model does NOT predict the student's ideal career, personal potential, future salary in current terms, or guaranteed employment outcomes.

---

## Q4. Why did you choose AMEO 2015?

AMEO 2015 is the only publicly available, peer-reviewed, open-licensed dataset (CC BY-NC-SA 4.0) that combines academic profiles, standardised aptitude test scores (AMCAT), Big Five personality data, and first-year employment outcomes for Indian engineering graduates. It has a DOI (`10.5281/zenodo.45735`) and a verifiable file hash (`113f730...`). We audited several alternative datasets and found AMEO 2015 to be the most suitable: real data, non-trivial features, documented provenance, and an appropriate ML task.

---

## Q5. Why did you choose Logistic Regression?

Logistic Regression achieved the highest cross-validation Macro-F1 (0.505 ± 0.011) among four evaluated classifiers — higher than Random Forest (0.488), HistGradientBoosting (0.479), and Decision Tree (0.435). Additionally:

- It produces direct predicted class probability estimates through training with cross-entropy loss.
- Its coefficients are interpretable.
- Permutation importance analysis can be applied reliably.
- It is computationally efficient (0.72 seconds CV time vs 8.4 seconds for gradient boosting).
- It has lower variance than tree-based ensemble methods on this dataset.

The selection was empirical — not assumed — and the full cross-validation comparison is documented in `docs/PHASE_2_ML_REPORT.md`.

---

## Q6. What other models did you evaluate?

We evaluated four classifiers inside the complete sklearn Pipeline using 5-fold stratified cross-validation:

| Model | CV Macro-F1 |
|---|---|
| Logistic Regression | **0.505 ± 0.011** |
| Random Forest | 0.488 ± 0.022 |
| HistGradientBoosting | 0.479 ± 0.017 |
| Decision Tree | 0.435 ± 0.023 |

We also measured dummy baselines (majority class: 0.168, stratified random: 0.330) to verify the model provides genuine predictive signal.

---

## Q7. How did you prevent data leakage?

Three specific leakage prevention measures are implemented and tested:

1. **Target construction on training set only**: The `SalaryTier` tertile thresholds are computed from the training split — never from validation or test data. The test set is not touched during threshold computation.
2. **Post-employment features excluded**: `Designation`, `JobCity`, `DOJ` (date of joining), `DOL` (date of leaving) — all features that only exist after the employment event — are strictly excluded from model inputs.
3. **The held-out test set is used exactly once**: The 600-sample test set was evaluated only after all hyperparameter decisions were finalised. It was never used to guide tuning decisions.

These constraints are enforced in unit tests (`ml/tests/`) including `test_no_leakage_columns`, `test_disjoint_splits`, and `test_salary_not_in_features`.

---

## Q8. How do you explain the model prediction?

The system uses **permutation feature importance** computed on the held-out test set. For each feature, the system measures how much the model's Macro-F1 drops when that feature's values are randomly permuted. Higher drop = more important feature.

The top 10 features by permutation importance are pre-computed and stored in `docs/reports/permutation_importances.csv`. They are served from the backend and displayed in the ML Outcome and Model Explanation views.

This method is model-agnostic and does not require access to model internals — it measures actual sensitivity to each feature on real test data.

We explicitly document that these are statistical associations, not causal relationships.

---

## Q9. Why doesn't Gemini make the ML prediction?

Gemini is a large language model — it does not produce statistically grounded, reproducible predictions from structured numerical data. Our ML prediction comes from a model empirically trained on real employment data, with verifiable performance metrics (Macro-F1 = 0.52 on 600 holdout samples). Gemini cannot replicate this because it was not trained on AMEO 2015 and cannot produce empirical class probability distributions for this specific task.

The architecture is intentional: ML provides the empirical employment-outcome estimate, O*NET provides verified occupational knowledge, and Gemini provides interpretation and guidance. These are three distinct, non-interchangeable functions.

---

## Q10. What makes this agentic AI?

The agentic AI layer has the following verifiable properties:

1. **Sequential multi-agent pipeline**: Four distinct agents run in a deterministic order, each consuming the previous agent's output (Career Analysis → Skill Gap → Roadmap → Projects).
2. **Structured output contracts**: Every agent must return JSON conforming to a strict Pydantic v2 schema. The system validates and rejects malformed outputs.
3. **Self-correction loop**: If an agent's response fails schema validation, the system generates a correction prompt describing the specific error and retries the agent once.
4. **Graceful degradation**: If both attempts fail, or if Gemini is unavailable, each agent has a deterministic fallback that continues the workflow without failure.
5. **Data-grounded prompts**: Each agent receives verified O*NET occupational data as context, constraining responses to real occupational knowledge.

---

## Q11. What is the role of O*NET?

O*NET (Occupational Information Network, O*NET 28.0, USDOL/ETA) provides the verified occupational knowledge base that grounds the career guidance layer. Specifically:

- The career analysis agent only suggests occupations from the curated O*NET list.
- The skill gap agent compares the student's profile to the O*NET-documented skill and knowledge requirements for the target occupation.
- The project recommendation agent uses O*NET technology skills to suggest relevant project technologies.

Without O*NET, the agents would have no verified reference for what each occupation actually requires. O*NET makes the guidance traceable and factual rather than speculative.

---

## Q12. How do you prevent hallucinations?

Multiple layers of hallucination prevention are implemented:

1. **Constrained occupation lists**: Agents receive only the 10 verified O*NET occupations and must suggest SOC codes from this list — they cannot invent new occupations.
2. **Prohibited behaviours in prompts**: Each agent prompt explicitly prohibits: inventing skill levels not in the profile, generating specific course URLs, making deterministic career claims.
3. **Pydantic schema validation**: All agent outputs are validated against strict schemas. Hallucinated fields, wrong types, or out-of-range values cause validation errors that trigger correction or fallback.
4. **Low temperature**: Gemini is called with temperature=0.3 to reduce creative deviation.
5. **Fallback replacement**: If validation still fails after one correction attempt, the agent is replaced entirely by a deterministic rule-based fallback — hallucinated output never reaches the user.

---

## Q13. What happens if Gemini is unavailable?

If `GEMINI_API_KEY` is not configured or Gemini's API returns an error:

- All four agents automatically run their deterministic fallback implementations.
- Fallback agents use O*NET occupational data and the student's profile fields directly — no external API calls.
- The API response labels the guidance section as `"OFFLINE GUIDANCE (Rule-based deterministic grounding on O*NET data)"`.
- The ML prediction still runs normally — it has no dependency on Gemini.

The system's health endpoint (`/api/v1/health`) reports `"gemini_available": false` so the UI can display appropriate context.

---

## Q14. Are the career recommendations guaranteed?

No. Career recommendations are explicitly labelled as:

- **"Occupations worth exploring"** — not deterministic prescriptions.
- **"AI-generated guidance"** — not authoritative career assessments.
- Accompanied by a disclaimer: "These suggestions are based on patterns in the student's profile and O*NET occupational data. They are starting points for exploration, not deterministic career prescriptions."

The system is designed to expand a student's awareness of options — not to make a binding career decision for them.

---

## Q15. Does the system predict future salary?

No. The system predicts a **salary tier** based on patterns in historical 2015 employment data. This is not a prediction of:

- The student's actual future salary.
- Current market salary rates.
- What any specific employer will offer.

The salary tier thresholds (₹2.10 LPA, ₹3.35 LPA) reflect 2010–2015 Indian engineering salary distributions and are documented as historical data.

---

## Q16. Does it predict the student's ideal career?

No. The ML model predicts an employment-outcome salary tier — not career suitability, career fit, or career destiny. Career exploration is performed separately by the agentic layer using O*NET occupational data. All career suggestions are explicitly labelled as "occupations worth exploring" and accompanied by appropriate disclaimers.

---

## Q17. Why are entrance exams included?

The Entrance Exam section allows students to record exams like JEE Main, GATE, CAT, NEET, etc. for **career context** — to inform the career exploration agents about the student's qualification background. For example, a student who qualified GATE may be interested in PSU or postgraduate opportunities.

Entrance exam data is:
- Used as career context by the agentic layer.
- **Strictly excluded** from the ML feature vector.
- Not part of the 15 AMEO features used by `final_model.joblib`.

This is enforced in the `handleRunPipeline` function in `frontend/src/app/page.tsx` and tested in `test_entrance_exam_boundary` in the frontend test suite.

---

## Q18. Are entrance exams ML features?

No. Entrance exams are not part of the AMEO 2015 dataset and are not included in the ML model's feature vector. The AMEO dataset uses AMCAT standardised test scores (English, Logical, Quantitative, Computer Programming) — not JEE/GATE/CAT scores. Entrance exam data in CareerPilot is strictly for career context, clearly labelled in the UI as "Used as career context — not an ML prediction feature."

---

## Q19. What data do you collect?

CareerPilot AI collects the following data, which exists only in browser memory for the duration of the current session:

- Academic profile: 10th/12th percentages, college GPA, college tier, degree, specialisation.
- Aptitude scores: AMCAT-format scores for English, Logical, Quantitative, Computer Programming.
- Personality traits: Big Five OCEAN z-scores.
- Entrance exam records: exam type, status, year, percentile/score/rank.
- Career preferences: interested domains, work areas, learning style.

**No data is stored to a database or server after the session ends.** No login or account is required.

---

## Q20. Do you collect personally identifiable information?

No. CareerPilot AI does not collect:

- Name
- Email address
- Phone number
- Postal address
- Date of birth
- National ID or student ID
- Location beyond "interested work areas" (a self-selected preference)

The system is privacy by design.

---

## Q21. What are the limitations?

Key limitations (full list in `docs/LIMITATIONS.md`):

1. **Historical data**: AMEO 2015 covers 2010–2015 Indian engineering graduates. The model does not reflect current market conditions.
2. **Moderate accuracy**: Macro-F1 ≈ 0.52. Roughly half of individual predictions are incorrect. Use the predicted probability distribution across tiers to gauge uncertainty.
3. **Salary thresholds are historical**: ₹2.10 LPA / ₹3.35 LPA boundaries are 2015 data — not current salary benchmarks.
4. **10 occupations only**: The curated O*NET subset does not cover all possible careers.
5. **No live market data**: O*NET is a static knowledge base, not a real-time job market feed.
6. **No persistence**: No user accounts; data is lost on browser refresh.
7. **Gemini fallback**: Without a Gemini key, guidance is deterministic but less personalised.

---

## Q22. How could this be improved in the future?

Genuine, implementable improvements:

1. **Retrain on more recent data**: If a more current Indian engineering employment dataset becomes available under an open licence, retraining would significantly improve relevance.
2. **Expand O*NET coverage**: Add more occupations, including non-technical roles, to broaden career exploration.
3. **Real-time market integration**: Integrate with job posting APIs (e.g., LinkedIn API, Indeed) to show current demand for each occupation.
4. **User accounts and progress tracking**: Add a database layer to allow students to save profiles, revisit results, and track skill development over time.
5. **Migrate Gemini SDK**: Update from deprecated `google-generativeai` to `google.genai` package.
6. **Formal fairness audit**: Evaluate model predictions across demographic subgroups and implement fairness constraints if necessary.
7. **Calibration analysis**: Formally measure the calibration of Logistic Regression's probability outputs using reliability diagrams and Expected Calibration Error.

---

## Q23. How could the system be deployed at larger scale?

For a production deployment:

1. **Infrastructure**: Deploy backend on a cloud provider (GCP Cloud Run, AWS Lambda, or Azure Container Apps) with HTTPS.
2. **Database**: Add PostgreSQL (via Supabase or Cloud SQL) for user sessions, saved profiles, and historical analysis tracking.
3. **Authentication**: Implement OAuth2 or SAML for institutional login (college email SSO).
4. **Caching**: Cache ML predictions and O*NET data in Redis to reduce per-request compute.
5. **Scalable Gemini usage**: Implement request queuing and rate-limit handling for multi-user Gemini calls.
6. **Model monitoring**: Track prediction distribution drift over time using statistical process control.

---

## Q24. How could current labour-market data be incorporated in a future version?

Options include:

1. **Job posting APIs**: Integrate LinkedIn Job Search API, Indeed API, or Naukri API to show real-time job counts per occupation in specified cities.
2. **Salary surveys**: Incorporate annually updated salary benchmarks (e.g., AmbitionBox, Glassdoor India API) to replace the historical AMEO thresholds.
3. **NSDC / Government data**: Use National Skills Development Corporation datasets for Indian-specific labour market intelligence.
4. **Industry skill surveys**: Integrate NASSCOM or similar industry body reports to supplement O*NET with India-specific skill demand data.

Each integration would require licensing review and API cost analysis.

---

## Q25. Why should a student actually use this system?

Three specific, honest reasons:

1. **Data-driven context**: A student receives an employment-outcome estimate grounded in patterns from 3,998 real graduate employment records — not generic career advice from a textbook.
2. **Structured skill gap analysis**: The system tells the student specifically which O*NET-documented skills are required for their target occupation and which their profile does not currently evidence — giving them a concrete action agenda rather than vague suggestions.
3. **Free and offline-capable**: The core ML prediction and O*NET-based skill gap analysis run without internet access to external APIs, without accounts, without subscriptions, and without collecting personal information.

A student gets honest, data-grounded career intelligence in under 5 minutes. Nothing else they are likely to encounter does all three things simultaneously for free.
