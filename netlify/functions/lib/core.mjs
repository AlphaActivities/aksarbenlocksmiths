import { createHash, randomUUID } from "node:crypto";
export const PROJECT = "c1000000-0000-4000-8000-000000000001";
export const TARGET_REF = "umnxslkgksqyqfwwdztg";
export const SITE_ID = "1468843e-3044-4988-a4d8-c9bb7ba6e87a";
export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export class Fault extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
  }
}
export function config(env = process.env) {
  const url = env.SUPABASE_URL;
  if (!url || new URL(url).origin !== `https://${TARGET_REF}.supabase.co`)
    throw new Fault(503, "crm_not_configured");
  if (!env.SUPABASE_ANON_KEY) throw new Fault(503, "crm_not_configured");
  return {
    url,
    anon: env.SUPABASE_ANON_KEY,
    service: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}
export async function db(
  path,
  { token, service = false, method = "GET", body, prefer } = {},
  deps = {},
) {
  const env = deps.env || process.env,
    cfg = config(env);
  const key = service ? cfg.service : cfg.anon;
  if (!key) throw new Fault(503, "server_binding_missing");
  const res = await (deps.fetch || fetch)(`${cfg.url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${service ? key : token}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Fault(
      e.code === "42501"
        ? 403
        : e.code === "40001" || e.code === "23505"
          ? 409
          : e.code === "P0002"
            ? 404
            : res.status >= 500
              ? 502
              : 400,
      "database_operation_failed",
    );
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
export const rpc = (name, body, options = {}, deps) =>
  db(`rpc/${name}`, { ...options, method: "POST", body }, deps);
export function bounded(value, max, required = false) {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new Fault(422, "invalid_fields");
  return value.trim();
}
export function normalizeSubmission(raw) {
  if (typeof raw?.id !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(raw.id))
    throw new Fault(422, "invalid_provider_record");
  const createdAt = parseInstant(raw.created_at, "invalid_provider_date");
  if (raw.spam !== undefined && typeof raw.spam !== "boolean")
    throw new Fault(422, "invalid_provider_spam_flag");
  if (raw.spam === true) return null;
  if (!raw.data || typeof raw.data !== "object" || Array.isArray(raw.data))
    throw new Fault(422, "invalid_provider_record");
  const d = raw.data;
  if (d["bot-field"]) return null;
  if (d.source === "chat" && !UUID.test(d.handoff_id || ""))
    throw new Fault(422, "invalid_handoff_identity");
  const chat = d.source === "chat" && UUID.test(d.handoff_id || "");
  const urgency = ["urgent", "scheduled", "quote"].includes(d.urgency)
    ? d.urgency
    : "quote";
  return {
    source: chat ? "chat" : "netlify",
    provider_id: chat ? d.handoff_id : String(raw.id),
    provider_submission_id: String(raw.id),
    created_at: new Date(createdAt).toISOString(),
    name: bounded(d.name, 120, true),
    email: bounded(d.email || "", 254),
    phone: bounded(d.phone || "", 40),
    service: bounded(d.service || "Other", 100, true),
    area: bounded(d.area || "", 120),
    urgency,
    message: bounded(d.message || "", 6000),
    conversation: chat
      ? [
          { role: "visitor", text: bounded(d.message || "", 6000) },
          {
            role: "assistant",
            text: "Callback requested; pricing and availability require staff confirmation.",
          },
        ]
      : [],
  };
}
// Date.parse alone accepts date-only strings and normalizes invalid calendar days.
export function parseInstant(value, code = "invalid_timestamp") {
  const match =
    typeof value === "string" &&
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|[+-](\d{2}):(\d{2}))$/,
    );
  if (!match) throw new Fault(422, code);
  const [
    ,
    year,
    month,
    day,
    hour,
    minute,
    second,
    zone,
    offsetHour,
    offsetMinute,
  ] = match;
  const days = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
  if (
    Number(year) < 1000 ||
    Number(month) < 1 ||
    Number(month) > 12 ||
    Number(day) < 1 ||
    Number(day) > days ||
    Number(hour) > 23 ||
    Number(minute) > 59 ||
    Number(second) > 59 ||
    (zone !== "Z" &&
      (Number(offsetHour) > 14 ||
        Number(offsetMinute) > 59 ||
        (Number(offsetHour) === 14 && Number(offsetMinute) !== 0)))
  )
    throw new Fault(422, code);
  const instant = Date.parse(value);
  if (!Number.isFinite(instant)) throw new Fault(422, code);
  return instant;
}
export function checkSubscription(value) {
  const endpoint = new URL(value?.endpoint || "invalid");
  // Prevent the server-side sender from becoming an arbitrary URL fetcher.
  if (
    endpoint.protocol !== "https:" ||
    endpoint.username ||
    endpoint.password ||
    endpoint.port ||
    ![
      "fcm.googleapis.com",
      "updates.push.services.mozilla.com",
      "web.push.apple.com",
    ].some(
      (h) => endpoint.hostname === h || endpoint.hostname.endsWith(`.${h}`),
    ) ||
    !/^[\w-]{80,1000}$/.test(value?.keys?.p256dh || "") ||
    !/^[\w-]{20,100}$/.test(value?.keys?.auth || "")
  )
    throw new Fault(422, "invalid_push_subscription");
  return {
    subscription: {
      endpoint: endpoint.href,
      keys: { p256dh: value.keys.p256dh, auth: value.keys.auth },
    },
    endpoint_hash: createHash("sha256").update(endpoint.href).digest("hex"),
  };
}
export const newKey = () => randomUUID();
