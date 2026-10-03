/**
 * CareerPilot AI Mobile — Unified Screen Implementations
 * High-performance, touch-optimized (>=44px), dark-mode styling,
 * responsive for both Phone and Tablet / iPad.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  FullCareerPilotReport,
  HealthStatus,
  OnetOccupation,
  StudentProfile,
} from "../types/careerpilot";
import { mobileApi } from "../services/api";

const THEME = {
  bgPrimary: "#0d1117",
  bgSecondary: "#161b22",
  bgCard: "#1c2128",
  borderSubtle: "#30363d",
  borderMedium: "#484f58",
  accentTeal: "#0d9488",
  accentTealLight: "#14b8a6",
  accentCyan: "#06b6d4",
  textPrimary: "#f0f6fc",
  textSecondary: "#8b949e",
  textMuted: "#6e7681",
  success: "#238636",
  warning: "#d29922",
  danger: "#f85149",
};

interface ScreenProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  report: FullCareerPilotReport | null;
  setReport: React.Dispatch<React.SetStateAction<FullCareerPilotReport | null>>;
  occupations: OnetOccupation[];
  health: HealthStatus | null;
  onNavigate: (screen: string) => void;
  isTablet: boolean;
}

// -------------------------------------------------------------
// 1. Dashboard Screen
// -------------------------------------------------------------
export const DashboardScreen: React.FC<ScreenProps> = ({
  health,
  report,
  onNavigate,
  isTablet,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTag}>ENGINEERING CAREER INTELLIGENCE</Text>
        <Text style={styles.heroTitle}>CareerPilot AI</Text>
        <Text style={styles.heroSubtitle}>
          Grounded career navigation driven by empirical Machine Learning (AMEO 2015) and O*NET occupational data.
        </Text>
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => onNavigate("profile")}
          >
            <Text style={styles.primaryBtnText}>
              {report ? "Edit Profile" : "Start Authentic Assessment"}
            </Text>
          </TouchableOpacity>
          {report && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => onNavigate("report")}
            >
              <Text style={styles.secondaryBtnText}>View Full Report</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.sectionHeading}>System Health & Engines</Text>
      <View style={[styles.grid, isTablet && styles.grid2Col]}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ML Inference Pipeline</Text>
          <Text style={styles.cardStatusText}>
            Status: {health?.model_loaded ? "Operational" : "Unavailable"}
          </Text>
          <Text style={styles.cardDesc}>
            AMEO 2015 Gradient Boosted Model (3,998 real engineering graduates). Zenodo DOI 10.5281/zenodo.45735.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Occupational Grounding</Text>
          <Text style={styles.cardStatusText}>
            Status: {health?.onet_data_loaded ? "Active (O*NET 28.0)" : "Loading"}
          </Text>
          <Text style={styles.cardDesc}>
            Standard Occupational Classification (SOC) requirements, skills, knowledge domains, and tools.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionHeading}>Core Workflow Stages</Text>
      <View style={[styles.grid, isTablet && styles.grid2Col]}>
        {[
          { num: "01", title: "Authentic Profile", desc: "Academics, AMCAT scores, Big Five traits" },
          { num: "02", title: "ML Prediction", desc: "Empirical salary tier & probability breakdown" },
          { num: "03", title: "O*NET Analysis", desc: "Target occupation & competency mapping" },
          { num: "04", title: "Roadmap & Projects", desc: "Milestones, free open-source tooling" },
        ].map((item) => (
          <View key={item.num} style={styles.card}>
            <Text style={styles.stepNum}>{item.num}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// -------------------------------------------------------------
// 2. Profile Screen
// -------------------------------------------------------------
export const ProfileScreen: React.FC<ScreenProps> = ({
  profile,
  setProfile,
  onNavigate,
  isTablet,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateField = (field: keyof StudentProfile, val: any) => {
    setProfile((prev) => ({ ...prev, [field]: val }));
    setErrorMsg(null);
  };

  const handleValidateAndProceed = () => {
    // Exact backend validations
    if (profile.tenth_percentage < 0 || profile.tenth_percentage > 100) {
      setErrorMsg("10th percentage must be between 0 and 100.");
      return;
    }
    if (profile.twelfth_percentage < 0 || profile.twelfth_percentage > 100) {
      setErrorMsg("12th percentage must be between 0 and 100.");
      return;
    }
    if (profile.college_gpa < 0 || profile.college_gpa > 100) {
      setErrorMsg("College GPA / percentage must be between 0 and 100.");
      return;
    }
    if (
      profile.english_score < 0 || profile.english_score > 900 ||
      profile.logical_score < 0 || profile.logical_score > 900 ||
      profile.quant_score < 0 || profile.quant_score > 900
    ) {
      setErrorMsg("Aptitude scores must be in range 0–900.");
      return;
    }
    if (
      profile.conscientiousness < -5 || profile.conscientiousness > 5 ||
      profile.agreeableness < -5 || profile.agreeableness > 5 ||
      profile.extraversion < -5 || profile.extraversion > 5 ||
      profile.neuroticism < -5 || profile.neuroticism > 5 ||
      profile.openness < -5 || profile.openness > 5
    ) {
      setErrorMsg("Big Five personality traits must be in range -5.0 to +5.0.");
      return;
    }

    onNavigate("assessment");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Student Academic & Aptitude Profile</Text>
      <Text style={styles.screenSubtitle}>
        Enter authentic credentials. Zero preset values or fabricated records.
      </Text>

      {errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      <Text style={styles.formSectionHeader}>1. Academic Background</Text>
      <View style={[styles.formGrid, isTablet && styles.grid2Col]}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>10th Percentage (%)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={profile.tenth_percentage ? String(profile.tenth_percentage) : ""}
            placeholder="e.g. 85.5"
            placeholderTextColor={THEME.textMuted}
            onChangeText={(t) => updateField("tenth_percentage", parseFloat(t) || 0)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>12th Percentage (%)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={profile.twelfth_percentage ? String(profile.twelfth_percentage) : ""}
            placeholder="e.g. 82.0"
            placeholderTextColor={THEME.textMuted}
            onChangeText={(t) => updateField("twelfth_percentage", parseFloat(t) || 0)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>College GPA / Percentage (%)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={profile.college_gpa ? String(profile.college_gpa) : ""}
            placeholder="e.g. 78.4"
            placeholderTextColor={THEME.textMuted}
            onChangeText={(t) => updateField("college_gpa", parseFloat(t) || 0)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Degree Specialization</Text>
          <TextInput
            style={styles.input}
            value={profile.specialization}
            placeholder="computer engineering"
            placeholderTextColor={THEME.textMuted}
            onChangeText={(t) => updateField("specialization", t)}
          />
        </View>
      </View>

      <Text style={styles.formSectionHeader}>2. Aptitude & Domain (0–900)</Text>
      <View style={[styles.formGrid, isTablet && styles.grid2Col]}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>English Score</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={profile.english_score ? String(profile.english_score) : ""}
            placeholder="0–900"
            placeholderTextColor={THEME.textMuted}
            onChangeText={(t) => updateField("english_score", parseInt(t, 10) || 0)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Logical Ability Score</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={profile.logical_score ? String(profile.logical_score) : ""}
            placeholder="0–900"
            placeholderTextColor={THEME.textMuted}
            onChangeText={(t) => updateField("logical_score", parseInt(t, 10) || 0)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quantitative Score</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={profile.quant_score ? String(profile.quant_score) : ""}
            placeholder="0–900"
            placeholderTextColor={THEME.textMuted}
            onChangeText={(t) => updateField("quant_score", parseInt(t, 10) || 0)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Domain / Technical Score</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={profile.domain_score ? String(profile.domain_score) : ""}
            placeholder="0–900"
            placeholderTextColor={THEME.textMuted}
            onChangeText={(t) => updateField("domain_score", parseInt(t, 10) || 0)}
          />
        </View>
      </View>

      <Text style={styles.formSectionHeader}>3. Big Five Personality (-5.0 to +5.0)</Text>
      <View style={[styles.formGrid, isTablet && styles.grid2Col]}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Conscientiousness</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(profile.conscientiousness)}
            onChangeText={(t) => updateField("conscientiousness", parseFloat(t) || 0)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Agreeableness</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(profile.agreeableness)}
            onChangeText={(t) => updateField("agreeableness", parseFloat(t) || 0)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Extraversion</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(profile.extraversion)}
            onChangeText={(t) => updateField("extraversion", parseFloat(t) || 0)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Openness to Experience</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(profile.openness)}
            onChangeText={(t) => updateField("openness", parseFloat(t) || 0)}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, { marginTop: 24 }]}
        onPress={handleValidateAndProceed}
      >
        <Text style={styles.primaryBtnText}>Save Profile & Proceed to Pipeline →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// -------------------------------------------------------------
// 3. Assessment & Pipeline Screen
// -------------------------------------------------------------
export const AssessmentScreen: React.FC<ScreenProps> = ({
  profile,
  report,
  setReport,
  occupations,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSoc, setSelectedSoc] = useState<string>("");

  const handleRunAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await mobileApi.runCareerPilot(profile, selectedSoc || undefined);
      setReport(res);
      onNavigate("ml_outcome");
    } catch (e: any) {
      setError(e.message || "Failed to execute CareerPilot pipeline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Execute Advisory Pipeline</Text>
      <Text style={styles.screenSubtitle}>
        Launches the empirical ML inference engine and 4 sequential guidance agents.
      </Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Target Occupation (Optional Focus)</Text>
        <Text style={styles.cardDesc}>
          Select a specific O*NET occupation, or leave empty for automatic alignment.
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
          {occupations.slice(0, 8).map((occ) => (
            <TouchableOpacity
              key={occ.soc_code}
              style={[
                styles.chip,
                selectedSoc === occ.soc_code && styles.chipActive,
              ]}
              onPress={() => setSelectedSoc(occ.soc_code === selectedSoc ? "" : occ.soc_code)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedSoc === occ.soc_code && styles.chipTextActive,
                ]}
              >
                {occ.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, loading && styles.btnDisabled]}
        disabled={loading}
        onPress={handleRunAssessment}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryBtnText}>
            {report ? "Re-Run Complete Pipeline" : "Run CareerPilot Pipeline"}
          </Text>
        )}
      </TouchableOpacity>

      {report && (
        <View style={{ marginTop: 24, gap: 12 }}>
          <Text style={styles.sectionHeading}>Generated Results Ready</Text>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => onNavigate("ml_outcome")}
          >
            <Text style={styles.secondaryBtnText}>View ML Outcome →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => onNavigate("skill_gap")}
          >
            <Text style={styles.secondaryBtnText}>View Skill Gap & Roadmap →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => onNavigate("report")}
          >
            <Text style={styles.secondaryBtnText}>View Full Intelligence Report →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

// -------------------------------------------------------------
// 4. ML Outcome Screen
// -------------------------------------------------------------
export const MLOutcomeScreen: React.FC<ScreenProps> = ({ report, onNavigate }) => {
  if (!report) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.cardTitle}>No Analysis Performed</Text>
        <Text style={styles.cardDesc}>Please submit your profile in the Assessment tab first.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => onNavigate("assessment")}>
          <Text style={styles.primaryBtnText}>Go to Assessment</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { prediction } = report.ml_section;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>ML Employment Outcome</Text>
      <Text style={styles.screenSubtitle}>
        Empirical prediction from the trained AMEO 2015 model. Authoritative and unaltered.
      </Text>

      <View style={styles.tierBanner}>
        <Text style={styles.tierTag}>PREDICTED SALARY TIER</Text>
        <Text style={styles.tierMainText}>{prediction.salary_tier}</Text>
        <Text style={styles.confidenceText}>
          Predicted Probability: {((prediction.probabilities[prediction.salary_tier] || 0) * 100).toFixed(1)}%
        </Text>
      </View>


      <Text style={styles.sectionHeading}>Class Probabilities</Text>
      <View style={styles.card}>
        {Object.entries(prediction.probabilities).map(([tier, rawProb]) => {

          const prob = Number(rawProb);
          return (
            <View key={tier} style={styles.probRow}>
              <Text style={styles.probLabel}>{tier}</Text>
              <View style={styles.probTrack}>
                <View
                  style={[
                    styles.probFill,
                    { width: `${Math.max(4, Math.round(prob * 100))}%` },
                    tier === prediction.salary_tier && { backgroundColor: THEME.accentTeal },
                  ]}
                />
              </View>
              <Text style={styles.probValue}>{(prob * 100).toFixed(1)}%</Text>
            </View>
          );
        })}
      </View>


      <Text style={styles.sectionHeading}>Provenance</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{prediction.model_name}</Text>
        <Text style={styles.cardDesc}>Dataset: AMEO 2015</Text>
        <Text style={[styles.cardDesc, { marginTop: 6 }]}>
          Zenodo DOI: 10.5281/zenodo.45735 (CC BY-NC-SA 4.0).
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.secondaryBtn, { marginTop: 16 }]}
        onPress={() => onNavigate("model_explanation")}
      >
        <Text style={styles.secondaryBtnText}>View Feature Importance & Methodology →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// -------------------------------------------------------------
// 5. Model Explanation Screen
// -------------------------------------------------------------
export const ModelExplanationScreen: React.FC<ScreenProps> = ({ report }) => {
  const explanation = report?.ml_section.explanation;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Model Explanation & Permutation Importance</Text>
      <Text style={styles.screenSubtitle}>
        Scientific interpretability of the AMEO 2015 model pipeline.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Methodology</Text>
        <Text style={styles.cardDesc}>
          {explanation?.methodology || "Ensemble gradient boosting with stratified cross-validation."}
        </Text>
      </View>

      <Text style={styles.sectionHeading}>Top Permutation Features</Text>
      <View style={styles.card}>
        {explanation?.top_features ? (
          explanation.top_features.map((item, idx) => (
            <View key={idx} style={styles.featureRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureName}>{item.feature}</Text>
                <Text style={styles.featureDesc}>{item.description}</Text>
              </View>
              <Text style={styles.featureScore}>
                {item.importance_mean.toFixed(4)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.cardDesc}>Run assessment to view feature attributions.</Text>
        )}
      </View>
    </ScrollView>
  );
};

// -------------------------------------------------------------
// 6. Career Exploration Screen
// -------------------------------------------------------------
export const CareerExplorationScreen: React.FC<ScreenProps> = ({
  occupations,
  onNavigate,
}) => {
  const [search, setSearch] = useState("");
  const filtered = occupations.filter((o) =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.soc_code.includes(search)
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>O*NET Career Exploration</Text>
      <Text style={styles.screenSubtitle}>
        Curated engineering and technical occupations grounded in standard O*NET 28.0.
      </Text>

      <TextInput
        style={[styles.input, { marginBottom: 16 }]}
        placeholder="Search by title or SOC code..."
        placeholderTextColor={THEME.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.grid}>
        {filtered.map((occ) => (
          <View key={occ.soc_code} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.badgeSoc}>{occ.soc_code}</Text>
              <Text style={styles.jobZoneText}>Job Zone {occ.job_zone}</Text>
            </View>
            <Text style={styles.cardTitle}>{occ.title}</Text>
            <Text numberOfLines={3} style={styles.cardDesc}>
              {occ.description}
            </Text>
            <View style={styles.techTagsRow}>
              {occ.technologies.slice(0, 4).map((tech, idx) => (
                <View key={idx} style={styles.techTag}>
                  <Text style={styles.techTagText}>{tech}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// -------------------------------------------------------------
// 7. Skill Gap Screen
// -------------------------------------------------------------
export const SkillGapScreen: React.FC<ScreenProps> = ({ report, onNavigate }) => {
  if (!report) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.cardTitle}>No Skill Gap Data</Text>
        <Text style={styles.cardDesc}>Run assessment to analyze your skill gaps against O*NET benchmarks.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => onNavigate("assessment")}>
          <Text style={styles.primaryBtnText}>Run Assessment</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { skill_gap } = report.ai_guidance_section;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Skill Gap Analysis</Text>
      <Text style={styles.screenSubtitle}>
        Benchmark comparison against {skill_gap.target_occupation} ({skill_gap.soc_code}).
      </Text>

      <Text style={styles.sectionHeading}>Profile Strengths</Text>
      <View style={styles.card}>
        {skill_gap.profile_strengths.map((str, idx) => (
          <View key={idx} style={styles.strengthRow}>
            <Text style={styles.strengthSkill}>{str.skill}</Text>
            <Text style={styles.cardDesc}>{str.evidence}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionHeading}>Prioritized Skill Gaps</Text>
      <View style={styles.grid}>
        {skill_gap.prioritized_gaps.map((gap, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{gap.skill}</Text>
              <View
                style={[
                  styles.gapBadge,
                  gap.gap_level === "High" ? styles.badgeDanger : styles.badgeWarning,
                ]}
              >
                <Text style={styles.gapBadgeText}>{gap.gap_level}</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>Focus: {gap.recommended_focus}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// -------------------------------------------------------------
// 8. Learning Roadmap Screen
// -------------------------------------------------------------
export const RoadmapScreen: React.FC<ScreenProps> = ({ report, onNavigate }) => {
  if (!report) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.cardTitle}>No Roadmap Available</Text>
        <Text style={styles.cardDesc}>Complete an assessment to generate your personalized roadmap.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => onNavigate("assessment")}>
          <Text style={styles.primaryBtnText}>Go to Assessment</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { roadmap } = report.ai_guidance_section;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Structured Learning Roadmap</Text>
      <Text style={styles.screenSubtitle}>
        Phased preparation plan for {roadmap.target_occupation}. Weekly commitment: {roadmap.weekly_commitment_hours} hrs.
      </Text>

      <View style={styles.grid}>
        {roadmap.phases.map((phase) => (
          <View key={phase.phase_number} style={styles.card}>
            <Text style={styles.stepNum}>PHASE {phase.phase_number}</Text>
            <Text style={styles.cardTitle}>{phase.phase_name}</Text>
            <Text style={styles.durationText}>{phase.duration_weeks} Weeks</Text>

            <Text style={styles.subHeadingText}>Target Skills:</Text>
            <Text style={styles.cardDesc}>{phase.target_skills.join(", ")}</Text>

            <Text style={styles.subHeadingText}>Key Milestones:</Text>
            {phase.key_milestones.map((m, i) => (
              <Text key={i} style={styles.bulletItem}>• {m}</Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// -------------------------------------------------------------
// 9. Project Recommendations Screen
// -------------------------------------------------------------
export const ProjectsScreen: React.FC<ScreenProps> = ({ report, onNavigate }) => {
  if (!report) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.cardTitle}>No Projects Found</Text>
        <Text style={styles.cardDesc}>Run an assessment to view hands-on project recommendations.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => onNavigate("assessment")}>
          <Text style={styles.primaryBtnText}>Go to Assessment</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { projects } = report.ai_guidance_section;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Recommended Portfolio Projects</Text>
      <Text style={styles.screenSubtitle}>
        Buildable projects to develop skills for {projects.target_occupation}.
      </Text>

      <View style={styles.grid}>
        {projects.recommended_projects.map((proj, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{proj.project_title}</Text>
              <View style={styles.diffBadge}>
                <Text style={styles.diffBadgeText}>{proj.difficulty}</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>{proj.description}</Text>

            <Text style={styles.subHeadingText}>Deliverables:</Text>
            {proj.deliverables.map((d, i) => (
              <Text key={i} style={styles.bulletItem}>• {d}</Text>
            ))}

            <Text style={styles.subHeadingText}>Free Tools Used:</Text>
            <Text style={styles.cardDesc}>{proj.free_tools_used.join(", ")}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// -------------------------------------------------------------
// 10. Final Intelligence Report Screen
// -------------------------------------------------------------
export const ReportScreen: React.FC<ScreenProps> = ({ report, onNavigate }) => {
  if (!report) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.cardTitle}>No Full Report Yet</Text>
        <Text style={styles.cardDesc}>Submit the student profile form to generate the multi-layer report.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => onNavigate("profile")}>
          <Text style={styles.primaryBtnText}>Build Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Career Intelligence Report</Text>
      <Text style={styles.screenSubtitle}>
        Unified multi-layer summary synthesized from statistical ML and O*NET intelligence.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>1. ML Authoritative Baseline</Text>
        <Text style={styles.tierMainText}>{report.ml_section.prediction.salary_tier}</Text>
        <Text style={styles.cardDesc}>
          Predicted Probability: {((report.ml_section.prediction.probabilities[report.ml_section.prediction.salary_tier] || 0) * 100).toFixed(1)}% | Dataset: AMEO 2015
        </Text>
      </View>


      <View style={styles.card}>
        <Text style={styles.cardTitle}>2. Target Occupational Focus</Text>
        <Text style={styles.cardDesc}>
          {report.ai_guidance_section.skill_gap.target_occupation} ({report.ai_guidance_section.skill_gap.soc_code})
        </Text>
        <Text style={[styles.cardDesc, { marginTop: 8 }]}>
          Summary: {report.ai_guidance_section.skill_gap.gap_summary}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>3. Implementation Phasing</Text>
        <Text style={styles.cardDesc}>
          Total Duration: {report.ai_guidance_section.roadmap.total_estimated_duration}
        </Text>
        <Text style={styles.cardDesc}>
          Phases: {report.ai_guidance_section.roadmap.phases.length} sequential learning blocks.
        </Text>
      </View>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerTitle}>SCIENTIFIC DISCLAIMER & NOTICE</Text>
        <Text style={styles.disclaimerText}>{report.report_disclaimer}</Text>
      </View>
    </ScrollView>
  );
};

// -------------------------------------------------------------
// 11. About & Methodology Screen
// -------------------------------------------------------------
export const AboutScreen: React.FC<ScreenProps> = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>About CareerPilot AI</Text>
      <Text style={styles.screenSubtitle}>
        Rigorous engineering career intelligence with zero data fabrication.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>AMEO 2015 Dataset Provenance</Text>
        <Text style={styles.cardDesc}>
          Published under CC BY-NC-SA 4.0 by Aspiring Minds. Zenodo DOI 10.5281/zenodo.45735.
          Contains 3,998 real engineering graduate records with academic, cognitive, domain, and personality metrics.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Occupational Standards (O*NET 28.0)</Text>
        <Text style={styles.cardDesc}>
          Curated SOC occupational taxonomy developed under the sponsorship of the U.S. Department of Labor/Employment and Training Administration.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Architectural Invariance</Text>
        <Text style={styles.cardDesc}>
          The ML model output is strictly authoritative and cannot be overwritten by LLMs or client scripts.
          Downstream guidance agents ground their suggestions in verified O*NET occupational data.
        </Text>
      </View>
    </ScrollView>
  );
};

// -------------------------------------------------------------
// STYLES (Touch-friendly >= 44px, dark theme)
// -------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  heroCard: {
    backgroundColor: THEME.bgSecondary,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  heroTag: {
    color: THEME.accentTealLight,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroTitle: {
    color: THEME.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: THEME.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: THEME.accentTeal,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderColor: THEME.borderMedium,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryBtnText: {
    color: THEME.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  sectionHeading: {
    color: THEME.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 12,
  },
  screenTitle: {
    color: THEME.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  screenSubtitle: {
    color: THEME.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  grid: {
    gap: 12,
  },
  grid2Col: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: THEME.bgSecondary,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  cardTitle: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardDesc: {
    color: THEME.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  cardStatusText: {
    color: THEME.accentTealLight,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  stepNum: {
    color: THEME.accentCyan,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  formSectionHeader: {
    color: THEME.accentTealLight,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 10,
  },
  formGrid: {
    gap: 10,
  },
  inputGroup: {
    marginBottom: 6,
  },
  label: {
    color: THEME.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    borderRadius: 8,
    color: THEME.textPrimary,
    minHeight: 44,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  errorBox: {
    backgroundColor: "rgba(248, 81, 73, 0.12)",
    borderWidth: 1,
    borderColor: THEME.danger,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: THEME.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  chip: {
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: THEME.accentTeal,
    borderColor: THEME.accentTeal,
  },
  chipText: {
    color: THEME.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  tierBanner: {
    backgroundColor: THEME.bgSecondary,
    borderWidth: 2,
    borderColor: THEME.accentTeal,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  tierTag: {
    color: THEME.accentTealLight,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  tierMainText: {
    color: THEME.textPrimary,
    fontSize: 32,
    fontWeight: "900",
    marginVertical: 6,
  },
  confidenceText: {
    color: THEME.textSecondary,
    fontSize: 13,
  },
  probRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  probLabel: {
    color: THEME.textPrimary,
    width: 60,
    fontSize: 13,
    fontWeight: "600",
  },
  probTrack: {
    flex: 1,
    height: 12,
    backgroundColor: THEME.bgCard,
    borderRadius: 6,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  probFill: {
    height: "100%",
    backgroundColor: THEME.borderMedium,
    borderRadius: 6,
  },
  probValue: {
    color: THEME.textSecondary,
    width: 45,
    textAlign: "right",
    fontSize: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderSubtle,
  },
  featureName: {
    color: THEME.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  featureDesc: {
    color: THEME.textSecondary,
    fontSize: 11,
  },
  featureScore: {
    color: THEME.accentCyan,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  badgeSoc: {
    color: THEME.accentCyan,
    fontSize: 12,
    fontWeight: "700",
  },
  jobZoneText: {
    color: THEME.textMuted,
    fontSize: 11,
  },
  techTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  techTag: {
    backgroundColor: THEME.bgCard,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  techTagText: {
    color: THEME.textSecondary,
    fontSize: 11,
  },
  strengthRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderSubtle,
  },
  strengthSkill: {
    color: THEME.accentTealLight,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  gapBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeDanger: {
    backgroundColor: "rgba(248, 81, 73, 0.2)",
  },
  badgeWarning: {
    backgroundColor: "rgba(210, 153, 34, 0.2)",
  },
  gapBadgeText: {
    color: THEME.textPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
  durationText: {
    color: THEME.accentTealLight,
    fontSize: 12,
    fontWeight: "700",
    marginVertical: 4,
  },
  subHeadingText: {
    color: THEME.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 2,
  },
  bulletItem: {
    color: THEME.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 4,
  },
  diffBadge: {
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffBadgeText: {
    color: THEME.accentCyan,
    fontSize: 11,
    fontWeight: "700",
  },
  disclaimerBox: {
    backgroundColor: "rgba(210, 153, 34, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(210, 153, 34, 0.35)",
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
  },
  disclaimerTitle: {
    color: THEME.warning,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },
  disclaimerText: {
    color: THEME.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
