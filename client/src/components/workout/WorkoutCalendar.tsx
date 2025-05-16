import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface WorkoutEvent {
  title: string;
  date: string;
  details: string;
  link: string;
  color: string;
  type?: 'strength' | 'cardio' | 'recovery';
}

interface WorkoutCalendarProps {
  onSelectWorkout: (workout: WorkoutEvent) => void;
}

export function WorkoutCalendar({ onSelectWorkout }: WorkoutCalendarProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['strength', 'cardio', 'recovery']);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  // 4-Week Program - 12 workout days (3 per week)
  const workoutEvents = [
    // Week 1
    {
      title: 'Day 1 – Full Body Start',
      date: '2025-05-20',
      details: 'Seated Chest Press, Bicep Curls, Dumbbell Squats. Focus on form.',
      link: '/workout-days/day-one',
      color: '#4ade80', // green - strength
      type: 'strength'
    },
    {
      title: 'Day 2 – Core & Cardio',
      date: '2025-05-22',
      details: 'Marching on the spot, resistance band rows, 4-4 breathing.',
      link: '/workout-days/day-one',
      color: '#60a5fa', // blue - cardio
      type: 'cardio'
    },
    {
      title: 'Day 3 – Rest & Recovery',
      date: '2025-05-24',
      details: 'Mobility stretches and 4-4 breathing. Optional walk.',
      link: '/workout-days/recovery-day',
      color: '#c084fc', // purple - recovery
      type: 'recovery'
    },
    
    // Week 2
    {
      title: 'Day 4 – Lower Body Focus',
      date: '2025-05-27',
      details: 'Chair squats, calf raises, seated leg extensions.',
      link: '/workout-days/day-one',
      color: '#4ade80' // green
    },
    {
      title: 'Day 5 – Upper Body Focus',
      date: '2025-05-29',
      details: 'Seated rows, shoulder press, tricep extensions.',
      link: '/workout-days/day-one',
      color: '#60a5fa' // blue
    },
    {
      title: 'Day 6 – Rest & Recovery',
      date: '2025-05-31',
      details: 'Deep breathing, gentle stretches, mindfulness.',
      link: '/workout-days/recovery-day',
      color: '#c084fc' // purple
    },
    
    // Week 3
    {
      title: 'Day 7 – Full Body Progression',
      date: '2025-06-03',
      details: 'Standing chest press, bicep curls, bodyweight squats with support.',
      link: '/workout-days/day-one',
      color: '#4ade80' // green
    },
    {
      title: 'Day 8 – Cardio & Balance',
      date: '2025-06-05',
      details: 'Seated marching, wall push-ups, seated leg lifts.',
      link: '/workout-days/day-one',
      color: '#60a5fa' // blue
    },
    {
      title: 'Day 9 – Rest & Recovery',
      date: '2025-06-07',
      details: 'Walking meditation, gentle stretching, breathing exercises.',
      link: '/workout-days/recovery-day',
      color: '#c084fc' // purple
    },
    
    // Week 4
    {
      title: 'Day 10 – Functional Movements',
      date: '2025-06-10',
      details: 'Chair sit-to-stands, countertop push-ups, doorway stretches.',
      link: '/workout-days/day-one',
      color: '#4ade80' // green
    },
    {
      title: 'Day 11 – Endurance Focus',
      date: '2025-06-12',
      details: 'Extended cardio intervals, resistance band circuit, balance work.',
      link: '/workout-days/day-one',
      color: '#60a5fa' // blue
    },
    {
      title: 'Day 12 – Recovery & Reflection',
      date: '2025-06-14',
      details: 'Full body gentle stretching, progress review, plan forward.',
      link: '/workout-days/recovery-day',
      color: '#c084fc' // purple
    }
  ];

  const handleEventClick = (info: any) => {
    const eventIndex = parseInt(info.event.id);
    onSelectWorkout(filteredEvents[eventIndex] as WorkoutEvent);
  };

  // Format events for FullCalendar
  // Update filtered events when selected types change
  useEffect(() => {
    // Add type information to all events based on color if not explicitly set
    const typedEvents = workoutEvents.map(event => {
      if (event.type) return event;
      
      // Infer type from color if not set
      let type: 'strength' | 'cardio' | 'recovery' = 'strength';
      if (event.color === '#60a5fa') type = 'cardio';
      if (event.color === '#c084fc') type = 'recovery';
      
      return { ...event, type };
    });
    
    // Filter events based on selected types
    const filtered = typedEvents.filter(event => 
      selectedTypes.includes(event.type || '')
    );
    
    setFilteredEvents(filtered);
  }, [selectedTypes]);
  
  const calendarEvents = filteredEvents.map((event, index) => ({
    id: index.toString(),
    title: event.title,
    date: event.date,
    backgroundColor: event.color,
    borderColor: event.color
  }));

  // Toggle a workout type in the filter
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="text-sm font-medium mr-2 self-center">Filter workouts:</div>
        <Badge 
          variant={selectedTypes.includes('strength') ? "default" : "outline"}
          className="cursor-pointer"
          style={{backgroundColor: selectedTypes.includes('strength') ? '#4ade80' : 'transparent'}}
          onClick={() => toggleType('strength')}
        >
          Strength
        </Badge>
        <Badge 
          variant={selectedTypes.includes('cardio') ? "default" : "outline"}
          className="cursor-pointer"
          style={{backgroundColor: selectedTypes.includes('cardio') ? '#60a5fa' : 'transparent'}}
          onClick={() => toggleType('cardio')}
        >
          Cardio
        </Badge>
        <Badge 
          variant={selectedTypes.includes('recovery') ? "default" : "outline"}
          className="cursor-pointer"
          style={{backgroundColor: selectedTypes.includes('recovery') ? '#c084fc' : 'transparent'}}
          onClick={() => toggleType('recovery')}
        >
          Recovery
        </Badge>
      </div>
      
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