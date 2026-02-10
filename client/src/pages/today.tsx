import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { track } from "@/lib/track";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { apiRequest, addDemoParam, isDemoMode } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Dumbbell, 
  Wind, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  TrendingUp,
  Sparkles,
  Hand,
  Heart,
  Phone
} from "lucide-react";
import { resolveAdaptiveScreen, getAdaptiveIntroMessage, mapRecoveryPhaseToTreatmentPhase, type IntroMessageState, type SessionFeedback, type EnergyLevel, type RecoveryPhase } from "@/lib/adaptiveFlow";
import {
  NoEnergyDayScreen,
  ReturningAfterBreakScreen,
  PhaseTransitionScreen,
  ProgressReflectionScreen,
} from "@/components/adaptive";

interface PhaseStatus {
  recoveryPhase: "PROTECT" | "REBUILD" | "EXPAND";
  stabilityScore: number | null;
  phaseReason: string | null;
}

const PHASE_CONTENT = {
  PROTECT: {
    title: "Stabilise & Protect",
    description: "We're keeping things gentle while your body is dealing with more change.",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  REBUILD: {
    title: "Rebuild Capacity",
    description: "We'll gradually build strength and stamina, staying symptom-led.",
    icon: TrendingUp,
    color: "text-action-blue",
    bgColor: "bg-info-panel",
    borderColor: "border-info-border",
  },
  EXPAND: {
    title: "Expand & Return",
    description: "You're stable enough to expand safely — with flexibility on harder days.",
    icon: Sparkles,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
};

function RecoveryPhaseBanner({ phase, safetyStatus }: { phase: PhaseStatus; safetyStatus?: "GREEN" | "YELLOW" | "RED" }) {
  const [expanded, setExpanded] = useState(false);
  const content = PHASE_CONTENT[phase.recoveryPhase];
  const Icon = content.icon;

  return (
    <div className={`rounded-2xl border ${content.borderColor} ${content.bgColor} p-5 mb-6`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full ${content.bgColor} border ${content.borderColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${content.color}`} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Your Recovery Phase
            </div>
            <h3 className={`text-lg font-semibold ${content.color}`}>{content.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{content.description}</p>
            
            {safetyStatus === "YELLOW" && (
              <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Today we're taking it gently based on your check-in.
              </p>
            )}
            {safetyStatus === "RED" && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Today we're prioritising safety. Please follow the guidance below.
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Why this phase?</span>
            <p className="mt-1">{phase.phaseReason || "Based on your recent check-ins and progress."}</p>
            {phase.stabilityScore !== null && (
              <p className="mt-2 text-xs text-gray-500">
                Stability Score: {phase.stabilityScore}/100
              </p>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Phase updates automatically based on your recent check-ins.
          </p>
        </div>
      )}
    </div>
  );
}

interface SessionItem {
  order: number;
  exerciseId: string;
  source: string;
  name: string;
  dosageType: "TIME" | "REPS";
  durationSeconds?: number;
  reps?: number;
  sets: number;
  rpeTarget?: number;
  notes?: string;
}

interface Session {
  id: number;
  date: string;
  safetyStatus: "GREEN" | "YELLOW" | "RED";
  sessionLevel: string;
  focusTags: string[];
  explainWhy: string;
  totalDurationMin: number;
  items: SessionItem[];
}

interface TodayState {
  date: string;
  safetyStatus: "GREEN" | "YELLOW" | "RED";
  readinessScore: number;
  sessionLevel: string;
  explainWhy: string;
  safetyMessage: {
    title: string;
    body: string;
  };
}

function formatDosage(item: SessionItem): string {
  if (item.dosageType === "TIME" && item.durationSeconds) {
    const mins = Math.floor(item.durationSeconds / 60);
    const secs = item.durationSeconds % 60;
    if (mins > 0 && secs > 0) return `${mins}:${secs.toString().padStart(2, "0")}`;
    if (mins > 0) return `${mins} min`;
    return `${secs} sec`;
  }
  if (item.dosageType === "REPS" && item.reps) {
    return `${item.sets}x${item.reps} reps`;
  }
  return "";
}

function getItemIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("breath")) return <Wind className="w-5 h-5 text-blue-500" />;
  if (lower.includes("circulation") || lower.includes("march")) return <RefreshCw className="w-5 h-5 text-green-500" />;
  if (lower.includes("strength") || lower.includes("stand") || lower.includes("push")) return <Dumbbell className="w-5 h-5 text-purple-500" />;
  return <Clock className="w-5 h-5 text-gray-500" />;
}

function SafetyBadge({ status }: { status: "GREEN" | "YELLOW" | "RED" }) {
  const config = {
    GREEN: { bg: "bg-info-panel", text: "text-accent-blue", icon: CheckCircle2, label: "Good to go" },
    YELLOW: { bg: "bg-amber-100", text: "text-amber-700", icon: AlertCircle, label: "Take it easy" },
    RED: { bg: "bg-red-100", text: "text-red-700", icon: AlertTriangle, label: "Pause recommended" },
  };
  const { bg, text, icon: Icon, label } = config[status];
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${bg} ${text}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function SessionItemCard({ item }: { item: SessionItem }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg">
        {getItemIcon(item.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-800">{item.name}</div>
        <div className="text-sm text-gray-500">{formatDosage(item)}</div>
      </div>
      {item.notes && (
        <div className="hidden sm:block text-xs text-gray-400 max-w-[200px] truncate">
          {item.notes}
        </div>
      )}
    </div>
  );
}

interface UserState {
  needsPhaseTransition?: boolean;
  needsReturnAfterBreak?: boolean;
  needsNoEnergyFlow?: boolean;
  weekSessionCount?: number;
  progressReflectionSeenAt?: string;
  lastSessionFeedback?: SessionFeedback;
  lastSessionFeedbackAt?: string;
  lastSessionAt?: string;
  todayEnergy?: EnergyLevel;
}

export default function TodayPage() {
  const today = new Date().toISOString().split("T")[0];
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [dismissedAdaptive, setDismissedAdaptive] = useState(false);

  useEffect(() => {
    track("screen_view", { screen: "Today" });
  }, []);

  const { data: todayStateData, isLoading: stateLoading } = useQuery<{
    ok: boolean;
    todayState: TodayState | null;
    checkinLockedAt?: string | null;
    isLocked?: boolean;
  }>({
    queryKey: ["/api/today-state", today],
    queryFn: async () => {
      const url = addDemoParam(`/api/today-state?date=${today}`);
      const headers: Record<string, string> = isDemoMode() ? { 'X-Demo-Mode': 'true' } : {};
      const res = await fetch(url, { credentials: 'include', headers });
      return res.json();
    },
  });

  const { data: sessionData, isLoading: sessionLoading } = useQuery<{ ok: boolean; session: Session | null }>({
    queryKey: ["/api/sessions", today],
    queryFn: async () => {
      const url = addDemoParam(`/api/sessions?date=${today}`);
      const headers: Record<string, string> = isDemoMode() ? { 'X-Demo-Mode': 'true' } : {};
      const res = await fetch(url, { credentials: 'include', headers });
      return res.json();
    },
  });

  const { data: phaseData } = useQuery<{ ok: boolean } & PhaseStatus>({
    queryKey: ["/api/phase/status"],
    queryFn: async () => {
      const url = addDemoParam("/api/phase/status");
      const headers: Record<string, string> = isDemoMode() ? { 'X-Demo-Mode': 'true' } : {};
      const res = await fetch(url, { credentials: 'include', headers });
      return res.json();
    },
  });

  const { data: userStateData } = useQuery<{ ok: boolean } & UserState>({
    queryKey: ["/api/user/state"],
    queryFn: async () => {
      const url = addDemoParam("/api/user/state");
      const headers: Record<string, string> = isDemoMode() ? { 'X-Demo-Mode': 'true' } : {};
      const res = await fetch(url, { credentials: 'include', headers });
      return res.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("/api/sessions/generate", {
        method: "POST",
        data: { date: today },
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", today] });
    },
  });

  const todayState = todayStateData?.todayState;
  const checkinLocked = !!todayStateData?.isLocked || !!todayStateData?.checkinLockedAt;
  const session = sessionData?.session;
  const isLoading = stateLoading || sessionLoading;

  const introMessageState: IntroMessageState = {
    phase: mapRecoveryPhaseToTreatmentPhase(phaseData?.recoveryPhase as RecoveryPhase | undefined),
    todayEnergy: userStateData?.todayEnergy,
    lastSessionFeedback: userStateData?.lastSessionFeedback,
    lastSessionFeedbackAt: userStateData?.lastSessionFeedbackAt,
    lastSessionAt: userStateData?.lastSessionAt,
    needsNoEnergyFlow: userStateData?.needsNoEnergyFlow,
    needsReturnAfterBreak: userStateData?.needsReturnAfterBreak,
  };
  const adaptiveIntroMessage = getAdaptiveIntroMessage(introMessageState);

  const adaptiveScreen = dismissedAdaptive ? "NONE" : resolveAdaptiveScreen(userStateData || null);

  const handleStartGentleSession = () => {
    setDismissedAdaptive(true);
    generateMutation.mutate();
  };

  const handleAdaptiveContinue = () => {
    setDismissedAdaptive(true);
    queryClient.invalidateQueries({ queryKey: ["/api/user/state"] });
  };

  if (adaptiveScreen === "PHASE_TRANSITION") {
    return <PhaseTransitionScreen onContinue={handleAdaptiveContinue} />;
  }

  if (adaptiveScreen === "RETURNING") {
    return <ReturningAfterBreakScreen onStartGentleSession={handleStartGentleSession} />;
  }

  if (adaptiveScreen === "NO_ENERGY") {
    return <NoEnergyDayScreen onStartGentleSession={handleStartGentleSession} />;
  }

  if (adaptiveScreen === "PROGRESS_REFLECTION") {
    return <ProgressReflectionScreen onContinue={handleAdaptiveContinue} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-info-panel/50 to-white p-4">
      <div className="max-w-2xl mx-auto pt-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Today's Session</h1>
            <p className="text-sm text-gray-500">
              {new Date(today).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {phaseData?.recoveryPhase && (
              <RecoveryPhaseBanner 
                phase={{
                  recoveryPhase: phaseData.recoveryPhase,
                  stabilityScore: phaseData.stabilityScore,
                  phaseReason: phaseData.phaseReason,
                }}
                safetyStatus={todayState?.safetyStatus}
              />
            )}

            {!todayState ? (
              <div className="bg-white rounded-2xl border p-6 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Complete your check-in first</h3>
                <p className="text-gray-500 mb-4">
                  We need to know how you're feeling today to create your personalized session.
                </p>
                <Link href="/checkin">
                  <Button className="bg-action-blue hover:bg-action-blue-hover">
                    Start Check-In
                  </Button>
                </Link>
              </div>
            ) : todayState.safetyStatus === "RED" ? (
              <>
                <div className="bg-white rounded-2xl border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <SafetyBadge status="RED" />
                    {checkinLocked ? (
                      <p className="text-right text-xs text-gray-500">
                        Check-in complete. If anything changes,{" "}
                        <Link href="/checkin" className="text-primary underline">
                          submit an update
                        </Link>
                        .
                      </p>
                    ) : (
                      <Link href="/checkin">
                        <Button variant="outline" size="sm">Update Check-In</Button>
                      </Link>
                    )}
                  </div>
                  <p className="text-gray-700">{todayState.safetyMessage.body}</p>
                </div>

                <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-red-100">
                      <Hand className="w-7 h-7 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-red-800">Exercise paused today</h2>
                      <p className="text-sm text-red-600">Your check-in indicates it's safest to rest today.</p>
                    </div>
                  </div>
                  <p className="text-sm text-red-700 leading-relaxed">
                    Rest days are a normal and important part of recovery. Skipping a session when your body needs it 
                    is a smart, safe choice — not a step back.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border p-6">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">Safe recovery ideas</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <Wind className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Gentle breathing</p>
                        <p className="text-sm text-gray-500">Slow inhale for 4 counts, exhale for 6. Repeat for 2-3 minutes.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-pink-50">
                        <Heart className="w-5 h-5 text-pink-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Rest and hydrate</p>
                        <p className="text-sm text-gray-500">Your body is doing important work. Give it the rest it needs.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Phone className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Contact your healthcare team</p>
                        <p className="text-sm text-gray-500">If your symptoms persist or worsen, reach out to your care team.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Back to dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div className="bg-white rounded-2xl border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <SafetyBadge status={todayState.safetyStatus} />
                      <div className="mt-3 text-sm text-gray-600">
                        Readiness: <span className="font-semibold">{todayState.readinessScore}%</span>
                      </div>
                    </div>
                    {checkinLocked ? (
                      <p className="text-right text-xs text-gray-500">
                        Check-in complete. If anything changes,{" "}
                        <Link href="/checkin" className="text-primary underline">
                          submit an update
                        </Link>
                        .
                      </p>
                    ) : (
                      <Link href="/checkin">
                        <Button variant="outline" size="sm">Update Check-In</Button>
                      </Link>
                    )}
                  </div>
                  <p className="text-gray-700">{todayState.safetyMessage.body}</p>
                </div>

                {session ? (
                  <div className="bg-white rounded-2xl border overflow-hidden">
                    <div className="p-6 border-b bg-gradient-to-r from-info-panel to-white">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-800">Your Session</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {session.totalDurationMin} min
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{session.explainWhy}</p>
                      {adaptiveIntroMessage && (
                        <p className="text-sm text-accent-blue mt-3 italic">{adaptiveIntroMessage}</p>
                      )}
                      <div className="flex gap-2 mt-3">
                        {session.focusTags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-info-panel text-accent-blue text-xs rounded-full">
                            {tag.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {session.items.map((item) => (
                        <SessionItemCard key={item.order} item={item} />
                      ))}
                    </div>
                    <div className="p-4 border-t bg-gray-50">
                      <div className="mb-3">
                        <Link href={addDemoParam("/session/overview")}>
                          <Button className="w-full bg-action-blue hover:bg-action-blue-hover">
                            <Play className="w-4 h-4 mr-2" />
                            Start session
                          </Button>
                        </Link>
                      </div>
                      <Button 
                        className="w-full bg-action-blue hover:bg-action-blue-hover"
                        onClick={() => generateMutation.mutate()}
                        disabled={generateMutation.isPending}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${generateMutation.isPending ? "animate-spin" : ""}`} />
                        Regenerate Session
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border p-6 text-center">
                    <div className="text-4xl mb-4">🏃</div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Ready to generate your session</h3>
                    <p className="text-gray-500 mb-4">
                      Based on your check-in, we'll create a personalized session just for you.
                    </p>
                    <Button
                      onClick={() => generateMutation.mutate()}
                      disabled={generateMutation.isPending}
                      className="bg-action-blue hover:bg-action-blue-hover"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Generate Today's Session
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
