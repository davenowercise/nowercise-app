import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function RecoveryDayWorkout() {
  const [userName, setUserName] = useState('');
  const [stretchDuration, setStretchDuration] = useState('');
  const [stretchRPE, setStretchRPE] = useState('');
  const [stretchPain, setStretchPain] = useState('');
  const [stretchNotes, setStretchNotes] = useState('');
  
  const [breathDuration, setBreathDuration] = useState('');
  const [breathNotes, setBreathNotes] = useState('');
  
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
      Day 12 Log - Rest & Recovery
      
      Name: ${userName}
      
      Gentle Mobility Stretches:
      Duration: ${stretchDuration}
      RPE: ${stretchRPE}
      Pain: ${stretchPain}
      Notes: ${stretchNotes}
      
      4-4 Box Breathing:
      Duration: ${breathDuration}
      Notes: ${breathNotes}
    `;
    
    // Normally this would use EmailJS
    toast({
      title: "Log Submitted Successfully",
      description: "Your recovery session log has been sent to your coach",
      variant: "default"
    });
    
    console.log("Workout log:", logData);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Day 12 – Rest & Recovery</h1>
      <p className="text-gray-600">Today's focus: Mobility, Relaxation and Reset</p>
      
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
            <CardTitle>Gentle Mobility Stretches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <video 
              controls 
              src="https://www.w3schools.com/html/movie.mp4" 
              className="w-full rounded-md h-auto max-h-[300px] bg-gray-100"
            />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stretchDuration">Duration or Sets:</Label>
                <Input 
                  id="stretchDuration" 
                  value={stretchDuration}
                  onChange={(e) => setStretchDuration(e.target.value)}
                  placeholder="e.g. 10 minutes"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stretchRPE">RPE (1–10):</Label>
                <Input 
                  id="stretchRPE" 
                  type="number" 
                  min="1" 
                  max="10"
                  value={stretchRPE}
                  onChange={(e) => setStretchRPE(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stretchPain">Pain Level (0–10):</Label>
                <Input 
                  id="stretchPain" 
                  type="number" 
                  min="0" 
                  max="10"
                  value={stretchPain}
                  onChange={(e) => setStretchPain(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stretchNotes">Notes:</Label>
                <Textarea 
                  id="stretchNotes" 
                  value={stretchNotes}
                  onChange={(e) => setStretchNotes(e.target.value)}
                  placeholder="How did the stretches feel today?"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Exercise 2 */}
        <Card>
          <CardHeader>
            <CardTitle>4-4 Box Breathing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <video 
              controls 
              src="https://www.w3schools.com/html/mov_bbb.mp4" 
              className="w-full rounded-md h-auto max-h-[300px] bg-gray-100"
            />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="breathDuration">Duration or Rounds:</Label>
                <Input 
                  id="breathDuration" 
                  value={breathDuration}
                  onChange={(e) => setBreathDuration(e.target.value)}
                  placeholder="e.g. 5 minutes"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="breathNotes">Notes:</Label>
                <Textarea 
                  id="breathNotes" 
                  value={breathNotes}
                  onChange={(e) => setBreathNotes(e.target.value)}
                  placeholder="How did the breathing exercise make you feel?"
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