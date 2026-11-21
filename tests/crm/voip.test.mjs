import { test } from "node:test";
import assert from "node:assert/strict";
import { inspectVoipDay, normalizeCdr, syncVoip } from "../../netlify/functions/lib/voip.mjs";

const day = "2025-11-20";
const did = "+15315550100";
const record = {
  description: "Inbound DID", destination_type: "IN:USA", destination: "5315550100",
  callerid: '"Synthetic" <4025550101>', uniqueid: "fixture.1",
  date: day + " 12:03:52", disposition: "ANSWERED", seconds: "23",
  call_logs: "Synthetic IVR and forwarding entry",
};

test("CDR mapping is DID-bound, inbound-only and retains only required metadata", () => {
  assert.deepEqual(normalizeCdr(record, day, did, true), {
    provider_call_id: "fixture.1", occurred_at: day + "T12:03:52.000Z",
    caller_phone: "+14025550101", business_did: did,
    disposition: "ANSWERED", duration_seconds: 23, historical: true,
  });
  assert.equal(normalizeCdr({ ...record, description: "Outbound - Forwarding" }, day, did, true), null);
  assert.equal(normalizeCdr({ ...record, destination: "4025550102" }, day, did, true), null);
  assert.equal(normalizeCdr({ ...record, callerid: "Anonymous" }, day, did, true).caller_phone, null);
  assert.throws(() => normalizeCdr({ ...record, uniqueid: "" }, day, did, true), /invalid_cdr/);
});

test("VoIP is opt-in and imports only through a bounded read and an isolated CRM RPC", async () => {
  await assert.rejects(syncVoip(day, { env: {}, fetch: () => assert.fail() }), /not_connected/);
  const env = {
    CRM_VOIP_ENABLED: "true", VOIP_MS_USERNAME: "synthetic", VOIP_MS_API_PASSWORD: "example",
    VOIP_MS_BUSINESS_DID: did, VOIP_MS_INBOUND_CALL_TYPE: "synthetic-inbound", SUPABASE_URL: "https://umnxslkgksqyqfwwdztg.supabase.co",
    SUPABASE_ANON_KEY: "synthetic", SUPABASE_SERVICE_ROLE_KEY: "synthetic",
  };
  await assert.rejects(syncVoip("2025-02-30", { env, fetch: () => assert.fail() }), /invalid_day/);
  const requests = [];
  const result = await syncVoip(day, { env, fetch: async (address, options) => {
    const url = new URL(address);
    requests.push(url.pathname);
    if (url.hostname === "voip.ms") {
      assert.equal(url.searchParams.get("method"), "getCDR");
      assert.equal(url.searchParams.get("date_from"), day);
      assert.equal(url.searchParams.get("date_to"), day);
      assert.equal(url.searchParams.get("timezone"), "0");
      assert.equal(url.searchParams.get("calltype"), "synthetic-inbound");
      assert.equal(options.redirect, "error");
      return Response.json({ status: "success", cdr: [record] });
    }
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), { p_day: day, p_calls: [normalizeCdr(record, day, did, true)] });
    return Response.json({ inserted: 1, duplicates: 0 });
  } });
  assert.deepEqual(result, { inserted: 1, duplicates: 0, day });
  assert.deepEqual(requests, ["/api/v1/rest.php", "/rest/v1/rpc/crm_ingest_voip"]);
});

test("one-day inspection reports only field names and aggregates without a CRM write", async () => {
  await assert.rejects(inspectVoipDay(day, { env: {}, fetch: () => assert.fail() }), /inbound_filter_required/);
  const env = {
    VOIP_MS_USERNAME: "synthetic", VOIP_MS_API_PASSWORD: "example",
    VOIP_MS_BUSINESS_DID: did, VOIP_MS_INBOUND_CALL_TYPE: "verified-fixture",
  };
  let requests = 0;
  const summary = await inspectVoipDay(day, { env, fetch: async address => {
    requests++;
    const url = new URL(address);
    assert.equal(url.origin, "https://voip.ms");
    assert.equal(url.searchParams.get("calltype"), "verified-fixture");
    assert.equal(url.searchParams.get("date_from"), day);
    assert.equal(url.searchParams.get("date_to"), day);
    return Response.json({ status: "success", cdr: [record, record, { ...record, destination: "4025550102" }] });
  } });
  assert.equal(requests, 1);
  assert.deepEqual(summary, {
    day, returned: 3, matched: 2, duplicate_ids: 1, conflicting_duplicate_ids: 0, with_caller: 2, with_duration: 2,
    fields: Object.keys(record).sort(),
  });
  assert.doesNotMatch(JSON.stringify(summary), /4025550101|fixture\.1|Synthetic|example/);
});

test("sync fails closed on absent inbound filter, provider errors, and conflicting duplicate IDs", async () => {
  const env = {
    CRM_VOIP_ENABLED: "true", VOIP_MS_USERNAME: "synthetic", VOIP_MS_API_PASSWORD: "never-print-this",
    VOIP_MS_BUSINESS_DID: did, VOIP_MS_INBOUND_CALL_TYPE: "synthetic-inbound",
  };
  await assert.rejects(syncVoip(day, {
    env: { ...env, VOIP_MS_INBOUND_CALL_TYPE: "" }, fetch: () => assert.fail("unfiltered request"),
  }), /voip_not_connected/);
  await assert.rejects(syncVoip(day, { env, fetch: () => { throw new Error(env.VOIP_MS_API_PASSWORD); } }),
    error => error.message === "voip_provider_unavailable" && !error.cause);
  await assert.rejects(syncVoip(day, { env, fetch: (url) => {
    assert.equal(new URL(url).hostname, "voip.ms");
    return Response.json({ status: "success", cdr: [record, { ...record, seconds: "99" }] });
  } }), /voip_conflicting_cdr/);
});
