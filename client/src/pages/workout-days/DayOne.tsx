import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Download, Check, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DayOne() {
  // User info
  const [name, setName] = useState('');
  
  // Exercise 1 - Dumbbell Squats
  const [squatSet1, setSquatSet1] = useState('');
  const [squatSet2, setSquatSet2] = useState('');
  const [squatSet3, setSquatSet3] = useState('');
  const [squatRpe, setSquatRpe] = useState('5');
  const [squatPain, setSquatPain] = useState('0');
  const [squatNotes, setSquatNotes] = useState('');
  
  // Exercise 2 - Chest Press
  const [chestSet1, setChestSet1] = useState('');
  const [chestSet2, setChestSet2] = useState('');
  const [chestSet3, setChestSet3] = useState('');
  const [chestRpe, setChestRpe] = useState('5');
  const [chestPain, setChestPain] = useState('0');
  const [chestNotes, setChestNotes] = useState('');
  
  // Exercise 3 - Glute Bridge
  const [gluteSet1, setGluteSet1] = useState('');
  const [gluteSet2, setGluteSet2] = useState('');
  const [gluteSet3, setGluteSet3] = useState('');
  const [gluteRpe, setGluteRpe] = useState('5');
  const [glutePain, setGlutePain] = useState('0');
  const [gluteNotes, setGluteNotes] = useState('');
  
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
1. Dumbbell Squats:
   Set 1: ${squatSet1 || '-'} reps
   Set 2: ${squatSet2 || '-'} reps
   Set 3: ${squatSet3 || '-'} reps
   RPE: ${squatRpe}/10
   Pain: ${squatPain}/10
   Notes: ${squatNotes || 'None'}

2. Seated Chest Press:
   Set 1: ${chestSet1 || '-'} reps
   Set 2: ${chestSet2 || '-'} reps
   Set 3: ${chestSet3 || '-'} reps
   RPE: ${chestRpe}/10
   Pain: ${chestPain}/10
   Notes: ${chestNotes || 'None'}
   
3. Single Leg Glute Bridge:
   Set 1: ${gluteSet1 || '-'} reps
   Set 2: ${gluteSet2 || '-'} reps
   Set 3: ${gluteSet3 || '-'} reps
   RPE: ${gluteRpe}/10
   Pain: ${glutePain}/10
   Notes: ${gluteNotes || 'None'}

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
          <div className="space-y-3">
            <div>
              <p><strong>Dumbbell Squats:</strong></p>
              <p className="text-sm">Set 1: {squatSet1 || '-'} reps | Set 2: {squatSet2 || '-'} reps | Set 3: {squatSet3 || '-'} reps</p>
              <p className="text-sm">RPE: {squatRpe}/10 | Pain: {squatPain}/10</p>
            </div>
            
            <div>
              <p><strong>Seated Chest Press:</strong></p>
              <p className="text-sm">Set 1: {chestSet1 || '-'} reps | Set 2: {chestSet2 || '-'} reps | Set 3: {chestSet3 || '-'} reps</p>
              <p className="text-sm">RPE: {chestRpe}/10 | Pain: {chestPain}/10</p>
            </div>
            
            <div>
              <p><strong>Single Leg Glute Bridge:</strong></p>
              <p className="text-sm">Set 1: {gluteSet1 || '-'} reps | Set 2: {gluteSet2 || '-'} reps | Set 3: {gluteSet3 || '-'} reps</p>
              <p className="text-sm">RPE: {gluteRpe}/10 | Pain: {glutePain}/10</p>
            </div>
          </div>
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
  
  // Main workout form - new view similar to the HTML example
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
        
        {/* Exercise 1 - Dumbbell Squats */}
        <Card className="bg-white shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Dumbbell Squats</CardTitle>
            <p className="text-gray-500 text-sm"><em>With chair support if needed</em></p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="squat-set1">Set 1: Reps</Label>
              <Input 
                id="squat-set1" 
                type="number"
                value={squatSet1}
                onChange={(e) => setSquatSet1(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="squat-set2">Set 2: Reps</Label>
              <Input 
                id="squat-set2" 
                type="number"
                value={squatSet2}
                onChange={(e) => setSquatSet2(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="squat-set3">Set 3: Reps</Label>
              <Input 
                id="squat-set3" 
                type="number"
                value={squatSet3}
                onChange={(e) => setSquatSet3(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="squat-rpe">RPE (1-10)</Label>
              <div className="flex items-center mt-1">
                <input 
                  id="squat-rpe" 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={squatRpe}
                  onChange={(e) => setSquatRpe(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 font-medium w-6">{squatRpe}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Easy</span>
                <span>Hard</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="squat-pain">Pain Level (0-10)</Label>
              <div className="flex items-center mt-1">
                <input 
                  id="squat-pain" 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={squatPain}
                  onChange={(e) => setSquatPain(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 font-medium w-6">{squatPain}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>None</span>
                <span>Severe</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="squat-notes">Notes</Label>
              <Textarea 
                id="squat-notes" 
                value={squatNotes}
                onChange={(e) => setSquatNotes(e.target.value)}
                placeholder="Any comments about this exercise..."
                className="mt-1"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Exercise 2 - Chest Press */}
        <Card className="bg-white shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Seated Chest Press</CardTitle>
            <p className="text-gray-500 text-sm"><em>With resistance bands</em></p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="chest-set1">Set 1: Reps</Label>
              <Input 
                id="chest-set1" 
                type="number"
                value={chestSet1}
                onChange={(e) => setChestSet1(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="chest-set2">Set 2: Reps</Label>
              <Input 
                id="chest-set2" 
                type="number"
                value={chestSet2}
                onChange={(e) => setChestSet2(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="chest-set3">Set 3: Reps</Label>
              <Input 
                id="chest-set3" 
                type="number"
                value={chestSet3}
                onChange={(e) => setChestSet3(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="chest-rpe">RPE (1-10)</Label>
              <div className="flex items-center mt-1">
                <input 
                  id="chest-rpe" 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={chestRpe}
                  onChange={(e) => setChestRpe(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 font-medium w-6">{chestRpe}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Easy</span>
                <span>Hard</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="chest-pain">Pain Level (0-10)</Label>
              <div className="flex items-center mt-1">
                <input 
                  id="chest-pain" 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={chestPain}
                  onChange={(e) => setChestPain(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 font-medium w-6">{chestPain}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>None</span>
                <span>Severe</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="chest-notes">Notes</Label>
              <Textarea 
                id="chest-notes" 
                value={chestNotes}
                onChange={(e) => setChestNotes(e.target.value)}
                placeholder="Any comments about this exercise..."
                className="mt-1"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Exercise 3 - Glute Bridge */}
        <Card className="bg-white shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Single Leg Glute Bridge</CardTitle>
            <p className="text-gray-500 text-sm"><em>Keep back flat, use mat if needed</em></p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="glute-set1">Set 1: Reps</Label>
              <Input 
                id="glute-set1" 
                type="number"
                value={gluteSet1}
                onChange={(e) => setGluteSet1(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="glute-set2">Set 2: Reps</Label>
              <Input 
                id="glute-set2" 
                type="number"
                value={gluteSet2}
                onChange={(e) => setGluteSet2(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="glute-set3">Set 3: Reps</Label>
              <Input 
                id="glute-set3" 
                type="number"
                value={gluteSet3}
                onChange={(e) => setGluteSet3(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="glute-rpe">RPE (1-10)</Label>
              <div className="flex items-center mt-1">
                <input 
                  id="glute-rpe" 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={gluteRpe}
                  onChange={(e) => setGluteRpe(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 font-medium w-6">{gluteRpe}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Easy</span>
                <span>Hard</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="glute-pain">Pain Level (0-10)</Label>
              <div className="flex items-center mt-1">
                <input 
                  id="glute-pain" 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={glutePain}
                  onChange={(e) => setGlutePain(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 font-medium w-6">{glutePain}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>None</span>
                <span>Severe</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="glute-notes">Notes</Label>
              <Textarea 
                id="glute-notes" 
                value={gluteNotes}
                onChange={(e) => setGluteNotes(e.target.value)}
                placeholder="Any comments about this exercise..."
                className="mt-1"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50">
          <Button 
            type="submit" 
            className="w-full py-5 shadow-lg font-bold"
            style={{backgroundColor: "#4ade80", color: "black"}}
          >
            <Send className="mr-2 h-5 w-5" />
            SEND WORKOUT LOG
          </Button>
        </div>
      </form>
    </div>
  );
}