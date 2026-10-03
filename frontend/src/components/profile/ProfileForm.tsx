import React, { useState } from "react";
import { StudentProfile, EntranceExamEntry, CareerPreferences } from "@/types/careerpilot";
import { AcademicSection, AcademicData } from "./AcademicSection";
import { AptitudeSection, AptitudeData } from "./AptitudeSection";
import { PersonalitySection, PersonalityData } from "./PersonalitySection";
import { EntranceExamSection } from "./EntranceExamSection";
import { CareerContextSection } from "./CareerContextSection";

interface ProfileFormProps {
  onSaveProfile: (profile: StudentProfile, exams: EntranceExamEntry[], prefs: CareerPreferences) => void;
  onProceedToAssessment: () => void;
  initialProfile: StudentProfile | null;
  initialExams: EntranceExamEntry[];
  initialPrefs: CareerPreferences;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  onSaveProfile,
  onProceedToAssessment,
  initialProfile,
  initialExams,
  initialPrefs,
}) => {
  // Start completely empty by default — NO preset or demo data!
  const [academic, setAcademic] = useState<AcademicData>({
    percentage_10th: initialProfile?.percentage_10th ? initialProfile.percentage_10th.toString() : "",
    percentage_12th: initialProfile?.percentage_12th ? initialProfile.percentage_12th.toString() : "",
    college_gpa: initialProfile?.college_gpa ? initialProfile.college_gpa.toString() : "",
    college_tier: initialProfile?.college_tier ? initialProfile.college_tier.toString() : "",
    degree: initialProfile?.degree || "",
    specialization: initialProfile?.specialization || "",
  });

  const [aptitude, setAptitude] = useState<AptitudeData>({
    english_score: initialProfile?.english_score ? initialProfile.english_score.toString() : "",
    logical_score: initialProfile?.logical_score ? initialProfile.logical_score.toString() : "",
    quant_score: initialProfile?.quant_score ? initialProfile.quant_score.toString() : "",
    computer_programming_score: initialProfile?.computer_programming_score
      ? initialProfile.computer_programming_score.toString()
      : "",
  });

  const [personality, setPersonality] = useState<PersonalityData>({
    conscientiousness: initialProfile?.conscientiousness !== undefined ? initialProfile.conscientiousness.toString() : "",
    agreeableness: initialProfile?.agreeableness !== undefined ? initialProfile.agreeableness.toString() : "",
    extraversion: initialProfile?.extraversion !== undefined ? initialProfile.extraversion.toString() : "",
    neuroticism: initialProfile?.neuroticism !== undefined ? initialProfile.neuroticism.toString() : "",
    openness_to_experience: initialProfile?.openness_to_experience !== undefined ? initialProfile.openness_to_experience.toString() : "",
  });

  const [exams, setExams] = useState<EntranceExamEntry[]>(initialExams || []);
  const [prefs, setPrefs] = useState<CareerPreferences>(initialPrefs || {
    interestedDomains: [],
    preferredWorkAreas: [],
    preferredLearningStyle: "hands_on",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAcademicChange = (field: keyof AcademicData, value: string) => {
    setAcademic((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleAptitudeChange = (field: keyof AptitudeData, value: string) => {
    setAptitude((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handlePersonalityChange = (field: keyof PersonalityData, value: string) => {
    setPersonality((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validate = (): StudentProfile | null => {
    const errs: Record<string, string> = {};

    // 1. Academic validation
    const p10 = parseFloat(academic.percentage_10th);
    if (isNaN(p10) || p10 < 40 || p10 > 100) {
      errs.percentage_10th = "Please enter valid 10th grade percentage (40 - 100)";
    }

    const p12 = parseFloat(academic.percentage_12th);
    if (isNaN(p12) || p12 < 40 || p12 > 100) {
      errs.percentage_12th = "Please enter valid 12th grade percentage (40 - 100)";
    }

    let gpa = parseFloat(academic.college_gpa);
    if (isNaN(gpa) || gpa <= 0) {
      errs.college_gpa = "Please enter graduation percentage or GPA";
    } else if (gpa <= 10.0) {
      gpa = gpa * 9.5; // normalize 10-point scale
    } else if (gpa < 40 || gpa > 100) {
      errs.college_gpa = "College percentage must be between 40 and 100";
    }

    const tier = parseInt(academic.college_tier, 10);
    if (isNaN(tier) || (tier !== 1 && tier !== 2)) {
      errs.college_tier = "Please select college tier (1 or 2)";
    }

    if (!academic.degree) {
      errs.degree = "Please select your degree program";
    }

    if (!academic.specialization) {
      errs.specialization = "Please select your engineering specialization";
    }

    // 2. Aptitude validation
    const eng = parseInt(aptitude.english_score, 10);
    if (isNaN(eng) || eng < 200 || eng > 900) {
      errs.english_score = "English score must be between 200 and 900";
    }

    const log = parseInt(aptitude.logical_score, 10);
    if (isNaN(log) || log < 200 || log > 900) {
      errs.logical_score = "Logical ability score must be between 200 and 900";
    }

    const quant = parseInt(aptitude.quant_score, 10);
    if (isNaN(quant) || quant < 200 || quant > 900) {
      errs.quant_score = "Quantitative score must be between 200 and 900";
    }

    let prog: number | null = null;
    if (aptitude.computer_programming_score.trim() !== "") {
      const p = parseInt(aptitude.computer_programming_score, 10);
      if (isNaN(p) || p < 200 || p > 900) {
        errs.computer_programming_score = "Programming score must be between 200 and 900";
      } else {
        prog = p;
      }
    }

    // 3. Personality validation
    const parseTrait = (val: string, key: keyof PersonalityData) => {
      if (val === "") return 0.0; // default neutral
      const num = parseFloat(val);
      if (isNaN(num) || num < -3.0 || num > 3.0) {
        errs[key] = "Value must be between -3.0 and +3.0";
        return 0.0;
      }
      return num;
    };

    const c = parseTrait(personality.conscientiousness, "conscientiousness");
    const a = parseTrait(personality.agreeableness, "agreeableness");
    const e = parseTrait(personality.extraversion, "extraversion");
    const n = parseTrait(personality.neuroticism, "neuroticism");
    const o = parseTrait(personality.openness_to_experience, "openness_to_experience");

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      return null;
    }

    return {
      percentage_10th: p10,
      percentage_12th: p12,
      college_gpa: Math.round(gpa * 10) / 10,
      college_tier: tier,
      degree: academic.degree,
      specialization: academic.specialization,
      english_score: eng,
      logical_score: log,
      quant_score: quant,
      computer_programming_score: prog,
      conscientiousness: c,
      agreeableness: a,
      extraversion: e,
      neuroticism: n,
      openness_to_experience: o,
    };
  };

  const handleSaveOnly = () => {
    const profile = validate();
    if (profile) {
      onSaveProfile(profile, exams, prefs);
      setSuccessMessage("Student profile validated and saved successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleSaveAndProceed = () => {
    const profile = validate();
    if (profile) {
      onSaveProfile(profile, exams, prefs);
      onProceedToAssessment();
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Intro Box */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderRadius: "12px",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          marginBottom: "1.75rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.35rem" }}>
          Authentic Student Profile Intake
        </h2>
        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
          Please input your genuine academic record and assessment results. No sample or mock records are pre-filled.
          Fields flagged with <strong style={{ color: "var(--accent-teal-light)" }}>AMEO 2015 ML Feature</strong> feed the statistical salary tier prediction; fields marked with <strong style={{ color: "var(--accent-cyan)" }}>Career Context</strong> guide the agentic exploration layer.
        </p>
      </div>

      {successMessage && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "8px",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            color: "var(--success)",
            fontSize: "0.88rem",
            fontWeight: 600,
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {successMessage}
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "8px",
            backgroundColor: "rgba(244, 63, 94, 0.12)",
            border: "1px solid rgba(244, 63, 94, 0.35)",
            color: "var(--danger)",
            fontSize: "0.88rem",
            marginBottom: "1.5rem",
          }}
        >
          <strong>Please resolve the validation errors below:</strong>
          <ul style={{ marginTop: "0.4rem", paddingLeft: "1.25rem", fontSize: "0.82rem" }}>
            {Object.values(errors).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Sections */}
      <AcademicSection data={academic} onChange={handleAcademicChange} errors={errors} />
      <AptitudeSection data={aptitude} onChange={handleAptitudeChange} errors={errors} />
      <PersonalitySection data={personality} onChange={handlePersonalityChange} errors={errors} />
      <EntranceExamSection exams={exams} onExamsChange={setExams} />
      <CareerContextSection preferences={prefs} onPreferencesChange={setPrefs} />

      {/* Action Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.25rem 1.5rem",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "12px",
          border: "1px solid var(--border-subtle)",
          marginTop: "2rem",
          position: "sticky",
          bottom: "1rem",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <button type="button" className="btn btn-secondary" onClick={handleSaveOnly}>
          Save Profile Changes
        </button>

        <button type="button" className="btn btn-primary btn-lg" onClick={handleSaveAndProceed}>
          Proceed to Assessment & Pipeline
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
};
