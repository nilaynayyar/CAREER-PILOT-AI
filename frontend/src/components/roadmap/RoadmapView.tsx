import React from "react";
import { LearningRoadmapOutput, RoadmapPhase } from "@/types/careerpilot";
import { EmptyState } from "../common/EmptyState";
import { PageId } from "../layout/Sidebar";

interface RoadmapViewProps {
  roadmap: LearningRoadmapOutput | null;
  onNavigate: (page: PageId) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ roadmap, onNavigate }) => {
  if (!roadmap || !roadmap.phases || roadmap.phases.length === 0) {
    return (
      <EmptyState
        title="Learning Roadmap Not Generated Yet"
        description="Your structured, phased learning roadmap will appear after completing the career intelligence analysis pipeline."
        actionText="Run Assessment Pipeline"
        onAction={() => onNavigate("assessment")}
      />
    );
  }

  const { occupation_title, total_estimated_duration, phases, general_advice, disclaimer } = roadmap;

  // Structured breakdown answering WHAT, WHY, HOW, BUILD, and EVIDENCE
  const getPhaseStructure = (phase: RoadmapPhase, idx: number) => {
    const pNum = phase.phase_number || idx + 1;
    const skills = phase.skills_covered || phase.focus_skills || [];
    const activities = phase.learning_activities || phase.recommended_activities || [];

    let why = "Establish foundational syntax, algorithmic thinking, and fundamental system concepts required before advanced specialization.";
    let build = "A fully documented command-line tool, script suite, or basic data pipeline.";
    let evidence = "Public GitHub repository with organized commits, clean README.md, and runnable test cases.";

    if (pNum === 2) {
      why = "Bridge theoretical principles to industry-standard frameworks, libraries, and core architectural patterns.";
      build = "A multi-component service, RESTful web application, or database-backed processing system.";
      evidence = "Working demonstration with automated CI/CD checks, API documentation (OpenAPI/Swagger), and Docker configuration.";
    } else if (pNum >= 3) {
      why = "Synthesize domain competencies into production-grade artifacts that withstand real-world scrutiny in technical interviews.";
      build = "An end-to-end production portfolio application addressing real problems with observability, error resilience, and deployment.";
      evidence = "Deployed live URL, published benchmark report, architecture diagrams, and comprehensive technical retrospective.";
    }

    return {
      what: skills.length > 0 ? skills.join(", ") : "Core Technical Fundamentals",
      why,
      how: activities,
      build: phase.milestone || build,
      evidence,
    };
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Structured Learning Roadmap
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", marginTop: "0.35rem" }}>
          <span style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
            Target: <strong style={{ color: "var(--accent-teal-light)" }}>{occupation_title}</strong>
          </span>
          <span style={{ color: "var(--text-muted)" }}>•</span>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.15rem 0.5rem",
              borderRadius: "4px",
              backgroundColor: "rgba(6, 182, 212, 0.12)",
              color: "var(--accent-cyan)",
            }}
          >
            Estimated Horizon: {total_estimated_duration || "Flexible"}
          </span>
          <span style={{ color: "var(--text-muted)" }}>•</span>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.15rem 0.5rem",
              borderRadius: "4px",
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            Status: Not started
          </span>
        </div>
      </div>

      {/* General Guidance Box */}
      {general_advice && (
        <div
          className="card"
          style={{
            marginBottom: "2rem",
            backgroundColor: "var(--bg-card)",
            borderLeft: "4px solid var(--accent-cyan)",
          }}
        >
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.35rem" }}>
            Curriculum Guidance Note
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
            {general_advice}
          </p>
        </div>
      )}

      {/* Phased Roadmap Timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginBottom: "2.5rem" }}>
        {phases.map((phase, idx) => {
          const struct = getPhaseStructure(phase, idx);

          return (
            <div
              key={phase.phase_number || idx}
              className="card"
              style={{
                position: "relative",
                padding: "1.75rem",
                borderLeft: "4px solid var(--accent-teal)",
              }}
            >
              {/* Phase Header */}
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1.25rem" }}>
                <div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "var(--accent-teal-light)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      display: "block",
                      marginBottom: "0.2rem",
                    }}
                  >
                    Phase {phase.phase_number || idx + 1}
                  </span>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {phase.phase_name}
                  </h3>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "0.25rem 0.65rem",
                      borderRadius: "6px",
                      backgroundColor: "var(--bg-tertiary)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-medium)",
                    }}
                  >
                    Duration: {phase.duration_estimate || (phase.duration_weeks ? `${phase.duration_weeks} Weeks` : "Self-paced")}
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      padding: "0.25rem 0.55rem",
                      borderRadius: "6px",
                      backgroundColor: "var(--bg-tertiary)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    Status: Not started
                  </span>
                </div>
              </div>

              {/* Actionable Phase Grid: WHAT, WHY, HOW, BUILD, EVIDENCE */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  padding: "1.25rem",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "0.85rem",
                }}
              >
                {/* WHAT */}
                <div>
                  <strong style={{ color: "var(--accent-teal-light)", display: "block", marginBottom: "0.2rem" }}>
                    1. WHAT SHOULD I LEARN?
                  </strong>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{struct.what}</span>
                </div>

                {/* WHY */}
                <div>
                  <strong style={{ color: "var(--accent-cyan)", display: "block", marginBottom: "0.2rem" }}>
                    2. WHY SHOULD I LEARN IT?
                  </strong>
                  <span style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{struct.why}</span>
                </div>

                {/* HOW */}
                {struct.how.length > 0 && (
                  <div>
                    <strong style={{ color: "var(--warning)", display: "block", marginBottom: "0.3rem" }}>
                      3. HOW SHOULD I PRACTICE IT?
                    </strong>
                    <ul style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                      {struct.how.map((act, aIdx) => (
                        <li key={aIdx} style={{ marginBottom: "0.25rem" }}>
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* WHAT TO BUILD */}
                <div>
                  <strong style={{ color: "var(--success)", display: "block", marginBottom: "0.2rem" }}>
                    4. WHAT SHOULD I BUILD?
                  </strong>
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{struct.build}</span>
                </div>

                {/* EVIDENCE */}
                <div>
                  <strong style={{ color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>
                    5. WHAT EVIDENCE OF PROGRESS SHOULD I PRODUCE?
                  </strong>
                  <span style={{ color: "var(--text-secondary)" }}>{struct.evidence}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimers */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderRadius: "8px",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          lineHeight: 1.5,
          marginBottom: "1.5rem",
        }}
      >
        {disclaimer ||
          "This roadmap provides a suggested progression framework. Individual learning pacing and institutional demands vary. No phase completion guarantees employment."}
      </div>

      {/* Navigation to Projects */}
      <div style={{ textAlign: "right" }}>
        <button className="btn btn-primary" onClick={() => onNavigate("projects")}>
          View Recommended Projects to Build
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
