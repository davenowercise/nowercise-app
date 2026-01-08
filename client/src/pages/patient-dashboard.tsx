import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Wind, 
  BedDouble, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
  Dumbbell,
  Leaf,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ConfidenceScore } from "@/components/dashboard/confidence-score";
import { QuickMicroWorkout } from "@/components/dashboard/quick-micro-workout";
import { SymptomSignal } from "@/components/dashboard/symptom-signal";
import { TreatmentAwarePanel } from "@/components/dashboard/treatment-aware-panel";
import { apiRequest } from "@/lib/queryClient";
import { ProgramAssignment, Program, WorkoutLog, SessionAppointment } from "@/lib/types";

interface PathwayTodaySession {
  hasPathway: boolean;
  templateCode?: string;
  displayTitle?: string;
  displayDescription?: string;
  estimatedMinutes?: number;
  sessionType?: string;
  easierOption?: {
    title: string;
    description: string;
    estimatedMinutes: number;
  } | null;
  restOption?: {
    title: string;
    description: string;
  };
  weekProgress?: {
    strengthDone: number;
    strengthTarget: number;
    walkMinutes: number;
    walkTarget: number;
    restDays: number;
  };
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [today] = useState(new Date());
  const [moreOpen, setMoreOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data: pathwayData, isLoading: pathwayLoading } = useQuery<PathwayTodaySession>({
    queryKey: ['/api/pathway/today'],
    staleTime: 1000 * 60 * 5
  });

  const defaultSymptoms = useMemo(() => ({
    fatigue: 5,
    pain: 3,
    anxiety: 3,
    lowMood: false,
    qolLimits: false
  }), []);

  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['/api/progression-backbone/todays-session'],
    queryFn: async () => {
      const response = await apiRequest('/api/progression-backbone/todays-session', {
        method: 'POST',
        data: { symptoms: defaultSymptoms }
      });
      return response;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !pathwayData?.hasPathway
  });

  const { data: programAssignments, isLoading: programsLoading } = useQuery<(ProgramAssignment & { program: Program })[]>({
    queryKey: ["/api/patient/programs"],
  });

  const { data: upcomingSessions, isLoading: sessionsLoading } = useQuery<SessionAppointment[]>({
    queryKey: ["/api/patient/sessions"],
  });

  const { data: workoutLogs, isLoading: logsLoading } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workout-logs"],
  });

  const hasPathway = pathwayData?.hasPathway;
  const isLoading = pathwayLoading || (!hasPathway && sessionLoading);

  const backbone = sessionData?.backbone;
  const plannedType = sessionData?.plannedType;
  const adaptedSession = sessionData?.adaptedSession;
  const legacyActualType = adaptedSession?.adaptedType || plannedType || 'rest';
  const legacyTargetMinutes = backbone?.targetMinutesPerSession || 10;
  
  const actualType = hasPathway ? (pathwayData?.sessionType || 'rest') : legacyActualType;
  const targetMinutes = hasPathway ? (pathwayData?.estimatedMinutes || 15) : legacyTargetMinutes;
  const shorterMinutes = hasPathway 
    ? (pathwayData?.easierOption?.estimatedMinutes || Math.max(3, Math.floor(targetMinutes / 2)))
    : Math.max(3, Math.floor(legacyTargetMinutes / 2));

  const displayTitle = hasPathway 
    ? (pathwayData?.displayTitle || "Today's Session")
    : null;
  const displayDescription = hasPathway 
    ? (pathwayData?.displayDescription || "")
    : null;
  const easierTitle = hasPathway && pathwayData?.easierOption 
    ? pathwayData.easierOption.title 
    : null;
  const easierDescription = hasPathway && pathwayData?.easierOption 
    ? pathwayData.easierOption.description 
    : null;

  const getSessionIcon = (type: string) => {
    const icons: Record<string, any> = {
      strength: Dumbbell,
      walk: Wind,
      mobility: Leaf,
      rest: BedDouble,
      aerobic: Wind,
      mixed: Sparkles,
      mind_body: Leaf
    };
    return icons[type] || Sparkles;
  };

  const getSessionLabel = (type: string) => {
    if (hasPathway && displayTitle) return displayTitle;
    const labels: Record<string, string> = {
      strength: "Gentle strength movement",
      walk: "Light walking",
      mobility: "Mobility & stretching",
      aerobic: "Light walking or movement",
      mixed: "A mix of gentle activities",
      mind_body: "Breathing or stretching",
      rest: "Recovery",
      optional: "Your choice"
    };
    return labels[type] || "Gentle movement";
  };

  const getSessionDescription = (type: string) => {
    if (hasPathway && displayDescription) return displayDescription;
    const descriptions: Record<string, string> = {
      strength: `Around ${targetMinutes} minutes of gentle resistance — or less`,
      walk: `Around ${targetMinutes} minutes of easy walking`,
      mobility: `${targetMinutes} minutes of stretching and movement`,
      aerobic: `Around ${targetMinutes} minutes of light movement — or less`,
      mixed: `Around ${targetMinutes} minutes of varied gentle activity`,
      mind_body: `A few minutes of calm breathing or stretching`,
      rest: "Take the time you need to recover",
      optional: "Whatever feels right for you today"
    };
    return descriptions[type] || `Around ${targetMinutes} minutes — or less`;
  };

  const handleStartSession = () => {
    if (hasPathway && pathwayData?.templateCode) {
      navigate(`/session/${pathwayData.templateCode}`);
    }
  };

  const handleStartEasier = () => {
    if (hasPathway && pathwayData?.templateCode) {
      navigate(`/session/${pathwayData.templateCode}?easy=true`);
    }
  };

  const handleRest = () => {
    if (hasPathway) {
      navigate('/session/rest');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Minimal welcome */}
      <div className="text-center mb-8 pt-4">
        <p className="text-gray-400 text-sm">{format(today, "EEEE, MMMM d")}</p>
        <h1 className="text-xl font-medium text-gray-600 mt-1">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
      </div>

      {/* === HERO: Today's One Kind Step === */}
      <Card className="border border-teal-100/50 shadow-xl shadow-teal-100/20 bg-gradient-to-br from-white via-white to-teal-50/30 mb-10 rounded-2xl" data-testid="card-today-hero">
        <CardContent className="p-8 sm:p-10">
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
              <div className="h-20 bg-gray-100 rounded-xl"></div>
              <div className="h-12 bg-gray-100 rounded-xl"></div>
            </div>
          ) : !hasPathway ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-medium text-gray-700 mb-2">
                Welcome to Your Recovery Journey
              </h2>
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                Let's create a gentle movement plan that works for you, at your pace.
              </p>
              <Button 
                onClick={() => navigate('/pathway-onboarding')}
                className="bg-emerald-600 hover:bg-emerald-700"
                size="lg"
                data-testid="button-start-pathway"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-600 text-sm font-medium mb-3">
                  <Heart className="h-4 w-4" />
                  <span>Today</span>
                </div>
                <h2 className="text-xl text-gray-600 font-light">One kind step</h2>
              </div>

              {/* Primary suggestion */}
              {(() => {
                const SessionIcon = getSessionIcon(actualType);
                return (
                  <button 
                    onClick={handleStartSession}
                    className="w-full p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-green-50 border border-teal-100 hover:border-teal-200 transition-all text-left mb-4 group"
                    data-testid="button-primary-suggestion"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200 transition-colors">
                        <SessionIcon className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-700 text-lg">
                          {getSessionLabel(actualType)}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          {getSessionDescription(actualType)}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-teal-400 group-hover:text-teal-600 transition-colors" />
                    </div>
                  </button>
                );
              })()}

              {/* Easier option */}
              {actualType !== 'rest' && (
                <button 
                  onClick={handleStartEasier}
                  className="w-full p-4 rounded-xl bg-blue-50/50 border border-blue-100 hover:border-blue-200 transition-all text-left mb-3 group"
                  data-testid="button-easier-option"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Wind className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-600 text-sm">
                        {easierTitle || "If energy is low"}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {easierDescription || `Try just ${shorterMinutes} minutes — or even less`}
                      </p>
                    </div>
                  </div>
                </button>
              )}

              {/* Rest option - fully validated */}
              <button 
                onClick={handleRest}
                className="w-full p-4 rounded-xl bg-green-50 border border-green-100 hover:border-green-200 transition-all text-left group"
                data-testid="button-rest-option"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <BedDouble className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-700 text-sm">
                      Rest today
                    </p>
                    <p className="text-green-600 text-xs mt-0.5">
                      Rest is recovery. This counts as taking care of yourself.
                    </p>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Week progress indicator */}
              {pathwayData?.weekProgress && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-400 text-center mb-3">This week</p>
                  <div className="flex justify-center gap-6 text-center">
                    <div>
                      <p className="text-lg font-medium text-gray-600">
                        {pathwayData.weekProgress.strengthDone}/{pathwayData.weekProgress.strengthTarget}
                      </p>
                      <p className="text-xs text-gray-400">Strength</p>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-600">
                        {pathwayData.weekProgress.walkMinutes}/{pathwayData.weekProgress.walkTarget}
                      </p>
                      <p className="text-xs text-gray-400">Walk mins</p>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-600">
                        {pathwayData.weekProgress.restDays}
                      </p>
                      <p className="text-xs text-gray-400">Rest days</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Gentle reminder */}
              <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
                Whatever you choose is the right choice for today.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* === Visual separator === */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-xs text-gray-500 uppercase tracking-wider">Optional</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* === Secondary: More Options (Collapsible) === */}
      <Collapsible open={moreOpen} onOpenChange={setMoreOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 mb-2 text-sm font-normal"
            data-testid="button-more-options"
          >
            {moreOpen ? (
              <>
                <ChevronUp className="h-3 w-3 mr-2" />
                Hide options
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-2" />
                More options & tools
              </>
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4">
          {/* Quick Micro Workout for Low Energy */}
          <QuickMicroWorkout />
          
          {/* Confidence Score */}
          <ConfidenceScore userId={user?.id} />
          
          {/* Body Signals */}
          <SymptomSignal />
          
          {/* Treatment-Aware Guidance */}
          <TreatmentAwarePanel />

          {/* Current Program */}
          <DashboardCard 
            title="Your Program"
            headerAction={programAssignments && programAssignments.length > 0 && (
              <Badge className="bg-teal-100 text-teal-700">Active</Badge>
            )}
          >
            {programsLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : programAssignments && programAssignments.length > 0 ? (
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">{programAssignments[0].program.name}</h3>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {programAssignments[0].program.duration} weeks
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-3">
                  {programAssignments[0].program.description || "Your personalized exercise program"}
                </p>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Week 2 of {programAssignments[0].program.duration}</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} className="h-1.5" />
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View Program
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Dumbbell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No active program</p>
                <Button variant="link" size="sm" className="mt-2">
                  Complete Assessment
                </Button>
              </div>
            )}
          </DashboardCard>

          {/* Upcoming Sessions */}
          <DashboardCard title="Upcoming Sessions">
            {sessionsLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : upcomingSessions && upcomingSessions.length > 0 ? (
              <div className="space-y-2">
                {upcomingSessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{session.type.replace("_", " ")}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(session.date), "MMM d")} at {session.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-2">No upcoming sessions</p>
            )}
          </DashboardCard>
        </CollapsibleContent>
      </Collapsible>

      {/* === History Section (Collapsible) === */}
      <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 mb-2 text-sm font-normal"
            data-testid="button-history"
          >
            {historyOpen ? (
              <>
                <ChevronUp className="h-3 w-3 mr-2" />
                Hide journey
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-2" />
                Your journey
              </>
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4">
          <DashboardCard title="Recent Activity">
            {logsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : workoutLogs && workoutLogs.length > 0 ? (
              <div className="space-y-2">
                {workoutLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center p-2 border border-gray-100 rounded-lg">
                    <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${
                      log.completed 
                        ? "bg-green-50 text-green-500" 
                        : "bg-gray-50 text-gray-400"
                    }`}>
                      {log.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <BedDouble className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">
                        {format(new Date(log.date), "MMMM d")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {log.completed ? "Movement" : "Rest day"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">
                Your activity will appear here as you go
              </p>
            )}
          </DashboardCard>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
