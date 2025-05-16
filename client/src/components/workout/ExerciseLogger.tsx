import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface ExerciseLoggerProps {
  name: string;
  instructions: string[];
  sets: number;
  reps: string;
  videoUrl?: string | null;
  onChange?: (log: ExerciseLog) => void;
}

export interface ExerciseLog {
  exerciseName: string;
  repsCompleted: string;
  rpe: string;
  painLevel: string;
  notes: string;
}

export function ExerciseLogger({ name, instructions, sets, reps, videoUrl, onChange }: ExerciseLoggerProps) {
  const [log, setLog] = useState<ExerciseLog>({
    exerciseName: name,
    repsCompleted: '',
    rpe: '',
    painLevel: '',
    notes: ''
  });

  const handleChange = (field: keyof ExerciseLog, value: string) => {
    const updatedLog = { ...log, [field]: value };
    setLog(updatedLog);
    onChange?.(updatedLog);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">
          {name} – {sets} x {reps} reps
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Video section - use placeholder video if no video provided */}
      <div className="mb-4">
        <video 
          controls 
          className="w-full rounded-md h-auto max-h-[300px] bg-gray-100"
          src={videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
        />
      </div>
      
      <div className="mb-4">
        <p className="text-sm">
          {instructions.map((step, index) => (
            <span key={index}>
              {index + 1}. {step}<br />
            </span>
          ))}
        </p>
      </div>
      
      <Separator className="my-4" />
      
      <div className="log-section space-y-5">
        <h3 className="font-medium">Exercise Log</h3>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="repsCompleted">Reps Completed:</Label>
            <Input 
              id="repsCompleted" 
              type="number" 
              placeholder="e.g. 10"
              value={log.repsCompleted}
              onChange={(e) => handleChange('repsCompleted', e.target.value)}
              className="max-w-[200px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rpe">
              RPE (1–10):
              <span className="ml-1 text-xs text-muted-foreground">(Rate of Perceived Exertion)</span>
            </Label>
            <Input 
              id="rpe" 
              type="number" 
              min="1" 
              max="10"
              value={log.rpe}
              onChange={(e) => handleChange('rpe', e.target.value)}
              className="max-w-[200px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="painLevel">
              Pain Level (0–10):
              <span className="ml-1 text-xs text-muted-foreground">(0 = no pain, 10 = severe pain)</span>
            </Label>
            <Input 
              id="painLevel" 
              type="number" 
              min="0" 
              max="10"
              value={log.painLevel}
              onChange={(e) => handleChange('painLevel', e.target.value)}
              className="max-w-[200px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes:</Label>
            <Textarea 
              id="notes" 
              placeholder="Any comments, struggles, or adjustments..." 
              rows={3}
              value={log.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </div>
        </div>
      </div>
      </CardContent>
    </Card>
  );
}