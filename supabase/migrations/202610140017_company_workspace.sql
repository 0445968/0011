begin;
alter table public.company_profiles add column lead_source text not null default 'manual' check(lead_source in ('project_onboarding','referral','manual','import','legacy')),
 add column source_reference text not null default '' check(length(source_reference)<=500),add column source_confirmed boolean not null default false;
update public.company_profiles p set lead_source='project_onboarding',source_reference=source.request_id::text,source_confirmed=true from(select distinct on(organization_id) organization_id,request_id from public.inquiry_client_organizations order by organization_id,created_at,request_id) source where source.organization_id=p.organization_id;
update public.company_profiles set lead_source='legacy',source_confirmed=true where source_reference='';
create function public.record_company_origin() returns trigger language plpgsql security definer set search_path='' as $$
begin
 update public.company_profiles set lead_source='project_onboarding',source_reference=new.request_id::text,source_confirmed=true where organization_id=new.organization_id and not source_confirmed;
 return new;
end;$$;
revoke all on function public.record_company_origin() from public,anon,authenticated,service_role;
create trigger company_origin_linked after insert on public.inquiry_client_organizations for each row execute function public.record_company_origin();
create function public.company_name_modified() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.name is distinct from new.name then update public.company_profiles set revision=revision+1,updated_at=now() where organization_id=new.id;end if;
 return new;
end;$$;
revoke all on function public.company_name_modified() from public,anon,authenticated,service_role;
create trigger company_name_modified after update of name on public.client_organizations for each row execute function public.company_name_modified();
create function public.save_company_profile(p_id uuid,p_revision integer,p_name text,p_body jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare target uuid:=p_id;current_revision integer;
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if p_body is null or jsonb_typeof(p_body)<>'object' or octet_length(p_body::text)>8192 then raise exception 'Invalid company';end if;
 if p_id is null then
  insert into public.client_organizations(name,created_by) values(btrim(p_name),auth.uid()) returning id into target;
  select revision into current_revision from public.company_profiles where organization_id=target for update;
 else
  perform 1 from public.client_organizations where id=target for update;
  if not found then return jsonb_build_object('result','not_found');end if;
  select revision into current_revision from public.company_profiles where organization_id=target for update;
  if not found then return jsonb_build_object('result','not_found');end if;
  if current_revision is distinct from p_revision then return jsonb_build_object('result','conflict');end if;
  update public.client_organizations set name=btrim(p_name) where id=target;
 end if;
 update public.company_profiles set status=p_body->>'status',website=coalesce(p_body->>'website',''),address=p_body->'address',industry_id=nullif(p_body->>'industry_id',''),subindustry_id=nullif(p_body->>'subindustry_id',''),legal_name=coalesce(p_body->>'legal_name',''),organization_type=coalesce(p_body->>'organization_type',''),founding_year=(p_body->>'founding_year')::integer,employee_count=(p_body->>'employee_count')::integer,
 revision=case when p_id is null then current_revision else current_revision+1 end,
 lead_source=case when p_id is null then 'manual' else lead_source end,source_confirmed=true,updated_at=now() where organization_id=target;
 return jsonb_build_object('result','saved','id',target);
end;$$;
revoke all on function public.save_company_profile(uuid,integer,text,jsonb) from public,anon,service_role;
grant execute on function public.save_company_profile(uuid,integer,text,jsonb) to authenticated;
create table public.company_assignment_history(
 id uuid primary key default gen_random_uuid(),subject_id text not null references public.business_id_ledger(public_id),subject_type text not null check(subject_type in ('person','project')),
 previous_company_id uuid references public.client_organizations(id) on delete set null,new_company_id uuid references public.client_organizations(id) on delete set null,
 actor_id uuid references auth.users(id) on delete set null,details jsonb not null default '{}',created_at timestamptz not null default now()
);
alter table public.company_assignment_history enable row level security;
revoke all on public.company_assignment_history from public,anon,authenticated,service_role;
grant select on public.company_assignment_history to authenticated;
create policy company_assignments_staff_read on public.company_assignment_history for select to authenticated using((select public.is_inquiry_staff()));
create or replace function public.assign_person_company(p_contact integer,p_company uuid,p_title text,p_role text,p_revision integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare current public.people_contacts;
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 select * into current from public.people_contacts where id=p_contact for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if current.revision is distinct from p_revision then return jsonb_build_object('result','conflict');end if;
 update public.people_contacts set company_id=p_company,company_assignment_manual=true,job_title=case when p_company is null then '' else p_title end,company_role=case when p_company is null then 'other' else p_role end,revision=revision+1,updated_at=now() where id=p_contact;
 insert into public.company_assignment_history(subject_id,subject_type,previous_company_id,new_company_id,actor_id,details) values(current.public_id,'person',current.company_id,p_company,auth.uid(),jsonb_build_object('title',p_title,'role',p_role));
 return jsonb_build_object('result','assigned','revision',current.revision+1);
end;$$;
create function public.assign_project_company(p_request uuid,p_company uuid,p_revision integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare current public.inquiry_projects;
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 select * into current from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if current.revision is distinct from p_revision then return jsonb_build_object('result','conflict');end if;
 update public.inquiry_projects set company_id=p_company,company_assignment_manual=true,revision=revision+1,updated_at=now(),updated_by=auth.uid() where request_id=p_request;
 insert into public.company_assignment_history(subject_id,subject_type,previous_company_id,new_company_id,actor_id) values(current.public_id,'project',current.company_id,p_company,auth.uid());
 return jsonb_build_object('result','assigned','revision',current.revision+1);
end;$$;
revoke all on function public.assign_project_company(uuid,uuid,integer) from public,anon,service_role;
grant execute on function public.assign_project_company(uuid,uuid,integer) to authenticated;
alter table public.company_notes add column author_label text not null default '' check(length(author_label)<=254);
update public.company_notes n set author_label=coalesce(u.email,'Staff') from auth.users u where n.author_id=u.id;
create function public.add_company_note(p_company uuid,p_body text) returns uuid language plpgsql security definer set search_path='' as $$
declare note_id uuid;
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 insert into public.company_notes(organization_id,body,author_id,author_label) values(p_company,btrim(p_body),auth.uid(),coalesce((select u.email from auth.users u where u.id=auth.uid()),'Staff')) returning id into note_id;
 update public.company_profiles set updated_at=now() where organization_id=p_company;
 return note_id;
end;$$;
revoke all on function public.add_company_note(uuid,text) from public,anon,service_role;
grant execute on function public.add_company_note(uuid,text) to authenticated;
create or replace view public.company_directory with(security_invoker=true) as
select o.id,o.public_id,o.name,o.created_at,p.status,p.website,p.address,p.industry_id,p.subindustry_id,p.legal_name,p.organization_type,p.founding_year,p.employee_count,p.logo_path,p.updated_at,p.revision,
(select c.id from public.people_contacts c where c.company_id=o.id and c.company_role='ceo' and c.status='active') as ceo_contact_id,
(select c.name from public.people_contacts c where c.company_id=o.id and c.company_role='ceo' and c.status='active') as ceo_name,
lower(o.name) as name_sort,p.address->>'country' as country,p.address->>'city' as city,p.lead_source,p.source_reference,i.name as industry_name,s.name as subindustry_name
from public.client_organizations o join public.company_profiles p on p.organization_id=o.id left join public.business_industries i on i.id=p.industry_id left join public.business_subindustries s on s.id=p.subindustry_id where public.is_inquiry_staff();
create view public.staff_project_assignment_directory with(security_invoker=true) as
select request_id,public_id,revision,body->>'title' as title,state,company_id,activated_at from public.inquiry_projects where public.is_inquiry_staff();
revoke all on public.staff_project_assignment_directory from public,anon,service_role;
grant select on public.staff_project_assignment_directory to authenticated;
create index company_status_sort on public.company_profiles(status,updated_at);
create index company_industry_filter on public.company_profiles(industry_id,subindustry_id);
create index company_country_filter on public.company_profiles((address->>'country'));
create index company_name_sort on public.client_organizations(lower(name),id);
commit;
