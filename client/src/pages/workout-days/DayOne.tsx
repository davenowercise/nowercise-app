import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Download, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function DayOne() {
  // User info
  const [name, setName] = useState('');
  
  // Exercise 1 - Chest Press
  const [chestReps, setChestReps] = useState('10');
  const [chestRpe, setChestRpe] = useState('5');
  const [chestPain, setChestPain] = useState('0');
  const [chestNotes, setChestNotes] = useState('');
  
  // Exercise 2 - Bicep Curls
  const [bicepReps, setBicepReps] = useState('10');
  const [bicepRpe, setBicepRpe] = useState('5');
  const [bicepPain, setBicepPain] = useState('0');
  const [bicepNotes, setBicepNotes] = useState('');
  
  // Exercise 3 - Squats
  const [squatReps, setSquatReps] = useState('10');
  const [squatRpe, setSquatRpe] = useState('5');
  const [squatPain, setSquatPain] = useState('0');
  const [squatNotes, setSquatNotes] = useState('');
  
  // Completion state
  const [isComplete, setIsComplete] = useState(false);
  
  // Exercise data
  const exercises = [
    {
      id: "1",
      name: "Seated Chest Press",
      instruction: "Seated chest press with resistance bands",
      reps: chestReps,
      setReps: setChestReps,
      rpe: chestRpe,
      setRpe: setChestRpe,
      pain: chestPain,
      setPain: setChestPain,
      notes: chestNotes,
      setNotes: setChestNotes
    },
    {
      id: "2",
      name: "Bicep Curls",
      instruction: "Standing bicep curls with resistance bands",
      reps: bicepReps,
      setReps: setBicepReps,
      rpe: bicepRpe,
      setRpe: setBicepRpe,
      pain: bicepPain,
      setPain: setBicepPain,
      notes: bicepNotes,
      setNotes: setBicepNotes
    },
    {
      id: "3",
      name: "Dumbbell Squats",
      instruction: "Dumbbell squats with chair support if needed",
      reps: squatReps,
      setReps: setSquatReps,
      rpe: squatRpe,
      setRpe: setSquatRpe,
      pain: squatPain,
      setPain: setSquatPain,
      notes: squatNotes,
      setNotes: setSquatNotes
    }
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Please enter your name",
        description: "Your name is required for tracking",
        variant: "destructive"
      });
      return;
    }
    
    setIsComplete(true);
    toast({
      title: "Workout logged successfully!",
      description: "Great job completing your exercise!",
    });
  };
  
  const downloadLog = () => {
    const logText = `
Nowercise Workout Log - Day 1
Date: ${new Date().toLocaleDateString()}
Name: ${name}

Exercise Summary:
----------------
1. Seated Chest Press:
   Reps: ${chestReps || '-'}
   RPE: ${chestRpe}/10
   Pain: ${chestPain}/10
   Notes: ${chestNotes || 'None'}

2. Bicep Curls:
   Reps: ${bicepReps || '-'}
   RPE: ${bicepRpe}/10
   Pain: ${bicepPain}/10
   Notes: ${bicepNotes || 'None'}
   
3. Dumbbell Squats:
   Reps: ${squatReps || '-'}
   RPE: ${squatRpe}/10
   Pain: ${squatPain}/10
   Notes: ${squatNotes || 'None'}

Small Wins Matter!
    `;
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nowercise_log_day1_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Single Exercise Component
  const ExerciseForm = ({ exercise }: { exercise: any }) => {
    return (
      <div className="space-y-3 pt-2">
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-center text-gray-600 p-2">
            <span className="text-sm">{exercise.instruction}</span>
          </p>
        </div>
        
        <div>
          <Label htmlFor={`${exercise.id}-reps`}>Reps Completed:</Label>
          <Input 
            id={`${exercise.id}-reps`}
            value={exercise.reps}
            onChange={(e) => exercise.setReps(e.target.value)}
            placeholder="e.g. 10"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor={`${exercise.id}-rpe`}>
            RPE (1-10):
            <span className="ml-1 text-xs text-gray-500">(Perceived Exertion)</span>
          </Label>
          <div className="flex items-center mt-1">
            <input 
              id={`${exercise.id}-rpe`}
              type="range" 
              min="1" 
              max="10" 
              value={exercise.rpe}
              onChange={(e) => exercise.setRpe(e.target.value)}
              className="flex-1"
            />
            <span className="ml-2 font-medium w-6">{exercise.rpe}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Easy</span>
            <span>Hard</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor={`${exercise.id}-pain`}>
            Pain (0-10):
            <span className="ml-1 text-xs text-gray-500">(0 = none, 10 = severe)</span>
          </Label>
          <div className="flex items-center mt-1">
            <input 
              id={`${exercise.id}-pain`}
              type="range" 
              min="0" 
              max="10" 
              value={exercise.pain}
              onChange={(e) => exercise.setPain(e.target.value)}
              className="flex-1"
            />
            <span className="ml-2 font-medium w-6">{exercise.pain}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>None</span>
            <span>Severe</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor={`${exercise.id}-notes`}>Notes:</Label>
          <Textarea 
            id={`${exercise.id}-notes`}
            value={exercise.notes}
            onChange={(e) => exercise.setNotes(e.target.value)}
            placeholder="Any comments about this exercise..."
            className="mt-1"
            rows={2}
          />
        </div>
      </div>
    );
  };
  
  // Show completion screen
  if (isComplete) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Workout Complete!</h1>
        <p className="mb-6">Great job, {name}! You've completed your workout.</p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h2 className="font-bold mb-2">Workout Summary</h2>
          {exercises.map((ex, index) => (
            <p key={index}>
              <strong>{ex.name}:</strong> {ex.reps} reps, RPE: {ex.rpe}/10
            </p>
          ))}
        </div>
        
        <Button onClick={downloadLog} className="w-full mb-2">
          <Download className="mr-2 h-4 w-4" />
          Download Log
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setIsComplete(false)} 
          className="w-full"
        >
          Back to Workout
        </Button>
      </div>
    );
  }
  
  // Main workout form
  return (
    <div className="container mx-auto py-6 px-4 max-w-md pb-24">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-2xl font-bold">Day 1 – Full Body Start</h1>
        
        <div className="space-y-3 mb-4">
          <div>
            <Label htmlFor="name">Your Name:</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="mt-1"
            />
          </div>
        </div>
        
        <Accordion type="single" collapsible defaultValue="1" className="w-full">
          {exercises.map((exercise) => (
            <AccordionItem value={exercise.id} key={exercise.id} className="border rounded-lg mb-3 px-2">
              <AccordionTrigger className="py-3">
                <span className="font-medium">{exercise.name}</span>
              </AccordionTrigger>
              <AccordionContent>
                <ExerciseForm exercise={exercise} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50">
          <Button 
            type="submit" 
            className="w-full py-5 shadow-lg font-bold"
            style={{backgroundColor: "#4ade80", color: "black"}}
          >
            <Check className="mr-2 h-5 w-5" />
            COMPLETE WORKOUT
          </Button>
        </div>
      </form>
    </div>
  );
}