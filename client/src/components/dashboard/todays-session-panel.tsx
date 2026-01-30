import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Dumbbell, 
  Wind, 
  Sparkles, 
  Leaf, 
  BedDouble,
  Heart,
  CheckCircle
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
  optional: Heart
};

const SESSION_TYPE_LABELS: Record<string, string> = {
  strength: "Gentle strength",
  aerobic: "Light movement",
  mixed: "Mixed gentle activity",
  mind_body: "Mind-body practice",
  rest: "Recovery",
  optional: "Your choice"
};

const SESSION_TYPE_COLORS: Record<string, string> = {
  strength: "bg-orange-50 text-orange-600 border-orange-100",
  aerobic: "bg-blue-50 text-blue-600 border-blue-100",
  mixed: "bg-purple-50 text-purple-600 border-purple-100",
  mind_body: "bg-info-panel text-action-blue border-info-border",
  rest: "bg-gray-50 text-gray-500 border-gray-100",
  optional: "bg-amber-50 text-amber-600 border-amber-100"
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
        data: { symptoms: defaultSymptoms }
      });
      return response;
    },
    staleTime: 1000 * 60 * 5
  });

  if (isLoading) {
    return (
      <Card className="border border-gray-100 bg-gradient-to-br from-gray-50 to-white shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!sessionData) {
    return null;
  }

  const { backbone, plannedType, adaptedSession } = sessionData;
  const actualType = adaptedSession?.adaptedType || plannedType;
  const SuggestionIcon = SESSION_TYPE_ICONS[actualType] || Heart;
  const targetMinutes = backbone?.targetMinutesPerSession || 10;
  const shorterMinutes = Math.max(3, Math.floor(targetMinutes / 2));

  return (
    <Card className="border border-gray-100 bg-gradient-to-br from-gray-50 to-white shadow-sm" data-testid="card-todays-suggestion">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-gray-700 flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-400" />
          Today's Gentle Suggestion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-4 rounded-xl border ${SESSION_TYPE_COLORS[actualType]} text-center`}>
          <SuggestionIcon className="h-8 w-8 mx-auto mb-2 opacity-80" />
          <p className="font-medium text-gray-700 mb-1">
            {SESSION_TYPE_LABELS[actualType]}
          </p>
          <p className="text-sm text-gray-500">
            {actualType === 'rest' ? 'Take time to recover' : `Around ${targetMinutes} minutes`}
          </p>
        </div>

        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start text-left h-auto py-3 px-4 border-gray-200 hover:bg-gray-50"
            data-testid="button-easier-option"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Wind className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-gray-700 text-sm">If energy is low</p>
                <p className="text-xs text-gray-500">Try {shorterMinutes} minutes instead — or even less</p>
              </div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start text-left h-auto py-3 px-4 border-gray-200 hover:bg-info-panel bg-info-panel/30"
            data-testid="button-rest-option"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-info-panel flex items-center justify-center">
                <BedDouble className="h-4 w-4 text-action-blue" />
              </div>
              <div>
                <p className="font-medium text-accent-blue text-sm">Rest today</p>
                <p className="text-xs text-action-blue">Rest counts. Recovery supports your healing.</p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
            </div>
          </Button>
        </div>

        <p className="text-xs text-gray-400 text-center pt-2 leading-relaxed">
          One small, safe, kind step — today. You are always welcome here.
        </p>
      </CardContent>
    </Card>
  );
}
