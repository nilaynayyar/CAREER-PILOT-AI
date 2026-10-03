# CareerPilot AI — Demo Guide

**Audience:** Presenter (IBM project demo / academic judges)  
**Duration:** 3–5 minutes  
**Mode:** Live demonstration using the running application  

---

## Pre-Demo Checklist

Before starting the demo, verify:

- [ ] Backend is running: `python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000`
- [ ] Frontend is running: `cd frontend && npm run dev`
- [ ] Browser is open at `http://localhost:3000`
- [ ] `/api/v1/health` returns `{"status":"ok","model_loaded":true}`
- [ ] Browser is in full-screen or presentation mode
- [ ] No previous session data in browser (refresh to clear state)

### Quick Backend Start (from project root):
```powershell
# Terminal 1 — Backend
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

---

## Recommended Demo Profile

Use the following realistic student profile for the demonstration. **Enter it manually during the demo** — do not pre-fill or use any "load sample" button (none exists; CareerPilot has no preset data).

| Field | Value | Notes |
|---|---|---|
| 10th Grade % | 82.5 | Typical high-performing student |
| 12th Grade % | 77.0 | Slight drop — realistic |
| College GPA | 7.4 | 10-point scale → automatically normalised to ~70.3% |
| College Tier | Tier 2 | State university / affiliated college |
| Degree | B.Tech/B.E. | Most common engineering degree |
| Specialization | Computer Science & Engineering | High-demand field |
| English Score | 560 | AMCAT scale 200–900 |
| Logical Score | 610 | AMCAT scale 200–900 |
| Quantitative Score | 640 | AMCAT scale 200–900 |
| Computer Programming Score | 480 | AMCAT scale 200–900 (optional) |
| Conscientiousness | 0.4 | z-score |
| Agreeableness | 0.2 | z-score |
| Extraversion | -0.1 | z-score |
| Neuroticism | -0.3 | z-score |
| Openness | 0.5 | z-score |

---

## Step-by-Step Demo Script

### Step 1 — Landing / Dashboard (30 seconds)

**Do:** Open `http://localhost:3000`  
**Say:** "CareerPilot AI is a career intelligence platform that helps engineering students understand their employment outlook using real Machine Learning — not guesswork."

Point out the system status indicator (green if backend is connected).

---

### Step 2 — Student Profile (60 seconds)

**Do:** Click "Student Profile" in the sidebar. Navigate to the profile form.  
**Say:** "The first step is entering a genuine student profile. Notice there are no pre-filled values, no demo buttons — you enter your actual academic and aptitude data."

Enter the recommended demo profile above. Point out:
- Section A: Academic Profile (10th, 12th, GPA, Tier, Degree, Specialization)
- Section B: Aptitude — these are AMCAT standardised assessment scores on a 200–900 scale
- Section C: Personality — Big Five OCEAN traits from the AMEO dataset format

**Say:** "The entrance exam section at the bottom is for career context only — it does not feed into the ML model."

Click **"Proceed to Assessment & Pipeline"**.

---

### Step 3 — Assessment & Pipeline Launch (30 seconds)

**Do:** You should now be on the Assessment page.  
**Say:** "The Assessment page confirms the profile and lets us run the full pipeline. When we click Analyze, the system runs a statistical ML prediction followed by four AI agents — all in one API call."

Click **"Analyse My Career"** (or equivalent primary CTA).  
Wait for the pipeline to complete (typically 2–10 seconds).

---

### Step 4 — ML Salary Tier Prediction (60 seconds)

**Do:** The page navigates to ML Outcome.  
**Say:** "This is the ML prediction. The model — Logistic Regression trained on 3,998 engineering graduate records from the AMEO 2015 dataset — estimates a salary tier."

Point out:
1. **Predicted tier** (e.g., "Mid Tier")
2. **Predicted class probabilities** — "These are actual `predict_proba()` outputs from the trained model. Low: X%, Mid: Y%, High: Z%. This is not a confidence score — it's a probability distribution."
3. **What this means section** — read the disclaimer: "This is a historical pattern estimate, not a guarantee."

**Important — what NOT to say:** Do not say "the model says you're suited for tech" or "the model predicts you'll earn ₹X." Say instead: "The model estimates this student's profile pattern aligns with the Mid tier based on historical 2015 data."

---

### Step 5 — Feature Associations (30 seconds)

**Do:** Navigate to Model Explanation.  
**Say:** "The feature association view shows which input dimensions most affected the prediction, measured by permutation importance — shuffling each feature and observing how much the model's accuracy drops."

Point out the top features (typically: Quantitative Score, English Score, 10th Grade %, Specialization).

**Say:** "These are statistical associations — not causal claims. Higher Quant score correlates with higher salary tier in this dataset, but we are not claiming that studying for AMCAT will guarantee a better outcome."

---

### Step 6 — Career Exploration (45 seconds)

**Do:** Click "Career Exploration" in the sidebar.  
**Say:** "The Career Analysis Agent — using O*NET occupational knowledge — identifies occupations worth exploring based on this student's specialisation, aptitude profile, and the ML salary tier context."

Show 2–3 suggested occupations (e.g., Software Developers, Data Scientists).  
**Say:** "Each suggestion comes with a relevance reason referencing actual profile attributes — not generic advice."

Click on one occupation (e.g., "Software Developers").

---

### Step 7 — O*NET Occupation Detail (30 seconds)

**Do:** View the career detail page.  
**Say:** "This occupation data comes from O*NET 28.0 — the U.S. Department of Labor's occupational database, licensed CC BY 4.0. It lists required skills, knowledge areas, technology skills, and representative tasks. This is verified, curated data — not AI-generated."

---

### Step 8 — Skill Gap Analysis (45 seconds)

**Do:** Navigate to Skill Gap.  
**Say:** "Agent 2 compares the student's profile to the O*NET requirements for Software Developers and identifies what's missing."

Point out:
- **Current strengths** (derived from profile data — e.g., Engineering background in CS&E, strong Quant score)
- **Skill gaps** — e.g., Programming, Systems Analysis, Critical Thinking
- **Priority gaps** — top 3 to focus on first
- **Data limitation notice** — "The system is transparent: it acknowledges what it cannot assess from academic records alone."

---

### Step 9 — Learning Roadmap (30 seconds)

**Do:** Navigate to Roadmap.  
**Say:** "Agent 3 builds a phased learning plan to close the identified gaps."

Show the 3–4 phases (Foundation → Core Skills → Applied Practice → Interview Readiness).  
Point out the duration estimates and observable milestones.  
**Say:** "The roadmap deliberately avoids recommending specific paid courses — it describes learning activities generically so students can find free resources independently."

---

### Step 10 — Portfolio Projects (30 seconds)

**Do:** Navigate to Projects.  
**Say:** "Agent 4 suggests concrete, buildable portfolio projects using free, open-source tools."

Show 2–3 projects (e.g., Data Analysis Project using Python/Pandas, Domain-Specific Application).  
Point out the `expected_output` field — "Each project specifies what the completed deliverable looks like, making it actionable."

---

### Step 11 — Final Report (30 seconds)

**Do:** Navigate to Final Report.  
**Say:** "The Final Report consolidates all outputs in one view: the ML prediction with its disclaimer, the career exploration, skill gaps, roadmap, and projects — clearly separated into ML section and AI guidance section."

---

## What to Say When Gemini Is Offline

If Gemini API is unavailable (no key configured), the system runs in deterministic fallback mode. Tell the judges:

> "Gemini AI is not currently configured. The system is running in its offline fallback mode — all four agents produce deterministic, O*NET-grounded guidance. This demonstrates the system's offline resilience, which is an explicit architectural feature."

Show that the `/health` endpoint says `"gemini_available": false` and the API response labels guidance as `"OFFLINE GUIDANCE (Rule-based deterministic grounding on O*NET data)"`.

---

## What to Do If the Backend Fails

**Symptom:** Frontend shows "Cannot connect to backend" or API errors.

**Recovery steps:**
1. Check terminal for error messages.
2. Restart backend: `python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000`
3. Verify health: open `http://127.0.0.1:8000/api/v1/health` in browser.
4. Reload frontend: refresh `http://localhost:3000`.

**If model not loaded:**
```powershell
# Retrain (takes ~30 seconds):
python -m ml.run_pipeline
```

---

## What NOT to Claim During the Demo

| Avoid saying | Say instead |
|---|---|
| "The model predicts your ideal career" | "The model estimates an employment-outcome tier from historical patterns" |
| "You are suited for software development" | "Software development is worth exploring based on your profile" |
| "The AI says you'll earn ₹X" | "The predicted tier reflects 2015 salary distributions — not a current salary forecast" |
| "The model is highly accurate" | "The model achieves Macro-F1 of 0.52 — better than random, but carries substantial uncertainty" |
| "This guarantees employment" | "This is exploratory career intelligence, not a job guarantee" |
| "Gemini makes the prediction" | "Gemini provides career interpretation; the ML model makes the prediction" |
| "This uses real-time market data" | "Career knowledge is from O*NET 28.0, a curated occupational database" |
