import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getConfidenceMessage as getRandomSupportiveMessage } from "@/utils/symptom-focus";

interface ConfidenceEntry {
  id: number;
  date: string;
  confidenceScore: number;
  notes?: string;
}

interface ConfidenceScoreProps {
  userId?: string;
}

const confidenceQuestions = [
  { id: "safe", label: "I feel safe moving today", icon: "🛡️" },
  { id: "trust", label: "I trust my body during exercise", icon: "💪" },
  { id: "know", label: "I know what's OK vs not OK", icon: "✅" },
];

export function ConfidenceScore({ userId }: ConfidenceScoreProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showQuestions, setShowQuestions] = useState(false);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [supportiveMessage, setSupportiveMessage] = useState(getRandomSupportiveMessage());
  
  // Rotate supportive message periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSupportiveMessage(getRandomSupportiveMessage());
    }, 30000); // Change every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const { data: confidenceData, isLoading } = useQuery<ConfidenceEntry[]>({
    queryKey: ["/api/confidence-scores"],
  });

  const submitMutation = useMutation({
    mutationFn: async (score: number) => {
      return apiRequest("/api/confidence-scores", { 
        method: "POST",
        data: {
          confidenceScore: score,
          date: new Date().toISOString().split('T')[0]
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/confidence-scores"] });
      setShowQuestions(false);
      setResponses({});
      toast({
        title: "Confidence logged!",
        description: "Thank you for checking in. Every step forward matters.",
      });
    },
  });

  const calculateAverageScore = () => {
    const values = Object.values(responses);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const handleSubmit = () => {
    const avgScore = calculateAverageScore();
    submitMutation.mutate(avgScore);
  };

  const latestScore = confidenceData?.[0]?.confidenceScore || 0;
  const previousScore = confidenceData?.[1]?.confidenceScore || latestScore;
  const trend = latestScore - previousScore;
  const weeklyAverage = confidenceData && confidenceData.length > 0 
    ? confidenceData.slice(0, 7).reduce((sum, entry) => sum + entry.confidenceScore, 0) / Math.min(confidenceData.length, 7) 
    : 0;

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-amber-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 7) return "bg-action-blue";
    if (score >= 4) return "bg-amber-500";
    return "bg-red-400";
  };

  const getScoreBasedMessage = (score: number) => {
    if (score >= 8) return "You're feeling confident - that's wonderful!";
    if (score >= 6) return "Good confidence - trust your body today";
    if (score >= 4) return "Take it gently - every small step counts";
    if (score >= 2) return "Be extra kind to yourself today";
    return "Rest is important too - listen to your body";
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-purple-200 rounded w-3/4"></div>
            <div className="h-4 bg-purple-100 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg" data-testid="card-confidence-score">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-purple-800">
                Confidence to Move
              </CardTitle>
              <p className="text-sm text-purple-600">How safe do you feel today?</p>
            </div>
          </div>
          {getTrendIcon()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!showQuestions ? (
          <>
            <div className="text-center py-4">
              <div className="relative inline-block">
                <div className={`w-24 h-24 rounded-full ${getConfidenceColor(latestScore)} flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl font-bold text-white">{latestScore || "?"}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow">
                  {getTrendIcon()}
                </div>
              </div>
              <p className="mt-3 text-purple-700 font-medium">
                {latestScore ? getScoreBasedMessage(latestScore) : "Check in to start tracking"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-purple-600">
                <span>Weekly average</span>
                <span className="font-medium">{weeklyAverage.toFixed(1)}/10</span>
              </div>
              <Progress 
                value={weeklyAverage * 10} 
                className="h-2 bg-purple-100" 
              />
            </div>

            {confidenceData && confidenceData.length > 0 && (
              <div className="flex gap-1 justify-center mt-4">
                {confidenceData.slice(0, 7).reverse().map((entry, i) => (
                  <div 
                    key={entry.id}
                    className={`w-6 h-6 rounded-full ${getConfidenceColor(entry.confidenceScore)} opacity-${70 + i * 5} flex items-center justify-center`}
                    title={`${entry.date}: ${entry.confidenceScore}/10`}
                  >
                    <span className="text-[10px] text-white font-bold">{entry.confidenceScore}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Evidence-based supportive message */}
            <div className="bg-white/60 rounded-lg p-3 mt-3">
              <p className="text-xs text-purple-700 italic text-center leading-relaxed">
                "{supportiveMessage}"
              </p>
            </div>

            <Button 
              onClick={() => setShowQuestions(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6"
              data-testid="button-check-in-confidence"
            >
              <Heart className="mr-2 h-5 w-5" />
              Check In Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-purple-700 font-medium mb-4">
              Rate how you feel today (1-10)
            </p>
            
            {confidenceQuestions.map((q) => (
              <div key={q.id} className="bg-white/60 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{q.icon}</span>
                  <span className="text-purple-800 font-medium">{q.label}</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setResponses(prev => ({ ...prev, [q.id]: num }))}
                      className={`flex-1 py-2 rounded text-sm font-medium transition-all ${
                        responses[q.id] === num
                          ? "bg-purple-500 text-white shadow-md scale-105"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                      data-testid={`button-confidence-${q.id}-${num}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowQuestions(false);
                  setResponses({});
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={Object.keys(responses).length < 3 || submitMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                data-testid="button-submit-confidence"
              >
                {submitMutation.isPending ? "Saving..." : "Save Check-In"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
