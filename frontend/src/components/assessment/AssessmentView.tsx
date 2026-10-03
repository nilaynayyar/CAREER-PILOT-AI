import React, { useState } from "react";
import { StudentProfile, OnetOccupation, EntranceExamEntry, CareerPreferences } from "@/types/careerpilot";
import { PageId } from "../layout/Sidebar";

interface AssessmentViewProps {
  profile: StudentProfile | null;
  exams: EntranceExamEntry[];
  preferences: CareerPreferences;
  occupations: OnetOccupation[];
  onRunPipeline: (selectedSocCode?: string, durationPreference?: string) => Promise<void>;
  isLoading: boolean;
  loadingStep: string;
  errorMessage: string | null;
  onNavigate: (page: PageId) => void;
  hasAnalyzed: boolean;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  profile,
  exams,
  preferences,
  occupations,
  onRunPipeline,
  isLoading,
  loadingStep,
  errorMessage,
  onNavigate,
  hasAnalyzed,
}) => {
  const [selectedSoc, setSelectedSoc] = useState<string>("");
  const [duration, setDuration] = useState<string>("3 months");

  const isProfileComplete = profile !== null;

  const PIPELINE_STEPS = [
    { id: 1, title: "1. Statistical ML Salary Tier Prediction", engine: "Logistic Regression (AMEO 2015)" },
    { id: 2, title: "2. Permutation Feature Importance", engine: "Model Association Explainer" },
    { id: 3, title: "3. O*NET Occupational Knowledge Retrieval", engine: "USDOL O*NET 28.0 Database" },
    { id: 4, title: "4. Agentic AI Career Exploration", engine: "Occupational Alignment Agent" },
    { id: 5, title: "5. Skill Gap Analysis", engine: "Competency Gap Diagnostic Agent" },
    { id: 6, title: "6. Structured Learning Roadmap", engine: "Curriculum Progression Agent" },
    { id: 7, title: "7. Hands-on Project Recommendations", engine: "Practical Competency Agent" },
  ];

  const handleStartAnalysis = async () => {
    if (!profile) return;
    await onRunPipeline(selectedSoc || undefined, duration);
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto" }}>
      {/* Readiness Check Card */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          Pipeline Readiness Checklist
        </h3>
        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
          Verify that your profile credentials are valid before launching the statistical prediction and agentic guidance pipeline.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {/* Academic check */}
          <div
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "8px",
              backgroundColor: "var(--bg-tertiary)",
              border: `1px solid ${isProfileComplete ? "rgba(16, 185, 129, 0.35)" : "rgba(245, 158, 11, 0.35)"}`,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span style={{ color: isProfileComplete ? "var(--success)" : "var(--warning)", fontSize: "1.2rem" }}>
              {isProfileComplete ? "✓" : "!"}
            </span>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Academic Profile
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {isProfileComplete ? `${profile.degree} · ${profile.specialization}` : "Incomplete"}
              </div>
            </div>
          </div>

          {/* Aptitude check */}
          <div
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "8px",
              backgroundColor: "var(--bg-tertiary)",
              border: `1px solid ${isProfileComplete ? "rgba(16, 185, 129, 0.35)" : "rgba(245, 158, 11, 0.35)"}`,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span style={{ color: isProfileComplete ? "var(--success)" : "var(--warning)", fontSize: "1.2rem" }}>
              {isProfileComplete ? "✓" : "!"}
            </span>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Aptitude Scores
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {isProfileComplete ? `Eng ${profile.english_score} · Log ${profile.logical_score} · Quant ${profile.quant_score}` : "Incomplete"}
              </div>
            </div>
          </div>

          {/* Personality check */}
          <div
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "8px",
              backgroundColor: "var(--bg-tertiary)",
              border: `1px solid ${isProfileComplete ? "rgba(16, 185, 129, 0.35)" : "rgba(245, 158, 11, 0.35)"}`,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span style={{ color: isProfileComplete ? "var(--success)" : "var(--warning)", fontSize: "1.2rem" }}>
              {isProfileComplete ? "✓" : "!"}
            </span>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Big Five Personality
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {isProfileComplete ? "Standardized z-scores set" : "Incomplete"}
              </div>
            </div>
          </div>

          {/* Context check */}
          <div
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "8px",
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid rgba(6, 182, 212, 0.35)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span style={{ color: "var(--accent-cyan)", fontSize: "1.2rem" }}>ℹ</span>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Career Context
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {exams.length > 0 ? `${exams.length} exams recorded` : "No entrance exams"}
              </div>
            </div>
          </div>
        </div>

        {!isProfileComplete && (
          <div style={{ marginTop: "1.5rem" }}>
            <button className="btn btn-primary" onClick={() => onNavigate("profile")}>
              Complete Student Profile First
            </button>
          </div>
        )}
      </div>

      {/* Target Configuration Card */}
      {isProfileComplete && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            Pipeline Target & Scope Configuration
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
            Customize the occupational target and learning timeframe.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {/* Target Occupation */}
            <div>
              <label htmlFor="target_occupation">Target O*NET Occupation</label>
              <select
                id="target_occupation"
                value={selectedSoc}
                onChange={(e) => setSelectedSoc(e.target.value)}
              >
                <option value="">Let CareerPilot AI determine profile-aligned match</option>
                {occupations.map((occ) => (
                  <option key={occ.soc_code} value={occ.soc_code}>
                    {occ.title} ({occ.soc_code})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
                Optionally select a specific target role or let the agent evaluate your profile.
              </span>
            </div>

            {/* Duration Preference */}
            <div>
              <label htmlFor="duration_pref">Learning Roadmap Horizon</label>
              <select
                id="duration_pref"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="1 month">1 Month (Accelerated Intensive Sprint)</option>
                <option value="3 months">3 Months (Standard Quarter Progression)</option>
                <option value="6 months">6 Months (Comprehensive Mastery Path)</option>
              </select>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
                Controls the phased timeline generated by the roadmap agent.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "10px",
            backgroundColor: "rgba(244, 63, 94, 0.12)",
            border: "1px solid rgba(244, 63, 94, 0.4)",
            color: "var(--danger)",
            fontSize: "0.88rem",
            marginBottom: "1.5rem",
          }}
        >
          <strong>Analysis Pipeline Error:</strong>
          <p style={{ marginTop: "0.25rem" }}>{errorMessage}</p>
        </div>
      )}

      {/* Execution Stepper / Trigger */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Multi-Layer Career Intelligence Pipeline
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              All 7 steps execute in sequence: Statistical Model first, followed by Agentic Guidance.
            </p>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleStartAnalysis}
            disabled={!isProfileComplete || isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-pulse" style={{ display: "inline-block" }}>●</span>
                Processing Pipeline...
              </>
            ) : hasAnalyzed ? (
              "Re-run Full Analysis"
            ) : (
              "Run CareerPilot AI Pipeline"
            )}
          </button>
        </div>

        {/* Live Loading Step Indicator */}
        {isLoading && (
          <div
            style={{
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor: "rgba(13, 148, 136, 0.15)",
              border: "1px solid var(--accent-teal)",
              color: "var(--accent-teal-light)",
              fontSize: "0.9rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                width: "18px",
                height: "18px",
                border: "2px solid var(--accent-teal)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span>{loadingStep || "Initializing pipeline..."}</span>
          </div>
        )}

        {/* Pipeline Step List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {PIPELINE_STEPS.map((step) => (
            <div
              key={step.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: hasAnalyzed ? "var(--accent-teal)" : "var(--border-medium)",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {hasAnalyzed ? "✓" : step.id}
                </span>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {step.title}
                </span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {step.engine}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
