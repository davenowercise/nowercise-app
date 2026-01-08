import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Heart,
  BedDouble,
  Dumbbell,
  Wind,
  Leaf,
  Play,
  Pause,
  SkipForward,
  ThumbsUp,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Slider } from "@/components/ui/slider";

interface TemplateExercise {
  id: number;
  templateId: number;
  exerciseId?: number;
  exerciseName?: string;
  instructions?: string;
  sets?: number;
  reps?: string;
  duration?: number;
  orderIndex: number;
}

interface SessionTemplate {
  id: number;
  templateCode: string;
  name: string;
  description?: string;
  sessionType: string;
  estimatedMinutes?: number;
  easierMinutes?: number;
}

interface SessionData {
  template: SessionTemplate;
  exercises: TemplateExercise[];
}

export default function SessionExecution() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/session/:templateCode");
  const templateCode = params?.templateCode;
  
  const searchParams = new URLSearchParams(window.location.search);
  const isEasyMode = searchParams.get('easy') === 'true';
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [exerciseRPE, setExerciseRPE] = useState<Record<number, number>>({});
  const [exercisePain, setExercisePain] = useState<Record<number, number>>({});
  const [sessionStartTime] = useState(new Date());
  const [showRPESlider, setShowRPESlider] = useState(false);
  const [currentRPE, setCurrentRPE] = useState(5);
  const [currentPain, setCurrentPain] = useState(0);
  const [painQuality, setPainQuality] = useState<'normal' | 'sharp' | 'worrying'>('normal');
  const [showStopEarlyConfirm, setShowStopEarlyConfirm] = useState(false);

  const { data: sessionData, isLoading } = useQuery<SessionData>({
    queryKey: ['/api/pathway/template', templateCode],
    enabled: !!templateCode
  });

  const completeMutation = useMutation({
    mutationFn: async (data: { 
      templateCode: string; 
      completed: boolean;
      durationMinutes: number;
      averageRPE?: number;
      maxPain?: number;
      painQuality?: string;
      exercisesCompleted: number;
      exercisesTotal: number;
      isEasyMode: boolean;
    }) => {
      return apiRequest('/api/pathway/complete', {
        method: 'POST',
        data: {
          templateCode: data.templateCode,
          sessionType: data.templateCode.includes('WALK') ? 'walk' : 
                       data.templateCode.includes('MOBILITY') ? 'mobility' : 'strength',
          durationMinutes: data.durationMinutes,
          painLevel: data.maxPain,
          painQuality: data.painQuality !== 'normal' ? data.painQuality : undefined,
          averageRPE: data.averageRPE,
          energyLevel: data.averageRPE ? Math.max(1, 6 - Math.floor(data.averageRPE / 2)) : undefined,
          exercisesCompleted: data.exercisesCompleted,
          exercisesTotal: data.exercisesTotal,
          isEasyMode: data.isEasyMode,
          completed: data.completed
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pathway/today'] });
      navigate('/patient');
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-40 bg-gray-100 rounded-xl"></div>
          <div className="h-20 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!sessionData?.template) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h1 className="text-xl font-medium text-gray-700 mb-2">Session not found</h1>
        <p className="text-gray-500 mb-4">We couldn't find this session template.</p>
        <Button onClick={() => navigate('/patient')} variant="outline">
          Go back
        </Button>
      </div>
    );
  }

  const { template, exercises } = sessionData;
  const totalExercises = exercises.length;
  const currentExercise = exercises[currentExerciseIndex];
  const progress = totalExercises > 0 ? (completedExercises.size / totalExercises) * 100 : 0;

  const getSessionIcon = () => {
    const icons: Record<string, any> = {
      strength: Dumbbell,
      walk: Wind,
      mobility: Leaf,
      rest: BedDouble
    };
    return icons[template.sessionType] || Heart;
  };

  const SessionIcon = getSessionIcon();

  const handleCompleteExercise = () => {
    if (currentExercise) {
      setCompletedExercises(prev => new Set(Array.from(prev).concat(currentExercise.id)));
      setExerciseRPE(prev => ({ ...prev, [currentExercise.id]: currentRPE }));
      setExercisePain(prev => ({ ...prev, [currentExercise.id]: currentPain }));
      
      if (currentExerciseIndex < totalExercises - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentRPE(5);
        setCurrentPain(0);
        setShowRPESlider(false);
      } else {
        finishSession();
      }
    }
  };

  const handleSkipExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentRPE(5);
      setCurrentPain(0);
      setShowRPESlider(false);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - sessionStartTime.getTime()) / 60000);
    
    const rpeValues = Object.values(exerciseRPE);
    const averageRPE = rpeValues.length > 0 
      ? Math.round(rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length) 
      : undefined;
    
    const painValues = Object.values(exercisePain);
    const maxPain = painValues.length > 0 ? Math.max(...painValues) : undefined;

    completeMutation.mutate({
      templateCode: templateCode!,
      completed: completedExercises.size === totalExercises,
      durationMinutes,
      averageRPE,
      maxPain,
      painQuality: maxPain && maxPain >= 4 ? painQuality : undefined,
      exercisesCompleted: completedExercises.size,
      exercisesTotal: totalExercises,
      isEasyMode
    });
  };

  const handleFinishEarly = () => {
    setShowStopEarlyConfirm(true);
  };

  const confirmStopEarly = () => {
    setShowStopEarlyConfirm(false);
    finishSession();
  };

  const getRPELabel = (rpe: number) => {
    const labels: Record<number, string> = {
      1: "Very light",
      2: "Light",
      3: "Moderate",
      4: "Somewhat hard",
      5: "Hard",
      6: "Harder",
      7: "Very hard",
      8: "Very, very hard",
      9: "Extremely hard",
      10: "Maximum"
    };
    return labels[rpe] || "Moderate";
  };

  const getPainLabel = (pain: number) => {
    if (pain === 0) return "No pain";
    if (pain <= 2) return "Mild";
    if (pain <= 4) return "Moderate";
    if (pain <= 6) return "Significant";
    return "Severe";
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <button 
        onClick={() => navigate('/patient')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </button>

      <Card className="border border-teal-100/50 shadow-lg rounded-2xl mb-6" data-testid="card-session-header">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
              <SessionIcon className="h-7 w-7 text-teal-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-medium text-gray-700">
                {template.name}
                {isEasyMode && <span className="text-sm text-blue-500 ml-2">(Easier version)</span>}
              </h1>
              <p className="text-gray-500 text-sm">
                {template.description || `${isEasyMode ? template.easierMinutes || 5 : template.estimatedMinutes || 15} minutes`}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Progress</span>
              <span>{completedExercises.size} of {totalExercises} exercises</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {totalExercises > 0 && currentExercise ? (
        <Card className="border border-gray-100 shadow-lg rounded-2xl mb-6" data-testid="card-current-exercise">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-400 uppercase tracking-wider">
                Exercise {currentExerciseIndex + 1} of {totalExercises}
              </span>
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  {currentExercise.sets ? `${currentExercise.sets} sets` : 
                   currentExercise.duration ? `${Math.round(currentExercise.duration / 60)} min` : ''}
                </span>
              </div>
            </div>

            <h2 className="text-xl font-medium text-gray-700 mb-2">
              {currentExercise.exerciseName || "Exercise"}
            </h2>
            
            {currentExercise.reps && (
              <p className="text-teal-600 font-medium mb-3">
                {currentExercise.sets && `${currentExercise.sets} × `}{currentExercise.reps}
              </p>
            )}

            {currentExercise.instructions && (
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {currentExercise.instructions}
              </p>
            )}

            {showRPESlider ? (
              <div className="space-y-6 bg-gray-50 rounded-xl p-4 mb-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-600">How hard did that feel?</label>
                    <span className="text-sm font-medium text-teal-600">
                      {currentRPE}/10 - {getRPELabel(currentRPE)}
                    </span>
                  </div>
                  <Slider
                    value={[currentRPE]}
                    onValueChange={(v) => setCurrentRPE(v[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                    data-testid="slider-rpe"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-600">Any pain or discomfort?</label>
                    <span className="text-sm font-medium text-gray-500">
                      {currentPain}/10 - {getPainLabel(currentPain)}
                    </span>
                  </div>
                  <Slider
                    value={[currentPain]}
                    onValueChange={(v) => setCurrentPain(v[0])}
                    min={0}
                    max={10}
                    step={1}
                    className="w-full"
                    data-testid="slider-pain"
                  />
                  {currentPain >= 4 && (
                    <div className="mt-3 space-y-2">
                      <label className="text-sm text-gray-600">How would you describe this pain?</label>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setPainQuality('normal')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            painQuality === 'normal' 
                              ? 'bg-gray-200 text-gray-700' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-150'
                          }`}
                          data-testid="button-pain-normal"
                        >
                          Mild/Muscular
                        </button>
                        <button
                          type="button"
                          onClick={() => setPainQuality('sharp')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            painQuality === 'sharp' 
                              ? 'bg-amber-200 text-amber-700' 
                              : 'bg-gray-100 text-gray-500 hover:bg-amber-50'
                          }`}
                          data-testid="button-pain-sharp"
                        >
                          Sharp
                        </button>
                        <button
                          type="button"
                          onClick={() => setPainQuality('worrying')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            painQuality === 'worrying' 
                              ? 'bg-red-200 text-red-700' 
                              : 'bg-gray-100 text-gray-500 hover:bg-red-50'
                          }`}
                          data-testid="button-pain-worrying"
                        >
                          Worrying
                        </button>
                      </div>
                      {(painQuality === 'sharp' || painQuality === 'worrying') && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>We'll notify your coach and pause progression until reviewed</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="flex gap-3">
              {!showRPESlider ? (
                <>
                  <Button
                    onClick={() => setShowRPESlider(true)}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                    size="lg"
                    data-testid="button-done-exercise"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Done
                  </Button>
                  <Button
                    onClick={handleSkipExercise}
                    variant="outline"
                    size="lg"
                    data-testid="button-skip-exercise"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleCompleteExercise}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  size="lg"
                  data-testid="button-confirm-exercise"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {currentExerciseIndex < totalExercises - 1 ? "Next Exercise" : "Finish Session"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : template.sessionType === 'walk' ? (
        <Card className="border border-gray-100 shadow-lg rounded-2xl mb-6" data-testid="card-walk-session">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Wind className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">Walking Session</h2>
            <p className="text-gray-500 mb-6">
              {isEasyMode 
                ? `Take a ${template.easierMinutes || 5}-minute walk at your own pace` 
                : `Take a ${template.estimatedMinutes || 15}-minute walk at your own pace`}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Walk indoors or outdoors. Go at whatever pace feels comfortable today.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-600">How hard was that?</label>
                  <span className="text-sm font-medium text-teal-600">
                    {currentRPE}/10 - {getRPELabel(currentRPE)}
                  </span>
                </div>
                <Slider
                  value={[currentRPE]}
                  onValueChange={(v) => setCurrentRPE(v[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                  data-testid="slider-rpe-walk"
                />
              </div>
            </div>

            <Button
              onClick={() => {
                setExerciseRPE({ 0: currentRPE });
                finishSession();
              }}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
              data-testid="button-complete-walk"
            >
              <Check className="w-4 h-4 mr-2" />
              Complete Walk
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-100 shadow-lg rounded-2xl mb-6" data-testid="card-no-exercises">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No exercises in this session</p>
            <Button
              onClick={finishSession}
              className="mt-4"
              data-testid="button-complete-empty"
            >
              Complete Session
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <button
          onClick={handleFinishEarly}
          className="text-sm text-gray-400 hover:text-gray-600"
          data-testid="button-finish-early"
        >
          Need to stop early? That's okay — tap here to finish
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6 px-4">
        Listen to your body. It's always okay to stop, rest, or do less.
      </p>

      {showStopEarlyConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-sm w-full shadow-xl rounded-2xl" data-testid="dialog-stop-early">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Ready to stop?
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Stopping early is absolutely okay. Listening to your body is a sign of strength, not weakness.
                Your progress will be saved.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowStopEarlyConfirm(false)}
                  data-testid="button-continue-session"
                >
                  Keep going
                </Button>
                <Button
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  onClick={confirmStopEarly}
                  disabled={completeMutation.isPending}
                  data-testid="button-confirm-stop"
                >
                  {completeMutation.isPending ? "Saving..." : "Stop & save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
