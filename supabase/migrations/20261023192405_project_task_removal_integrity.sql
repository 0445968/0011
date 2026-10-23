begin;

-- Task removal is a work-plan save, never a completion transition. Prevent the
-- existing hierarchy cleanup from silently deleting child work and report
-- dependent tasks before the project revision or audit snapshot can change.
create function public.guard_project_task_removal() returns trigger
language plpgsql security definer set search_path='' as $$
declare removed_task text; dependent_task text;
begin
  for removed_task in
    select old_task.value->>'id'
    from jsonb_array_elements(old.body->'tasks') old_task(value)
    where not exists (
      select 1 from jsonb_array_elements(new.body->'tasks') candidate(value)
      where candidate.value->>'id'=old_task.value->>'id'
    )
  loop
    if exists(select 1 from public.project_subtasks s
      where s.request_id=new.request_id and s.task_id=removed_task) then
      raise exception 'task_removal_blocked|subtasks=%',removed_task using errcode='23514';
    end if;
    select c.task_id into dependent_task
    from public.project_task_controls c
    where c.request_id=new.request_id and c.depends_on=removed_task
      and exists(select 1 from jsonb_array_elements(new.body->'tasks') candidate(value)
        where candidate.value->>'id'=c.task_id)
    order by c.task_id limit 1;
    if dependent_task is not null then
      raise exception 'task_removal_blocked|dependency=%',dependent_task using errcode='23514';
    end if;
  end loop;
  return new;
end;
$$;
revoke all on function public.guard_project_task_removal() from public,anon,authenticated,service_role;
create trigger a_project_task_removal_integrity
  before update of body on public.inquiry_projects
  for each row execute function public.guard_project_task_removal();

commit;
