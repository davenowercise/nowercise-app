import test from "node:test";
import assert from "node:assert/strict";
import { applySafetyFilters } from "../filters/applySafetyFilters";
import { applyPainFilters } from "../filters/applyPainFilters";
import type { GenerateTodayPlanInput, PlanVariant, Exercise } from "../types";

const baseInput: GenerateTodayPlanInput = {
  user: {
    userId: "test-user",
    safety: { phase: "POST_TREATMENT" },
    preferences: { equipmentAvailable: ["NONE"] },
  },
  checkin: {
    dateISO: "2026-02-09",
    fatigue010: 4,
    pain010: 3,
  },
  exercises: [],
};

function runSafety(exercises: Exercise[], variant: PlanVariant, overrides?: Partial<GenerateTodayPlanInput>) {
  const input = { ...baseInput, ...overrides, exercises };
  return applySafetyFilters(exercises, input, variant).exercises;
}

test("filters require lymph-safe when risk is high", () => {
  const exercises: Exercise[] = [
    { id: "1", name: "Safe", lymph_safe: "YES" },
    { id: "2", name: "Not safe", lymph_safe: "NO" },
  ];
  const result = runSafety(exercises, "MAIN", {
    user: { ...baseInput.user, safety: { phase: "POST_TREATMENT", lymphLoadRisk: "HIGH" } },
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "1");
});

test("filters require post-op shoulder safe when risk is set", () => {
  const exercises: Exercise[] = [
    { id: "1", name: "Safe", post_op_shoulder_safe: "YES" },
    { id: "2", name: "Not safe", post_op_shoulder_safe: "NO" },
  ];
  const result = runSafety(exercises, "MAIN", {
    user: { ...baseInput.user, safety: { phase: "POST_TREATMENT", postOpShoulderRisk: "LEFT" } },
  });
  assert.deepEqual(result.map(r => r.id), ["1"]);
});

test("filters exclude high balance demand when neuropathy risk is moderate/high", () => {
  const exercises: Exercise[] = [
    { id: "1", name: "Low balance", balance_demand: "LOW" },
    { id: "2", name: "High balance", balance_demand: "HIGH" },
  ];
  const result = runSafety(exercises, "MAIN", {
    user: { ...baseInput.user, safety: { phase: "POST_TREATMENT", neuropathyRisk: "MODERATE" } },
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "1");
});

test("filters require equipment to be NONE or CHAIR when availability missing", () => {
  const exercises: Exercise[] = [
    { id: "1", name: "None", equipment: "NONE" },
    { id: "2", name: "Chair", equipment: "CHAIR" },
    { id: "3", name: "Band", equipment: "BAND" },
  ];
  const result = runSafety(exercises, "MAIN", {
    user: { ...baseInput.user, preferences: undefined },
  });
  assert.deepEqual(result.map(r => r.id), ["2", "1"]);
});

test("intensity cap by variant limits reset to very low/low", () => {
  const exercises: Exercise[] = [
    { id: "1", name: "Very low", intensity_tier: "VERY_LOW" },
    { id: "2", name: "Moderate", intensity_tier: "MODERATE" },
    { id: "3", name: "Low", intensity_tier: "LOW" },
  ];
  const result = runSafety(exercises, "RESET");
  assert.deepEqual(result.map(r => r.id).sort(), ["1", "3"]);
});

test("pain filter removes strength and high intensity when pain is high", () => {
  const exercises: Exercise[] = [
    { id: "1", name: "Strength", type: "STRENGTH", intensity_tier: "LOW" },
    { id: "2", name: "Mobility", type: "MOBILITY", intensity_tier: "LOW" },
    { id: "3", name: "High", type: "MOBILITY", intensity_tier: "HIGH" },
  ];
  const result = applyPainFilters(exercises, 7).exercises;
  assert.deepEqual(result.map(r => r.id), ["2"]);
});
