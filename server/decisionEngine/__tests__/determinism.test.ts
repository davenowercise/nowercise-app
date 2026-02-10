import test from "node:test";
import assert from "node:assert/strict";
import { generateTodayPlan } from "../generateTodayPlan";
import type { GenerateTodayPlanInput } from "../types";

test("generateTodayPlan is deterministic for identical inputs", async () => {
  const fixedNow = new Date("2026-02-09T00:00:00.000Z");
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

  const input: GenerateTodayPlanInput = {
    user: {
      userId: "test-user",
      safety: { phase: "POST_TREATMENT" },
      preferences: { equipmentAvailable: ["NONE"] },
    },
    checkin: {
      dateISO: "2026-02-09",
      fatigue010: 3,
      pain010: 2,
      painLocations: ["SHOULDER"],
    },
    exercises: [
      { id: "1", name: "Breathing Reset", type: "BREATHING", region: "UPPER", intensity_tier: "VERY_LOW", equipment: "NONE", phase: "ALL" },
      { id: "2", name: "Gentle Shoulder Mobility", type: "MOBILITY", region: "UPPER", intensity_tier: "LOW", equipment: "NONE", phase: "ALL", movement_pattern: "SHOULDER_CAR" },
      { id: "3", name: "Seated March", type: "MOBILITY", region: "LOWER", intensity_tier: "LOW", equipment: "CHAIR", phase: "ALL", movement_pattern: "MARCH" },
      { id: "4", name: "Wall Push", type: "STRENGTH", region: "UPPER", intensity_tier: "LOW", equipment: "NONE", phase: "ALL", movement_pattern: "PUSH" },
      { id: "5", name: "Chair Sit to Stand", type: "STRENGTH", region: "LOWER", intensity_tier: "LOW", equipment: "CHAIR", phase: "ALL", movement_pattern: "SQUAT" },
    ],
  };

  const first = await generateTodayPlan(input);
  const second = await generateTodayPlan(input);

  assert.deepEqual(first, second);

  // Restore Date
  (globalThis as any).Date = RealDate;
});
