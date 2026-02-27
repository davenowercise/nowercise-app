interface WhyTodayCardProps {
  safetyStatus: "GREEN" | "YELLOW" | "RED";
}

const MESSAGES: Record<"GREEN" | "YELLOW" | "RED", string> = {
  GREEN: "Energy looks steady today. We'll follow your planned rebuild session.",
  YELLOW: "Energy is lower or symptoms were reported. We've adjusted today's session to protect recovery while keeping you moving.",
  RED: "You've reported symptoms that need caution. Training is paused today. Focus on rest or a gentle reset.",
};

export function WhyTodayCard({ safetyStatus }: WhyTodayCardProps) {
  const message = MESSAGES[safetyStatus];

  return (
    <div className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-4 mb-6">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        Here's Today's Plan
      </p>
      <p className="text-gray-700 text-sm leading-relaxed">
        {message}
      </p>
    </div>
  );
}
