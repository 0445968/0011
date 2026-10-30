begin;

create table public.staff_team_roles(
 user_id uuid primary key references auth.users(id) on delete cascade,
 team_role text not null check(team_role in ('staff','project_manager')),
 updated_at timestamptz not null default now(),updated_by uuid references auth.users(id) on delete set null
);
alter table public.staff_team_roles enable row level security;
revoke all on public.staff_team_roles from public,anon,authenticated,service_role;
grant select on public.staff_team_roles to authenticated;
create policy staff_team_roles_read on public.staff_team_roles for select to authenticated using((select public.is_inquiry_staff()));
create index staff_team_roles_actor on public.staff_team_roles(updated_by);
create table public.staff_invitation_roles(
 email text primary key check(email=lower(btrim(email)) and length(email) between 3 and 254),
 team_role text not null check(team_role in ('staff','project_manager')),
 prepared_by uuid references auth.users(id) on delete set null,prepared_at timestamptz not null default now()
);
alter table public.staff_invitation_roles enable row level security;
revoke all on public.staff_invitation_roles from public,anon,authenticated,service_role;
grant select on public.staff_invitation_roles to authenticated;
create policy staff_invitation_roles_admin on public.staff_invitation_roles for select to authenticated using((select public.is_project_workflow_admin()));
create index staff_invitation_roles_actor on public.staff_invitation_roles(prepared_by);

alter table public.staff_workspace_role_history drop constraint staff_workspace_role_history_action_check;
alter table public.staff_workspace_role_history add constraint staff_workspace_role_history_action_check check(action in ('admin_granted','admin_removed','activated','deactivated','invited','team_role_changed','invitation_prepared'));
create function public.apply_prepared_staff_role() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.staff_team_roles(user_id,team_role,updated_by)
 select new.user_id,r.team_role,r.prepared_by from public.staff_invitation_roles r join auth.users u on lower(u.email)=r.email where u.id=new.user_id
 on conflict(user_id) do nothing;
 insert into public.staff_workspace_role_history(user_id,action,actor,detail) select new.user_id,'invited',r.prepared_by,jsonb_build_object('email',r.email,'teamRole',r.team_role) from public.staff_invitation_roles r join auth.users u on lower(u.email)=r.email where u.id=new.user_id;
 return new;
end;$$;
revoke all on function public.apply_prepared_staff_role() from public,anon,authenticated,service_role;
create trigger staff_prepared_role after insert on public.inquiry_staff for each row execute function public.apply_prepared_staff_role();

create function public.manage_workspace_staff_role(p_user uuid,p_action text,p_value text,p_email text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare target public.inquiry_staff%rowtype;existing_admin boolean;email_key text;
begin
 if not public.is_project_workflow_admin() then raise exception 'Workspace admin required' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtext('bivi-workspace-staff-roles'));
 if p_action='prepare_invite' then
  email_key:=lower(btrim(p_email));
  if email_key is null or length(email_key) not between 3 and 254 or position('@' in email_key)<2 or p_value not in ('staff','project_manager') then raise exception 'Invalid invitation role' using errcode='22023';end if;
  insert into public.staff_invitation_roles(email,team_role,prepared_by) values(email_key,p_value,auth.uid())
   on conflict(email) do update set team_role=excluded.team_role,prepared_by=excluded.prepared_by,prepared_at=now();
  insert into public.staff_team_roles(user_id,team_role,updated_by) select u.id,p_value,auth.uid() from auth.users u join public.inquiry_staff s on s.user_id=u.id where lower(u.email)=email_key and s.active
   on conflict(user_id) do update set team_role=excluded.team_role,updated_by=excluded.updated_by,updated_at=now();
  insert into public.staff_workspace_role_history(user_id,action,actor,detail) values(auth.uid(),'invitation_prepared',auth.uid(),jsonb_build_object('email',email_key,'teamRole',p_value));
  return jsonb_build_object('result','saved');
 end if;
 select * into target from public.inquiry_staff where user_id=p_user for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 select exists(select 1 from public.project_workflow_override_admins where user_id=p_user) into existing_admin;
 if (p_action='admin' and p_value='false' or p_action='active' and p_value='false') and existing_admin and target.active
  and (select count(*) from public.project_workflow_override_admins a join public.inquiry_staff s on s.user_id=a.user_id where s.active)<=1 then raise exception 'Keep at least one active workspace admin' using errcode='23514';end if;
 if p_action='team_role' then
  if p_value not in ('staff','project_manager') then raise exception 'Invalid team role' using errcode='22023';end if;
  insert into public.staff_team_roles(user_id,team_role,updated_by) values(p_user,p_value,auth.uid()) on conflict(user_id) do update set team_role=excluded.team_role,updated_by=excluded.updated_by,updated_at=now();
  insert into public.staff_workspace_role_history(user_id,action,actor,detail) values(p_user,'team_role_changed',auth.uid(),jsonb_build_object('teamRole',p_value));
 elsif p_action='admin' and p_value in ('true','false') then
  if p_value='true' then
   if not target.active then raise exception 'Activate staff before granting admin access' using errcode='23514';end if;
   insert into public.project_workflow_override_admins(user_id,granted_by) values(p_user,auth.uid()) on conflict do nothing;
  else delete from public.project_workflow_override_admins where user_id=p_user;end if;
  insert into public.staff_workspace_role_history(user_id,action,actor) values(p_user,case when p_value='true' then 'admin_granted' else 'admin_removed' end,auth.uid());
 elsif p_action='active' and p_value in ('true','false') then
  update public.inquiry_staff set active=p_value::boolean where user_id=p_user;
  insert into public.staff_workspace_role_history(user_id,action,actor) values(p_user,case when p_value='true' then 'activated' else 'deactivated' end,auth.uid());
 else raise exception 'Invalid staff action' using errcode='22023';end if;
 return jsonb_build_object('result','saved');
end;$$;
revoke all on function public.manage_workspace_staff_role(uuid,text,text,text) from public,anon,service_role;
grant execute on function public.manage_workspace_staff_role(uuid,text,text,text) to authenticated;

-- Imported system records without an activation actor can be enrolled by a
-- trusted migration. All existing production projects are enrolled below;
-- application-created projects enroll automatically during activation.
create table public.project_task_governance(
 request_id uuid primary key references public.inquiry_projects(request_id) on delete cascade
);
alter table public.project_task_governance enable row level security;
revoke all on public.project_task_governance from public,anon,authenticated,service_role;
insert into public.project_task_governance select request_id from public.inquiry_projects;
create table public.project_task_origins(
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,task_id text not null,
 owning_side text not null check(owning_side in ('bivi','client')),
 origin_kind text not null check(origin_kind in ('bivi','client','system','legacy')),
 created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now(),
 primary key(request_id,task_id)
);
alter table public.project_task_origins enable row level security;
revoke all on public.project_task_origins from public,anon,authenticated,service_role;
grant select on public.project_task_origins to authenticated;
create policy project_task_origins_staff on public.project_task_origins for select to authenticated using((select public.is_inquiry_staff()));
create index project_task_origins_creator on public.project_task_origins(created_by);
insert into public.project_task_origins(request_id,task_id,owning_side,origin_kind,created_by)
 select p.request_id,t->>'id',case when d.task_id is not null then 'client' else 'bivi' end,
 case when d.task_id is not null then 'client' when first_history.action='save' and historical_staff.user_id is not null then 'bivi' else 'legacy' end,coalesce(d.created_by,case when first_history.action='save' and historical_staff.user_id is not null then first_history.actor end)
 from public.inquiry_projects p cross join lateral jsonb_array_elements(p.body->'tasks') t
 left join public.project_client_task_details d on d.request_id=p.request_id and d.task_id=t->>'id'
 left join lateral(select h.action,h.actor from public.inquiry_project_history h where h.request_id=p.request_id and exists(select 1 from jsonb_array_elements(coalesce(h.snapshot->'body'->'tasks','[]'::jsonb)) old_task where old_task->>'id'=t->>'id') order by h.id limit 1) first_history on true
 left join public.inquiry_staff historical_staff on historical_staff.user_id=first_history.actor;
create function public.capture_project_task_origins() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' and new.updated_by is not null then insert into public.project_task_governance values(new.request_id) on conflict do nothing;end if;
 insert into public.project_task_origins(request_id,task_id,owning_side,origin_kind,created_by)
 select new.request_id,t->>'id',case when tg_op='UPDATE' and auth.uid() is not null and not public.is_inquiry_staff() then 'client' else 'bivi' end,
 case when tg_op='INSERT' or auth.uid() is null then 'system' when public.is_inquiry_staff() then 'bivi' else 'client' end,
 case when tg_op='UPDATE' then auth.uid() else null end
 from jsonb_array_elements(new.body->'tasks') t on conflict do nothing;
 return new;
end;$$;
revoke all on function public.capture_project_task_origins() from public,anon,authenticated,service_role;
create trigger project_capture_task_origins after insert or update of body on public.inquiry_projects for each row execute function public.capture_project_task_origins();

create function public.project_can_propose_task(p_request uuid,p_task text) returns boolean language sql stable security definer set search_path='' as $$
 select public.is_project_workflow_admin() or (public.is_inquiry_staff() and exists(select 1 from public.project_task_origins o where o.request_id=p_request and o.task_id=p_task and o.owning_side='bivi'
  and (o.created_by=auth.uid() or exists(select 1 from public.staff_team_roles r where r.user_id=auth.uid() and r.team_role='project_manager'))))
 or (public.has_client_project(p_request) and public.project_client_member_eligible(p_request,auth.uid()) and exists(select 1 from public.project_task_origins o where o.request_id=p_request and o.task_id=p_task and o.owning_side='client'
  and (o.created_by=auth.uid() or public.project_client_is_owner(p_request,auth.uid()) or exists(select 1 from public.project_client_managers m where m.request_id=p_request and m.user_id=auth.uid()))));
$$;
create function public.project_can_progress_task(p_request uuid,p_task text) returns boolean language sql stable security definer set search_path='' as $$
 select public.is_project_workflow_admin() or exists(select 1 from public.project_task_controls c where c.request_id=p_request and c.task_id=p_task and
  ((public.is_inquiry_staff() and c.owner_type='bivi' and (c.assigned_staff_id=auth.uid() or exists(select 1 from public.project_task_members m where m.request_id=p_request and m.task_id=p_task and m.user_id=auth.uid() and m.side='bivi')))
  or (public.has_client_project(p_request) and public.project_client_member_eligible(p_request,auth.uid()) and c.owner_type='client' and exists(select 1 from public.project_task_members m where m.request_id=p_request and m.task_id=p_task and m.user_id=auth.uid() and m.side='client'))));
$$;
revoke all on function public.project_can_propose_task(uuid,text),public.project_can_progress_task(uuid,text) from public,anon,authenticated,service_role;

-- Formal Brief publishing/review already owns two system task transitions.
-- Permit only the exact same-transaction event and expected status, so a
-- manual task RPC cannot impersonate a Brief approval.
create function public.project_system_task_transition(p_request uuid,p_before jsonb,p_after jsonb) returns boolean
language sql stable security definer set search_path='' as $$
 select (p_before-'status')=(p_after-'status') and p_after->>'id' in ('project-brief-bivi-prepare','project-brief-client-approval')
 and exists(select 1 from public.project_task_origins o where o.request_id=p_request and o.task_id=p_after->>'id' and o.origin_kind in ('system','legacy'))
 and exists(select 1 from public.project_brief_versions b where b.request_id=p_request
  and b.version=(select max(version) from public.project_brief_versions where request_id=p_request)
  and ((b.published_by=auth.uid() and b.published_at=now() and b.status='pending' and public.is_inquiry_staff()
   and p_after->>'status'=case when p_after->>'id'='project-brief-bivi-prepare' then 'done' else 'todo' end)
   or (b.decided_by=auth.uid() and b.decided_at=now() and public.has_client_project(p_request)
    and p_after->>'status'=case when b.status='approved' then 'done' when b.status='changes_requested' then case when p_after->>'id'='project-brief-bivi-prepare' then 'doing' else 'blocked' end else null end)));
$$;
revoke all on function public.project_system_task_transition(uuid,jsonb,jsonb) from public,anon,authenticated,service_role;

-- Trusted database/Auth maintenance must still be able to cascade deletions.
-- This uses the database session/role, never user-editable profile metadata.
create function public.task_authority_maintenance() returns boolean language sql stable set search_path='' as $$
 select auth.uid() is null and (current_setting('role',true)='service_role' or
 (session_user in ('postgres','supabase_admin','supabase_auth_admin') and current_setting('role',true) in ('none','postgres','supabase_admin','supabase_auth_admin')));
$$;
revoke all on function public.task_authority_maintenance() from public,anon,authenticated,service_role;

create function public.guard_task_authority() returns trigger language plpgsql security definer set search_path='' as $$
declare item jsonb;before_task jsonb;control public.project_task_controls%rowtype;
begin
 if public.task_authority_maintenance() or not exists(select 1 from public.project_task_governance where request_id=new.request_id) or public.is_project_workflow_admin() then return new;end if;
 if auth.uid() is null then raise exception 'Task authorization required' using errcode='42501';end if;
 if (old.body-'tasks') is distinct from (new.body-'tasks') then
  -- Milestone activity is derived from assigned work, not a structural edit.
  if (old.body-array['tasks','milestones']) is distinct from (new.body-array['tasks','milestones']) or
   (select jsonb_agg(m-'status') from jsonb_array_elements(old.body->'milestones') m) is distinct from (select jsonb_agg(m-'status') from jsonb_array_elements(new.body->'milestones') m) or
   exists(select 1 from jsonb_array_elements(new.body->'milestones') m where m->>'status'='done' and not exists(select 1 from jsonb_array_elements(old.body->'milestones') b where b->>'id'=m->>'id' and b->>'status'='done'))
  then raise exception 'Project requirements need admin approval' using errcode='42501';end if;
 end if;
 if (select jsonb_agg(t->>'id') from jsonb_array_elements(old.body->'tasks') t) is distinct from (select jsonb_agg(t->>'id') from jsonb_array_elements(new.body->'tasks') t) then raise exception 'Task creation, removal and order changes need admin approval' using errcode='42501';end if;
 for item in select value from jsonb_array_elements(new.body->'tasks') loop
  select value into before_task from jsonb_array_elements(old.body->'tasks') where value->>'id'=item->>'id';
  if before_task is not distinct from item then continue;end if;
  if (before_task-array['status','startOn','startTime']) is distinct from (item-array['status','startOn','startTime']) then raise exception 'Task requirement changes must be submitted for admin approval' using errcode='42501';end if;
  if public.project_system_task_transition(new.request_id,before_task,item) then continue;end if;
  if not public.project_can_progress_task(new.request_id,item->>'id') then raise exception 'Only the responsible team and assigned members may update task progress' using errcode='42501';end if;
  if item->>'status'='rejected' or item->>'status'='in_review' and not exists(select 1 from public.project_task_controls c where c.request_id=new.request_id and c.task_id=item->>'id' and (c.requires_staff_review or c.requires_client_review)) then raise exception 'Only admins may select a review decision' using errcode='42501';end if;
 end loop;return new;
end;$$;
revoke all on function public.guard_task_authority() from public,anon,authenticated,service_role;
create trigger zz_task_authority before update of body on public.inquiry_projects for each row execute function public.guard_task_authority();

create function public.guard_task_setting_authority() returns trigger language plpgsql security definer set search_path='' as $$
declare request_key uuid;task_key text;
begin
 if tg_op='DELETE' then request_key:=old.request_id;task_key:=old.task_id;else request_key:=new.request_id;task_key:=new.task_id;end if;
 if public.task_authority_maintenance() or not exists(select 1 from public.project_task_governance where request_id=request_key) or public.is_project_workflow_admin() then if tg_op='DELETE' then return old;else return new;end if;end if;
 if tg_table_name='project_subtasks' and tg_op='UPDATE' and (to_jsonb(old)-array['status','revision','updated_at','updated_by'])=(to_jsonb(new)-array['status','revision','updated_at','updated_by']) and public.project_can_progress_task(request_key,task_key) then return new;end if;
 if tg_table_name='project_task_controls' and tg_op='UPDATE' and
  (to_jsonb(old)-array['client_note','revision','updated_at','updated_by'])=(to_jsonb(new)-array['client_note','revision','updated_at','updated_by']) and public.project_can_progress_task(request_key,task_key) then return new;end if;
 raise exception 'Task setting changes must be proposed for admin approval' using errcode='42501';
end;$$;
revoke all on function public.guard_task_setting_authority() from public,anon,authenticated,service_role;
create trigger zz_task_control_authority before update or delete on public.project_task_controls for each row execute function public.guard_task_setting_authority();
create trigger zz_task_member_authority before insert or update or delete on public.project_task_members for each row execute function public.guard_task_setting_authority();
create trigger zz_subtask_authority before insert or update or delete on public.project_subtasks for each row execute function public.guard_task_setting_authority();
create trigger zz_task_tag_authority before update on public.project_task_presentation for each row execute function public.guard_task_setting_authority();

create table public.project_task_change_proposals(
 id uuid primary key default gen_random_uuid(),request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 task_id text not null,version integer not null check(version>0),created_by uuid references auth.users(id) on delete set null,
 owning_side text not null check(owning_side in ('bivi','client')),base_task jsonb,candidate_task jsonb not null,
 base_control_revision integer not null,base_tag_revision integer not null,base_settings jsonb not null default '{}'::jsonb,
 status text not null default 'pending' check(status in ('pending','accepted','rejected','superseded')),
 submitted_at timestamptz not null default now(),reviewed_at timestamptz,reviewed_by uuid references auth.users(id) on delete set null,review_note text not null default '',
 unique(request_id,task_id,created_by,version)
);
alter table public.project_task_change_proposals enable row level security;
revoke all on public.project_task_change_proposals from public,anon,authenticated,service_role;
grant select on public.project_task_change_proposals to authenticated;
create policy project_task_change_proposals_read on public.project_task_change_proposals for select to authenticated using((select public.is_inquiry_staff()));
create index project_task_proposals_author on public.project_task_change_proposals(created_by);
create index project_task_proposals_reviewer on public.project_task_change_proposals(reviewed_by);
create unique index project_task_one_pending_proposal on public.project_task_change_proposals(request_id,task_id,created_by) where status='pending';
alter table public.project_workplan_save_receipts add column outcome text not null default 'saved' check(outcome in ('saved','submitted')),add column proposal_ids jsonb not null default '[]'::jsonb;

create function public.submit_project_task_changes(p_request uuid,p_body jsonb,p_revision integer,p_save_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare project public.inquiry_projects%rowtype;item jsonb;before_task jsonb;control_rev integer;tag_rev integer;proposal public.project_task_change_proposals%rowtype;ids jsonb:='[]';origin text;settings jsonb;receipt public.project_workplan_save_receipts%rowtype;
begin
 if auth.uid() is null or not (public.is_inquiry_staff() or public.has_client_project(p_request) and public.project_client_member_eligible(p_request,auth.uid())) then raise exception 'Project access required' using errcode='42501';end if;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if project.state='completed' or exists(select 1 from public.project_operational_status where request_id=p_request and status='inactive') then return jsonb_build_object('result','locked');end if;
 select * into receipt from public.project_workplan_save_receipts where save_id=p_save_id;
 if found then
  if receipt.staff_id<>auth.uid() or receipt.request_id<>p_request or receipt.payload_hash<>md5(p_body::text) or receipt.expected_revision<>p_revision or receipt.outcome<>'submitted' then raise exception 'Save identifier already used' using errcode='22023';end if;
  return jsonb_build_object('result','submitted','proposalIds',receipt.proposal_ids,'revision',project.revision);
 end if;
 if project.revision<>p_revision then return jsonb_build_object('result','conflict');end if;
 if not public.valid_project_workplan_draft_body(p_body) or not public.valid_project_body(public.strip_project_task_draft_edits(p_body)) then raise exception 'Invalid task changes' using errcode='22023';end if;
 if (project.body-array['tasks','milestones']) is distinct from (p_body-array['tasks','milestones']) or
  (select jsonb_agg(m-'status') from jsonb_array_elements(project.body->'milestones') m) is distinct from (select jsonb_agg(m-'status') from jsonb_array_elements(p_body->'milestones') m) then raise exception 'Only admins may change project or milestone requirements' using errcode='42501';end if;
 if exists(select 1 from jsonb_array_elements(project.body->'tasks') b where not exists(select 1 from jsonb_array_elements(p_body->'tasks') t where t->>'id'=b->>'id')) then raise exception 'Only admins may remove tasks' using errcode='42501';end if;
 -- Changing order of existing tasks is an admin operation.
 if (select jsonb_agg(t->>'id') from jsonb_array_elements(project.body->'tasks') t) is distinct from (select jsonb_agg(t->>'id') from jsonb_array_elements(p_body->'tasks') t where exists(select 1 from jsonb_array_elements(project.body->'tasks') b where b->>'id'=t->>'id')) then raise exception 'Only admins may change task order' using errcode='42501';end if;
 for item in select value from jsonb_array_elements(p_body->'tasks') loop
  select value into before_task from jsonb_array_elements(project.body->'tasks') where value->>'id'=item->>'id';
  if item is not distinct from before_task then continue;end if;
  if before_task is not null and not public.project_can_propose_task(p_request,item->>'id') then
   if not public.project_can_progress_task(p_request,item->>'id') or (before_task-array['status','startOn','startTime']) is distinct from (item-array['status','startOn','startTime']) then raise exception 'You may propose changes only to tasks you own or manage' using errcode='42501';end if;
  end if;
  if before_task is null and exists(select 1 from public.project_task_origins where request_id=p_request and task_id=item->>'id') then raise exception 'This task identity has already been used' using errcode='22023';end if;
  if before_task is null and not public.is_inquiry_staff() and not (public.project_client_is_owner(p_request,auth.uid()) or exists(select 1 from public.project_client_managers where request_id=p_request and user_id=auth.uid())) then raise exception 'Client owner or manager required to propose new tasks' using errcode='42501';end if;
  select coalesce(c.revision,0) into control_rev from public.project_task_controls c where c.request_id=p_request and c.task_id=item->>'id';control_rev:=coalesce(control_rev,0);
  select coalesce(t.revision,0) into tag_rev from public.project_task_presentation t where t.request_id=p_request and t.task_id=item->>'id';tag_rev:=coalesce(tag_rev,0);
  if item->'edits' ? 'controlRevision' and (item->'edits'->>'controlRevision')::integer<>control_rev or item->'edits' ? 'tags' and (item->'edits'->'tags'->>'revision')::integer<>tag_rev then raise exception 'Task settings changed. Refresh and review your draft.' using errcode='40001';end if;
  select * into proposal from public.project_task_change_proposals where request_id=p_request and task_id=item->>'id' and created_by=auth.uid() and status='pending' for update;
  if proposal.id is not null and proposal.candidate_task=item and proposal.base_task is not distinct from before_task and proposal.base_control_revision=control_rev and proposal.base_tag_revision=tag_rev then ids:=ids||jsonb_build_array(proposal.id);continue;end if;
  update public.project_task_change_proposals set status='superseded' where request_id=p_request and task_id=item->>'id' and created_by=auth.uid() and status='pending';
  select owning_side into origin from public.project_task_origins where request_id=p_request and task_id=item->>'id';origin:=coalesce(origin,case when public.is_inquiry_staff() then 'bivi' else 'client' end);
  select jsonb_build_object('priority',c.priority,'assignment',jsonb_build_object('side',c.owner_type,'userIds',coalesce((select jsonb_agg(m.user_id order by m.user_id) from public.project_task_members m where m.request_id=p_request and m.task_id=c.task_id),'[]'::jsonb)),
   'review',jsonb_build_object('requiresStaffReview',c.requires_staff_review,'requiresClientReview',c.requires_client_review),
   'control',jsonb_build_object('ownerType',c.owner_type,'phase',c.phase,'serviceId',c.service_id,'dependsOn',c.depends_on,'blockerOwner',c.blocker_owner),
   'tags',jsonb_build_object('tags',coalesce((select to_jsonb(t.tags) from public.project_task_presentation t where t.request_id=p_request and t.task_id=c.task_id),'[]'::jsonb))) into settings
   from public.project_task_controls c where c.request_id=p_request and c.task_id=item->>'id';
  insert into public.project_task_change_proposals(request_id,task_id,version,created_by,owning_side,base_task,candidate_task,base_control_revision,base_tag_revision,base_settings)
   values(p_request,item->>'id',coalesce((select max(version) from public.project_task_change_proposals where request_id=p_request and task_id=item->>'id' and created_by=auth.uid()),0)+1,auth.uid(),origin,before_task,item,control_rev,tag_rev,coalesce(settings,'{}'::jsonb)) returning * into proposal;
  ids:=ids||jsonb_build_array(proposal.id);
 end loop;
 if jsonb_array_length(ids)=0 then return jsonb_build_object('result','unchanged');end if;
 insert into public.project_workplan_save_receipts(save_id,request_id,staff_id,payload_hash,expected_revision,saved_revision,outcome,proposal_ids) values(p_save_id,p_request,auth.uid(),md5(p_body::text),p_revision,project.revision,'submitted',ids);
 return jsonb_build_object('result','submitted','proposalIds',ids,'revision',project.revision);
end;$$;
revoke all on function public.submit_project_task_changes(uuid,jsonb,integer,uuid) from public,anon,service_role;
grant execute on function public.submit_project_task_changes(uuid,jsonb,integer,uuid) to authenticated;

alter function public.save_project_workplan_bundle(uuid,jsonb,integer,uuid) rename to save_project_workplan_bundle_before_authority;
revoke all on function public.save_project_workplan_bundle_before_authority(uuid,jsonb,integer,uuid) from public,anon,authenticated,service_role;
create function public.save_project_workplan_bundle(p_request uuid,p_body jsonb,p_revision integer,p_save_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare project public.inquiry_projects%rowtype;
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 if exists(select 1 from public.project_task_governance where request_id=p_request) and not public.is_project_workflow_admin() and
  exists(select 1 from jsonb_array_elements(p_body->'tasks') t left join lateral(select b from jsonb_array_elements(project.body->'tasks') b where b->>'id'=t->>'id') saved on true
   where saved.b is null or t ? 'edits' or (t-array['status','startOn','startTime']) is distinct from (saved.b-array['status','startOn','startTime'])) then
  return public.submit_project_task_changes(p_request,p_body,p_revision,p_save_id);
 end if;
 return public.save_project_workplan_bundle_before_authority(p_request,p_body,p_revision,p_save_id);
end;$$;
revoke all on function public.save_project_workplan_bundle(uuid,jsonb,integer,uuid) from public,anon,service_role;
grant execute on function public.save_project_workplan_bundle(uuid,jsonb,integer,uuid) to authenticated;

create function public.review_project_task_change(p_request uuid,p_proposal uuid,p_version integer,p_decision text,p_note text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare project public.inquiry_projects%rowtype;proposal public.project_task_change_proposals%rowtype;task jsonb;body jsonb;result jsonb;control_rev integer;tag_rev integer;
begin
 if not public.is_project_workflow_admin() then raise exception 'Workspace admin required' using errcode='42501';end if;
 if p_decision not in ('accept','reject') or length(coalesce(p_note,''))>2000 or p_decision='reject' and length(btrim(coalesce(p_note,'')))=0 then raise exception 'A rejection comment is required' using errcode='22023';end if;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 select * into proposal from public.project_task_change_proposals where id=p_proposal and request_id=p_request for update;
 if proposal.id is null then return jsonb_build_object('result','not_found');end if;
 if proposal.version<>p_version or proposal.status<>'pending' then return jsonb_build_object('result','conflict');end if;
 if p_decision='accept' then
  select value into task from jsonb_array_elements(project.body->'tasks') where value->>'id'=proposal.task_id;
  select revision into control_rev from public.project_task_controls where request_id=p_request and task_id=proposal.task_id;
  select revision into tag_rev from public.project_task_presentation where request_id=p_request and task_id=proposal.task_id;
  if task is distinct from proposal.base_task or coalesce(control_rev,0)<>proposal.base_control_revision or coalesce(tag_rev,0)<>proposal.base_tag_revision then return jsonb_build_object('result','stale');end if;
  body:=jsonb_set(project.body,'{tasks}',case when task is null then (project.body->'tasks')||jsonb_build_array(proposal.candidate_task) else (select jsonb_agg(case when t->>'id'=proposal.task_id then proposal.candidate_task else t end order by ord) from jsonb_array_elements(project.body->'tasks') with ordinality x(t,ord)) end);
  result:=public.save_project_workplan_bundle_before_authority(p_request,body,project.revision,proposal.id);
  perform public.assert_project_bundle_saved(result);
  if task is null and proposal.owning_side='client' then insert into public.project_client_task_details(request_id,task_id,description,created_by) values(p_request,proposal.task_id,coalesce(proposal.candidate_task->>'notes',''),proposal.created_by) on conflict do nothing;end if;
  if task is null then update public.project_task_origins set owning_side=proposal.owning_side,origin_kind=case when proposal.owning_side='client' then 'client' else 'bivi' end,created_by=proposal.created_by,created_at=proposal.submitted_at where request_id=p_request and task_id=proposal.task_id;end if;
 end if;
 update public.project_task_change_proposals set status=case when p_decision='accept' then 'accepted' else 'rejected' end,reviewed_at=now(),reviewed_by=auth.uid(),review_note=btrim(coalesce(p_note,'')) where id=p_proposal;
 return jsonb_build_object('result','saved');
end;$$;
revoke all on function public.review_project_task_change(uuid,uuid,integer,text,text) from public,anon,service_role;
grant execute on function public.review_project_task_change(uuid,uuid,integer,text,text) to authenticated;

create function public.staff_project_task_authority(p_request uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 return jsonb_build_object('isAdmin',public.is_project_workflow_admin(),'tasks',coalesce((select jsonb_agg(jsonb_build_object('taskId',o.task_id,'owningSide',o.owning_side,'createdBy',o.created_by,'originKind',o.origin_kind,'canPropose',public.project_can_propose_task(p_request,o.task_id),'canProgress',public.project_can_progress_task(p_request,o.task_id))) from public.project_task_origins o where o.request_id=p_request),'[]'::jsonb));
end;$$;
revoke all on function public.staff_project_task_authority(uuid) from public,anon,service_role;
grant execute on function public.staff_project_task_authority(uuid) to authenticated;

-- Client task creation also goes through the task-change queue. Legacy
-- imported projects retain their existing route until explicitly enrolled.
alter function public.client_create_project_task(uuid,text,text,text,uuid[],integer) rename to client_create_project_task_before_authority;
revoke all on function public.client_create_project_task_before_authority(uuid,text,text,text,uuid[],integer) from public,anon,authenticated,service_role;
create function public.client_create_project_task(p_request uuid,p_title text,p_notes text,p_phase text,p_user_ids uuid[],p_project_revision integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare project public.inquiry_projects%rowtype;candidate jsonb;task_key text:=gen_random_uuid()::text;member uuid;result jsonb;
begin
 if not exists(select 1 from public.project_task_governance where request_id=p_request) then result:=public.client_create_project_task_before_authority(p_request,p_title,p_notes,p_phase,p_user_ids,p_project_revision);if result->>'result'='saved' then update public.project_task_origins set owning_side='client',origin_kind='client',created_by=auth.uid() where request_id=p_request and task_id=result->>'taskId';end if;return result;end if;
 if not public.has_client_project(p_request) or not public.project_client_member_eligible(p_request,auth.uid()) or not (public.project_client_is_owner(p_request,auth.uid()) or exists(select 1 from public.project_client_managers where request_id=p_request and user_id=auth.uid())) then raise exception 'Client owner or manager required' using errcode='42501';end if;
 if length(btrim(coalesce(p_title,''))) not between 1 and 300 or length(coalesce(p_notes,''))>2000 or p_user_ids is null or cardinality(p_user_ids) not between 1 and 12 or cardinality(p_user_ids)<>(select count(distinct x) from unnest(p_user_ids) x) then raise exception 'Invalid task details' using errcode='22023';end if;
 if not exists(select 1 from public.project_phase_states where request_id=p_request and phase=p_phase and status='active') then return jsonb_build_object('result','phase_closed');end if;
 foreach member in array p_user_ids loop if member is null or not public.project_client_member_eligible(p_request,member) then raise exception 'Choose active project members' using errcode='22023';end if;end loop;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 if project.state<>'active' then return jsonb_build_object('result','locked');end if;
 candidate:=jsonb_build_object('id',task_key,'title',btrim(p_title),'notes',btrim(coalesce(p_notes,'')),'owner','','status','todo','dueOn',null,'milestoneId',null,
 'edits',jsonb_build_object('controlRevision',0,'assignment',jsonb_build_object('side','client','userIds',to_jsonb(p_user_ids)),
 'control',jsonb_build_object('ownerType','client','phase',p_phase,'serviceId',null,'dependsOn',null,'blockerOwner',null),'review',jsonb_build_object('requiresStaffReview',false,'requiresClientReview',true)));
 result:=public.submit_project_task_changes(p_request,jsonb_set(project.body,'{tasks}',(project.body->'tasks')||jsonb_build_array(candidate)),p_project_revision,gen_random_uuid());
 if result->>'result'='submitted' then update public.project_task_change_proposals set owning_side='client' where request_id=p_request and task_id=task_key and created_by=auth.uid() and base_task is null and status='pending';end if;
 return result||jsonb_build_object('taskId',task_key);
end;$$;
revoke all on function public.client_create_project_task(uuid,text,text,text,uuid[],integer) from public,anon,service_role;
grant execute on function public.client_create_project_task(uuid,text,text,text,uuid[],integer) to authenticated;

alter function public.client_manage_project_team(uuid,text,text,uuid[],integer) rename to client_manage_project_team_before_authority;
revoke all on function public.client_manage_project_team_before_authority(uuid,text,text,uuid[],integer) from public,anon,authenticated,service_role;
create function public.client_manage_project_team(p_request uuid,p_action text,p_task_id text,p_user_ids uuid[],p_revision integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare project public.inquiry_projects%rowtype;candidate jsonb;c public.project_task_controls%rowtype;member uuid;
begin
 if p_action<>'task' or not exists(select 1 from public.project_task_governance where request_id=p_request) then return public.client_manage_project_team_before_authority(p_request,p_action,p_task_id,p_user_ids,p_revision);end if;
 if not public.project_can_propose_task(p_request,p_task_id) then raise exception 'Only task owners or their managers may propose assignment changes' using errcode='42501';end if;
 if p_user_ids is null or cardinality(p_user_ids) not between 1 and 12 or cardinality(p_user_ids)<>(select count(distinct x) from unnest(p_user_ids) x) then raise exception 'Invalid members' using errcode='22023';end if;
 foreach member in array p_user_ids loop if member is null or not public.project_client_member_eligible(p_request,member) then raise exception 'Choose active project members' using errcode='22023';end if;end loop;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 select * into c from public.project_task_controls where request_id=p_request and task_id=p_task_id;
 if c.revision<>p_revision then return jsonb_build_object('result','conflict');end if;
 select t into candidate from jsonb_array_elements(project.body->'tasks') t where t->>'id'=p_task_id;
 candidate:=candidate||jsonb_build_object('edits',jsonb_build_object('controlRevision',c.revision,'assignment',jsonb_build_object('side','client','userIds',to_jsonb(p_user_ids))));
 return public.submit_project_task_changes(p_request,jsonb_set(project.body,'{tasks}',(select jsonb_agg(case when t->>'id'=p_task_id then candidate else t end order by ord) from jsonb_array_elements(project.body->'tasks') with ordinality x(t,ord))),project.revision,gen_random_uuid());
end;$$;
revoke all on function public.client_manage_project_team(uuid,text,text,uuid[],integer) from public,anon,service_role;
grant execute on function public.client_manage_project_team(uuid,text,text,uuid[],integer) to authenticated;

-- Clients see a receipt for their own proposals, never internal task bodies,
-- assignee identities, settings baselines or other members' proposals.
create function public.client_project_task_change_receipts(p_request uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.has_client_project(p_request) or not public.project_client_member_eligible(p_request,auth.uid()) then raise exception 'Verified client project access required' using errcode='42501';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',id,'taskId',task_id,'title',candidate_task->>'title','version',version,'status',status,'submittedAt',submitted_at,'reviewNote',review_note) order by submitted_at desc) from public.project_task_change_proposals where request_id=p_request and created_by=auth.uid() and status in ('pending','rejected')),'[]'::jsonb);
end;$$;
revoke all on function public.client_project_task_change_receipts(uuid) from public,anon,service_role;
grant execute on function public.client_project_task_change_receipts(uuid) to authenticated;

-- Retain the existing sanitized projection and add client-owned work even
-- when Bivi is responsible. Never expose raw task notes or internal settings.
alter function public.client_project_work(uuid) rename to client_project_work_before_authority;
revoke all on function public.client_project_work_before_authority(uuid) from public,anon,authenticated,service_role;
create function public.client_project_work(p_request_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;project public.inquiry_projects%rowtype;items jsonb;
begin
 if not public.has_client_project(p_request_id) or not public.project_client_member_eligible(p_request_id,auth.uid()) then return null;end if;
 result:=public.client_project_work_before_authority(p_request_id);if result is null then return null;end if;
 select * into project from public.inquiry_projects where request_id=p_request_id;
 select coalesce(jsonb_agg(item||jsonb_build_object('responsibleSide',c.owner_type,'owningSide',coalesce(o.owning_side,'bivi'),'canProgress',public.project_can_progress_task(p_request_id,item->>'id')) order by ord),'[]'::jsonb) into items
 from jsonb_array_elements(result->'tasks') with ordinality x(item,ord) join public.project_task_controls c on c.request_id=p_request_id and c.task_id=item->>'id' left join public.project_task_origins o on o.request_id=p_request_id and o.task_id=c.task_id;
 select items||coalesce(jsonb_agg(jsonb_build_object('id',t->>'id','title',t->>'title','dueOn',t->'dueOn','status',t->>'status','phase',c.phase,'phases',(select jsonb_agg(scope) from public.project_effective_task_phases(p_request_id,t) scope),
  'dependsOn',c.depends_on,'dependencyComplete',(c.depends_on is null or exists(select 1 from jsonb_array_elements(project.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done')),
  'blockerOwner',c.blocker_owner,'clientNote',c.client_note,'serviceId',c.service_id,'controlRevision',c.revision,'responsibleSide',c.owner_type,'owningSide','client','canProgress',false) order by t->>'title'),'[]'::jsonb) into items
 from jsonb_array_elements(project.body->'tasks') t join public.project_task_controls c on c.request_id=p_request_id and c.task_id=t->>'id' join public.project_task_origins o on o.request_id=p_request_id and o.task_id=c.task_id
 where o.owning_side='client' and c.owner_type<>'client' and coalesce((t->>'archived')::boolean,false)=false;
 return jsonb_set(result,'{tasks}',items);
end;$$;
revoke all on function public.client_project_work(uuid) from public,anon,service_role;
grant execute on function public.client_project_work(uuid) to authenticated;
create or replace function public.client_project_created_task_details(p_request uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.has_client_project(p_request) or not public.project_client_member_eligible(p_request,auth.uid()) then raise exception 'Verified client project access required' using errcode='42501';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('taskId',d.task_id,'description',d.description) order by d.created_at,d.task_id) from public.project_client_task_details d join public.project_task_controls c on c.request_id=d.request_id and c.task_id=d.task_id where d.request_id=p_request),'[]'::jsonb);
end;$$;

-- Existing client-request decisions remain admin actions on governed projects.
alter function public.staff_review_client_task_response(uuid,text,text,integer) rename to staff_review_client_task_response_before_authority;
revoke all on function public.staff_review_client_task_response_before_authority(uuid,text,text,integer) from public,anon,authenticated,service_role;
create function public.staff_review_client_task_response(p_response uuid,p_action text,p_note text,p_revision integer) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.project_client_task_responses r join public.project_task_governance g on g.request_id=r.request_id where r.id=p_response) and not public.is_project_workflow_admin() then raise exception 'Workspace admin required for task review decisions' using errcode='42501';end if;
 return public.staff_review_client_task_response_before_authority(p_response,p_action,p_note,p_revision);
end;$$;
revoke all on function public.staff_review_client_task_response(uuid,text,text,integer) from public,anon,service_role;
grant execute on function public.staff_review_client_task_response(uuid,text,text,integer) to authenticated;

alter function public.staff_set_client_task_policy(uuid,text,boolean,text,integer) rename to staff_set_client_task_policy_before_authority;
revoke all on function public.staff_set_client_task_policy_before_authority(uuid,text,boolean,text,integer) from public,anon,authenticated,service_role;
create function public.staff_set_client_task_policy(p_request uuid,p_task text,p_allow boolean,p_guidance text,p_revision integer) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.project_task_governance where request_id=p_request) and not public.is_project_workflow_admin() then raise exception 'Workspace admin required for task review policy' using errcode='42501';end if;
 return public.staff_set_client_task_policy_before_authority(p_request,p_task,p_allow,p_guidance,p_revision);
end;$$;
revoke all on function public.staff_set_client_task_policy(uuid,text,boolean,text,integer) from public,anon,service_role;
grant execute on function public.staff_set_client_task_policy(uuid,text,boolean,text,integer) to authenticated;
create function public.guard_task_tag_catalog_authority() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if not public.task_authority_maintenance() and exists(select 1 from public.project_task_governance where request_id=new.request_id) and not public.is_project_workflow_admin() then raise exception 'Project tag changes require admin approval' using errcode='42501';end if;
 return new;
end;$$;
revoke all on function public.guard_task_tag_catalog_authority() from public,anon,authenticated,service_role;
create trigger zz_task_tag_catalog_authority before update on public.project_task_tag_catalog for each row execute function public.guard_task_tag_catalog_authority();

-- Keep the same view OID so notifications and waiting-source readers include
-- task-change proposals without weakening the original queue's RLS.
do $migration$
declare definition text;
begin
 definition:=rtrim(pg_get_viewdef('public.staff_approvals'::regclass,true),E';\n ');
 execute 'create or replace view public.staff_approvals with(security_invoker=true) as ('||definition||') union all select c.request_id,''task_change''::text,c.id::text,c.version,''Task changes: ''||(c.candidate_task->>''title''),c.status,''staff''::text,false,''Review proposed task changes''::text,2,c.submitted_at,true,''task_change:''||c.id::text,p.body->>''title'',lower(p.body->>''title''),p.public_id,p.state,coalesce(l.phase,''discovery'') from public.project_task_change_proposals c join public.inquiry_projects p on p.request_id=c.request_id left join public.project_lifecycle l on l.request_id=p.request_id where c.status=''pending'' and p.state<>''completed'' and (select public.is_inquiry_staff())';
end;$migration$;
commit;
