import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Wind, Armchair, Heart, Zap, CheckCircle, X, Pause, Play } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MicroWorkout {
  id: string;
  title: string;
  duration: string;
  description: string;
  icon: JSX.Element;
  color: string;
  steps: string[];
}

const microWorkouts: MicroWorkout[] = [
  {
    id: "breathing",
    title: "Calming Breaths",
    duration: "2 min",
    description: "Deep breathing to reset your nervous system",
    icon: <Wind className="h-6 w-6" />,
    color: "from-blue-400 to-cyan-400",
    steps: [
      "Find a comfortable position",
      "Breathe in slowly for 4 counts",
      "Hold gently for 4 counts",
      "Exhale slowly for 6 counts",
      "Repeat 4-5 times",
      "Notice how your body feels"
    ]
  },
  {
    id: "seated-mobility",
    title: "Seated Mobility",
    duration: "3 min",
    description: "Gentle movements from your chair",
    icon: <Armchair className="h-6 w-6" />,
    color: "from-action-blue to-accent-blue",
    steps: [
      "Sit tall in your chair",
      "Roll your shoulders back 5 times",
      "Gently turn your head side to side",
      "Stretch your arms overhead",
      "Rotate your ankles in circles",
      "Take a deep breath and smile"
    ]
  },
  {
    id: "circulation",
    title: "Circulation Reset",
    duration: "2 min",
    description: "Get blood flowing gently",
    icon: <Heart className="h-6 w-6" />,
    color: "from-red-400 to-pink-400",
    steps: [
      "Stand if comfortable (or stay seated)",
      "March in place gently for 30 seconds",
      "Shake out your hands",
      "Roll your wrists in circles",
      "Squeeze and release your fists",
      "Take 3 deep breaths"
    ]
  },
  {
    id: "energy-boost",
    title: "Quick Energy",
    duration: "1 min",
    description: "A gentle pick-me-up",
    icon: <Zap className="h-6 w-6" />,
    color: "from-yellow-400 to-orange-400",
    steps: [
      "Stand tall (or sit up straight)",
      "Reach arms up and stretch",
      "Take 3 big breaths",
      "Gently tap your thighs",
      "Shake out tension",
      "Smile - you did it!"
    ]
  }
];

// Guided breathing component - fully automatic, hands-free experience
function GuidedBreathing({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'ready' | 'inhale' | 'hold' | 'exhale' | 'complete'>('ready');
  const [cycleCount, setCycleCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalCycles = 4;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const phaseDurations = {
    inhale: 4,
    hold: 4,
    exhale: 6,
  };

  useEffect(() => {
    if (phase === 'ready') {
      // Start after a brief pause
      const startTimer = setTimeout(() => {
        setPhase('inhale');
        setCountdown(phaseDurations.inhale);
      }, 1500);
      return () => clearTimeout(startTimer);
    }

    if (phase === 'complete' || isPaused) return;

    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    // Move to next phase
    if (countdown === 0) {
      if (phase === 'inhale') {
        setPhase('hold');
        setCountdown(phaseDurations.hold);
      } else if (phase === 'hold') {
        setPhase('exhale');
        setCountdown(phaseDurations.exhale);
      } else if (phase === 'exhale') {
        const newCycleCount = cycleCount + 1;
        setCycleCount(newCycleCount);
        if (newCycleCount >= totalCycles) {
          setPhase('complete');
          setTimeout(onComplete, 1500);
        } else {
          setPhase('inhale');
          setCountdown(phaseDurations.inhale);
        }
      }
    }
  }, [phase, countdown, cycleCount, isPaused, onComplete]);

  const getPhaseText = () => {
    switch (phase) {
      case 'ready': return 'Get comfortable...';
      case 'inhale': return 'Breathe in...';
      case 'hold': return 'Hold gently...';
      case 'exhale': return 'Slowly release...';
      case 'complete': return 'Well done 💙';
      default: return '';
    }
  };

  const getCircleSize = () => {
    if (phase === 'inhale') return 'scale-100';
    if (phase === 'hold') return 'scale-100';
    if (phase === 'exhale') return 'scale-75';
    return 'scale-90';
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="py-8 flex flex-col items-center">
      {/* Breathing circle animation */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        <div 
          className={`absolute inset-0 rounded-full bg-gradient-to-br from-blue-300 to-cyan-300 opacity-30 transition-transform duration-[4000ms] ease-in-out ${getCircleSize()}`}
        />
        <div 
          className={`absolute inset-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 opacity-50 transition-transform duration-[4000ms] ease-in-out ${getCircleSize()}`}
        />
        <div 
          className={`absolute inset-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center transition-transform duration-[4000ms] ease-in-out ${getCircleSize()}`}
        >
          <span className="text-4xl font-light text-white">
            {phase !== 'ready' && phase !== 'complete' ? countdown : ''}
          </span>
        </div>
      </div>

      {/* Phase instruction */}
      <p className="text-2xl font-light text-gray-700 mb-4 text-center min-h-[36px]">
        {getPhaseText()}
      </p>

      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: totalCycles }).map((_, i) => (
          <div 
            key={i}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              i < cycleCount ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Pause/resume button - minimal and unobtrusive */}
      {phase !== 'complete' && phase !== 'ready' && (
        <button
          onClick={togglePause}
          className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          aria-label={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </button>
      )}

      {isPaused && (
        <p className="text-sm text-gray-500 mt-2">Paused - take your time</p>
      )}
    </div>
  );
}

export function QuickMicroWorkout() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWorkout, setSelectedWorkout] = useState<MicroWorkout | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isBreathingMode, setIsBreathingMode] = useState(false);

  const logMutation = useMutation({
    mutationFn: async (workoutId: string) => {
      return apiRequest("/api/micro-workout-logs", { 
        method: "POST",
        data: {
          workoutType: workoutId,
          completedAt: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/small-wins"] });
    },
  });

  const handleComplete = () => {
    if (selectedWorkout) {
      logMutation.mutate(selectedWorkout.id);
      setIsComplete(true);
      toast({
        title: "A gentle step complete",
        description: "You took time for yourself. That matters.",
      });
    }
  };

  const resetWorkout = () => {
    setSelectedWorkout(null);
    setCurrentStep(0);
    setIsComplete(false);
    setIsBreathingMode(false);
  };

  const handleStartWorkout = (workout: MicroWorkout) => {
    setSelectedWorkout(workout);
    if (workout.id === 'breathing') {
      setIsBreathingMode(true);
    }
  };

  return (
    <Card className="border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg" data-testid="card-quick-micro-workout">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-amber-800">
              Low Energy Today?
            </CardTitle>
            <p className="text-sm text-amber-600">No guilt, just gentle movement</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Dialog open={!!selectedWorkout} onOpenChange={(open) => !open && resetWorkout()}>
          <div className="space-y-3">
            <p className="text-amber-700 text-center py-2">
              Choose something small - every bit counts
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {microWorkouts.map((workout) => (
                <DialogTrigger key={workout.id} asChild>
                  <button
                    onClick={() => handleStartWorkout(workout)}
                    className={`p-4 rounded-xl bg-gradient-to-br ${workout.color} text-white text-left transition-all hover:scale-105 hover:shadow-lg active:scale-95`}
                    data-testid={`button-micro-${workout.id}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {workout.icon}
                      <Badge variant="secondary" className="bg-white/30 text-white text-xs">
                        {workout.duration}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm">{workout.title}</h3>
                    <p className="text-xs opacity-90 mt-1">{workout.description}</p>
                  </button>
                </DialogTrigger>
              ))}
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-amber-600 italic">
                "Rest is productive. Movement is optional. You are enough."
              </p>
            </div>
          </div>

          <DialogContent className="sm:max-w-md">
            {/* Guided Breathing - fully automatic experience */}
            {selectedWorkout && isBreathingMode && !isComplete && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedWorkout.color} flex items-center justify-center text-white`}>
                      {selectedWorkout.icon}
                    </div>
                    <div className="text-center">
                      <DialogTitle className="text-xl">{selectedWorkout.title}</DialogTitle>
                      <p className="text-sm text-gray-500">Just relax and follow along</p>
                    </div>
                  </div>
                </DialogHeader>

                <GuidedBreathing onComplete={handleComplete} />
              </>
            )}

            {/* Step-by-step workouts for non-breathing exercises */}
            {selectedWorkout && !isBreathingMode && !isComplete && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedWorkout.color} flex items-center justify-center text-white`}>
                      {selectedWorkout.icon}
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selectedWorkout.title}</DialogTitle>
                      <p className="text-sm text-gray-500">{selectedWorkout.duration}</p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="py-6">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>Step {currentStep + 1} of {selectedWorkout.steps.length}</span>
                      <span>{Math.round(((currentStep + 1) / selectedWorkout.steps.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${selectedWorkout.color} transition-all duration-300`}
                        style={{ width: `${((currentStep + 1) / selectedWorkout.steps.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl text-center min-h-[100px] flex items-center justify-center">
                    <p className="text-lg font-medium text-gray-800">
                      {selectedWorkout.steps[currentStep]}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    
                    {currentStep < selectedWorkout.steps.length - 1 ? (
                      <Button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className={`flex-1 bg-gradient-to-r ${selectedWorkout.color} text-white`}
                        data-testid="button-next-step"
                      >
                        Next Step
                      </Button>
                    ) : (
                      <Button
                        onClick={handleComplete}
                        className="flex-1 bg-gradient-to-r from-action-blue to-action-blue-hover text-white"
                        data-testid="button-complete-workout"
                      >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Complete!
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}

            {isComplete && (
              <div className="py-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-action-blue to-accent-blue rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">A kind moment for you</h3>
                <p className="text-gray-500 text-sm mb-6">
                  You showed up for yourself today.<br />
                  That's what matters.
                </p>
                <Button onClick={resetWorkout} variant="outline" className="w-full">
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
