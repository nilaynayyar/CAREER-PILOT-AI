# CareerPilot AI — Project Overview

**Version:** 3.0.0  
**Status:** Complete — Presentation Ready  
**Date:** October 2026  

---

## 1. Problem Statement

Engineering graduates in India face significant uncertainty when transitioning from college to employment. The typical challenges are:

- **No data-driven career context**: Students receive generic advice not grounded in empirical employment data.
- **Gap between education and industry requirements**: Students often do not know which skills O*NET identifies as core requirements for specific occupations.
- **No actionable skill development path**: Even students who understand their gaps have no structured, personalised roadmap to address them.
- **Inaccessible tools**: Career advisory tools that do exist often rely on paid subscriptions, expensive counsellors, or generic questionnaires.

CareerPilot AI addresses all four problems using freely available, open-source technology and verifiable data sources.

---

## 2. Target Users

**Primary:** Indian engineering students (B.Tech, M.Tech, B.Sc., MCA) preparing for campus placement or early-career transition.

**Secondary:** Academic institutions, career development centres, and faculty advisors supporting students.

---

## 3. Why This Problem Matters

The AMEO 2015 dataset (Aspiring Minds Employment Outcomes) documents a stark disparity: of 3,998 engineering graduates surveyed, approximately one-third fell into each of three salary tiers when entering employment — with many graduates in the low tier despite high academic scores. The patterns learned from this data suggest that aptitude scores (AMCAT), field of specialisation, and academic trajectory all play measurable statistical roles in early-career employment outcomes — yet students rarely receive feedback on these dimensions before placement.

---

## 4. CareerPilot AI Solution

CareerPilot AI is a **career intelligence platform** with three distinct functional layers:

### Layer 1: ML Employment-Outcome Estimation

A supervised machine learning model (Logistic Regression) trained on the AMEO 2015 dataset predicts a **salary tier** (Low / Mid / High) from a student's academic and aptitude profile. This prediction is:

- Based on statistical patterns in historical data (3,998 Indian engineering graduates, 2010–2015).
- Accompanied by predicted class probabilities (Low%, Mid%, High%).
- Explained by permutation feature importance showing which profile dimensions were most associated with salary outcomes in the training data.

**What the ML model does NOT do:** It does not predict the student's ideal career, guarantee future salary, guarantee employment, or determine career suitability.

### Layer 2: Occupational Knowledge (O*NET)

The platform uses a curated local database of 10 engineering- and technology-relevant occupations drawn from the **O*NET 28.0 Database** (U.S. Department of Labor, CC BY 4.0). O*NET provides:

- Occupation descriptions
- Core transferable skills per occupation
- Knowledge areas
- Technology skills / tools
- Representative work tasks

O*NET data grounds all career exploration in verified occupational knowledge, not generated guesses.

### Layer 3: Agentic AI Guidance

Four sequential AI agents interpret the ML prediction and O*NET data to produce actionable guidance:

| Agent | Function |
|---|---|
| Agent 1: Career Analysis | Identifies occupations worth exploring based on specialisation, aptitude, and O*NET skill overlap |
| Agent 2: Skill Gap | Compares profile to O*NET requirements for the selected occupation |
| Agent 3: Learning Roadmap | Generates a phased, time-estimated learning plan to close identified gaps |
| Agent 4: Project Recommendations | Suggests concrete, buildable portfolio projects using free/open-source tools |

When Google Gemini AI is available (API key configured), these agents use Gemini for richer, more personalised guidance. When Gemini is unavailable, all four agents fall back to deterministic, O*NET-grounded rule-based logic — the system remains fully functional.

---

## 5. Core Workflow

```
Student enters profile (academic + aptitude + specialisation)
            ↓
Input validation (Pydantic strict schema)
            ↓
ML prediction: SalaryTier (Low / Mid / High) + probabilities
            ↓
Feature importance: which profile dimensions mattered most
            ↓
Agent 1: Career Analysis → occupations worth exploring
            ↓
Agent 2: Skill Gap → what skills are missing for target occupation
            ↓
Agent 3: Roadmap → phased plan to close gaps
            ↓
Agent 4: Projects → portfolio projects to demonstrate skills
            ↓
Final Intelligence Report presented to student
```

---

## 6. Key Differentiators

1. **Genuine ML model**: Not an LLM guessing, not a rule engine — an empirically trained scikit-learn classifier on a real dataset.
2. **Zero fabrication**: All data shown to the user traces to a real API call, real model output, or verified O*NET data.
3. **Free stack**: Runs entirely on free and open-source software with optional free-tier Gemini integration.
4. **Offline resilience**: ML prediction and O*NET-grounded guidance work without internet access to external AI APIs.
5. **Transparent limitations**: The system explicitly tells users what the model cannot predict and where the data comes from.
6. **No PII collection**: The system does not ask for name, email, phone number, or address.

---

## 7. Key Limitations

- The ML model is trained on 2010–2015 Indian engineering graduate data. Results should not be extrapolated to current market conditions or non-engineering disciplines.
- Model macro-F1 is approximately 0.52 — moderately better than chance. Predictions carry substantial uncertainty.
- The salary tier thresholds (₹2.10 LPA, ₹3.35 LPA) reflect 2015 salary distributions and do not represent current salary benchmarks.
- Career guidance is exploratory, not prescriptive. O*NET describes occupational requirements; it does not assess individual potential.
- Gemini AI guidance is richer but is not always available. Fallback guidance is deterministic and less personalised.

See [`docs/LIMITATIONS.md`](LIMITATIONS.md) for the complete limitation register.

---

## 8. Technology Stack

| Layer | Technology | License |
|---|---|---|
| ML Training & Inference | Python, scikit-learn, pandas, NumPy, joblib | BSD / Apache |
| Backend API | FastAPI, Uvicorn, Pydantic v2 | MIT |
| Frontend UI | Next.js 16, React 19, TypeScript 5 | MIT |
| Agentic AI | Google Gemini API (gemini-1.5-flash) | Free tier |
| Training Dataset | AMEO 2015 (Zenodo DOI: 10.5281/zenodo.45735) | CC BY-NC-SA 4.0 |
| Occupational Knowledge | O*NET 28.0 Database (USDOL/ETA) | CC BY 4.0 |

---

## 9. Scientific / Academic Disclaimer

CareerPilot AI is an educational research project. All ML results are based on historical data and should be interpreted with appropriate uncertainty. The system makes no claim to predict an individual student's career trajectory, employment success, or future salary. Predictions are probabilistic guidance derived from patterns in a specific historical dataset.
