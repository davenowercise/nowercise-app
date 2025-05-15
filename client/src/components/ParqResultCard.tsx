import React from 'react';
import { ParqData } from '@shared/types';

interface ParqResultCardProps {
  result: ParqData | null;
}

export default function ParqResultCard({ result }: ParqResultCardProps) {
  if (!result) return null;

  return (
    <div className="p-4 bg-white border rounded shadow">
      <h2 className="text-xl font-bold text-primary mb-3">PAR-Q+ Result</h2>

      {result.parqRequired ? (
        <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded">
          <p className="font-semibold mb-1">⚠️ Medical Clearance Recommended</p>
          <p>You answered "Yes" to one or more safety questions. Please speak to your GP or oncology team before starting an exercise program.</p>
        </div>
      ) : (
        <div className="text-green-700 bg-green-50 border border-green-200 p-3 rounded">
          <p className="font-semibold mb-1">✅ Safe to Proceed</p>
          <p>No flags raised by the screening. You may begin a gentle exercise program.</p>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-md font-semibold text-slate-800 mb-2">Your Answers:</h3>
        <ul className="text-sm text-slate-600 list-decimal list-inside space-y-1">
          {result.parqAnswers.map((ans, idx) => (
            <li key={idx}>Q{idx + 1}: {ans}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}