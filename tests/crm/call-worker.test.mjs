import { test } from "node:test";
import assert from "node:assert/strict";
import { pollCalls, runWorker } from "../../scripts/crm/sync-voip.mjs";

test("restart across UTC midnight replays an interrupted day before advancing", async () => {
  let pending = "2025-12-30";
  const seen = [];
  const args = { today: "2026-01-02", pending, checkpoint: async day => { pending = day; },
    sync: async day => { seen.push(day); if (day === pending) throw Error("fixture interruption"); } };
  await assert.rejects(pollCalls(args));
  assert.equal(pending, "2025-12-30");
  await pollCalls({ ...args, sync: async day => seen.push(day) });
  assert.deepEqual(seen.slice(3), seen.slice(0, 3));
  assert.equal(pending, "2025-12-31");
});
test("worker retries serially with backoff and resumes minute polling after recovery", async () => {
  const controller = new AbortController();
  const delays = [], reports = [];
  let attempts = 0;
  await runWorker({ signal: controller.signal, clock: () => 0, report: value => reports.push(value),
    cycle: async () => { if (++attempts < 4) throw Error("synthetic"); },
    wait: async ms => { delays.push(ms); if (delays.length === 4) controller.abort(); } });
  assert.deepEqual(delays, [1000, 2000, 4000, 60000]);
  assert.deepEqual(reports, ["sync_failed","sync_failed","sync_failed","sync_ok"]);
});
