import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface ComorbidityWarningsProps {
  exercise: {
    id: number;
    name: string;
    movementType: string;
    description?: string;
  };
  comorbidities: string[];
}

interface ComorbidityGuidelines {
  [key: string]: {
    safe: string[];
    caution: string[];
    avoid: string[];
  };
}

// Mirror the same comorbidity guidelines from the backend
const COMORBIDITY_EXERCISE_GUIDELINES: ComorbidityGuidelines = {
  'diabetes': {
    safe: ['walking', 'swimming', 'cycling', 'strength_training', 'yoga', 'tai_chi'],
    caution: ['high_intensity', 'plyometrics'],
    avoid: ['prolonged_endurance']
  },
  'hypertension': {
    safe: ['walking', 'swimming', 'cycling', 'light_resistance'],
    caution: ['moderate_resistance', 'jogging'],
    avoid: ['heavy_lifting', 'high_intensity', 'inverted_poses']
  },
  'heart_disease': {
    safe: ['walking', 'light_swimming', 'stationary_cycling', 'gentle_yoga'],
    caution: ['light_resistance', 'low_impact'],
    avoid: ['sprinting', 'heavy_lifting', 'high_intensity', 'valsalva_maneuvers']
  },
  'osteoporosis': {
    safe: ['walking', 'light_resistance', 'tai_chi', 'gentle_yoga', 'swimming'],
    caution: ['moderate_resistance', 'balance_exercises'],
    avoid: ['jumping', 'twisting', 'high_impact', 'forward_bending']
  },
  'arthritis': {
    safe: ['swimming', 'water_exercises', 'walking', 'cycling', 'gentle_yoga'],
    caution: ['light_resistance', 'balance_training'],
    avoid: ['high_impact', 'heavy_lifting']
  },
  'respiratory_conditions': {
    safe: ['walking', 'light_swimming', 'stationary_cycling', 'breathing_exercises'],
    caution: ['moderate_cardio', 'light_resistance'],
    avoid: ['high_intensity', 'cold_weather_exercise']
  },
  'neuropathy': {
    safe: ['swimming', 'seated_exercises', 'gentle_yoga', 'walking'],
    caution: ['balance_training', 'light_resistance'],
    avoid: ['high_impact', 'exercising_without_checking_feet']
  }
};

// Friendly display names for comorbidities
const COMORBIDITY_DISPLAY_NAMES: {[key: string]: string} = {
  'diabetes': 'Diabetes',
  'hypertension': 'Hypertension',
  'heart_disease': 'Heart Disease',
  'osteoporosis': 'Osteoporosis', 
  'arthritis': 'Arthritis',
  'respiratory_conditions': 'Respiratory Conditions',
  'neuropathy': 'Neuropathy'
};

const ComorbidityWarnings: React.FC<ComorbidityWarningsProps> = ({ exercise, comorbidities }) => {
  if (!comorbidities || comorbidities.length === 0) {
    return null;
  }

  const movementType = exercise.movementType?.toLowerCase() || '';
  
  // Arrays to track compatibility with different comorbidities
  const safeFor: string[] = [];
  const cautionFor: string[] = [];
  const avoidFor: string[] = [];

  // Analyze each comorbidity
  comorbidities.forEach(comorbidity => {
    if (COMORBIDITY_EXERCISE_GUIDELINES[comorbidity]) {
      const guidelines = COMORBIDITY_EXERCISE_GUIDELINES[comorbidity];
      
      // Check if this movement type is in the "safe" list
      if (guidelines.safe.some(type => movementType.includes(type))) {
        safeFor.push(comorbidity);
      }
      
      // Check if movement type requires caution
      if (guidelines.caution.some(type => movementType.includes(type))) {
        cautionFor.push(comorbidity);
      }
      
      // Check if movement type should be avoided
      if (guidelines.avoid.some(type => movementType.includes(type))) {
        avoidFor.push(comorbidity);
      }
    }
  });

  // Render nothing if no specific warnings or benefits
  if (safeFor.length === 0 && cautionFor.length === 0 && avoidFor.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      {avoidFor.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4 mb-1" />
          <AlertTitle className="font-medium">Exercise Caution</AlertTitle>
          <AlertDescription className="mt-1">
            <p className="text-sm">
              This exercise may not be suitable with your health conditions:
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {avoidFor.map(condition => (
                <Badge key={condition} variant="outline" className="bg-destructive/10">
                  {COMORBIDITY_DISPLAY_NAMES[condition] || condition}
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {cautionFor.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4 mb-1 text-amber-500" />
          <AlertTitle className="font-medium text-amber-700 dark:text-amber-300">Proceed with Care</AlertTitle>
          <AlertDescription className="mt-1">
            <p className="text-sm">
              This exercise requires modifications for your condition{cautionFor.length > 1 ? 's' : ''}:
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {cautionFor.map(condition => (
                <Badge key={condition} variant="outline" className="bg-amber-500/10">
                  {COMORBIDITY_DISPLAY_NAMES[condition] || condition}
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {safeFor.length > 0 && (
        <Alert variant="default" className="border-info-border bg-info-panel dark:bg-action-blue/20 dark:border-info-border">
          <CheckCircle className="h-4 w-4 text-green-500 mb-1" />
          <AlertTitle className="font-medium text-accent-blue dark:text-accent-blue">Recommended</AlertTitle>
          <AlertDescription className="mt-1 text-accent-blue dark:text-accent-blue">
            <p className="text-sm">
              This exercise is well-suited for your condition{safeFor.length > 1 ? 's' : ''}:
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {safeFor.map(condition => (
                <Badge key={condition} variant="outline" className="bg-action-blue/10 text-accent-blue dark:text-accent-blue border-info-border dark:border-info-border">
                  {COMORBIDITY_DISPLAY_NAMES[condition] || condition}
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Alert variant="default" className="bg-slate-50 dark:bg-slate-950">
        <Info className="h-4 w-4 mb-1" />
        <AlertTitle className="font-medium">Safety First</AlertTitle>
        <AlertDescription className="mt-1 text-sm">
          Always consult with your healthcare provider before starting any new exercise program.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ComorbidityWarnings;