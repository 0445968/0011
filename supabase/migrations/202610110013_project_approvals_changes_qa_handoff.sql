-- Requires migrations 001–012. Version-linked deliverable approvals, structured
-- change requests, QA, release, handoff, support terms and closeout gates.
begin;

/* =========================================================
   DELIVERABLES + VERSION-SPECIFIC CLIENT APPROVALS
   ========================================================= */

create table public.project_deliverables (
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  deliverable_id text not null check(deliverable_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$'),
  title text not null check(length(btrim(title)) between 1 and 300),
  description text not null default '' check(length(description) <= 4000),
  requires_approval boolean not null default true,
  revision integer not null default 1 check(revision > 0),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key(request_id,deliverable_id)
);

create table public.project_deliverable_versions (
  request_id uuid not null,
  deliverable_id text not null,
  version integer not null check(version > 0),
  revision_round integer not null check(revision_round > 0),
  summary text not null check(length(btrim(summary)) between 1 and 4000),
  artifact_url text check(artifact_url is null or artifact_url ~ '^https://[^/?#[:space:]@]+([/?#][^[:space:]]*)?$'),
  notes text not null default '' check(length(notes) <= 4000),
  status text not null default 'pending_review' check(status in ('pending_review','approved','changes_requested','superseded')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  decided_by uuid references auth.users(id) on delete set null,
  decision_note text not null default '' check(length(decision_note) <= 4000),
  primary key(request_id,deliverable_id,version),
  foreign key(request_id,deliverable_id) references public.project_deliverables(request_id,deliverable_id) on delete cascade
);

create unique index one_pending_deliverable_version on public.project_deliverable_versions(request_id,deliverable_id) where status='pending_review';
create index project_deliverable_versions_status on public.project_deliverable_versions(request_id,status);

alter table public.project_deliverables enable row level security;
alter table public.project_deliverable_versions enable row level security;
revoke all on public.project_deliverables,public.project_deliverable_versions from public,anon,authenticated;
grant select on public.project_deliverables,public.project_deliverable_versions to authenticated;
create policy project_deliverables_read on public.project_deliverables for select to authenticated using((select public.is_inquiry_staff()) or public.has_client_project(request_id));
create policy project_deliverable_versions_read on public.project_deliverable_versions for select to authenticated using((select public.is_inquiry_staff()) or public.has_client_project(request_id));

/* =========================================================
   STRUCTURED CHANGE REQUESTS
   Requested -> evaluation -> impact proposal -> client decision -> applied
   ========================================================= */

create table public.project_change_requests (
  id uuid primary key,
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  revision integer not null default 1 check(revision > 0),
  title text not null check(length(btrim(title)) between 1 and 300),
  description text not null check(length(btrim(description)) between 1 and 8000),
  requester_type text not null check(requester_type in ('client','bivi')),
  state text not null check(state in ('requested','evaluating','proposed','accepted','rejected','applied','cancelled')),
  cost_impact text not null default '' check(length(cost_impact) <= 3000),
  schedule_impact text not null default '' check(length(schedule_impact) <= 3000),
  scope_impact text not null default '' check(length(scope_impact) <= 6000),
  staff_note text not null default '' check(length(staff_note) <= 4000),
  client_note text not null default '' check(length(client_note) <= 4000),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  proposed_at timestamptz,
  decided_at timestamptz,
  decided_by uuid references auth.users(id) on delete set null,
  applied_at timestamptz,
  applied_by uuid references auth.users(id) on delete set null
);

create table public.project_change_request_history (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  change_id uuid not null,
  action text not null check(action in ('create','evaluate','propose','accept','reject','apply','cancel')),
  revision integer not null,
  snapshot jsonb not null,
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index project_change_requests_project on public.project_change_requests(request_id,created_at desc);
create index project_change_requests_state on public.project_change_requests(request_id,state);
alter table public.project_change_requests enable row level security;
alter table public.project_change_request_history enable row level security;
revoke all on public.project_change_requests,public.project_change_request_history from public,anon,authenticated;
grant select on public.project_change_requests,public.project_change_request_history to authenticated;
create policy project_change_requests_read on public.project_change_requests for select to authenticated using((select public.is_inquiry_staff()) or public.has_client_project(request_id));
create policy project_change_history_staff_read on public.project_change_request_history for select to authenticated using((select public.is_inquiry_staff()));

/* =========================================================
   QA + HANDOFF + RELEASE / SUPPORT CLOSEOUT
   ========================================================= */

create table public.project_qa_checks (
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  check_id text not null check(check_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$'),
  title text not null check(length(btrim(title)) between 1 and 300),
  required boolean not null default true,
  status text not null default 'pending' check(status in ('pending','passed','failed','waived')),
  notes text not null default '' check(length(notes) <= 4000),
  revision integer not null default 1 check(revision > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key(request_id,check_id)
);

create table public.project_handoff_items (
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  item_id text not null check(item_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$'),
  title text not null check(length(btrim(title)) between 1 and 300),
  required boolean not null default true,
  status text not null default 'pending' check(status in ('pending','complete','waived')),
  notes text not null default '' check(length(notes) <= 4000),
  revision integer not null default 1 check(revision > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key(request_id,item_id)
);

create table public.project_closeout (
  request_id uuid primary key references public.inquiry_projects(request_id) on delete cascade,
  revision integer not null default 1 check(revision > 0),
  release_state text not null default 'preparing' check(release_state in ('preparing','released')),
  release_notes text not null default '' check(length(release_notes) <= 8000),
  released_at timestamptz,
  released_by uuid references auth.users(id) on delete set null,
  client_receipt_at timestamptz,
  client_receipt_by uuid references auth.users(id) on delete set null,
  support_start date,
  support_end date,
  support_terms text not null default '' check(length(support_terms) <= 6000),
  closeout_summary text not null default '' check(length(closeout_summary) <= 6000),
  closed_at timestamptz,
  closed_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  check(support_start is null or support_end is null or support_end >= support_start)
);

alter table public.project_qa_checks enable row level security;
alter table public.project_handoff_items enable row level security;
alter table public.project_closeout enable row level security;
revoke all on public.project_qa_checks,public.project_handoff_items,public.project_closeout from public,anon,authenticated;
grant select on public.project_qa_checks,public.project_handoff_items,public.project_closeout to authenticated;
create policy qa_checks_read on public.project_qa_checks for select to authenticated using((select public.is_inquiry_staff()) or public.has_client_project(request_id));
create policy handoff_items_read on public.project_handoff_items for select to authenticated using((select public.is_inquiry_staff()) or public.has_client_project(request_id));
create policy closeout_read on public.project_closeout for select to authenticated using((select public.is_inquiry_staff()) or public.has_client_project(request_id));

create function public.seed_project_delivery_controls(p_request_id uuid,p_actor uuid default null) returns void
language plpgsql security definer set search_path='' as $$
begin
  insert into public.project_qa_checks(request_id,check_id,title,required,updated_by) values
    (p_request_id,'scope','Verify completed work matches the approved scope and applied changes',true,p_actor),
    (p_request_id,'content','Verify final content, facts, links and client-provided material',true,p_actor),
    (p_request_id,'technical','Verify technical, responsive or production requirements',true,p_actor),
    (p_request_id,'files','Verify final files, formats, naming and delivery package',true,p_actor),
    (p_request_id,'approval','Verify required client approvals are recorded',true,p_actor)
  on conflict(request_id,check_id) do nothing;

  insert into public.project_handoff_items(request_id,item_id,title,required,updated_by) values
    (p_request_id,'final-assets','Deliver final approved assets and files',true,p_actor),
    (p_request_id,'access-transfer','Transfer agreed accounts, ownership and access',true,p_actor),
    (p_request_id,'documentation','Provide agreed documentation and usage/maintenance notes',true,p_actor),
    (p_request_id,'archive','Confirm Bivi project archive and handoff record',true,p_actor)
  on conflict(request_id,item_id) do nothing;

  insert into public.project_closeout(request_id,updated_by) values(p_request_id,p_actor)
  on conflict(request_id) do nothing;
end;$$;
revoke all on function public.seed_project_delivery_controls(uuid,uuid) from public,anon,authenticated;

select public.seed_project_delivery_controls(request_id,updated_by) from public.inquiry_projects;

create function public.seed_delivery_controls_after_project_insert() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  perform public.seed_project_delivery_controls(new.request_id,new.updated_by);
  return new;
end;$$;
create trigger inquiry_projects_seed_delivery after insert on public.inquiry_projects for each row execute function public.seed_delivery_controls_after_project_insert();

/* =========================================================
   READINESS HELPERS + DATABASE GATES
   ========================================================= */

create function public.project_delivery_ready(p_request_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select
    exists(select 1 from public.project_deliverables d where d.request_id=p_request_id)
    and not exists(
      select 1 from public.project_deliverables d
      where d.request_id=p_request_id and d.requires_approval and not exists(
        select 1 from public.project_deliverable_versions v
        where v.request_id=d.request_id and v.deliverable_id=d.deliverable_id
          and v.version=(select max(v2.version) from public.project_deliverable_versions v2 where v2.request_id=d.request_id and v2.deliverable_id=d.deliverable_id)
          and v.status='approved'
      )
    )
    and not exists(select 1 from public.project_qa_checks q where q.request_id=p_request_id and q.required and q.status not in ('passed','waived'))
    and not exists(select 1 from public.project_change_requests c where c.request_id=p_request_id and c.state in ('requested','evaluating','proposed','accepted'));
$$;
revoke all on function public.project_delivery_ready(uuid) from public,anon;
grant execute on function public.project_delivery_ready(uuid) to authenticated;

create function public.project_closeout_ready(p_request_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(
    select 1 from public.project_closeout c
    where c.request_id=p_request_id and c.release_state='released' and c.client_receipt_at is not null
      and length(btrim(c.support_terms))>0 and length(btrim(c.closeout_summary))>0 and c.closed_at is not null
  ) and not exists(
    select 1 from public.project_handoff_items h where h.request_id=p_request_id and h.required and h.status not in ('complete','waived')
  );
$$;
revoke all on function public.project_closeout_ready(uuid) from public,anon;
grant execute on function public.project_closeout_ready(uuid) to authenticated;

create function public.enforce_project_lifecycle_delivery_gates() returns trigger
language plpgsql set search_path='' as $$
begin
  if public.project_phase_rank(new.phase) > public.project_phase_rank(old.phase) then
    if public.project_phase_rank(new.phase) >= 8 and not public.project_delivery_ready(new.request_id) then
      raise exception 'Complete deliverable approvals, open change requests and required QA checks before Delivery.' using errcode='23514';
    end if;
    if new.phase='handoff' and not exists(select 1 from public.project_closeout c where c.request_id=new.request_id and c.release_state='released') then
      raise exception 'Release the final work before moving to Handoff.' using errcode='23514';
    end if;
  end if;
  return new;
end;$$;
create trigger project_lifecycle_delivery_gate before update of phase on public.project_lifecycle for each row execute function public.enforce_project_lifecycle_delivery_gates();

create function public.enforce_project_completion_closeout() returns trigger
language plpgsql set search_path='' as $$
begin
  if new.state='completed' and old.state is distinct from 'completed' then
    if not exists(select 1 from public.project_lifecycle l where l.request_id=new.request_id and l.phase='handoff') or not public.project_closeout_ready(new.request_id) then
      raise exception 'Complete handoff, client receipt confirmation and support closeout before completing the project.' using errcode='23514';
    end if;
  end if;
  return new;
end;$$;
create trigger inquiry_projects_closeout_gate before update of state on public.inquiry_projects for each row execute function public.enforce_project_completion_closeout();

/* =========================================================
   STAFF DELIVERY / QA / HANDOFF COMMANDS
   ========================================================= */

create function public.manage_project_delivery(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  actor uuid:=auth.uid();action text:=p_command->>'action';key text;expected integer;d public.project_deliverables%rowtype;
  q public.project_qa_checks%rowtype;h public.project_handoff_items%rowtype;c public.project_closeout%rowtype;
  latest integer;round_no integer;summary text;url text;notes text;new_revision integer;v_support_start date;v_support_end date;
begin
  if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
  perform 1 from public.inquiry_projects where request_id=p_request_id for update;
  if not found then return jsonb_build_object('result','not_found'); end if;

  if action='add_deliverable' then
    key:=p_command->>'deliverableId';
    if key is null or key!~'^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$' or jsonb_typeof(p_command->'title') is distinct from 'string' or length(btrim(p_command->>'title')) not between 1 and 300 or jsonb_typeof(p_command->'description') is distinct from 'string' or length(p_command->>'description')>4000 or jsonb_typeof(p_command->'requiresApproval') is distinct from 'boolean' then raise exception 'Invalid deliverable' using errcode='22023'; end if;
    if exists(select 1 from public.project_deliverables where request_id=p_request_id and deliverable_id=key) then return jsonb_build_object('result','conflict'); end if;
    insert into public.project_deliverables(request_id,deliverable_id,title,description,requires_approval,created_by,updated_by)
      values(p_request_id,key,btrim(p_command->>'title'),btrim(p_command->>'description'),(p_command->>'requiresApproval')::boolean,actor,actor);
    return jsonb_build_object('result','saved','revision',1);
  end if;

  if action='issue_deliverable' then
    key:=p_command->>'deliverableId';summary:=btrim(coalesce(p_command->>'summary',''));url:=nullif(btrim(coalesce(p_command->>'artifactUrl','')),'');notes:=btrim(coalesce(p_command->>'notes',''));
    if key is null or key!~'^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$' or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' or jsonb_typeof(p_command->'summary') is distinct from 'string' or length(summary) not between 1 and 4000 or jsonb_typeof(p_command->'artifactUrl') is distinct from 'string' or (url is not null and url!~'^https://[^/?#[:space:]@]+([/?#][^[:space:]]*)?$') or jsonb_typeof(p_command->'notes') is distinct from 'string' or length(notes)>4000 then raise exception 'Invalid deliverable version' using errcode='22023'; end if;
    expected:=(p_command->>'expectedRevision')::integer;
    select * into d from public.project_deliverables where request_id=p_request_id and deliverable_id=key for update;
    if d.request_id is null then return jsonb_build_object('result','not_found'); end if;
    if d.revision<>expected then return jsonb_build_object('result','conflict'); end if;
    if exists(select 1 from public.project_deliverable_versions where request_id=p_request_id and deliverable_id=key and status='pending_review') then return jsonb_build_object('result','review_open'); end if;
    select coalesce(max(version),0),coalesce(max(revision_round),0) into latest,round_no from public.project_deliverable_versions where request_id=p_request_id and deliverable_id=key;
    update public.project_deliverable_versions set status='superseded' where request_id=p_request_id and deliverable_id=key and status='approved';
    round_no:=round_no+1;new_revision:=expected+1;
    insert into public.project_deliverable_versions(request_id,deliverable_id,version,revision_round,summary,artifact_url,notes,created_by)
      values(p_request_id,key,latest+1,round_no,summary,url,notes,actor);
    update public.project_deliverables set revision=new_revision,updated_at=now(),updated_by=actor where request_id=p_request_id and deliverable_id=key;
    return jsonb_build_object('result','saved','revision',new_revision,'version',latest+1,'round',round_no);
  end if;

  if action='set_qa' then
    key:=p_command->>'checkId';
    if jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' or p_command->>'status' not in ('pending','passed','failed','waived') or jsonb_typeof(p_command->'notes') is distinct from 'string' or length(p_command->>'notes')>4000 then raise exception 'Invalid QA update' using errcode='22023'; end if;
    expected:=(p_command->>'expectedRevision')::integer;
    select * into q from public.project_qa_checks where request_id=p_request_id and check_id=key for update;
    if q.request_id is null then return jsonb_build_object('result','not_found'); end if;if q.revision<>expected then return jsonb_build_object('result','conflict'); end if;
    if p_command->>'status' in ('failed','waived') and length(btrim(p_command->>'notes'))=0 then return jsonb_build_object('result','note_required'); end if;
    new_revision:=expected+1;
    update public.project_qa_checks set status=p_command->>'status',notes=btrim(p_command->>'notes'),revision=new_revision,updated_at=now(),updated_by=actor where request_id=p_request_id and check_id=key;
    return jsonb_build_object('result','saved','revision',new_revision);
  end if;

  if action='set_handoff' then
    key:=p_command->>'itemId';
    if jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' or p_command->>'status' not in ('pending','complete','waived') or jsonb_typeof(p_command->'notes') is distinct from 'string' or length(p_command->>'notes')>4000 then raise exception 'Invalid handoff update' using errcode='22023'; end if;
    expected:=(p_command->>'expectedRevision')::integer;
    select * into h from public.project_handoff_items where request_id=p_request_id and item_id=key for update;
    if h.request_id is null then return jsonb_build_object('result','not_found'); end if;if h.revision<>expected then return jsonb_build_object('result','conflict'); end if;
    if p_command->>'status'='waived' and length(btrim(p_command->>'notes'))=0 then return jsonb_build_object('result','note_required'); end if;
    new_revision:=expected+1;
    update public.project_handoff_items set status=p_command->>'status',notes=btrim(p_command->>'notes'),revision=new_revision,updated_at=now(),updated_by=actor where request_id=p_request_id and item_id=key;
    return jsonb_build_object('result','saved','revision',new_revision);
  end if;

  select * into c from public.project_closeout where request_id=p_request_id for update;
  if c.request_id is null then perform public.seed_project_delivery_controls(p_request_id,actor);select * into c from public.project_closeout where request_id=p_request_id for update; end if;

  if action='release' then
    if jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' or jsonb_typeof(p_command->'releaseNotes') is distinct from 'string' or length(btrim(p_command->>'releaseNotes')) not between 1 and 8000 then raise exception 'Invalid release' using errcode='22023'; end if;
    expected:=(p_command->>'expectedRevision')::integer;if c.revision<>expected then return jsonb_build_object('result','conflict'); end if;
    if not public.project_delivery_ready(p_request_id) then return jsonb_build_object('result','delivery_not_ready'); end if;
    if c.release_state='released' then return jsonb_build_object('result','locked'); end if;
    new_revision:=expected+1;
    update public.project_closeout set release_state='released',release_notes=btrim(p_command->>'releaseNotes'),released_at=now(),released_by=actor,revision=new_revision,updated_at=now(),updated_by=actor where request_id=p_request_id;
    return jsonb_build_object('result','saved','revision',new_revision);
  end if;

  if action='close' then
    if jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' or jsonb_typeof(p_command->'supportTerms') is distinct from 'string' or length(btrim(p_command->>'supportTerms')) not between 1 and 6000 or jsonb_typeof(p_command->'summary') is distinct from 'string' or length(btrim(p_command->>'summary')) not between 1 and 6000 then raise exception 'Invalid closeout' using errcode='22023'; end if;
    expected:=(p_command->>'expectedRevision')::integer;if c.revision<>expected then return jsonb_build_object('result','conflict'); end if;
    if c.release_state<>'released' or c.client_receipt_at is null or exists(select 1 from public.project_handoff_items where request_id=p_request_id and required and status not in ('complete','waived')) then return jsonb_build_object('result','handoff_incomplete'); end if;
    v_support_start:=case when jsonb_typeof(p_command->'supportStart')='string' then (p_command->>'supportStart')::date end;
    v_support_end:=case when jsonb_typeof(p_command->'supportEnd')='string' then (p_command->>'supportEnd')::date end;
    if v_support_start is not null and v_support_end is not null and v_support_end<v_support_start then raise exception 'Invalid support dates' using errcode='22023'; end if;
    new_revision:=expected+1;
    update public.project_closeout set support_start=v_support_start,support_end=v_support_end,support_terms=btrim(p_command->>'supportTerms'),closeout_summary=btrim(p_command->>'summary'),closed_at=now(),closed_by=actor,revision=new_revision,updated_at=now(),updated_by=actor where request_id=p_request_id;
    return jsonb_build_object('result','saved','revision',new_revision);
  end if;

  raise exception 'Invalid delivery action' using errcode='22023';
exception when invalid_datetime_format or datetime_field_overflow then raise exception 'Invalid support dates' using errcode='22023';
end;$$;
revoke all on function public.manage_project_delivery(uuid,jsonb) from public,anon;
grant execute on function public.manage_project_delivery(uuid,jsonb) to authenticated;

/* =========================================================
   STAFF CHANGE REQUEST COMMANDS
   ========================================================= */

create function public.manage_project_change_request(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();action text:=p_command->>'action';cid uuid;expected integer;cr public.project_change_requests%rowtype;next_revision integer;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 perform 1 from public.inquiry_projects where request_id=p_request_id for update;if not found then return jsonb_build_object('result','not_found'); end if;
 if jsonb_typeof(p_command->'id') is distinct from 'string' or p_command->>'id'!~'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then raise exception 'Invalid change request' using errcode='22023'; end if;
 cid:=(p_command->>'id')::uuid;
 if action='create' then
  if jsonb_typeof(p_command->'title') is distinct from 'string' or length(btrim(p_command->>'title')) not between 1 and 300 or jsonb_typeof(p_command->'description') is distinct from 'string' or length(btrim(p_command->>'description')) not between 1 and 8000 then raise exception 'Invalid change request' using errcode='22023'; end if;
  if exists(select 1 from public.project_change_requests where id=cid) then return jsonb_build_object('result','conflict'); end if;
  insert into public.project_change_requests(id,request_id,title,description,requester_type,state,created_by,updated_by) values(cid,p_request_id,btrim(p_command->>'title'),btrim(p_command->>'description'),'bivi','requested',actor,actor) returning * into cr;
  insert into public.project_change_request_history(request_id,change_id,action,revision,snapshot,actor) values(p_request_id,cid,'create',cr.revision,to_jsonb(cr),actor);
  return jsonb_build_object('result','saved','revision',cr.revision);
 end if;
 if jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' then raise exception 'Invalid change request revision' using errcode='22023'; end if;
 expected:=(p_command->>'expectedRevision')::integer;select * into cr from public.project_change_requests where request_id=p_request_id and id=cid for update;
 if cr.id is null then return jsonb_build_object('result','not_found'); end if;if cr.revision<>expected then return jsonb_build_object('result','conflict'); end if;next_revision:=expected+1;
 if action='evaluate' then
  if cr.state<>'requested' then return jsonb_build_object('result','locked'); end if;
  if jsonb_typeof(p_command->'staffNote') is distinct from 'string' or length(btrim(p_command->>'staffNote')) not between 1 and 4000 then raise exception 'Evaluation note required' using errcode='22023'; end if;
  update public.project_change_requests set state='evaluating',staff_note=btrim(p_command->>'staffNote'),revision=next_revision,updated_at=now(),updated_by=actor where id=cid returning * into cr;
 elsif action='propose' then
  if cr.state not in ('requested','evaluating','rejected') then return jsonb_build_object('result','locked'); end if;
  if jsonb_typeof(p_command->'costImpact') is distinct from 'string' or jsonb_typeof(p_command->'scheduleImpact') is distinct from 'string' or jsonb_typeof(p_command->'scopeImpact') is distinct from 'string' or length(p_command->>'costImpact')>3000 or length(p_command->>'scheduleImpact')>3000 or length(btrim(p_command->>'scopeImpact')) not between 1 and 6000 then raise exception 'Impact proposal required' using errcode='22023'; end if;
  update public.project_change_requests set state='proposed',cost_impact=btrim(p_command->>'costImpact'),schedule_impact=btrim(p_command->>'scheduleImpact'),scope_impact=btrim(p_command->>'scopeImpact'),staff_note=btrim(coalesce(p_command->>'staffNote','')),proposed_at=now(),decided_at=null,decided_by=null,client_note='',revision=next_revision,updated_at=now(),updated_by=actor where id=cid returning * into cr;
 elsif action='apply' then
  if cr.state<>'accepted' then return jsonb_build_object('result','locked'); end if;
  if jsonb_typeof(p_command->'staffNote') is distinct from 'string' or length(btrim(p_command->>'staffNote')) not between 1 and 4000 then raise exception 'Application note required' using errcode='22023'; end if;
  update public.project_change_requests set state='applied',staff_note=btrim(p_command->>'staffNote'),applied_at=now(),applied_by=actor,revision=next_revision,updated_at=now(),updated_by=actor where id=cid returning * into cr;
 elsif action='cancel' then
  if cr.state in ('applied','cancelled') then return jsonb_build_object('result','locked'); end if;
  if jsonb_typeof(p_command->'staffNote') is distinct from 'string' or length(btrim(p_command->>'staffNote')) not between 1 and 4000 then raise exception 'Cancellation note required' using errcode='22023'; end if;
  update public.project_change_requests set state='cancelled',staff_note=btrim(p_command->>'staffNote'),revision=next_revision,updated_at=now(),updated_by=actor where id=cid returning * into cr;
 else raise exception 'Invalid change request action' using errcode='22023'; end if;
 insert into public.project_change_request_history(request_id,change_id,action,revision,snapshot,actor) values(p_request_id,cid,action,cr.revision,to_jsonb(cr),actor);
 return jsonb_build_object('result','saved','revision',cr.revision,'state',cr.state);
end;$$;
revoke all on function public.manage_project_change_request(uuid,jsonb) from public,anon;
grant execute on function public.manage_project_change_request(uuid,jsonb) to authenticated;

/* =========================================================
   CLIENT DELIVERABLE / CHANGE / RECEIPT COMMANDS
   ========================================================= */

create function public.manage_client_delivery(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();action text:=p_command->>'action';key text;v integer;decision text;note text;dv public.project_deliverable_versions%rowtype;cid uuid;cr public.project_change_requests%rowtype;c public.project_closeout%rowtype;expected integer;next_revision integer;
begin
 if actor is null then raise exception 'Client authorization required' using errcode='42501'; end if;
 perform 1 from public.project_clients where request_id=p_request_id and user_id=actor and active for update;if not found then raise exception 'Client project authorization required' using errcode='42501'; end if;

 if action='review_deliverable' then
  if not public.can_review_project(p_request_id) then raise exception 'Client reviewer authorization required' using errcode='42501'; end if;
  key:=p_command->>'deliverableId';decision:=p_command->>'decision';note:=btrim(coalesce(p_command->>'note',''));
  if jsonb_typeof(p_command->'version') is distinct from 'number' or p_command->>'version'!~'^[0-9]{1,8}$' or decision not in ('approved','changes_requested') or jsonb_typeof(p_command->'note') is distinct from 'string' or length(note)>4000 or (decision='changes_requested' and length(note)=0) then raise exception 'Invalid deliverable review' using errcode='22023'; end if;
  v:=(p_command->>'version')::integer;select * into dv from public.project_deliverable_versions where request_id=p_request_id and deliverable_id=key and version=v for update;
  if dv.request_id is null then return jsonb_build_object('result','not_found'); end if;if dv.status<>'pending_review' then return jsonb_build_object('result','review_closed'); end if;
  update public.project_deliverable_versions set status=decision,decision_note=note,decided_at=now(),decided_by=actor where request_id=p_request_id and deliverable_id=key and version=v;
  return jsonb_build_object('result','saved','status',decision);
 end if;

 if action='create_change' then
  if jsonb_typeof(p_command->'id') is distinct from 'string' or p_command->>'id'!~'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' or jsonb_typeof(p_command->'title') is distinct from 'string' or length(btrim(p_command->>'title')) not between 1 and 300 or jsonb_typeof(p_command->'description') is distinct from 'string' or length(btrim(p_command->>'description')) not between 1 and 8000 then raise exception 'Invalid change request' using errcode='22023'; end if;
  cid:=(p_command->>'id')::uuid;if exists(select 1 from public.project_change_requests where id=cid) then return jsonb_build_object('result','conflict'); end if;
  insert into public.project_change_requests(id,request_id,title,description,requester_type,state,created_by,updated_by) values(cid,p_request_id,btrim(p_command->>'title'),btrim(p_command->>'description'),'client','requested',actor,actor) returning * into cr;
  insert into public.project_change_request_history(request_id,change_id,action,revision,snapshot,actor) values(p_request_id,cid,'create',cr.revision,to_jsonb(cr),actor);
  return jsonb_build_object('result','saved','revision',cr.revision);
 end if;

 if action='decide_change' then
  if not public.can_review_project(p_request_id) then raise exception 'Client reviewer authorization required' using errcode='42501'; end if;
  if jsonb_typeof(p_command->'id') is distinct from 'string' or p_command->>'id'!~'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' or p_command->>'decision' not in ('accepted','rejected') or jsonb_typeof(p_command->'note') is distinct from 'string' or length(p_command->>'note')>4000 then raise exception 'Invalid change decision' using errcode='22023'; end if;
  cid:=(p_command->>'id')::uuid;expected:=(p_command->>'expectedRevision')::integer;select * into cr from public.project_change_requests where request_id=p_request_id and id=cid for update;
  if cr.id is null then return jsonb_build_object('result','not_found'); end if;if cr.revision<>expected then return jsonb_build_object('result','conflict'); end if;if cr.state<>'proposed' then return jsonb_build_object('result','review_closed'); end if;
  next_revision:=expected+1;decision:=p_command->>'decision';note:=btrim(p_command->>'note');
  update public.project_change_requests set state=decision,client_note=note,decided_at=now(),decided_by=actor,revision=next_revision,updated_at=now(),updated_by=actor where id=cid returning * into cr;
  insert into public.project_change_request_history(request_id,change_id,action,revision,snapshot,actor) values(p_request_id,cid,case when decision='accepted' then 'accept' else 'reject' end,cr.revision,to_jsonb(cr),actor);
  return jsonb_build_object('result','saved','revision',cr.revision,'state',cr.state);
 end if;

 if action='acknowledge_release' then
  if not public.can_review_project(p_request_id) then raise exception 'Client reviewer authorization required' using errcode='42501'; end if;
  if jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' then raise exception 'Invalid release acknowledgement' using errcode='22023'; end if;
  expected:=(p_command->>'expectedRevision')::integer;select * into c from public.project_closeout where request_id=p_request_id for update;
  if c.request_id is null then return jsonb_build_object('result','not_found'); end if;if c.revision<>expected then return jsonb_build_object('result','conflict'); end if;if c.release_state<>'released' then return jsonb_build_object('result','review_closed'); end if;
  if c.client_receipt_at is not null then return jsonb_build_object('result','saved','revision',c.revision); end if;
  next_revision:=expected+1;update public.project_closeout set client_receipt_at=now(),client_receipt_by=actor,revision=next_revision,updated_at=now(),updated_by=actor where request_id=p_request_id;
  return jsonb_build_object('result','saved','revision',next_revision);
 end if;

 raise exception 'Invalid client delivery action' using errcode='22023';
end;$$;
revoke all on function public.manage_client_delivery(uuid,jsonb) from public,anon;
grant execute on function public.manage_client_delivery(uuid,jsonb) to authenticated;

commit;
