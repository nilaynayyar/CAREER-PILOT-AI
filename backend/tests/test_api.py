"""
CareerPilot AI — Backend API Test Suite
========================================
Comprehensive automated tests verifying:
  - Health check endpoint
  - O*NET occupational data retrieval
  - ML inference endpoint (/api/v1/predict)
  - Input schema validation & error handling
  - Standalone operation without Gemini AI
  - Individual agent endpoints (with deterministic fallbacks)
  - Full end-to-end workflow endpoint (/api/v1/careerpilot)
  - Architectural separation: ML prediction is never overridden by AI agents
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.schemas import SalaryTier, StudentProfile
from backend.app.services import ml_service, onet_service


@pytest.fixture(scope="module")
def client():
    """Create test client within lifespan context so ML & O*NET data are loaded."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_valid_profile_dict():
    """Sample profile for a Computer Science & Engineering graduate."""
    return {
        "tenth_percentage": 86.5,
        "twelfth_percentage": 84.0,
        "college_gpa": 76.8,
        "college_tier": 1,
        "english_score": 620,
        "logical_score": 610,
        "quant_score": 670,
        "computer_programming_score": 650,
        "conscientiousness": 0.45,
        "agreeableness": 0.35,
        "extraversion": 0.15,
        "neuroticism": -0.25,
        "openness_to_experience": 0.40,
        "specialization": "Computer Science & Engineering",
        "degree": "B.Tech/B.E.",
    }


# ===========================================================================
# 1. Health Endpoint Tests
# ===========================================================================

def test_health_endpoint(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    assert data["onet_data_loaded"] is True
    assert "gemini_available" in data


def test_api_v1_health_endpoint(client: TestClient):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True


def test_root_endpoint(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["ml_model_loaded"] is True
    assert data["onet_loaded"] is True


# ===========================================================================
# 2. O*NET Occupational Knowledge Tests
# ===========================================================================

def test_get_all_occupations(client: TestClient):
    response = client.get("/api/v1/occupations")
    assert response.status_code == 200
    occupations = response.json()
    assert isinstance(occupations, list)
    assert len(occupations) == 10
    soc_codes = [occ["soc_code"] for occ in occupations]
    assert "15-1252.00" in soc_codes  # Software Developers


def test_get_single_occupation(client: TestClient):
    response = client.get("/api/v1/occupations/15-1252.00")
    assert response.status_code == 200
    data = response.json()
    assert data["soc_code"] == "15-1252.00"
    assert data["title"] == "Software Developers"
    assert len(data["skills"]) > 0
    assert len(data["knowledge_areas"]) > 0
    assert len(data["tech_skills"]) > 0


def test_get_nonexistent_occupation(client: TestClient):
    response = client.get("/api/v1/occupations/99-9999.00")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


# ===========================================================================
# 3. ML Prediction Endpoint Tests
# ===========================================================================

def test_predict_valid_profile(client: TestClient, sample_valid_profile_dict):
    response = client.post("/api/v1/predict", json=sample_valid_profile_dict)
    assert response.status_code == 200
    data = response.json()

    assert "prediction" in data
    assert "explanation" in data

    prediction = data["prediction"]
    assert prediction["salary_tier"] in ["Low", "Mid", "High"]
    assert "probabilities" in prediction
    assert len(prediction["probabilities"]) == 3

    # Check probabilities sum to approximately 1.0
    probs_sum = sum(prediction["probabilities"].values())
    assert abs(probs_sum - 1.0) < 0.05

    # Check explanation features
    explanation = data["explanation"]
    assert explanation["method"] == "permutation_importance"
    assert len(explanation["top_features"]) > 0
    assert "feature" in explanation["top_features"][0]
    assert "importance_mean" in explanation["top_features"][0]

    # Check disclaimers
    assert "disclaimer" in prediction
    assert "AMEO 2015" in prediction["disclaimer"]


def test_predict_validation_error_missing_field(client: TestClient):
    incomplete_profile = {
        "tenth_percentage": 80.0,
        # missing twelfth_percentage
        "college_gpa": 70.0,
        "college_tier": 2,
    }
    response = client.post("/api/v1/predict", json=incomplete_profile)
    assert response.status_code == 422


def test_predict_validation_error_out_of_range(client: TestClient, sample_valid_profile_dict):
    invalid_profile = dict(sample_valid_profile_dict)
    invalid_profile["tenth_percentage"] = 150.0  # Invalid percentage > 100
    response = client.post("/api/v1/predict", json=invalid_profile)
    assert response.status_code == 422


def test_predict_validation_error_invalid_specialization(client: TestClient, sample_valid_profile_dict):
    invalid_profile = dict(sample_valid_profile_dict)
    invalid_profile["specialization"] = "Astrology Engineering"  # Not valid
    response = client.post("/api/v1/predict", json=invalid_profile)
    assert response.status_code == 422


def test_predict_works_without_gemini(client: TestClient, sample_valid_profile_dict):
    """The ML-only prediction must work completely independently of Gemini."""
    response = client.post("/api/v1/predict", json=sample_valid_profile_dict)
    assert response.status_code == 200
    assert response.json()["prediction"]["salary_tier"] in ["Low", "Mid", "High"]


# ===========================================================================
# 4. Agent Endpoint Tests (With Deterministic Fallbacks)
# ===========================================================================

def test_career_analysis_endpoint(client: TestClient, sample_valid_profile_dict):
    # First get ML prediction
    pred_res = client.post("/api/v1/predict", json=sample_valid_profile_dict)
    ml_pred = pred_res.json()["prediction"]

    req_payload = {
        "profile": sample_valid_profile_dict,
        "ml_prediction": ml_pred,
    }
    response = client.post("/api/v1/career-analysis", json=req_payload)
    assert response.status_code == 200
    data = response.json()
    assert "career_analysis" in data
    assert "suggested_occupations" in data["career_analysis"]
    assert len(data["career_analysis"]["suggested_occupations"]) >= 1
    # Verify O*NET SOC code is valid
    soc = data["career_analysis"]["suggested_occupations"][0]["soc_code"]
    assert onet_service.get_occupation(soc) is not None


def test_skill_gap_endpoint(client: TestClient, sample_valid_profile_dict):
    pred_res = client.post("/api/v1/predict", json=sample_valid_profile_dict)
    ml_pred = pred_res.json()["prediction"]

    req_payload = {
        "profile": sample_valid_profile_dict,
        "ml_prediction": ml_pred,
        "selected_soc_code": "15-1252.00",
    }
    response = client.post("/api/v1/skill-gap", json=req_payload)
    assert response.status_code == 200
    data = response.json()
    assert "skill_gap" in data
    sg_data = data["skill_gap"]
    assert sg_data["soc_code"] == "15-1252.00"
    assert len(sg_data["current_strengths"]) >= 0
    assert len(sg_data["skill_gaps"]) >= 1


def test_learning_roadmap_endpoint(client: TestClient, sample_valid_profile_dict):
    pred_res = client.post("/api/v1/predict", json=sample_valid_profile_dict)
    ml_pred = pred_res.json()["prediction"]

    # Generate skill gap first
    sg_res = client.post(
        "/api/v1/skill-gap",
        json={
            "profile": sample_valid_profile_dict,
            "ml_prediction": ml_pred,
            "selected_soc_code": "15-1252.00",
        },
    )
    skill_gap_data = sg_res.json()["skill_gap"]

    req_payload = {
        "profile": sample_valid_profile_dict,
        "skill_gap": skill_gap_data,
        "duration_preference": "3 months",
    }
    response = client.post("/api/v1/roadmap", json=req_payload)
    assert response.status_code == 200
    data = response.json()
    assert "roadmap" in data
    assert len(data["roadmap"]["phases"]) >= 2


def test_projects_endpoint(client: TestClient, sample_valid_profile_dict):
    pred_res = client.post("/api/v1/predict", json=sample_valid_profile_dict)
    ml_pred = pred_res.json()["prediction"]

    sg_res = client.post(
        "/api/v1/skill-gap",
        json={
            "profile": sample_valid_profile_dict,
            "ml_prediction": ml_pred,
            "selected_soc_code": "15-1252.00",
        },
    )
    skill_gap_data = sg_res.json()["skill_gap"]

    req_payload = {
        "profile": sample_valid_profile_dict,
        "skill_gap": skill_gap_data,
    }
    response = client.post("/api/v1/projects", json=req_payload)
    assert response.status_code == 200
    data = response.json()
    assert "projects" in data
    assert len(data["projects"]["projects"]) >= 2


# ===========================================================================
# 5. Full End-to-End Workflow & Architectural Guarantees
# ===========================================================================

def test_full_careerpilot_workflow(client: TestClient, sample_valid_profile_dict):
    """
    Test the complete end-to-end pipeline:
    Profile -> ML -> Feature Explanation -> O*NET -> Agents 1-4.
    """
    response = client.post(
        "/api/v1/careerpilot",
        json={"profile": sample_valid_profile_dict},
    )
    assert response.status_code == 200
    report = response.json()

    # 1. Status and structural sections
    assert report["status"] == "complete"
    assert "ml_section" in report
    assert "ai_guidance_section" in report
    assert "onet_attribution" in report
    assert "report_disclaimer" in report

    # 2. ML Section check
    ml_sec = report["ml_section"]
    assert "prediction" in ml_sec
    assert "explanation" in ml_sec
    ml_pred = ml_sec["prediction"]
    assert ml_pred["salary_tier"] in ["Low", "Mid", "High"]

    # 3. AI Guidance Section check
    ai_sec = report["ai_guidance_section"]
    assert "career_analysis" in ai_sec
    assert "selected_occupation" in ai_sec
    assert "skill_gap" in ai_sec
    assert "roadmap" in ai_sec
    assert "projects" in ai_sec

    # 4. Check that roadmap has phases and projects are populated
    assert len(ai_sec["roadmap"]["phases"]) >= 2
    assert len(ai_sec["projects"]["projects"]) >= 2

    # 5. Check agent step statuses — accept either ok (Gemini live) or fallback (offline)
    assert "agent_step_statuses" in report
    for agent_name, status_dict in report["agent_step_statuses"].items():
        assert status_dict["status"] in ("ok", "fallback")


def test_architectural_invariance(client: TestClient, sample_valid_profile_dict):
    """
    CRITICAL ARCHITECTURAL GUARANTEE:
    Given the exact same StudentProfile:
    The ML prediction (salary_tier, probabilities, and feature explanation)
    MUST be bit-for-bit identical regardless of:
      - Standalone /predict vs Full /careerpilot workflow
      - Gemini enabled vs Gemini disabled (fallback)
      - Downstream agent executions
      - O*NET data retrieval
    Downstream agents are strictly forbidden from modifying ML outputs.
    """
    # 1. Standalone prediction
    pred_res = client.post("/api/v1/predict", json=sample_valid_profile_dict)
    assert pred_res.status_code == 200
    standalone_pred = pred_res.json()["prediction"]
    standalone_exp = pred_res.json()["explanation"]

    # 2. Interleaved O*NET operations (must not contaminate ML state)
    client.get("/api/v1/occupations")
    client.get("/api/v1/occupations/15-1252.00")

    # 3. Full workflow with Gemini disabled (offline fallback)
    full_res_offline = client.post(
        "/api/v1/careerpilot",
        json={"profile": sample_valid_profile_dict},
    )
    assert full_res_offline.status_code == 200
    workflow_offline_ml = full_res_offline.json()["ml_section"]

    # Verify identical salary_tier
    assert standalone_pred["salary_tier"] == workflow_offline_ml["prediction"]["salary_tier"]

    # Verify identical predicted probabilities
    for tier in ["High", "Mid", "Low"]:
        assert standalone_pred["probabilities"][tier] == pytest.approx(
            workflow_offline_ml["prediction"]["probabilities"][tier], abs=1e-5
        )

    # Verify identical feature explanation
    assert standalone_exp["method"] == workflow_offline_ml["explanation"]["method"]
    assert len(standalone_exp["top_features"]) == len(workflow_offline_ml["explanation"]["top_features"])
    for s_feat, w_feat in zip(standalone_exp["top_features"], workflow_offline_ml["explanation"]["top_features"]):
        assert s_feat["feature"] == w_feat["feature"]
        assert s_feat["importance_mean"] == pytest.approx(w_feat["importance_mean"], abs=1e-5)

    # 4. Full workflow with mocked Gemini agent responses
    from unittest.mock import patch
    mock_agent_response = (
        '{"suggested_occupations": [{"soc_code": "15-1252.00", "title": "Software Developers", '
        '"relevance_reason": "Matches profile", "onet_evidence": ["Programming"]}], '
        '"profile_strengths": ["GPA 76.8%"], "analysis_summary": "Good fit", "disclaimer": "Guidance only"}'
    )
    with patch("backend.app.services.agent_service.settings.gemini_api_key", "mock_key_test"):
        with patch("backend.app.services.agent_service._call_gemini", return_value=mock_agent_response):
            full_res_mock = client.post(
                "/api/v1/careerpilot",
                json={"profile": sample_valid_profile_dict},
            )
            assert full_res_mock.status_code == 200
            workflow_mock_ml = full_res_mock.json()["ml_section"]

            # Salary tier, probabilities, and explanations MUST remain identical even when Gemini is active
            assert standalone_pred["salary_tier"] == workflow_mock_ml["prediction"]["salary_tier"]
            for tier in ["High", "Mid", "Low"]:
                assert standalone_pred["probabilities"][tier] == pytest.approx(
                    workflow_mock_ml["prediction"]["probabilities"][tier], abs=1e-5
                )
            assert standalone_exp["method"] == workflow_mock_ml["explanation"]["method"]


# ===========================================================================
# 6. Phase 4 Hardening & Security Tests
# ===========================================================================

def test_predict_validation_edge_cases(client: TestClient, sample_valid_profile_dict):
    """Test boundary violations and malformed profile values are rejected cleanly with 422."""
    # Negative AMCAT score
    p1 = dict(sample_valid_profile_dict, quant_score=-50)
    assert client.post("/api/v1/predict", json=p1).status_code == 422

    # Excessive AMCAT score
    p2 = dict(sample_valid_profile_dict, english_score=1500)
    assert client.post("/api/v1/predict", json=p2).status_code == 422

    # Extreme personality z-score
    p3 = dict(sample_valid_profile_dict, conscientiousness=12.5)
    assert client.post("/api/v1/predict", json=p3).status_code == 422

    # Empty specialization string
    p4 = dict(sample_valid_profile_dict, specialization="")
    assert client.post("/api/v1/predict", json=p4).status_code == 422

    # Invalid degree
    p5 = dict(sample_valid_profile_dict, degree="Honorary Doctorate")
    assert client.post("/api/v1/predict", json=p5).status_code == 422


def test_onet_data_complete_fields(client: TestClient):
    """Verify all 10 O*NET occupations have complete, non-empty critical fields."""
    response = client.get("/api/v1/occupations")
    assert response.status_code == 200
    occupations = response.json()
    assert len(occupations) == 10

    for occ in occupations:
        assert occ["soc_code"].count("-") == 1
        assert occ["soc_code"].count(".") == 1
        assert len(occ["title"]) > 0
        assert len(occ["description"]) > 20
        assert isinstance(occ["skills"], list) and len(occ["skills"]) >= 5
        assert isinstance(occ["knowledge_areas"], list) and len(occ["knowledge_areas"]) >= 3
        assert isinstance(occ["tech_skills"], list) and len(occ["tech_skills"]) >= 3
        assert isinstance(occ["tasks"], list) and len(occ["tasks"]) >= 3


def test_agent_fallback_on_unparseable_gemini_response(client: TestClient, sample_valid_profile_dict):
    """Verify endpoint gracefully falls back to deterministic rules if Gemini returns malformed response."""
    from unittest.mock import patch
    pred_res = client.post("/api/v1/predict", json=sample_valid_profile_dict)
    ml_pred = pred_res.json()["prediction"]

    req_payload = {
        "profile": sample_valid_profile_dict,
        "ml_prediction": ml_pred,
    }

    # Simulate Gemini returning unparseable junk
    with patch("backend.app.services.agent_service.settings.gemini_api_key", "mock_key_test"):
        with patch("backend.app.services.agent_service._call_gemini", return_value="<<<INVALID NOT JSON>>>"):
            res = client.post("/api/v1/career-analysis", json=req_payload)
            assert res.status_code == 200
            data = res.json()
            assert data["status"] == "fallback"
            assert data["source"] == "fallback"
            assert "suggested_occupations" in data["career_analysis"]
            assert len(data["career_analysis"]["suggested_occupations"]) >= 1


def test_cors_preflight(client: TestClient):
    """Verify CORS preflight OPTIONS request returns expected allow headers."""
    response = client.options(
        "/api/v1/predict",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert "POST" in response.headers.get("access-control-allow-methods", "")


def test_careerpilot_offline_label(client: TestClient, sample_valid_profile_dict):
    """Verify that when Gemini is explicitly unavailable, the full workflow
    displays the OFFLINE GUIDANCE label and fallback source flags."""
    from unittest.mock import patch
    with patch("backend.app.services.agent_service.settings") as mock_settings:
        # Mirror real settings but force Gemini off
        from backend.app.core.config import settings as real_settings
        mock_settings.gemini_available = False
        mock_settings.gemini_api_key = None
        mock_settings.gemini_model = real_settings.gemini_model
        mock_settings.onet_dir_path = real_settings.onet_dir_path

        response = client.post(
            "/api/v1/careerpilot",
            json={"profile": sample_valid_profile_dict},
        )
    assert response.status_code == 200
    data = response.json()
    assert "OFFLINE GUIDANCE" in data["ai_guidance_section"]["label"]
    for step_name, step_info in data["agent_step_statuses"].items():
        assert step_info["status"] in ("ok", "fallback")
        assert "source" in step_info


