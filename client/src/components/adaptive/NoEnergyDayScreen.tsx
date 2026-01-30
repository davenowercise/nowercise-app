import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Battery, Wind } from "lucide-react";
import { track } from "@/lib/track";

interface NoEnergyDayScreenProps {
  onStartGentleSession: () => void;
}

const AUDIOS = {
  breathingReset2m: { title: "2-minute breathing reset", url: "" },
  enoughToday: { title: "You're doing enough", url: "" },
};

export function NoEnergyDayScreen({ onStartGentleSession }: NoEnergyDayScreenProps) {
  useEffect(() => {
    track("screen_view", { screen: "NoEnergyDay" });
  }, []);

  const handleStartGentleSession = () => {
    track("cta_click", { screen: "NoEnergyDay", cta: "Start gentle session" });
    onStartGentleSession();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white p-6 flex flex-col items-center justify-center"
    >
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Battery className="w-8 h-8 text-blue-500" />
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Low energy days happen.
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Let's keep things very gentle today.
          <br />
          A few minutes of breathing and light mobility can help your body without draining you.
        </p>
        
        <Button 
          onClick={handleStartGentleSession}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-xl mb-4"
        >
          Start gentle session
        </Button>
        
        <p className="text-sm text-gray-500 mb-6">
          Rest is also a positive step.
        </p>

        {(AUDIOS.breathingReset2m.url || AUDIOS.enoughToday.url) && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            {AUDIOS.breathingReset2m.url && (
              <button className="flex items-center gap-3 w-full p-3 text-left bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <Wind className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-700">{AUDIOS.breathingReset2m.title}</span>
              </button>
            )}
            {AUDIOS.enoughToday.url && (
              <button className="flex items-center gap-3 w-full p-3 text-left bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <Wind className="w-5 h-5 text-accent-blue" />
                <span className="text-sm text-gray-700">{AUDIOS.enoughToday.title}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
