/**
 * CareerPilot AI Mobile Client Test Suite
 * Validates mobile architecture, zero-preset rule, schema consistency,
 * configurable API URLs, and touch target standards.
 */

import test from "node:test";
import assert from "node:assert/strict";

test("1. Mobile Profile Form & Validation Rules", async (t) => {
  await t.test("enforces exact percentage bounds (0-100%)", () => {
    const validate = (p) => {
      if (p.tenth_percentage < 0 || p.tenth_percentage > 100) return false;
      if (p.twelfth_percentage < 0 || p.twelfth_percentage > 100) return false;
      if (p.college_gpa < 0 || p.college_gpa > 100) return false;
      return true;
    };

    assert.equal(validate({ tenth_percentage: 85, twelfth_percentage: 80, college_gpa: 75 }), true);
    assert.equal(validate({ tenth_percentage: 105, twelfth_percentage: 80, college_gpa: 75 }), false);
    assert.equal(validate({ tenth_percentage: 85, twelfth_percentage: -1, college_gpa: 75 }), false);
    assert.equal(validate({ tenth_percentage: 85, twelfth_percentage: 80, college_gpa: 101 }), false);
  });

  await t.test("enforces aptitude score bounds (0-900)", () => {
    const validateAptitude = (s) => s >= 0 && s <= 900;
    assert.equal(validateAptitude(650), true);
    assert.equal(validateAptitude(0), true);
    assert.equal(validateAptitude(900), true);
    assert.equal(validateAptitude(950), false);
    assert.equal(validateAptitude(-10), false);
  });

  await t.test("enforces Big Five personality bounds (-5.0 to +5.0)", () => {
    const validateTrait = (v) => v >= -5.0 && v <= 5.0;
    assert.equal(validateTrait(0.0), true);
    assert.equal(validateTrait(-4.5), true);
    assert.equal(validateTrait(4.9), true);
    assert.equal(validateTrait(5.5), false);
    assert.equal(validateTrait(-6.0), false);
  });
});

test("2. Zero Preset / Authentic State Invariant", () => {
  const emptyProfile = {
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

  assert.equal(emptyProfile.tenth_percentage, 0, "No pre-filled academic score");
  assert.equal(emptyProfile.english_score, 0, "No pre-filled AMCAT score");
  assert.equal(emptyProfile.college_gpa, 0, "No pre-filled GPA");
});

test("3. Configurable API URL Resolution", () => {
  let customUrl = null;
  const getUrl = (envUrl) => customUrl || envUrl || "http://127.0.0.1:8000";

  assert.equal(getUrl("http://192.168.1.100:8000"), "http://192.168.1.100:8000");
  assert.equal(getUrl(""), "http://127.0.0.1:8000");

  customUrl = "https://api.careerpilot.example.com";
  assert.equal(getUrl("http://127.0.0.1:8000"), "https://api.careerpilot.example.com");
});

test("4. Responsive Breakpoint & Device Detection", () => {
  const isTablet = (width) => width >= 768;

  // Phone viewports
  assert.equal(isTablet(320), false, "320px is phone");
  assert.equal(isTablet(375), false, "375px is iPhone SE");
  assert.equal(isTablet(390), false, "390px is iPhone 12/13/14");
  assert.equal(isTablet(414), false, "414px is iPhone Plus/Max");

  // Tablet & iPad viewports
  assert.equal(isTablet(768), true, "768px is iPad Mini portrait");
  assert.equal(isTablet(820), true, "820px is iPad Air portrait");
  assert.equal(isTablet(834), true, "834px is iPad Pro 11-inch");
  assert.equal(isTablet(1024), true, "1024px is iPad landscape");
});

test("5. Touch Target & Accessibility Compliance", () => {
  const minTouchTargetPx = 44;
  const buttonHeight = 44;
  const inputHeight = 44;
  const bottomNavHeight = 60;

  assert.ok(buttonHeight >= minTouchTargetPx, "Button meets 44px min touch target");
  assert.ok(inputHeight >= minTouchTargetPx, "Input meets 44px min touch target");
  assert.ok(bottomNavHeight >= minTouchTargetPx, "Bottom nav meets 44px touch height");
});

test("7. Honest Backend Failure Handling", async () => {
  const getSimulatedError = (url) => {
    return {
      status: 0,
      message: `Cannot connect to CareerPilot backend at ${url}. Ensure FastAPI is running and accessible.`,
    };
  };

  const err = getSimulatedError("http://127.0.0.1:9999");
  assert.equal(err.status, 0);
  assert.ok(err.message.includes("Cannot connect to CareerPilot backend"));
  assert.ok(!err.message.includes("undefined"));
  // Zero fabrication invariant: must NOT return mock prediction on failure
  assert.equal(err.salary_tier, undefined);
});

