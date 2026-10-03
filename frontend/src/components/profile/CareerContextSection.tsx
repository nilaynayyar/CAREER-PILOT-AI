import React from "react";
import { CareerPreferences } from "@/types/careerpilot";
import { ContextBadge } from "../common/ContextBadge";

interface CareerContextSectionProps {
  preferences: CareerPreferences;
  onPreferencesChange: (preferences: CareerPreferences) => void;
}

const DOMAIN_OPTIONS = [
  "Artificial Intelligence & Machine Learning",
  "Full-Stack Web & Distributed Systems",
  "Cloud Architecture & DevOps",
  "Data Engineering & Big Data",
  "Cybersecurity & Threat Intelligence",
  "Embedded Systems & IoT",
  "Robotics & Control Systems",
  "Enterprise Software Solutions",
];

const WORK_AREA_OPTIONS = [
  "High-Growth Tech Startups",
  "Enterprise Product R&D",
  "Open Source & Infrastructure",
  "Technical Consulting & Advisory",
  "Scientific & Academic Research",
];

const LEARNING_STYLE_OPTIONS = [
  { value: "hands_on", label: "Hands-on Project Building (Build-as-you-learn)" },
  { value: "structured", label: "Structured Coursework & Certifications" },
  { value: "theory_first", label: "Foundational Theory & Deep Technical Reading" },
  { value: "mentorship", label: "Mentorship & Code Reviews" },
];

export const CareerContextSection: React.FC<CareerContextSectionProps> = ({
  preferences,
  onPreferencesChange,
}) => {
  const toggleDomain = (domain: string) => {
    const current = preferences.interestedDomains || [];
    const updated = current.includes(domain)
      ? current.filter((d) => d !== domain)
      : [...current, domain];
    onPreferencesChange({ ...preferences, interestedDomains: updated });
  };

  const toggleWorkArea = (area: string) => {
    const current = preferences.preferredWorkAreas || [];
    const updated = current.includes(area)
      ? current.filter((a) => a !== area)
      : [...current, area];
    onPreferencesChange({ ...preferences, preferredWorkAreas: updated });
  };

  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            E. Career Interests & Guidance Preferences
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Contextual preferences for tailoring agentic recommendations, roadmaps, and projects.
          </p>
        </div>
        <ContextBadge label="Used as career context — not an ML prediction feature" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Interested Domains */}
        <div>
          <label style={{ marginBottom: "0.5rem" }}>Interested Technical Domains</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {DOMAIN_OPTIONS.map((domain) => {
              const selected = preferences.interestedDomains?.includes(domain);
              return (
                <button
                  type="button"
                  key={domain}
                  onClick={() => toggleDomain(domain)}
                  style={{
                    padding: "0.4rem 0.75rem",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    backgroundColor: selected ? "var(--accent-teal)" : "var(--bg-tertiary)",
                    color: selected ? "#ffffff" : "var(--text-secondary)",
                    border: selected ? "1px solid var(--accent-teal-light)" : "1px solid var(--border-medium)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {selected && "✓ "}
                  {domain}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Work Areas */}
        <div>
          <label style={{ marginBottom: "0.5rem" }}>Preferred Work Environments</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {WORK_AREA_OPTIONS.map((area) => {
              const selected = preferences.preferredWorkAreas?.includes(area);
              return (
                <button
                  type="button"
                  key={area}
                  onClick={() => toggleWorkArea(area)}
                  style={{
                    padding: "0.4rem 0.75rem",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    backgroundColor: selected ? "var(--accent-cyan)" : "var(--bg-tertiary)",
                    color: selected ? "#070d12" : "var(--text-secondary)",
                    border: selected ? "1px solid var(--accent-cyan-light)" : "1px solid var(--border-medium)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {selected && "✓ "}
                  {area}
                </button>
              );
            })}
          </div>
        </div>

        {/* Learning Style */}
        <div style={{ maxWidth: "480px" }}>
          <label htmlFor="learning_style" style={{ marginBottom: "0.35rem" }}>Preferred Learning Style</label>
          <select
            id="learning_style"
            value={preferences.preferredLearningStyle || "hands_on"}
            onChange={(e) => onPreferencesChange({ ...preferences, preferredLearningStyle: e.target.value })}
          >
            {LEARNING_STYLE_OPTIONS.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
