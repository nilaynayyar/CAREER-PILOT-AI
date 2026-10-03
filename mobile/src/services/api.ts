/**
 * CareerPilot AI Mobile — API Client Service
 * Connects directly to the FastAPI backend with timeout, error normalization,
 * and support for runtime API URL configuration.
 */

import {
  FullCareerPilotReport,
  HealthStatus,
  MLPrediction,
  OnetOccupation,
  StudentProfile,
} from "../types/careerpilot";

let customApiUrl: string | null = null;

export function setCustomApiUrl(url: string | null) {
  customApiUrl = url;
}

export function getEffectiveApiUrl(): string {
  if (customApiUrl) return customApiUrl;
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  // Default for local development
  return "http://127.0.0.1:8000";
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getEffectiveApiUrl();
  const url = `${baseUrl}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

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
    clearTimeout(timeoutId);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === "AbortError") {
      throw new ApiError(408, `Request timed out connecting to CareerPilot backend at ${baseUrl}.`);
    }
    throw new ApiError(
      0,
      `Cannot connect to CareerPilot backend at ${baseUrl}. Ensure FastAPI is running and accessible.`
    );
  }
}

export const mobileApi = {
  getApiUrl: getEffectiveApiUrl,
  setApiUrl: setCustomApiUrl,

  async getHealth(): Promise<HealthStatus> {
    return request<HealthStatus>("/api/v1/health");
  },

  async getOccupations(): Promise<OnetOccupation[]> {
    return request<OnetOccupation[]>("/api/v1/occupations");
  },

  async getOccupation(socCode: string): Promise<OnetOccupation> {
    return request<OnetOccupation>(`/api/v1/occupations/${socCode}`);
  },

  async predict(profile: StudentProfile): Promise<{
    prediction: MLPrediction;
    explanation: any;
  }> {
    return request("/api/v1/predict", {
      method: "POST",
      body: JSON.stringify(profile),
    });
  },

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
};
