begin;
insert into auth.users(id,email) values
('10000000-0000-4000-8000-000000000001','owner@example.invalid'),
('10000000-0000-4000-8000-000000000002','staff@example.invalid'),
('10000000-0000-4000-8000-000000000003','client@example.invalid'),
('10000000-0000-4000-8000-000000000004','other@example.invalid');
insert into crm_memberships values
('c1000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','josh_admin'),
('c1000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','staff'),
('c1000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','client');
set local role anon;
do $$begin
 begin perform crm_team();raise exception 'anon team access';exception when insufficient_privilege then null;end;
end$$;
reset role;
set local role authenticated;
do $$declare actor text;begin
 foreach actor in array array['10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000004'] loop
  perform set_config('request.jwt.claim.sub',actor,true);
  begin perform crm_team();raise exception 'non-owner team access';exception when insufficient_privilege then null;end;
  begin perform crm_manage_member('other@example.invalid','staff');raise exception 'non-owner membership write';exception when insufficient_privilege then null;end;
 end loop;
end$$;
reset role;
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000001';
set local role authenticated;
do $$begin
 assert jsonb_array_length(crm_team())=3;
 perform crm_manage_member('OTHER@example.invalid','staff');
 assert jsonb_array_length(crm_team())=4;
 perform crm_manage_member('other@example.invalid','client');
 begin perform crm_manage_member('other@example.invalid','josh_admin');raise exception 'second owner allowed';exception when invalid_parameter_value then null;end;
 begin perform crm_manage_member('owner@example.invalid','staff',true);raise exception 'owner removal allowed';exception when insufficient_privilege then null;end;
 perform crm_manage_member('other@example.invalid','client',true);
 assert jsonb_array_length(crm_team())=3;
end$$;
reset role;
rollback;
