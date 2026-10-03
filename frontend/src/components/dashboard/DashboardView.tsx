import React from "react";
import { StudentProfile, FullCareerPilotReport, EntranceExamEntry, CareerPreferences } from "@/types/careerpilot";
import { PageId } from "../layout/Sidebar";

interface DashboardViewProps {
  profile: StudentProfile | null;
  exams: EntranceExamEntry[];
  preferences: CareerPreferences;
  report: FullCareerPilotReport | null;
  onNavigate: (page: PageId) => void;
  isLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  exams,
  preferences,
  report,
  onNavigate,
  isLoading,
}) => {
  const hasProfile = profile !== null;
  const hasReport = report !== null;

  const statusCards = [
    {
      id: "profile" as PageId,
      title: "Student Profile",
      status: hasProfile ? "Ready" : "Not analyzed",
      statusType: hasProfile ? "ready" : "neutral",
      description: hasProfile
        ? `${profile.specialization} (${profile.degree}), 10th: ${profile.percentage_10th}%, 12th: ${profile.percentage_12th}%`
        : "Academic and cognitive credentials not provided yet.",
      actionLabel: hasProfile ? "Review Profile" : "Build My Career Profile",
      isPrimaryAction: !hasProfile,
    },
    {
      id: "ml_outcome" as PageId,
      title: "ML Employment Outcome",
      status: hasReport ? `Predicted: ${report.ml_section.prediction.salary_tier} Tier` : "Not available",
      statusType: hasReport ? "ready" : "neutral",
      description: hasReport
        ? `Statistical classification based on AMEO 2015 historical baseline.`
        : "Not available yet — run career analysis pipeline to calculate.",
      actionLabel: hasReport ? "View ML Prediction" : "Awaiting Analysis",
      isPrimaryAction: false,
    },
    {
      id: "career_exploration" as PageId,
      title: "Career Exploration",
      status: hasReport ? `${report.ai_guidance_section.career_analysis.suggested_occupations.length} Paths Evaluated` : "Not available",
      statusType: hasReport ? "ready" : "neutral",
      description: hasReport
        ? `Top alignment: ${report.ai_guidance_section.selected_occupation?.title || "Engineering Roles"}`
        : "Not available yet — complete analysis to explore matched occupations.",
      actionLabel: "Explore Careers",
      isPrimaryAction: false,
    },
    {
      id: "skill_gap" as PageId,
      title: "Skill Gap Analysis",
      status: hasReport ? `${report.ai_guidance_section.skill_gap.skill_gaps.length} Target Gaps` : "Not available",
      statusType: hasReport ? "ready" : "neutral",
      description: hasReport
        ? `${report.ai_guidance_section.skill_gap.current_strengths.length} verified strengths against target benchmarks.`
        : "Not available yet — requires profile and target occupation selection.",
      actionLabel: "View Skill Gaps",
      isPrimaryAction: false,
    },
    {
      id: "roadmap" as PageId,
      title: "Learning Roadmap",
      status: hasReport ? `${report.ai_guidance_section.roadmap.phases.length} Phases Structured` : "Not available",
      statusType: hasReport ? "ready" : "neutral",
      description: hasReport
        ? `Estimated duration: ${report.ai_guidance_section.roadmap.total_estimated_duration || "Flexible"}.`
        : "Not available yet — generated after occupational skill gap evaluation.",
      actionLabel: "View Roadmap",
      isPrimaryAction: false,
    },
    {
      id: "projects" as PageId,
      title: "Project Recommendations",
      status: hasReport ? `${report.ai_guidance_section.projects.projects.length} Recommended` : "Not available",
      statusType: hasReport ? "ready" : "neutral",
      description: hasReport
        ? `Targeted portfolio projects spanning beginner to advanced scope.`
        : "Not available yet — curated projects to demonstrate competencies.",
      actionLabel: "View Projects",
      isPrimaryAction: false,
    },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Hero Banner */}
      <div
        style={{
          padding: "2.5rem 2rem",
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(13, 148, 136, 0.16) 0%, rgba(6, 182, 212, 0.08) 100%)",
          border: "1px solid var(--border-medium)",
          marginBottom: "2.5rem",
          boxShadow: "var(--shadow-sm)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "760px", position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.25rem 0.65rem",
              borderRadius: "9999px",
              backgroundColor: "var(--accent-teal-subtle)",
              color: "var(--accent-teal-light)",
              border: "1px solid rgba(13, 148, 136, 0.35)",
              marginBottom: "1rem",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Career Intelligence Command Center
          </div>

          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.025em", lineHeight: 1.25 }}>
            Understand Your Employment Outlook. Discover Your Next Career Path.
          </h2>

          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginTop: "0.85rem", lineHeight: 1.6 }}>
            CareerPilot AI combines genuine supervised machine learning trained on the historical AMEO 2015 dataset with O*NET occupational intelligence and agentic guidance to map structured learning roadmaps without inflated claims.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1.75rem" }}>
            {!hasProfile ? (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => onNavigate("profile")}
              >
                Build My Career Profile
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            ) : !hasReport ? (
              <button
                className="btn btn-cyan btn-lg"
                onClick={() => onNavigate("assessment")}
              >
                Run Career Assessment Pipeline
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </button>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => onNavigate("report")}
              >
                Open Full Career Intelligence Report
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </button>
            )}

            <button
              className="btn btn-secondary btn-lg"
              onClick={() => onNavigate("model_explanation")}
            >
              Model Methodology & Transparency
            </button>
          </div>
        </div>
      </div>

      {/* Status Summary Grid */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Application Modules & Status
          </h3>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {hasReport ? "Pipeline Complete" : hasProfile ? "Profile Ready for Analysis" : "Initial Intake Required"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {statusCards.map((card) => {
            const isReady = card.statusType === "ready";
            return (
              <div
                key={card.id}
                className="card card-interactive"
                onClick={() => onNavigate(card.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "180px",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {card.title}
                    </h4>
                    <span
                      style={{
                        fontSize: "0.725rem",
                        fontWeight: 600,
                        padding: "0.2rem 0.55rem",
                        borderRadius: "9999px",
                        backgroundColor: isReady ? "rgba(16, 185, 129, 0.15)" : "var(--bg-tertiary)",
                        color: isReady ? "var(--success)" : "var(--text-muted)",
                        border: isReady ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid var(--border-subtle)",
                      }}
                    >
                      {card.status}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {card.description}
                  </p>
                </div>

                <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent-teal-light)", fontSize: "0.825rem", fontWeight: 600 }}>
                  <span>{card.actionLabel}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Context Summary Box if Exams or Preferences provided */}
      {(exams.length > 0 || (preferences.interestedDomains && preferences.interestedDomains.length > 0)) && (
        <div
          className="card"
          style={{
            marginBottom: "2.5rem",
            backgroundColor: "var(--bg-card)",
            borderColor: "rgba(6, 182, 212, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "0.2rem 0.5rem",
                borderRadius: "4px",
                backgroundColor: "rgba(6, 182, 212, 0.12)",
                color: "var(--accent-cyan)",
              }}
            >
              Career Context
            </span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Recorded Educational & Preference Signals
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {exams.length > 0 && (
              <div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>
                  National Entrance Examinations:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {exams.map((ex) => (
                    <span
                      key={ex.id}
                      style={{
                        fontSize: "0.78rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-tertiary)",
                        border: "1px solid var(--border-medium)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {ex.exam} {ex.status ? `(${ex.status})` : ""} {ex.percentile ? `· ${ex.percentile}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {preferences.interestedDomains && preferences.interestedDomains.length > 0 && (
              <div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>
                  Focus Domains:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {preferences.interestedDomains.map((dom) => (
                    <span
                      key={dom}
                      style={{
                        fontSize: "0.78rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-tertiary)",
                        border: "1px solid var(--border-medium)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {dom}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
