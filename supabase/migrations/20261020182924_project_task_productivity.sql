-- R5e/R5f task collaboration and productivity. Apply after 20261020182923.
-- No task or project records are backfilled; priorities remain unset until staff choose one.
begin;

alter table public.project_task_controls
  add column priority text check(priority is null or priority in ('low','medium','high','urgent'));

create table public.project_task_notes (
  id uuid primary key,
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  task_id text not null check(length(btrim(task_id)) between 1 and 100),
  body text not null check(removed or length(btrim(body)) between 1 and 4000),
  author_id uuid references auth.users(id) on delete set null,
  revision integer not null default 1 check(revision > 0),
  removed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key(request_id,task_id) references public.project_task_controls(request_id,task_id) on delete cascade
);
create index project_task_notes_recent on public.project_task_notes(request_id,task_id,created_at desc,id);

create table public.project_task_note_history (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  task_id text not null,
  note_id uuid not null references public.project_task_notes(id) on delete cascade,
  action text not null check(action in ('create','edit','remove')),
  revision integer not null,
  snapshot jsonb not null,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index project_task_note_history_recent on public.project_task_note_history(request_id,id desc);

create table public.project_task_file_links (
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  task_id text not null,
  file_id uuid not null references public.project_files(id) on delete cascade,
  linked_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key(request_id,task_id,file_id),
  foreign key(request_id,task_id) references public.project_task_controls(request_id,task_id) on delete cascade
);
create index project_task_file_links_file on public.project_task_file_links(file_id);
create table public.project_task_file_history (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  task_id text not null,
  file_id uuid not null,
  action text not null check(action in ('link','unlink')),
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index project_task_file_history_recent on public.project_task_file_history(request_id,id desc);

alter table public.project_task_notes enable row level security;
alter table public.project_task_note_history enable row level security;
alter table public.project_task_file_links enable row level security;
alter table public.project_task_file_history enable row level security;
revoke all on public.project_task_notes,public.project_task_note_history,
  public.project_task_file_links,public.project_task_file_history from public,anon,authenticated,service_role;
grant select on public.project_task_notes,public.project_task_note_history,
  public.project_task_file_links,public.project_task_file_history to authenticated;
create policy task_notes_staff_read on public.project_task_notes
  for select to authenticated using((select public.is_inquiry_staff()));
create policy task_note_history_staff_read on public.project_task_note_history
  for select to authenticated using((select public.is_inquiry_staff()));
create policy task_file_links_staff_read on public.project_task_file_links
  for select to authenticated using((select public.is_inquiry_staff()));
create policy task_file_history_staff_read on public.project_task_file_history
  for select to authenticated using((select public.is_inquiry_staff()));

create function public.manage_project_task_productivity(p_request uuid,p_command jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 actor uuid:=auth.uid(); action_name text:=p_command->>'action'; project public.inquiry_projects%rowtype;
 control public.project_task_controls%rowtype; note public.project_task_notes%rowtype;
 v_task_id text:=p_command->>'taskId'; note_id uuid; file_id uuid; next_priority text;
 task jsonb; original_body jsonb; next_body jsonb; next_tasks jsonb; item jsonb; next_item jsonb;
 expected integer; new_status text; changed integer:=0; before_value jsonb;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if jsonb_typeof(p_command) is distinct from 'object' or action_name is null or action_name not in ('priority','note_create','note_edit','note_remove','file_link','file_unlink','bulk_status') then raise exception 'Invalid task action' using errcode='22023';end if;
 if jsonb_typeof(p_command->'expectedProjectRevision') is distinct from 'number' or p_command->>'expectedProjectRevision' !~ '^[1-9][0-9]{0,8}$' then raise exception 'Invalid project revision' using errcode='22023';end if;
 expected:=(p_command->>'expectedProjectRevision')::integer;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if project.state='completed' then return jsonb_build_object('result','locked');end if;
 if project.revision<>expected then return jsonb_build_object('result','conflict');end if;

 if action_name='bulk_status' then
  new_status:=p_command->>'status';
  if new_status not in ('todo','done') or jsonb_typeof(p_command->'taskIds') is distinct from 'array' or jsonb_array_length(p_command->'taskIds') not between 1 and 100 then raise exception 'Invalid bulk status request' using errcode='22023';end if;
  if (select count(distinct value) from jsonb_array_elements_text(p_command->'taskIds'))<>jsonb_array_length(p_command->'taskIds') then raise exception 'Duplicate task' using errcode='22023';end if;
  if exists(select 1 from jsonb_array_elements_text(p_command->'taskIds') x where not exists(select 1 from jsonb_array_elements(project.body->'tasks') t where t->>'id'=x.value)) then return jsonb_build_object('result','not_found');end if;
  if new_status='done' and exists(
   select 1 from jsonb_array_elements_text(p_command->'taskIds') x
   join public.project_task_controls c on c.request_id=p_request and c.task_id=x.value
   join jsonb_array_elements(project.body->'tasks') selected_task on selected_task.value->>'id'=x.value
   where selected_task.value->>'status'='blocked' or c.blocker_owner is not null or c.depends_on is not null and not exists(
    select 1 from jsonb_array_elements(project.body->'tasks') dep
    where dep->>'id'=c.depends_on and (dep->>'status'='done' or dep->>'id' in (select jsonb_array_elements_text(p_command->'taskIds')))
   )
  ) then return jsonb_build_object('result','blocked');end if;
  if new_status='todo' and exists(
   select 1 from public.project_task_controls c
   where c.request_id=p_request and c.depends_on in (select jsonb_array_elements_text(p_command->'taskIds'))
    and exists(select 1 from jsonb_array_elements(project.body->'tasks') child where child->>'id'=c.task_id and child->>'status' in ('doing','done','blocked'))
  ) then return jsonb_build_object('result','blocked');end if;
  original_body:=project.body;
  select jsonb_agg(case when value->>'id' in (select jsonb_array_elements_text(p_command->'taskIds')) then jsonb_set(value,'{status}',to_jsonb(new_status),false) else value end order by ord)
    into next_tasks from jsonb_array_elements(project.body->'tasks') with ordinality e(value,ord);
  next_body:=jsonb_set(project.body,'{tasks}',coalesce(next_tasks,'[]'::jsonb),false);
  update public.inquiry_projects set body=next_body,revision=revision+1,updated_at=now(),updated_by=actor where request_id=p_request returning * into project;
  for item in select value from jsonb_array_elements(original_body->'tasks') where value->>'id' in (select jsonb_array_elements_text(p_command->'taskIds')) loop
   select value into next_item from jsonb_array_elements(next_body->'tasks') where value->>'id'=item->>'id';
   if item->>'status' is distinct from next_item->>'status' then
    insert into public.project_task_history(request_id,task_id,action,snapshot,actor)
    values(p_request,item->>'id','metadata',jsonb_build_object('change','bulk_status','before',item,'after',next_item,'revision',project.revision),actor);
    changed:=changed+1;
   end if;
  end loop;
  insert into public.inquiry_project_history(request_id,action,reason,snapshot,actor)
   values(p_request,'save','Bulk task status update',jsonb_build_object('revision',project.revision,'state',project.state,'body',next_body),actor);
  return jsonb_build_object('result','saved','revision',project.revision,'changed',changed);
 end if;

 if jsonb_typeof(p_command->'taskId') is distinct from 'string' or length(btrim(v_task_id)) not between 1 and 100 then raise exception 'Invalid task' using errcode='22023';end if;
 select value into task from jsonb_array_elements(project.body->'tasks') where value->>'id'=v_task_id;
 if task is null then return jsonb_build_object('result','not_found');end if;
 select * into control from public.project_task_controls where request_id=p_request and project_task_controls.task_id=v_task_id for update;
 if not found then return jsonb_build_object('result','not_found');end if;

 if action_name='priority' then
  next_priority:=case when jsonb_typeof(p_command->'priority')='null' then null else p_command->>'priority' end;
  if not (p_command ? 'priority') or jsonb_typeof(p_command->'priority') is distinct from 'null' and next_priority not in ('low','medium','high','urgent') then raise exception 'Invalid priority' using errcode='22023';end if;
  if control.priority is distinct from next_priority then
   before_value:=to_jsonb(control.priority);
   update public.project_task_controls set priority=next_priority,revision=revision+1,updated_at=now(),updated_by=actor where request_id=p_request and project_task_controls.task_id=v_task_id returning * into control;
   insert into public.project_task_history(request_id,task_id,action,snapshot,actor) values(p_request,v_task_id,'metadata',jsonb_build_object('change','priority','before',before_value,'after',to_jsonb(next_priority),'task',task),actor);
  end if;
  return jsonb_build_object('result','saved','revision',control.revision);
 elsif action_name in ('note_create','note_edit','note_remove') then
  if jsonb_typeof(p_command->'noteId') is distinct from 'string' or p_command->>'noteId' !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then raise exception 'Invalid note ID' using errcode='22023';end if;
  note_id:=(p_command->>'noteId')::uuid;
  select * into note from public.project_task_notes where id=note_id and request_id=p_request and project_task_notes.task_id=v_task_id for update;
  if action_name='note_create' then
   if jsonb_typeof(p_command->'body') is distinct from 'string' or length(btrim(p_command->>'body')) not between 1 and 4000 then raise exception 'Note required' using errcode='22023';end if;
   if note.id is not null then return jsonb_build_object('result','conflict');end if;
   insert into public.project_task_notes(id,request_id,task_id,body,author_id) values(note_id,p_request,v_task_id,btrim(p_command->>'body'),actor) returning * into note;
  else
   if note.id is null then return jsonb_build_object('result','not_found');end if;
   if note.author_id is distinct from actor then raise exception 'Note author authorization required' using errcode='42501';end if;
   if jsonb_typeof(p_command->'expectedNoteRevision') is distinct from 'number' or p_command->>'expectedNoteRevision' !~ '^[1-9][0-9]{0,8}$' or note.revision<>(p_command->>'expectedNoteRevision')::integer or note.removed then return jsonb_build_object('result','conflict');end if;
   if action_name='note_edit' then
    if jsonb_typeof(p_command->'body') is distinct from 'string' or length(btrim(p_command->>'body')) not between 1 and 4000 then raise exception 'Note required' using errcode='22023';end if;
    update public.project_task_notes set body=btrim(p_command->>'body'),revision=revision+1,updated_at=now() where id=note_id returning * into note;
   else update public.project_task_notes set body='',removed=true,revision=revision+1,updated_at=now() where id=note_id returning * into note;end if;
  end if;
  insert into public.project_task_note_history(request_id,task_id,note_id,action,revision,snapshot,actor_id)
   values(p_request,v_task_id,note_id,case when action_name='note_create' then 'create' else case when action_name='note_edit' then 'edit' else 'remove' end end,note.revision,jsonb_build_object('body',note.body,'removed',note.removed),actor);
  return jsonb_build_object('result','saved','noteId',note.id,'revision',note.revision);
 elsif action_name in ('file_link','file_unlink') then
  if jsonb_typeof(p_command->'fileId') is distinct from 'string' or p_command->>'fileId' !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then raise exception 'Invalid file ID' using errcode='22023';end if;
  file_id:=(p_command->>'fileId')::uuid;
  if action_name='file_link' then
   if not exists(select 1 from public.project_files f where f.id=file_id and f.request_id=p_request and f.state='ready') then return jsonb_build_object('result','file_unavailable');end if;
   insert into public.project_task_file_links(request_id,task_id,file_id,linked_by) values(p_request,v_task_id,file_id,actor) on conflict do nothing;
   if found then insert into public.project_task_file_history(request_id,task_id,file_id,action,actor_id) values(p_request,v_task_id,file_id,'link',actor);end if;
  else
   delete from public.project_task_file_links where request_id=p_request and project_task_file_links.task_id=v_task_id and project_task_file_links.file_id=file_id;
   if found then insert into public.project_task_file_history(request_id,task_id,file_id,action,actor_id) values(p_request,v_task_id,file_id,'unlink',actor);end if;
  end if;
  return jsonb_build_object('result','saved');
 end if;
 return jsonb_build_object('result','invalid');
end;$$;
revoke all on function public.manage_project_task_productivity(uuid,jsonb) from public,anon,service_role;
grant execute on function public.manage_project_task_productivity(uuid,jsonb) to authenticated;

create or replace function public.staff_project_activity_actors(p_request uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode = '42501';end if;
  if not exists(select 1 from public.inquiry_projects where request_id = p_request) then raise exception 'Project not found' using errcode = '22023';end if;
  with history_actors as (
    select actor as uid from public.inquiry_project_history where request_id=p_request
    union select actor from public.project_phase_status_history where request_id=p_request
    union select actor from public.project_hierarchy_history where request_id=p_request
    union select actor from public.project_assignment_events where request_id=p_request
    union select actor from public.project_task_history where request_id=p_request
    union select actor_id from public.project_file_history where request_id=p_request
    union select actor_id from public.project_comment_history where request_id=p_request
    union select actor_id from public.project_task_note_history where request_id=p_request
    union select actor_id from public.project_task_file_history where request_id=p_request
    union select actor_id from public.project_access_history where request_id=p_request
    union select submitted_by from public.project_client_task_responses where request_id=p_request
    union select reviewed_by from public.project_client_task_responses where request_id=p_request
    union select published_by from public.project_brief_versions where request_id=p_request
    union select decided_by from public.project_brief_versions where request_id=p_request
    union select actor from public.project_task_client_policy_history where request_id=p_request
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',a.uid,'label',coalesce(nullif(btrim(u.raw_user_meta_data->>'full_name'),''),nullif(btrim(concat_ws(' ',cp.first_name,cp.last_name)),''),nullif(u.email,''),'Former account'),
    'kind',case when s.user_id is not null then 'staff' when cp.user_id is not null then 'client' else null end,
    'avatarPath',case when s.user_id is not null then s.avatar_path when cp.user_id is not null then cp.avatar_path else null end
  ) order by a.uid::text),'[]'::jsonb) into result
  from history_actors a left join auth.users u on u.id=a.uid left join public.inquiry_staff s on s.user_id=a.uid left join public.client_profiles cp on cp.user_id=a.uid where a.uid is not null;
  return result;
end;$$;
revoke all on function public.staff_project_activity_actors(uuid) from public,anon,service_role;
grant execute on function public.staff_project_activity_actors(uuid) to authenticated;

create or replace view public.staff_my_tasks with(security_invoker=true) as
select p.request_id,p.public_id as project_public_id,coalesce(p.body->>'title','Project') as project_title,lower(coalesce(p.body->>'title','')) as project_sort,p.state as project_state,p.revision as project_revision,
 c.task_id,c.revision as control_revision,c.phase,c.service_id,c.blocker_owner,c.depends_on,
 t.value->>'title' as title,lower(t.value->>'title') as title_sort,t.value->>'status' as task_status,t.value->>'owner' as owner_label,(t.value->>'dueOn')::date as due_on,
 (t.value->>'status'<>'done' and (t.value->>'status'='blocked' or c.blocker_owner is not null or (c.depends_on is not null and not exists(select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done')))) as is_blocked,
 greatest(p.updated_at,c.updated_at) as updated_at,
 greatest((select count(*)::integer from public.project_task_members tm where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.side='bivi'),case when c.assigned_staff_id is not null then 1 else 0 end) as assignee_count,
 c.priority as priority
from public.project_task_controls c join public.inquiry_projects p on p.request_id=c.request_id
cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
where (select public.is_inquiry_staff()) and c.owner_type='bivi' and t.value->>'id'=c.task_id
 and (exists(select 1 from public.project_task_members tm join public.inquiry_staff s on s.user_id=tm.user_id and s.active where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.user_id=auth.uid() and tm.side='bivi')
  or (not exists(select 1 from public.project_task_members tm where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.side='bivi') and c.assigned_staff_id=auth.uid()));
revoke all on public.staff_my_tasks from public,anon,service_role;
grant select on public.staff_my_tasks to authenticated;
commit;
