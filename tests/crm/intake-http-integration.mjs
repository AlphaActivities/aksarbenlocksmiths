// Canonical provider fixtures -> actual PostgREST -> actual PostgreSQL transaction.
// Every persistence URL is constrained to the disposable loopback test service.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  syncIntake,
  inspectIntake,
} from "../../netlify/functions/lib/intake.mjs";
import { TARGET_REF } from "../../netlify/functions/lib/core.mjs";
import { ENV, FORM, NOW, submission } from "./fixtures/intake.mjs";
const base = process.env.CRM_TEST_REST_URL;
assert.match(base || "", /^http:\/\/127\.0\.0\.1:\d+$/);
const signing = "c1-disposable-local-test-signing-key-never-production";
const part = (value) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");
const payload = `${part({ alg: "HS256", typ: "JWT" })}.${part({ role: "service_role", exp: Math.floor(Date.now() / 1000) + 600 })}`;
const token = `${payload}.${createHmac("sha256", signing).update(payload).digest("base64url")}`;
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
async function rest(path, method = "GET", body) {
  const response = await fetch(`${base}/${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.ok(
    response.ok,
    `Disposable database fixture request failed: HTTP ${response.status}`,
  );
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
await rest("rpc/crm_ingest", "POST", {
  p_history: true,
  p_records: [
    {
      source: "netlify",
      provider_id: "synthetic-untouched-history",
      provider_submission_id: "synthetic-untouched-history",
      created_at: "2025-01-01T12:00:00Z",
      name: "Synthetic History",
      service: "Other",
      urgency: "quote",
    },
  ],
});
const baseline = await rest("crm_leads?select=id,historical");
const baselineOutbox = await rest("crm_outbox?select=id");
const historyBefore = await rest(
  "crm_leads?historical=eq.true&select=*&order=id",
);
let rows,
  persistenceFailure = false,
  watermarkFailure = false,
  providerFailure = false;
const env = {
  ...ENV,
  SUPABASE_ANON_KEY: token,
  SUPABASE_SERVICE_ROLE_KEY: token,
};
const deps = {
  env,
  now: () => Date.parse(NOW),
  fetch: async (input, init = {}) => {
    const url = new URL(input);
    if (url.hostname === "api.netlify.com") {
      if (providerFailure) return Response.json({}, { status: 503 });
      if (url.pathname.endsWith("/forms")) return Response.json([FORM]);
      if (url.pathname === `/api/v1/forms/${FORM.id}/submissions`)
        return Response.json(rows);
    }
    if (
      url.hostname === `${TARGET_REF}.supabase.co` &&
      url.pathname.startsWith("/rest/v1/")
    ) {
      if (persistenceFailure && url.pathname.endsWith("/rpc/crm_ingest"))
        return Response.json({}, { status: 503 });
      if (
        watermarkFailure &&
        url.pathname.endsWith("/crm_sync_state") &&
        init.method === "POST"
      ) {
        watermarkFailure = false;
        return Response.json({}, { status: 503 });
      }
      return fetch(
        `${base}/${url.pathname.slice("/rest/v1/".length)}${url.search}`,
        init,
      );
    }
    throw new Error(
      "External access forbidden by the disposable integration harness",
    );
  },
};
const accepted = submission({
  id: "synthetic-real-replay",
  created_at: "2026-11-19T11:55:00.000Z",
});
rows = [
  accepted,
  submission({
    id: "synthetic-before-cutoff",
    created_at: "2026-11-19T09:59:59Z",
  }),
  submission({ id: "synthetic-future", created_at: "2026-11-19T12:00:01Z" }),
  submission({ id: "synthetic-spam", spam: true }),
  submission({
    id: "synthetic-honeypot",
    data: { ...accepted.data, "bot-field": "filled" },
  }),
];
const inspected = await inspectIntake(deps);
assert.equal(inspected.eligible, 1);
assert.equal(inspected.skipped, 4);
assert.deepEqual(
  await rest("crm_sync_state?name=eq.netlify&select=watermark"),
  [],
);
assert.equal(
  (await rest("crm_leads?select=id")).length,
  baseline.length,
  "read-only inspection wrote a lead",
);
const first = await syncIntake(deps);
assert.equal(first.inserted, 1);
assert.equal(first.duplicates, 0);
const persisted = await rest(
  "crm_leads?provider_submission_id=eq.synthetic-real-replay&select=*",
);
assert.equal(persisted.length, 1);
const lead = persisted[0];
assert.equal(lead.source, "netlify");
assert.equal(lead.provider_id, accepted.id);
assert.equal(lead.name, accepted.data.name);
assert.equal(lead.service, accepted.data.service);
assert.equal(lead.area, accepted.data.area);
assert.equal(lead.urgency, "urgent");
assert.equal(Date.parse(lead.created_at), Date.parse(accepted.created_at));
assert.equal(lead.historical, false);
const replay = await syncIntake(deps);
assert.equal(replay.inserted, 0);
assert.equal(replay.duplicates, 1);
assert.equal((await rest("crm_leads?select=id")).length, baseline.length + 1);
assert.equal(
  (
    await rest(
      "crm_events?lead_id=eq." +
        lead.id +
        "&kind=eq.inquiry_confirmed&select=id",
    )
  ).length,
  1,
);
assert.equal(
  (await rest("crm_outbox?lead_id=eq." + lead.id + "&select=id")).length,
  1,
);
assert.equal(
  (await rest("crm_outbox?select=id")).length,
  baselineOutbox.length + 1,
);
assert.equal(
  (await rest("crm_leads?historical=eq.true&select=id")).length,
  baseline.filter((l) => l.historical).length,
);
assert.deepEqual(
  await rest("crm_leads?historical=eq.true&select=*&order=id"),
  historyBefore,
);

const stateFilter =
  "crm_sync_state?name=eq." +
  encodeURIComponent(inspected.sync_key) +
  "&select=watermark";
const counts = async () => ({
  leads: (await rest("crm_leads?select=id")).length,
  outbox: (await rest("crm_outbox?select=id")).length,
  state: await rest(stateFilter),
});
const unchanged = await counts();
for (const invalid of [
  submission({ id: "synthetic-invalid", created_at: NOW, data: { name: "" } }),
  submission({ id: "synthetic-wrong-form", created_at: NOW, form_id: "other" }),
  submission({ id: "synthetic-wrong-site", created_at: NOW, site_id: "other" }),
]) {
  rows = [invalid];
  await assert.rejects(syncIntake(deps));
  assert.deepEqual(await counts(), unchanged);
}
providerFailure = true;
await assert.rejects(syncIntake(deps), /provider_read_failed/);
providerFailure = false;
assert.deepEqual(await counts(), unchanged);
rows = [submission({ id: "synthetic-db-failure", created_at: NOW })];
persistenceFailure = true;
await assert.rejects(syncIntake(deps), /database_operation_failed/);
persistenceFailure = false;
assert.deepEqual(await counts(), unchanged);

// A cursor failure after a successful CRM transaction must not masquerade as a
// failed submission: preserve its durable lead and replay without a second alert.
rows = [submission({ id: "synthetic-cursor-retry", created_at: NOW })];
watermarkFailure = true;
await assert.rejects(syncIntake(deps), /database_operation_failed/);
assert.equal(
  (
    await rest(
      "crm_leads?provider_submission_id=eq.synthetic-cursor-retry&select=id",
    )
  ).length,
  1,
);
const recovered = await syncIntake(deps);
assert.equal(recovered.inserted, 0);
assert.equal(recovered.duplicates, 1);
assert.equal((await rest("crm_leads?select=id")).length, baseline.length + 2);
rows = [submission({ id: "synthetic-concurrent-replay", created_at: NOW })];
const concurrent = await Promise.all([syncIntake(deps), syncIntake(deps)]);
assert.equal(
  concurrent.reduce((n, r) => n + r.inserted, 0),
  1,
);
assert.equal(
  concurrent.reduce((n, r) => n + r.duplicates, 0),
  1,
);
const concurrentLead = await rest(
  "crm_leads?provider_submission_id=eq.synthetic-concurrent-replay&select=id",
);
assert.equal(concurrentLead.length, 1);
assert.equal(
  (await rest("crm_outbox?lead_id=eq." + concurrentLead[0].id + "&select=id"))
    .length,
  1,
);
assert.deepEqual(
  await rest("crm_leads?historical=eq.true&select=*&order=id"),
  historyBefore,
);
console.log(
  "PASS: fixture Netlify submission -> real database: inserted=1; same-ID replay inserted=0, duplicates=1; one event/outbox; cutoff/spam/invalid/failure/history/cursor-recovery checks passed; no external requests or notifications sent",
);
