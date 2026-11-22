begin;
alter table public.crm_inbound_calls
  add column direction text not null default 'incoming' check (direction in ('incoming','outgoing')),
  add column dialed_phone text check (dialed_phone ~ '^\+[1-9][0-9]{7,14}$');
update public.crm_inbound_calls set dialed_phone = business_did;
create index crm_call_history_page on public.crm_inbound_calls(project_id, occurred_at desc, provider_call_id desc);
create index crm_customer_calls_page on public.crm_inbound_calls(project_id, related_lead_id, occurred_at desc, provider_call_id desc);
create or replace function public.crm_ingest_voip(p_calls jsonb, p_day date) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  inserted integer;
  project constant uuid := 'c1000000-0000-4000-8000-000000000001';
begin
  if p_day is null or jsonb_typeof(p_calls) is distinct from 'array' or jsonb_array_length(p_calls) > 100000 then
    raise exception 'invalid CDR batch' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_array_elements(p_calls) as item
    where ((item->>'occurred_at')::timestamptz at time zone 'UTC')::date is distinct from p_day) then
    raise exception 'CDR timestamp outside batch day' using errcode = '22023';
  end if;

  insert into crm_inbound_calls (project_id, provider_call_id, occurred_at, caller_phone,
    direction, dialed_phone, business_did, disposition, duration_seconds, historical, related_lead_id)
  select project, c.provider_call_id, c.occurred_at, c.caller_phone,
    coalesce(c.direction, 'incoming'), case when coalesce(c.direction,'incoming') = 'incoming'
      then c.business_did else c.dialed_phone end, c.business_did,
    c.disposition, c.duration_seconds, c.historical,
    (select (array_agg(l.id))[1] from crm_leads l
      cross join lateral (select regexp_replace(l.phone, '[^0-9]', '', 'g') as digits) n
      where l.project_id = project and not l.historical
        and l.phone ~ '^\+?[0-9 ().-]+$'
        and case
          when l.phone like '+%' then '+' || n.digits
          when length(n.digits) = 10 then '+1' || n.digits
          when n.digits ~ '^1[0-9]{10}$' then '+' || n.digits
        end = case when c.direction = 'outgoing' then c.dialed_phone else c.caller_phone end
      having count(*) = 1)
  from jsonb_to_recordset(p_calls) as c(provider_call_id text, occurred_at timestamptz,
    caller_phone text, direction text, dialed_phone text, business_did text, disposition text, duration_seconds integer, historical boolean)
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
