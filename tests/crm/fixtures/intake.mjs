import { SITE_ID, TARGET_REF } from "../../../netlify/functions/lib/core.mjs";
export const NOW = "2026-11-19T12:00:00.000Z";
export const CUTOFF = "2026-11-19T10:00:00.000Z";
export const FORM = {
  id: "synthetic-contact-form",
  name: "contact",
  site_id: SITE_ID,
};
export const ENV = {
  SUPABASE_URL: `https://${TARGET_REF}.supabase.co`,
  SUPABASE_ANON_KEY: "synthetic-anon",
  SUPABASE_SERVICE_ROLE_KEY: "synthetic-service",
  NETLIFY_AUTH_TOKEN: "synthetic-provider-auth",
  NETLIFY_FORM_ID: FORM.id,
  NETLIFY_LIVE_FROM: CUTOFF,
  CRM_INTAKE_ENABLED: "true",
};
export function submission(overrides = {}) {
  return {
    id: "synthetic-submission-001",
    form_id: FORM.id,
    site_id: SITE_ID,
    created_at: "2026-11-19T10:30:00.000Z",
    spam: false,
    data: {
      name: "Synthetic Intake QA",
      phone: "+14025550101",
      email: "qa@example.invalid",
      service: "Residential",
      area: "68102",
      urgency: "urgent",
      message: "Fixture only; no customer data.",
    },
    ...overrides,
  };
}
// This fetch double rejects every unrecognised URL. It never delegates to real fetch.
export function fixture(options = {}) {
  const writes = [],
    calls = [],
    batches = [];
  let state = options.state || [];
  const env = { ...ENV, ...options.env };
  const request = async (input, init = {}) => {
    const url = new URL(input);
    calls.push({
      host: url.hostname,
      path: url.pathname,
      search: url.search,
      method: init.method || "GET",
    });
    if (url.hostname === "api.netlify.com") {
      if (options.providerFailure) return Response.json({}, { status: 503 });
      if (url.pathname === `/api/v1/sites/${SITE_ID}/forms`)
        return Response.json(
          options.forms === undefined ? [FORM] : options.forms,
        );
      if (url.pathname === `/api/v1/forms/${env.NETLIFY_FORM_ID}/submissions`) {
        const page = Number(url.searchParams.get("page"));
        return Response.json(
          options.pages ? options.pages(page) : options.rows || [submission()],
        );
      }
    }
    if (url.hostname === `${TARGET_REF}.supabase.co`) {
      if (url.pathname === "/rest/v1/crm_sync_state") {
        if (init.method === "POST") {
          writes.push("watermark");
          if (options.watermarkFailure)
            return Response.json({}, { status: 500 });
          state = [{ watermark: JSON.parse(init.body).watermark }];
        }
        const key = url.searchParams.get("name")?.slice(3);
        return Response.json(
          init.method !== "POST" && options.stateByKey
            ? options.stateByKey[key] || []
            : state,
        );
      }
      if (url.pathname === "/rest/v1/rpc/crm_ingest") {
        writes.push("ingest");
        batches.push(JSON.parse(init.body));
        if (options.persistenceFailure)
          return Response.json({}, { status: 500 });
        return Response.json({
          inserted: batches.at(-1).p_records.length,
          duplicates: 0,
        });
      }
      if (url.pathname === "/auth/v1/user")
        return Response.json({ id: "10000000-0000-4000-8000-000000000001" });
      if (url.pathname === "/rest/v1/crm_memberships")
        return Response.json([{ role: options.role || "josh_admin" }]);
    }
    throw new Error("Unexpected fixture URL; external access is forbidden");
  };
  return {
    deps: { env, fetch: request, now: () => Date.parse(NOW) },
    writes,
    calls,
    batches,
  };
}
