import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Dumbbell, 
  Wind, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

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
    GREEN: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2, label: "Good to go" },
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

export default function TodayPage() {
  const today = new Date().toISOString().split("T")[0];
  const queryClient = useQueryClient();

  const { data: todayStateData, isLoading: stateLoading } = useQuery<{ ok: boolean; todayState: TodayState | null }>({
    queryKey: ["/api/today-state", today],
    queryFn: async () => {
      const res = await fetch(`/api/today-state?date=${today}`);
      return res.json();
    },
  });

  const { data: sessionData, isLoading: sessionLoading } = useQuery<{ ok: boolean; session: Session | null }>({
    queryKey: ["/api/sessions", today],
    queryFn: async () => {
      const res = await fetch(`/api/sessions?date=${today}`);
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
  const session = sessionData?.session;
  const isLoading = stateLoading || sessionLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white p-4">
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
            {!todayState ? (
              <div className="bg-white rounded-2xl border p-6 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Complete your check-in first</h3>
                <p className="text-gray-500 mb-4">
                  We need to know how you're feeling today to create your personalized session.
                </p>
                <Link href="/checkin">
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    Start Check-In
                  </Button>
                </Link>
              </div>
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
                    <Link href="/checkin">
                      <Button variant="outline" size="sm">Update Check-In</Button>
                    </Link>
                  </div>
                  <p className="text-gray-700">{todayState.safetyMessage.body}</p>
                </div>

                {session ? (
                  <div className="bg-white rounded-2xl border overflow-hidden">
                    <div className="p-6 border-b bg-gradient-to-r from-teal-50 to-white">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-800">Your Session</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {session.totalDurationMin} min
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{session.explainWhy}</p>
                      <div className="flex gap-2 mt-3">
                        {session.focusTags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
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
                      <Button 
                        className="w-full bg-teal-600 hover:bg-teal-700"
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
                      className="bg-teal-600 hover:bg-teal-700"
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
