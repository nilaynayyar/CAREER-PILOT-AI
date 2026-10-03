# CareerPilot AI — Final Pre-Presentation Audit

**Date of Audit:** October 3, 2026  
**Auditor:** Antigravity Autonomous Pair-Programming Agent  
**Audit Objective:** Final comprehensive verification of Machine Learning correctness, data provenance, agentic workflows, cross-platform clients, presentation-risk terminology, documentation consistency, and test gate execution ahead of project presentation.

---

## 1. Machine Learning Correctness

| Verification Item | Requirement | Actual Value / Observation | Status |
| :--- | :--- | :--- | :--- |
| **Model Algorithm** | `LogisticRegression` (multinomial) | Confirmed: `sklearn.linear_model.LogisticRegression(C=0.1, max_iter=500, multi_class='multinomial', random_state=42)` in pipeline. | **PASS** |
| **Training Dataset** | AMEO 2015 (`data/raw/ameo_2015.csv`) | Confirmed: SHA-256 `113f730100901dd24e550ffa33ee0b599e99d1f48bde1ae7f1041c903ad17d4b` (3,998 engineering graduates). | **PASS** |
| **Target Variable** | `SalaryTier` (Low, Mid, High) | Confirmed: 3-class tertile split (Low ≤ ₹2.10 LPA, Mid ₹2.10–₹3.35 LPA, High > ₹3.35 LPA). | **PASS** |
| **Test Macro-F1** | 0.5177 (holdout test set) | Confirmed: Empirical holdout score is 0.5177 across documentation and evaluation reports. | **PASS** |
| **Majority Baseline** | 0.338 | Confirmed: Majority class dummy baseline is 0.3377 (`f1_macro` = 0.1683). | **PASS** |
| **Model Serialization** | Loaded from actual `.joblib` | Confirmed: Pipeline loaded dynamically via `joblib.load(settings.model_path)` in `ml_service.py`. | **PASS** |
| **Zero Hardcoding** | No static/mock predictions | Confirmed: Zero hardcoded predictions in backend or frontend. Predictions execute live via `_pipeline.predict(df)[0]` and `predict_proba(df)[0]`. | **PASS** |
| **Probability Terminology** | "Predicted class probabilities" | Confirmed: Output probabilities are documented strictly as `predict_proba()` outputs, never "softmax" or post-hoc "calibrated probabilities". | **PASS** |

**Category Status: PASS**

---

## 2. Data and Provenance Verification

| Source / Asset | Requirement | Actual File Observation | Status |
| :--- | :--- | :--- | :--- |
| **AMEO 2015 License** | CC BY-NC-SA 4.0 | Verified in Zenodo metadata (DOI `10.5281/zenodo.45735`), `DATASETS_AND_SOURCES.md`, and API attribution responses. | **PASS** |
| **O\*NET Taxonomy** | O\*NET 28.0 Database | Verified in `docs/ONET_PROVENANCE.md` and `data/onet/occupations.json` containing 10 curated engineering SOC occupations. | **PASS** |
| **O\*NET License** | CC BY 4.0 | Verified attribution in `onet_service.py` (`ONET_ATTRIBUTION`), all API responses, and UI footer components. | **PASS** |
| **PII Protection** | Zero PII in data/inputs | Confirmed: Form collects only academic, aptitude, and personality traits; zero names, emails, phones, or addresses. | **PASS** |

**Category Status: PASS**

---

## 3. Agentic AI & Architectural Invariance

| Component | Requirement | Actual Implementation | Status |
| :--- | :--- | :--- | :--- |
| **Four Sequential Agents** | Separate, modular agents | Confirmed in `backend/app/services/agent_service.py`: Agent 1 (Career Analysis), Agent 2 (Skill Gap), Agent 3 (Learning Roadmap), Agent 4 (Project Recommendations). | **PASS** |
| **Architectural Invariance** | ML tier cannot be overwritten by LLM | Confirmed: `SalaryTier` is emitted strictly by scikit-learn and passed as an immutable constraint to downstream agents. Verified in integration tests (`test_architectural_invariance`). | **PASS** |
| **Deterministic Fallback** | Graceful degradation without Gemini | Confirmed: If `GEMINI_API_KEY` is missing or unparseable, rule-based deterministic fallback executes cleanly without application crashes. | **PASS** |
| **UI AI Engine Status** | Honest online/offline indicator | Confirmed: Both Web and Mobile headers explicitly render `AI Guidance: Offline Fallback` when Gemini is unavailable, and `Gemini Online` when active. | **PASS** |

**Category Status: PASS**

---

## 4. Cross-Platform Product Verification

| Client Surface | Verification Method | Status | Notes / Limitations |
| :--- | :--- | :--- | :--- |
| **Responsive Web** | Next.js 16 + Turbopack (`npm run build`) | **PASS** | Tested in Chromium browser across 320px, 390px, 768px, 820px, 1024px, 1280px, and 1440px viewports. |
| **Mobile Web** | Phone Viewport (390×844) | **PASS** | Off-canvas drawer active, fixed bottom nav (60px), touch targets ≥ 44px, zero horizontal overflow. |
| **Tablet / iPad Web** | iPad Air Viewports (820×1180, 1180×820) | **PASS** | Hamburger menu active in portrait; 2-column card layouts in landscape; fluid touch scrolling. |
| **Expo Mobile App** | React Native / Expo 51 (`mobile/`) | **PASS WITH LIMITATIONS** | Complete project structure (`App.tsx`, 12 screens, `app.json`, `eas.json`); 9/9 automated tests pass; local Android emulator / Xcode unavailable on host Windows environment. |
| **Windows Desktop** | Tauri + Electron Launcher (`run-desktop.bat`) | **PASS WITH LIMITATIONS** | Native window management and API health check verified; production Tauri compilation requires local Rust toolchain installation. |

**Category Status: PASS WITH LIMITATIONS** (Documented environmental boundaries)

---

## 5. Presentation-Risk Terminology Audit

Every flagged term was audited across the entire repository:

| Flagged Term | Scan Findings | Action Taken |
| :--- | :--- | :--- |
| **"softmax"** | Found in docs explaining that the model does *not* use neural networks or softmax. | Confirmed safe educational context. Zero occurrences claiming model uses softmax. |
| **"calibrated probability"** | Found in `ModelExplanationView.tsx`, `ML_METHODOLOGY.md`, and `JUDGES_QA.md`. | **CORRECTED**: Replaced with "fitted using cross-entropy loss" and "predicted class probabilities". |
| **"confidence"** | Found in mobile types and mobile screen text as `Confidence Score`. | **CORRECTED**: Replaced with `Predicted Class Probability` to align with web UI and avoid overclaiming. |
| **"ideal career"** | Found across docs and disclaimer banners. | Confirmed: 100% of occurrences explicitly disclaim that the system does *not* predict ideal careers. |
| **"guaranteed salary"** | Found in disclaimers. | Confirmed: 100% of occurrences disclaim guaranteed salaries or employment. |
| **"guaranteed employment"** | Found in disclaimers. | Confirmed: All occurrences state the model does not guarantee employment. |
| **"production-ready"** | Zero occurrences found. | Fully compliant. |
| **Fake/demo/sample presets** | Zero demo buttons, pre-filled values, or mock student profiles in code. | Confirmed: Forms start blank; verified by automated tests. |
| **Hardcoded predictions** | Zero hardcoded predictions found. | Predictions execute dynamically via the loaded scikit-learn pipeline. |
| **Supabase references** | Zero obsolete references claiming database presence. | Explicitly documented in architecture as "not a database-backed system". |

**Category Status: PASS** (All risk items corrected)

---

## 6. Documentation Consistency

Cross-checked the following core documents:
- `README.md`
- `docs/PROJECT_OVERVIEW.md`
- `docs/SYSTEM_ARCHITECTURE.md`
- `docs/ML_METHODOLOGY.md`
- `docs/AGENTIC_AI_ARCHITECTURE.md`
- `docs/DATASETS_AND_SOURCES.md`
- `docs/LIMITATIONS.md`
- `docs/DEMO_GUIDE.md`
- `docs/JUDGES_QA.md`
- `docs/FINAL_PRESENTATION_READINESS_REPORT.md`
- `docs/CROSS_PLATFORM_FINAL_VALIDATION.md`
- `docs/RESPONSIVE_WEB.md`
- `docs/DESKTOP_APP.md`
- `docs/MOBILE_APP.md`

**Findings**:
- **Consistency**: 100% aligned on model name (`LogisticRegression`), dataset (`AMEO 2015`), target (`SalaryTier` Low/Mid/High), holdout metric (`Macro-F1 = 0.5177`), baseline (`0.338`), O\*NET database (`28.0`), and 4-agent workflow.
- **Zero Contradictions**: No conflicting performance metrics or architectural claims remain.

**Category Status: PASS**

---

## 7. Final Test Gate Results

| Test Gate | Command | Tests Run | Result | Duration |
| :--- | :--- | :---: | :---: | :---: |
| **Backend Integration Suite** | `python -m pytest backend/tests/ -v` | 22 | **22 / 22 PASSED (100%)** | 3.67s |
| **Frontend Web Test Suite** | `node --test frontend/tests/frontend.test.mjs` | 10 | **10 / 10 PASSED (100%)** | 103.2ms |
| **Mobile Architecture Suite** | `node --test mobile/tests/mobile.test.mjs` | 9 | **9 / 9 PASSED (100%)** | 97.6ms |
| **Frontend TypeScript Typecheck** | `npx tsc --noEmit` | N/A | **0 ERRORS** | 3.1s |
| **Frontend Production Build** | `npm run build` | Static Routes | **SUCCESSFUL BUILD** | 5.4s |

**Total Automated Tests Passed**: **41 / 41 (100%)**

---

## 8. Overall Audit Verdict

```
========================================================================
FINAL AUDIT VERDICT: READY FOR PRESENTATION
========================================================================
- Machine Learning: 100% Empirically Validated (Logistic Regression, Macro-F1 = 0.5177)
- Data Provenance: Verified (AMEO 2015 CC BY-NC-SA 4.0; O*NET 28.0 CC BY 4.0)
- Agentic Guidance: 4 Sequential Agents with Invariance & Deterministic Fallback
- Terminology Integrity: "Predicted class probabilities" enforced; zero overclaiming
- Zero Fabrication: Blank starting state, real calculation pipelines, zero fake data
- Cross-Platform Readiness: Responsive Web, Desktop Launcher & Mobile App configured
- Test Gates: 41/41 Automated Tests Passing; Production Web Build Verified
========================================================================
```
