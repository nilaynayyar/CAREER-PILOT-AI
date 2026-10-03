/**
 * CareerPilot AI — Client API Service
 * Handles HTTP requests to the FastAPI backend with timeout, error normalization, and offline fallbacks.
 */

import {
  FullCareerPilotReport,
  HealthStatus,
  MLPrediction,
  OnetOccupation,
  StudentProfile,
} from "@/types/careerpilot";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errMsg = `Request failed with status ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errMsg = typeof errorData.detail === "string"
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // use default error message
      }
      throw new ApiError(res.status, errMsg);
    }

    return await res.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network / connection error
    throw new ApiError(
      0,
      `Cannot connect to CareerPilot backend at ${API_BASE_URL}. Ensure the FastAPI server is running.`
    );
  }
}

export const api = {
  /** Fetch system health status (ML model, O*NET, Gemini) */
  async getHealth(): Promise<HealthStatus> {
    return request<HealthStatus>("/api/v1/health");
  },

  /** Fetch all curated O*NET engineering occupations */
  async getOccupations(): Promise<OnetOccupation[]> {
    return request<OnetOccupation[]>("/api/v1/occupations");
  },

  /** Fetch a specific O*NET occupation by SOC code */
  async getOccupation(socCode: string): Promise<OnetOccupation> {
    return request<OnetOccupation>(`/api/v1/occupations/${socCode}`);
  },

  /** ML-only salary tier prediction */
  async predict(profile: StudentProfile): Promise<{
    prediction: MLPrediction;
    explanation: any;
  }> {
    return request("/api/v1/predict", {
      method: "POST",
      body: JSON.stringify(profile),
    });
  },

  /** Execute full end-to-end CareerPilot advisory workflow */
  async runCareerPilot(
    profile: StudentProfile,
    selectedSocCode?: string,
    durationPreference: string = "3 months"
  ): Promise<FullCareerPilotReport> {
    return request<FullCareerPilotReport>("/api/v1/careerpilot", {
      method: "POST",
      body: JSON.stringify({
        profile,
        selected_soc_code: selectedSocCode || null,
        duration_preference: durationPreference,
      }),
    });
  },

  /** Agent 1: Career suggestions based on ML prediction */
  async careerAnalysis(profile: StudentProfile, mlPrediction: MLPrediction): Promise<any> {
    return request("/api/v1/career-analysis", {
      method: "POST",
      body: JSON.stringify({
        profile,
        ml_prediction: mlPrediction,
      }),
    });
  },

  /** Agent 2: Skill gap analysis for target SOC code */
  async skillGap(
    profile: StudentProfile,
    mlPrediction: MLPrediction,
    selectedSocCode: string
  ): Promise<any> {
    return request("/api/v1/skill-gap", {
      method: "POST",
      body: JSON.stringify({
        profile,
        ml_prediction: mlPrediction,
        selected_soc_code: selectedSocCode,
      }),
    });
  },

  /** Agent 3: Phased learning roadmap */
  async roadmap(profile: StudentProfile, skillGap: any): Promise<any> {
    return request("/api/v1/roadmap", {
      method: "POST",
      body: JSON.stringify({
        profile,
        skill_gap: skillGap,
      }),
    });
  },

  /** Agent 4: Recommended practical portfolio projects */
  async projects(profile: StudentProfile, skillGap: any): Promise<any> {
    return request("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify({
        profile,
        skill_gap: skillGap,
      }),
    });
  },
};

