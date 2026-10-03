import React from "react";
import { ContextBadge } from "../common/ContextBadge";

export interface AptitudeData {
  english_score: string;
  logical_score: string;
  quant_score: string;
  computer_programming_score: string;
}

interface AptitudeSectionProps {
  data: AptitudeData;
  onChange: (field: keyof AptitudeData, value: string) => void;
  errors: Record<string, string>;
}

export const AptitudeSection: React.FC<AptitudeSectionProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            B. Aptitude & Cognitive Assessment Data
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Standardized AMCAT aptitude assessment scores (valid scale: 200 – 900 points).
          </p>
        </div>
        <ContextBadge variant="ml" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
        {/* English Score */}
        <div>
          <label htmlFor="english_score">
            English Comprehension Score <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            id="english_score"
            type="number"
            min="200"
            max="900"
            step="5"
            placeholder="e.g. 560"
            value={data.english_score}
            onChange={(e) => onChange("english_score", e.target.value)}
            style={{ borderColor: errors.english_score ? "var(--danger)" : undefined }}
          />
          {errors.english_score ? (
            <span style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.25rem", display: "block" }}>
              {errors.english_score}
            </span>
          ) : (
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
              Scale: 200 – 900 points
            </span>
          )}
        </div>

        {/* Logical Ability Score */}
        <div>
          <label htmlFor="logical_score">
            Logical Ability Score <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            id="logical_score"
            type="number"
            min="200"
            max="900"
            step="5"
            placeholder="e.g. 610"
            value={data.logical_score}
            onChange={(e) => onChange("logical_score", e.target.value)}
            style={{ borderColor: errors.logical_score ? "var(--danger)" : undefined }}
          />
          {errors.logical_score ? (
            <span style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.25rem", display: "block" }}>
              {errors.logical_score}
            </span>
          ) : (
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
              Scale: 200 – 900 points
            </span>
          )}
        </div>

        {/* Quantitative Ability Score */}
        <div>
          <label htmlFor="quant_score">
            Quantitative Ability Score <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            id="quant_score"
            type="number"
            min="200"
            max="900"
            step="5"
            placeholder="e.g. 640"
            value={data.quant_score}
            onChange={(e) => onChange("quant_score", e.target.value)}
            style={{ borderColor: errors.quant_score ? "var(--danger)" : undefined }}
          />
          {errors.quant_score ? (
            <span style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.25rem", display: "block" }}>
              {errors.quant_score}
            </span>
          ) : (
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
              Scale: 200 – 900 points
            </span>
          )}
        </div>

        {/* Computer Programming Score (Optional) */}
        <div>
          <label htmlFor="computer_programming_score">
            Computer Programming Score <span style={{ color: "var(--text-muted)" }}>(Optional)</span>
          </label>
          <input
            id="computer_programming_score"
            type="number"
            min="200"
            max="900"
            step="5"
            placeholder="e.g. 580 or leave empty"
            value={data.computer_programming_score}
            onChange={(e) => onChange("computer_programming_score", e.target.value)}
            style={{ borderColor: errors.computer_programming_score ? "var(--danger)" : undefined }}
          />
          {errors.computer_programming_score ? (
            <span style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.25rem", display: "block" }}>
              {errors.computer_programming_score}
            </span>
          ) : (
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
              AMCAT domain module (200 – 900, if attempted)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
