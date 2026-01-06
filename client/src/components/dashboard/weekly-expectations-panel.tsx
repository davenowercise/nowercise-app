import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Compass,
  Sun,
  Leaf,
  Heart
} from "lucide-react";

interface PatientProfile {
  cancerType: string;
  treatmentPhase?: string;
  tier?: number;
}

interface WeeklyExpectationsPanelProps {
  patientProfile?: PatientProfile;
}

const treatmentPhaseWisdom: Record<string, {
  gentleMessage: string;
  kindReminder: string;
}> = {
  "Pre-Treatment": {
    gentleMessage: "This is a time to gently prepare your body. Move when it feels right.",
    kindReminder: "Building a foundation happens one small step at a time."
  },
  "During Treatment": {
    gentleMessage: "Treatment takes so much from you. Rest is healing. Movement is optional.",
    kindReminder: "Some days, the bravest thing is to rest."
  },
  "Post-Surgery": {
    gentleMessage: "Your body is doing the extraordinary work of healing. Be patient with yourself.",
    kindReminder: "Gentle movement helps when you're ready — there's no rush."
  },
  "Post-Treatment": {
    gentleMessage: "Recovery isn't linear. Good days and tired days are both part of healing.",
    kindReminder: "Every small step forward counts."
  },
  "Maintenance Treatment": {
    gentleMessage: "You're learning to move with treatment as your companion.",
    kindReminder: "Listen to your body — it knows what it needs."
  },
  "Recovery": {
    gentleMessage: "You're rebuilding, gently. Trust the process.",
    kindReminder: "Celebrate the small victories — they add up."
  },
  "Advanced/Palliative": {
    gentleMessage: "Quality of life is what matters. Move only when it brings comfort.",
    kindReminder: "You deserve gentleness and rest."
  }
};

export function WeeklyExpectationsPanel({ patientProfile }: WeeklyExpectationsPanelProps) {
  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ["/api/patient/profile"],
    enabled: !patientProfile,
    retry: false
  });

  const activeProfile = patientProfile || profile;
  
  if (isLoading) {
    return (
      <Card className="border border-gray-100 bg-gradient-to-br from-gray-50 to-white shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const treatmentPhase = activeProfile?.treatmentPhase || "Post-Treatment";
  const wisdom = treatmentPhaseWisdom[treatmentPhase] || treatmentPhaseWisdom["Post-Treatment"];

  return (
    <Card className="border border-gray-100 bg-gradient-to-br from-gray-50 to-white shadow-sm" data-testid="card-weekly-direction">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-gray-700 flex items-center gap-2">
          <Compass className="h-5 w-5 text-teal-500" />
          Gentle Direction
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-4 border border-teal-100">
          <div className="flex items-start gap-3 mb-3">
            <Leaf className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-teal-800 leading-relaxed">
              {wisdom.gentleMessage}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-start gap-3">
            <Sun className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 italic leading-relaxed">
              "{wisdom.kindReminder}"
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-400 leading-relaxed">
            These are directions, not requirements. You decide what's right for today.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
