import { useEffect, useState, type FormEvent } from "react";
import { api } from "./api";
type Member = {user_id:string; email:string; role:string};
export default function Team() {
  const [members,setMembers] = useState<Member[]>([]);
  const [notice,setNotice] = useState("");
  const [busy,setBusy] = useState(false);
  const load = () => api<Member[]>("team").then(setMembers);
  useEffect(()=>{void load().catch(e=>setNotice(e.message));},[]);
  const save = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const form=e.currentTarget;
    const data=new FormData(form);
    const remove=data.get("action")==="remove";
    if (!window.confirm(`${remove ? "Remove C1 access for" : "Save C1 access for"} ${data.get("email")}?`)) return;
    setBusy(true);setNotice("");
    try { setMembers(await api<Member[]>("team",{email:data.get("email"),role:data.get("role"),remove}));setNotice("C1 access updated. Customer records were preserved.");form.reset(); }
    catch(e){setNotice((e as Error).message);} finally{setBusy(false);}
  };
  return <section className="c1-card"><h2>Staff management</h2>
    <p>Josh alone manages access. Auth accounts must first be created privately in Supabase. The owner account cannot be removed or reassigned here.</p>
    <ul>{members.map(m=><li key={m.user_id}>{m.email} · {m.role}</li>)}</ul>
    <form onSubmit={e=>void save(e)}>
      <label>Existing account email<input name="email" type="email" required maxLength={254}/></label>
      <label>Access role<select name="role"><option value="staff">Staff</option><option value="client">Client</option></select></label>
      <label>Action<select name="action"><option value="save">Add or update access</option><option value="remove">Remove C1 access</option></select></label>
      <button disabled={busy}>{busy ? "Saving…" : "Apply access change"}</button>
    </form><p role="status">{notice}</p>
  </section>;
}
