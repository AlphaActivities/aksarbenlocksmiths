import { dispatchPush } from "./lib/push.mjs";
export const handler = async () => {
  try {
    const r = await dispatchPush();
    console.info("crm_push", r.status);
    return { statusCode: 200 };
  } catch {
    console.warn("crm_push", "retry_required");
    return { statusCode: 503 };
  }
};
