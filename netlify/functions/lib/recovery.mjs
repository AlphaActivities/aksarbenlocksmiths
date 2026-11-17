import { createHmac, timingSafeEqual, randomBytes, createHash } from "node:crypto";
import { db, PROJECT, Fault } from "./core.mjs";

export const RESET_URL = "https://aksarbenlocksmiths.com/admin/reset-password";
export const RECOVERY_NOTICE = "If this address has an eligible account, a password reset email will arrive shortly. Check your inbox and spam folder.";
const recoveryCookie = "c1_recovery";
const verifierCookie = "c1_recovery_verifier";
const ttl = 600;
const signature = (payload, key) => createHmac("sha256", key).update(`c1-recovery:${payload}`).digest("base64url");
const seal = (token, key) => {
  const payload = Buffer.from(JSON.stringify({ token, until: Date.now() + ttl * 1000 })).toString("base64url");
  return `${payload}.${signature(payload, key)}`;
};
function unseal(value, key) {
  try {
    const [payload, mac, extra] = (value || "").split(".");
    if (!payload || !mac || extra) return null;
    const expected = Buffer.from(signature(payload, key));
    const actual = Buffer.from(mac);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof data.token === "string" && data.until > Date.now() ? data.token : null;
  } catch { return null; }
}

export async function recovery({ path, method, body, headers, cfg, request, deps, reply, cookie, parseCookies }) {
  if (!path.startsWith("recovery/")) return null;
  if (method !== "POST") throw new Fault(405, "method_not_allowed");
  const clear = () => cookie(recoveryCookie, "", 0);
  const provider = (route, payload, token, verb = "POST") => request(`${cfg.url}/auth/v1/${route}`, {
    method: verb,
    headers: { apikey: cfg.anon, "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  const member = async (token) => {
    const response = await provider("user", null, token, "GET");
    if (!response.ok) return false;
    const user = await response.json();
    if (!user.id) return false;
    const rows = await db(`crm_memberships?user_id=eq.${user.id}&project_id=eq.${PROJECT}&select=role`, { token }, deps);
    return rows.some((r) => ["josh_admin", "staff", "client"].includes(r.role));
  };
  if (!cfg.service) throw new Fault(503, "server_binding_missing");
  if (path === "recovery/request") {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Fault(422, "invalid_email");
    // No membership lookup, upstream body, account-existence status, or email is returned/logged.
    // Supabase's configured per-address and project email limits still apply.
    const started = Date.now();
    const verifier = randomBytes(32).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    try { await provider(`recover?redirect_to=${encodeURIComponent(RESET_URL)}`, { email, code_challenge: challenge, code_challenge_method: "s256" }); } catch { /* same public response */ }
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, 500 - (Date.now() - started))));
    return reply(202, { message: RECOVERY_NOTICE }, [cookie(verifierCookie, seal(verifier, cfg.service), ttl)]);
  }
  if (path === "recovery/verify") {
    // The private verifier was created only by the recovery request in this browser.
    // An unrelated login/invite code cannot be exchanged with this verifier.
    const verifier = unseal(parseCookies(headers.cookie)[verifierCookie], cfg.service);
    if (!verifier || typeof body.code !== "string" || !/^[a-zA-Z0-9_-]{16,256}$/.test(body.code))
      return reply(400, { error: "recovery_link_invalid" }, [clear()]);
    try {
      const response = await provider("token?grant_type=pkce", { auth_code: body.code, code_verifier: verifier });
      if (!response.ok) return reply(400, { error: "recovery_link_invalid" }, [clear()]);
      const session = await response.json();
      if (!session.access_token || !(await member(session.access_token)))
        return reply(400, { error: "recovery_link_invalid" }, [clear()]);
      return reply(200, { verified: true }, [cookie(recoveryCookie, seal(session.access_token, cfg.service), ttl), cookie(verifierCookie, "", 0)]);
    } catch { return reply(400, { error: "recovery_link_invalid" }, [clear()]); }
  }
  if (path === "recovery/update") {
    const token = unseal(parseCookies(headers.cookie)[recoveryCookie], cfg.service);
    if (!token || !(await member(token))) return reply(400, { error: "recovery_link_invalid" }, [clear()]);
    if (typeof body.password !== "string" || body.password.length < 12 || body.password.length > 256)
      throw new Fault(422, "password_requirements");
    const response = await provider("user", { password: body.password }, token, "PUT");
    if (!response.ok) return reply(422, { error: "password_update_failed" });
    // Do not create a normal app session from a recovery session. Require fresh sign-in.
    try { await provider("logout?scope=global", {}, token); } catch { /* password update already succeeded */ }
    return reply(200, { updated: true }, [clear(), cookie("c1_access", "", 0), cookie("c1_refresh", "", 0)]);
  }
  throw new Fault(404, "not_found");
}
