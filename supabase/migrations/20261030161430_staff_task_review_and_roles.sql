begin;

-- Reuse the existing trusted workflow-admin capability as the first basic
-- staff role. Bootstrap only when the installation has exactly one active
-- staff identity; ambiguous installations require an operator to designate one.
insert into public.project_workflow_override_admins(user_id,granted_by)
select s.user_id,null from public.inquiry_staff s
where s.active and (select count(*) from public.inquiry_staff where active)=1
on conflict(user_id) do nothing;

alter table public.project_task_controls
  add column requires_staff_review boolean not null default false,
  add column requires_client_review boolean not null default false;
update public.project_task_controls set requires_client_review=true where owner_type='client';

create table public.project_task_review_policy_history (
 id bigint generated always as identity primary key,
 request_id uuid not null,
 task_id text not null,
 previous_policy jsonb not null,
 next_policy jsonb not null,
 actor uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 foreign key(request_id,task_id) references public.project_task_controls(request_id,task_id) on delete cascade
);
alter table public.project_task_review_policy_history enable row level security;
revoke all on public.project_task_review_policy_history from public,anon,authenticated,service_role;
grant select on public.project_task_review_policy_history to authenticated;
create policy project_task_review_policy_history_staff_read on public.project_task_review_policy_history
 for select to authenticated using((select public.is_inquiry_staff()));

create table public.staff_workspace_role_history (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 action text not null check(action in ('admin_granted','admin_removed','activated','deactivated','invited')),
 actor uuid references auth.users(id) on delete set null,
 detail jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.staff_workspace_role_history enable row level security;
revoke all on public.staff_workspace_role_history from public,anon,authenticated,service_role;
grant select on public.staff_workspace_role_history to authenticated;
create policy staff_workspace_role_history_admin_read on public.staff_workspace_role_history
 for select to authenticated using((select public.is_project_workflow_admin()));

create function public.default_client_task_review_policy() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' and new.owner_type='client' then new.requires_client_review:=true;
 elsif tg_op='UPDATE' and old.owner_type is distinct from new.owner_type and new.owner_type='client' then new.requires_client_review:=true;
 end if;
 return new;
end;$$;
revoke all on function public.default_client_task_review_policy() from public,anon,authenticated,service_role;
create trigger project_task_review_policy_defaults_insert before insert on public.project_task_controls
 for each row execute function public.default_client_task_review_policy();
create trigger project_task_review_policy_defaults_update before update of owner_type on public.project_task_controls
 for each row execute function public.default_client_task_review_policy();

create or replace function public.project_task_completion_gate_satisfied(p_request uuid,p_task text,p_candidate jsonb)
returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((select c.requires_client_review from public.project_task_controls c where c.request_id=p_request and c.task_id=p_task),false)=false
  or public.project_task_completion_approved_candidate(p_request,p_task,p_candidate)
  or public.project_task_completion_override_current(p_request,p_task,p_candidate);
$$;
revoke all on function public.project_task_completion_gate_satisfied(uuid,text,jsonb) from public,anon,authenticated,service_role;

create or replace function public.project_task_review_controls_snapshot(p_request uuid,p_task text)
returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('ownerType',c.owner_type,'requiresClientReview',c.requires_client_review,'phase',c.phase,'dependsOn',c.depends_on,'blockerOwner',c.blocker_owner,
  'effectivePhases',coalesce((select jsonb_agg(x.phase order by x.phase) from public.project_effective_task_phases(p_request,t.value) x(phase)),'[]'::jsonb))
 from public.project_task_controls c join public.inquiry_projects p on p.request_id=c.request_id
 cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
 where c.request_id=p_request and c.task_id=p_task and t.value->>'id'=p_task;
$$;
revoke all on function public.project_task_review_controls_snapshot(uuid,text) from public,anon,authenticated,service_role;

create function public.set_project_task_review_policy(p_request uuid,p_task text,p_requires_staff boolean,p_requires_client boolean,p_control_revision integer,p_project_revision integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare project_row public.inquiry_projects%rowtype; control_row public.project_task_controls%rowtype; task_row jsonb; previous_policy jsonb;
begin
 if auth.uid() is null or not public.is_project_workflow_admin() then raise exception 'Workflow administrator required' using errcode='42501';end if;
 if p_requires_staff is null or p_requires_client is null or p_task is null or length(btrim(p_task)) not between 1 and 100 then raise exception 'Invalid task review policy' using errcode='22023';end if;
 select * into project_row from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if project_row.state='completed' or exists(select 1 from public.project_operational_status where request_id=p_request and status='inactive') then return jsonb_build_object('result','locked');end if;
 if project_row.revision<>p_project_revision then return jsonb_build_object('result','conflict');end if;
 select * into control_row from public.project_task_controls where request_id=p_request and task_id=p_task for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if control_row.revision<>p_control_revision then return jsonb_build_object('result','conflict');end if;
 if (control_row.owner_type='client' and p_requires_staff) or (control_row.owner_type='bivi' and p_requires_client) then raise exception 'Review settings do not match task ownership' using errcode='22023';end if;
 select value into task_row from jsonb_array_elements(project_row.body->'tasks') where value->>'id'=p_task;
 if task_row is null then return jsonb_build_object('result','not_found');end if;
 if control_row.requires_staff_review=p_requires_staff and control_row.requires_client_review=p_requires_client then return jsonb_build_object('result','saved','revision',control_row.revision);end if;
 previous_policy:=jsonb_build_object('requiresStaffReview',control_row.requires_staff_review,'requiresClientReview',control_row.requires_client_review);
 update public.project_task_controls set requires_staff_review=p_requires_staff,requires_client_review=p_requires_client,
   revision=revision+1,updated_at=now(),updated_by=auth.uid() where request_id=p_request and task_id=p_task returning * into control_row;
 insert into public.project_task_review_policy_history(request_id,task_id,previous_policy,next_policy,actor)
 values(p_request,p_task,previous_policy,
   jsonb_build_object('requiresStaffReview',p_requires_staff,'requiresClientReview',p_requires_client),auth.uid());
 return jsonb_build_object('result','saved','revision',control_row.revision);
end;$$;
revoke all on function public.set_project_task_review_policy(uuid,text,boolean,boolean,integer,integer) from public,anon,service_role;
grant execute on function public.set_project_task_review_policy(uuid,text,boolean,boolean,integer,integer) to authenticated;

create function public.guard_required_task_review_completion() returns trigger
language plpgsql security definer set search_path='' as $$
declare item jsonb; previous jsonb; control_row public.project_task_controls%rowtype;
begin
 if old.body->'tasks' is not distinct from new.body->'tasks' then return new;end if;
 for item in select value from jsonb_array_elements(new.body->'tasks') loop
  select value into previous from jsonb_array_elements(old.body->'tasks') where value->>'id'=item->>'id';
  if previous is null or previous->>'status'=item->>'status' then continue;end if;
  if item->>'status'='rejected' and not public.is_project_workflow_admin() then raise exception 'staff_task_review_admin_required|task=%',item->>'id' using errcode='23514';end if;
  if item->>'status'<>'done' or previous->>'status'='done' then continue;end if;
  select * into control_row from public.project_task_controls where request_id=new.request_id and task_id=item->>'id';
  if control_row.requires_staff_review and not public.is_project_workflow_admin() then
   raise exception 'staff_task_review_required|task=%',item->>'id' using errcode='23514';
  end if;
 end loop;
 return new;
end;$$;
revoke all on function public.guard_required_task_review_completion() from public,anon,authenticated,service_role;
create trigger zz_guard_required_task_review_completion before update of body on public.inquiry_projects
 for each row execute function public.guard_required_task_review_completion();

create function public.guard_client_review_policy_after_completion() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if old.requires_client_review is distinct from new.requires_client_review and exists(
  select 1 from public.inquiry_projects p cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
  where p.request_id=new.request_id and t.value->>'id'=new.task_id and t.value->>'status'='done'
 ) then raise exception 'Reopen the completed task before changing its client review requirement' using errcode='23514';end if;
 return new;
end;$$;
revoke all on function public.guard_client_review_policy_after_completion() from public,anon,authenticated,service_role;
create trigger project_client_review_policy_guard before update of requires_client_review on public.project_task_controls
 for each row execute function public.guard_client_review_policy_after_completion();

commit;
