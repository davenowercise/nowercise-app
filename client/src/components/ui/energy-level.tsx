import { Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, BatteryWarning } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnergyLevelProps {
  level: number;
  showLabel?: boolean;
  className?: string;
}

export function EnergyLevel({ level, showLabel = false, className }: EnergyLevelProps) {
  const renderIcon = () => {
    switch (level) {
      case 1:
        return <BatteryLow className="h-4 w-4 text-action-blue" />;
      case 2:
        return <BatteryMedium className="h-4 w-4 text-blue-500" />;
      case 3:
        return <BatteryMedium className="h-4 w-4 text-yellow-500" />;
      case 4:
        return <BatteryWarning className="h-4 w-4 text-amber-500" />;
      case 5:
        return <BatteryFull className="h-4 w-4 text-red-500" />;
      default:
        return <Battery className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelText = () => {
    switch (level) {
      case 1:
        return "Very Low Energy";
      case 2:
        return "Low Energy";
      case 3:
        return "Moderate Energy";
      case 4:
        return "High Energy";
      case 5:
        return "Very High Energy";
      default:
        return "Unknown Energy Level";
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {renderIcon()}
      {showLabel && <span className="text-xs text-muted-foreground">{getLevelText()}</span>}
    </div>
  );
}