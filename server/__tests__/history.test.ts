import test from "node:test";
import assert from "node:assert/strict";
import { buildHistorySummaries } from "../history";
import { decideMode } from "../services/sessionGeneratorService";

test("buildHistorySummaries returns day shape with placeholders", () => {
  const days = buildHistorySummaries(
    ["2026-02-09"],
    [],
    [],
    undefined
  );

  assert.equal(days.length, 1);
  const day = days[0];
  assert.equal(day.date, "2026-02-09");
  assert.ok(day.recommendation);
  assert.ok(day.completionStatus);
});

test("modeDecision persistence: LIGHTER cap via decideMode surfaces in history", () => {
  const md = decideMode("MAIN", "LIGHTER");
  assert.equal(md.finalMode, "EASIER");
  assert.ok(md.explanation.includes("capped"), `decideMode should produce capped explanation, got: ${md.explanation}`);

  const days = buildHistorySummaries(
    ["2026-02-11"],
    [{ date: "2026-02-11", safety_status: "GREEN", session_level: "LOW", focus_tags: [], completed_at: null, mode_decision: null }] as any[],
    [
      {
        date: "2026-02-11",
        exercise_list: [],
        feedback: null,
        completed_at: "2026-02-11T10:00:00Z",
        mode_decision_json: { checkinMode: md.checkinMode, capFromLastSession: md.capFromLastSession, finalMode: md.finalMode, explanation: md.explanation },
      },
    ] as any[],
    undefined
  );

  assert.equal(days.length, 1);
  const day = days[0];
  assert.ok(day.modeDecision, "modeDecision should be present");
  assert.ok(day.modeDecision!.explanation.includes("capped"), `explanation should contain "capped", got: ${day.modeDecision!.explanation}`);
  assert.equal(day.modeDecision!.finalMode, "EASIER");
});
