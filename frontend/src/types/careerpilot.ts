/**
 * CareerPilot AI — TypeScript Data Contracts
 * Exactly matches FastAPI backend schemas.
 */

export type SalaryTier = "Low" | "Mid" | "High";

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

export interface StudentProfile {
  percentage_10th: number;
  percentage_12th: number;
  college_gpa: number;
  college_tier: number;
  english_score: number;
  logical_score: number;
  quant_score: number;
  computer_programming_score?: number | null;
  conscientiousness: number;
  agreeableness: number;
  extraversion: number;
  neuroticism: number;
  openness_to_experience: number;
  specialization: string;
  degree: string;
}

export interface MLPrediction {
  salary_tier: SalaryTier;
  probabilities: Record<SalaryTier, number>;
  model_name: string;
  disclaimer: string;
}

export interface TopFeature {
  feature: string;
  importance_mean: number;
  importance_std?: number;
  display_name?: string;
}

export interface FeatureExplanation {
  method: string;
  top_features: TopFeature[];
  note: string;
}

export interface OnetOccupation {
  soc_code: string;
  title: string;
  description: string;
  skills: string[];
  knowledge_areas: string[];
  tech_skills: string[];
  tasks: string[];
  related_soc_codes?: string[];
}

export interface OccupationSuggestion {
  soc_code: string;
  title: string;
  relevance_reason: string;
  onet_evidence: string[];
}

export interface CareerAnalysisOutput {
  suggested_occupations: OccupationSuggestion[];
  profile_strengths: string[];
  analysis_summary: string;
  disclaimer: string;
}

export interface SkillGapItem {
  skill_name: string;
  gap_description: string;
  source: string;
  priority: "high" | "medium" | "low";
}

export interface SkillGapOutput {
  occupation_title: string;
  soc_code: string;
  current_strengths: string[];
  skill_gaps: SkillGapItem[];
  priority_gaps?: string[];
  data_limitation?: string;
  gap_summary?: string;
}

export interface RoadmapPhase {
  phase_number: number;
  phase_name: string;
  duration_estimate?: string;
  duration_weeks?: number;
  skills_covered?: string[];
  focus_skills?: string[];
  learning_activities?: string[];
  recommended_activities?: string[];
  milestone: string;
}

export interface LearningRoadmapOutput {
  occupation_title: string;
  total_estimated_duration: string;
  phases: RoadmapPhase[];
  general_advice: string;
  disclaimer: string;
}

export interface ProjectRecommendation {
  title: string;
  objective: string;
  skills_developed: string[];
  difficulty: DifficultyLevel;
  suggested_technologies: string[];
  expected_output: string;
  prerequisite?: string | null;
}

export interface ProjectsOutput {
  occupation_title: string;
  projects: ProjectRecommendation[];
  general_tip: string;
}

export interface FullCareerPilotReport {
  status: string;
  ml_section: {
    label: string;
    prediction: MLPrediction;
    explanation: FeatureExplanation;
  };
  ai_guidance_section: {
    label: string;
    career_analysis: CareerAnalysisOutput;
    selected_occupation: OnetOccupation | null;
    skill_gap: SkillGapOutput;
    roadmap: LearningRoadmapOutput;
    projects: ProjectsOutput;
  };
  agent_step_statuses: Record<string, { status: string; source?: string; detail?: string }>;
  onet_attribution: string;
  report_disclaimer: string;
}

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
  gemini_available: boolean;
  onet_data_loaded: boolean;
  version?: string;
}

export type EntranceExamType =
  | "JEE Main"
  | "JEE Advanced"
  | "NEET UG"
  | "CUET UG"
  | "CLAT"
  | "GATE"
  | "CAT"
  | "NIFT"
  | "NID DAT"
  | "UCEED"
  | "NDA"
  | "Other"
  | "None";

export type ExamStatus =
  | "Preparing"
  | "Appeared"
  | "Qualified"
  | "Not qualified"
  | "Not applicable";

export interface EntranceExamEntry {
  id: string;
  exam: EntranceExamType;
  customExamName?: string;
  status: ExamStatus;
  year?: string;
  percentile?: string;
  score?: string;
  rank?: string;
  userDefinedMetric?: string;
}

export interface CareerPreferences {
  interestedDomains: string[];
  preferredWorkAreas: string[];
  preferredLearningStyle: string;
  notes?: string;
}

