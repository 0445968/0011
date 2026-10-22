-- R7B. Generated with migration new, ordered after the existing future-dated color migration.
-- Add guards only; no backfill, reassignment, deletion or change to RLS/audit RPCs.
begin;

-- A single SQL definition of effective membership, matching lib/projects/metrics.ts.
create function public.project_effective_task_phases(p_request uuid, p_task jsonb)
returns setof text language sql stable security definer set search_path='' as $$
 select phase from public.project_task_controls where request_id=p_request and task_id=p_task->>'id'
 union
 select phase from public.project_milestone_phases where request_id=p_request and milestone_id=p_task->>'milestoneId';
$$;
revoke all on function public.project_effective_task_phases(uuid,jsonb) from public,anon,authenticated,service_role;

-- Preserve review records; a reopen adds an audit event and requires a newer approval.
create function public.project_task_completion_approved(p_request uuid,p_task text)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.project_client_task_responses r where r.request_id=p_request and r.task_id=p_task and r.kind='completion' and r.status='accepted'
  and r.reviewed_at>=coalesce((select max(h.created_at) from public.project_task_history h where h.request_id=p_request and h.task_id=p_task and h.snapshot->>'kind'='completion_reopened'),'-infinity'::timestamptz))
 or (p_task='project-brief-client-approval' and exists(select 1 from public.project_brief_versions v where v.request_id=p_request and v.version=(select max(v2.version) from public.project_brief_versions v2 where v2.request_id=p_request) and v.status='approved'));
$$;
revoke all on function public.project_task_completion_approved(uuid,text) from public,anon,authenticated,service_role;

-- The JSON candidate is authoritative, so tasks and milestone may complete together.
-- No revision, history, draft or child writes survive a raised check violation.
create function public.guard_project_work_integrity() returns trigger
language plpgsql security definer set search_path='' as $$
#variable_conflict use_column
declare t jsonb; m jsonb; c public.project_task_controls%rowtype;
begin
 if old.body is not distinct from new.body and not (new.state='completed' and old.state<>'completed') then return new; end if;
 for t in select value from jsonb_array_elements(new.body->'tasks') loop
  select * into c from public.project_task_controls where request_id=new.request_id and task_id=t->>'id';
  if c.task_id is null and exists(select 1 from jsonb_array_elements(old.body->'tasks') previous where previous->>'id'=t->>'id') then
   raise exception 'Task control record is missing; explicitly repair its phase and ownership' using errcode='23514';
  end if;
  if t->>'status'='done' then
   if c.task_id is null then
    raise exception 'Task control record is missing; save new tasks before completing them' using errcode='23514';
   end if;
   if exists(select 1 from public.project_subtasks s where s.request_id=new.request_id and s.task_id=t->>'id' and s.status<>'done') then
    raise exception 'Complete unfinished subtasks before completing the parent task' using errcode='23514';
   end if;
   if c.blocker_owner is not null or (c.depends_on is not null and not exists(
    select 1 from jsonb_array_elements(new.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done'
   )) then raise exception 'Resolve task dependency and blockers before completion' using errcode='23514'; end if;
   if c.owner_type='client' and not public.project_task_completion_approved(new.request_id,c.task_id) then
    raise exception 'Client completion requires Bivi review approval' using errcode='23514';
   end if;
  end if;
  if t->>'status'<>'done' and exists(select 1 from jsonb_array_elements(old.body->'tasks') previous where previous->>'id'=t->>'id' and previous->>'status'='done') then
   insert into public.project_task_history(request_id,task_id,action,snapshot,actor)
   values(new.request_id,t->>'id','metadata',jsonb_build_object('kind','completion_reopened','task',t),auth.uid());
  end if;
  if t->>'status'<>'done' and exists(
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
   raise exception 'Reopen the completed phase before reopening its milestone' using errcode='23514';
  end if;
 end loop;
 -- Do not let pruning erase unfinished child evidence as a side effect of a body save.
 if exists(select 1 from public.project_subtasks s where s.request_id=new.request_id and not exists(
  select 1 from jsonb_array_elements(new.body->'tasks') t where t->>'id'=s.task_id
 )) then raise exception 'Remove or relocate subtasks explicitly before removing their parent task' using errcode='23514'; end if;
 return new;
end;$$;
revoke all on function public.guard_project_work_integrity() from public,anon,authenticated,service_role;
-- Run after existing milestone normalization, before AFTER effects and revision history.
create trigger zz_project_work_integrity before update of body,state on public.inquiry_projects
 for each row execute function public.guard_project_work_integrity();

create function public.guard_project_phase_completion() returns trigger
language plpgsql security definer set search_path='' as $$
#variable_conflict use_column
declare b jsonb; t jsonb; c public.project_task_controls%rowtype;
begin
 if new.status<>'completed' then return new; end if;
 select body into b from public.inquiry_projects where request_id=new.request_id for update;
 if exists(select 1 from jsonb_array_elements(b->'tasks') t where not exists(
  select 1 from public.project_task_controls c where c.request_id=new.request_id and c.task_id=t->>'id'
 )) then raise exception 'Task control record is missing' using errcode='23514'; end if;
 for t in select value from jsonb_array_elements(b->'tasks') loop
  if new.phase not in (select public.project_effective_task_phases(new.request_id,t)) then continue; end if;
  select * into c from public.project_task_controls where request_id=new.request_id and task_id=t->>'id';
  if t->>'status'<>'done' or exists(select 1 from public.project_subtasks s where s.request_id=new.request_id and s.task_id=t->>'id' and s.status<>'done') then
   raise exception 'Complete all applicable tasks and subtasks before phase completion' using errcode='23514';
  end if;
  if c.blocker_owner is not null or (c.depends_on is not null and not exists(select 1 from jsonb_array_elements(b->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done')) then
   raise exception 'Resolve task dependency and blockers before phase completion' using errcode='23514'; end if;
  if c.owner_type='client' and not public.project_task_completion_approved(new.request_id,c.task_id) then
   raise exception 'Client completion requires Bivi review approval' using errcode='23514'; end if;
 end loop;
 if exists(select 1 from public.project_milestone_phases l where l.request_id=new.request_id and l.phase=new.phase and not exists(
  select 1 from jsonb_array_elements(b->'milestones') m where m->>'id'=l.milestone_id and m->>'status'='done'
 )) then raise exception 'Complete all linked milestones before phase completion' using errcode='23514'; end if;
 if new.phase in ('qa','delivery','handoff') and not public.project_delivery_ready(new.request_id) then
  raise exception 'Required deliverable approvals, QA and change requests must be resolved before phase completion' using errcode='23514'; end if;
 if new.phase='handoff' and not public.project_closeout_ready(new.request_id) then
  raise exception 'Complete client receipt and handoff closeout before phase completion' using errcode='23514'; end if;
 return new;
end;$$;
revoke all on function public.guard_project_phase_completion() from public,anon,authenticated,service_role;
create trigger project_phase_completion_integrity before insert or update of status on public.project_phase_states
 for each row execute function public.guard_project_phase_completion();

-- Serialize hierarchy edits with the project row (same lock order as the existing RPCs).
create function public.guard_project_child_integrity() returns trigger
language plpgsql security definer set search_path='' as $$
#variable_conflict use_column
declare b jsonb; t jsonb; target_request uuid; target_task text;
begin
 target_request:=case when tg_op='DELETE' then old.request_id else new.request_id end;
 select body into b from public.inquiry_projects where request_id=target_request for update;
 if tg_table_name='project_subtasks' then
  target_task:=case when tg_op='DELETE' then old.task_id else new.task_id end;
  select value into t from jsonb_array_elements(b->'tasks') where value->>'id'=target_task;
  if tg_op<>'DELETE' and t is null then raise exception 'Subtask parent task is missing' using errcode='23514'; end if;
  if tg_op<>'DELETE' and new.status<>'done' and exists(select 1 from public.project_effective_task_phases(target_request,t) scope join public.project_phase_states s on s.request_id=target_request and s.phase=scope and s.status='completed') then
   raise exception 'Reopen the completed phase before changing its subtasks' using errcode='23514'; end if;
  if tg_op<>'DELETE' and new.status<>'done' and t->>'status'='done' then
   raise exception 'Reopen the completed parent task before changing its subtasks' using errcode='23514'; end if;
 elsif tg_table_name='project_task_controls' then
  select value into t from jsonb_array_elements(b->'tasks') where value->>'id'=new.task_id;
  if t is null then raise exception 'Task control parent task is missing' using errcode='23514'; end if;
  if new.owner_type='client' and t->>'status'='done' and not public.project_task_completion_approved(target_request,new.task_id) then
   raise exception 'Client completion requires Bivi review approval' using errcode='23514'; end if;
  if new.blocker_owner is not null and t->>'status'='done' then raise exception 'Reopen the completed task before adding a blocker' using errcode='23514'; end if;
  if new.depends_on is not null and not exists(select 1 from jsonb_array_elements(b->'tasks') d where d->>'id'=new.depends_on and d->>'id'<>new.task_id and (t->>'status'<>'done' or d->>'status'='done')) then
   raise exception 'Task dependency is missing or incomplete' using errcode='23514'; end if;
  if t->>'status'<>'done' and exists(select 1 from public.project_phase_states s where s.request_id=target_request and s.phase=new.phase and s.status='completed') then
   raise exception 'Reopen the completed phase before assigning unfinished work' using errcode='23514'; end if;
 elsif tg_table_name='project_milestone_phases' and tg_op<>'DELETE' then
  if not exists(select 1 from jsonb_array_elements(b->'milestones') m where m->>'id'=new.milestone_id) then
   raise exception 'Milestone phase parent is missing' using errcode='23514'; end if;
  if exists(select 1 from public.project_phase_states s where s.request_id=target_request and s.phase=new.phase and s.status='completed')
   and exists(select 1 from jsonb_array_elements(b->'milestones') m where m->>'id'=new.milestone_id and m->>'status'<>'done') then
   raise exception 'Reopen the completed phase before linking unfinished milestones' using errcode='23514'; end if;
 end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end;$$;
revoke all on function public.guard_project_child_integrity() from public,anon,authenticated,service_role;
create trigger zz_project_subtask_integrity before insert or update on public.project_subtasks
 for each row execute function public.guard_project_child_integrity();
create trigger zz_project_control_integrity before insert or update on public.project_task_controls
 for each row execute function public.guard_project_child_integrity();
create trigger zz_project_milestone_phase_integrity before insert or update on public.project_milestone_phases
 for each row execute function public.guard_project_child_integrity();
create or replace view public.staff_my_tasks with(security_invoker=true) as
select p.request_id,p.public_id as project_public_id,coalesce(p.body->>'title','Project') as project_title,lower(coalesce(p.body->>'title','')) as project_sort,p.state as project_state,p.revision as project_revision,
 c.task_id,c.revision as control_revision,c.phase,c.service_id,c.blocker_owner,c.depends_on,
 t.value->>'title' as title,lower(t.value->>'title') as title_sort,t.value->>'status' as task_status,t.value->>'owner' as owner_label,(t.value->>'dueOn')::date as due_on,
 (t.value->>'status'<>'done' and (t.value->>'status'='blocked' or c.blocker_owner is not null or (c.depends_on is not null and not exists(select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done')))) as is_blocked,
 greatest(p.updated_at,c.updated_at,coalesce((select schedule.updated_at from public.project_task_schedule schedule where schedule.request_id=c.request_id and schedule.task_id=c.task_id),c.updated_at)) as updated_at,
 greatest((select count(*)::integer from public.project_task_members tm where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.side='bivi'),case when c.assigned_staff_id is not null then 1 else 0 end) as assignee_count,
 c.priority as priority,
 (select schedule.start_on from public.project_task_schedule schedule where schedule.request_id=c.request_id and schedule.task_id=c.task_id) as start_on,
 array(select phase from (select c.phase union select l.phase from public.project_milestone_phases l where l.request_id=p.request_id and l.milestone_id=t.value->>'milestoneId') phases) as effective_phases
from public.project_task_controls c join public.inquiry_projects p on p.request_id=c.request_id
cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
where (select public.is_inquiry_staff()) and c.owner_type='bivi' and t.value->>'id'=c.task_id
 and (exists(select 1 from public.project_task_members tm join public.inquiry_staff s on s.user_id=tm.user_id and s.active where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.user_id=auth.uid() and tm.side='bivi')
  or (not exists(select 1 from public.project_task_members tm where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.side='bivi') and c.assigned_staff_id=auth.uid()));
create or replace function public.project_sync_milestone_statuses() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  b jsonb;
  m jsonb;
  tasks jsonb;
  next_status text;
  index_number integer := 0;
  milestone_id text;
begin
  if old.body is not distinct from new.body then return new; end if;
  b := new.body;
  for m in select value from jsonb_array_elements(b->'milestones') loop
    milestone_id := m->>'id';
    if m->>'status' = 'done' then
      if coalesce((select old_m.value->>'status' from jsonb_array_elements(old.body->'milestones') old_m
        where old_m.value->>'id' = milestone_id), 'planned') <> 'done' then
        if not exists (
          select 1 from jsonb_array_elements(b->'tasks') t where t.value->>'milestoneId' = milestone_id
        ) or exists (
          select 1 from jsonb_array_elements(b->'tasks') t
          where t.value->>'milestoneId' = milestone_id and t.value->>'status' <> 'done'
        ) or exists (
          select 1 from jsonb_array_elements(b->'tasks') t
          join public.project_subtasks s on s.request_id = new.request_id and s.task_id = t.value->>'id'
          where t.value->>'milestoneId' = milestone_id and s.status <> 'done'
        ) then
          raise exception 'Complete all linked milestone tasks and subtasks first' using errcode = '23514';
        end if;
        if exists (
          select 1
          from jsonb_array_elements(b->'tasks') t
          join public.project_task_controls c on c.request_id = new.request_id and c.task_id = t.value->>'id'
          where t.value->>'milestoneId' = milestone_id and (
            c.blocker_owner is not null
            or (c.depends_on is not null and not exists (
              select 1 from jsonb_array_elements(b->'tasks') dependency
              where dependency.value->>'id' = c.depends_on and dependency.value->>'status' = 'done'
            ))
          )
        ) then
          raise exception 'Resolve task dependencies and blockers before completing the milestone' using errcode = '23514';
        end if;
        if exists (
          select 1
          from jsonb_array_elements(b->'tasks') t
          join public.project_task_controls c on c.request_id = new.request_id and c.task_id = t.value->>'id'
          where t.value->>'milestoneId' = milestone_id and c.owner_type = 'client'
            and not public.project_task_completion_approved(new.request_id,c.task_id)
        ) then
          raise exception 'Client task completion requires staff approval before completing the milestone' using errcode = '23514';
        end if;
        if exists (
          select 1 from jsonb_array_elements(b->'tasks') t
          where t.value->>'milestoneId' = milestone_id
            and exists(select 1 from jsonb_array_elements(old.body->'tasks') previous where previous.value->>'id' = t.value->>'id')
            and not exists(select 1 from public.project_task_controls c where c.request_id = new.request_id and c.task_id = t.value->>'id')
        ) then
          raise exception 'Task control record is missing for a saved milestone task' using errcode = '23514';
        end if;
      elsif exists (
        select 1
        from jsonb_array_elements(b->'tasks') t
        join jsonb_array_elements(old.body->'tasks') previous on previous.value->>'id' = t.value->>'id'
        where t.value->>'milestoneId' = milestone_id and previous.value->>'status' = 'done'
          and t.value->>'status' <> 'done'
      ) then
        raise exception 'Reopen the completed milestone before reopening tasks' using errcode = '23514';
      end if;
    else
      select coalesce(jsonb_agg(t.value), '[]'::jsonb) into tasks
      from jsonb_array_elements(b->'tasks') t where t.value->>'milestoneId' = milestone_id;
      next_status := case when exists (
        select 1 from jsonb_array_elements(tasks) t where t.value->>'status' in ('doing', 'blocked')
      ) then 'in_progress' else 'planned' end;
      if m->>'status' is distinct from next_status then
        b := jsonb_set(b, array['milestones', index_number::text, 'status'], to_jsonb(next_status), false);
      end if;
    end if;
    index_number := index_number + 1;
  end loop;
  new.body := b;
  return new;
end;
$$;
create or replace function public.client_project_work(p_request_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=auth.uid();p public.inquiry_projects%rowtype;l public.project_lifecycle%rowtype;tasks jsonb;next_action jsonb;waiting_client integer;waiting_bivi integer;
begin
 if actor is null or not exists(select 1 from public.project_clients where request_id=p_request_id and user_id=actor and active) then return null; end if;
 select * into p from public.inquiry_projects where request_id=p_request_id;
 if not found then return null; end if;
 select * into l from public.project_lifecycle where request_id=p_request_id;
 if l.request_id is null then return null; end if;

 if exists(select 1 from jsonb_array_elements(p.body->'tasks') t where not exists(select 1 from public.project_task_controls c where c.request_id=p_request_id and c.task_id=t->>'id')) then
  raise exception 'Task setup is incomplete; ask Bivi to review project associations' using errcode='55000'; end if;
 select coalesce(jsonb_agg(jsonb_build_object(
   'id',t.value->>'id','title',t.value->>'title',
   'dueOn',case when jsonb_typeof(t.value->'dueOn')='string' then t.value->>'dueOn' else null end,
   'status',t.value->>'status','phase',c.phase,'phases',(select jsonb_agg(scope) from public.project_effective_task_phases(p_request_id,t.value) scope),'dependsOn',c.depends_on,
   'dependencyComplete',(c.depends_on is null or exists(select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done')),
   'blockerOwner',c.blocker_owner,'clientNote',c.client_note,'serviceId',c.service_id,'controlRevision',c.revision
 ) order by public.project_phase_rank(c.phase),coalesce(t.value->>'dueOn','9999-12-31'),t.value->>'title'),'[]'::jsonb)
 into tasks
 from jsonb_array_elements(p.body->'tasks') t(value)
 join public.project_task_controls c on c.request_id=p_request_id and c.task_id=t.value->>'id'
 where c.owner_type='client';

 select jsonb_build_object('id',t.value->>'id','title',t.value->>'title','dueOn',case when jsonb_typeof(t.value->'dueOn')='string' then t.value->>'dueOn' else null end)
 into next_action
 from jsonb_array_elements(p.body->'tasks') t(value)
 join public.project_task_controls c on c.request_id=p_request_id and c.task_id=t.value->>'id'
 where c.owner_type='client' and t.value->>'status'<>'done' and c.blocker_owner is null
   and exists(select 1 from public.project_effective_task_phases(p_request_id,t.value) scope join public.project_phase_states s on s.request_id=p_request_id and s.phase=scope and s.status='active')
   and (c.depends_on is null or exists(select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done'))
 order by public.project_phase_rank(c.phase),coalesce(t.value->>'dueOn','9999-12-31'),t.value->>'title' limit 1;

 select count(*)::integer into waiting_client
 from jsonb_array_elements(p.body->'tasks') t(value)
 join public.project_task_controls c on c.request_id=p_request_id and c.task_id=t.value->>'id'
 where c.owner_type='client' and t.value->>'status'<>'done' and c.blocker_owner is null
   and exists(select 1 from public.project_effective_task_phases(p_request_id,t.value) scope join public.project_phase_states s on s.request_id=p_request_id and s.phase=scope and s.status='active')
   and (c.depends_on is null or exists(select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done'));

 select count(*)::integer into waiting_bivi
 from jsonb_array_elements(p.body->'tasks') t(value)
 join public.project_task_controls c on c.request_id=p_request_id and c.task_id=t.value->>'id'
 where t.value->>'status'<>'done' and exists(select 1 from public.project_effective_task_phases(p_request_id,t.value) scope join public.project_phase_states s on s.request_id=p_request_id and s.phase=scope and s.status='active')
   and (c.owner_type='bivi' or c.blocker_owner='bivi');

 return jsonb_build_object(
   'requestId',p.request_id,'title',p.body->>'title','state',p.state,'projectRevision',p.revision,
   'currentPhase',l.phase,'activePhases',(select coalesce(jsonb_agg(phase),'[]'::jsonb) from public.project_phase_states where request_id=p_request_id and status='active'),'nextAction',next_action,'waitingOnClient',coalesce(waiting_client,0),
   'waitingOnBivi',coalesce(waiting_bivi,0),'tasks',tasks
 );
end;$$;
create or replace function public.manage_client_project_task_r4c_legacy(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();p public.inquiry_projects%rowtype;c public.project_task_controls%rowtype;l public.project_lifecycle%rowtype;task jsonb;dep_task jsonb;v_task_id text;new_status text;v_client_note text;expected_project integer;expected_control integer;new_tasks jsonb;new_task jsonb;project_revision integer;control_revision integer;
begin
 if actor is null then raise exception 'Client authorization required' using errcode='42501'; end if;
 perform 1 from public.project_clients where request_id=p_request_id and user_id=actor and active for update;
 if not found then raise exception 'Client project authorization required' using errcode='42501'; end if;
 if jsonb_typeof(p_command->'taskId') is distinct from 'string' or length(btrim(p_command->>'taskId')) not between 1 and 100 or jsonb_typeof(p_command->'expectedProjectRevision') is distinct from 'number' or p_command->>'expectedProjectRevision'!~'^[0-9]{1,8}$' or jsonb_typeof(p_command->'expectedControlRevision') is distinct from 'number' or p_command->>'expectedControlRevision'!~'^[0-9]{1,8}$' or jsonb_typeof(p_command->'status') is distinct from 'string' or p_command->>'status' not in ('todo','doing','done') or jsonb_typeof(p_command->'clientNote') is distinct from 'string' or length(p_command->>'clientNote')>2000 then raise exception 'Invalid client task update' using errcode='22023'; end if;
 v_task_id:=btrim(p_command->>'taskId');new_status:=p_command->>'status';v_client_note:=btrim(p_command->>'clientNote');expected_project:=(p_command->>'expectedProjectRevision')::integer;expected_control:=(p_command->>'expectedControlRevision')::integer;
 select * into p from public.inquiry_projects where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 if p.state<>'active' then return jsonb_build_object('result','locked'); end if;
 if p.revision<>expected_project then return jsonb_build_object('result','conflict'); end if;
 select * into l from public.project_lifecycle where request_id=p_request_id;
 select * into c from public.project_task_controls where request_id=p_request_id and project_task_controls.task_id=v_task_id for update;
 if c.request_id is null or c.owner_type<>'client' then return jsonb_build_object('result','not_found'); end if;
 if c.revision<>expected_control then return jsonb_build_object('result','conflict'); end if;
 if not exists(select 1 from jsonb_array_elements(p.body->'tasks') candidate cross join lateral public.project_effective_task_phases(p_request_id,candidate) scope join public.project_phase_states s on s.request_id=p_request_id and s.phase=scope and s.status='active' where candidate->>'id'=v_task_id) then return jsonb_build_object('result','phase_closed'); end if;
 if c.blocker_owner is not null then return jsonb_build_object('result','blocked'); end if;
 select value into task from jsonb_array_elements(p.body->'tasks') where value->>'id'=v_task_id limit 1;
 if task is null then return jsonb_build_object('result','not_found'); end if;
 if c.depends_on is not null then
  select value into dep_task from jsonb_array_elements(p.body->'tasks') where value->>'id'=c.depends_on limit 1;
  if dep_task is null or dep_task->>'status'<>'done' then return jsonb_build_object('result','dependency'); end if;
 end if;
 if v_task_id='project-brief-client-approval' and new_status='done' and not exists(select 1 from public.project_brief_versions v where v.request_id=p_request_id and v.version=(select max(v2.version) from public.project_brief_versions v2 where v2.request_id=p_request_id) and v.status='approved') then return jsonb_build_object('result','approval_required'); end if;
 new_task:=jsonb_set(task,'{status}',to_jsonb(new_status),false);
 select jsonb_agg(case when value->>'id'=v_task_id then new_task else value end order by ord) into new_tasks from jsonb_array_elements(p.body->'tasks') with ordinality as e(value,ord);
 update public.inquiry_projects set body=jsonb_set(p.body,'{tasks}',new_tasks,false),revision=revision+1,updated_at=now(),updated_by=actor where request_id=p_request_id returning revision into project_revision;
 update public.project_task_controls set client_note=v_client_note,revision=revision+1,updated_at=now(),updated_by=actor where request_id=p_request_id and project_task_controls.task_id=v_task_id returning revision into control_revision;
 insert into public.project_task_history(request_id,task_id,action,snapshot,actor) values(p_request_id,v_task_id,'client_update',jsonb_build_object('task',new_task,'clientNote',v_client_note),actor);
 return jsonb_build_object('result','saved','projectRevision',project_revision,'controlRevision',control_revision,'status',new_status);
end;$$;
-- Staff diagnostics expose unresolved legacy evidence without rewriting it.
create function public.staff_project_completion_issues(p_request uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare issues jsonb;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 select coalesce(jsonb_agg(t.value->>'title' || ': completed client work has no current Bivi review. Reopen affected phases/milestone/task, then submit and accept a fresh completion review.'),'[]'::jsonb)
 into issues from public.inquiry_projects p cross join lateral jsonb_array_elements(p.body->'tasks') t
 join public.project_task_controls c on c.request_id=p.request_id and c.task_id=t.value->>'id'
 where p.request_id=p_request and c.owner_type='client' and t.value->>'status'='done' and not public.project_task_completion_approved(p_request,c.task_id);
 return issues;
end;$$;
revoke all on function public.staff_project_completion_issues(uuid) from public,anon,service_role;
grant execute on function public.staff_project_completion_issues(uuid) to authenticated;
commit;
