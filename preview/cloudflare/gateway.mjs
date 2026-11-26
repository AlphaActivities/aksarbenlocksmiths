import {createRemoteJWKSet, jwtVerify} from 'jose';

const issuer = 'https://red-brook-6c8d.cloudflareaccess.com';
const keys = createRemoteJWKSet(new URL('/cdn-cgi/access/certs', issuer));

async function authorized(request, env) {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || !env.ACCESS_AUD) return false;
  try {
    const {payload} = await jwtVerify(token, keys, {
      issuer, audience: env.ACCESS_AUD, algorithms: ['RS256'], requiredClaims: ['exp','email']
    });
    return typeof payload.email === 'string' && payload.email.length > 0;
  } catch {
    return false;
  }
}

import baseline from './baseline/worker/index.mjs';
import { dispatchStagingPush } from './push.mjs';
import { serveCrm } from './crm.mjs';

export default {
async scheduled(_event, env) {
  await dispatchStagingPush(env).catch(() => { console.warn('staging_push_retry_required'); });
},
async fetch(request, env) {
  if (!(await authorized(request, env))) return new Response('Access denied', {status: 403, headers: {'Cache-Control':'no-store'}});
  if (new URL(request.url).pathname.startsWith('/api/crm/')) return serveCrm(request, env);
  const headers = new Headers(request.headers);
  headers.set('oai-authenticated-user-id', 'verified-reviewer');
  const response = await baseline.fetch(new Request(request,{headers}));
  const security = response.headers.get('Content-Security-Policy');
  if (!security || !response.headers.get('Content-Type')?.includes('text/html')) return response;
  const admin = new Response(response.body, response);
  admin.headers.set('Content-Security-Policy', security.replace("worker-src 'none'", "worker-src 'self'"));
  return admin;
}};
