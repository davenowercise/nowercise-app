import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  Sun,
  Moon,
  Clock,
  Zap,
  Heart,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Brain,
  ArrowUp,
  Pause,
  Sparkles
} from "lucide-react";
import { ACSM_GUIDELINES, CANCER_TYPE_GUIDELINES, getSafetyRulesForCancer } from "@/utils/guidelines";
import { SymptomState, getExerciseFocusResult, ExerciseFocus } from "@/utils/symptom-focus";

interface PatientProfile {
  cancerType: string;
  treatmentPhase?: string;
  tier?: number;
}

interface WeeklyExpectationsPanelProps {
  patientProfile?: PatientProfile;
  symptoms?: SymptomState;
}

const treatmentPhaseGuidance: Record<string, {
  weeklyGoal: string;
  dailyTip: string;
  energyPattern: string;
  priorityFocus: string[];
  restDays: number;
  sessionDuration: string;
}> = {
  "Pre-Treatment": {
    weeklyGoal: "Build your foundation - 3-4 active days",
    dailyTip: "Focus on building strength that will help you through treatment",
    energyPattern: "Energy is typically stable - use this time to establish routines",
    priorityFocus: ["Strength building", "Cardio endurance", "Flexibility"],
    restDays: 2,
    sessionDuration: "20-30 min"
  },
  "During Treatment": {
    weeklyGoal: "Maintain what you can - listen to your body first",
    dailyTip: "Some days rest IS the workout. That's okay and expected.",
    energyPattern: "Energy may fluctuate greatly - treatment days often need rest",
    priorityFocus: ["Gentle movement", "Breathing exercises", "Short walks"],
    restDays: 4,
    sessionDuration: "10-20 min"
  },
  "Post-Surgery": {
    weeklyGoal: "Gentle recovery - focus on mobility and healing",
    dailyTip: "Your body is healing - gentle movement helps, don't push",
    energyPattern: "Expect fatigue - healing takes enormous energy",
    priorityFocus: ["Range of motion", "Gentle stretching", "Walking when ready"],
    restDays: 5,
    sessionDuration: "5-15 min"
  },
  "Post-Treatment": {
    weeklyGoal: "Gradual return - 2-3 active days to start",
    dailyTip: "Celebrate small improvements - you're rebuilding",
    energyPattern: "Energy slowly returns - good days and tired days are normal",
    priorityFocus: ["Rebuilding strength", "Cardio tolerance", "Core stability"],
    restDays: 3,
    sessionDuration: "15-25 min"
  },
  "Maintenance Treatment": {
    weeklyGoal: "Consistent gentle activity - 3 active days",
    dailyTip: "Work with your treatment schedule - plan around appointments",
    energyPattern: "Predictable patterns often emerge - track what works",
    priorityFocus: ["Maintaining function", "Managing fatigue", "Flexibility"],
    restDays: 3,
    sessionDuration: "15-25 min"
  },
  "Recovery": {
    weeklyGoal: "Building back - aim for 4 active days",
    dailyTip: "You're getting stronger - celebrate every milestone",
    energyPattern: "Energy is improving - trust the process",
    priorityFocus: ["Progressive strength", "Endurance building", "Balance"],
    restDays: 2,
    sessionDuration: "20-35 min"
  },
  "Advanced/Palliative": {
    weeklyGoal: "Quality over quantity - move when it feels good",
    dailyTip: "Every gentle movement is valuable - rest when needed",
    energyPattern: "Energy conservation is key - prioritize what matters",
    priorityFocus: ["Comfort", "Gentle mobility", "Breathing"],
    restDays: 5,
    sessionDuration: "5-15 min"
  }
};

const dayOfWeekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeeklyExpectationsPanel({ patientProfile, symptoms }: WeeklyExpectationsPanelProps) {
  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ["/api/patient/profile"],
    enabled: !patientProfile,
    retry: false
  });

  const { data: workoutLogs, isError: workoutLogsError } = useQuery<any[]>({
    queryKey: ["/api/workout-logs"],
    retry: false
  });

  // Get progression backbone for stage information
  const { data: backbone } = useQuery<any>({
    queryKey: ["/api/progression-backbone"],
    retry: false
  });

  const activeProfile = patientProfile || profile;
  
  // Safely handle workout logs - may be empty or error
  const safeWorkoutLogs = workoutLogsError ? [] : (workoutLogs || []);
  
  // Get symptom-based exercise focus and explanations
  const focusResult = symptoms ? getExerciseFocusResult(symptoms) : null;
  
  if (isLoading) {
    return (
      <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-indigo-200 rounded w-3/4"></div>
            <div className="h-4 bg-indigo-100 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const treatmentPhase = activeProfile?.treatmentPhase || "Post-Treatment";
  const tier = activeProfile?.tier || 2;
  const cancerType = activeProfile?.cancerType?.toLowerCase() || "general";
  
  const guidance = treatmentPhaseGuidance[treatmentPhase] || treatmentPhaseGuidance["Post-Treatment"];
  const safetyRules = getSafetyRulesForCancer(cancerType);
  
  // Calculate this week's activity
  const today = new Date();
  const dayOfWeek = today.getDay();
  const activeDaysThisWeek = safeWorkoutLogs.filter((log: any) => {
    if (!log?.date) return false;
    const logDate = new Date(log.date);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    return logDate >= startOfWeek;
  }).length || 0;

  const targetActiveDays = 7 - guidance.restDays;
  const progressPercent = Math.min((activeDaysThisWeek / targetActiveDays) * 100, 100);

  // Generate week view
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - dayOfWeek + i);
    const isToday = i === dayOfWeek;
    const isPast = i < dayOfWeek;
    const hasWorkout = safeWorkoutLogs.some((log: any) => {
      if (!log?.date) return false;
      const logDate = new Date(log.date);
      return logDate.toDateString() === date.toDateString();
    });
    return { day: dayOfWeekNames[i], isToday, isPast, hasWorkout };
  });

  return (
    <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg" data-testid="card-weekly-expectations">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-indigo-800">
              What to Expect This Week
            </CardTitle>
            <p className="text-sm text-indigo-600">Your personalized weekly guide</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progression Stage Banner */}
        {backbone?.stageInfo && (
          <div className="bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  Your {backbone.stageInfo.name} Stage
                </span>
              </div>
              <Badge variant="outline" className="bg-white/60 text-purple-600 border-purple-300 text-xs">
                Week {backbone.currentWeekNumber || 1}
              </Badge>
            </div>
            <p className="text-xs text-purple-700">{backbone.stageInfo.description}</p>
            <p className="text-xs text-purple-600 mt-1 font-medium">
              {backbone.stageInfo.weeklyOverview}
            </p>
            {backbone.consecutiveGoodWeeks > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <ArrowUp className="h-3 w-3" />
                <span>{backbone.consecutiveGoodWeeks} consistent week{backbone.consecutiveGoodWeeks > 1 ? 's' : ''} - great progress!</span>
              </div>
            )}
          </div>
        )}

        {/* Weekly Goal */}
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">This Week's Goal</span>
          </div>
          <p className="text-sm text-indigo-700">{guidance.weeklyGoal}</p>
        </div>

        {/* Week Progress View */}
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex justify-between mb-3">
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className={`text-xs mb-1 ${day.isToday ? 'font-bold text-indigo-700' : 'text-gray-500'}`}>
                  {day.day}
                </span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                  ${day.hasWorkout 
                    ? 'bg-green-500 text-white' 
                    : day.isToday 
                      ? 'bg-indigo-500 text-white ring-2 ring-indigo-300'
                      : day.isPast 
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-indigo-100 text-indigo-400'
                  }`}
                >
                  {day.hasWorkout ? '✓' : day.isToday ? '•' : ''}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Progress value={progressPercent} className="flex-1 h-2" />
            <span className="text-xs text-indigo-600 font-medium">
              {activeDaysThisWeek}/{targetActiveDays} active
            </span>
          </div>
        </div>

        {/* Daily Wisdom */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Today's Wisdom</span>
          </div>
          <p className="text-sm text-purple-700 italic">"{guidance.dailyTip}"</p>
        </div>

        {/* Symptom-Based "Why" Explanation - only show if symptoms provided */}
        {focusResult && focusResult.explanations.length > 0 && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-3 border border-teal-200">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-800">Why Your Plan Looks This Way</span>
            </div>
            <p className="text-xs text-teal-700 leading-relaxed">
              {focusResult.explanations[0]}
            </p>
            {/* Show focus badges */}
            <div className="flex flex-wrap gap-1 mt-2">
              {focusResult.focus.map((f, i) => (
                <Badge key={i} variant="outline" className="text-[10px] bg-white/60 text-teal-700 border-teal-300">
                  {f === 'aerobic' && <Activity className="h-2.5 w-2.5 mr-1" />}
                  {f === 'resistance' && <Zap className="h-2.5 w-2.5 mr-1" />}
                  {f === 'mind_body' && <Brain className="h-2.5 w-2.5 mr-1" />}
                  {f === 'multi_component' && <Heart className="h-2.5 w-2.5 mr-1" />}
                  {f.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Energy Pattern Insight */}
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-indigo-800">Energy Pattern</span>
          </div>
          <p className="text-xs text-indigo-600">{guidance.energyPattern}</p>
        </div>

        {/* Session Recommendations */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <Clock className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Session Length</p>
            <p className="text-sm font-semibold text-indigo-700">{guidance.sessionDuration}</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <Moon className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Rest Days</p>
            <p className="text-sm font-semibold text-indigo-700">{guidance.restDays} days</p>
          </div>
        </div>

        {/* Priority Focus */}
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-pink-600" />
            <span className="text-sm font-medium text-indigo-800">This Week's Focus</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {guidance.priorityFocus.map((focus, index) => (
              <Badge key={index} variant="secondary" className="bg-indigo-100 text-indigo-700 text-xs">
                {focus}
              </Badge>
            ))}
          </div>
        </div>

        {/* Intensity Limit Reminder */}
        <div className="text-center pt-2">
          <p className="text-xs text-indigo-600">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            Max intensity: {safetyRules.intensityMax}/10 | Max duration: {safetyRules.durationMax} min
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
