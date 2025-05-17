import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import WorkoutCalendar from '@/components/workout/WorkoutCalendar';

const WorkoutCalendarPage = () => {
  return (
    <div className="p-4 pb-16 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Workout Calendar</h1>
        </div>
        
        <Link href="/workout-days/day-one">
          <Button className="bg-green-500 hover:bg-green-600">
            <Plus className="h-4 w-4 mr-1" />
            New Workout
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <WorkoutCalendar />
      </div>
      
      <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3">Monthly Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Workouts</p>
            <p className="text-xl font-bold">5</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-xl font-bold">80%</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Avg RPE</p>
            <p className="text-xl font-bold">6.2</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Streak</p>
            <p className="text-xl font-bold">3 days</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-3">Recent Workouts</h2>
          <ul className="space-y-3">
            {[
              { date: 'May 15, 2025', type: 'Strength', status: 'Not Completed' },
              { date: 'May 11, 2025', type: 'Rest Day', status: 'Completed' },
              { date: 'May 8, 2025', type: 'Strength', status: 'Completed' }
            ].map((workout, index) => (
              <li key={index} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{workout.date}</p>
                  <p className="text-sm text-gray-500">{workout.type}</p>
                </div>
                <div className={`text-xs px-2 py-1 rounded ${workout.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {workout.status}
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-3">Upcoming Workouts</h2>
          <ul className="space-y-3">
            {[
              { date: 'May 18, 2025', type: 'Cardio', exercises: 'Walking, Stretching' },
              { date: 'May 20, 2025', type: 'Strength', exercises: 'Dumbbell Squats, Chest Press, Glute Bridge' },
              { date: 'May 23, 2025', type: 'Mixed', exercises: 'Light Cardio, Upper Body Strength' }
            ].map((workout, index) => (
              <li key={index} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{workout.date}</p>
                  <p className="text-sm text-gray-500">{workout.type}</p>
                  <p className="text-xs text-gray-400">{workout.exercises}</p>
                </div>
                <Link href="/workout-days/day-one">
                  <Button variant="outline" size="sm">Start</Button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendarPage;