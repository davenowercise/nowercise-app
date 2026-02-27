interface WhyTodayCardProps {
  safetyStatus: "GREEN" | "YELLOW" | "RED";
}

const TITLES: Record<"GREEN" | "YELLOW" | "RED", string> = {
  GREEN: "Here's Today's Plan",
  YELLOW: "Here's Today's Plan",
  RED: "Recovery Day",
};

const MESSAGES: Record<"GREEN" | "YELLOW" | "RED", string> = {
  GREEN: "Energy looks steady today. We'll follow your planned rebuild session.",
  YELLOW: "Energy is lower or symptoms were reported. We've adjusted today's session to protect recovery while keeping you moving.",
  RED: "Your check-in suggests today is better used for recovery than progression. We'll protect your energy and focus on a gentle reset today. This is part of the plan — not a setback.",
};

export function WhyTodayCard({ safetyStatus }: WhyTodayCardProps) {
  const title = TITLES[safetyStatus];
  const message = MESSAGES[safetyStatus];

  return (
    <div className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-4 mb-6">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        {title}
      </p>
      <p className="text-gray-700 text-sm leading-relaxed">
        {message}
      </p>
    </div>
  );
}
