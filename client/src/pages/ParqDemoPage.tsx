import React from 'react';
import { ParqForm } from '../components/forms/ParqForm';
import { ParqData } from '@shared/types';
import { submitFullOnboarding } from '../lib/processClientOnboarding';

/**
 * Demo page to showcase the PAR-Q+ screening integration
 */
export default function ParqDemoPage() {
  const [parqData, setParqData] = React.useState<ParqData | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleParqComplete = async (data: ParqData) => {
    setParqData(data);
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
      setResult(response);
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
          {!parqData ? (
            <ParqForm onComplete={handleParqComplete} />
          ) : (
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <h3 className="font-medium text-green-700">PAR-Q+ Completed</h3>
              <p className="text-sm text-green-600 mt-1">
                {parqData.parqRequired 
                  ? "PAR-Q+ flags detected. Medical clearance may be recommended."
                  : "No PAR-Q+ flags detected."}
              </p>
              <button 
                onClick={() => setParqData(null)}
                className="mt-4 px-3 py-1 text-sm bg-white text-green-600 border border-green-300 rounded"
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
          
          {result && !submitting && (
            <div>
              <div className={`p-4 mb-4 rounded ${
                result.medicalClearanceRequired 
                  ? 'bg-amber-50 border border-amber-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <h3 className={`font-medium ${
                  result.medicalClearanceRequired ? 'text-amber-800' : 'text-green-700'
                }`}>
                  {result.medicalClearanceRequired 
                    ? 'Medical Clearance Recommended' 
                    : 'Ready for Exercise'}
                </h3>
                <p className={`text-sm mt-1 ${
                  result.medicalClearanceRequired ? 'text-amber-700' : 'text-green-600'
                }`}>
                  {result.medicalClearanceRequired 
                    ? 'Based on your PAR-Q+ responses, we recommend consulting with your healthcare provider before starting this exercise program.'
                    : 'Based on your PAR-Q+ responses, you can proceed with the exercise program.'}
                </p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Recommended Exercise Tier</h3>
                <div className="text-3xl font-bold text-primary">{result.recommendedTier}</div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Suggested Starting Session</h3>
                <p className="font-medium">{result.suggestedSession}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Customizations Applied</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>
                    Treatment phase adjustment: 
                    <span className="font-medium"> {result.treatmentPhase}</span>
                    <span className="text-gray-500"> (intensity {result.intensityModifier})</span>
                  </li>
                  <li>
                    PAR-Q+ screening: 
                    <span className="font-medium"> {result.parqRequired ? 'Required' : 'Not required'}</span>
                  </li>
                  <li>
                    Safety flags: 
                    <span className="font-medium"> {
                      result.safetyFlag || result.medicalClearanceRequired 
                        ? 'Present - additional caution needed' 
                        : 'None detected'
                    }</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}