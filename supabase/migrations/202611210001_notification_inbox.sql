begin;

-- Queue, inbox and installed badges share the existing definition of attention.
create function public.crm_needs_attention(is_historical boolean, lead_status text, due_at timestamptz)
returns boolean language sql stable set search_path = public, pg_temp as $$
  select not is_historical and (
    lead_status = 'new' or
    (lead_status in ('callback', 'scheduled') and (due_at is null or due_at <= now()))
  )
$$;

create or replace function public.crm_attention_count()
returns integer language sql stable security definer set search_path = public, pg_temp as $$
  select count(*)::integer from crm_leads
  where crm_role() is not null and crm_needs_attention(historical, status, follow_up_at)
$$;

create function public.crm_notification_inbox(p_offset integer default 0)
returns jsonb language plpgsql stable security invoker set search_path = public, pg_temp as $$
begin
  if crm_role() is null then raise exception 'forbidden' using errcode = '42501'; end if;

  return jsonb_build_object(
    'attention', crm_attention_count(),
    'active', coalesce((
      select jsonb_agg(to_jsonb(alert) order by alert.urgent desc, alert.occurred_at desc, alert.id)
      from (
        select l.id, l.id as lead_id, l.name, l.urgency = 'urgent' as urgent,
          case when l.status = 'new' then 'inquiry' else 'follow_up' end as category,
          case
            when l.status <> 'new' then 'Follow-up due'
            when l.source = 'chat' then 'New chat handoff'
            else 'New inquiry'
          end as title,
          coalesce(l.follow_up_at, l.created_at) as occurred_at
        from crm_leads l
        where crm_needs_attention(l.historical, l.status, l.follow_up_at)
      ) alert
    ), '[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(to_jsonb(activity) order by activity.occurred_at desc, activity.id desc)
      from (
        select e.id, l.id as lead_id, l.name, false as urgent,
          case when e.actor_id is null then 'inquiry' else 'staff' end as category,
          case when e.kind = 'inquiry_confirmed' then 'Inquiry received' else initcap(replace(e.kind, '_', ' ')) end as title, e.happened_at as occurred_at
        from crm_events e join crm_leads l on l.id = e.lead_id
        where not l.historical and (
          e.actor_id is not null or
          (e.kind = 'inquiry_confirmed' and not crm_needs_attention(l.historical, l.status, l.follow_up_at))
        )
        order by e.happened_at desc, e.id desc
        limit 50 offset greatest(coalesce(p_offset, 0), 0)
      ) activity
    ), '[]'::jsonb)
  );
end
$$;

revoke all on function public.crm_needs_attention(boolean,text,timestamptz),
  public.crm_notification_inbox(integer) from public, anon;
grant execute on function public.crm_needs_attention(boolean,text,timestamptz),
  public.crm_notification_inbox(integer) to authenticated;
commit;
