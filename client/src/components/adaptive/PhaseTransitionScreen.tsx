import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TrendingUp, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PhaseTransitionScreenProps {
  onContinue: () => void;
}

export function PhaseTransitionScreen({ onContinue }: PhaseTransitionScreenProps) {
  const queryClient = useQueryClient();

  const markSeenMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/user/phase-transition/seen", {
        method: "POST",
        data: { seenAt: new Date().toISOString() },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/state"] });
      onContinue();
    },
  });

  const handleContinue = () => {
    markSeenMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white p-6 flex flex-col items-center justify-center"
    >
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <TrendingUp className="w-8 h-8 text-purple-500" />
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          You're entering a new phase
        </h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Your body is ready for a slightly more progressive focus.
          <br />
          We'll still adjust sessions based on how you feel each day.
        </p>
        
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8 text-left">
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-gray-700">
              <Check className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <span>Slightly longer sessions</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <Check className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <span>Gentle strength building</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <Check className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <span>Continued flexibility on low days</span>
            </li>
          </ul>
        </div>
        
        <Button 
          onClick={handleContinue}
          disabled={markSeenMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg rounded-xl"
        >
          {markSeenMutation.isPending ? "..." : "Continue"}
        </Button>
      </div>
    </motion.div>
  );
}
