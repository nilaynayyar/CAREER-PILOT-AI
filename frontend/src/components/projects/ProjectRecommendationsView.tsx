import React, { useState, useMemo } from "react";
import { ProjectsOutput, DifficultyLevel, ProjectRecommendation } from "@/types/careerpilot";
import { EmptyState } from "../common/EmptyState";
import { PageId } from "../layout/Sidebar";

interface ProjectRecommendationsViewProps {
  projectsOutput: ProjectsOutput | null;
  onNavigate: (page: PageId) => void;
}

export const ProjectRecommendationsView: React.FC<ProjectRecommendationsViewProps> = ({
  projectsOutput,
  onNavigate,
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>("All");

  if (!projectsOutput || !projectsOutput.projects || projectsOutput.projects.length === 0) {
    return (
      <EmptyState
        title="Project Recommendations Not Generated Yet"
        description="Your hands-on project recommendations will appear after completing the career intelligence analysis pipeline."
        actionText="Run Assessment Pipeline"
        onAction={() => onNavigate("assessment")}
      />
    );
  }

  const { occupation_title, projects, general_tip } = projectsOutput;

  const filteredProjects = useMemo(() => {
    if (filterDifficulty === "All") return projects;
    return projects.filter((p) => p.difficulty.toLowerCase() === filterDifficulty.toLowerCase());
  }, [projects, filterDifficulty]);

  const difficultyColors: Record<DifficultyLevel, { bg: string; color: string; border: string }> = {
    Beginner: { bg: "rgba(16, 185, 129, 0.12)", color: "var(--success)", border: "rgba(16, 185, 129, 0.35)" },
    Intermediate: { bg: "rgba(6, 182, 212, 0.12)", color: "var(--accent-cyan)", border: "rgba(6, 182, 212, 0.35)" },
    Advanced: { bg: "rgba(245, 158, 11, 0.12)", color: "var(--warning)", border: "rgba(245, 158, 11, 0.35)" },
  };

  const getConcreteDeliverables = (proj: ProjectRecommendation) => {
    const isBeg = proj.difficulty === "Beginner";
    const isAdv = proj.difficulty === "Advanced";

    if (isBeg) {
      return [
        "Clean, PEP8-compliant / linted source code in a structured directory",
        "README.md detailing setup instructions, dependencies, and execution commands",
        "Sample input/output files demonstrating edge-case handling",
        "Basic unit test suite verifying core functional methods",
      ];
    }
    if (isAdv) {
      return [
        "Modular production-grade codebase with separation of concerns and error handling",
        "Automated GitHub Actions CI/CD workflow running linters and tests",
        "Dockerfile and Docker Compose configuration for one-command replication",
        "Comprehensive API documentation (OpenAPI/Swagger) or technical whitepaper",
        "Architecture diagram and performance benchmark retrospective in README",
      ];
    }
    // Intermediate
    return [
      "Documented source repository with relational database schema or data pipeline scripts",
      "Automated test suite (e.g. pytest or Jest) achieving > 75% coverage",
      "Interactive notebook or runnable CLI / Web dashboard demonstrating output",
      "README.md detailing problem statement, architectural tradeoffs, and instructions",
    ];
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Project Recommendations
        </h2>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
          Targeted portfolio projects to build and demonstrate competencies for <strong style={{ color: "var(--accent-teal-light)" }}>{occupation_title}</strong>.
        </p>
      </div>

      {/* General Tip */}
      {general_tip && (
        <div
          className="card"
          style={{
            marginBottom: "2rem",
            backgroundColor: "var(--bg-card)",
            borderLeft: "4px solid var(--accent-teal)",
          }}
        >
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.35rem" }}>
            Portfolio Engineering Tip
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
            {general_tip}
          </p>
        </div>
      )}

      {/* Difficulty Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem" }}>
        {["All", "Beginner", "Intermediate", "Advanced"].map((level) => {
          const isActive = filterDifficulty === level;
          return (
            <button
              key={level}
              onClick={() => setFilterDifficulty(level)}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor: isActive ? "var(--accent-teal)" : "var(--bg-card)",
                color: isActive ? "#ffffff" : "var(--text-secondary)",
                border: isActive ? "1px solid var(--accent-teal-light)" : "1px solid var(--border-medium)",
                transition: "all 0.15s ease",
              }}
            >
              {level}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        {filteredProjects.map((proj, idx) => {
          const diffInfo = difficultyColors[proj.difficulty] || difficultyColors.Intermediate;
          const deliverables = getConcreteDeliverables(proj);

          return (
            <div
              key={idx}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "1.5rem",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "6px",
                      backgroundColor: diffInfo.bg,
                      color: diffInfo.color,
                      border: `1px solid ${diffInfo.border}`,
                    }}
                  >
                    {proj.difficulty} Level
                  </span>

                  {proj.prerequisite && (
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      Prereq: {proj.prerequisite}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                  {proj.title}
                </h3>

                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1rem" }}>
                  {proj.objective}
                </p>

                {/* Concrete Deliverables Checklist */}
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "0.85rem",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>
                    Concrete Portfolio Deliverables:
                  </span>
                  <ul style={{ paddingLeft: "1.1rem", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                    {deliverables.map((del, dIdx) => (
                      <li key={dIdx} style={{ marginBottom: "0.2rem" }}>
                        {del}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills Developed */}
                <div style={{ marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>
                    Skills Demonstrated:
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {proj.skills_developed.map((sk) => (
                      <span
                        key={sk}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          backgroundColor: "var(--bg-tertiary)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                <div style={{ marginBottom: "1rem" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>
                    Technologies:
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {proj.suggested_technologies.map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          backgroundColor: "rgba(6, 182, 212, 0.08)",
                          color: "var(--accent-cyan)",
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expected Output */}
              <div
                style={{
                  paddingTop: "0.85rem",
                  borderTop: "1px solid var(--border-subtle)",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                <strong style={{ color: "var(--text-secondary)" }}>Expected Primary Artifact: </strong>
                {proj.expected_output}
              </div>
            </div>
          );
        })}
      </div>

      {/* Honest Practice Disclaimer */}
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
        <strong>Portfolio Practice Notice: </strong>
        Building software and engineering portfolio projects cultivates genuine competence and verifiable evidence for employers; however, no project guarantees specific compensation or employment outcomes.
      </div>

      {/* Navigation to Full Report */}
      <div style={{ textAlign: "right" }}>
        <button className="btn btn-primary" onClick={() => onNavigate("report")}>
          Open Synthesized Career Report
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
