-- R3a: additive hierarchy records. Apply after 202610160031_project_workplan_drafts.sql.
-- The existing project JSON body and lifecycle remain authoritative for the
-- parent task/milestone definitions. No existing IDs or client APIs change.
begin;

create table public.project_hierarchy_revisions (
  request_id uuid primary key references public.inquiry_projects(request_id) on delete cascade,
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.project_milestone_phases (
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  milestone_id text not null check (length(btrim(milestone_id)) between 1 and 100),
  phase text not null check (phase in (
    'inquiry','proposal-onboarding','discovery','direction','production',
    'review','qa','delivery','handoff'
  )),
  created_at timestamptz not null default now(),
  primary key (request_id, milestone_id, phase)
);
create index project_milestone_phases_phase on public.project_milestone_phases(request_id, phase);

create table public.project_subtasks (
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  id uuid not null,
  task_id text not null check (length(btrim(task_id)) between 1 and 100),
  title text not null check (length(btrim(title)) between 1 and 300),
  status text not null default 'todo' check (status in ('todo','doing','blocked','done')),
  due_on date,
  position integer not null check (position between 0 and 49),
  revision integer not null default 1 check (revision > 0),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (request_id, id),
  unique (request_id, task_id, position)
);
create index project_subtasks_task on public.project_subtasks(request_id, task_id, position);

create table public.project_hierarchy_history (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  action text not null check (action in (
    'set_milestone_phases','add_subtask','update_subtask','remove_subtask','prune_deleted_parents'
  )),
  hierarchy_revision integer not null check (hierarchy_revision > 0),
  details jsonb not null default '{}'::jsonb,
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index project_hierarchy_history_recent on public.project_hierarchy_history(request_id,id desc);

alter table public.project_hierarchy_revisions enable row level security;
alter table public.project_milestone_phases enable row level security;
alter table public.project_subtasks enable row level security;
alter table public.project_hierarchy_history enable row level security;

revoke all on public.project_hierarchy_revisions,public.project_milestone_phases,
  public.project_subtasks,public.project_hierarchy_history from public,anon,authenticated,service_role;
grant select on public.project_hierarchy_revisions,public.project_milestone_phases,
  public.project_subtasks,public.project_hierarchy_history to authenticated;

create policy hierarchy_revision_staff_read on public.project_hierarchy_revisions
  for select to authenticated using ((select public.is_inquiry_staff()));
create policy milestone_phase_staff_read on public.project_milestone_phases
  for select to authenticated using ((select public.is_inquiry_staff()));
create policy subtask_staff_read on public.project_subtasks
  for select to authenticated using ((select public.is_inquiry_staff()));
create policy hierarchy_history_staff_read on public.project_hierarchy_history
  for select to authenticated using ((select public.is_inquiry_staff()));

-- One serializable-by-project command at a time, checked against the current
-- project body revision AND this hierarchy's independent revision.
create function public.manage_project_hierarchy(p_request_id uuid, p_command jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  actor uuid := auth.uid();
  project public.inquiry_projects%rowtype;
  hierarchy public.project_hierarchy_revisions%rowtype;
  subtask public.project_subtasks%rowtype;
  action_name text;
  parent_id text;
  item_id uuid;
  phase_name text;
  new_title text;
  new_status text;
  new_date date;
  new_position integer;
  subtask_revision integer;
  phase_count integer;
  next_revision integer;
begin
  if actor is null or not public.is_inquiry_staff() then
    raise exception 'Staff authorization required' using errcode='42501';
  end if;
  if p_command is null or jsonb_typeof(p_command) <> 'object' then
    raise exception 'Invalid hierarchy command' using errcode='22023';
  end if;
  action_name := p_command->>'action';
  if action_name is null or action_name not in (
    'set_milestone_phases','add_subtask','update_subtask','remove_subtask'
  ) or not (p_command ? 'expectedProjectRevision')
     or not (p_command ? 'expectedHierarchyRevision')
     or jsonb_typeof(p_command->'expectedProjectRevision') <> 'number'
     or jsonb_typeof(p_command->'expectedHierarchyRevision') <> 'number'
     or (p_command->>'expectedProjectRevision') !~ '^[1-9][0-9]{0,8}$'
     or (p_command->>'expectedHierarchyRevision') !~ '^[1-9][0-9]{0,8}$' then
    raise exception 'Invalid hierarchy revision' using errcode='22023';
  end if;

  select * into project from public.inquiry_projects
    where request_id=p_request_id for update;
  if not found then return jsonb_build_object('result','not_found'); end if;
  if project.state = 'completed' then return jsonb_build_object('result','locked'); end if;
  if project.revision <> (p_command->>'expectedProjectRevision')::integer then
    return jsonb_build_object('result','conflict');
  end if;

  insert into public.project_hierarchy_revisions(request_id,updated_by)
    values(p_request_id,actor) on conflict (request_id) do nothing;
  select * into hierarchy from public.project_hierarchy_revisions
    where request_id=p_request_id for update;
  if hierarchy.revision <> (p_command->>'expectedHierarchyRevision')::integer then
    return jsonb_build_object('result','conflict');
  end if;

  if action_name = 'set_milestone_phases' then
    parent_id := p_command->>'milestoneId';
    if jsonb_typeof(p_command->'milestoneId') <> 'string'
      or length(btrim(parent_id)) not between 1 and 100
      or not (p_command ? 'phases')
      or jsonb_typeof(p_command->'phases') <> 'array'
      or jsonb_array_length(p_command->'phases') > 9
      or not exists(select 1 from jsonb_array_elements(project.body->'milestones') item
        where item->>'id'=parent_id) then
      raise exception 'Invalid milestone phases' using errcode='22023';
    end if;
    phase_count := 0;
    for phase_name in select value from jsonb_array_elements_text(p_command->'phases') loop
      if public.project_phase_rank(phase_name) = 999 then
        raise exception 'Unknown phase' using errcode='22023';
      end if;
      phase_count := phase_count + 1;
    end loop;
    if phase_count <> (select count(distinct value) from jsonb_array_elements_text(p_command->'phases')) then
      raise exception 'Duplicate phases' using errcode='22023';
    end if;
    delete from public.project_milestone_phases
      where request_id=p_request_id and milestone_id=parent_id;
    insert into public.project_milestone_phases(request_id,milestone_id,phase)
      select p_request_id,parent_id,value from jsonb_array_elements_text(p_command->'phases');

  else
    parent_id := p_command->>'taskId';
    if jsonb_typeof(p_command->'taskId') <> 'string'
      or length(btrim(parent_id)) not between 1 and 100
      or not exists(select 1 from jsonb_array_elements(project.body->'tasks') item
        where item->>'id'=parent_id)
      or jsonb_typeof(p_command->'subtaskId') <> 'string'
      or (p_command->>'subtaskId') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'Invalid task or subtask ID' using errcode='22023';
    end if;
    item_id := (p_command->>'subtaskId')::uuid;
    if action_name <> 'remove_subtask' then
      new_title := btrim(p_command->>'title');
      new_status := p_command->>'status';
      if not (p_command ? 'title') or not (p_command ? 'status')
        or jsonb_typeof(p_command->'title') <> 'string'
        or length(new_title) not between 1 and 300
        or jsonb_typeof(p_command->'status') <> 'string'
        or new_status not in ('todo','doing','blocked','done')
        or not (p_command ? 'dueOn')
        or jsonb_typeof(p_command->'dueOn') not in ('null','string') then
        raise exception 'Invalid subtask details' using errcode='22023';
      end if;
      if jsonb_typeof(p_command->'dueOn') = 'string' then
        if (p_command->>'dueOn') !~ '^\d{4}-\d{2}-\d{2}$' then
          raise exception 'Invalid subtask date' using errcode='22023';
        end if;
        new_date := (p_command->>'dueOn')::date;
      else
        new_date := null;
      end if;
    end if;
    if action_name = 'add_subtask' then
      if exists(select 1 from public.project_subtasks
        where request_id=p_request_id and id=item_id) then
        return jsonb_build_object('result','conflict');
      end if;
      select candidate.n into new_position from generate_series(0,49) candidate(n)
        where not exists(select 1 from public.project_subtasks existing
          where existing.request_id=p_request_id and existing.task_id=parent_id
          and existing.position=candidate.n)
        order by candidate.n limit 1;
      if new_position is null then
        raise exception 'A task can have at most 50 subtasks' using errcode='22023';
      end if;
      insert into public.project_subtasks(request_id,id,task_id,title,status,due_on,position,created_by,updated_by)
        values(p_request_id,item_id,parent_id,new_title,new_status,new_date,new_position,actor,actor);
      subtask_revision := 1;
    else
      if not (p_command ? 'expectedSubtaskRevision')
        or jsonb_typeof(p_command->'expectedSubtaskRevision') <> 'number'
        or (p_command->>'expectedSubtaskRevision') !~ '^[1-9][0-9]{0,8}$' then
        raise exception 'Invalid subtask revision' using errcode='22023';
      end if;
      select * into subtask from public.project_subtasks
        where request_id=p_request_id and id=item_id and task_id=parent_id for update;
      if not found then return jsonb_build_object('result','not_found'); end if;
      if subtask.revision <> (p_command->>'expectedSubtaskRevision')::integer then
        return jsonb_build_object('result','conflict');
      end if;
      if action_name = 'update_subtask' then
        update public.project_subtasks set
          title=new_title,status=new_status,due_on=new_date,
          revision=revision+1,updated_at=now(),updated_by=actor
          where request_id=p_request_id and id=item_id
          returning revision into subtask_revision;
      else
        delete from public.project_subtasks where request_id=p_request_id and id=item_id;
        subtask_revision := null;
      end if;
    end if;
  end if;

  next_revision := hierarchy.revision+1;
  update public.project_hierarchy_revisions set revision=next_revision,updated_at=now(),updated_by=actor
    where request_id=p_request_id;
  insert into public.project_hierarchy_history(request_id,action,hierarchy_revision,details,actor)
    values(p_request_id,action_name,next_revision,
      case when action_name='set_milestone_phases'
        then jsonb_build_object('milestoneId',parent_id,'phases',p_command->'phases')
        else jsonb_build_object('taskId',parent_id,'subtaskId',item_id,
          'subtaskRevision',subtask_revision,'status',new_status) end,actor);
  return jsonb_build_object('result','saved','hierarchyRevision',next_revision,
    'subtaskRevision',subtask_revision);
end;
$$;
revoke all on function public.manage_project_hierarchy(uuid,jsonb) from public,anon,service_role;
grant execute on function public.manage_project_hierarchy(uuid,jsonb) to authenticated;

-- When the legacy project editor deletes a task/milestone, remove dependent
-- hierarchy rows within the SAME project-save transaction, not in a later job.
create function public.prune_project_hierarchy() returns trigger
language plpgsql security definer set search_path='' as $$
declare removed_links integer := 0; removed_subtasks integer := 0; new_revision integer;
begin
  delete from public.project_milestone_phases item where item.request_id=new.request_id
    and not exists(select 1 from jsonb_array_elements(new.body->'milestones') parent
      where parent->>'id'=item.milestone_id);
  get diagnostics removed_links = row_count;
  delete from public.project_subtasks item where item.request_id=new.request_id
    and not exists(select 1 from jsonb_array_elements(new.body->'tasks') parent
      where parent->>'id'=item.task_id);
  get diagnostics removed_subtasks = row_count;
  if removed_links > 0 or removed_subtasks > 0 then
    insert into public.project_hierarchy_revisions(request_id,revision,updated_by)
      values(new.request_id,2,auth.uid())
      on conflict (request_id) do update set revision=public.project_hierarchy_revisions.revision+1,
        updated_at=now(),updated_by=auth.uid()
      returning revision into new_revision;
    insert into public.project_hierarchy_history(request_id,action,hierarchy_revision,details,actor)
      values(new.request_id,'prune_deleted_parents',new_revision,
        jsonb_build_object('removedMilestoneLinks',removed_links,'removedSubtasks',removed_subtasks),auth.uid());
  end if;
  return new;
end;
$$;
revoke all on function public.prune_project_hierarchy() from public,anon,authenticated,service_role;
create trigger prune_project_hierarchy_after_project_save after update of body
  on public.inquiry_projects for each row execute function public.prune_project_hierarchy();

commit;
