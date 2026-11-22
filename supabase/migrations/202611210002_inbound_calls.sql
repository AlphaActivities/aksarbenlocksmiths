begin;

create table public.crm_inbound_calls (
  project_id uuid not null references public.crm_projects,
  provider text not null default 'voip_ms' check (provider = 'voip_ms'),
  provider_call_id text not null check (provider_call_id ~ '^[[:alnum:]_.-]{1,100}$'),
  occurred_at timestamptz not null,
  caller_phone text check (caller_phone ~ '^\+[1-9][0-9]{7,14}$'),
  business_did text not null check (business_did ~ '^\+1[0-9]{10}$'),
  disposition text not null check (disposition ~ '^[A-Z][A-Z _-]{0,31}$'),
  duration_seconds integer check (duration_seconds >= 0),
  historical boolean not null,
  related_lead_id uuid references public.crm_leads on delete set null,
  primary key (project_id, provider, provider_call_id)
);

create index crm_inbound_calls_recent on public.crm_inbound_calls (project_id, occurred_at desc);
alter table public.crm_inbound_calls enable row level security;
revoke all on public.crm_inbound_calls from public, anon, authenticated;
grant select on public.crm_inbound_calls to authenticated;
create policy crm_read_inbound_calls on public.crm_inbound_calls for select to authenticated
  using (project_id = 'c1000000-0000-4000-8000-000000000001' and public.crm_role() is not null);

create function public.crm_ingest_voip(p_calls jsonb, p_day date) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  inserted integer;
  project constant uuid := 'c1000000-0000-4000-8000-000000000001';
begin
  if p_day is null or jsonb_typeof(p_calls) is distinct from 'array' or jsonb_array_length(p_calls) > 500 then
    raise exception 'invalid CDR batch' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_array_elements(p_calls) as item
    where ((item->>'occurred_at')::timestamptz at time zone 'UTC')::date is distinct from p_day) then
    raise exception 'CDR timestamp outside batch day' using errcode = '22023';
  end if;

  insert into crm_inbound_calls (project_id, provider_call_id, occurred_at, caller_phone,
    business_did, disposition, duration_seconds, historical, related_lead_id)
  select project, c.provider_call_id, c.occurred_at, c.caller_phone, c.business_did,
    c.disposition, c.duration_seconds, c.historical,
    (select (array_agg(l.id))[1] from crm_leads l
      cross join lateral (select regexp_replace(l.phone, '[^0-9]', '', 'g') as digits) n
      where l.project_id = project and not l.historical
        and l.phone ~ '^\+?[0-9 ().-]+$'
        and case
          when l.phone like '+%' then '+' || n.digits
          when length(n.digits) = 10 then '+1' || n.digits
          when n.digits ~ '^1[0-9]{10}$' then '+' || n.digits
        end = c.caller_phone
      having count(*) = 1)
  from jsonb_to_recordset(p_calls) as c(provider_call_id text, occurred_at timestamptz,
    caller_phone text, business_did text, disposition text, duration_seconds integer, historical boolean)
  on conflict (project_id, provider, provider_call_id) do nothing;
  get diagnostics inserted = row_count;
  insert into crm_sync_state(name, watermark) values ('voip_ms', p_day::timestamp at time zone 'UTC')
    on conflict (name) do update set watermark = greatest(crm_sync_state.watermark, excluded.watermark),
    updated_at = now();
  return jsonb_build_object('inserted', inserted, 'duplicates', jsonb_array_length(p_calls) - inserted);
end
$$;
revoke all on function public.crm_ingest_voip(jsonb, date) from public, anon, authenticated;
grant execute on function public.crm_ingest_voip(jsonb, date) to service_role;
commit;
