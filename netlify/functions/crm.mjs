import {
  config,
  db,
  rpc,
  Fault,
  PROJECT,
  UUID,
  bounded,
  checkSubscription,
  newKey,
} from "./lib/core.mjs";
import { syncIntake } from "./lib/intake.mjs";
const cookieName = "c1_access",
  refreshName = "c1_refresh";
const cookie = (name, value, age) =>
  `${name}=${encodeURIComponent(value)}; Path=/api/crm; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
const parseCookies = (text) =>
  Object.fromEntries(
    (text || "")
      .split(";")
      .map((v) => v.trim().split("="))
      .filter((v) => v.length === 2)
      .map(([k, v]) => [k, decodeURIComponent(v)]),
  );
const reply = (status, data, cookies = []) => ({
  statusCode: status,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, private",
    "X-Content-Type-Options": "nosniff",
  },
  multiValueHeaders: { "Set-Cookie": cookies },
  body: JSON.stringify(data),
});
export function createHandler(deps = {}) {
  const env = deps.env || process.env,
    request = deps.fetch || fetch;
  return async (event) => {
    const cookies = [];
    try {
      const cfg = config(env),
        method = event.httpMethod;
      const headers = Object.fromEntries(
        Object.entries(event.headers || {}).map(([k, v]) => [
          k.toLowerCase(),
          v,
        ]),
      );
      const path = (event.path || "").replace(
        /^\/api\/crm\/?|^\/\.netlify\/functions\/crm\/?/,
        "",
      );
      if (!["GET", "POST", "DELETE"].includes(method))
        throw new Fault(405, "method_not_allowed");
      if (method !== "GET") {
        const allowed = new Set(["https://aksarbenlocksmiths.com"]);
        if (env.DEPLOY_PRIME_URL) {
          const preview = new URL(env.DEPLOY_PRIME_URL);
          if (preview.protocol === "https:" && /^(?:[a-z0-9-]+--)?aksarbenlocksmiths\.netlify\.app$/.test(preview.hostname)) allowed.add(preview.origin);
        }
        if (env.NETLIFY_DEV === "true") allowed.add("http://localhost:8888");
        if (!allowed.has(headers.origin)) throw new Fault(403, "origin_rejected");
        if (!headers["content-type"]?.startsWith("application/json"))
          throw new Fault(415, "json_required");
      }
      if ((event.body || "").length > 24000)
        throw new Fault(413, "request_too_large");
      const body = method === "GET" ? {} : JSON.parse(event.body || "{}");
      const auth = async (route, payload, token) => {
        const res = await request(`${cfg.url}/auth/v1/${route}`, {
          method: payload ? "POST" : "GET",
          headers: {
            apikey: cfg.anon,
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          ...(payload ? { body: JSON.stringify(payload) } : {}),
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) throw new Fault(401, "sign_in_required");
        return res.status === 204 ? {} : res.json();
      };
      const saveSession = (session) => {
        cookies.push(
          cookie(
            cookieName,
            session.access_token,
            Math.min(session.expires_in || 3600, 3600),
          ),
          cookie(refreshName, session.refresh_token, 60 * 60 * 24 * 14),
        );
        return session.access_token;
      };
      if (path === "login" && method === "POST") {
        const session = await auth("token?grant_type=password", {
          email: bounded(body.email, 254, true),
          password:
            typeof body.password === "string" &&
            body.password.length > 0 &&
            body.password.length <= 256
              ? body.password
              : (() => {
                  throw new Fault(422, "invalid_fields");
                })(),
        });
        const rows = await db(
          `crm_memberships?user_id=eq.${session.user.id}&project_id=eq.${PROJECT}&select=role`,
          { token: session.access_token },
          deps,
        );
        if (!rows.length) throw new Fault(403, "project_access_required");
        saveSession(session);
        return reply(200, { role: rows[0].role }, cookies);
      }
      if (path === "logout" && method === "POST") {
        const access = parseCookies(headers.cookie)[cookieName];
        if (access) {
          try {
            await auth("logout", {}, access);
          } catch {
            /* Always clear this browser's session. */
          }
        }
        return reply(200, { ok: true }, [
          cookie(cookieName, "", 0),
          cookie(refreshName, "", 0),
        ]);
      }
      const jar = parseCookies(headers.cookie);
      let token = jar[cookieName],
        user;
      try {
        if (!token) throw new Fault(401, "sign_in_required");
        user = await auth("user", null, token);
      } catch (e) {
        if (!jar[refreshName]) throw e;
        const session = await auth("token?grant_type=refresh_token", {
          refresh_token: jar[refreshName],
        });
        token = saveSession(session);
        user = session.user;
      }
      const rows = await db(
        `crm_memberships?user_id=eq.${user.id}&project_id=eq.${PROJECT}&select=role`,
        { token },
        deps,
      );
      const role = rows[0]?.role;
      if (!["josh_admin", "staff", "client"].includes(role))
        throw new Fault(403, "project_access_required");
      if (path === "session" && method === "GET")
        return reply(
          200,
          { role, email: user.email, user_id: user.id },
          cookies,
        );
      if (path === "attention" && method === "GET")
        return reply(
          200,
          { attention: await rpc("crm_attention_count", {}, { token }, deps) },
          cookies,
        );
      if (path === "queue" && method === "GET") {
        const q = event.queryStringParameters || {};
        for (const k of ["from", "to"])
          if (q[k] && !Number.isFinite(Date.parse(q[k])))
            throw new Fault(422, "invalid_date");
        return reply(
          200,
          await rpc(
            "crm_snapshot",
            {
              p_from: q.from || null,
              p_to: q.to || null,
              p_service: q.service || null,
            },
            { token },
            deps,
          ),
          cookies,
        );
      }
      const lead = path.match(/^leads\/([\w-]+)$/);
      if (lead && UUID.test(lead[1])) {
        if (method === "GET") {
          const leads = await db(
            `crm_leads?id=eq.${lead[1]}&select=*`,
            { token },
            deps,
          );
          if (!leads.length) throw new Fault(404, "not_found");
          const events = await db(
            `crm_events?lead_id=eq.${lead[1]}&select=*&order=happened_at.desc`,
            { token },
            deps,
          );
          return reply(200, { lead: leads[0], events }, cookies);
        }
        if (method === "POST")
          return reply(
            200,
            await rpc(
              "crm_work",
              {
                p_id: lead[1],
                p_action: bounded(body.action, 40, true),
                p_note: bounded(body.note || "", 4000),
                p_follow_up: body.follow_up_at || null,
                p_version: body.version,
                p_key: bounded(body.request_key, 100, true),
              },
              { token },
              deps,
            ),
            cookies,
          );
      }
      if (path === "manual" && method === "POST") {
        if (!UUID.test(body.request_key || ""))
          throw new Fault(422, "invalid_request_key");
        const phone = bounded(body.phone || "", 40, true);
        if (!/^\+?\d{7,15}$/.test(phone.replace(/[^\d+]/g, "")))
          throw new Fault(422, "invalid_callback_number");
        const r = {
          source: "manual",
          provider_id: body.request_key,
          created_at: new Date().toISOString(),
          name: bounded(body.name, 120, true),
          phone,
          email: "",
          service: bounded(body.service, 100, true),
          area: bounded(body.area || "", 120),
          urgency: ["urgent", "scheduled", "quote"].includes(body.urgency)
            ? body.urgency
            : "quote",
          message: bounded(body.message || "", 6000),
        };
        return reply(
          200,
          await rpc(
            "crm_ingest",
            { p_records: [r], p_history: false },
            { service: true },
            deps,
          ),
          cookies,
        );
      }
      if (path === "settings" && method === "GET") {
        const [preferences, devices, receipts] = await Promise.all([
          db(`crm_preferences?user_id=eq.${user.id}&select=*`, { token }, deps),
          db(
            "crm_devices?select=id,label,refreshed_at&order=refreshed_at.desc",
            { token },
            deps,
          ),
          db(
            "crm_deliveries?select=outbox_id,device_id,state,confirmed_at",
            { token },
            deps,
          ),
        ]);
        return reply(
          200,
          {
            preferences: preferences[0] || {
              inquiries: true,
              handoffs: true,
              follow_ups: true,
            },
            devices,
            receipts,
            vapid_public_key: env.VAPID_PUBLIC_KEY || null,
            push_enabled: env.CRM_PUSH_ENABLED === "true",
          },
          cookies,
        );
      }
      if (path === "settings" && method === "POST") {
        if (
          !["inquiries", "handoffs", "follow_ups"].every(
            (k) => typeof body[k] === "boolean",
          )
        )
          throw new Fault(422, "invalid_preferences");
        await db(
          "crm_preferences?on_conflict=user_id",
          {
            token,
            method: "POST",
            body: {
              user_id: user.id,
              inquiries: body.inquiries,
              handoffs: body.handoffs,
              follow_ups: body.follow_ups,
            },
            prefer: "resolution=merge-duplicates",
          },
          deps,
        );
        return reply(200, { ok: true }, cookies);
      }
      if (path === "devices" && method === "POST") {
        const subscription = checkSubscription(body.subscription);
        const rows = await db(
          "crm_devices?on_conflict=endpoint_hash",
          {
            token,
            method: "POST",
            body: {
              ...subscription,
              user_id: user.id,
              label: bounded(body.label, 80, true),
              refreshed_at: new Date().toISOString(),
            },
            prefer: "resolution=merge-duplicates,return=representation",
          },
          deps,
        );
        return reply(200, { id: rows[0].id }, cookies);
      }
      const device = path.match(/^devices\/([\w-]+)(\/test|\/confirm)?$/);
      if (device && UUID.test(device[1])) {
        const own = await db(
          `crm_devices?id=eq.${device[1]}&select=id`,
          { token },
          deps,
        );
        if (!own.length) throw new Fault(404, "not_found");
        if (method === "DELETE" && !device[2]) {
          await db(
            `crm_devices?id=eq.${device[1]}`,
            { token, method: "DELETE" },
            deps,
          );
          return reply(200, { ok: true }, cookies);
        }
        if (method === "POST" && device[2] === "/test") {
          if (env.CRM_PUSH_ENABLED !== "true")
            throw new Fault(409, "push_not_enabled");
          const id = newKey();
          await db(
            "crm_outbox",
            {
              service: true,
              method: "POST",
              body: {
                id,
                kind: "test",
                dedupe_key: `test:${id}`,
                target_device: device[1],
              },
            },
            deps,
          );
          return reply(
            202,
            { outbox_id: id, status: "queued_not_confirmed" },
            cookies,
          );
        }
        if (
          method === "POST" &&
          device[2] === "/confirm" &&
          UUID.test(body.outbox_id || "")
        ) {
          await rpc(
            "crm_confirm_receipt",
            { p_outbox: body.outbox_id, p_device: device[1] },
            { token },
            deps,
          );
          return reply(200, { ok: true }, cookies);
        }
      }
      if (path === "business" || path === "reconcile") {
        if (role !== "josh_admin") throw new Fault(403, "admin_required");
        if (path === "business" && method === "GET")
          return reply(
            200,
            {
              project: "C1 Mike Aksarben Locksmiths",
              target_ref: "umnxslkgksqyqfwwdztg",
              intake_enabled: env.CRM_INTAKE_ENABLED === "true",
              push_enabled: env.CRM_PUSH_ENABLED === "true",
              voip: "deferred",
            },
            cookies,
          );
        if (path === "reconcile" && method === "POST")
          return reply(200, await syncIntake(deps), cookies);
      }
      throw new Fault(404, "not_found");
    } catch (e) {
      // Never log payloads, tokens, provider bodies, customer data or arbitrary error text.
      const status =
        e instanceof Fault ? e.status : e instanceof SyntaxError ? 400 : 503;
      return reply(
        status,
        { error: e instanceof Fault ? e.message : "operation_unavailable" },
        cookies,
      );
    }
  };
}
export const handler = createHandler();
