import { Block } from './blockTypes';

export const BLOCKS_CATALOG: Block[] = [
  {
    id: "post_rebuild_strength_A",
    title: "Post-Treatment Strength Rebuild A",
    phase: "POST_TREATMENT",
    stageMin: "EARLY",
    stageMax: "LATE",
    daysPerWeekTarget: 3,
    sessionType: "STRENGTH",
    exercises: [
      {
        id: "sit_to_stand",
        name: "Sit to Stand",
        setRange: { min: 2, max: 3 },
        repRange: { min: 8, max: 12 },
        notes: "Use armrests for support if needed"
      },
      {
        id: "wall_push",
        name: "Wall Push-Aways",
        setRange: { min: 2, max: 3 },
        repRange: { min: 8, max: 12 },
        notes: "Keep core engaged, breathe steadily"
      },
      {
        id: "band_row",
        name: "Resistance Band Row",
        setRange: { min: 2, max: 3 },
        repRange: { min: 10, max: 15 },
        notes: "Light resistance, focus on shoulder blade squeeze"
      },
      {
        id: "glute_bridge",
        name: "Glute Bridge",
        setRange: { min: 2, max: 3 },
        repRange: { min: 8, max: 12 },
        notes: "Hold briefly at top"
      },
      {
        id: "farmers_carry",
        name: "Light Carry (Walk with Weights)",
        setRange: { min: 2, max: 3 },
        repRange: { min: 20, max: 30 },
        notes: "Reps = steps. Use light weights or household items"
      },
      {
        id: "step_up_optional",
        name: "Step-Up (Optional)",
        setRange: { min: 1, max: 2 },
        repRange: { min: 6, max: 10 },
        notes: "Use a low step, hold support if needed"
      }
    ]
  },
  {
    id: "post_mobility_reset",
    title: "Mobility Reset (Recovery)",
    phase: "POST_TREATMENT",
    daysPerWeekTarget: 1,
    sessionType: "RECOVERY",
    isRecoveryBlock: true,
    exercises: [
      {
        id: "gentle_breathing",
        name: "Calm Breathing",
        setRange: { min: 1, max: 1 },
        repRange: { min: 5, max: 10 },
        notes: "Deep belly breaths, 4 seconds in, 6 seconds out"
      },
      {
        id: "seated_twist",
        name: "Gentle Seated Twist",
        setRange: { min: 1, max: 2 },
        repRange: { min: 5, max: 8 },
        notes: "Each side. Move slowly, no forcing"
      },
      {
        id: "neck_rolls",
        name: "Gentle Neck Rolls",
        setRange: { min: 1, max: 1 },
        repRange: { min: 3, max: 5 },
        notes: "Each direction. Slow and controlled"
      },
      {
        id: "shoulder_circles",
        name: "Shoulder Circles",
        setRange: { min: 1, max: 2 },
        repRange: { min: 8, max: 12 },
        notes: "Small circles, forward and backward"
      },
      {
        id: "ankle_circles",
        name: "Ankle Circles",
        setRange: { min: 1, max: 1 },
        repRange: { min: 8, max: 10 },
        notes: "Each direction, each foot"
      }
    ]
  },
  {
    id: "prehab_foundation",
    title: "Prehab Foundation",
    phase: "PREHAB",
    stageMin: "EARLY",
    stageMax: "LATE",
    daysPerWeekTarget: 3,
    sessionType: "STRENGTH",
    exercises: [
      {
        id: "diaphragm_breathing",
        name: "Diaphragmatic Breathing",
        setRange: { min: 1, max: 2 },
        repRange: { min: 8, max: 12 },
        notes: "Prepare breathing muscles for surgery"
      },
      {
        id: "seated_marches",
        name: "Seated Marches",
        setRange: { min: 2, max: 3 },
        repRange: { min: 10, max: 15 },
        notes: "Build baseline leg strength"
      },
      {
        id: "wall_push_light",
        name: "Wall Push-Aways (Light)",
        setRange: { min: 2, max: 3 },
        repRange: { min: 8, max: 12 },
        notes: "Upper body preparation"
      },
      {
        id: "standing_heel_raises",
        name: "Standing Heel Raises",
        setRange: { min: 2, max: 3 },
        repRange: { min: 10, max: 15 },
        notes: "Hold support for balance"
      },
      {
        id: "arm_raises",
        name: "Arm Raises (Shoulder Mobility)",
        setRange: { min: 2, max: 2 },
        repRange: { min: 8, max: 12 },
        notes: "Maintain range of motion pre-surgery"
      }
    ]
  },
  {
    id: "prehab_recovery",
    title: "Prehab Recovery Day",
    phase: "PREHAB",
    daysPerWeekTarget: 1,
    sessionType: "RECOVERY",
    isRecoveryBlock: true,
    exercises: [
      {
        id: "gentle_walking",
        name: "Gentle Walking",
        setRange: { min: 1, max: 1 },
        repRange: { min: 5, max: 10 },
        notes: "Minutes of easy walking"
      },
      {
        id: "breathing_relaxation",
        name: "Relaxation Breathing",
        setRange: { min: 1, max: 1 },
        repRange: { min: 5, max: 8 },
        notes: "Focus on calm, steady breathing"
      },
      {
        id: "gentle_stretches",
        name: "Gentle Full Body Stretches",
        setRange: { min: 1, max: 1 },
        repRange: { min: 5, max: 8 },
        notes: "Light stretching, no strain"
      }
    ]
  },
  {
    id: "in_treatment_maintain",
    title: "In-Treatment Gentle Movement",
    phase: "IN_TREATMENT",
    stageMin: "EARLY",
    stageMax: "LATE",
    daysPerWeekTarget: 2,
    sessionType: "MOBILITY",
    exercises: [
      {
        id: "seated_marches_gentle",
        name: "Gentle Seated Marches",
        setRange: { min: 1, max: 2 },
        repRange: { min: 8, max: 12 },
        notes: "Keep movement light and controlled"
      },
      {
        id: "arm_circles_small",
        name: "Small Arm Circles",
        setRange: { min: 1, max: 2 },
        repRange: { min: 8, max: 10 },
        notes: "Within comfortable range only"
      },
      {
        id: "ankle_pumps",
        name: "Ankle Pumps",
        setRange: { min: 1, max: 2 },
        repRange: { min: 10, max: 15 },
        notes: "Helps with circulation"
      },
      {
        id: "gentle_breathing",
        name: "Calm Breathing",
        setRange: { min: 1, max: 1 },
        repRange: { min: 5, max: 8 },
        notes: "Relaxation focus"
      }
    ]
  },
  {
    id: "in_treatment_recovery",
    title: "In-Treatment Recovery",
    phase: "IN_TREATMENT",
    daysPerWeekTarget: 1,
    sessionType: "RECOVERY",
    isRecoveryBlock: true,
    exercises: [
      {
        id: "rest_breathing",
        name: "Restful Breathing",
        setRange: { min: 1, max: 1 },
        repRange: { min: 5, max: 10 },
        notes: "Focus on relaxation, no effort required"
      },
      {
        id: "gentle_neck_release",
        name: "Gentle Neck Release",
        setRange: { min: 1, max: 1 },
        repRange: { min: 3, max: 5 },
        notes: "Very slow, minimal movement"
      },
      {
        id: "hand_squeezes",
        name: "Gentle Hand Squeezes",
        setRange: { min: 1, max: 1 },
        repRange: { min: 8, max: 12 },
        notes: "Maintain grip strength gently"
      }
    ]
  }
];

const STAGE_ORDER: Record<string, number> = { EARLY: 0, MID: 1, LATE: 2 };

function stageMatches(block: Block, stage: string): boolean {
  const stageNum = STAGE_ORDER[stage] ?? 0;
  const minNum = block.stageMin ? STAGE_ORDER[block.stageMin] : 0;
  const maxNum = block.stageMax ? STAGE_ORDER[block.stageMax] : 2;
  return stageNum >= minNum && stageNum <= maxNum;
}

export function getBlockById(blockId: string): Block | undefined {
  return BLOCKS_CATALOG.find(b => b.id === blockId);
}

export function getBlocksForPhase(phase: string): Block[] {
  return BLOCKS_CATALOG.filter(b => b.phase === phase);
}

export function getBlocksForPhaseAndStage(phase: string, stage: string): Block[] {
  return BLOCKS_CATALOG.filter(b => 
    b.phase === phase && 
    !b.isRecoveryBlock && 
    stageMatches(b, stage)
  );
}

export function getRecoveryBlockForPhase(phase: string): Block | undefined {
  return BLOCKS_CATALOG.find(b => b.phase === phase && b.isRecoveryBlock);
}

export function getDefaultBlockForPhase(phase: string): Block | undefined {
  return BLOCKS_CATALOG.find(b => b.phase === phase && !b.isRecoveryBlock);
}

export function getDefaultBlockForPhaseAndStage(phase: string, stage: string): Block | undefined {
  const stageBlocks = getBlocksForPhaseAndStage(phase, stage);
  return stageBlocks.length > 0 ? stageBlocks[0] : getDefaultBlockForPhase(phase);
}
