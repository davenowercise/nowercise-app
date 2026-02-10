import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, ListChecks, AlertCircle, ArrowLeft, Play } from "lucide-react";

interface SessionItem {
  order: number;
  name: string;
  durationSeconds?: number;
  reps?: number;
  sets?: number;
}

interface GeneratedSession {
  date: string;
  safetyStatus: string;
  sessionLevel: string;
  focusTags: string[];
  explainWhy: string;
  totalDurationMin: number;
  items: SessionItem[];
  dayType: "ACTIVE" | "REST" | "BREATH_ONLY";
}

interface TodaysSessionResponse {
  ok: boolean;
  needsCheckin: boolean;
  message?: string;
  session?: GeneratedSession;
}

// Smoke test:
// 1) Visit Today -> start session -> overview shows list and duration range.
// 2) Tap "Start session" -> Exercise 1 loads in /session/execute.
// 3) On a no check-in day -> overview prompts check-in.

function getSessionName(session: GeneratedSession) {
  if (session.sessionLevel === "VERY_LOW") return "Very easy session";
  if (session.sessionLevel === "LOW") return "Easy session";
  return "Gentle session";
}

function getDurationRange(session: GeneratedSession) {
  if (session.totalDurationMin && session.totalDurationMin > 0) {
    const min = Math.max(1, Math.round(session.totalDurationMin - 2));
    const max = Math.round(session.totalDurationMin + 2);
    return { min, max };
  }
  const count = session.items.length;
  const min = Math.max(1, count);
  const max = Math.max(min, count * 2 + 1);
  return { min, max };
}

export default function SessionOverviewPage() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const preserveQueryParams = (path: string) => {
    const query = searchParams.toString();
    return query ? `${path}?${query}` : path;
  };

  const { data, isLoading, error } = useQuery<TodaysSessionResponse>({
    queryKey: ["/api/todays-session"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (data?.needsCheckin) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Check in first
            </h2>
            <p className="text-gray-600 mb-6">
              Before we can personalize today’s session, we need to know how you’re feeling.
            </p>
            <Link href={preserveQueryParams("/checkin")}>
              <Button className="w-full bg-action-blue hover:bg-action-blue/90 text-white">
                Start Check-in
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !data?.ok || !data.session) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Couldn't load your session
          </h2>
          <p className="text-gray-500 mb-6">
            Please try again in a moment.
          </p>
          <Button onClick={() => navigate(preserveQueryParams("/today"))} variant="outline">
            Back to Today
          </Button>
        </div>
      </div>
    );
  }

  const session = data.session;
  const orderedItems = [...session.items].sort((a, b) => a.order - b.order);
  const { min, max } = getDurationRange(session);

  if (session.dayType === "REST" || orderedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Recovery day
            </h2>
            <p className="text-gray-500 mb-6">
              Today is a rest-focused day. Take the time you need to recover.
            </p>
            <Button onClick={() => navigate(preserveQueryParams("/today"))} variant="outline">
              Back to Today
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(preserveQueryParams("/today"))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Session Overview</h1>
            <p className="text-sm text-gray-500">{getSessionName(session)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-action-blue" />
              {orderedItems.length} exercises
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="w-4 h-4 text-action-blue" />
              ~{min}-{max} min
            </span>
          </div>

          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            {orderedItems.map((item) => (
              <li key={item.order}>{item.name}</li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            className="w-full bg-action-blue hover:bg-action-blue/90 text-white"
            onClick={() => navigate(preserveQueryParams("/session/execute"))}
          >
            <Play className="w-4 h-4 mr-2" />
            Start session
          </Button>
          <Link href={preserveQueryParams("/today")}>
            <Button variant="outline" className="w-full">Back to Today</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
