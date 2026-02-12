import test from "node:test";
import assert from "node:assert/strict";
import { getUtcDateKey } from "../utils/dateKey";

test("getUtcDateKey returns YYYY-MM-DD format", () => {
  const key = getUtcDateKey(new Date("2026-02-09T12:00:00Z"));
  assert.match(key, /^\d{4}-\d{2}-\d{2}$/, "date key should be YYYY-MM-DD");
  assert.equal(key, "2026-02-09");
});

test("getUtcDateKey uses UTC for date boundary", () => {
  const key = getUtcDateKey(new Date("2026-02-09T23:59:59.999Z"));
  assert.equal(key, "2026-02-09");
});
