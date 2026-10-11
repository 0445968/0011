-- Requires migrations 001–010. Client profiles, pre-activation workspace access,
-- service-driven onboarding items, and onboarding file exchange.
begin;

/* =========================================================
   CLIENT PROFILE + ORGANIZATION FOUNDATION
   ========================================================= */

create table public.client_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '' check(length(first_name) <= 100),
  last_name text not null default '' check(length(last_name) <= 100),
  job_title text not null default '' check(length(job_title) <= 160),
  phone text not null default '' check(length(phone) <= 50),
  timezone text not null default '' check(length(timezone) <= 80),
  revision integer not null default 1 check(revision > 0),
  updated_at timestamptz not null default now()
);

create table public.client_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check(length(btrim(name)) between 1 and 200),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table public.client_organization_members (
  organization_id uuid not null references public.client_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check(role in ('member','admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(organization_id,user_id)
);

create table public.inquiry_client_organizations (
  request_id uuid primary key references public.project_inquiries(request_id) on delete cascade,
  organization_id uuid not null references public.client_organizations(id) on delete restrict,
  created_at timestamptz not null default now()
);

alter table public.client_profiles enable row level security;
alter table public.client_organizations enable row level security;
alter table public.client_organization_members enable row level security;
alter table public.inquiry_client_organizations enable row level security;

revoke all on public.client_profiles, public.client_organizations,
  public.client_organization_members, public.inquiry_client_organizations
  from public, anon, authenticated;

grant select on public.client_profiles, public.client_organizations,
  public.client_organization_members, public.inquiry_client_organizations
  to authenticated;

create policy client_profile_read on public.client_profiles for select to authenticated
using(user_id = auth.uid() or (select public.is_inquiry_staff()));

create policy client_organization_read on public.client_organizations for select to authenticated
using(
  (select public.is_inquiry_staff()) or exists(
    select 1 from public.client_organization_members m
    where m.organization_id = id and m.user_id = auth.uid() and m.active
  )
);

create policy client_organization_member_read on public.client_organization_members for select to authenticated
using(user_id = auth.uid() or (select public.is_inquiry_staff()));

create policy inquiry_client_organization_read on public.inquiry_client_organizations for select to authenticated
using((select public.is_inquiry_staff()) or public.has_client_project(request_id));

create or replace function public.save_client_profile(p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  actor uuid := auth.uid();
  expected integer;
  current_row public.client_profiles%rowtype;
  next_revision integer;
  first_name text := btrim(coalesce(p_command->>'firstName',''));
  last_name text := btrim(coalesce(p_command->>'lastName',''));
  job_title text := btrim(coalesce(p_command->>'jobTitle',''));
  phone text := btrim(coalesce(p_command->>'phone',''));
  timezone text := btrim(coalesce(p_command->>'timezone',''));
begin
  if actor is null then raise exception 'Client authorization required' using errcode='42501'; end if;
  if not exists(select 1 from public.project_clients where user_id=actor and active) then raise exception 'Client workspace access required' using errcode='42501'; end if;
  if jsonb_typeof(p_command->'expectedRevision') is distinct from 'number'
    or p_command->>'expectedRevision' !~ '^[0-9]{1,8}$'
    or jsonb_typeof(p_command->'firstName') is distinct from 'string'
    or jsonb_typeof(p_command->'lastName') is distinct from 'string'
    or jsonb_typeof(p_command->'jobTitle') is distinct from 'string'
    or jsonb_typeof(p_command->'phone') is distinct from 'string'
    or jsonb_typeof(p_command->'timezone') is distinct from 'string'
    or length(first_name) > 100 or length(last_name) > 100
    or length(job_title) > 160 or length(phone) > 50 or length(timezone) > 80 then
    raise exception 'Invalid profile' using errcode='22023';
  end if;
  expected := (p_command->>'expectedRevision')::integer;
  select * into current_row from public.client_profiles where user_id=actor for update;
  if coalesce(current_row.revision,0) <> expected then return jsonb_build_object('result','conflict'); end if;
  next_revision := expected + 1;
  insert into public.client_profiles(user_id,first_name,last_name,job_title,phone,timezone,revision)
  values(actor,first_name,last_name,job_title,phone,timezone,next_revision)
  on conflict(user_id) do update set
    first_name=excluded.first_name,last_name=excluded.last_name,job_title=excluded.job_title,
    phone=excluded.phone,timezone=excluded.timezone,revision=excluded.revision,updated_at=now();
  return jsonb_build_object('result','saved','revision',next_revision);
end;$$;
revoke all on function public.save_client_profile(jsonb) from public,anon;
grant execute on function public.save_client_profile(jsonb) to authenticated;

/* =========================================================
   ALLOW CLIENT WORKSPACE ACCESS BEFORE PROJECT ACTIVATION
   ========================================================= */

alter table public.project_clients drop constraint if exists project_clients_request_id_fkey;
alter table public.project_clients add constraint project_clients_request_id_fkey
  foreign key(request_id) references public.project_inquiries(request_id) on delete cascade;

alter table public.project_access_history drop constraint if exists project_access_history_request_id_fkey;
alter table public.project_access_history add constraint project_access_history_request_id_fkey
  foreign key(request_id) references public.project_inquiries(request_id) on delete cascade;

create or replace function public.manage_project_client(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  actor uuid:=auth.uid();uid uuid;current public.project_clients;expected integer;
  eligible boolean;org_id uuid;org_name text;
begin
  if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
  if jsonb_typeof(p_command->'userId') is distinct from 'string'
    or p_command->>'userId'!~'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number'
    or p_command->>'expectedRevision'!~'^[0-9]{1,8}$'
    or jsonb_typeof(p_command->'active') is distinct from 'boolean'
    or jsonb_typeof(p_command->'canReview') is distinct from 'boolean' then
    raise exception 'Invalid assignment' using errcode='22023';
  end if;
  uid:=(p_command->>'userId')::uuid;expected:=(p_command->>'expectedRevision')::integer;
  perform 1 from public.project_inquiries where request_id=p_request_id for update;
  if not found or not exists(select 1 from auth.users where id=uid) then return jsonb_build_object('result','not_found'); end if;

  select exists(select 1 from public.inquiry_projects where request_id=p_request_id)
    or exists(
      select 1 from public.project_inquiries i
      join public.inquiry_readiness g on g.request_id=i.request_id and g.state='ready'
      join public.inquiry_proposals p on p.request_id=i.request_id and p.version=g.proposal_version and p.status='accepted'
      where i.request_id=p_request_id and i.status='qualified'
    ) into eligible;

  select * into current from public.project_clients where request_id=p_request_id and user_id=uid for update;
  if coalesce(current.revision,0)<>expected then return jsonb_build_object('result','conflict'); end if;
  if (p_command->>'active')::boolean and not eligible then return jsonb_build_object('result','gate_closed'); end if;
  if current.user_id is not null and current.active=(p_command->>'active')::boolean and current.can_review=(p_command->>'canReview')::boolean then return jsonb_build_object('result','saved'); end if;

  insert into public.project_clients(request_id,user_id,active,can_review,revision)
  values(p_request_id,uid,(p_command->>'active')::boolean,(p_command->>'canReview')::boolean,1)
  on conflict(request_id,user_id) do update set active=excluded.active,can_review=excluded.can_review,
    revision=public.project_clients.revision+1,updated_at=now() returning * into current;

  select organization_id into org_id from public.inquiry_client_organizations where request_id=p_request_id;
  if org_id is null and current.active then
    select coalesce(nullif(btrim(payload->>'company'),''),nullif(btrim(payload->>'name'),''),'Bivi client')
      into org_name from public.project_inquiries where request_id=p_request_id;
    insert into public.client_organizations(name,created_by) values(left(org_name,200),actor) returning id into org_id;
    insert into public.inquiry_client_organizations(request_id,organization_id) values(p_request_id,org_id);
  end if;

  if org_id is not null then
    insert into public.client_organization_members(organization_id,user_id,role,active)
    values(org_id,uid,'member',current.active)
    on conflict(organization_id,user_id) do update set
      active = exists(
        select 1 from public.project_clients pc
        join public.inquiry_client_organizations ico on ico.request_id=pc.request_id
        where ico.organization_id=org_id and pc.user_id=uid and pc.active
      ),updated_at=now();
  end if;

  insert into public.project_access_history(request_id,user_id,active,can_review,revision,actor_id)
  values(p_request_id,uid,current.active,current.can_review,current.revision,actor);
  return jsonb_build_object('result','saved');
end;$$;
revoke all on function public.manage_project_client(uuid,jsonb) from public,anon;
grant execute on function public.manage_project_client(uuid,jsonb) to authenticated;

-- Give existing assignments an organization without changing their project permissions.
do $$
declare r record; oid uuid; oname text;
begin
  for r in select distinct request_id from public.project_clients loop
    if not exists(select 1 from public.inquiry_client_organizations where request_id=r.request_id) then
      select coalesce(nullif(btrim(payload->>'company'),''),nullif(btrim(payload->>'name'),''),'Bivi client')
        into oname from public.project_inquiries where request_id=r.request_id;
      insert into public.client_organizations(name) values(left(oname,200)) returning id into oid;
      insert into public.inquiry_client_organizations(request_id,organization_id) values(r.request_id,oid);
      insert into public.client_organization_members(organization_id,user_id,role,active)
        select oid,user_id,'member',active from public.project_clients where request_id=r.request_id
        on conflict(organization_id,user_id) do nothing;
    end if;
  end loop;
end $$;

/* =========================================================
   PERSONALIZED ONBOARDING ITEMS
   ========================================================= */

create table public.inquiry_onboarding_items (
  request_id uuid not null references public.inquiry_onboarding(request_id) on delete cascade,
  item_key text not null check(item_key ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$'),
  revision integer not null default 1 check(revision > 0),
  title text not null check(length(btrim(title)) between 1 and 300),
  owner text not null check(owner in ('client','bivi')),
  item_type text not null check(item_type in ('questionnaire','assessment','file_upload','access_invitation','information_request','approval')),
  required boolean not null default true,
  status text not null default 'pending' check(status in ('pending','submitted','clarification','accepted','waived')),
  due_on date,
  service_ids text[] not null default '{}'::text[] check(cardinality(service_ids) <= 20),
  phase text check(phase is null or phase in ('inquiry','proposal-onboarding','discovery','direction','production','review','qa','delivery','handoff')),
  depends_on text,
  prompt text not null default '' check(length(prompt) <= 4000),
  assessment_slug text check(assessment_slug is null or length(assessment_slug) <= 120),
  response text not null default '' check(length(response) <= 12000),
  staff_notes text not null default '' check(length(staff_notes) <= 4000),
  waiver_reason text not null default '' check(length(waiver_reason) <= 2000),
  submitted_at timestamptz,
  submitted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key(request_id,item_key),
  foreign key(request_id,depends_on) references public.inquiry_onboarding_items(request_id,item_key) deferrable initially deferred
);

create table public.inquiry_onboarding_item_history (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.inquiry_onboarding(request_id) on delete cascade,
  item_key text not null,
  action text not null check(action in ('seed','add','update','save','submit','accept','clarify','waive','remove')),
  revision integer not null,
  snapshot jsonb not null,
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index inquiry_onboarding_items_status on public.inquiry_onboarding_items(request_id,status);

alter table public.inquiry_onboarding_items enable row level security;
alter table public.inquiry_onboarding_item_history enable row level security;
revoke all on public.inquiry_onboarding_items,public.inquiry_onboarding_item_history from public,anon,authenticated;
grant select on public.inquiry_onboarding_items to authenticated;
grant select on public.inquiry_onboarding_item_history to authenticated;

create policy onboarding_items_read on public.inquiry_onboarding_items for select to authenticated
using((select public.is_inquiry_staff()) or public.has_client_project(request_id));
create policy onboarding_item_history_staff_read on public.inquiry_onboarding_item_history for select to authenticated
using((select public.is_inquiry_staff()));
create policy onboarding_client_read on public.inquiry_onboarding for select to authenticated
using(public.has_client_project(request_id));

create function public.valid_onboarding_seed_item(item jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare k text; d date;
begin
  if item is null or jsonb_typeof(item)<>'object' then return false; end if;
  foreach k in array array['itemKey','title','owner','itemType','prompt'] loop
    if jsonb_typeof(item->k) is distinct from 'string' then return false; end if;
  end loop;
  if item->>'itemKey' !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$'
    or length(btrim(item->>'title')) not between 1 and 300
    or item->>'owner' not in ('client','bivi')
    or item->>'itemType' not in ('questionnaire','assessment','file_upload','access_invitation','information_request','approval')
    or length(item->>'prompt') > 4000
    or jsonb_typeof(item->'required') is distinct from 'boolean'
    or jsonb_typeof(item->'serviceIds') is distinct from 'array'
    or jsonb_array_length(item->'serviceIds') > 20 then return false; end if;
  if exists(select 1 from jsonb_array_elements(item->'serviceIds') x where jsonb_typeof(x)<>'string' or length(x#>>'{}') not between 1 and 100) then return false; end if;
  if jsonb_typeof(item->'dueOn') is distinct from 'null' then
    if jsonb_typeof(item->'dueOn') is distinct from 'string' or item->>'dueOn' !~ '^\d{4}-\d{2}-\d{2}$' then return false; end if;
    d := (item->>'dueOn')::date;
  end if;
  if jsonb_typeof(item->'phase') is distinct from 'null' then
    if jsonb_typeof(item->'phase') is distinct from 'string' or item->>'phase' not in ('inquiry','proposal-onboarding','discovery','direction','production','review','qa','delivery','handoff') then return false; end if;
  end if;
  if jsonb_typeof(item->'dependsOn') is distinct from 'null' then
    if jsonb_typeof(item->'dependsOn') is distinct from 'string' or item->>'dependsOn' !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$' then return false; end if;
  end if;
  if jsonb_typeof(item->'assessmentSlug') is distinct from 'null' then
    if jsonb_typeof(item->'assessmentSlug') is distinct from 'string' or length(item->>'assessmentSlug') > 120 then return false; end if;
  end if;
  return true;
exception when others then return false;
end;$$;
revoke all on function public.valid_onboarding_seed_item(jsonb) from public,anon,authenticated;

-- Preserve legacy onboarding rows as normalized items. Their existing staff checklist remains intact.
insert into public.inquiry_onboarding_items(
  request_id,item_key,title,owner,item_type,required,status,prompt,response,staff_notes,waiver_reason
)
select o.request_id,item->>'id',item->>'title',item->>'owner',
  case item->>'id' when 'assets' then 'file_upload' when 'contacts' then 'questionnaire' else 'information_request' end,
  (item->>'required')::boolean,
  case item->>'status' when 'received' then 'submitted' when 'complete' then 'accepted' when 'waived' then 'waived' else 'pending' end,
  item->>'title','',
  case when item->>'status'='complete' then item->>'notes' else '' end,
  case when item->>'status'='waived' then item->>'notes' else '' end
from public.inquiry_onboarding o
cross join lateral jsonb_array_elements(o.body->'items') item
on conflict(request_id,item_key) do nothing;

create or replace function public.manage_inquiry_onboarding(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); action text:=p_command->>'action'; expected integer; inquiry_status text;
 gate public.inquiry_readiness%rowtype; current_row public.inquiry_onboarding%rowtype;
 b jsonb; next_state text; reason text:=''; next_revision integer; completed_gate integer;
 seed jsonb; seed_item jsonb; seed_key text;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if p_command is null or jsonb_typeof(p_command)<>'object' or action is null or action not in ('start','save','complete','reopen') or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^\d+$' then raise exception 'Invalid command' using errcode='22023'; end if;
 expected:=(p_command->>'expectedRevision')::integer;
 select status into inquiry_status from public.project_inquiries where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 select * into gate from public.inquiry_readiness where request_id=p_request_id;
 select * into current_row from public.inquiry_onboarding where request_id=p_request_id for update;
 if action='start' then
  if current_row.request_id is not null or expected<>0 then return jsonb_build_object('result','conflict'); end if;
 else
  if current_row.request_id is null then return jsonb_build_object('result','not_found'); end if;
  if current_row.revision<>expected then return jsonb_build_object('result','conflict'); end if;
 end if;
 if action in ('start','complete') and (inquiry_status<>'qualified' or gate.state is distinct from 'ready' or not exists(select 1 from public.inquiry_proposals where request_id=p_request_id and version=gate.proposal_version and status='accepted') or (action='complete' and current_row.proposal_version<>gate.proposal_version)) then return jsonb_build_object('result','gate_closed'); end if;
 next_state:=coalesce(current_row.state,'in_progress');b:=current_row.body;
 if action='start' then
  b:=jsonb_build_object('contactName','','contactEmail','','approver','','kickoffStatus','pending','kickoffDate',null,'kickoffDetails','','kickoffNotes','','items',jsonb_build_array(
   jsonb_build_object('id','contacts','title','Confirm primary contact and authorized approver','owner','client','required',true,'status','pending','notes',''),
   jsonb_build_object('id','scope-inputs','title','Review personalized onboarding submissions','owner','client','required',true,'status','pending','notes',''),
   jsonb_build_object('id','assets','title','Review submitted assets and access requirements','owner','client','required',true,'status','pending','notes','')));
  insert into public.inquiry_onboarding(request_id,proposal_version,revision,state,body,updated_by)
  values(p_request_id,gate.proposal_version,1,'in_progress',b,actor);
  next_revision:=1;
  seed:=p_command->'seedItems';
  if seed is null or jsonb_typeof(seed)<>'array' or jsonb_array_length(seed)=0 then
    seed:=jsonb_build_array(
      jsonb_build_object('itemKey','business-profile','title','Business and project overview','owner','client','itemType','questionnaire','required',true,'dueOn',null,'serviceIds','[]'::jsonb,'phase','proposal-onboarding','dependsOn',null,'prompt','Confirm your business, goals, audience, and relevant links.','assessmentSlug',null),
      jsonb_build_object('itemKey','project-contacts','title','Primary contact and authorized approver','owner','client','itemType','information_request','required',true,'dueOn',null,'serviceIds','[]'::jsonb,'phase','proposal-onboarding','dependsOn',null,'prompt','Confirm the primary project contact and the person authorized to approve decisions.','assessmentSlug',null),
      jsonb_build_object('itemKey','existing-assets','title','Existing assets','owner','client','itemType','file_upload','required',true,'dueOn',null,'serviceIds','[]'::jsonb,'phase','discovery','dependsOn',null,'prompt','Upload the relevant existing assets, or explain what is not available.','assessmentSlug',null)
    );
  end if;
  if jsonb_typeof(seed)<>'array' or jsonb_array_length(seed) not between 1 and 100 then raise exception 'Invalid onboarding seed' using errcode='22023'; end if;
  for seed_item in select value from jsonb_array_elements(seed) loop
    if not public.valid_onboarding_seed_item(seed_item) then raise exception 'Invalid onboarding seed item' using errcode='22023'; end if;
    seed_key:=seed_item->>'itemKey';
    insert into public.inquiry_onboarding_items(request_id,item_key,title,owner,item_type,required,due_on,service_ids,phase,depends_on,prompt,assessment_slug,updated_by)
    values(p_request_id,seed_key,btrim(seed_item->>'title'),seed_item->>'owner',seed_item->>'itemType',(seed_item->>'required')::boolean,
      case when jsonb_typeof(seed_item->'dueOn')='string' then (seed_item->>'dueOn')::date end,
      array(select jsonb_array_elements_text(seed_item->'serviceIds')),
      case when jsonb_typeof(seed_item->'phase')='string' then seed_item->>'phase' end,
      case when jsonb_typeof(seed_item->'dependsOn')='string' then seed_item->>'dependsOn' end,
      seed_item->>'prompt',case when jsonb_typeof(seed_item->'assessmentSlug')='string' then seed_item->>'assessmentSlug' end,actor)
    on conflict(request_id,item_key) do nothing;
  end loop;
  if exists(select 1 from public.inquiry_onboarding_items i where i.request_id=p_request_id and i.depends_on=i.item_key)
    or exists(select 1 from public.inquiry_onboarding_items i where i.request_id=p_request_id and i.depends_on is not null and not exists(select 1 from public.inquiry_onboarding_items d where d.request_id=i.request_id and d.item_key=i.depends_on)) then raise exception 'Invalid onboarding dependency' using errcode='22023'; end if;
  insert into public.inquiry_onboarding_item_history(request_id,item_key,action,revision,snapshot,actor)
    select request_id,item_key,'seed',revision,to_jsonb(i),actor from public.inquiry_onboarding_items i where request_id=p_request_id;
 elsif action='save' then
  if next_state='complete' then return jsonb_build_object('result','locked'); end if;
  b:=p_command->'body';if not public.valid_onboarding_body(b) then raise exception 'Invalid onboarding evidence' using errcode='22023'; end if;
  next_revision:=expected+1;
  update public.inquiry_onboarding set revision=next_revision,body=b,updated_at=now(),updated_by=actor where request_id=p_request_id;
 elsif action='complete' then
  if next_state='complete' then return jsonb_build_object('result','locked'); end if;
  if not public.valid_onboarding_body(b)
    or length(btrim(b->>'contactName'))=0 or length(btrim(b->>'contactEmail'))=0 or length(btrim(b->>'approver'))=0
    or b->>'kickoffStatus'<>'held'
    or exists(select 1 from jsonb_array_elements(b->'items') where value->'required'='true'::jsonb and value->>'status' not in ('complete','waived'))
    or not exists(select 1 from public.inquiry_onboarding_items where request_id=p_request_id)
    or exists(select 1 from public.inquiry_onboarding_items where request_id=p_request_id and required and status not in ('accepted','waived'))
  then return jsonb_build_object('result','incomplete'); end if;
  next_state:='complete';completed_gate:=gate.revision;next_revision:=expected+1;
  update public.inquiry_onboarding set revision=next_revision,state=next_state,completed_readiness_revision=completed_gate,
    completed_at=now(),completed_by=actor,updated_at=now(),updated_by=actor where request_id=p_request_id;
 elsif action='reopen' then
  if next_state<>'complete' then return jsonb_build_object('result','locked'); end if;
  if jsonb_typeof(p_command->'reason') is distinct from 'string' or length(btrim(p_command->>'reason')) not between 1 and 2000 then raise exception 'Reopen reason required' using errcode='22023'; end if;
  reason:=btrim(p_command->>'reason');next_state:='in_progress';next_revision:=expected+1;
  update public.inquiry_onboarding set revision=next_revision,state=next_state,completed_readiness_revision=null,
    completed_at=null,completed_by=null,updated_at=now(),updated_by=actor where request_id=p_request_id;
 end if;
 if action='start' then
   -- Header row was inserted above.
   null;
 end if;
 insert into public.inquiry_onboarding_history(request_id,action,reason,snapshot,actor)
 values(p_request_id,action,reason,jsonb_build_object('revision',next_revision,'proposalVersion',coalesce(current_row.proposal_version,gate.proposal_version),'state',next_state,'body',b,'readinessRevision',completed_gate),actor);
 return jsonb_build_object('result','saved','revision',next_revision);
end;$$;
revoke all on function public.manage_inquiry_onboarding(uuid,jsonb) from public,anon;
grant execute on function public.manage_inquiry_onboarding(uuid,jsonb) to authenticated;

create function public.manage_onboarding_item(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  actor uuid:=auth.uid(); staff boolean:=public.is_inquiry_staff(); action text:=p_command->>'action';
  key text:=p_command->>'itemKey'; expected integer; current_item public.inquiry_onboarding_items%rowtype;
  definition jsonb; response_text text; note text; reason text; next_revision integer;
begin
  if actor is null then raise exception 'Authorization required' using errcode='42501'; end if;
  perform 1 from public.project_inquiries where request_id=p_request_id for update;
  if not found then return jsonb_build_object('result','not_found'); end if;
  if not staff then
    perform 1 from public.project_clients where request_id=p_request_id and user_id=actor and active for update;
    if not found then raise exception 'Client workspace access required' using errcode='42501'; end if;
  end if;
  if not exists(select 1 from public.inquiry_onboarding where request_id=p_request_id) then return jsonb_build_object('result','not_found'); end if;
  if exists(select 1 from public.inquiry_onboarding where request_id=p_request_id and state='complete') then return jsonb_build_object('result','locked'); end if;
  if action not in ('add','update','remove','save','submit','accept','clarify','waive') then raise exception 'Invalid onboarding action' using errcode='22023'; end if;

  if action='add' then
    if not staff then raise exception 'Staff authorization required' using errcode='42501'; end if;
    definition:=p_command->'item';
    if not public.valid_onboarding_seed_item(definition) then raise exception 'Invalid onboarding item' using errcode='22023'; end if;
    key:=definition->>'itemKey';
    if definition->>'dependsOn'=key then raise exception 'Invalid onboarding dependency' using errcode='22023'; end if;
    if jsonb_typeof(definition->'dependsOn')='string' and not exists(select 1 from public.inquiry_onboarding_items where request_id=p_request_id and item_key=definition->>'dependsOn') then return jsonb_build_object('result','dependency'); end if;
    if exists(select 1 from public.inquiry_onboarding_items where request_id=p_request_id and item_key=key) then return jsonb_build_object('result','conflict'); end if;
    insert into public.inquiry_onboarding_items(request_id,item_key,title,owner,item_type,required,due_on,service_ids,phase,depends_on,prompt,assessment_slug,updated_by)
    values(p_request_id,key,btrim(definition->>'title'),definition->>'owner',definition->>'itemType',(definition->>'required')::boolean,
      case when jsonb_typeof(definition->'dueOn')='string' then (definition->>'dueOn')::date end,
      array(select jsonb_array_elements_text(definition->'serviceIds')),
      case when jsonb_typeof(definition->'phase')='string' then definition->>'phase' end,
      case when jsonb_typeof(definition->'dependsOn')='string' then definition->>'dependsOn' end,
      definition->>'prompt',case when jsonb_typeof(definition->'assessmentSlug')='string' then definition->>'assessmentSlug' end,actor)
    returning * into current_item;
    insert into public.inquiry_onboarding_item_history(request_id,item_key,action,revision,snapshot,actor)
      values(p_request_id,key,'add',current_item.revision,to_jsonb(current_item),actor);
    return jsonb_build_object('result','saved','revision',current_item.revision,'status',current_item.status);
  end if;

  if key is null or key!~'^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$'
    or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number'
    or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' then raise exception 'Invalid onboarding item reference' using errcode='22023'; end if;
  expected:=(p_command->>'expectedRevision')::integer;
  select * into current_item from public.inquiry_onboarding_items where request_id=p_request_id and item_key=key for update;
  if not found then return jsonb_build_object('result','not_found'); end if;
  if current_item.revision<>expected then return jsonb_build_object('result','conflict'); end if;

  if action='update' then
    if not staff then raise exception 'Staff authorization required' using errcode='42501'; end if;
    definition:=p_command->'item';
    if not public.valid_onboarding_seed_item(definition) or definition->>'itemKey'<>key or definition->>'dependsOn'=key then raise exception 'Invalid onboarding item' using errcode='22023'; end if;
    if jsonb_typeof(definition->'dependsOn')='string' and not exists(select 1 from public.inquiry_onboarding_items where request_id=p_request_id and item_key=definition->>'dependsOn') then return jsonb_build_object('result','dependency'); end if;
    update public.inquiry_onboarding_items set
      title=btrim(definition->>'title'),owner=definition->>'owner',item_type=definition->>'itemType',required=(definition->>'required')::boolean,
      due_on=case when jsonb_typeof(definition->'dueOn')='string' then (definition->>'dueOn')::date end,
      service_ids=array(select jsonb_array_elements_text(definition->'serviceIds')),
      phase=case when jsonb_typeof(definition->'phase')='string' then definition->>'phase' end,
      depends_on=case when jsonb_typeof(definition->'dependsOn')='string' then definition->>'dependsOn' end,
      prompt=definition->>'prompt',assessment_slug=case when jsonb_typeof(definition->'assessmentSlug')='string' then definition->>'assessmentSlug' end,
      revision=revision+1,updated_at=now(),updated_by=actor
    where request_id=p_request_id and item_key=key returning * into current_item;
  elsif action='remove' then
    if not staff then raise exception 'Staff authorization required' using errcode='42501'; end if;
    reason:=btrim(coalesce(p_command->>'reason',''));
    if length(reason) not between 1 and 2000 then raise exception 'Removal reason required' using errcode='22023'; end if;
    if exists(select 1 from public.inquiry_onboarding_items where request_id=p_request_id and depends_on=key) then return jsonb_build_object('result','dependency'); end if;
    insert into public.inquiry_onboarding_item_history(request_id,item_key,action,revision,snapshot,actor)
      values(p_request_id,key,'remove',current_item.revision,to_jsonb(current_item)||jsonb_build_object('removalReason',reason),actor);
    delete from public.inquiry_onboarding_items where request_id=p_request_id and item_key=key;
    return jsonb_build_object('result','saved','removed',true);
  elsif action in ('save','submit') then
    if staff or current_item.owner<>'client' or current_item.status not in ('pending','clarification') then return jsonb_build_object('result','locked'); end if;
    if jsonb_typeof(p_command->'response') is distinct from 'string' or length(p_command->>'response')>12000 then raise exception 'Invalid response' using errcode='22023'; end if;
    response_text:=p_command->>'response';
    if action='submit' then
      if current_item.depends_on is not null and not exists(select 1 from public.inquiry_onboarding_items where request_id=p_request_id and item_key=current_item.depends_on and status in ('accepted','waived')) then return jsonb_build_object('result','dependency'); end if;
      if current_item.item_type='file_upload' then
        if not exists(select 1 from public.project_files where request_id=p_request_id and uploader_id=actor and state='ready') or length(btrim(response_text))=0 then return jsonb_build_object('result','incomplete'); end if;
      elsif length(btrim(response_text))=0 then return jsonb_build_object('result','incomplete'); end if;
    end if;
    update public.inquiry_onboarding_items set response=response_text,status=case when action='submit' then 'submitted' else status end,
      submitted_at=case when action='submit' then now() else submitted_at end,submitted_by=case when action='submit' then actor else submitted_by end,
      staff_notes=case when action='submit' then '' else staff_notes end,revision=revision+1,updated_at=now(),updated_by=actor
    where request_id=p_request_id and item_key=key returning * into current_item;
  elsif action='accept' then
    if not staff then raise exception 'Staff authorization required' using errcode='42501'; end if;
    if current_item.status<>'submitted' and not (current_item.owner='bivi' and current_item.status in ('pending','clarification')) then return jsonb_build_object('result','locked'); end if;
    note:=btrim(coalesce(p_command->>'note',''));
    if length(note)>4000 then raise exception 'Invalid staff note' using errcode='22023'; end if;
    update public.inquiry_onboarding_items set status='accepted',staff_notes=note,waiver_reason='',accepted_at=now(),accepted_by=actor,
      revision=revision+1,updated_at=now(),updated_by=actor where request_id=p_request_id and item_key=key returning * into current_item;
  elsif action='clarify' then
    if not staff then raise exception 'Staff authorization required' using errcode='42501'; end if;
    note:=btrim(coalesce(p_command->>'note',''));
    if current_item.owner<>'client' or current_item.status not in ('submitted','accepted') or length(note) not between 1 and 4000 then return jsonb_build_object('result','locked'); end if;
    update public.inquiry_onboarding_items set status='clarification',staff_notes=note,accepted_at=null,accepted_by=null,
      revision=revision+1,updated_at=now(),updated_by=actor where request_id=p_request_id and item_key=key returning * into current_item;
  elsif action='waive' then
    if not staff then raise exception 'Staff authorization required' using errcode='42501'; end if;
    reason:=btrim(coalesce(p_command->>'reason',''));
    if length(reason) not between 1 and 2000 then raise exception 'Waiver reason required' using errcode='22023'; end if;
    update public.inquiry_onboarding_items set status='waived',waiver_reason=reason,accepted_at=now(),accepted_by=actor,
      revision=revision+1,updated_at=now(),updated_by=actor where request_id=p_request_id and item_key=key returning * into current_item;
  end if;

  insert into public.inquiry_onboarding_item_history(request_id,item_key,action,revision,snapshot,actor)
    values(p_request_id,key,action,current_item.revision,to_jsonb(current_item),actor);
  return jsonb_build_object('result','saved','revision',current_item.revision,'status',current_item.status);
end;$$;
revoke all on function public.manage_onboarding_item(uuid,jsonb) from public,anon;
grant execute on function public.manage_onboarding_item(uuid,jsonb) to authenticated;

/* =========================================================
   PRE-ACTIVATION ONBOARDING FILES
   ========================================================= */

alter table public.project_files drop constraint if exists project_files_request_id_fkey;
alter table public.project_files add constraint project_files_request_id_fkey
  foreign key(request_id) references public.project_inquiries(request_id) on delete cascade;
alter table public.project_file_history drop constraint if exists project_file_history_request_id_fkey;
alter table public.project_file_history add constraint project_file_history_request_id_fkey
  foreign key(request_id) references public.project_inquiries(request_id) on delete cascade;

create or replace function public.manage_project_file(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();staff boolean:=public.is_inquiry_staff();f public.project_files;fid uuid;act text:=p_command->>'action';fn text;sz integer;mt text;expected_mime text;obj jsonb;why text;
begin
 if actor is null then raise exception 'Authorization required' using errcode='42501'; end if;
 perform 1 from public.project_inquiries where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 if not staff then
  perform 1 from public.project_clients where request_id=p_request_id and user_id=actor and active for update;
  if not found then raise exception 'Project access required' using errcode='42501'; end if;
 elsif not exists(select 1 from public.inquiry_onboarding where request_id=p_request_id) and not exists(select 1 from public.inquiry_projects where request_id=p_request_id) then
  return jsonb_build_object('result','not_found');
 end if;
 if jsonb_typeof(p_command->'id') is distinct from 'string' or p_command->>'id'!~'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then raise exception 'Invalid file ID' using errcode='22023'; end if;
 fid:=(p_command->>'id')::uuid;
 select * into f from public.project_files where id=fid and request_id=p_request_id for update;
 if act='reserve' then
  fn:=p_command->>'filename';mt:=p_command->>'mime';
  if jsonb_typeof(p_command->'filename') is distinct from 'string' or length(fn) not between 1 and 180 or fn~'[[:cntrl:]/\\]' or fn in ('.','..') or fn<>btrim(fn) or jsonb_typeof(p_command->'size') is distinct from 'number' or p_command->>'size'!~'^[0-9]{1,8}$' then raise exception 'Invalid file details' using errcode='22023'; end if;
  sz:=(p_command->>'size')::integer;
  expected_mime:=case lower(substring(fn from '\.([^.]+)$')) when 'pdf' then 'application/pdf' when 'png' then 'image/png' when 'jpg' then 'image/jpeg' when 'jpeg' then 'image/jpeg' when 'webp' then 'image/webp' when 'zip' then 'application/zip' when 'txt' then 'text/plain' end;
  if sz not between 1 and 10485760 or expected_mime is null or mt is distinct from expected_mime then raise exception 'Unsupported file type or size' using errcode='22023'; end if;
  if f.id is not null then
   if f.uploader_id=actor and f.filename=fn and f.size_bytes=sz and f.mime_type=mt and f.state='pending' and f.expires_at>now() then return jsonb_build_object('result','reserved','id',f.id,'path',f.object_path); end if;
   return jsonb_build_object('result','conflict');
  end if;
  if exists(select 1 from public.project_files where id=fid) then return jsonb_build_object('result','conflict'); end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text,8));
  if (select count(*) from public.project_files where request_id=p_request_id)>=200 or (select count(*) from public.project_files where uploader_id=actor and created_at>now()-interval '1 hour')>=20 then return jsonb_build_object('result','limit'); end if;
  insert into public.project_files(id,request_id,object_path,filename,size_bytes,mime_type,uploader_id)
   values(fid,p_request_id,p_request_id::text||'/'||fid::text,fn,sz,mt,actor) returning * into f;
  insert into public.project_file_history(file_id,request_id,action,revision,actor_id) values(fid,p_request_id,'reserved',0,actor);
  return jsonb_build_object('result','reserved','id',fid,'path',f.object_path);
 end if;
 if f.id is null then return jsonb_build_object('result','not_found'); end if;
 if act='finalize' then
  if f.uploader_id is distinct from actor then raise exception 'Uploader authorization required' using errcode='42501'; end if;
  if f.state='ready' then return jsonb_build_object('result','saved'); end if;
  if f.state<>'pending' or f.expires_at<=now() then return jsonb_build_object('result','conflict'); end if;
  select metadata into obj from storage.objects where bucket_id='bivi-project-files' and name=f.object_path;
  if obj is null then return jsonb_build_object('result','not_uploaded'); end if;
  if obj->>'size' is distinct from f.size_bytes::text or obj->>'mimetype' is distinct from f.mime_type then return jsonb_build_object('result','mismatch'); end if;
  update public.project_files set state='ready',revision=revision+1,updated_at=now() where id=fid returning * into f;
 else
  if not staff then raise exception 'Staff authorization required' using errcode='42501'; end if;
  if jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' then raise exception 'Invalid revision' using errcode='22023'; end if;
  if f.revision<>(p_command->>'expectedRevision')::integer or f.state='withdrawn' then return jsonb_build_object('result','conflict'); end if;
  if act in ('share','private') and f.state='ready' then
   update public.project_files set shared=(act='share'),revision=revision+1,updated_at=now() where id=fid returning * into f;
  elsif act='withdraw' then
   why:=p_command->>'reason';if jsonb_typeof(p_command->'reason') is distinct from 'string' or length(btrim(why)) not between 1 and 2000 then raise exception 'Withdrawal reason required' using errcode='22023'; end if;
   update public.project_files set state='withdrawn',shared=false,revision=revision+1,updated_at=now() where id=fid returning * into f;
  else raise exception 'Invalid file action' using errcode='22023'; end if;
 end if;
 insert into public.project_file_history(file_id,request_id,action,revision,reason,actor_id) values(fid,p_request_id,act,f.revision,coalesce(btrim(why),''),actor);
 return jsonb_build_object('result','saved');
end;$$;
revoke all on function public.manage_project_file(uuid,jsonb) from public,anon;
grant execute on function public.manage_project_file(uuid,jsonb) to authenticated;

/* =========================================================
   PRESERVE PERSONALIZED ONBOARDING AT PROJECT ACTIVATION
   ========================================================= */

alter table public.inquiry_projects add column onboarding_items_snapshot jsonb not null default '[]'::jsonb
  check(jsonb_typeof(onboarding_items_snapshot)='array' and octet_length(onboarding_items_snapshot::text)<=393216);

update public.inquiry_projects p set onboarding_items_snapshot=coalesce((
  select jsonb_agg(to_jsonb(i) order by i.item_key)
  from public.inquiry_onboarding_items i where i.request_id=p.request_id
),'[]'::jsonb);

create or replace function public.manage_inquiry_project(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();action text:=p_command->>'action';expected integer;current_row public.inquiry_projects%rowtype;
 p public.inquiry_proposals%rowtype;g public.inquiry_readiness%rowtype;o public.inquiry_onboarding%rowtype;
 b jsonb;next_state text;reason text:='';next_revision integer;items_snapshot jsonb;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if p_command is null or jsonb_typeof(p_command)<>'object' or action is null or action not in ('activate','save','hold','resume','complete','reopen') or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^\d+$' then raise exception 'Invalid command' using errcode='22023'; end if;
 expected:=(p_command->>'expectedRevision')::integer;
 perform 1 from public.project_inquiries where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 select * into current_row from public.inquiry_projects where request_id=p_request_id for update;
 if action='activate' then
  if current_row.request_id is not null or expected<>0 then return jsonb_build_object('result','conflict'); end if;
 else
  if current_row.request_id is null then return jsonb_build_object('result','not_found'); end if;
  if current_row.revision<>expected then return jsonb_build_object('result','conflict'); end if;
 end if;
 if action in ('activate','resume','complete') and not public.project_prerequisites_met(p_request_id) then return jsonb_build_object('result','gate_closed'); end if;
 if action<>'activate' and action in ('resume','complete') and not exists(select 1 from public.inquiry_proposals where request_id=p_request_id and version=current_row.proposal_version and status='accepted') then return jsonb_build_object('result','gate_closed'); end if;
 b:=current_row.body;next_state:=current_row.state;next_revision:=expected+1;
 if action='activate' then
  select * into p from public.inquiry_proposals where request_id=p_request_id and status='accepted';
  select * into g from public.inquiry_readiness where request_id=p_request_id;
  select * into o from public.inquiry_onboarding where request_id=p_request_id;
  select coalesce(jsonb_agg(to_jsonb(i) order by i.item_key),'[]'::jsonb) into items_snapshot
    from public.inquiry_onboarding_items i where i.request_id=p_request_id;
  b:=jsonb_build_object('title',p.body->>'title','owner','','notes','','milestones','[]'::jsonb,'tasks','[]'::jsonb);next_state:='active';
  insert into public.inquiry_projects(request_id,proposal_version,revision,state,body,scope_snapshot,onboarding_snapshot,onboarding_items_snapshot,readiness_snapshot,activated_readiness_revision,activated_onboarding_revision,activated_by,updated_by)
  values(p_request_id,p.version,next_revision,next_state,b,p.body,o.body,items_snapshot,g.body,g.revision,o.revision,actor,actor);
 else
  if action='save' then
   if next_state='completed' then return jsonb_build_object('result','locked'); end if;
   b:=p_command->'body';if not public.valid_project_body(b) then raise exception 'Invalid project data' using errcode='22023'; end if;
  else
   if jsonb_typeof(p_command->'reason') is distinct from 'string' or length(btrim(p_command->>'reason')) not between 1 and 2000 then raise exception 'Decision reason required' using errcode='22023'; end if;
   reason:=btrim(p_command->>'reason');
   if action='hold' then
    if next_state<>'active' then return jsonb_build_object('result','locked'); end if;next_state:='on_hold';
   elsif action='resume' then
    if next_state<>'on_hold' then return jsonb_build_object('result','locked'); end if;next_state:='active';
   elsif action='reopen' then
    if next_state<>'completed' then return jsonb_build_object('result','locked'); end if;next_state:='on_hold';
   elsif action='complete' then
    if next_state<>'active' then return jsonb_build_object('result','locked'); end if;
    if jsonb_array_length(b->'tasks')=0 or exists(select 1 from jsonb_array_elements(b->'tasks') where value->>'status'<>'done') or exists(select 1 from jsonb_array_elements(b->'milestones') where value->>'status'<>'done') then return jsonb_build_object('result','incomplete'); end if;next_state:='completed';
   end if;
  end if;
  update public.inquiry_projects set body=b,state=next_state,revision=next_revision,updated_at=now(),updated_by=actor where request_id=p_request_id;
 end if;
 insert into public.inquiry_project_history(request_id,action,reason,snapshot,actor) values(p_request_id,action,reason,jsonb_build_object('revision',next_revision,'state',next_state,'body',b),actor);
 return jsonb_build_object('result','saved','revision',next_revision);
end;$$;
revoke all on function public.manage_inquiry_project(uuid,jsonb) from public,anon;
grant execute on function public.manage_inquiry_project(uuid,jsonb) to authenticated;

/* =========================================================
   SAFE CLIENT DASHBOARD SUMMARY
   ========================================================= */

create function public.client_workspace_summary()
returns table(
  request_id uuid,
  title text,
  onboarding_state text,
  required_items integer,
  client_actions integer,
  project_active boolean,
  latest_publication_version integer,
  updated_at timestamptz
)
language sql stable security definer set search_path='' as $$
  select pc.request_id,
    coalesce(p.body->>'title','Bivi project') as title,
    coalesce(o.state,'not_started') as onboarding_state,
    coalesce((select count(*)::integer from public.inquiry_onboarding_items oi where oi.request_id=pc.request_id and oi.required),0) as required_items,
    coalesce((select count(*)::integer from public.inquiry_onboarding_items oi where oi.request_id=pc.request_id and oi.owner='client' and oi.status in ('pending','clarification')),0) as client_actions,
    exists(select 1 from public.inquiry_projects ip where ip.request_id=pc.request_id) as project_active,
    (select max(pp.version) from public.project_publications pp where pp.request_id=pc.request_id and not pp.withdrawn) as latest_publication_version,
    coalesce(o.updated_at,p.updated_at) as updated_at
  from public.project_clients pc
  join public.inquiry_proposals p on p.request_id=pc.request_id and p.status='accepted'
  left join public.inquiry_onboarding o on o.request_id=pc.request_id
  where pc.user_id=auth.uid() and pc.active
  order by coalesce(o.updated_at,p.updated_at) desc,pc.request_id;
$$;
revoke all on function public.client_workspace_summary() from public,anon;
grant execute on function public.client_workspace_summary() to authenticated;

commit;
