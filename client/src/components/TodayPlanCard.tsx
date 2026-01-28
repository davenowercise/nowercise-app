import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Divider, PremiumCard, SkeletonLine } from "./ui/PremiumCard";

interface PlanItem {
  id: number;
  label: string;
  durationMin: number;
  priority: string;
  reason: string | null;
  program?: {
    id: number;
    name: string;
    category: string;
  } | null;
}

interface PlanSection {
  title: string;
  items: PlanItem[];
}

interface TodayPlanResponse {
  ok: boolean;
  date?: string;
  generatedAt?: string;
  sections?: {
    must: PlanSection;
    should: PlanSection;
    could: PlanSection;
  };
  totalDuration?: number;
  error?: string;
}

function getCategoryIcon(category?: string): string {
  switch (category) {
    case "movement": return "🏃";
    case "walking": return "🚶";
    case "recovery": return "🧘";
    case "mobility": return "🤸";
    case "audio": return "🎧";
    default: return "✨";
  }
}

function PlanSectionList({ section, tone }: { section: PlanSection; tone: "must" | "should" | "could" }) {
  if (!section.items.length) return null;

  const toneStyles = {
    must: "bg-teal-50/60 border-teal-100",
    should: "bg-blue-50/40 border-blue-100",
    could: "bg-gray-50/40 border-gray-100"
  };

  const titleStyles = {
    must: "text-teal-700",
    should: "text-blue-700",
    could: "text-gray-600"
  };

  return (
    <div className="mb-4">
      <div className={`text-[11px] font-semibold tracking-wide uppercase mb-2 ${titleStyles[tone]}`}>
        {section.title}
      </div>
      <div className="space-y-2">
        {section.items.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border p-3 ${toneStyles[tone]}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{getCategoryIcon(item.program?.category)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-black/80 truncate">
                  {item.label}
                </div>
                <div className="text-xs text-black/50">
                  {item.durationMin} min
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TodayPlanCard() {
  const [data, setData] = useState<TodayPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchPlan() {
      try {
        setLoading(true);
        const res = await fetch("/api/today-plan", {
          headers: { accept: "application/json" },
        });
        const json = (await res.json()) as TodayPlanResponse;
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setData({ ok: false, error: e?.message ?? "Failed to fetch plan" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPlan();
    return () => {
      cancelled = true;
    };
  }, []);

  const subtitle = data?.date 
    ? new Date(data.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })
    : "Today";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <PremiumCard
        title="Today's Supportive Plan"
        subtitle={subtitle}
        rightSlot={
          data?.totalDuration ? (
            <Badge tone="info">{data.totalDuration} min total</Badge>
          ) : null
        }
        accent="teal"
      >
        {loading ? (
          <div className="space-y-4">
            <SkeletonLine widthClass="w-24" />
            <div className="space-y-2">
              <SkeletonLine widthClass="w-full" />
              <SkeletonLine widthClass="w-3/4" />
            </div>
            <Divider />
            <SkeletonLine widthClass="w-24" />
            <div className="space-y-2">
              <SkeletonLine widthClass="w-full" />
            </div>
          </div>
        ) : data?.ok === false ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
            <div className="text-sm font-semibold text-red-700">Couldn't load your plan</div>
            <div className="mt-1 text-sm text-red-700/80">{data.error ?? "Please try again"}</div>
          </div>
        ) : data?.sections ? (
          <>
            <PlanSectionList section={data.sections.must} tone="must" />
            <PlanSectionList section={data.sections.should} tone="should" />
            <PlanSectionList section={data.sections.could} tone="could" />

            {!data.sections.must.items.length && 
             !data.sections.should.items.length && 
             !data.sections.could.items.length && (
              <div className="text-center py-6">
                <div className="text-2xl mb-2">🌱</div>
                <div className="text-sm text-black/60">
                  No programs assigned yet
                </div>
                <div className="text-xs text-black/40 mt-1">
                  Your coach will set up your supportive programs soon
                </div>
              </div>
            )}

            <div className="mt-4 text-xs text-black/45 text-center">
              Small steps count. Do what feels right today.
            </div>
          </>
        ) : (
          <div className="text-sm text-black/60">No plan available</div>
        )}
      </PremiumCard>
    </motion.div>
  );
}
