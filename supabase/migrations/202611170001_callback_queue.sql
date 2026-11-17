-- C1 only. No customer data or account credentials belong in migrations.
begin;
create extension if not exists pgcrypto;
create table public.crm_projects (
 id uuid primary key, slug text not null unique
);
insert into public.crm_projects values ('c1000000-0000-4000-8000-000000000001','aksarbenlocksmiths');
create table public.crm_memberships (
 project_id uuid not null references public.crm_projects, user_id uuid not null references auth.users on delete cascade,
 role text not null check (role in ('josh_admin','staff','client')), primary key(project_id,user_id)
);
create unique index crm_single_josh_admin on public.crm_memberships(project_id) where role='josh_admin';
create function public.crm_role() returns text language sql stable security definer set search_path=public,pg_temp as $$
 select role from crm_memberships where project_id='c1000000-0000-4000-8000-000000000001' and user_id=auth.uid()
$$;
create table public.crm_leads (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.crm_projects,
 source text not null check (source in ('netlify','chat','manual')), provider_id text not null, provider_submission_id text,
 created_at timestamptz not null, received_at timestamptz not null default now(),
 name text not null, email text not null default '', phone text not null default '', service text not null,
 area text not null default '', urgency text not null check (urgency in ('urgent','scheduled','quote')),
 message text not null default '', historical boolean not null default false,
 status text not null check(status in ('new','callback','scheduled','booked','closed','history')),
 follow_up_at timestamptz, assigned_to uuid references auth.users, version integer not null default 1,
 conversation jsonb not null default '[]', conversation_state text not null default 'bot' check(conversation_state in ('bot','waiting','claimed','returned')),
 unique(project_id,source,provider_id), unique(project_id,provider_submission_id),
 check (project_id='c1000000-0000-4000-8000-000000000001'),
 check(length(name) between 1 and 120 and length(phone)<=40 and length(email)<=254 and length(message)<=6000 and length(area)<=120)
);
create table public.crm_events (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.crm_projects,
 lead_id uuid not null references public.crm_leads, actor_id uuid references auth.users,
 kind text not null, note text not null default '' check(length(note)<=4000),
 happened_at timestamptz not null default now(), request_key text not null,
 unique(lead_id,request_key)
);
create table public.crm_preferences (
 user_id uuid primary key references auth.users on delete cascade,
 inquiries boolean not null default true, handoffs boolean not null default true, follow_ups boolean not null default true
);
create table public.crm_devices (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade,
 label text not null check(length(label) between 1 and 80), subscription jsonb not null,
 endpoint_hash text not null unique, refreshed_at timestamptz not null default now()
);
create table public.crm_outbox (
 id uuid primary key default gen_random_uuid(), lead_id uuid references public.crm_leads,
 kind text not null check(kind in ('inquiry','handoff','follow_up','test')),
 dedupe_key text not null unique, target_device uuid references public.crm_devices on delete cascade,
 created_at timestamptz not null default now(), lease_owner uuid, lease_until timestamptz, processed_at timestamptz
);
create table public.crm_deliveries (
 outbox_id uuid not null references public.crm_outbox on delete cascade, device_id uuid not null references public.crm_devices on delete cascade,
 state text not null check(state in ('accepted','failed')), confirmed_at timestamptz,
 primary key(outbox_id,device_id)
);
create table public.crm_sync_state (
 name text primary key, watermark timestamptz not null, updated_at timestamptz not null default now()
);
create index crm_queue on public.crm_leads(status,follow_up_at) where not historical;
create unique index crm_booked_once on public.crm_events(lead_id,kind) where kind='booked';
create index crm_event_date on public.crm_events(happened_at,kind);

alter table public.crm_projects enable row level security;
alter table public.crm_memberships enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_events enable row level security;
alter table public.crm_preferences enable row level security;
alter table public.crm_devices enable row level security;
alter table public.crm_outbox enable row level security;
alter table public.crm_deliveries enable row level security;
alter table public.crm_sync_state enable row level security;
create policy project_read on public.crm_projects for select to authenticated using(id='c1000000-0000-4000-8000-000000000001' and crm_role() is not null);
create policy membership_self on public.crm_memberships for select to authenticated using(user_id=auth.uid() and project_id='c1000000-0000-4000-8000-000000000001');
create policy leads_read on public.crm_leads for select to authenticated using(crm_role() is not null and project_id='c1000000-0000-4000-8000-000000000001');
create policy events_read on public.crm_events for select to authenticated using(crm_role() is not null and project_id='c1000000-0000-4000-8000-000000000001');
create policy prefs_self on public.crm_preferences for all to authenticated using(user_id=auth.uid() and crm_role() is not null) with check(user_id=auth.uid() and crm_role() is not null);
create policy devices_self on public.crm_devices for all to authenticated using(user_id=auth.uid() and crm_role() is not null) with check(user_id=auth.uid() and crm_role() is not null);
create policy receipts_self on public.crm_deliveries for select to authenticated using(exists(select 1 from crm_devices d where d.id=device_id and d.user_id=auth.uid()));
-- No browser write grants for lead, event, membership, sync or outbox tables.
grant select on public.crm_projects,public.crm_memberships,public.crm_leads,public.crm_events,public.crm_deliveries to authenticated;
grant select,insert,update,delete on public.crm_preferences,public.crm_devices to authenticated;
grant all on all tables in schema public to service_role;

create function public.crm_attention_count() returns integer language sql stable security definer set search_path=public,pg_temp as $$
 select count(*)::integer from crm_leads where crm_role() is not null and not historical and
 (status='new' or (status in ('callback','scheduled') and follow_up_at<=now()))
$$;
create function public.crm_snapshot(p_from timestamptz default null,p_to timestamptz default null,p_service text default null)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if crm_role() is null then raise exception 'forbidden' using errcode='42501'; end if;
 return jsonb_build_object('attention',crm_attention_count(), 'leads',coalesce((select jsonb_agg(to_jsonb(l) order by l.historical,l.urgency='urgent' desc,l.follow_up_at nulls last,l.created_at desc)
 from crm_leads l where (p_from is null or l.created_at>=p_from) and (p_to is null or l.created_at<p_to) and (p_service is null or l.service=p_service)), '[]'),
 'metrics',coalesce((select jsonb_object_agg(kind,n) from (select e.kind,count(*) n from crm_events e join crm_leads l on l.id=e.lead_id where not l.historical and (p_from is null or e.happened_at>=p_from) and (p_to is null or e.happened_at<p_to) and (p_service is null or l.service=p_service) group by e.kind) totals),'{}'));
end $$;

-- Service-only, transactional ingestion. A replay never reopens a worked lead or alerts twice.
create function public.crm_ingest(p_records jsonb,p_history boolean default false) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare r jsonb; lead uuid; inserted integer:=0; duplicates integer:=0;
begin
 if jsonb_typeof(p_records)<>'array' or jsonb_array_length(p_records)>500 then raise exception 'invalid_batch'; end if;
 for r in select value from jsonb_array_elements(p_records) loop
  if nullif(r->>'provider_id','') is null or nullif(r->>'name','') is null or nullif(r->>'service','') is null or r->>'created_at' is null then raise exception 'invalid_record'; end if;
  insert into crm_leads(project_id,source,provider_id,provider_submission_id,created_at,name,email,phone,service,area,urgency,message,historical,status,conversation,conversation_state)
  values('c1000000-0000-4000-8000-000000000001',r->>'source',r->>'provider_id',r->>'provider_submission_id',(r->>'created_at')::timestamptz,r->>'name',coalesce(r->>'email',''),coalesce(r->>'phone',''),r->>'service',coalesce(r->>'area',''),r->>'urgency',coalesce(r->>'message',''),p_history,case when p_history then 'history' else 'new' end,coalesce(r->'conversation','[]'),case when r->>'source'='chat' then 'waiting' else 'bot' end)
  on conflict do nothing returning id into lead;
  if lead is null then duplicates:=duplicates+1; else
   inserted:=inserted+1;
   insert into crm_events(project_id,lead_id,kind,happened_at,request_key) values('c1000000-0000-4000-8000-000000000001',lead,case when p_history then 'history_imported' else 'inquiry_confirmed' end,(r->>'created_at')::timestamptz,'ingest');
   if not p_history then insert into crm_outbox(lead_id,kind,dedupe_key) values(lead,case when r->>'source'='chat' then 'handoff' else 'inquiry' end,'intake:'||lead); end if;
  end if;
 end loop;
 return jsonb_build_object('inserted',inserted,'duplicates',duplicates);
end $$;

create function public.crm_work(p_id uuid,p_action text,p_note text,p_follow_up timestamptz,p_version integer,p_key text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare l crm_leads; next_status text;
begin
 if crm_role() is null then raise exception 'forbidden' using errcode='42501'; end if;
 select * into l from crm_leads where id=p_id for update;
 if not found then raise exception 'not_found' using errcode='P0002'; end if;
 if exists(select 1 from crm_events where lead_id=p_id and request_key=p_key) then return to_jsonb(l); end if;
 if p_key is null or length(p_key)<8 or length(p_key)>100 then raise exception 'invalid_request_key'; end if;
 if l.version<>p_version then raise exception 'stale_version' using errcode='40001'; end if;
 if p_action='booked' and exists(select 1 from crm_events where lead_id=p_id and kind='booked') then return to_jsonb(l); end if;
 if p_action not in ('note','answered','unanswered','voicemail','callback_completed','booked','closed','schedule','claim','return_to_bot') then raise exception 'invalid_action'; end if;
 if p_action='note' and length(trim(coalesce(p_note,'')))=0 then raise exception 'note_required'; end if;
 if p_action='schedule' and (p_follow_up is null or p_follow_up<=now()) then raise exception 'future_follow_up_required'; end if;
 if p_action in ('claim','return_to_bot') and l.source<>'chat' then raise exception 'not_a_conversation'; end if;
 if p_action='claim' and l.assigned_to is not null and l.assigned_to<>auth.uid() then raise exception 'already_claimed' using errcode='40001'; end if;
 if p_action='return_to_bot' and l.assigned_to is distinct from auth.uid() and crm_role()<>'josh_admin' then raise exception 'forbidden' using errcode='42501'; end if;
 next_status:=case p_action when 'booked' then 'booked' when 'closed' then 'closed' when 'schedule' then 'scheduled' when 'unanswered' then 'callback' when 'voicemail' then 'callback' when 'callback_completed' then 'closed' else l.status end;
 update crm_leads set status=next_status, follow_up_at=case when p_action='schedule' then p_follow_up when p_action in ('booked','closed','callback_completed') then null else follow_up_at end,
 assigned_to=case when p_action='claim' then auth.uid() when p_action='return_to_bot' then null else assigned_to end,
 conversation_state=case when p_action='claim' then 'claimed' when p_action='return_to_bot' then 'returned' else conversation_state end,
 version=version+1 where id=p_id returning * into l;
 insert into crm_events(project_id,lead_id,actor_id,kind,note,request_key) values(l.project_id,l.id,auth.uid(),p_action,coalesce(p_note,''),p_key);
 return to_jsonb(l);
end $$;

create function public.crm_enqueue_follow_ups() returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare n integer;
begin
 insert into crm_outbox(lead_id,kind,dedupe_key)
 select id,'follow_up','follow:'||id||':'||follow_up_at from crm_leads where not historical and status in ('callback','scheduled') and follow_up_at<=now() on conflict(dedupe_key) do nothing;
 get diagnostics n=row_count; return n;
end $$;
create function public.crm_claim_outbox(p_owner uuid) returns setof public.crm_outbox language sql security definer set search_path=public,pg_temp as $$
 update crm_outbox set lease_owner=p_owner,lease_until=now()+interval '2 minutes' where id in (
  select id from crm_outbox where processed_at is null and (lease_until is null or lease_until<now()) order by created_at for update skip locked limit 25
 ) returning *
$$;
create function public.crm_confirm_receipt(p_outbox uuid,p_device uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if crm_role() is null then raise exception 'forbidden' using errcode='42501'; end if;
 update crm_deliveries set confirmed_at=now() where outbox_id=p_outbox and device_id=p_device and exists(select 1 from crm_devices d where d.id=p_device and d.user_id=auth.uid());
 if not found then raise exception 'not_found' using errcode='P0002'; end if;
end $$;
-- Explicit grants: functions are never executable by PUBLIC/anon by default.
revoke all on function public.crm_role(),public.crm_attention_count(),public.crm_snapshot(timestamptz,timestamptz,text),public.crm_work(uuid,text,text,timestamptz,integer,text),public.crm_confirm_receipt(uuid,uuid),public.crm_ingest(jsonb,boolean),public.crm_enqueue_follow_ups(),public.crm_claim_outbox(uuid) from public,anon,authenticated;
grant execute on function public.crm_role(),public.crm_attention_count(),public.crm_snapshot(timestamptz,timestamptz,text),public.crm_work(uuid,text,text,timestamptz,integer,text),public.crm_confirm_receipt(uuid,uuid) to authenticated;
grant execute on function public.crm_ingest(jsonb,boolean),public.crm_enqueue_follow_ups(),public.crm_claim_outbox(uuid) to service_role;
commit;
