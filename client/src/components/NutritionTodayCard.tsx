import { useEffect, useState } from "react";

type NutritionTodayResponse = {
  ok: boolean;
  engine?: string;
  date?: string;
  inputs?: {
    phase?: string;
    lowAppetite?: boolean;
    tasteChanges?: boolean;
  };
  rulesFired?: string[];
  today?: {
    coloursTarget?: number;
    proteinAnchor?: string;
    tips?: string[];
  };
  error?: string;
};

export default function NutritionTodayCard() {
  const [data, setData] = useState<NutritionTodayResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams({
    phase: "IN_TREATMENT",
    lowAppetite: "true",
    tasteChanges: "true",
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        const res = await fetch(`/api/nutrition/today?${params.toString()}`, {
          headers: { "accept": "application/json" },
        });
        const json = (await res.json()) as NutritionTodayResponse;
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) {
          setData({ ok: false, error: e?.message ?? "Failed to fetch nutrition" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: 12,
      padding: 16,
      background: "white",
      marginTop: 16,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Today's Fuel Support</div>
        <div style={{ fontSize: 12, opacity: 0.65 }}>
          {data?.engine ? data.engine : "nutrition"} {data?.date ? `• ${data.date}` : ""}
        </div>
      </div>

      {loading && <div style={{ marginTop: 10, opacity: 0.75 }}>Loading…</div>}

      {!loading && data?.ok === false && (
        <div style={{ marginTop: 10, color: "#b00020" }}>
          Error: {data?.error ?? "Unknown error"}
        </div>
      )}

      {!loading && data?.ok && (
        <>
          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(0,0,0,0.05)" }}>
              🎨 Colours target: <b>{data.today?.coloursTarget ?? 5}</b>
            </div>
            <div style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(0,0,0,0.05)" }}>
              🥚 Protein: <b>{data.today?.proteinAnchor ?? "Aim for protein at 2–3 eating moments"}</b>
            </div>
          </div>

          {Array.isArray(data.today?.tips) && data.today!.tips!.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Quick tips</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {data.today!.tips!.slice(0, 6).map((t, i) => (
                  <li key={i} style={{ marginBottom: 6, opacity: 0.9 }}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(data.rulesFired) && data.rulesFired.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
              Rules fired: {data.rulesFired.join(", ")}
            </div>
          )}
        </>
      )}
    </div>
  );
}
