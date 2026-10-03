import React from "react";

interface ContextBadgeProps {
  label?: string;
  variant?: "context" | "ml";
}

export const ContextBadge: React.FC<ContextBadgeProps> = ({
  label = "Used as career context — not an ML prediction feature",
  variant = "context",
}) => {
  if (variant === "ml") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          fontSize: "0.725rem",
          fontWeight: 600,
          padding: "0.2rem 0.55rem",
          borderRadius: "6px",
          backgroundColor: "rgba(13, 148, 136, 0.15)",
          color: "var(--accent-teal-light)",
          border: "1px solid rgba(13, 148, 136, 0.35)",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        AMEO 2015 ML Feature
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.725rem",
        fontWeight: 500,
        padding: "0.25rem 0.65rem",
        borderRadius: "6px",
        backgroundColor: "rgba(6, 182, 212, 0.08)",
        color: "var(--accent-cyan)",
        border: "1px dashed rgba(6, 182, 212, 0.4)",
      }}
      title="This information is used by the agentic guidance layer for personalizing roadmaps and projects. It is NOT fed into the statistical ML model."
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      {label}
    </span>
  );
};
