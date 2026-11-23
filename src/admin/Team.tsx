import { useEffect, useState, type FormEvent } from "react";
import { api } from "./api";
type Member = {user_id:string; email:string; role:string};
export default function Team() {
  const [members,setMembers] = useState<Member[]>([]);
  const [notice,setNotice] = useState("");
  const [busy,setBusy] = useState(false);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState("");
  const [sort,setSort] = useState<"email" | "role">("email");
  const [refreshing,setRefreshing] = useState(false);
  const refreshTeam = async () => { setRefreshing(true); setNotice(""); try { await load(); } catch(e) { setNotice((e as Error).message); } finally { setRefreshing(false); } };
  const load = () => api<Member[]>("team").then(setMembers);
  useEffect(()=>{void load().catch(e=>setNotice(e.message)).finally(()=>setLoading(false));},[]);
  const save = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const form=e.currentTarget;
    const data=new FormData(form);
    const remove=data.get("action")==="remove";
    if (!window.confirm(`${remove ? "Remove C1 access for" : "Save C1 access for"} ${data.get("email")}?`)) return;
    setBusy(true);setNotice("");
    try { setMembers(await api<Member[]>("team",{email:data.get("email"),role:data.get("role"),remove}));setNotice("C1 access updated. Customer records were preserved.");form.reset(); }
    catch(e){setNotice((e as Error).message);} finally{setBusy(false);}
  };
  const visible = members.filter(m => `${m.email} ${m.role}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort === "role" ? a.role.localeCompare(b.role) || a.email.localeCompare(b.email) : a.email.localeCompare(b.email));
  return <section className="c1-card c1-team"><h2>Staff management</h2>
    <p>Josh alone manages access. Auth accounts must first be created privately in Supabase. The owner account cannot be removed or reassigned here.</p>
    <button type="button" className="c1-secondary-action" disabled={busy || refreshing} onClick={() => void refreshTeam()}>{refreshing ? "Refreshing staff…" : "Refresh staff list"}</button>
    <label>Search team members<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Email or role" /></label>
    <label>Sort members<select value={sort} onChange={e=>setSort(e.target.value as "email" | "role")}><option value="email">Email</option><option value="role">Access role</option></select></label>
    {loading && <p role="status">Loading staff access…</p>}
    {!loading && !visible.length && <p role="status">{search ? "No members match this search." : "No staff members are currently listed."}</p>}
    <ul className="c1-team-list">{visible.map(m=><li key={m.user_id}><span>{m.email}</span><span className="c1-team-role">{m.role}</span></li>)}</ul>
    <form onSubmit={e=>void save(e)} aria-label="Manage team access">
      <label>Existing account email<input name="email" type="email" required maxLength={254}/></label>
      <label>Access role<select name="role"><option value="staff">Staff</option><option value="client">Client</option></select></label>
      <label>Action<select name="action"><option value="save">Add or update access</option><option value="remove">Remove C1 access</option></select></label>
      <button disabled={busy}>{busy ? "Saving…" : "Apply access change"}</button>
    </form>{notice && <p role="status">{notice}</p>}
  </section>;
}
