import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, AlertTriangle, User, Clock, Mail, MailCheck, ShieldAlert } from "lucide-react";
import { Link } from "wouter";

interface AlertRecord {
  id: number;
  userId: string;
  checkInId: number;
  severity: string;
  reasons: string[];
  message: string;
  createdAt: string;
  notifiedAt: string | null;
}

export default function CoachAlertsPage() {
  const { user, isLoading: authLoading } = useAuth();

  const searchParams = new URLSearchParams(window.location.search);
  const isDemo = searchParams.get("demo") === "true";
  const demoRole = searchParams.get("demo-role");
  const userRole = user?.role;
  const isAuthenticatedSpecialist = userRole === "specialist" || userRole === "coach" || userRole === "admin";
  const isDemoCoach = isDemo && (demoRole === "specialist" || demoRole === "coach" || demoRole === "admin");
  const isCoach = isAuthenticatedSpecialist || isDemoCoach;

  const { data, isLoading, error } = useQuery<{ ok: boolean; alerts: AlertRecord[] }>({
    queryKey: ["/api/coach/alerts"],
    queryFn: async () => {
      const params = new URLSearchParams({
        days: "7",
        demo: "true",
        "demo-role": demoRole || "specialist",
      });
      const res = await fetch(`/api/coach/alerts?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return res.json();
    },
    enabled: isCoach,
  });

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
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

  const formatReasons = (reasons: string[]) => {
    if (!reasons || reasons.length === 0) return "—";
    return reasons.map(r => r.replace(/_/g, " ")).join(", ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/?demo=true&demo-role=specialist">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Safety Alerts</h1>
              <p className="text-gray-600">Recent red flag check-ins from patients</p>
            </div>
          </div>
        </motion.div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
            Unable to load alerts. Please try again.
          </div>
        )}

        {data?.ok && data.alerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#EDF3F8] border border-[#D6E3EE] rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#D6E3EE] flex items-center justify-center mx-auto mb-4">
              <MailCheck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-[#4E6F99] mb-2">No recent alerts</h3>
            <p className="text-[#5F7FA8]">No red flag check-ins in the past 7 days.</p>
          </motion.div>
        )}

        {data?.ok && data.alerts.length > 0 && (
          <div className="space-y-4">
            {data.alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full mb-1">
                        {alert.severity}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-3.5 h-3.5" />
                        <span className="font-medium">{alert.userId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(alert.createdAt)}
                    </div>
                    {alert.notifiedAt ? (
                      <div className="flex items-center gap-1.5 text-xs text-green-600">
                        <MailCheck className="w-3.5 h-3.5" />
                        Email sent
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600">
                        <Mail className="w-3.5 h-3.5" />
                        Pending
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-4 mb-3">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Safety Flags</h4>
                  <p className="text-red-700 text-sm">{formatReasons(alert.reasons)}</p>
                </div>

                <div className="flex justify-end">
                  <Link href={`/coach/checkins?demo=true&demo-role=specialist&prefill=${alert.userId}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      View Patient Check-ins
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
