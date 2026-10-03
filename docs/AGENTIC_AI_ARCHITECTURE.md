# CareerPilot AI — Agentic AI Architecture

**Version:** 3.0.0  
**Implementation:** `backend/app/services/agent_service.py`  
**Schemas:** `backend/app/schemas.py`  

---

## 1. What Makes This System Agentic

CareerPilot AI implements an agentic architecture in the following specific, verifiable senses:

1. **Sequential agent pipeline**: Four distinct agents run in deterministic order, each consuming the output of the previous agent.
2. **Structured output generation**: Each agent is required to return JSON conforming to a strict Pydantic schema — not free-form text.
3. **Retry with self-correction**: If an agent's response fails schema validation, the system generates a correction prompt describing the specific validation error and retries once.
4. **Graceful degradation**: If all attempts fail, or if Gemini is unavailable, the system substitutes a deterministic rule-based fallback agent — the system never fails catastrophically.
5. **Tool use (data grounding)**: Agents are provided with verified O*NET occupational data as context, constraining responses to real occupational knowledge rather than fabrication.
6. **Guardrailed prompts**: Each agent prompt explicitly prohibits harmful behaviours (hallucinating skill levels, inventing course URLs, claiming career determinism).

### What this is NOT:

- **Not autonomous decision-making**: Agents run in a fixed, deterministic sequence. There is no dynamic routing, backtracking, or autonomous goal-pursuit.
- **Not a ReAct or CoT agent**: No chain-of-thought reasoning or external tool calls are implemented (O*NET data is provided as context within the prompt).
- **Not an ML prediction engine**: Gemini and all agents operate downstream of the ML prediction. They interpret the ML result; they cannot modify or override `salary_tier`.

---

## 2. Architectural Separation of Concerns

```
ML Layer (scikit-learn)                   Agentic Layer (Gemini + Fallback)
─────────────────────────────             ─────────────────────────────────────
Trained on AMEO 2015 dataset              Uses O*NET occupational knowledge
Predicts SalaryTier (Low/Mid/High)        Interprets ML result for career context
Returns predicted probabilities           Identifies skill gaps, builds roadmaps
Runs permutation feature analysis         Recommends portfolio projects
AUTHORITATIVE — never modified            ADVISORY — exploratory, not prescriptive
────────────────────────────────         ─────────────────────────────────────────
Runs without internet access             Requires Gemini API key (optional)
Always available                         Falls back to deterministic O*NET logic
```

---

## 3. Agent 1: Career Analysis Agent

### Purpose
Identifies occupations worth exploring based on the student's specialisation, aptitude profile, and O*NET skill overlap. Uses the ML salary tier as contextual background — not as a deterministic career assignment.

### Input
- `StudentProfile` (full validated profile)
- `MLPrediction` (salary tier + probabilities)
- All 10 O*NET occupations (provided as formatted context in the prompt)

### Processing
The agent receives a structured prompt containing:
1. The student's academic/aptitude summary (no PII)
2. The ML prediction with explicit disclaimer about its scope
3. A list of available O*NET occupations with their top skills
4. Explicit instructions to use cautious language ("worth exploring", "may be relevant")
5. Prohibition on deterministic career claims

**Gemini call parameters:** `temperature=0.3`, `response_mime_type="application/json"`

### Output Schema (`CareerAnalysisOutput`)
```json
{
  "suggested_occupations": [
    {
      "soc_code": "15-1252.00",
      "title": "Software Developers",
      "relevance_reason": "string referencing actual profile data",
      "onet_evidence": ["list of O*NET skills supporting the suggestion"]
    }
  ],
  "profile_strengths": ["Observable strength from profile data"],
  "analysis_summary": "Honest summary without deterministic career claims",
  "disclaimer": "Standard exploration disclaimer"
}
```
Constraints: 1–5 occupations. SOC codes must be from the provided O*NET list.

### Validation
Pydantic validates: `min_length=1, max_length=5` for `suggested_occupations`. If Gemini returns malformed JSON or an invalid SOC code, the correction retry is triggered.

### Fallback Behaviour
When Gemini is unavailable: the fallback uses `onet_service.get_occupations_for_specialization()` to select up to 3 occupations matching the student's engineering discipline. All `relevance_reason` fields are generated from actual profile data and O*NET skill lists — no invented text.

---

## 4. Agent 2: Skill Gap Agent

### Purpose
Compares the student's observable profile to the O*NET skill requirements for a specific occupation. Identifies what skills the student needs to develop and which are already evidenced in the profile.

### Input
- `StudentProfile`
- `MLPrediction`
- `selected_soc_code` (SOC code of the target occupation)
- Full O*NET occupation record for the selected SOC (skills, knowledge, tech skills)

### Processing
The agent receives:
1. The student profile summary
2. The complete O*NET skill, knowledge, and tech skill lists for the target occupation
3. Explicit prohibition on inventing skill levels not present in the profile
4. Instruction that `source` field must be "onet" for all gaps derived from O*NET data

### Output Schema (`SkillGapOutput`)
```json
{
  "occupation_title": "string",
  "soc_code": "string",
  "current_strengths": ["Strength observable from profile data"],
  "skill_gaps": [
    {
      "skill_name": "Programming",
      "gap_description": "Why this gap exists and why it matters",
      "source": "onet",
      "priority": "high"
    }
  ],
  "priority_gaps": ["Gap 1", "Gap 2", "Gap 3"],
  "data_limitation": "What the profile cannot capture"
}
```

### Validation
Pydantic validates `source` and `priority` enums. The auto-populated `gap_summary` field is generated by a model validator if not provided.

### Fallback Behaviour
When Gemini is unavailable: lists the first 6 O*NET skills for the target occupation as gaps, with the top 3 marked high priority. `current_strengths` are derived directly from profile field values (GPA, AMCAT scores, specialisation).

---

## 5. Agent 3: Learning Roadmap Agent

### Purpose
Generates a phased, time-estimated learning plan to address the skill gaps identified by Agent 2. Does not reference specific course names, URLs, or paid platforms.

### Input
- `StudentProfile`
- `SkillGapOutput` from Agent 2 (priority gaps, all gaps, current strengths)

### Processing
The agent receives:
1. Student profile summary
2. Target occupation and SOC code
3. Priority and full skill gap lists
4. Current strengths (to avoid re-teaching)
5. Explicit prohibition on specific course URLs
6. Instruction to use generic activity descriptions

### Output Schema (`LearningRoadmapOutput`)
```json
{
  "occupation_title": "string",
  "total_estimated_duration": "e.g. '4-6 months'",
  "phases": [
    {
      "phase_number": 1,
      "phase_name": "Foundation",
      "duration_estimate": "2-3 weeks",
      "skills_covered": ["Skill A", "Skill B"],
      "learning_activities": ["Generic activity description"],
      "milestone": "Observable, achievable outcome"
    }
  ],
  "general_advice": "Actionable general guidance",
  "disclaimer": "Standard AI-generated guidance disclaimer"
}
```
Constraints: 2–6 phases.

### Validation
Pydantic validates `min_length=2, max_length=6` for `phases`. Backward-compatible aliases (`focus_skills`, `recommended_activities`, `duration_weeks`) are normalised via model validators.

### Fallback Behaviour
When Gemini is unavailable: generates a fixed 4-phase roadmap (Foundation → Core Skills → Applied Practice → Interview Readiness) populated with priority gaps from Agent 2. Duration estimates are generic but realistic.

---

## 6. Agent 4: Project Recommendation Agent

### Purpose
Recommends concrete, buildable portfolio projects that help the student demonstrate skills for the target occupation. All suggested technologies must be free and open-source.

### Input
- `StudentProfile`
- `SkillGapOutput` from Agent 2
- O*NET tech skills for the target occupation (top 8)

### Processing
The agent receives:
1. Student profile summary
2. Target occupation
3. Relevant O*NET technology skills
4. Priority skill gaps to address
5. Explicit instructions: 2–4 projects, realistic for independent build, concrete deliverables, free tools only

### Output Schema (`ProjectsOutput`)
```json
{
  "occupation_title": "string",
  "projects": [
    {
      "title": "Project title",
      "objective": "What the student builds and why",
      "skills_developed": ["Skill 1", "Skill 2"],
      "difficulty": "Beginner",
      "suggested_technologies": ["Python", "Git"],
      "expected_output": "Concrete deliverable description",
      "prerequisite": "Required prior knowledge or null"
    }
  ],
  "general_tip": "Actionable tip for making projects stand out"
}
```
Constraints: 2–5 projects, `difficulty` must be one of `Beginner | Intermediate | Advanced`.

### Validation
Pydantic validates the `DifficultyLevel` enum. Projects must have concrete `expected_output` fields — they are not optional.

### Fallback Behaviour
When Gemini is unavailable: generates 3 standard projects (Portfolio Website, Data Analysis Project, Domain-Specific Application) using actual O*NET tech skills from the target occupation and actual priority gaps from Agent 2.

---

## 7. Orchestration: Full Workflow

```python
run_full_workflow(profile, ml_prediction, feature_explanation, selected_soc_code)
    ↓
Step 1: run_career_analysis(profile, ml_prediction)
    └─ Fallback on error → _fallback_career_analysis()
    ↓
Step 2: Select SOC code
    (use selected_soc_code if provided, else first suggestion from Agent 1)
    ↓
Step 3: run_skill_gap(profile, ml_prediction, chosen_soc)
    └─ Fallback on error → _fallback_skill_gap(profile, occupation)
    ↓
Step 4: run_learning_roadmap(profile, skill_gap)
    └─ Fallback on error → _fallback_roadmap(profile, skill_gap)
    ↓
Step 5: run_project_recommendations(profile, skill_gap)
    └─ Fallback on error → _fallback_projects(profile, skill_gap)
    ↓
Return: { career_analysis, skill_gap, roadmap, projects, selected_occupation, steps }
```

Each step records its status (`"ok"` or `"fallback"`) and source (`"gemini"` or `"fallback"`) in the response.

---

## 8. Gemini Integration Details

| Parameter | Value |
|---|---|
| Model | `gemini-1.5-flash` |
| Temperature | 0.3 (low, for factual consistency) |
| Response MIME type | `application/json` (enforced) |
| Max retries | 1 (correction prompt on validation failure) |
| API key location | `.env` file — never frontend-exposed |
| Privacy | Only anonymised profile summaries sent; no PII |

> **Note:** The `google-generativeai` package generates a `FutureWarning` in test output, indicating that `google.generativeai` is deprecated in favour of `google.genai`. This is a package deprecation warning — functionality is unaffected for the current project. Migration to `google.genai` would be a recommended future improvement.

---

## 9. Pydantic Schema Validation

All agent outputs are validated against strict Pydantic v2 schemas defined in `backend/app/schemas.py`. Key validation rules:

- `suggested_occupations`: 1–5 items (validated by `min_length`/`max_length`)
- `phases`: 2–6 items
- `projects`: 2–5 items
- `priority` field in `SkillGap`: validated against `{"high", "medium", "low"}`
- `difficulty` in `ProjectRecommendation`: validated against `DifficultyLevel` enum
- Backward-compatible aliases normalised via `@model_validator(mode="before")`

If Gemini returns a response that fails Pydantic validation, the system:
1. Logs the specific validation error
2. Sends a correction prompt to Gemini describing the error
3. If the retry also fails, raises `AgentError` and the fallback is invoked

---

## 10. Architectural Invariants

The following invariants are enforced and tested:

1. `salary_tier` in the ML prediction is **immutable**: no agent, downstream service, or API handler modifies it.
2. Career exploration suggestions are **never presented as ML predictions**: they are always labelled as O*NET-grounded guidance.
3. The system **never claims Gemini makes the ML prediction**: the ML section and AI guidance section are structurally separated in the API response.
4. Occupation suggestions **only use SOC codes present in the local O*NET dataset**: agents cannot invent new occupations.

Test: `test_architectural_invariance` in `backend/tests/test_api.py` verifies invariant 1 by checking that the salary tier returned by `/predict` is preserved unchanged in the `/careerpilot` response.
