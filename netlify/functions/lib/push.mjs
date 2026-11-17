import webpush from "web-push";
import { db, rpc, checkSubscription, Fault, newKey, PROJECT } from "./core.mjs";
export async function dispatchPush(deps = {}) {
  const env = deps.env || process.env;
  if (env.CRM_PUSH_ENABLED !== "true") return { status: "disabled" };
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT)
    throw new Fault(503, "push_binding_missing");
  const send =
    deps.send ||
    ((sub, payload) =>
      webpush.sendNotification(sub, payload, {
        vapidDetails: {
          subject: env.VAPID_SUBJECT,
          publicKey: env.VAPID_PUBLIC_KEY,
          privateKey: env.VAPID_PRIVATE_KEY,
        },
        TTL: 300,
        timeout: 5000,
      }));
  await rpc("crm_enqueue_follow_ups", {}, { service: true }, deps);
  const owner = newKey();
  const outbox = await rpc(
    "crm_claim_outbox",
    { p_owner: owner },
    { service: true },
    deps,
  );
  const members = await db(
    `crm_memberships?project_id=eq.${PROJECT}&select=user_id`,
    { service: true },
    deps,
  );
  const users = new Set(members.map((m) => m.user_id));
  const [devices, prefs] = await Promise.all([
    db("crm_devices?select=*", { service: true }, deps),
    db("crm_preferences?select=*", { service: true }, deps),
  ]);
  const prefKey = {
    inquiry: "inquiries",
    handoff: "handoffs",
    follow_up: "follow_ups",
  };
  const leads = await db(
    "crm_leads?historical=eq.false&select=id,status,follow_up_at",
    { service: true },
    deps,
  );
  const attention = leads.filter(
    (l) =>
      l.status === "new" ||
      (["callback", "scheduled"].includes(l.status) &&
        Date.parse(l.follow_up_at) <= Date.now()),
  ).length;
  let accepted = 0,
    failed = 0;
  for (const item of outbox) {
    // Do not send stale lead alerts after staff have resolved the task.
    const active = leads.find((l) => l.id === item.lead_id);
    const deliver =
      item.kind === "test" ||
      (active && !["closed", "booked", "history"].includes(active.status));
    if (deliver)
      for (const device of devices) {
        if (
          !users.has(device.user_id) ||
          (item.target_device && item.target_device !== device.id)
        )
          continue;
        const pref = prefs.find((p) => p.user_id === device.user_id);
        if (item.kind !== "test" && pref?.[prefKey[item.kind]] === false)
          continue;
        const existing = await db(
          `crm_deliveries?outbox_id=eq.${item.id}&device_id=eq.${device.id}&select=state`,
          { service: true },
          deps,
        );
        if (existing[0]?.state === "accepted") continue;
        try {
          checkSubscription(device.subscription);
          await send(
            device.subscription,
            JSON.stringify({
              id: item.id,
              kind: item.kind,
              lead_id: item.lead_id,
              attention_count: attention,
            }),
          );
          await db(
            "crm_deliveries?on_conflict=outbox_id,device_id",
            {
              service: true,
              method: "POST",
              body: {
                outbox_id: item.id,
                device_id: device.id,
                state: "accepted",
              },
              prefer: "resolution=merge-duplicates",
            },
            deps,
          );
          accepted++;
        } catch (e) {
          failed++;
          if (
            e.statusCode === 404 ||
            e.statusCode === 410 ||
            (e instanceof Fault && e.status === 422)
          )
            await db(
              `crm_devices?id=eq.${device.id}`,
              { service: true, method: "DELETE" },
              deps,
            );
          else throw new Fault(502, "push_retry_required"); // Do not mark processed after transient failures.
        }
      }
    await db(
      `crm_outbox?id=eq.${item.id}&lease_owner=eq.${owner}`,
      {
        service: true,
        method: "PATCH",
        body: { processed_at: new Date().toISOString() },
      },
      deps,
    );
  }
  return { status: "provider_acceptance_only", accepted, failed };
}
