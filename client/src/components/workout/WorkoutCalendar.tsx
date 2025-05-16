import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Card } from '@/components/ui/card';

interface WorkoutEvent {
  title: string;
  date: string;
  details: string;
  link: string;
}

interface WorkoutCalendarProps {
  onSelectWorkout: (workout: WorkoutEvent) => void;
}

export function WorkoutCalendar({ onSelectWorkout }: WorkoutCalendarProps) {
  // Sample workout events - in a real app, these would come from an API
  const workoutEvents = [
    {
      title: 'Day 1 – Full Body Start',
      date: '2025-05-20',
      details: 'Seated Chest Press, Bicep Curls, Dumbbell Squats. Focus on form.',
      link: '/workout-days/day-one'
    },
    {
      title: 'Day 2 – Core & Cardio',
      date: '2025-05-22',
      details: 'Marching on the spot, resistance band rows, 4-4 breathing.',
      link: '/workout-days/day-one'
    },
    {
      title: 'Day 3 – Rest & Recovery',
      date: '2025-05-24',
      details: 'Mobility stretches and 4-4 breathing. Optional walk.',
      link: '/workout-plan'
    }
  ];

  const handleEventClick = (info: any) => {
    const eventIndex = parseInt(info.event.id);
    onSelectWorkout(workoutEvents[eventIndex]);
  };

  // Format events for FullCalendar
  const calendarEvents = workoutEvents.map((event, index) => ({
    id: index.toString(),
    title: event.title,
    date: event.date
  }));

  return (
    <Card className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        events={calendarEvents}
        eventClick={handleEventClick}
        height="auto"
      />
    </Card>
  );
}