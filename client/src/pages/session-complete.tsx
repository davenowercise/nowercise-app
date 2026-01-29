import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, Home } from "lucide-react";
import { PostSessionFeelScreen } from "@/components/adaptive";

type Stage = "FEEDBACK" | "COMPLETE";

export default function SessionCompletePage() {
  const [stage, setStage] = useState<Stage>("FEEDBACK");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const completeSessionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/session/complete", {
        method: "POST",
        data: { completedAt: new Date().toISOString() },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/state"] });
    },
  });

  if (stage === "FEEDBACK") {
    return (
      <PostSessionFeelScreen 
        onComplete={() => {
          completeSessionMutation.mutate();
          setStage("COMPLETE");
        }} 
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white p-6 flex flex-col items-center justify-center"
    >
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-teal-500" />
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Session complete
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Well done. Every session is a step forward.
          <br />
          Take a moment to breathe and rest.
        </p>
        
        <Button 
          onClick={() => setLocation("/")}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg rounded-xl"
        >
          <Home className="w-5 h-5 mr-2" />
          Return home
        </Button>
      </div>
    </motion.div>
  );
}
