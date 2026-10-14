begin;
-- Repair the existing task-list save: task_id is also a PL/pgSQL variable.
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
    on conflict on constraint project_task_controls_pkey do nothing;
  end if;
 end if;

 insert into public.inquiry_project_history(request_id,action,reason,snapshot,actor) values(p_request_id,action,reason,jsonb_build_object('revision',next_revision,'state',next_state,'body',b),actor);
 return jsonb_build_object('result','saved','revision',next_revision);
end;$$;
revoke all on function public.manage_inquiry_project(uuid,jsonb) from public,anon;
grant execute on function public.manage_inquiry_project(uuid,jsonb) to authenticated;
alter table public.project_task_controls add column assigned_staff_id uuid references public.inquiry_staff(user_id) on delete set null;
create index task_staff_assignment on public.project_task_controls(assigned_staff_id,request_id,task_id) where assigned_staff_id is not null;
create function public.validate_task_staff_assignment() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.owner_type='client' then new.assigned_staff_id:=null;
 elsif new.assigned_staff_id is not null and (tg_op='INSERT' or new.assigned_staff_id is distinct from old.assigned_staff_id) and not exists(select 1 from public.inquiry_staff where user_id=new.assigned_staff_id and active) then raise exception 'Choose an active staff account' using errcode='22023';end if;
 if tg_op='UPDATE' and new.assigned_staff_id is distinct from old.assigned_staff_id and new.revision=old.revision then new.revision:=old.revision+1;new.updated_at:=now();new.updated_by:=null;end if;
 return new;
end;$$;
revoke all on function public.validate_task_staff_assignment() from public,anon,authenticated,service_role;
create trigger task_staff_assignment_valid before insert or update of owner_type,assigned_staff_id on public.project_task_controls for each row execute function public.validate_task_staff_assignment();
create function public.assign_project_task(p_request uuid,p_task text,p_staff uuid,p_revision integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare project public.inquiry_projects;control public.project_task_controls;task jsonb;
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if p_staff is not null then perform 1 from public.inquiry_staff where user_id=p_staff and active for update;if not found then raise exception 'Choose an active staff account' using errcode='22023';end if;end if;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if project.state='completed' then return jsonb_build_object('result','locked');end if;
 select value into task from jsonb_array_elements(project.body->'tasks') where value->>'id'=p_task;
 if task is null then return jsonb_build_object('result','not_found');end if;
 select * into control from public.project_task_controls where request_id=p_request and task_id=p_task for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if control.revision is distinct from p_revision then return jsonb_build_object('result','conflict');end if;
 if control.owner_type<>'bivi' and p_staff is not null then raise exception 'Staff assignments are for Bivi tasks' using errcode='22023';end if;
 update public.project_task_controls set assigned_staff_id=p_staff,revision=revision+1,updated_at=now(),updated_by=auth.uid() where request_id=p_request and task_id=p_task returning * into control;
 insert into public.project_task_history(request_id,task_id,action,snapshot,actor) values(p_request,p_task,'metadata',jsonb_build_object('task',task,'control',to_jsonb(control),'change','staff_assignment'),auth.uid());
 return jsonb_build_object('result','saved');
end;$$;
revoke all on function public.assign_project_task(uuid,text,uuid,integer) from public,anon,service_role;
grant execute on function public.assign_project_task(uuid,text,uuid,integer) to authenticated;
create function public.clear_inactive_staff_tasks() returns trigger language plpgsql security definer set search_path='' as $$
declare control public.project_task_controls;
begin
 if old.active and not new.active then
 for control in update public.project_task_controls set assigned_staff_id=null,revision=revision+1,updated_at=now(),updated_by=auth.uid() where assigned_staff_id=new.user_id returning * loop
 insert into public.project_task_history(request_id,task_id,action,snapshot,actor) values(control.request_id,control.task_id,'metadata',jsonb_build_object('control',to_jsonb(control),'change','staff_deactivated'),auth.uid());
 end loop;
 end if;return new;
end;$$;
revoke all on function public.clear_inactive_staff_tasks() from public,anon,authenticated,service_role;
create trigger inactive_staff_tasks_cleared after update of active on public.inquiry_staff for each row execute function public.clear_inactive_staff_tasks();
create function public.staff_assignment_options(p_search text,p_page integer) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;total integer;term text:=left(coalesce(p_search,''),100);page_number integer:=greatest(1,least(10000,coalesce(p_page,1)));
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 select count(*)::integer into total from public.inquiry_staff s join auth.users u on u.id=s.user_id where s.active and (term='' or position(lower(term) in lower(coalesce(u.email,'')||' '||s.public_id))>0);
 select coalesce(jsonb_agg(row),'[]'::jsonb) into result from(select s.user_id as id,s.public_id,coalesce(nullif(u.email,''),s.public_id) as label from public.inquiry_staff s join auth.users u on u.id=s.user_id where s.active and (term='' or position(lower(term) in lower(coalesce(u.email,'')||' '||s.public_id))>0) order by lower(coalesce(u.email,'')),s.user_id limit 25 offset (page_number-1)*25) row;
 return jsonb_build_object('rows',result,'total',total);
end;$$;
revoke all on function public.staff_assignment_options(text,integer) from public,anon,service_role;
grant execute on function public.staff_assignment_options(text,integer) to authenticated;
create function public.project_task_assignee_labels(p_request uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 return coalesce((select jsonb_agg(row) from(select distinct s.user_id as id,coalesce(nullif(u.email,''),s.public_id) as label from public.project_task_controls c join public.inquiry_staff s on s.user_id=c.assigned_staff_id left join auth.users u on u.id=s.user_id where c.request_id=p_request) row),'[]'::jsonb);
end;$$;
revoke all on function public.project_task_assignee_labels(uuid) from public,anon,service_role;
grant execute on function public.project_task_assignee_labels(uuid) to authenticated;
create view public.staff_my_tasks with(security_invoker=true) as
select p.request_id,p.public_id as project_public_id,coalesce(p.body->>'title','Project') as project_title,lower(coalesce(p.body->>'title','')) as project_sort,p.state as project_state,p.revision as project_revision,
 c.task_id,c.revision as control_revision,c.phase,c.service_id,c.blocker_owner,c.depends_on,
 t.value->>'title' as title,lower(t.value->>'title') as title_sort,t.value->>'status' as task_status,t.value->>'owner' as owner_label,(t.value->>'dueOn')::date as due_on,
 (t.value->>'status'<>'done' and (t.value->>'status'='blocked' or c.blocker_owner is not null or (c.depends_on is not null and not exists(select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done')))) as is_blocked,
 greatest(p.updated_at,c.updated_at) as updated_at
from public.project_task_controls c join public.inquiry_projects p on p.request_id=c.request_id
cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
where (select public.is_inquiry_staff()) and c.assigned_staff_id=auth.uid() and c.owner_type='bivi' and t.value->>'id'=c.task_id;
revoke all on public.staff_my_tasks from public,anon,service_role;
grant select on public.staff_my_tasks to authenticated;
commit;
