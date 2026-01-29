import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Leaf, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { track } from "@/lib/track";

interface ProgressReflectionScreenProps {
  onContinue: () => void;
}

export function ProgressReflectionScreen({ onContinue }: ProgressReflectionScreenProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    track("screen_view", { screen: "ProgressReflection" });
  }, []);

  const markSeenMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/user/progress-reflection/seen", {
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
    track("cta_click", { screen: "ProgressReflection", cta: "Continue" });
    markSeenMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-green-50/50 to-white p-6 flex flex-col items-center justify-center"
    >
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Leaf className="w-8 h-8 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Your recent pattern
        </h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          🌿 You've been supporting your body regularly.
          <br />
          Small steps are adding up.
        </p>
        
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8 text-left">
          <p className="text-sm text-gray-600 mb-3">You've completed sessions focused on:</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 text-gray-700">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Mobility</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Light strength</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Recovery</span>
            </li>
          </ul>
        </div>
        
        <Button 
          onClick={handleContinue}
          disabled={markSeenMutation.isPending}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-xl"
        >
          {markSeenMutation.isPending ? "..." : "Continue"}
        </Button>
      </div>
    </motion.div>
  );
}
