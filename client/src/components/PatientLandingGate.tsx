import { useQuery } from "@tanstack/react-query";
import { addDemoParam, isDemoMode } from "@/lib/queryClient";
import PatientDashboard from "@/pages/patient-dashboard";
import DailyCheckinPage from "@/pages/checkin";

/**
 * Gate for patient routes (/, /dashboard).
 * If no check-in exists today → render CheckInPage.
 * If check-in exists → render Today Plan (PatientDashboard).
 */
export function PatientLandingGate() {
  const { data, isLoading } = useQuery<{
    ok: boolean;
    exists?: boolean;
    checkin?: { energy: number; pain: number; confidence: number; sideEffects: string[]; redFlags: string[]; notes?: string; submittedAt: string } | null;
  }>({
    queryKey: ["/api/checkins/today"],
    queryFn: async () => {
      const url = addDemoParam("/api/checkins/today");
      const headers: Record<string, string> = {};
      if (isDemoMode()) headers["X-Demo-Mode"] = "true";
      const res = await fetch(url, { credentials: "include", headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `${res.status}`);
      return json;
    },
  });

  const exists = data?.exists ?? !!data?.checkin;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-action-blue" />
      </div>
    );
  }

  if (!exists) {
    return <DailyCheckinPage />;
  }

  return <PatientDashboard />;
}
