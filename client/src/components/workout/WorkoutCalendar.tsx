import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Dumbbell } from 'lucide-react';
import { Link } from 'wouter';

// Mock workout history data - this would be fetched from an API in a real app
interface WorkoutDay {
  date: Date;
  type: 'strength' | 'cardio' | 'mixed' | 'rest';
  completed: boolean;
  exercises?: string[];
}

// Example workout history for demonstration
const mockWorkoutHistory: WorkoutDay[] = [
  {
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 2),
    type: 'strength',
    completed: true,
    exercises: ['Dumbbell Squats', 'Chest Press', 'Glute Bridge']
  },
  {
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
    type: 'cardio',
    completed: true,
    exercises: ['Walking', 'Stretching']
  },
  {
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 8),
    type: 'strength',
    completed: true,
    exercises: ['Dumbbell Squats', 'Chest Press', 'Glute Bridge']
  },
  {
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 11),
    type: 'rest',
    completed: true
  },
  {
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    type: 'strength',
    completed: false,
    exercises: ['Dumbbell Squats', 'Chest Press', 'Glute Bridge']
  }
];

const WorkoutCalendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Helper to check if a date has a workout
  const hasWorkout = (date: Date): WorkoutDay | undefined => {
    return mockWorkoutHistory.find(workout => 
      isSameDay(workout.date, date)
    );
  };

  // Get color based on workout type
  const getWorkoutTypeColor = (type: WorkoutDay['type']) => {
    switch (type) {
      case 'strength':
        return 'bg-action-blue';
      case 'cardio':
        return 'bg-blue-500';
      case 'mixed':
        return 'bg-purple-500';
      case 'rest':
        return 'bg-gray-400';
      default:
        return 'bg-gray-200';
    }
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Calendar day render function
  const renderDay = (day: Date) => {
    const workout = hasWorkout(day);
    
    return (
      <div 
        key={day.toString()} 
        className={`h-12 w-12 p-1 relative flex items-center justify-center 
          ${isSameMonth(day, currentMonth) ? '' : 'text-gray-300'} 
          ${isSameDay(day, new Date()) ? 'border border-blue-500 rounded-full' : ''} 
          ${selectedDay && isSameDay(day, selectedDay) ? 'bg-blue-100 rounded-full' : ''}
          ${workout ? 'cursor-pointer' : ''}
        `}
        onClick={() => workout && setSelectedDay(day)}
      >
        {day.getDate()}
        {workout && (
          <div className={`absolute bottom-1 inset-x-0 mx-auto w-4 h-1 rounded-full ${getWorkoutTypeColor(workout.type)}`}></div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Workout History</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {eachDayOfInterval({
          start: startOfMonth(currentMonth),
          end: endOfMonth(currentMonth)
        }).map(day => renderDay(day))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-action-blue"></div>
          <span>Strength</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Cardio</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>Mixed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span>Rest Day</span>
        </div>
      </div>

      {/* Selected day details */}
      {selectedDay && hasWorkout(selectedDay) && (
        <Card className="p-4 mt-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">
                {format(selectedDay, 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="flex items-center mt-1">
                <Badge 
                  className={`${getWorkoutTypeColor(hasWorkout(selectedDay)!.type)} text-white`}
                >
                  {hasWorkout(selectedDay)!.type.charAt(0).toUpperCase() + hasWorkout(selectedDay)!.type.slice(1)}
                </Badge>
                <Badge className={`ml-2 ${hasWorkout(selectedDay)!.completed ? 'bg-info-panel text-action-blue' : 'bg-yellow-100 text-yellow-800'}`}>
                  {hasWorkout(selectedDay)!.completed ? 'Completed' : 'Not Completed'}
                </Badge>
              </div>
            </div>
            {hasWorkout(selectedDay)!.type !== 'rest' && (
              <Link href={`/workout-days/day-one`}>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <Dumbbell className="h-3 w-3" />
                  <span>View Workout</span>
                </Button>
              </Link>
            )}
          </div>

          {hasWorkout(selectedDay)!.exercises && (
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Exercises:</h4>
              <ul className="ml-4 list-disc text-sm space-y-1">
                {hasWorkout(selectedDay)!.exercises!.map((exercise, index) => (
                  <li key={index}>{exercise}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default WorkoutCalendar;