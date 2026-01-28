import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Divider, PremiumCard, SkeletonLine } from "./ui/PremiumCard";

type NutritionTodayResponse = {
  ok: boolean;
  engine?: string;
  date?: string;
  rulesFired?: string[];
  today?: {
    coloursTarget?: number;
    proteinAnchor?: string;
    tips?: string[];
  };
  error?: string;
};

function isDebugMode() {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  return q.get("debug") === "1";
}

export default function NutritionTodayCardPremium() {
  const [data, setData] = useState<NutritionTodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const debug = isDebugMode();

  const params = useMemo(() => {
    const p = new URLSearchParams({
      phase: "IN_TREATMENT",
      lowAppetite: "true",
      tasteChanges: "true",
    });
    return p.toString();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        const res = await fetch(`/api/nutrition/today?${params}`, {
          headers: { accept: "application/json" },
        });
        const json = (await res.json()) as NutritionTodayResponse;
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setData({ ok: false, error: e?.message ?? "Failed to fetch nutrition" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const subtitle =
    data?.engine && data?.date ? `${data.engine} • ${data.date}` : data?.date ? data.date : "Nutrition";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <PremiumCard
        title="Fueling today"
        subtitle={subtitle}
        rightSlot={<Badge tone="quiet">Clinical</Badge>}
        accent="teal"
      >
        {loading ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="w-40">
                <SkeletonLine />
              </div>
              <div className="w-72">
                <SkeletonLine />
              </div>
            </div>
            <Divider />
            <div className="space-y-2">
              <SkeletonLine widthClass="w-2/3" />
              <SkeletonLine widthClass="w-full" />
              <SkeletonLine widthClass="w-5/6" />
            </div>
          </div>
        ) : data?.ok === false ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
            <div className="text-sm font-semibold text-red-700">Couldn't load nutrition</div>
            <div className="mt-1 text-sm text-red-700/80">{data.error ?? "Unknown error"}</div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">
                🎨 Colours target:{" "}
                <span className="ml-1 font-semibold text-teal-900/90">
                  {data?.today?.coloursTarget ?? 5}
                </span>
              </Badge>
              <Badge tone="info">
                🥚 Protein:{" "}
                <span className="ml-1 font-semibold text-teal-900/90">
                  {data?.today?.proteinAnchor ?? "Aim for protein at 2–3 eating moments"}
                </span>
              </Badge>
            </div>

            <Divider />

            {Array.isArray(data?.today?.tips) && data!.today!.tips!.length > 0 ? (
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-black/45 uppercase">
                  Quick tips
                </div>

                <ul className="mt-4 space-y-2">
                  {data!.today!.tips!.slice(0, 6).map((t, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-teal-200 shrink-0" />
                      <span className="text-sm leading-relaxed text-black/75">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-sm text-black/60">No tips for today.</div>
            )}

            {debug && Array.isArray(data?.rulesFired) && data!.rulesFired!.length > 0 ? (
              <div className="mt-5 text-[11px] text-black/40">
                Debug (rules): {data!.rulesFired!.join(", ")}
              </div>
            ) : null}
          </>
        )}
      </PremiumCard>
    </motion.div>
  );
}
