begin;
alter table public.people_notes add column author_label text not null default '' check(length(author_label)<=254);
create function public.add_person_note(p_contact integer,p_body text) returns uuid language plpgsql security definer set search_path='' as $$
declare note_id uuid;
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 insert into public.people_notes(contact_id,body,author_id,author_label) values(p_contact,btrim(p_body),auth.uid(),coalesce((select email from auth.users where id=auth.uid()),'Staff')) returning id into note_id;
 return note_id;
end;$$;
revoke all on function public.add_person_note(integer,text) from public,anon,service_role;
grant execute on function public.add_person_note(integer,text) to authenticated;
create function public.save_people_profile(p_id integer,p_revision integer,p_body jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare current public.people_contacts; saved jsonb; person_id integer; entry jsonb; channels jsonb; primary_email text;primary_phone text;
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if p_body is null or jsonb_typeof(p_body)<>'object' or octet_length(p_body::text)>32768 or p_revision is null then raise exception 'Invalid contact';end if;
 channels:=p_body->'channels';
 if jsonb_typeof(channels->'emails') is distinct from 'array' or jsonb_typeof(channels->'phones') is distinct from 'array' then raise exception 'Invalid channels';end if;
 if jsonb_array_length(channels->'emails') not between 1 and 20 or jsonb_array_length(channels->'phones')>20 then raise exception 'Invalid channels';end if;
 if (select count(*) from jsonb_array_elements(channels->'emails') e where e->>'is_primary'='true')<>1 or (jsonb_array_length(channels->'phones')>0 and (select count(*) from jsonb_array_elements(channels->'phones') e where e->>'is_primary'='true')<>1) then raise exception 'Choose primary channels';end if;
 if (select count(distinct lower(btrim(e->>'email'))) from jsonb_array_elements(channels->'emails') e)<>jsonb_array_length(channels->'emails') or (select count(distinct btrim(e->>'phone')) from jsonb_array_elements(channels->'phones') e)<>jsonb_array_length(channels->'phones') then raise exception 'Duplicate channels';end if;
 select lower(btrim(e->>'email')) into primary_email from jsonb_array_elements(channels->'emails') e where e->>'is_primary'='true';
 select btrim(e->>'phone') into primary_phone from jsonb_array_elements(channels->'phones') e where e->>'is_primary'='true';
 if p_body->>'email' is distinct from primary_email or p_body->>'phone' is distinct from coalesce(primary_phone,'') then raise exception 'Primary mismatch';end if;
 if p_id is null and p_body->>'lead_source' not in ('manual','referral') then raise exception 'Choose manual or referral source';end if;
 if p_id is not null then
 select * into current from public.people_contacts where id=p_id for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if current.revision is distinct from p_revision then return jsonb_build_object('result','conflict');end if;
 if current.lead_source not in ('manual','referral') and (p_body->>'lead_source' is distinct from current.lead_source or p_body->>'source_reference' is distinct from current.source_reference) then raise exception 'Automatic source is retained';end if;
 end if;
 -- The existing save function preserves identity, ownership, and conflict handling.
 saved:=public.save_people_contact(p_id,p_revision,jsonb_build_object('name',p_body->'name','email',p_body->'email','phone',p_body->'phone','company_name',p_body->'company_name','labels',p_body->'labels','notes',p_body->'notes'));
 if saved->>'result'<>'saved' then return saved;end if;
 person_id:=(saved->>'id')::integer;
 update public.people_contacts set job_title=p_body->>'job_title',company_role=p_body->>'company_role',status=p_body->>'status',lead_source=p_body->>'lead_source',source_reference=p_body->>'source_reference' where id=person_id;
 -- Primary synchronization has run. Replace channels inside the same transaction.
 delete from public.people_contact_emails where contact_id=person_id;
 for entry in select value from jsonb_array_elements(channels->'emails') loop
 insert into public.people_contact_emails(contact_id,email,kind,is_primary) values(person_id,lower(btrim(entry->>'email')),entry->>'kind',(entry->>'is_primary')::boolean);
 end loop;
 delete from public.people_contact_phones where contact_id=person_id;
 for entry in select value from jsonb_array_elements(channels->'phones') loop
 insert into public.people_contact_phones(contact_id,phone,kind,is_primary) values(person_id,btrim(entry->>'phone'),entry->>'kind',(entry->>'is_primary')::boolean);
 end loop;
 if jsonb_typeof(p_body->'project_roles') is distinct from 'array' or jsonb_array_length(p_body->'project_roles')>200 then raise exception 'Invalid roles';end if;
 for entry in select value from jsonb_array_elements(p_body->'project_roles') loop
 update public.people_inquiry_links set project_role=entry->>'role' where contact_id=person_id and request_id=(entry->>'request_id')::uuid and exists(select 1 from public.inquiry_projects where request_id=(entry->>'request_id')::uuid);
 if not found then raise exception 'Project relationship unavailable';end if;
 end loop;
 return saved;
end;$$;
revoke all on function public.save_people_profile(integer,integer,jsonb) from public,anon,service_role;
grant execute on function public.save_people_profile(integer,integer,jsonb) to authenticated;
commit;
