import { useEffect, useState } from "react";
import { PhoneIncoming } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { api, date } from "./api";

type Call = {
  provider_call_id: string;
  occurred_at: string;
  direction: "incoming" | "outgoing";
  dialed_phone: string | null;
  caller_phone: string | null;
  business_did: string;
  disposition: string;
  duration_seconds: number | null;
  historical: boolean;
  related_lead_id: string | null;
};
type CallLog = { connected: boolean; calls: Call[]; next?: { before: string; id: string } };

export default function Calls({ owner }: { owner: boolean }) {
  const [params, setParams] = useSearchParams();
  const page = params.get("before") && params.get("id") ? "Older call records" : "Most recent call records";
  function resetFilters() { const next = new URLSearchParams(); if (params.get("lead")) next.set("lead", params.get("lead")!); setParams(next); }
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.delete("before");
    next.delete("id");
    if (value) next.set(key, value); else next.delete(key);
    if (key === "outcome" && value === "missed") next.set("direction", "incoming");
    if (key === "direction" && value !== "incoming" && next.get("outcome") === "missed") next.delete("outcome");
    setParams(next);
  }
  return <section><h1>{params.has("lead") ? "Customer call history" : "Call history"}</h1>
    {params.has("lead") && <Link to={`/admin/leads/${params.get("lead")}`}>Back to customer</Link>}
    <fieldset><legend>Filter call history</legend>
      <label>Direction <select value={params.get("direction") || ""} onChange={e => filter("direction", e.target.value)}>
        <option value="">Both directions</option><option value="incoming">Incoming</option><option value="outgoing">Outgoing</option>
      </select></label>
      <label>Customer match <select value={params.get("match") || ""} onChange={e => filter("match", e.target.value)}>
        <option value="">All calls</option><option value="matched">Matched</option><option value="unmatched">Unmatched</option>
      </select></label>
      <label>Provider outcome <select value={params.get("outcome") || ""} onChange={e => filter("outcome", e.target.value)}>
        <option value="">All outcomes</option><option value="missed">Missed incoming calls</option>
        {["ANSWERED","NO ANSWER","BUSY","FAILED"].map(value => <option key={value}>{value}</option>)}
      </select></label>
    </fieldset>
    <div className="c1-call-navigation"><span role="status">{page}</span><button type="button" onClick={resetFilters}>Clear filters and return to newest</button></div>
    <CallPage key={params.toString()} query={params.toString()} owner={owner} />
  </section>;
}

function CallPage({ owner, query }: { owner: boolean; query: string }) {
  const [log, setLog] = useState<CallLog | null>(null);
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const path = query ? `calls?${query}` : "calls";
  useEffect(() => {
    let active = true;
    api<CallLog>(path).then(result => { if (active) setLog(result); })
      .catch(cause => { if (active) setError(cause.message); });
    return () => { active = false; };
  }, [path]);

  async function sync() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await api<{ inserted: number; duplicates: number }>("calls/sync", { day });
      setMessage(`Imported ${result.inserted} calls. ${result.duplicates} already recorded.`);
      setLog(await api<CallLog>(path));
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const next = new URLSearchParams(query);
  if (log?.next) {
    next.set("before", log.next.before);
    next.set("id", log.next.id);
  }
  return (
    <div>
      {error && <p role="alert">{error}</p>}
      <p role="status">{message || (!log && !error ? "Loading call records…" : "")}</p>
      {log && <>
        {!log.connected && <p className="c1-provider-notice" role="status">VoIP.ms is not connected. Only previously imported call records, if any, are displayed.</p>}
        {log.connected && owner && <form onSubmit={event => { event.preventDefault(); void sync(); }}>
          <label>Provider date (UTC)<input type="date" required max={new Date().toISOString().slice(0, 10)}
            value={day} onChange={event => setDay(event.target.value)} /></label>
          <button disabled={busy}>{busy ? "Importing…" : "Import call records"}</button>
        </form>}
        {log.calls.length === 0 ? <div className="c1-call-empty c1-card">
          <span className="c1-call-emblem"><PhoneIncoming aria-hidden="true" /></span>
          <div><h2>{query ? "No calls match these filters." : "No imported calls."}</h2><p>{log.connected ? "Call records will appear here after an authorized import." : "VoIP.ms is not connected."}</p></div>
        </div> : (
          <><p className="c1-call-page-count">Showing {log.calls.length} call records on this page.</p><ul className="c1-alert-list" aria-label="Imported calls">
            {log.calls.map(call => (
              <li key={call.provider_call_id} className="c1-card">
                <h2>{call.direction === "outgoing" ? call.dialed_phone ?? "Destination unavailable" : call.caller_phone ?? "Caller ID unavailable"}</h2>
                <p>{call.direction === "outgoing" ? "Outgoing" : "Incoming"}</p>
                <p>Business number {call.business_did}</p>
                <p><time dateTime={call.occurred_at}>{date(call.occurred_at)}</time> · {call.disposition}
                  {call.duration_seconds !== null && ` · ${call.duration_seconds} sec`}
                  {call.historical && " · Historical"}</p>
                {call.related_lead_id ? <Link to={`/admin/leads/${call.related_lead_id}`}>Open matching lead</Link> : <p>Unmatched caller</p>}
              </li>
            ))}
          </ul>{log.next && <Link className="c1-call-next" to={`?${next}`}>View older calls</Link>}</>
        )}
      </>}
    </div>
  );
}
