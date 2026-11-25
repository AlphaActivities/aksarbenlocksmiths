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
import { serveCrm } from './crm.mjs';

export default { async fetch(request, env) {
  if (!(await authorized(request, env))) return new Response('Access denied', {status: 403, headers: {'Cache-Control':'no-store'}});
  if (new URL(request.url).pathname.startsWith('/api/crm/')) return serveCrm(request, env);
  const headers = new Headers(request.headers);
  headers.set('oai-authenticated-user-id', 'verified-reviewer');
  return baseline.fetch(new Request(request,{headers}));
}};
