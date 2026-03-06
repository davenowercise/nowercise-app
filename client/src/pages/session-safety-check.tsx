import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Wind, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { track } from "@/lib/track";

interface RedFlagCheckResponse {
  ok: boolean;
  latestCheck: { blocked: boolean; checkedAt: string } | null;
}

const CALM_TEMPLATE = "EARLY_RESET_BREATHE";

const RED_FLAG_QUESTIONS: { key: keyof RedFlagAnswers; label: string }[] = [
  { key: "chestPain", label: "Chest pain" },
  { key: "breathlessness", label: "Unusual breathlessness" },
  { key: "feverUnwell", label: "Fever / feeling unwell / possible infection" },
  { key: "dizziness", label: "Dizziness or feeling faint" },
  { key: "severePain", label: "Severe pain that makes exercise feel unsafe" },
];

interface RedFlagAnswers {
  chestPain: boolean | null;
  breathlessness: boolean | null;
  feverUnwell: boolean | null;
  dizziness: boolean | null;
  severePain: boolean | null;
}

const initialAnswers: RedFlagAnswers = {
  chestPain: null,
  breathlessness: null,
  feverUnwell: null,
  dizziness: null,
  severePain: null,
};

function getPreserveQueryParams(): (path: string) => string {
  const searchParams = new URLSearchParams(window.location.search);
  return (path: string) => {
    const query = searchParams.toString();
    return query ? `${path}?${query}` : path;
  };
}

export default function SessionSafetyCheckPage() {
  const [, navigate] = useLocation();
  const preserveQueryParams = getPreserveQueryParams();
  const today = new Date().toISOString().slice(0, 10);

  const { data: checkData, isLoading: checkLoading } = useQuery<RedFlagCheckResponse>({
    queryKey: ["/api/session/red-flag-check", today],
    queryFn: () =>
      apiRequest(`/api/session/red-flag-check?date=${today}`).then((r) => r as RedFlagCheckResponse),
  });

  const [answers, setAnswers] = useState<RedFlagAnswers>(initialAnswers);
  const [submitted, setSubmitted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [wantsRecheck, setWantsRecheck] = useState(false);

  useEffect(() => {
    track("screen_view", { screen: "SessionSafetyCheck" });
  }, []);

  // Already cleared today (no auto-redirect; show choice)
  const alreadyClearedToday = checkData?.ok && checkData.latestCheck && !checkData.latestCheck.blocked;
  const latestClearedAt = checkData?.latestCheck?.checkedAt;

  // Already blocked today → show blocked screen (no form)
  const alreadyBlockedToday = checkData?.ok && checkData.latestCheck?.blocked === true;

  function formatLastClearedTime(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch {
      return "";
    }
  }

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      checkedAt: string;
      chestPain: boolean;
      breathlessness: boolean;
      feverUnwell: boolean;
      dizziness: boolean;
      severePain: boolean;
      blocked: boolean;
    }) => {
      return apiRequest("/api/session/red-flag-check", {
        method: "POST",
        data: payload,
      });
    },
    onSuccess: (_, variables) => {
      if (variables.blocked) {
        track("red_flag_blocked", {
          chestPain: variables.chestPain,
          breathlessness: variables.breathlessness,
          feverUnwell: variables.feverUnwell,
          dizziness: variables.dizziness,
          severePain: variables.severePain,
        });
        setBlocked(true);
      } else {
        track("red_flag_cleared");
        track("cta_click", { screen: "SessionSafetyCheck", cta: "Continue to session" });
        navigate(preserveQueryParams("/session/execute"));
      }
    },
  });

  const allAnswered = RED_FLAG_QUESTIONS.every((q) => answers[q.key] !== null);
  const anyYes = RED_FLAG_QUESTIONS.some((q) => answers[q.key] === true);

  const handleContinue = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    saveMutation.mutate({
      checkedAt: new Date().toISOString(),
      chestPain: answers.chestPain ?? false,
      breathlessness: answers.breathlessness ?? false,
      feverUnwell: answers.feverUnwell ?? false,
      dizziness: answers.dizziness ?? false,
      severePain: answers.severePain ?? false,
      blocked: anyYes,
    });
  };

  const setAnswer = (key: keyof RedFlagAnswers, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  // Blocked state: show safety message and options (unless user chose Re-check from already-blocked)
  const showBlockedScreen =
    (submitted && blocked) || (alreadyBlockedToday && !wantsRecheck);
  if (showBlockedScreen) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-b from-amber-50/80 to-white p-6 flex flex-col items-center justify-center"
      >
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            {alreadyBlockedToday ? "You reported symptoms earlier today." : "Today is not a training day."}
          </h1>
          <p className="text-gray-600 mb-2 leading-relaxed">
            Rest and recovery take priority right now.
          </p>
          {alreadyBlockedToday && (
            <p className="text-sm text-gray-600 mb-4">
              If things have changed, you can re-check before deciding whether to exercise.
            </p>
          )}
          <p className="text-sm text-gray-500 mb-8">
            If these symptoms feel unusual, severe, or concerning, seek appropriate medical advice before exercising.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() => setWantsRecheck(true)}
              className="w-full py-6 text-lg rounded-xl"
            >
              Re-check safety
            </Button>
            <Link href={preserveQueryParams(`/session/${CALM_TEMPLATE}`)}>
              <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white py-6 text-lg rounded-xl">
                <Wind className="w-5 h-5 mr-2" />
                2 Minutes of Calm
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => navigate(preserveQueryParams("/today"))}
              className="w-full py-6 text-lg rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Today
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Loading: show minimal spinner while checking
  if (checkLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-info-panel/50 to-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  // Already cleared today: show choice (Continue or Re-check), unless user chose Re-check
  if (alreadyClearedToday && !wantsRecheck) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-b from-info-panel/50 to-white p-6 flex flex-col items-center justify-center"
      >
        <div className="max-w-md w-full text-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4"
            onClick={() => navigate(preserveQueryParams("/session/overview"))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            You already completed today's safety check.
          </h1>
          {latestClearedAt && (
            <p className="text-sm text-gray-500 mb-6">
              Last cleared at {formatLastClearedTime(latestClearedAt)}.
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate(preserveQueryParams("/session/execute"))}
              className="w-full bg-action-blue hover:bg-action-blue-hover text-white py-6 text-lg rounded-xl"
            >
              Continue to session
            </Button>
            <Button
              variant="outline"
              onClick={() => setWantsRecheck(true)}
              className="w-full py-6 text-lg rounded-xl"
            >
              Re-check safety
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Check screen: 5 yes/no questions (no check today, or user chose Re-check)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-info-panel/50 to-white p-6 flex flex-col"
    >
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4"
          onClick={() => navigate(preserveQueryParams("/session/overview"))}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-14 h-14 bg-info-panel rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-7 h-7 text-accent-blue" />
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2 text-center">
          Quick safety check
        </h1>
        <p className="text-sm text-gray-500 mb-8 text-center">
          Before we start, please answer these questions.
        </p>
        <div className="space-y-4 mb-8">
          {RED_FLAG_QUESTIONS.map(({ key, label }) => (
            <div
              key={key}
              className="bg-white rounded-xl border-2 border-gray-100 p-4"
            >
              <p className="text-sm font-medium text-gray-700 mb-3">{label}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setAnswer(key, false)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    answers[key] === false
                      ? "bg-green-100 border-2 border-green-300 text-green-800"
                      : "border-2 border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  No
                </button>
                <button
                  onClick={() => setAnswer(key, true)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    answers[key] === true
                      ? "bg-amber-100 border-2 border-amber-300 text-amber-800"
                      : "border-2 border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>
          ))}
        </div>
        <Button
          onClick={handleContinue}
          disabled={!allAnswered || saveMutation.isPending}
          className="w-full bg-action-blue hover:bg-action-blue-hover text-white py-6 text-lg rounded-xl disabled:opacity-50"
        >
          {saveMutation.isPending ? "Checking..." : "Continue"}
        </Button>
        {wantsRecheck && (
          <button
            onClick={() => setWantsRecheck(false)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            Changed your mind? Go back
          </button>
        )}
      </div>
    </motion.div>
  );
}
