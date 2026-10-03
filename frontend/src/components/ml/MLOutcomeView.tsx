import React from "react";
import { MLPrediction, FeatureExplanation } from "@/types/careerpilot";
import { EmptyState } from "../common/EmptyState";
import { PageId } from "../layout/Sidebar";

interface MLOutcomeViewProps {
  prediction: MLPrediction | null;
  explanation: FeatureExplanation | null;
  onNavigate: (page: PageId) => void;
}

export const MLOutcomeView: React.FC<MLOutcomeViewProps> = ({
  prediction,
  explanation,
  onNavigate,
}) => {
  if (!prediction) {
    return (
      <EmptyState
        title="ML Outcome Not Available Yet"
        description="Complete your student profile and execute the assessment pipeline to generate the supervised ML salary tier prediction."
        actionText="Complete Profile"
        onAction={() => onNavigate("profile")}
      />
    );
  }

  const { salary_tier, probabilities, model_name, disclaimer } = prediction;

  const tierColors = {
    Low: { bg: "rgba(244, 63, 94, 0.12)", color: "var(--danger)", border: "rgba(244, 63, 94, 0.35)", range: "≤ ₹2.10 LPA (≤ ₹2,10,000/yr)" },
    Mid: { bg: "rgba(245, 158, 11, 0.12)", color: "var(--warning)", border: "rgba(245, 158, 11, 0.35)", range: "₹2.10 – ₹3.35 LPA (₹2,10,001 – ₹3,35,000/yr)" },
    High: { bg: "rgba(16, 185, 129, 0.12)", color: "var(--success)", border: "rgba(16, 185, 129, 0.35)", range: "> ₹3.35 LPA (> ₹3,35,000/yr)" },
  };

  const currentTierInfo = tierColors[salary_tier] || tierColors.Mid;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header Info */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          ML Employment Outcome
        </h2>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          Statistical prediction from the trained AMEO 2015 model ({model_name || "Logistic Regression"}).
        </p>
      </div>

      {/* Main Prediction Card */}
      <div
        className="card"
        style={{
          padding: "2rem",
          marginBottom: "1.75rem",
          background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-tertiary) 100%)",
          border: `1px solid ${currentTierInfo.border}`,
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Predicted Salary Tier
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.85rem", marginTop: "0.5rem" }}>
              <span style={{ fontSize: "2.5rem", fontWeight: 900, color: currentTierInfo.color, letterSpacing: "-0.03em" }}>
                {salary_tier} Tier
              </span>
              <span style={{ fontSize: "1.05rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                ({currentTierInfo.range})
              </span>
            </div>
          </div>

          <div
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "10px",
              backgroundColor: currentTierInfo.bg,
              border: `1px solid ${currentTierInfo.border}`,
              maxWidth: "340px",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: currentTierInfo.color, textTransform: "uppercase" }}>
              Supervised Statistical Model
            </div>
            <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.25rem", lineHeight: 1.4 }}>
              Learned from 3,998 Indian engineering graduates in the Aspiring Minds AMEO 2015 dataset.
            </div>
          </div>
        </div>

        {/* Probability Distribution */}
        {probabilities && (
          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
            <h4 style={{ fontSize: "0.925rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
              Predicted Class Probability Distribution
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {(["Low", "Mid", "High"] as const).map((tierKey) => {
                const prob = probabilities[tierKey] || 0;
                const pct = (prob * 100).toFixed(1);
                const isSelected = tierKey === salary_tier;
                const info = tierColors[tierKey];

                return (
                  <div key={tierKey}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: isSelected ? 700 : 500, color: isSelected ? info.color : "var(--text-primary)" }}>
                          {tierKey} Tier ({info.range})
                        </span>
                        {isSelected && (
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              padding: "0.1rem 0.4rem",
                              borderRadius: "4px",
                              backgroundColor: info.bg,
                              color: info.color,
                            }}
                          >
                            Selected Class
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                        {pct}%
                      </span>
                    </div>

                    <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-primary)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          backgroundColor: info.color,
                          borderRadius: "4px",
                          transition: "width 0.6s ease-out",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Critical Interpretation: What This Means vs What It Does NOT Mean */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        {/* What this means */}
        <div
          className="card"
          style={{
            backgroundColor: "var(--bg-card)",
            borderLeft: "4px solid var(--accent-teal)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
            <span style={{ color: "var(--accent-teal-light)", fontWeight: 800 }}>✓</span>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
              What This Prediction Means
            </h4>
          </div>
          <ul style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.6, paddingLeft: "1.2rem" }}>
            <li>
              This is the statistical salary-tier bracket predicted by the trained Logistic Regression model based on your entered academic scores, aptitude metrics, and degree specialization.
            </li>
            <li>
              It estimates how historical engineering graduates with comparable profile patterns were compensated in entry-level roles within the AMEO 2015 study.
            </li>
            <li>
              It provides a mathematical benchmark to help calibrate your skill-building priorities.
            </li>
          </ul>
        </div>

        {/* What this does NOT mean */}
        <div
          className="card"
          style={{
            backgroundColor: "var(--bg-card)",
            borderLeft: "4px solid var(--warning)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
            <span style={{ color: "var(--warning)", fontWeight: 800 }}>✕</span>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
              What This Does NOT Mean
            </h4>
          </div>
          <ul style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.6, paddingLeft: "1.2rem" }}>
            <li>
              It is <strong>not</strong> a prediction of your exact future salary, career ceiling, or employment certainty.
            </li>
            <li>
              It does <strong>not</strong> measure your individual creativity, technical grit, or learning velocity.
            </li>
            <li>
              It does <strong>not</strong> restrict or determine your ideal occupation. Specialized technical competence regularly breaks statistical historical boundaries.
            </li>
          </ul>
        </div>
      </div>

      {/* Feature Importance / Associations */}
      {explanation && explanation.top_features && explanation.top_features.length > 0 && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Model Feature Associations
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Features most associated with this model&apos;s prediction ({explanation.method || "Permutation Importance"}).
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {explanation.top_features.map((feat, idx) => {
              const impVal = Math.abs(feat.importance_mean || 0);
              const maxImp = Math.max(...explanation.top_features.map((f) => Math.abs(f.importance_mean || 0)), 0.05);
              const barWidth = Math.min(100, Math.round((impVal / maxImp) * 100));

              return (
                <div
                  key={feat.feature || idx}
                  style={{
                    padding: "0.85rem 1rem",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-teal-light)", width: "20px" }}>
                        #{idx + 1}
                      </span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {feat.display_name || feat.feature}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      Score: {feat.importance_mean.toFixed(4)}
                    </span>
                  </div>

                  <div style={{ width: "100%", height: "6px", backgroundColor: "var(--bg-primary)", borderRadius: "3px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: "100%",
                        backgroundColor: "var(--accent-teal)",
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "1rem", lineHeight: 1.5 }}>
            <em>Scientific Note:</em> Feature importance reflects mathematical sensitivity within the trained Logistic Regression model. It demonstrates which variables most heavily shift the decision boundary — it does not represent individual career capability or destiny.
          </p>
        </div>
      )}

      {/* Actionable Next Steps CTA Card */}
      <div
        className="card"
        style={{
          marginBottom: "2rem",
          padding: "1.75rem",
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-medium)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.25rem",
        }}
      >
        <div>
          <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Turn This Statistical Outcome Into Action
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem", maxWidth: "600px" }}>
            The statistical tier is merely a starting reference point. Explore verified O*NET occupations and diagnose your specific skill gaps to build a competitive engineering profile.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("career_exploration")}>
            Explore Careers
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate("skill_gap")}>
            View Skill Gaps
          </button>
        </div>
      </div>

      {/* Disclaimers & Attribution */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderRadius: "10px",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          lineHeight: 1.55,
        }}
      >
        <strong style={{ color: "var(--text-secondary)" }}>Scientific Integrity & Limitations: </strong>
        {disclaimer ||
          "This statistical prediction is generated by a Logistic Regression classifier trained on historical data from the Aspiring Minds Employment Outcome 2015 study. It estimates an employment-related salary tier under historical conditions. It does not predict career success, guarantee compensation, or dictate professional suitability."}
      </div>
    </div>
  );
};
