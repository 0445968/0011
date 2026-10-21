-- R7A continuation: structured milestone closure guards and fenced work-plan drafts.
-- Apply after 20261022120000_r7a_phase_completion_integrity.sql.
-- This migration is additive: it adds private draft metadata/version rows and replaces
-- existing trigger/RPC bodies without deleting project, task, milestone, audit, or draft data.
begin;

-- A saved draft keeps the exact saved baseline it was based on. Existing rows stay
-- recoverable; only an exact matching project-history revision is safe to backfill.
alter table public.project_workplan_drafts
  add column base_body jsonb
    check (base_body is null or (jsonb_typeof(base_body) = 'object' and octet_length(base_body::text) <= 393216));
update public.project_workplan_drafts d set base_body = (
  select h.snapshot->'body' from public.inquiry_project_history h
  where h.request_id = d.request_id and h.snapshot->>'revision' = d.base_revision::text
  order by h.id desc limit 1
)
where d.base_body is null and exists (
  select 1 from public.inquiry_project_history h
  where h.request_id = d.request_id and h.snapshot->>'revision' = d.base_revision::text
);

-- A tombstone generation remains after discard so an older delayed POST cannot recreate
-- a deleted private draft. Only the scoped SECURITY DEFINER RPCs may write generations.
create table public.project_workplan_draft_versions (
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  staff_id uuid not null references auth.users(id) on delete cascade,
  generation bigint not null default 0 check (generation >= 0),
  updated_at timestamptz not null default now(),
  primary key (request_id, staff_id)
);
alter table public.project_workplan_draft_versions enable row level security;
revoke all on public.project_workplan_draft_versions from public, anon, authenticated, service_role;
grant select on public.project_workplan_draft_versions to authenticated;
create policy workplan_draft_version_staff_read on public.project_workplan_draft_versions
  for select to authenticated using (staff_id = (select auth.uid()) and (select public.is_inquiry_staff()));

-- Draft writes must carry a generation token and run under a row lock. Keep authenticated
-- staff read access to their draft, while removing direct write paths that could bypass
-- the generation fence.
revoke insert, update, delete on public.project_workplan_drafts from authenticated;
drop policy if exists workplan_draft_staff_self_insert on public.project_workplan_drafts;
drop policy if exists workplan_draft_staff_self_update on public.project_workplan_drafts;
drop policy if exists workplan_draft_staff_self_delete on public.project_workplan_drafts;

create function public.staff_project_workplan_draft_context(p_request uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  project public.inquiry_projects%rowtype;
  draft public.project_workplan_drafts%rowtype;
  generation_value bigint := 0;
  baseline_body jsonb;
  draft_value jsonb;
begin
  if actor is null or not public.is_inquiry_staff() then
    raise exception 'Staff authorization required' using errcode = '42501';
  end if;
  select * into project from public.inquiry_projects where request_id = p_request;
  if not found then return jsonb_build_object('result', 'not_found'); end if;
  select * into draft from public.project_workplan_drafts
    where request_id = p_request and staff_id = actor;
  select coalesce((select v.generation from public.project_workplan_draft_versions v
    where v.request_id = p_request and v.staff_id = actor), 0) into generation_value;

  if draft.request_id is not null then
    baseline_body := draft.base_body;
    if baseline_body is null then
      -- Only an exact revision snapshot is a safe baseline. Some older commands advanced
      -- the project revision without writing project history; never guess from an older row.
      select h.snapshot->'body' into baseline_body
      from public.inquiry_project_history h
      where h.request_id = p_request
        and h.snapshot->>'revision' = draft.base_revision::text
      order by h.id desc
      limit 1;
    end if;
    draft_value := jsonb_build_object(
      'body', draft.body,
      'baseBody', baseline_body,
      'baseRevision', draft.base_revision,
      'updatedAt', draft.updated_at
    );
  end if;
  return jsonb_build_object(
    'result', 'loaded',
    'draft', draft_value,
    'currentRevision', project.revision,
    'state', project.state,
    'generation', generation_value
  );
end;
$$;
revoke all on function public.staff_project_workplan_draft_context(uuid) from public, anon, service_role;
grant execute on function public.staff_project_workplan_draft_context(uuid) to authenticated;

-- Drafts may temporarily have a blank project title, but all other shape,
-- bounds, milestone references, and status rules still apply at the RPC boundary.
create function public.valid_project_workplan_draft_body(b jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare
  k text;
  item jsonb;
  collection text;
  max_len integer;
  d date;
begin
  if b is null or jsonb_typeof(b) <> 'object' or octet_length(b::text) > 393216
    or (select count(*) from jsonb_object_keys(b)) <> 5 then return false; end if;
  foreach k in array array['title','owner','notes'] loop
    max_len := case k when 'notes' then 4000 else 200 end;
    if jsonb_typeof(b->k) is distinct from 'string' or length(b->>k) > max_len then return false; end if;
  end loop;
  foreach collection in array array['milestones','tasks'] loop
    if jsonb_typeof(b->collection) is distinct from 'array'
      or jsonb_array_length(b->collection) > (case collection when 'milestones' then 20 else 100 end) then return false; end if;
    for item in select value from jsonb_array_elements(b->collection) loop
      if jsonb_typeof(item) <> 'object'
        or (select count(*) from jsonb_object_keys(item)) <> (case collection when 'milestones' then 4 else 7 end) then return false; end if;
      foreach k in array array['id','title','status'] loop
        max_len := case k when 'id' then 100 when 'title' then 300 else 11 end;
        if jsonb_typeof(item->k) is distinct from 'string' or length(item->>k) > max_len
          or (k in ('id','status') and length(btrim(item->>k)) = 0) then return false; end if;
      end loop;
      if jsonb_typeof(item->'dueOn') is distinct from 'null' then
        if jsonb_typeof(item->'dueOn') is distinct from 'string' or item->>'dueOn' !~ '^\d{4}-\d{2}-\d{2}$' then return false; end if;
        d := (item->>'dueOn')::date;
      end if;
      if collection = 'milestones' then
        if item->>'status' not in ('planned','in_progress','done') then return false; end if;
      else
        if item->>'status' not in ('todo','doing','blocked','done')
          or jsonb_typeof(item->'owner') is distinct from 'string' or length(item->>'owner') > 200
          or jsonb_typeof(item->'notes') is distinct from 'string' or length(item->>'notes') > 2000 then return false; end if;
        if jsonb_typeof(item->'milestoneId') is distinct from 'null'
          and (jsonb_typeof(item->'milestoneId') is distinct from 'string'
            or not exists(select 1 from jsonb_array_elements(b->'milestones') m where m->>'id' = item->>'milestoneId')) then return false; end if;
      end if;
    end loop;
    if (select count(distinct value->>'id') from jsonb_array_elements(b->collection)) <> jsonb_array_length(b->collection) then return false; end if;
  end loop;
  return true;
exception when others then return false;
end;
$$;
revoke all on function public.valid_project_workplan_draft_body(jsonb) from public, anon, authenticated;

create function public.save_project_workplan_draft(
  p_request uuid,
  p_base_revision integer,
  p_body jsonb,
  p_base_body jsonb,
  p_expected_generation bigint
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  project public.inquiry_projects%rowtype;
  generation_value bigint;
  next_generation bigint;
  saved_at timestamptz := now();
begin
  if actor is null or not public.is_inquiry_staff() then
    raise exception 'Staff authorization required' using errcode = '42501';
  end if;
  if p_base_revision is null or p_base_revision < 1 or p_expected_generation is null or p_expected_generation < 0
    or not public.valid_project_workplan_draft_body(p_body)
    or p_base_body is null or not public.valid_project_body(p_base_body) then
    raise exception 'Invalid project draft' using errcode = '22023';
  end if;
  select * into project from public.inquiry_projects where request_id = p_request for update;
  if not found then return jsonb_build_object('result', 'not_found'); end if;
  if project.state = 'completed' then return jsonb_build_object('result', 'locked'); end if;

  insert into public.project_workplan_draft_versions(request_id, staff_id)
    values (p_request, actor) on conflict (request_id, staff_id) do nothing;
  select v.generation into generation_value from public.project_workplan_draft_versions v
    where v.request_id = p_request and v.staff_id = actor for update;
  if generation_value <> p_expected_generation then
    return jsonb_build_object('result', 'generation_conflict', 'generation', generation_value);
  end if;

  insert into public.project_workplan_drafts(request_id, staff_id, base_revision, body, base_body, updated_at)
    values (p_request, actor, p_base_revision, p_body, p_base_body, saved_at)
  on conflict (request_id, staff_id) do update set
    base_revision = excluded.base_revision,
    body = excluded.body,
    base_body = excluded.base_body,
    updated_at = excluded.updated_at;
  next_generation := generation_value + 1;
  update public.project_workplan_draft_versions set generation = next_generation, updated_at = saved_at
    where request_id = p_request and staff_id = actor;
  return jsonb_build_object(
    'result', 'saved',
    'generation', next_generation,
    'savedAt', saved_at,
    'currentRevision', project.revision,
    'conflict', project.revision <> p_base_revision
  );
end;
$$;
revoke all on function public.save_project_workplan_draft(uuid, integer, jsonb, jsonb, bigint) from public, anon, service_role;
grant execute on function public.save_project_workplan_draft(uuid, integer, jsonb, jsonb, bigint) to authenticated;

create function public.discard_project_workplan_draft(p_request uuid, p_expected_generation bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  project public.inquiry_projects%rowtype;
  generation_value bigint;
  next_generation bigint;
begin
  if actor is null or not public.is_inquiry_staff() then
    raise exception 'Staff authorization required' using errcode = '42501';
  end if;
  if p_expected_generation is null or p_expected_generation < 0 then
    raise exception 'Invalid draft generation' using errcode = '22023';
  end if;
  select * into project from public.inquiry_projects where request_id = p_request for update;
  if not found then return jsonb_build_object('result', 'not_found'); end if;

  insert into public.project_workplan_draft_versions(request_id, staff_id)
    values (p_request, actor) on conflict (request_id, staff_id) do nothing;
  select v.generation into generation_value from public.project_workplan_draft_versions v
    where v.request_id = p_request and v.staff_id = actor for update;
  if generation_value <> p_expected_generation then
    return jsonb_build_object('result', 'generation_conflict', 'generation', generation_value);
  end if;

  next_generation := generation_value + 1;
  update public.project_workplan_draft_versions set generation = next_generation, updated_at = now()
    where request_id = p_request and staff_id = actor;
  delete from public.project_workplan_drafts where request_id = p_request and staff_id = actor;
  -- The project row remains locked through the discard and returned snapshot, so the
  -- editor adopts the authoritative body/revision paired with this confirmed deletion.
  return jsonb_build_object(
    'result', 'discarded', 'generation', next_generation,
    'currentRevision', project.revision, 'state', project.state, 'body', project.body
  );
end;
$$;
revoke all on function public.discard_project_workplan_draft(uuid, bigint) from public, anon, service_role;
grant execute on function public.discard_project_workplan_draft(uuid, bigint) to authenticated;

-- Keep milestone completion explicit, but validate the exact submitted candidate against
-- linked tasks, subtasks, dependencies, blockers and client completion approvals.
create or replace function public.project_sync_milestone_statuses() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  b jsonb;
  m jsonb;
  tasks jsonb;
  next_status text;
  index_number integer := 0;
  milestone_id text;
begin
  if old.body is not distinct from new.body then return new; end if;
  b := new.body;
  for m in select value from jsonb_array_elements(b->'milestones') loop
    milestone_id := m->>'id';
    if m->>'status' = 'done' then
      if coalesce((select old_m.value->>'status' from jsonb_array_elements(old.body->'milestones') old_m
        where old_m.value->>'id' = milestone_id), 'planned') <> 'done' then
        if not exists (
          select 1 from jsonb_array_elements(b->'tasks') t where t.value->>'milestoneId' = milestone_id
        ) or exists (
          select 1 from jsonb_array_elements(b->'tasks') t
          where t.value->>'milestoneId' = milestone_id and t.value->>'status' <> 'done'
        ) or exists (
          select 1 from jsonb_array_elements(b->'tasks') t
          join public.project_subtasks s on s.request_id = new.request_id and s.task_id = t.value->>'id'
          where t.value->>'milestoneId' = milestone_id and s.status <> 'done'
        ) then
          raise exception 'Complete all linked milestone tasks and subtasks first' using errcode = '23514';
        end if;
        if exists (
          select 1
          from jsonb_array_elements(b->'tasks') t
          join public.project_task_controls c on c.request_id = new.request_id and c.task_id = t.value->>'id'
          where t.value->>'milestoneId' = milestone_id and (
            c.blocker_owner is not null
            or (c.depends_on is not null and not exists (
              select 1 from jsonb_array_elements(b->'tasks') dependency
              where dependency.value->>'id' = c.depends_on and dependency.value->>'status' = 'done'
            ))
          )
        ) then
          raise exception 'Resolve task dependencies and blockers before completing the milestone' using errcode = '23514';
        end if;
        if exists (
          select 1
          from jsonb_array_elements(b->'tasks') t
          join public.project_task_controls c on c.request_id = new.request_id and c.task_id = t.value->>'id'
          where t.value->>'milestoneId' = milestone_id and c.owner_type = 'client'
            and not exists (
              select 1 from public.project_client_task_responses r
              where r.request_id = new.request_id and r.task_id = t.value->>'id'
                and r.kind = 'completion' and r.status = 'accepted'
            )
        ) then
          raise exception 'Client task completion requires staff approval before completing the milestone' using errcode = '23514';
        end if;
        if exists (
          select 1 from jsonb_array_elements(b->'tasks') t
          where t.value->>'milestoneId' = milestone_id
            and exists(select 1 from jsonb_array_elements(old.body->'tasks') previous where previous.value->>'id' = t.value->>'id')
            and not exists(select 1 from public.project_task_controls c where c.request_id = new.request_id and c.task_id = t.value->>'id')
        ) then
          raise exception 'Task control record is missing for a saved milestone task' using errcode = '23514';
        end if;
      elsif exists (
        select 1
        from jsonb_array_elements(b->'tasks') t
        join jsonb_array_elements(old.body->'tasks') previous on previous.value->>'id' = t.value->>'id'
        where t.value->>'milestoneId' = milestone_id and previous.value->>'status' = 'done'
          and t.value->>'status' <> 'done'
      ) then
        raise exception 'Reopen the completed milestone before reopening tasks' using errcode = '23514';
      end if;
    else
      select coalesce(jsonb_agg(t.value), '[]'::jsonb) into tasks
      from jsonb_array_elements(b->'tasks') t where t.value->>'milestoneId' = milestone_id;
      next_status := case when exists (
        select 1 from jsonb_array_elements(tasks) t where t.value->>'status' in ('doing', 'blocked')
      ) then 'in_progress' else 'planned' end;
      if m->>'status' is distinct from next_status then
        b := jsonb_set(b, array['milestones', index_number::text, 'status'], to_jsonb(next_status), false);
      end if;
    end if;
    index_number := index_number + 1;
  end loop;
  new.body := b;
  return new;
end;
$$;

-- A completed milestone cannot acquire unfinished child work, lose unfinished evidence,
-- or have completed child work reopened behind the project's JSON body. Metadata edits to
-- completed subtasks and removal of completed child records remain available.
create function public.guard_project_subtask_completed_milestone() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  target_request uuid;
  target_task text;
  target_status text;
  milestone_id text;
  milestone_status text;
begin
  target_request := case when tg_op = 'DELETE' then old.request_id else new.request_id end;
  target_task := case when tg_op = 'DELETE' then old.task_id else new.task_id end;
  target_status := case when tg_op = 'DELETE' then null else new.status end;
  select t.value->>'milestoneId' into milestone_id
  from public.inquiry_projects p
  cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
  where p.request_id = target_request and t.value->>'id' = target_task;
  if milestone_id is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  select m.value->>'status' into milestone_status
  from public.inquiry_projects p
  cross join lateral jsonb_array_elements(p.body->'milestones') m(value)
  where p.request_id = target_request and m.value->>'id' = milestone_id;
  if milestone_status = 'done' and (
    tg_op = 'INSERT'
    or (tg_op = 'DELETE' and old.status <> 'done')
    or (tg_op = 'UPDATE' and target_status <> 'done')
  ) then
    raise exception 'Reopen the completed milestone before changing its subtasks' using errcode = '23514';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function public.guard_project_subtask_completed_milestone() from public, anon, authenticated, service_role;
create trigger guard_completed_milestone_subtasks
  before insert or update of task_id, status or delete on public.project_subtasks
  for each row execute function public.guard_project_subtask_completed_milestone();

-- Completion approval is recorded before the project-body update so the trigger above can
-- verify it. Both writes share one transaction: a rejected project update rolls both back.
create or replace function public.staff_review_client_task_response(
  p_response uuid, p_action text, p_note text, p_revision integer
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  r public.project_client_task_responses%rowtype;
  p public.inquiry_projects%rowtype;
  c public.project_task_controls%rowtype;
  task jsonb;
  updated_tasks jsonb;
  result_revision integer;
begin
  if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff required' using errcode = '42501'; end if;
  if p_action is null or p_action not in ('accept', 'reject') or p_note is null or length(p_note) > 2000 or p_revision is null or p_revision < 1 then
    raise exception 'Invalid review action' using errcode = '22023';
  end if;
  select * into r from public.project_client_task_responses where id = p_response;
  if not found then return jsonb_build_object('result', 'not_found'); end if;
  select * into p from public.inquiry_projects where request_id = r.request_id for update;
  if not found then return jsonb_build_object('result', 'not_found'); end if;
  select * into r from public.project_client_task_responses where id = p_response for update;
  if r.status <> 'pending' then return jsonb_build_object('result', 'already_reviewed'); end if;
  if p.revision <> p_revision then return jsonb_build_object('result', 'conflict'); end if;
  if p.state = 'completed' then return jsonb_build_object('result', 'locked'); end if;
  select * into c from public.project_task_controls where request_id = r.request_id and task_id = r.task_id;
  if not found or c.owner_type <> 'client' then return jsonb_build_object('result', 'stale'); end if;
  select value into task from jsonb_array_elements(p.body->'tasks') where value->>'id' = r.task_id;
  if task is null then return jsonb_build_object('result', 'stale'); end if;
  if p_action = 'accept' and r.kind = 'completion' then
    if exists(select 1 from public.project_phase_states phase where phase.request_id = r.request_id and phase.phase = c.phase and phase.status = 'completed') then
      return jsonb_build_object('result', 'phase_closed');
    end if;
    if task->>'status' = 'done' then return jsonb_build_object('result', 'already_done'); end if;
    if c.blocker_owner is not null or task->>'status' = 'blocked' or (c.depends_on is not null and not exists(
      select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id' = c.depends_on and d->>'status' = 'done'
    )) then return jsonb_build_object('result', 'blocked'); end if;
    select jsonb_agg(case when t.value->>'id' = r.task_id then jsonb_set(t.value, '{status}', '"done"'::jsonb) else t.value end order by t.ord)
      into updated_tasks from jsonb_array_elements(p.body->'tasks') with ordinality t(value, ord);
    update public.project_client_task_responses set status = 'accepted', reviewed_by = auth.uid(), reviewed_at = now(), review_note = btrim(p_note)
      where id = r.id;
    update public.inquiry_projects set body = jsonb_set(p.body, '{tasks}', updated_tasks, false), revision = revision + 1,
      updated_at = now(), updated_by = auth.uid() where request_id = r.request_id returning revision into result_revision;
    insert into public.project_task_history(request_id, task_id, action, snapshot, actor)
      values(r.request_id, r.task_id, 'client_update', jsonb_build_object('kind', 'staff_completion_approval', 'responseId', r.id, 'task', task), auth.uid());
  else
    update public.project_client_task_responses set status = case when p_action = 'accept' then 'accepted' else 'rejected' end,
      reviewed_by = auth.uid(), reviewed_at = now(), review_note = btrim(p_note) where id = r.id;
    result_revision := p.revision;
  end if;
  return jsonb_build_object('result', 'saved', 'projectRevision', result_revision);
end;
$$;
revoke all on function public.staff_review_client_task_response(uuid, text, text, integer) from public, anon, service_role;
grant execute on function public.staff_review_client_task_response(uuid, text, text, integer) to authenticated;

commit;
