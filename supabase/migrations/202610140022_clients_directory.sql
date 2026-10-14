begin;
alter table public.company_profiles add column primary_contact_id integer references public.people_contacts(id) on delete set null;
create function public.validate_company_primary_contact() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.primary_contact_id is not null and not exists(select 1 from public.people_contacts where id=new.primary_contact_id and company_id=new.organization_id and status='active') then raise exception 'Choose an active person assigned to this company' using errcode='22023';end if;
 if tg_op='UPDATE' and new.primary_contact_id is distinct from old.primary_contact_id then new.revision:=old.revision+1;new.updated_at:=now();end if;
 return new;
end;$$;
revoke all on function public.validate_company_primary_contact() from public,anon,authenticated,service_role;
create trigger company_primary_contact_valid before insert or update of primary_contact_id on public.company_profiles for each row execute function public.validate_company_primary_contact();
create function public.clear_moved_company_primary() returns trigger language plpgsql security definer set search_path='' as $$
begin
 update public.company_profiles set primary_contact_id=null where primary_contact_id=new.id and (organization_id is distinct from new.company_id or new.status<>'active');return new;
end;$$;
revoke all on function public.clear_moved_company_primary() from public,anon,authenticated,service_role;
create trigger person_primary_company_changed after update of company_id,status on public.people_contacts for each row execute function public.clear_moved_company_primary();
create function public.save_company_primary_contact(p_company uuid,p_contact integer,p_revision integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare current public.company_profiles;
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if p_contact is not null then perform 1 from public.people_contacts where id=p_contact and company_id=p_company and status='active' for update;if not found then raise exception 'Choose an active person assigned to this company' using errcode='22023';end if;end if;
 select * into current from public.company_profiles where organization_id=p_company for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if current.revision is distinct from p_revision then return jsonb_build_object('result','conflict');end if;
 update public.company_profiles set primary_contact_id=p_contact where organization_id=p_company;
 return jsonb_build_object('result','saved');
end;$$;
revoke all on function public.save_company_primary_contact(uuid,integer,integer) from public,anon,service_role;
grant execute on function public.save_company_primary_contact(uuid,integer,integer) to authenticated;
create index company_primary_contact_lookup on public.company_profiles(primary_contact_id) where primary_contact_id is not null;
create index proposals_accepted_clients on public.inquiry_proposals(request_id,updated_at) where status='accepted';
create or replace view public.clients_directory with(security_invoker=true) as
with projects as(
 select company_id,count(*)::integer as project_count,count(*) filter(where state='active')::integer as active_projects,count(*) filter(where state='on_hold')::integer as held_projects,count(*) filter(where state='completed')::integer as completed_projects,max(updated_at) as latest_update
 from public.inquiry_projects where company_id is not null group by company_id
),accepted as(
 select ico.organization_id,count(distinct p.request_id)::integer as accepted_inquiries,max(p.updated_at) as latest_acceptance from public.inquiry_client_organizations ico join public.inquiry_proposals p on p.request_id=ico.request_id and p.status='accepted' group by ico.organization_id
),people as(
 select company_id,count(*) filter(where status='active')::integer as active_people from public.people_contacts where company_id is not null group by company_id
),accounts as(
 select m.organization_id,count(distinct m.user_id)::integer as linked_accounts,
 count(distinct m.user_id) filter(where exists(select 1 from public.project_clients pc join public.inquiry_client_organizations ico on ico.request_id=pc.request_id where pc.user_id=m.user_id and pc.active and ico.organization_id=m.organization_id))::integer as portal_accounts
 from public.client_organization_members m where m.active group by m.organization_id
)
select d.*,p.primary_contact_id,c.name as primary_contact_name,c.email as primary_contact_email,
 coalesce(pr.project_count,0) as project_count,coalesce(pr.active_projects,0) as active_projects,coalesce(pr.held_projects,0) as held_projects,coalesce(pr.completed_projects,0) as completed_projects,
 coalesce(a.accepted_inquiries,0) as accepted_inquiries,coalesce(pe.active_people,0) as active_people,coalesce(ac.linked_accounts,0) as linked_accounts,coalesce(ac.portal_accounts,0) as portal_accounts,
 case when pr.active_projects>0 then 'active' when pr.held_projects>0 then 'on_hold' when pr.completed_projects>0 then 'completed' else 'onboarding' end as work_status,
 greatest(d.updated_at,pr.latest_update,a.latest_acceptance) as last_activity
from public.company_directory d join public.company_profiles p on p.organization_id=d.id
left join public.people_contacts c on c.id=p.primary_contact_id
left join projects pr on pr.company_id=d.id left join accepted a on a.organization_id=d.id left join people pe on pe.company_id=d.id left join accounts ac on ac.organization_id=d.id
where (select public.is_inquiry_staff()) and (coalesce(pr.project_count,0)>0 or coalesce(a.accepted_inquiries,0)>0);
revoke all on public.clients_directory from public,anon,service_role;
grant select on public.clients_directory to authenticated;
create view public.client_accepted_inquiries with(security_invoker=true) as
select ico.organization_id,p.request_id,p.accepted_on,p.updated_at,coalesce(nullif(p.body->>'title',''),'Accepted inquiry') as title
from public.inquiry_client_organizations ico join public.inquiry_proposals p on p.request_id=ico.request_id and p.status='accepted'
where (select public.is_inquiry_staff());
revoke all on public.client_accepted_inquiries from public,anon,service_role;
grant select on public.client_accepted_inquiries to authenticated;
commit;
