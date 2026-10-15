begin;
create index brief_approval_status on public.project_brief_versions(status,published_at);
create index change_approval_state on public.project_change_requests(state,updated_at);
create view public.staff_approvals with(security_invoker=true) as
with projects as(
 select p.request_id,p.public_id,coalesce(p.body->>'title','Project') as title,p.state,coalesce(l.phase,'discovery') as phase,
 (select count(*) from public.project_clients pc where pc.request_id=p.request_id and pc.active and pc.can_review) as reviewers
 from public.inquiry_projects p left join public.project_lifecycle l on l.request_id=p.request_id
 where (select public.is_inquiry_staff()) and p.state<>'completed'
),latest_updates as(
 select distinct on(request_id) request_id,version,body,created_at from public.project_publications where not withdrawn order by request_id,version desc
),update_reviews as(
 select u.*,
 exists(select 1 from public.project_client_reviews r join public.project_clients pc on pc.request_id=r.request_id and pc.user_id=r.user_id and pc.active and pc.can_review where r.request_id=u.request_id and r.version=u.version and r.decision='changes_requested') as needs_changes,
 (select count(*) from public.project_clients pc where pc.request_id=u.request_id and pc.active and pc.can_review and not exists(select 1 from public.project_client_reviews r where r.request_id=pc.request_id and r.user_id=pc.user_id and r.version=u.version)) as outstanding
 from latest_updates u where u.body->>'reviewRequested'='true'
),items as(
 select b.request_id,'brief'::text as kind,b.version::text as source_id,b.version,
 'Project brief'::text as title,b.status as source_status,
 case when b.status='changes_requested' or p.reviewers=0 then 'staff' else 'client' end as waiting_on,
 b.status='pending' and p.reviewers=0 as needs_reviewer,
 case when b.status='changes_requested' then 'Revise requested brief changes' when p.reviewers=0 then 'Assign a client reviewer' else 'Await brief decision' end as action_label,
 case when b.status='changes_requested' or p.reviewers=0 then 1 else 3 end as attention,
 coalesce(b.decided_at,b.published_at) as updated_at,true as required
 from public.project_brief_versions b join projects p on p.request_id=b.request_id where b.status in ('pending','changes_requested') and b.version=(select max(v.version) from public.project_brief_versions v where v.request_id=b.request_id)
 union all
 select v.request_id,'deliverable',v.deliverable_id,v.version,d.title,v.status,
 case when v.status='changes_requested' or p.reviewers=0 then 'staff' else 'client' end,v.status='pending_review' and p.reviewers=0,
 case when v.status='changes_requested' then 'Prepare revised deliverable' when p.reviewers=0 then 'Assign a client reviewer' else 'Await deliverable decision' end,
 case when v.status='changes_requested' or p.reviewers=0 then 1 else 3 end,coalesce(v.decided_at,v.created_at),d.requires_approval
 from public.project_deliverable_versions v join public.project_deliverables d using(request_id,deliverable_id) join projects p on p.request_id=v.request_id
 where v.status in ('pending_review','changes_requested') and v.version=(select max(v2.version) from public.project_deliverable_versions v2 where v2.request_id=v.request_id and v2.deliverable_id=v.deliverable_id)
 union all
 select c.request_id,'change',c.id::text,null,c.title,c.state,
 case when c.state='proposed' and p.reviewers>0 then 'client' else 'staff' end,c.state='proposed' and p.reviewers=0,
 case when c.state='accepted' then 'Apply approved change' when c.state='proposed' and p.reviewers=0 then 'Assign a client reviewer' when c.state='proposed' then 'Await impact decision' else 'Evaluate request and propose impacts' end,
 case when c.state='proposed' and p.reviewers=0 then 1 when c.state='proposed' then 3 else 2 end,c.updated_at,true
 from public.project_change_requests c join projects p on p.request_id=c.request_id where c.state in ('requested','evaluating','proposed','accepted')
 union all
 select u.request_id,'update',u.version::text,u.version,coalesce(u.body->>'title','Progress update'),
 case when u.needs_changes then 'changes_requested' else 'pending_review' end,
 case when u.needs_changes or p.reviewers=0 then 'staff' else 'client' end,not u.needs_changes and p.reviewers=0,
 case when u.needs_changes then 'Address client feedback' when p.reviewers=0 then 'Assign a client reviewer' else 'Await progress-update feedback' end,
 case when u.needs_changes or p.reviewers=0 then 1 else 3 end,u.created_at,false
 from update_reviews u join projects p on p.request_id=u.request_id where u.needs_changes or u.outstanding>0 or p.reviewers=0
 union all
 select q.request_id,'qa',q.check_id,null,q.title,q.status,'staff',false,case when q.status='failed' then 'Resolve failed QA check' else 'Complete required QA' end,case when q.status='failed' then 1 else 2 end,q.updated_at,true
 from public.project_qa_checks q join projects p on p.request_id=q.request_id where q.required and q.status in ('pending','failed') and (q.status='failed' or p.phase in ('qa','delivery','handoff'))
 union all
 select h.request_id,'handoff',h.item_id,null,h.title,h.status,'staff',false,'Complete required handoff',2,h.updated_at,true
 from public.project_handoff_items h join projects p on p.request_id=h.request_id join public.project_closeout c on c.request_id=h.request_id
 where h.required and h.status='pending' and (c.release_state='released' or p.phase='handoff')
 union all
 select c.request_id,'receipt','receipt',null,'Client release receipt',c.release_state,case when p.reviewers=0 then 'staff' else 'client' end,p.reviewers=0,
 case when p.reviewers=0 then 'Assign a client reviewer' else 'Await client receipt confirmation' end,case when p.reviewers=0 then 1 else 3 end,c.updated_at,true
 from public.project_closeout c join projects p on p.request_id=c.request_id where c.release_state='released' and c.client_receipt_at is null
 union all
 select c.request_id,'release','release',null,'Final release',c.release_state,'staff',false,'Release final work',2,c.updated_at,true
 from public.project_closeout c join projects p on p.request_id=c.request_id where c.release_state='preparing' and public.project_delivery_ready(c.request_id)
 union all
 select c.request_id,'closeout','closeout',null,'Handoff and support closeout',c.release_state,'staff',false,'Record support closeout',2,c.updated_at,true
 from public.project_closeout c join projects p on p.request_id=c.request_id where c.release_state='released' and c.client_receipt_at is not null and c.closed_at is null and not exists(select 1 from public.project_handoff_items h where h.request_id=c.request_id and h.required and h.status not in ('complete','waived'))
)
select i.*,i.kind||':'||i.request_id::text||':'||i.source_id||':'||coalesce(i.version::text,'') as approval_key,
 p.title as project_title,lower(p.title) as project_sort,p.public_id as project_public_id,p.state as project_state,p.phase
from items i join projects p on p.request_id=i.request_id;
revoke all on public.staff_approvals from public,anon,service_role;
grant select on public.staff_approvals to authenticated;
commit;
