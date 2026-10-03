# CareerPilot AI

> **An AI, Machine Learning, and Agentic AI Career Intelligence Platform for Engineering Students**

CareerPilot AI helps engineering students understand their employment outlook and discover occupations worth exploring — using a genuinely trained ML model, verified occupational knowledge from O*NET, and an agentic AI guidance layer.

---

## Problem

Engineering students in India face significant uncertainty when transitioning to employment. They receive generic career advice, lack visibility into which specific skills employers require, and have no structured path to develop those skills. CareerPilot AI provides data-driven, O*NET-grounded, and ML-backed career intelligence to address this gap.

---

## Solution

CareerPilot AI combines three distinct, verifiable layers:

1. **ML Employment-Outcome Estimation** — A Logistic Regression classifier trained on 3,998 engineering graduate records from the AMEO 2015 dataset predicts a salary tier (Low / Mid / High) from the student's academic and aptitude profile.
2. **O*NET Occupational Knowledge** — 10 curated occupations from the O*NET 28.0 database (USDOL/ETA, CC BY 4.0) provide verified skill requirements, knowledge areas, and tech skills for each occupation.
3. **Agentic AI Guidance** — Four sequential agents (Career Analysis, Skill Gap, Learning Roadmap, Project Recommendations) interpret the ML prediction and O*NET data to produce personalised, actionable career guidance.

---

## Key Features

- **Real ML model**: Logistic Regression trained on AMEO 2015 — Macro-F1 = 0.52 on holdout test (not a rule engine, not an LLM guess)
- **Predicted class probabilities**: `predict_proba()` outputs for Low, Mid, and High salary tiers
- **Permutation feature importance**: Shows which profile dimensions were statistically associated with salary outcomes
- **O*NET skill gap analysis**: Compares student profile to verified occupation requirements
- **Learning roadmap**: Phased, time-estimated plan to close skill gaps
- **Portfolio project recommendations**: Concrete, buildable projects using free/open-source tools
- **Offline-resilient**: ML prediction and O*NET guidance work without Gemini API
- **Zero fabrication**: All outputs trace to real model outputs, real API data, or verified O*NET records
- **No PII collected**: No name, email, phone, or address required

---

## Architecture

CareerPilot AI is a **modular monolith** — not microservices.

```
Student Profile (Academic + Aptitude + Specialisation)
                    ↓
          Input Validation (Pydantic v2)
                    ↓
     scikit-learn ML Pipeline (15 AMEO features)
          ↓                    ↓                ↓
  Predicted Salary     Class Probabilities  Feature
  Tier (Low/Mid/High)  (Low%/Mid%/High%)   Associations
                    ↓
       O*NET Occupational Knowledge (28.0)
                    ↓
          Agentic Guidance Layer
    ┌─────────────────────────────────┐
    │  Agent 1: Career Analysis       │
    │  Agent 2: Skill Gap             │
    │  Agent 3: Learning Roadmap      │
    │  Agent 4: Project Recs          │
    └────────────────┬────────────────┘
                     ↓
          Final Career Intelligence Report
```

**Backend:** FastAPI + Uvicorn + Pydantic v2 → `http://127.0.0.1:8000`  
**Frontend:** Next.js 16 + React 19 + TypeScript 5 → `http://localhost:3000`  
**ML:** scikit-learn 1.5.2 Pipeline → `ml/models/final_model.joblib`  
**Agents:** Google Gemini (`gemini-1.5-flash`) with deterministic fallback  

---

## Machine Learning

| Property | Value |
|---|---|
| Algorithm | Logistic Regression (multinomial, lbfgs, C=0.1) |
| Training dataset | AMEO 2015 (3,998 records) |
| Task | 3-class supervised classification |
| Target | SalaryTier (Low / Mid / High) |
| CV Macro-F1 | 0.505 ± 0.011 |
| Holdout Macro-F1 | **0.5177** (evaluated once on 600-sample test set) |
| Holdout Accuracy | 0.5217 |
| Baseline Macro-F1 | 0.168 (majority class) |
| Features | 15 AMEO features (13 numerical, 2 categorical) |

The model does **not** predict the student's ideal career, future salary, or guaranteed employment.

---

## Agentic AI

Four sequential agents run in a deterministic pipeline:

| Agent | Input | Output |
|---|---|---|
| Career Analysis | Profile + ML prediction + O*NET | 2–4 occupations worth exploring |
| Skill Gap | Profile + target occupation O*NET data | Prioritised skill gaps |
| Learning Roadmap | Profile + skill gaps | 3–5 phased learning plan |
| Project Recommendations | Profile + skill gaps | 2–4 buildable portfolio projects |

Each agent validates its output against a strict Pydantic schema and falls back to deterministic O*NET-grounded logic if Gemini is unavailable or returns invalid output.

---

## O*NET

**Source:** O*NET 28.0 Database, National Center for O*NET Development, USDOL/ETA  
**License:** CC BY 4.0  
**Coverage:** 10 curated engineering and technology occupations  
**Attribution:** "Occupational information provided by O*NET OnLine (onetonline.org), developed by the National Center for O*NET Development under the US Department of Labor. Licensed CC BY 4.0."

---

## Technology Stack

| Layer | Technology | License |
|---|---|---|
| ML Training & Inference | Python 3.11, scikit-learn 1.5.2, pandas, NumPy, joblib | BSD/Apache |
| Backend API | FastAPI ≥ 0.110, Uvicorn, Pydantic v2 | MIT |
| Frontend UI | Next.js 16.3.8, React 19, TypeScript 5 | MIT |
| Agentic AI | Google Gemini API (`gemini-1.5-flash`) | Free tier |
| Training Dataset | AMEO 2015 (Zenodo DOI: 10.5281/zenodo.45735) | CC BY-NC-SA 4.0 |
| Occupational Knowledge | O*NET 28.0 (USDOL/ETA) | CC BY 4.0 |

---

## Dataset

**AMEO 2015 — Aspiring Minds Employment Outcomes**  
- DOI: `10.5281/zenodo.45735`  
- License: CC BY-NC-SA 4.0  
- 3,998 Indian engineering graduates surveyed 2010–2015  
- Features: academic grades, AMCAT aptitude scores, Big Five personality traits  
- Target: first-year annual salary → tertile-split into Low / Mid / High  
- Raw data is excluded from version control per CC BY-NC-SA 4.0 licence terms  

---

## Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Install Dependencies

```powershell
# Python dependencies
pip install -r ml/requirements.txt
pip install -r backend/requirements.txt

# Frontend dependencies
cd frontend
npm install
```

### 2. Configure Environment

```powershell
copy .env.example .env
# Edit .env — add GEMINI_API_KEY if available (optional)
```

### 3. Start the Backend

```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

Health check: `http://127.0.0.1:8000/api/v1/health`  
API docs: `http://127.0.0.1:8000/docs`

### 4. Start the Frontend

```powershell
cd frontend
npm run dev
```

Open: `http://localhost:3000`

### 5. (Re)train the ML Model (if needed)

```powershell
python -m ml.run_pipeline
```

Requires `data/raw/ameo_2015.csv` to be present (download from Zenodo DOI above).

---

## API

All endpoints are prefixed with `/api/v1/`:

| Method | Path | Description | Requires Gemini |
|---|---|---|---|
| GET | `/health` | System status | No |
| POST | `/predict` | ML salary tier prediction | No |
| POST | `/careerpilot` | Full end-to-end workflow | Optional |
| POST | `/career-analysis` | Agent 1 only | Optional |
| POST | `/skill-gap` | Agent 2 only | Optional |
| POST | `/roadmap` | Agent 3 only | Optional |
| POST | `/projects` | Agent 4 only | Optional |
| GET | `/occupations` | List all O*NET occupations | No |
| GET | `/occupations/{soc_code}` | Single occupation detail | No |

---

## Testing

```powershell
# Backend API tests (22 tests)
python -m pytest backend/tests/ -v

# Frontend tests (10 tests)
cd frontend
npm test

# Mobile tests (9 tests)
node --test mobile/tests/mobile.test.mjs

# TypeScript type check (Frontend)
cd frontend
npx tsc --noEmit
```

---

---

## Cross-Platform Clients

CareerPilot AI is one unified intelligence platform serving four client form factors from a single FastAPI backend:

| Client | Technology | Form Factors | Documentation |
| :--- | :--- | :--- | :--- |
| **Responsive Web** | Next.js 16 + React 19 + Turbopack | Desktop PC, Laptop, Tablet, Mobile Phone | [`docs/RESPONSIVE_WEB.md`](file:///c:/Users/nilay/Desktop/PROJECTS/CareerPilot-AI/docs/RESPONSIVE_WEB.md) |
| **Windows Desktop** | Tauri (Rust) + Electron Launcher | Windows 10 & 11 (x64) | [`docs/DESKTOP_APP.md`](file:///c:/Users/nilay/Desktop/PROJECTS/CareerPilot-AI/docs/DESKTOP_APP.md) |
| **Mobile App** | React Native + Expo 51 | Android Phones & Tablets, iPhone, iPad | [`docs/MOBILE_APP.md`](file:///c:/Users/nilay/Desktop/PROJECTS/CareerPilot-AI/docs/MOBILE_APP.md) |
| **Platform Architecture** | Modular Monolith / Shared API | All Clients | [`docs/CROSS_PLATFORM_ARCHITECTURE.md`](file:///c:/Users/nilay/Desktop/PROJECTS/CareerPilot-AI/docs/CROSS_PLATFORM_ARCHITECTURE.md) |

### Launch Commands

```bash
# 1. Start FastAPI Backend (Port 8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

# 2. Start Responsive Next.js Web Client (Port 3000)
cd frontend && npm run dev

# 3. Launch Windows Desktop Application
run-desktop.bat

# 4. Start Expo Mobile Client (Android / iOS / Tablets)
cd mobile && npm start
```

---

## Project Structure

```
CareerPilot-AI/
├── backend/
│   ├── app/
│   │   ├── api/routes.py          # API endpoint handlers
│   │   ├── core/config.py         # Settings (pydantic-settings)
│   │   ├── schemas.py             # Pydantic data contracts
│   │   └── services/
│   │       ├── agent_service.py   # 4 agents + fallback logic
│   │       ├── ml_service.py      # ML inference
│   │       └── onet_service.py    # O*NET data access
│   └── tests/test_api.py          # 22 integration tests
├── data/
│   ├── onet/occupations.json      # Curated O*NET 28.0 data
│   └── processed/                 # Train/val/test splits
├── desktop/                       # Windows Desktop Electron wrapper
│   ├── main.js                    # Native window process & backend ping
│   └── package.json
├── src-tauri/                     # Tauri native desktop configuration
│   ├── tauri.conf.json            # Desktop window & bundle configuration
│   ├── Cargo.toml                 # Rust dependencies
│   └── src/main.rs                # Tauri entry point
├── mobile/                        # React Native + Expo mobile application
│   ├── App.tsx                    # Root mobile entry point
│   ├── app.json                   # Expo package & tablet config
│   ├── eas.json                   # EAS build profiles (Android/iOS)
│   ├── src/                       # Mobile types, API client & 12 screens
│   └── tests/mobile.test.mjs      # Mobile automated tests
├── docs/                          # Documentation package
│   ├── CROSS_PLATFORM_ARCHITECTURE.md
│   ├── MOBILE_APP.md
│   ├── DESKTOP_APP.md
│   ├── RESPONSIVE_WEB.md
│   ├── CROSS_PLATFORM_TEST_REPORT.md
│   ├── CROSS_PLATFORM_FINAL_VALIDATION.md
│   ├── PROJECT_OVERVIEW.md
│   ├── SYSTEM_ARCHITECTURE.md
│   └── DEMO_GUIDE.md
├── frontend/
│   ├── src/
│   │   ├── app/page.tsx           # Main app state + routing
│   │   ├── components/            # 12 page experiences
│   │   ├── services/api.ts        # HTTP client
│   │   └── types/careerpilot.ts   # TypeScript types
│   └── tests/frontend.test.mjs    # 10 frontend tests
├── ml/
│   ├── models/
│   │   ├── final_model.joblib     # Serialised sklearn Pipeline
│   │   └── model_metadata.json    # Metrics, features, thresholds
│   └── src/                       # Training, evaluation, explain
├── run-desktop.bat                # Windows desktop launcher batch file
├── .env.example                   # Environment variable template
└── README.md
```


---

## Limitations

- AMEO 2015 covers 2010–2015 Indian engineering graduates — not current market conditions
- Holdout Macro-F1 ≈ 0.52 — moderately better than chance, not high-precision
- Salary thresholds (₹2.10 LPA / ₹3.35 LPA) are 2015 historical benchmarks, not current targets
- Only 10 O*NET occupations are in the curated dataset
- Gemini AI is optional; fallback guidance is deterministic and less personalised
- No persistent storage — session data is lost on page refresh
- No live labour-market data

See `docs/LIMITATIONS.md` for the complete limitation register.

---

## Data Licensing

| Dataset | License | Usage in This Project |
|---|---|---|
| AMEO 2015 | CC BY-NC-SA 4.0 | ML training only; raw data excluded from repository |
| O*NET 28.0 | CC BY 4.0 | Occupational knowledge base; attribution in all outputs |

---

## Academic / Educational Disclaimer

CareerPilot AI is an educational research project. ML predictions are probabilistic estimates derived from historical data and are not guarantees of employment, salary, or career success. Career exploration suggestions are starting points, not authoritative career prescriptions. The system does not collect personally identifiable information.

All stated performance metrics (Macro-F1, accuracy) are based on empirical evaluation on a held-out test set and have not been inflated or estimated.
