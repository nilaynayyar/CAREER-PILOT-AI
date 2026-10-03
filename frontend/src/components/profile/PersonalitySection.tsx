import React from "react";
import { ContextBadge } from "../common/ContextBadge";

export interface PersonalityData {
  conscientiousness: string;
  agreeableness: string;
  extraversion: string;
  neuroticism: string;
  openness_to_experience: string;
}

interface PersonalitySectionProps {
  data: PersonalityData;
  onChange: (field: keyof PersonalityData, value: string) => void;
  errors: Record<string, string>;
}

const TRAITS: { key: keyof PersonalityData; title: string; desc: string }[] = [
  {
    key: "conscientiousness",
    title: "Conscientiousness",
    desc: "Self-discipline, organization, goal-directed behavior vs. spontaneous flexibility.",
  },
  {
    key: "agreeableness",
    title: "Agreeableness",
    desc: "Cooperative, empathetic, trusting orientation vs. competitive detachment.",
  },
  {
    key: "extraversion",
    title: "Extraversion",
    desc: "Sociability, assertiveness, high energy in groups vs. solitary preference.",
  },
  {
    key: "neuroticism",
    title: "Emotional Stability (Neuroticism Scale)",
    desc: "Higher values in AMEO correspond to emotional reactivity/sensitivity (-3.0 to +3.0).",
  },
  {
    key: "openness_to_experience",
    title: "Openness to Experience",
    desc: "Intellectual curiosity, creative imagination, novelty-seeking vs. conventionality.",
  },
];

export const PersonalitySection: React.FC<PersonalitySectionProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            C. Personality Profile (Big Five)
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            AMCAT Five-Factor Model normalized z-scores ranging from -3.0 (low) to +3.0 (high). Neutral midpoint is 0.0.
          </p>
        </div>
        <ContextBadge variant="ml" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
        {TRAITS.map((trait) => {
          const val = data[trait.key];
          const hasVal = val !== "";
          const numVal = hasVal ? parseFloat(val) : 0;
          return (
            <div
              key={trait.key}
              style={{
                padding: "1rem",
                borderRadius: "10px",
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {trait.title}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    color: hasVal ? "var(--accent-teal-light)" : "var(--text-muted)",
                  }}
                >
                  {hasVal ? (numVal > 0 ? `+${numVal.toFixed(2)}` : numVal.toFixed(2)) : "Not provided (0.0)"}
                </span>
              </div>
              <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: "0.75rem", minHeight: "28px" }}>
                {trait.desc}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input
                  type="range"
                  min="-3.0"
                  max="3.0"
                  step="0.05"
                  value={hasVal ? numVal : 0}
                  onChange={(e) => onChange(trait.key, e.target.value)}
                  style={{
                    flex: 1,
                    accentColor: "var(--accent-teal)",
                    cursor: "pointer",
                    padding: 0,
                    height: "6px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => onChange(trait.key, "0.0")}
                  style={{
                    fontSize: "0.7rem",
                    padding: "0.2rem 0.45rem",
                    borderRadius: "4px",
                    border: "1px solid var(--border-medium)",
                    backgroundColor: "transparent",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                  }}
                  title="Reset to neutral (0.0)"
                >
                  Reset
                </button>
              </div>

              {errors[trait.key] && (
                <span style={{ fontSize: "0.72rem", color: "var(--danger)", marginTop: "0.35rem", display: "block" }}>
                  {errors[trait.key]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
