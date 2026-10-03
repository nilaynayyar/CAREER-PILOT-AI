/**
 * CareerPilot AI Mobile — Root Application Entry Point
 * Responsive for Phones, Tablets, and iPads.
 */

import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  FullCareerPilotReport,
  HealthStatus,
  OnetOccupation,
  StudentProfile,
} from "./src/types/careerpilot";
import { mobileApi } from "./src/services/api";
import {
  AboutScreen,
  AssessmentScreen,
  CareerExplorationScreen,
  DashboardScreen,
  MLOutcomeScreen,
  ModelExplanationScreen,
  ProfileScreen,
  ProjectsScreen,
  ReportScreen,
  RoadmapScreen,
  SkillGapScreen,
} from "./src/screens/Screens";

const EMPTY_PROFILE: StudentProfile = {
  gender: "m",
  degree: "B.Tech/B.E.",
  specialization: "computer engineering",
  college_tier: 1,
  college_city_tier: 1,
  tenth_percentage: 0,
  twelfth_percentage: 0,
  college_gpa: 0,
  english_score: 0,
  logical_score: 0,
  quant_score: 0,
  domain_score: 0,
  conscientiousness: 0,
  agreeableness: 0,
  extraversion: 0,
  neuroticism: 0,
  openness: 0,
};

export default function App() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [activeScreen, setActiveScreen] = useState<string>("dashboard");
  const [profile, setProfile] = useState<StudentProfile>(EMPTY_PROFILE);
  const [report, setReport] = useState<FullCareerPilotReport | null>(null);
  const [occupations, setOccupations] = useState<OnetOccupation[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Initial health check & occupations fetch
    mobileApi
      .getHealth()
      .then((h) => {
        setHealth(h);
        setConnectionError(null);
      })
      .catch((err) => {
        setConnectionError(err.message);
      });

    mobileApi
      .getOccupations()
      .then((data) => setOccupations(data))
      .catch(() => {});
  }, []);

  const screenProps = {
    profile,
    setProfile,
    report,
    setReport,
    occupations,
    health,
    onNavigate: setActiveScreen,
    isTablet,
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case "dashboard":
        return <DashboardScreen {...screenProps} />;
      case "profile":
        return <ProfileScreen {...screenProps} />;
      case "assessment":
        return <AssessmentScreen {...screenProps} />;
      case "ml_outcome":
        return <MLOutcomeScreen {...screenProps} />;
      case "model_explanation":
        return <ModelExplanationScreen {...screenProps} />;
      case "career_exploration":
      case "careers":
        return <CareerExplorationScreen {...screenProps} />;
      case "skill_gap":
        return <SkillGapScreen {...screenProps} />;
      case "roadmap":
        return <RoadmapScreen {...screenProps} />;
      case "projects":
        return <ProjectsScreen {...screenProps} />;
      case "report":
        return <ReportScreen {...screenProps} />;
      case "about":
        return <AboutScreen {...screenProps} />;
      default:
        return <DashboardScreen {...screenProps} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />

      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>CareerPilot</Text>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
        </View>

        <View style={styles.topRightRow}>
          {connectionError ? (
            <View style={styles.offlinePill}>
              <Text style={styles.offlinePillText}>Backend Offline</Text>
            </View>
          ) : (
            <View style={styles.onlinePill}>
              <Text style={styles.onlinePillText}>
                {health?.gemini_available ? "Online" : "Fallback"}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setActiveScreen("about")}
          >
            <Text style={styles.headerBtnText}>About</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline Alert Banner */}
      {connectionError && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertBannerText}>
            Cannot connect to CareerPilot backend: {mobileApi.getApiUrl()}.
          </Text>
        </View>
      )}

      {/* Main Screen Body */}
      <View style={styles.body}>{renderActiveScreen()}</View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {[
          { id: "dashboard", label: "Home" },
          { id: "profile", label: "Profile" },
          { id: "assessment", label: "Assess" },
          { id: "careers", label: "Careers" },
          { id: "report", label: "Report" },
        ].map((tab) => {
          const isActive =
            activeScreen === tab.id ||
            (tab.id === "careers" && activeScreen === "career_exploration") ||
            (tab.id === "assess" &&
              (activeScreen === "ml_outcome" ||
                activeScreen === "skill_gap" ||
                activeScreen === "roadmap" ||
                activeScreen === "projects"));

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.navTab, isActive && styles.navTabActive]}
              onPress={() => setActiveScreen(tab.id)}
            >
              <Text
                style={[styles.navLabel, isActive && styles.navLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  topBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#30363d",
    backgroundColor: "#161b22",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandTitle: {
    color: "#f0f6fc",
    fontSize: 18,
    fontWeight: "800",
  },
  aiBadge: {
    backgroundColor: "#0d9488",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  topRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  onlinePill: {
    backgroundColor: "rgba(35, 134, 54, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  onlinePillText: {
    color: "#3fb950",
    fontSize: 11,
    fontWeight: "600",
  },
  offlinePill: {
    backgroundColor: "rgba(248, 81, 73, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  offlinePillText: {
    color: "#f85149",
    fontSize: 11,
    fontWeight: "600",
  },
  headerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 44,
    justifyContent: "center",
  },
  headerBtnText: {
    color: "#8b949e",
    fontSize: 13,
    fontWeight: "600",
  },
  alertBanner: {
    backgroundColor: "rgba(248, 81, 73, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f85149",
  },
  alertBannerText: {
    color: "#f85149",
    fontSize: 12,
    fontWeight: "600",
  },
  body: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: "row",
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#30363d",
    backgroundColor: "#161b22",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navTab: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
  },
  navTabActive: {
    borderTopWidth: 2,
    borderTopColor: "#0d9488",
  },
  navLabel: {
    color: "#8b949e",
    fontSize: 12,
    fontWeight: "600",
  },
  navLabelActive: {
    color: "#14b8a6",
  },
});
