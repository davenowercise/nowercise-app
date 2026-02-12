import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scenarios } from "./scenarioFixtures";
import { runEngineForDay } from "./scenarioRunner";

describe("Adaptive engine scenario simulations (client-derived)", () => {
  for (const s of scenarios) {
    it(`${s.id} — ${s.clientLabel}`, () => {
      for (const d of s.days) {
        const out = runEngineForDay({
          checkinMode: d.checkinMode,
          lastAdjustmentFromPrevSession: d.lastAdjustmentFromPrevSession,
        });

        if (d.expectMode) {
          assert.equal(out.mode, d.expectMode, `Day ${d.day}: expected mode ${d.expectMode}, got ${out.mode}`);
        }

        if (d.expectNotMode?.length) {
          for (const bad of d.expectNotMode) {
            assert.notEqual(out.mode, bad, `Day ${d.day}: mode should not be ${bad}`);
          }
        }

        if (d.expectReasonIncludes?.length && out.reasons) {
          const reasonStr = out.reasons.join(" | ");
          for (const frag of d.expectReasonIncludes) {
            assert.ok(reasonStr.includes(frag), `Day ${d.day}: reasons should contain "${frag}"`);
          }
        }

        if (d.lastAdjustmentFromPrevSession === "LIGHTER" && d.expectMode === "EASIER") {
          assert.ok(out.modeDecision.explanation.includes("capped"), `Day ${d.day}: LIGHTER cap should explain "capped", got: ${out.modeDecision.explanation}`);
        }
      }
    });
  }
});

describe("Hard invariants (never break)", () => {
  it("REST checkin always yields REST regardless of lastAdjustment", () => {
    const lastOptions = [undefined, "REST", "LIGHTER", "SAME", "GENTLE_BUILD"] as const;
    for (const last of lastOptions) {
      const out = runEngineForDay({ checkinMode: "REST", lastAdjustmentFromPrevSession: last });
      assert.equal(out.mode, "REST");
    }
  });

  it("LIGHTER cap must prevent MAIN if checkin says MAIN", () => {
    const out = runEngineForDay({ checkinMode: "MAIN", lastAdjustmentFromPrevSession: "LIGHTER" });
    assert.equal(out.mode, "EASIER");
  });
});
