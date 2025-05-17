import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';

interface MoodOption {
  emoji: string;
  label: string;
  value: string;
}

interface QuickMoodCheckProps {
  onComplete?: (data: { mood: string, skipped: boolean }) => void;
}

// Mood options with emojis
const moodOptions: MoodOption[] = [
  { emoji: '😊', label: 'Great', value: 'great' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😕', label: 'Low', value: 'low' },
  { emoji: '😞', label: 'Poor', value: 'poor' }
];

const QuickMoodCheck: React.FC<QuickMoodCheckProps> = ({ onComplete }) => {
  const [selected, setSelected] = useState<string | null>(null);
  
  const handleSelect = (value: string) => {
    setSelected(value);
  };
  
  const handleSkip = () => {
    if (onComplete) {
      onComplete({ mood: '', skipped: true });
    }
  };
  
  const handleSave = () => {
    if (!selected) {
      toast({
        title: "Please select your mood",
        description: "Tap on an emoji to log how you're feeling",
        variant: "destructive"
      });
      return;
    }
    
    if (onComplete) {
      onComplete({ mood: selected, skipped: false });
    }
    
    toast({
      title: "Mood logged",
      description: "Your mood has been saved"
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling after your workout?</CardTitle>
        <CardDescription>This helps track how exercise affects your wellbeing</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-center gap-2 sm:gap-4">
          {moodOptions.map((mood) => (
            <div 
              key={mood.value}
              className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all ${
                selected === mood.value ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelect(mood.value)}
            >
              <span className="text-3xl sm:text-4xl mb-1">{mood.emoji}</span>
              <span className="text-xs">{mood.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={handleSkip}>Skip</Button>
        <Button onClick={handleSave}>
          <Check className="h-4 w-4 mr-1" />
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuickMoodCheck;