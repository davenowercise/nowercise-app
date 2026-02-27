import test from "node:test";
import assert from "node:assert/strict";
import { generateTodayPlan } from "../generateTodayPlan";
import type { GenerateTodayPlanInput } from "../types";

function buildInput(overrides?: Partial<GenerateTodayPlanInput>): GenerateTodayPlanInput {
  return {
    user: {
      userId: "marker-reps-user",
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
      dateISO: "2026-02-12",
      fatigue010: 3,
      pain010: 2,
      painLocations: [],
    },
    exercises: [
      { id: "m1", name: "Sit to Stand Marker", tags: ["MARKER_SIT_TO_STAND"], type: "STRENGTH", region: "LOWER", intensity_tier: "VERY_LOW", equipment: "CHAIR", movement_pattern: "SQUAT" },
      { id: "m2", name: "Supported March Marker", tags: ["MARKER_SUPPORTED_MARCH"], type: "MOBILITY", region: "LOWER", intensity_tier: "VERY_LOW", equipment: "CHAIR", movement_pattern: "SUPPORTED_MARCH", balance_demand: "LOW" },
      { id: "s1", name: "Chair Squat", type: "STRENGTH", region: "LOWER", intensity_tier: "LOW", equipment: "CHAIR", movement_pattern: "SQUAT" },
      { id: "s2", name: "Wall Push", type: "STRENGTH", region: "UPPER", intensity_tier: "LOW", equipment: "NONE", movement_pattern: "PUSH" },
    ],
    ...overrides,
  };
}

test("comfortableReps <= 2 reduces strength sets", async () => {
  const input = buildInput({
    markerSignals: {
      latest: {
        SIT_TO_STAND: {
          userId: "marker-reps-user",
          dateISO: "2026-02-11",
          markerKey: "SIT_TO_STAND",
          rating: "OK",
          comfortableReps: 1,
          createdAtISO: "2026-02-11T10:00:00.000Z",
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

test("comfortableReps 5 + EASY allows progression bias within caps", async () => {
  const input = buildInput({
    markerSignals: {
      latest: {
        SIT_TO_STAND: {
          userId: "marker-reps-user",
          dateISO: "2026-02-11",
          markerKey: "SIT_TO_STAND",
          rating: "EASY",
          comfortableReps: 5,
          createdAtISO: "2026-02-11T10:00:00.000Z",
        },
      },
    },
  });

  const plan = await generateTodayPlan(input);
  assert.ok(plan.explain.selectionReasons.some(reason => reason.toLowerCase().includes("strength progression allowed")));
});

test("determinism with comfortable reps", async () => {
  const fixedNow = new Date("2026-02-12T16:51:57.976Z");
  const RealDate = Date;

  // Freeze time for deterministic meta.generatedAtISO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Date = class extends RealDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        return new RealDate(fixedNow);
      }
      return new RealDate(...args);
    }
    static now() {
      return fixedNow.getTime();
    }
  };

  try {
    const input = buildInput({
      markerSignals: {
        latest: {
          SIT_TO_STAND: {
            userId: "marker-reps-user",
            dateISO: "2026-02-11",
            markerKey: "SIT_TO_STAND",
            rating: "EASY",
            comfortableReps: 5,
            createdAtISO: "2026-02-11T10:00:00.000Z",
          },
        },
      },
    });

    const planA = await generateTodayPlan(input);
    const planB = await generateTodayPlan(input);
    assert.deepEqual(planA, planB);
  } finally {
    (globalThis as any).Date = RealDate;
  }
});

test("undefined comfortableReps does not change behavior", async () => {
  const input = buildInput({
    markerSignals: {
      latest: {
        SIT_TO_STAND: {
          userId: "marker-reps-user",
          dateISO: "2026-02-11",
          markerKey: "SIT_TO_STAND",
          rating: "OK",
          createdAtISO: "2026-02-11T10:00:00.000Z",
        },
      },
    },
  });

  const plan = await generateTodayPlan(input);
  assert.ok(plan.blocks.length > 0);
});
