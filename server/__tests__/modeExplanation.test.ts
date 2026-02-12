import test from "node:test";
import assert from "node:assert/strict";
import { renderFriendlyExplanation } from "../../client/src/lib/modeExplanation";

test("renderFriendlyExplanation: cap-wins structured case", () => {
  const md = { checkinMode: "MAIN", capFromLastSession: "EASIER", finalMode: "EASIER", explanation: "capped" };
  const out = renderFriendlyExplanation(md);
  assert.equal(out, "We're keeping it gentler today based on your last session.");
});

test("renderFriendlyExplanation: REST structured case", () => {
  const md = { checkinMode: "REST", capFromLastSession: "MAIN", finalMode: "REST", explanation: "rest" };
  const out = renderFriendlyExplanation(md);
  assert.equal(out, "Your check-in says rest is the safest option today.");
});

test("renderFriendlyExplanation: md missing -> fallback by mode", () => {
  assert.equal(renderFriendlyExplanation(null, "REST"), "Today is a recovery day.");
  assert.equal(renderFriendlyExplanation(undefined, "EASIER"), "Keeping it gentler today.");
  assert.equal(renderFriendlyExplanation(null, "MAIN"), "You're good for your usual plan today.");
  assert.equal(renderFriendlyExplanation(null), "You're good for your usual plan today.");
});
