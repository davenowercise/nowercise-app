import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BedDouble,
  Check,
  Heart,
  Cloud,
  Moon,
  Sparkles
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/useAuth";

export default function RestSession() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [restLogged, setRestLogged] = useState(false);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [restReason, setRestReason] = useState<string | null>(null);
  
  const searchParams = new URLSearchParams(window.location.search);
  const demoModeFromUrl = searchParams.get('demo') === 'true';
  const demoModeFromUser = user?.id === 'demo-user' || user?.email === 'demo@nowercise.com';
  const demoMode = demoModeFromUrl || demoModeFromUser;
  
  const preserveQueryParams = (path: string) => {
    const newParams = new URLSearchParams();
    if (demoMode) newParams.set('demo', 'true');
    const demoRole = searchParams.get('demo-role');
    if (demoRole) newParams.set('demo-role', demoRole);
    const queryString = newParams.toString();
    return queryString ? `${path}?${queryString}` : path;
  };

  const completeMutation = useMutation({
    mutationFn: async (data: { 
      templateCode: string; 
      completed: boolean;
      restReason?: string;
      energyLevel?: number;
    }) => {
      const apiUrl = demoMode ? '/api/pathway/complete?demo=true' : '/api/pathway/complete';
      return apiRequest(apiUrl, {
        method: 'POST',
        data: {
          templateCode: 'REST',
          sessionType: 'rest',
          durationMinutes: 0,
          energyLevel: data.energyLevel,
          restReason: data.restReason,
          completed: true
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pathway/today'] });
      setRestLogged(true);
    }
  });

  const getEnergyLabel = (level: number) => {
    const labels: Record<number, string> = {
      1: "Very low energy",
      2: "Low energy",
      3: "Some energy",
      4: "Moderate energy",
      5: "Good energy"
    };
    return labels[level] || "Moderate";
  };

  const restReasons = [
    { id: 'tired', label: 'Feeling tired', icon: Moon },
    { id: 'pain', label: 'Pain or discomfort', icon: Cloud },
    { id: 'treatment', label: 'Treatment effects', icon: Heart },
    { id: 'choice', label: 'Just feel like resting', icon: Sparkles }
  ];

  const handleLogRest = () => {
    completeMutation.mutate({
      templateCode: 'REST',
      completed: true,
      restReason: restReason || undefined,
      energyLevel
    });
  };

  if (restLogged) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border border-info-border shadow-lg rounded-2xl" data-testid="card-rest-confirmed">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-info-panel rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-action-blue" />
            </div>
            <h1 className="text-2xl font-medium text-gray-700 mb-3">
              Rest day logged
            </h1>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Taking time to rest is an important part of recovery. 
              You're doing exactly what your body needs today.
            </p>
            <Button
              onClick={() => navigate(preserveQueryParams('/'))}
              className="bg-action-blue hover:bg-action-blue-hover"
              size="lg"
              data-testid="button-back-to-dashboard"
            >
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <button 
        onClick={() => navigate(preserveQueryParams('/'))}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </button>

      <Card className="border border-info-border/50 shadow-lg rounded-2xl mb-6" data-testid="card-rest-header">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-info-panel rounded-full flex items-center justify-center">
            <BedDouble className="w-10 h-10 text-action-blue" />
          </div>
          <h1 className="text-2xl font-medium text-gray-700 mb-3">
            Rest Day
          </h1>
          <p className="text-gray-500 mb-2">
            Rest is an essential part of recovery.
          </p>
          <p className="text-action-blue text-sm font-medium">
            This counts as taking care of yourself.
          </p>
        </CardContent>
      </Card>

      <Card className="border border-gray-100 shadow-lg rounded-2xl mb-6" data-testid="card-rest-form">
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-3">
              How's your energy today? (optional)
            </label>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-gray-400">Very low</span>
              <span className="text-sm font-medium text-teal-600">
                {getEnergyLabel(energyLevel)}
              </span>
              <span className="text-xs text-gray-400">Good</span>
            </div>
            <Slider
              value={[energyLevel]}
              onValueChange={(v) => setEnergyLevel(v[0])}
              min={1}
              max={5}
              step={1}
              className="w-full"
              data-testid="slider-energy"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-3">
              Why are you resting today? (optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {restReasons.map((reason) => {
                const Icon = reason.icon;
                const isSelected = restReason === reason.id;
                return (
                  <button
                    key={reason.id}
                    onClick={() => setRestReason(isSelected ? null : reason.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'border-info-border bg-info-panel' 
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                    data-testid={`button-reason-${reason.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-action-blue' : 'text-gray-400'}`} />
                      <span className={`text-sm ${isSelected ? 'text-accent-blue' : 'text-gray-600'}`}>
                        {reason.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleLogRest}
        disabled={completeMutation.isPending}
        className="w-full bg-action-blue hover:bg-action-blue-hover"
        size="lg"
        data-testid="button-log-rest"
      >
        {completeMutation.isPending ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">○</span>
            Logging...
          </span>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Log Rest Day
          </>
        )}
      </Button>

      <p className="text-center text-xs text-gray-400 mt-6 px-4">
        Your body knows what it needs. There's no wrong choice here.
      </p>
    </div>
  );
}
