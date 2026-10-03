import React from "react";
import { PageId } from "./Sidebar";
import { HealthStatus } from "@/types/careerpilot";

interface HeaderProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  health: HealthStatus | null;
  onToggleMobileMenu: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  hasAnalyzed: boolean;
}

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Command Center",
    subtitle: "High-level overview of your profile and career intelligence status",
  },
  profile: {
    title: "Student Profile",
    subtitle: "Provide your authentic academic, aptitude, personality, and entrance exam credentials",
  },
  assessment: {
    title: "Assessment & Pipeline",
    subtitle: "Execute the end-to-end ML prediction and agentic occupational analysis",
  },
  ml_outcome: {
    title: "ML Employment Outcome",
    subtitle: "Statistical prediction from the trained AMEO 2015 model",
  },
  model_explanation: {
    title: "Model Explanation",
    subtitle: "Scientific methodology, permutation importance, and architectural boundaries",
  },
  career_exploration: {
    title: "Explore Career Paths",
    subtitle: "Explore occupations using your profile and occupational knowledge",
  },
  career_detail: {
    title: "Occupation Detail",
    subtitle: "Deep-dive into O*NET knowledge, core competencies, and technology requirements",
  },
  skill_gap: {
    title: "Skill Gap Analysis",
    subtitle: "Targeted evaluation of profile strengths versus occupational benchmarks",
  },
  roadmap: {
    title: "Structured Learning Roadmap",
    subtitle: "Phase-by-phase learning path and key technical milestones",
  },
  projects: {
    title: "Project Recommendations",
    subtitle: "Hands-on projects to develop and demonstrate occupational competencies",
  },
  report: {
    title: "Career Intelligence Report",
    subtitle: "Unified multi-layer summary synthesized from statistical ML and O*NET intelligence",
  },
  about: {
    title: "About & Methodology",
    subtitle: "System architecture, dataset provenance, and scientific citations",
  },
};

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  health,
  onToggleMobileMenu,
  theme,
  onToggleTheme,
  hasAnalyzed,
}) => {
  const meta = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;

  return (
    <header
      style={{
        height: "var(--header-height)",
        backgroundColor: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.75rem",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left: Mobile Toggle & Page Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={onToggleMobileMenu}
          className="mobile-menu-btn"
          style={{
            display: "none",
            backgroundColor: "transparent",
            border: "1px solid var(--border-medium)",
            borderRadius: "6px",
            color: "var(--text-primary)",
            padding: "0.4rem",
            cursor: "pointer",
          }}
          aria-label="Toggle Navigation Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
            {meta.title}
          </h1>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "none" }} className="header-subtitle">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick actions, Theme Toggle, Health */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
        {/* Offline indicator if fallback active */}
        {health && !health.gemini_available && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "0.25rem 0.6rem",
              borderRadius: "6px",
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              color: "var(--warning)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--warning)" }} />
            AI Guidance: Offline Fallback
          </span>
        )}

        {/* Quick CTA button */}
        {!hasAnalyzed ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate("profile")}
          >
            Build Profile
          </button>
        ) : (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate("report")}
          >
            View Full Report
          </button>
        )}

        {/* Dark / Light Mode Switch */}
        <button
          onClick={onToggleTheme}
          style={{
            backgroundColor: "var(--bg-tertiary)",
            border: "1px solid var(--border-medium)",
            borderRadius: "8px",
            padding: "0.45rem 0.65rem",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle color theme"
        >
          {theme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
