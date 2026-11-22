import { test } from "node:test";
import assert from "node:assert/strict";
import { inspectVoipDay, normalizeCdr, syncVoip } from "../../netlify/functions/lib/voip.mjs";

const day = "2025-11-20";
const did = "+15315550100";
const inspectionEnv = {
  VOIP_MS_USERNAME: "synthetic", VOIP_MS_API_PASSWORD: "example",
  VOIP_MS_BUSINESS_DID: did, VOIP_MS_INBOUND_CALL_TYPE: "verified-fixture",
  VOIP_MS_INSPECTION_IPV4: "192.0.2.20",
};
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
  const origins = [];
  const summary = await inspectVoipDay(day, { env: inspectionEnv, fetch: async (address, options) => {
    const url = new URL(address);
    origins.push(url.origin);
    if (url.origin === "https://checkip.amazonaws.com") {
      assert.equal(url.search, "");
      assert.equal(options.headers, undefined);
      assert.equal(options.redirect, "error");
      return new Response(`${inspectionEnv.VOIP_MS_INSPECTION_IPV4}\n`);
    }
    assert.equal(url.origin, "https://voip.ms");
    assert.equal(url.searchParams.get("calltype"), "verified-fixture");
    assert.equal(url.searchParams.get("date_from"), day);
    assert.equal(url.searchParams.get("date_to"), day);
    return Response.json({ status: "success", cdr: [record, record, { ...record, destination: "4025550102" }] });
  } });
  assert.deepEqual(origins, ["https://checkip.amazonaws.com", "https://voip.ms"]);
  assert.deepEqual(summary, {
    day, returned: 3, matched: 2, duplicate_ids: 1, conflicting_duplicate_ids: 0, with_caller: 2, with_duration: 2,
    fields: Object.keys(record).sort(),
  });
  assert.doesNotMatch(JSON.stringify(summary), /4025550101|fixture\.1|Synthetic|example/);
});

test("one-day inspection keeps provider credentials local when imports or egress checks fail", async () => {
  const unexpected = () => assert.fail("unexpected network request");
  await assert.rejects(inspectVoipDay(day, {
    env: { ...inspectionEnv, CRM_VOIP_ENABLED: "true" }, fetch: unexpected,
  }), /requires_imports_disabled/);
  await assert.rejects(inspectVoipDay(day, {
    env: { ...inspectionEnv, VOIP_MS_INSPECTION_IPV4: "192.0.2.0/24" }, fetch: unexpected,
  }), /ipv4_required/);
  for (const [body, status, message] of [
    ["192.0.2.21", 200, "voip_inspection_egress_mismatch"],
    ["", 503, "voip_inspection_egress_unavailable"],
  ]) {
    await assert.rejects(inspectVoipDay(day, {
      env: inspectionEnv, fetch: address => {
        assert.equal(address, "https://checkip.amazonaws.com/");
        return new Response(body, { status });
      },
    }), { message });
  }
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

test("inspection rejects a nonempty day containing only another DID", async () => {
  await assert.rejects(inspectVoipDay(day, {
    env: inspectionEnv,
    fetch: async url => new URL(url).hostname === "checkip.amazonaws.com"
      ? new Response(inspectionEnv.VOIP_MS_INSPECTION_IPV4)
      : Response.json({status: "success", cdr: [{...record, destination: "4025550199"}]}),
  }), /no_verified_did_records/);
});

test("multiple verified routes preserve the dialed DID and fail atomically", async () => {
  const second = "+15315550102";
  const routes = [{ did, callType: "first" }, { did: second, callType: "second" }];
  const env = { ...inspectionEnv, CRM_VOIP_ENABLED: "true", VOIP_MS_INBOUND_ROUTES: JSON.stringify(routes),
    SUPABASE_URL: "https://umnxslkgksqyqfwwdztg.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "synthetic",
    SUPABASE_ANON_KEY: "synthetic" };
  let writes = 0;
  let failSecond = true;
  const fetch = async (address, options) => {
    const url = new URL(address);
    if (url.hostname === "voip.ms") {
      const type = url.searchParams.get("calltype");
      if (failSecond && type === "second") return new Response(null, { status: 503 });
      return Response.json({ status: "success", cdr: [{ ...record, uniqueid: type,
        destination: type === "first" ? did : second }] });
    }
    writes++;
    assert.deepEqual(JSON.parse(options.body).p_calls.map(call => call.business_did), [did, second]);
    return Response.json({ inserted: 2, duplicates: 0 });
  };
  await assert.rejects(syncVoip(day, { env, fetch }), /provider_unavailable/);
  assert.equal(writes, 0);
  failSecond = false;
  assert.equal((await syncVoip(day, { env, fetch })).inserted, 2);
  assert.equal(writes, 1);
});
