import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { VideoOverlay } from "@/components/ui/video-overlay";

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

interface TodaysSessionResponse {
  ok: boolean;
  needsCheckin: boolean;
  message?: string;
  checkin?: {
    energy: number;
    pain: number;
    confidence: number;
  };
  session?: GeneratedSession;
}

function ExercisePlayer({ 
  item, 
  onComplete, 
  onSkip,
  currentIndex,
  totalCount
}: { 
  item: SessionItem; 
  onComplete: () => void;
  onSkip: () => void;
  currentIndex: number;
  totalCount: number;
}) {
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(item.durationSeconds || 60);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayVideo = () => {
    if (item.videoUrl) {
      setShowVideo(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-action-blue text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-80">
            Exercise {currentIndex + 1} of {totalCount}
          </span>
          <span className="text-sm font-medium">
            {item.dosageType === "TIME" ? formatTime(item.durationSeconds || 60) : `${item.sets} × ${item.reps} reps`}
          </span>
        </div>
        <h2 className="text-xl font-bold mt-2">{item.name}</h2>
      </div>

      <div className="p-6">
        {item.videoUrl ? (
          <button
            onClick={handlePlayVideo}
            className="w-full aspect-video bg-gray-900 rounded-xl flex items-center justify-center mb-4 hover:bg-gray-800 transition-colors"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
              <p className="text-white/80 text-sm">Tap to play video guide</p>
            </div>
          </button>
        ) : (
          <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center mb-4">
            <div className="text-center text-gray-400">
              <p className="text-sm">No video available</p>
              <p className="text-xs mt-1">Follow the instructions below</p>
            </div>
          </div>
        )}

        <div className="bg-info-panel rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">{item.notes}</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip
          </Button>
          <Button
            onClick={onComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Done
          </Button>
        </div>
      </div>

      <VideoOverlay
        isOpen={showVideo}
        onClose={() => setShowVideo(false)}
        videoUrl={item.videoUrl || ""}
        title={item.name}
      />
    </div>
  );
}

function SessionComplete({ 
  session, 
  onFinish 
}: { 
  session: GeneratedSession;
  onFinish: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-lg p-8 text-center"
    >
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Session Complete!
      </h2>
      <p className="text-gray-600 mb-6">
        Great work showing up for your body today. Every gentle movement counts.
      </p>

      <div className="bg-info-panel rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-action-blue">
              {session.items.length}
            </p>
            <p className="text-xs text-gray-500">Exercises</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-action-blue">
              {session.totalDurationMin}
            </p>
            <p className="text-xs text-gray-500">Minutes</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 italic mb-6">
        Plans adapt day to day — that's how progress stays safe.
      </p>

      <Button
        onClick={onFinish}
        className="w-full bg-action-blue hover:bg-action-blue/90 text-white"
      >
        Return to Dashboard
      </Button>
    </motion.div>
  );
}

export default function SessionExecutePage() {
  const [, navigate] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const { data, isLoading, error } = useQuery<TodaysSessionResponse>({
    queryKey: ["/api/todays-session"],
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/session/log-completion", {
        method: "POST",
        data: {
          date,
          exerciseList: completedExercises,
          checkinValues: data?.checkin,
          feedback: "completed",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-plan"] });
      queryClient.invalidateQueries({ queryKey: ["/api/todays-session"] });
    },
  });

  const handleExerciseComplete = () => {
    const item = data?.session?.items[currentIndex];
    if (item) {
      setCompletedExercises(prev => [...prev, item.exerciseId]);
    }
    
    if (data?.session && currentIndex < data.session.items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionComplete(true);
      completeMutation.mutate();
    }
  };

  const handleSkip = () => {
    if (data?.session && currentIndex < data.session.items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionComplete(true);
      completeMutation.mutate();
    }
  };

  const handleFinish = () => {
    navigate("/?demo=true");
  };

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
              Before we can personalize today's session, we need to know how you're feeling.
            </p>
            <Link href="/checkin?demo=true">
              <Button className="w-full bg-action-blue hover:bg-action-blue/90 text-white">
                Start Check-in
                <ChevronRight className="w-4 h-4 ml-2" />
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
          <p className="text-gray-500 mb-4">
            Please try again or go back to the dashboard.
          </p>
          <Link href="/?demo=true">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const session = data.session;

  if (session.dayType === "REST") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="text-6xl mb-4">😴</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Rest Day
            </h2>
            <p className="text-gray-600 mb-6">
              Rest is an important part of recovery. Enjoy this time to let your body rebuild and grow stronger.
            </p>
            <Link href="/?demo=true">
              <Button className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (session.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto text-center">
          <p className="text-gray-500 mb-4">No exercises available for today.</p>
          <Link href="/?demo=true">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/?demo=true">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{session.totalDurationMin} min</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6">
        {!sessionComplete && (
          <div className="mb-4">
            <div className="flex gap-1 mb-2">
              {session.items.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    idx < currentIndex
                      ? "bg-green-500"
                      : idx === currentIndex
                      ? "bg-action-blue"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {sessionComplete ? (
            <SessionComplete 
              key="complete"
              session={session} 
              onFinish={handleFinish} 
            />
          ) : (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ExercisePlayer
                item={session.items[currentIndex]}
                onComplete={handleExerciseComplete}
                onSkip={handleSkip}
                currentIndex={currentIndex}
                totalCount={session.items.length}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!sessionComplete && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 italic">
              {session.explainWhy}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
