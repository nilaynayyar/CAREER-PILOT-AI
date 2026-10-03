import React from "react";
import { FullCareerPilotReport, StudentProfile, EntranceExamEntry, CareerPreferences } from "@/types/careerpilot";
import { EmptyState } from "../common/EmptyState";
import { PageId } from "../layout/Sidebar";

interface FinalReportViewProps {
  report: FullCareerPilotReport | null;
  profile: StudentProfile | null;
  exams: EntranceExamEntry[];
  preferences: CareerPreferences;
  onNavigate: (page: PageId) => void;
}

export const FinalReportView: React.FC<FinalReportViewProps> = ({
  report,
  profile,
  exams,
  preferences,
  onNavigate,
}) => {
  if (!report || !profile) {
    return (
      <EmptyState
        title="Career Intelligence Report Not Available"
        description="Please complete your student profile and execute the analysis pipeline to synthesize your comprehensive multi-layer Career Intelligence Report."
        actionText="Run Assessment Pipeline"
        onAction={() => onNavigate("assessment")}
      />
    );
  }

  const { ml_section, ai_guidance_section, onet_attribution, report_disclaimer } = report;
  const { prediction, explanation } = ml_section;
  const { career_analysis, selected_occupation, skill_gap, roadmap, projects } = ai_guidance_section;

  const handlePrint = () => {
    window.print();
  };

  // Derive customized next steps from actual results
  const primaryOccupation = selected_occupation?.title || "Engineering Target";
  const topGap = skill_gap.skill_gaps.length > 0 ? skill_gap.skill_gaps[0].skill_name : "Technical Core";
  const phase1 = roadmap.phases.length > 0 ? roadmap.phases[0] : null;
  const firstProject = projects.projects.length > 0 ? projects.projects[0] : null;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Report Header / Action Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid var(--border-medium)",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
              backgroundColor: "var(--accent-teal-subtle)",
              color: "var(--accent-teal-light)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Synthesized Intelligence Output
          </span>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.025em", marginTop: "0.35rem" }}>
            Career Intelligence Report
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Generated for {profile.specialization} ({profile.degree}) • Date: {new Date().toLocaleDateString()}
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handlePrint}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print / Save PDF
        </button>
      </div>

      {/* Layer Notice */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderRadius: "10px",
          backgroundColor: "rgba(13, 148, 136, 0.08)",
          border: "1px solid rgba(13, 148, 136, 0.3)",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          marginBottom: "2rem",
          lineHeight: 1.55,
        }}
      >
        <strong style={{ color: "var(--accent-teal-light)" }}>Multi-Layer System Transparency: </strong>
        This report presents distinct layers of intelligence: (1) Supervised Statistical Machine Learning on historical data, (2) O*NET Occupational Knowledge, (3) Agentic AI Skill and Curriculum Synthesis, and (4) Contextual Entrance Examination details. These layers are intentionally decoupled to preserve scientific integrity.
      </div>

      {/* SECTION 1: PROFILE & ENTRANCE EXAM SUMMARY */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
          1. Student Profile & Educational Pathway
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ padding: "0.75rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Academic Record</span>
            <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
              10th: {profile.percentage_10th}% · 12th: {profile.percentage_12th}%
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginTop: "0.15rem" }}>
              College GPA: {profile.college_gpa}% (Tier {profile.college_tier})
            </span>
          </div>

          <div style={{ padding: "0.75rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Aptitude Scores (AMCAT)</span>
            <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
              Eng: {profile.english_score} · Log: {profile.logical_score}
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginTop: "0.15rem" }}>
              Quant: {profile.quant_score} {profile.computer_programming_score ? `· Prog: ${profile.computer_programming_score}` : ""}
            </span>
          </div>

          <div style={{ padding: "0.75rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Degree & Specialization</span>
            <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
              {profile.degree}
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--accent-teal-light)", display: "block", marginTop: "0.15rem" }}>
              {profile.specialization}
            </span>
          </div>
        </div>

        {/* Entrance Exams */}
        {exams.length > 0 && (
          <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                National Entrance Examination Context:
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--accent-cyan)", fontStyle: "italic" }}>
                (Career Context only — not fed into ML model)
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {exams.map((ex) => (
                <div
                  key={ex.id}
                  style={{
                    padding: "0.4rem 0.75rem",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border-medium)",
                    fontSize: "0.8rem",
                  }}
                >
                  <strong>{ex.exam}</strong> {ex.status ? `· ${ex.status}` : ""} {ex.percentile ? `· ${ex.percentile}` : ""} {ex.rank ? `· Rank: ${ex.rank}` : ""} {ex.score ? `· Score: ${ex.score}` : ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: STATISTICAL ML OUTCOME */}
      <div className="card" style={{ marginBottom: "2rem", borderLeft: "4px solid var(--accent-teal)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-teal-light)", textTransform: "uppercase" }}>
              Layer 1: Supervised ML Model
            </span>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              2. ML Employment Salary Tier Prediction
            </h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>AMEO 2015 Logistic Regression</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ padding: "1rem 1.5rem", borderRadius: "10px", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Predicted Salary Tier</span>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-teal-light)" }}>
              {prediction.salary_tier} Tier
            </span>
          </div>

          {prediction.probabilities && (
            <div style={{ flex: 1, minWidth: "260px" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Class Probabilities:
              </span>
              <div style={{ display: "flex", gap: "1rem" }}>
                {(["Low", "Mid", "High"] as const).map((tier) => (
                  <div key={tier} style={{ flex: 1, padding: "0.5rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "6px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{tier}</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: tier === prediction.salary_tier ? "var(--accent-teal-light)" : "var(--text-primary)" }}>
                      {((prediction.probabilities[tier] || 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {explanation && explanation.top_features && (
          <div>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
              Top Mathematical Feature Associations:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {explanation.top_features.slice(0, 5).map((feat, fIdx) => (
                <span
                  key={fIdx}
                  style={{
                    fontSize: "0.78rem",
                    padding: "0.3rem 0.6rem",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                >
                  #{fIdx + 1} {feat.display_name || feat.feature} ({feat.importance_mean.toFixed(3)})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: OCCUPATIONAL INTELLIGENCE */}
      <div className="card" style={{ marginBottom: "2rem", borderLeft: "4px solid var(--accent-cyan)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
              Layer 2 & 3: Occupational Intelligence & Agentic Guidance
            </span>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              3. Occupational Alignment: {primaryOccupation}
            </h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            SOC {selected_occupation?.soc_code || "15-xxxx"}
          </span>
        </div>

        {selected_occupation && (
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "1.25rem" }}>
            {selected_occupation.description}
          </p>
        )}

        {/* Skill Gap Synthesis */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ padding: "1rem", borderRadius: "8px", backgroundColor: "var(--bg-tertiary)" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--success)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
              Verified Profile Strengths ({skill_gap.current_strengths.length})
            </h4>
            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.825rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
              {skill_gap.current_strengths.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </div>

          <div style={{ padding: "1rem", borderRadius: "8px", backgroundColor: "var(--bg-tertiary)" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--warning)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
              Priority Skill Gaps ({skill_gap.skill_gaps.length})
            </h4>
            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.825rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
              {skill_gap.skill_gaps.slice(0, 4).map((gap, idx) => (
                <li key={idx}>
                  <strong>{gap.skill_name}:</strong> {gap.gap_description}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Roadmap Phases Brief */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
            Learning Roadmap Summary ({roadmap.total_estimated_duration || "Structured"})
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
            {roadmap.phases.map((ph, idx) => (
              <div key={idx} style={{ padding: "0.75rem", borderRadius: "6px", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--accent-teal-light)", fontWeight: 700 }}>
                  PHASE {ph.phase_number || idx + 1}
                </span>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.15rem" }}>
                  {ph.phase_name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  Milestone: {ph.milestone}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Projects Brief */}
        <div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
            Portfolio Project Recommendations ({projects.projects.length})
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.75rem" }}>
            {projects.projects.map((proj, idx) => (
              <div key={idx} style={{ padding: "0.75rem", borderRadius: "6px", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {proj.title}
                  </span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--accent-cyan)" }}>
                    {proj.difficulty}
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                  {proj.objective}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: YOUR NEXT STEPS (ACTIONABLE SYNTHESIS) */}
      <div
        className="card"
        style={{
          marginBottom: "2rem",
          background: "linear-gradient(135deg, rgba(13, 148, 136, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)",
          border: "1px solid var(--accent-teal)",
          padding: "2rem",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 800,
            color: "var(--accent-teal-light)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            display: "block",
            marginBottom: "0.35rem",
          }}
        >
          Actionable Career Plan
        </span>
        <h3 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.25rem" }}>
          YOUR NEXT STEPS
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
            <span style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "var(--accent-teal)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>
              1
            </span>
            <div>
              <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)", display: "block" }}>
                Deep-dive into {primaryOccupation}
              </strong>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Review the {selected_occupation?.skills.length || 6} core O*NET skills and {selected_occupation?.tech_skills.length || 6} technology requirements in the Career Detail module to align your daily learning with industry benchmarks.
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
            <span style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "var(--accent-teal)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>
              2
            </span>
            <div>
              <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)", display: "block" }}>
                Strengthen Priority Competency: {topGap}
              </strong>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Focus your technical study on {topGap}. Follow the progressive topics and practical exercises outlined in your Skill Gap action plan.
              </span>
            </div>
          </div>

          {phase1 && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
              <span style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "var(--accent-teal)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>
                3
              </span>
              <div>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)", display: "block" }}>
                  Commence Phase 1: {phase1.phase_name}
                </strong>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Work towards Phase 1 milestone (&quot;{phase1.milestone}&quot;) over the next {phase1.duration_estimate || "3-4 weeks"}. Produce a public GitHub repository as verifiable progress evidence.
                </span>
              </div>
            </div>
          )}

          {firstProject && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
              <span style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "var(--accent-teal)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>
                4
              </span>
              <div>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)", display: "block" }}>
                  Build Portfolio Project: {firstProject.title}
                </strong>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Implement {firstProject.title} using {firstProject.suggested_technologies.slice(0, 3).join(", ")}. Ensure you deliver clean source code, automated unit tests, and thorough README documentation.
                </span>
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
            <span style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "var(--accent-teal)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>
              5
            </span>
            <div>
              <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)", display: "block" }}>
                Reassess Profile After Gaining New Competencies
              </strong>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                As you complete projects, update your technical credentials in CareerPilot AI to recalculate your skill gap alignment and advance your learning roadmap.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: FORMAL ATTRIBUTIONS & LEGAL NOTICES */}
      <div
        style={{
          padding: "1.25rem",
          borderRadius: "10px",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          lineHeight: 1.55,
        }}
      >
        <div style={{ marginBottom: "0.5rem" }}>
          <strong>Legal & Scientific Disclaimer: </strong>
          {report_disclaimer}
        </div>
        <div>
          <strong>Attribution: </strong>
          {onet_attribution} | AMEO 2015 dataset published under CC BY-NC-SA 4.0 (Zenodo DOI: 10.5281/zenodo.45735).
        </div>
      </div>
    </div>
  );
};
