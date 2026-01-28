import { motion } from "framer-motion";
import { Badge, Divider, PremiumCard } from "./ui/PremiumCard";

type KindStepTone = "REST" | "GENTLE" | "WALK" | "STRENGTH";

function toneCopy(tone: KindStepTone) {
  switch (tone) {
    case "REST":
      return {
        title: "Rest Day",
        subtitle: "Rest is part of recovery. Your body heals and rebuilds today.",
        nudge: "Rest today",
        nudgeText: "This counts as taking care of yourself.",
        icon: "🛏️",
      };
    case "GENTLE":
      return {
        title: "Gentle Movement",
        subtitle: "A few minutes of calm movement can help you feel more settled.",
        nudge: "Small session",
        nudgeText: "Keep it light. You're building confidence.",
        icon: "🫧",
      };
    case "WALK":
      return {
        title: "Short Walk",
        subtitle: "A little fresh air and easy steps can shift the day.",
        nudge: "Easy pace",
        nudgeText: "Stop early if symptoms rise.",
        icon: "🚶",
      };
    case "STRENGTH":
      return {
        title: "Gentle Strength",
        subtitle: "A small dose of strength supports function and confidence.",
        nudge: "Low dose",
        nudgeText: "Smooth reps, no strain.",
        icon: "💪",
      };
  }
}

export default function OneKindStepPremium() {
  const tone: KindStepTone = "REST";
  const safety: "GREEN" | "AMBER" | "RED" = "GREEN";

  const copy = toneCopy(tone);

  const safetyChip =
    safety === "GREEN" ? "Safe to proceed" : safety === "AMBER" ? "Go gently" : "Pause & check in";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <PremiumCard
        title="One kind step"
        subtitle="Choose one small action for today — that's enough."
        rightSlot={
          <div className="flex items-center gap-2">
            <Badge tone="quiet">Today</Badge>
            <Badge tone={safety === "GREEN" ? "info" : "quiet"}>{safetyChip}</Badge>
          </div>
        }
        accent="teal"
      >
        <div
          className={[
            "rounded-2xl border border-black/5 bg-teal-50/40",
            "shadow-[0_8px_24px_rgba(0,0,0,0.05)]",
            "p-4 sm:p-5",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="h-10 w-10 rounded-2xl bg-teal-100 flex items-center justify-center shrink-0">
                <span className="text-lg">{copy.icon}</span>
              </div>

              <div className="min-w-0">
                <div className="text-sm sm:text-[15px] font-semibold text-black/85 truncate">
                  {copy.title}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-black/55 leading-relaxed">
                  {copy.subtitle}
                </div>
              </div>
            </div>

            <button
              type="button"
              className={[
                "shrink-0 rounded-full px-4 py-2",
                "bg-white border border-black/5",
                "text-sm font-medium text-black/70",
                "shadow-[0_6px_18px_rgba(0,0,0,0.06)]",
                "hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-shadow",
              ].join(" ")}
              onClick={() => {
                console.log("Start kind step");
              }}
            >
              Start →
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-black/5 bg-white p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
              <span className="text-base">✅</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-black/80">{copy.nudge}</div>
              <div className="mt-1 text-xs sm:text-sm text-black/55">{copy.nudgeText}</div>
            </div>
          </div>
        </div>

        <Divider />

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-3 text-center">
            <div className="text-[13px] font-semibold text-black/75">0/2</div>
            <div className="mt-1 text-[11px] tracking-wide uppercase text-black/45">Strength</div>
          </div>
          <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-3 text-center">
            <div className="text-[13px] font-semibold text-black/75">0/45</div>
            <div className="mt-1 text-[11px] tracking-wide uppercase text-black/45">Walk mins</div>
          </div>
          <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-3 text-center">
            <div className="text-[13px] font-semibold text-black/75">0</div>
            <div className="mt-1 text-[11px] tracking-wide uppercase text-black/45">Rest days</div>
          </div>
        </div>

        <div className="mt-4 text-xs sm:text-sm text-black/45 text-center">
          Whatever you choose is the right choice for today.
        </div>
      </PremiumCard>
    </motion.div>
  );
}
