/**
 * CareerPilot AI Mobile — TypeScript Type Definitions
 * Exact mirrors of FastAPI backend Pydantic models.
 */

export type SalaryTier = "Tier 1" | "Tier 2" | "Tier 3" | "Tier 4";

export interface StudentProfile {
  gender: string;
  degree: string;
  specialization: string;
  college_tier: number;
  college_city_tier: number;
  tenth_percentage: number;
  twelfth_percentage: number;
  college_gpa: number;
  english_score: number;
  logical_score: number;
  quant_score: number;
  domain_score: number;
  conscientiousness: number;
  agreeableness: number;
  extraversion: number;
  neuroticism: number;
  openness: number;
}

export interface MLPrediction {
  salary_tier: SalaryTier;
  probabilities: Record<SalaryTier, number>;
  model_name: string;
  disclaimer: string;
}


export interface FeatureExplanation {
  top_features: Array<{
    feature: string;
    importance_mean: number;
    description: string;
  }>;
  methodology: string;
  interpretation_note: string;
}

export interface OnetOccupation {
  soc_code: string;
  title: string;
  description: string;
  job_zone: number;
  typical_education: string;
  core_tasks: string[];
  required_skills: Array<{ name: string; category: string; importance: number }>;
  knowledge_areas: Array<{ name: string; importance: number }>;
  technologies: string[];
  work_activities: string[];
}

export interface SkillGapOutput {
  target_occupation: string;
  soc_code: string;
  profile_strengths: Array<{ skill: string; evidence: string; confidence: string }>;
  prioritized_gaps: Array<{
    skill: string;
    category: string;
    gap_level: "High" | "Medium" | "Low";
    priority: number;
    recommended_focus: string;
  }>;
  gap_summary: string;
}

export interface RoadmapPhase {
  phase_number: number;
  phase_name: string;
  duration_weeks: number;
  target_skills: string[];
  learning_objectives: string[];
  key_milestones: string[];
}

export interface LearningRoadmapOutput {
  target_occupation: string;
  total_estimated_duration: string;
  phases: RoadmapPhase[];
  weekly_commitment_hours: number;
  prerequisites: string[];
}

export interface ProjectRecommendation {
  project_title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimated_duration_weeks: number;
  targeted_skills: string[];
  description: string;
  deliverables: string[];
  free_tools_used: string[];
}

export interface ProjectsOutput {
  target_occupation: string;
  recommended_projects: ProjectRecommendation[];
}

export interface CareerSuggestion {
  occupation_title: string;
  soc_code: string;
  rationale: string;
  alignment_score?: number;
}

export interface CareerAnalysisOutput {
  profile_summary: string;
  suggested_areas: CareerSuggestion[];
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
  agent_step_statuses: Record<string, { status: string; source: string }>;
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
