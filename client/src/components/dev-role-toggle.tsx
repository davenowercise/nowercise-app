import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, Stethoscope } from "lucide-react";

export function DevRoleToggle() {
  const [currentRole, setCurrentRole] = useState<"patient" | "specialist">("patient");
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get("demo-role");
    if (role === "specialist") {
      setCurrentRole("specialist");
    }
  }, []);
  
  const toggleRole = () => {
    const newRole = currentRole === "patient" ? "specialist" : "patient";
    const params = new URLSearchParams(window.location.search);
    params.set("demo", "true");
    params.set("demo-role", newRole);
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };
  
  const isDemoMode = window.location.search.includes("demo=true");
  if (!isDemoMode) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={toggleRole}
        variant="outline"
        size="sm"
        className="bg-white shadow-lg border-2 hover:bg-gray-50"
      >
        {currentRole === "patient" ? (
          <>
            <User className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-xs">Patient View</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-xs text-gray-400">Switch to Coach →</span>
          </>
        ) : (
          <>
            <Stethoscope className="w-4 h-4 mr-2 text-purple-500" />
            <span className="text-xs">Coach View</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-xs text-gray-400">Switch to Patient →</span>
          </>
        )}
      </Button>
    </div>
  );
}
