begin;

-- Operational status is separate from the existing execution lifecycle.
-- No legacy rows are backfilled: Completed and On hold continue to be
-- derived from inquiry_projects.state until an authorized explicit change.
create table public.project_operational_status (
  request_id uuid primary key references public.inquiry_projects(request_id) on delete cascade,
  status text not null check (status in ('active','on_hold','waiting_on_client','inactive')),
  revision integer not null default 1 check (revision > 0),
  reason text not null,
  waiting_source_kind text,
  waiting_source_id text,
  updated_at timestamptz not null default now(),
  updated_by uuid not null default auth.uid(),
  check ((status='waiting_on_client')=(waiting_source_kind is not null and waiting_source_id is not null))
);
alter table public.project_operational_status enable row level security;
revoke all on public.project_operational_status from public,anon,authenticated,service_role;
grant select on public.project_operational_status to authenticated;
create policy project_operational_status_staff_read on public.project_operational_status
  for select to authenticated using ((select public.is_inquiry_staff()));

create or replace view public.staff_project_directory with(security_invoker=true) as
select p.request_id,p.state,p.body,p.updated_at,
 case when p.state='completed' then 'completed' else coalesce(s.status,p.state) end as operational_status
from public.inquiry_projects p left join public.project_operational_status s using(request_id)
where (select public.is_inquiry_staff());
revoke all on public.staff_project_directory from public,anon,service_role;
grant select on public.staff_project_directory to authenticated;

-- Add operational labels to existing staff-only calendar and task read models.
create or replace view public.staff_calendar with(security_invoker=true) as
select events.*,
 array(select tm.user_id from public.project_task_members tm where events.event_type in ('task','task_start') and tm.request_id=events.request_id and tm.task_id=events.source_id and tm.side='bivi'
   union select events.assigned_staff_id where events.assigned_staff_id is not null and not exists(select 1 from public.project_task_members tm where tm.request_id=events.request_id and tm.task_id=events.source_id and tm.side='bivi')) as assignee_ids,
 null::timestamptz as starts_at,null::timestamptz as ends_at,null::text as meeting_timezone,
 case when events.project_state='completed' then 'completed' else coalesce((select os.status from public.project_operational_status os where os.request_id=events.request_id),events.project_state) end as operational_status
from (
 select 'task:'||p.request_id||':'||md5(t.value->>'id') as event_key,'task'::text as event_type,p.request_id,t.value->>'id' as source_id,t.value->>'title' as title,(t.value->>'dueOn')::date as due_on,
 t.value->>'status' as status,t.value->>'status'='done' as is_done,coalesce(p.body->>'title','Project') as project_title,p.public_id as project_public_id,p.state as project_state,c.assigned_staff_id,c.owner_type
 from public.inquiry_projects p cross join lateral jsonb_array_elements(p.body->'tasks') t(value) left join public.project_task_controls c on c.request_id=p.request_id and c.task_id=t.value->>'id'
 where (select public.is_inquiry_staff()) and t.value->>'dueOn' is not null
 union all
 select 'milestone:'||p.request_id||':'||md5(m.value->>'id'),'milestone',p.request_id,m.value->>'id',m.value->>'title',(m.value->>'dueOn')::date,m.value->>'status',m.value->>'status'='done',coalesce(p.body->>'title','Project'),p.public_id,p.state,null::uuid,null::text
 from public.inquiry_projects p cross join lateral jsonb_array_elements(p.body->'milestones') m(value) where (select public.is_inquiry_staff()) and m.value->>'dueOn' is not null
 union all
 select 'task-start:'||p.request_id||':'||md5(t.value->>'id'),'task_start',p.request_id,t.value->>'id',t.value->>'title',s.start_on,t.value->>'status',t.value->>'status'='done',coalesce(p.body->>'title','Project'),p.public_id,p.state,c.assigned_staff_id,c.owner_type
 from public.project_task_schedule s join public.inquiry_projects p on p.request_id=s.request_id join public.project_task_controls c on c.request_id=s.request_id and c.task_id=s.task_id cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
 where (select public.is_inquiry_staff()) and s.start_on is not null and t.value->>'id'=s.task_id
) events
union all
select 'meeting:'||m.id,'meeting',m.request_id,m.id::text,m.title,(m.starts_at at time zone m.timezone)::date,m.status,m.status='cancelled',coalesce(p.body->>'title','Project'),p.public_id,p.state,m.organizer,'meeting',
 array(select distinct uid from unnest(m.attendees||array[m.organizer]) uid where uid is not null),m.starts_at,m.ends_at,m.timezone,
 case when p.state='completed' then 'completed' else coalesce(os.status,p.state) end
from public.project_meetings m join public.inquiry_projects p on p.request_id=m.request_id left join public.project_operational_status os on os.request_id=p.request_id where (select public.is_inquiry_staff());
revoke all on public.staff_calendar from public,anon,service_role;
grant select on public.staff_calendar to authenticated;

create or replace view public.staff_my_tasks with(security_invoker=true) as
select p.request_id,p.public_id as project_public_id,coalesce(p.body->>'title','Project') as project_title,lower(coalesce(p.body->>'title','')) as project_sort,p.state as project_state,p.revision as project_revision,
 c.task_id,c.revision as control_revision,c.phase,c.service_id,c.blocker_owner,c.depends_on,
 t.value->>'title' as title,lower(t.value->>'title') as title_sort,t.value->>'status' as task_status,t.value->>'owner' as owner_label,(t.value->>'dueOn')::date as due_on,
 (t.value->>'status'<>'done' and (t.value->>'status'='blocked' or c.blocker_owner is not null or (c.depends_on is not null and not exists(select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done')))) as is_blocked,
 greatest(p.updated_at,c.updated_at,coalesce((select schedule.updated_at from public.project_task_schedule schedule where schedule.request_id=c.request_id and schedule.task_id=c.task_id),c.updated_at)) as updated_at,
 greatest((select count(*)::integer from public.project_task_members tm where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.side='bivi'),case when c.assigned_staff_id is not null then 1 else 0 end) as assignee_count,
 c.priority,(select schedule.start_on from public.project_task_schedule schedule where schedule.request_id=c.request_id and schedule.task_id=c.task_id) as start_on,
 array(select phase from (select c.phase union select l.phase from public.project_milestone_phases l where l.request_id=p.request_id and l.milestone_id=t.value->>'milestoneId') phases) as effective_phases,
 case when p.state='completed' then 'completed' else coalesce(os.status,p.state) end as operational_status
from public.project_task_controls c join public.inquiry_projects p on p.request_id=c.request_id
cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
left join public.project_operational_status os on os.request_id=p.request_id
where (select public.is_inquiry_staff()) and c.owner_type='bivi' and t.value->>'id'=c.task_id
 and (exists(select 1 from public.project_task_members tm join public.inquiry_staff s on s.user_id=tm.user_id and s.active where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.user_id=auth.uid() and tm.side='bivi')
  or (not exists(select 1 from public.project_task_members tm where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.side='bivi') and c.assigned_staff_id=auth.uid()));
revoke all on public.staff_my_tasks from public,anon,service_role;
grant select on public.staff_my_tasks to authenticated;

create function public.project_operational_closeout_checklist(p_request uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare blockers jsonb:='[]'::jsonb; p public.inquiry_projects%rowtype; item record;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 select * into p from public.inquiry_projects where request_id=p_request;
 if not found then return jsonb_build_array(jsonb_build_object('key','project','label','Project record unavailable','href','/projects')); end if;
 if p.state='completed' then return jsonb_build_array(jsonb_build_object('key','execution','label','This project is already Completed. Use the existing authorized reopen action before changing operational status.','href','/projects/'||p_request||'?tab=brief')); end if;
 if jsonb_array_length(coalesce(p.body->'tasks','[]'::jsonb))=0 then blockers:=blockers||jsonb_build_array(jsonb_build_object('key','tasks_empty','label','Add and complete at least one required task before closeout.','href','/projects/'||p_request||'?tab=plan')); end if;
 if coalesce((select phase from public.project_lifecycle where request_id=p_request),'discovery')<>'handoff' then
   blockers:=blockers||jsonb_build_array(jsonb_build_object('key','lifecycle','label','Move the project lifecycle to Handoff after completing required stages.','href','/projects/'||p_request||'?tab=phases'));
 end if;
 for item in
   select t.value->>'id' id,coalesce(t.value->>'title',t.value->>'id') title,c.task_id control_id
   from jsonb_array_elements(coalesce(p.body->'tasks','[]'::jsonb)) t(value)
   left join public.project_task_controls c on c.request_id=p_request and c.task_id=t.value->>'id'
   where c.task_id is null or t.value->>'status'<>'done'
 loop blockers:=blockers||jsonb_build_array(jsonb_build_object('key','task:'||item.id,'label',case when item.control_id is null then item.title||': task control record is missing.' else item.title||': required task is not Done.' end,'href','/projects/'||p_request||'?tab=plan&task='||item.id)); end loop;
 for item in select c.task_id from public.project_task_controls c where c.request_id=p_request and not exists(select 1 from jsonb_array_elements(coalesce(p.body->'tasks','[]'::jsonb)) t(value) where t.value->>'id'=c.task_id)
 loop blockers:=blockers||jsonb_build_array(jsonb_build_object('key','orphan_control:'||item.task_id,'label','Task control '||item.task_id||' has no matching task. Repair this association before closeout.','href','/projects/'||p_request||'?tab=plan')); end loop;
 for item in select s.id,s.task_id from public.project_subtasks s where s.request_id=p_request and not exists(select 1 from jsonb_array_elements(coalesce(p.body->'tasks','[]'::jsonb)) t(value) where t.value->>'id'=s.task_id)
 loop blockers:=blockers||jsonb_build_array(jsonb_build_object('key','orphan_subtask:'||item.id,'label','Subtask '||item.id||' has no matching parent task. Repair this association before closeout.','href','/projects/'||p_request||'?tab=plan')); end loop;
 for item in
   select s.id,s.title from public.project_subtasks s join public.project_task_controls c using(request_id,task_id)
   where s.request_id=p_request and s.status<>'done'
 loop blockers:=blockers||jsonb_build_array(jsonb_build_object('key','subtask:'||item.id,'label',item.title||': required subtask is not Done.','href','/projects/'||p_request||'?tab=plan')); end loop;
 for item in select t.value->>'id' id,t.value->>'title' title,c.owner_type from jsonb_array_elements(coalesce(p.body->'tasks','[]'::jsonb)) t(value)
   join public.project_task_controls c on c.request_id=p_request and c.task_id=t.value->>'id'
   where c.owner_type='client' and t.value->>'status'='done' and not public.project_task_completion_approved(p_request,c.task_id)
 loop blockers:=blockers||jsonb_build_array(jsonb_build_object('key','review:'||item.id,'label',item.title||': current Bivi completion review is required.','href','/projects/'||p_request||'?tab=requests')); end loop;
 for item in select m.value->>'id' id,m.value->>'title' title from jsonb_array_elements(coalesce(p.body->'milestones','[]'::jsonb)) m(value) where m.value->>'status'<>'done'
 loop blockers:=blockers||jsonb_build_array(jsonb_build_object('key','milestone:'||item.id,'label',item.title||': milestone must be explicitly reviewed and Done.','href','/projects/'||p_request||'?tab=plan&milestone='||item.id)); end loop;
 for item in select mp.milestone_id from public.project_milestone_phases mp where mp.request_id=p_request and not exists(select 1 from jsonb_array_elements(coalesce(p.body->'milestones','[]'::jsonb)) m(value) where m.value->>'id'=mp.milestone_id)
 loop blockers:=blockers||jsonb_build_array(jsonb_build_object('key','orphan_milestone_phase:'||item.milestone_id,'label','Milestone phase link '||item.milestone_id||' has no matching milestone. Repair this association before closeout.','href','/projects/'||p_request||'?tab=phases')); end loop;
 -- Only phases with assigned tasks or linked milestones are applicable.
 for item in
   select distinct applicable.phase from (
     select phases.phase
     from jsonb_array_elements(coalesce(p.body->'tasks','[]'::jsonb)) t(value)
     cross join lateral public.project_effective_task_phases(p_request,t.value) phases(phase)
     union
     select mp.phase from public.project_milestone_phases mp where mp.request_id=p_request
   ) applicable
   left join public.project_phase_states s on s.request_id=p_request and s.phase=applicable.phase
   where s.status is distinct from 'completed'
 loop blockers:=blockers||jsonb_build_array(jsonb_build_object('key','phase:'||item.phase,'label',coalesce(item.phase,'Unknown')||': applicable phase must be explicitly completed.','href','/projects/'||p_request||'?tab=phases'));
 end loop;
 for item in select kind,source_id,title,action_label from public.staff_approvals where request_id=p_request
 loop blockers:=blockers||jsonb_build_array(jsonb_build_object('key','approval:'||item.kind||':'||item.source_id,'label',item.title||': '||item.action_label||'.','href',case item.kind when 'brief' then '/projects/'||p_request||'?tab=brief' when 'qa' then '/projects/'||p_request||'?tab=delivery' when 'handoff' then '/projects/'||p_request||'?tab=delivery' when 'receipt' then '/projects/'||p_request||'?tab=delivery' when 'release' then '/projects/'||p_request||'?tab=delivery' when 'closeout' then '/projects/'||p_request||'?tab=delivery' else '/projects/'||p_request||'?tab=delivery' end)); end loop;
 for item in select r.id,r.task_id,r.kind from public.project_client_task_responses r where r.request_id=p_request and r.status='pending'
 loop blockers:=blockers||jsonb_build_array(jsonb_build_object('key','request:'||item.id,'label','Client task '||item.kind||' request for '||item.task_id||' needs a staff decision.','href','/projects/'||p_request||'?tab=requests&request='||item.id)); end loop;
 if not public.project_delivery_ready(p_request) then blockers:=blockers||jsonb_build_array(jsonb_build_object('key','delivery_readiness','label','Resolve required delivery approvals, QA checks and open change requests.','href','/projects/'||p_request||'?tab=delivery')); end if;
 if not public.project_closeout_ready(p_request) then blockers:=blockers||jsonb_build_array(jsonb_build_object('key','closeout_readiness','label','Complete release receipt, required handoff and support closeout records.','href','/projects/'||p_request||'?tab=delivery')); end if;
 return blockers;
end; $$;
revoke all on function public.project_operational_closeout_checklist(uuid) from public,anon,service_role;
grant execute on function public.project_operational_closeout_checklist(uuid) to authenticated;

create function public.get_project_operational_status(p_request uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare p public.inquiry_projects%rowtype; s public.project_operational_status%rowtype; effective text; ready boolean; resolved boolean:=false;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 select * into p from public.inquiry_projects where request_id=p_request;
 if not found then return jsonb_build_object('result','not_found'); end if;
 select * into s from public.project_operational_status where request_id=p_request;
 effective:=case when p.state='completed' then 'completed' else coalesce(s.status,p.state) end;
 if effective='waiting_on_client' then
   resolved:=not exists(select 1 from public.staff_approvals a where a.request_id=p_request and a.waiting_on='client' and a.kind=s.waiting_source_kind and a.source_id=s.waiting_source_id)
     and not exists(select 1 from public.project_client_task_responses r where r.request_id=p_request and r.id::text=s.waiting_source_id and s.waiting_source_kind='task_request' and r.status='pending');
 end if;
 ready:=jsonb_array_length(public.project_operational_closeout_checklist(p_request))=0;
 return jsonb_build_object('result','ok','status',effective,'executionState',p.state,'revision',coalesce(s.revision,0),'projectRevision',p.revision,'reason',s.reason,'waitingSourceKind',s.waiting_source_kind,'waitingSourceId',s.waiting_source_id,'dependencyResolved',resolved,'closeoutEligible',ready,'blockers',public.project_operational_closeout_checklist(p_request),
   'waitingSources',coalesce((select jsonb_agg(source_row.item order by source_row.updated_at desc) from (
     select jsonb_build_object('kind',a.kind,'source_id',a.source_id,'title',a.title,'source_status',a.source_status,'approval_key',a.approval_key) item,a.updated_at from public.staff_approvals a where a.request_id=p_request and a.waiting_on='client'
     union all
     select jsonb_build_object('kind','task_request','source_id',r.id::text,'title','Client task '||r.kind||' request · '||r.task_id,'source_status',r.kind,'approval_key','task_request:'||r.id) item,r.submitted_at updated_at from public.project_client_task_responses r where r.request_id=p_request and r.status='pending'
   ) source_row),'[]'::jsonb));
end; $$;
revoke all on function public.get_project_operational_status(uuid) from public,anon,service_role;
grant execute on function public.get_project_operational_status(uuid) to authenticated;

create function public.manage_project_operational_status(p_request uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); action text:=p_command->>'status'; reason text:=btrim(coalesce(p_command->>'reason','')); expected integer; expected_project integer; current_status text; next_revision integer; p public.inquiry_projects%rowtype; s public.project_operational_status%rowtype; manager_result jsonb; source_kind text:=p_command->>'sourceKind'; v_source_id text:=p_command->>'sourceId'; blockers jsonb; old_status text; changed_at timestamptz:=now();
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if jsonb_typeof(p_command) is distinct from 'object' or action not in ('active','on_hold','waiting_on_client','inactive') or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or jsonb_typeof(p_command->'expectedProjectRevision') is distinct from 'number' then raise exception 'Invalid operational status command' using errcode='22023'; end if;
 expected:=(p_command->>'expectedRevision')::integer; expected_project:=(p_command->>'expectedProjectRevision')::integer;
 perform 1 from public.project_inquiries where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 select * into p from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 select * into s from public.project_operational_status where request_id=p_request for update;
 current_status:=case when p.state='completed' then 'completed' else coalesce(s.status,p.state) end;
 if expected<>coalesce(s.revision,0) or expected_project<>p.revision then return jsonb_build_object('result','conflict','status',current_status,'revision',coalesce(s.revision,0),'projectRevision',p.revision); end if;
 if current_status='completed' then return jsonb_build_object('result','blocked','blockers',jsonb_build_array(jsonb_build_object('key','completed','label','Use the existing authorized Reopen project action before changing operational status.','href','/projects/'||p_request||'?tab=overview'))); end if;
 if action=current_status then return jsonb_build_object('result','saved','status',current_status,'revision',coalesce(s.revision,0),'projectRevision',p.revision,'noop',true); end if;
 if action in ('on_hold','inactive') and length(reason) not between 1 and 2000 then return jsonb_build_object('result','invalid','field','reason','message','Enter a reason between 1 and 2000 characters.'); end if;
 if action='active' and current_status in ('on_hold','waiting_on_client','inactive') and length(reason) not between 1 and 2000 then return jsonb_build_object('result','invalid','field','reason','message','Enter a reason between 1 and 2000 characters to resume or reactivate the project.'); end if;
 if action='waiting_on_client' then
   if current_status<>'active' then return jsonb_build_object('result','blocked','blockers',jsonb_build_array(jsonb_build_object('key','status','label','Waiting on client can only be set from Active work.','href','/projects/'||p_request||'?tab=brief'))); end if;
   if length(reason) not between 1 and 2000 or source_kind is null or v_source_id is null then return jsonb_build_object('result','invalid','field','dependency','message','Choose a verified unresolved client dependency and enter a reason.'); end if;
   if not exists(select 1 from public.staff_approvals a where a.request_id=p_request and a.waiting_on='client' and a.kind=source_kind and a.source_id=v_source_id)
      and not (source_kind='task_request' and exists(select 1 from public.project_client_task_responses r where r.request_id=p_request and r.id::text=v_source_id and r.status='pending')) then return jsonb_build_object('result','blocked','blockers',jsonb_build_array(jsonb_build_object('key','dependency','label','The selected client dependency is not current or is not waiting on the client.','href','/projects/'||p_request||'?tab=requests'))); end if;
 elsif action='inactive' then
   if p.state<>'active' then return jsonb_build_object('result','blocked','blockers',jsonb_build_array(jsonb_build_object('key','execution','label','Resume the execution state before final closeout.','href','/projects/'||p_request||'?tab=brief'))); end if;
   blockers:=public.project_operational_closeout_checklist(p_request);
   if jsonb_array_length(blockers)>0 then return jsonb_build_object('result','blocked','blockers',blockers); end if;
 elsif action='active' then
   if current_status='waiting_on_client' and exists(select 1 from public.project_operational_status prior where prior.request_id=p_request and (exists(select 1 from public.staff_approvals a where a.request_id=p_request and a.waiting_on='client' and a.kind=prior.waiting_source_kind and a.source_id=prior.waiting_source_id) or (prior.status='waiting_on_client' and prior.waiting_source_kind='task_request' and exists(select 1 from public.project_client_task_responses r where r.request_id=p_request and r.id::text=prior.waiting_source_id and r.status='pending')))) then
     return jsonb_build_object('result','blocked','blockers',jsonb_build_array(jsonb_build_object('key','dependency','label','The recorded client dependency is still unresolved. Resolve it before explicitly resuming work.','href','/projects/'||p_request||'?tab=requests')));
   end if;
   if not public.project_prerequisites_met(p_request) or not exists(select 1 from public.inquiry_proposals where request_id=p_request and version=p.proposal_version and status='accepted') then return jsonb_build_object('result','blocked','blockers',jsonb_build_array(jsonb_build_object('key','activation','label','Resolve project activation prerequisites and confirm the current accepted scope before resuming work.','href','/projects/'||p_request||'?tab=brief'))); end if;
 end if;
 if action='on_hold' and p.state='active' then
   manager_result:=public.manage_inquiry_project(p_request,jsonb_build_object('action','hold','expectedRevision',p.revision,'reason',reason));
   if manager_result->>'result'<>'saved' then return jsonb_build_object('result',case when manager_result->>'result'='conflict' then 'conflict' else 'blocked' end,'detail',manager_result); end if;
 elsif action='active' and current_status='on_hold' then
   manager_result:=public.manage_inquiry_project(p_request,jsonb_build_object('action','resume','expectedRevision',p.revision,'reason',coalesce(nullif(reason,''),'Operational status resumed')));
   if manager_result->>'result'<>'saved' then return jsonb_build_object('result',case when manager_result->>'result'='conflict' then 'conflict' else 'blocked' end,'detail',manager_result); end if;
 end if;
 select * into p from public.inquiry_projects where request_id=p_request;
 next_revision:=coalesce(s.revision,0)+1; old_status:=current_status;
 insert into public.project_operational_status(request_id,status,revision,reason,waiting_source_kind,waiting_source_id,updated_at,updated_by)
 values(p_request,action,next_revision,coalesce(nullif(reason,''),case when action='active' then 'Staff resumed project work' else '' end),case when action='waiting_on_client' then source_kind end,case when action='waiting_on_client' then v_source_id end,changed_at,actor)
 on conflict(request_id) do update set status=excluded.status,revision=excluded.revision,reason=excluded.reason,waiting_source_kind=excluded.waiting_source_kind,waiting_source_id=excluded.waiting_source_id,updated_at=excluded.updated_at,updated_by=excluded.updated_by;
 insert into public.project_event_history(request_id,source,action,item_id,actor,details,created_at)
 values(p_request,'project','operational_status_changed',p_request::text,actor,jsonb_build_object('oldStatus',old_status,'newStatus',action,'reason',reason,'waitingSourceKind',case when action='waiting_on_client' then source_kind end,'waitingSourceId',case when action='waiting_on_client' then v_source_id end),changed_at);
 return jsonb_build_object('result','saved','status',action,'revision',next_revision,'projectRevision',p.revision,'savedAt',changed_at,'reason',reason);
end; $$;
revoke all on function public.manage_project_operational_status(uuid,jsonb) from public,anon,service_role;
grant execute on function public.manage_project_operational_status(uuid,jsonb) to authenticated;

-- Inactive is read-only for operational work. A targeted title-only rename is
-- independent; reactivation changes only the sidecar (and legacy hold/resume RPC).
create function public.guard_inactive_project_work() returns trigger
language plpgsql security definer set search_path='' as $$
declare rid uuid;
begin
 rid:=case when tg_op='DELETE' then old.request_id else new.request_id end;
 if exists(select 1 from public.project_operational_status s where s.request_id=rid and s.status='inactive') then
   raise exception 'Project is Inactive. Reactivate it before changing work, assignments, dates, phases, files, notes, discussion or meetings.' using errcode='23514';
 end if;
 if tg_op='DELETE' then return old; else return new; end if;
end; $$;
revoke all on function public.guard_inactive_project_work() from public,anon,authenticated,service_role;
create trigger r8_inactive_project_body before update of body on public.inquiry_projects for each row
 when (old.body - 'title' is distinct from new.body - 'title') execute function public.guard_inactive_project_work();
do $$ declare target text; begin
 foreach target in array array['project_task_controls','project_subtasks','project_milestone_phases','project_task_schedule','project_task_members','project_task_notes','project_task_file_links','project_phase_states','project_phase_colors','project_lifecycle','project_meetings','project_files','project_comments','project_client_task_responses','project_change_requests'] loop
   if to_regclass('public.'||target) is not null then
     execute format('create trigger r8_inactive_work_guard before insert or update or delete on public.%I for each row execute function public.guard_inactive_project_work()',target);
   end if;
 end loop;
end $$;
commit;
