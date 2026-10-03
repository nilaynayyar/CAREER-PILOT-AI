import React, { useState } from "react";
import { EntranceExamEntry, EntranceExamType, ExamStatus } from "@/types/careerpilot";
import { ContextBadge } from "../common/ContextBadge";

interface EntranceExamSectionProps {
  exams: EntranceExamEntry[];
  onExamsChange: (exams: EntranceExamEntry[]) => void;
}

const EXAM_OPTIONS: EntranceExamType[] = [
  "JEE Main",
  "JEE Advanced",
  "NEET UG",
  "CUET UG",
  "GATE",
  "CAT",
  "CLAT",
  "NIFT",
  "NID DAT",
  "UCEED",
  "NDA",
  "Other",
  "None",
];

const STATUS_OPTIONS: ExamStatus[] = [
  "Preparing",
  "Appeared",
  "Qualified",
  "Not qualified",
  "Not applicable",
];

export const EntranceExamSection: React.FC<EntranceExamSectionProps> = ({
  exams,
  onExamsChange,
}) => {
  const [selectedExamToAdd, setSelectedExamToAdd] = useState<EntranceExamType>("JEE Main");

  const handleAddExam = () => {
    if (selectedExamToAdd === "None") {
      // Clear all and set a single None entry
      const noneEntry: EntranceExamEntry = {
        id: "none-" + Date.now(),
        exam: "None",
        status: "Not applicable",
      };
      onExamsChange([noneEntry]);
      return;
    }

    // Filter out None if adding an actual exam
    const existing = exams.filter((e) => e.exam !== "None");
    if (existing.some((e) => e.exam === selectedExamToAdd && e.exam !== "Other")) {
      return; // already added
    }

    const newEntry: EntranceExamEntry = {
      id: "exam-" + Date.now(),
      exam: selectedExamToAdd,
      status: "Appeared",
      year: new Date().getFullYear().toString(),
      percentile: "",
      score: "",
      rank: "",
      userDefinedMetric: "",
    };

    onExamsChange([...existing, newEntry]);
  };

  const handleRemoveExam = (id: string) => {
    onExamsChange(exams.filter((e) => e.id !== id));
  };

  const handleUpdateExam = (id: string, updates: Partial<EntranceExamEntry>) => {
    onExamsChange(
      exams.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            D. National Entrance Exams
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Add national entrance examinations (JEE, NEET, GATE, CAT, etc.) to contextualize your academic trajectory.
          </p>
        </div>
        <ContextBadge label="Used as career context — not an ML prediction feature" />
      </div>

      {/* Notice of Scientific Separation */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          backgroundColor: "rgba(6, 182, 212, 0.06)",
          border: "1px dashed rgba(6, 182, 212, 0.35)",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          marginBottom: "1.25rem",
          lineHeight: "1.45",
        }}
      >
        <strong style={{ color: "var(--accent-cyan)" }}>Career Context Distinction: </strong>
        The historical AMEO 2015 ML model does not contain entrance exam features. Entrance exam credentials provide qualitative educational pathway context for agentic career exploration, skill-gap analysis, and project roadmaps — they are <em>never</em> fed into the statistical salary tier model.
      </div>

      {/* Add Exam Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.25rem",
          padding: "0.85rem",
          borderRadius: "8px",
          backgroundColor: "var(--bg-tertiary)",
        }}
      >
        <div style={{ flex: "1 1 200px" }}>
          <label style={{ fontSize: "0.78rem", marginBottom: "0.25rem" }}>Select Examination</label>
          <select
            value={selectedExamToAdd}
            onChange={(e) => setSelectedExamToAdd(e.target.value as EntranceExamType)}
          >
            {EXAM_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt} {opt === "None" ? "(None / Not Applicable)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div style={{ alignSelf: "flex-end" }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleAddExam}
            style={{ height: "38px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Examination
          </button>
        </div>
      </div>

      {/* Empty List State */}
      {exams.length === 0 && (
        <div
          style={{
            padding: "1.5rem",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            border: "1px dashed var(--border-medium)",
            borderRadius: "8px",
          }}
        >
          No entrance exams added yet. Select an examination above, or select "None / Not Applicable".
        </div>
      )}

      {/* Selected Exams List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {exams.map((entry) => {
          const isNone = entry.exam === "None";

          if (isNone) {
            return (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1rem",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>
                    None / Not Applicable
                  </span>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    No national entrance examinations recorded.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleRemoveExam(entry.id)}
                >
                  Remove
                </button>
              </div>
            );
          }

          return (
            <div
              key={entry.id}
              style={{
                padding: "1.25rem",
                borderRadius: "10px",
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-medium)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "6px",
                      backgroundColor: "var(--accent-teal-subtle)",
                      color: "var(--accent-teal-light)",
                      border: "1px solid rgba(13, 148, 136, 0.3)",
                    }}
                  >
                    {entry.exam}
                  </span>
                  {entry.exam === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter exam name..."
                      value={entry.customExamName || ""}
                      onChange={(e) => handleUpdateExam(entry.id, { customExamName: e.target.value })}
                      style={{ width: "180px", padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                    />
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleRemoveExam(entry.id)}
                >
                  Remove
                </button>
              </div>

              {/* Dynamic Metric Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                {/* Status */}
                <div>
                  <label style={{ fontSize: "0.78rem" }}>Exam Status</label>
                  <select
                    value={entry.status}
                    onChange={(e) => handleUpdateExam(entry.id, { status: e.target.value as ExamStatus })}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label style={{ fontSize: "0.78rem" }}>Year</label>
                  <input
                    type="number"
                    min="2010"
                    max="2030"
                    placeholder="e.g. 2024"
                    value={entry.year || ""}
                    onChange={(e) => handleUpdateExam(entry.id, { year: e.target.value })}
                  />
                </div>

                {/* Dynamic Terminology Fields */}
                {/* JEE: Percentile / Rank */}
                {(entry.exam === "JEE Main" || entry.exam === "JEE Advanced") && (
                  <>
                    <div>
                      <label style={{ fontSize: "0.78rem" }}>Percentile</label>
                      <input
                        type="text"
                        placeholder="e.g. 96.8 %ile"
                        value={entry.percentile || ""}
                        onChange={(e) => handleUpdateExam(entry.id, { percentile: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem" }}>All India Rank (AIR)</label>
                      <input
                        type="text"
                        placeholder="e.g. 28400"
                        value={entry.rank || ""}
                        onChange={(e) => handleUpdateExam(entry.id, { rank: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* NEET: Score / Percentile / Rank */}
                {entry.exam === "NEET UG" && (
                  <>
                    <div>
                      <label style={{ fontSize: "0.78rem" }}>Score (out of 720)</label>
                      <input
                        type="text"
                        placeholder="e.g. 580"
                        value={entry.score || ""}
                        onChange={(e) => handleUpdateExam(entry.id, { score: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem" }}>Percentile</label>
                      <input
                        type="text"
                        placeholder="e.g. 97.2"
                        value={entry.percentile || ""}
                        onChange={(e) => handleUpdateExam(entry.id, { percentile: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem" }}>All India Rank</label>
                      <input
                        type="text"
                        placeholder="e.g. 15200"
                        value={entry.rank || ""}
                        onChange={(e) => handleUpdateExam(entry.id, { rank: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* CUET: Score / Percentile */}
                {entry.exam === "CUET UG" && (
                  <>
                    <div>
                      <label style={{ fontSize: "0.78rem" }}>Normalized Score</label>
                      <input
                        type="text"
                        placeholder="e.g. 720/800"
                        value={entry.score || ""}
                        onChange={(e) => handleUpdateExam(entry.id, { score: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem" }}>Percentile</label>
                      <input
                        type="text"
                        placeholder="e.g. 98.4"
                        value={entry.percentile || ""}
                        onChange={(e) => handleUpdateExam(entry.id, { percentile: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* GATE / CLAT: Score / Rank */}
                {(entry.exam === "GATE" || entry.exam === "CLAT") && (
                  <>
                    <div>
                      <label style={{ fontSize: "0.78rem" }}>Score</label>
                      <input
                        type="text"
                        placeholder="e.g. 650"
                        value={entry.score || ""}
                        onChange={(e) => handleUpdateExam(entry.id, { score: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem" }}>All India Rank</label>
                      <input
                        type="text"
                        placeholder="e.g. 1420"
                        value={entry.rank || ""}
                        onChange={(e) => handleUpdateExam(entry.id, { rank: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* CAT: Percentile */}
                {entry.exam === "CAT" && (
                  <div>
                    <label style={{ fontSize: "0.78rem" }}>Overall Percentile</label>
                    <input
                      type="text"
                      placeholder="e.g. 94.6 %ile"
                      value={entry.percentile || ""}
                      onChange={(e) => handleUpdateExam(entry.id, { percentile: e.target.value })}
                    />
                  </div>
                )}

                {/* NIFT / NID DAT / UCEED / NDA / Other */}
                {(entry.exam === "NIFT" ||
                  entry.exam === "NID DAT" ||
                  entry.exam === "UCEED" ||
                  entry.exam === "NDA" ||
                  entry.exam === "Other") && (
                  <>
                    <div>
                      <label style={{ fontSize: "0.78rem" }}>Score / Result</label>
                      <input
                        type="text"
                        placeholder="e.g. Qualified / Score"
                        value={entry.score || ""}
                        onChange={(e) => handleUpdateExam(entry.id, { score: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem" }}>Rank / Merit Position</label>
                      <input
                        type="text"
                        placeholder="e.g. Rank or Category Rank"
                        value={entry.rank || ""}
                        onChange={(e) => handleUpdateExam(entry.id, { rank: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
