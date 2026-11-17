import { syncIntake } from "./lib/intake.mjs";
// Netlify scheduled functions cannot be invoked by public URL. No untrusted webhook body is ingested.
export const handler = async () => {
  try {
    const r = await syncIntake();
    console.info("crm_intake", r.status);
    return { statusCode: 200 };
  } catch {
    console.warn("crm_intake", "retry_required");
    return { statusCode: 503 };
  }
};
