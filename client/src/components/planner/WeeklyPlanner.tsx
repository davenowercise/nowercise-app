import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { toast } from "@/hooks/use-toast";
import { addDemoParam, isDemoMode } from "@/lib/queryClient";

const STRENGTH_TEMPLATE = "GentleStrength_A";
const CALM_TEMPLATE = "EARLY_RESET_BREATHE";

type SessionEventInfo = {
  eventType: string;
  fromDate: string | null;
  toDate: string | null;
};

type PlannerSession = {
  id: string;
  plannedDate: string;
  sessionType: "STRENGTH" | "CALM" | "REST";
  sessionTemplate?: string | null;
  status: "PLANNED" | "COMPLETED" | "SKIPPED" | "ADJUSTED";
  recentEvents?: SessionEventInfo[];
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SUN_TO_MON = [6, 0, 1, 2, 3, 4, 5]; // convert JS Sun start to Mon start

type Readiness = "good_to_go" | "low_energy" | "need_calm" | "not_up_to_exercise";

const READINESS_OPTIONS: { value: Readiness; label: string }[] = [
  { value: "good_to_go", label: "Good to go" },
  { value: "low_energy", label: "Low energy" },
  { value: "need_calm", label: "Need calm" },
  { value: "not_up_to_exercise", label: "Not up to exercise" },
];

function getRecommendation(
  readiness: Readiness | null,
  todaySessions: PlannerSession[]
): string | null {
  if (!readiness) return null;
  const hasStrength = todaySessions.some((s) => s.sessionType === "STRENGTH");
  const hasCalm = todaySessions.some((s) => s.sessionType === "CALM");
  switch (readiness) {
    case "good_to_go":
      return hasStrength ? "Stick with your planned strength session" : "You're good to go – follow your plan";
    case "low_energy":
      return "Consider a lighter approach today – listen to your body";
    case "need_calm":
      return hasStrength ? "Today looks like a calm day – CALM instead of STRENGTH" : "Today looks like a calm day";
    case "not_up_to_exercise":
      return "Rest is the right call today";
    default:
      return null;
  }
}

type TodayStatus = "green" | "yellow" | "red";

function getTodayStatus(
  readiness: Readiness | null,
  todaySessions: PlannerSession[]
): { status: TodayStatus; copy: string } | null {
  if (!readiness) return null;
  const hasSkipped = todaySessions.some((s) => s.status === "SKIPPED");
  const hasCalmAdjusted = todaySessions.some(
    (s) => s.sessionType === "CALM" && s.status === "ADJUSTED"
  );

  if (readiness === "not_up_to_exercise" || hasSkipped) {
    return { status: "red", copy: "Rest and recovery take priority today." };
  }
  if (
    readiness === "low_energy" ||
    readiness === "need_calm" ||
    hasCalmAdjusted
  ) {
    return { status: "yellow", copy: "Today calls for a gentler approach." };
  }
  if (readiness === "good_to_go" && !hasSkipped && !hasCalmAdjusted) {
    return { status: "green", copy: "You're okay to follow today's plan." };
  }
  return { status: "yellow", copy: "Today calls for a gentler approach." };
}

type EffectiveSessionType = "strength" | "calm" | "rest";

function getEffectiveSessionLaunch(
  readiness: Readiness | null,
  todaySessions: PlannerSession[]
): { type: EffectiveSessionType; templateCode?: string } | null {
  if (!readiness) return null;
  const hasSkipped = todaySessions.some((s) => s.status === "SKIPPED");
  const hasCalmAdjusted = todaySessions.some(
    (s) => s.sessionType === "CALM" && s.status === "ADJUSTED"
  );
  const plannedSession = todaySessions[0];

  if (readiness === "not_up_to_exercise" || hasSkipped) {
    return { type: "rest" };
  }
  if (hasCalmAdjusted || readiness === "need_calm") {
    return { type: "calm", templateCode: CALM_TEMPLATE };
  }
  if (readiness === "low_energy") {
    return { type: "calm", templateCode: CALM_TEMPLATE };
  }
  if (readiness === "good_to_go" && plannedSession?.sessionType === "STRENGTH") {
    return {
      type: "strength",
      templateCode: plannedSession.sessionTemplate ?? STRENGTH_TEMPLATE,
    };
  }
  if (plannedSession?.sessionType === "CALM") {
    return { type: "calm", templateCode: CALM_TEMPLATE };
  }
  if (plannedSession?.sessionType === "STRENGTH") {
    return {
      type: "strength",
      templateCode: plannedSession.sessionTemplate ?? STRENGTH_TEMPLATE,
    };
  }
  return { type: "rest" };
}

function getWhyTodayExplanation(
  readiness: Readiness | null,
  todaySessions: PlannerSession[]
): string | null {
  if (!readiness) return null;
  const hasCalmAdjusted = todaySessions.some(
    (s) => s.sessionType === "CALM" && s.status === "ADJUSTED"
  );
  const hasSkipped = todaySessions.some((s) => s.status === "SKIPPED");

  if (hasCalmAdjusted) {
    return "Your session has already been adjusted to CALM for today.";
  }
  if (hasSkipped) {
    return "Today's session has been skipped.";
  }

  switch (readiness) {
    case "need_calm":
      return "You chose Need calm, so today is better treated as a calmer recovery day.";
    case "not_up_to_exercise":
      return "You chose Not up to exercise, so resting today is the right call.";
    case "low_energy":
      return "You chose Low energy, so the aim today is to reduce pressure and keep things manageable.";
    case "good_to_go":
      return "You chose Good to go, so your planned session still fits today.";
    default:
      return null;
  }
}

function getThisWeekMonday(): string {
  const today = new Date();
  const daysFromMonday = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);
  return monday.toISOString().slice(0, 10);
}

function getWeekDatesForMonday(mondayStr: string): Date[] {
  const monday = new Date(mondayStr + "T12:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function addWeeksToMonday(mondayStr: string, delta: number): string {
  const d = new Date(mondayStr + "T12:00:00");
  d.setDate(d.getDate() + delta * 7);
  return d.toISOString().slice(0, 10);
}

function formatWeekRange(mondayStr: string): string {
  const monday = new Date(mondayStr + "T12:00:00");
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${monday.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${sunday.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatEventLabel(event: SessionEventInfo): string {
  if (event.eventType === "MOVED" && event.fromDate && event.toDate) {
    const fromDay = new Date(event.fromDate).toLocaleDateString("en-GB", {
      weekday: "short",
    });
    const toDay = new Date(event.toDate).toLocaleDateString("en-GB", {
      weekday: "short",
    });
    return `Moved from ${fromDay} to ${toDay}`;
  }
  if (event.eventType === "COMPLETED") return "Marked completed";
  if (event.eventType === "SKIPPED") return "Marked skipped";
  if (event.eventType === "SWITCHED_TO_CALM") return "Switched to CALM";
  return event.eventType;
}

function SessionCard({
  session,
  weekDates,
  onRefresh,
}: {
  session: PlannerSession;
  weekDates: Date[];
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const moveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moveOpen) return;
    const close = (e: MouseEvent) => {
      if (moveRef.current && !moveRef.current.contains(e.target as Node)) {
        setMoveOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [moveOpen]);

  const typeStyles: Record<PlannerSession["sessionType"], string> = {
    STRENGTH: "bg-amber-50 border-amber-200 text-amber-900 font-semibold",
    CALM: "bg-sky-50 border-sky-200 text-sky-800",
    REST: "bg-gray-100 border-gray-200 text-gray-600",
  };
  const statusStyles: Record<PlannerSession["status"], string> = {
    PLANNED: "bg-slate-100 text-slate-600",
    COMPLETED: "bg-green-100 text-green-700",
    SKIPPED: "bg-amber-100 text-amber-700",
    ADJUSTED: "bg-blue-100 text-blue-700",
  };

  const canAct = session.status === "PLANNED" || session.status === "ADJUSTED";
  const canMove = canAct && session.sessionType === "STRENGTH";

  const runAction = useCallback(
    async (
      action: "complete" | "skip" | "move",
      body?: Record<string, string>,
      successMsg?: string
    ) => {
      if (loading) return;
      setLoading(action);
      try {
        const path = action === "move" ? "move" : action;
        const baseUrl = `/api/planner/sessions/${session.id}/${path}`;
        const url = addDemoParam(baseUrl);
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(isDemoMode() ? { "X-Demo-Mode": "true" } : {}),
          },
          credentials: "include",
          body: body ? JSON.stringify(body) : undefined,
        });
        if (res.status === 401 && !isDemoMode()) {
          toast({
            title: "Please sign in",
            description: "Your session may have expired.",
            variant: "destructive",
          });
          setLoading(null);
          return;
        }
        const data = await res.json();
        if (data.ok) {
          setMoveOpen(false);
          toast({ title: "Success", description: successMsg ?? "Updated" });
          onRefresh();
        } else {
          toast({
            title: "Action failed",
            description: data.error || "Something went wrong",
            variant: "destructive",
          });
        }
      } catch (e) {
        toast({
          title: "Request failed",
          description: "Please try again",
          variant: "destructive",
        });
      } finally {
        setLoading(null);
      }
    },
    [session.id, loading, onRefresh]
  );

  const moveOptions = useMemo(() => {
    return weekDates
      .map((d) => toDateStr(d))
      .filter((d) => d !== session.plannedDate);
  }, [weekDates, session.plannedDate]);

  return (
    <div
      className={`rounded-lg border p-2.5 text-sm mb-2 ${typeStyles[session.sessionType]}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span>{session.sessionType}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${statusStyles[session.status]}`}>
          {session.status}
        </span>
      </div>
      {session.sessionTemplate && (
        <div className="text-xs opacity-80 mb-2">{session.sessionTemplate}</div>
      )}

      {session.recentEvents && session.recentEvents.length > 0 && (
        <div className="flex flex-col gap-0.5 mb-2">
          {session.recentEvents.map((ev, i) => (
            <div
              key={i}
              className="text-xs text-gray-500 italic"
            >
              {formatEventLabel(ev)}
            </div>
          ))}
        </div>
      )}

      {canAct && (
        <div className="flex flex-wrap gap-1 mt-2">
          <button
            onClick={() => runAction("complete", undefined, "Session marked complete")}
            disabled={!!loading}
            className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50"
          >
            {loading === "complete" ? "…" : "Complete"}
          </button>
          <button
            onClick={() => runAction("skip", undefined, "Session skipped")}
            disabled={!!loading}
            className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50"
          >
            {loading === "skip" ? "…" : "Skip"}
          </button>
          {canMove && (
            <div ref={moveRef} className="relative inline-block">
              <button
                onClick={() => setMoveOpen((o) => !o)}
                disabled={!!loading}
                className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >
                {loading === "move" ? "…" : "Move"}
              </button>
              {moveOpen && (
                <div className="absolute left-0 top-full mt-1 z-10 bg-white border rounded shadow-lg py-1 min-w-[120px]">
                  {moveOptions.map((dateStr) => (
                    <button
                      key={dateStr}
                      onClick={() =>
                        runAction("move", { newDate: dateStr }, "Session moved")
                      }
                      className="block w-full text-left text-xs px-3 py-2 hover:bg-gray-100"
                    >
                      {formatShortDate(new Date(dateStr))}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type ProtectionSignal = "caution" | "steady_progress" | "neutral";

export default function WeeklyPlanner() {
  const [sessions, setSessions] = useState<PlannerSession[]>([]);
  const [weekStartDate, setWeekStartDate] = useState<string>(() => getThisWeekMonday());
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [protectionSignal, setProtectionSignal] = useState<{
    signal: ProtectionSignal;
    copy?: string;
  } | null>(null);

  const weekDates = useMemo(
    () => getWeekDatesForMonday(weekStartDate),
    [weekStartDate]
  );

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayDayIndex = useMemo(() => {
    const today = new Date(todayStr + "T12:00:00");
    const day = today.getDay();
    return SUN_TO_MON[day];
  }, [todayStr]);

  const refresh = useCallback(() => {
    const baseUrl = `/api/planner/week?weekStart=${encodeURIComponent(weekStartDate)}`;
    const url = addDemoParam(baseUrl);
    fetch(url, {
      credentials: "include",
      headers: isDemoMode() ? { "X-Demo-Mode": "true" } : {},
    })
      .then(async (res) => {
        if (res.status === 401 && !isDemoMode()) {
          toast({
            title: "Please sign in",
            description: "Your session may have expired.",
            variant: "destructive",
          });
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.ok) {
          setSessions(data.sessions);
        }
      });
  }, [weekStartDate]);

  const fetchReadiness = useCallback(() => {
    const baseUrl = `/api/planner/readiness?date=${todayStr}`;
    const url = addDemoParam(baseUrl);
    fetch(url, {
      credentials: "include",
      headers: isDemoMode() ? { "X-Demo-Mode": "true" } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok) setReadiness((data.readiness as Readiness) ?? null);
      });
  }, [todayStr]);

  const fetchProtectionSignal = useCallback(() => {
    const baseUrl = "/api/planner/protection-signal";
    const url = addDemoParam(baseUrl);
    fetch(url, {
      credentials: "include",
      headers: isDemoMode() ? { "X-Demo-Mode": "true" } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok && data.signal) {
          setProtectionSignal({ signal: data.signal, copy: data.copy });
        } else {
          setProtectionSignal(null);
        }
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const thisWeekMonday = getThisWeekMonday();
  const isViewingThisWeek = weekStartDate === thisWeekMonday;

  useEffect(() => {
    if (isViewingThisWeek) {
      fetchReadiness();
      fetchProtectionSignal();
    }
  }, [isViewingThisWeek, fetchReadiness, fetchProtectionSignal]);

  const goToPreviousWeek = () => setWeekStartDate((d) => addWeeksToMonday(d, -1));
  const goToNextWeek = () => setWeekStartDate((d) => addWeeksToMonday(d, 1));
  const goToThisWeek = () => setWeekStartDate(thisWeekMonday);

  const sessionsByDay = useMemo(() => {
    return sessions.reduce<Record<number, PlannerSession[]>>((acc, s) => {
      const date = new Date(s.plannedDate);
      const index = SUN_TO_MON[date.getDay()];
      if (!acc[index]) acc[index] = [];
      acc[index].push(s);
      return acc;
    }, {});
  }, [sessions]);

  const todaySessions = isViewingThisWeek ? (sessionsByDay[todayDayIndex] || []) : [];
  const recommendation = getRecommendation(readiness, todaySessions);
  const whyToday = getWhyTodayExplanation(readiness, todaySessions);
  const todayStatus = getTodayStatus(readiness, todaySessions);
  const effectiveSession = getEffectiveSessionLaunch(readiness, todaySessions);
  const todayStrengthSession = todaySessions.find((s) => s.sessionType === "STRENGTH");

  const saveReadiness = useCallback(
    async (value: Readiness) => {
      const baseUrl = "/api/planner/readiness";
      const url = addDemoParam(baseUrl);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(isDemoMode() ? { "X-Demo-Mode": "true" } : {}),
          },
          credentials: "include",
          body: JSON.stringify({ date: todayStr, readiness: value }),
        });
        const data = await res.json();
        if (data?.ok) {
          setReadiness(value);
          toast({ title: "Saved", description: "How you're feeling today has been recorded." });
        }
      } catch {
        toast({ title: "Failed to save", variant: "destructive" });
      }
    },
    [todayStr]
  );

  const applySwitchToCalm = useCallback(async () => {
    if (!todayStrengthSession) return;
    const baseUrl = `/api/planner/sessions/${todayStrengthSession.id}/switch-to-calm`;
    const url = addDemoParam(baseUrl);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { ...(isDemoMode() ? { "X-Demo-Mode": "true" } : {}) },
        credentials: "include",
      });
      const data = await res.json();
      if (data?.ok) {
        toast({ title: "Done", description: "Today switched to CALM." });
        refresh();
      } else {
        toast({ title: "Failed", description: data?.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  }, [todayStrengthSession, refresh]);

  const applySkipToday = useCallback(async () => {
    if (!todayStrengthSession) return;
    const baseUrl = `/api/planner/sessions/${todayStrengthSession.id}/skip`;
    const url = addDemoParam(baseUrl);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { ...(isDemoMode() ? { "X-Demo-Mode": "true" } : {}) },
        credentials: "include",
      });
      const data = await res.json();
      if (data?.ok) {
        toast({ title: "Done", description: "Today's session skipped." });
        refresh();
      } else {
        toast({ title: "Failed", description: data?.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  }, [todayStrengthSession, refresh]);

  const applyKeepGentle = useCallback(() => {
    toast({ title: "Noted", description: "Keep it gentle today." });
  }, []);

  const showSwitchToCalm = readiness === "need_calm" && todayStrengthSession;
  const showSkipToday = readiness === "not_up_to_exercise" && todayStrengthSession;
  const showKeepGentle = readiness === "low_energy";
  const showProtectionMakeCalm =
    protectionSignal?.signal === "caution" && todayStrengthSession;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Weekly Planner</h1>

        {isViewingThisWeek && (
          <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            {protectionSignal?.signal === "caution" && protectionSignal.copy && (
              <div className="mb-4 rounded-lg px-3 py-2 bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800">{protectionSignal.copy}</p>
                {showProtectionMakeCalm && (
                  <button
                    onClick={applySwitchToCalm}
                    className="mt-2 text-sm px-3 py-1.5 rounded bg-sky-100 text-sky-800 hover:bg-sky-200 border border-sky-200"
                  >
                    Make today a calm day
                  </button>
                )}
              </div>
            )}
            {protectionSignal?.signal === "steady_progress" && protectionSignal.copy && (
              <div className="mb-4 rounded-lg px-3 py-2 bg-green-50 border border-green-200">
                <p className="text-sm text-green-800">{protectionSignal.copy}</p>
              </div>
            )}
            {todayStatus && (
              <div
                className={`mb-4 flex flex-col gap-3 rounded-lg px-3 py-2 ${
                  todayStatus.status === "green"
                    ? "bg-green-50 border border-green-200"
                    : todayStatus.status === "yellow"
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 shrink-0 rounded-full ${
                      todayStatus.status === "green"
                        ? "bg-green-500"
                        : todayStatus.status === "yellow"
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                  />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Today status
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        todayStatus.status === "green"
                          ? "text-green-800"
                          : todayStatus.status === "yellow"
                            ? "text-amber-800"
                            : "text-red-800"
                      }`}
                    >
                      {todayStatus.copy}
                    </p>
                  </div>
                </div>
                {todayStatus.status === "green" && effectiveSession?.type === "strength" && (
                  <Link href={addDemoParam(`/session/${effectiveSession.templateCode}`)}>
                    <button className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
                      Start today's strength session
                    </button>
                  </Link>
                )}
                {todayStatus.status === "yellow" && effectiveSession?.type === "calm" && (
                  <Link href={addDemoParam(`/session/${effectiveSession.templateCode}`)}>
                    <button className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors">
                      Start calm session
                    </button>
                  </Link>
                )}
                {todayStatus.status === "red" && (
                  <div className="space-y-2">
                    <p className="text-sm text-red-800">Today is a recovery day.</p>
                    <Link href={addDemoParam(`/session/${CALM_TEMPLATE}`)}>
                      <button className="text-sm px-3 py-1.5 rounded border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 transition-colors">
                        2 Minutes of Calm
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}
            <p className="text-sm font-medium text-gray-800 mb-2">How are you feeling today?</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {READINESS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => saveReadiness(opt.value)}
                  className={`text-sm px-3 py-1.5 rounded border transition-colors ${
                    readiness === opt.value
                      ? "border-action-blue bg-action-blue/10 text-action-blue"
                      : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {recommendation && (
              <p className="text-sm text-gray-600 italic mb-2">
                {recommendation}
              </p>
            )}
            {whyToday && (
              <div className="mb-3 pl-3 border-l-2 border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  Why today?
                </p>
                <p className="text-sm text-gray-600">
                  {whyToday}
                </p>
              </div>
            )}
            {(showSwitchToCalm || showSkipToday || showKeepGentle) && (
              <div className="flex flex-wrap gap-2">
                {showSwitchToCalm && (
                  <button
                    onClick={applySwitchToCalm}
                    className="text-sm px-3 py-1.5 rounded bg-sky-100 text-sky-800 hover:bg-sky-200 border border-sky-200"
                  >
                    Switch today to CALM
                  </button>
                )}
                {showSkipToday && (
                  <button
                    onClick={applySkipToday}
                    className="text-sm px-3 py-1.5 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200"
                  >
                    Skip today's session
                  </button>
                )}
                {showKeepGentle && (
                  <button
                    onClick={applyKeepGentle}
                    className="text-sm px-3 py-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  >
                    Keep today gentle
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <p className="text-sm text-gray-600 font-medium">
            {formatWeekRange(weekStartDate)}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="text-sm px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            >
              Previous week
            </button>
            <button
              onClick={goToThisWeek}
              className={`text-sm px-3 py-1.5 rounded border text-gray-700 ${
                isViewingThisWeek
                  ? "border-action-blue bg-action-blue/10 text-action-blue"
                  : "border-gray-300 bg-white hover:bg-gray-50"
              }`}
            >
              This week
            </button>
            <button
              onClick={goToNextWeek}
              className="text-sm px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            >
              Next week
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {DAY_NAMES.map((day, i) => (
            <div
              key={day}
              className="bg-white border border-gray-200 rounded-xl p-4 min-h-[140px] shadow-sm"
            >
              <div className="font-semibold text-gray-800">{day}</div>
              <div className="text-xs text-gray-500 mb-3">{formatShortDate(weekDates[i])}</div>

              {(sessionsByDay[i] || []).length > 0 ? (
                (sessionsByDay[i] || []).map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    weekDates={weekDates}
                    onRefresh={refresh}
                  />
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No session planned</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
