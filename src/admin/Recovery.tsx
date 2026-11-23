import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "./api";

// Recovery hashes stay in memory only and are removed before any app request.
const incoming = new URLSearchParams(window.location.hash.slice(1));
const query = new URLSearchParams(window.location.search);
let incomingToken = query.get("code");
const invalidLink = incoming.has("error") || incoming.has("error_code") || incoming.has("access_token") || new URLSearchParams(window.location.search).has("error");
if (window.location.pathname === "/admin/reset-password" && (window.location.hash || window.location.search))
  window.history.replaceState(null, "", "/admin/reset-password");

export default function Recovery() {
  const token = useRef(incomingToken);
  const [stage, setStage] = useState<"request" | "verify" | "update" | "done">(incomingToken ? "verify" : "request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(invalidLink ? "This recovery link is invalid or has expired. Request a new link below." : "");
  const act = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (stage === "update" && password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      if (stage === "request") {
        const result = await api<{message:string}>("recovery/request", {email});
        setNotice(result.message);
      } else if (stage === "verify") {
        await api("recovery/verify", {code:token.current});
        incomingToken = null; token.current = null;
        setStage("update");
      } else if (stage === "update") {
        await api("recovery/update", {password});
        setPassword(""); setConfirm(""); setStage("done");
      }
    } catch (e) {
      setError((e as Error).message);
      if (stage === "verify") { incomingToken = null; token.current = null; setStage("request"); }
    } finally { setBusy(false); }
  };
  return <main className="c1-login">
    <img src="/images/shield-logo.webp" alt="Aksarben Locksmiths" />
    <h1>{stage === "done" ? "Password updated" : stage === "update" ? "Choose new password" : "Reset your password"}</h1>
    <p>Aksarben Locksmiths · Private callback queue</p>
    {stage === "done" ? <p role="status">Your password has been updated. Sign in with the new one.</p> : <form onSubmit={(e) => void act(e)}>
      {stage === "request" && <>
        <p>Enter your account email to request a secure one-time recovery link. Open the newest email link in this same browser within 10 minutes.</p>
        <label>Email<input type="email" autoComplete="username" required maxLength={254} value={email} onChange={(e)=>setEmail(e.target.value)} /></label>
      </>}
      {stage === "verify" && <p>Continue to verify this recovery link. Links expire and can be used only once.</p>}
      {stage === "update" && <>
        <p>Choose a password of at least 12 characters. Password changes are voluntary.</p>
        <label>New password<input type="password" autoComplete="new-password" required minLength={12} maxLength={256} value={password} onChange={(e)=>setPassword(e.target.value)} /></label>
        <label>Confirm new password<input type="password" autoComplete="new-password" required minLength={12} maxLength={256} value={confirm} onChange={(e)=>setConfirm(e.target.value)} /></label>
      </>}
      {error && <p role="alert" className="c1-dashboard-error">{error}</p>}{notice && <p role="status" className="c1-action-notice">{notice}</p>}
      <button disabled={busy}>{busy ? "Please wait…" : stage === "request" ? "Email password reset link" : stage === "verify" ? "Continue with recovery link" : "Save new password"}</button>
    </form>}
    {stage === "update" && <button type="button" disabled={busy} onClick={()=>{setPassword("");setConfirm("");setStage("request");setError("");}}>Request a new link</button>}
    <p><Link to="/admin">Back to sign in</Link> · <a href="/">Public website</a></p>
  </main>;
}
