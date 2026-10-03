import React, { useState, useMemo } from "react";
import { OnetOccupation, FullCareerPilotReport } from "@/types/careerpilot";
import { PageId } from "../layout/Sidebar";

interface CareerExplorationViewProps {
  occupations: OnetOccupation[];
  report: FullCareerPilotReport | null;
  onSelectOccupation: (socCode: string) => void;
  onNavigate: (page: PageId) => void;
}

export const CareerExplorationView: React.FC<CareerExplorationViewProps> = ({
  occupations,
  report,
  onSelectOccupation,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = [
    { id: "all", label: "All Engineering Paths" },
    { id: "software", label: "Software & Web" },
    { id: "data_ai", label: "Data & AI" },
    { id: "systems", label: "Systems & Security" },
    { id: "hardware", label: "Hardware & Electronics" },
  ];

  const filteredOccupations = useMemo(() => {
    return occupations.filter((occ) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        occ.title.toLowerCase().includes(term) ||
        occ.soc_code.toLowerCase().includes(term) ||
        occ.description.toLowerCase().includes(term) ||
        occ.skills.some((s) => s.toLowerCase().includes(term)) ||
        occ.tech_skills.some((t) => t.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      if (categoryFilter === "software") {
        return occ.soc_code.startsWith("15-125") || occ.title.toLowerCase().includes("software");
      }
      if (categoryFilter === "data_ai") {
        return (
          occ.soc_code.includes("15-2051") ||
          occ.title.toLowerCase().includes("data") ||
          occ.title.toLowerCase().includes("intelligence")
        );
      }
      if (categoryFilter === "systems") {
        return (
          occ.soc_code.startsWith("15-121") ||
          occ.soc_code.startsWith("15-124") ||
          occ.title.toLowerCase().includes("security") ||
          occ.title.toLowerCase().includes("network")
        );
      }
      if (categoryFilter === "hardware") {
        return occ.soc_code.startsWith("17-") || occ.title.toLowerCase().includes("hardware");
      }

      return true;
    });
  }, [occupations, searchTerm, categoryFilter]);

  const suggestedSocCodes = useMemo(() => {
    if (!report?.ai_guidance_section?.career_analysis?.suggested_occupations) return new Set<string>();
    return new Set(
      report.ai_guidance_section.career_analysis.suggested_occupations.map((s) => s.soc_code)
    );
  }, [report]);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Explore Career Paths
        </h2>
        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
          Explore occupations using your profile and occupational knowledge. Grounded in the USDOL O*NET 28.0 taxonomy.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
        }}
      >
        <div style={{ flex: "1 1 320px", maxWidth: "480px" }}>
          <input
            type="text"
            placeholder="Search by title, SOC code, skills, or technology..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "0.65rem 1rem",
              borderRadius: "8px",
            }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              style={{
                padding: "0.45rem 0.85rem",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor: categoryFilter === cat.id ? "var(--accent-teal)" : "var(--bg-card)",
                color: categoryFilter === cat.id ? "#ffffff" : "var(--text-secondary)",
                border: categoryFilter === cat.id ? "1px solid var(--accent-teal-light)" : "1px solid var(--border-medium)",
                transition: "all 0.15s ease",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Occupations Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {filteredOccupations.map((occ) => {
          const isSuggested = suggestedSocCodes.has(occ.soc_code);

          return (
            <div
              key={occ.soc_code}
              className="card card-interactive"
              onClick={() => {
                onSelectOccupation(occ.soc_code);
                onNavigate("career_detail");
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderColor: isSuggested ? "var(--accent-teal)" : undefined,
                position: "relative",
              }}
            >
              <div>
                {/* Header Tag */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--accent-cyan)",
                    }}
                  >
                    SOC {occ.soc_code}
                  </span>

                  {isSuggested ? (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "9999px",
                        backgroundColor: "var(--accent-teal-subtle)",
                        color: "var(--accent-teal-light)",
                        border: "1px solid rgba(13, 148, 136, 0.35)",
                      }}
                    >
                      Profile-aligned exploration
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      Occupation worth exploring
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.6rem" }}>
                  {occ.title}
                </h3>

                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1rem" }}>
                  {occ.description}
                </p>

                {/* Key Skills */}
                <div style={{ marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>
                    Key O*NET Skills:
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {occ.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          backgroundColor: "var(--bg-tertiary)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tech Skills */}
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>
                    Technologies:
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {occ.tech_skills.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          backgroundColor: "rgba(6, 182, 212, 0.08)",
                          color: "var(--accent-cyan)",
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div
                style={{
                  marginTop: "1.25rem",
                  paddingTop: "0.85rem",
                  borderTop: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {occ.knowledge_areas ? `${occ.knowledge_areas.length} knowledge areas` : ""}
                </span>
                <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--accent-teal-light)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  View Occupation Detail
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOccupations.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
          No occupations matched your search query. Try broadening your filter or search terms.
        </div>
      )}
    </div>
  );
};
