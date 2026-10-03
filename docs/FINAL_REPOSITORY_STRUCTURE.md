# CareerPilot AI — Final Repository Structure & Release Architecture

This document defines the final repository layout, file classifications, Git exclusion rules, secret handling policies, and instructions for reproducing CareerPilot AI for publication and presentation.

---

## 1. Final Directory Tree

```
CareerPilot-AI/
│
├── README.md                              # Primary project entry point & overview
├── .gitignore                             # Professional multi-stack Git exclusion configuration
├── .env.example                           # Clean environment variable template (zero secrets)
│
├── backend/                               # FastAPI Backend Application
│   ├── app/
│   │   ├── main.py                        # FastAPI entry point & CORS configuration
│   │   ├── schemas.py                     # Pydantic v2 data contracts & validation
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── endpoints.py           # REST endpoints (/health, /predict, /careerpilot)
│   │   ├── core/
│   │   │   └── config.py                  # Environment & runtime configuration
│   │   └── services/
│   │       ├── agent_service.py           # 4-stage sequential agent pipeline + deterministic fallback
│   │       ├── ml_service.py              # ML inference service (Pipeline loading & explainability)
│   │       └── onet_service.py            # O*NET 28.0 knowledge base loader & search
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_api.py                    # 22 automated API & architectural invariance tests
│   └── requirements.txt                   # Backend Python dependencies
│
├── frontend/                              # Responsive Web Client (Next.js 16 + React 19)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                 # Root layout & meta tags
│   │   │   ├── page.tsx                   # Main state machine, view routing, empty-state presets
│   │   │   └── globals.css                # Global design system & theme tokens
│   │   ├── components/                    # 12 modular UI experiences
│   │   │   ├── AssessmentFlow.tsx         # Guided questionnaire flow
│   │   │   ├── CareerExploration.tsx      # O*NET occupation matcher & detail modal
│   │   │   ├── Header.tsx                 # Responsive navigation bar with mobile toggle
│   │   │   ├── LearningRoadmap.tsx        # Phased timeline & milestones view
│   │   │   ├── LoadingSequence.tsx        # Agent progression state tracker
│   │   │   ├── MLOutcome.tsx              # Salary tier, probabilities, permutation importance
│   │   │   ├── PortfolioProjects.tsx      # Project recommendations & free tool stacks
│   │   │   ├── ReportView.tsx             # Comprehensive printable report view
│   │   │   ├── SkillGapAnalysis.tsx       # Profile vs O*NET gap radar / comparison
│   │   │   ├── StudentProfileForm.tsx     # Academic, AMCAT aptitude, Big Five input form
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.ts                     # TypeScript HTTP API client with resilient fallbacks
│   │   └── types/
│   │       └── careerpilot.ts             # TypeScript domain models matching backend Pydantic schemas
│   ├── tests/
│   │   └── frontend.test.mjs              # 10 automated frontend unit/integration tests
│   ├── package.json                       # Frontend dependencies & scripts
│   ├── tsconfig.json                      # Strict TypeScript compiler options
│   └── next.config.ts                     # Next.js build configuration
│
├── mobile/                                # Mobile Client (React Native + Expo 51)
│   ├── App.tsx                            # Root React Native component & state container
│   ├── app.json                           # Expo app configuration (Android, iOS, iPad orientations)
│   ├── eas.json                           # EAS build configuration for Android & iOS
│   ├── tsconfig.json                      # Mobile TypeScript configuration
│   ├── src/
│   │   ├── env.d.ts                       # Expo environment variable type declarations
│   │   ├── services/
│   │   │   └── api.ts                     # Mobile HTTP client connecting to FastAPI backend
│   │   ├── types/
│   │   │   └── careerpilot.ts             # Mobile shared data contracts
│   │   └── screens/                       # Mobile-optimized screens (Home, Profile, ML, O*NET, Roadmap)
│   ├── tests/
│   │   └── mobile.test.mjs                # 9 automated mobile test suites
│   └── package.json                       # Mobile dependencies
│
├── desktop/                               # Desktop Client (Electron Launcher)
│   ├── main.js                            # Electron window management & backend health check
│   └── package.json                       # Desktop configuration
│
├── src-tauri/                             # Desktop Client (Tauri / Rust Native Core)
│   ├── Cargo.toml                         # Rust workspace dependencies
│   ├── tauri.conf.json                    # Tauri 1.x window & bundle metadata
│   └── src/
│       └── main.rs                        # Tauri application bootstrap
│
├── ml/                                    # Machine Learning Source & Artifacts
│   ├── models/
│   │   ├── .gitkeep                       # Keeps folder tracked
│   │   ├── final_model.joblib             # Serialized Logistic Regression Pipeline (8.46 KB)
│   │   └── model_metadata.json            # Performance metrics (Macro-F1: 0.5177), feature definitions
│   ├── src/
│   │   ├── train.py                       # Training pipeline script
│   │   ├── evaluate.py                    # Stratified holdout evaluation
│   │   └── explain.py                     # Permutation feature importance generator
│   ├── tests/                             # ML pipeline unit tests
│   └── requirements.txt                   # ML dependencies
│
├── data/                                  # Data Storage & Knowledge Bases
│   ├── onet/
│   │   └── occupations.json               # Required runtime O*NET 28.0 knowledge base (10 occupations)
│   ├── raw/
│   │   └── .gitkeep                       # Raw dataset directory (local only, ignored by Git)
│   └── processed/
│       └── .gitkeep                       # Processed dataset splits (local only, ignored by Git)
│
├── scripts/                               # Maintenance & verification utilities
│
└── docs/                                  # Comprehensive Documentation Package
    ├── PROJECT_OVERVIEW.md                # High-level overview & problem statement
    ├── SYSTEM_ARCHITECTURE.md             # System components & dataflow diagram
    ├── ML_METHODOLOGY.md                  # Model selection, validation, and explainability
    ├── AGENTIC_AI_ARCHITECTURE.md         # 4-stage agent pipeline & fallback mechanism
    ├── DATASETS_AND_SOURCES.md            # AMEO 2015 & O*NET 28.0 provenance
    ├── ONET_PROVENANCE.md                 # O*NET 28.0 licensing and structure details
    ├── LIMITATIONS.md                     # Transparent limitation register & honesty boundaries
    ├── DEMO_GUIDE.md                      # Live demonstration script & walk-through
    ├── JUDGES_QA.md                       # Comprehensive Q&A for presentation & review
    ├── CROSS_PLATFORM_ARCHITECTURE.md     # Unified backend & multi-client design
    ├── RESPONSIVE_WEB.md                  # Responsive design breakpoints & testing
    ├── DESKTOP_APP.md                     # Tauri and Electron desktop guide
    ├── MOBILE_APP.md                      # React Native / Expo mobile guide
    ├── CROSS_PLATFORM_TEST_REPORT.md      # Test matrix across platforms
    ├── CROSS_PLATFORM_FINAL_VALIDATION.md # Final cross-platform audit report
    ├── FINAL_PRE_PRESENTATION_AUDIT.md    # Pre-presentation accuracy verification
    ├── ZERO_FABRICATION_AUDIT_REPORT.md   # Zero-fabrication compliance check
    ├── FINAL_REPOSITORY_STRUCTURE.md      # (This document)
    └── FINAL_GIT_CLEANUP_REPORT.md        # Complete cleanup audit report
```

---

## 2. Key Files & Protected Runtime Artifacts

| Component | File Path | Status | Reason |
| :--- | :--- | :--- | :--- |
| **ML Model** | `ml/models/final_model.joblib` | **TRACKED** | Required scikit-learn Pipeline for inference (8.46 KB) |
| **Model Metadata** | `ml/models/model_metadata.json` | **TRACKED** | Evaluated metrics (Macro-F1 0.5177), feature importances |
| **O*NET Knowledge** | `data/onet/occupations.json` | **TRACKED** | Bundled knowledge base for 10 engineering occupations |
| **Environment Template**| `.env.example` | **TRACKED** | Clean configuration template with zero secret values |
| **Backend Tests** | `backend/tests/test_api.py` | **TRACKED** | 22 integration & architectural invariance tests |
| **Frontend Tests** | `frontend/tests/frontend.test.mjs` | **TRACKED** | 10 browser & state logic tests |
| **Mobile Tests** | `mobile/tests/mobile.test.mjs` | **TRACKED** | 9 mobile profile and accessibility tests |

---

## 3. Files Intentionally Excluded via `.gitignore`

1. **Build Artifacts & Caches**:
   - `frontend/.next/` (Next.js build cache and server bundles)
   - `frontend/node_modules/` (Node dependencies)
   - `src-tauri/target/` and `target/` (Rust compiler output)
   - `frontend/tsconfig.tsbuildinfo` (TypeScript incremental build cache)
2. **Python Caches**:
   - `__pycache__/` and `*.py[cod]` across all directories
   - `.pytest_cache/`
   - `.coverage` and `htmlcov/`
3. **Mobile & Expo Caches**:
   - `.expo/`, `.expo-shared/`, `.metro/`
   - Android & iOS native build caches (`*.apk`, `*.ipa`, `android/.gradle/`)
4. **Local Secrets & Environment Files**:
   - `.env`, `.env.local`, `.env.*.local`
5. **Raw / Large Datasets**:
   - `data/raw/*` (excluding `.gitkeep`)
   - `data/processed/*` (excluding `.gitkeep`)
6. **Operating System Files**:
   - `Thumbs.db`, `desktop.ini`, `.DS_Store`

---

## 4. Secret & Configuration Safety

- A thorough regex scan verified that **zero active API keys or credentials** exist anywhere in the tracked codebase or documentation.
- The `.env.example` file provides clean, documented placeholders:
  ```env
  GEMINI_API_KEY=your_gemini_api_key_here
  CAREERPILOT_PORT=8000
  CAREERPILOT_HOST=127.0.0.1
  NEXT_PUBLIC_API_URL=http://localhost:8000
  EXPO_PUBLIC_API_URL=http://localhost:8000
  CAREERPILOT_BACKEND_URL=http://127.0.0.1:8000
  ```
- If `GEMINI_API_KEY` is omitted at runtime, the application smoothly engages its verified deterministic fallback logic without crashing or hanging.

---

## 5. Dataset Provenance & Licenses

| Dataset | Version / Source | License | Tracked in Git? |
| :--- | :--- | :--- | :--- |
| **AMEO 2015** | Aspiring Minds (3,998 Indian engineering graduates) | **CC BY-NC-SA 4.0** | No (`data/raw/` is ignored). Model weights only. |
| **O*NET** | O*NET 28.0 (USDOL/ETA) | **CC BY 4.0** | Yes (`data/onet/occupations.json` is tracked). |

*Note: The project license is currently not specified.*

---

## 6. How to Reproduce the Project

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd CareerPilot-AI
```

### Step 2: Backend Setup
```bash
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r backend/requirements.txt
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
cd ..
```

### Step 4: Run Automated Tests
```bash
# Backend (22 tests)
python -m pytest backend/tests/ -v

# Frontend (10 tests)
node --test frontend/tests/frontend.test.mjs

# Mobile (9 tests)
node --test mobile/tests/mobile.test.mjs

# Frontend Type Check
cd frontend && npx tsc --noEmit && cd ..
```

### Step 5: Launch Application
```bash
# Terminal 1 - Backend (FastAPI on Port 8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

# Terminal 2 - Frontend (Next.js on Port 3000)
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in any modern desktop, tablet, or mobile browser.

---

## 7. GitHub Push Checklist (For Repository Owner)

Follow these manual steps when ready to publish to GitHub:

1. **Initialize Git (if not already initialized in project root)**:
   ```bash
   git init
   git branch -M main
   ```
2. **Review Untracked / Modified Files**:
   ```bash
   git status --short
   ```
   *Verify that no `node_modules/`, `.next/`, `*.pyc`, or `.env` files appear.*
3. **Stage Clean Tracked Files**:
   ```bash
   git add .
   ```
4. **Commit**:
   ```bash
   git commit -m "feat: release CareerPilot AI v3.0.0 presentation package"
   ```
5. **Connect Remote & Push**:
   ```bash
   git remote add origin https://github.com/<your-username>/CareerPilot-AI.git
   git push -u origin main
   ```
