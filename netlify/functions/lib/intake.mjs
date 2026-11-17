import { db, rpc, SITE_ID, Fault, normalizeSubmission } from "./core.mjs";
export async function syncIntake(deps = {}) {
  const env = deps.env || process.env,
    request = deps.fetch || fetch;
  if (env.CRM_INTAKE_ENABLED !== "true") return { status: "disabled" };
  const cutoff = Date.parse(env.NETLIFY_LIVE_FROM || "");
  if (
    !Number.isFinite(cutoff) ||
    !env.NETLIFY_AUTH_TOKEN ||
    !env.NETLIFY_FORM_ID
  )
    throw new Fault(503, "intake_binding_missing");
  const get = async (path) => {
    const r = await request(`https://api.netlify.com/api/v1/${path}`, {
      headers: { Authorization: `Bearer ${env.NETLIFY_AUTH_TOKEN}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) throw new Fault(502, "provider_read_failed");
    return r.json();
  };
  const forms = await get(`sites/${SITE_ID}/forms`);
  if (
    !forms.some(
      (f) =>
        f.id === env.NETLIFY_FORM_ID &&
        f.name === "contact" &&
        (!f.site_id || f.site_id === SITE_ID),
    )
  )
    throw new Fault(409, "form_identity_mismatch");
  const state = await db(
    "crm_sync_state?name=eq.netlify&select=watermark",
    { service: true },
    deps,
  );
  const since = Math.max(
    cutoff,
    state[0] ? Date.parse(state[0].watermark) - 15 * 60 * 1000 : cutoff,
  );
  const until = new Date().toISOString();
  let inserted = 0,
    duplicates = 0,
    skipped = 0;
  for (let page = 1; page <= 100; page++) {
    const rows = await get(
      `forms/${encodeURIComponent(env.NETLIFY_FORM_ID)}/submissions?per_page=100&page=${page}`,
    );
    if (!Array.isArray(rows)) throw new Fault(502, "provider_format_invalid");
    const records = [];
    for (const raw of rows) {
      if (raw.form_id && raw.form_id !== env.NETLIFY_FORM_ID)
        throw new Fault(409, "submission_form_mismatch");
      if (!Number.isFinite(Date.parse(raw.created_at)))
        throw new Fault(422, "invalid_provider_date");
      if (
        Date.parse(raw.created_at) < since ||
        Date.parse(raw.created_at) > Date.parse(until)
      ) {
        skipped++;
        continue;
      }
      const r = normalizeSubmission(raw);
      if (r) records.push(r);
      else skipped++;
    }
    if (records.length) {
      const result = await rpc(
        "crm_ingest",
        { p_records: records, p_history: false },
        { service: true },
        deps,
      );
      inserted += result.inserted;
      duplicates += result.duplicates;
    }
    if (rows.length < 100) {
      await db(
        "crm_sync_state?on_conflict=name",
        {
          service: true,
          method: "POST",
          body: { name: "netlify", watermark: until, updated_at: until },
          prefer: "resolution=merge-duplicates",
        },
        deps,
      );
      return { status: "persisted", inserted, duplicates, skipped };
    }
  }
  throw new Fault(409, "provider_pagination_limit"); // Cursor does not advance on incomplete/failed persistence.
}
