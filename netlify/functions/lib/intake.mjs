import {
  db,
  rpc,
  SITE_ID,
  Fault,
  normalizeSubmission,
  parseInstant,
} from "./core.mjs";

const MAX_BATCH = 500;
const MAX_PAGES = 100;
const OVERLAP_MS = 15 * 60 * 1000;

// Validate the complete bounded poll before the first write. A bad later page
// must not leave a partially persisted batch or advance the recovery watermark.
async function planIntake(deps) {
  const env = deps.env || process.env;
  const request = deps.fetch || fetch;
  if (!env.NETLIFY_AUTH_TOKEN || !env.NETLIFY_FORM_ID || !env.NETLIFY_LIVE_FROM)
    throw new Fault(503, "intake_binding_missing");
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(env.NETLIFY_FORM_ID))
    throw new Fault(422, "invalid_form_id");
  const cutoff = parseInstant(env.NETLIFY_LIVE_FROM, "invalid_live_cutoff");
  const until = Number((deps.now || Date.now)());
  if (!Number.isFinite(until) || cutoff > until)
    throw new Fault(422, "future_live_cutoff");
  const get = async (path) => {
    const response = await request(`https://api.netlify.com/api/v1/${path}`, {
      headers: { Authorization: `Bearer ${env.NETLIFY_AUTH_TOKEN}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Fault(502, "provider_read_failed");
    try {
      return await response.json();
    } catch {
      throw new Fault(502, "provider_format_invalid");
    }
  };
  const forms = await get(`sites/${SITE_ID}/forms`);
  if (!Array.isArray(forms)) throw new Fault(502, "provider_format_invalid");
  const matching = forms.filter((form) => form?.id === env.NETLIFY_FORM_ID);
  if (
    matching.length !== 1 ||
    matching[0].name !== "contact" ||
    (matching[0].site_id !== undefined && matching[0].site_id !== SITE_ID)
  )
    throw new Fault(409, "form_identity_mismatch");
  // The authenticated site-scoped catalogue binds forms even when Netlify omits
  // site_id from its form representation. Every submission must carry form_id.
  // A cursor from a different form or rollout boundary is not evidence for this
  // configuration. Leave the legacy unscoped row untouched; replay the reviewed
  // cutoff under a scoped key, with database uniqueness protecting existing leads.
  const stateKey = `netlify:${SITE_ID}:${env.NETLIFY_FORM_ID}:${new Date(cutoff).toISOString()}`;
  const state = await db(
    `crm_sync_state?name=eq.${encodeURIComponent(stateKey)}&select=watermark`,
    { service: true },
    deps,
  );
  if (!Array.isArray(state) || state.length > 1)
    throw new Fault(409, "invalid_sync_state");
  const watermark = state.length
    ? parseInstant(state[0].watermark, "invalid_sync_watermark")
    : cutoff;
  if (watermark > until) throw new Fault(409, "future_sync_watermark");
  const since = Math.max(cutoff, watermark - OVERLAP_MS);
  const records = [];
  const seen = new Set();
  let skipped = 0,
    providerDuplicates = 0;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const rows = await get(
      `forms/${encodeURIComponent(env.NETLIFY_FORM_ID)}/submissions?per_page=100&page=${page}`,
    );
    if (!Array.isArray(rows) || rows.length > 100)
      throw new Fault(502, "provider_format_invalid");
    for (const raw of rows) {
      if (raw?.form_id !== env.NETLIFY_FORM_ID)
        throw new Fault(409, "submission_form_mismatch");
      if (raw.site_id !== undefined && raw.site_id !== SITE_ID)
        throw new Fault(409, "submission_site_mismatch");
      const createdAt = parseInstant(raw.created_at, "invalid_provider_date");
      if (createdAt < since || createdAt > until) {
        skipped++;
        continue;
      }
      const record = normalizeSubmission(raw);
      if (!record) {
        skipped++;
        continue;
      }
      if (seen.has(record.provider_submission_id)) {
        providerDuplicates++;
        continue;
      }
      seen.add(record.provider_submission_id);
      records.push(record);
      if (records.length > MAX_BATCH)
        throw new Fault(409, "intake_batch_limit");
    }
    if (rows.length < 100)
      return {
        records,
        evidence: {
          site_id: SITE_ID,
          form_id: env.NETLIFY_FORM_ID,
          form_name: "contact",
          cutoff: new Date(cutoff).toISOString(),
          sync_key: stateKey,
          since: new Date(since).toISOString(),
          until: new Date(until).toISOString(),
          eligible: records.length,
          skipped,
          provider_duplicates: providerDuplicates,
        },
      };
  }
  throw new Fault(409, "provider_pagination_limit");
}

// Owner-only callers can inspect bindings/cutoff and the bounded poll while
// unattended sync stays disabled. No lead, outbox or watermark write occurs.
export async function inspectIntake(deps = {}) {
  const { evidence } = await planIntake(deps);
  return { status: "verified_read_only", ...evidence };
}

export async function syncIntake(deps = {}) {
  const env = deps.env || process.env;
  if (env.CRM_INTAKE_ENABLED !== "true") return { status: "disabled" };
  const { records, evidence } = await planIntake(deps);
  const result = records.length
    ? await rpc(
        "crm_ingest",
        { p_records: records, p_history: false },
        { service: true },
        deps,
      )
    : { inserted: 0, duplicates: 0 };
  await db(
    "crm_sync_state?on_conflict=name",
    {
      service: true,
      method: "POST",
      body: {
        name: evidence.sync_key,
        watermark: evidence.until,
        updated_at: evidence.until,
      },
      prefer: "resolution=merge-duplicates",
    },
    deps,
  );
  return {
    status: "persisted",
    ...result,
    skipped: evidence.skipped,
    verification: evidence,
  };
}
