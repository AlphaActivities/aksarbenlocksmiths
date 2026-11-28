create role alpha_v2_runner nologin noinherit;
grant usage on schema engine_v2 to alpha_v2_runner;

create table engine_v2.runner_queue (
  request_id text primary key check (request_id ~ '^[a-f0-9]{64}$'),
  client text not null check (client in ('mike','juan','missy','darcy')),
  source_sha text not null check (source_sha ~ '^[a-f0-9]{40}$'),
  status text not null default 'queued' check (status in ('queued','running','verified','failed')),
  attempts integer not null default 0 check (attempts between 0 and 3),
  lease uuid,
  lease_expires timestamptz,
  result_sha text check (result_sha ~ '^[a-f0-9]{40}$'),
  updated_at timestamptz not null default now()
);
alter table engine_v2.runner_queue enable row level security;
revoke all on engine_v2.runner_queue from public, anon, authenticated, alpha_v2_runner;

create function engine_v2.queue_submit(p_id text, p_client text, p_source text)
returns boolean language sql security definer set search_path = pg_catalog as $$
  insert into engine_v2.runner_queue(request_id, client, source_sha)
  values (p_id, p_client, p_source) on conflict (request_id) do nothing
  returning true
$$;

create function engine_v2.queue_claim(p_client text)
returns table(request_id text, source_sha text, attempt integer, lease uuid)
language sql security definer set search_path = pg_catalog as $$
  with exhausted as (
    update engine_v2.runner_queue q
       set status='failed', lease=null, lease_expires=null, updated_at=now()
     where q.client=p_client and q.status='running' and q.attempts=3 and q.lease_expires <= now()
  ), candidate as (
    select q.request_id from engine_v2.runner_queue q
    where q.client=p_client and q.attempts<3 and
      (q.status='queued' or (q.status='running' and q.lease_expires <= now()))
    order by q.updated_at, q.request_id limit 1 for update skip locked
  )
  update engine_v2.runner_queue q set status='running', attempts=q.attempts+1,
    lease=gen_random_uuid(), lease_expires=now() + interval '10 minutes', updated_at=now()
  from candidate where q.request_id=candidate.request_id
  returning q.request_id, q.source_sha, q.attempts, q.lease
$$;

create function engine_v2.queue_finish(p_id text, p_lease uuid, p_result text)
returns text language sql security definer set search_path = pg_catalog as $$
  update engine_v2.runner_queue q
     set status=case when p_result is not null then 'verified' when attempts=3 then 'failed' else 'queued' end,
         result_sha=p_result, lease=null, lease_expires=null, updated_at=now()
   where q.request_id=p_id and q.status='running' and q.lease=p_lease and q.lease_expires > now()
  returning q.status
$$;

create function engine_v2.queue_status(p_id text)
returns table(client text, status text, attempts integer, result_sha text)
language sql security definer set search_path = pg_catalog as $$
  select q.client,q.status,q.attempts,q.result_sha from engine_v2.runner_queue q where q.request_id=p_id
$$;

revoke all on function engine_v2.queue_submit(text,text,text), engine_v2.queue_claim(text),
  engine_v2.queue_finish(text,uuid,text), engine_v2.queue_status(text) from public, anon, authenticated;
grant execute on function engine_v2.queue_submit(text,text,text), engine_v2.queue_claim(text),
  engine_v2.queue_finish(text,uuid,text), engine_v2.queue_status(text) to alpha_v2_runner;
