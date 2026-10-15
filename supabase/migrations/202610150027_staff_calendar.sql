begin;
-- Read-only, date-only projections. Existing source RLS stays authoritative.
create view public.staff_calendar with(security_invoker=true) as
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
where (select public.is_inquiry_staff()) and m.value->>'dueOn' is not null;
revoke all on public.staff_calendar from public,anon,service_role;
grant select on public.staff_calendar to authenticated;
commit;
