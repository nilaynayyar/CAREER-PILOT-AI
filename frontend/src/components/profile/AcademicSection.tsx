import React from "react";
import { ContextBadge } from "../common/ContextBadge";

export interface AcademicData {
  percentage_10th: string;
  percentage_12th: string;
  college_gpa: string;
  college_tier: string;
  degree: string;
  specialization: string;
}

interface AcademicSectionProps {
  data: AcademicData;
  onChange: (field: keyof AcademicData, value: string) => void;
  errors: Record<string, string>;
}

export const SPECIALIZATION_OPTIONS = [
  { value: "", label: "Select your specialization..." },
  { value: "Computer Science & Engineering", label: "Computer Science & Engineering" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "Electronics and Communication Engineering", label: "Electronics & Communication Engineering" },
  { value: "Computer Engineering", label: "Computer Engineering" },
  { value: "Mechanical Engineering", label: "Mechanical Engineering" },
  { value: "Electrical Engineering", label: "Electrical Engineering" },
  { value: "Civil Engineering", label: "Civil Engineering" },
  { value: "Chemical Engineering", label: "Chemical Engineering" },
  { value: "Instrumentation Engineering", label: "Instrumentation Engineering" },
  { value: "Mechatronics", label: "Mechatronics" },
  { value: "Aeronautical Engineering", label: "Aeronautical Engineering" },
  { value: "Other Engineering", label: "Other Engineering" },
];

export const DEGREE_OPTIONS = [
  { value: "", label: "Select your degree..." },
  { value: "B.Tech/B.E.", label: "B.Tech / B.E. (Bachelor of Technology / Engineering)" },
  { value: "M.Tech./M.E.", label: "M.Tech / M.E. (Master of Technology / Engineering)" },
  { value: "MCA", label: "MCA (Master of Computer Applications)" },
  { value: "B.Sc.", label: "B.Sc. (Bachelor of Science)" },
  { value: "M.Sc.", label: "M.Sc. (Master of Science)" },
  { value: "Other", label: "Other Degree" },
];


export const AcademicSection: React.FC<AcademicSectionProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            A. Academic Profile
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Historical academic metrics matching the AMEO 2015 educational features.
          </p>
        </div>
        <ContextBadge variant="ml" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
        {/* 10th Grade Percentage */}
        <div>
          <label htmlFor="percentage_10th">
            10th Grade Percentage (%) <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            id="percentage_10th"
            type="number"
            min="40"
            max="100"
            step="0.1"
            placeholder="e.g. 84.5"
            value={data.percentage_10th}
            onChange={(e) => onChange("percentage_10th", e.target.value)}
            style={{ borderColor: errors.percentage_10th ? "var(--danger)" : undefined }}
          />
          {errors.percentage_10th ? (
            <span style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.25rem", display: "block" }}>
              {errors.percentage_10th}
            </span>
          ) : (
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
              Valid range: 40% – 100%
            </span>
          )}
        </div>

        {/* 12th Grade Percentage */}
        <div>
          <label htmlFor="percentage_12th">
            12th Grade Percentage (%) <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            id="percentage_12th"
            type="number"
            min="40"
            max="100"
            step="0.1"
            placeholder="e.g. 82.0"
            value={data.percentage_12th}
            onChange={(e) => onChange("percentage_12th", e.target.value)}
            style={{ borderColor: errors.percentage_12th ? "var(--danger)" : undefined }}
          />
          {errors.percentage_12th ? (
            <span style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.25rem", display: "block" }}>
              {errors.percentage_12th}
            </span>
          ) : (
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
              Valid range: 40% – 100%
            </span>
          )}
        </div>

        {/* College GPA / Percentage */}
        <div>
          <label htmlFor="college_gpa">
            Graduation / College GPA or % <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            id="college_gpa"
            type="number"
            min="40"
            max="100"
            step="0.1"
            placeholder="e.g. 78.4 (or 10-point scale: 7.84)"
            value={data.college_gpa}
            onChange={(e) => onChange("college_gpa", e.target.value)}
            style={{ borderColor: errors.college_gpa ? "var(--danger)" : undefined }}
          />
          {errors.college_gpa ? (
            <span style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.25rem", display: "block" }}>
              {errors.college_gpa}
            </span>
          ) : (
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
              Percentage (40-100) or 10-point scale (will normalize)
            </span>
          )}
        </div>

        {/* College Tier */}
        <div>
          <label htmlFor="college_tier">
            College Tier <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <select
            id="college_tier"
            value={data.college_tier}
            onChange={(e) => onChange("college_tier", e.target.value)}
            style={{ borderColor: errors.college_tier ? "var(--danger)" : undefined }}
          >
            <option value="">Select college tier...</option>
            <option value="1">Tier 1 (IIT, NIT, BITS, Top National Universities)</option>
            <option value="2">Tier 2 (State Universities, Affiliated Engineering Colleges)</option>
          </select>
          {errors.college_tier && (
            <span style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.25rem", display: "block" }}>
              {errors.college_tier}
            </span>
          )}
        </div>

        {/* Degree */}
        <div>
          <label htmlFor="degree">
            Degree Program <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <select
            id="degree"
            value={data.degree}
            onChange={(e) => onChange("degree", e.target.value)}
            style={{ borderColor: errors.degree ? "var(--danger)" : undefined }}
          >
            {DEGREE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.degree && (
            <span style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.25rem", display: "block" }}>
              {errors.degree}
            </span>
          )}
        </div>

        {/* Specialization */}
        <div>
          <label htmlFor="specialization">
            Specialization / Discipline <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <select
            id="specialization"
            value={data.specialization}
            onChange={(e) => onChange("specialization", e.target.value)}
            style={{ borderColor: errors.specialization ? "var(--danger)" : undefined }}
          >
            {SPECIALIZATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.specialization && (
            <span style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.25rem", display: "block" }}>
              {errors.specialization}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
