import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, date } from "./api";

type Call = {
  provider_call_id: string;
  occurred_at: string;
  caller_phone: string | null;
  disposition: string;
  duration_seconds: number | null;
  historical: boolean;
  related_lead_id: string | null;
};
type CallLog = { connected: boolean; calls: Call[] };

export default function Calls({ owner }: { owner: boolean }) {
  const [log, setLog] = useState<CallLog | null>(null);
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const refresh = useCallback(async () => setLog(await api<CallLog>("calls")), []);
  useEffect(() => {
    void refresh().catch(cause => setError(cause.message));
  }, [refresh]);

  async function sync() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await api<{ inserted: number; duplicates: number }>("calls/sync", { day });
      setMessage(`Imported ${result.inserted} calls. ${result.duplicates} already recorded.`);
      await refresh();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h1>Incoming calls</h1>
      <p>VoIP.ms call records. The provider's disposition describes the phone connection.</p>
      {error && <p role="alert">{error}</p>}
      <p role="status">{message || (!log && !error ? "Loading call records…" : "")}</p>
      {log && <>
        {!log.connected && <p>VoIP.ms is not connected.</p>}
        {log.connected && owner && <form onSubmit={event => { event.preventDefault(); void sync(); }}>
          <label>Provider date (UTC)<input type="date" required max={new Date().toISOString().slice(0, 10)}
            value={day} onChange={event => setDay(event.target.value)} /></label>
          <button disabled={busy}>{busy ? "Importing…" : "Import call records"}</button>
        </form>}
        {log.calls.length === 0 ? <p>No imported calls.</p> : (
          <ul className="c1-alert-list" aria-label="Latest 100 imported calls">
            {log.calls.map(call => (
              <li key={call.provider_call_id} className="c1-card">
                <h2>{call.caller_phone ?? "Caller ID unavailable"}</h2>
                <p><time dateTime={call.occurred_at}>{date(call.occurred_at)}</time> · {call.disposition}
                  {call.duration_seconds !== null && ` · ${call.duration_seconds} sec`}
                  {call.historical && " · Historical"}</p>
                {call.related_lead_id && <Link to={`/admin/leads/${call.related_lead_id}`}>Open matching lead</Link>}
              </li>
            ))}
          </ul>
        )}
      </>}
    </section>
  );
}
