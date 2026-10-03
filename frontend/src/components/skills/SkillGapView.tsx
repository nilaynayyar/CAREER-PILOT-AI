import React from "react";
import { SkillGapOutput, SkillGapItem } from "@/types/careerpilot";
import { EmptyState } from "../common/EmptyState";
import { PageId } from "../layout/Sidebar";

interface SkillGapViewProps {
  skillGap: SkillGapOutput | null;
  onNavigate: (page: PageId) => void;
}

export const SkillGapView: React.FC<SkillGapViewProps> = ({ skillGap, onNavigate }) => {
  if (!skillGap) {
    return (
      <EmptyState
        title="Skill Gap Analysis Not Generated Yet"
        description="Complete your career analysis pipeline to generate a diagnostic skill-gap evaluation against your target engineering occupation."
        actionText="Run Assessment Pipeline"
        onAction={() => onNavigate("assessment")}
      />
    );
  }

  const { occupation_title, soc_code, current_strengths, skill_gaps, gap_summary, data_limitation } = skillGap;

  const priorityGaps = skill_gaps.filter((g) => g.priority === "high");
  const otherGaps = skill_gaps.filter((g) => g.priority !== "high");

  // Helper to extract actionable breakdown from description or skill context
  const getActionableBreakdown = (gap: SkillGapItem) => {
    const nameLower = gap.skill_name.toLowerCase();

    if (nameLower.includes("python") || nameLower.includes("programming") || nameLower.includes("software")) {
      return {
        whatToLearn: "Language syntax & semantics → Data structures (lists, dicts, trees) → OOP & functional patterns → REST APIs & testing.",
        suggestedPractice: "Implement 10 LeetCode / HackerRank problems focusing on hash maps, two pointers, and API requests.",
        suggestedProject: "Build a production-style REST API with automated unit tests and structured error handling.",
      };
    }
    if (nameLower.includes("data") || nameLower.includes("database") || nameLower.includes("sql") || nameLower.includes("analytic")) {
      return {
        whatToLearn: "Relational modeling → SQL querying (JOINs, Window functions, CTEs) → Indexing & query optimization → Data pipelines.",
        suggestedPractice: "Write 15 complex analytical SQL queries against a multi-table database schema (e.g. e-commerce transactions).",
        suggestedProject: "Build an end-to-end data pipeline importing messy CSVs into PostgreSQL with automated cleaning scripts.",
      };
    }
    if (nameLower.includes("cloud") || nameLower.includes("devops") || nameLower.includes("system") || nameLower.includes("network")) {
      return {
        whatToLearn: "Linux fundamentals → Networking protocols (TCP/IP, DNS, HTTP/HTTPS) → Containerization (Docker) → CI/CD pipelines.",
        suggestedPractice: "Configure a multi-container Docker compose environment with health checks and environment secrets.",
        suggestedProject: "Deploy an open-source application to a free-tier VPS with automated GitHub Actions CI/CD and SSL certificate.",
      };
    }
    if (nameLower.includes("security") || nameLower.includes("cyber") || nameLower.includes("threat")) {
      return {
        whatToLearn: "OWASP Top 10 vulnerabilities → Cryptography basics → Authentication (JWT, OAuth2) → Network traffic analysis.",
        suggestedPractice: "Complete 3 web security capture-the-flag (CTF) labs on TryHackMe or PortSwigger Web Security Academy.",
        suggestedProject: "Perform a documented vulnerability audit on a deliberately insecure application and author remediation patches.",
      };
    }

    return {
      whatToLearn: `Core foundational principles of ${gap.skill_name} → Standard tooling & libraries → Industry design patterns.`,
      suggestedPractice: `Complete 5 structured practical exercises focusing on hands-on application of ${gap.skill_name}.`,
      suggestedProject: `Build a small targeted deliverable demonstrating measurable competency in ${gap.skill_name}.`,
    };
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Title */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Skill Gap Analysis
        </h2>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
          Target Occupation: <strong style={{ color: "var(--accent-teal-light)" }}>{occupation_title}</strong> (SOC {soc_code})
        </p>
      </div>

      {/* Summary Box */}
      {gap_summary && (
        <div
          className="card"
          style={{
            marginBottom: "2rem",
            backgroundColor: "var(--bg-card)",
            borderLeft: "4px solid var(--accent-teal)",
          }}
        >
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
            Diagnostic Assessment Summary
          </h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {gap_summary}
          </p>
        </div>
      )}

      {/* Current Strengths Section */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Current Verified Strengths
          </h3>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              color: "var(--success)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
            }}
          >
            {current_strengths.length} Core Strengths
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.85rem" }}>
          {current_strengths.map((str, idx) => (
            <div
              key={idx}
              style={{
                padding: "0.85rem 1rem",
                borderRadius: "8px",
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.6rem",
              }}
            >
              <span style={{ color: "var(--success)", fontWeight: 700, fontSize: "1rem" }}>✓</span>
              <div>
                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {str}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.15rem" }}>
                  Demonstrated from academic specialization & aptitude benchmarks.
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Skills to Develop — Deep Actionable Breakdown */}
      {priorityGaps.length > 0 && (
        <div className="card" style={{ marginBottom: "2rem", borderColor: "rgba(245, 158, 11, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
                High-Priority Competencies: Action Plans
              </h3>
              <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                Specific technical concepts, practice exercises, and applied projects for each gap.
              </p>
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.2rem 0.6rem",
                borderRadius: "9999px",
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                color: "var(--warning)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
              }}
            >
              Priority Focus Areas
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {priorityGaps.map((gap, idx) => {
              const breakdown = getActionableBreakdown(gap);

              return (
                <div
                  key={idx}
                  style={{
                    padding: "1.25rem",
                    borderRadius: "10px",
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border-medium)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {idx + 1}. {gap.skill_name}
                    </h4>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.45rem",
                        borderRadius: "4px",
                        backgroundColor: "rgba(245, 158, 11, 0.12)",
                        color: "var(--warning)",
                        textTransform: "uppercase",
                      }}
                    >
                      High Priority Gap
                    </span>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "0.85rem" }}>
                    <strong style={{ color: "var(--text-primary)" }}>Why it matters: </strong>
                    {gap.gap_description}
                  </p>

                  {/* Actionable Breakdown Matrix */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.6rem",
                      padding: "0.85rem",
                      borderRadius: "8px",
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "0.825rem",
                    }}
                  >
                    <div>
                      <strong style={{ color: "var(--accent-teal-light)" }}>📚 What to Learn: </strong>
                      <span style={{ color: "var(--text-secondary)" }}>{breakdown.whatToLearn}</span>
                    </div>

                    <div>
                      <strong style={{ color: "var(--accent-cyan)" }}>⚙️ Suggested Practice: </strong>
                      <span style={{ color: "var(--text-secondary)" }}>{breakdown.suggestedPractice}</span>
                    </div>

                    <div>
                      <strong style={{ color: "var(--warning)" }}>🛠️ Suggested Project: </strong>
                      <span style={{ color: "var(--text-secondary)" }}>{breakdown.suggestedProject}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
                    <span>Source Benchmark:</span>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{gap.source || "O*NET Core Knowledge Area"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Developing Skills (Medium / Low) */}
      {otherGaps.length > 0 && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Developing & Secondary Skills
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Supplemental occupational competencies
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {otherGaps.map((gap, idx) => (
              <div
                key={idx}
                style={{
                  padding: "0.85rem 1rem",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {gap.skill_name}
                  </h4>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      padding: "0.1rem 0.4rem",
                      borderRadius: "4px",
                      backgroundColor: "var(--bg-card)",
                      color: "var(--text-muted)",
                      textTransform: "capitalize",
                    }}
                  >
                    {gap.priority}
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  {gap.gap_description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimers & Limitations */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderRadius: "8px",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          lineHeight: 1.5,
          marginBottom: "1rem",
        }}
      >
        <strong>Practice & Competency Notice: </strong>
        These structured recommendations are formulated to guide technical self-study and portfolio construction. They reflect occupational benchmark practices and do not guarantee employment or compensation.
        {data_limitation && (
          <div style={{ marginTop: "0.4rem" }}>
            <strong>Data Limitation: </strong> {data_limitation}
          </div>
        )}
      </div>

      {/* Quick Navigation to Roadmap */}
      <div style={{ textAlign: "right", marginTop: "1.5rem" }}>
        <button className="btn btn-primary" onClick={() => onNavigate("roadmap")}>
          Proceed to Learning Roadmap
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
