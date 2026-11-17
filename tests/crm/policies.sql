\set ON_ERROR_STOP on
begin;
insert into auth.users(id) values ('10000000-0000-4000-8000-000000000001'),('10000000-0000-4000-8000-000000000002'),('10000000-0000-4000-8000-000000000003'),('10000000-0000-4000-8000-000000000004');
insert into public.crm_memberships values ('c1000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','josh_admin'),('c1000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','staff'),('c1000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000004','client');
insert into public.crm_projects values('c2000000-0000-4000-8000-000000000002','wrong-project-test');
insert into public.crm_memberships values('c2000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003','staff');
set local role service_role;
select public.crm_ingest('[{"source":"netlify","provider_id":"synthetic-live","provider_submission_id":"synthetic-live","created_at":"2026-11-17T10:00:00Z","name":"Synthetic Live","phone":"+14025550101","service":"Residential","area":"68102","urgency":"urgent"}]');
select public.crm_ingest('[{"source":"netlify","provider_id":"synthetic-live","provider_submission_id":"synthetic-live","created_at":"2026-11-17T10:00:00Z","name":"Synthetic Live","service":"Residential","urgency":"urgent"}]');
select public.crm_ingest('[{"source":"netlify","provider_id":"synthetic-history","created_at":"2025-02-03T10:00:00-06:00","name":"Synthetic History","service":"Residential","urgency":"quote"}]',true);
select public.crm_ingest('[{"source":"netlify","provider_id":"synthetic-history","created_at":"2025-02-03T10:00:00-06:00","name":"Synthetic History","service":"Residential","urgency":"quote"}]',true);
select public.crm_ingest('[{"source":"chat","provider_id":"synthetic-chat","provider_submission_id":"chat-provider-1","created_at":"2026-11-17T10:00:00Z","name":"Synthetic Chat","service":"Automotive","urgency":"scheduled","conversation":[{"role":"visitor","text":"Synthetic handoff"}]}]');
select public.crm_ingest('[{"source":"chat","provider_id":"synthetic-chat","provider_submission_id":"chat-provider-2","created_at":"2026-11-17T10:00:00Z","name":"Synthetic Chat","service":"Automotive","urgency":"scheduled"}]');
do $$begin
 assert (select count(*) from crm_leads)=3,'replays duplicated leads';
 assert (select count(*) from crm_outbox)=2,'History or replay emitted an alert';
 assert (select created_at from crm_leads where provider_id='synthetic-history')='2025-02-03T16:00:00Z'::timestamptz,'original date changed';
 assert (select status from crm_leads where provider_id='synthetic-history')='history';
 begin
  perform crm_ingest('[{"source":"manual","provider_id":"rolled-back","name":"Synthetic","created_at":"2026-11-17T10:00:00Z","service":"Other","urgency":"quote"},{"source":"invalid","provider_id":"bad","created_at":"2026-11-17T10:00:00Z","name":"Synthetic","service":"Other","urgency":"quote"}]');
  raise exception 'invalid source was accepted';
 exception when check_violation then null;end;
 assert not exists(select 1 from crm_leads where provider_id='rolled-back'),'batch was not atomic';
end$$;
reset role;
set local role anon;
do $$begin
 begin perform crm_snapshot();raise exception 'anon read allowed';exception when insufficient_privilege then null;end;
 begin perform crm_ingest('[]');raise exception 'anon ingestion allowed';exception when insufficient_privilege then null;end;
end$$;
reset role;
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000003';
set local role authenticated;
do $$begin
 assert (select count(*) from crm_leads)=0,'wrong project read allowed';
 begin perform crm_snapshot();raise exception 'wrong project snapshot allowed';exception when insufficient_privilege then null;end;
 begin perform crm_work(gen_random_uuid(),'note','synthetic',null,1,'wrong-project');raise exception 'wrong project mutation allowed';exception when insufficient_privilege then null;end;
end$$;
reset role;
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000002';
set local role authenticated;
do $$declare l crm_leads; r jsonb;begin
 assert crm_role()='staff';assert crm_attention_count()=2,'count must exclude History';
 assert (crm_snapshot()->'metrics'->>'inquiry_confirmed')::integer=2,'History counted as new inquiry';
 assert (select count(*) from crm_leads)=3;
 begin update crm_memberships set role='josh_admin';raise exception 'role escalation allowed';exception when insufficient_privilege then null;end;
 begin perform crm_ingest('[]');raise exception 'browser ingestion allowed';exception when insufficient_privilege then null;end;
 select * into l from crm_leads where provider_id='synthetic-live';
 perform crm_work(l.id,'unanswered','Synthetic unanswered',null,l.version,'synthetic-call-1');
 perform crm_work(l.id,'unanswered','Synthetic retry',null,l.version,'synthetic-call-1');
 assert (select count(*) from crm_events where request_key='synthetic-call-1')=1,'call retry duplicated';
 assert crm_attention_count()=2,'unscheduled unanswered callback lost attention';
 begin perform crm_work(l.id,'booked','',null,l.version,'synthetic-stale');raise exception 'stale write allowed';exception when serialization_failure then null;end;
 select * into l from crm_leads where id=l.id;
 perform crm_work(l.id,'schedule','',now()+interval '1 day',l.version,'synthetic-schedule');
 select * into l from crm_leads where id=l.id;
 perform crm_work(l.id,'callback_completed','Synthetic callback completed',null,l.version,'synthetic-completed');
 select * into l from crm_leads where id=l.id;
 perform crm_work(l.id,'callback_completed','Synthetic duplicate completion',null,l.version,'synthetic-completed-2');
 assert (select count(*) from crm_events where kind='callback_completed')=1,'callback completion counted twice';
 perform crm_work(l.id,'booked','Synthetic booked',null,l.version,'synthetic-booked');
 select * into l from crm_leads where id=l.id;
 perform crm_work(l.id,'booked','Synthetic duplicate booked',null,l.version,'synthetic-booked-2');
 assert (select count(*) from crm_events where kind='booked')=1,'booking counted twice';
 assert (crm_snapshot()->'metrics'->>'callback_completed')::integer=1;
 assert (crm_snapshot()->'metrics'->>'booked')::integer=1;
 select * into l from crm_leads where provider_id='synthetic-chat';
 perform crm_work(l.id,'claim','',null,l.version,'synthetic-claim');
 select * into l from crm_leads where id=l.id;
 assert l.assigned_to=auth.uid() and l.conversation_state='claimed';
end$$;
reset role;
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000004';
set local role authenticated;
do $$declare l crm_leads;begin
 assert crm_role()='client';select * into l from crm_leads where provider_id='synthetic-chat';
 begin perform crm_work(l.id,'claim','',null,l.version,'second-claim');raise exception 'claim collision allowed';exception when serialization_failure then null;end;
 begin perform crm_work(l.id,'return_to_bot','',null,l.version,'wrong-return');raise exception 'unowned return allowed';exception when insufficient_privilege then null;end;
end$$;
reset role;
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000002';
set local role authenticated;
do $$declare l crm_leads;begin
 select * into l from crm_leads where provider_id='synthetic-chat';perform crm_work(l.id,'return_to_bot','',null,l.version,'synthetic-return');
 assert (select conversation_state from crm_leads where id=l.id)='returned';
 insert into crm_devices(id,user_id,label,subscription,endpoint_hash) values('30000000-0000-4000-8000-000000000001',auth.uid(),'Synthetic device','{}','synthetic-endpoint');
end$$;
reset role;
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000004';
set local role authenticated;
do $$begin assert (select count(*) from crm_devices)=0,'another user device exposed';end$$;
reset role;
set local role service_role;
do $$declare first_count integer;second_count integer;begin
 select count(*) into first_count from crm_claim_outbox('40000000-0000-4000-8000-000000000001');
 select count(*) into second_count from crm_claim_outbox('40000000-0000-4000-8000-000000000002');
 assert first_count=2 and second_count=0,'outbox claim was not exclusive';
end$$;
reset role;
rollback;
\echo 'PASS: transactional intake, replay, silent History, dates, roles, project isolation, callbacks, booking, handoff, device isolation and outbox leases'
