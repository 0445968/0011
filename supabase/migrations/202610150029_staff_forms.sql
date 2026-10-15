begin;
create index onboarding_forms_directory on public.inquiry_onboarding_items(item_type,status,updated_at desc);

-- Live source records, never duplicated answers or a parallel form workflow.
create view public.staff_forms with(security_invoker=true) as
with inquiries as (
 select i.request_id,coalesce(i.payload->>'name','') as contact_name,
 coalesce(nullif(o.name,''),nullif(i.payload->>'company',''),'') as company_name,
 i.status as inquiry_status,i.created_at,p.request_id as project_id,p.body->>'title' as project_title,p.public_id as project_public_id
 from public.project_inquiries i left join public.inquiry_projects p on p.request_id=i.request_id
 left join public.inquiry_client_organizations ico on ico.request_id=i.request_id
 left join public.client_organizations o on o.id=coalesce(p.company_id,ico.organization_id)
 where (select public.is_inquiry_staff())
)
select 'intake:'||i.request_id as form_key,'intake'::text as form_type,i.request_id,null::text as item_key,
 'Project inquiry'::text as title,'submitted'::text as status,'client'::text as owner,true as required,
 null::date as due_on,true as has_response,i.created_at as updated_at,
 i.contact_name,i.company_name,i.inquiry_status,null::text as onboarding_state,i.project_id,i.project_title,i.project_public_id
from inquiries i
union all
select 'onboarding:'||f.request_id||':'||f.item_key,f.item_type,f.request_id,f.item_key,
 f.title,f.status,f.owner,f.required,f.due_on,btrim(f.response)<>'' as has_response,f.updated_at,
 i.contact_name,i.company_name,i.inquiry_status,h.state,i.project_id,i.project_title,i.project_public_id
from public.inquiry_onboarding_items f join inquiries i on i.request_id=f.request_id
join public.inquiry_onboarding h on h.request_id=f.request_id
where f.item_type in ('questionnaire','information_request','assessment');
revoke all on public.staff_forms from public,anon,service_role;
grant select on public.staff_forms to authenticated;

-- Choose an existing editable onboarding record. Its existing API authorizes every save.
create view public.staff_form_targets with(security_invoker=true) as
select h.request_id,h.state,h.updated_at,coalesce(i.payload->>'name','') as contact_name,
 coalesce(nullif(o.name,''),nullif(i.payload->>'company',''),'') as company_name,
 p.body->>'title' as project_title,p.public_id as project_public_id
from public.inquiry_onboarding h join public.project_inquiries i on i.request_id=h.request_id
left join public.inquiry_projects p on p.request_id=h.request_id
left join public.inquiry_client_organizations ico on ico.request_id=i.request_id
left join public.client_organizations o on o.id=coalesce(p.company_id,ico.organization_id)
where (select public.is_inquiry_staff()) and h.state='in_progress';
revoke all on public.staff_form_targets from public,anon,service_role;
grant select on public.staff_form_targets to authenticated;
commit;
