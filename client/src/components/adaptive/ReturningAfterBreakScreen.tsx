import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface ReturningAfterBreakScreenProps {
  onStartGentleSession: () => void;
}

export function ReturningAfterBreakScreen({ onStartGentleSession }: ReturningAfterBreakScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white p-6 flex flex-col items-center justify-center"
    >
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-teal-500" />
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Welcome back
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          It's completely normal to have gaps.
          <br />
          Let's ease back in gently today.
          <br />
          We'll start with a lighter session to help your body settle.
        </p>
        
        <Button 
          onClick={onStartGentleSession}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg rounded-xl mb-4"
        >
          Start gentle session
        </Button>
        
        <p className="text-sm text-gray-500">
          There's no catching up needed.
        </p>
      </div>
    </motion.div>
  );
}
