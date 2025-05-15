/**
 * Client-side function to process onboarding form data and get tier recommendations
 * Falls back to local logic if API call fails
 */

import { getClientOnboardingTier } from './onboardingEngine';
import { CANCER_TYPE_GUIDELINES, ACSM_GUIDELINES } from './guidelines';
import { generateWeeklyExercisePlan } from './sessionPlanner';
import { OnboardingResponse } from '@shared/types';

export interface OnboardingData {
  cancerType: string;
  symptoms: string[];
  confidenceScore: number;
  energyScore: number;
  comorbidities?: string[];
  treatmentPhase?: string;
}

/**
 * Process client onboarding data through API with local fallback
 * @param clientData User onboarding form data
 * @returns Comprehensive exercise recommendations
 */
export async function processClientOnboarding(clientData: OnboardingData): Promise<OnboardingResponse> {
  try {
    const response = await fetch('/api/patient/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      throw new Error(`Failed to process onboarding: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Error processing onboarding, using local fallback:", error);

    // Local fallback: run full client-side logic
    const result = getClientOnboardingTier(
      clientData.cancerType,
      clientData.symptoms,
      clientData.confidenceScore,
      clientData.energyScore,
      clientData.comorbidities || [],
      clientData.treatmentPhase || "Post-Treatment"
    );

    // Find matching cancer type or fall back to general
    const normalizedType = clientData.cancerType?.toLowerCase() || 'general';
    const matchedKey = Object.keys(CANCER_TYPE_GUIDELINES).find(k => 
      normalizedType.includes(k)
    ) || 'general';
    
    const guideline = CANCER_TYPE_GUIDELINES[matchedKey as keyof typeof CANCER_TYPE_GUIDELINES] || 
      CANCER_TYPE_GUIDELINES.general;

    // Generate weekly plan from suggested sessions
    const weeklyPlan = generateWeeklyExercisePlan(result.tier, result.suggestedSessions);

    return {
      recommendedTier: result.tier,
      preferredModes: guideline.preferred_modes || ACSM_GUIDELINES.AEROBIC_TYPES,
      restrictions: guideline.restrictions || [],
      notes: result.flags,
      source: guideline.source || "ACSM Guidelines",
      treatmentPhase: result.treatmentPhase,
      intensityModifier: result.intensityModifier,
      safetyFlag: result.safetyFlag,
      suggestedSession: result.suggestedSessions[0] || 'Gentle Session 1 – Small Wins Start Here',
      weeklyPlan
    };
  }
}