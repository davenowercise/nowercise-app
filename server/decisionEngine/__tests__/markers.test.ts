import test from "node:test";
import assert from "node:assert/strict";
import { generateTodayPlan } from "../generateTodayPlan";
import type { GenerateTodayPlanInput } from "../types";

function buildInput(overrides?: Partial<GenerateTodayPlanInput>): GenerateTodayPlanInput {
  return {
    user: {
      userId: "marker-user",
      safety: {
        phase: "POST_TREATMENT",
        lymphLoadRisk: "LOW",
        postOpShoulderRisk: "NONE",
        boneRisk: "LOW",
        neuropathyRisk: "NONE",
      },
      preferences: { equipmentAvailable: ["NONE", "CHAIR"] },
    },
    checkin: {
      dateISO: "2026-02-11",
      fatigue010: 3,
      pain010: 2,
      painLocations: [],
    },
    exercises: [
      { id: "m1", name: "Sit to Stand Marker", tags: ["MARKER_SIT_TO_STAND"], type: "STRENGTH", region: "LOWER", intensity_tier: "VERY_LOW", equipment: "CHAIR", movement_pattern: "SQUAT" },
      { id: "m2", name: "Supported March Marker", tags: ["MARKER_SUPPORTED_MARCH"], type: "MOBILITY", region: "LOWER", intensity_tier: "VERY_LOW", equipment: "CHAIR", movement_pattern: "SUPPORTED_MARCH", balance_demand: "LOW" },
      { id: "m3", name: "Shoulder Raise Marker", tags: ["MARKER_SHOULDER_RAISE"], type: "MOBILITY", region: "UPPER", intensity_tier: "VERY_LOW", equipment: "NONE", movement_pattern: "SHOULDER_CAR" },
      { id: "s1", name: "Chair Squat", type: "STRENGTH", region: "LOWER", intensity_tier: "LOW", equipment: "CHAIR", movement_pattern: "SQUAT" },
      { id: "s2", name: "Wall Push", type: "STRENGTH", region: "UPPER", intensity_tier: "LOW", equipment: "NONE", movement_pattern: "PUSH" },
      { id: "b1", name: "Single Leg Balance", type: "MOBILITY", region: "LOWER", intensity_tier: "LOW", equipment: "NONE", movement_pattern: "SINGLE_BALANCE", balance_demand: "HIGH" },
      { id: "b2", name: "Supported March", type: "MOBILITY", region: "LOWER", intensity_tier: "LOW", equipment: "CHAIR", movement_pattern: "SUPPORTED_MARCH", balance_demand: "LOW" },
    ],
    ...overrides,
  };
}

test("marker SIT_TO_STAND HARD reduces sets in strength blocks", async () => {
  const input = buildInput({
    markerSignals: {
      latest: {
        SIT_TO_STAND: {
          userId: "marker-user",
          dateISO: "2026-02-10",
          markerKey: "SIT_TO_STAND",
          rating: "HARD",
          createdAtISO: "2026-02-10T10:00:00.000Z",
        },
      },
    },
  });

  const plan = await generateTodayPlan(input);
  const strengthBlocks = plan.blocks.filter(block => block.blockKey === "STRENGTH_PRIMARY");
  assert.ok(strengthBlocks.length > 0);
  for (const block of strengthBlocks) {
    for (const ex of block.exercises) {
      assert.ok(ex.dose.sets <= 1);
    }
  }
});

test("marker SUPPORTED_MARCH HARD prefers low balance demand and adds explainability", async () => {
  const input = buildInput({
    markerSignals: {
      latest: {
        SUPPORTED_MARCH: {
          userId: "marker-user",
          dateISO: "2026-02-10",
          markerKey: "SUPPORTED_MARCH",
          rating: "HARD",
          side: "RIGHT",
          createdAtISO: "2026-02-10T10:00:00.000Z",
        },
      },
    },
  });

  const plan = await generateTodayPlan(input);
  const allExercises = plan.blocks.flatMap(block => block.exercises);
  const hasHighBalance = allExercises.some(ex => ex.name === "Single Leg Balance");
  assert.equal(hasHighBalance, false);
  assert.ok(plan.explain.selectionReasons.some(reason => reason.toLowerCase().includes("extra support for right")));
});

test("determinism with marker signals", async () => {
  const input = buildInput({
    markerSignals: {
      latest: {
        SUPPORTED_MARCH: {
          userId: "marker-user",
          dateISO: "2026-02-10",
          markerKey: "SUPPORTED_MARCH",
          rating: "HARD",
          side: "RIGHT",
          createdAtISO: "2026-02-10T10:00:00.000Z",
        },
      },
    },
  });

  const planA = await generateTodayPlan(input);
  const planB = await generateTodayPlan(input);
  assert.deepEqual(planA, planB);
});
