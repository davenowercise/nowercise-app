import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface MoodOption {
  emoji: string;
  label: string;
  value: string;
}

interface SymptomOption {
  icon: string;
  label: string;
  value: string;
}

// Mood options with emojis
const moodOptions: MoodOption[] = [
  { emoji: '😊', label: 'Great', value: 'great' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😕', label: 'Low', value: 'low' },
  { emoji: '😞', label: 'Poor', value: 'poor' }
];

// Common cancer treatment symptoms
const symptomOptions: SymptomOption[] = [
  { icon: '🥵', label: 'Fatigue', value: 'fatigue' },
  { icon: '🤢', label: 'Nausea', value: 'nausea' },
  { icon: '🤕', label: 'Pain', value: 'pain' },
  { icon: '😴', label: 'Insomnia', value: 'insomnia' },
  { icon: '🫨', label: 'Anxiety', value: 'anxiety' },
  { icon: '🫠', label: 'Dizziness', value: 'dizziness' },
  { icon: '🔥', label: 'Fever', value: 'fever' },
  { icon: '💦', label: 'Sweating', value: 'sweating' }
];

interface MoodTrackerProps {
  onSave?: (data: {
    mood: string;
    symptoms: string[];
    notes: string;
    date: Date;
  }) => void;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ onSave }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  
  const handleSymptomToggle = (symptomValue: string) => {
    if (selectedSymptoms.includes(symptomValue)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptomValue));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomValue]);
    }
  };
  
  const handleSave = () => {
    if (!selectedMood) {
      toast({
        title: "Please select your mood",
        description: "Select how you're feeling today before saving",
        variant: "destructive"
      });
      return;
    }
    
    const moodData = {
      mood: selectedMood,
      symptoms: selectedSymptoms,
      notes: notes,
      date: new Date()
    };
    
    // Call the onSave prop if provided
    if (onSave) {
      onSave(moodData);
    }
    
    // Show success message
    toast({
      title: "Journal entry saved",
      description: "Your mood and symptoms have been recorded",
    });
    
    // Reset form (optional depending on UX)
    // setSelectedMood(null);
    // setSelectedSymptoms([]);
    // setNotes('');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>How are you feeling today?</CardTitle>
        <CardDescription>
          Tracking your mood and symptoms helps you and your care team understand your progress
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Mood Selection */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Your mood</Label>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((mood) => (
              <Button
                key={mood.value}
                type="button"
                variant={selectedMood === mood.value ? "default" : "outline"}
                className={`h-auto py-2 px-3 ${selectedMood === mood.value ? 'bg-blue-500 text-white' : ''}`}
                onClick={() => setSelectedMood(mood.value)}
              >
                <span className="text-xl mr-2">{mood.emoji}</span>
                <span>{mood.label}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Symptom Selection */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Symptoms (select all that apply)</Label>
          <div className="flex flex-wrap gap-2">
            {symptomOptions.map((symptom) => (
              <Button
                key={symptom.value}
                type="button"
                variant="outline"
                className={`h-auto py-2 px-3 ${selectedSymptoms.includes(symptom.value) ? 'bg-yellow-100 border-yellow-300' : ''}`}
                onClick={() => handleSymptomToggle(symptom.value)}
              >
                <span className="text-xl mr-2">{symptom.icon}</span>
                <span>{symptom.label}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="text-sm font-medium mb-2 block">Additional notes</Label>
          <Textarea
            id="notes"
            placeholder="How does your body feel today? Any changes from yesterday?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        
        {/* Symptom intensity sliders - show only if symptoms selected */}
        {selectedSymptoms.length > 0 && (
          <div className="space-y-3 border-t pt-3">
            <Label className="text-sm font-medium block">Symptom intensity</Label>
            {selectedSymptoms.map((symptomValue) => {
              const symptom = symptomOptions.find(s => s.value === symptomValue);
              return (
                <div key={symptomValue} className="space-y-1">
                  <div className="flex items-center">
                    <span className="text-sm mr-2">{symptom?.icon}</span>
                    <span className="text-sm">{symptom?.label}</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      defaultValue="5"
                      className="flex-1"
                    />
                    <span className="ml-2 text-sm w-6 text-center">5</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button onClick={handleSave} className="w-full">
          Save Journal Entry
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MoodTracker;