import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, Stethoscope, ChevronUp, ChevronDown, LayoutDashboard, ClipboardList } from "lucide-react";
import { Link } from "wouter";

export function DevRoleToggle() {
  const [currentRole, setCurrentRole] = useState<"patient" | "specialist">("patient");
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get("demo-role");
    if (role === "specialist") {
      setCurrentRole("specialist");
    }
  }, []);
  
  const toggleRole = () => {
    const newRole = currentRole === "patient" ? "specialist" : "patient";
    if (newRole === "specialist") {
      window.location.href = `/dev/patient-log?demo=true&demo-role=specialist`;
    } else {
      window.location.href = `/?demo=true`;
    }
  };
  
  const isDemoMode = window.location.search.includes("demo=true");
  if (!isDemoMode) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-lg border-2 p-3 mb-1 min-w-[200px]">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Dev Links
          </div>
          <div className="space-y-2">
            <Link href="/?demo=true">
              <a className="flex items-center gap-2 text-sm text-gray-700 hover:text-teal-600 py-1">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard (demo)
              </a>
            </Link>
            <Link href="/dev/patient-log?demo=true&demo-role=specialist">
              <a className="flex items-center gap-2 text-sm text-gray-700 hover:text-teal-600 py-1">
                <ClipboardList className="w-4 h-4" />
                Patient Log (demo)
              </a>
            </Link>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg border-2 hover:bg-gray-50 px-2"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </Button>
        
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
    </div>
  );
}
