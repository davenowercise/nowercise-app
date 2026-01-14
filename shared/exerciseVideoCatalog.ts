/**
 * Safe Exercise-Video Catalog
 * 
 * This catalog defines safe video matching rules for cancer recovery exercises.
 * 
 * Matching Priority:
 * 1. EXACT: Video title exactly matches exercise name
 * 2. CATEGORY: Video is in the same safe movement category
 * 3. GENERIC: Use a clearly labeled generic fallback video
 * 
 * NEVER show a mismatched named exercise video.
 */

export type VideoMatchType = 'exact' | 'category' | 'generic';

export interface SafeVideoMatch {
  exerciseName: string;
  videoUrl: string;
  matchType: VideoMatchType;
  videoTitle?: string;
}

// Movement categories with safe synonyms
// Only videos within the same category can be used as category fallbacks
export const MOVEMENT_CATEGORIES: Record<string, string[]> = {
  heel_raise: [
    'heel raise', 'heel raises', 'calf raise', 'calf raises', 
    'standing heel', 'toe raise', 'ankle raise'
  ],
  knee_lift: [
    'knee lift', 'knee lifts', 'leg lift', 'leg raise', 
    'seated knee', 'marching', 'high knee'
  ],
  shoulder_shrug: [
    'shrug', 'shrugs', 'shoulder shrug', 'trap raise',
    'overhead shrug', 'dumbbell shrug'
  ],
  wrist_mobility: [
    'wrist circle', 'wrist circles', 'wrist rotation', 
    'wrist mobility', 'wrist stretch', 'forearm rotation'
  ],
  breathing: [
    'breathing', 'breath', 'diaphragm', 'balloon', 
    'respiratory', 'deep breath', 'recovery breath'
  ],
  arm_raise: [
    'arm raise', 'arm raises', 'frontal raise', 'lateral raise',
    'shoulder raise', 'front raise', 'side raise'
  ],
  bicep_curl: [
    'bicep curl', 'bicep curls', 'curl', 'curls',
    'arm curl', 'dumbbell curl', 'band curl'
  ],
  push: [
    'push-up', 'pushup', 'push up', 'push-away', 'wall push',
    'press', 'chest press', 'floor press'
  ],
  squat: [
    'squat', 'squats', 'sit to stand', 'chair squat',
    'box squat', 'goblet squat'
  ],
  lunge: [
    'lunge', 'lunges', 'split squat', 'step back',
    'reverse lunge', 'forward lunge', 'static lunge'
  ],
  core: [
    'core', 'ab', 'abdominal', 'plank', 'dead bug',
    'bird dog', 'gentle core'
  ],
  stretch: [
    'stretch', 'stretching', 'mobility', 'flexibility',
    'range of motion', 'rom'
  ],
  walk: [
    'walk', 'walking', 'march', 'step', 'gait'
  ]
};

// Generic fallback videos for when no safe match exists
// These should be clearly labeled as general demos
export const GENERIC_FALLBACK_VIDEOS: Record<string, { url: string; title: string }> = {
  lower_body: {
    url: '', // Will be set when a safe generic video is identified
    title: 'Lower Body Strength – Safe Demo'
  },
  upper_body: {
    url: '', // Will be set when a safe generic video is identified
    title: 'Upper Body Strength – Safe Demo'
  },
  core: {
    url: '', // Will be set when a safe generic video is identified
    title: 'Core Activation – Safe Demo'
  },
  general: {
    url: '', // Generic safe movement demo
    title: 'Safe Movement Demo'
  }
};

/**
 * Determines the movement category for an exercise name
 */
export function getExerciseCategory(exerciseName: string): string | null {
  const lowerName = exerciseName.toLowerCase();
  
  for (const [category, synonyms] of Object.entries(MOVEMENT_CATEGORIES)) {
    if (synonyms.some(synonym => lowerName.includes(synonym))) {
      return category;
    }
  }
  
  return null;
}

/**
 * Checks if a video title is a safe match for an exercise
 * Returns the match type or null if not safe
 */
export function getSafeMatchType(
  exerciseName: string, 
  videoTitle: string
): VideoMatchType | null {
  const exerciseLower = exerciseName.toLowerCase();
  const videoLower = videoTitle.toLowerCase();
  
  // Check for exact match (video title contains the exercise name or vice versa)
  const exerciseWords = exerciseLower.split(/[\s\-_()]+/).filter(w => w.length > 2);
  const videoWords = videoLower.split(/[\s\-_()]+/).filter(w => w.length > 2);
  
  // Strong exact match: most exercise words appear in video title
  const matchingWords = exerciseWords.filter(word => videoLower.includes(word));
  if (matchingWords.length >= Math.ceil(exerciseWords.length * 0.6)) {
    return 'exact';
  }
  
  // Category match: both are in the same movement category
  const exerciseCategory = getExerciseCategory(exerciseName);
  const videoCategory = getExerciseCategory(videoTitle);
  
  if (exerciseCategory && videoCategory && exerciseCategory === videoCategory) {
    return 'category';
  }
  
  // No safe match found
  return null;
}

/**
 * Validates if a video URL is a safe match for an exercise
 * Used to audit existing template exercises
 */
export function validateVideoMatch(
  exerciseName: string,
  videoUrl: string,
  videoTitle: string
): { isValid: boolean; matchType: VideoMatchType | null; reason: string } {
  const matchType = getSafeMatchType(exerciseName, videoTitle);
  
  if (matchType) {
    return {
      isValid: true,
      matchType,
      reason: matchType === 'exact' 
        ? 'Video title matches exercise name'
        : 'Video is in the same safe movement category'
    };
  }
  
  // Check if video is a different named exercise (dangerous)
  const videoCategory = getExerciseCategory(videoTitle);
  const exerciseCategory = getExerciseCategory(exerciseName);
  
  if (videoCategory && exerciseCategory && videoCategory !== exerciseCategory) {
    return {
      isValid: false,
      matchType: null,
      reason: `UNSAFE: Video "${videoTitle}" (${videoCategory}) does not match exercise "${exerciseName}" (${exerciseCategory})`
    };
  }
  
  return {
    isValid: false,
    matchType: null,
    reason: `No safe match found for exercise "${exerciseName}"`
  };
}

/**
 * Pre-defined safe video matches for known exercises in the breast cancer pathway
 * These are manually verified matches
 */
export const VERIFIED_EXERCISE_VIDEOS: Record<string, SafeVideoMatch> = {
  'Arm Raises (Front)': {
    exerciseName: 'Arm Raises (Front)',
    videoUrl: 'https://www.youtube.com/watch?v=JKUy1Sd-SFs',
    matchType: 'exact',
    videoTitle: 'Nowercise Bands Frontal Raises'
  },
  'Bicep Curls (Light/No Weight)': {
    exerciseName: 'Bicep Curls (Light/No Weight)',
    videoUrl: 'https://www.youtube.com/watch?v=zG012FFdTTM',
    matchType: 'exact',
    videoTitle: 'Nowercise Bands Bicep Curl'
  },
  'Breathing Recovery': {
    exerciseName: 'Breathing Recovery',
    videoUrl: 'https://www.youtube.com/watch?v=fwOUp7Jku0w',
    matchType: 'exact',
    videoTitle: '90/90 Wall Balloon-Breathing'
  },
  'Wall Push-Aways': {
    exerciseName: 'Wall Push-Aways',
    videoUrl: 'https://www.youtube.com/watch?v=qOR_PSePvhU',
    matchType: 'category',
    videoTitle: 'Hands-Elevated Pushup'
  },
  'Gentle Core Breathing': {
    exerciseName: 'Gentle Core Breathing',
    videoUrl: 'https://www.youtube.com/watch?v=fwOUp7Jku0w',
    matchType: 'category',
    videoTitle: '90/90 Wall Balloon-Breathing'
  },
  'Shoulder Shrugs': {
    exerciseName: 'Shoulder Shrugs',
    videoUrl: 'https://www.youtube.com/watch?v=lLlTDqZ2cy0',
    matchType: 'category',
    videoTitle: 'Dumbbell Overhead Shrug'
  },
  // Exercises that need generic fallback (no safe specific video available)
  'Wrist Circles': {
    exerciseName: 'Wrist Circles',
    videoUrl: '', // No safe video - use generic or remove
    matchType: 'generic',
    videoTitle: 'Safe Movement Demo'
  },
  'Seated Knee Lifts': {
    exerciseName: 'Seated Knee Lifts',
    videoUrl: '', // No safe video - use generic or remove
    matchType: 'generic',
    videoTitle: 'Safe Movement Demo'
  },
  'Standing Heel Raises': {
    exerciseName: 'Standing Heel Raises',
    videoUrl: '', // No safe video - use generic or remove
    matchType: 'generic',
    videoTitle: 'Safe Movement Demo'
  }
};
