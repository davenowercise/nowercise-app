import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, AlertTriangle, XCircle, ChevronRight, MessageCircle, Heart, Zap, Brain, Activity } from "lucide-react";
import { 
  SymptomState, 
  SignalLevel, 
  getExerciseFocusResult, 
  ExerciseSuggestion 
} from "@/utils/symptom-focus";

interface SignalInfo {
  level: SignalLevel;
  title: string;
  icon: JSX.Element;
  color: string;
  bgColor: string;
  borderColor: string;
  meaning: string;
  action: string;
  tips: string[];
}

const signalData: Record<SignalLevel, SignalInfo> = {
  green: {
    level: "green",
    title: "Safe to Proceed",
    icon: <CheckCircle className="h-6 w-6" />,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    meaning: "Your body is responding normally. These feelings are typical during exercise.",
    action: "Continue with your planned workout. Listen to your body as always.",
    tips: [
      "Mild warmth or light sweating is normal",
      "Slight muscle fatigue means you're working",
      "Gentle breathlessness during effort is expected",
      "Minor muscle soreness after exercise is okay"
    ]
  },
  amber: {
    level: "amber",
    title: "Proceed with Caution",
    icon: <AlertTriangle className="h-6 w-6" />,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    meaning: "Your body is sending signals to pay attention. Consider adapting today's session.",
    action: "Modify your workout: reduce intensity, skip certain exercises, or take more rest.",
    tips: [
      "Choose gentler exercise options today",
      "Take longer rest periods between exercises",
      "Skip exercises that feel uncomfortable",
      "Consider a shorter session",
      "Hydrate and listen carefully to your body"
    ]
  },
  red: {
    level: "red",
    title: "Stop and Rest",
    icon: <XCircle className="h-6 w-6" />,
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    meaning: "Your body needs rest today. This is not a failure - it's wisdom.",
    action: "Skip exercise today. Focus on rest, gentle breathing, and self-care.",
    tips: [
      "Rest is an essential part of recovery",
      "Gentle breathing exercises are always safe",
      "Stay hydrated and comfortable",
      "Consider messaging your specialist",
      "Tomorrow is another opportunity"
    ]
  }
};

interface SymptomCheck {
  id: keyof SymptomState;
  question: string;
  greenRange: string;
  amberRange: string;
  redRange: string;
  icon: JSX.Element;
}

const symptomChecks: SymptomCheck[] = [
  {
    id: "fatigue",
    question: "How's your energy level right now?",
    greenRange: "Feel okay to move",
    amberRange: "Tired but could try gently",
    redRange: "Exhausted, need rest",
    icon: <Zap className="h-4 w-4" />
  },
  {
    id: "pain",
    question: "Any pain or discomfort?",
    greenRange: "None or very mild",
    amberRange: "Some discomfort, manageable",
    redRange: "Significant pain",
    icon: <AlertCircle className="h-4 w-4" />
  },
  {
    id: "anxiety",
    question: "How's your worry or anxiety level?",
    greenRange: "Feeling calm",
    amberRange: "Some worry or tension",
    redRange: "Anxiety is loud today",
    icon: <Brain className="h-4 w-4" />
  },
  {
    id: "low_mood",
    question: "How's your mood today?",
    greenRange: "Feeling okay or good",
    amberRange: "A bit flat or low",
    redRange: "Really struggling today",
    icon: <Heart className="h-4 w-4" />
  },
  {
    id: "QoL_limits",
    question: "How are everyday tasks feeling?",
    greenRange: "Managing okay",
    amberRange: "Some tasks feel harder",
    redRange: "Basic tasks are difficult",
    icon: <Activity className="h-4 w-4" />
  }
];

interface SymptomSignalProps {
  onSignalChange?: (signal: SignalLevel, symptoms: SymptomState) => void;
}

export function SymptomSignal({ onSignalChange }: SymptomSignalProps) {
  const [showCheck, setShowCheck] = useState(false);
  const [responses, setResponses] = useState<Record<string, SignalLevel>>({});
  const [currentSignal, setCurrentSignal] = useState<SignalLevel | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [exerciseSuggestions, setExerciseSuggestions] = useState<ExerciseSuggestion[]>([]);
  const [focusExplanation, setFocusExplanation] = useState<string>("");

  const calculateSignal = (): SignalLevel => {
    const values = Object.values(responses);
    if (values.includes("red")) return "red";
    if (values.filter(v => v === "amber").length >= 2) return "red";
    if (values.includes("amber")) return "amber";
    return "green";
  };

  const handleComplete = () => {
    const signal = calculateSignal();
    setCurrentSignal(signal);
    setShowCheck(false);
    setShowInfo(true);
    
    // Convert responses to SymptomState
    const symptoms: SymptomState = {
      fatigue: responses.fatigue,
      pain: responses.pain,
      anxiety: responses.anxiety,
      low_mood: responses.low_mood,
      QoL_limits: responses.QoL_limits
    };
    
    // Get exercise focus suggestions
    const focusResult = getExerciseFocusResult(symptoms);
    setExerciseSuggestions(focusResult.suggestions);
    setFocusExplanation(focusResult.explanations[0] || "");
    
    onSignalChange?.(signal, symptoms);
  };

  const signal = currentSignal ? signalData[currentSignal] : null;

  const getFocusIcon = (type: string) => {
    switch (type) {
      case "aerobic": return <Activity className="h-4 w-4" />;
      case "resistance": return <Zap className="h-4 w-4" />;
      case "mind_body": return <Brain className="h-4 w-4" />;
      case "multi_component": return <Heart className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg" data-testid="card-symptom-signal">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-blue-800">
              Body Signals Check
            </CardTitle>
            <p className="text-sm text-blue-600">Quick safety assessment</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!signal ? (
          <>
            <div className="flex justify-center gap-4 py-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center mx-auto mb-1">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xs text-green-700">Safe</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto mb-1">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <span className="text-xs text-amber-700">Caution</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center mx-auto mb-1">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <span className="text-xs text-red-700">Rest</span>
              </div>
            </div>

            <p className="text-center text-blue-700 text-sm">
              A quick check helps you decide what's safe today
            </p>

            <Dialog open={showCheck} onOpenChange={setShowCheck}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-6"
                  data-testid="button-start-symptom-check"
                >
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Check My Signals
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">How are you feeling?</DialogTitle>
                  <p className="text-sm text-gray-500">Take your time. Be honest with yourself.</p>
                </DialogHeader>

                <div className="py-4 space-y-5">
                  {symptomChecks.map((check) => (
                    <div key={check.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{check.icon}</span>
                        <p className="font-medium text-gray-800">{check.question}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setResponses(prev => ({ ...prev, [check.id]: "green" }))}
                          className={`p-2 rounded-lg text-xs transition-all ${
                            responses[check.id] === "green"
                              ? "bg-green-500 text-white shadow-md"
                              : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                          }`}
                          data-testid={`button-${check.id}-green`}
                        >
                          {check.greenRange}
                        </button>
                        <button
                          onClick={() => setResponses(prev => ({ ...prev, [check.id]: "amber" }))}
                          className={`p-2 rounded-lg text-xs transition-all ${
                            responses[check.id] === "amber"
                              ? "bg-amber-500 text-white shadow-md"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                          }`}
                          data-testid={`button-${check.id}-amber`}
                        >
                          {check.amberRange}
                        </button>
                        <button
                          onClick={() => setResponses(prev => ({ ...prev, [check.id]: "red" }))}
                          className={`p-2 rounded-lg text-xs transition-all ${
                            responses[check.id] === "red"
                              ? "bg-red-500 text-white shadow-md"
                              : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                          }`}
                          data-testid={`button-${check.id}-red`}
                        >
                          {check.redRange}
                        </button>
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={handleComplete}
                    disabled={Object.keys(responses).length < symptomChecks.length}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 py-6"
                    data-testid="button-get-signal"
                  >
                    Get My Signal & Suggestions
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <Dialog open={showInfo} onOpenChange={setShowInfo}>
            <div className={`p-4 rounded-xl ${signal.bgColor} border-2 ${signal.borderColor}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full ${signal.bgColor} border-2 ${signal.borderColor} flex items-center justify-center ${signal.color}`}>
                  {signal.icon}
                </div>
                <div>
                  <Badge className={`${signal.bgColor} ${signal.color} border ${signal.borderColor}`}>
                    {signal.title}
                  </Badge>
                  <p className={`text-sm ${signal.color} mt-1`}>
                    {signal.meaning.split('.')[0]}
                  </p>
                </div>
              </div>
              
              {/* Show personalized exercise suggestion preview */}
              {exerciseSuggestions.length > 0 && (
                <div className="bg-white/60 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-600 mb-1">Today's suggestion:</p>
                  <div className="flex items-center gap-2">
                    {getFocusIcon(exerciseSuggestions[0].type)}
                    <span className="text-sm font-medium text-gray-800">
                      {exerciseSuggestions[0].title}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {exerciseSuggestions[0].duration}
                    </Badge>
                  </div>
                </div>
              )}
              
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`w-full ${signal.borderColor} ${signal.color}`}
                  data-testid="button-learn-more-signal"
                >
                  See Full Suggestions
                </Button>
              </DialogTrigger>

              <Button 
                variant="ghost" 
                onClick={() => {
                  setCurrentSignal(null);
                  setResponses({});
                  setExerciseSuggestions([]);
                  setFocusExplanation("");
                }}
                className="w-full mt-2 text-gray-500"
              >
                Check Again
              </Button>
            </div>

            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${signal.bgColor} border-2 ${signal.borderColor} flex items-center justify-center ${signal.color}`}>
                    {signal.icon}
                  </div>
                  <DialogTitle className={signal.color}>{signal.title}</DialogTitle>
                </div>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">What this means:</h4>
                  <p className="text-gray-600">{signal.meaning}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">What to do:</h4>
                  <p className="text-gray-600">{signal.action}</p>
                </div>

                {/* Exercise Suggestions Section */}
                {exerciseSuggestions.length > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                    <h4 className="font-medium text-indigo-800 mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Personalized Movement Suggestions
                    </h4>
                    
                    {focusExplanation && (
                      <p className="text-sm text-indigo-700 italic mb-3 bg-white/60 p-2 rounded">
                        "{focusExplanation}"
                      </p>
                    )}
                    
                    <div className="space-y-3">
                      {exerciseSuggestions.map((suggestion, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            {getFocusIcon(suggestion.type)}
                            <span className="font-medium text-gray-800">{suggestion.title}</span>
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {suggestion.duration}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                          <p className="text-xs text-indigo-600 italic">{suggestion.gentleNote}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Tips for today:</h4>
                  <ul className="space-y-2">
                    {signal.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <CheckCircle className={`h-4 w-4 mt-0.5 ${signal.color}`} />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Permission to rest reminder */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-600 text-center italic">
                    It's always okay to rest instead. Rest is part of training.
                  </p>
                </div>

                {signal.level !== "green" && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-message-specialist"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message Your Specialist
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
