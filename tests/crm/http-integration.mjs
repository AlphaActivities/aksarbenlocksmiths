// Disposable PostgREST + PostgreSQL only. No live provider/database targets are contacted.
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { createHandler } from "../../netlify/functions/crm.mjs";
import { TARGET_REF, PROJECT } from "../../netlify/functions/lib/core.mjs";
const base = process.env.CRM_TEST_REST_URL;
assert.match(base || "", /^http:\/\/127\.0\.0\.1:\d+$/);
const signing = "c1-disposable-local-test-signing-key-never-production";
const jwt = (claims) => {
  const a = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ),
    b = Buffer.from(
      JSON.stringify({ ...claims, exp: Math.floor(Date.now() / 1000) + 600 }),
    ).toString("base64url");
  return `${a}.${b}.${createHmac("sha256", signing).update(`${a}.${b}`).digest("base64url")}`;
};
const svc = jwt({ role: "service_role" }),
  anon = jwt({ role: "anon" });
const owner = "10000000-0000-4000-8000-000000000001";
const staff = "10000000-0000-4000-8000-000000000002",
  outsider = "10000000-0000-4000-8000-000000000003",
  client = "10000000-0000-4000-8000-000000000004";
const tokens = new Map(
  [owner, staff, outsider, client].map((id) => [
    jwt({ role: "authenticated", sub: id }),
    id,
  ]),
);
const tokenFor = (id) => [...tokens].find(([, v]) => v === id)[0];
const serviceHeaders = {
  Authorization: `Bearer ${svc}`,
  "Content-Type": "application/json",
};
const rest = async (path, method = "GET", body) => {
  const r = await fetch(`${base}/${path}`, {
    method,
    headers: serviceHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.ok(r.ok, `local fixture HTTP ${r.status}`);
  const text = await r.text();
  return text ? JSON.parse(text) : null;
};
await rest("crm_memberships", "POST", [
  { project_id: PROJECT, user_id: owner, role: "josh_admin" },
  { project_id: PROJECT, user_id: staff, role: "staff" },
  { project_id: PROJECT, user_id: client, role: "client" },
]);
let providerReads = 0;
const fetchLocal = async (url, opts = {}) => {
  if (url.includes("/auth/v1/user")) {
    const token = opts.headers.Authorization?.replace("Bearer ", "");
    const id = tokens.get(token);
    return id
      ? Response.json({ id, email: "qa@example.invalid" })
      : Response.json({}, { status: 401 });
  }
  if (url.includes("/rest/v1/"))
    return fetch(
      url.replace(`https://${TARGET_REF}.supabase.co/rest/v1`, base),
      opts,
    );
  providerReads++;
  throw new Error("External service attempted during local integration test");
};
const crmEnv = {
  SUPABASE_URL: `https://${TARGET_REF}.supabase.co`,
  SUPABASE_ANON_KEY: anon,
  SUPABASE_SERVICE_ROLE_KEY: svc,
};
const handler = createHandler({ env: crmEnv, fetch: fetchLocal });
const invoke = async (path, { user = staff, method = "GET", body } = {}, handlerUnderTest = handler) =>
  handlerUnderTest({
    httpMethod: method,
    path: "/api/crm/" + path,
    headers: {
      cookie: `c1_access=${tokenFor(user)}`,
      origin: "https://aksarbenlocksmiths.com",
      "content-type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
assert.equal((await invoke("queue", { user: outsider })).statusCode, 403);
assert.equal((await invoke("business")).statusCode, 403);
const requestKey = randomUUID();
const leadBody = {
  request_key: requestKey,
  name: "Synthetic HTTP",
  phone: "+14025550101",
  service: "Residential",
  area: "68102",
  urgency: "urgent",
};
let r = await invoke("manual", { method: "POST", body: leadBody });
assert.equal(r.statusCode, 200);
assert.equal(JSON.parse(r.body).inserted, 1);
r = await invoke("manual", { method: "POST", body: leadBody });
assert.equal(r.statusCode, 200);
assert.equal(JSON.parse(r.body).duplicates, 1);
r = await invoke("queue");
assert.equal(r.statusCode, 200);
const queue = JSON.parse(r.body);
assert.equal(queue.attention, 1);
assert.equal(queue.leads.length, 1);
const callsResponse = await invoke("calls");
assert.equal(callsResponse.statusCode, 200);
assert.deepEqual(JSON.parse(callsResponse.body), { connected: false, calls: [] });
assert.equal((await invoke("calls", { user: outsider })).statusCode, 403);
for (const user of [staff, client, outsider]) {
  assert.equal((await invoke("calls/sync", {
    user, method: "POST", body: { day: "2025-11-20" },
  })).statusCode, 403);
}
const inboxResponse = await invoke("notifications");
assert.equal(inboxResponse.statusCode, 200);
const inbox = JSON.parse(inboxResponse.body);
assert.equal(inbox.attention, queue.attention);
assert.equal(inbox.active[0].lead_id, queue.leads[0].id);
assert.deepEqual(inbox.history, []);
assert.equal((await invoke("notifications", { user: outsider })).statusCode, 403);
const lead = queue.leads[0];
r = await invoke(`leads/${lead.id}`, {
  method: "POST",
  body: {
    action: "callback_completed",
    note: "Synthetic HTTP completion",
    version: lead.version,
    request_key: randomUUID(),
  },
});
assert.equal(r.statusCode, 200);
r = await invoke(`leads/${lead.id}`);
assert.equal(r.statusCode, 200);
const detail = JSON.parse(r.body);
assert.equal(detail.lead.status, "closed");
assert.equal(
  detail.events.filter((e) => e.kind === "callback_completed").length,
  1,
);
r = await invoke("settings", {
  method: "POST",
  body: { inquiries: false, handoffs: true, follow_ups: true },
});
assert.equal(
  r.statusCode,
  200,
  "minimal INSERT response must not break server JSON parsing",
);
r = await invoke("settings");
assert.equal(r.statusCode, 200);
assert.equal(JSON.parse(r.body).preferences.inquiries, false);
r = await invoke("settings", { user: client });
assert.equal(
  JSON.parse(r.body).preferences.inquiries,
  true,
  "preferences leaked across accounts",
);
const forbidden = await fetch(`${base}/rpc/crm_ingest`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${tokenFor(staff)}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ p_records: [], p_history: true }),
});
assert.equal(forbidden.status, 403);
const forged = await fetch(`${base}/crm_leads`, {
  headers: { Authorization: `Bearer ${tokenFor(staff).slice(0, -2)}xx` },
});
assert.equal(forged.status, 401);
assert.equal(providerReads, 0);

const day = "2025-11-20", did = "+15315550100";
const call = {
  description: "Inbound DID", destination_type: "IN:USA", destination: "5315550100",
  callerid: "+14025550101", uniqueid: "synthetic-http-call", date: day + " 12:00:00",
  disposition: "ANSWERED", seconds: "17",
};
const voiceHandler = createHandler({
  env: { ...crmEnv, CRM_VOIP_ENABLED: "true", VOIP_MS_USERNAME: "synthetic",
    VOIP_MS_API_PASSWORD: "fixture", VOIP_MS_BUSINESS_DID: did, VOIP_MS_INBOUND_CALL_TYPE: "synthetic-inbound" },
  fetch: async (url, opts) => {
    if (new URL(url).origin !== "https://voip.ms") return fetchLocal(url, opts);
    const params = new URL(url).searchParams;
    assert.equal(params.get("method"), "getCDR");
    assert.equal(params.get("calltype"), "synthetic-inbound");
    assert.equal(params.get("date_from"), day);
    assert.equal(params.get("date_to"), day);
    return Response.json({ status: "success", cdr: [call, { ...call, destination: "4025550111" }] });
  },
});
const countsBefore = await invoke("queue");
for (const inserted of [1, 0]) {
  const result = await invoke("calls/sync", { user: owner, method: "POST", body: { day } }, voiceHandler);
  assert.equal(result.statusCode, 200);
  assert.deepEqual(JSON.parse(result.body), { inserted, duplicates: 1 - inserted, day });
}
const calls = JSON.parse((await invoke("calls")).body).calls;
assert.equal(calls.length, 1);
assert.equal(calls[0].related_lead_id, lead.id);
assert.equal(calls[0].historical, true);
assert.deepEqual(JSON.parse((await invoke("queue")).body), JSON.parse(countsBefore.body));
assert.equal(providerReads, 0);
console.log(
  "PASS: HTTP API → signed PostgREST JWT → real RLS/RPC; wrong-project/role, replay, callback, settings isolation, forbidden direct ingest and forged JWT",
);
