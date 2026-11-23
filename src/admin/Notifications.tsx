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
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [older, setOlder] = useState<AlertItem[]>([]);
  const [offset, setOffset] = useState(50);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [categoryCounts, setCategoryCounts] = useState(false);
  const [pageError, setPageError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const history = filter === "History" || filter === "Staff activity";
  const active = inbox?.active ?? [];
  const rows = history
    ? Array.from(new Map([...(inbox?.history ?? []), ...older].map(row => [row.id, row])).values())
        .filter(row => filter === "History" || row.category === "staff")
    : active.filter(row => filter === "Active" || (filter === "Urgent" && row.urgent) ||
      (filter === "Inquiries" && row.category === "inquiry") ||
      (filter === "Follow-ups" && row.category === "follow_up"));

  const filteredRows = rows.filter(row => (!urgentOnly || row.urgent) && [row.title, row.name, row.category].some(value => value.toLowerCase().includes(search.trim().toLowerCase()))).sort((a,b) => sort === "newest" ? Date.parse(b.occurred_at) - Date.parse(a.occurred_at) : Date.parse(a.occurred_at) - Date.parse(b.occurred_at));
  const canLoadOlder = history && hasMore && inbox?.history.length === 50;
  const counts = { Active: inbox?.attention ?? 0, Urgent: active.filter(row => row.urgent).length, Inquiries: active.filter(row => row.category === "inquiry").length, "Follow-ups": active.filter(row => row.category === "follow_up").length, "Staff activity": (inbox?.history ?? []).filter(row => row.category === "staff").length + older.filter(row => row.category === "staff").length, History: (inbox?.history ?? []).length + older.length };
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
        <button type="button" onClick={refresh}>Refresh notifications</button>
      </div>
      <button type="button" className="c1-secondary-action" aria-expanded={categoryCounts} onClick={() => setCategoryCounts(value => !value)}>{categoryCounts ? "Hide category summary" : "Show category summary"}</button>
      {categoryCounts && <p className="c1-card c1-inbox-summary">Urgent {counts.Urgent}, Inquiries {counts.Inquiries}, Follow ups {counts["Follow-ups"]}, Staff updates {counts["Staff activity"]} loaded.</p>}
      <div className="c1-inbox-filters" role="group" aria-label="Filter notifications">
        {filters.map(label => (
          <button key={label} type="button" aria-pressed={filter === label} onClick={() => setFilter(label)}>
            {label}{inbox ? ` (${counts[label]})` : ""}
          </button>
        ))}
      </div>
      <label className="c1-inbox-search">Search notifications<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name or activity" /></label>
      <label className="c1-inbox-search">Sort notifications<select value={sort} onChange={event => setSort(event.target.value as "newest" | "oldest")}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
      {error && <p role="alert">{error}</p>}
      {pageError && <p role="alert">{pageError}</p>}
      {!inbox && !error && <p role="status">Loading notifications…</p>}
      {inbox && !filteredRows.length && <p className="c1-card" role="status">{search ? "No notifications match your search in the loaded records." : emptyMessage}</p>}
      {inbox && <p className="c1-inbox-summary" role="status">Showing {Math.min(pageSize, filteredRows.length)} of {filteredRows.length} notifications{search ? " matching your search" : ""}.</p>}
      <label className="c1-inbox-urgent-toggle"><input type="checkbox" checked={urgentOnly} onChange={event => setUrgentOnly(event.target.checked)} /> Urgent only</label>
      {(search || urgentOnly) && <button type="button" className="c1-secondary-action" onClick={() => { setSearch(""); setUrgentOnly(false); }}>Clear notification filters</button>}
      {filter === "History" && inbox && <button type="button" className="c1-secondary-action" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? "Hide history explanation" : "About notification history"}</button>}
      {expanded && filter === "History" && <p className="c1-card">Notification history records previously handled activity. Active attention counts are tracked separately.</p>}
      {filteredRows.length > pageSize && <button type="button" className="c1-secondary-action" onClick={() => setPageSize(value => value + 25)}>Show more loaded notifications ({filteredRows.length - pageSize} remaining)</button>}
      <ul className="c1-alert-list">
        {filteredRows.slice(0, pageSize).map(row => {
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
