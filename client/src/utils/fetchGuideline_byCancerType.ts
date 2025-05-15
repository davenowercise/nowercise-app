/**
 * Utility function to fetch cancer-specific exercise guidelines
 * Uses the API to get the appropriate guidelines for a given cancer type
 */

interface GuidelineResponse {
  recommendedTier: number;
  preferredModes: string[];
  restrictions: string[];
  notes: string[];
  source: string;
}

/**
 * Retrieves exercise guidelines specific to a cancer type
 * 
 * @param cancerType - The type of cancer to get guidelines for
 * @returns Guidelines object with tier, modes, restrictions, and notes
 */
export async function getGuidelinesForCancerType(cancerType: string): Promise<GuidelineResponse> {
  try {
    const response = await fetch(`/api/guidelines/${encodeURIComponent(cancerType)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch guidelines: ${response.status}`);
    }
    
    const guidelines = await response.json();
    return guidelines;
  } catch (error) {
    console.error("Error fetching cancer guidelines:", error);
    // Return default guidelines as fallback
    return {
      recommendedTier: 1, // Most conservative tier as fallback
      preferredModes: ["Walking", "Gentle stretching", "Chair-based movement"],
      restrictions: ["Consult healthcare provider before starting"],
      notes: ["Individualized guidance recommended"],
      source: "ACSM General Guidelines"
    };
  }
}

/**
 * Client-side function to process onboarding form data and get tier recommendations
 * @param clientData - Data from the client onboarding form
 * @returns Processed recommendations with tier, exercise modes, and restrictions
 */
export async function processClientOnboarding(clientData: {
  cancerType: string;
  symptoms: string[];
  confidenceScore: number;
  energyScore: number;
  comorbidities?: string[];
}) {
  try {
    // Make a POST request to the onboarding endpoint with client data
    const response = await fetch('/api/patient/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to process onboarding: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error processing client onboarding:", error);
    
    // Fall back to manual calculation if the API fails
    const guideline = await getGuidelinesForCancerType(clientData.cancerType);
    
    // Initial base tier from guidelines
    let tier = guideline.recommendedTier;
    
    // Adjust tier based on risk factors or low confidence
    if (clientData.confidenceScore < 4 || clientData.energyScore < 4) {
      tier = Math.max(1, tier - 1); // Downgrade to safer tier
    }
    if (clientData.symptoms.includes('dizziness') || clientData.symptoms.includes('fatigue')) {
      tier = Math.max(1, tier - 1);
    }
    
    // Define comorbidity factors for client-side fallback
    const comorbidityFactors = {
      diabetes: {
        adjustTier: -1,
        flags: ['monitor blood sugar', 'include foot care'],
      },
      heart_disease: {
        adjustTier: -1,
        flags: ['avoid HIIT', 'limit isometric holds'],
      },
      osteoarthritis: {
        adjustTier: 0,
        flags: ['avoid deep squats', 'include joint-friendly modes'],
      },
      anxiety: {
        adjustTier: 0,
        flags: ['build confidence gradually'],
      },
      osteoporosis: {
        adjustTier: -1,
        flags: ['no twisting under load', 'no jumping'],
      }
    };
    
    // Adjust tier and add flags based on comorbidities
    let flags = [...guideline.notes];
    
    if (clientData.comorbidities) {
      clientData.comorbidities.forEach(cond => {
        const normalizedCond = cond.toLowerCase().replace(/\s+/g, '_');
        const entry = comorbidityFactors[normalizedCond as keyof typeof comorbidityFactors];
        if (entry) {
          tier = Math.max(1, tier + entry.adjustTier);
          flags.push(...entry.flags);
        }
      });
    }
    
    // Suggest a default starter session name based on tier
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
    
    // Add a section header for comorbidity flags if any were added
    if (flags.length > guideline.notes.length) {
      flags.splice(guideline.notes.length, 0, "Additional considerations for comorbidities:");
    }
    
    return {
      recommendedTier: tier,
      preferredModes: guideline.preferredModes,
      restrictions: guideline.restrictions,
      notes: flags,
      source: guideline.source,
      suggestedSession: suggestedSession
    };
  }
}