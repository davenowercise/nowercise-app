import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import SymptomCalendar from '@/components/symptom/SymptomCalendar';

// Mock symptom log history with more data for visualization
const mockSymptomLogs = [
  {
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    mood: 'good',
    symptoms: ['fatigue', 'pain'],
    notes: 'Felt a bit tired after yesterday\'s walk, but overall doing well.'
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() - 3)),
    mood: 'okay',
    symptoms: ['fatigue', 'nausea'],
    notes: 'Had some nausea in the morning. Better by afternoon.'
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() - 6)),
    mood: 'low',
    symptoms: ['fatigue', 'pain', 'fever'],
    notes: 'Difficult day. Needed to rest most of the day.'
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() - 9)),
    mood: 'poor',
    symptoms: ['fatigue', 'pain', 'fever', 'nausea', 'insomnia'],
    notes: 'Very challenging day. Called my doctor about the fever.'
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() - 12)),
    mood: 'okay',
    symptoms: ['fatigue'],
    notes: 'Better today. Just a bit tired.'
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() - 15)),
    mood: 'good',
    symptoms: [],
    notes: 'Good day with no major symptoms!'
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() - 18)),
    mood: 'great',
    symptoms: [],
    notes: 'Felt really good today. Was able to go for a 20-minute walk.'
  }
];

// Function to generate insights based on symptom logs
const generateInsights = (logs: typeof mockSymptomLogs) => {
  // Count frequency of symptoms
  const symptomCounts: Record<string, number> = {};
  logs.forEach(log => {
    log.symptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });
  
  // Get most common symptom
  let mostCommonSymptom = '';
  let highestCount = 0;
  
  Object.entries(symptomCounts).forEach(([symptom, count]) => {
    if (count > highestCount) {
      highestCount = count;
      mostCommonSymptom = symptom;
    }
  });
  
  // Count mood frequency
  const moodCounts: Record<string, number> = {};
  logs.forEach(log => {
    moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
  });
  
  // Calculate overall mood trend (simplified)
  const positiveCount = (moodCounts['great'] || 0) + (moodCounts['good'] || 0);
  const negativeCount = (moodCounts['low'] || 0) + (moodCounts['poor'] || 0);
  const moodTrend = positiveCount > negativeCount ? 'positive' : positiveCount < negativeCount ? 'negative' : 'neutral';

  return {
    mostCommonSymptom: mostCommonSymptom || 'none',
    mostCommonSymptomCount: highestCount,
    moodTrend,
    totalEntries: logs.length
  };
};

const SymptomCalendarPage = () => {
  const [logs] = useState(mockSymptomLogs);
  const insights = generateInsights(logs);
  
  return (
    <div className="p-4 pb-16 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/symptom-tracker">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Symptom Calendar</h1>
        </div>
        
        <Link href="/symptom-tracker">
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
            <PlusCircle className="h-4 w-4 mr-1" />
            New Entry
          </Button>
        </Link>
      </div>
      
      <div className="mb-6">
        <SymptomCalendar logs={logs} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-3">Insights</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Total entries</p>
              <p className="font-bold">{insights.totalEntries}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Most common symptom</p>
              <p className="font-bold capitalize">{insights.mostCommonSymptom} ({insights.mostCommonSymptomCount} times)</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Overall mood trend</p>
              <p className="font-bold capitalize">
                {insights.moodTrend === 'positive' && '🙂 Positive'}
                {insights.moodTrend === 'negative' && '😕 Challenging'}
                {insights.moodTrend === 'neutral' && '😐 Neutral'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-3">Tips & Recommendations</h2>
          <div className="space-y-2 text-sm">
            {insights.mostCommonSymptom === 'fatigue' && (
              <p>💡 <strong>For fatigue:</strong> Try shorter, more frequent exercise sessions. Consider gentle yoga or stretching on days when energy is low.</p>
            )}
            {insights.mostCommonSymptom === 'pain' && (
              <p>💡 <strong>For pain:</strong> Make note of which movements trigger pain. Consider gentle range of motion exercises and discuss with your healthcare provider.</p>
            )}
            {insights.mostCommonSymptom === 'nausea' && (
              <p>💡 <strong>For nausea:</strong> Exercise during times of day when nausea is typically less intense. Stay well hydrated before and after activity.</p>
            )}
            <p>💡 Share your symptom calendar with your healthcare team at your next appointment.</p>
            <p>💡 Look for patterns in how your symptoms relate to your exercise routine.</p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <h3 className="font-medium mb-1">Using Your Symptom Calendar</h3>
        <p>This calendar helps you visualize patterns in how you're feeling over time. Notice any connections between:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Exercise days and symptom changes</li>
          <li>Treatment cycles and energy levels</li>
          <li>Weather changes and physical comfort</li>
          <li>Sleep quality and next-day symptoms</li>
        </ul>
      </div>
    </div>
  );
};

export default SymptomCalendarPage;