import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import MoodTracker from '@/components/symptom/MoodTracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

// Mock symptom log history
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
  }
];

// Helper to get emoji for mood
const getMoodEmoji = (mood: string): string => {
  switch (mood) {
    case 'great': return '😊';
    case 'good': return '🙂';
    case 'okay': return '😐';
    case 'low': return '😕';
    case 'poor': return '😞';
    default: return '😐';
  }
};

// Helper to get color for mood
const getMoodColor = (mood: string): string => {
  switch (mood) {
    case 'great': return 'bg-green-100 text-green-800';
    case 'good': return 'bg-green-50 text-green-700';
    case 'okay': return 'bg-blue-50 text-blue-700';
    case 'low': return 'bg-yellow-50 text-yellow-700'; 
    case 'poor': return 'bg-red-50 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const SymptomTrackerPage = () => {
  const [logs, setLogs] = useState(mockSymptomLogs);
  
  const handleSaveMood = (moodData: {
    mood: string;
    symptoms: string[];
    notes: string;
    date: Date;
  }) => {
    setLogs([moodData, ...logs]);
  };
  
  return (
    <div className="p-4 pb-16 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Symptom Tracker</h1>
      </div>
      
      <Tabs defaultValue="new-entry">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="new-entry">New Entry</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new-entry">
          <MoodTracker onSave={handleSaveMood} />
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Your Symptom History</CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.map((log, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{getMoodEmoji(log.mood)}</span>
                          <div>
                            <p className="font-medium">{format(log.date, 'EEEE, MMMM d')}</p>
                            <p className="text-sm text-gray-500">{format(log.date, 'h:mm a')}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getMoodColor(log.mood)}`}>
                          {log.mood.charAt(0).toUpperCase() + log.mood.slice(1)}
                        </span>
                      </div>
                      
                      {log.symptoms.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 mb-1">Symptoms</p>
                          <div className="flex flex-wrap gap-1">
                            {log.symptoms.map((symptom) => (
                              <span key={symptom} className="text-xs bg-gray-100 rounded-full px-2 py-0.5">
                                {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {log.notes && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Notes</p>
                          <p className="text-sm bg-gray-50 p-2 rounded">{log.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No symptom logs yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start tracking how you feel by adding a new entry</p>
                </div>
              )}
              
              <div className="mt-6">
                <Link href="/symptom-calendar">
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <h3 className="font-medium mb-1">Why track symptoms?</h3>
        <p>Regular symptom tracking helps you and your healthcare team:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Identify patterns in your symptoms</li>
          <li>Understand how exercise affects your well-being</li>
          <li>Make informed decisions about your cancer care</li>
          <li>Monitor your progress over time</li>
        </ul>
      </div>
    </div>
  );
};

export default SymptomTrackerPage;