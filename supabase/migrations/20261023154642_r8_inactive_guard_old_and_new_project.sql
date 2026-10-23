begin;

-- Reassociation must not let an update mutate a record that belonged to an
-- Inactive project simply by moving it to an Active project in the same write.
create or replace function public.guard_inactive_project_work() returns trigger
language plpgsql security definer set search_path='' as $$
declare old_request uuid; new_request uuid;
begin
 if tg_op<>'INSERT' then old_request:=old.request_id; end if;
 if tg_op<>'DELETE' then new_request:=new.request_id; end if;
 if (old_request is not null and exists(select 1 from public.project_operational_status s where s.request_id=old_request and s.status='inactive'))
    or (new_request is not null and exists(select 1 from public.project_operational_status s where s.request_id=new_request and s.status='inactive')) then
   raise exception 'Project is Inactive. Reactivate it before changing work, assignments, dates, phases, files, notes, discussion or meetings.' using errcode='23514';
 end if;
 if tg_op='DELETE' then return old; else return new; end if;
end; $$;
revoke all on function public.guard_inactive_project_work() from public,anon,authenticated,service_role;
commit;
