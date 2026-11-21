import { Fault, rpc } from "./core.mjs";

const endpoint = "https://voip.ms/api/v1/rest.php";

function phone(value) {
  if (typeof value !== "string") return null;
  const number = (value.match(/<([^<>]+)>$/)?.[1] ?? value).trim();
  if (!/^\+?[\d ().-]+$/.test(number)) return null;
  const digits = number.replace(/\D/g, "");
  const normalized = number.startsWith("+") ? number.replace(/[^+\d]/g, "")
    : digits.length === 10 ? `+1${digits}`
    : /^1\d{10}$/.test(digits) ? `+${digits}` : "";
  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
}

function hasCredentials(env) {
  return Boolean(
    env.VOIP_MS_USERNAME && env.VOIP_MS_API_PASSWORD && /^\+1\d{10}$/.test(env.VOIP_MS_BUSINESS_DID || ""),
  );
}

export function voipConfigured(env) {
  return env.CRM_VOIP_ENABLED === "true" && hasCredentials(env);
}

export function normalizeCdr(row, day, did, historical) {
  if (!row || !/^Inbound\b/i.test(row.description || "") ||
      !/^IN:/i.test(row.destination_type || "") || phone(String(row.destination ?? "")) !== did)
    return null;
  const rawId = row.uniqueid;
  const id = typeof rawId === "string" || Number.isSafeInteger(rawId) ? String(rawId) : "";
  const stamp = typeof row.date === "string" ? row.date : "";
  const time = new Date(stamp.replace(" ", "T") + "Z");
  const status = typeof row.disposition === "string" ? row.disposition.trim().toUpperCase() : "";
  if (!/^[\w.-]{1,100}$/.test(id) || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(stamp) ||
      !Number.isFinite(+time) || time.toISOString().slice(0, 19).replace("T", " ") !== stamp ||
      stamp.slice(0, 10) !== day || !/^[A-Z][A-Z _-]{0,31}$/.test(status))
    throw new Fault(502, "voip_invalid_cdr");
  const seconds = /^\d{1,7}$/.test(String(row.seconds ?? "")) ? Number(row.seconds) : null;
  return {
    provider_call_id: id, occurred_at: time.toISOString(), caller_phone: phone(row.callerid),
    business_did: did, disposition: status, duration_seconds: seconds, historical,
  };
}

async function fetchVoipDay(day, env, request, callType) {
  if (!hasCredentials(env)) throw new Fault(503, "voip_not_connected");
  const utc = new Date(`${day}T00:00:00Z`);
  const today = new Date().toISOString().slice(0, 10);
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
      !Number.isFinite(+utc) || utc.toISOString().slice(0, 10) !== day || day > today)
    throw new Fault(422, "voip_invalid_day");

  const url = new URL(endpoint);
  url.search = new URLSearchParams({
    api_username: env.VOIP_MS_USERNAME, api_password: env.VOIP_MS_API_PASSWORD,
    method: "getCDR", content_type: "json", date_from: day, date_to: day,
    timezone: "0", answered: "1", noanswer: "1", busy: "1", failed: "1",
    ...(callType ? { calltype: callType } : {}),
  });
  let payload;
  try {
    const response = await request(url.toString(), {
      redirect: "error", signal: AbortSignal.timeout(10000), cache: "no-store",
    });
    if (!response.ok) throw new Error();
    payload = await response.json();
  } catch {
    throw new Fault(502, "voip_provider_unavailable");
  }
  if (payload?.status !== "success" || !Array.isArray(payload.cdr) || payload.cdr.length > 5000)
    throw new Fault(502, "voip_unexpected_response");
  const matched = payload.cdr.flatMap(row => {
    const normalized = normalizeCdr(row, day, env.VOIP_MS_BUSINESS_DID, day < today);
    return normalized ? [{ normalized, row }] : [];
  });
  return { matched, returned: payload.cdr.length };
}

export async function inspectVoipDay(day, deps = {}) {
  const env = deps.env || process.env;
  const callType = env.VOIP_MS_INBOUND_CALL_TYPE;
  if (typeof callType !== "string" || !/^[\w:.-]{1,80}$/.test(callType))
    throw new Fault(503, "voip_inbound_filter_required");
  const { matched, returned } = await fetchVoipDay(day, env, deps.fetch || fetch, callType);
  const ids = new Set(matched.map(({ normalized }) => normalized.provider_call_id));
  return {
    day,
    returned,
    matched: matched.length,
    duplicate_ids: matched.length - ids.size,
    with_caller: matched.filter(({ normalized }) => normalized.caller_phone !== null).length,
    with_duration: matched.filter(({ normalized }) => normalized.duration_seconds !== null).length,
    fields: [...new Set(matched.flatMap(({ row }) => Object.keys(row)))].sort(),
  };
}

export async function syncVoip(day, deps = {}) {
  const env = deps.env || process.env;
  if (!voipConfigured(env)) throw new Fault(503, "voip_not_connected");
  const { matched, returned } = await fetchVoipDay(day, env, deps.fetch || fetch, env.VOIP_MS_INBOUND_CALL_TYPE);
  const calls = matched.map(({ normalized }) => normalized);
  if (calls.length > 500) throw new Fault(502, "voip_batch_too_large");
  if (returned && !calls.length)
    throw new Fault(502, "voip_no_verified_did_records");
  const result = await rpc("crm_ingest_voip", { p_calls: calls, p_day: day }, { service: true }, deps);
  return { ...result, day };
}
