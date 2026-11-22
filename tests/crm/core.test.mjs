import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import {
  config,
  normalizeSubmission,
  checkSubscription,
  SITE_ID,
  TARGET_REF,
} from "../../netlify/functions/lib/core.mjs";
import { planHistory } from "../../scripts/crm/import-history.mjs";
import { syncIntake } from "../../netlify/functions/lib/intake.mjs";
import { createHandler } from "../../netlify/functions/crm.mjs";
const id = "10000000-0000-4000-8000-000000000001";
const provider = (id = "provider-one") => ({
  id,
  form_id: "form",
  created_at: "2025-02-03T10:00:00-06:00",
  data: {
    name: "Synthetic QA",
    phone: "+14025550101",
    service: "Residential",
    area: "68102",
    urgency: "urgent",
    message: "Synthetic test only",
  },
});
const env = {
  SUPABASE_URL: `https://${TARGET_REF}.supabase.co`,
  SUPABASE_ANON_KEY: "test-anon",
  SUPABASE_SERVICE_ROLE_KEY: "test-service",
};
test("server target is pinned and missing configuration fails closed", () => {
  assert.throws(() => config({}), /crm_not_configured/);
  assert.throws(
    () => config({ ...env, SUPABASE_URL: "https://other.supabase.co" }),
    /crm_not_configured/,
  );
  assert.equal(config(env).url, env.SUPABASE_URL);
});
test("intake preserves original date and provider identity, drops spam and bounds fields", () => {
  const r = normalizeSubmission(provider());
  assert.equal(r.created_at, "2025-02-03T16:00:00.000Z");
  assert.equal(r.provider_id, "provider-one");
  assert.equal(r.urgency, "urgent");
  assert.equal(normalizeSubmission({ ...provider(), spam: true }), null);
  assert.throws(
    () =>
      normalizeSubmission({
        ...provider(),
        data: { ...provider().data, name: "x".repeat(121) },
      }),
    /invalid_fields/,
  );
  const chat = normalizeSubmission({
    ...provider("p2"),
    data: { ...provider().data, source: "chat", handoff_id: id },
  });
  assert.equal(chat.provider_id, id);
  assert.equal(chat.provider_submission_id, "p2");
  assert.equal(chat.source, "chat");
});
test("history requires full review bound to exact export bytes and never rewrites original dates", () => {
  const bytes = Buffer.from(
    JSON.stringify({
      site_id: SITE_ID,
      form_id: "form",
      form_name: "contact",
      submissions: [provider("one"), provider("two")],
    }),
  );
  const review = {
    export_sha256: createHash("sha256").update(bytes).digest("hex"),
    decisions: { one: "legitimate", two: "test" },
  };
  const plan = planHistory(bytes, review);
  assert.deepEqual(plan.summary, { exported: 2, approved: 1, excluded: 1 });
  assert.equal(plan.records[0].created_at, "2025-02-03T16:00:00.000Z");
  assert.throws(
    () => planHistory(bytes, { ...review, export_sha256: "bad" }),
    /review_does_not_match/,
  );
  assert.throws(
    () => planHistory(bytes, { ...review, decisions: { one: "legitimate" } }),
    /every_record_requires_review/,
  );
});
test("push subscriptions cannot target arbitrary servers or local networks", () => {
  const valid = {
    endpoint: "https://fcm.googleapis.com/fcm/send/synthetic",
    keys: { p256dh: "a".repeat(87), auth: "a".repeat(22) },
  };
  assert.equal(checkSubscription(valid).subscription.endpoint, valid.endpoint);
  for (const endpoint of [
    "https://127.0.0.1/private",
    "http://fcm.googleapis.com/x",
    "https://fcm.googleapis.com.evil.example/x",
    "https://user:pass@fcm.googleapis.com/x",
  ])
    assert.throws(() => checkSubscription({ ...valid, endpoint }));
});
test("Netlify sync is disabled by default and requires an explicit live cutoff", async () => {
  assert.deepEqual(await syncIntake({ env }), { status: "disabled" });
  await assert.rejects(
    syncIntake({ env: { ...env, CRM_INTAKE_ENABLED: "true" } }),
    /intake_binding_missing/,
  );
});
test("provider persistence failure never advances the sync watermark; replay uses stable IDs", async () => {
  const synced = [];
  let cursorWrites = 0;
  let fail = true;
  const now = new Date().toISOString();
  const fake = async (url, opts = {}) => {
    if (url.includes("/sites/"))
      return Response.json([{ id: "form", name: "contact", site_id: SITE_ID }]);
    if (url.includes("/submissions?"))
      return Response.json([{ ...provider(), created_at: now }]);
    if (url.includes("crm_sync_state")) {
      if (opts.method === "POST") cursorWrites++;
      return Response.json([]);
    }
    if (url.includes("crm_ingest")) {
      if (fail) return Response.json({}, { status: 500 });
      synced.push(JSON.parse(opts.body).p_records[0].provider_id);
      return Response.json({ inserted: 1, duplicates: 0 });
    }
    throw new Error("unexpected fake request");
  };
  const deps = {
    env: {
      ...env,
      NETLIFY_AUTH_TOKEN: "test",
      NETLIFY_FORM_ID: "form",
      CRM_INTAKE_ENABLED: "true",
      NETLIFY_LIVE_FROM: "2026-11-17T00:00:00Z",
    },
    fetch: fake,
  };
  await assert.rejects(syncIntake(deps));
  assert.equal(cursorWrites, 0);
  fail = false;
  await syncIntake(deps);
  assert.equal(cursorWrites, 1);
  assert.deepEqual(synced, ["provider-one"]);
});
const event = (path, method = "GET", body = {}, extra = {}) => ({
  path: `/api/crm/${path}`,
  httpMethod: method,
  headers: {
    origin: "https://aksarbenlocksmiths.com",
    "content-type": "application/json",
    cookie: "c1_access=synthetic",
    ...extra,
  },
  body: JSON.stringify(body),
});
const authFetch = (role) => async (url) => {
  if (url.endsWith("/auth/v1/user"))
    return Response.json({ id, email: "qa@example.invalid" });
  if (url.includes("crm_memberships"))
    return Response.json(role ? [{ role }] : []);
  if (url.includes("crm_snapshot"))
    return Response.json({ attention: 0, leads: [], metrics: {} });
  throw new Error("unexpected fake request");
};
test("API rejects unauthenticated, wrong project, wrong role, cross-origin and wrong method requests", async () => {
  const unauthorized = createHandler({
    env,
    fetch: async () => Response.json({}, { status: 401 }),
  });
  assert.equal((await unauthorized(event("queue"))).statusCode, 401);
  assert.equal(
    (await createHandler({ env, fetch: authFetch(null) })(event("queue")))
      .statusCode,
    403,
  );
  for (const role of ["staff", "client"])
    assert.equal(
      (await createHandler({ env, fetch: authFetch(role) })(event("business")))
        .statusCode,
      403,
    );
  assert.equal(
    (
      await createHandler({ env, fetch: authFetch("josh_admin") })(
        event("business"),
      )
    ).statusCode,
    200,
  );
  assert.equal(
    (await createHandler({ env, fetch: authFetch("staff") })(event("queue")))
      .statusCode,
    200,
  );
  assert.equal(
    (
      await createHandler({ env, fetch: authFetch("staff") })(
        event("manual", "POST", {}, { origin: "https://other.example" }),
      )
    ).statusCode,
    403,
  );
  assert.equal(
    (
      await createHandler({ env, fetch: authFetch("staff") })(
        event("business", "PUT"),
      )
    ).statusCode,
    405,
  );
});
test("login sets HttpOnly Secure SameSite cookies without returning session credentials", async () => {
  const handler = createHandler({
    env,
    fetch: async (url) =>
      url.includes("/auth/v1/token")
        ? Response.json({
            access_token: "synthetic-access",
            refresh_token: "synthetic-refresh",
            expires_in: 3600,
            user: { id },
          })
        : Response.json([{ role: "staff" }]),
  });
  const response = await handler(
    event("login", "POST", {
      email: "qa@example.invalid",
      password: "test password",
    }),
  );
  assert.equal(response.statusCode, 200);
  assert.ok(!response.body.includes("synthetic-access"));
  assert.ok(
    response.multiValueHeaders["Set-Cookie"].every((c) =>
      c.includes("HttpOnly; Secure; SameSite=Strict"),
    ),
  );
});
function workerHarness(paths = []) {
  const handlers = {};
  const notes = [];
  const messages = [];
  const badges = [];
  let navigated;
  const tabs = paths.map((path) => ({
    url: `https://aksarbenlocksmiths.com${path}`,
    postMessage: (m) => messages.push(m),
    navigate: async (target) => {
      navigated = target;
      return { focus: async () => {} };
    },
  }));
  const self = {
    addEventListener: (k, fn) => (handlers[k] = fn),
    skipWaiting: async () => {},
    location: { origin: "https://aksarbenlocksmiths.com" },
    navigator: {
      setAppBadge: async (n) => badges.push(n),
      clearAppBadge: async () => badges.push(0),
    },
    clients: {
      claim: async () => {},
      matchAll: async () => tabs,
      openWindow: async (path) => {
        navigated = path;
      },
    },
    registration: {
      showNotification: async (title, data) => notes.push({ title, ...data }),
    },
  };
  vm.runInNewContext(readFileSync("public/admin/sw.js", "utf8"), {
    self,
    URL,
    fetch: async () => Response.json({ attention: 0 }),
  });
  const run = async (kind, extra) => {
    let done;
    handlers[kind]({ ...extra, waitUntil: (p) => (done = p) });
    await done;
  };
  return {
    run,
    notes,
    messages,
    badges,
    handlers,
    get navigated() {
      return navigated;
    },
  };
}
test("worker recognizes /admin and /admin/, refreshes count and excludes private lock-screen text", async () => {
  for (const path of ["/admin", "/admin/"]) {
    const h = workerHarness([path]);
    await h.run("push", {
      data: {
        json: () => ({
          id,
          lead_id: id,
          kind: "handoff",
          attention_count: 8,
          name: "DO NOT DISPLAY",
        }),
      },
    });
    assert.equal(h.messages.length, 1);
    assert.ok(!JSON.stringify(h.notes).includes("DO NOT DISPLAY"));
    assert.equal(h.notes[0].data.url, `/admin/leads/${id}`);
    assert.equal(h.handlers.fetch, undefined);
  }
});
test("worker clears background badge using canonical count and rejects unsafe tap destinations", async () => {
  const h = workerHarness();
  await h.run("push", { data: { json: () => ({ attention_count: 8 }) } });
  assert.deepEqual(h.badges, [0]);
  await h.run("notificationclick", {
    notification: { close() {}, data: { url: "https://evil.example" } },
  });
  assert.equal(h.navigated, "/admin/notifications");
});

test("push dispatch respects preferences, deduplicates accepted delivery and cleans invalid endpoints", async () => {
  const { dispatchPush } = await import("../../netlify/functions/lib/push.mjs");
  const deliveries = [],
    removed = [],
    payloads = [];
  let skip = true;
  const item = { id, kind: "inquiry", lead_id: id, target_device: null };
  const device = {
    id,
    user_id: id,
    subscription: {
      endpoint: "https://fcm.googleapis.com/fcm/send/synthetic",
      keys: { p256dh: "a".repeat(87), auth: "a".repeat(22) },
    },
  };
  const fake = async (url, opts = {}) => {
    if (url.includes("crm_enqueue_follow_ups")) return Response.json(0);
    if (url.includes("crm_claim_outbox")) return Response.json([item]);
    if (url.includes("crm_memberships"))
      return Response.json([{ user_id: id }]);
    if (url.includes("crm_preferences"))
      return Response.json([{ user_id: id, inquiries: !skip }]);
    if (url.includes("crm_devices")) {
      if (opts.method === "DELETE") removed.push(url);
      return Response.json([device]);
    }
    if (url.includes("crm_leads"))
      return Response.json([{ id, status: "new" }]);
    if (url.includes("crm_deliveries")) {
      if (opts.method === "POST") deliveries.push(JSON.parse(opts.body));
      return Response.json(deliveries);
    }
    if (url.includes("crm_outbox")) return Response.json(null);
    throw new Error("unexpected fake request");
  };
  const deps = {
    env: {
      ...env,
      CRM_PUSH_ENABLED: "true",
      VAPID_PUBLIC_KEY: "synthetic",
      VAPID_PRIVATE_KEY: "synthetic",
      VAPID_SUBJECT: "mailto:qa@example.invalid",
    },
    fetch: fake,
    send: async (_sub, payload) => payloads.push(JSON.parse(payload)),
  };
  await dispatchPush(deps);
  assert.equal(payloads.length, 0);
  skip = false;
  await dispatchPush(deps);
  await dispatchPush(deps);
  assert.equal(payloads.length, 1);
  assert.equal(deliveries[0].state, "accepted");
  assert.equal(deliveries[0].confirmed_at, undefined);
  assert.deepEqual(Object.keys(payloads[0]).sort(), [
    "attention_count",
    "id",
    "kind",
    "lead_id",
  ]);
  deliveries.length = 0;
  await dispatchPush({
    ...deps,
    send: async () => {
      throw Object.assign(new Error("expired"), { statusCode: 410 });
    },
  });
  assert.equal(removed.length, 1);
});

test('only the authorized Netlify site preview origin can make authenticated writes',async()=>{
 const preview='https://qa--aksarbenlocksmiths.netlify.app';
 const handler=createHandler({env:{...env,DEPLOY_PRIME_URL:preview},fetch:authFetch('staff')});
 assert.equal((await handler(event('logout','POST',{}, {origin:preview}))).statusCode,200);
 assert.equal((await handler(event('logout','POST',{}, {origin:'https://other--different-client.netlify.app'}))).statusCode,403);
});

test('analytics scrubs contact details, free text, queries and private URLs',async()=>{
 const ts=await import('typescript');
 const code=ts.transpileModule(readFileSync('src/utils/analyticsPrivacy.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const context={exports:{},window:{location:{origin:'https://aksarbenlocksmiths.com'}},URL};vm.runInNewContext(code,context);
 const clean=context.exports.scrubAnalytics({name:'Synthetic QA',phone:'+14025550101',email:'qa@example.invalid',chat_content:'private',message:'private',query:'private',page_path:'/?email=qa@example.invalid',page_location:'/admin/leads/'+id,service_slug:'rekeying',count:2});
 assert.deepEqual(JSON.parse(JSON.stringify(clean)),{service_slug:'rekeying',count:2});
 const url=context.exports.scrubAnalytics({page_path:'/?q=private',service_slug:'rekeying'});assert.equal(url.page_path,'/');
});

test("notification inbox uses a read-only authorized RPC and validates pagination", async () => {
  const snapshot = { attention: 0, active: [], history: [] };
  const fetched = [];
  const delegate = authFetch("staff");
  const handler = createHandler({
    env,
    fetch: async (url, options) => {
      if (!url.endsWith("/rpc/crm_notification_inbox")) return delegate(url, options);
      fetched.push(JSON.parse(options.body));
      return Response.json(snapshot);
    },
  });
  const response = await handler({ ...event("notifications"), queryStringParameters: { offset: "50" } });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), snapshot);
  assert.equal((await handler({ ...event("notifications"), queryStringParameters: { offset: "-1" } })).statusCode, 422);
  assert.notEqual((await handler(event("notifications", "POST", {}))).statusCode, 200);
  assert.deepEqual(fetched, [{ p_offset: 50 }]);
});
