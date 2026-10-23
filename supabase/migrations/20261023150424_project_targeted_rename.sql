begin;

-- Work completion gates apply when the work hierarchy changes, not when an
-- unrelated project field such as its title changes.
create or replace function public.guard_project_work_integrity() returns trigger
language plpgsql security definer set search_path='' as $$
#variable_conflict use_column
declare t jsonb; m jsonb; c public.project_task_controls%rowtype;
begin
 if old.body->'tasks' is not distinct from new.body->'tasks'
    and old.body->'milestones' is not distinct from new.body->'milestones'
    and not (new.state='completed' and old.state<>'completed') then return new; end if;
 for t in select value from jsonb_array_elements(new.body->'tasks') loop
  select * into c from public.project_task_controls where request_id=new.request_id and task_id=t->>'id';
  if c.task_id is null and exists(select 1 from jsonb_array_elements(old.body->'tasks') previous where previous->>'id'=t->>'id') then
   raise exception 'Task control record is missing; explicitly repair its phase and ownership' using errcode='23514';
  end if;
  if t->>'status'='done' then
   if c.task_id is null then
    raise exception 'Task control record is missing; save new tasks before completing them' using errcode='23514';
   end if;
   if exists(select 1 from public.project_subtasks s where s.request_id=new.request_id and s.task_id=t->>'id' and s.status<>'done') then
    raise exception 'Complete unfinished subtasks before completing the parent task' using errcode='23514';
   end if;
   if c.blocker_owner is not null or (c.depends_on is not null and not exists(
    select 1 from jsonb_array_elements(new.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done'
   )) then raise exception 'Resolve task dependency and blockers before completion' using errcode='23514'; end if;
   if c.owner_type='client' and not public.project_task_completion_approved(new.request_id,c.task_id) then
    raise exception 'Client completion requires Bivi review approval' using errcode='23514';
   end if;
  end if;
  if t->>'status'<>'done' and exists(select 1 from jsonb_array_elements(old.body->'tasks') previous where previous->>'id'=t->>'id' and previous->>'status'='done') then
   insert into public.project_task_history(request_id,task_id,action,snapshot,actor)
   values(new.request_id,t->>'id','metadata',jsonb_build_object('kind','completion_reopened','task',t),auth.uid());
  end if;
  if t->>'status'<>'done' and exists(
   select 1 from public.project_effective_task_phases(new.request_id,t) scope
   join public.project_phase_states s on s.request_id=new.request_id and s.phase=scope and s.status='completed'
  ) then raise exception 'Reopen the completed phase before changing its work' using errcode='23514'; end if;
 end loop;
 for m in select value from jsonb_array_elements(new.body->'milestones') loop
  if m->>'status'='done' and (not exists(select 1 from jsonb_array_elements(new.body->'tasks') t where t->>'milestoneId'=m->>'id')
   or exists(select 1 from jsonb_array_elements(new.body->'tasks') t where t->>'milestoneId'=m->>'id' and t->>'status'<>'done')) then
   raise exception 'Complete all linked milestone tasks before completing the milestone' using errcode='23514';
  end if;
  if m->>'status'<>'done' and exists(select 1 from public.project_milestone_phases l join public.project_phase_states s
   on s.request_id=l.request_id and s.phase=l.phase where l.request_id=new.request_id and l.milestone_id=m->>'id' and s.status='completed') then
   raise exception 'Reopen the completed phase before reopening its milestone' using errcode='23514';
  end if;
 end loop;
 if exists(select 1 from public.project_subtasks s where s.request_id=new.request_id and not exists(
  select 1 from jsonb_array_elements(new.body->'tasks') t where t->>'id'=s.task_id
 )) then raise exception 'Remove or relocate subtasks explicitly before removing their parent task' using errcode='23514'; end if;
 return new;
end;$$;
revoke all on function public.guard_project_work_integrity() from public,anon,authenticated,service_role;

-- A project title edit must not recalculate derived milestone status.
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
  if old.body->'tasks' is not distinct from new.body->'tasks'
     and old.body->'milestones' is not distinct from new.body->'milestones' then return new; end if;
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
          select 1 from jsonb_array_elements(b->'tasks') t
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
          select 1 from jsonb_array_elements(b->'tasks') t
          join public.project_task_controls c on c.request_id = new.request_id and c.task_id = t.value->>'id'
          where t.value->>'milestoneId' = milestone_id and c.owner_type = 'client'
            and not public.project_task_completion_approved(new.request_id,c.task_id)
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
        select 1 from jsonb_array_elements(b->'tasks') t
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
revoke all on function public.project_sync_milestone_statuses() from public,anon,authenticated,service_role;

create function public.rename_inquiry_project(p_request_id uuid,p_title text,p_expected_revision integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 actor uuid:=auth.uid();
 current_row public.inquiry_projects%rowtype;
 clean_title text;
 next_revision integer;
 next_body jsonb;
begin
 if actor is null or not public.is_inquiry_staff() then
  raise exception 'Staff authorization required' using errcode='42501';
 end if;
 if p_request_id is null or p_expected_revision is null or p_expected_revision<1
    or p_title is null or length(btrim(p_title)) not between 1 and 200 then
  raise exception 'A project title from 1 to 200 characters and a current revision are required' using errcode='22023';
 end if;
 clean_title:=btrim(p_title);
 perform 1 from public.project_inquiries where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 select * into current_row from public.inquiry_projects where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 if current_row.revision<>p_expected_revision then
  return jsonb_build_object('result','conflict','revision',current_row.revision,'title',current_row.body->>'title');
 end if;
 if current_row.body->>'title'=clean_title then
  return jsonb_build_object('result','unchanged','revision',current_row.revision,'title',current_row.body->>'title');
 end if;
 next_revision:=current_row.revision+1;
 next_body:=jsonb_set(current_row.body,'{title}',to_jsonb(clean_title),false);
 update public.inquiry_projects set body=next_body,revision=next_revision,updated_at=now(),updated_by=actor
  where request_id=p_request_id;
 insert into public.inquiry_project_history(request_id,action,reason,snapshot,actor)
  values(p_request_id,'save','Project title changed',
   jsonb_build_object('revision',next_revision,'state',current_row.state,'body',next_body,
    'change',jsonb_build_object('kind','project_title_renamed','oldTitle',current_row.body->>'title','newTitle',clean_title)),actor);
 return jsonb_build_object('result','saved','revision',next_revision,'title',clean_title);
end;
$$;
revoke all on function public.rename_inquiry_project(uuid,text,integer) from public,anon,service_role;
grant execute on function public.rename_inquiry_project(uuid,text,integer) to authenticated;

commit;
