begin;
-- Keep profile/contact channels and new relationships in one transaction.
alter function public.save_people_profile(integer,integer,jsonb) rename to save_people_profile_v018;
revoke all on function public.save_people_profile_v018(integer,integer,jsonb) from public,anon,authenticated,service_role;
create function public.save_people_profile(p_id integer,p_revision integer,p_body jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare saved jsonb;current public.people_contacts;chosen_company uuid;ref_person integer;ref_company uuid;assigned jsonb;
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if p_body is null or jsonb_typeof(p_body)<>'object' then raise exception 'Invalid contact';end if;
 if p_id is not null then
 select * into current from public.people_contacts where id=p_id for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if current.revision is distinct from p_revision then return jsonb_build_object('result','conflict');end if;
 end if;
 ref_person:=case when p_body?'referral_contact_id' then (p_body->>'referral_contact_id')::integer else current.referral_contact_id end;
 ref_company:=case when p_body?'referral_company_id' then (p_body->>'referral_company_id')::uuid else current.referral_company_id end;
 if ref_person=p_id then raise exception 'A person cannot refer themselves' using errcode='22023';end if;
 if (ref_person is not null or ref_company is not null) and p_body->>'lead_source' in ('manual','referral') then p_body:=p_body||jsonb_build_object('lead_source','referral');end if;
 saved:=public.save_people_profile_v018(p_id,p_revision,p_body);
 if saved->>'result' is distinct from 'saved' then return saved;end if;
 select * into current from public.people_contacts where id=(saved->>'id')::integer for update;
 if ref_person=current.id then raise exception 'A person cannot refer themselves' using errcode='22023';end if;
 update public.people_contacts set referral_contact_id=ref_person,referral_company_id=ref_company where id=current.id;
 if p_body?'company_id' then
 chosen_company:=(p_body->>'company_id')::uuid;
 if chosen_company is distinct from current.company_id then
 assigned:=public.assign_person_company(current.id,chosen_company,p_body->>'job_title',p_body->>'company_role',current.revision);
 if assigned->>'result' is distinct from 'assigned' then raise exception 'Company assignment could not be confirmed';end if;
 end if;
 end if;
 return saved;
end;$$;
revoke all on function public.save_people_profile(integer,integer,jsonb) from public,anon,service_role;
grant execute on function public.save_people_profile(integer,integer,jsonb) to authenticated;
commit;
