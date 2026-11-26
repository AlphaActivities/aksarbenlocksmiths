import { db } from '../../netlify/functions/lib/core.mjs';
import { dispatchPush, sendWorkerPush } from '../../netlify/functions/lib/push.mjs';

export { sendWorkerPush };

export function vapidSettings(env) {
  if (!env.STAGING_VAPID_KEYS) return null;
  try {
    const {publicKey, privateKey} = JSON.parse(env.STAGING_VAPID_KEYS);
    if (!/^[\w-]{87}$/.test(publicKey) || !/^[\w-]{43}$/.test(privateKey)) return null;
    return {publicKey, privateKey, subject: 'https://aksarbenlocksmiths.com'};
  } catch {
    return null;
  }
}

export async function dispatchStagingPush(bindings, upstream = fetch) {
  if (bindings.STAGING_PUSH_BULK !== 'true') return {status: 'disabled'};
  const vapid = vapidSettings(bindings);
  const epoch = Date.parse(bindings.STAGING_PUSH_CUTOFF);
  if (!vapid || !bindings.SUPABASE_SERVICE_ROLE_KEY || !Number.isFinite(epoch))
    return {status: 'not_configured'};

  const cutoff = new Date(epoch).toISOString();
  const env = {
    ...bindings,
    SUPABASE_URL: 'https://umnxslkgksqyqfwwdztg.supabase.co',
    CRM_PUSH_ENABLED: 'true',
    VAPID_PUBLIC_KEY: vapid.publicKey,
    VAPID_PRIVATE_KEY: vapid.privateKey,
    VAPID_SUBJECT: vapid.subject,
  };
  const deps = {env, fetch: upstream};
  return dispatchPush({
    ...deps,
    deviceFilter: (device) => device.subscription?.vapid_public_key === vapid.publicKey,
    send: (subscription, payload) => sendWorkerPush(subscription, payload, vapid, upstream),
    async claim(owner) {
      const now = new Date();
      const eligible = new URLSearchParams({
        processed_at: 'is.null',
        created_at: 'gte.' + cutoff,
        kind: 'in.(inquiry,handoff,follow_up)',
        dedupe_key: 'like.staging:*',
        or: '(lease_until.is.null,lease_until.lt.' + now.toISOString() + ')',
      });
      const candidates = await db('crm_outbox?' + eligible + '&select=id&order=created_at&limit=1',
        {service: true}, deps);
      if (!candidates.length) return [];
      eligible.set('id', 'eq.' + candidates[0].id);
      return db('crm_outbox?' + eligible, {
        service: true, method: 'PATCH', prefer: 'return=representation',
        body: {lease_owner: owner, lease_until: new Date(now.valueOf() + 120000).toISOString()},
      }, deps);
    },
  });
}
