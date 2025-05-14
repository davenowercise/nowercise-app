/**
 * Fetches cancer-specific exercise guidelines from the server 
 * based on the ACSM Roundtable 2019 recommendations
 */

import { apiRequest } from '@/lib/queryClient';

// Type definitions for guidelines
export interface CancerGuideline {
  base_tier: number;
  considerations: string[];
  restrictions: string[];
  preferred_modes: string[];
  source: string;
}

/**
 * Returns personalized ACSM/ACS guideline data for a given cancer type
 * @param {string} cancerType - e.g. 'breast', 'prostate', 'hematologic'
 * @returns {Promise<CancerGuideline>} - guideline object with tier, restrictions, modes, etc.
 */
export async function getGuidelinesForCancerType(cancerType: string): Promise<CancerGuideline> {
  try {
    const response = await apiRequest('/api/guidelines/cancer-type', {
      method: 'POST',
      body: JSON.stringify({ cancerType }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching cancer-specific guidelines:', error);
    // Return general guidelines if error occurs
    return {
      base_tier: 2,
      considerations: [
        "Fatigue",
        "Deconditioning",
        "Confidence in movement"
      ],
      restrictions: [],
      preferred_modes: [
        "Walking",
        "Resistance bands",
        "Balance and coordination drills"
      ],
      source: "ACSM/ACS Guidelines – General Post-Treatment Recommendations"
    };
  }
}

/**
 * Synchronous version that assumes we already have guidelines data
 * For direct usage in forms or components without async
 * @param {string} cancerType - cancer type string
 * @returns {CancerGuideline} - guideline object
 */
export function getGuidelinesForCancerTypeSync(cancerType: string): CancerGuideline {
  // This is a simplified version that would be replaced with a proper
  // implementation that either uses cached data or returns default guidelines
  // until the async version loads the actual data
  
  // Basic defaults matching the general recommendations
  return {
    base_tier: 2,
    considerations: [
      "Fatigue",
      "Deconditioning",
      "Confidence in movement"
    ],
    restrictions: [],
    preferred_modes: [
      "Walking",
      "Resistance bands",
      "Balance and coordination drills"
    ],
    source: "ACSM/ACS Guidelines – General Post-Treatment Recommendations"
  };
}

/**
 * Onboarding form handler: receives client data and assigns a recommended tier
 * @param {object} clientData - full intake data from form
 * @returns {Promise<object>} - structured response with tier, modes, notes, and suggested session
 */
export async function processClientOnboarding(clientData: {
  cancerType: string;
  symptoms: string[];
  confidenceScore: number;
  energyScore: number;
}): Promise<{
  recommendedTier: number;
  preferredModes: string[];
  restrictions: string[];
  notes: string[];
  source: string;
  suggestedSession: string;
}> {
  // Step 1: Pull guideline profile for cancer type
  const guideline = await getGuidelinesForCancerType(clientData.cancerType);

  // Step 2: Initial base tier from guidelines
  let tier = guideline.base_tier;

  // Step 3: Adjust tier based on risk factors or low confidence
  if (clientData.confidenceScore < 4 || clientData.energyScore < 4) {
    tier = Math.max(1, tier - 1); // Downgrade to safer tier
  }
  if (clientData.symptoms.includes('dizziness') || clientData.symptoms.includes('fatigue')) {
    tier = Math.max(1, tier - 1);
  }

  // Step 4: Suggest a default starter session name based on tier
  let suggestedSession = '';
  switch (tier) {
    case 1:
      suggestedSession = 'Gentle Session 1 – Small Wins Start Here';
      break;
    case 2:
      suggestedSession = 'Gentle Session 2 – Balance & Breathe';
      break;
    case 3:
      suggestedSession = 'Gentle Session 3 – Steady with Bands';
      break;
    case 4:
      suggestedSession = 'Weekly Movement: Functional Start';
      break;
    default:
      suggestedSession = 'Gentle Session 1 – Small Wins Start Here';
  }

  // Step 5: Return summary object
  // Note: Current recommendation engine is based on ACSM 2019 guidelines.
  // A 2025 update is pending – logic and tiers may be revised when new guidance is released.
  return {
    recommendedTier: tier,
    preferredModes: guideline.preferred_modes,
    restrictions: guideline.restrictions,
    notes: guideline.considerations,
    source: guideline.source,
    suggestedSession: suggestedSession
  };
}