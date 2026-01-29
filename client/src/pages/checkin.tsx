import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, CheckCircle2, AlertCircle, ArrowLeft, Check } from "lucide-react";
import { Link } from "wouter";
import { track } from "@/lib/track";

const NONE_KEY = "NONE";
const NONE_APPLY_KEY = "NONE_APPLY";

const SIDE_EFFECT_OPTIONS = [
  { value: NONE_KEY, label: "None today", isNone: true },
  { value: "nausea", label: "Nausea" },
  { value: "sleep_poor", label: "Poor sleep" },
  { value: "fatigue_general", label: "General fatigue" },
  { value: "appetite_loss", label: "Appetite loss" },
  { value: "dizziness_mild", label: "Mild dizziness" },
  { value: "new_swelling", label: "New swelling" },
  { value: "neuropathy_flare", label: "Neuropathy flare" },
  { value: "unusual_fatigue_spike", label: "Unusual fatigue spike" },
  { value: "persistent_joint_pain", label: "Persistent joint pain" },
];

const RED_FLAG_OPTIONS = [
  { value: NONE_APPLY_KEY, label: "None of these apply today", isNone: true },
  { value: "chest_pain", label: "Chest pain" },
  { value: "fever", label: "Fever" },
  { value: "severe_breathlessness", label: "Severe breathlessness" },
  { value: "fainting", label: "Fainting or near-fainting" },
  { value: "new_sudden_swelling", label: "New sudden swelling" },
  { value: "signs_of_infection", label: "Signs of infection" },
];

function toggleExclusiveMultiSelect(current: string[], value: string, noneKey: string): string[] {
  const set = new Set(current);

  if (value === noneKey) {
    if (set.has(noneKey)) return [];
    return [noneKey];
  }

  if (set.has(value)) {
    set.delete(value);
  } else {
    set.add(value);
  }

  set.delete(noneKey);

  return Array.from(set);
}

interface TodayState {
  date: string;
  safetyStatus: "GREEN" | "YELLOW" | "RED";
  readinessScore: number;
  sessionLevel: string;
  intensityModifier: string;
  explainWhy: string;
  safetyMessage: {
    title: string;
    body: string;
  };
}

function TodayStateCard({ state }: { state: TodayState }) {
  const statusConfig = {
    GREEN: {
      icon: CheckCircle2,
      bg: "bg-green-50",
      border: "border-green-200",
      iconColor: "text-green-600",
      titleColor: "text-green-800",
    },
    YELLOW: {
      icon: AlertCircle,
      bg: "bg-amber-50",
      border: "border-amber-200",
      iconColor: "text-amber-600",
      titleColor: "text-amber-800",
    },
    RED: {
      icon: AlertTriangle,
      bg: "bg-red-50",
      border: "border-red-200",
      iconColor: "text-red-600",
      titleColor: "text-red-800",
    },
  };

  const config = statusConfig[state.safetyStatus];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl border-2 ${config.border} ${config.bg} p-6`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${config.bg}`}>
          <Icon className={`w-8 h-8 ${config.iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${config.titleColor}`}>
            {state.safetyMessage.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {state.safetyMessage.body}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white/60 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Readiness</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{state.readinessScore}%</div>
        </div>
        <div className="bg-white/60 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Session Level</div>
          <div className="text-2xl font-bold text-gray-800 mt-1 capitalize">
            {state.sessionLevel.replace("_", " ").toLowerCase()}
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white/60 rounded-xl p-4">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Why this recommendation</div>
        <p className="text-sm text-gray-700 leading-relaxed">{state.explainWhy}</p>
      </div>

      <div className="mt-6">
        <Link href="/">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function CheckinPage() {
  const today = new Date().toISOString().split("T")[0];

  const [energy, setEnergy] = useState(5);
  const [pain, setPain] = useState(3);
  const [confidence, setConfidence] = useState(5);
  const [sideEffects, setSideEffects] = useState<string[]>([]);
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<TodayState | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("/api/checkins", {
        method: "POST",
        data: {
          date: today,
          energy,
          pain,
          confidence,
          sideEffects,
          redFlags,
          notes: notes || undefined,
        },
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.ok && data.todayState) {
        setResult(data.todayState);
      }
    },
  });

  const toggleSideEffect = (value: string) => {
    const newValue = toggleExclusiveMultiSelect(sideEffects, value, NONE_KEY);
    setSideEffects(newValue);
    if (value === NONE_KEY && newValue.includes(NONE_KEY)) {
      track("checkin_select", { section: "sideEffects", value: "NONE" });
    }
  };

  const toggleRedFlag = (value: string) => {
    const newValue = toggleExclusiveMultiSelect(redFlags, value, NONE_APPLY_KEY);
    setRedFlags(newValue);
    if (value === NONE_APPLY_KEY && newValue.includes(NONE_APPLY_KEY)) {
      track("checkin_select", { section: "safety", value: "NONE_APPLY" });
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white p-4">
        <div className="max-w-lg mx-auto pt-8">
          <TodayStateCard state={result} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white p-4">
      <div className="max-w-lg mx-auto pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">Daily Check-In</h1>
            <p className="text-gray-500 mt-2">
              Let's see how you're feeling today so we can adapt your session.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-sm font-medium">Energy Level</Label>
                <span className="text-sm text-teal-600 font-semibold">{energy}/10</span>
              </div>
              <Slider
                value={[energy]}
                onValueChange={([v]) => setEnergy(v)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Very low</span>
                <span>High energy</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-sm font-medium">Pain Level</Label>
                <span className="text-sm text-teal-600 font-semibold">{pain}/10</span>
              </div>
              <Slider
                value={[pain]}
                onValueChange={([v]) => setPain(v)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>No pain</span>
                <span>Severe pain</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-sm font-medium">Confidence</Label>
                <span className="text-sm text-teal-600 font-semibold">{confidence}/10</span>
              </div>
              <Slider
                value={[confidence]}
                onValueChange={([v]) => setConfidence(v)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Not confident</span>
                <span>Very confident</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <Label className="text-sm font-medium block mb-3">
              Any side effects today?
            </Label>
            <div className="space-y-2">
              {SIDE_EFFECT_OPTIONS.filter(opt => opt.isNone).map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => toggleSideEffect(opt.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors w-full text-left ${
                    sideEffects.includes(opt.value)
                      ? "bg-teal-50 border-teal-300"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    sideEffects.includes(opt.value) 
                      ? "bg-teal-500 border-teal-500" 
                      : "border-gray-300"
                  }`}>
                    {sideEffects.includes(opt.value) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {SIDE_EFFECT_OPTIONS.filter(opt => !opt.isNone).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    sideEffects.includes(opt.value)
                      ? "bg-amber-50 border-amber-200"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <Checkbox
                    checked={sideEffects.includes(opt.value)}
                    onCheckedChange={() => toggleSideEffect(opt.value)}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <Label className="text-sm font-medium text-red-800">
                Before we continue
              </Label>
            </div>
            <p className="text-xs text-red-700 mb-4">
              If any of these apply, it may be best to pause today and check with your healthcare team.
            </p>
            <div className="space-y-2">
              {RED_FLAG_OPTIONS.filter(opt => opt.isNone).map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => toggleRedFlag(opt.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors w-full text-left ${
                    redFlags.includes(opt.value)
                      ? "bg-teal-50 border-teal-300"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    redFlags.includes(opt.value) 
                      ? "bg-teal-500 border-teal-500" 
                      : "border-gray-300"
                  }`}>
                    {redFlags.includes(opt.value) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            <div className="space-y-2 mt-3">
              {RED_FLAG_OPTIONS.filter(opt => !opt.isNone).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    redFlags.includes(opt.value)
                      ? "bg-red-100 border-red-300"
                      : "bg-white border-red-100 hover:bg-red-50"
                  }`}
                >
                  <Checkbox
                    checked={redFlags.includes(opt.value)}
                    onCheckedChange={() => toggleRedFlag(opt.value)}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <Label className="text-sm font-medium block mb-3">
              Anything else to note? (optional)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling overall?"
              rows={3}
            />
          </div>

          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full h-12 text-base bg-teal-600 hover:bg-teal-700"
          >
            {mutation.isPending ? "Processing..." : "Submit Check-In"}
          </Button>

          {mutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              Something went wrong. Please try again.
            </div>
          )}

          <div className="text-center pb-8">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              Skip for now
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
