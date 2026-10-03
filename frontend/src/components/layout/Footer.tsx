import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-subtle)",
        padding: "2rem 1.75rem",
        fontSize: "0.825rem",
        color: "var(--text-muted)",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.25rem",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            CareerPilot AI — Transparent Career Intelligence
          </div>
          <div>
            Statistical salary tier estimation trained on AMEO 2015 (Zenodo DOI:{" "}
            <a
              href="https://doi.org/10.5281/zenodo.45735"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent-cyan)", textDecoration: "underline" }}
            >
              10.5281/zenodo.45735
            </a>
            , License: CC BY-NC-SA 4.0).
          </div>
          <div style={{ marginTop: "0.2rem" }}>
            Occupational taxonomy derived from O*NET 28.0 Database (U.S. Dept of Labor / USDOL, CC BY 4.0).
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
            Scientific Integrity Notice
          </div>
          <div style={{ maxWidth: "460px", marginTop: "0.2rem", fontSize: "0.75rem" }}>
            The ML model predicts an employment-related salary tier based on historical patterns. It does not determine career suitability or guarantee future employment.
          </div>
        </div>
      </div>
    </footer>
  );
};
