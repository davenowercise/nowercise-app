export type CheckinMode = "REST" | "EASIER" | "MAIN";
export type LastAdjustment = "REST" | "LIGHTER" | "SAME" | "GENTLE_BUILD";

export type DayInput = {
  day: string; // YYYY-MM-DD (or any label)
  note?: string;

  // What the user reports today:
  checkinMode: CheckinMode;

  // What the user reported AFTER last session (the previous session's reflection)
  // This is what you store in user_adaptive_state, and what becomes your cap for today.
  lastAdjustmentFromPrevSession?: LastAdjustment;

  // Optional expectations (assertions) for this day
  expectMode?: CheckinMode;
  expectNotMode?: CheckinMode[];
  expectReasonIncludes?: string[]; // if your engine returns reasons/explanations
};

export type Scenario = {
  id: string;
  clientLabel: string;
  description: string;
  days: DayInput[];
};

/**
 * These scenarios are designed to stress:
 * 1) conservative coupling: mode = min(checkinMode, capFromLastSession)
 * 2) no "stuck in REST" bug once symptoms improve
 * 3) chemo crash / infection crash / neuropathy flare handling
 * 4) "pushy" clients + those who want to train harder (should still be bounded)
 */

export const scenarios: Scenario[] = [
  {
    id: "andrea_hcc_tace_fluctuating_fatigue",
    clientLabel: "Andrea (HCC, post-TACE)",
    description:
      "Unpredictable systemic fatigue. Goal is stability and confidence, not fitness. Must avoid spikes and avoid abdominal strain. Expect frequent REST/EASIER days and conservative caps.",
    days: [
      { day: "D1", note: "Post-treatment dip", checkinMode: "REST", expectMode: "REST" },
      { day: "D2", note: "Still wiped", checkinMode: "REST", expectMode: "REST" },
      { day: "D3", note: "Slightly better", checkinMode: "EASIER", expectMode: "EASIER" },

      // If yesterday’s session felt too hard (even if check-in says MAIN),
      // cap must hold at EASIER.
      {
        day: "D4",
        note: "Mentally wants to do more, body fragile",
        checkinMode: "MAIN",
        lastAdjustmentFromPrevSession: "LIGHTER",
        expectMode: "EASIER",
      },

      // A “good day” should allow MAIN only if cap permits:
      {
        day: "D5",
        note: "Good day but still cautious",
        checkinMode: "MAIN",
        lastAdjustmentFromPrevSession: "SAME",
        expectMode: "MAIN",
      },

      // Crash day:
      { day: "D6", note: "Flu-like fatigue", checkinMode: "REST", expectMode: "REST" },

      // Recovery:
      { day: "D7", note: "Back to gentle", checkinMode: "EASIER", expectMode: "EASIER" },
      {
        day: "D8",
        note: "Wants to progress but should be bounded",
        checkinMode: "MAIN",
        lastAdjustmentFromPrevSession: "SAME",
        expectMode: "MAIN",
      },
      {
        day: "D9",
        note: "Overdid it yesterday -> should cap today",
        checkinMode: "MAIN",
        lastAdjustmentFromPrevSession: "LIGHTER",
        expectMode: "EASIER",
      },
      { day: "D10", note: "Stabilising", checkinMode: "EASIER", expectMode: "EASIER" },
    ],
  },

  {
    id: "kate_postop_to_chemo_ramp",
    clientLabel: "Kate (post-mastectomy, impending chemo)",
    description:
      "Early post-op stiffness + nerve symptoms; later chemo cycles. Must avoid aggressive upper body loading early; mode should reflect recovery and chemo dips.",
    days: [
      { day: "D1", note: "Post-op fragile", checkinMode: "EASIER", expectMode: "EASIER" },
      { day: "D2", note: "Bad sleep / stiff", checkinMode: "EASIER", expectMode: "EASIER" },
      { day: "D3", note: "Better day", checkinMode: "MAIN", expectMode: "MAIN" },

      // Chemo starts – expect crash:
      { day: "D4", note: "Chemo day / immediate fatigue", checkinMode: "REST", expectMode: "REST" },
      { day: "D5", note: "Toxic week continues", checkinMode: "REST", expectMode: "REST" },
      { day: "D6", note: "Still rough", checkinMode: "EASIER", expectMode: "EASIER" },

      // If she reports session was too easy, only then allow gentle build (but still MAIN cap)
      {
        day: "D7",
        note: "Feels like she could do a touch more",
        checkinMode: "MAIN",
        lastAdjustmentFromPrevSession: "GENTLE_BUILD",
        expectMode: "MAIN",
      },

      // Another dip:
      { day: "D8", note: "Chemo cycle dip again", checkinMode: "REST", expectMode: "REST" },
      { day: "D9", note: "Coming back", checkinMode: "EASIER", expectMode: "EASIER" },
      { day: "D10", note: "OK-ish", checkinMode: "MAIN", expectMode: "MAIN" },
    ],
  },

  {
    id: "wendy_lung_copd_heart_oa_pain_flares",
    clientLabel: "Wendy (lung cancer + COPD + LV failure + OA)",
    description:
      "Breath + cardiac constraints and knee/back OA. Right leg pain flares must suppress MAIN. If check-in says MAIN but yesterday was too hard/painful, cap to EASIER.",
    days: [
      { day: "D1", note: "Baseline gentle", checkinMode: "EASIER", expectMode: "EASIER" },
      { day: "D2", note: "Feels okay", checkinMode: "MAIN", expectMode: "MAIN" },

      {
        day: "D3",
        note: "Right leg flare -> even if motivated, should not be MAIN",
        checkinMode: "EASIER",
        expectNotMode: ["MAIN"],
      },

      {
        day: "D4",
        note: "Says she can do MAIN but yesterday was too hard -> cap must hold",
        checkinMode: "MAIN",
        lastAdjustmentFromPrevSession: "LIGHTER",
        expectMode: "EASIER",
      },

      { day: "D5", note: "Very tired / sleep broken", checkinMode: "REST", expectMode: "REST" },
      { day: "D6", note: "Back to chair-based", checkinMode: "EASIER", expectMode: "EASIER" },
    ],
  },

  {
    id: "reg_shingles_crash_then_rebuild",
    clientLabel: "Reg (CLL + heart disease + T2D; shingles crash)",
    description:
      "Huge progress then shingles causes abrupt crash (REST/EASIER), then gradual return. Test: engine must not keep him stuck in REST once check-ins recover.",
    days: [
      { day: "D1", note: "Pre-shingles strong", checkinMode: "MAIN", expectMode: "MAIN" },
      { day: "D2", note: "Pre-shingles strong", checkinMode: "MAIN", expectMode: "MAIN" },

      { day: "D3", note: "Shingles hits", checkinMode: "REST", expectMode: "REST" },
      { day: "D4", note: "Still severe pain", checkinMode: "REST", expectMode: "REST" },
      { day: "D5", note: "Slightly better", checkinMode: "EASIER", expectMode: "EASIER" },

      // Recovery begins:
      { day: "D6", note: "Can move again", checkinMode: "EASIER", expectMode: "EASIER" },
      {
        day: "D7",
        note: "Feels good, but if prior session capped LIGHTER, should still cap",
        checkinMode: "MAIN",
        lastAdjustmentFromPrevSession: "LIGHTER",
        expectMode: "EASIER",
      },
      {
        day: "D8",
        note: "Cap released after stable day",
        checkinMode: "MAIN",
        lastAdjustmentFromPrevSession: "SAME",
        expectMode: "MAIN",
      },
    ],
  },

  {
    id: "rosie_bone_mets_infection_then_return",
    clientLabel: "Rosie (breast cancer w/ bone mets; infections + workload stress)",
    description:
      "Periods of illness (prob Covid) + fatigue, then return. Must avoid aggressive bounce-back (no MAIN on REST days; cap must prevent jumping too hard right after infection).",
    days: [
      { day: "D1", note: "Baseline ok", checkinMode: "MAIN", expectMode: "MAIN" },

      { day: "D2", note: "Illness begins", checkinMode: "EASIER", expectMode: "EASIER" },
      { day: "D3", note: "Very ill", checkinMode: "REST", expectMode: "REST" },
      { day: "D4", note: "Still ill", checkinMode: "REST", expectMode: "REST" },

      // First day back: should usually be EASIER even if motivated
      {
        day: "D5",
        note: "Coming back but should not rebound too hard",
        checkinMode: "MAIN",
        lastAdjustmentFromPrevSession: "LIGHTER",
        expectMode: "EASIER",
      },

      { day: "D6", note: "Better", checkinMode: "EASIER", expectMode: "EASIER" },
      { day: "D7", note: "Stable", checkinMode: "MAIN", lastAdjustmentFromPrevSession: "SAME", expectMode: "MAIN" },
    ],
  },
];
