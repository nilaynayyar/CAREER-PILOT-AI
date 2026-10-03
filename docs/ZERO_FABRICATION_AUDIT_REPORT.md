# CareerPilot AI — Real-World Usefulness & Zero-Fabrication Audit Report

**Date:** October 3, 2026  
**Audit Scope:** Full Stack (Frontend UI/UX, Backend Services, ML Pipeline, Data Provenance)  
**Status:** 100% PASSED — Zero Fabricated Data, 100% Real Architecture  

---

## 1. Zero-Fabrication Audit Verification

A thorough codebase audit was performed across `frontend/src/` and `backend/app/`.

### Verified Findings:
1. **Zero Preset Profiles**: The student profile form begins completely empty (`null` profile state, blank inputs, neutral `"Select your specialization..."` and `"Select your degree..."` placeholders). No sample/demo profiles exist.
2. **Zero Hardcoded Predictions**: The Predicted Salary Tier, predicted class probabilities, and permutation feature importances are computed dynamically by the trained scikit-learn model (`ml/models/final_model.joblib`) via the `/api/v1/predict` and `/api/v1/careerpilot` endpoints.
3. **Zero Fabricated Progress / Completion**: All roadmap milestones and learning phases start explicitly as **"Not started"**. No simulated completion percentages are rendered.
4. **Zero Simulated Delays**: All artificial `setTimeout` loops were excised from the pipeline runner in `frontend/src/app/page.tsx`. Network requests execute immediately upon user trigger.
5. **Real Occupational Knowledge**: Occupation descriptions, core skills, technology requirements, and knowledge areas come directly from the USDOL O*NET 28.0 database (`backend/app/data/onet_engineering_occupations.json`).
6. **Real Agent & Fallback Logic**: When Gemini is offline or unconfigured, the application runs deterministic O*NET matching and explicitly tags the output: `"AI Guidance: Offline Fallback"`.

---

## 2. Real-World Usefulness Audit (Questions Answered)

| User Question | How CareerPilot AI Answers It | Source of Truth |
| :--- | :--- | :--- |
| **A. What does the ML model estimate?** | Predicted Salary Tier (`Low`, `Mid`, or `High` with LPA range) and predicted class probability distribution (`predict_proba()` from Logistic Regression). | Scikit-learn Logistic Regression trained on AMEO 2015 (`final_model.joblib`) |
| **B. What does that prediction mean?** | Clear callout boxes detailing **"What This Means"** (statistical correlation from 3,998 engineering graduates) vs **"What This Does NOT Mean"** (not destiny, not exact future salary). | Transparent scientific methodology (`MLOutcomeView.tsx`) |
| **C. What careers can I explore?** | Searchable catalog of 10 engineering occupations with SOC codes, labeled as *"Occupation worth exploring"* or *"Profile-aligned exploration"*. | O*NET 28.0 Database (`onet_service.py`) |
| **D. What skills do those careers require?** | Formal breakdown of O*NET Core Skills, Knowledge Areas, and Technology Skills (e.g. Docker, Python, PostgreSQL, AWS). | USDOL O*NET 28.0 Taxonomy |
| **E. Which skills should I work on?** | Diagnostic Skill Gap analysis separating verified student strengths from high-priority gaps. | Agentic diagnostic / deterministic fallback |
| **F. What should I learn first?** | Structured 5-point action plan per gap: **What to Learn**, **Suggested Practice**, and **Applied Project**. | `SkillGapView.tsx` |
| **G. What can I build to practice?** | Phased 3-stage roadmap answering: (1) What to learn, (2) Why learn it, (3) How to practice, (4) What to build, (5) Evidence of progress (e.g. GitHub repo). | `RoadmapView.tsx` |
| **H. What should I do next?** | Final report concludes with **"YOUR NEXT STEPS"**: 5 customized, concrete actions derived from the student's actual results. | `FinalReportView.tsx` |

---

## 3. Concrete Portfolio Deliverables per Project

Every recommended project in `ProjectRecommendationsView.tsx` specifies concrete deliverables:
- **Beginner**: Modular source code, README setup instructions, sample inputs/outputs, unit tests.
- **Intermediate**: Relational database schema, automated test suite (> 75% coverage), interactive CLI/web dashboard, architectural retrospective.
- **Advanced**: Production-grade architecture, GitHub Actions CI/CD workflow, Docker & Docker Compose setup, OpenAPI documentation.

---

## 4. Final Checklist & Acceptance Criteria

- [x] Zero demo/preset student data
- [x] Zero fabricated ML results
- [x] Zero fabricated AI results
- [x] Zero fake progress
- [x] Real ML inference (`final_model.joblib`)
- [x] Real O*NET data (USDOL O*NET 28.0)
- [x] Real agent/fallback processing
- [x] Entrance exams treated as contextual data (not fed to ML)
- [x] No unsupported ML claims
- [x] Actionable skill-gap recommendations
- [x] Actionable learning roadmap (5 questions answered per phase)
- [x] Projects have concrete deliverables
- [x] Final report provides concrete next steps
- [x] Empty states are honest
- [x] Error states are honest
- [x] Offline mode is honest (`AI Guidance: Offline Fallback`)
- [x] Privacy is respected (no PII collected or logged)
- [x] No unnecessary personal data collection
- [x] Frontend tests pass (10/10)
- [x] Backend tests pass (22/22)
- [x] TypeScript passes (`tsc --noEmit` clean)
- [x] Production build passes (`next build` succeeds)
