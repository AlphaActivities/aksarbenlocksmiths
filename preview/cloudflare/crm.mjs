import { createHandler } from '../../netlify/functions/crm.mjs';

const stagingOrigin = 'https://aksarben-admin-review.gta-alpha-activities.workers.dev';
const readable = new Set(['session', 'attention', 'queue', 'settings', 'business', 'team', 'notifications']);
const writable = new Set(['login', 'logout', 'settings', 'devices']);
const leadRoute = /^leads\/[0-9a-f-]{36}$/i;

function unavailable(status, error) {
  return Response.json({ error }, {
    status,
    headers: { 'Cache-Control': 'no-store, private' },
  });
}

export async function serveCrm(request, env, upstream = fetch) {
  const url = new URL(request.url);
  if (url.origin !== stagingOrigin) return unavailable(404, 'not_found');

  const route = url.pathname.slice('/api/crm/'.length);
  const method = request.method;
  const isLead = leadRoute.test(route);
  const device = /^devices\/[0-9a-f-]{36}$/i.test(route);
  const confirm = /^devices\/[0-9a-f-]{36}\/confirm$/i.test(route);
  const supported = method === 'GET'
    ? readable.has(route) || isLead
    : (method === 'POST' && (writable.has(route) || isLead || confirm)) || (method === 'DELETE' && device);
  if (!supported) return unavailable(501, 'staging_integration_unavailable');

  if (method === 'POST' || method === 'DELETE') {
    if (request.headers.get('Origin') !== stagingOrigin) return unavailable(403, 'origin_rejected');
    if (method === 'POST' && !request.headers.get('Content-Type')?.startsWith('application/json')) {
      return unavailable(415, 'json_required');
    }
  }

  let body;
  if (method === 'POST' && request.body) {
    const reader = request.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    body = '';
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 24000) {
          await reader.cancel();
          return unavailable(413, 'request_too_large');
        }
        body += decoder.decode(value, { stream: true });
      }
      body += decoder.decode();
    } finally {
      reader.releaseLock();
    }
  }

  const handler = createHandler({
    env: {
      SUPABASE_URL: 'https://umnxslkgksqyqfwwdztg.supabase.co',
      SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    },
    fetch: upstream,
    allowedOrigin: stagingOrigin,
  });
  const result = await handler({
    httpMethod: method,
    path: url.pathname,
    headers: Object.fromEntries(request.headers),
    queryStringParameters: Object.fromEntries(url.searchParams),
    body,
  });
  const headers = new Headers(result.headers);
  for (const cookie of result.multiValueHeaders['Set-Cookie']) headers.append('Set-Cookie', cookie);
  return new Response(result.body, { status: result.statusCode, headers });
}
