import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, addDays, addWeeks, isAfter, isSameDay, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { addDemoParam, isDemoMode } from "@/lib/queryClient";
import { Link } from "wouter";
import { renderFriendlyExplanation } from "@/lib/modeExplanation";

type DaySummary = {
  date: string;
  recommendation: { type: "WALK" | "STRENGTH" | "RESET" | "REST"; displayName: string };
  completionStatus: "COMPLETED" | "NOT_STARTED" | "SKIPPED" | "REST";
  completed?: { minutesWalked?: number; exercisesCompleted?: number };
  feedback?: { rpe?: number; pain?: number; difficulty?: "TOO_HARD" | "COMFORTABLE" | "TOO_EASY"; feeling?: string };
  tomorrowAdjustment?: "LIGHTER" | "SAME" | "GENTLE_BUILD" | "REST";
  modeDecision?: { finalMode: "REST" | "EASIER" | "MAIN"; explanation: string };
  derivedMode?: "REST" | "EASIER" | "MAIN";
};

export default function HistoryPage() {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today, { weekStartsOn: 1 }));
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const isDemo = isDemoMode();

  const { data, isLoading, isError, error } = useQuery<{ ok: boolean; days: DaySummary[] }>({
    retry: false,
    queryKey: ["/api/history", weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: async () => {
      const from = weekStart.toISOString().split("T")[0];
      const to = weekEnd.toISOString().split("T")[0];
      const url = addDemoParam(`/api/history?from=${from}&to=${to}`);
      const headers: Record<string, string> = isDemo ? { "X-Demo-Mode": "true" } : {};
      console.log("[history] fetch", { url, headers, from, to });
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10_000);
      let res: Response;
      try {
        res = await fetch(url, { credentials: "include", headers, signal: controller.signal });
      } catch (e) {
        clearTimeout(timeoutId);
        if ((e as Error)?.name === "AbortError") throw new Error("timeout: request took >10s");
        throw e;
      }
      clearTimeout(timeoutId);
      const rawText = await res.text();
      const bodyPreview = rawText.slice(0, 300);
      let json: { ok?: boolean; days?: unknown[]; error?: string };
      try {
        json = JSON.parse(rawText);
      } catch {
        throw new Error(`${res.status} ${res.statusText} | body (first 300 chars): ${bodyPreview}`);
      }
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText} | ${(json?.error || bodyPreview).slice(0, 300)}`);
      }
      return json;
    },
  });

  const days = data?.days ?? [];
  const nextWeekDisabled = !isDemo && isAfter(addWeeks(weekStart, 1), today) && !isSameDay(weekStart, today);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* TEMP: debug panel — remove after History smoke test passes */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-mono">
          <div className="font-semibold text-amber-800">Debug: /api/history</div>
          <div>Request range: {weekStart.toISOString().split("T")[0]} – {weekEnd.toISOString().split("T")[0]} (today: {today.toISOString().split("T")[0]})</div>
          <div>isLoading: {String(isLoading)}</div>
          <div>isError: {String(isError)}</div>
          {isError && <div className="text-red-600">error: {String(error)}</div>}
          <pre className="mt-2 overflow-auto max-h-48 whitespace-pre-wrap break-all">
            {JSON.stringify(data?.days?.slice(0, 2) ?? data, null, 2) || "(no data)"}
          </pre>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Week timeline</h1>
            <p className="text-sm text-gray-500">
              {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")}
            </p>
          </div>
          <Link href="/today">
            <Button variant="outline">Back to Today</Button>
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setWeekStart(addWeeks(weekStart, -1))}>
            Prev week
          </Button>
          <Button variant="outline" disabled={nextWeekDisabled} onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
            Next week
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        ) : days.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p className="text-gray-600 font-medium">No history yet</p>
            <p className="text-sm text-gray-500 mt-1">Complete a session to see it here.</p>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-gray-500">Raw API response</summary>
              <pre className="mt-2 overflow-auto max-h-48 rounded bg-gray-100 p-2 text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(data, null, 2) || "(null)"}
              </pre>
            </details>
          </div>
        ) : (
          <div className="space-y-3">
            {days.map(day => (
              <div key={day.date} className="bg-white rounded-xl border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase">
                      {format(parseISO(day.date), "EEEE")}
                    </p>
                    <p className="text-sm text-gray-500">{format(parseISO(day.date), "MMM d")}</p>
                    <p className="text-base font-medium text-gray-800 mt-1">
                      {day.recommendation?.displayName ?? `[${day.date} derivedMode=${day.derivedMode ?? "?"} completed=${day.completed?.exercisesCompleted ?? "?"}]`}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    {day.completionStatus === "COMPLETED" ? "Completed" :
                      day.completionStatus === "REST" ? "Rest" :
                      day.completionStatus === "SKIPPED" ? "Skipped" : "Planned"}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-1.5">
                  <span className="text-gray-600 font-medium">Why this plan?</span>{" "}
                  {renderFriendlyExplanation(day.modeDecision, day.derivedMode)}
                </p>

                {day.completed?.exercisesCompleted != null && (
                  <p className="text-sm text-gray-500 mt-2">
                    {day.completed.exercisesCompleted} exercises completed
                  </p>
                )}

                {day.feedback && (
                  <div className="mt-3 text-xs text-gray-500">
                    {day.feedback.rpe != null && <span>RPE {day.feedback.rpe}. </span>}
                    {day.feedback.pain != null && <span>Pain {day.feedback.pain}. </span>}
                    {day.feedback.difficulty && <span>{day.feedback.difficulty.replace("_", " ")}. </span>}
                    {day.tomorrowAdjustment && <span>Next: {day.tomorrowAdjustment.toLowerCase()}.</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
