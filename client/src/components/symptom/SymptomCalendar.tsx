import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SymptomLog {
  date: Date;
  mood: string;
  symptoms: string[];
  notes: string;
}

interface SymptomCalendarProps {
  logs: SymptomLog[];
}

// Helper to get emoji for mood
const getMoodEmoji = (mood: string): string => {
  switch (mood) {
    case 'great': return '😊';
    case 'good': return '🙂';
    case 'okay': return '😐';
    case 'low': return '😕';
    case 'poor': return '😞';
    default: return '❓';
  }
};

// Helper for background color based on mood
const getMoodBgColor = (mood: string): string => {
  switch (mood) {
    case 'great': return 'bg-green-100';
    case 'good': return 'bg-green-50';
    case 'okay': return 'bg-blue-50';
    case 'low': return 'bg-yellow-50';
    case 'poor': return 'bg-red-50';
    default: return '';
  }
};

const SymptomCalendar: React.FC<SymptomCalendarProps> = ({ logs }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Get log for a specific day
  const getLogForDay = (day: Date): SymptomLog | undefined => {
    return logs.find(log => isSameDay(log.date, day));
  };
  
  // Render calendar day
  const renderDay = (day: Date) => {
    const dayLog = getLogForDay(day);
    const isToday = isSameDay(day, new Date());
    const isSelected = selectedDay && isSameDay(day, selectedDay);
    const isCurrentMonth = isSameMonth(day, currentMonth);
    
    return (
      <div 
        key={day.toString()} 
        className={`
          h-14 w-full relative p-1
          ${!isCurrentMonth ? 'text-gray-300' : ''}
          ${isToday ? 'border border-blue-500' : ''}
          ${isSelected ? 'ring-2 ring-blue-400' : ''}
          ${dayLog ? 'cursor-pointer' : ''}
          rounded-md
        `}
        onClick={() => dayLog && setSelectedDay(day)}
      >
        <div className="flex justify-between items-start h-full">
          <span className="text-xs">{format(day, 'd')}</span>
          
          {dayLog && (
            <div className={`${getMoodBgColor(dayLog.mood)} rounded-full p-1 text-center`}>
              <span className="text-sm">{getMoodEmoji(dayLog.mood)}</span>
            </div>
          )}
        </div>
        
        {dayLog && dayLog.symptoms.length > 0 && (
          <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-1">
            {dayLog.symptoms.slice(0, 2).map((symptom, index) => (
              <div key={index} className="h-2 w-2 rounded-full bg-yellow-400"></div>
            ))}
            {dayLog.symptoms.length > 2 && (
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Symptom Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium whitespace-nowrap">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {eachDayOfInterval({
            start: startOfMonth(currentMonth),
            end: endOfMonth(currentMonth)
          }).map(day => renderDay(day))}
        </div>
        
        {/* Legend */}
        <div className="mt-4 border-t pt-4">
          <div className="text-xs text-gray-500 mb-2">Mood Legend</div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-1">
                <span>😊</span>
              </div>
              <span className="text-xs">Great</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center mr-1">
                <span>🙂</span>
              </div>
              <span className="text-xs">Good</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center mr-1">
                <span>😐</span>
              </div>
              <span className="text-xs">Okay</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-yellow-50 rounded-full flex items-center justify-center mr-1">
                <span>😕</span>
              </div>
              <span className="text-xs">Low</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-50 rounded-full flex items-center justify-center mr-1">
                <span>😞</span>
              </div>
              <span className="text-xs">Poor</span>
            </div>
          </div>
          
          <div className="flex items-center mt-2">
            <div className="flex gap-1 mr-3">
              <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
              <span className="text-xs">Symptoms</span>
            </div>
          </div>
        </div>
        
        {/* Selected day details */}
        {selectedDay && getLogForDay(selectedDay) && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-medium text-sm mb-2">
              {format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </h3>
            
            {(() => {
              const log = getLogForDay(selectedDay)!;
              return (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{getMoodEmoji(log.mood)}</span>
                    <span className="capitalize">{log.mood}</span>
                  </div>
                  
                  {log.symptoms.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Symptoms:</p>
                      <div className="flex flex-wrap gap-1">
                        {log.symptoms.map((symptom, index) => (
                          <span key={index} className="bg-yellow-50 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                            {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {log.notes && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Notes:</p>
                      <p className="text-sm bg-gray-50 p-2 rounded">{log.notes}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SymptomCalendar;