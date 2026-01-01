import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Dumbbell, 
  Wind, 
  Sparkles, 
  Leaf, 
  BedDouble,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SymptomSnapshot {
  fatigue: number;
  pain: number;
  anxiety: number;
  lowMood: boolean;
  qolLimits: boolean;
}

interface TodaysSessionProps {
  symptoms?: SymptomSnapshot;
}

const SESSION_TYPE_ICONS: Record<string, any> = {
  strength: Dumbbell,
  aerobic: Wind,
  mixed: Sparkles,
  mind_body: Leaf,
  rest: BedDouble,
  optional: CheckCircle
};

const SESSION_TYPE_LABELS: Record<string, string> = {
  strength: "Strength",
  aerobic: "Aerobic",
  mixed: "Mixed",
  mind_body: "Mind-Body",
  rest: "Rest Day",
  optional: "Optional"
};

const SESSION_TYPE_COLORS: Record<string, string> = {
  strength: "bg-orange-100 text-orange-700 border-orange-200",
  aerobic: "bg-blue-100 text-blue-700 border-blue-200",
  mixed: "bg-purple-100 text-purple-700 border-purple-200",
  mind_body: "bg-green-100 text-green-700 border-green-200",
  rest: "bg-gray-100 text-gray-600 border-gray-200",
  optional: "bg-yellow-100 text-yellow-700 border-yellow-200"
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  green: { bg: "bg-green-50", text: "text-green-700", label: "Feeling Good" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", label: "Taking It Easy" },
  red: { bg: "bg-red-50", text: "text-red-700", label: "Rest Priority" }
};

export function TodaysSessionPanel({ symptoms }: TodaysSessionProps) {
  const defaultSymptoms: SymptomSnapshot = symptoms || {
    fatigue: 5,
    pain: 3,
    anxiety: 3,
    lowMood: false,
    qolLimits: false
  };

  const { data: sessionData, isLoading } = useQuery({
    queryKey: ['/api/progression-backbone/todays-session', JSON.stringify(defaultSymptoms)],
    queryFn: async () => {
      const response = await apiRequest('/api/progression-backbone/todays-session', {
        method: 'POST',
        body: JSON.stringify({ symptoms: defaultSymptoms }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response;
    },
    staleTime: 1000 * 60 * 5
  });

  if (isLoading) {
    return (
      <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!sessionData) {
    return null;
  }

  const { backbone, plannedType, adaptedSession, symptomSeverity } = sessionData;
  const PlannedIcon = SESSION_TYPE_ICONS[plannedType] || Calendar;
  const AdaptedIcon = SESSION_TYPE_ICONS[adaptedSession?.adaptedType] || PlannedIcon;
  const severityStyle = SEVERITY_STYLES[symptomSeverity] || SEVERITY_STYLES.green;

  const isRestDay = plannedType === 'rest';
  const wasAdapted = adaptedSession?.wasAdapted;
  const stageName = backbone?.stageInfo?.name || "Foundations";
  const weekNumber = backbone?.currentWeekNumber || 1;

  return (
    <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-indigo-800 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Session
          </CardTitle>
          <Badge variant="outline" className="bg-white/50 text-indigo-600 border-indigo-200">
            {stageName} • Week {weekNumber}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isRestDay ? (
          <div className="text-center py-4">
            <BedDouble className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium">Rest Day</p>
            <p className="text-sm text-gray-500 mt-1">
              Rest is part of your plan. Your body recovers and grows stronger on these days.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg border ${SESSION_TYPE_COLORS[plannedType]}`}>
                <PlannedIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Planned for today</p>
                <p className="font-medium text-gray-800">
                  {SESSION_TYPE_LABELS[plannedType]} Session
                  <span className="text-gray-500 font-normal"> (~{backbone?.targetMinutesPerSession || 10} min)</span>
                </p>
              </div>
            </div>

            {wasAdapted && (
              <>
                <div className="flex items-center justify-center text-gray-400">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <ArrowRight className="h-4 w-4 mx-2" />
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                <div className={`p-4 rounded-lg ${severityStyle.bg}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-white/50 ${severityStyle.text}`}>
                      <AdaptedIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Adapted for how you're feeling</p>
                      <p className={`font-medium ${severityStyle.text}`}>
                        {SESSION_TYPE_LABELS[adaptedSession?.adaptedType] || SESSION_TYPE_LABELS[plannedType]}
                      </p>
                    </div>
                  </div>
                  
                  {adaptedSession?.adaptationReason && (
                    <p className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {adaptedSession.adaptationReason}
                    </p>
                  )}
                  
                  {adaptedSession?.suggestions && adaptedSession.suggestions.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {adaptedSession.suggestions.map((suggestion: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {!wasAdapted && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Your signals look good - follow your planned session
                </p>
              </div>
            )}
          </>
        )}

        <div className="pt-2 border-t border-indigo-100">
          <p className="text-xs text-gray-500 italic">
            Your plan is designed for gentle progress. It's always okay to scale down or rest if you need to.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
