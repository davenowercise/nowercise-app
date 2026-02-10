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
import { getVideoEmbedUrl } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SessionItem {
  order: number;
  exerciseId: string;
  name: string;
  exerciseType?: "BREATHING" | "MOBILITY" | "STRENGTH" | "WARMUP";
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

type MarkerKey = "SIT_TO_STAND" | "SUPPORTED_MARCH" | "SHOULDER_RAISE";
type MarkerRating = "EASY" | "OK" | "HARD";
type MarkerSide = "LEFT" | "RIGHT" | "BOTH" | "NOT_SURE";


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
  
  // Infer exercise type from explicit type, name, or dosageType
  // Priority: explicit type > name patterns > dosageType fallback
  const inferExerciseType = (): "BREATHING" | "MOBILITY" | "STRENGTH" | "WARMUP" => {
    if (item.exerciseType) return item.exerciseType;
    
    const nameLower = item.name.toLowerCase();
    
    // 1. Detect breathing exercises by name (highest priority for TIME-based)
    if (nameLower.includes('breath') || nameLower.includes('diaphragm') || 
        nameLower.includes('exhale') || nameLower.includes('inhale') ||
        nameLower.includes('reset') || nameLower.includes('relax')) {
      return "BREATHING";
    }
    
    // 2. Detect warm-up exercises by name
    if (nameLower.includes('warm') || nameLower.includes('march') || 
        nameLower.includes('weight shift') || nameLower.includes('weight shifts')) {
      return "WARMUP";
    }
    
    // 3. Detect mobility exercises by name (more specific patterns)
    if (nameLower.includes('stretch') || nameLower.includes('mobility') || 
        nameLower.includes('posture') || nameLower.includes('twist') || 
        nameLower.includes('shrug') || nameLower.includes('circle') ||
        nameLower.includes('raise') || nameLower.includes('rotation') ||
        nameLower.includes('pendulum') || nameLower.includes('slide') ||
        nameLower.includes('gentle') || nameLower.includes('open')) {
      return "MOBILITY";
    }
    
    // 4. If TIME-based and not detected as specific type, treat as MOBILITY
    if (item.dosageType === "TIME") {
      return "MOBILITY";
    }
    
    // 5. Default to STRENGTH for REPS-based exercises
    return "STRENGTH";
  };
  
  const exerciseType = inferExerciseType();
  const isBreathing = exerciseType === "BREATHING";
  const isMobility = exerciseType === "MOBILITY" || exerciseType === "WARMUP";

  const getDosageDisplay = () => {
    if (isBreathing) {
      return "~60-120 seconds";
    }
    if (isMobility) {
      const seconds = item.durationSeconds || 60;
      return seconds >= 60 ? `${Math.floor(seconds / 60)} min` : `${seconds}s`;
    }
    // For strength or when using reps
    if (item.reps && item.sets) {
      return `${item.sets} × ${item.reps} reps`;
    }
    // Fallback for time-based exercises that weren't detected
    if (item.durationSeconds) {
      const seconds = item.durationSeconds;
      return seconds >= 60 ? `${Math.floor(seconds / 60)} min` : `${seconds}s`;
    }
    return item.sets ? `${item.sets} sets` : "";
  };

  const getTypeLabel = () => {
    switch (exerciseType) {
      case "BREATHING": return "Breathwork";
      case "MOBILITY": return "Mobility";
      case "WARMUP": return "Warm-up";
      case "STRENGTH": return "Strength";
      default: return "Exercise";
    }
  };

  const getHeaderColor = () => {
    switch (exerciseType) {
      case "BREATHING": return "bg-indigo-600";
      case "MOBILITY": return "bg-teal-600";
      case "WARMUP": return "bg-amber-600";
      case "STRENGTH": return "bg-action-blue";
      default: return "bg-action-blue";
    }
  };

  const handlePlayVideo = () => {
    if (item.videoUrl) {
      setShowVideo(true);
    }
  };

  const embedUrl = item.videoUrl ? getVideoEmbedUrl(item.videoUrl) : null;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className={`${getHeaderColor()} text-white px-6 py-4`}>
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-80">
            {getTypeLabel()} • {currentIndex + 1} of {totalCount}
          </span>
          <span className="text-sm font-medium">
            {getDosageDisplay()}
          </span>
        </div>
        <h2 className="text-xl font-bold mt-2">{item.name}</h2>
      </div>

      <div className="p-0">
        {embedUrl ? (
          <div 
            className="video-card w-full relative"
            style={{ aspectRatio: '16 / 9' }}
          >
            <iframe
              src={embedUrl}
              title={item.name}
              className="absolute inset-0 w-full h-full block"
              style={{ border: 0 }}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : item.videoUrl ? (
          <button
            onClick={handlePlayVideo}
            className="w-full aspect-video bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
              <p className="text-white/80 text-sm">Tap to play video guide</p>
            </div>
          </button>
        ) : (
          <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p className="text-sm">No video available</p>
              <p className="text-xs mt-1">Follow the instructions below</p>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="bg-info-panel rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">{item.notes}</p>
            {isBreathing && (
              <p className="text-xs text-gray-500 mt-2 italic">
                Stop sooner if it feels uncomfortable. Small and steady is perfect.
              </p>
            )}
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
              {isBreathing || isMobility ? "Done" : "Complete"}
            </Button>
          </div>
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
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [markerPrompt, setMarkerPrompt] = useState<{ markerKey: MarkerKey } | null>(null);
  const [markerStep, setMarkerStep] = useState<"intro" | "rating" | "comfortable" | "side">("rating");
  const [markerRating, setMarkerRating] = useState<MarkerRating | null>(null);
  const [markerSide, setMarkerSide] = useState<MarkerSide | null>(null);
  const [markerComfortable, setMarkerComfortable] = useState<number | null>(null);
  const [pendingCompleted, setPendingCompleted] = useState<string[] | null>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const { data, isLoading, error } = useQuery<TodaysSessionResponse>({
    queryKey: ["/api/todays-session"],
  });

  const completeMutation = useMutation({
    mutationFn: async (exerciseList: string[]) => {
      return apiRequest("/api/session/log-completion", {
        method: "POST",
        data: {
          date,
          exerciseList,
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
    const newCompletedList = item 
      ? [...completedExercises, item.exerciseId] 
      : completedExercises;
    
    if (item) {
      setCompletedExercises(newCompletedList);
    }

    const markerKey = item ? getMarkerKey(item.name) : null;
    if (markerKey) {
      const introSeen = localStorage.getItem("markerIntroSeen") === "true";
      setMarkerPrompt({ markerKey });
      setMarkerStep(introSeen ? "rating" : "intro");
      setMarkerRating(null);
      setMarkerSide(null);
      setMarkerComfortable(null);
      setPendingCompleted(newCompletedList);
      return;
    }

    advanceSession(newCompletedList);
  };

  const handleSkip = () => {
    if (data?.session && currentIndex < data.session.items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionComplete(true);
      completeMutation.mutate(completedExercises);
    }
  };

  const handleFinish = () => {
    navigate("/?demo=true");
  };

  const advanceSession = (completedList: string[]) => {
    if (data?.session && currentIndex < data.session.items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionComplete(true);
      completeMutation.mutate(completedList);
    }
  };

  const getMarkerKey = (name: string): MarkerKey | null => {
    const lower = name.toLowerCase();
    if (lower.includes("sit to stand")) return "SIT_TO_STAND";
    if (lower.includes("supported march") || lower.includes("march")) return "SUPPORTED_MARCH";
    if (lower.includes("shoulder raise") || lower.includes("wall slide")) return "SHOULDER_RAISE";
    return null;
  };

  const submitMarker = async (override?: {
    rating?: MarkerRating | null;
    side?: MarkerSide | null;
    comfortable?: number | null;
  }) => {
    if (!markerPrompt) return;
    const rating = override?.rating ?? markerRating;
    const side = override?.side ?? markerSide;
    const comfortable = override?.comfortable ?? markerComfortable;
    if (!rating) return;
    await apiRequest("/api/markers/submit", {
      method: "POST",
      data: {
        userId: user?.id || "demo-user",
        dateISO: date,
        markerKey: markerPrompt.markerKey,
        rating,
        comfortableReps: comfortable ?? undefined,
        side: side || undefined,
      },
    });
    setMarkerPrompt(null);
    if (pendingCompleted) {
      advanceSession(pendingCompleted);
      setPendingCompleted(null);
    }
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
      {markerPrompt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm mx-4">
            {markerStep === "intro" ? (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Marker moves</h3>
                <p className="text-sm text-gray-600 mb-6">
                  These first gentle movements help me understand how things feel today so I can tailor your session safely.
                </p>
                <Button
                  className="w-full bg-action-blue hover:bg-action-blue/90 text-white"
                  onClick={() => {
                    localStorage.setItem("markerIntroSeen", "true");
                    setMarkerStep("rating");
                  }}
                >
                  Continue
                </Button>
              </>
            ) : markerStep === "rating" ? (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">How did that feel today?</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {(["EASY", "OK", "HARD"] as MarkerRating[]).map((rating) => (
                    <Button
                      key={rating}
                      variant={markerRating === rating ? "default" : "outline"}
                      onClick={() => {
                        setMarkerRating(rating);
                        if (markerPrompt.markerKey === "SIT_TO_STAND") {
                          setMarkerStep("comfortable");
                        } else if (markerPrompt.markerKey === "SUPPORTED_MARCH" && rating === "HARD") {
                          setMarkerStep("side");
                        } else {
                          submitMarker({ rating });
                        }
                      }}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setMarkerPrompt(null);
                    if (pendingCompleted) {
                      advanceSession(pendingCompleted);
                      setPendingCompleted(null);
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 w-full text-center"
                >
                  Skip for today
                </button>
              </>
            ) : markerStep === "comfortable" ? (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How many felt comfortable?</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[2, 4, 5].map((option) => (
                    <Button
                      key={option}
                      variant={markerComfortable === option ? "default" : "outline"}
                      onClick={() => {
                        setMarkerComfortable(option);
                        submitMarker({ rating: markerRating, comfortable: option });
                      }}
                    >
                      {option === 2 ? "0–2" : option === 4 ? "3–4" : "5"}
                    </Button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setMarkerPrompt(null);
                    if (pendingCompleted) {
                      advanceSession(pendingCompleted);
                      setPendingCompleted(null);
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 w-full text-center"
                >
                  Skip for today
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Was one side harder?</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {(["LEFT", "RIGHT", "BOTH", "NOT_SURE"] as MarkerSide[]).map((option) => (
                    <Button
                      key={option}
                      variant={markerSide === option ? "default" : "outline"}
                      onClick={() => {
                        setMarkerSide(option);
                        submitMarker({ rating: markerRating, side: option });
                      }}
                    >
                      {option.replace("_", " ")}
                    </Button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setMarkerPrompt(null);
                    if (pendingCompleted) {
                      advanceSession(pendingCompleted);
                      setPendingCompleted(null);
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 w-full text-center"
                >
                  Skip for today
                </button>
              </>
            )}
          </div>
        </div>
      )}
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
