import React from 'react';
import { ParqForm } from '@/components/forms/ParqForm';
import ParqResultCard from '@/components/ParqResultCard';
import { ParqData } from '@shared/types';
import { submitFullOnboarding } from '@/lib/processClientOnboarding';

/**
 * Demo page to showcase the PAR-Q+ screening integration
 */
export default function ParqDemoPage() {
  const [parqResult, setParqResult] = React.useState<ParqData | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [apiResult, setApiResult] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleParqComplete = async (data: ParqData) => {
    setParqResult(data);
    setSubmitting(true);
    setError(null);

    try {
      // Demo data with PAR-Q results
      const demoData = {
        cancerType: "breast",
        symptoms: ["fatigue"],
        confidenceScore: 7,
        energyScore: 6,
        comorbidities: ["diabetes"],
        treatmentPhase: "Post-Treatment",
        parqAnswers: data.parqAnswers,
        parqRequired: data.parqRequired
      };

      const response = await submitFullOnboarding(demoData);
      setApiResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">PAR-Q+ Integration Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Step 1: PAR-Q+ Screening</h2>
          <ParqForm 
            onComplete={handleParqComplete} 
            initialData={parqResult}
          />
          
          {parqResult && (
            <div className="mt-4">
              <button 
                onClick={() => {
                  setParqResult(null);
                  setApiResult(null);
                }}
                className="px-3 py-1 text-sm bg-white text-gray-600 border border-gray-300 rounded"
              >
                Reset & Try Again
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Step 2: Results</h2>
          
          {error && (
            <div className="bg-red-50 p-4 rounded border border-red-200 mb-4">
              <h3 className="font-medium text-red-700">Error</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          )}
          
          {submitting && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500">Processing...</p>
            </div>
          )}
          
          {!submitting && parqResult && (
            <div className="space-y-6">
              {/* Show the PAR-Q+ results */}
              <ParqResultCard result={parqResult} />
              
              {/* If we have API results, show the exercise recommendations */}
              {apiResult && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">Exercise Recommendations</h3>
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-700">Exercise Tier:</span>
                      <span className="text-2xl font-bold text-primary">{apiResult.recommendedTier}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Based on your cancer type, symptoms, treatment phase, and PAR-Q+ responses
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="font-medium mb-1">Recommended Session:</div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      {apiResult.suggestedSession}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2">Safety Adjustments:</div>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                      <li>
                        Treatment Phase: <span className="font-medium">{apiResult.treatmentPhase}</span>
                        <span className="text-gray-500"> (intensity {apiResult.intensityModifier})</span>
                      </li>
                      <li>
                        Medical Clearance: 
                        <span className="font-medium"> {apiResult.medicalClearanceRequired ? 'Required' : 'Not required'}</span>
                      </li>
                      <li>
                        Safety Flags: 
                        <span className="font-medium"> {
                          apiResult.safetyFlag ? 'Present - additional caution needed' : 'None detected'
                        }</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!submitting && !parqResult && (
            <div className="flex items-center justify-center h-48 border border-dashed rounded-md border-gray-300 bg-gray-50">
              <p className="text-gray-500">Complete the PAR-Q+ form to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}