import { cn } from "@/lib/utils";

interface EnergyLevelProps {
  level: number;
  max?: number;
  showLabel?: boolean;
  className?: string;
}

const energyLevelLabels = {
  1: "Very Low",
  2: "Low",
  3: "Moderate",
  4: "Moderate-High",
  5: "High"
};

export function EnergyLevel({
  level,
  max = 5,
  showLabel = true,
  className
}: EnergyLevelProps) {
  const bars = [];
  
  for (let i = 1; i <= max; i++) {
    const active = i <= level;
    bars.push(
      <div 
        key={i}
        className={cn(
          "w-2 h-6 rounded-sm",
          active ? `energy-level-${level}` : "bg-gray-200"
        )}
      />
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex space-x-1">
        {bars}
      </div>
      {showLabel && (
        <span className="ml-2 text-xs text-gray-500">
          {energyLevelLabels[level as keyof typeof energyLevelLabels] || "Unknown"}
        </span>
      )}
    </div>
  );
}
