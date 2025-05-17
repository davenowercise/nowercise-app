import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Download, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function DayOne() {
  // User info
  const [name, setName] = useState('');
  
  // Exercise data 
  const [reps, setReps] = useState('10');
  const [rpe, setRpe] = useState('5');
  const [pain, setPain] = useState('0');
  const [notes, setNotes] = useState('');
  
  // Completion state
  const [isComplete, setIsComplete] = useState(false);
  
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
Dumbbell Squats:
Reps: ${reps || '-'}
RPE: ${rpe}/10
Pain: ${pain}/10
Notes: ${notes || 'None'}

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
  
  // Show completion screen
  if (isComplete) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Workout Complete!</h1>
        <p className="mb-6">Great job, {name}! You've completed your workout.</p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h2 className="font-bold mb-2">Workout Summary</h2>
          <p><strong>Dumbbell Squats:</strong> {reps} reps</p>
          <p><strong>Effort Level:</strong> {rpe}/10</p>
          <p><strong>Pain Level:</strong> {pain}/10</p>
          {notes && (
            <>
              <p className="font-medium mt-2">Notes:</p>
              <p className="text-sm">{notes}</p>
            </>
          )}
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
    <div className="container mx-auto py-6 px-4 max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-2xl font-bold">Day 1 - Dumbbell Squats</h1>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-center text-gray-600 p-4">
            Exercise demonstration would appear here.<br/>
            <span className="text-sm">Dumbbell squats with chair support if needed</span>
          </p>
        </div>
        
        <div className="space-y-3">
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
          
          <div>
            <Label htmlFor="reps">Reps Completed:</Label>
            <Input 
              id="reps" 
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="e.g. 10"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="rpe">
              RPE (1-10):
              <span className="ml-1 text-xs text-gray-500">(Rate of Perceived Exertion)</span>
            </Label>
            <div className="flex items-center mt-1">
              <input 
                id="rpe" 
                type="range" 
                min="1" 
                max="10" 
                value={rpe}
                onChange={(e) => setRpe(e.target.value)}
                className="flex-1"
              />
              <span className="ml-2 font-medium w-6">{rpe}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Easy</span>
              <span>Hard</span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="pain">
              Pain Level (0-10):
              <span className="ml-1 text-xs text-gray-500">(0 = no pain, 10 = severe)</span>
            </Label>
            <div className="flex items-center mt-1">
              <input 
                id="pain" 
                type="range" 
                min="0" 
                max="10" 
                value={pain}
                onChange={(e) => setPain(e.target.value)}
                className="flex-1"
              />
              <span className="ml-2 font-medium w-6">{pain}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>None</span>
              <span>Severe</span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes:</Label>
            <Textarea 
              id="notes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any comments about your workout..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50">
          <Button 
            type="submit" 
            className="w-full py-6 shadow-lg font-bold"
            style={{backgroundColor: "#4ade80", color: "black"}}
          >
            <Check className="mr-2 h-5 w-5" />
            COMPLETE WORKOUT
          </Button>
        </div>
        <div className="h-24"></div>
      </form>
    </div>
  );
}