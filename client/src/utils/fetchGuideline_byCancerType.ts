/**
 * Utility function to fetch cancer type-specific exercise guidelines
 * from the server API
 */

// Define the response type for cancer guidelines
export interface CancerGuideline {
  base_tier: number;
  considerations: string[];
  restrictions: string[];
  preferred_modes: string[];
  source: string;
}

/**
 * Fetches cancer-specific guidelines from the server
 * @param cancerType - The type of cancer for which to fetch guidelines
 * @returns A promise that resolves to the cancer-specific guidelines
 */
export async function fetchCancerGuidelines(cancerType: string): Promise<CancerGuideline> {
  try {
    const response = await fetch('/api/guidelines/cancer-type', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ cancerType })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching cancer guidelines:', error);
    // Return default guidelines in case of error
    return {
      base_tier: 1, // Most conservative tier
      considerations: ['Error fetching guidelines. Using conservative recommendations.'],
      restrictions: ['Please consult with your healthcare provider before starting any exercise program.'],
      preferred_modes: ['Walking', 'Gentle stretching', 'Seated exercises'],
      source: 'ACSM Guidelines for Exercise and Cancer, 2019'
    };
  }
}

/**
 * Helper function to normalize cancer type for consistent matching
 * @param rawCancerType - Raw cancer type input from user or database
 * @returns Normalized cancer type string for guideline lookup
 */
export function normalizeCancerType(rawCancerType: string): string {
  // Convert to lowercase and trim whitespace
  const normalized = rawCancerType.toLowerCase().trim();
  
  // Common cancer type mappings
  if (normalized.includes('breast')) return 'breast';
  if (normalized.includes('prostate')) return 'prostate';
  if (normalized.includes('blood') || 
      normalized.includes('leukemia') || 
      normalized.includes('lymphoma') || 
      normalized.includes('hematologic')) return 'hematologic';
  if (normalized.includes('colon') || 
      normalized.includes('colorectal') || 
      normalized.includes('rectal')) return 'colorectal';
  if (normalized.includes('lung')) return 'lung';
  if (normalized.includes('head') || normalized.includes('neck')) return 'head_neck';
  
  // Default to general guidelines
  return 'general';
}