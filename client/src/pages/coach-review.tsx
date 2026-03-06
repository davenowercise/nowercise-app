import { useQuery } from "@tanstack/react-query";
import { addDemoParam, isDemoMode } from "@/lib/queryClient";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type ReviewData = {
  ok: boolean;
  todayReadiness: string | null;
  todayStatus: string | null;
  protectionSignal: "caution" | "steady_progress" | "neutral";
  protectionCopy?: string;
  recentRedFlagChecks: Array<{
    checkedAt: string;
    blocked: boolean;
    flags: string[];
  }>;
  recentPlannerEvents: Array<{
    eventType: string;
    plannedDate: string;
    sessionType: string;
    fromDate: string | null;
    toDate: string | null;
    reason: string | null;
    createdAt: string;
  }>;
  recentPostSessionCheckouts: Array<{
    completedAt: string;
    howFelt: string;
    symptomsNow: string;
    notes: string | null;
  }>;
};

function formatEventType(eventType: string): string {
  const map: Record<string, string> = {
    MOVED: "Moved",
    COMPLETED: "Completed",
    SKIPPED: "Skipped",
    SWITCHED_TO_CALM: "Switched to calm",
  };
  return map[eventType] ?? eventType;
}

function formatHowFelt(howFelt: string): string {
  const map: Record<string, string> = {
    too_much: "Too much",
    about_right: "About right",
    too_easy: "Too easy",
  };
  return map[howFelt] ?? howFelt;
}

function formatSymptomsNow(symptomsNow: string): string {
  const map: Record<string, string> = {
    worse: "Worse",
    about_same: "About same",
    better: "Better",
  };
  return map[symptomsNow] ?? symptomsNow;
}

export default function CoachReviewPage() {
  const isDemo = isDemoMode();

  const { data, isLoading, isError, error } = useQuery<ReviewData>({
    queryKey: ["/api/review"],
    queryFn: async () => {
      const url = addDemoParam("/api/review");
      const headers: Record<string, string> = isDemo ? { "X-Demo-Mode": "true" } : {};
      const res = await fetch(url, { credentials: "include", headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `${res.status}`);
      return json;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            Failed to load review data: {String(error)}
          </div>
          <Link href="/today">
            <Button variant="outline" className="mt-4">
              Back to Today
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const d = data!;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Coach Review</h1>
            <p className="text-sm text-gray-500">
              Key decision data for testing and coaching oversight
            </p>
          </div>
          <Link href="/today">
            <Button variant="outline">Back to Today</Button>
          </Link>
        </div>

        {/* Today's readiness */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Today&apos;s readiness
          </h2>
          <p className="text-gray-800">
            {d.todayReadiness ?? (
              <span className="text-gray-400 italic">Not set</span>
            )}
          </p>
        </section>

        {/* Today status */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Today status
          </h2>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                d.todayStatus === "GREEN"
                  ? "bg-green-100 text-green-800"
                  : d.todayStatus === "YELLOW"
                    ? "bg-amber-100 text-amber-800"
                    : d.todayStatus === "RED"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-600"
              }`}
            >
              {d.todayStatus ?? (
                <span className="italic">No check-in today</span>
              )}
            </span>
          </div>
        </section>

        {/* Protection signal */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Current protection signal
          </h2>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                d.protectionSignal === "caution"
                  ? "bg-amber-100 text-amber-800"
                  : d.protectionSignal === "steady_progress"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {d.protectionSignal.replace("_", " ")}
            </span>
          </div>
          {d.protectionCopy && (
            <p className="text-sm text-gray-600 mt-2">{d.protectionCopy}</p>
          )}
        </section>

        {/* Recent red-flag checks */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Recent red-flag checks
          </h2>
          {d.recentRedFlagChecks.length === 0 ? (
            <p className="text-gray-400 italic text-sm">None</p>
          ) : (
            <ul className="space-y-2">
              {d.recentRedFlagChecks.map((r, i) => (
                <li
                  key={i}
                  className="text-sm flex items-center justify-between gap-2"
                >
                  <span>
                    {format(new Date(r.checkedAt), "MMM d, HH:mm")}
                    {r.blocked && (
                      <span className="ml-2 text-red-600 font-medium">
                        Blocked
                      </span>
                    )}
                    {r.flags.length > 0 && (
                      <span className="ml-2 text-gray-500">
                        ({r.flags.join(", ")})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent planner events */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Recent planner events
          </h2>
          {d.recentPlannerEvents.length === 0 ? (
            <p className="text-gray-400 italic text-sm">None</p>
          ) : (
            <ul className="space-y-2">
              {d.recentPlannerEvents.map((e, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">
                    {formatEventType(e.eventType)}
                  </span>{" "}
                  {e.plannedDate} ({e.sessionType})
                  {e.fromDate && e.toDate && (
                    <span className="text-gray-500">
                      {" "}
                      {e.fromDate} → {e.toDate}
                    </span>
                  )}
                  <span className="text-gray-400 ml-1">
                    {format(new Date(e.createdAt), "MMM d, HH:mm")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent post-session checkouts */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Recent post-session checkouts
          </h2>
          {d.recentPostSessionCheckouts.length === 0 ? (
            <p className="text-gray-400 italic text-sm">None</p>
          ) : (
            <ul className="space-y-2">
              {d.recentPostSessionCheckouts.map((c, i) => (
                <li key={i} className="text-sm">
                  {format(new Date(c.completedAt), "MMM d, HH:mm")} —{" "}
                  {formatHowFelt(c.howFelt)}, symptoms {formatSymptomsNow(c.symptomsNow)}
                  {c.notes && (
                    <span className="block text-gray-500 mt-0.5">
                      {c.notes}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
