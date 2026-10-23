-- R8 follow-up 1: keep review/override freshness scoped to task and
-- completion-relevant control changes, not unrelated control metadata.
begin;

create table public.project_task_completion_review_controls (
 response_id uuid primary key references public.project_client_task_responses(id) on delete cascade,
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 task_id text not null check(length(btrim(task_id)) between 1 and 100),
 control_snapshot jsonb not null,
 captured_at timestamptz not null default now()
);
alter table public.project_task_completion_review_controls enable row level security;
revoke all on public.project_task_completion_review_controls from public,anon,authenticated,service_role;
grant select on public.project_task_completion_review_controls to authenticated;
create policy project_task_completion_review_controls_staff_read on public.project_task_completion_review_controls
 for select to authenticated using((select public.is_inquiry_staff()));

create function public.project_task_review_controls_snapshot(p_request uuid,p_task text)
returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
  'ownerType',c.owner_type,
  'phase',c.phase,
  'dependsOn',c.depends_on,
  'blockerOwner',c.blocker_owner,
  'effectivePhases',coalesce((select jsonb_agg(x.phase order by x.phase)
   from public.project_effective_task_phases(p_request,t.value) x(phase)),'[]'::jsonb)
 )
 from public.project_task_controls c
 join public.inquiry_projects p on p.request_id=c.request_id
 cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
 where c.request_id=p_request and c.task_id=p_task and t.value->>'id'=p_task;
$$;
revoke all on function public.project_task_review_controls_snapshot(uuid,text) from public,anon,authenticated,service_role;

-- Preserve accepted review provenance as it exists now; do not synthesize a
-- response or approval. New accepted reviews are captured by the history trigger.
insert into public.project_task_completion_review_controls(response_id,request_id,task_id,control_snapshot,captured_at)
select r.id,r.request_id,r.task_id,public.project_task_review_controls_snapshot(r.request_id,r.task_id),h.created_at
from public.project_client_task_responses r
join public.project_task_history h on h.request_id=r.request_id and h.task_id=r.task_id
 and h.snapshot->>'kind'='staff_completion_approval' and h.snapshot->>'responseId'=r.id::text
where r.kind='completion' and r.status='accepted'
 and public.project_task_review_controls_snapshot(r.request_id,r.task_id) is not null
on conflict(response_id) do nothing;

create function public.capture_project_task_completion_review_controls() returns trigger
language plpgsql security definer set search_path='' as $$
declare v_response_id uuid; v_request_id uuid; v_task_id text; v_snapshot jsonb;
begin
 if new.snapshot->>'kind'<>'staff_completion_approval' then return new; end if;
 begin v_response_id:=(new.snapshot->>'responseId')::uuid;
 exception when others then return new; end;
 select r.request_id,r.task_id into v_request_id,v_task_id from public.project_client_task_responses r
 where r.id=v_response_id and r.kind='completion' and r.status='accepted';
 if v_request_id is null then return new; end if;
 v_snapshot:=public.project_task_review_controls_snapshot(v_request_id,v_task_id);
 if v_snapshot is not null then
  insert into public.project_task_completion_review_controls(response_id,request_id,task_id,control_snapshot,captured_at)
  values(v_response_id,v_request_id,v_task_id,v_snapshot,new.created_at)
  on conflict(response_id) do nothing;
 end if;
 return new;
end;$$;
revoke all on function public.capture_project_task_completion_review_controls() from public,anon,authenticated,service_role;
create trigger capture_project_task_completion_review_controls after insert on public.project_task_history
 for each row execute function public.capture_project_task_completion_review_controls();

create or replace function public.project_task_completion_approved_candidate(p_request uuid,p_task text,p_candidate jsonb)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from public.project_client_task_responses r
  join public.project_request_baselines b on b.response_id=r.id and b.request_id=r.request_id
  join public.project_task_controls c on c.request_id=r.request_id and c.task_id=r.task_id
  where r.request_id=p_request and r.task_id=p_task and r.kind='completion' and r.status='accepted'
   and r.reviewed_at>=coalesce((select max(h.created_at) from public.project_task_history h where h.request_id=p_request and h.task_id=p_task and h.snapshot->>'kind'='completion_reopened'),'-infinity'::timestamptz)
   and (b.submitted_task-'status')=(p_candidate-'status')
   and (
    exists(select 1 from public.project_task_completion_review_controls s
     where s.response_id=r.id and s.request_id=r.request_id and s.task_id=r.task_id
      and s.control_snapshot=public.project_task_review_controls_snapshot(p_request,p_task))
    or (not exists(select 1 from public.project_task_completion_review_controls s where s.response_id=r.id)
     and b.submitted_control_revision=c.revision)
   )
 ) or exists(
  select 1 from public.project_client_task_responses r
  join public.project_task_history h on h.request_id=r.request_id and h.task_id=r.task_id
   and h.snapshot->>'kind'='staff_completion_approval' and h.snapshot->>'responseId'=r.id::text
  where r.request_id=p_request and r.task_id=p_task and r.kind='completion' and r.status='accepted'
   and not exists(select 1 from public.project_request_baselines b where b.response_id=r.id)
   and r.reviewed_at>=coalesce((select max(x.created_at) from public.project_task_history x where x.request_id=p_request and x.task_id=p_task and x.snapshot->>'kind'='completion_reopened'),'-infinity'::timestamptz)
   and ((h.snapshot->'task')-'status')=(p_candidate-'status')
   and exists(select 1 from public.project_task_completion_review_controls s
     where s.response_id=r.id and s.control_snapshot=public.project_task_review_controls_snapshot(p_request,p_task))
 ) or exists(
  select 1 from public.project_client_task_responses r
  where r.request_id=p_request and r.task_id=p_task and r.kind='completion' and r.status='accepted'
   and not exists(select 1 from public.project_request_baselines b where b.response_id=r.id)
   and not exists(select 1 from public.project_task_history h where h.request_id=p_request and h.task_id=p_task
      and h.snapshot->>'kind'='staff_completion_approval' and h.snapshot->>'responseId'=r.id::text)
   and r.reviewed_at>=coalesce((select max(x.created_at) from public.project_task_history x where x.request_id=p_request and x.task_id=p_task and x.snapshot->>'kind'='completion_reopened'),'-infinity'::timestamptz)
 ) or exists(
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

alter table public.project_task_workflow_overrides add column control_snapshot jsonb;
update public.project_task_workflow_overrides o
 set control_snapshot=public.project_task_review_controls_snapshot(o.request_id,o.task_id)
 where control_snapshot is null;
alter table public.project_task_workflow_overrides alter column control_snapshot set not null;

create function public.capture_project_task_workflow_override_controls() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.control_snapshot is null then
  new.control_snapshot:=public.project_task_review_controls_snapshot(new.request_id,new.task_id);
 end if;
 if new.control_snapshot is null then raise exception 'Task completion controls are missing' using errcode='23514'; end if;
 return new;
end;$$;
revoke all on function public.capture_project_task_workflow_override_controls() from public,anon,authenticated,service_role;
create trigger capture_project_task_workflow_override_controls before insert on public.project_task_workflow_overrides
 for each row execute function public.capture_project_task_workflow_override_controls();

create or replace function public.project_task_completion_override_current(p_request uuid,p_task text,p_candidate jsonb)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from public.project_task_workflow_overrides o
  join public.project_task_work_versions v on v.request_id=o.request_id and v.task_id=o.task_id
  where o.request_id=p_request and o.task_id=p_task and o.gate='client_completion_review'
   and o.target_status='done' and o.actor is not null
   and o.task_revision=v.revision and o.after_task=v.task_snapshot and o.after_task=p_candidate
   and o.control_snapshot=public.project_task_review_controls_snapshot(p_request,p_task)
   and not exists(select 1 from public.project_task_workflow_overrides newer
      where newer.request_id=o.request_id and newer.task_id=o.task_id and newer.task_revision>o.task_revision)
 );
$$;
revoke all on function public.project_task_completion_override_current(uuid,text,jsonb) from public,anon,authenticated,service_role;

-- A completed client task can retain its approval through display-only edits,
-- but ownership/phase/dependency/blocker changes must wait until the task is
-- reopened. Inserting missing controls is repair metadata and does not itself
-- complete work or authorize a future completion.
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
  if tg_op='UPDATE' and relevant_control_change and (old.owner_type='client' or new.owner_type='client') and t->>'status'='done' then
   raise exception 'client_completion_review_required|task=%',new.task_id using errcode='23514';
  end if;
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

commit;
