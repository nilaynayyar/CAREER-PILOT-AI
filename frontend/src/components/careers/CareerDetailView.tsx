import React from "react";
import { OnetOccupation, FullCareerPilotReport } from "@/types/careerpilot";
import { PageId } from "../layout/Sidebar";

interface CareerDetailViewProps {
  occupation: OnetOccupation | null;
  report: FullCareerPilotReport | null;
  onNavigate: (page: PageId) => void;
}

export const CareerDetailView: React.FC<CareerDetailViewProps> = ({
  occupation,
  report,
  onNavigate,
}) => {
  if (!occupation) {
    return (
      <div className="card" style={{ maxWidth: "700px", margin: "2rem auto", textAlign: "center", padding: "3rem 1.5rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          No Occupation Selected
        </h3>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Please select an occupation from the Career Exploration catalog to inspect its detailed O*NET taxonomy and guidance breakdown.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate("career_exploration")}>
          Explore Occupations Catalog
        </button>
      </div>
    );
  }

  const isMatchingReport = report?.ai_guidance_section?.selected_occupation?.soc_code === occupation.soc_code;
  const skillGapData = isMatchingReport ? report?.ai_guidance_section?.skill_gap : null;
  const projectsData = isMatchingReport ? report?.ai_guidance_section?.projects : null;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Top Navigation Back */}
      <div style={{ marginBottom: "1.25rem" }}>
        <button
          onClick={() => onNavigate("career_exploration")}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent-teal-light)",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Career Exploration
        </button>
      </div>

      {/* Occupation Header Card */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              fontWeight: 700,
              padding: "0.2rem 0.6rem",
              borderRadius: "6px",
              backgroundColor: "rgba(6, 182, 212, 0.12)",
              color: "var(--accent-cyan)",
            }}
          >
            O*NET SOC {occupation.soc_code}
          </span>

          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              border: "1px solid var(--border-medium)",
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
            }}
          >
            USDOL Official Taxonomy
          </span>
        </div>

        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
          {occupation.title}
        </h2>

        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {occupation.description}
        </p>
      </div>

      {/* Grid: Core Skills & Tech Skills */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Core Skills */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Core O*NET Skills
            </h3>
            <span style={{ fontSize: "0.72rem", color: "var(--accent-cyan)" }}>
              O*NET Taxonomy
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {occupation.skills.map((skill) => (
              <div
                key={skill}
                style={{
                  padding: "0.6rem 0.85rem",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-tertiary)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                • {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Technology Skills */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Technology Skills
            </h3>
            <span style={{ fontSize: "0.72rem", color: "var(--accent-cyan)" }}>
              O*NET Taxonomy
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
            {occupation.tech_skills.map((tech) => (
              <span
                key={tech}
                style={{
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.825rem",
                  fontWeight: 500,
                  backgroundColor: "rgba(6, 182, 212, 0.08)",
                  color: "var(--accent-cyan)",
                  border: "1px solid rgba(6, 182, 212, 0.25)",
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Knowledge Areas & Key Tasks */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Foundational Knowledge Areas
          </h3>
          <span style={{ fontSize: "0.72rem", color: "var(--accent-cyan)" }}>
            O*NET Taxonomy
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {occupation.knowledge_areas.map((ka) => (
            <span
              key={ka}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "6px",
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-medium)",
                fontSize: "0.825rem",
                color: "var(--text-secondary)",
              }}
            >
              {ka}
            </span>
          ))}
        </div>
      </div>

      {/* AI Alignment & Guidance (If analyzed) */}
      {isMatchingReport && skillGapData && (
        <div className="card" style={{ marginBottom: "2rem", borderColor: "rgba(13, 148, 136, 0.4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Your Skill Alignment for this Occupation
            </h3>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "0.2rem 0.55rem",
                borderRadius: "4px",
                backgroundColor: "var(--accent-teal-subtle)",
                color: "var(--accent-teal-light)",
              }}
            >
              Agentic AI Evaluation
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {/* Verified Strengths */}
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--success)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Current Strengths
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {skillGapData.current_strengths.map((str) => (
                  <div
                    key={str}
                    style={{
                      padding: "0.5rem 0.75rem",
                      borderRadius: "6px",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      color: "var(--text-primary)",
                      fontSize: "0.825rem",
                    }}
                  >
                    ✓ {str}
                  </div>
                ))}
              </div>
            </div>

            {/* Target Gaps */}
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--warning)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Priority Skills to Develop
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {skillGapData.skill_gaps.slice(0, 4).map((gap) => (
                  <div
                    key={gap.skill_name}
                    style={{
                      padding: "0.5rem 0.75rem",
                      borderRadius: "6px",
                      backgroundColor: "rgba(245, 158, 11, 0.1)",
                      color: "var(--text-primary)",
                      fontSize: "0.825rem",
                    }}
                  >
                    ⚡ {gap.skill_name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate("skill_gap")}>
              View Full Skill Gap Analysis
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("roadmap")}>
              View Learning Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
