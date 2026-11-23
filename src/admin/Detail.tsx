import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { api, date, dial, type Lead, type Activity } from "./api";
export default function Detail({ updated }: { updated: () => void }) {
  const { id } = useParams();
  const [data, setData] = useState<{ lead: Lead; events: Activity[] } | null>(
    null,
  );
  const [note, setNote] = useState(""),
    [action, setAction] = useState("note"),
    [follow, setFollow] = useState("");
  const [key, setKey] = useState(() => crypto.randomUUID());
  const [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  const load = useCallback(
    () => api<{ lead: Lead; events: Activity[] }>(`leads/${id}`).then(setData),
    [id],
  );
  useEffect(() => {
    setData(null);
    setLoading(true);
    setNotice("");
    void load().catch((e) => setNotice(e.message)).finally(() => setLoading(false));
  }, [load]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!data) return;
    setBusy(true);
    setNotice("");
    try {
      await api(`leads/${id}`, {
        action,
        note,
        follow_up_at:
          action === "schedule" ? new Date(follow).toISOString() : null,
        version: data.lead.version,
        request_key: key,
      });
      await load();
      updated();
      setKey(crypto.randomUUID());
      setNote("");
      setNotice("Saved.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const l = data?.lead,
    phone = l && dial(l.phone);
  return (
    <section>
      <div className="c1-detail-toolbar"><Link to="/admin/queue">Back to queue</Link><Link to="/admin/history">View history</Link></div>
      {loading && <p role="status">Loading customer record…</p>}
      {notice && <p role="status">{notice}</p>}
      <button
        disabled={busy}
        onClick={() => void load().catch((e) => setNotice(e.message))}
      >
        Refresh record
      </button>
      {l && (
        <>
          <header className="c1-detail-heading c1-card">
            <div>
              <p>
                {l.historical ? "Imported History" : l.urgency} · {l.source}
              </p>
              <h1>{l.name}</h1>
              <Link to={`/admin/calls?lead=${l.id}`}>Customer call history</Link>
              <p>
                {l.service} · {l.area || "Area not supplied"}
              </p>
            </div>
            {phone ? (
              <a className="c1-primary" href={phone}>
                Call {l.phone}
              </a>
            ) : (
              <p>No valid callback number supplied</p>
            )}
          </header>
          <dl className="c1-detail-facts c1-card">
            <dt>Received</dt>
            <dd>{date(l.created_at)}</dd>
            <dt>Status</dt>
            <dd>{l.status}</dd>
            <dt>Follow up</dt>
            <dd>{l.follow_up_at ? date(l.follow_up_at) : "Not scheduled"}</dd>
            <dt>Email</dt>
            <dd>{l.email || "Not supplied"}</dd>
          </dl>
          <section className="c1-card c1-detail-message"><h2>Customer request</h2><p className="c1-message">{l.message || "No additional message supplied."}</p></section>
          {l.source === "chat" && (
            <section className="c1-card">
              <h2>Conversation · {l.conversation_state}</h2>
              {l.conversation.map((line, i) => (
                <p key={i}>
                  <strong>{line.role}:</strong> {line.text}
                </p>
              ))}
            </section>
          )}
          <form className="c1-card c1-detail-form" onSubmit={(e) => void submit(e)}>
            <h2>Log a result or follow up</h2>
            <label>
              Next action
              <select
                value={action}
                onChange={(e) => {
                  setAction(e.target.value);
                  setKey(crypto.randomUUID());
                }}
              >
                {[
                  "note",
                  "answered",
                  "unanswered",
                  "voicemail",
                  "callback_completed",
                  "booked",
                  "closed",
                  "schedule",
                  ...(l.source === "chat" ? ["claim", "return_to_bot"] : []),
                ].map((a) => (
                  <option key={a} value={a}>
                    {a.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
            {action === "schedule" && (
              <label>
                Follow up time (
                {Intl.DateTimeFormat().resolvedOptions().timeZone})
                <input
                  type="datetime-local"
                  required
                  value={follow}
                  onChange={(e) => setFollow(e.target.value)}
                />
              </label>
            )}
            <label>
              Private note
              <textarea
                maxLength={4000}
                required={action === "note"}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <p>
              Answered calls do not imply a booking. Record completed callbacks
              and booked jobs explicitly.
            </p>
            <button disabled={busy}>{busy ? "Saving…" : "Save result"}</button>
          </form>
          <section className="c1-card c1-detail-activity"><h2>Activity timeline</h2>
          {!data.events.length && <p>No activity recorded yet.</p>}
          <ol className="c1-activity">
            {data.events.map((e) => (
              <li key={e.id}>
                <strong>{e.kind.replace(/_/g, " ")}</strong> ·{" "}
                {date(e.happened_at)}
                {e.note && <p>{e.note}</p>}
              </li>
            ))}
          </ol></section>
        </>
      )}
    </section>
  );
}
