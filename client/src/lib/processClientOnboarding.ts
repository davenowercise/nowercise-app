import { OnboardingData, OnboardingResponse, ParqData } from '@shared/types';

/**
 * Client-side utility to process full onboarding data including PAR-Q+ responses
 * Submits to the backend API with proper error handling
 * 
 * @param clientData Combined client onboarding data
 * @returns Onboarding response with exercise recommendations
 */
export async function processClientOnboarding(clientData: OnboardingData): Promise<OnboardingResponse> {
  try {
    // Format the API request payload
    const payload: OnboardingData = {
      cancerType: clientData.cancerType,
      symptoms: clientData.symptoms,
      confidenceScore: clientData.confidenceScore,
      energyScore: clientData.energyScore,
      comorbidities: clientData.comorbidities || [],
      treatmentPhase: clientData.treatmentPhase || "Post-Treatment",
      parqData: clientData.parqData
    };

    // Make API request
    const response = await fetch('/api/patient/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `Server error: ${response.status}`;
      throw new Error(errorMessage);
    }

    // Return parsed response
    const data: OnboardingResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error in processClientOnboarding:', error);
    
    // Re-throw so calling code can handle errors
    throw error instanceof Error 
      ? error 
      : new Error('Failed to process onboarding data');
  }
}

/**
 * Helper function to submit full onboarding with PAR-Q+ data
 */
export async function submitFullOnboarding(allClientData: {
  cancerType: string;
  symptoms: string[];
  confidenceScore: number;
  energyScore: number;
  comorbidities?: string[];
  treatmentPhase?: string;
  parqAnswers: ("Yes" | "No")[];
  parqRequired: boolean;
}): Promise<OnboardingResponse> {
  try {
    // Format the data for processing
    const onboardingData: OnboardingData = {
      cancerType: allClientData.cancerType,
      symptoms: allClientData.symptoms,
      confidenceScore: allClientData.confidenceScore,
      energyScore: allClientData.energyScore,
      comorbidities: allClientData.comorbidities || [],
      treatmentPhase: allClientData.treatmentPhase || "Post-Treatment",
      parqData: {
        parqAnswers: allClientData.parqAnswers,
        parqRequired: allClientData.parqRequired
      }
    };

    // Process the onboarding data
    const response = await processClientOnboarding(onboardingData);
    console.log("✅ Full onboarding result:", response);
    return response;
  } catch (error) {
    console.error("❌ Onboarding submission failed:", error);
    throw error;
  }
}