import test from "node:test";
import assert from "node:assert/strict";
import {
  inspectIntake,
  syncIntake,
} from "../../netlify/functions/lib/intake.mjs";
import {
  normalizeSubmission,
  parseInstant,
  SITE_ID,
} from "../../netlify/functions/lib/core.mjs";
import { createHandler } from "../../netlify/functions/crm.mjs";
import { fixture, submission, CUTOFF, NOW, FORM } from "./fixtures/intake.mjs";
const fails = async (options, code) => {
  const f = fixture(options);
  await assert.rejects(syncIntake(f.deps), (e) => e.message === code);
  assert.deepEqual(
    f.writes,
    [],
    "failure must precede every persistence or cursor write",
  );
  return f;
};
test("read-only inspection verifies the exact site/form and explicit cutoff without enabling sync", async () => {
  const f = fixture({ env: { CRM_INTAKE_ENABLED: "false" } });
  const report = await inspectIntake(f.deps);
  assert.deepEqual(report, {
    status: "verified_read_only",
    site_id: SITE_ID,
    form_id: FORM.id,
    form_name: "contact",
    cutoff: CUTOFF,
    sync_key: `netlify:${SITE_ID}:${FORM.id}:${CUTOFF}`,
    since: CUTOFF,
    until: NOW,
    eligible: 1,
    skipped: 0,
    provider_duplicates: 0,
  });
  assert.deepEqual(f.writes, []);
  assert.ok(!JSON.stringify(report).includes("Synthetic Intake QA"));
  assert.ok(!JSON.stringify(report).includes("synthetic-provider-auth"));
  assert.deepEqual(await syncIntake(f.deps), { status: "disabled" });
});
test("site-scoped catalogue may omit site_id, but must identify exactly one contact form", async () => {
  const f = fixture({ forms: [{ id: FORM.id, name: "contact" }] });
  assert.equal((await inspectIntake(f.deps)).eligible, 1);
  for (const forms of [
    [],
    [{ ...FORM, name: "other" }],
    [{ ...FORM, site_id: "foreign-site" }],
    [FORM, FORM],
  ])
    await fails({ forms }, "form_identity_mismatch");
  await fails({ forms: {} }, "provider_format_invalid");
});
test("every submission must match the verified form and any supplied site identity", async () => {
  await fails(
    { rows: [submission({ form_id: undefined })] },
    "submission_form_mismatch",
  );
  await fails(
    { rows: [submission({ form_id: "other-form" })] },
    "submission_form_mismatch",
  );
  await fails(
    { rows: [submission({ site_id: "other-site" })] },
    "submission_site_mismatch",
  );
});
test("cutoff requires a valid calendar date and timezone, and cannot be in the future", async () => {
  for (const value of [
    "2026-11-19",
    "2026-11-19T10:00:00",
    "2026-02-30T10:00:00Z",
    "2026-13-01T00:00:00Z",
    "2026-11-19T24:00:00Z",
    "2026-11-19T10:00:00+14:01",
  ])
    await fails({ env: { NETLIFY_LIVE_FROM: value } }, "invalid_live_cutoff");
  const future = await fails(
    { env: { NETLIFY_LIVE_FROM: "2026-11-20T00:00:00Z" } },
    "future_live_cutoff",
  );
  assert.deepEqual(future.calls, []);
  assert.equal(parseInstant("2026-11-19T04:00:00-06:00"), Date.parse(CUTOFF));
  assert.equal(
    parseInstant("2024-02-29T00:00:00.123456Z"),
    Date.parse("2024-02-29T00:00:00.123Z"),
  );
});
test("cutoff is inclusive; earlier/future/spam/honeypot records create no ingestion request", async () => {
  const boundary = submission({ created_at: CUTOFF });
  const f = fixture({
    rows: [
      boundary,
      submission({ id: "old", created_at: "2026-11-19T09:59:59.999Z" }),
      submission({ id: "future", created_at: "2026-11-19T12:00:00.001Z" }),
      submission({ id: "spam", spam: true }),
      submission({
        id: "bot",
        data: { ...boundary.data, "bot-field": "filled" },
      }),
    ],
  });
  const result = await syncIntake(f.deps);
  assert.equal(result.inserted, 1);
  assert.equal(result.skipped, 4);
  assert.equal(f.batches[0].p_records[0].created_at, CUTOFF);
  assert.equal(f.batches[0].p_records[0].provider_submission_id, boundary.id);
  const empty = fixture({ rows: [submission({ spam: true })] });
  assert.equal((await syncIntake(empty.deps)).inserted, 0);
  assert.deepEqual(empty.writes, ["watermark"]);
});
test("provider-marked spam with no contact fields is ignored without blocking valid intake", async () => {
  const f = fixture({
    rows: [
      submission({ id: "redacted-spam", spam: true, data: undefined }),
      submission(),
    ],
  });
  const result = await syncIntake(f.deps);
  assert.equal(result.inserted, 1);
  assert.equal(result.skipped, 1);
  assert.equal(f.batches[0].p_records.length, 1);
});

test("corrupt/future cursors fail closed; overlap never crosses the reviewed cutoff", async () => {
  await fails({ state: [{ watermark: "broken" }] }, "invalid_sync_watermark");
  await fails(
    { state: [{ watermark: "2026-11-20T00:00:00Z" }] },
    "future_sync_watermark",
  );
  const f = fixture({ state: [{ watermark: "2026-11-19T10:05:00Z" }] });
  assert.equal((await inspectIntake(f.deps)).since, CUTOFF);
  const later = fixture({ state: [{ watermark: "2026-11-19T11:00:00Z" }] });
  assert.equal(
    (await inspectIntake(later.deps)).since,
    "2026-11-19T10:45:00.000Z",
  );
});
test("invalid provider IDs, dates, payloads and handoff IDs cannot become phantom leads", async () => {
  for (const bad of [{ id: {} }, { id: " " }, { data: [] }])
    await fails({ rows: [submission(bad)] }, "invalid_provider_record");
  await fails(
    { rows: [submission({ created_at: "2026-02-30T00:00:00Z" })] },
    "invalid_provider_date",
  );
  await fails({ rows: [submission({ data: { name: "" } })] }, "invalid_fields");
  await fails(
    { rows: [submission({ spam: "true" })] },
    "invalid_provider_spam_flag",
  );
  const r = submission();
  assert.throws(
    () =>
      normalizeSubmission({
        ...r,
        data: { ...r.data, source: "chat", handoff_id: "bad" },
      }),
    /invalid_handoff_identity/,
  );
});
test("provider errors and a malformed later page cannot partially persist earlier valid records", async () => {
  await fails({ providerFailure: true }, "provider_read_failed");
  const page = Array.from({ length: 100 }, (_, i) =>
    submission({ id: `valid-${i}` }),
  );
  await fails(
    { pages: (n) => (n === 1 ? page : [submission({ form_id: "wrong" })]) },
    "submission_form_mismatch",
  );
  await fails(
    { pages: (n) => (n === 1 ? page : {}) },
    "provider_format_invalid",
  );
});
test("deduplicates repeated provider IDs inside the poll and persists one bounded transaction", async () => {
  const r = submission(),
    f = fixture({ rows: [r, r] });
  const result = await syncIntake(f.deps);
  assert.equal(result.inserted, 1);
  assert.equal(result.verification.provider_duplicates, 1);
  assert.deepEqual(f.writes, ["ingest", "watermark"]);
  assert.equal(f.batches.length, 1);
  assert.equal(f.batches[0].p_history, false);
});
test("batch and pagination caps abort without persisting an incomplete scan", async () => {
  await fails(
    {
      pages: (n) =>
        Array.from({ length: 100 }, (_, i) =>
          submission({ id: `page-${n}-${i}` }),
        ),
    },
    "intake_batch_limit",
  );
  await fails(
    {
      pages: () =>
        Array.from({ length: 100 }, () => submission({ spam: true })),
    },
    "provider_pagination_limit",
  );
});
test("persistence failure cannot advance the recovery watermark", async () => {
  const f = fixture({ persistenceFailure: true });
  await assert.rejects(syncIntake(f.deps), /database_operation_failed/);
  assert.deepEqual(f.writes, ["ingest"]);
});
test("read-only reconcile API is owner-only and does not write even with sync disabled", async () => {
  const event = {
    path: "/api/crm/reconcile",
    httpMethod: "GET",
    headers: { cookie: "c1_access=synthetic" },
  };
  const owner = fixture({ env: { CRM_INTAKE_ENABLED: "false" } });
  const r = await createHandler(owner.deps)(event);
  assert.equal(r.statusCode, 200);
  assert.equal(JSON.parse(r.body).status, "verified_read_only");
  assert.deepEqual(owner.writes, []);
  for (const role of ["staff", "client"]) {
    const other = fixture({ role });
    assert.equal((await createHandler(other.deps)(event)).statusCode, 403);
    assert.ok(other.calls.every((c) => c.host !== "api.netlify.com"));
    assert.deepEqual(other.writes, []);
  }
});

test("watermarks are scoped to the verified site, form and canonical rollout cutoff", async () => {
  const oldKey = `netlify:${SITE_ID}:${FORM.id}:${CUTOFF}`;
  const legacy = fixture({
    stateByKey: { netlify: [{ watermark: "broken-legacy-row" }] },
  });
  const original = await inspectIntake(legacy.deps);
  assert.equal(original.sync_key, oldKey);
  assert.equal(original.since, CUTOFF);
  assert.ok(
    legacy.calls.some(
      (c) =>
        c.path.endsWith("/crm_sync_state") &&
        new URLSearchParams(c.search).get("name") === "eq." + oldKey,
    ),
  );
  const changedCutoff = fixture({
    env: { NETLIFY_LIVE_FROM: "2026-11-19T11:00:00Z" },
    stateByKey: { [oldKey]: [{ watermark: NOW }] },
  });
  const updated = await inspectIntake(changedCutoff.deps);
  assert.notEqual(updated.sync_key, oldKey);
  assert.equal(updated.since, "2026-11-19T11:00:00.000Z");
  const changedForm = fixture({
    env: { NETLIFY_FORM_ID: "replacement-form" },
    forms: [{ ...FORM, id: "replacement-form" }],
    rows: [],
    stateByKey: { [oldKey]: [{ watermark: NOW }] },
  });
  const other = await inspectIntake(changedForm.deps);
  assert.notEqual(other.sync_key, oldKey);
  assert.equal(other.since, CUTOFF);
  assert.deepEqual(changedCutoff.writes, []);
  assert.deepEqual(changedForm.writes, []);
});
