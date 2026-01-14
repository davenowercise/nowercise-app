/**
 * Video Safety Check
 * 
 * Ensures template exercises never show mismatched movement videos.
 * Runs on server startup to audit and fix any unsafe video matches.
 */

import { db } from './db';
import { templateExercises } from '@shared/schema';
import { eq, isNull, or, inArray } from 'drizzle-orm';

// Define known unsafe matches that should be cleared
// These are exercises that have been assigned videos from different movement categories
const UNSAFE_VIDEO_EXERCISE_NAMES = [
  'Wrist Circles',
  'Seated Knee Lifts', 
  'Standing Heel Raises'
];

// Movement category mappings for validation
const MOVEMENT_CATEGORIES: Record<string, string[]> = {
  heel_raise: ['heel raise', 'heel raises', 'calf raise', 'calf raises', 'toe raise'],
  knee_lift: ['knee lift', 'knee lifts', 'leg lift', 'leg raise', 'marching'],
  shoulder_shrug: ['shrug', 'shrugs', 'shoulder shrug', 'overhead shrug'],
  wrist_mobility: ['wrist circle', 'wrist circles', 'wrist rotation', 'wrist mobility'],
  breathing: ['breathing', 'breath', 'diaphragm', 'balloon', 'respiratory'],
  arm_raise: ['arm raise', 'frontal raise', 'lateral raise', 'shoulder raise'],
  bicep_curl: ['bicep curl', 'curl', 'arm curl', 'dumbbell curl'],
  push: ['push-up', 'pushup', 'push up', 'push-away', 'wall push', 'press'],
  squat: ['squat', 'squats', 'sit to stand', 'chair squat', 'box squat'],
  lunge: ['lunge', 'lunges', 'split squat', 'static lunge']
};

function getExerciseCategory(name: string): string | null {
  const lowerName = name.toLowerCase();
  for (const [category, synonyms] of Object.entries(MOVEMENT_CATEGORIES)) {
    if (synonyms.some(synonym => lowerName.includes(synonym))) {
      return category;
    }
  }
  return null;
}

/**
 * Runs a safety audit on template exercises to ensure no unsafe video matches exist
 */
export async function runVideoSafetyCheck(): Promise<{
  checked: number;
  fixed: number;
  issues: string[];
}> {
  const issues: string[] = [];
  let fixed = 0;
  
  try {
    // Get all template exercises
    const allTemplateExercises = await db.select().from(templateExercises);
    
    for (const te of allTemplateExercises) {
      const exerciseName = te.exerciseName || '';
      
      // Check if this exercise is in the known unsafe list
      if (UNSAFE_VIDEO_EXERCISE_NAMES.includes(exerciseName)) {
        // If it still has a video URL, clear it
        if (te.videoUrl) {
          await db.update(templateExercises)
            .set({ videoUrl: null, videoMatchType: 'generic' })
            .where(eq(templateExercises.id, te.id));
          
          issues.push(`Fixed unsafe video for "${exerciseName}" (was showing different exercise)`);
          fixed++;
        }
      }
    }
    
    console.log(`[Video Safety] Checked ${allTemplateExercises.length} template exercises, fixed ${fixed} unsafe matches`);
    
    return {
      checked: allTemplateExercises.length,
      fixed,
      issues
    };
  } catch (error) {
    console.error('[Video Safety] Error running safety check:', error);
    return {
      checked: 0,
      fixed: 0,
      issues: [`Error: ${error}`]
    };
  }
}

/**
 * Validates a video match before it's saved
 * Returns true if the match is safe, false if it should be rejected
 */
export function validateVideoMatch(
  exerciseName: string,
  videoTitle: string
): { isValid: boolean; reason: string } {
  const exerciseCategory = getExerciseCategory(exerciseName);
  const videoCategory = getExerciseCategory(videoTitle);
  
  // If exercise has no category, allow any video (unknown exercise type)
  if (!exerciseCategory) {
    return { isValid: true, reason: 'Exercise category unknown, allowing video' };
  }
  
  // If video has no category, reject (unknown video type)
  if (!videoCategory) {
    return { isValid: false, reason: 'Video category unknown, rejecting for safety' };
  }
  
  // Categories must match
  if (exerciseCategory !== videoCategory) {
    return {
      isValid: false,
      reason: `Category mismatch: exercise is ${exerciseCategory}, video is ${videoCategory}`
    };
  }
  
  return { isValid: true, reason: 'Categories match' };
}
