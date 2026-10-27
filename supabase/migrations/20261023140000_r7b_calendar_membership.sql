-- R7B follow-up: append multi-assignee membership without multiplying events.
-- Membership RPCs validate eligibility; the established staff deactivation trigger
-- prunes inactive members. Do not join the self-readable inquiry_staff table here.
-- Generated with migration new; ordered after the R7B integrity migration.
begin;
create or replace view public.staff_calendar with(security_invoker=true) as
select events.*,
 array(
  select tm.user_id from public.project_task_members tm
  where events.event_type in ('task','task_start') and tm.request_id=events.request_id and tm.task_id=events.source_id and tm.side='bivi'
  union
  select events.assigned_staff_id where events.assigned_staff_id is not null
   and not exists(select 1 from public.project_task_members tm where tm.request_id=events.request_id and tm.task_id=events.source_id and tm.side='bivi')
 ) as assignee_ids
from (
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
where (select public.is_inquiry_staff()) and s.start_on is not null and t.value->>'id'=s.task_id
) events;
-- CREATE OR REPLACE retains existing staff SELECT grants and the RLS-bound view mode.
commit;
