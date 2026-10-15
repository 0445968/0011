begin;
-- Permanent allocation ledger: contact numbers are random and never recycled.
create table public.people_id_ledger(id integer primary key check(id between 1 and 999999999));
alter table public.people_id_ledger enable row level security;
revoke all on public.people_id_ledger from public,anon,authenticated,service_role;
create function public.allocate_people_id() returns integer language plpgsql security definer set search_path='' as $$
declare candidate integer; allocated integer;
begin
 for attempt in 1..1000 loop
  candidate:=1+floor(random()*999999999)::integer;
  insert into public.people_id_ledger(id) values(candidate) on conflict do nothing returning id into allocated;
  if allocated is not null then return allocated; end if;
 end loop;
 raise exception 'Contact ID allocation exhausted';
end;$$;
revoke all on function public.allocate_people_id() from public,anon,authenticated,service_role;
create table public.people_contacts(
 id integer primary key default public.allocate_people_id() references public.people_id_ledger(id),
 name text not null check(length(btrim(name)) between 1 and 200),
 email text not null check(length(email) between 3 and 254 and email=lower(btrim(email))),
 phone text not null default '' check(length(phone)<=80),
 company_name text not null default '' check(length(company_name)<=200),
 labels text[] not null default array['lead']::text[] check(cardinality(labels) between 1 and 5 and labels <@ array['lead','client','partner','collaborator','vendor']::text[]),
 notes text not null default '' check(length(notes)<=4000),
 revision integer not null default 1, created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(email)
);
create table public.people_inquiry_links(
 contact_id integer not null references public.people_contacts(id),
 request_id uuid not null references public.project_inquiries(request_id) on delete cascade,
 company_name text not null default '' check(length(company_name)<=200),
 primary key(contact_id,request_id)
);
create index people_name_sort on public.people_contacts(lower(name),id);
create index people_labels on public.people_contacts using gin(labels);
create index people_inquiries_request on public.people_inquiry_links(request_id,contact_id);
create index people_updated_sort on public.people_contacts(updated_at,id);
-- Only staff can read. All writes use checked RPCs or the private intake trigger.
alter table public.people_contacts enable row level security;
alter table public.people_inquiry_links enable row level security;
revoke all on public.people_contacts,public.people_inquiry_links from public,anon,authenticated,service_role;
grant select on public.people_contacts,public.people_inquiry_links to authenticated;
create policy people_staff_read on public.people_contacts for select to authenticated using((select public.is_inquiry_staff()));
create policy people_links_staff_read on public.people_inquiry_links for select to authenticated using((select public.is_inquiry_staff()));
create function public.sync_inquiry_person() returns trigger language plpgsql security definer set search_path='' as $$
declare person integer; address text:=lower(btrim(coalesce(new.payload->>'email',''))); full_name text:=btrim(coalesce(new.payload->>'name',''));
begin
 if address='' then return new; end if;
 -- Public submissions cannot overwrite an existing person's identity or notes.
 insert into public.people_contacts(name,email) values(left(coalesce(nullif(full_name,''),address),200),address)
 on conflict(email) do update set email=excluded.email returning id into person;
 insert into public.people_inquiry_links(contact_id,request_id,company_name) values(person,new.request_id,left(coalesce(new.payload->>'company',''),200)) on conflict do nothing;
 return new;
end;$$;
revoke all on function public.sync_inquiry_person() from public,anon,authenticated,service_role;
create trigger inquiry_person_created after insert on public.project_inquiries for each row execute function public.sync_inquiry_person();
-- Deterministic identity matching by normalized email, without overwriting staff edits.
insert into public.people_contacts(name,email)
select distinct on(lower(btrim(payload->>'email'))) left(coalesce(nullif(btrim(payload->>'name'),''),btrim(payload->>'email')),200),lower(btrim(payload->>'email'))
from public.project_inquiries where coalesce(btrim(payload->>'email'),'')<>'' order by lower(btrim(payload->>'email')),created_at,request_id on conflict(email) do nothing;
insert into public.people_inquiry_links(contact_id,request_id,company_name)
select c.id,i.request_id,left(coalesce(i.payload->>'company',''),200) from public.project_inquiries i join public.people_contacts c on c.email=lower(btrim(i.payload->>'email')) on conflict do nothing;
create function public.person_becomes_client() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='accepted' then
  update public.people_contacts c set labels=array_append(array_remove(c.labels,'lead'),'client'),revision=revision+1,updated_at=now()
  where not('client'=any(c.labels)) and exists(select 1 from public.people_inquiry_links l where l.contact_id=c.id and l.request_id=new.request_id);
 end if;
 return new;
end;$$;
revoke all on function public.person_becomes_client() from public,anon,authenticated,service_role;
create trigger accepted_proposal_person after insert or update of status on public.inquiry_proposals for each row execute function public.person_becomes_client();
update public.people_contacts c set labels=array['client']::text[] where exists(select 1 from public.people_inquiry_links l join public.inquiry_proposals p on p.request_id=l.request_id where l.contact_id=c.id and p.status='accepted');
create function public.save_people_contact(p_id integer,p_revision integer,p_body jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.people_contacts; address text; label_values text[];
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if p_body is null or jsonb_typeof(p_body)<>'object' or octet_length(p_body::text)>8192 then raise exception 'Invalid contact'; end if;
 address:=lower(btrim(p_body->>'email'));
 if address is null or address!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Invalid email'; end if;
 select array_agg(distinct value) into label_values from jsonb_array_elements_text(p_body->'labels');
 if label_values is null then raise exception 'Choose a relationship'; end if;
 if p_id is null then
  insert into public.people_contacts(name,email,phone,company_name,labels,notes) values(btrim(p_body->>'name'),address,coalesce(p_body->>'phone',''),coalesce(p_body->>'company_name',''),label_values,coalesce(p_body->>'notes','')) returning * into c;
 else
  select * into c from public.people_contacts where id=p_id for update;
  if not found then return jsonb_build_object('result','not_found'); end if;
  if c.revision is distinct from p_revision then return jsonb_build_object('result','conflict'); end if;
  update public.people_contacts set name=btrim(p_body->>'name'),email=address,phone=coalesce(p_body->>'phone',''),company_name=coalesce(p_body->>'company_name',''),labels=label_values,notes=coalesce(p_body->>'notes',''),revision=revision+1,updated_at=now() where id=p_id returning * into c;
 end if;
 return jsonb_build_object('result','saved','id',c.id);
end;$$;
revoke all on function public.save_people_contact(integer,integer,jsonb) from public,anon,service_role;
grant execute on function public.save_people_contact(integer,integer,jsonb) to authenticated;
create function public.link_people_contact(p_contact integer,p_request uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 insert into public.people_inquiry_links(contact_id,request_id,company_name) select p_contact,request_id,left(coalesce(payload->>'company',''),200) from public.project_inquiries where request_id=p_request on conflict do nothing;
 if not exists(select 1 from public.project_inquiries where request_id=p_request) then raise exception 'Inquiry unavailable'; end if;
end;$$;
revoke all on function public.link_people_contact(integer,uuid) from public,anon,service_role;
grant execute on function public.link_people_contact(integer,uuid) to authenticated;
create view public.people_directory with(security_invoker=true) as
select c.*,lower(c.name) as name_sort,coalesce((select string_agg(distinct l.company_name,' ') from public.people_inquiry_links l where l.contact_id=c.id),'') as company_search,
coalesce(nullif(c.company_name,''),(select min(nullif(l.company_name,'')) from public.people_inquiry_links l where l.contact_id=c.id),'') as company_sort from public.people_contacts c;
revoke all on public.people_directory from public,anon,service_role;
grant select on public.people_directory to authenticated;
commit;
