"""
CareerPilot AI — Pydantic Schemas
===================================
Defines all request/response data contracts.

ARCHITECTURE PRINCIPLE:
  ML prediction (SalaryTier) is NEVER modified by agents.
  Agents interpret and extend the ML result; they do not replace it.
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator


# ===========================================================================
# Enums
# ===========================================================================

class SalaryTier(str, Enum):
    LOW = "Low"
    MID = "Mid"
    HIGH = "High"


class DifficultyLevel(str, Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


# ===========================================================================
# Student Profile Schema
# Feature names MUST match model_metadata.json feature_list exactly.
# ===========================================================================

VALID_SPECIALIZATIONS = [
    "Computer Science & Engineering",
    "Computer Engineering",
    "Information Technology",
    "Electronics and Communication Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Electronics and Electrical Engineering",
    "Industrial & Production Engineering",
    "Telecommunication Engineering",
    "Information Science",
    "Instrumentation Engineering",
    "Mechatronics",
    "Aeronautical Engineering",
    "Other Engineering",
]

VALID_DEGREES = [
    "B.Tech/B.E.",
    "M.Tech./M.E.",
    "MCA",
    "B.Sc.",
    "M.Sc.",
    "Other",
]


class StudentProfile(BaseModel):
    """
    Validated student profile matching the exact features expected by
    ml/models/final_model.joblib (see model_metadata.json feature_list).

    Fields marked Optional accept None / missing values; the ML pipeline
    will impute them using the training-set median.
    """

    # Academic grades
    percentage_10th: float = Field(
        alias="10percentage",
        ge=0.0, le=100.0,
        description="10th grade percentage score (0–100)",
        examples=[78.5],
    )
    percentage_12th: float = Field(
        alias="12percentage",
        ge=0.0, le=100.0,
        description="12th grade percentage score (0–100)",
        examples=[72.0],
    )
    college_gpa: float = Field(
        alias="collegeGPA",
        ge=0.0, le=100.0,
        description="College cumulative GPA on percentage scale (0–100)",
        examples=[70.5],
    )
    college_tier: int = Field(
        alias="CollegeTier",
        ge=1, le=2,
        description="College tier: 1 = Tier-1 institution, 2 = Tier-2",
        examples=[2],
    )

    # AMCAT aptitude scores (approximate range 100–900)
    english_score: int = Field(
        alias="English",
        ge=100, le=900,
        description="AMCAT English aptitude score (approx. 100–900)",
        examples=[480],
    )
    logical_score: int = Field(
        alias="Logical",
        ge=100, le=900,
        description="AMCAT Logical reasoning score (approx. 100–900)",
        examples=[490],
    )
    quant_score: int = Field(
        alias="Quant",
        ge=100, le=900,
        description="AMCAT Quantitative aptitude score (approx. 100–900)",
        examples=[510],
    )
    computer_programming_score: int | None = Field(
        alias="ComputerProgramming",
        default=None,
        ge=100, le=900,
        description="AMCAT Computer Programming score (100–900). Leave blank if not taken.",
        examples=[420],
    )

    # Big Five personality (OCEAN, z-score standardised, approx. -4 to +4)
    conscientiousness: float = Field(
        ge=-5.0, le=5.0,
        description="Big Five Conscientiousness (z-score, approx. -4 to +4)",
        examples=[0.5],
    )
    agreeableness: float = Field(
        ge=-5.0, le=5.0,
        description="Big Five Agreeableness (z-score)",
        examples=[0.3],
    )
    extraversion: float = Field(
        ge=-5.0, le=5.0,
        description="Big Five Extraversion (z-score)",
        examples=[-0.1],
    )
    nueroticism: float = Field(
        ge=-5.0, le=5.0,
        description="Big Five Neuroticism (z-score; note: source data spelling preserved)",
        examples=[-0.2],
    )
    openess_to_experience: float = Field(
        ge=-5.0, le=5.0,
        description="Big Five Openness to Experience (z-score; source data spelling preserved)",
        examples=[0.1],
    )

    # Categorical
    specialization: str = Field(
        alias="Specialization",
        description="Engineering specialization / field of study",
        examples=["Computer Science & Engineering"],
    )
    degree: str = Field(
        alias="Degree",
        description="Degree type",
        examples=["B.Tech/B.E."],
    )

    model_config = {"populate_by_name": True}

    @model_validator(mode="before")
    @classmethod
    def normalize_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Normalize alternative spellings and aliases
            mapping = {
                "neuroticism": "nueroticism",
                "openness_to_experience": "openess_to_experience",
                "tenth_percentage": "10percentage",
                "percentage_10th": "10percentage",
                "twelfth_percentage": "12percentage",
                "percentage_12th": "12percentage",
                "college_gpa": "collegeGPA",
                "college_tier": "CollegeTier",
                "english_score": "English",
                "logical_score": "Logical",
                "quant_score": "Quant",
                "computer_programming_score": "ComputerProgramming",
                "computer_programming": "ComputerProgramming",
                "specialization": "Specialization",
                "degree": "Degree",
            }
            normalized = dict(data)
            for alt_key, canonical in mapping.items():
                if alt_key in normalized and canonical not in normalized:
                    normalized[canonical] = normalized[alt_key]
            return normalized
        return data

    @field_validator("specialization")
    @classmethod
    def validate_specialization(cls, v: str) -> str:
        v_clean = v.strip() if isinstance(v, str) else v
        if v_clean not in VALID_SPECIALIZATIONS:
            raise ValueError(
                f"'{v}' is not a recognised specialization. "
                f"Valid options: {VALID_SPECIALIZATIONS}"
            )
        return v_clean

    @field_validator("degree")
    @classmethod
    def validate_degree(cls, v: str) -> str:
        v_clean = v.strip() if isinstance(v, str) else v
        if v_clean not in VALID_DEGREES:
            raise ValueError(
                f"'{v}' is not a recognised degree. Valid options: {VALID_DEGREES}"
            )
        return v_clean

    def to_model_dict(self) -> dict[str, Any]:
        """
        Convert to the exact dict keys expected by the sklearn Pipeline.
        None values (not-taken modules) are kept as None; the pipeline will impute them.
        """
        return {
            "10percentage": self.percentage_10th,
            "12percentage": self.percentage_12th,
            "collegeGPA": self.college_gpa,
            "CollegeTier": self.college_tier,
            "English": self.english_score,
            "Logical": self.logical_score,
            "Quant": self.quant_score,
            "ComputerProgramming": self.computer_programming_score,
            "conscientiousness": self.conscientiousness,
            "agreeableness": self.agreeableness,
            "extraversion": self.extraversion,
            "nueroticism": self.nueroticism,
            "openess_to_experience": self.openess_to_experience,
            "Specialization": self.specialization,
            "Degree": self.degree,
        }


# ===========================================================================
# ML Prediction Response
# ===========================================================================

class MLPrediction(BaseModel):
    """
    Output from the ML inference service.
    salary_tier is AUTHORITATIVE and must never be overridden by agents.
    """
    salary_tier: SalaryTier = Field(
        description="Predicted salary tier (Low / Mid / High). "
                    "This is the ML model's authoritative output."
    )
    probabilities: dict[str, float] = Field(
        description="Predicted probabilities for each salary tier (0.0–1.0)."
    )
    model_name: str = Field(description="Name of the ML classifier used.")
    disclaimer: str = Field(
        default=(
            "This prediction is based on statistical patterns learned from the "
            "AMEO 2015 dataset (Indian engineering graduates, 2010–2015). "
            "It should not be treated as a guarantee of future salary or employment."
        )
    )


class FeatureExplanation(BaseModel):
    """Global feature importance from the trained model."""
    method: str = Field(description="Explanation method used (e.g. 'permutation_importance').")
    top_features: list[dict[str, Any]] = Field(
        description="Top features with importance scores."
    )
    note: str = Field(
        default=(
            "These features were statistically associated with the model's predictions "
            "in the training data. They do not imply causal relationships."
        )
    )


class PredictionResponse(BaseModel):
    """Complete response from the /predict endpoint."""
    prediction: MLPrediction
    explanation: FeatureExplanation


# ===========================================================================
# O*NET Occupation
# ===========================================================================

class OnetOccupation(BaseModel):
    soc_code: str
    title: str
    description: str
    skills: list[str] = []
    knowledge_areas: list[str] = []
    tech_skills: list[str] = []
    tasks: list[str] = []
    related_soc_codes: list[str] = []


# ===========================================================================
# Agent Output Schemas
# These are Pydantic models used to validate every LLM response.
# ===========================================================================

class OccupationSuggestion(BaseModel):
    soc_code: str = Field(description="O*NET SOC code (e.g. '15-1252.00')")
    title: str = Field(description="Occupation title")
    relevance_reason: str = Field(
        description="Why this occupation is relevant to the student's profile. "
                    "Must reference actual profile attributes or O*NET evidence."
    )
    onet_evidence: list[str] = Field(
        default=[],
        description="Specific O*NET skills or knowledge areas that align with the profile."
    )


class CareerAnalysisOutput(BaseModel):
    """Output from Career Analysis Agent."""
    suggested_occupations: list[OccupationSuggestion] = Field(
        min_length=1, max_length=5,
        description="Occupational areas worth exploring based on the profile."
    )
    profile_strengths: list[str] = Field(
        description="Observable strengths from the student's profile data."
    )
    analysis_summary: str = Field(
        description="Brief, honest summary. Must not claim deterministic career fit."
    )
    disclaimer: str = Field(
        default=(
            "These suggestions are based on patterns in the student's profile and "
            "O*NET occupational data. They are starting points for exploration, "
            "not deterministic career prescriptions."
        )
    )


class SkillGap(BaseModel):
    skill_name: str
    gap_description: str
    source: str = Field(description="'onet' or 'general_knowledge'")
    priority: str = Field(description="'high', 'medium', or 'low'")


class SkillGapOutput(BaseModel):
    """Output from Skill Gap Agent."""
    occupation_title: str
    soc_code: str
    current_strengths: list[str] = Field(
        description="Strengths observable from the student's profile data."
    )
    skill_gaps: list[SkillGap] = Field(
        description="Skills required by the occupation that are not evident in the profile."
    )
    priority_gaps: list[str] = Field(
        description="The 3–5 highest priority skill gaps to address first."
    )
    data_limitation: str = Field(
        default=(
            "Skill gap analysis is based on O*NET occupational requirements and the "
            "student's academic/aptitude profile. It cannot assess skills not captured "
            "in the profile (e.g., extracurricular projects, work experience)."
        )
    )
    gap_summary: str | None = Field(
        default=None,
        description="Summary of identified gaps or limitation note for UI rendering.",
    )

    @model_validator(mode="after")
    def populate_gap_summary(self) -> SkillGapOutput:
        if not self.gap_summary:
            if self.priority_gaps:
                self.gap_summary = (
                    f"Top priority focus areas: {', '.join(self.priority_gaps)}. "
                    f"{self.data_limitation}"
                )
            else:
                self.gap_summary = self.data_limitation
        return self


class RoadmapPhase(BaseModel):
    phase_number: int
    phase_name: str
    duration_estimate: str = Field(description="Estimated time (e.g. '4–6 weeks')")
    skills_covered: list[str]
    learning_activities: list[str] = Field(
        description="Generic learning activities. Do not invent specific course URLs."
    )
    milestone: str = Field(description="Observable outcome or deliverable for this phase.")

    # Backward-compatible frontend aliases
    focus_skills: list[str] | None = None
    recommended_activities: list[str] | None = None
    duration_weeks: int | None = None

    model_config = {"populate_by_name": True}

    @model_validator(mode="before")
    @classmethod
    def normalize_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            normalized = dict(data)
            if "focus_skills" in normalized and "skills_covered" not in normalized:
                normalized["skills_covered"] = normalized["focus_skills"]
            if "recommended_activities" in normalized and "learning_activities" not in normalized:
                normalized["learning_activities"] = normalized["recommended_activities"]
            if "duration_weeks" in normalized and "duration_estimate" not in normalized:
                normalized["duration_estimate"] = f"{normalized['duration_weeks']} weeks"
            return normalized
        return data

    @model_validator(mode="after")
    def populate_compatible_aliases(self) -> RoadmapPhase:
        if self.focus_skills is None:
            self.focus_skills = self.skills_covered
        if self.recommended_activities is None:
            self.recommended_activities = self.learning_activities
        return self


class LearningRoadmapOutput(BaseModel):
    """Output from Learning Roadmap Agent."""
    occupation_title: str
    total_estimated_duration: str
    phases: list[RoadmapPhase] = Field(min_length=2, max_length=6)
    general_advice: str
    disclaimer: str = Field(
        default=(
            "This roadmap is AI-generated guidance based on the identified skill gaps. "
            "Actual resources, courses, and timelines may vary. "
            "No specific external course or platform is guaranteed to be available or free."
        )
    )


class ProjectRecommendation(BaseModel):
    title: str
    objective: str
    skills_developed: list[str]
    difficulty: DifficultyLevel
    suggested_technologies: list[str]
    expected_output: str
    prerequisite: str | None = None


class ProjectsOutput(BaseModel):
    """Output from Project Recommendation Agent."""
    occupation_title: str
    projects: list[ProjectRecommendation] = Field(min_length=2, max_length=5)
    general_tip: str


# ===========================================================================
# Combined CareerPilot Report
# ===========================================================================

class CareerPilotReport(BaseModel):
    """
    Complete end-to-end CareerPilot AI report.
    Clearly separates ML prediction from AI-generated guidance.
    """
    # ML section — authoritative, never modified by agents
    ml_prediction: MLPrediction
    feature_explanation: FeatureExplanation

    # Agent sections — clearly labelled as AI-generated guidance
    career_analysis: CareerAnalysisOutput
    skill_gap: SkillGapOutput
    learning_roadmap: LearningRoadmapOutput
    projects: ProjectsOutput

    # Meta
    selected_occupation: OnetOccupation | None = None
    report_disclaimer: str = Field(
        default=(
            "CareerPilot's ML model predicts salary tier from patterns learned from the AMEO 2015 dataset "
            "(Zenodo DOI 10.5281/zenodo.45735, CC BY-NC-SA 4.0). It does not determine a student's ideal career "
            "or guarantee future salary or employment. Career exploration is generated separately using "
            "the student's profile and occupational knowledge."
        )
    )


# ===========================================================================
# API Request Bodies
# ===========================================================================

class CareerAnalysisRequest(BaseModel):
    profile: StudentProfile
    ml_prediction: MLPrediction


class SkillGapRequest(BaseModel):
    profile: StudentProfile
    ml_prediction: MLPrediction
    selected_soc_code: str = Field(
        description="O*NET SOC code of the occupation to analyse gaps for."
    )


class RoadmapRequest(BaseModel):
    profile: StudentProfile
    skill_gap: SkillGapOutput
    duration_preference: str | None = Field(
        default=None,
        description="Optional duration preference (e.g. '3 months')",
    )


class ProjectsRequest(BaseModel):
    profile: StudentProfile
    skill_gap: SkillGapOutput


class FullWorkflowRequest(BaseModel):
    profile: StudentProfile
    selected_soc_code: str | None = Field(
        default=None,
        description="Optional: pre-select an O*NET SOC code. "
                    "If None, the Career Analysis Agent will suggest one."
    )
    duration_preference: str | None = Field(
        default=None,
        description="Optional duration preference (e.g. '3 months')",
    )


# ===========================================================================
# Health Check
# ===========================================================================

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    gemini_available: bool
    onet_data_loaded: bool
    version: str = "3.0.0"
