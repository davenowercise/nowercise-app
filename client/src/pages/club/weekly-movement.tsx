import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  CalendarClock, 
  Calendar, 
  PlayCircle, 
  Clock,
  Award,
  Check,
  Download,
  Printer
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface WeeklyActivity {
  id: string;
  day: string;
  title: string;
  description: string;
  duration: string;
  type: 'session' | 'activity' | 'rest';
  completed: boolean;
}

export default function WeeklyMovement() {
  const { user } = useAuth();
  const [weeklyActivities, setWeeklyActivities] = React.useState<WeeklyActivity[]>([
    {
      id: 'mon',
      day: 'Monday',
      title: 'Balance Basics',
      description: 'Gentle standing exercises with chair support to build stability.',
      duration: '15 min',
      type: 'session',
      completed: false
    },
    {
      id: 'tue',
      day: 'Tuesday',
      title: 'Walking Check-in',
      description: 'A short outdoor walk at your own pace - even if it\'s just to the end of the garden and back.',
      duration: '5-10 min',
      type: 'activity',
      completed: false
    },
    {
      id: 'wed',
      day: 'Wednesday',
      title: 'Rest Day',
      description: 'Take today to rest and recover. Consider gentle stretching if you feel up to it.',
      duration: 'As needed',
      type: 'rest',
      completed: false
    },
    {
      id: 'thu',
      day: 'Thursday',
      title: 'Chair Strength',
      description: 'Seated movements focusing on gentle resistance for upper body.',
      duration: '15 min',
      type: 'session',
      completed: false
    },
    {
      id: 'fri',
      day: 'Friday',
      title: 'Balance Challenge',
      description: 'Building on Monday\'s session with slightly more challenging balance exercises.',
      duration: '20 min',
      type: 'session',
      completed: false
    },
    {
      id: 'sat',
      day: 'Saturday',
      title: 'Your Choice Activity',
      description: 'Choose any gentle movement that feels good today - walking, stretching, or gardening all count!',
      duration: '10-15 min',
      type: 'activity',
      completed: false
    },
    {
      id: 'sun',
      day: 'Sunday',
      title: 'Rest & Reflect',
      description: 'Take time to rest and reflect on the week\'s progress. Note any small wins.',
      duration: 'As needed',
      type: 'rest',
      completed: false
    }
  ]);

  // Toggle completed status
  const toggleCompleted = (id: string) => {
    setWeeklyActivities(activities => 
      activities.map(activity => 
        activity.id === id 
          ? { ...activity, completed: !activity.completed } 
          : activity
      )
    );
  };

  // Calculate progress percentage
  const completedCount = weeklyActivities.filter(a => a.completed).length;
  const progress = Math.round((completedCount / weeklyActivities.length) * 100);
  
  // Get current day of the week
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const today = days[new Date().getDay()];

  // Theme information
  const weeklyTheme = {
    title: "Building Balance",
    description: "This week focuses on improving stability and confidence with gentle balance exercises.",
    tips: [
      "Always have a chair, countertop, or wall nearby for support",
      "Start with feet wider apart for more stability",
      "Focus on your breathing to help maintain balance",
      "Progress at your own pace - quality over quantity",
      "Stop if you feel dizzy or unsteady"
    ]
  };

  // Get card color based on activity type
  const getCardColor = (type: string, isToday: boolean) => {
    if (isToday) return 'border-primary-light/40 bg-primary-light/10';
    
    switch(type) {
      case 'session': return 'border-blue-100 bg-blue-50';
      case 'activity': return 'border-emerald-100 bg-emerald-50';
      case 'rest': return 'border-amber-100 bg-amber-50';
      default: return 'border-gray-100';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link href="/club">
            <ArrowLeft size={16} className="mr-1" /> Back to Club
          </Link>
        </Button>
        
        <div className="flex items-center mb-2">
          <CalendarClock className="mr-2 h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Weekly Movement Plan</h1>
        </div>
        
        <p className="text-slate-600">
          Your customized movement schedule for this week. Remember that any movement counts, and it's always OK to modify or skip activities based on how you're feeling.
        </p>
      </div>

      {/* Weekly Theme */}
      <div className="mb-8 bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-primary mb-2 flex items-center">
          <Award className="mr-2 h-5 w-5 text-amber-500" />
          {weeklyTheme.title} Week
        </h2>
        <p className="text-slate-600 mb-3">{weeklyTheme.description}</p>
        
        <h3 className="font-medium text-slate-700 mb-1">Safety Tips:</h3>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
          {weeklyTheme.tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="bg-white">
            <Printer className="mr-1 h-4 w-4" />
            Print Plan
          </Button>
          <Button variant="outline" size="sm" className="bg-white">
            <Download className="mr-1 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-700">Weekly Progress</h3>
          <span className="text-primary font-medium">{progress}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {completedCount} of {weeklyActivities.length} days completed
        </div>
      </div>

      {/* Daily Activities */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-primary" />
          This Week's Plan
        </h2>
        
        <div className="space-y-3">
          {weeklyActivities.map((activity) => {
            const isToday = activity.id === today;
            return (
              <Card 
                key={activity.id} 
                className={`${getCardColor(activity.type, isToday)} shadow-sm`}
              >
                <CardHeader className="pb-2 flex flex-row items-start space-y-0 space-x-4">
                  <div className="w-16 min-w-16 text-center">
                    <div className={`font-medium ${isToday ? 'text-primary' : 'text-gray-500'}`}>
                      {activity.day}
                    </div>
                    {isToday && (
                      <div className="text-xs bg-primary text-white rounded-full px-2 py-0.5 mt-1">
                        Today
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center">
                      {activity.title}
                      {activity.completed && (
                        <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs rounded-full px-2 py-0.5 flex items-center">
                          <Check className="h-3 w-3 mr-0.5" /> Done
                        </span>
                      )}
                    </CardTitle>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.duration}
                      <span className="mx-2">•</span>
                      <span className={`
                        px-1.5 py-0.5 rounded-full text-xs
                        ${activity.type === 'session' ? 'bg-blue-100 text-blue-700' : ''}
                        ${activity.type === 'activity' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${activity.type === 'rest' ? 'bg-amber-100 text-amber-700' : ''}
                      `}>
                        {activity.type === 'session' ? 'Guided Session' : ''}
                        {activity.type === 'activity' ? 'Self-Guided' : ''}
                        {activity.type === 'rest' ? 'Rest Day' : ''}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-slate-600">
                    {activity.description}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-3">
                  <div className="flex items-center">
                    <Checkbox 
                      id={`complete-${activity.id}`}
                      checked={activity.completed}
                      onCheckedChange={() => toggleCompleted(activity.id)}
                      className="mr-2 data-[state=checked]:bg-primary"
                    />
                    <label 
                      htmlFor={`complete-${activity.id}`}
                      className="text-sm text-slate-600 cursor-pointer"
                    >
                      Mark as completed
                    </label>
                  </div>
                  
                  {activity.type === 'session' && (
                    <Button variant="outline" size="sm" className="bg-white">
                      <PlayCircle className="mr-1 h-4 w-4" />
                      Start Session
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Reminder Note */}
      <div className="bg-primary-light/10 border border-primary-light/30 rounded-lg p-4">
        <h3 className="font-medium text-primary mb-2">Remember:</h3>
        <p className="text-sm text-slate-700">
          Movement should never cause pain or extreme fatigue. Always listen to your body and adjust as needed. 
          If you're having a low-energy day, it's perfectly fine to swap activities or take an extra rest day.
        </p>
      </div>
    </div>
  );
}