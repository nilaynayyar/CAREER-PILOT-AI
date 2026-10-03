# CareerPilot AI — Limitations

**Version:** 3.0.0  
**Principle:** Complete honesty about what the system can and cannot do.

---

> This document is a complete, unvarnished register of limitations. Limitations are not bugs — they are inherent to the data, model, and design choices made. Acknowledging them is a sign of scientific integrity.

---

## 1. Machine Learning Model Limitations

### 1.1 Historical Data Only

The ML model is trained on the **AMEO 2015 dataset** — a survey of Indian engineering graduates employed between 2010 and 2015. The world has changed significantly:

- The technology sector has fundamentally expanded (cloud computing, AI/ML, mobile development).
- Remote work has altered salary geography.
- Salary levels across all tiers have risen substantially since 2015.
- New domains (data science, cybersecurity, DevOps) were nascent or absent in the dataset.

**Implication:** A student receiving a "Low" tier prediction today might be predicted differently if trained on 2024 data. The prediction reflects patterns from a decade-old dataset.

### 1.2 Population Scope

AMEO 2015 covers **Indian engineering graduates**. The model:

- Has not been validated on students from other countries or educational systems.
- Does not cover non-engineering disciplines (commerce, arts, medicine, law).
- May not generalise to students from educational contexts very different from the AMEO population.

### 1.3 Moderate Performance

- **Holdout Macro-F1: 0.5177** — significantly better than random (baseline: 0.33) but far from high precision.
- The Mid tier has F1 = 0.389 — the model most frequently confuses Mid with Low (71 cases out of 203).
- Approximately 47.8% of test set predictions are incorrect.
- Predictions should be treated as probabilistic signals, not deterministic outcomes.

### 1.4 Historical Salary Thresholds

The salary tier boundaries (≤ ₹2.10 LPA = Low, ₹2.10–₹3.35 LPA = Mid, > ₹3.35 LPA = High) are **derived from 2015 employment data**. These thresholds:

- Are significantly below current Indian engineering salary norms.
- Should **not** be interpreted as current salary benchmarks or targets.
- Exist purely as data-derived boundaries for the classification task.

### 1.5 Association ≠ Causation

Feature importance scores show which features were **statistically associated** with salary tier in the training data. They do not prove:

- That improving a specific score will cause higher salary outcomes.
- That any feature is the direct cause of employment success.
- Any causal mechanism between education and salary.

### 1.6 No Individual Prediction Guarantee

A "High" tier prediction does not guarantee high salary. A "Low" tier prediction does not mean the student will earn low salary. Every individual prediction carries uncertainty reflected in the predicted class probabilities.

---

## 2. Career Exploration Limitations

### 2.1 O*NET is Occupational Knowledge, Not Personal Destiny

O*NET describes what skills and knowledge are **generally required** by an occupation category. It does not:

- Know the student personally.
- Assess the student's actual skill level.
- Guarantee that the student is a good fit for any occupation.
- Predict whether the student will enjoy or excel in any career.

Suggestions are **starting points for exploration**, not prescriptions.

### 2.2 O*NET is U.S.-Centric

O*NET is published by the U.S. Department of Labor. While the skill frameworks are broadly applicable, specific job market conditions, salary ranges, and role definitions may differ significantly in India or other countries.

### 2.3 Only 10 Occupations Available

The local O*NET dataset covers only 10 engineering- and technology-relevant occupations. Students with interests outside these occupational categories (e.g., entrepreneurship, academia, government service, healthcare IT) will not see appropriate occupational matches. This is a deliberate scope limitation, not a claimed comprehensive career database.

---

## 3. Agentic AI Limitations

### 3.1 Gemini May Be Unavailable

When `GEMINI_API_KEY` is not configured or Gemini's API is unavailable:

- All four agents run in deterministic fallback mode.
- Fallback guidance is grounded in O*NET data and profile fields.
- Fallback guidance is less personalised and less contextually rich than Gemini-generated output.

### 3.2 Fallback is Less Generative

The deterministic fallback agents produce:

- Fixed 4-phase roadmap structure (Foundation → Core Skills → Applied Practice → Interview Readiness).
- 3 standard project recommendations (Portfolio Website, Data Analysis Project, Domain Application).
- Occupation suggestions based on engineering specialisation alone, without aptitude weighting.

This is functional and accurate, but less tailored than Gemini-powered guidance.

### 3.3 Gemini Hallucination Risk

When Gemini is available, the prompts contain explicit guardrails against hallucination:

- Agents must suggest only SOC codes from the provided O*NET list.
- Agents must not invent skill levels not present in the profile.
- Agents must not generate specific course URLs.

Despite these guardrails, Gemini may occasionally generate responses that pass schema validation but contain inaccurate contextual statements. The Pydantic validation catches structural errors, but it cannot verify the factual accuracy of every generated sentence.

### 3.4 No Specific Course or Resource Links

The system intentionally does not generate URLs to specific online courses, certifications, or learning platforms. Reasons:

- URLs may become dead links.
- Many platforms require payment.
- The system cannot verify that a specific course is still available.

Students must independently find learning resources using the skill names and activity descriptions provided.

---

## 4. System and Deployment Limitations

### 4.1 Local Development Only

CareerPilot AI is configured for local development:

- Backend runs on `http://127.0.0.1:8000`.
- Frontend runs on `http://localhost:3000`.
- No production deployment infrastructure (load balancers, HTTPS, CDN) is currently configured.
- No database — all session data is in browser memory only and is lost on page refresh.

### 4.2 No User Authentication

There is no user account, login, password, or session management. A student cannot save their profile, revisit results, or track progress over time. Each browser session is stateless.

### 4.3 No Live Labour-Market Data

CareerPilot AI does not integrate live job postings, salary surveys, or real-time employment statistics. All occupational information is static (O*NET 28.0 curated snapshot). The system cannot tell a student how many job openings currently exist for a given occupation.

### 4.4 No Validation of Student-Provided Data

The system validates that inputs are within legal ranges (e.g., AMCAT scores 200–900) but cannot verify:

- Whether the student's academic scores are accurately reported.
- Whether AMCAT scores have been inflated.
- Whether the student's degree and specialisation are correctly classified.

---

## 5. Ethical and Fairness Limitations

### 5.1 Protected Attributes Excluded

Gender and date of birth are excluded from model inputs as protected attributes. However:

- The historical dataset itself may contain biases in employment outcomes by gender, age, or institution.
- Excluding a feature from model input does not remove historical bias from the dataset.
- The model may produce systematically different predictions for different groups through correlated features (e.g., college tier may proxy for socioeconomic background).

### 5.2 No Fairness Audit

The model has not undergone a formal intersectional fairness audit across protected demographic groups. A production deployment would require such an audit.

### 5.3 Not a Substitute for Professional Advice

CareerPilot AI is an educational research project, not a licensed career counselling service. Students making significant career decisions should supplement CareerPilot insights with:

- Professional career counsellors.
- Faculty advisors with domain expertise.
- Real industry contacts and informational interviews.
- Current job market research.

---

## 6. Summary Table

| Limitation | Severity | Mitigation in System |
|---|---|---|
| Historical data (2015) | High | Explicit disclaimers in UI and API |
| Moderate model accuracy (~52%) | High | Probabilities shown; uncertainty communicated |
| Outdated salary thresholds | High | Labeled as historical, not current benchmarks |
| U.S.-centric O*NET | Medium | Noted in UI; skills are broadly transferable |
| Only 10 occupations | Medium | Explicitly a curated scope, not comprehensive |
| Gemini fallback less rich | Medium | Always disclosed in API response and UI |
| No live job market data | Medium | Stated clearly; O*NET is knowledge, not jobs |
| No PII collection | Low (positive) | Privacy by design |
| Association ≠ causation | High | Explicit in all feature importance displays |
| No fairness audit | Medium | Stated; future work recommendation |
