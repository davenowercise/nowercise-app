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
      link: '/workout-days/day-one',
      color: '#4ade80' // green
    },
    {
      title: 'Day 2 – Core & Cardio',
      date: '2025-05-22',
      details: 'Marching on the spot, resistance band rows, 4-4 breathing.',
      link: '/workout-days/day-one',
      color: '#60a5fa' // blue
    },
    {
      title: 'Day 3 – Rest & Recovery',
      date: '2025-05-24',
      details: 'Mobility stretches and 4-4 breathing. Optional walk.',
      link: '/workout-days/recovery-day',
      color: '#c084fc' // purple
    },
    {
      title: 'Day 4 – Lower Body Focus',
      date: '2025-05-26',
      details: 'Chair squats, calf raises, seated leg extensions.',
      link: '/workout-days/day-one',
      color: '#4ade80' // green
    },
    {
      title: 'Day 5 – Upper Body Focus',
      date: '2025-05-28',
      details: 'Seated rows, shoulder press, tricep extensions.',
      link: '/workout-days/day-one',
      color: '#60a5fa' // blue
    },
    {
      title: 'Day 6 – Rest & Recovery',
      date: '2025-05-30',
      details: 'Deep breathing, gentle stretches, mindfulness.',
      link: '/workout-days/recovery-day',
      color: '#c084fc' // purple
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
    date: event.date,
    backgroundColor: event.color,
    borderColor: event.color
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