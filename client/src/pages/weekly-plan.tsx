import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Calendar, 
  CheckCircle2, 
  Play, 
  Clock, 
  Dumbbell, 
  Wind, 
  Moon,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SessionItem {
  order: number;
  exerciseId: string;
  name: string;
  dosageType: "TIME" | "REPS";
  durationSeconds?: number;
  reps?: number;
  sets: number;
  notes: string;
  videoUrl?: string;
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

interface WeeklyPlanDay {
  date: string;
  dayNumber: number;
  dayName: string;
  templateType: "ACTIVE" | "REST" | "BREATH_POSTURE";
  session?: GeneratedSession;
  completed: boolean;
}

interface WeeklyPlanResponse {
  ok: boolean;
  startDate: string;
  plan: WeeklyPlanDay[];
  exerciseStats: {
    total: number;
    withVideo: number;
    byType: Record<string, number>;
  };
  hasCheckedInToday: boolean;
}

function DayCard({ day, isToday }: { day: WeeklyPlanDay; isToday: boolean }) {
  const [, navigate] = useLocation();

  const getIcon = () => {
    switch (day.templateType) {
      case "REST":
        return <Moon className="w-5 h-5 text-gray-400" />;
      case "BREATH_POSTURE":
        return <Wind className="w-5 h-5 text-blue-400" />;
      default:
        return <Dumbbell className="w-5 h-5 text-action-blue" />;
    }
  };

  const getTypeLabel = () => {
    switch (day.templateType) {
      case "REST":
        return "Rest Day";
      case "BREATH_POSTURE":
        return "Breath & Posture";
      default:
        return "Active Session";
    }
  };

  const handleStartSession = () => {
    if (day.templateType === "REST") {
      return;
    }
    navigate(`/session/execute?date=${day.date}&demo=true`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: day.dayNumber * 0.05 }}
      className={`
        rounded-xl border-2 p-4 transition-all
        ${isToday ? "border-action-blue bg-info-panel shadow-md" : "border-gray-200 bg-white"}
        ${day.completed ? "opacity-70" : ""}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${isToday ? "bg-action-blue text-white" : "bg-gray-100"}
          `}>
            <span className="text-sm font-semibold">
              {day.dayNumber}
            </span>
          </div>
          <div>
            <p className={`font-medium ${isToday ? "text-action-blue" : "text-gray-800"}`}>
              {day.dayName}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
        {day.completed && (
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        {getIcon()}
        <span className="text-sm text-gray-600">{getTypeLabel()}</span>
      </div>

      {day.session && day.session.totalDurationMin > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Clock className="w-3 h-3" />
          <span>{day.session.totalDurationMin} min</span>
          <span className="mx-1">•</span>
          <span>{day.session.items.length} exercises</span>
        </div>
      )}

      {isToday && !day.completed && day.templateType !== "REST" && (
        <Button
          onClick={handleStartSession}
          className="w-full bg-action-blue hover:bg-action-blue/90 text-white"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Today's Session
        </Button>
      )}

      {isToday && day.templateType === "REST" && (
        <div className="text-center py-2 text-sm text-gray-500 italic">
          Enjoy your rest day
        </div>
      )}

      {!isToday && !day.completed && day.templateType !== "REST" && (
        <div className="text-center py-2 text-xs text-gray-400">
          {new Date(day.date) > new Date() ? "Upcoming" : "Missed"}
        </div>
      )}
    </motion.div>
  );
}

export default function WeeklyPlanPage() {
  const [, navigate] = useLocation();
  const today = new Date().toISOString().split("T")[0];

  const { data, isLoading, error } = useQuery<WeeklyPlanResponse>({
    queryKey: ["/api/weekly-plan"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.ok) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Couldn't load your plan
          </h2>
          <p className="text-gray-500 mb-4">
            Please try again or check your connection.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const todayPlan = data.plan.find(d => d.date === today);
  const completedCount = data.plan.filter(d => d.completed).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-gray-800">
            7-Day Gentle Recovery Plan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {completedCount} of 7 days completed
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6">
        {!data.hasCheckedInToday && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Check in first</p>
                <p className="text-sm text-amber-700 mt-1">
                  Complete your daily check-in so we can adjust today's session for you.
                </p>
                <Link href="/checkin?demo=true">
                  <Button 
                    size="sm" 
                    className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Start Check-in
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid gap-4">
          {data.plan.map((day) => (
            <DayCard 
              key={day.date} 
              day={day} 
              isToday={day.date === today}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 mb-2">
            {data.exerciseStats.withVideo} exercises with video guides
          </p>
          <Link href="/?demo=true">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
