import React from "react";
import { HealthStatus } from "@/types/careerpilot";

export type PageId =
  | "dashboard"
  | "profile"
  | "assessment"
  | "ml_outcome"
  | "model_explanation"
  | "career_exploration"
  | "career_detail"
  | "skill_gap"
  | "roadmap"
  | "projects"
  | "report"
  | "about";

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  health: HealthStatus | null;
  hasAnalyzed: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavGroup {
  groupName: string;
  items: {
    id: PageId;
    label: string;
    badge?: string;
    icon: React.ReactNode;
    requiresAnalysis?: boolean;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  health,
  hasAnalyzed,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navGroups: NavGroup[] = [
    {
      groupName: "COMMAND CENTER",
      items: [
        {
          id: "dashboard",
          label: "Dashboard / Overview",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
          ),
        },
      ],
    },
    {
      groupName: "PROFILE & INPUT",
      items: [
        {
          id: "profile",
          label: "Student Profile",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ),
        },
        {
          id: "assessment",
          label: "Assessment & Pipeline",
          badge: hasAnalyzed ? "Ran" : "Ready",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          ),
        },
      ],
    },
    {
      groupName: "MACHINE LEARNING",
      items: [
        {
          id: "ml_outcome",
          label: "ML Employment Outcome",
          badge: "AMEO",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          ),
        },
        {
          id: "model_explanation",
          label: "Model Explanation",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          ),
        },
      ],
    },
    {
      groupName: "OCCUPATIONAL GUIDANCE",
      items: [
        {
          id: "career_exploration",
          label: "Career Exploration",
          badge: "O*NET",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          ),
        },
        {
          id: "career_detail",
          label: "Career Detail",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          ),
        },
        {
          id: "skill_gap",
          label: "Skill Gap Analysis",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10" />
              <path d="M12 20V4" />
              <path d="M6 20v-6" />
            </svg>
          ),
        },
        {
          id: "roadmap",
          label: "Learning Roadmap",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 14 14" />
            </svg>
          ),
        },
        {
          id: "projects",
          label: "Project Recommendations",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          ),
        },
      ],
    },
    {
      groupName: "SYNTHESIS & REPORT",
      items: [
        {
          id: "report",
          label: "Final Intelligence Report",
          badge: hasAnalyzed ? "Full" : undefined,
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          ),
        },
        {
          id: "about",
          label: "About & Methodology",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
        },
      ],
    },
  ];

  const handleItemClick = (id: PageId) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            zIndex: 90,
          }}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        style={{
          width: "var(--sidebar-width)",
          minWidth: "var(--sidebar-width)",
          backgroundColor: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "sticky",
          top: 0,
          zIndex: 100,
          transition: "transform 0.25s ease-in-out",
        }}
        className={`sidebar-nav ${isOpenMobile ? "open-mobile" : ""}`}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "1.25rem 1.25rem 1rem",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-cyan) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 2px 10px rgba(13, 148, 136, 0.35)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
                CareerPilot
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  backgroundColor: "var(--accent-teal)",
                  color: "#ffffff",
                  padding: "0.1rem 0.35rem",
                  borderRadius: "4px",
                  letterSpacing: "0.05em",
                }}
              >
                AI
              </span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
              Career Intelligence Platform
            </p>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem 0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {navGroups.map((group) => (
            <div key={group.groupName}>
              <div
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  padding: "0 0.5rem 0.4rem",
                }}
              >
                {group.groupName}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                {group.items.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.65rem",
                        width: "100%",
                        padding: "0.55rem 0.65rem",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? "#ffffff" : "var(--text-secondary)",
                        backgroundColor: isActive ? "var(--accent-teal)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                          e.currentTarget.style.color = "var(--text-primary)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "var(--text-secondary)";
                        }
                      }}
                    >
                      <span style={{ color: isActive ? "#ffffff" : "var(--accent-cyan)", display: "flex" }}>
                        {item.icon}
                      </span>
                      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            padding: "0.15rem 0.45rem",
                            borderRadius: "4px",
                            backgroundColor: isActive ? "rgba(255, 255, 255, 0.2)" : "var(--bg-card)",
                            color: isActive ? "#ffffff" : "var(--accent-cyan)",
                            border: isActive ? "none" : "1px solid var(--border-subtle)",
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* System & Engine Status */}
        <div
          style={{
            padding: "0.85rem 1rem",
            borderTop: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-tertiary)",
            fontSize: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>ML Engine</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--accent-teal-light)", fontWeight: 600 }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--accent-teal)" }} />
              AMEO 2015
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>AI Guidance</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: health?.gemini_available ? "var(--success)" : "var(--warning)", fontWeight: 600 }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: health?.gemini_available ? "var(--success)" : "var(--warning)" }} />
              {health?.gemini_available ? "Gemini Online" : "Offline Fallback"}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
