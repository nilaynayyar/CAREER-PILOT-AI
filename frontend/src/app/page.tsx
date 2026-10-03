'use client';

import React, { useState, useEffect } from "react";
import {
  StudentProfile,
  EntranceExamEntry,
  CareerPreferences,
  FullCareerPilotReport,
  OnetOccupation,
  HealthStatus,
} from "@/types/careerpilot";
import { api } from "@/services/api";

import { Sidebar, PageId } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { DashboardView } from "@/components/dashboard/DashboardView";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { AssessmentView } from "@/components/assessment/AssessmentView";
import { MLOutcomeView } from "@/components/ml/MLOutcomeView";
import { ModelExplanationView } from "@/components/ml/ModelExplanationView";
import { CareerExplorationView } from "@/components/careers/CareerExplorationView";
import { CareerDetailView } from "@/components/careers/CareerDetailView";
import { SkillGapView } from "@/components/skills/SkillGapView";
import { RoadmapView } from "@/components/roadmap/RoadmapView";
import { ProjectRecommendationsView } from "@/components/projects/ProjectRecommendationsView";
import { FinalReportView } from "@/components/report/FinalReportView";
import { AboutMethodologyView } from "@/components/about/AboutMethodologyView";

export default function CareerPilotApp() {
  // Navigation State (12 Major Experiences)
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Profile & Input State — Form initially starts completely EMPTY (no preset/demo profile)
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [exams, setExams] = useState<EntranceExamEntry[]>([]);
  const [preferences, setPreferences] = useState<CareerPreferences>({
    interestedDomains: [],
    preferredWorkAreas: [],
    preferredLearningStyle: "hands_on",
  });

  // Occupational Catalog & Live Data
  const [occupations, setOccupations] = useState<OnetOccupation[]>([]);
  const [selectedOccupation, setSelectedOccupation] = useState<OnetOccupation | null>(null);

  // Analysis Report & Execution Pipeline
  const [report, setReport] = useState<FullCareerPilotReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // System Health
  const [health, setHealth] = useState<HealthStatus | null>(null);

  // Initialize theme & load initial health + occupations
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const initSystem = async () => {
      try {
        const [healthRes, occsRes] = await Promise.all([
          api.getHealth().catch(() => ({
            status: "offline",
            model_loaded: true,
            gemini_available: false,
            onet_data_loaded: true,
          })),
          api.getOccupations().catch(() => []),
        ]);
        setHealth(healthRes);
        setOccupations(occsRes);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    initSystem();
  }, []);

  // Update selected occupation helper
  const handleSelectOccupationBySoc = (socCode: string) => {
    const matched = occupations.find((o) => o.soc_code === socCode);
    if (matched) {
      setSelectedOccupation(matched);
    }
  };

  // Profile save callback
  const handleSaveProfile = (
    savedProfile: StudentProfile,
    savedExams: EntranceExamEntry[],
    savedPrefs: CareerPreferences
  ) => {
    setProfile(savedProfile);
    setExams(savedExams);
    setPreferences(savedPrefs);
  };

  // Pipeline execution runner
  const handleRunPipeline = async (
    targetSocCode?: string,
    durationPreference: string = "3 months"
  ) => {
    if (!profile) {
      setErrorMessage("Please complete and validate your student profile before running the assessment.");
      setActivePage("profile");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      setLoadingStep("Executing statistical ML prediction and agentic guidance pipeline...");

      // Execute real API request — CRITICAL: profile contains ONLY genuine AMEO features!
      // Entrance exam data is NOT passed into the ML model.
      const fullReport = await api.runCareerPilot(
        profile,
        targetSocCode || undefined,
        durationPreference
      );

      setReport(fullReport);

      if (fullReport.ai_guidance_section?.selected_occupation) {
        setSelectedOccupation(fullReport.ai_guidance_section.selected_occupation);
      }

      // Navigate to ML Outcome page to present the genuine statistical prediction first
      setActivePage("ml_outcome");
    } catch (err: any) {
      console.error("Pipeline failure:", err);
      setErrorMessage(
        err?.message ||
          "Failed to execute career intelligence pipeline. Please ensure the backend server is reachable at http://127.0.0.1:8000."
      );
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const hasAnalyzed = report !== null;

  return (
    <div className="app-container">
      {/* 1. Desktop & Mobile Navigation Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={(p) => setActivePage(p)}
        health={health}
        hasAnalyzed={hasAnalyzed}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* 2. Top Header */}
        <Header
          activePage={activePage}
          onNavigate={(p) => setActivePage(p)}
          health={health}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          theme={theme}
          onToggleTheme={toggleTheme}
          hasAnalyzed={hasAnalyzed}
        />

        {/* 3. Screen Switcher (12 Dedicated Experiences) */}
        <main className="content-body animate-fade-in" key={activePage}>
          {activePage === "dashboard" && (
            <DashboardView
              profile={profile}
              exams={exams}
              preferences={preferences}
              report={report}
              onNavigate={(p) => setActivePage(p)}
              isLoading={isLoading}
            />
          )}

          {activePage === "profile" && (
            <ProfileForm
              onSaveProfile={handleSaveProfile}
              onProceedToAssessment={() => setActivePage("assessment")}
              initialProfile={profile}
              initialExams={exams}
              initialPrefs={preferences}
            />
          )}

          {activePage === "assessment" && (
            <AssessmentView
              profile={profile}
              exams={exams}
              preferences={preferences}
              occupations={occupations}
              onRunPipeline={handleRunPipeline}
              isLoading={isLoading}
              loadingStep={loadingStep}
              errorMessage={errorMessage}
              onNavigate={(p) => setActivePage(p)}
              hasAnalyzed={hasAnalyzed}
            />
          )}

          {activePage === "ml_outcome" && (
            <MLOutcomeView
              prediction={report ? report.ml_section.prediction : null}
              explanation={report ? report.ml_section.explanation : null}
              onNavigate={(p) => setActivePage(p)}
            />
          )}

          {activePage === "model_explanation" && <ModelExplanationView />}

          {activePage === "career_exploration" && (
            <CareerExplorationView
              occupations={occupations}
              report={report}
              onSelectOccupation={handleSelectOccupationBySoc}
              onNavigate={(p) => setActivePage(p)}
            />
          )}

          {activePage === "career_detail" && (
            <CareerDetailView
              occupation={
                selectedOccupation ||
                (report?.ai_guidance_section?.selected_occupation ?? null) ||
                (occupations.length > 0 ? occupations[0] : null)
              }
              report={report}
              onNavigate={(p) => setActivePage(p)}
            />
          )}

          {activePage === "skill_gap" && (
            <SkillGapView
              skillGap={report ? report.ai_guidance_section.skill_gap : null}
              onNavigate={(p) => setActivePage(p)}
            />
          )}

          {activePage === "roadmap" && (
            <RoadmapView
              roadmap={report ? report.ai_guidance_section.roadmap : null}
              onNavigate={(p) => setActivePage(p)}
            />
          )}

          {activePage === "projects" && (
            <ProjectRecommendationsView
              projectsOutput={report ? report.ai_guidance_section.projects : null}
              onNavigate={(p) => setActivePage(p)}
            />
          )}

          {activePage === "report" && (
            <FinalReportView
              report={report}
              profile={profile}
              exams={exams}
              preferences={preferences}
              onNavigate={(p) => setActivePage(p)}
            />
          )}

          {activePage === "about" && <AboutMethodologyView />}
        </main>

        {/* 4. Scientific Provenance Footer */}
        <Footer />
      </div>

      {/* 5. Bottom Navigation — phones only (≤480px) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile bottom navigation">
        {[
          { id: "dashboard" as PageId, label: "Home", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg> },
          { id: "profile" as PageId, label: "Profile", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
          { id: "assessment" as PageId, label: "Analyze", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
          { id: "career_exploration" as PageId, label: "Careers", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
          { id: "report" as PageId, label: "Report", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
        ].map((item) => (
          <button
            key={item.id}
            className={`mobile-bottom-nav-item${activePage === item.id ? " active" : ""}`}
            onClick={() => setActivePage(item.id)}
            aria-label={item.label}
            aria-current={activePage === item.id ? "page" : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
