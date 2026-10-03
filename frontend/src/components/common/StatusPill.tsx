import React from "react";

interface StatusPillProps {
  status: "ready" | "not_available" | "in_progress" | "complete" | "offline";
  label?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, label }) => {
  const configs = {
    ready: {
      text: label || "Ready",
      bg: "rgba(13, 148, 136, 0.15)",
      color: "var(--accent-teal-light)",
      border: "rgba(13, 148, 136, 0.35)",
    },
    not_available: {
      text: label || "Not available yet",
      bg: "rgba(100, 116, 139, 0.12)",
      color: "var(--text-muted)",
      border: "rgba(100, 116, 139, 0.25)",
    },
    in_progress: {
      text: label || "Analyzing...",
      bg: "rgba(6, 182, 212, 0.15)",
      color: "var(--accent-cyan)",
      border: "rgba(6, 182, 212, 0.4)",
    },
    complete: {
      text: label || "Completed",
      bg: "rgba(16, 185, 129, 0.15)",
      color: "var(--success)",
      border: "rgba(16, 185, 129, 0.4)",
    },
    offline: {
      text: label || "AI Offline Fallback",
      bg: "rgba(245, 158, 11, 0.15)",
      color: "var(--warning)",
      border: "rgba(245, 158, 11, 0.4)",
    },
  };

  const cfg = configs[status] || configs.not_available;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        padding: "0.2rem 0.6rem",
        borderRadius: "9999px",
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: cfg.color,
        }}
      />
      {cfg.text}
    </span>
  );
};
