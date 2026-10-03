"""
CareerPilot AI — API Routes
=============================
All API endpoints for the CareerPilot AI backend.

ENDPOINT OVERVIEW:
  GET  /health                    → Health check (model + Gemini + O*NET status)
  POST /api/v1/predict            → ML-only prediction (no Gemini required)
  POST /api/v1/career-analysis    → Agent 1 (requires ML result)
  POST /api/v1/skill-gap          → Agent 2 (requires ML result + SOC code)
  POST /api/v1/roadmap            → Agent 3 (requires skill gap output)
  POST /api/v1/projects           → Agent 4 (requires skill gap output)
  POST /api/v1/careerpilot        → Full end-to-end workflow
  GET  /api/v1/occupations        → List all O*NET occupations
  GET  /api/v1/occupations/{soc}  → Get specific occupation

IMPORTANT: /predict works without Gemini. All agent endpoints fail gracefully.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import ValidationError

from backend.app.schemas import (
    CareerAnalysisRequest,
    CareerPilotReport,
    FullWorkflowRequest,
    HealthResponse,
    OnetOccupation,
    PredictionResponse,
    ProjectsRequest,
    RoadmapRequest,
    SkillGapRequest,
    StudentProfile,
)
from backend.app.services import agent_service, ml_service, onet_service
from backend.app.services.agent_service import AgentError, GeminiUnavailableError

logger = logging.getLogger(__name__)

router = APIRouter()


# ===========================================================================
# Health Check
# ===========================================================================

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Returns the operational status of all system components.",
    tags=["System"],
)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_loaded=ml_service.is_loaded(),
        gemini_available=agent_service.settings.gemini_available,
        onet_data_loaded=onet_service.is_loaded(),
    )


# ===========================================================================
# ML Prediction (no Gemini required)
# ===========================================================================

@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="ML-only salary tier prediction",
    description=(
        "Runs the trained ML model and returns a SalaryTier prediction. "
        "Works without Gemini AI. The salary_tier is the authoritative ML output "
        "and is never modified by downstream agents."
    ),
    tags=["ML Prediction"],
)
async def predict(profile: StudentProfile) -> PredictionResponse:
    if not ml_service.is_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML model is not loaded. Contact administrator.",
        )
    try:
        prediction = ml_service.predict(profile)
        explanation = ml_service.get_explanation()
        return PredictionResponse(prediction=prediction, explanation=explanation)
    except Exception as e:
        logger.error("ML inference error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ML inference failed: {str(e)}",
        )


# ===========================================================================
# Career Analysis (Agent 1)
# ===========================================================================

@router.post(
    "/career-analysis",
    summary="Agent 1: Career area suggestions",
    description=(
        "Analyses the student's profile and ML prediction to suggest occupational areas "
        "worth exploring. Requires a prior ML prediction result. "
        "Falls back to rule-based suggestions if Gemini is unavailable."
    ),
    tags=["Agentic AI"],
)
async def career_analysis(request: CareerAnalysisRequest) -> dict[str, Any]:
    try:
        result = agent_service.run_career_analysis(request.profile, request.ml_prediction)
        return {
            "status": "ok",
            "source": "gemini" if agent_service.settings.gemini_available else "fallback",
            "career_analysis": result.model_dump(),
            "onet_attribution": onet_service.get_attribution(),
        }
    except (AgentError, GeminiUnavailableError) as e:
        logger.warning("Career analysis agent fallback triggered: %s", e)
        fallback = agent_service._fallback_career_analysis(request.profile, request.ml_prediction)
        return {
            "status": "fallback",
            "source": "fallback",
            "career_analysis": fallback.model_dump(),
            "onet_attribution": onet_service.get_attribution(),
            "warning": "Gemini AI is unavailable or unparseable. Using rule-based career suggestions.",
        }
    except Exception as e:
        logger.error("Career analysis error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error occurred during career analysis.",
        )


# ===========================================================================
# Skill Gap Analysis (Agent 2)
# ===========================================================================

@router.post(
    "/skill-gap",
    summary="Agent 2: Skill gap analysis",
    description=(
        "Compares the student's profile to O*NET requirements for a selected occupation. "
        "Returns current strengths and prioritised skill gaps."
    ),
    tags=["Agentic AI"],
)
async def skill_gap(request: SkillGapRequest) -> dict[str, Any]:
    occupation = onet_service.get_occupation(request.selected_soc_code)
    if occupation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Occupation '{request.selected_soc_code}' not found in O*NET data.",
        )
    try:
        result = agent_service.run_skill_gap(
            request.profile, request.ml_prediction, request.selected_soc_code
        )
        return {
            "status": "ok",
            "source": "gemini" if agent_service.settings.gemini_available else "fallback",
            "skill_gap": result.model_dump(),
            "onet_attribution": onet_service.get_attribution(),
        }
    except (AgentError, GeminiUnavailableError) as e:
        logger.warning("Skill gap agent fallback triggered: %s", e)
        fallback = agent_service._fallback_skill_gap(request.profile, occupation)
        return {
            "status": "fallback",
            "source": "fallback",
            "skill_gap": fallback.model_dump(),
            "onet_attribution": onet_service.get_attribution(),
            "warning": "Gemini AI is unavailable or unparseable. Using rule-based skill gap analysis.",
        }
    except Exception as e:
        logger.error("Skill gap error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error occurred during skill gap analysis.",
        )


# ===========================================================================
# Learning Roadmap (Agent 3)
# ===========================================================================

@router.post(
    "/roadmap",
    summary="Agent 3: Learning roadmap",
    description=(
        "Generates a structured, phased learning roadmap to address the identified skill gaps. "
        "Does not include specific course URLs (they may not be free or available)."
    ),
    tags=["Agentic AI"],
)
async def learning_roadmap(request: RoadmapRequest) -> dict[str, Any]:
    try:
        result = agent_service.run_learning_roadmap(request.profile, request.skill_gap)
        return {
            "status": "ok",
            "source": "gemini" if agent_service.settings.gemini_available else "fallback",
            "roadmap": result.model_dump(),
        }
    except (AgentError, GeminiUnavailableError) as e:
        logger.warning("Roadmap agent fallback triggered: %s", e)
        fallback = agent_service._fallback_roadmap(request.profile, request.skill_gap)
        return {
            "status": "fallback",
            "source": "fallback",
            "roadmap": fallback.model_dump(),
            "warning": "Gemini AI is unavailable or unparseable. Using rule-based roadmap.",
        }
    except Exception as e:
        logger.error("Roadmap error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error occurred during roadmap generation.",
        )


# ===========================================================================
# Project Recommendations (Agent 4)
# ===========================================================================

@router.post(
    "/projects",
    summary="Agent 4: Project recommendations",
    description=(
        "Recommends practical, buildable projects to develop skills for the target occupation. "
        "All suggested technologies are free and open-source."
    ),
    tags=["Agentic AI"],
)
async def project_recommendations(request: ProjectsRequest) -> dict[str, Any]:
    try:
        result = agent_service.run_project_recommendations(request.profile, request.skill_gap)
        return {
            "status": "ok",
            "source": "gemini" if agent_service.settings.gemini_available else "fallback",
            "projects": result.model_dump(),
        }
    except (AgentError, GeminiUnavailableError) as e:
        logger.warning("Projects agent fallback triggered: %s", e)
        fallback = agent_service._fallback_projects(request.profile, request.skill_gap)
        return {
            "status": "fallback",
            "source": "fallback",
            "projects": fallback.model_dump(),
            "warning": "Gemini AI is unavailable or unparseable. Using rule-based project suggestions.",
        }
    except Exception as e:
        logger.error("Projects error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error occurred during project recommendations.",
        )


# ===========================================================================
# Full CareerPilot Workflow (end-to-end)
# ===========================================================================

@router.post(
    "/careerpilot",
    summary="Full CareerPilot AI workflow",
    description=(
        "Executes the complete pipeline: ML prediction → career analysis → "
        "skill gap → roadmap → project recommendations. "
        "Returns a structured CareerPilot report. "
        "The ML-only section works without Gemini."
    ),
    tags=["Full Workflow"],
)
async def careerpilot_full(request: FullWorkflowRequest) -> dict[str, Any]:
    if not ml_service.is_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML model is not loaded.",
        )

    # Step 1: ML Prediction (authoritative — never modified)
    try:
        ml_prediction = ml_service.predict(request.profile)
        feature_explanation = ml_service.get_explanation()
    except Exception as e:
        logger.error("ML prediction failed in full workflow: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ML prediction failed: {str(e)}",
        )

    # Steps 2–5: Agent workflow
    try:
        workflow_result = agent_service.run_full_workflow(
            profile=request.profile,
            ml_prediction=ml_prediction,
            feature_explanation=feature_explanation,
            selected_soc_code=request.selected_soc_code,
        )
    except Exception as e:
        logger.error("Agent workflow failed: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent workflow error: {str(e)}",
        )

    selected_occ = workflow_result.get("selected_occupation")

    return {
        "status": "complete",
        # ML section — authoritative
        "ml_section": {
            "label": "ML PREDICTION (Authoritative — not generated by AI)",
            "prediction": ml_prediction.model_dump(),
            "explanation": feature_explanation.model_dump(),
        },
        # Agent section — clearly labelled (AI-assisted or offline rule-based)
        "ai_guidance_section": {
            "label": (
                "AI-ASSISTED GUIDANCE (based on O*NET occupational data)"
                if any(info.get("status") == "ok" for info in workflow_result.get("steps", {}).values())
                else "OFFLINE GUIDANCE (Rule-based deterministic grounding on O*NET data)"
            ),
            "career_analysis": workflow_result["career_analysis"].model_dump(),
            "selected_occupation": selected_occ.model_dump() if selected_occ else None,
            "skill_gap": workflow_result["skill_gap"].model_dump(),
            "roadmap": workflow_result["roadmap"].model_dump(),
            "projects": workflow_result["projects"].model_dump(),
        },
        "agent_step_statuses": {
            step: {
                "status": info["status"],
                "source": "gemini" if info["status"] == "ok" else "fallback",
            }
            for step, info in workflow_result.get("steps", {}).items()
        },
        "onet_attribution": onet_service.get_attribution(),
        "report_disclaimer": (
            "CareerPilot's ML model predicts salary tier from patterns learned from the AMEO 2015 dataset "
            "(Zenodo DOI 10.5281/zenodo.45735, CC BY-NC-SA 4.0). It does not determine a student's ideal career "
            "or guarantee future salary or employment. Career exploration is generated separately using "
            "the student's profile and occupational knowledge."
        ),
    }


# ===========================================================================
# O*NET Data Endpoints
# ===========================================================================

@router.get(
    "/occupations",
    response_model=list[OnetOccupation],
    summary="List all O*NET occupations",
    tags=["O*NET Data"],
)
async def list_occupations() -> list[OnetOccupation]:
    return onet_service.get_all_occupations()


@router.get(
    "/occupations/{soc_code}",
    response_model=OnetOccupation,
    summary="Get O*NET occupation by SOC code",
    tags=["O*NET Data"],
)
async def get_occupation(soc_code: str) -> OnetOccupation:
    # Replace URL-encoded dots if necessary
    soc_code = soc_code.replace("%2E", ".").replace("-", "-")
    occupation = onet_service.get_occupation(soc_code)
    if occupation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Occupation '{soc_code}' not found.",
        )
    return occupation
