import React, { useState } from 'react';
import { ParqForm } from '../components/forms/ParqForm';
import { OnboardingData, ParqData, OnboardingResponse } from '@shared/types';

/**
 * Multi-step onboarding page for new patients
 * Includes PAR-Q+ pre-screening and cancer-specific questions
 */
export default function OnboardingPage() {
  const [step, setStep] = useState<'parq' | 'cancer-details' | 'loading' | 'results'>('parq');
  const [parqData, setParqData] = useState<ParqData | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    cancerType: '',
    symptoms: [],
    confidenceScore: 5,
    energyScore: 5,
    comorbidities: [],
    treatmentPhase: 'Post-Treatment'
  });
  const [results, setResults] = useState<OnboardingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle PAR-Q+ form completion
  const handleParqComplete = (data: ParqData) => {
    setParqData(data);
    setStep('cancer-details');
  };

  // Handle main onboarding form completion
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setError(null);

    try {
      // Combine cancer details with PAR-Q+ data
      const fullData: OnboardingData = {
        ...onboardingData,
        parqData: parqData || undefined
      };

      // Submit to server
      const response = await fetch('/api/patient/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fullData)
      });

      if (!response.ok) {
        throw new Error('Failed to process onboarding data');
      }

      const result = await response.json();
      setResults(result);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('cancer-details');
    }
  };

  // Handle symptom selection with toggle
  const toggleSymptom = (symptom: string) => {
    setOnboardingData(prevData => {
      const newSymptoms = prevData.symptoms.includes(symptom)
        ? prevData.symptoms.filter(s => s !== symptom)
        : [...prevData.symptoms, symptom];
      
      return {
        ...prevData,
        symptoms: newSymptoms
      };
    });
  };

  // Handle comorbidity selection with toggle
  const toggleComorbidity = (condition: string) => {
    setOnboardingData(prevData => {
      const newComorbidities = prevData.comorbidities?.includes(condition)
        ? prevData.comorbidities.filter(c => c !== condition)
        : [...(prevData.comorbidities || []), condition];
      
      return {
        ...prevData,
        comorbidities: newComorbidities
      };
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Nowercise Onboarding</h1>
      
      {step === 'parq' && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Step 1: Pre-Exercise Screening</h2>
          <ParqForm onComplete={handleParqComplete} />
        </div>
      )}

      {step === 'cancer-details' && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Step 2: Cancer & Health Details</h2>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleFormSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Cancer Type</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={onboardingData.cancerType}
                onChange={e => setOnboardingData({...onboardingData, cancerType: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Treatment Phase</label>
              <select
                className="w-full p-2 border rounded"
                value={onboardingData.treatmentPhase}
                onChange={e => setOnboardingData({...onboardingData, treatmentPhase: e.target.value})}
              >
                <option value="Pre-Treatment">Pre-Treatment</option>
                <option value="During Treatment">During Treatment</option>
                <option value="Post-Surgery">Post-Surgery</option>
                <option value="Post-Treatment">Post-Treatment</option>
                <option value="Maintenance Treatment">Maintenance Treatment</option>
                <option value="Recovery">Recovery</option>
                <option value="Advanced/Palliative">Advanced/Palliative</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Current Symptoms</label>
              <div className="flex flex-wrap gap-2">
                {['fatigue', 'nausea', 'pain', 'dizziness', 'breathlessness', 'weakness', 'numbness'].map(symptom => (
                  <button
                    type="button"
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-3 py-1 border rounded ${
                      onboardingData.symptoms.includes(symptom) 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Other Health Conditions</label>
              <div className="flex flex-wrap gap-2">
                {['heart_disease', 'diabetes', 'osteoporosis', 'hypertension', 'lung_disease', 'anxiety'].map(condition => (
                  <button
                    type="button"
                    key={condition}
                    onClick={() => toggleComorbidity(condition)}
                    className={`px-3 py-1 border rounded ${
                      onboardingData.comorbidities?.includes(condition) 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100'
                    }`}
                  >
                    {condition.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Exercise Confidence (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                className="w-full"
                value={onboardingData.confidenceScore}
                onChange={e => setOnboardingData({...onboardingData, confidenceScore: parseInt(e.target.value)})}
              />
              <div className="flex justify-between text-xs">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Energy Level (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                className="w-full"
                value={onboardingData.energyScore}
                onChange={e => setOnboardingData({...onboardingData, energyScore: parseInt(e.target.value)})}
              />
              <div className="flex justify-between text-xs">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep('parq')}
                className="px-4 py-2 mr-2 bg-gray-200 rounded"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 'loading' && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
          <p>Processing your information...</p>
        </div>
      )}

      {step === 'results' && results && (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Your Personalized Exercise Plan</h2>
            
            {results.medicalClearanceRequired && (
              <div className="p-4 mb-4 bg-amber-50 border border-amber-200 rounded-md">
                <h3 className="font-medium text-amber-800">Medical Clearance Recommended</h3>
                <p className="text-amber-700">Based on your responses, we recommend consulting with your healthcare provider before starting this exercise program.</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium mb-2">Your Exercise Tier</h3>
                <div className="text-3xl font-bold text-primary">{results.recommendedTier}</div>
                <p className="text-sm text-gray-600 mt-2">
                  {results.recommendedTier === 1 && "This is our most gentle and supportive exercise level."}
                  {results.recommendedTier === 2 && "This provides gradual progression with some light resistance work."}
                  {results.recommendedTier === 3 && "This includes moderate movement with increased duration."}
                  {results.recommendedTier === 4 && "This includes more challenging movements and longer sessions."}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium mb-2">Recommended Activity Types</h3>
                <ul className="list-disc ml-4">
                  {results.preferredModes.map((mode, i) => (
                    <li key={i}>{mode}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Your 7-Day Plan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2">
              {results.weeklyPlan?.map((day, i) => (
                <div key={i} className={`p-3 rounded border ${day.activity.includes('Rest') ? 'bg-gray-50' : 'bg-blue-50'}`}>
                  <div className="font-medium">{day.day}</div>
                  <div className="text-sm">{day.activity}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              className="px-4 py-2 bg-primary text-white rounded"
              onClick={() => alert("Plan saved! Your Nowercise coach will review your plan and may make minor adjustments.")}
            >
              Save My Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}