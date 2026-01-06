import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  CheckCircle2, 
  Shield, 
  Activity, 
  Heart,
  Info,
  Stethoscope,
  XCircle
} from "lucide-react";
import { CANCER_TYPE_GUIDELINES, ACSM_GUIDELINES, EXERCISE_SAFETY_RULES, getSafetyRulesForCancer } from "@/utils/guidelines";

interface PatientProfile {
  cancerType: string;
  treatmentPhase?: string;
  tier?: number;
}

interface TreatmentAwarePanelProps {
  patientProfile?: PatientProfile;
}

const treatmentPhaseLabels: Record<string, string> = {
  "Pre-Treatment": "Preparing for Treatment",
  "During Treatment": "Currently in Treatment",
  "Post-Surgery": "Recovering from Surgery",
  "Post-Treatment": "Completed Treatment",
  "Maintenance Treatment": "Ongoing Maintenance",
  "Recovery": "In Recovery",
  "Advanced/Palliative": "Palliative Care"
};

const tierDescriptions: Record<number, { label: string; description: string; color: string }> = {
  1: { 
    label: "Gentle Start", 
    description: "Light, seated exercises with focus on breathing and mobility",
    color: "bg-blue-100 text-blue-800"
  },
  2: { 
    label: "Building Confidence", 
    description: "Moderate activity with rest breaks as needed",
    color: "bg-green-100 text-green-800"
  },
  3: { 
    label: "Gaining Strength", 
    description: "Progressive resistance and longer cardio sessions",
    color: "bg-amber-100 text-amber-800"
  },
  4: { 
    label: "Active Recovery", 
    description: "Higher intensity workouts with full range of exercises",
    color: "bg-purple-100 text-purple-800"
  }
};

export function TreatmentAwarePanel({ patientProfile }: TreatmentAwarePanelProps) {
  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ["/api/patient/profile"],
    enabled: !patientProfile
  });

  const activeProfile = patientProfile || profile;
  
  if (isLoading) {
    return (
      <Card className="border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-teal-200 rounded w-3/4"></div>
            <div className="h-4 bg-teal-100 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cancerType = activeProfile?.cancerType?.toLowerCase() || "general";
  const treatmentPhase = activeProfile?.treatmentPhase || "Post-Treatment";
  const tier = activeProfile?.tier || 2;

  const cancerGuidelines = CANCER_TYPE_GUIDELINES[cancerType as keyof typeof CANCER_TYPE_GUIDELINES] 
    || CANCER_TYPE_GUIDELINES.general;
  
  const phaseGuidelines = ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS[treatmentPhase as keyof typeof ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS]
    || ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS["Post-Treatment"];

  const tierInfo = tierDescriptions[tier] || tierDescriptions[2];
  
  const safetyRules = getSafetyRulesForCancer(cancerType);

  const formatCancerType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  return (
    <Card className="border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-lg" data-testid="card-treatment-aware">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-teal-800">
              Your Exercise Plan
            </CardTitle>
            <p className="text-sm text-teal-600">Personalized for your journey</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-white/80 border-teal-300 text-teal-700">
            <Heart className="h-3 w-3 mr-1" />
            {formatCancerType(cancerType)}
          </Badge>
          <Badge variant="outline" className="bg-white/80 border-cyan-300 text-cyan-700">
            <Activity className="h-3 w-3 mr-1" />
            {treatmentPhaseLabels[treatmentPhase] || treatmentPhase}
          </Badge>
          <Badge className={tierInfo.color}>
            <Shield className="h-3 w-3 mr-1" />
            Tier {tier}: {tierInfo.label}
          </Badge>
        </div>

        {/* Intensity Modifier */}
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-teal-600" />
            <span className="text-sm font-medium text-teal-800">Current Intensity Level</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-teal-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-500"
                style={{ width: `${(phaseGuidelines.INTENSITY_MODIFIER || 0.7) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-teal-700">
              {Math.round((phaseGuidelines.INTENSITY_MODIFIER || 0.7) * 100)}%
            </span>
          </div>
          <p className="text-xs text-teal-600 mt-1">
            {tierInfo.description}
          </p>
        </div>

        {/* Focus Areas */}
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-teal-800">Recommended Exercise Types</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(cancerGuidelines.preferred_modes || []).slice(0, 4).map((mode: string, index: number) => (
              <Badge key={index} variant="secondary" className="bg-green-100 text-green-700 text-xs">
                {mode}
              </Badge>
            ))}
          </div>
        </div>

        {/* Safety Rules - Exercises to Avoid */}
        {safetyRules.avoid.length > 0 && (
          <div className="bg-red-50/80 rounded-lg p-3 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Exercises to Avoid</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {safetyRules.avoid.slice(0, 4).map((item: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-red-100 text-red-700 text-xs">
                  {item.replace(/-/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Safety Considerations */}
        {cancerGuidelines.considerations && cancerGuidelines.considerations.length > 0 && (
          <div className="bg-amber-50/80 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Things to Keep in Mind</span>
            </div>
            <ul className="space-y-1">
              {cancerGuidelines.considerations.slice(0, 3).map((consideration: string, index: number) => (
                <li key={index} className="text-xs text-amber-700 flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  {consideration}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Current Direction */}
        <div className="text-center pt-2">
          <p className="text-xs text-teal-600 italic">
            Direction: {phaseGuidelines.GOAL || "Supporting your healing journey"}
          </p>
          <p className="text-[10px] text-teal-500 mt-1">
            Based on ACSM-ACS Guidelines for Cancer Survivors
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
