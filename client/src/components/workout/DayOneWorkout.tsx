import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function DayOneWorkout() {
  const [userName, setUserName] = useState('');
  const [chestReps, setChestReps] = useState('');
  const [chestRPE, setChestRPE] = useState('');
  const [chestPain, setChestPain] = useState('');
  const [chestNotes, setChestNotes] = useState('');
  
  const [bicepReps, setBicepReps] = useState('');
  const [bicepRPE, setBicepRPE] = useState('');
  const [bicepPain, setBicepPain] = useState('');
  const [bicepNotes, setBicepNotes] = useState('');
  
  const [squatReps, setSquatReps] = useState('');
  const [squatRPE, setSquatRPE] = useState('');
  const [squatPain, setSquatPain] = useState('');
  const [squatNotes, setSquatNotes] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName) {
      toast({
        title: "Name Required",
        description: "Please enter your name before sending the log",
        variant: "destructive"
      });
      return;
    }
    
    // Prepare log data
    const logData = `
      Day 1 Log
      
      Name: ${userName}
      
      Seated Chest Press:
      Reps: ${chestReps}
      RPE: ${chestRPE}
      Pain: ${chestPain}
      Notes: ${chestNotes}
      
      Bicep Curls:
      Reps: ${bicepReps}
      RPE: ${bicepRPE}
      Pain: ${bicepPain}
      Notes: ${bicepNotes}
      
      Dumbbell Squats:
      Reps: ${squatReps}
      RPE: ${squatRPE}
      Pain: ${squatPain}
      Notes: ${squatNotes}
    `;
    
    // Normally this would use EmailJS
    toast({
      title: "Log Submitted Successfully",
      description: "Your workout log has been sent to your coach",
      variant: "default"
    });
    
    console.log("Workout log:", logData);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Day 1 – Full Body Start</h1>
      <p className="text-gray-600">Today's focus: Seated Chest Press, Bicep Curls, Dumbbell Squats</p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label htmlFor="userName">Your Name:</Label>
              <Input 
                id="userName" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Exercise 1 */}
        <Card>
          <CardHeader>
            <CardTitle>Seated Chest Press</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <video 
              controls 
              src="https://www.w3schools.com/html/mov_bbb.mp4" 
              className="w-full rounded-md h-auto max-h-[300px] bg-gray-100"
            />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chestReps">Reps Completed:</Label>
                <Input 
                  id="chestReps" 
                  value={chestReps}
                  onChange={(e) => setChestReps(e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chestRPE">RPE (1–10):</Label>
                <Input 
                  id="chestRPE" 
                  type="number" 
                  min="1" 
                  max="10"
                  value={chestRPE}
                  onChange={(e) => setChestRPE(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chestPain">Pain Level (0–10):</Label>
                <Input 
                  id="chestPain" 
                  type="number" 
                  min="0" 
                  max="10"
                  value={chestPain}
                  onChange={(e) => setChestPain(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chestNotes">Notes:</Label>
                <Textarea 
                  id="chestNotes" 
                  value={chestNotes}
                  onChange={(e) => setChestNotes(e.target.value)}
                  placeholder="Any comments, struggles, or adjustments..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Exercise 2 */}
        <Card>
          <CardHeader>
            <CardTitle>Bicep Curls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <video 
              controls 
              src="https://www.w3schools.com/html/movie.mp4" 
              className="w-full rounded-md h-auto max-h-[300px] bg-gray-100"
            />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bicepReps">Reps Completed:</Label>
                <Input 
                  id="bicepReps" 
                  value={bicepReps}
                  onChange={(e) => setBicepReps(e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bicepRPE">RPE (1–10):</Label>
                <Input 
                  id="bicepRPE" 
                  type="number" 
                  min="1" 
                  max="10"
                  value={bicepRPE}
                  onChange={(e) => setBicepRPE(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bicepPain">Pain Level (0–10):</Label>
                <Input 
                  id="bicepPain" 
                  type="number" 
                  min="0" 
                  max="10"
                  value={bicepPain}
                  onChange={(e) => setBicepPain(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bicepNotes">Notes:</Label>
                <Textarea 
                  id="bicepNotes" 
                  value={bicepNotes}
                  onChange={(e) => setBicepNotes(e.target.value)}
                  placeholder="Any comments, struggles, or adjustments..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Exercise 3 */}
        <Card>
          <CardHeader>
            <CardTitle>Dumbbell Squats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <video 
              controls 
              src="https://www.w3schools.com/html/mov_bbb.mp4" 
              className="w-full rounded-md h-auto max-h-[300px] bg-gray-100"
            />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="squatReps">Reps Completed:</Label>
                <Input 
                  id="squatReps" 
                  value={squatReps}
                  onChange={(e) => setSquatReps(e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="squatRPE">RPE (1–10):</Label>
                <Input 
                  id="squatRPE" 
                  type="number" 
                  min="1" 
                  max="10"
                  value={squatRPE}
                  onChange={(e) => setSquatRPE(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="squatPain">Pain Level (0–10):</Label>
                <Input 
                  id="squatPain" 
                  type="number" 
                  min="0" 
                  max="10"
                  value={squatPain}
                  onChange={(e) => setSquatPain(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="squatNotes">Notes:</Label>
                <Textarea 
                  id="squatNotes" 
                  value={squatNotes}
                  onChange={(e) => setSquatNotes(e.target.value)}
                  placeholder="Any comments, struggles, or adjustments..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          type="submit" 
          className="w-full py-6"
        >
          <Send className="mr-2 h-5 w-5" />
          Send My Log
        </Button>
      </form>
    </div>
  );
}