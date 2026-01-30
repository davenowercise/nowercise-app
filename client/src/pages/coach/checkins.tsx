import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Search, User, Calendar, Battery, Heart, Brain, AlertTriangle, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";

interface CheckInRecord {
  id: number;
  energyLevel: number | null;
  painLevel: number | null;
  confidence: number | null;
  sideEffects: string[];
  safetyFlags: string[];
  notes: string | null;
  createdAt: string;
}

export default function CoachCheckinsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [userIdInput, setUserIdInput] = useState("");
  const [searchUserId, setSearchUserId] = useState("");

  const searchParams = new URLSearchParams(window.location.search);
  const isDemo = searchParams.get("demo") === "true";
  const demoRole = searchParams.get("demo-role");
  const userRole = user?.role;
  const isAuthenticatedSpecialist = userRole === "specialist" || userRole === "coach" || userRole === "admin";
  const isDemoCoach = isDemo && (demoRole === "specialist" || demoRole === "coach" || demoRole === "admin");
  const isCoach = isAuthenticatedSpecialist || isDemoCoach;

  const { data, isLoading, error } = useQuery<{ ok: boolean; userId: string; checkIns: CheckInRecord[] }>({
    queryKey: ["/api/coach/checkins", searchUserId],
    queryFn: async () => {
      const params = new URLSearchParams({
        userId: searchUserId,
        demo: "true",
        "demo-role": demoRole || "specialist",
      });
      const res = await fetch(`/api/coach/checkins?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch check-ins");
      return res.json();
    },
    enabled: !!searchUserId && isCoach,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (userIdInput.trim()) {
      setSearchUserId(userIdInput.trim());
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-action-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isCoach) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Coach Access Required</h2>
            <p className="text-red-700 mb-4">This page is only available to coaches and specialists.</p>
            <Link href="/?demo=true&demo-role=specialist">
              <Button variant="outline">Switch to Coach View</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatList = (items: string[]) => {
    if (!items || items.length === 0) return "—";
    if (items.includes("NONE") || items.includes("NONE_APPLY")) return "None";
    return items.map(s => s.replace(/_/g, " ").toLowerCase()).join(", ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-4xl mx-auto pt-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dev/patient-log?demo=true&demo-role=specialist">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Patient Check-In History</h1>
            <p className="text-gray-500 text-sm">View clinical check-in records for any patient</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border p-6 mb-6"
        >
          <form onSubmit={handleSearch} className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="userId" className="text-sm font-medium mb-2 block">
                Patient User ID
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="userId"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  placeholder="Enter user ID (e.g., demo-user)"
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="bg-action-blue hover:bg-action-blue-hover">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </motion.div>

        {searchUserId && (
          <div className="space-y-4">
            {isLoading && (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 border-4 border-action-blue border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                Failed to load check-ins. Please try again.
              </div>
            )}

            {data?.checkIns && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-700">
                    {data.checkIns.length} check-in{data.checkIns.length !== 1 ? "s" : ""} found
                  </h2>
                  <span className="text-sm text-gray-500">User: {data.userId}</span>
                </div>

                {data.checkIns.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                    No check-ins found for this user.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.checkIns.map((checkIn, index) => (
                      <motion.div
                        key={checkIn.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl border shadow-sm p-5"
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <Calendar className="w-4 h-4" />
                          {formatDate(checkIn.createdAt)}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="bg-info-panel rounded-lg p-3">
                            <div className="flex items-center gap-2 text-accent-blue text-xs font-medium mb-1">
                              <Battery className="w-3 h-3" />
                              Energy
                            </div>
                            <div className="text-xl font-bold text-action-blue">
                              {checkIn.energyLevel ?? "—"}/10
                            </div>
                          </div>
                          <div className="bg-red-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-red-700 text-xs font-medium mb-1">
                              <Heart className="w-3 h-3" />
                              Pain
                            </div>
                            <div className="text-xl font-bold text-red-800">
                              {checkIn.painLevel ?? "—"}/10
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-purple-700 text-xs font-medium mb-1">
                              <Brain className="w-3 h-3" />
                              Confidence
                            </div>
                            <div className="text-xl font-bold text-purple-800">
                              {checkIn.confidence ?? "—"}/10
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 font-medium">Side Effects:</span>
                            <span className="ml-2 text-gray-700 capitalize">{formatList(checkIn.sideEffects)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">Safety Flags:</span>
                            <span className={`ml-2 capitalize ${
                              checkIn.safetyFlags.length > 0 && 
                              !checkIn.safetyFlags.includes("NONE_APPLY") 
                                ? "text-red-600 font-semibold" 
                                : "text-gray-700"
                            }`}>
                              {formatList(checkIn.safetyFlags)}
                            </span>
                          </div>
                        </div>

                        {checkIn.notes && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
                              <FileText className="w-3 h-3" />
                              Notes
                            </div>
                            <p className="text-sm text-gray-700">{checkIn.notes}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
