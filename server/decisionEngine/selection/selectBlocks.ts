import templates from "../rules/blockTemplates.json";
import type { PlanVariant, WorkoutBlock } from "../types";

type BlockTemplate = {
  blockKey: string;
  title: string;
  intent: string;
  exerciseCount: number;
};

export function selectBlocks(variant: PlanVariant): Array<Omit<WorkoutBlock, "exercises"> & { exerciseCount: number }> {
  const blocks = (templates as Record<PlanVariant, BlockTemplate[]>)[variant] || [];
  return blocks.map(block => ({
    blockKey: block.blockKey,
    title: block.title,
    intent: block.intent,
    exerciseCount: block.exerciseCount,
  }));
}
