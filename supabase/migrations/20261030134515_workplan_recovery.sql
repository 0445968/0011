begin;
create table public.staff_work_recovery_preferences (
 staff_id uuid primary key references auth.users(id) on delete cascade,
 retention_days integer not null default 30 check(retention_days in (1,7,14,30,60))
);
alter table public.staff_work_recovery_preferences enable row level security;
revoke all on public.staff_work_recovery_preferences from public,anon,authenticated,service_role;
grant select,insert,update on public.staff_work_recovery_preferences to authenticated;
create policy recovery_preferences_select on public.staff_work_recovery_preferences for select to authenticated using(staff_id=(select auth.uid()) and (select public.is_inquiry_staff()));
create policy recovery_preferences_insert on public.staff_work_recovery_preferences for insert to authenticated with check(staff_id=(select auth.uid()) and (select public.is_inquiry_staff()));
create policy recovery_preferences_update on public.staff_work_recovery_preferences for update to authenticated using(staff_id=(select auth.uid()) and (select public.is_inquiry_staff())) with check(staff_id=(select auth.uid()) and (select public.is_inquiry_staff()));
create table public.project_workplan_recovery (
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 staff_id uuid not null references auth.users(id) on delete cascade,
 body jsonb not null,
 base_body jsonb,
 base_revision integer not null,
 updated_at timestamptz not null,
 captured_at timestamptz not null default now(),
 expires_at timestamptz not null,
 primary key(staff_id,request_id)
);
create index workplan_recovery_expiry on public.project_workplan_recovery(expires_at);
create index workplan_recovery_project on public.project_workplan_recovery(request_id);
alter table public.project_workplan_recovery enable row level security;
revoke all on public.project_workplan_recovery from public,anon,authenticated,service_role;
grant select on public.project_workplan_recovery to authenticated;
grant delete,select(expires_at) on public.project_workplan_recovery to service_role;
create policy recovery_private_select on public.project_workplan_recovery for select to authenticated using(staff_id=(select auth.uid()) and (select public.is_inquiry_staff()) and expires_at>now());
create schema if not exists private;
-- Trigger-only function: no callable RPC or user-controlled owner fields.
create function private.preserve_workplan_recovery() returns trigger language plpgsql security definer set search_path='' as $$
declare days integer;
begin
 if not exists(select 1 from public.inquiry_projects where request_id=OLD.request_id) or not exists(select 1 from auth.users where id=OLD.staff_id) then
  if TG_OP='DELETE' then return OLD;end if;return NEW;
 end if;
 if TG_OP='UPDATE' and OLD.body=NEW.body then return NEW;end if;
 select retention_days into days from public.staff_work_recovery_preferences where staff_id=OLD.staff_id;
 insert into public.project_workplan_recovery(request_id,staff_id,body,base_body,base_revision,updated_at,captured_at,expires_at)
 values(OLD.request_id,OLD.staff_id,OLD.body,OLD.base_body,OLD.base_revision,OLD.updated_at,now(),now()+make_interval(days=>coalesce(days,30)))
 on conflict(staff_id,request_id) do update set body=excluded.body,base_body=excluded.base_body,base_revision=excluded.base_revision,updated_at=excluded.updated_at,captured_at=excluded.captured_at,expires_at=excluded.expires_at;
 if TG_OP='DELETE' then return OLD;end if;return NEW;
end;$$;
revoke all on function private.preserve_workplan_recovery() from public,anon,authenticated,service_role;
create trigger preserve_workplan_recovery before update or delete on public.project_workplan_drafts for each row execute function private.preserve_workplan_recovery();
create function private.update_recovery_retention() returns trigger language plpgsql security definer set search_path='' as $$
begin
 update public.project_workplan_recovery set expires_at=captured_at+make_interval(days=>NEW.retention_days) where staff_id=NEW.staff_id;
 return NEW;
end;$$;
revoke all on function private.update_recovery_retention() from public,anon,authenticated,service_role;
create trigger update_recovery_retention after insert or update on public.staff_work_recovery_preferences for each row execute function private.update_recovery_retention();

create index task_completion_review_display on public.project_client_task_responses(request_id,task_id,submitted_at desc,id desc) where kind='completion';

-- Existing completion review requests supply the display state without weakening completion gates.
create view public.staff_task_review_states with(security_invoker=true) as
select distinct on(request_id,task_id) request_id,task_id,status,submitted_at
from public.project_client_task_responses where kind='completion'
order by request_id,task_id,submitted_at desc,id desc;
revoke all on public.staff_task_review_states from public,anon,service_role;
grant select on public.staff_task_review_states to authenticated;

commit;
