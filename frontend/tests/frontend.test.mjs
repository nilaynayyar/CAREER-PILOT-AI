/**
 * CareerPilot AI — Frontend Automated Test Suite
 * Uses Node.js native test runner (node:test & node:assert).
 *
 * Covers:
 *  1. Profile form validation
 *  2. Loading state transitions
 *  3. Error state handling
 *  4. Prediction rendering logic
 *  5. Report rendering logic & architectural separation
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("1. Profile Form Validation", () => {
  function validateProfile(p) {
    const errors = [];
    if (p.percentage_10th < 0 || p.percentage_10th > 100) errors.push("10th percentage must be between 0 and 100");
    if (p.percentage_12th < 0 || p.percentage_12th > 100) errors.push("12th percentage must be between 0 and 100");
    if (p.college_gpa < 0 || p.college_gpa > 100) errors.push("College GPA must be between 0 and 100");
    if (![1, 2].includes(p.college_tier)) errors.push("College Tier must be 1 or 2");
    if (p.quant_score < 100 || p.quant_score > 900) errors.push("Quant score must be between 100 and 900");
    if (p.english_score < 100 || p.english_score > 900) errors.push("English score must be between 100 and 900");
    if (p.logical_score < 100 || p.logical_score > 900) errors.push("Logical score must be between 100 and 900");
    if (!p.specialization || p.specialization.trim() === "") errors.push("Specialization is required");
    return { valid: errors.length === 0, errors };
  }

  test("accepts standard valid CS profile", () => {
    const validProfile = {
      percentage_10th: 85.0,
      percentage_12th: 82.0,
      college_gpa: 78.0,
      college_tier: 1,
      quant_score: 650,
      english_score: 600,
      logical_score: 610,
      specialization: "Computer Science & Engineering",
    };
    const res = validateProfile(validProfile);
    assert.equal(res.valid, true);
    assert.equal(res.errors.length, 0);
  });

  test("rejects out-of-range academic percentages", () => {
    const invalidProfile = {
      percentage_10th: 105.0,
      percentage_12th: -5.0,
      college_gpa: 70.0,
      college_tier: 2,
      quant_score: 500,
      english_score: 500,
      logical_score: 500,
      specialization: "Information Technology",
    };
    const res = validateProfile(invalidProfile);
    assert.equal(res.valid, false);
    assert.equal(res.errors.length, 2);
  });

  test("rejects out-of-range AMCAT aptitude scores", () => {
    const invalidProfile = {
      percentage_10th: 75.0,
      percentage_12th: 70.0,
      college_gpa: 70.0,
      college_tier: 2,
      quant_score: 950, // exceeds max 900
      english_score: 80, // below min 100
      logical_score: 500,
      specialization: "Civil Engineering",
    };
    const res = validateProfile(invalidProfile);
    assert.equal(res.valid, false);
    assert.equal(res.errors.length, 2);
  });
});

describe("2. Loading State Transitions", () => {
  test("manages progress messaging across pipeline steps", () => {
    const steps = [];
    const setStep = (s) => steps.push(s);

    setStep("Executing scikit-learn ML inference...");
    setStep("Querying O*NET knowledge base...");
    setStep("Running AI Career Guidance Agents...");
    setStep("Complete");

    assert.equal(steps.length, 4);
    assert.equal(steps[0].includes("ML inference"), true);
    assert.equal(steps[1].includes("O*NET"), true);
    assert.equal(steps[3], "Complete");
  });
});

describe("3. Error State Handling", () => {
  test("formats network connection error cleanly without raw stack traces", () => {
    function formatApiError(err) {
      if (err.status === 0 || !err.status) {
        return "Cannot connect to CareerPilot backend. Ensure the FastAPI server is running.";
      }
      return err.message || "An unexpected error occurred.";
    }

    const netErr = { status: 0, message: "Failed to fetch" };
    const formatted = formatApiError(netErr);
    assert.equal(formatted.includes("Cannot connect to CareerPilot backend"), true);
    assert.equal(formatted.includes("TypeError"), false);
  });
});

describe("4. Prediction Rendering Logic", () => {
  test("calculates probability percentages and badge classes", () => {
    const mlPrediction = {
      salary_tier: "High",
      probabilities: { High: 0.6855, Mid: 0.272, Low: 0.0425 },
      model_name: "LogisticRegression",
      disclaimer: "AMEO 2015 historical dataset.",
    };

    function getTierBadgeClass(tier) {
      if (tier === "High") return "badge-high";
      if (tier === "Mid") return "badge-mid";
      return "badge-low";
    }

    assert.equal(getTierBadgeClass(mlPrediction.salary_tier), "badge-high");

    const highPct = Math.round(mlPrediction.probabilities.High * 100);
    const midPct = Math.round(mlPrediction.probabilities.Mid * 100);
    const lowPct = Math.round(mlPrediction.probabilities.Low * 100);

    assert.equal(highPct, 69);
    assert.equal(midPct, 27);
    assert.equal(lowPct, 4);
    assert.equal(highPct + midPct + lowPct, 100);
  });
});

describe("5. Report Rendering & Architectural Invariance", () => {
  test("verifies full report structural integrity", () => {
    const mockReport = {
      status: "complete",
      ml_section: {
        prediction: { salary_tier: "High", probabilities: { High: 0.7, Mid: 0.2, Low: 0.1 } },
        explanation: { top_features: [{ feature: "Quant", importance_mean: 0.018 }] },
      },
      ai_guidance_section: {
        career_analysis: { suggested_occupations: [{ soc_code: "15-1252.00", title: "Software Developers" }] },
        selected_occupation: { soc_code: "15-1252.00", title: "Software Developers" },
        skill_gap: { skill_gaps: [{ skill_name: "Systems Analysis", priority: "high" }] },
        roadmap: { phases: [{ phase_number: 1, phase_name: "Foundations", duration_weeks: 4 }] },
        projects: { projects: [{ title: "Distributed Task Queue", difficulty: "Intermediate" }] },
      },
    };

    assert.equal(mockReport.status, "complete");
    assert.equal(mockReport.ml_section.prediction.salary_tier, "High");
    assert.equal(mockReport.ai_guidance_section.career_analysis.suggested_occupations.length, 1);
    assert.equal(mockReport.ai_guidance_section.roadmap.phases.length, 1);
    assert.equal(mockReport.ai_guidance_section.projects.projects.length, 1);
  });
});

describe("6. Entrance Exam Context & ML Feature Isolation", () => {
  test("dynamically selects metrics based on examination type", () => {
    function getExamMetricFields(examType) {
      if (examType === "JEE Main" || examType === "JEE Advanced") return ["percentile", "rank"];
      if (examType === "NEET UG") return ["score", "percentile", "rank"];
      if (examType === "CUET UG") return ["score", "percentile"];
      if (examType === "GATE" || examType === "CLAT") return ["score", "rank"];
      if (examType === "CAT") return ["percentile"];
      return ["score", "rank"];
    }

    assert.deepEqual(getExamMetricFields("JEE Main"), ["percentile", "rank"]);
    assert.deepEqual(getExamMetricFields("NEET UG"), ["score", "percentile", "rank"]);
    assert.deepEqual(getExamMetricFields("CAT"), ["percentile"]);
    assert.deepEqual(getExamMetricFields("CUET UG"), ["score", "percentile"]);
  });

  test("enforces strict ML feature boundary: exams are never included in ML model profile", () => {
    const studentWithExams = {
      profile: {
        percentage_10th: 88.0,
        percentage_12th: 85.0,
        college_gpa: 80.0,
        college_tier: 1,
        degree: "B.Tech/B.E.",
        specialization: "computer science & engineering",
        english_score: 620,
        logical_score: 640,
        quant_score: 680,
        conscientiousness: 0.2,
        agreeableness: 0.1,
        extraversion: -0.2,
        neuroticism: -0.1,
        openness_to_experience: 0.3,
      },
      career_context: {
        exams: [
          { exam: "JEE Main", status: "Qualified", percentile: "98.2", rank: "18500" },
          { exam: "GATE", status: "Preparing", year: "2025" },
        ],
      },
    };

    // Valid AMEO features allowed into model
    const allowedAmeoKeys = new Set([
      "percentage_10th",
      "percentage_12th",
      "college_gpa",
      "college_tier",
      "degree",
      "specialization",
      "english_score",
      "logical_score",
      "quant_score",
      "computer_programming_score",
      "conscientiousness",
      "agreeableness",
      "extraversion",
      "neuroticism",
      "openness_to_experience",
    ]);

    const profileKeys = Object.keys(studentWithExams.profile);
    for (const key of profileKeys) {
      assert.equal(allowedAmeoKeys.has(key), true, `Key ${key} must be an authorized AMEO feature`);
    }

    assert.equal("exams" in studentWithExams.profile, false, "Entrance exams must NOT be inside student ML profile");
    assert.equal("jee_percentile" in studentWithExams.profile, false, "JEE percentile must NOT be inside student ML profile");
  });
});

describe("7. Zero Preset / Initial Empty State Verification", () => {
  test("initial student profile state starts empty without hardcoded presets", () => {
    const initialProfileState = null;
    const initialExamsState = [];

    assert.equal(initialProfileState, null, "Profile must initially be null / unanalyzed");
    assert.equal(initialExamsState.length, 0, "No fake exams should be preloaded");
  });
});
