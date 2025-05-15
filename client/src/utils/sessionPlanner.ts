/**
 * Nowercise Session Planner
 * Generates exercise sessions and weekly plans based on tier and cancer type
 */

import { SessionTemplate, ExerciseTemplate } from '@shared/types';

// Function to generate session recommendations based on tier and cancer type
export function generateSessionRecommendations(
  tier: number, 
  cancerType: string | null,
  symptomLevel: string = 'low'
): {
  suggestedSession: string;
  sessionRecommendations: SessionTemplate[];
} {
  // This function could access a database of session templates
  // For now we'll use a static approach with common templates
  
  const defaultSessions: SessionTemplate[] = [
    {
      name: "Energy Conservation",
      description: "Activity pacing to build endurance while managing cancer-related fatigue",
      duration: 20,
      suitable_tiers: [1, 2, 3],
      cancer_types: ["general"],
      exercises: [
        {
          name: "Seated Exercises",
          description: "Gentle movement while seated to preserve energy",
          duration: 5,
          intensity: "Light",
          type: "Mixed",
          suitable_tiers: [1, 2]
        },
        {
          name: "Standing Activities",
          description: "Brief standing activities with rest periods",
          duration: 5,
          intensity: "Light to Moderate",
          type: "Mixed",
          suitable_tiers: [2, 3]
        },
        {
          name: "Scheduled Rest",
          description: "Intentional rest period to prevent overexertion",
          duration: 3,
          intensity: "Rest",
          type: "Recovery",
          suitable_tiers: [1, 2, 3]
        },
        {
          name: "Walking",
          description: "Short walking bout with emphasis on good posture",
          duration: 7,
          intensity: "Light to Moderate",
          type: "Aerobic",
          suitable_tiers: [2, 3]
        }
      ]
    },
    {
      name: "Mood Enhancement",
      description: "Movement focused on improving mood and reducing anxiety",
      duration: 25,
      suitable_tiers: [2, 3, 4],
      cancer_types: ["general"],
      exercises: [
        {
          name: "Rhythmic Movement",
          description: "Simple movements synchronized to music",
          duration: 10,
          intensity: "Light to Moderate",
          type: "Aerobic",
          suitable_tiers: [2, 3, 4]
        },
        {
          name: "Mindful Walking",
          description: "Walking with focus on surroundings and sensations",
          duration: 10,
          intensity: "Light to Moderate",
          type: "Aerobic",
          suitable_tiers: [2, 3, 4]
        },
        {
          name: "Stretching",
          description: "Full-body stretching routine",
          duration: 5,
          intensity: "Light",
          type: "Flexibility",
          suitable_tiers: [1, 2, 3, 4]
        }
      ]
    },
    {
      name: "Tier 1 General Session",
      description: "Customized exercise session for tier 1",
      duration: 15,
      suitable_tiers: [1],
      cancer_types: ["general"],
      exercises: [
        {
          name: "Seated Breathing",
          description: "Focused deep breathing while seated to improve oxygen flow and reduce stress",
          duration: 5,
          intensity: "Very Light",
          type: "Breathing",
          suitable_tiers: [1, 2, 3, 4]
        },
        {
          name: "Seated Arm Raises",
          description: "Gentle arm movements while seated to maintain upper body mobility",
          duration: 5, 
          intensity: "Light",
          type: "Mobility",
          suitable_tiers: [1, 2]
        },
        {
          name: "Seated Marching",
          description: "Alternate lifting knees while seated to engage core and maintain leg strength",
          duration: 5,
          intensity: "Light",
          type: "Aerobic",
          suitable_tiers: [1, 2]
        }
      ]
    }
  ];

  // Filter by tier
  const tierAppropriate = defaultSessions.filter(session => 
    session.suitable_tiers.includes(tier)
  );
  
  // Select appropriate sessions (limit to 2 for simplicity)
  const sessionRecommendations = tierAppropriate.slice(0, 2);
  
  // Create a suggested session name based on tier
  const suggestedSessionByTier = {
    1: 'Gentle Session 1 – Small Wins Start Here',
    2: 'Gentle Session 2 – Balance & Breathe',
    3: 'Gentle Session 3 – Steady with Bands',
    4: 'Weekly Movement: Functional Start'
  };
  
  const suggestedSession = suggestedSessionByTier[tier as keyof typeof suggestedSessionByTier] || 
    'Gentle Session 1 – Small Wins Start Here';
  
  return {
    suggestedSession,
    sessionRecommendations
  };
}

/**
 * Generates a 7-day plan based on tier and session bank
 * @param tier Client's recommended tier (1–4)
 * @param sessions Array of session names based on tier
 * @returns Array of daily plan items
 */
export function generateWeeklyExercisePlan(
  tier: number, 
  sessions: string[]
): Array<{ day: string; activity: string }> {
  // Default to rest for all days
  const restDay = { day: '', activity: 'Rest / Recovery' };
  const week: Array<{ day: string; activity: string }> = [];

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Suggested default weekly structure by tier:
  // Tier 1 = 3 sessions, Tier 2 = 4, Tier 3 = 5, Tier 4 = 6
  const daysWithExercise: Record<number, string[]> = {
    1: ["Monday", "Wednesday", "Friday"],
    2: ["Monday", "Tuesday", "Thursday", "Saturday"],
    3: ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"],
    4: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  };
  
  const activeDays = daysWithExercise[tier] || ["Monday", "Wednesday", "Friday"];

  // Create schedule
  for (let i = 0; i < 7; i++) {
    const day = dayNames[i];
    if (activeDays.includes(day)) {
      // Use sessions in rotation, repeating if needed
      week.push({
        day,
        activity: sessions[i % sessions.length] || sessions[0]
      });
    } else {
      week.push({ ...restDay, day });
    }
  }

  return week;
}