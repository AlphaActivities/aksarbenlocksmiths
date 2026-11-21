import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeCdr, syncVoip } from "../../netlify/functions/lib/voip.mjs";

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
    VOIP_MS_BUSINESS_DID: did, SUPABASE_URL: "https://umnxslkgksqyqfwwdztg.supabase.co",
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
