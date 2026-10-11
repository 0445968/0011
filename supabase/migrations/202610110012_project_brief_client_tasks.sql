-- Requires migrations 001–011. Project brief, lifecycle phase, client/Bivi task
-- ownership, dependencies, blockers, client task updates and next-action views.
begin;

/* =========================================================
   LIFECYCLE + TASK CONTROL METADATA
   Existing inquiry_projects.body remains the source of truth for task
   title, due date, execution status, milestone and internal notes.
   ========================================================= */

create table public.project_lifecycle (
  request_id uuid primary key references public.inquiry_projects(request_id) on delete cascade,
  phase text not null check(phase in ('inquiry','proposal-onboarding','discovery','direction','production','review','qa','delivery','handoff')),
  revision integer not null default 1 check(revision > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.project_lifecycle_history (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  previous_phase text not null,
  next_phase text not null,
  reason text not null check(length(reason) <= 2000),
  revision integer not null,
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.project_task_controls (
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  task_id text not null check(length(btrim(task_id)) between 1 and 100),
  revision integer not null default 1 check(revision > 0),
  owner_type text not null check(owner_type in ('bivi','client')),
  phase text not null check(phase in ('inquiry','proposal-onboarding','discovery','direction','production','review','qa','delivery','handoff')),
  service_id text check(service_id is null or length(service_id) <= 100),
  depends_on text check(depends_on is null or (length(btrim(depends_on)) between 1 and 100 and depends_on <> task_id)),
  blocker_owner text check(blocker_owner is null or blocker_owner in ('bivi','client','external')),
  client_note text not null default '' check(length(client_note) <= 2000),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key(request_id,task_id)
);

create table public.project_task_history (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  task_id text not null,
  action text not null check(action in ('seed','metadata','client_update','brief_review')),
  snapshot jsonb not null,
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index project_task_controls_owner on public.project_task_controls(request_id,owner_type,phase);
create index project_task_history_project on public.project_task_history(request_id,id desc);

alter table public.project_lifecycle enable row level security;
alter table public.project_lifecycle_history enable row level security;
alter table public.project_task_controls enable row level security;
alter table public.project_task_history enable row level security;

revoke all on public.project_lifecycle,public.project_lifecycle_history,public.project_task_controls,public.project_task_history from public,anon,authenticated;
grant select on public.project_lifecycle,public.project_lifecycle_history,public.project_task_controls,public.project_task_history to authenticated;

create policy project_lifecycle_staff_read on public.project_lifecycle for select to authenticated using((select public.is_inquiry_staff()));
create policy project_lifecycle_history_staff_read on public.project_lifecycle_history for select to authenticated using((select public.is_inquiry_staff()));
create policy project_task_controls_staff_read on public.project_task_controls for select to authenticated using((select public.is_inquiry_staff()));
create policy project_task_history_staff_read on public.project_task_history for select to authenticated using((select public.is_inquiry_staff()));

create function public.project_phase_rank(p_phase text) returns integer
language sql immutable set search_path='' as $$
  select case p_phase
    when 'inquiry' then 1
    when 'proposal-onboarding' then 2
    when 'discovery' then 3
    when 'direction' then 4
    when 'production' then 5
    when 'review' then 6
    when 'qa' then 7
    when 'delivery' then 8
    when 'handoff' then 9
    else 999
  end;
$$;
revoke all on function public.project_phase_rank(text) from public,anon,authenticated;

/* =========================================================
   VERSIONED PROJECT BRIEF
   ========================================================= */

create table public.project_brief_drafts (
  request_id uuid primary key references public.inquiry_projects(request_id) on delete cascade,
  revision integer not null default 1 check(revision > 0),
  body jsonb not null check(jsonb_typeof(body)='object' and octet_length(body::text) <= 49152),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.project_brief_versions (
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  version integer not null check(version > 0),
  body jsonb not null check(jsonb_typeof(body)='object' and octet_length(body::text) <= 49152),
  status text not null default 'pending' check(status in ('pending','approved','changes_requested','superseded')),
  published_at timestamptz not null default now(),
  published_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  decided_by uuid references auth.users(id) on delete set null,
  decision_note text not null default '' check(length(decision_note) <= 4000),
  primary key(request_id,version)
);

create unique index one_pending_project_brief on public.project_brief_versions(request_id) where status='pending';

alter table public.project_brief_drafts enable row level security;
alter table public.project_brief_versions enable row level security;
revoke all on public.project_brief_drafts,public.project_brief_versions from public,anon,authenticated;
grant select on public.project_brief_drafts,public.project_brief_versions to authenticated;

create policy project_brief_draft_staff_read on public.project_brief_drafts for select to authenticated using((select public.is_inquiry_staff()));
create policy project_brief_version_read on public.project_brief_versions for select to authenticated using((select public.is_inquiry_staff()) or public.has_client_project(request_id));

create function public.valid_project_brief_body(b jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare k text; max_len integer;
begin
  if b is null or jsonb_typeof(b)<>'object' or octet_length(b::text)>49152 then return false; end if;
  if (select count(*) from jsonb_object_keys(b))<>9 then return false; end if;
  foreach k in array array['title','objectives','audience','context','scope','requirements','timeline','assets','notes'] loop
    max_len:=case k when 'title' then 200 when 'context' then 8000 when 'scope' then 8000 when 'objectives' then 6000 when 'requirements' then 6000 when 'assets' then 6000 else 4000 end;
    if jsonb_typeof(b->k) is distinct from 'string' or length(b->>k)>max_len then return false; end if;
  end loop;
  if length(btrim(b->>'title'))=0 then return false; end if;
  return true;
exception when others then return false;
end;$$;
revoke all on function public.valid_project_brief_body(jsonb) from public,anon,authenticated;

create function public.project_body_set_task_status(b jsonb,p_task_id text,p_status text) returns jsonb
language sql immutable set search_path='' as $$
  select case when exists(select 1 from jsonb_array_elements(b->'tasks') t where t->>'id'=p_task_id)
    then jsonb_set(
      b,
      '{tasks}',
      (select jsonb_agg(case when value->>'id'=p_task_id then jsonb_set(value,'{status}',to_jsonb(p_status),false) else value end order by ord)
       from jsonb_array_elements(b->'tasks') with ordinality as e(value,ord)),
      false
    )
    else b
  end;
$$;
revoke all on function public.project_body_set_task_status(jsonb,text,text) from public,anon,authenticated;

/* =========================================================
   BACKFILL EXISTING PROJECTS WITHOUT EXPOSING OLD TASKS
   Existing tasks default to Bivi ownership until staff explicitly changes them.
   ========================================================= */

insert into public.project_lifecycle(request_id,phase,revision)
select request_id,case when state='completed' then 'handoff' else 'discovery' end,1
from public.inquiry_projects
on conflict(request_id) do nothing;

insert into public.project_task_controls(request_id,task_id,owner_type,phase,updated_by)
select p.request_id,t.value->>'id','bivi',l.phase,p.updated_by
from public.inquiry_projects p
join public.project_lifecycle l on l.request_id=p.request_id
cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
where length(btrim(t.value->>'id')) between 1 and 100
on conflict(request_id,task_id) do nothing;

insert into public.project_brief_drafts(request_id,revision,body,updated_by)
select p.request_id,1,jsonb_build_object(
  'title',left(coalesce(nullif(btrim(p.body->>'title'),''),'Project brief'),200),
  'objectives',left(coalesce(p.scope_snapshot->>'summary',''),6000),
  'audience','',
  'context','',
  'scope',left(concat_ws(E'\n\n',nullif(p.scope_snapshot->>'summary',''),case when coalesce(p.scope_snapshot->>'deliverables','')<>'' then 'Deliverables'||E'\n'||(p.scope_snapshot->>'deliverables') end,case when coalesce(p.scope_snapshot->>'exclusions','')<>'' then 'Exclusions'||E'\n'||(p.scope_snapshot->>'exclusions') end),8000),
  'requirements',left(coalesce(p.scope_snapshot->>'clientInputs',''),6000),
  'timeline',left(coalesce(p.scope_snapshot->>'schedule',''),4000),
  'assets','',
  'notes',''
),p.updated_by
from public.inquiry_projects p
on conflict(request_id) do nothing;

/* =========================================================
   PROJECT ACTIVATION + TASK CONTROL SYNCHRONIZATION
   ========================================================= */

create or replace function public.manage_inquiry_project(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 actor uuid:=auth.uid();action text:=p_command->>'action';expected integer;current_row public.inquiry_projects%rowtype;
 p public.inquiry_proposals%rowtype;g public.inquiry_readiness%rowtype;o public.inquiry_onboarding%rowtype;
 b jsonb;next_state text;reason text:='';next_revision integer;items_snapshot jsonb;
 seed_tasks jsonb;seed_controls jsonb;brief_seed jsonb;task_item jsonb;control_item jsonb;
 task_id text;owner_type text;task_phase text;service_id text;depends_on text;blocker_owner text;lifecycle_phase text;
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
  select coalesce(jsonb_agg(to_jsonb(i) order by i.item_key),'[]'::jsonb) into items_snapshot from public.inquiry_onboarding_items i where i.request_id=p_request_id;

  seed_tasks:=coalesce(p_command->'seedTasks','[]'::jsonb);
  seed_controls:=coalesce(p_command->'seedControls','[]'::jsonb);
  if jsonb_typeof(seed_tasks)<>'array' or jsonb_array_length(seed_tasks)>100 or jsonb_typeof(seed_controls)<>'array' or jsonb_array_length(seed_controls)>100 then raise exception 'Invalid project seed' using errcode='22023'; end if;
  if (select count(distinct value->>'taskId') from jsonb_array_elements(seed_controls))<>jsonb_array_length(seed_controls) then raise exception 'Invalid project seed' using errcode='22023'; end if;

  b:=jsonb_build_object('title',p.body->>'title','owner','','notes','','milestones','[]'::jsonb,'tasks',seed_tasks);
  if not public.valid_project_body(b) then raise exception 'Invalid project seed' using errcode='22023'; end if;
  if exists(select 1 from jsonb_array_elements(seed_controls) c where not exists(select 1 from jsonb_array_elements(seed_tasks) t where t->>'id'=c->>'taskId')) then raise exception 'Invalid project seed' using errcode='22023'; end if;

  next_state:='active';
  insert into public.inquiry_projects(request_id,proposal_version,revision,state,body,scope_snapshot,onboarding_snapshot,onboarding_items_snapshot,readiness_snapshot,activated_readiness_revision,activated_onboarding_revision,activated_by,updated_by)
  values(p_request_id,p.version,next_revision,next_state,b,p.body,o.body,items_snapshot,g.body,g.revision,o.revision,actor,actor);

  insert into public.project_lifecycle(request_id,phase,revision,updated_by) values(p_request_id,'discovery',1,actor);

  for task_item in select value from jsonb_array_elements(seed_tasks) loop
    task_id:=task_item->>'id';
    select value into control_item from jsonb_array_elements(seed_controls) where value->>'taskId'=task_id limit 1;
    owner_type:=coalesce(control_item->>'ownerType','bivi');
    task_phase:=coalesce(control_item->>'phase','discovery');
    service_id:=case when control_item is not null and jsonb_typeof(control_item->'serviceId')='string' then nullif(btrim(control_item->>'serviceId'),'') end;
    depends_on:=case when control_item is not null and jsonb_typeof(control_item->'dependsOn')='string' then nullif(btrim(control_item->>'dependsOn'),'') end;
    blocker_owner:=case when control_item is not null and jsonb_typeof(control_item->'blockerOwner')='string' then control_item->>'blockerOwner' end;
    if owner_type not in ('bivi','client') or public.project_phase_rank(task_phase)=999 or (service_id is not null and length(service_id)>100) or (depends_on is not null and (depends_on=task_id or not exists(select 1 from jsonb_array_elements(seed_tasks) d where d->>'id'=depends_on))) or (blocker_owner is not null and blocker_owner not in ('bivi','client','external')) then raise exception 'Invalid task controls' using errcode='22023'; end if;
    insert into public.project_task_controls(request_id,task_id,owner_type,phase,service_id,depends_on,blocker_owner,updated_by)
    values(p_request_id,task_id,owner_type,task_phase,service_id,depends_on,blocker_owner,actor);
    insert into public.project_task_history(request_id,task_id,action,snapshot,actor)
    values(p_request_id,task_id,'seed',jsonb_build_object('task',task_item,'control',jsonb_build_object('ownerType',owner_type,'phase',task_phase,'serviceId',service_id,'dependsOn',depends_on,'blockerOwner',blocker_owner)),actor);
    control_item:=null;
  end loop;

  brief_seed:=p_command->'briefSeed';
  if brief_seed is null or not public.valid_project_brief_body(brief_seed) then
    brief_seed:=jsonb_build_object(
      'title',left(coalesce(nullif(btrim(p.body->>'title'),''),'Project brief'),200),
      'objectives',left(coalesce(p.body->>'summary',''),6000),
      'audience','',
      'context','',
      'scope',left(concat_ws(E'\n\n',nullif(p.body->>'summary',''),case when coalesce(p.body->>'deliverables','')<>'' then 'Deliverables'||E'\n'||(p.body->>'deliverables') end,case when coalesce(p.body->>'exclusions','')<>'' then 'Exclusions'||E'\n'||(p.body->>'exclusions') end),8000),
      'requirements',left(coalesce(p.body->>'clientInputs',''),6000),
      'timeline',left(coalesce(p.body->>'schedule',''),4000),
      'assets','',
      'notes',''
    );
  end if;
  insert into public.project_brief_drafts(request_id,revision,body,updated_by) values(p_request_id,1,brief_seed,actor);
 else
  if action='save' then
   if next_state='completed' then return jsonb_build_object('result','locked'); end if;
   b:=p_command->'body';if not public.valid_project_body(b) then raise exception 'Invalid project data' using errcode='22023'; end if;

   if exists(
     select 1 from public.project_task_controls c
     where c.request_id=p_request_id and c.depends_on is not null
       and exists(select 1 from jsonb_array_elements(b->'tasks') t where t->>'id'=c.task_id)
       and not exists(select 1 from jsonb_array_elements(b->'tasks') d where d->>'id'=c.depends_on)
   ) then return jsonb_build_object('result','dependency'); end if;
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

  if action='save' then
    select phase into lifecycle_phase from public.project_lifecycle where request_id=p_request_id;
    lifecycle_phase:=coalesce(lifecycle_phase,'discovery');
    delete from public.project_task_controls c where c.request_id=p_request_id and not exists(select 1 from jsonb_array_elements(b->'tasks') t where t->>'id'=c.task_id);
    insert into public.project_task_controls(request_id,task_id,owner_type,phase,updated_by)
    select p_request_id,t.value->>'id','bivi',lifecycle_phase,actor from jsonb_array_elements(b->'tasks') t(value)
    where not exists(select 1 from public.project_task_controls c where c.request_id=p_request_id and c.task_id=t.value->>'id')
    on conflict(request_id,task_id) do nothing;
  end if;
 end if;

 insert into public.inquiry_project_history(request_id,action,reason,snapshot,actor) values(p_request_id,action,reason,jsonb_build_object('revision',next_revision,'state',next_state,'body',b),actor);
 return jsonb_build_object('result','saved','revision',next_revision);
end;$$;
revoke all on function public.manage_inquiry_project(uuid,jsonb) from public,anon;
grant execute on function public.manage_inquiry_project(uuid,jsonb) to authenticated;

/* =========================================================
   STAFF LIFECYCLE + TASK CONTROL COMMANDS
   ========================================================= */

create function public.manage_project_lifecycle(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();current_row public.project_lifecycle%rowtype;expected integer;next_phase text;reason text;next_revision integer;project_state text;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if p_command->>'action' is distinct from 'set_phase' or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' or jsonb_typeof(p_command->'phase') is distinct from 'string' or public.project_phase_rank(p_command->>'phase')=999 or jsonb_typeof(p_command->'reason') is distinct from 'string' or length(btrim(p_command->>'reason')) not between 1 and 2000 then raise exception 'Invalid lifecycle command' using errcode='22023'; end if;
 expected:=(p_command->>'expectedRevision')::integer;next_phase:=p_command->>'phase';reason:=btrim(p_command->>'reason');
 select state into project_state from public.inquiry_projects where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 if project_state='completed' then return jsonb_build_object('result','locked'); end if;
 select * into current_row from public.project_lifecycle where request_id=p_request_id for update;
 if current_row.request_id is null then return jsonb_build_object('result','not_found'); end if;
 if current_row.revision<>expected then return jsonb_build_object('result','conflict'); end if;
 if next_phase=current_row.phase then return jsonb_build_object('result','saved','revision',current_row.revision); end if;
 if public.project_phase_rank(next_phase)>3 and not exists(select 1 from public.project_brief_versions v where v.request_id=p_request_id and v.version=(select max(v2.version) from public.project_brief_versions v2 where v2.request_id=p_request_id) and v.status='approved') then return jsonb_build_object('result','brief_required'); end if;
 next_revision:=expected+1;
 update public.project_lifecycle set phase=next_phase,revision=next_revision,updated_at=now(),updated_by=actor where request_id=p_request_id;
 insert into public.project_lifecycle_history(request_id,previous_phase,next_phase,reason,revision,actor) values(p_request_id,current_row.phase,next_phase,reason,next_revision,actor);
 return jsonb_build_object('result','saved','revision',next_revision);
end;$$;
revoke all on function public.manage_project_lifecycle(uuid,jsonb) from public,anon;
grant execute on function public.manage_project_lifecycle(uuid,jsonb) to authenticated;

create function public.manage_project_task_control(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();p public.inquiry_projects%rowtype;c public.project_task_controls%rowtype;task jsonb;expected integer;v_task_id text;v_owner_type text;v_task_phase text;v_service_id text;v_depends_on text;v_blocker_owner text;next_revision integer;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if p_command->>'action' is distinct from 'update_task' or jsonb_typeof(p_command->'taskId') is distinct from 'string' or length(btrim(p_command->>'taskId')) not between 1 and 100 or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' or jsonb_typeof(p_command->'ownerType') is distinct from 'string' or p_command->>'ownerType' not in ('bivi','client') or jsonb_typeof(p_command->'phase') is distinct from 'string' or public.project_phase_rank(p_command->>'phase')=999 then raise exception 'Invalid task control command' using errcode='22023'; end if;
 v_task_id:=btrim(p_command->>'taskId');expected:=(p_command->>'expectedRevision')::integer;v_owner_type:=p_command->>'ownerType';v_task_phase:=p_command->>'phase';
 v_service_id:=case when jsonb_typeof(p_command->'serviceId')='string' then nullif(btrim(p_command->>'serviceId'),'') end;
 v_depends_on:=case when jsonb_typeof(p_command->'dependsOn')='string' then nullif(btrim(p_command->>'dependsOn'),'') end;
 v_blocker_owner:=case when jsonb_typeof(p_command->'blockerOwner')='string' then p_command->>'blockerOwner' end;
 if (v_service_id is not null and length(v_service_id)>100) or (v_depends_on is not null and (length(v_depends_on)>100 or v_depends_on=v_task_id)) or (v_blocker_owner is not null and v_blocker_owner not in ('bivi','client','external')) then raise exception 'Invalid task controls' using errcode='22023'; end if;
 select * into p from public.inquiry_projects where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 if p.state='completed' then return jsonb_build_object('result','locked'); end if;
 select value into task from jsonb_array_elements(p.body->'tasks') where value->>'id'=v_task_id limit 1;
 if task is null then return jsonb_build_object('result','not_found'); end if;
 if v_depends_on is not null and not exists(select 1 from jsonb_array_elements(p.body->'tasks') where value->>'id'=v_depends_on) then return jsonb_build_object('result','dependency'); end if;
 select * into c from public.project_task_controls where request_id=p_request_id and project_task_controls.task_id=v_task_id for update;
 if c.request_id is null then return jsonb_build_object('result','not_found'); end if;
 if c.revision<>expected then return jsonb_build_object('result','conflict'); end if;
 next_revision:=expected+1;
 update public.project_task_controls set owner_type=v_owner_type,phase=v_task_phase,service_id=v_service_id,depends_on=v_depends_on,blocker_owner=v_blocker_owner,revision=next_revision,updated_at=now(),updated_by=actor where request_id=p_request_id and project_task_controls.task_id=v_task_id returning * into c;
 insert into public.project_task_history(request_id,task_id,action,snapshot,actor) values(p_request_id,v_task_id,'metadata',jsonb_build_object('task',task,'control',to_jsonb(c)),actor);
 return jsonb_build_object('result','saved','revision',next_revision);
end;$$;
revoke all on function public.manage_project_task_control(uuid,jsonb) from public,anon;
grant execute on function public.manage_project_task_control(uuid,jsonb) to authenticated;

/* =========================================================
   BRIEF DRAFT / ISSUE / CLIENT DECISION
   ========================================================= */

create function public.manage_project_brief(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();action text:=p_command->>'action';expected integer;d public.project_brief_drafts%rowtype;p public.inquiry_projects%rowtype;b jsonb;next_revision integer;latest integer;new_body jsonb;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if action not in ('save','request_review') or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' then raise exception 'Invalid brief command' using errcode='22023'; end if;
 expected:=(p_command->>'expectedRevision')::integer;
 select * into p from public.inquiry_projects where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 if p.state='completed' or exists(select 1 from public.project_lifecycle l where l.request_id=p_request_id and public.project_phase_rank(l.phase)>3) then return jsonb_build_object('result','locked'); end if;
 select * into d from public.project_brief_drafts where request_id=p_request_id for update;
 if d.request_id is null then return jsonb_build_object('result','not_found'); end if;
 if d.revision<>expected then return jsonb_build_object('result','conflict'); end if;
 next_revision:=expected+1;
 if action='save' then
  b:=p_command->'body';if not public.valid_project_brief_body(b) then raise exception 'Invalid project brief' using errcode='22023'; end if;
  update public.project_brief_drafts set body=b,revision=next_revision,updated_at=now(),updated_by=actor where request_id=p_request_id;
  return jsonb_build_object('result','saved','revision',next_revision);
 end if;
 if length(btrim(d.body->>'title'))=0 or length(btrim(d.body->>'objectives'))=0 or length(btrim(d.body->>'scope'))=0 then return jsonb_build_object('result','incomplete'); end if;
 select coalesce(max(version),0) into latest from public.project_brief_versions where request_id=p_request_id;
 update public.project_brief_versions set status='superseded',decided_at=now(),decided_by=actor,decision_note='Superseded by a newer brief version.' where request_id=p_request_id and status='pending';
 insert into public.project_brief_versions(request_id,version,body,published_by) values(p_request_id,latest+1,d.body,actor);
 update public.project_brief_drafts set revision=next_revision,updated_at=now(),updated_by=actor where request_id=p_request_id;
 new_body:=public.project_body_set_task_status(p.body,'project-brief-bivi-prepare','done');
 new_body:=public.project_body_set_task_status(new_body,'project-brief-client-approval','todo');
 if new_body is distinct from p.body then
  update public.inquiry_projects set body=new_body,revision=revision+1,updated_at=now(),updated_by=actor where request_id=p_request_id;
  insert into public.project_task_history(request_id,task_id,action,snapshot,actor) values(p_request_id,'project-brief-bivi-prepare','brief_review',jsonb_build_object('status','done','briefVersion',latest+1),actor);
  insert into public.project_task_history(request_id,task_id,action,snapshot,actor) values(p_request_id,'project-brief-client-approval','brief_review',jsonb_build_object('status','todo','briefVersion',latest+1),actor);
 end if;
 return jsonb_build_object('result','saved','revision',next_revision,'version',latest+1);
end;$$;
revoke all on function public.manage_project_brief(uuid,jsonb) from public,anon;
grant execute on function public.manage_project_brief(uuid,jsonb) to authenticated;

create function public.review_project_brief(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();v integer;decision text:=p_command->>'decision';note text:=coalesce(p_command->>'note','');brief public.project_brief_versions%rowtype;p public.inquiry_projects%rowtype;new_body jsonb;
begin
 if actor is null then raise exception 'Client authorization required' using errcode='42501'; end if;
 perform 1 from public.project_clients where request_id=p_request_id and user_id=actor and active and can_review for update;
 if not found then raise exception 'Client reviewer authorization required' using errcode='42501'; end if;
 if jsonb_typeof(p_command->'version') is distinct from 'number' or p_command->>'version'!~'^[0-9]{1,8}$' or decision not in ('approved','changes_requested') or jsonb_typeof(p_command->'note') is distinct from 'string' or length(note)>4000 or (decision='changes_requested' and length(btrim(note))=0) then raise exception 'Invalid brief review' using errcode='22023'; end if;
 v:=(p_command->>'version')::integer;note:=btrim(note);
 select * into p from public.inquiry_projects where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 if p.state='completed' then return jsonb_build_object('result','locked'); end if;
 select * into brief from public.project_brief_versions where request_id=p_request_id and version=v for update;
 if brief.request_id is null then return jsonb_build_object('result','not_found'); end if;
 if brief.status<>'pending' then return jsonb_build_object('result','review_closed'); end if;
 update public.project_brief_versions set status=decision,decided_at=now(),decided_by=actor,decision_note=note where request_id=p_request_id and version=v;
 if decision='approved' then
  new_body:=public.project_body_set_task_status(p.body,'project-brief-bivi-prepare','done');
  new_body:=public.project_body_set_task_status(new_body,'project-brief-client-approval','done');
 else
  new_body:=public.project_body_set_task_status(p.body,'project-brief-bivi-prepare','doing');
  new_body:=public.project_body_set_task_status(new_body,'project-brief-client-approval','blocked');
 end if;
 if new_body is distinct from p.body then
  update public.inquiry_projects set body=new_body,revision=revision+1,updated_at=now(),updated_by=actor where request_id=p_request_id;
  insert into public.project_task_history(request_id,task_id,action,snapshot,actor) values(p_request_id,'project-brief-client-approval','brief_review',jsonb_build_object('decision',decision,'briefVersion',v,'note',note),actor);
 end if;
 return jsonb_build_object('result','saved');
end;$$;
revoke all on function public.review_project_brief(uuid,jsonb) from public,anon;
grant execute on function public.review_project_brief(uuid,jsonb) to authenticated;

/* =========================================================
   CLIENT TASK UPDATE + SANITIZED WORK VIEW
   ========================================================= */

create function public.manage_client_project_task(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();p public.inquiry_projects%rowtype;c public.project_task_controls%rowtype;l public.project_lifecycle%rowtype;task jsonb;dep_task jsonb;v_task_id text;new_status text;v_client_note text;expected_project integer;expected_control integer;new_tasks jsonb;new_task jsonb;project_revision integer;control_revision integer;
begin
 if actor is null then raise exception 'Client authorization required' using errcode='42501'; end if;
 perform 1 from public.project_clients where request_id=p_request_id and user_id=actor and active for update;
 if not found then raise exception 'Client project authorization required' using errcode='42501'; end if;
 if jsonb_typeof(p_command->'taskId') is distinct from 'string' or length(btrim(p_command->>'taskId')) not between 1 and 100 or jsonb_typeof(p_command->'expectedProjectRevision') is distinct from 'number' or p_command->>'expectedProjectRevision'!~'^[0-9]{1,8}$' or jsonb_typeof(p_command->'expectedControlRevision') is distinct from 'number' or p_command->>'expectedControlRevision'!~'^[0-9]{1,8}$' or jsonb_typeof(p_command->'status') is distinct from 'string' or p_command->>'status' not in ('todo','doing','done') or jsonb_typeof(p_command->'clientNote') is distinct from 'string' or length(p_command->>'clientNote')>2000 then raise exception 'Invalid client task update' using errcode='22023'; end if;
 v_task_id:=btrim(p_command->>'taskId');new_status:=p_command->>'status';v_client_note:=btrim(p_command->>'clientNote');expected_project:=(p_command->>'expectedProjectRevision')::integer;expected_control:=(p_command->>'expectedControlRevision')::integer;
 select * into p from public.inquiry_projects where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 if p.state<>'active' then return jsonb_build_object('result','locked'); end if;
 if p.revision<>expected_project then return jsonb_build_object('result','conflict'); end if;
 select * into l from public.project_lifecycle where request_id=p_request_id;
 select * into c from public.project_task_controls where request_id=p_request_id and project_task_controls.task_id=v_task_id for update;
 if c.request_id is null or c.owner_type<>'client' then return jsonb_build_object('result','not_found'); end if;
 if c.revision<>expected_control then return jsonb_build_object('result','conflict'); end if;
 if public.project_phase_rank(c.phase)>public.project_phase_rank(l.phase) then return jsonb_build_object('result','phase_closed'); end if;
 if c.blocker_owner is not null then return jsonb_build_object('result','blocked'); end if;
 select value into task from jsonb_array_elements(p.body->'tasks') where value->>'id'=v_task_id limit 1;
 if task is null then return jsonb_build_object('result','not_found'); end if;
 if c.depends_on is not null then
  select value into dep_task from jsonb_array_elements(p.body->'tasks') where value->>'id'=c.depends_on limit 1;
  if dep_task is null or dep_task->>'status'<>'done' then return jsonb_build_object('result','dependency'); end if;
 end if;
 if v_task_id='project-brief-client-approval' and new_status='done' and not exists(select 1 from public.project_brief_versions v where v.request_id=p_request_id and v.version=(select max(v2.version) from public.project_brief_versions v2 where v2.request_id=p_request_id) and v.status='approved') then return jsonb_build_object('result','approval_required'); end if;
 new_task:=jsonb_set(task,'{status}',to_jsonb(new_status),false);
 select jsonb_agg(case when value->>'id'=v_task_id then new_task else value end order by ord) into new_tasks from jsonb_array_elements(p.body->'tasks') with ordinality as e(value,ord);
 update public.inquiry_projects set body=jsonb_set(p.body,'{tasks}',new_tasks,false),revision=revision+1,updated_at=now(),updated_by=actor where request_id=p_request_id returning revision into project_revision;
 update public.project_task_controls set client_note=v_client_note,revision=revision+1,updated_at=now(),updated_by=actor where request_id=p_request_id and project_task_controls.task_id=v_task_id returning revision into control_revision;
 insert into public.project_task_history(request_id,task_id,action,snapshot,actor) values(p_request_id,v_task_id,'client_update',jsonb_build_object('task',new_task,'clientNote',v_client_note),actor);
 return jsonb_build_object('result','saved','projectRevision',project_revision,'controlRevision',control_revision,'status',new_status);
end;$$;
revoke all on function public.manage_client_project_task(uuid,jsonb) from public,anon;
grant execute on function public.manage_client_project_task(uuid,jsonb) to authenticated;

create function public.client_project_work(p_request_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=auth.uid();p public.inquiry_projects%rowtype;l public.project_lifecycle%rowtype;tasks jsonb;next_action jsonb;waiting_client integer;waiting_bivi integer;
begin
 if actor is null or not exists(select 1 from public.project_clients where request_id=p_request_id and user_id=actor and active) then return null; end if;
 select * into p from public.inquiry_projects where request_id=p_request_id;
 if not found then return null; end if;
 select * into l from public.project_lifecycle where request_id=p_request_id;
 if l.request_id is null then return null; end if;

 select coalesce(jsonb_agg(jsonb_build_object(
   'id',t.value->>'id','title',t.value->>'title',
   'dueOn',case when jsonb_typeof(t.value->'dueOn')='string' then t.value->>'dueOn' else null end,
   'status',t.value->>'status','phase',c.phase,'dependsOn',c.depends_on,
   'dependencyComplete',(c.depends_on is null or exists(select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done')),
   'blockerOwner',c.blocker_owner,'clientNote',c.client_note,'serviceId',c.service_id,'controlRevision',c.revision
 ) order by public.project_phase_rank(c.phase),coalesce(t.value->>'dueOn','9999-12-31'),t.value->>'title'),'[]'::jsonb)
 into tasks
 from jsonb_array_elements(p.body->'tasks') t(value)
 join public.project_task_controls c on c.request_id=p_request_id and c.task_id=t.value->>'id'
 where c.owner_type='client';

 select jsonb_build_object('id',t.value->>'id','title',t.value->>'title','dueOn',case when jsonb_typeof(t.value->'dueOn')='string' then t.value->>'dueOn' else null end)
 into next_action
 from jsonb_array_elements(p.body->'tasks') t(value)
 join public.project_task_controls c on c.request_id=p_request_id and c.task_id=t.value->>'id'
 where c.owner_type='client' and t.value->>'status'<>'done' and c.blocker_owner is null
   and public.project_phase_rank(c.phase)<=public.project_phase_rank(l.phase)
   and (c.depends_on is null or exists(select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done'))
 order by public.project_phase_rank(c.phase),coalesce(t.value->>'dueOn','9999-12-31'),t.value->>'title' limit 1;

 select count(*)::integer into waiting_client
 from jsonb_array_elements(p.body->'tasks') t(value)
 join public.project_task_controls c on c.request_id=p_request_id and c.task_id=t.value->>'id'
 where c.owner_type='client' and t.value->>'status'<>'done' and c.blocker_owner is null
   and public.project_phase_rank(c.phase)<=public.project_phase_rank(l.phase)
   and (c.depends_on is null or exists(select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done'));

 select count(*)::integer into waiting_bivi
 from jsonb_array_elements(p.body->'tasks') t(value)
 join public.project_task_controls c on c.request_id=p_request_id and c.task_id=t.value->>'id'
 where t.value->>'status'<>'done' and public.project_phase_rank(c.phase)<=public.project_phase_rank(l.phase)
   and (c.owner_type='bivi' or c.blocker_owner='bivi');

 return jsonb_build_object(
   'requestId',p.request_id,'title',p.body->>'title','state',p.state,'projectRevision',p.revision,
   'currentPhase',l.phase,'nextAction',next_action,'waitingOnClient',coalesce(waiting_client,0),
   'waitingOnBivi',coalesce(waiting_bivi,0),'tasks',tasks
 );
end;$$;
revoke all on function public.client_project_work(uuid) from public,anon;
grant execute on function public.client_project_work(uuid) to authenticated;

commit;
