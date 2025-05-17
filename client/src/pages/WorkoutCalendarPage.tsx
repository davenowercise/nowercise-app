import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { WorkoutCalendar } from '@/components/workout/WorkoutCalendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function WorkoutCalendarPage() {
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Your Workout Calendar</h1>
      
      {selectedWorkout ? (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedWorkout(null)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calendar
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>{selectedWorkout.title}</CardTitle>
              <CardDescription>{selectedWorkout.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{selectedWorkout.details}</p>
              <Button 
                className="mt-4 w-full"
                onClick={() => window.location.href = selectedWorkout.link}
              >
                Start Workout
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <WorkoutCalendar onSelectWorkout={setSelectedWorkout} />
      )}
    </div>
  );
}