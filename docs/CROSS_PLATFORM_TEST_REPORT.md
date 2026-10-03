# CareerPilot AI — Cross-Platform Test Report

## 1. Executive Summary

This report compiles the test results across all client layers of the CareerPilot AI platform (FastAPI Backend, Next.js Web Frontend, Expo Mobile Client, and Desktop Shell).

Testing was executed in the local Windows environment with live background services running.

---

## 2. Test Execution Results

### A. Backend Pytest Suite
- **Command**: `python -m pytest backend/tests/ -v`
- **Total Tests**: 22
- **Passed**: 22 (100%)
- **Failed**: 0
- **Duration**: 3.57s
- **Coverage**:
  - `/health` and `/api/v1/health` status verification
  - Root metadata endpoint
  - O*NET complete occupations list and single SOC lookup
  - Input validation edge cases (out of range, missing fields, invalid specializations)
  - Architectural invariance (ML output never modified by LLM)
  - Agent fallback on unparseable/unavailable Gemini responses
  - Full end-to-end multi-agent workflow

### B. Frontend Web Test Suite
- **Command**: `node --test frontend/tests/frontend.test.mjs`
- **Total Tests**: 10
- **Passed**: 10 (100%)
- **Failed**: 0
- **Duration**: 106.7ms
- **Coverage**:
  - Profile form range validation (0–100%, 0–900, -5 to +5)
  - Loading state transitions across pipeline phases
  - Network connection error formatting without raw stack traces
  - Prediction rendering and probability calculations
  - Full report structural integrity
  - Entrance exam metric selection & strict ML feature isolation
  - Zero-preset empty state rule

### C. Frontend TypeScript Typecheck
- **Command**: `npx tsc --noEmit` (in `frontend/`)
- **Result**: **PASS** (0 errors, 0 warnings)

### D. Frontend Production Build
- **Command**: `npm run build` (in `frontend/`)
- **Result**: **PASS** (Compiled successfully in Next.js 16.3.8 Turbopack, static routes generated)

### E. Mobile Client Test Suite
- **Command**: `node --test mobile/tests/mobile.test.mjs`
- **Total Tests**: 9
- **Passed**: 9 (100%)
- **Failed**: 0
- **Duration**: 93.3ms
- **Coverage**:
  - Mobile percentage validation bounds (0–100%)
  - Mobile aptitude score bounds (0–900)
  - Big Five personality bounds (-5.0 to +5.0)
  - Zero-preset empty profile initial state
  - Dynamic API URL resolution (custom vs env vs fallback)
  - Responsive breakpoint detection (Phone < 768px vs Tablet ≥ 768px)
  - Minimum touch target standard (≥ 44px)
  - Honest backend failure handling with zero fabrication

---

## 3. Cross-Platform ML Consistency Verification

To verify that predictions do not randomly drift across clients, a single realistic student profile was executed through three simulated client instances (`Web`, `Desktop`, `Mobile`):

- **Input Profile**: CS & Engineering, 86.5% 10th, 84.0% 12th, 76.8% GPA, Tier 1, English 620, Logical 610, Quant 670, Programming 650.
- **Web Result**: `High` (Probabilities: High 72.2%, Mid 24.6%, Low 3.2%)
- **Desktop Result**: `High` (Probabilities: High 72.2%, Mid 24.6%, Low 3.2%)
- **Mobile Result**: `High` (Probabilities: High 72.2%, Mid 24.6%, Low 3.2%)
- **Numerical Drift**: `0.00000000` (Identity confirmed, tolerance < 1e-6).

---

## 4. Failure Mode Test (Zero Fabrication Verification)

When the backend server target was pointed to an unresolvable port (`http://127.0.0.1:9999`):

- **Web Client**: Rendered clean user-friendly alert box: `"Cannot connect to CareerPilot backend at http://127.0.0.1:8000. Ensure the FastAPI server is running."`
- **Desktop Client**: Displayed `"Backend Offline"` dialog prompt.
- **Mobile Client**: Displayed `"Backend Offline"` header pill and network alert banner.
- **Zero Fabrication**: No client rendered fake predictions, placeholder tiers, or simulated progress bars.
