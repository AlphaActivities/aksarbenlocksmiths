-- C1 owner administration. Does not create Auth users or change existing memberships.
begin;
create function public.crm_team() returns jsonb
language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
 if crm_role() is distinct from 'josh_admin' then raise exception 'forbidden' using errcode='42501'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('user_id',m.user_id,'email',u.email,'role',m.role) order by m.role,u.email)
 from crm_memberships m join auth.users u on u.id=m.user_id
 where m.project_id='c1000000-0000-4000-8000-000000000001'),'[]');
end $$;
create function public.crm_manage_member(p_email text,p_role text,p_remove boolean default false) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare target uuid; current_role text;
begin
 if crm_role() is distinct from 'josh_admin' then raise exception 'forbidden' using errcode='42501'; end if;
 if p_email is null or length(p_email)>254 or p_role is null or p_role not in ('staff','client') or p_remove is null then raise exception 'invalid_fields' using errcode='22023'; end if;
 select id into target from auth.users where lower(email)=lower(trim(p_email));
 if target is null then raise exception 'auth_account_required' using errcode='P0002'; end if;
 -- Serialize membership changes and protect the one owner, even against concurrent edits.
 perform pg_advisory_xact_lock(hashtext('c1-membership-admin'));
 select role into current_role from crm_memberships where project_id='c1000000-0000-4000-8000-000000000001' and user_id=target for update;
 if current_role='josh_admin' or target=auth.uid() then raise exception 'owner_protected' using errcode='42501'; end if;
 if p_remove then
  delete from crm_memberships where project_id='c1000000-0000-4000-8000-000000000001' and user_id=target;
 else
  insert into crm_memberships(project_id,user_id,role) values('c1000000-0000-4000-8000-000000000001',target,p_role)
  on conflict(project_id,user_id) do update set role=excluded.role;
 end if;
 return crm_team();
end $$;
revoke all on function public.crm_team(),public.crm_manage_member(text,text,boolean) from public,anon,authenticated;
grant execute on function public.crm_team(),public.crm_manage_member(text,text,boolean) to authenticated;
commit;
