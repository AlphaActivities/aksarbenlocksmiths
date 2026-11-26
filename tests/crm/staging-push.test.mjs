import assert from 'node:assert/strict';
import test from 'node:test';
import {createECDH} from 'node:crypto';
import webpush from 'web-push';
import {serveCrm} from '../../preview/cloudflare/crm.mjs';
import {dispatchStagingPush} from '../../preview/cloudflare/push.mjs';

const origin = 'https://aksarben-admin-review.gta-alpha-activities.workers.dev';
const device = '10000000-0000-4000-8000-000000000001';
const account = '20000000-0000-4000-8000-000000000001';
const vapid = webpush.generateVAPIDKeys();
const browser = createECDH('prime256v1');
browser.generateKeys();
const subscription = {
  endpoint: 'https://web.push.apple.com/fixture',
  keys: {p256dh: browser.getPublicKey().toString('base64url'), auth: Buffer.alloc(16, 2).toString('base64url')},
  vapid_public_key: vapid.publicKey,
};
const env = {STAGING_VAPID_KEYS: JSON.stringify(vapid), SUPABASE_ANON_KEY: 'fixture'};

test('authenticated device test sends only to the owned staging device, without using the outbox', async () => {
  let owned = true;
  let sends = 0;
  const upstream = async (input, options) => {
    const url = new URL(input);
    if (url.hostname === 'web.push.apple.com') {
      assert.equal(options.method, 'POST');
      assert.equal(options.redirect, 'error');
      assert.equal(options.headers['Content-Encoding'], 'aes128gcm');
      assert.ok(options.body.byteLength > 0);
      sends++;
      return new Response(null, {status: 201});
    }
    if (url.pathname.endsWith('/user')) return Response.json({id: account});
    if (url.pathname.endsWith('/crm_memberships')) return Response.json([{role: 'client'}]);
    if (url.pathname.endsWith('/crm_devices')) {
      assert.equal(url.searchParams.get('user_id'), 'eq.' + account);
      assert.equal(url.searchParams.get('id'), 'eq.' + device);
      return Response.json(owned ? [{id: device, subscription}] : []);
    }
    if (url.pathname.endsWith('/crm_attention_count')) return Response.json(1);
    throw Error('Unexpected endpoint');
  };
  const send = (requestOrigin = origin) => serveCrm(new Request(origin + '/api/crm/devices/' + device + '/test', {
    method: 'POST', headers: {Origin: requestOrigin, 'Content-Type': 'application/json', Cookie: 'c1_access=fixture'},
    body: '{}',
  }), env, upstream);
  assert.equal((await send('https://example.invalid')).status, 403);
  assert.equal((await send()).status, 200);
  owned = false;
  assert.equal((await send()).status, 404);
  assert.equal(sends, 1);
});

test('staging scheduler is disabled by default and historical rows are outside its claim query', async () => {
  const fail = () => { throw Error('Unexpected outbound request'); };
  assert.equal((await dispatchStagingPush(env, fail)).status, 'disabled');
  assert.equal((await dispatchStagingPush({...env, STAGING_PUSH_BULK: 'true'}, fail)).status, 'not_configured');
  let queries = 0;
  const active = {...env, STAGING_PUSH_BULK: 'true', STAGING_PUSH_CUTOFF: '2026-11-27T00:00:00Z', SUPABASE_SERVICE_ROLE_KEY: 'fixture'};
  const result = await dispatchStagingPush(active, async (input, options) => {
    const url = new URL(input);
    assert.equal(options.method, 'GET');
    if (url.pathname.endsWith('/crm_outbox')) {
      queries++;
      assert.equal(url.searchParams.get('dedupe_key'), 'like.staging:*');
      assert.equal(url.searchParams.get('created_at'), 'gte.2026-11-27T00:00:00.000Z');
      assert.equal(url.searchParams.get('processed_at'), 'is.null');
    }
    return Response.json([]);
  });
  assert.equal(queries, 1);
  assert.equal(result.accepted, 0);
});
