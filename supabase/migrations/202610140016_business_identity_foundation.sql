-- Requires migrations 001–015. Additive foundation; existing routes and RPCs remain valid.
begin;
create table public.business_id_ledger(
 public_id text primary key check(public_id~'^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{7}$'),
 subject_type text not null check(subject_type in ('person','company','project','staff','client')),
 allocated_at timestamptz not null default now()
);
alter table public.business_id_ledger enable row level security;
revoke all on public.business_id_ledger from public,anon,authenticated,service_role;
create function public.allocate_business_id(p_kind text) returns text language plpgsql security definer set search_path='' as $$
declare alphabet constant text:='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';candidate text;allocated text;
begin
 for attempt in 1..1000 loop
  candidate:='';
  for position in 1..7 loop candidate:=candidate||substr(alphabet,1+floor(random()*length(alphabet))::integer,1);end loop;
  insert into public.business_id_ledger(public_id,subject_type) values(candidate,p_kind) on conflict do nothing returning public_id into allocated;
  if allocated is not null then return allocated;end if;
 end loop;
 raise exception 'Business ID allocation exhausted';
end;$$;
revoke all on function public.allocate_business_id(text) from public,anon,authenticated,service_role;
create function public.assign_business_id() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='UPDATE' then
  if new.public_id is distinct from old.public_id then raise exception 'Business IDs are immutable';end if;
 else
  if new.public_id is not null then raise exception 'Business IDs are system generated';end if;
  new.public_id:=public.allocate_business_id(TG_ARGV[0]);
 end if;
 return new;
end;$$;
revoke all on function public.assign_business_id() from public,anon,authenticated,service_role;

alter table public.people_contacts add column public_id text unique references public.business_id_ledger(public_id);
update public.people_contacts set public_id=public.allocate_business_id('person');
alter table public.people_contacts alter column public_id set not null;
create trigger people_contacts_business_id before insert or update of public_id on public.people_contacts for each row execute function public.assign_business_id('person');

alter table public.client_organizations add column public_id text unique references public.business_id_ledger(public_id);
update public.client_organizations set public_id=public.allocate_business_id('company');
alter table public.client_organizations alter column public_id set not null;
create trigger client_organizations_business_id before insert or update of public_id on public.client_organizations for each row execute function public.assign_business_id('company');

alter table public.inquiry_projects add column public_id text unique references public.business_id_ledger(public_id);
update public.inquiry_projects set public_id=public.allocate_business_id('project');
alter table public.inquiry_projects alter column public_id set not null;
create trigger inquiry_projects_business_id before insert or update of public_id on public.inquiry_projects for each row execute function public.assign_business_id('project');

alter table public.inquiry_staff add column public_id text unique references public.business_id_ledger(public_id);
update public.inquiry_staff set public_id=public.allocate_business_id('staff');
alter table public.inquiry_staff alter column public_id set not null;
create trigger inquiry_staff_business_id before insert or update of public_id on public.inquiry_staff for each row execute function public.assign_business_id('staff');

alter table public.client_profiles add column public_id text unique references public.business_id_ledger(public_id);
update public.client_profiles set public_id=public.allocate_business_id('client');
alter table public.client_profiles alter column public_id set not null;
create trigger client_profiles_business_id before insert or update of public_id on public.client_profiles for each row execute function public.assign_business_id('client');

create table public.business_industries(id text primary key,name text not null unique,sort_order integer not null unique);
create table public.business_subindustries(id text primary key,industry_id text not null references public.business_industries(id),name text not null,unique(id,industry_id),unique(industry_id,name));
insert into public.business_industries(id,name,sort_order) values
('hospitality-tourism','Hospitality & Tourism',1),
('retail-commerce','Retail & E-commerce',2),
('food-beverage','Food & Beverage',3),
('health-wellness','Health & Wellness',4),
('property-construction','Real Estate & Construction',5),
('professional-services','Professional Services',6),
('technology-telecom','Technology & Telecommunications',7),
('finance-insurance','Finance & Insurance',8),
('education-training','Education & Training',9),
('arts-media','Arts, Media & Entertainment',10),
('public-community','Government, Nonprofits & Community',11),
('industry-environment','Industry, Agriculture & Environment',12);
insert into public.business_subindustries(id,industry_id,name) values
('hospitality-tourism.hotels-resorts','hospitality-tourism','Hotels & Resorts'),
('hospitality-tourism.vacation-rentals','hospitality-tourism','Vacation Rentals'),
('hospitality-tourism.restaurants','hospitality-tourism','Restaurants'),
('hospitality-tourism.cafes','hospitality-tourism','Cafes'),
('hospitality-tourism.tour-operators','hospitality-tourism','Tour Operators'),
('hospitality-tourism.travel-agencies','hospitality-tourism','Travel Agencies'),
('hospitality-tourism.attractions','hospitality-tourism','Attractions'),
('hospitality-tourism.cruise-marine-tourism','hospitality-tourism','Cruise & Marine Tourism'),
('hospitality-tourism.destination-marketing','hospitality-tourism','Destination Marketing'),
('hospitality-tourism.hospitality-management','hospitality-tourism','Hospitality Management'),
('retail-commerce.fashion-apparel','retail-commerce','Fashion & Apparel'),
('retail-commerce.jewelry-accessories','retail-commerce','Jewelry & Accessories'),
('retail-commerce.home-furniture','retail-commerce','Home & Furniture'),
('retail-commerce.electronics-retail','retail-commerce','Electronics Retail'),
('retail-commerce.specialty-shops','retail-commerce','Specialty Shops'),
('retail-commerce.online-stores','retail-commerce','Online Stores'),
('retail-commerce.marketplaces','retail-commerce','Marketplaces'),
('retail-commerce.wholesale-distribution','retail-commerce','Wholesale & Distribution'),
('retail-commerce.grocery-retail','retail-commerce','Grocery Retail'),
('retail-commerce.sporting-goods','retail-commerce','Sporting Goods'),
('food-beverage.food-manufacturing','food-beverage','Food Manufacturing'),
('food-beverage.beverage-production','food-beverage','Beverage Production'),
('food-beverage.coffee-tea','food-beverage','Coffee & Tea'),
('food-beverage.bakeries','food-beverage','Bakeries'),
('food-beverage.confectionery','food-beverage','Confectionery'),
('food-beverage.packaged-foods','food-beverage','Packaged Foods'),
('food-beverage.catering','food-beverage','Catering'),
('food-beverage.food-distribution','food-beverage','Food Distribution'),
('food-beverage.seafood-processing','food-beverage','Seafood Processing'),
('food-beverage.breweries-distilleries','food-beverage','Breweries & Distilleries'),
('health-wellness.medical-clinics','health-wellness','Medical Clinics'),
('health-wellness.dental-care','health-wellness','Dental Care'),
('health-wellness.mental-health','health-wellness','Mental Health'),
('health-wellness.fitness-training','health-wellness','Fitness & Training'),
('health-wellness.beauty-skincare','health-wellness','Beauty & Skincare'),
('health-wellness.spas','health-wellness','Spas'),
('health-wellness.nutrition','health-wellness','Nutrition'),
('health-wellness.pharmacies','health-wellness','Pharmacies'),
('health-wellness.medical-technology','health-wellness','Medical Technology'),
('health-wellness.senior-care','health-wellness','Senior Care'),
('property-construction.property-development','property-construction','Property Development'),
('property-construction.real-estate-agencies','property-construction','Real Estate Agencies'),
('property-construction.property-management','property-construction','Property Management'),
('property-construction.architecture','property-construction','Architecture'),
('property-construction.interior-design','property-construction','Interior Design'),
('property-construction.general-contractors','property-construction','General Contractors'),
('property-construction.engineering','property-construction','Engineering'),
('property-construction.building-materials','property-construction','Building Materials'),
('property-construction.landscaping','property-construction','Landscaping'),
('property-construction.facility-management','property-construction','Facility Management'),
('professional-services.legal-services','professional-services','Legal Services'),
('professional-services.accounting-tax','professional-services','Accounting & Tax'),
('professional-services.management-consulting','professional-services','Management Consulting'),
('professional-services.marketing-branding','professional-services','Marketing & Branding'),
('professional-services.recruitment','professional-services','Recruitment'),
('professional-services.human-resources','professional-services','Human Resources'),
('professional-services.business-coaching','professional-services','Business Coaching'),
('professional-services.research','professional-services','Research'),
('professional-services.translation','professional-services','Translation'),
('professional-services.administrative-services','professional-services','Administrative Services'),
('technology-telecom.software-saas','technology-telecom','Software & SaaS'),
('technology-telecom.it-services','technology-telecom','IT Services'),
('technology-telecom.cybersecurity','technology-telecom','Cybersecurity'),
('technology-telecom.telecommunications','technology-telecom','Telecommunications'),
('technology-telecom.cloud-infrastructure','technology-telecom','Cloud & Infrastructure'),
('technology-telecom.artificial-intelligence','technology-telecom','Artificial Intelligence'),
('technology-telecom.hardware','technology-telecom','Hardware'),
('technology-telecom.internet-services','technology-telecom','Internet Services'),
('technology-telecom.digital-platforms','technology-telecom','Digital Platforms'),
('technology-telecom.data-analytics','technology-telecom','Data & Analytics'),
('finance-insurance.banking','finance-insurance','Banking'),
('finance-insurance.payments-fintech','finance-insurance','Payments & Fintech'),
('finance-insurance.insurance','finance-insurance','Insurance'),
('finance-insurance.investment-management','finance-insurance','Investment Management'),
('finance-insurance.financial-advice','finance-insurance','Financial Advice'),
('finance-insurance.lending','finance-insurance','Lending'),
('finance-insurance.credit-unions','finance-insurance','Credit Unions'),
('finance-insurance.financial-infrastructure','finance-insurance','Financial Infrastructure'),
('finance-insurance.accounting-technology','finance-insurance','Accounting Technology'),
('finance-insurance.risk-management','finance-insurance','Risk Management'),
('education-training.early-childhood','education-training','Early Childhood'),
('education-training.schools','education-training','Schools'),
('education-training.higher-education','education-training','Higher Education'),
('education-training.vocational-training','education-training','Vocational Training'),
('education-training.online-learning','education-training','Online Learning'),
('education-training.language-schools','education-training','Language Schools'),
('education-training.corporate-training','education-training','Corporate Training'),
('education-training.tutoring','education-training','Tutoring'),
('education-training.educational-publishing','education-training','Educational Publishing'),
('education-training.education-technology','education-training','Education Technology'),
('arts-media.publishing-news','arts-media','Publishing & News'),
('arts-media.music','arts-media','Music'),
('arts-media.film-video','arts-media','Film & Video'),
('arts-media.photography','arts-media','Photography'),
('arts-media.design-visual-arts','arts-media','Design & Visual Arts'),
('arts-media.events-festivals','arts-media','Events & Festivals'),
('arts-media.performing-arts','arts-media','Performing Arts'),
('arts-media.museums-galleries','arts-media','Museums & Galleries'),
('arts-media.gaming','arts-media','Gaming'),
('arts-media.broadcasting-podcasts','arts-media','Broadcasting & Podcasts'),
('public-community.local-government','public-community','Local Government'),
('public-community.public-agencies','public-community','Public Agencies'),
('public-community.charities','public-community','Charities'),
('public-community.community-associations','public-community','Community Associations'),
('public-community.foundations','public-community','Foundations'),
('public-community.faith-organizations','public-community','Faith Organizations'),
('public-community.advocacy','public-community','Advocacy'),
('public-community.trade-associations','public-community','Trade Associations'),
('public-community.international-organizations','public-community','International Organizations'),
('public-community.social-enterprises','public-community','Social Enterprises'),
('industry-environment.manufacturing','industry-environment','Manufacturing'),
('industry-environment.agriculture','industry-environment','Agriculture'),
('industry-environment.fisheries','industry-environment','Fisheries'),
('industry-environment.energy','industry-environment','Energy'),
('industry-environment.logistics-transport','industry-environment','Logistics & Transport'),
('industry-environment.waste-recycling','industry-environment','Waste & Recycling'),
('industry-environment.environmental-services','industry-environment','Environmental Services'),
('industry-environment.conservation','industry-environment','Conservation'),
('industry-environment.marine-services','industry-environment','Marine Services'),
('industry-environment.water-utilities','industry-environment','Water & Utilities');

alter table public.business_industries enable row level security;
alter table public.business_subindustries enable row level security;
revoke all on public.business_industries,public.business_subindustries from public,anon,authenticated,service_role;
grant select on public.business_industries,public.business_subindustries to authenticated;
create policy industries_staff_read on public.business_industries for select to authenticated using((select public.is_inquiry_staff()));
create policy subindustries_staff_read on public.business_subindustries for select to authenticated using((select public.is_inquiry_staff()));
create function public.valid_company_address(p_address jsonb) returns boolean language sql immutable set search_path='' as $$
 select p_address is not null and jsonb_typeof(p_address)='object' and octet_length(p_address::text)<=2048
 and not exists(select 1 from jsonb_each(p_address) e where e.key not in ('line1','line2','city','region','postal_code','country') or jsonb_typeof(e.value)<>'string' or length(e.value#>>'{}')>200)
 and (not p_address?'country' or (p_address->>'country')='' or (p_address->>'country')~'^[A-Z]{2}$');
$$;
create table public.company_profiles(
 organization_id uuid primary key references public.client_organizations(id) on delete cascade,
 status text not null default 'prospect' check(status in ('prospect','active','inactive','archived')),
 website text not null default '' check(length(website)<=2000 and (website='' or website~'^https?://')),
 address jsonb not null default '{}' check(public.valid_company_address(address)),
 industry_id text references public.business_industries(id),subindustry_id text,
 foreign key(subindustry_id,industry_id) references public.business_subindustries(id,industry_id),
 check(subindustry_id is null or industry_id is not null),
 legal_name text not null default '' check(length(legal_name)<=200),
 organization_type text not null default '' check(length(organization_type)<=100),
 founding_year integer check(founding_year between 1800 and 2200),employee_count integer check(employee_count between 0 and 1000000000),
 logo_path text check(length(logo_path)<=1024),revision integer not null default 1,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
insert into public.company_profiles(organization_id,created_at) select id,created_at from public.client_organizations;
create function public.initialize_company_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.company_profiles(organization_id,created_at) values(new.id,new.created_at);return new;end;$$;
revoke all on function public.initialize_company_profile() from public,anon,authenticated,service_role;
create trigger company_profile_created after insert on public.client_organizations for each row execute function public.initialize_company_profile();
alter table public.people_contacts
 add column job_title text not null default '' check(length(job_title)<=200),
 add column company_role text not null default 'other' check(company_role in ('ceo','owner','executive','employee','advisor','other')),
 add column company_id uuid references public.client_organizations(id) on delete restrict,
 add column company_assignment_manual boolean not null default false,
 add column status text not null default 'active' check(status in ('active','inactive','archived')),
 add column lead_source text not null default 'manual' check(lead_source in ('get_started','project_onboarding','referral','manual','import','legacy')),
 add column source_reference text not null default '' check(length(source_reference)<=500),
 add column referral_contact_id integer references public.people_contacts(id),
 add column referral_company_id uuid references public.client_organizations(id),
 add column avatar_path text check(length(avatar_path)<=1024),
 add constraint person_not_own_referrer check(referral_contact_id is distinct from id);
-- Only assign a company when an existing authoritative relationship is unambiguous.
update public.people_contacts c set company_id=chosen.organization_id from(
 select l.contact_id,(array_agg(distinct ico.organization_id))[1] as organization_id
 from public.people_inquiry_links l join public.inquiry_client_organizations ico on ico.request_id=l.request_id
 group by l.contact_id having count(distinct ico.organization_id)=1
) chosen where chosen.contact_id=c.id;
create unique index one_active_company_ceo on public.people_contacts(company_id) where company_role='ceo' and status='active' and company_id is not null;
create index people_company_filter on public.people_contacts(company_id,status);
create index people_source_filter on public.people_contacts(lead_source,created_at,id);
alter table public.inquiry_projects add column company_id uuid references public.client_organizations(id) on delete restrict, add column company_assignment_manual boolean not null default false;
update public.inquiry_projects p set company_id=ico.organization_id from public.inquiry_client_organizations ico where ico.request_id=p.request_id;
create function public.initialize_project_company() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.company_id is null and not new.company_assignment_manual then select organization_id into new.company_id from public.inquiry_client_organizations where request_id=new.request_id;end if;
 return new;
end;$$;
revoke all on function public.initialize_project_company() from public,anon,authenticated,service_role;
create trigger project_company_initialized before insert on public.inquiry_projects for each row execute function public.initialize_project_company();
create function public.sync_operational_company_links() returns trigger language plpgsql security definer set search_path='' as $$
begin
 update public.inquiry_projects set company_id=new.organization_id where request_id=new.request_id and company_id is null and not company_assignment_manual;
 update public.people_contacts c set company_id=new.organization_id,revision=revision+1,updated_at=now()
 where c.company_id is null and not c.company_assignment_manual
 and exists(select 1 from public.people_inquiry_links l where l.contact_id=c.id and l.request_id=new.request_id)
 and not exists(select 1 from public.people_inquiry_links l join public.inquiry_client_organizations ico on ico.request_id=l.request_id where l.contact_id=c.id and ico.organization_id<>new.organization_id);
 return new;
end;$$;
revoke all on function public.sync_operational_company_links() from public,anon,authenticated,service_role;
create trigger inquiry_operational_company after insert on public.inquiry_client_organizations for each row execute function public.sync_operational_company_links();
create index projects_company_filter on public.inquiry_projects(company_id);
alter table public.people_inquiry_links add column project_role text not null default '' check(project_role in ('','project_manager','decision_maker','approver','primary_contact','contributor','consultant','supplier','observer'));
alter table public.inquiry_staff add column avatar_path text check(length(avatar_path)<=1024);
alter table public.client_profiles add column avatar_path text check(length(avatar_path)<=1024);
create table public.people_contact_emails(
 contact_id integer not null references public.people_contacts(id) on delete cascade,
 email text primary key check(email=lower(btrim(email)) and length(email) between 3 and 254 and email~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 kind text not null default 'other' check(kind in ('work','personal','other')),is_primary boolean not null default false,
 created_at timestamptz not null default now()
);
create unique index one_primary_contact_email on public.people_contact_emails(contact_id) where is_primary;
create table public.people_contact_phones(
 contact_id integer not null references public.people_contacts(id) on delete cascade,
 phone text not null check(length(btrim(phone)) between 1 and 80),
 kind text not null default 'other' check(kind in ('work','personal','other')),is_primary boolean not null default false,
 created_at timestamptz not null default now(),primary key(contact_id,phone)
);
create unique index one_primary_contact_phone on public.people_contact_phones(contact_id) where is_primary;
insert into public.people_contact_emails(contact_id,email,is_primary) select id,email,true from public.people_contacts;
insert into public.people_contact_phones(contact_id,phone,is_primary) select id,btrim(phone),true from public.people_contacts where btrim(phone)<>'';
create function public.sync_person_primary_channels() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.people_contact_emails where email=new.email and contact_id<>new.id) then raise exception 'Email already belongs to another person' using errcode='23505';end if;
 update public.people_contact_emails set is_primary=false where contact_id=new.id and is_primary;
 insert into public.people_contact_emails(contact_id,email,is_primary) values(new.id,new.email,true) on conflict(email) do update set is_primary=true;
 update public.people_contact_phones set is_primary=false where contact_id=new.id and is_primary;
 if btrim(new.phone)<>'' then insert into public.people_contact_phones(contact_id,phone,is_primary) values(new.id,btrim(new.phone),true) on conflict(contact_id,phone) do update set is_primary=true;end if;
 return new;
end;$$;
revoke all on function public.sync_person_primary_channels() from public,anon,authenticated,service_role;
create trigger person_primary_channels after insert or update of email,phone on public.people_contacts for each row execute function public.sync_person_primary_channels();
-- Backfill source from the earliest linked inquiry. Manual contacts remain manual.
update public.people_contacts c set lead_source=case when i.payload->>'source'='get-started' then 'get_started' else 'legacy' end,source_reference=i.request_id::text
from (select distinct on(l.contact_id) l.contact_id,i.request_id,i.payload from public.people_inquiry_links l join public.project_inquiries i on i.request_id=l.request_id order by l.contact_id,i.created_at,i.request_id) i where i.contact_id=c.id;
create or replace function public.sync_inquiry_person() returns trigger language plpgsql security definer set search_path='' as $$
declare person integer;address text:=lower(btrim(coalesce(new.payload->>'email','')));full_name text:=btrim(coalesce(new.payload->>'name',''));
begin
 if address='' then return new;end if;
 select contact_id into person from public.people_contact_emails where email=address;
 if person is null then
  insert into public.people_contacts(name,email,lead_source,source_reference) values(left(coalesce(nullif(full_name,''),address),200),address,'get_started',new.request_id::text)
  on conflict(email) do update set email=excluded.email returning id into person;
 end if;
 insert into public.people_inquiry_links(contact_id,request_id,company_name) values(person,new.request_id,left(coalesce(new.payload->>'company',''),200)) on conflict do nothing;
 return new;
end;$$;
create table public.people_notes(
 id uuid primary key default gen_random_uuid(),contact_id integer not null references public.people_contacts(id) on delete cascade,
 body text not null check(length(btrim(body)) between 1 and 4000),author_id uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),revision integer not null default 1
);
create table public.company_notes(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.client_organizations(id) on delete cascade,
 body text not null check(length(btrim(body)) between 1 and 4000),author_id uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),revision integer not null default 1
);
alter table public.company_profiles enable row level security;
revoke all on public.company_profiles from public,anon,authenticated,service_role;
grant select on public.company_profiles to authenticated;
create policy company_profiles_staff_read on public.company_profiles for select to authenticated using((select public.is_inquiry_staff()));
alter table public.people_contact_emails enable row level security;
revoke all on public.people_contact_emails from public,anon,authenticated,service_role;
grant select on public.people_contact_emails to authenticated;
create policy people_contact_emails_staff_read on public.people_contact_emails for select to authenticated using((select public.is_inquiry_staff()));
alter table public.people_contact_phones enable row level security;
revoke all on public.people_contact_phones from public,anon,authenticated,service_role;
grant select on public.people_contact_phones to authenticated;
create policy people_contact_phones_staff_read on public.people_contact_phones for select to authenticated using((select public.is_inquiry_staff()));
alter table public.people_notes enable row level security;
revoke all on public.people_notes from public,anon,authenticated,service_role;
grant select on public.people_notes to authenticated;
create policy people_notes_staff_read on public.people_notes for select to authenticated using((select public.is_inquiry_staff()));
alter table public.company_notes enable row level security;
revoke all on public.company_notes from public,anon,authenticated,service_role;
grant select on public.company_notes to authenticated;
create policy company_notes_staff_read on public.company_notes for select to authenticated using((select public.is_inquiry_staff()));

create index people_notes_timeline on public.people_notes(contact_id,created_at desc);
create index company_notes_timeline on public.company_notes(organization_id,created_at desc);
-- Append new columns to preserve the existing view's column contract.
create or replace view public.people_directory with(security_invoker=true) as
select c.id,c.name,c.email,c.phone,c.company_name,c.labels,c.notes,c.revision,c.created_at,c.updated_at,
lower(c.name) as name_sort,
coalesce((select string_agg(distinct l.company_name,' ') from public.people_inquiry_links l where l.contact_id=c.id),'') as company_search,
coalesce(o.name,nullif(c.company_name,''),(select min(nullif(l.company_name,'')) from public.people_inquiry_links l where l.contact_id=c.id),'') as company_sort,
c.public_id,c.job_title,c.company_role,c.company_id,c.status,c.lead_source,c.source_reference,c.referral_contact_id,c.referral_company_id,c.avatar_path,
o.name as assigned_company_name,cp.address as company_address,
coalesce((select string_agg(e.email,' ') from public.people_contact_emails e where e.contact_id=c.id),'') as email_search,
coalesce((select string_agg(p.phone,' ') from public.people_contact_phones p where p.contact_id=c.id),'') as phone_search
from public.people_contacts c left join public.client_organizations o on o.id=c.company_id left join public.company_profiles cp on cp.organization_id=c.company_id;
create view public.company_directory with(security_invoker=true) as
select o.id,o.public_id,o.name,o.created_at,p.status,p.website,p.address,p.industry_id,p.subindustry_id,p.legal_name,p.organization_type,p.founding_year,p.employee_count,p.logo_path,p.updated_at,p.revision,
(select c.id from public.people_contacts c where c.company_id=o.id and c.company_role='ceo' and c.status='active') as ceo_contact_id,
(select c.name from public.people_contacts c where c.company_id=o.id and c.company_role='ceo' and c.status='active') as ceo_name
from public.client_organizations o join public.company_profiles p on p.organization_id=o.id where public.is_inquiry_staff();
revoke all on public.company_directory from public,anon,service_role;
grant select on public.company_directory to authenticated;
create function public.assign_person_company(p_contact integer,p_company uuid,p_title text,p_role text,p_revision integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare current_revision integer;
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 select revision into current_revision from public.people_contacts where id=p_contact for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if current_revision is distinct from p_revision then return jsonb_build_object('result','conflict');end if;
 update public.people_contacts set company_id=p_company,company_assignment_manual=true,job_title=case when p_company is null then '' else p_title end,company_role=case when p_company is null then 'other' else p_role end,revision=revision+1,updated_at=now() where id=p_contact;
 return jsonb_build_object('result','assigned','revision',current_revision+1);
end;$$;
revoke all on function public.assign_person_company(integer,uuid,text,text,integer) from public,anon,service_role;
grant execute on function public.assign_person_company(integer,uuid,text,text,integer) to authenticated;
create function public.touch_company_profile() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at:=now();return new;end;$$;
revoke all on function public.touch_company_profile() from public,anon,authenticated,service_role;
create trigger company_profile_modified before update on public.company_profiles for each row execute function public.touch_company_profile();
commit;
