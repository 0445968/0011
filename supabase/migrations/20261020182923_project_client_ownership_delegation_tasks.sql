-- R5c/R5d: staff-verified organization ownership, client delegation and task creation.
-- Requires the project, verified roster, multi-assignee, and phase migrations through 036.
begin;

alter table public.project_assignment_events drop constraint project_assignment_events_action_check;
alter table public.project_assignment_events add constraint project_assignment_events_action_check
 check(action in ('task_assignees','client_managers','organization_owner'));

create table public.client_organization_owners (
 organization_id uuid primary key references public.client_organizations(id) on delete cascade,
 user_id uuid not null,
 verified_by uuid references auth.users(id) on delete set null,
 verified_at timestamptz not null default now(),
 foreign key (organization_id,user_id) references public.client_organization_members(organization_id,user_id) on delete cascade
);
alter table public.client_organization_owners enable row level security;
revoke all on public.client_organization_owners from public,anon,authenticated,service_role;
grant select on public.client_organization_owners to authenticated;
create policy client_organization_owners_staff_read on public.client_organization_owners
 for select to authenticated using ((select public.is_inquiry_staff()));

create table public.project_client_task_details (
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 task_id text not null,
 description text not null check(length(description)<=2000),
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 primary key(request_id,task_id),
 foreign key(request_id,task_id) references public.project_task_controls(request_id,task_id) on delete cascade
);
alter table public.project_client_task_details enable row level security;
revoke all on public.project_client_task_details from public,anon,authenticated,service_role;

create function public.project_client_organization(p_request uuid) returns uuid
language sql stable security definer set search_path='' as $$
 select coalesce(p.company_id,ico.organization_id)
 from public.inquiry_projects p left join public.inquiry_client_organizations ico on ico.request_id=p.request_id
 where p.request_id=p_request;
$$;
revoke all on function public.project_client_organization(uuid) from public,anon,authenticated,service_role;

create function public.project_client_is_owner(p_request uuid,p_user uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.client_organization_owners o
  join public.client_organization_members m on m.organization_id=o.organization_id and m.user_id=o.user_id and m.active
  join public.project_clients pc on pc.request_id=p_request and pc.user_id=o.user_id and pc.active
  where o.organization_id=public.project_client_organization(p_request) and o.user_id=p_user);
$$;
revoke all on function public.project_client_is_owner(uuid,uuid) from public,anon,authenticated,service_role;

create function public.staff_set_project_organization_owner(p_request uuid,p_user uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_org uuid; prior uuid;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 select public.project_client_organization(p_request) into v_org;
 if v_org is null or not public.project_client_member_eligible(p_request,p_user) then
  raise exception 'Choose an active project client member' using errcode='22023';
 end if;
 select o.user_id into prior from public.client_organization_owners o where o.organization_id=v_org for update;
 insert into public.client_organization_owners(organization_id,user_id,verified_by,verified_at)
 values(v_org,p_user,auth.uid(),now())
 on conflict(organization_id) do update set user_id=excluded.user_id,verified_by=excluded.verified_by,verified_at=excluded.verified_at;
 if prior is distinct from p_user then
  insert into public.project_assignment_events(request_id,action,before_state,after_state,actor)
  values(p_request,'organization_owner',jsonb_build_object('organizationOwner',prior),jsonb_build_object('organizationOwner',p_user),auth.uid());
 end if;
 return jsonb_build_object('saved',true,'ownerId',p_user);
end;$$;
revoke all on function public.staff_set_project_organization_owner(uuid,uuid) from public,anon,service_role;
grant execute on function public.staff_set_project_organization_owner(uuid,uuid) to authenticated;

create function public.staff_project_organization_owner(p_request uuid) returns uuid
language plpgsql stable security definer set search_path='' as $$
declare owner_id uuid;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 select o.user_id into owner_id from public.client_organization_owners o where o.organization_id=public.project_client_organization(p_request);
 return owner_id;
end;$$;
revoke all on function public.staff_project_organization_owner(uuid) from public,anon,service_role;
grant execute on function public.staff_project_organization_owner(uuid) to authenticated;

create function public.client_project_assignment_workspace(p_request uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare org uuid; members jsonb; team_tasks jsonb; managers jsonb; mine uuid:=auth.uid(); owner_id uuid;
begin
 if mine is null or not public.has_client_project(p_request) then raise exception 'Project access required' using errcode='42501';end if;
 if not public.project_client_member_eligible(p_request,mine) then raise exception 'Verified organization membership required' using errcode='42501';end if;
 org:=public.project_client_organization(p_request);
 select user_id into owner_id from public.client_organization_owners where organization_id=org;
 select coalesce(jsonb_agg(jsonb_build_object('id',pc.user_id,'name',coalesce(nullif(btrim(concat_ws(' ',nullif(cp.first_name,''),nullif(cp.last_name,''))),''),'Client member')) order by pc.user_id),'[]'::jsonb)
 into members from public.project_clients pc join public.client_organization_members m on m.user_id=pc.user_id and m.organization_id=org and m.active
 left join public.client_profiles cp on cp.user_id=pc.user_id where pc.request_id=p_request and pc.active;
 select coalesce(jsonb_agg(jsonb_build_object('taskId',c.task_id,'revision',c.revision,'assignees',coalesce((select jsonb_agg(tm.user_id order by tm.added_at,tm.user_id) from public.project_task_members tm where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.side='client'),'[]'::jsonb)) order by c.task_id),'[]'::jsonb)
 into team_tasks from public.project_task_controls c where c.request_id=p_request and c.owner_type='client';
 select coalesce(jsonb_agg(user_id order by user_id),'[]'::jsonb) into managers from public.project_client_managers where request_id=p_request;
 return jsonb_build_object('currentUserId',mine,'ownerId',owner_id,'isOwner',public.project_client_is_owner(p_request,mine),
  'isManager',exists(select 1 from public.project_client_managers where request_id=p_request and user_id=mine),
  'members',members,'managers',managers,'tasks',team_tasks,'assignmentRevision',coalesce((select revision from public.project_assignment_revisions where request_id=p_request),1),
  'activePhases',coalesce((select jsonb_agg(phase order by phase) from public.project_phase_states where request_id=p_request and status='active'),'[]'::jsonb));
end;$$;
revoke all on function public.client_project_assignment_workspace(uuid) from public,anon,service_role;
grant execute on function public.client_project_assignment_workspace(uuid) to authenticated;

create function public.client_project_created_task_details(p_request uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.has_client_project(p_request) then
  raise exception 'Project access required' using errcode='42501';
 end if;
 return coalesce((select jsonb_agg(jsonb_build_object('taskId',d.task_id,'description',d.description) order by d.created_at,d.task_id)
  from public.project_client_task_details d join public.project_task_controls c on c.request_id=d.request_id and c.task_id=d.task_id and c.owner_type='client'
  where d.request_id=p_request),'[]'::jsonb);
end;$$;
revoke all on function public.client_project_created_task_details(uuid) from public,anon,service_role;
grant execute on function public.client_project_created_task_details(uuid) to authenticated;

create function public.client_manage_project_team(p_request uuid,p_action text,p_task_id text,p_user_ids uuid[],p_revision integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); org uuid; project public.inquiry_projects%rowtype; control public.project_task_controls%rowtype;
 before_state jsonb; after_state jsonb; expected integer; member_id uuid;
begin
 if actor is null or not public.has_client_project(p_request) or not public.project_client_member_eligible(p_request,actor) then
  raise exception 'Verified project access required' using errcode='42501';
 end if;
 if p_action is null or p_action not in ('managers','task') or p_user_ids is null or cardinality(p_user_ids)>12 or p_revision is null or p_revision<1 then
  raise exception 'Invalid project team change' using errcode='22023';
 end if;
 if exists(select 1 from unnest(p_user_ids) u where u is null) or cardinality(p_user_ids)<>(select count(distinct x) from unnest(p_user_ids) x) then
  raise exception 'Duplicate or invalid member' using errcode='22023';
 end if;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if project.state<>'active' then return jsonb_build_object('result','locked');end if;
 org:=public.project_client_organization(p_request);
 if p_action='managers' then
  if not public.project_client_is_owner(p_request,actor) or cardinality(p_user_ids)>5 then raise exception 'Verified organization owner required' using errcode='42501';end if;
  insert into public.project_assignment_revisions(request_id) values(p_request) on conflict do nothing;
  select revision into expected from public.project_assignment_revisions where request_id=p_request for update;
  if expected<>p_revision then return jsonb_build_object('result','conflict');end if;
  foreach member_id in array p_user_ids loop
   if not public.project_client_member_eligible(p_request,member_id) then raise exception 'Choose an active project member' using errcode='22023';end if;
  end loop;
  select coalesce(jsonb_agg(user_id order by user_id),'[]'::jsonb) into before_state from public.project_client_managers where request_id=p_request;
  select coalesce(jsonb_agg(x order by x),'[]'::jsonb) into after_state from unnest(p_user_ids) x;
  if before_state is distinct from after_state then
   delete from public.project_client_managers where request_id=p_request;
   insert into public.project_client_managers(request_id,user_id,added_by) select p_request,x,actor from unnest(p_user_ids) x;
   update public.project_assignment_revisions set revision=revision+1 where request_id=p_request;
   insert into public.project_assignment_events(request_id,action,before_state,after_state,actor) values(p_request,'client_managers',before_state,after_state,actor);
  end if;
  return jsonb_build_object('result','saved');
 end if;
 if not (public.project_client_is_owner(p_request,actor) or exists(select 1 from public.project_client_managers where request_id=p_request and user_id=actor)) then
  raise exception 'Project owner or designated manager required' using errcode='42501';
 end if;
 select * into control from public.project_task_controls where request_id=p_request and task_id=p_task_id for update;
 if not found or control.owner_type<>'client' or not exists(select 1 from jsonb_array_elements(project.body->'tasks') t where t->>'id'=p_task_id) then return jsonb_build_object('result','not_found');end if;
 if control.revision<>p_revision then return jsonb_build_object('result','conflict');end if;
 if cardinality(p_user_ids)<1 then raise exception 'Keep at least one client assignee' using errcode='22023';end if;
 foreach member_id in array p_user_ids loop
  if not public.project_client_member_eligible(p_request,member_id) then raise exception 'Choose active members of this project organization' using errcode='22023';end if;
 end loop;
 select jsonb_build_object('side','client','users',coalesce(jsonb_agg(user_id order by added_at,user_id),'[]'::jsonb)) into before_state
 from public.project_task_members where request_id=p_request and task_id=p_task_id;
 delete from public.project_task_members where request_id=p_request and task_id=p_task_id;
 insert into public.project_task_members(request_id,task_id,user_id,side,added_by) select p_request,p_task_id,x,'client',actor from unnest(p_user_ids) x;
 update public.project_task_controls set revision=revision+1,updated_at=now(),updated_by=actor where request_id=p_request and task_id=p_task_id returning * into control;
 after_state:=jsonb_build_object('side','client','users',to_jsonb(p_user_ids));
 insert into public.project_assignment_events(request_id,task_id,action,before_state,after_state,actor) values(p_request,p_task_id,'task_assignees',before_state,after_state,actor);
 insert into public.project_task_history(request_id,task_id,action,snapshot,actor)
 values(p_request,p_task_id,'metadata',jsonb_build_object('change','client_assignment','before',before_state,'after',after_state),actor);
 return jsonb_build_object('result','saved','revision',control.revision);
end;$$;
revoke all on function public.client_manage_project_team(uuid,text,text,uuid[],integer) from public,anon,service_role;
grant execute on function public.client_manage_project_team(uuid,text,text,uuid[],integer) to authenticated;

create function public.client_create_project_task(p_request uuid,p_title text,p_notes text,p_phase text,p_user_ids uuid[],p_project_revision integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); project public.inquiry_projects%rowtype; member_id uuid; task_id text:=gen_random_uuid()::text; task jsonb; next_body jsonb;
begin
 if actor is null or not public.has_client_project(p_request) or not public.project_client_member_eligible(p_request,actor) then raise exception 'Verified project access required' using errcode='42501';end if;
 if not (public.project_client_is_owner(p_request,actor) or exists(select 1 from public.project_client_managers where request_id=p_request and user_id=actor)) then raise exception 'Project owner or designated manager required' using errcode='42501';end if;
 if length(btrim(coalesce(p_title,''))) not between 1 and 300 or length(coalesce(p_notes,''))>2000 or p_phase is null or p_phase not in ('inquiry','proposal-onboarding','discovery','direction','production','review','qa','delivery','handoff') or p_user_ids is null or cardinality(p_user_ids)<1 or cardinality(p_user_ids)>12 then raise exception 'Invalid task details' using errcode='22023';end if;
 if exists(select 1 from unnest(p_user_ids) u where u is null) or cardinality(p_user_ids)<>(select count(distinct x) from unnest(p_user_ids) x) then raise exception 'Duplicate or invalid assignee' using errcode='22023';end if;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if project.state<>'active' then return jsonb_build_object('result','locked');end if;
 if project.revision<>p_project_revision then return jsonb_build_object('result','conflict');end if;
 if jsonb_array_length(project.body->'tasks')>=100 then raise exception 'Project task limit reached' using errcode='22023';end if;
 if not exists(select 1 from public.project_phase_states where request_id=p_request and phase=p_phase and status='active') then return jsonb_build_object('result','phase_closed');end if;
 foreach member_id in array p_user_ids loop
  if not public.project_client_member_eligible(p_request,member_id) then raise exception 'Choose active members of this project organization' using errcode='22023';end if;
 end loop;
 task:=jsonb_build_object('id',task_id,'title',btrim(p_title),'owner','Client','dueOn',null,'status','todo','milestoneId',null,'notes','');
 next_body:=jsonb_set(project.body,'{tasks}',(project.body->'tasks')||jsonb_build_array(task));
 update public.inquiry_projects set body=next_body,revision=revision+1,updated_at=now(),updated_by=actor where request_id=p_request returning * into project;
 insert into public.project_task_controls(request_id,task_id,owner_type,phase,updated_by) values(p_request,task_id,'client',p_phase,actor);
 insert into public.project_client_task_details(request_id,task_id,description,created_by) values(p_request,task_id,btrim(coalesce(p_notes,'')),actor);
 insert into public.project_task_members(request_id,task_id,user_id,side,added_by) select p_request,task_id,x,'client',actor from unnest(p_user_ids) x;
 insert into public.project_task_history(request_id,task_id,action,snapshot,actor) values(p_request,task_id,'metadata',jsonb_build_object('change','client_task_created','task',task,'assignees',to_jsonb(p_user_ids)),actor);
 insert into public.inquiry_project_history(request_id,action,reason,snapshot,actor) values(p_request,'save','Client task created',jsonb_build_object('revision',project.revision,'state',project.state,'body',project.body),actor);
 insert into public.project_assignment_events(request_id,task_id,action,before_state,after_state,actor) values(p_request,task_id,'task_assignees','[]'::jsonb,jsonb_build_object('side','client','users',to_jsonb(p_user_ids)),actor);
 return jsonb_build_object('result','saved','taskId',task_id,'projectRevision',project.revision);
end;$$;
revoke all on function public.client_create_project_task(uuid,text,text,text,uuid[],integer) from public,anon,service_role;
grant execute on function public.client_create_project_task(uuid,text,text,text,uuid[],integer) to authenticated;

insert into public.project_task_members(request_id,task_id,user_id,side)
select c.request_id,c.task_id,c.assigned_staff_id,'bivi'
from public.project_task_controls c join public.inquiry_staff s on s.user_id=c.assigned_staff_id and s.active
where c.owner_type='bivi' and c.assigned_staff_id is not null
on conflict do nothing;

create function public.sync_primary_task_member() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='UPDATE' and old.owner_type='bivi' and old.assigned_staff_id is not null
   and (new.owner_type<>'bivi' or new.assigned_staff_id is distinct from old.assigned_staff_id) then
  if new.owner_type<>'bivi' or (new.assigned_staff_id is not null and not exists(
    select 1 from public.project_task_members where request_id=new.request_id and task_id=new.task_id and user_id=new.assigned_staff_id and side='bivi'
  )) then
   delete from public.project_task_members where request_id=new.request_id and task_id=new.task_id and user_id=old.assigned_staff_id and side='bivi';
  end if;
 end if;
 if new.owner_type='bivi' and new.assigned_staff_id is not null then
  insert into public.project_task_members(request_id,task_id,user_id,side) values(new.request_id,new.task_id,new.assigned_staff_id,'bivi') on conflict do nothing;
 end if;
 return new;
end;$$;
revoke all on function public.sync_primary_task_member() from public,anon,authenticated,service_role;
create trigger sync_primary_project_task_member after insert or update of owner_type,assigned_staff_id on public.project_task_controls
 for each row execute function public.sync_primary_task_member();

create or replace function public.clear_inactive_staff_tasks() returns trigger language plpgsql security definer set search_path='' as $$
declare control public.project_task_controls%rowtype; before_state jsonb; after_state jsonb;
begin
 if old.active and not new.active then
  for control in update public.project_task_controls set assigned_staff_id=null,revision=revision+1,updated_at=now(),updated_by=auth.uid()
   where assigned_staff_id=new.user_id returning * loop
   insert into public.project_task_history(request_id,task_id,action,snapshot,actor)
   values(control.request_id,control.task_id,'metadata',jsonb_build_object('control',to_jsonb(control),'change','staff_deactivated'),auth.uid());
  end loop;
  for control in select c.* from public.project_task_controls c join public.project_task_members tm
   on tm.request_id=c.request_id and tm.task_id=c.task_id where tm.user_id=new.user_id and tm.side='bivi' for update of c loop
   select coalesce(jsonb_agg(tm.user_id order by tm.added_at,tm.user_id),'[]'::jsonb) into before_state
   from public.project_task_members tm where tm.request_id=control.request_id and tm.task_id=control.task_id and tm.side='bivi';
   delete from public.project_task_members where request_id=control.request_id and task_id=control.task_id and user_id=new.user_id and side='bivi';
   update public.project_task_controls set revision=revision+1,updated_at=now(),updated_by=auth.uid()
   where request_id=control.request_id and task_id=control.task_id returning * into control;
   select coalesce(jsonb_agg(tm.user_id order by tm.added_at,tm.user_id),'[]'::jsonb) into after_state
   from public.project_task_members tm where tm.request_id=control.request_id and tm.task_id=control.task_id and tm.side='bivi';
   insert into public.project_assignment_events(request_id,task_id,action,before_state,after_state,actor)
   values(control.request_id,control.task_id,'task_assignees',jsonb_build_object('side','bivi','users',before_state),jsonb_build_object('side','bivi','users',after_state),auth.uid());
   insert into public.project_task_history(request_id,task_id,action,snapshot,actor)
   values(control.request_id,control.task_id,'metadata',jsonb_build_object('change','staff_deactivated','before',before_state,'after',after_state),auth.uid());
  end loop;
 end if;
 return new;
end;$$;
revoke all on function public.clear_inactive_staff_tasks() from public,anon,authenticated,service_role;

create or replace view public.staff_my_tasks with(security_invoker=true) as
select p.request_id,p.public_id as project_public_id,coalesce(p.body->>'title','Project') as project_title,lower(coalesce(p.body->>'title','')) as project_sort,p.state as project_state,p.revision as project_revision,
 c.task_id,c.revision as control_revision,c.phase,c.service_id,c.blocker_owner,c.depends_on,
 t.value->>'title' as title,lower(t.value->>'title') as title_sort,t.value->>'status' as task_status,t.value->>'owner' as owner_label,(t.value->>'dueOn')::date as due_on,
 (t.value->>'status'<>'done' and (t.value->>'status'='blocked' or c.blocker_owner is not null or (c.depends_on is not null and not exists(select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done')))) as is_blocked,
 greatest(p.updated_at,c.updated_at) as updated_at,
 greatest((select count(*)::integer from public.project_task_members tm where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.side='bivi'),case when c.assigned_staff_id is not null then 1 else 0 end) as assignee_count
from public.project_task_controls c join public.inquiry_projects p on p.request_id=c.request_id
cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
where (select public.is_inquiry_staff()) and c.owner_type='bivi' and t.value->>'id'=c.task_id
 and (exists(select 1 from public.project_task_members tm join public.inquiry_staff s on s.user_id=tm.user_id and s.active where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.user_id=auth.uid() and tm.side='bivi')
  or (not exists(select 1 from public.project_task_members tm where tm.request_id=c.request_id and tm.task_id=c.task_id and tm.side='bivi') and c.assigned_staff_id=auth.uid()));
revoke all on public.staff_my_tasks from public,anon,service_role;
grant select on public.staff_my_tasks to authenticated;

commit;
