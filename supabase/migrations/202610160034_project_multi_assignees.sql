-- R4b. Staff-managed responsible side, verified multi-assignees and client project managers.
-- Requires project migrations through 202610160033_project_verified_roster.sql.
begin;

create table public.project_task_members (
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 task_id text not null check(length(btrim(task_id)) between 1 and 100),
 user_id uuid not null references auth.users(id) on delete cascade,
 side text not null check(side in ('bivi','client')),
 added_by uuid references auth.users(id) on delete set null,
 added_at timestamptz not null default now(),
 primary key(request_id,task_id,user_id)
);
create index project_task_members_user on public.project_task_members(user_id,request_id);

create table public.project_client_managers (
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 added_by uuid references auth.users(id) on delete set null,
 added_at timestamptz not null default now(),
 primary key(request_id,user_id)
);

create table public.project_assignment_revisions (
 request_id uuid primary key references public.inquiry_projects(request_id) on delete cascade,
 revision integer not null default 1 check(revision > 0)
);

create table public.project_assignment_events (
 id bigint generated always as identity primary key,
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 task_id text,
 action text not null check(action in ('task_assignees','client_managers')),
 before_state jsonb not null,
 after_state jsonb not null,
 actor uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
create index project_assignment_events_by_project on public.project_assignment_events(request_id,id desc);

alter table public.project_task_members enable row level security;
alter table public.project_client_managers enable row level security;
alter table public.project_assignment_events enable row level security;
alter table public.project_assignment_revisions enable row level security;
revoke all on public.project_task_members,public.project_client_managers,public.project_assignment_events,public.project_assignment_revisions from public,anon,authenticated,service_role;
grant select on public.project_task_members,public.project_client_managers,public.project_assignment_events,public.project_assignment_revisions to authenticated;
create policy task_members_staff_read on public.project_task_members for select to authenticated using((select public.is_inquiry_staff()));
create policy client_managers_staff_read on public.project_client_managers for select to authenticated using((select public.is_inquiry_staff()));
create policy assignment_events_staff_read on public.project_assignment_events for select to authenticated using((select public.is_inquiry_staff()));
create policy assignment_revision_staff_read on public.project_assignment_revisions for select to authenticated using((select public.is_inquiry_staff()));

-- Do not assume clients from an unrelated company are project members.
create function public.project_client_member_eligible(p_request uuid,p_user uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists (
  select 1 from public.project_clients pc
  join public.inquiry_projects p on p.request_id=pc.request_id
  left join public.inquiry_client_organizations ico on ico.request_id=p.request_id
  join public.client_organization_members m on m.user_id=pc.user_id
    and m.organization_id=coalesce(p.company_id,ico.organization_id) and m.active
  where pc.request_id=p_request and pc.user_id=p_user and pc.active
 );
$$;
revoke all on function public.project_client_member_eligible(uuid,uuid) from public,anon,authenticated,service_role;

-- Keep previously verified single Bivi assignments. Do not invent client assignees.
insert into public.project_task_members(request_id,task_id,user_id,side)
select c.request_id,c.task_id,c.assigned_staff_id,'bivi'
from public.project_task_controls c join public.inquiry_staff s on s.user_id=c.assigned_staff_id and s.active
where c.owner_type='bivi' and c.assigned_staff_id is not null
on conflict do nothing;

create function public.staff_project_assignment_workspace(p_request uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare task_rows jsonb; staff_rows jsonb; client_rows jsonb; manager_rows jsonb; company_row jsonb;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if not exists(select 1 from public.inquiry_projects where request_id=p_request) then raise exception 'Project not found' using errcode='22023';end if;
 select coalesce(jsonb_agg(to_jsonb(t) order by t.task_id),'[]'::jsonb) into task_rows from (
  select c.task_id,c.owner_type as side,c.revision,
    coalesce((select jsonb_agg(tm.user_id order by tm.added_at,tm.user_id) from public.project_task_members tm where tm.request_id=c.request_id and tm.task_id=c.task_id),'[]'::jsonb) as assignees
  from public.project_task_controls c where c.request_id=p_request
 ) t;
 select coalesce(jsonb_agg(to_jsonb(s) order by s.label),'[]'::jsonb) into staff_rows from (
  select st.user_id as id,coalesce(nullif(btrim(u.raw_user_meta_data->>'full_name'),''),nullif(u.email,''),st.public_id) as label,st.avatar_path
  from public.inquiry_staff st join auth.users u on u.id=st.user_id where st.active order by st.user_id limit 250
 ) s;
 select coalesce(jsonb_agg(to_jsonb(c) order by c.label),'[]'::jsonb) into client_rows from (
  select pc.user_id as id,coalesce(nullif(btrim(concat_ws(' ',nullif(cp.first_name,''),nullif(cp.last_name,''))),''),'Client member') as label,cp.avatar_path
  from public.project_clients pc left join public.client_profiles cp on cp.user_id=pc.user_id
  where pc.request_id=p_request and pc.active and public.project_client_member_eligible(p_request,pc.user_id)
 ) c;
 select (select jsonb_build_object('id',o.id,'name',o.name,'logo_path',cp.logo_path)
 from public.inquiry_projects p left join public.inquiry_client_organizations ico on ico.request_id=p.request_id
 join public.client_organizations o on o.id=coalesce(p.company_id,ico.organization_id)
 left join public.company_profiles cp on cp.organization_id=o.id where p.request_id=p_request) into company_row;
 select coalesce(jsonb_agg(user_id),'[]'::jsonb) into manager_rows from public.project_client_managers m
 where m.request_id=p_request and public.project_client_member_eligible(p_request,m.user_id);
 return jsonb_build_object('tasks',task_rows,'staff',staff_rows,'clients',client_rows,'managers',manager_rows,'assignmentRevision',coalesce((select revision from public.project_assignment_revisions where request_id=p_request),1),'currentStaffId',auth.uid(),'clientCompany',company_row);
end;$$;
revoke all on function public.staff_project_assignment_workspace(uuid) from public,anon,service_role;
grant execute on function public.staff_project_assignment_workspace(uuid) to authenticated;

-- Server-validated, revision-checked, atomic staff actions. No direct table writes.
create function public.staff_project_assign_members(
 p_request uuid,p_action text,p_task_id text,p_side text,p_user_ids uuid[],p_revision integer
) returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.project_task_controls%rowtype; p public.inquiry_projects%rowtype; before_value jsonb; after_value jsonb;
 v uuid; n integer; old_managers jsonb; expected_manager_revision integer;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if p_action is null or p_action not in ('task','managers') or p_user_ids is null or coalesce(array_length(p_user_ids,1),0)>12 then
   raise exception 'Invalid assignment action' using errcode='22023';
 end if;
 if exists(select 1 from unnest(p_user_ids) as items(uid) where items.uid is null) or
    (select count(*) from unnest(p_user_ids)) <> (select count(distinct items.uid) from unnest(p_user_ids) as items(uid)) then
   raise exception 'Duplicate or invalid user' using errcode='22023';
 end if;
 select * into p from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if p.state='completed' then return jsonb_build_object('result','locked');end if;
 if p_action='managers' then
   if p_revision is null or p_revision < 1 then raise exception 'Missing manager revision' using errcode='22023';end if;
   insert into public.project_assignment_revisions(request_id) values(p_request) on conflict do nothing;
   select revision into expected_manager_revision from public.project_assignment_revisions where request_id=p_request for update;
   if expected_manager_revision<>p_revision then return jsonb_build_object('result','conflict');end if;
   if coalesce(array_length(p_user_ids,1),0)>5 then raise exception 'Too many project managers' using errcode='22023';end if;
   foreach v in array p_user_ids loop
     if not public.project_client_member_eligible(p_request,v) then raise exception 'Client member is not eligible' using errcode='22023';end if;
   end loop;
   select coalesce(jsonb_agg(m.user_id order by m.user_id),'[]'::jsonb) into old_managers from public.project_client_managers m where request_id=p_request;
   select coalesce(jsonb_agg(ids.uid order by ids.uid),'[]'::jsonb) into after_value from unnest(p_user_ids) as ids(uid);
   if old_managers is distinct from after_value then
     delete from public.project_client_managers where request_id=p_request;
     insert into public.project_client_managers(request_id,user_id,added_by)
       select p_request,ids.uid,auth.uid() from unnest(p_user_ids) as ids(uid);
     update public.project_assignment_revisions set revision=revision+1 where request_id=p_request;
     insert into public.project_assignment_events(request_id,action,before_state,after_state,actor) values(p_request,'client_managers',old_managers,after_value,auth.uid());
   end if;
   return jsonb_build_object('result','saved');
 end if;
 if p_task_id is null or length(btrim(p_task_id)) not between 1 and 100 or p_side is null or p_side not in ('bivi','client') or p_revision is null or p_revision<1 then raise exception 'Invalid task assignment' using errcode='22023';end if;
 select * into c from public.project_task_controls where request_id=p_request and task_id=p_task_id for update;
 if not found or not exists(select 1 from jsonb_array_elements(p.body->'tasks') task where task->>'id'=p_task_id) then return jsonb_build_object('result','not_found');end if;
 if c.revision<>p_revision then return jsonb_build_object('result','conflict');end if;
 foreach v in array p_user_ids loop
   if p_side='bivi' then
     if not exists(select 1 from public.inquiry_staff where user_id=v and active) then raise exception 'Choose active Bivi staff' using errcode='22023';end if;
   elsif not public.project_client_member_eligible(p_request,v) then
     raise exception 'Choose an active client member for this project' using errcode='22023';
   end if;
 end loop;
 select jsonb_build_object('side',c.owner_type,'users',coalesce(
  (select jsonb_agg(m.user_id order by m.added_at,m.user_id) from public.project_task_members m where m.request_id=p_request and m.task_id=p_task_id),
  '[]'::jsonb)) into before_value;
 delete from public.project_task_members where request_id=p_request and task_id=p_task_id;
 insert into public.project_task_members(request_id,task_id,user_id,side,added_by)
 select p_request,p_task_id,x,p_side,auth.uid() from unnest(p_user_ids) x;
 -- Old My Tasks remains functional for the first Bivi assignee. Remaining assignees
 -- are authoritative in project_task_members and will join My Tasks in a later slice.
 update public.project_task_controls set owner_type=p_side,
  assigned_staff_id=case when p_side='bivi' then p_user_ids[1] else null end,
  revision=revision+1,updated_at=now(),updated_by=auth.uid()
 where request_id=p_request and task_id=p_task_id returning * into c;
 after_value:=jsonb_build_object('side',p_side,'users',to_jsonb(p_user_ids));
 insert into public.project_assignment_events(request_id,task_id,action,before_state,after_state,actor)
 values(p_request,p_task_id,'task_assignees',before_value,after_value,auth.uid());
 return jsonb_build_object('result','saved','revision',c.revision);
end;$$;
revoke all on function public.staff_project_assign_members(uuid,text,text,text,uuid[],integer) from public,anon,service_role;
grant execute on function public.staff_project_assign_members(uuid,text,text,text,uuid[],integer) to authenticated;
commit;
