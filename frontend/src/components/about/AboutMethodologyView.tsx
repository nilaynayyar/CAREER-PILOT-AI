import React from "react";

export const AboutMethodologyView: React.FC = () => {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Title */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          About & Methodology
        </h2>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
          Complete documentation of CareerPilot AI&apos;s architectural boundaries, dataset provenance, mathematical validation, and scientific integrity.
        </p>
      </div>

      {/* Core Principles */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
          Core Scientific Principles
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          <div style={{ padding: "1rem", borderRadius: "8px", backgroundColor: "var(--bg-tertiary)" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-teal-light)", marginBottom: "0.35rem" }}>
              1. Statistical Honesty
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              The supervised machine learning model predicts an employment-related salary tier based strictly on historical correlations in the AMEO 2015 cohort. It never claims to evaluate student capability, potential, or destiny.
            </p>
          </div>

          <div style={{ padding: "1rem", borderRadius: "8px", backgroundColor: "var(--bg-tertiary)" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-cyan)", marginBottom: "0.35rem" }}>
              2. Architectural Separation
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              The machine learning tier prediction is entirely separate from LLM agentic guidance. Agents interpret results and diagnose gaps; they can never override, reclassify, or manipulate the ML prediction.
            </p>
          </div>

          <div style={{ padding: "1rem", borderRadius: "8px", backgroundColor: "var(--bg-tertiary)" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--warning)", marginBottom: "0.35rem" }}>
              3. No Spurious Features
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              New context inputs such as National Entrance Exams (JEE, NEET, GATE) and career domain preferences are treated strictly as qualitative career context. They are never artificially injected into the AMEO model.
            </p>
          </div>

          <div style={{ padding: "1rem", borderRadius: "8px", backgroundColor: "var(--bg-tertiary)" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--success)", marginBottom: "0.35rem" }}>
              4. Zero Commercial Hallucination
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              All occupational competencies, technology skills, and knowledge domains are derived from the official U.S. Department of Labor O*NET 28.0 standard, eliminating fabricated industry requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset & Licensing */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
          Datasets & Provenance
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
          <div style={{ padding: "1rem", borderRadius: "8px", backgroundColor: "var(--bg-tertiary)" }}>
            <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>
              Aspiring Minds Employment Outcome 2015 (AMEO)
            </strong>
            <div>
              A study tracking 3,998 engineering graduates across India, measuring cognitive skills (AMCAT English, Logical, Quantitative), domain expertise (Computer Programming, Electronics), personality traits (Big Five), and initial employment outcomes.
            </div>
            <div style={{ marginTop: "0.5rem", fontSize: "0.78rem" }}>
              Zenodo Record:{" "}
              <a
                href="https://doi.org/10.5281/zenodo.45735"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent-cyan)", textDecoration: "underline" }}
              >
                DOI: 10.5281/zenodo.45735
              </a>{" "}
              · License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0).
            </div>
          </div>

          <div style={{ padding: "1rem", borderRadius: "8px", backgroundColor: "var(--bg-tertiary)" }}>
            <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>
              Occupational Information Network (O*NET 28.0)
            </strong>
            <div>
              Developed under the sponsorship of the U.S. Department of Labor / Employment and Training Administration (USDOL/ETA). Provides comprehensive standardized taxonomies for engineering occupations, requisite work activities, and tools & technologies.
            </div>
            <div style={{ marginTop: "0.5rem", fontSize: "0.78rem" }}>
              License: Creative Commons Attribution 4.0 International (CC BY 4.0).
            </div>
          </div>
        </div>
      </div>

      {/* Offline Fallback Architecture */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          Offline Fallback & Resiliency
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
          CareerPilot AI does not depend strictly on external LLM availability. When Gemini API credentials are absent or network requests experience downtime, the advisory engine seamlessly activates deterministic O*NET algorithmic matching, delivering validated skill gap analyses, roadmaps, and projects with a transparent &quot;AI Guidance: Offline Fallback&quot; status indicator.
        </p>
      </div>
    </div>
  );
};
