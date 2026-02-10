import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { track } from "@/lib/track";
import { Slider } from "@/components/ui/slider";

type Feedback = "COMFORTABLE" | "A_BIT_TIRING" | "TOO_MUCH";
type Difficulty = "TOO_EASY" | "JUST_RIGHT" | "TOO_HARD";

interface PostSessionFeelScreenProps {
  onComplete: () => void;
}

const FEEDBACK_OPTIONS: { value: Feedback; label: string }[] = [
  { value: "COMFORTABLE", label: "Comfortable" },
  { value: "A_BIT_TIRING", label: "A bit tiring" },
  { value: "TOO_MUCH", label: "Too much today" },
];

const FEEDBACK_MICROCOPY: Record<Feedback, string> = {
  COMFORTABLE: "Great — we'll keep building gently.",
  A_BIT_TIRING: "Good to notice. We'll stay at a similar level.",
  TOO_MUCH: "Thanks for letting us know. We'll make tomorrow lighter.",
};

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "TOO_EASY", label: "Too easy" },
  { value: "JUST_RIGHT", label: "Just right" },
  { value: "TOO_HARD", label: "Too hard" },
];

export function PostSessionFeelScreen({ onComplete }: PostSessionFeelScreenProps) {
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [rpe, setRpe] = useState(5);
  const [pain, setPain] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    track("screen_view", { screen: "PostSessionFeel" });
  }, []);

  const feedbackMutation = useMutation({
    mutationFn: async (payload: { feedback: Feedback; rpe: number; pain: number; difficulty: Difficulty }) => {
      return apiRequest("/api/session/feedback", {
        method: "POST",
        data: { ...payload, at: new Date().toISOString() },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/state"] });
      onComplete();
    },
  });

  const handleSubmit = () => {
    if (selected && difficulty) {
      track("post_session_feedback", { feedback: selected, difficulty, rpe, pain });
      track("cta_click", { screen: "PostSessionFeel", cta: "Continue" });
      feedbackMutation.mutate({ feedback: selected, difficulty, rpe, pain });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-rose-50/50 to-white p-6 flex flex-col items-center justify-center"
    >
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-rose-500" />
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">
          How did that feel for your body?
        </h1>
        
        <div className="space-y-3 mb-6">
          {FEEDBACK_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelected(option.value)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                selected === option.value
                  ? "border-rose-400 bg-rose-50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <span className={`text-lg ${selected === option.value ? "text-rose-700 font-medium" : "text-gray-700"}`}>
                {option.label}
              </span>
              {selected === option.value && (
                <Check className="w-5 h-5 text-rose-500" />
              )}
            </button>
          ))}
        </div>

        {selected && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-600 mb-6"
          >
            {FEEDBACK_MICROCOPY[selected]}
          </motion.p>
        )}

        <div className="text-left bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Was this session too easy, just right, or too hard?
          </p>
          <div className="space-y-2">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setDifficulty(option.value)}
                className={`w-full p-3 rounded-lg border transition-all text-left flex items-center justify-between ${
                  difficulty === option.value
                    ? "border-rose-300 bg-rose-50"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <span className={`text-sm ${difficulty === option.value ? "text-rose-700 font-medium" : "text-gray-700"}`}>
                  {option.label}
                </span>
                {difficulty === option.value && (
                  <Check className="w-4 h-4 text-rose-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="text-left bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Rate your effort (RPE)
          </p>
          <Slider
            value={[rpe]}
            onValueChange={([value]) => setRpe(value)}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>1–3 Very easy</span>
            <span>4–5 Comfortable</span>
            <span>6–7 Challenging</span>
            <span>8–10 Too hard</span>
          </div>
        </div>

        <div className="text-left bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Any pain during the session?
          </p>
          <Slider
            value={[pain]}
            onValueChange={([value]) => setPain(value)}
            min={0}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0 None</span>
            <span>10 Severe</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Your answer helps us adjust future sessions.
        </p>
        
        <Button 
          onClick={handleSubmit}
          disabled={!selected || !difficulty || feedbackMutation.isPending}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white py-6 text-lg rounded-xl disabled:opacity-50"
        >
          {feedbackMutation.isPending ? "Saving..." : "Continue"}
        </Button>
      </div>
    </motion.div>
  );
}
