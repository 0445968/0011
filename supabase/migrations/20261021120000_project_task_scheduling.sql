-- R6a/R6b: staff-owned task schedule start dates and auditable calendar projection.
-- Due dates remain in inquiry_projects.body and continue to drive existing client views.
begin;

create table public.project_task_schedule (
  request_id uuid not null,
  task_id text not null,
  start_on date,
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key (request_id, task_id),
  foreign key (request_id, task_id) references public.project_task_controls(request_id, task_id) on delete cascade
);
create index project_task_schedule_start on public.project_task_schedule(start_on,request_id) where start_on is not null;

create table public.project_task_schedule_history (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  task_id text not null,
  previous_start_on date,
  next_start_on date,
  revision integer not null check (revision > 0),
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index project_task_schedule_history_recent on public.project_task_schedule_history(request_id,id desc);

alter table public.project_task_schedule enable row level security;
alter table public.project_task_schedule_history enable row level security;
revoke all on public.project_task_schedule,public.project_task_schedule_history from public,anon,authenticated,service_role;
grant select on public.project_task_schedule,public.project_task_schedule_history to authenticated;
create policy task_schedule_staff_read on public.project_task_schedule
  for select to authenticated using ((select public.is_inquiry_staff()));
create policy task_schedule_history_staff_read on public.project_task_schedule_history
  for select to authenticated using ((select public.is_inquiry_staff()));

create function public.manage_project_task_schedule(p_request uuid,p_task_id text,p_start_on date,p_project_revision integer,p_schedule_revision integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); project public.inquiry_projects%rowtype; current_row public.project_task_schedule%rowtype; task_row jsonb; due_date date; next_revision integer;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if p_task_id is null or length(btrim(p_task_id)) not between 1 and 100 or p_project_revision<1 or p_schedule_revision<0 then raise exception 'Invalid schedule command' using errcode='22023'; end if;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 if project.state='completed' then return jsonb_build_object('result','locked'); end if;
 if project.revision<>p_project_revision then return jsonb_build_object('result','conflict'); end if;
 select t into task_row from jsonb_array_elements(project.body->'tasks') t where t->>'id'=p_task_id;
 if task_row is null then return jsonb_build_object('result','not_found'); end if;
 if nullif(task_row->>'dueOn','') is not null then due_date:=(task_row->>'dueOn')::date; end if;
 if p_start_on is not null and due_date is not null and p_start_on>due_date then return jsonb_build_object('result','invalid_dates'); end if;
 select * into current_row from public.project_task_schedule s where s.request_id=p_request and s.task_id=p_task_id for update;
 if coalesce(current_row.revision,0)<>p_schedule_revision then return jsonb_build_object('result','conflict'); end if;
 if current_row.start_on is not distinct from p_start_on then return jsonb_build_object('result','saved','revision',p_schedule_revision); end if;
 next_revision:=p_schedule_revision+1;
 insert into public.project_task_schedule(request_id,task_id,start_on,revision,updated_at,updated_by)
 values(p_request,p_task_id,p_start_on,next_revision,now(),actor)
 on conflict(request_id,task_id) do update set start_on=excluded.start_on,revision=excluded.revision,updated_at=now(),updated_by=actor;
 insert into public.project_task_schedule_history(request_id,task_id,previous_start_on,next_start_on,revision,actor)
 values(p_request,p_task_id,current_row.start_on,p_start_on,next_revision,actor);
 insert into public.project_task_history(request_id,task_id,action,snapshot,actor)
 values(p_request,p_task_id,'metadata',jsonb_build_object('change','start_date','before',current_row.start_on,'after',p_start_on,'revision',next_revision),actor);
 return jsonb_build_object('result','saved','revision',next_revision);
end;$$;
revoke all on function public.manage_project_task_schedule(uuid,text,date,integer,integer) from public,anon,service_role;
grant execute on function public.manage_project_task_schedule(uuid,text,date,integer,integer) to authenticated;

create or replace view public.staff_calendar with(security_invoker=true) as
select 'task:'||p.request_id||':'||md5(t.value->>'id') as event_key,
 'task'::text as event_type,p.request_id,t.value->>'id' as source_id,
 t.value->>'title' as title,(t.value->>'dueOn')::date as due_on,
 t.value->>'status' as status,t.value->>'status'='done' as is_done,
 coalesce(p.body->>'title','Project') as project_title,p.public_id as project_public_id,p.state as project_state,
 c.assigned_staff_id,c.owner_type
from public.inquiry_projects p
cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
left join public.project_task_controls c on c.request_id=p.request_id and c.task_id=t.value->>'id'
where (select public.is_inquiry_staff()) and t.value->>'dueOn' is not null
union all
select 'milestone:'||p.request_id||':'||md5(m.value->>'id'),
 'milestone',p.request_id,m.value->>'id',m.value->>'title',(m.value->>'dueOn')::date,
 m.value->>'status',m.value->>'status'='done',coalesce(p.body->>'title','Project'),p.public_id,p.state,
 null::uuid,null::text
from public.inquiry_projects p
cross join lateral jsonb_array_elements(p.body->'milestones') m(value)
where (select public.is_inquiry_staff()) and m.value->>'dueOn' is not null
union all
select 'task-start:'||p.request_id||':'||md5(t.value->>'id'),
 'task_start',p.request_id,t.value->>'id',t.value->>'title',s.start_on,
 t.value->>'status',t.value->>'status'='done',coalesce(p.body->>'title','Project'),p.public_id,p.state,
 c.assigned_staff_id,c.owner_type
from public.project_task_schedule s
join public.inquiry_projects p on p.request_id=s.request_id
join public.project_task_controls c on c.request_id=s.request_id and c.task_id=s.task_id
cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
where (select public.is_inquiry_staff()) and s.start_on is not null and t.value->>'id'=s.task_id;

revoke all on public.staff_calendar from public,anon,service_role;
grant select on public.staff_calendar to authenticated;

-- Expose internal start dates to the same authorized staff who see the task in My Tasks.
create or replace view public.staff_my_tasks with(security_invoker=true) as
select p.request_id,p.public_id as project_public_id,coalesce(p.body->>'title','Project') as project_title,lower(coalesce(p.body->>'title','')) as project_sort,p.state as project_state,p.revision as project_revision,
 c.task_id,c.revision as control_revision,c.phase,c.service_id,c.blocker_owner,c.depends_on,
 t.value->>'title' as title,lower(t.value->>'title') as title_sort,t.value->>'status' as task_status,t.value->>'owner' as owner_label,(t.value->>'dueOn')::date as due_on,
 (t.value->>'status'<>'done' and (t.value->>'status'='blocked' or c.blocker_owner is not null or (c.depends_on is not null and not exists(select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done')))) as is_blocked,
 greatest(p.updated_at,c.updated_at,coalesce((select schedule.updated_at from public.project_task_schedule schedule where schedule.request_id=c.request_id and schedule.task_id=c.task_id),c.updated_at)) as updated_at,
 greatest((select count(*)::integer from public.project_task_members tm where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.side='bivi'),case when c.assigned_staff_id is not null then 1 else 0 end) as assignee_count,
 c.priority as priority,
 (select schedule.start_on from public.project_task_schedule schedule where schedule.request_id=c.request_id and schedule.task_id=c.task_id) as start_on
from public.project_task_controls c join public.inquiry_projects p on p.request_id=c.request_id
cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
where (select public.is_inquiry_staff()) and c.owner_type='bivi' and t.value->>'id'=c.task_id
 and (exists(select 1 from public.project_task_members tm join public.inquiry_staff s on s.user_id=tm.user_id and s.active where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.user_id=auth.uid() and tm.side='bivi')
  or (not exists(select 1 from public.project_task_members tm where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.side='bivi') and c.assigned_staff_id=auth.uid()));
revoke all on public.staff_my_tasks from public,anon,service_role;
grant select on public.staff_my_tasks to authenticated;
commit;
