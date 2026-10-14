begin;
create index proposal_directory_status_updated on public.inquiry_proposals(status,updated_at desc,request_id,version);
create view public.proposals_directory with(security_invoker=true) as
select p.request_id,p.version,p.revision,p.status,coalesce(nullif(p.body->>'title',''),'Untitled proposal') as title,
 lower(coalesce(p.body->>'title','')) as title_sort,p.created_at,p.updated_at,p.issued_at,p.accepted_on,
 i.status as inquiry_status,coalesce(i.payload->>'name','') as contact_name,coalesce(i.payload->>'email','') as contact_email,
 coalesce(o.name,nullif(i.payload->>'company',''),nullif(i.payload->>'name',''),'Inquiry') as company_name,
 lower(coalesce(o.name,nullif(i.payload->>'company',''),nullif(i.payload->>'name',''),'Inquiry')) as company_sort,
 o.id as company_id,o.public_id as company_public_id,
 p.version=max(p.version) over(partition by p.request_id) as is_latest
from public.inquiry_proposals p join public.project_inquiries i on i.request_id=p.request_id
left join public.inquiry_client_organizations ico on ico.request_id=p.request_id
left join public.client_organizations o on o.id=ico.organization_id
where (select public.is_inquiry_staff());
revoke all on public.proposals_directory from public,anon,service_role;
grant select on public.proposals_directory to authenticated;
commit;
