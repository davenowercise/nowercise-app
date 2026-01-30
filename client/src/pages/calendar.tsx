import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

// Icons
import { 
  Calendar as CalendarIcon, 
  Dumbbell, 
  UserCircle, 
  Heart, 
  PlusCircle, 
  Clock,
  Pill,
  Target,
  CheckSquare
} from 'lucide-react';

interface EventData {
  id: number;
  date: Date;
  title: string;
  type: 'workout' | 'session' | 'treatment' | 'goal' | 'measurement' | 'habit';
  eventTime?: string;
  details?: string;
  completed?: boolean;
  energyLevel?: number; 
}

const eventTypeColors = {
  workout: 'bg-blue-500',
  session: 'bg-purple-500',
  treatment: 'bg-amber-500',
  goal: 'bg-action-blue',
  measurement: 'bg-pink-500',
  habit: 'bg-indigo-500'
};

const CalendarPage: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<string>('day');

  // Fetch calendar data
  const { data: calendarEvents, isLoading } = useQuery({
    queryKey: ['/api/calendar/events'],
    enabled: isAuthenticated,
  });

  // Fetch workouts 
  const { data: workouts } = useQuery({
    queryKey: ['/api/workout-logs'],
    enabled: isAuthenticated,
  });

  // Fetch sessions/appointments
  const { data: sessions } = useQuery({
    queryKey: ['/api/patient/sessions'],
    enabled: isAuthenticated,
  });

  // Utility function to get events for a specific date
  const getEventsForDate = (date: Date): EventData[] => {
    if (!calendarEvents || !Array.isArray(calendarEvents)) return [];
    return calendarEvents.filter((event: EventData) => 
      isSameDay(new Date(event.date), date)
    );
  };

  // Handle date selection 
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setActiveTab('day');
    }
  };

  // Generate week view days
  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  // Utility to get event icon
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'workout': return <Dumbbell className="h-4 w-4" />;
      case 'session': return <UserCircle className="h-4 w-4" />;
      case 'treatment': return <Pill className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
      case 'measurement': return <Heart className="h-4 w-4" />;
      case 'habit': return <CheckSquare className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  // Function to render event badges
  const renderEventBadges = (date: Date) => {
    const events = getEventsForDate(date);
    if (!events.length) return null;
    
    const eventTypesSet = new Set(events.map(e => e.type));
    const eventTypes = Array.from(eventTypesSet);
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {eventTypes.map(type => (
          <div 
            key={type} 
            className={`h-2 w-2 rounded-full ${eventTypeColors[type as keyof typeof eventTypeColors]}`} 
          />
        ))}
      </div>
    );
  };

  // Create a new event
  const handleAddEvent = (type: string) => {
    toast({
      title: 'Coming Soon',
      description: `Adding ${type} events will be available soon.`
    });
  };

  // Render day view
  const renderDayView = () => {
    const events = getEventsForDate(selectedDate);
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => handleAddEvent('event')}
            >
              <PlusCircle className="h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No events scheduled for this day.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className={`h-1 ${eventTypeColors[event.type]}`} />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-2">
                      <div className={`p-2 rounded-full ${eventTypeColors[event.type]} bg-opacity-20`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        {event.details && <p className="text-sm text-muted-foreground">{event.details}</p>}
                        {event.energyLevel && (
                          <Badge variant="outline" className="mt-1">
                            Energy: {event.energyLevel}/10
                          </Badge>
                        )}
                      </div>
                    </div>
                    {event.eventTime && (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{event.eventTime}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div 
              key={day.toString()} 
              className={`
                p-2 text-center cursor-pointer transition rounded-md
                ${isSameDay(day, selectedDate) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
              `}
              onClick={() => handleDateSelect(day)}
            >
              <div className="text-xs font-medium">{format(day, 'EEE')}</div>
              <div className="font-bold">{format(day, 'd')}</div>
              {renderEventBadges(day)}
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          {weekDays.map((day) => {
            const events = getEventsForDate(day);
            if (events.length === 0) return null;
            
            return (
              <div key={day.toString()} className="space-y-2">
                <h3 className={`text-sm font-medium ${isSameDay(day, selectedDate) ? 'text-primary' : ''}`}>
                  {format(day, 'EEEE, MMMM d')}
                </h3>
                
                {events.map((event) => (
                  <Card key={event.id} className="overflow-hidden">
                    <div className={`h-1 ${eventTypeColors[event.type]}`} />
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded-full ${eventTypeColors[event.type]} bg-opacity-20`}>
                            {getEventIcon(event.type)}
                          </div>
                          <div className="truncate">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                          </div>
                        </div>
                        {event.eventTime && (
                          <span className="text-xs text-muted-foreground">{event.eventTime}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render month view
  const renderCalendarWithEvents = () => (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDateSelect}
      className="rounded-md border"
      modifiers={{
        hasEvents: (date) => getEventsForDate(date).length > 0,
      }}
      modifiersClassNames={{
        hasEvents: 'font-bold relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:bg-primary after:rounded-full',
      }}
      components={{
        DayContent: ({ date }) => (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div>{date.getDate()}</div>
            {renderEventBadges(date)}
          </div>
        ),
      }}
    />
  );

  return (
    <div className="container py-6 lg:py-10 max-w-5xl">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Calendar</CardTitle>
          <CardDescription>
            Manage your workouts, sessions, and health tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>

            <div className="grid gap-6 md:grid-cols-[1fr_250px]">
              {/* Main content area */}
              <div className="space-y-6">
                <TabsContent value="day" className="space-y-4 mt-0">
                  {renderDayView()}
                </TabsContent>
                
                <TabsContent value="week" className="space-y-4 mt-0">
                  {renderWeekView()}
                </TabsContent>
                
                <TabsContent value="month" className="space-y-4 mt-0">
                  {renderCalendarWithEvents()}
                </TabsContent>
              </div>
              
              {/* Sidebar */}
              <div className="md:order-first space-y-6">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg">Event Types</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-2">
                      {Object.entries(eventTypeColors).map(([type, color]) => (
                        <div key={type} className="flex items-center space-x-2">
                          <div className={`h-3 w-3 rounded-full ${color}`} />
                          <span className="text-sm capitalize">{type}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg">Quick Add</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3 space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-sm"
                      onClick={() => handleAddEvent('workout')}
                    >
                      <Dumbbell className="mr-2 h-4 w-4" />
                      Add Workout
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-sm"
                      onClick={() => handleAddEvent('session')}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Add Session
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-sm"
                      onClick={() => handleAddEvent('measurement')}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Add Measurement
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-sm"
                      onClick={() => handleAddEvent('goal')}
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Add Goal
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;