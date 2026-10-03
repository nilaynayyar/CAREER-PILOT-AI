"""
CareerPilot AI — Agent Service (Gemini AI Layer)
=================================================
Implements four deterministic agents using Google Gemini.

CRITICAL ARCHITECTURE RULES:
  1. Agents interpret ML output; they NEVER override salary_tier.
  2. All agent outputs are validated against Pydantic schemas.
  3. Every agent has explicit input, output, and error handling.
  4. The application falls back gracefully when Gemini is unavailable.
  5. Only the minimum required information is sent to Gemini (privacy).
  6. Agents never fabricate O*NET data — only use data from onet_service.
  7. No specific external course URLs are generated (may be dead links).

AGENT WORKFLOW (deterministic, not autonomous):
  Profile + ML Result
        ↓
  Agent 1: Career Analysis      → suggests occupations
        ↓
  Agent 2: Skill Gap            → gaps against selected occupation
        ↓
  Agent 3: Learning Roadmap     → phased learning plan
        ↓
  Agent 4: Project Recs         → practical projects to build
"""

from __future__ import annotations

import json
import logging
import re
import textwrap
from typing import Any

import google.generativeai as genai
from pydantic import ValidationError

from backend.app.core.config import settings
from backend.app.schemas import (
    CareerAnalysisOutput,
    DifficultyLevel,
    LearningRoadmapOutput,
    MLPrediction,
    OnetOccupation,
    OccupationSuggestion,
    ProjectRecommendation,
    ProjectsOutput,
    RoadmapPhase,
    SkillGap,
    SkillGapOutput,
    StudentProfile,
)
from backend.app.services import onet_service

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Gemini Initialisation
# ---------------------------------------------------------------------------

_gemini_model = None


def _get_gemini_model():
    global _gemini_model
    if not settings.gemini_available:
        _gemini_model = None
        raise GeminiUnavailableError("GEMINI_API_KEY is not configured.")
    if _gemini_model is None:
        genai.configure(api_key=settings.gemini_api_key)
        _gemini_model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                response_mime_type="application/json",
            ),
            safety_settings={
                "HARASSMENT": "BLOCK_NONE",
                "HATE_SPEECH": "BLOCK_NONE",
                "SEXUALLY_EXPLICIT": "BLOCK_NONE",
                "DANGEROUS_CONTENT": "BLOCK_NONE",
            },
        )
    return _gemini_model


class GeminiUnavailableError(Exception):
    """Raised when Gemini is not configured or unavailable."""


class AgentError(Exception):
    """Raised when an agent fails to produce valid output."""


# ---------------------------------------------------------------------------
# Safe Gemini Call Helper
# ---------------------------------------------------------------------------

def _call_gemini(prompt: str, context: str = "") -> str:
    """
    Call Gemini API with error handling and single retry.
    Returns raw text response.
    """
    model = _get_gemini_model()
    full_prompt = f"{context}\n\n{prompt}" if context else prompt

    try:
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        logger.warning("Gemini call failed: %s. Retrying once.", e)
        try:
            response = model.generate_content(
                full_prompt + "\n\nIMPORTANT: Return valid JSON only."
            )
            return response.text
        except Exception as e2:
            clean_err = re.sub(r"key=[A-Za-z0-9_-]+", "key=[REDACTED]", str(e2))
            raise GeminiUnavailableError(f"Gemini unavailable after retry: {clean_err}") from e2


def _extract_json(text: str) -> Any:
    """Extract JSON from Gemini response, handling markdown code blocks."""
    # Strip markdown code fences if present
    text = re.sub(r"```(?:json)?\s*", "", text).strip()
    text = text.rstrip("`").strip()
    return json.loads(text)


def _validate_and_parse(raw_text: str, schema_class: type, prompt: str) -> Any:
    """
    Parse Gemini JSON response and validate against Pydantic schema.
    Retries once with correction instructions if validation fails.
    """
    try:
        data = _extract_json(raw_text)
        return schema_class(**data)
    except (json.JSONDecodeError, ValidationError, TypeError) as e:
        logger.warning("Schema validation failed (%s): %s. Retrying with correction.", schema_class.__name__, e)
        correction_prompt = (
            f"{prompt}\n\n"
            f"Your previous response could not be parsed as valid JSON matching the required schema.\n"
            f"Error: {e}\n"
            f"Return ONLY valid JSON. No markdown, no explanation text outside the JSON."
        )
        raw_retry = _call_gemini(correction_prompt)
        try:
            data = _extract_json(raw_retry)
            return schema_class(**data)
        except Exception as e2:
            raise AgentError(
                f"Agent failed to produce valid {schema_class.__name__} after retry: {e2}"
            ) from e2


# ---------------------------------------------------------------------------
# Profile Summary (used internally — never log or store the full profile)
# ---------------------------------------------------------------------------

def _build_profile_summary(profile: StudentProfile) -> str:
    """Build a minimal, privacy-safe profile summary for Gemini prompts."""
    cs_field = profile.specialization
    degree = profile.degree
    gpa = profile.college_gpa
    tier = profile.college_tier
    english = profile.english_score
    logical = profile.logical_score
    quant = profile.quant_score
    cp = profile.computer_programming_score

    aptitude_summary = (
        f"AMCAT scores — English: {english}, Logical: {logical}, Quant: {quant}"
    )
    if cp is not None:
        aptitude_summary += f", ComputerProgramming: {cp}"
    else:
        aptitude_summary += ", ComputerProgramming: not taken"

    return textwrap.dedent(f"""
        Degree: {degree} in {cs_field}
        College GPA: {gpa:.1f}%  |  College Tier: {'Tier-1' if tier == 1 else 'Tier-2'}
        {aptitude_summary}
        10th grade: {profile.percentage_10th:.1f}%  |  12th grade: {profile.percentage_12th:.1f}%
        Personality (z-scores): Conscientiousness={profile.conscientiousness:.2f},
          Agreeableness={profile.agreeableness:.2f}, Extraversion={profile.extraversion:.2f},
          Neuroticism={profile.nueroticism:.2f}, Openness={profile.openess_to_experience:.2f}
    """).strip()


# ---------------------------------------------------------------------------
# AGENT 1 — Career Analysis
# ---------------------------------------------------------------------------

CAREER_ANALYSIS_SCHEMA_DESCRIPTION = """
Return a JSON object with this exact structure:
{
  "suggested_occupations": [
    {
      "soc_code": "15-1252.00",
      "title": "Software Developers",
      "relevance_reason": "Brief reason referencing actual profile attributes",
      "onet_evidence": ["List of O*NET skills or knowledge areas that align"]
    }
  ],
  "profile_strengths": ["Strength 1", "Strength 2"],
  "analysis_summary": "Brief honest summary. Must NOT claim deterministic fit.",
  "disclaimer": "These suggestions are starting points for exploration, not guarantees."
}
Suggest 2–4 occupations. Do not exceed 5.
"""

ONET_CONTEXT_TEMPLATE = """
AVAILABLE O*NET OCCUPATIONS (use these SOC codes and titles EXACTLY):
{occupation_list}
"""


def run_career_analysis(
    profile: StudentProfile,
    ml_prediction: MLPrediction,
) -> CareerAnalysisOutput:
    """
    Agent 1: Career Analysis
    Suggests occupational areas worth exploring based on:
      - Student's academic/aptitude profile
      - ML-predicted salary tier (for context only, not to assert a career)
      - O*NET occupational knowledge

    IMPORTANT: The agent NEVER overrides salary_tier.
    IMPORTANT: The agent uses language like "worth exploring", not "you should be".
    """
    if not settings.gemini_available:
        return _fallback_career_analysis(profile, ml_prediction)

    # Build O*NET context from candidates for this tier
    candidate_occs = onet_service.get_occupations_for_tier(ml_prediction.salary_tier.value)
    all_occs = onet_service.get_all_occupations()
    # Include all occupations so agent can make informed choices
    occ_list = "\n".join(
        f"  {occ.soc_code}: {occ.title} — Skills: {', '.join(occ.skills[:5])}"
        for occ in all_occs
    )

    profile_summary = _build_profile_summary(profile)
    tier_probs = ml_prediction.probabilities

    prompt = textwrap.dedent(f"""
        You are a career guidance assistant. Based on the student's profile and O*NET data below,
        suggest 2–4 occupations worth exploring.

        IMPORTANT RULES:
        - Use cautious language: "worth exploring", "may be relevant", "consider investigating"
        - Do NOT say "you are destined for" or "you are best suited for"
        - Only suggest occupations from the O*NET list provided
        - Reference actual profile attributes in relevance_reason
        - onet_evidence must list real O*NET skills from the occupation data
        - This student's ML salary tier prediction is: {ml_prediction.salary_tier.value}
          (Low={tier_probs.get('Low', 0):.1%}, Mid={tier_probs.get('Mid', 0):.1%}, High={tier_probs.get('High', 0):.1%})
        - CRITICAL: The salary tier is strictly an empirical employment-outcome context variable from AMEO 2015.
          It does NOT measure, assert, or imply candidate suitability for any specific occupation.
        - Do NOT rank or select occupations merely because they correspond to a higher salary tier.
        - Suggest and rank occupations purely based on domain relevance to the student's specialization,
          cognitive aptitude profile, and O*NET skill overlap.

        STUDENT PROFILE:
        {profile_summary}

        {ONET_CONTEXT_TEMPLATE.format(occupation_list=occ_list)}

        {CAREER_ANALYSIS_SCHEMA_DESCRIPTION}
    """)

    raw = _call_gemini(prompt)
    return _validate_and_parse(raw, CareerAnalysisOutput, prompt)


def _fallback_career_analysis(
    profile: StudentProfile, ml_prediction: MLPrediction
) -> CareerAnalysisOutput:
    """Rule-based fallback when Gemini is unavailable, grounded in student specialization."""
    candidate_occs = onet_service.get_occupations_for_specialization(profile.specialization)
    suggestions = []
    for occ in candidate_occs[:3]:
        suggestions.append(OccupationSuggestion(
            soc_code=occ.soc_code,
            title=occ.title,
            relevance_reason=(
                f"This occupation aligns with curriculum and domain foundations in {profile.specialization}. "
                f"O*NET highlights key competencies in {', '.join(occ.skills[:3])}."
            ),
            onet_evidence=occ.skills[:4],
        ))

    return CareerAnalysisOutput(
        suggested_occupations=suggestions,
        profile_strengths=[
            f"Engineering background in {profile.specialization}",
            f"College GPA of {profile.college_gpa:.1f}%",
            f"AMCAT Quant score of {profile.quant_score}",
        ],
        analysis_summary=(
            "Occupations worth exploring identified using O*NET occupational data mapped to student specialization. "
            "Gemini AI is not available — AI-enhanced analysis is disabled."
        ),
    )


# ---------------------------------------------------------------------------
# AGENT 2 — Skill Gap Analysis
# ---------------------------------------------------------------------------

SKILL_GAP_SCHEMA_DESCRIPTION = """
Return a JSON object with this exact structure:
{
  "occupation_title": "Title of the selected occupation",
  "soc_code": "SOC code",
  "current_strengths": ["Strength 1 (based on profile data)", "Strength 2"],
  "skill_gaps": [
    {
      "skill_name": "Skill name",
      "gap_description": "What is lacking and why it matters",
      "source": "onet",
      "priority": "high"
    }
  ],
  "priority_gaps": ["Gap 1", "Gap 2", "Gap 3"],
  "data_limitation": "What the profile cannot capture"
}
Do NOT fabricate current skill levels — only reference the provided profile data.
"""


def run_skill_gap(
    profile: StudentProfile,
    ml_prediction: MLPrediction,
    selected_soc_code: str,
) -> SkillGapOutput:
    """
    Agent 2: Skill Gap Analysis
    Compares student's observable profile to O*NET requirements.

    IMPORTANT: Does not fabricate skill levels not evident in the profile.
    IMPORTANT: Distinguishes observed data vs O*NET requirements vs LLM inference.
    """
    occupation = onet_service.get_occupation(selected_soc_code)
    if occupation is None:
        raise AgentError(f"Occupation {selected_soc_code} not found in O*NET data.")

    if not settings.gemini_available:
        return _fallback_skill_gap(profile, occupation)

    profile_summary = _build_profile_summary(profile)
    skills_list = "\n".join(f"  - {s}" for s in occupation.skills)
    knowledge_list = "\n".join(f"  - {k}" for k in occupation.knowledge_areas)
    tech_list = "\n".join(f"  - {t}" for t in occupation.tech_skills)

    prompt = textwrap.dedent(f"""
        You are a career skills analyst. Identify skill gaps between the student's profile
        and the O*NET requirements for the target occupation.

        IMPORTANT RULES:
        - current_strengths must ONLY reference actual profile data (grades, AMCAT scores, specialization)
        - skill_gaps must ONLY reference O*NET skills/knowledge/tech listed below
        - source must be "onet" for gaps based on O*NET data
        - Do NOT invent skill levels not present in the profile
        - Do NOT claim the student has specific programming skills unless stated in the profile

        STUDENT PROFILE:
        {profile_summary}

        TARGET OCCUPATION: {occupation.title} ({occupation.soc_code})

        O*NET REQUIRED SKILLS:
        {skills_list}

        O*NET KNOWLEDGE AREAS:
        {knowledge_list}

        O*NET TECHNOLOGY SKILLS:
        {tech_list}

        {SKILL_GAP_SCHEMA_DESCRIPTION}
    """)

    raw = _call_gemini(prompt)
    return _validate_and_parse(raw, SkillGapOutput, prompt)


def _fallback_skill_gap(profile: StudentProfile, occupation: OnetOccupation) -> SkillGapOutput:
    """Rule-based fallback skill gap when Gemini unavailable."""
    strengths = [
        f"Engineering specialization: {profile.specialization}",
        f"Academic performance: GPA {profile.college_gpa:.1f}%, 10th {profile.percentage_10th:.1f}%",
        f"Quantitative aptitude score: {profile.quant_score} (AMCAT)",
        f"English aptitude score: {profile.english_score} (AMCAT)",
    ]

    gaps = [
        SkillGap(
            skill_name=skill,
            gap_description=f"O*NET identifies {skill} as a core requirement for {occupation.title}. Profile data does not confirm this skill.",
            source="onet",
            priority="high" if i < 3 else "medium",
        )
        for i, skill in enumerate(occupation.skills[:6])
    ]

    return SkillGapOutput(
        occupation_title=occupation.title,
        soc_code=occupation.soc_code,
        current_strengths=strengths,
        skill_gaps=gaps,
        priority_gaps=[g.skill_name for g in gaps[:3]],
    )


# ---------------------------------------------------------------------------
# AGENT 3 — Learning Roadmap
# ---------------------------------------------------------------------------

ROADMAP_SCHEMA_DESCRIPTION = """
Return a JSON object with this exact structure:
{
  "occupation_title": "Target occupation title",
  "total_estimated_duration": "e.g. '4-6 months'",
  "phases": [
    {
      "phase_number": 1,
      "phase_name": "Foundation",
      "duration_estimate": "2-3 weeks",
      "skills_covered": ["Skill A", "Skill B"],
      "learning_activities": [
        "Practice activity description (no specific URLs)",
        "Another activity"
      ],
      "milestone": "Observable outcome for this phase"
    }
  ],
  "general_advice": "General actionable advice",
  "disclaimer": "This is AI-generated guidance, not a guaranteed curriculum."
}
Generate 3–5 phases. Do NOT include specific course URLs or platform links.
Use generic activity descriptions (e.g., 'work through structured exercises', not 'take Course X on Platform Y').
"""


def run_learning_roadmap(
    profile: StudentProfile,
    skill_gap: SkillGapOutput,
) -> LearningRoadmapOutput:
    """
    Agent 3: Learning Roadmap Generator
    Builds a structured, phased roadmap to address identified skill gaps.

    IMPORTANT: Does not claim specific external courses or resources.
    """
    if not settings.gemini_available:
        return _fallback_roadmap(profile, skill_gap)

    profile_summary = _build_profile_summary(profile)
    priority_gaps_str = "\n".join(f"  - {g}" for g in skill_gap.priority_gaps)
    all_gaps_str = "\n".join(f"  - {g.skill_name}: {g.gap_description}" for g in skill_gap.skill_gaps)

    prompt = textwrap.dedent(f"""
        You are a learning advisor. Create a structured, phased learning roadmap to help a student
        develop the skills needed for the target occupation.

        IMPORTANT RULES:
        - Do NOT reference specific course names, URLs, or platform links (they may not exist or may be paid)
        - Use generic activity descriptions: "practice with structured exercises", "build projects using X concept"
        - Each phase must have a clear, achievable milestone
        - Account for the student's existing profile strengths when setting prerequisites
        - Be realistic about time estimates

        STUDENT PROFILE:
        {profile_summary}

        TARGET OCCUPATION: {skill_gap.occupation_title} ({skill_gap.soc_code})

        PRIORITY SKILL GAPS:
        {priority_gaps_str}

        ALL SKILL GAPS:
        {all_gaps_str}

        CURRENT STRENGTHS (do not re-teach these):
        {chr(10).join(f"  - {s}" for s in skill_gap.current_strengths)}

        {ROADMAP_SCHEMA_DESCRIPTION}
    """)

    raw = _call_gemini(prompt)
    return _validate_and_parse(raw, LearningRoadmapOutput, prompt)


def _fallback_roadmap(profile: StudentProfile, skill_gap: SkillGapOutput) -> LearningRoadmapOutput:
    """Structured fallback roadmap when Gemini unavailable."""
    phases = [
        RoadmapPhase(
            phase_number=1,
            phase_name="Foundation",
            duration_estimate="3-4 weeks",
            skills_covered=skill_gap.priority_gaps[:2] if skill_gap.priority_gaps else ["Core Skills"],
            learning_activities=[
                "Review fundamentals through textbooks or free online materials",
                "Practice problem-solving exercises daily",
            ],
            milestone="Comfortable with foundational concepts",
        ),
        RoadmapPhase(
            phase_number=2,
            phase_name="Core Skills Development",
            duration_estimate="4-6 weeks",
            skills_covered=skill_gap.priority_gaps[2:4] if len(skill_gap.priority_gaps) > 2 else ["Applied Skills"],
            learning_activities=[
                "Apply skills in small practical exercises",
                "Build a simple project demonstrating core competencies",
            ],
            milestone="Complete a demonstrable small project",
        ),
        RoadmapPhase(
            phase_number=3,
            phase_name="Applied Practice & Portfolio",
            duration_estimate="4-8 weeks",
            skills_covered=["Portfolio development", "Real-world application"],
            learning_activities=[
                "Build a portfolio project relevant to target occupation",
                "Contribute to open-source or community projects",
            ],
            milestone="Portfolio project ready for review",
        ),
        RoadmapPhase(
            phase_number=4,
            phase_name="Interview & Job Readiness",
            duration_estimate="2-3 weeks",
            skills_covered=["Communication", "Technical interview preparation"],
            learning_activities=[
                "Practice explaining your projects clearly",
                "Prepare for technical assessments in the target domain",
            ],
            milestone="Ready to apply for entry-level positions",
        ),
    ]
    return LearningRoadmapOutput(
        occupation_title=skill_gap.occupation_title,
        total_estimated_duration="3-5 months",
        phases=phases,
        general_advice=(
            "Focus on building demonstrable skills rather than collecting certificates. "
            "Employers value practical ability. Start with the priority gaps identified above."
        ),
    )


# ---------------------------------------------------------------------------
# AGENT 4 — Project Recommendations
# ---------------------------------------------------------------------------

PROJECTS_SCHEMA_DESCRIPTION = """
Return a JSON object with this exact structure:
{
  "occupation_title": "Target occupation title",
  "projects": [
    {
      "title": "Project title",
      "objective": "What the student will build and why",
      "skills_developed": ["Skill 1", "Skill 2"],
      "difficulty": "Beginner",
      "suggested_technologies": ["Technology 1", "Technology 2"],
      "expected_output": "What the completed project looks like",
      "prerequisite": "What the student needs to know first (or null)"
    }
  ],
  "general_tip": "One actionable tip for making projects stand out"
}
Suggest 2–4 projects. Difficulty must be one of: Beginner, Intermediate, Advanced.
Do NOT recommend dangerous, illegal, or deceptive activities.
"""


def run_project_recommendations(
    profile: StudentProfile,
    skill_gap: SkillGapOutput,
) -> ProjectsOutput:
    """
    Agent 4: Project Recommendations
    Recommends practical, buildable projects that address skill gaps.
    """
    if not settings.gemini_available:
        return _fallback_projects(profile, skill_gap)

    profile_summary = _build_profile_summary(profile)
    occupation = onet_service.get_occupation(skill_gap.soc_code)
    tech_skills = occupation.tech_skills[:8] if occupation else []
    tech_str = ", ".join(tech_skills) if tech_skills else "relevant technologies"

    prompt = textwrap.dedent(f"""
        You are a project advisor. Recommend 2–4 practical, buildable projects that will help
        the student develop skills needed for the target occupation.

        IMPORTANT RULES:
        - Projects must be realistic for a student to build independently
        - Difficulty must be one of: "Beginner", "Intermediate", "Advanced"
        - suggested_technologies must be real, free/open-source tools
        - Do NOT recommend dangerous, illegal, or deceptive activities
        - expected_output must describe a concrete deliverable
        - Start with easier projects and progress to more complex ones

        STUDENT PROFILE:
        {profile_summary}

        TARGET OCCUPATION: {skill_gap.occupation_title}
        RELEVANT TECHNOLOGIES: {tech_str}
        PRIORITY SKILL GAPS TO ADDRESS: {', '.join(skill_gap.priority_gaps[:4])}

        {PROJECTS_SCHEMA_DESCRIPTION}
    """)

    raw = _call_gemini(prompt)
    return _validate_and_parse(raw, ProjectsOutput, prompt)


def _fallback_projects(profile: StudentProfile, skill_gap: SkillGapOutput) -> ProjectsOutput:
    """Fallback project recommendations when Gemini unavailable."""
    occupation = onet_service.get_occupation(skill_gap.soc_code)
    tech_skills = occupation.tech_skills[:4] if occupation else ["Python", "SQL"]

    projects = [
        ProjectRecommendation(
            title=f"Personal Portfolio Website",
            objective="Build a personal portfolio website showcasing your skills and projects",
            skills_developed=["Web fundamentals", "Communication", "Self-presentation"],
            difficulty=DifficultyLevel.BEGINNER,
            suggested_technologies=["HTML", "CSS", "JavaScript"],
            expected_output="A live portfolio website with your profile and projects",
            prerequisite=None,
        ),
        ProjectRecommendation(
            title=f"Data Analysis Project",
            objective=f"Analyse a public dataset relevant to {skill_gap.occupation_title}",
            skills_developed=skill_gap.priority_gaps[:2] + ["Data analysis"],
            difficulty=DifficultyLevel.INTERMEDIATE,
            suggested_technologies=["Python", "Pandas", "Matplotlib"],
            expected_output="A Jupyter notebook with analysis findings and visualisations",
            prerequisite="Basic Python programming",
        ),
        ProjectRecommendation(
            title=f"Domain-Specific Application",
            objective=f"Build a small application demonstrating core skills for {skill_gap.occupation_title}",
            skills_developed=skill_gap.priority_gaps[:3],
            difficulty=DifficultyLevel.INTERMEDIATE,
            suggested_technologies=tech_skills[:3],
            expected_output="A working application with documentation and test cases",
            prerequisite="Completion of Data Analysis Project",
        ),
    ]

    return ProjectsOutput(
        occupation_title=skill_gap.occupation_title,
        projects=projects,
        general_tip=(
            "Document your projects clearly with a README explaining what you built, "
            "why you built it, and what you learned. This matters as much as the code."
        ),
    )


# ---------------------------------------------------------------------------
# Full Orchestrated Workflow
# ---------------------------------------------------------------------------

def run_full_workflow(
    profile: StudentProfile,
    ml_prediction: MLPrediction,
    feature_explanation: Any,
    selected_soc_code: str | None = None,
) -> dict[str, Any]:
    """
    Run the complete 4-agent pipeline in deterministic order.
    Returns a dict with all agent outputs and status information.

    Step 1: Career Analysis → suggests occupations
    Step 2: Select occupation (use selected_soc_code if provided, else first suggestion)
    Step 3: Skill Gap
    Step 4: Learning Roadmap
    Step 5: Project Recommendations
    """
    result: dict[str, Any] = {
        "status": "running",
        "steps": {},
        "errors": [],
    }

    # Determine source tag used for all steps in this run.
    # Each per-agent function checks gemini_available internally and returns
    # via its fallback path (no exception raised). We therefore must read the
    # flag here so the workflow step statuses accurately reflect the source.
    _gemini_live = settings.gemini_available

    # --- Step 1: Career Analysis ---
    try:
        career_analysis = run_career_analysis(profile, ml_prediction)
        _ca_status = "ok" if _gemini_live else "fallback"
        result["steps"]["career_analysis"] = {"status": _ca_status, "output": career_analysis}
    except (AgentError, GeminiUnavailableError) as e:
        logger.error("Career Analysis failed: %s", e)
        career_analysis = _fallback_career_analysis(profile, ml_prediction)
        result["steps"]["career_analysis"] = {"status": "fallback", "output": career_analysis, "error": str(e)}

    # --- Step 2: Select occupation ---
    if selected_soc_code:
        chosen_soc = selected_soc_code
    elif career_analysis.suggested_occupations:
        chosen_soc = career_analysis.suggested_occupations[0].soc_code
    else:
        chosen_soc = "15-1252.00"  # fallback to Software Developers

    selected_occupation = onet_service.get_occupation(chosen_soc)
    if selected_occupation is None:
        all_occs = onet_service.get_all_occupations()
        selected_occupation = all_occs[0] if all_occs else None

    # --- Step 3: Skill Gap ---
    try:
        skill_gap = run_skill_gap(profile, ml_prediction, chosen_soc)
        _sg_status = "ok" if _gemini_live else "fallback"
        result["steps"]["skill_gap"] = {"status": _sg_status, "output": skill_gap}
    except (AgentError, GeminiUnavailableError) as e:
        logger.error("Skill Gap failed: %s", e)
        occ = selected_occupation
        skill_gap = _fallback_skill_gap(profile, occ) if occ else SkillGapOutput(
            occupation_title="Unknown",
            soc_code=chosen_soc,
            current_strengths=[],
            skill_gaps=[],
            priority_gaps=[],
        )
        result["steps"]["skill_gap"] = {"status": "fallback", "output": skill_gap, "error": str(e)}

    # --- Step 4: Learning Roadmap ---
    try:
        roadmap = run_learning_roadmap(profile, skill_gap)
        _rm_status = "ok" if _gemini_live else "fallback"
        result["steps"]["roadmap"] = {"status": _rm_status, "output": roadmap}
    except (AgentError, GeminiUnavailableError) as e:
        logger.error("Roadmap failed: %s", e)
        roadmap = _fallback_roadmap(profile, skill_gap)
        result["steps"]["roadmap"] = {"status": "fallback", "output": roadmap, "error": str(e)}

    # --- Step 5: Project Recommendations ---
    try:
        projects = run_project_recommendations(profile, skill_gap)
        _pr_status = "ok" if _gemini_live else "fallback"
        result["steps"]["projects"] = {"status": _pr_status, "output": projects}
    except (AgentError, GeminiUnavailableError) as e:
        logger.error("Projects failed: %s", e)
        projects = _fallback_projects(profile, skill_gap)
        result["steps"]["projects"] = {"status": "fallback", "output": projects, "error": str(e)}

    result["status"] = "complete"
    result["career_analysis"] = career_analysis
    result["skill_gap"] = skill_gap
    result["roadmap"] = roadmap
    result["projects"] = projects
    result["selected_occupation"] = selected_occupation

    return result
