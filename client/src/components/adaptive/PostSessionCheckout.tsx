import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { track } from "@/lib/track";

type HowFelt = "too_much" | "about_right" | "too_easy";
type SymptomsNow = "worse" | "about_same" | "better";

interface PostSessionCheckoutProps {
  onComplete: () => void;
}

const HOW_FELT_OPTIONS: { value: HowFelt; label: string }[] = [
  { value: "too_much", label: "Too much" },
  { value: "about_right", label: "About right" },
  { value: "too_easy", label: "Too easy" },
];

const SYMPTOMS_OPTIONS: { value: SymptomsNow; label: string }[] = [
  { value: "worse", label: "Worse" },
  { value: "about_same", label: "About the same" },
  { value: "better", label: "Better" },
];

export function PostSessionCheckout({ onComplete }: PostSessionCheckoutProps) {
  const [howFelt, setHowFelt] = useState<HowFelt | null>(null);
  const [symptomsNow, setSymptomsNow] = useState<SymptomsNow | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    track("screen_view", { screen: "PostSessionCheckout" });
  }, []);

  const checkoutMutation = useMutation({
    mutationFn: async (payload: { completedAt: string; howFelt: HowFelt; symptomsNow: SymptomsNow; notes?: string }) => {
      return apiRequest("/api/session/checkout", {
        method: "POST",
        data: payload,
      });
    },
    onSuccess: () => {
      track("post_session_checkout", { howFelt, symptomsNow });
      onComplete();
    },
  });

  const handleSubmit = () => {
    if (howFelt && symptomsNow) {
      track("cta_click", { screen: "PostSessionCheckout", cta: "Submit" });
      checkoutMutation.mutate({
        completedAt: new Date().toISOString(),
        howFelt,
        symptomsNow,
        notes: notes.trim() || undefined,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-info-panel/50 to-white p-6 flex flex-col items-center justify-center"
    >
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Quick check-out
        </h1>

        <div className="space-y-6 mb-6">
          <div className="text-left">
            <p className="text-sm font-medium text-gray-700 mb-3">How did that feel?</p>
            <div className="space-y-2">
              {HOW_FELT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setHowFelt(option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                    howFelt === option.value
                      ? "border-accent-blue bg-info-panel"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <span className={`text-base ${howFelt === option.value ? "text-gray-800 font-medium" : "text-gray-700"}`}>
                    {option.label}
                  </span>
                  {howFelt === option.value && (
                    <Check className="w-5 h-5 text-accent-blue" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="text-left">
            <p className="text-sm font-medium text-gray-700 mb-3">How are your symptoms now?</p>
            <div className="space-y-2">
              {SYMPTOMS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSymptomsNow(option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                    symptomsNow === option.value
                      ? "border-accent-blue bg-info-panel"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <span className={`text-base ${symptomsNow === option.value ? "text-gray-800 font-medium" : "text-gray-700"}`}>
                    {option.label}
                  </span>
                  {symptomsNow === option.value && (
                    <Check className="w-5 h-5 text-accent-blue" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">Anything to note?</p>
            <p className="text-xs text-gray-500 mb-2">Optional</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. felt dizzy, slept well last night..."
              className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white text-gray-700 placeholder:text-gray-400 focus:border-accent-blue focus:outline-none resize-none"
              rows={3}
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!howFelt || !symptomsNow || checkoutMutation.isPending}
          className="w-full bg-action-blue hover:bg-action-blue-hover text-white py-6 text-lg rounded-xl disabled:opacity-50"
        >
          {checkoutMutation.isPending ? "Saving..." : "Submit"}
        </Button>
      </div>
    </motion.div>
  );
}
