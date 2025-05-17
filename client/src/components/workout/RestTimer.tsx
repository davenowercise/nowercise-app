import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface RestTimerProps {
  defaultDuration?: number;
}

const RestTimer: React.FC<RestTimerProps> = ({ defaultDuration = 60 }) => {
  const [seconds, setSeconds] = useState(defaultDuration);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [timerDuration, setTimerDuration] = useState(defaultDuration);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSeconds((seconds) => {
          if (seconds <= 1) {
            clearInterval(interval as NodeJS.Timeout);
            setIsActive(false);
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    } else if (isPaused && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);

  useEffect(() => {
    setProgress((seconds / timerDuration) * 100);
  }, [seconds, timerDuration]);

  const toggle = () => {
    setIsActive(!isActive);
    setIsPaused(false);
  };

  const reset = () => {
    setSeconds(timerDuration);
    setIsActive(false);
    setIsPaused(false);
    setProgress(100);
  };

  const pause = () => {
    setIsPaused(!isPaused);
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="bg-blue-50 rounded-lg p-3 my-3">
      <h3 className="text-sm font-medium text-blue-800 mb-2">Rest Timer</h3>
      
      <div className="flex justify-center mb-3">
        <span className="text-3xl font-bold text-blue-700">{formatTime(seconds)}</span>
      </div>
      
      <Progress value={progress} className="mb-3 h-2" />
      
      <div className="grid grid-cols-3 gap-2">
        <Button 
          size="sm" 
          variant={isActive && !isPaused ? "destructive" : "default"}
          className={isActive && !isPaused ? "bg-red-500" : "bg-green-500"}
          onClick={isActive ? pause : toggle}
        >
          {isActive && !isPaused ? (
            <>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              {isPaused ? "Resume" : "Start"}
            </>
          )}
        </Button>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={reset}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
        
        <select 
          className="rounded border border-gray-300 text-sm p-2"
          value={isActive ? seconds : timerDuration}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            setTimerDuration(value);
            if (!isActive) {
              setSeconds(value);
              setProgress(100);
            }
          }}
          disabled={isActive}
        >
          <option value={30}>30s</option>
          <option value={45}>45s</option>
          <option value={60}>60s</option>
          <option value={90}>90s</option>
          <option value={120}>120s</option>
        </select>
      </div>
      
      {seconds === 0 && (
        <div className="mt-3 bg-green-100 text-green-800 p-2 rounded text-center text-sm font-medium">
          Rest complete! Continue with your next set.
        </div>
      )}
    </div>
  );
};

export default RestTimer;