import React from 'react';

// PAR-Q+ Questions
export const PARQ_QUESTIONS = [
  "Has your doctor ever said you have a heart condition and that you should only do physical activity recommended by a doctor?",
  "Do you feel pain in your chest when you do physical activity?",
  "In the past month, have you had chest pain when not doing physical activity?",
  "Do you lose balance because of dizziness or do you ever lose consciousness?",
  "Do you have a bone or joint problem that could be made worse by physical activity?",
  "Is your doctor currently prescribing medication for your blood pressure or heart condition?",
  "Do you know of any other reason you should not do physical activity?"
];

interface ParqFormProps {
  onComplete: (data: {
    parqAnswers: ("Yes" | "No")[];
    parqRequired: boolean;
  }) => void;
}

export function ParqForm({ onComplete }: ParqFormProps) {
  const [responses, setResponses] = React.useState<Array<"Yes" | "No" | null>>(
    Array(PARQ_QUESTIONS.length).fill(null)
  );

  const handleResponse = (index: number, value: "Yes" | "No") => {
    const updated = [...responses];
    updated[index] = value;
    setResponses(updated);
  };

  const isComplete = responses.every(r => r !== null);
  const parqFlag = responses.includes("Yes");

  const handleSubmit = () => {
    if (isComplete) {
      onComplete({
        parqAnswers: responses as ("Yes" | "No")[],
        parqRequired: parqFlag
      });
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-primary">PAR-Q+ Pre-Exercise Questions</h2>
      <p className="text-sm text-muted-foreground">
        The Physical Activity Readiness Questionnaire (PAR-Q+) helps determine if you need 
        medical clearance before starting an exercise program.
      </p>
      
      {PARQ_QUESTIONS.map((q, i) => (
        <div key={i} className="border rounded p-3 bg-slate-50">
          <p className="mb-2 text-sm font-medium">{q}</p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleResponse(i, "Yes")}
              className={`px-3 py-1 rounded ${responses[i] === 'Yes' ? 'bg-red-500 text-white' : 'bg-slate-200'}`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleResponse(i, "No")}
              className={`px-3 py-1 rounded ${responses[i] === 'No' ? 'bg-green-500 text-white' : 'bg-slate-200'}`}
            >
              No
            </button>
          </div>
        </div>
      ))}
      
      {isComplete && parqFlag && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-800 font-medium">
            One or more of your answers indicates you should consult with a healthcare provider 
            before starting a new exercise program.
          </p>
          <p className="text-amber-700 mt-2 text-sm">
            You may still continue with the onboarding process, but please be aware that medical clearance 
            is recommended before starting your exercise plan.
          </p>
        </div>
      )}
      
      <button
        disabled={!isComplete}
        onClick={handleSubmit}
        className="mt-4 px-5 py-2 bg-primary text-white rounded disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}