import { useState } from "react";
import { Bell, Clock, Inbox, ShieldAlert, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { api, date } from "./api";

export type AlertItem = {
  id: string;
  lead_id: string;
  name: string;
  title: string;
  category: "inquiry" | "follow_up" | "staff";
  urgent: boolean;
  occurred_at: string;
};
export type InboxData = { attention: number; active: AlertItem[]; history: AlertItem[] };

const filters = ["Active", "Urgent", "Inquiries", "Follow-ups", "Staff activity", "History"] as const;
const icons = { inquiry: Inbox, follow_up: Clock, staff: Users };

export default function Notifications({ inbox, error, refresh }: {
  inbox: InboxData | null; error: string; refresh: () => void;
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Active");
  const [search, setSearch] = useState("");
  const [older, setOlder] = useState<AlertItem[]>([]);
  const [offset, setOffset] = useState(50);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const history = filter === "History" || filter === "Staff activity";
  const active = inbox?.active ?? [];
  const rows = history
    ? Array.from(new Map([...(inbox?.history ?? []), ...older].map(row => [row.id, row])).values())
        .filter(row => filter === "History" || row.category === "staff")
    : active.filter(row => filter === "Active" || (filter === "Urgent" && row.urgent) ||
      (filter === "Inquiries" && row.category === "inquiry") ||
      (filter === "Follow-ups" && row.category === "follow_up"));

  const filteredRows = rows.filter(row => [row.title, row.name, row.category].some(value => value.toLowerCase().includes(search.trim().toLowerCase())));
  const canLoadOlder = history && hasMore && inbox?.history.length === 50;
  const emptyMessage = {
    Active: "No customer work needs attention.",
    Urgent: "No urgent callbacks are waiting.",
    Inquiries: "No inquiries need attention.",
    "Follow-ups": "No follow-ups need attention.",
    "Staff activity": canLoadOlder ? "No staff updates in the activity loaded so far." : "No staff activity to show.",
    History: "No notification history yet.",
  }[filter];

  async function loadOlder() {
    setLoading(true);
    setPageError("");
    try {
      const page = await api<InboxData>(`notifications?offset=${offset}`);
      setOlder(previous => [...previous, ...page.history]);
      setOffset(previous => previous + 50);
      setHasMore(page.history.length === 50);
    } catch (cause) {
      setPageError((cause as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="c1-inbox">
      <div className="c1-inbox-heading">
        <div><h1><Bell aria-hidden="true" /> Notifications</h1>
        <p>Customer work stays active until you record its outcome.</p></div>
        <button onClick={refresh}>Refresh notifications</button>
      </div>
      <div className="c1-inbox-filters" role="group" aria-label="Filter notifications">
        {filters.map(label => (
          <button key={label} type="button" aria-pressed={filter === label} onClick={() => setFilter(label)}>
            {label}{label === "Active" && inbox ? ` (${inbox.attention})` : ""}
          </button>
        ))}
      </div>
      <label className="c1-inbox-search">Search notifications<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name or activity" /></label>
      {error && <p role="alert">{error}</p>}
      {pageError && <p role="alert">{pageError}</p>}
      {!inbox && !error && <p role="status">Loading notifications…</p>}
      {inbox && !filteredRows.length && <p className="c1-card" role="status">{search ? "No notifications match your search in the loaded records." : emptyMessage}</p>}
      <ul className="c1-alert-list">
        {filteredRows.map(row => {
          const Icon = row.urgent ? ShieldAlert : icons[row.category];
          return (
            <li key={row.id} className="c1-card c1-alert-card" data-category={row.urgent ? "urgent" : row.category}>
              <Icon aria-hidden="true" />
              <div>
                <h2>{row.title}</h2>
                <p>{row.name} · <time dateTime={row.occurred_at}>{date(row.occurred_at)}</time></p>
                {row.urgent && <strong>Urgent</strong>}
              </div>
              <Link to={`/admin/leads/${row.lead_id}`}>Open record<span className="c1-visually-hidden"> for {row.name}</span></Link>
            </li>
          );
        })}
      </ul>
      {canLoadOlder &&
        <button onClick={() => void loadOlder()} disabled={loading}>{loading ? "Loading…" : "Load older activity"}</button>}
    </section>
  );
}
