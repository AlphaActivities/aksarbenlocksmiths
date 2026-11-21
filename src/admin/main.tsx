import {
  StrictMode,
  useCallback,
  useEffect,
  useState,
  useRef,
  type FormEvent,
} from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Bell, LogOut, Phone } from "lucide-react";
import {
  api,
  age,
  date,
  updateBadge,
  type Session,
  type Snapshot,
  type Lead,
} from "./api";
import Settings from "./Settings";
import Detail from "./Detail";
import Entrance from "./Entrance";
import Recovery from "./Recovery";
import Team from "./Team";
import "./admin.css";
function Login({ signedIn }: { signedIn: () => void }) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("login", { email, password });
      setPassword("");
      signedIn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="c1-login">
      <img src="/images/shield-logo.webp" alt="Aksarben Locksmiths" />
      <h1>Private callback queue</h1>
      <p>Sign in with your individual staff account.</p>
      <form onSubmit={(e) => void submit(e)}>
        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <p role="alert">{error}</p>
        <button disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <p><Link to="/admin/reset-password">Forgot password?</Link></p>
      <a href="tel:+14025566715">
        <Phone size={18} /> Emergency: (402) 556-6715
      </a>
      <p>
        <Link to="/admin">Private sign in</Link> ·{" "}
        <a href="/">Public website</a>
      </p>
    </main>
  );
}
function Manual({ saved }: { saved: () => void }) {
  const [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [key, setKey] = useState(() => crypto.randomUUID());
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setNotice("");
    try {
      await api("manual", {
        ...Object.fromEntries(new FormData(form)),
        request_key: key,
      });
      form.reset();
      setKey(crypto.randomUUID());
      saved();
      setNotice("Callback saved.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <details className="c1-card">
      <summary>Add a callback manually</summary>
      <form onSubmit={(e) => void submit(e)}>
        <label>
          Name
          <input name="name" required maxLength={120} />
        </label>
        <label>
          Callback number
          <input
            name="phone"
            type="tel"
            required
            maxLength={40}
            pattern="[+0-9() .-]{7,40}"
          />
        </label>
        <label>
          Service
          <select name="service">
            {[
              "Residential",
              "Commercial",
              "Automotive",
              "Safe Services",
              "Other",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Area or ZIP
          <input name="area" required maxLength={120} />
        </label>
        <label>
          Category
          <select name="urgency">
            <option value="urgent">Emergency lockout</option>
            <option value="scheduled">Scheduled rekey / auto key work</option>
            <option value="quote">Quote request</option>
          </select>
        </label>
        <label>
          Details
          <textarea name="message" maxLength={6000} />
        </label>
        <p role="status">{notice}</p>
        <button disabled={busy}>Save callback</button>
      </form>
    </details>
  );
}
function Queue({
  data,
  history,
  refresh,
}: {
  data: Snapshot | null;
  history?: boolean;
  refresh: () => void;
}) {
  const leads = data?.leads.filter((l) =>
    history
      ? l.historical || ["closed", "booked"].includes(l.status)
      : !l.historical && !["closed", "booked"].includes(l.status),
  );
  const groups: { title: string; kind: string; rows: Lead[] }[] = history
    ? [{ title: "History", kind: "history", rows: leads || [] }]
    : [
        {
          title: "Urgent inquiries",
          kind: "urgent",
          rows: leads?.filter((l) => l.urgency === "urgent") || [],
        },
        {
          title: "Callbacks due",
          kind: "due",
          rows:
            leads?.filter(
              (l) =>
                l.urgency !== "urgent" &&
                (!l.follow_up_at || Date.parse(l.follow_up_at) <= Date.now()),
            ) || [],
        },
        {
          title: "Scheduled requests",
          kind: "scheduled",
          rows:
            leads?.filter(
              (l) =>
                l.urgency !== "urgent" &&
                l.follow_up_at &&
                Date.parse(l.follow_up_at) > Date.now(),
            ) || [],
        },
      ];
  return (
    <section>
      <h1>{history ? "History" : "Your callback queue"}</h1>
      <p>
        {history
          ? "Original submission dates. Historical imports never create new alerts or active counts."
          : "Emergency inquiries, callbacks due and scheduled work. Log the outcome after every call."}
      </p>
      {!history && <Manual saved={refresh} />}
      {!data ? (
        <p role="status">Loading the queue…</p>
      ) : (
        groups.map((group) => (
          <section className={`c1-queue-group c1-queue-${group.kind}`} key={group.title}>
            <h2 className="c1-queue-heading">
              {group.title}{" "}
              <span className="c1-queue-count">{group.rows.length}</span>
            </h2>
            {!group.rows.length && <p>No matching records.</p>}
            <div className="c1-grid">
              {group.rows.map((l) => (
                <Link
                  className={`c1-card c1-lead ${l.urgency}`}
                  key={l.id}
                  to={`/admin/leads/${l.id}`}
                >
                  <span className="c1-tag">
                    {l.urgency} · {l.source}
                  </span>
                  <h3>{l.service}</h3>
                  <p>
                    {l.name} · {l.area || "Area not supplied"}
                  </p>
                  <p>
                    {age(l.created_at)} ·{" "}
                    <time dateTime={l.created_at}>{date(l.created_at)}</time>
                  </p>
                  <p className={history ? undefined : "c1-queue-action"}>
                    {l.follow_up_at
                      ? `Follow up ${date(l.follow_up_at)}`
                      : l.status === "new"
                        ? "Next: review and call"
                        : `Next: ${l.status}`}
                  </p>
                  {l.source === "chat" && (
                    <p>Conversation: {l.conversation_state}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </section>
  );
}
function Reports({ data }: { data: Snapshot | null }) {
  return (
    <section>
      <h1>Reports</h1>
      <p>
        Date and service filters apply to confirmed events, not phone-tap
        intent. Historical imports are excluded.
      </p>
      <div className="c1-grid">
        {[
          ["inquiry_confirmed", "Confirmed inquiries"],
          ["callback_completed", "Callbacks completed"],
          ["booked", "Booked jobs"],
        ].map(([key, label]) => (
          <article className="c1-card" key={key}>
            <h2>{label}</h2>
            <strong className="c1-metric">{data?.metrics[key] ?? "—"}</strong>
          </article>
        ))}
      </div>
      <p>
        Website phone and email taps are intent signals in site analytics.
        Provider call records are not connected; VoIP.ms is deferred. An
        answered call is not counted as a booking.
      </p>
    </section>
  );
}
function Business() {
  const [result, setResult] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    void api<{ intake_enabled: boolean; push_enabled: boolean }>("business")
      .then((r) =>
        setResult(
          `Website sync ${r.intake_enabled ? "enabled" : "disabled"} · Push ${r.push_enabled ? "enabled" : "disabled"} · VoIP deferred`,
        ),
      )
      .catch((e) => setResult(e.message));
  }, []);
  return (
    <section>
      <h1>Business settings</h1>
      <p>C1 · Mike Aksarben Locksmiths</p>
      <p>
        Account roles and delivery switches are managed on the server. Never
        enter credentials into this dashboard.
      </p>
      <p role="status">{result}</p>
      <button
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void api<{ status: string; inserted?: number; duplicates?: number }>(
            "reconcile",
            {},
          )
            .then((r) =>
              setResult(
                `Sync ${r.status}. New: ${r.inserted ?? 0}; duplicates: ${r.duplicates ?? 0}.`,
              ),
            )
            .catch((e) => setResult(e.message))
            .finally(() => setBusy(false));
        }}
      >
        Reconcile website submissions
      </button>
      <Team />
    </section>
  );
}
export function App() {
  const location = useLocation();
  const isRecovery = location.pathname === "/admin/reset-password";
  const queueSequence = useRef(0);
  const [session, setSession] = useState<Session | null>(null),
    [checking, setChecking] = useState(true),
    [data, setData] = useState<Snapshot | null>(null),
    [error, setError] = useState("");
  const [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [service, setService] = useState("");
  const loadSession = useCallback(() => {
    setChecking(true);
    void api<Session>("session")
      .then(setSession)
      .catch((e) => {
        setSession(null);
        setError(e.message);
      })
      .finally(() => setChecking(false));
  }, []);
  const refresh = useCallback(() => {
    const sequence = ++queueSequence.current;
    const q = new URLSearchParams();
    if (from) q.set("from", new Date(`${from}T00:00:00`).toISOString());
    if (to) {
      const end = new Date(`${to}T00:00:00`);
      end.setDate(end.getDate() + 1);
      q.set("to", end.toISOString());
    }
    if (service) q.set("service", service);
    void api<Snapshot>(`queue?${q}`)
      .then((r) => {
        if (sequence !== queueSequence.current) return;
        setData(r);
        updateBadge(r.attention);
        setError("");
      })
      .catch((e) => {
        if (sequence === queueSequence.current) setError(e.message);
      });
  }, [from, to, service]);
  useEffect(() => {
    if (isRecovery) { setChecking(false); return; }
    loadSession();
    const logout = () => {
      queueSequence.current++;
      setSession(null);
      setData(null);
      updateBadge(0);
    };
    window.addEventListener("c1-signed-out", logout);
    return () => window.removeEventListener("c1-signed-out", logout);
  }, [loadSession, isRecovery]);
  useEffect(() => {
    if (!session) return;
    refresh();
    const timer = setInterval(refresh, 30000);
    const visible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", visible);
    navigator.serviceWorker?.addEventListener("message", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", visible);
      navigator.serviceWorker?.removeEventListener("message", refresh);
    };
  }, [session, refresh]);
  useEffect(() => {
    const feedback = (e: MouseEvent) => {
      if (
        e.detail &&
        (e.target as Element).closest(".c1-shell button,.c1-shell a") &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        navigator.vibrate?.(9);
    };
    document.addEventListener("click", feedback);
    return () => document.removeEventListener("click", feedback);
  }, []);
  useEffect(() => {
    document.title = "Aksarben | Private callback queue";
  }, [location.pathname]);
  if (location.pathname === "/admin/reset-password") return <Recovery />;
  if (checking)
    return (
      <main className="c1-login" role="status">
        <span className="c1-boot-mark">
          <img src="/images/shield-logo.webp" alt="Checking private access…" />
        </span>
      </main>
    );
  if (!session)
    return (
      <>
        <Login signedIn={loadSession} />
        {error && (
          <p className="c1-service-error" role="status">
            {error}
          </p>
        )}
      </>
    );
  return (
    <div className="c1-shell">
      <Entrance attention={data?.attention ?? null} />
      <a className="c1-skip" href="#c1-content">
        Skip to queue
      </a>
      <aside>
        <Link className="c1-brand" to="/admin">
          <span data-brand-target>
            <img src="/images/shield-logo.webp" alt="Aksarben Locksmiths" />
          </span>
          <strong>Callback queue</strong>
        </Link>
        <nav aria-label="Private dashboard">
          <NavLink end to="/admin">
            Queue
          </NavLink>
          <NavLink to="/admin/history">History</NavLink>
          <NavLink to="/admin/reports">Reports</NavLink>
          <NavLink to="/admin/settings">My Settings</NavLink>
          {session.role === "josh_admin" && (
            <NavLink to="/admin/business">Admin</NavLink>
          )}
        </nav>
        <p>{session.email}</p>
        <button
          onClick={() =>
            void api("logout", {})
              .then(() => {
                updateBadge(0);
                window.location.replace("/admin");
              })
              .catch((e) => setError(e.message))
          }
        >
          <LogOut size={18} /> Sign out
        </button>
      </aside>
      <div className="c1-workspace">
        <header className="c1-top">
          <p>C1 · Aksarben Locksmiths</p>
          {data && data.attention > 0 ? (
            <Link
              to="/admin"
              aria-label={`${data.attention} pending attention items`}
            >
              <Bell size={20} /> {data.attention}
            </Link>
          ) : (
            <span className="c1-muted">
              {data ? "All caught up" : "Checking attention…"}
            </span>
          )}
        </header>
        <main id="c1-content">
          <p role="alert">{error}</p>
          {["/admin", "/admin/", "/admin/history", "/admin/reports"].includes(
            location.pathname,
          ) && (
            <div className="c1-filters">
              <label>
                From
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </label>
              <label>
                Through
                <input
                  type="date"
                  value={to}
                  min={from}
                  onChange={(e) => setTo(e.target.value)}
                />
              </label>
              <label>
                Service
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  <option value="">All services</option>
                  {[
                    "Residential",
                    "Commercial",
                    "Automotive",
                    "Safe Services",
                    "Other",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <button onClick={refresh}>Refresh queue</button>
            </div>
          )}
          <Routes>
            <Route
              path="/admin"
              element={<Queue data={data} refresh={refresh} />}
            />
            <Route
              path="/admin/history"
              element={<Queue data={data} history refresh={refresh} />}
            />
            <Route path="/admin/reports" element={<Reports data={data} />} />
            <Route
              path="/admin/leads/:id"
              element={<Detail updated={refresh} />}
            />
            <Route path="/admin/settings" element={<Settings />} />
            <Route
              path="/admin/business"
              element={
                session.role === "josh_admin" ? (
                  <Business />
                ) : (
                  <p role="alert">
                    Business settings require Josh’s admin account.
                  </p>
                )
              }
            />
            <Route
              path="*"
              element={
                <section>
                  <h1>Record not found</h1>
                  <Link to="/admin">Return to queue</Link>
                </section>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
if ("serviceWorker" in navigator)
  void navigator.serviceWorker
    .register("/admin/sw.js", { scope: "/admin" })
    .catch(() => undefined);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
