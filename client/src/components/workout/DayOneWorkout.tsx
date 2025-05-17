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
  
  const [showSummary, setShowSummary] = useState(false);
  
  // Format the current date for the log
  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Calculate average RPE across all exercises
  const calculateAverageRPE = () => {
    const validRPEs = [chestRPE, bicepRPE, squatRPE].filter(rpe => rpe !== '');
    if (validRPEs.length === 0) return 0;
    
    const sum = validRPEs.reduce((acc, curr) => acc + parseInt(curr), 0);
    return (sum / validRPEs.length).toFixed(1);
  };
  
  // Calculate highest pain level
  const calculateHighestPain = () => {
    return Math.max(
      parseInt(chestPain || '0'), 
      parseInt(bicepPain || '0'), 
      parseInt(squatPain || '0')
    );
  };
  
  // Create workout log text format
  const createLogData = () => {
    return `
Nowercise Workout Log - Day 1 (Full Body Start)
Date: ${formatDate()}
Client: ${userName}

EXERCISE SUMMARY:
----------------
1. Seated Chest Press:
   Reps: ${chestReps || '-'}
   RPE: ${chestRPE || '-'}/10
   Pain: ${chestPain || '0'}/10
   Notes: ${chestNotes || 'None'}

2. Bicep Curls:
   Reps: ${bicepReps || '-'}
   RPE: ${bicepRPE || '-'}/10
   Pain: ${bicepPain || '0'}/10
   Notes: ${bicepNotes || 'None'}

3. Dumbbell Squats:
   Reps: ${squatReps || '-'}
   RPE: ${squatRPE || '-'}/10
   Pain: ${squatPain || '0'}/10
   Notes: ${squatNotes || 'None'}

WORKOUT METRICS:
--------------
Average Intensity (RPE): ${calculateAverageRPE()}/10
Highest Pain Level: ${calculateHighestPain()}/10

Small Wins Matter! Keep going!
    `;
  };
  
  // Download workout log as a text file
  const downloadLog = () => {
    const logText = createLogData();
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
    
    // Show the summary view
    setShowSummary(true);
    
    // Prepare log data for email
    const logData = createLogData();
    
    // Normally this would use EmailJS to send to coach
    toast({
      title: "Log Submitted Successfully",
      description: "Your workout log has been saved",
      variant: "default"
    });
    
    console.log("Workout log:", logData);
  };
  
  return (
    <div className="space-y-6">
      {!showSummary ? (
        <>
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
                <p className="text-gray-500 mt-1">Target: 2-3 sets × 8-12 reps</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative rounded-md overflow-hidden bg-gray-100 h-[250px] flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <p className="text-gray-600 text-center p-4">
                      Exercise demonstration video would appear here.<br/>
                      <span className="text-sm">Seated chest press with resistance bands</span>
                    </p>
                  </div>
                </div>
                
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
                    <Label htmlFor="chestRPE">
                      RPE (1–10):
                      <span className="ml-1 text-xs text-muted-foreground">(Rate of Perceived Exertion)</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input 
                        id="chestRPE" 
                        type="range" 
                        min="1" 
                        max="10"
                        step="1"
                        value={chestRPE || "5"}
                        onChange={(e) => setChestRPE(e.target.value)}
                        className="w-full"
                      />
                      <span className="font-medium text-lg min-w-[25px]">{chestRPE || "-"}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Easy</span>
                      <span>Moderate</span>
                      <span>Hard</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="chestPain">
                      Pain Level (0–10):
                      <span className="ml-1 text-xs text-muted-foreground">(0 = no pain, 10 = severe pain)</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input 
                        id="chestPain" 
                        type="range" 
                        min="0" 
                        max="10"
                        step="1"
                        value={chestPain || "0"}
                        onChange={(e) => setChestPain(e.target.value)}
                        className="w-full"
                      />
                      <span className="font-medium text-lg min-w-[25px]">{chestPain || "0"}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>None</span>
                      <span>Moderate</span>
                      <span>Severe</span>
                    </div>
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
                <p className="text-gray-500 mt-1">Target: 3 sets × 8-10 reps</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative rounded-md overflow-hidden bg-gray-100 h-[250px] flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <p className="text-gray-600 text-center p-4">
                      Exercise demonstration video would appear here.<br/>
                      <span className="text-sm">Standing bicep curls with resistance bands</span>
                    </p>
                  </div>
                </div>
                
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
                    <Label htmlFor="bicepRPE">
                      RPE (1–10):
                      <span className="ml-1 text-xs text-muted-foreground">(Rate of Perceived Exertion)</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input 
                        id="bicepRPE" 
                        type="range" 
                        min="1" 
                        max="10"
                        step="1"
                        value={bicepRPE || "5"}
                        onChange={(e) => setBicepRPE(e.target.value)}
                        className="w-full"
                      />
                      <span className="font-medium text-lg min-w-[25px]">{bicepRPE || "-"}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Easy</span>
                      <span>Moderate</span>
                      <span>Hard</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bicepPain">
                      Pain Level (0–10):
                      <span className="ml-1 text-xs text-muted-foreground">(0 = no pain, 10 = severe pain)</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input 
                        id="bicepPain" 
                        type="range" 
                        min="0" 
                        max="10"
                        step="1"
                        value={bicepPain || "0"}
                        onChange={(e) => setBicepPain(e.target.value)}
                        className="w-full"
                      />
                      <span className="font-medium text-lg min-w-[25px]">{bicepPain || "0"}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>None</span>
                      <span>Moderate</span>
                      <span>Severe</span>
                    </div>
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
                <p className="text-gray-500 mt-1">Target: 2-3 sets × 8-12 reps</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative rounded-md overflow-hidden bg-gray-100 h-[250px] flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <p className="text-gray-600 text-center p-4">
                      Exercise demonstration video would appear here.<br/>
                      <span className="text-sm">Dumbbell squats with chair support if needed</span>
                    </p>
                  </div>
                </div>
                
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
                    <Label htmlFor="squatRPE">
                      RPE (1–10):
                      <span className="ml-1 text-xs text-muted-foreground">(Rate of Perceived Exertion)</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input 
                        id="squatRPE" 
                        type="range" 
                        min="1" 
                        max="10"
                        step="1"
                        value={squatRPE || "5"}
                        onChange={(e) => setSquatRPE(e.target.value)}
                        className="w-full"
                      />
                      <span className="font-medium text-lg min-w-[25px]">{squatRPE || "-"}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Easy</span>
                      <span>Moderate</span>
                      <span>Hard</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="squatPain">
                      Pain Level (0–10):
                      <span className="ml-1 text-xs text-muted-foreground">(0 = no pain, 10 = severe pain)</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input 
                        id="squatPain" 
                        type="range" 
                        min="0" 
                        max="10"
                        step="1"
                        value={squatPain || "0"}
                        onChange={(e) => setSquatPain(e.target.value)}
                        className="w-full"
                      />
                      <span className="font-medium text-lg min-w-[25px]">{squatPain || "0"}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>None</span>
                      <span>Moderate</span>
                      <span>Severe</span>
                    </div>
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
              Complete Workout
            </Button>
          </form>
        </>
      ) : (
        // Workout Summary View
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Workout Completed!</h1>
          <p className="text-gray-600">Great job, {userName}! Here's your workout summary.</p>
          
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Day 1 – Full Body Start</CardTitle>
              <p className="text-gray-500">{formatDate()}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Workout Summary</h3>
                    <p className="text-sm">
                      <span className="font-medium">Average RPE:</span> {calculateAverageRPE()}/10<br />
                      <span className="font-medium">Highest Pain Level:</span> {calculateHighestPain()}/10
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Completed Exercises</h3>
                    <ul className="list-disc pl-4 text-sm">
                      <li>Seated Chest Press ({chestReps || '-'} reps)</li>
                      <li>Bicep Curls ({bicepReps || '-'} reps)</li>
                      <li>Dumbbell Squats ({squatReps || '-'} reps)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col gap-4">
                  <Button onClick={downloadLog} className="w-full">
                    Download Workout Log
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSummary(false)}
                  >
                    Back to Workout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Exercise Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Seated Chest Press</h3>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Reps:</span> {chestReps || '-'}<br />
                    <span className="font-medium">RPE:</span> {chestRPE || '-'}/10<br />
                    <span className="font-medium">Pain:</span> {chestPain || '0'}/10<br />
                    <span className="font-medium">Notes:</span> {chestNotes || 'None'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Bicep Curls</h3>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Reps:</span> {bicepReps || '-'}<br />
                    <span className="font-medium">RPE:</span> {bicepRPE || '-'}/10<br />
                    <span className="font-medium">Pain:</span> {bicepPain || '0'}/10<br />
                    <span className="font-medium">Notes:</span> {bicepNotes || 'None'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Dumbbell Squats</h3>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Reps:</span> {squatReps || '-'}<br />
                    <span className="font-medium">RPE:</span> {squatRPE || '-'}/10<br />
                    <span className="font-medium">Pain:</span> {squatPain || '0'}/10<br />
                    <span className="font-medium">Notes:</span> {squatNotes || 'None'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}