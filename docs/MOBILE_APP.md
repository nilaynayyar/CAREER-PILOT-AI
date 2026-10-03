# CareerPilot AI Mobile Application (Android, iOS & iPadOS)

## 1. Overview

The CareerPilot AI mobile client is built with **React Native** and **Expo 51**, enabling unified cross-platform execution on Android phones, iPhones, Android tablets, and iPads.

Like the web and desktop clients, the mobile application contains **zero duplicated ML logic**. All predictions and guidance workflows are fetched live from the central FastAPI backend.

---

## 2. Directory Structure

```
mobile/
├── App.tsx                     # Root application entry point with tablet adaptivity
├── app.json                    # Expo config (Android package, iOS bundleIdentifier, tablet support)
├── eas.json                    # EAS build profiles (development, preview, production)
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript compiler options
├── src/
│   ├── types/
│   │   └── careerpilot.ts      # TypeScript interfaces mirroring FastAPI Pydantic schemas
│   ├── services/
│   │   └── api.ts              # API client with timeout, error handling & dynamic URL resolution
│   └── screens/
│       └── Screens.tsx         # Modular touch-optimized screen renderers (12 core experiences)
└── tests/
    └── mobile.test.mjs         # Test suite validating validation bounds, URLs, and touch targets
```

---

## 3. Core Mobile Experiences

The mobile client delivers all 12 core experiences:

1. **Dashboard**: High-level overview, system health status, and workflow introduction.
2. **Student Profile**: Input form for authentic academic, aptitude, and Big Five personality traits.
3. **Assessment Pipeline**: Pipeline execution trigger with optional target SOC focus.
4. **ML Employment Outcome**: Authoritative AMEO 2015 salary tier prediction and probability breakdown.
5. **Model Explanation**: Methodology and permutation feature importance.
6. **Career Exploration**: Searchable and filterable O*NET technical occupations.
7. **Career Detail**: Deep dive into core tasks, skills, technologies, and work activities.
8. **Skill Gap Analysis**: Current profile strengths vs prioritized gaps (High/Medium/Low).
9. **Learning Roadmap**: Sequential phased milestones and weekly commitment estimations.
10. **Project Recommendations**: Hands-on portfolio projects using free and open-source tools.
11. **Final Career Intelligence Report**: Unified multi-layer synthesis with official scientific disclaimer.
12. **About & Methodology**: AMEO 2015 dataset citation (Zenodo DOI 10.5281/zenodo.45735) and O*NET attribution.

---

## 4. Responsive Tablet & iPad Adaptivity

The mobile client detects viewport dimensions dynamically using `useWindowDimensions`:

- **Phone Viewport (< 768px)**:
  - Single-column stacked cards.
  - Fixed bottom navigation bar with 44px+ touch targets.
  - Full-width comfortable inputs preventing zoom distortions.
- **Tablet / iPad Viewport (≥ 768px)**:
  - Multi-column card grids.
  - Expanded content padding and horizontal split views.
  - Both portrait and landscape orientations supported (`supportsTablet: true` in `app.json`).

---

## 5. Backend URL Configuration

The mobile app resolves the backend API target dynamically:

1. **Custom Runtime Setting**: `mobileApi.setApiUrl(url)`
2. **Environment Variable**: `EXPO_PUBLIC_API_URL`
3. **Local Development Fallbacks**:
   - `http://10.0.2.2:8000` (Android emulator localhost alias)
   - `http://127.0.0.1:8000` (iOS simulator / Web runner)

---

## 6. Build & Test Commands

### Run Mobile Test Suite
```bash
node --test mobile/tests/mobile.test.mjs
```

### Start Expo Development Server
```bash
cd mobile
npm start
```

### Build Android APK (Preview via EAS)
```bash
eas build --platform android --profile preview
```

### Build iOS Store Binary (Requires Apple Developer account & macOS/EAS)
```bash
eas build --platform ios --profile production
```

---

## 7. Real Environment Status & Limitations

- **Configuration Verification**: **PASS** (package.json, app.json, eas.json, tsconfig.json, API client, all 12 screens implemented).
- **Unit & Logic Tests**: **PASS** (9/9 automated tests passing).
- **Android Runtime Testing**: Environment limitation — no local Android SDK / `adb` configured on current Windows machine. Ready for Expo Go / EAS Cloud build.
- **iOS / iPadOS Runtime Testing**: Environment limitation — iOS/iPadOS build is not locally executable in the current Windows environment; configuration verified, runtime testing requires macOS/iOS environment.
