import React from "react";

export const ModelExplanationView: React.FC = () => {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Title */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Model Explanation & Scientific Methodology
        </h2>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
          Formal documentation of dataset provenance, preprocessing, machine learning algorithms, and architectural boundaries.
        </p>
      </div>

      {/* Key Specifications Table */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
          Supervised ML Specifications
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "0.85rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Training Dataset</span>
            <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>AMEO 2015</strong>
            <span style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", display: "block", marginTop: "0.15rem" }}>
              N = 3,998 engineering graduates
            </span>
          </div>

          <div style={{ padding: "0.85rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Target Variable</span>
            <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>Salary Tier</strong>
            <span style={{ fontSize: "0.75rem", color: "var(--accent-teal-light)", display: "block", marginTop: "0.15rem" }}>
              Low / Mid / High (Ternary)
            </span>
          </div>

          <div style={{ padding: "0.85rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Production Model</span>
            <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>Logistic Regression</strong>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginTop: "0.15rem" }}>
              Serialized pipeline (`final_model.joblib`)
            </span>
          </div>

          <div style={{ padding: "0.85rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Zenodo Record</span>
            <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>DOI 10.5281/zenodo.45735</strong>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginTop: "0.15rem" }}>
              License: CC BY-NC-SA 4.0
            </span>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          Mathematical Pipeline Flow
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          How an individual student profile moves deterministically from raw inputs to predicted class probabilities.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            {
              step: "1. Student Profile Input",
              desc: "15 AMEO-specific features: 10th/12th percentages, College GPA & Tier, 4 AMCAT Aptitude scores, 5 Personality traits, Degree, and Specialization.",
              type: "Raw Input",
            },
            {
              step: "2. ColumnTransformer Preprocessing",
              desc: "Numerical features scaled via StandardScaler; categorical degrees and engineering disciplines encoded via OneHotEncoder(handle_unknown='ignore').",
              type: "Feature Engineering",
            },
            {
              step: "3. Multinomial Logistic Regression",
              desc: "Linear decision boundaries fitted using cross-entropy loss over historical salary tier partitions (≤ ₹2.10 LPA, ₹2.10–₹3.35 LPA, > ₹3.35 LPA).",
              type: "Statistical Core",
            },

            {
              step: "4. Predicted Class Probability Distribution",
              desc: "Outputs normalized probability distribution across Low, Mid, and High salary classes, with argmax determining the predicted tier.",
              type: "Output Layer",
            },
            {
              step: "5. Permutation Feature Importance",
              desc: "Post-hoc sensitivity analysis quantifying feature importance via test-set permutation, showing which dimensions shifted predictions most.",
              type: "Interpretability",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                padding: "1rem",
                borderRadius: "10px",
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: "var(--accent-teal-subtle)",
                  color: "var(--accent-teal-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {item.step}
                  </h4>
                  <span style={{ fontSize: "0.72rem", color: "var(--accent-cyan)", fontWeight: 600 }}>
                    {item.type}
                  </span>
                </div>
                <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architectural Separation: ML vs Agentic AI */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          Architectural Separation: Statistical ML vs. Agentic Guidance
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
          CareerPilot AI enforces an architectural boundary ensuring statistical rigor and preventing hallucinated career suitability claims.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          <div
            style={{
              padding: "1.25rem",
              borderRadius: "10px",
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid rgba(13, 148, 136, 0.35)",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-teal-light)", textTransform: "uppercase" }}>
              Layer 1: Supervised ML
            </div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.35rem", marginBottom: "0.5rem" }}>
              Statistical Salary Tier Prediction
            </h4>
            <ul style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.55, paddingLeft: "1.2rem" }}>
              <li>Owns mathematical salary tier classification.</li>
              <li>Input strictly limited to validated AMEO 2015 variables.</li>
              <li>Cannot be modified or overridden by LLM or agent output.</li>
              <li>Does <strong>not</strong> select or recommend careers.</li>
            </ul>
          </div>

          <div
            style={{
              padding: "1.25rem",
              borderRadius: "10px",
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid rgba(6, 182, 212, 0.35)",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
              Layer 2: Agentic Guidance & O*NET
            </div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.35rem", marginBottom: "0.5rem" }}>
              Occupational Exploration & Skill Gap
            </h4>
            <ul style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.55, paddingLeft: "1.2rem" }}>
              <li>Grounds recommendations in official USDOL O*NET 28.0 taxonomy.</li>
              <li>Synthesizes student entrance exams and preferences as career context.</li>
              <li>Produces skill gap diagnostics, phased roadmaps, and projects.</li>
              <li>Never claims the ML model approved or ranked career choices.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dataset Attribution & Citations */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
          Formal Citations & Licensing
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          <div>
            <strong style={{ color: "var(--text-primary)" }}>AMEO 2015: </strong>
            Aspiring Minds Employment Outcome 2015 Dataset. Published on Zenodo:{" "}
            <a
              href="https://doi.org/10.5281/zenodo.45735"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent-cyan)", textDecoration: "underline" }}
            >
              DOI 10.5281/zenodo.45735
            </a>
            . Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0).
          </div>

          <div>
            <strong style={{ color: "var(--text-primary)" }}>O*NET 28.0: </strong>
            Occupational Information Network (O*NET) Database. Sponsored by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under Creative Commons Attribution 4.0 (CC BY 4.0).
          </div>
        </div>
      </div>
    </div>
  );
};
