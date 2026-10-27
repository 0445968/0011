-- R8 follow-up 1: validate only changed work and support one explicit,
-- service-authorized admin override for client completion review.
begin;

-- This repository has no staff role hierarchy. Grants are provisioned only by
-- trusted service/database administration and default to nobody.
create table public.project_workflow_override_admins (
  user_id uuid primary key references public.inquiry_staff(user_id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null
);
alter table public.project_workflow_override_admins enable row level security;
revoke all on public.project_workflow_override_admins from public,anon,authenticated,service_role;
grant select,insert,update,delete on public.project_workflow_override_admins to service_role;

create function public.is_project_workflow_admin() returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and public.is_inquiry_staff()
  and exists(select 1 from public.project_workflow_override_admins a where a.user_id=auth.uid());
$$;
revoke all on function public.is_project_workflow_admin() from public,anon,service_role;
grant execute on function public.is_project_workflow_admin() to authenticated;

-- Monotonic task work revision: unrelated project fields do not stale review or
-- override evidence; reopening or materially editing this task does.
create table public.project_task_work_versions (
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 task_id text not null check(length(btrim(task_id)) between 1 and 100),
 revision integer not null check(revision>0),
 task_snapshot jsonb not null,
 control_revision integer,
 updated_at timestamptz not null default now(),
 primary key(request_id,task_id)
);
alter table public.project_task_work_versions enable row level security;
revoke all on public.project_task_work_versions from public,anon,authenticated,service_role;
grant select on public.project_task_work_versions to authenticated;
create policy project_task_work_versions_staff_read on public.project_task_work_versions
 for select to authenticated using((select public.is_inquiry_staff()));
insert into public.project_task_work_versions(request_id,task_id,revision,task_snapshot,control_revision)
select p.request_id,t.value->>'id',1,t.value,c.revision
from public.inquiry_projects p cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
left join public.project_task_controls c on c.request_id=p.request_id and c.task_id=t.value->>'id'
on conflict(request_id,task_id) do nothing;

create table public.project_task_workflow_overrides (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 task_id text not null check(length(btrim(task_id)) between 1 and 100),
 gate text not null check(gate='client_completion_review'),
 source_status text not null,
 target_status text not null check(target_status='done'),
 reason text not null check(length(btrim(reason)) between 1 and 2000),
 task_revision integer not null check(task_revision>0),
 control_revision integer not null check(control_revision>0),
 before_task jsonb not null,
 after_task jsonb not null,
 overridden_gates jsonb not null check(overridden_gates='["client_completion_review"]'::jsonb),
 actor uuid not null references auth.users(id) on delete restrict,
 created_at timestamptz not null default now()
);
create index project_task_workflow_overrides_current on public.project_task_workflow_overrides(request_id,task_id,task_revision desc,created_at desc);
alter table public.project_task_workflow_overrides enable row level security;
revoke all on public.project_task_workflow_overrides from public,anon,authenticated,service_role;
grant select on public.project_task_workflow_overrides to authenticated;
create policy project_task_workflow_overrides_staff_read on public.project_task_workflow_overrides
 for select to authenticated using((select public.is_inquiry_staff()));

create or replace function public.project_task_completion_approved_candidate(p_request uuid,p_task text,p_candidate jsonb)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from public.project_client_task_responses r
  join public.project_request_baselines b on b.response_id=r.id and b.request_id=r.request_id
  join public.project_task_controls c on c.request_id=r.request_id and c.task_id=r.task_id
  where r.request_id=p_request and r.task_id=p_task and r.kind='completion' and r.status='accepted'
   and r.reviewed_at>=coalesce((select max(h.created_at) from public.project_task_history h where h.request_id=p_request and h.task_id=p_task and h.snapshot->>'kind'='completion_reopened'),'-infinity'::timestamptz)
   and b.submitted_control_revision=c.revision
   and (b.submitted_task-'status')=(p_candidate-'status')
 ) or exists(
  select 1 from public.project_client_task_responses r
  join public.project_task_history h on h.request_id=r.request_id and h.task_id=r.task_id
   and h.snapshot->>'kind'='staff_completion_approval' and h.snapshot->>'responseId'=r.id::text
  where r.request_id=p_request and r.task_id=p_task and r.kind='completion' and r.status='accepted'
   and not exists(select 1 from public.project_request_baselines b where b.response_id=r.id)
   and r.reviewed_at>=coalesce((select max(x.created_at) from public.project_task_history x where x.request_id=p_request and x.task_id=p_task and x.snapshot->>'kind'='completion_reopened'),'-infinity'::timestamptz)
   and ((h.snapshot->'task')-'status')=(p_candidate-'status')
 ) or exists(
  -- Pre-R7E accepted responses have no submitted baseline or approval-history
  -- snapshot. Preserve their original trusted accepted state; new responses
  -- are always baselined by R7E and cannot use this compatibility path.
  select 1 from public.project_client_task_responses r
  where r.request_id=p_request and r.task_id=p_task and r.kind='completion' and r.status='accepted'
   and not exists(select 1 from public.project_request_baselines b where b.response_id=r.id)
   and not exists(select 1 from public.project_task_history h where h.request_id=p_request and h.task_id=p_task
      and h.snapshot->>'kind'='staff_completion_approval' and h.snapshot->>'responseId'=r.id::text)
   and r.reviewed_at>=coalesce((select max(x.created_at) from public.project_task_history x where x.request_id=p_request and x.task_id=p_task and x.snapshot->>'kind'='completion_reopened'),'-infinity'::timestamptz)
 ) or exists(
  -- Some older submissions were captured before task controls existed. A NULL
  -- submitted control revision identifies that legacy state; keep it usable
  -- while the task itself remains unchanged and has not been reopened.
  select 1 from public.project_client_task_responses r
  join public.project_request_baselines b on b.response_id=r.id and b.request_id=r.request_id
  where r.request_id=p_request and r.task_id=p_task and r.kind='completion' and r.status='accepted'
   and b.submitted_control_revision is null
   and (b.submitted_task-'status')=(p_candidate-'status')
   and r.reviewed_at>=coalesce((select max(x.created_at) from public.project_task_history x where x.request_id=p_request and x.task_id=p_task and x.snapshot->>'kind'='completion_reopened'),'-infinity'::timestamptz)
 ) or (p_task='project-brief-client-approval' and exists(
   select 1 from public.project_brief_versions v where v.request_id=p_request
    and v.version=(select max(v2.version) from public.project_brief_versions v2 where v2.request_id=p_request) and v.status='approved'));
$$;
revoke all on function public.project_task_completion_approved_candidate(uuid,text,jsonb) from public,anon,authenticated,service_role;

create or replace function public.project_task_completion_approved(p_request uuid,p_task text)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.inquiry_projects p cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
  where p.request_id=p_request and t.value->>'id'=p_task
   and public.project_task_completion_approved_candidate(p_request,p_task,t.value));
$$;
revoke all on function public.project_task_completion_approved(uuid,text) from public,anon,authenticated,service_role;

create function public.project_task_completion_override_current(p_request uuid,p_task text,p_candidate jsonb)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from public.project_task_workflow_overrides o
  join public.project_task_work_versions v on v.request_id=o.request_id and v.task_id=o.task_id
  join public.project_task_controls c on c.request_id=o.request_id and c.task_id=o.task_id
  where o.request_id=p_request and o.task_id=p_task and o.gate='client_completion_review'
   and o.target_status='done' and o.actor is not null
   and o.task_revision=v.revision and o.control_revision=c.revision
   and o.after_task=v.task_snapshot and o.after_task=p_candidate
   and not exists(select 1 from public.project_task_workflow_overrides newer
      where newer.request_id=o.request_id and newer.task_id=o.task_id and newer.task_revision>o.task_revision)
 );
$$;
revoke all on function public.project_task_completion_override_current(uuid,text,jsonb) from public,anon,authenticated,service_role;

create function public.project_task_completion_gate_satisfied(p_request uuid,p_task text,p_candidate jsonb)
returns boolean language sql stable security definer set search_path='' as $$
 select public.project_task_completion_approved_candidate(p_request,p_task,p_candidate)
  or public.project_task_completion_override_current(p_request,p_task,p_candidate);
$$;
revoke all on function public.project_task_completion_gate_satisfied(uuid,text,jsonb) from public,anon,authenticated,service_role;

create or replace function public.guard_project_work_integrity() returns trigger
language plpgsql security definer set search_path='' as $$
#variable_conflict use_column
declare t jsonb; m jsonb; c public.project_task_controls%rowtype; previous_task jsonb; changed boolean;
 override_context jsonb; override_for_task boolean; completing_project boolean;
begin
 completing_project:=new.state='completed' and old.state<>'completed';
 if old.body->'tasks' is not distinct from new.body->'tasks'
    and old.body->'milestones' is not distinct from new.body->'milestones'
    and not completing_project then return new; end if;
 override_context:=nullif(current_setting('bivi.project_workflow_override',true),'')::jsonb;
 for t in select value from jsonb_array_elements(new.body->'tasks') loop
  select value into previous_task from jsonb_array_elements(old.body->'tasks') where value->>'id'=t->>'id';
  changed:=previous_task is distinct from t;
  if changed then
   insert into public.project_task_work_versions(request_id,task_id,revision,task_snapshot,control_revision)
   select new.request_id,t->>'id',1,t,c.revision from (select 1) seed
   left join public.project_task_controls c on c.request_id=new.request_id and c.task_id=t->>'id'
   on conflict(request_id,task_id) do update set revision=project_task_work_versions.revision+1,
     task_snapshot=excluded.task_snapshot,control_revision=excluded.control_revision,updated_at=now();
  end if;
  select * into c from public.project_task_controls where request_id=new.request_id and task_id=t->>'id';
  if changed and c.task_id is null and previous_task is not null then
   raise exception 'task_control_missing|task=%',t->>'id' using errcode='23514';
  end if;
  if t->>'status'='done' and (changed or completing_project) then
   if c.task_id is null then raise exception 'task_control_missing|task=%',t->>'id' using errcode='23514'; end if;
   if exists(select 1 from public.project_subtasks s where s.request_id=new.request_id and s.task_id=t->>'id' and s.status<>'done') then
    raise exception 'Complete unfinished subtasks before completing the parent task' using errcode='23514'; end if;
   if c.blocker_owner is not null or (c.depends_on is not null and not exists(
    select 1 from jsonb_array_elements(new.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done')) then
    raise exception 'Resolve task dependency and blockers before completion' using errcode='23514'; end if;
   override_for_task:=coalesce(override_context->>'taskId'=t->>'id'
     and override_context->>'gate'='client_completion_review'
     and override_context->>'targetStatus'='done'
     and override_context->>'actor'=auth.uid()::text
     and public.is_project_workflow_admin(),false);
   if c.owner_type='client' and not public.project_task_completion_gate_satisfied(new.request_id,c.task_id,t) and not override_for_task then
    raise exception 'client_completion_review_required|task=%',t->>'id' using errcode='23514';
   end if;
  end if;
  if changed and t->>'status'<>'done' and previous_task->>'status'='done' then
   insert into public.project_task_history(request_id,task_id,action,snapshot,actor)
   values(new.request_id,t->>'id','metadata',jsonb_build_object('kind','completion_reopened','task',t),auth.uid());
  end if;
  if changed and t->>'status'<>'done' and exists(
   select 1 from public.project_effective_task_phases(new.request_id,t) scope
   join public.project_phase_states s on s.request_id=new.request_id and s.phase=scope and s.status='completed'
  ) then raise exception 'Reopen the completed phase before changing its work' using errcode='23514'; end if;
 end loop;
 for m in select value from jsonb_array_elements(new.body->'milestones') loop
  if m->>'status'='done' and (not exists(select 1 from jsonb_array_elements(new.body->'tasks') t where t->>'milestoneId'=m->>'id')
   or exists(select 1 from jsonb_array_elements(new.body->'tasks') t where t->>'milestoneId'=m->>'id' and t->>'status'<>'done')) then
   raise exception 'Complete all linked milestone tasks before completing the milestone' using errcode='23514';
  end if;
  if m->>'status'<>'done' and exists(select 1 from public.project_milestone_phases l join public.project_phase_states s
   on s.request_id=l.request_id and s.phase=l.phase where l.request_id=new.request_id and l.milestone_id=m->>'id' and s.status='completed') then
   raise exception 'Reopen the completed phase before reopening its milestone' using errcode='23514'; end if;
 end loop;
 if exists(select 1 from public.project_subtasks s where s.request_id=new.request_id and not exists(
  select 1 from jsonb_array_elements(new.body->'tasks') t where t->>'id'=s.task_id)) then
  raise exception 'Remove or relocate subtasks explicitly before removing their parent task' using errcode='23514'; end if;
 return new;
end;$$;
revoke all on function public.guard_project_work_integrity() from public,anon,authenticated,service_role;

-- Priority-only or display-only control edits on unchanged historical work do
-- not demand a new review. Ownership/dependency/blocker/phase changes do.
create or replace function public.guard_project_child_integrity() returns trigger
language plpgsql security definer set search_path='' as $$
#variable_conflict use_column
declare b jsonb; t jsonb; target_request uuid; target_task text; relevant_control_change boolean;
begin
 target_request:=case when tg_op='DELETE' then old.request_id else new.request_id end;
 select body into b from public.inquiry_projects where request_id=target_request for update;
 if tg_table_name='project_subtasks' then
  target_task:=case when tg_op='DELETE' then old.task_id else new.task_id end;
  select value into t from jsonb_array_elements(b->'tasks') where value->>'id'=target_task;
  if tg_op<>'DELETE' and t is null then raise exception 'Subtask parent task is missing' using errcode='23514'; end if;
  if tg_op<>'DELETE' and new.status<>'done' and exists(select 1 from public.project_effective_task_phases(target_request,t) scope join public.project_phase_states s on s.request_id=target_request and s.phase=scope and s.status='completed') then raise exception 'Reopen the completed phase before changing its subtasks' using errcode='23514'; end if;
  if tg_op<>'DELETE' and new.status<>'done' and t->>'status'='done' then raise exception 'Reopen the completed parent task before changing its subtasks' using errcode='23514'; end if;
 elsif tg_table_name='project_task_controls' then
  select value into t from jsonb_array_elements(b->'tasks') where value->>'id'=new.task_id;
  if t is null then raise exception 'Task control parent task is missing' using errcode='23514'; end if;
  relevant_control_change:=tg_op='INSERT' or old.owner_type is distinct from new.owner_type or old.phase is distinct from new.phase or old.depends_on is distinct from new.depends_on or old.blocker_owner is distinct from new.blocker_owner;
  if relevant_control_change and new.owner_type='client' and t->>'status'='done' and not public.project_task_completion_gate_satisfied(target_request,new.task_id,t) then raise exception 'client_completion_review_required|task=%',new.task_id using errcode='23514'; end if;
  if new.blocker_owner is not null and t->>'status'='done' then raise exception 'Reopen the completed task before adding a blocker' using errcode='23514'; end if;
  if new.depends_on is not null and not exists(select 1 from jsonb_array_elements(b->'tasks') d where d->>'id'=new.depends_on and d->>'id'<>new.task_id and (t->>'status'<>'done' or d->>'status'='done')) then raise exception 'Task dependency is missing or incomplete' using errcode='23514'; end if;
  if t->>'status'<>'done' and exists(select 1 from public.project_phase_states s where s.request_id=target_request and s.phase=new.phase and s.status='completed') then raise exception 'Reopen the completed phase before assigning unfinished work' using errcode='23514'; end if;
 elsif tg_table_name='project_milestone_phases' and tg_op<>'DELETE' then
  if not exists(select 1 from jsonb_array_elements(b->'milestones') m where m->>'id'=new.milestone_id) then raise exception 'Milestone phase parent is missing' using errcode='23514'; end if;
  if exists(select 1 from public.project_phase_states s where s.request_id=target_request and s.phase=new.phase and s.status='completed') and exists(select 1 from jsonb_array_elements(b->'milestones') m where m->>'id'=new.milestone_id and m->>'status'<>'done') then raise exception 'Reopen the completed phase before linking unfinished milestones' using errcode='23514'; end if;
 end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end;$$;
revoke all on function public.guard_project_child_integrity() from public,anon,authenticated,service_role;

-- Targeted command. The project and task are locked and revalidated before the
-- one status field changes. No other task, milestone, approval, or evidence is
-- changed. The override is an audit record, never a client/Bivi approval row.
create function public.manage_project_task_status_override(p_request uuid,p_task text,p_status text,p_expected_revision integer,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.inquiry_projects%rowtype; c public.project_task_controls%rowtype; before_task jsonb; after_task jsonb; next_body jsonb; next_tasks jsonb; next_revision integer; version_row public.project_task_work_versions%rowtype; override_id uuid;
begin
 if auth.uid() is null or not public.is_inquiry_staff() or not public.is_project_workflow_admin() then raise exception 'Project workflow administrator access required' using errcode='42501'; end if;
 if p_request is null or p_task is null or length(btrim(p_task)) not between 1 and 100 or p_status is distinct from 'done' or p_expected_revision is null or p_expected_revision<1 or p_reason is null or length(btrim(p_reason)) not between 1 and 2000 then raise exception 'Invalid workflow override command' using errcode='22023'; end if;
 select * into p from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 if p.revision<>p_expected_revision then return jsonb_build_object('result','conflict','revision',p.revision); end if;
 if p.state='completed' or exists(select 1 from public.project_operational_status s where s.request_id=p_request and s.status='inactive') then return jsonb_build_object('result','locked'); end if;
 select value into before_task from jsonb_array_elements(p.body->'tasks') where value->>'id'=p_task;
 if before_task is null then return jsonb_build_object('result','not_found'); end if;
 if before_task->>'status'='done' then return jsonb_build_object('result','unchanged','revision',p.revision); end if;
 select * into c from public.project_task_controls where request_id=p_request and task_id=p_task for update;
 if not found then return jsonb_build_object('result','missing_control'); end if;
 if c.owner_type<>'client' then return jsonb_build_object('result','unsupported_gate'); end if;
 if public.project_task_completion_approved_candidate(p_request,p_task,jsonb_set(before_task,'{status}','"done"'::jsonb)) then return jsonb_build_object('result','review_current'); end if;
 if exists(select 1 from public.project_subtasks s where s.request_id=p_request and s.task_id=p_task and s.status<>'done') then return jsonb_build_object('result','subtasks_incomplete'); end if;
 if c.blocker_owner is not null or (c.depends_on is not null and not exists(select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done')) then return jsonb_build_object('result','dependency_incomplete'); end if;
 if exists(select 1 from public.project_effective_task_phases(p_request,before_task) scope join public.project_phase_states s on s.request_id=p_request and s.phase=scope and s.status='completed') then return jsonb_build_object('result','phase_closed'); end if;
 after_task:=jsonb_set(before_task,'{status}','"done"'::jsonb);
 select coalesce(jsonb_agg(case when value->>'id'=p_task then after_task else value end order by ord),'[]'::jsonb) into next_tasks from jsonb_array_elements(p.body->'tasks') with ordinality as item(value,ord);
 next_body:=jsonb_set(p.body,'{tasks}',next_tasks,false);
 perform set_config('bivi.project_workflow_override',jsonb_build_object('taskId',p_task,'gate','client_completion_review','targetStatus','done','actor',auth.uid())::text,true);
 update public.inquiry_projects set body=next_body,revision=revision+1,updated_at=now(),updated_by=auth.uid() where request_id=p_request returning revision into next_revision;
 select * into version_row from public.project_task_work_versions where request_id=p_request and task_id=p_task;
 if version_row.revision is null or version_row.task_snapshot is distinct from after_task then raise exception 'Task status override was not recorded consistently' using errcode='23514'; end if;
 insert into public.project_task_workflow_overrides(request_id,task_id,gate,source_status,target_status,reason,task_revision,control_revision,before_task,after_task,overridden_gates,actor)
 values(p_request,p_task,'client_completion_review',before_task->>'status','done',btrim(p_reason),version_row.revision,c.revision,before_task,after_task,'["client_completion_review"]'::jsonb,auth.uid()) returning id into override_id;
 insert into public.project_event_history(request_id,source,action,item_id,actor,details)
 values(p_request,'task_overrides','client_completion_review_override',p_task,auth.uid(),jsonb_build_object('overrideId',override_id,'title',before_task->>'title','fromStatus',before_task->>'status','toStatus','done','reason',btrim(p_reason),'overriddenGates',jsonb_build_array('client_completion_review')));
 insert into public.inquiry_project_history(request_id,action,reason,snapshot,actor)
 values(p_request,'task_status_override',btrim(p_reason),jsonb_build_object('revision',next_revision,'taskId',p_task,'before',before_task,'after',after_task,'overriddenGates',jsonb_build_array('client_completion_review')),auth.uid());
 return jsonb_build_object('result','saved','revision',next_revision,'overrideId',override_id,'body',next_body);
end;$$;
revoke all on function public.manage_project_task_status_override(uuid,text,text,integer,text) from public,anon,service_role;
grant execute on function public.manage_project_task_status_override(uuid,text,text,integer,text) to authenticated;

commit;
