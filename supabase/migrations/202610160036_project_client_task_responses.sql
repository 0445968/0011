-- R4d: audited client requests and staff-only approval of client task completion.
-- Requires migrations 001-035. No client table write privileges are granted.
begin;

create table public.project_task_client_policies (
 request_id uuid not null,
 task_id text not null,
 allow_decline boolean not null default false,
 decline_guidance text not null default '' check(length(decline_guidance)<=2000),
 revision integer not null default 1 check(revision>0),
 updated_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now(),
 primary key(request_id,task_id),
 foreign key(request_id,task_id) references public.project_task_controls(request_id,task_id) on delete cascade
);
create table public.project_client_task_responses (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 task_id text not null check(length(btrim(task_id)) between 1 and 100),
 kind text not null check(kind in ('completion','clarification','postponement','modification','decline')),
 note text not null check(length(btrim(note)) between 5 and 2000),
 status text not null default 'pending' check(status in ('pending','accepted','rejected')),
 submitted_by uuid references auth.users(id) on delete set null,
 submitted_at timestamptz not null default now(),
 reviewed_by uuid references auth.users(id) on delete set null,
 reviewed_at timestamptz,
 review_note text not null default '' check(length(review_note)<=2000),
 constraint client_response_review_consistency check (
   (status='pending' and reviewed_at is null and reviewed_by is null) or
   (status<>'pending' and reviewed_at is not null and reviewed_by is not null)
 )
);
create table public.project_task_client_policy_history (
 id bigint generated always as identity primary key,
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 task_id text not null,
 previous_policy jsonb not null,
 next_policy jsonb not null,
 actor uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
create index project_task_client_policy_history_project on public.project_task_client_policy_history(request_id,id desc);
create unique index project_client_task_one_pending on public.project_client_task_responses(request_id,task_id) where status='pending';
create index project_client_task_response_history on public.project_client_task_responses(request_id,submitted_at desc,id);
create index project_client_task_response_submitter on public.project_client_task_responses(submitted_by,request_id);

alter table public.project_task_client_policies enable row level security;
alter table public.project_client_task_responses enable row level security;
alter table public.project_task_client_policy_history enable row level security;
revoke all on public.project_task_client_policies,public.project_client_task_responses,public.project_task_client_policy_history from public,anon,authenticated,service_role;
grant select on public.project_task_client_policies,public.project_client_task_responses,public.project_task_client_policy_history to authenticated;
create policy task_client_policy_staff_read on public.project_task_client_policies for select to authenticated using ((select public.is_inquiry_staff()));
create policy client_task_response_staff_read on public.project_client_task_responses for select to authenticated using ((select public.is_inquiry_staff()));
create policy client_task_policy_history_staff_read on public.project_task_client_policy_history for select to authenticated using ((select public.is_inquiry_staff()));
create policy client_task_response_own_read on public.project_client_task_responses for select to authenticated using (submitted_by=auth.uid() and public.has_client_project(request_id));

-- Project-scoped eligibility: assigned client OR designated client manager.
-- An unassigned legacy client task remains accessible to verified project-company members.
create function public.client_can_respond_to_task(p_request uuid,p_task text,p_user uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select p_user=auth.uid() and public.project_client_member_eligible(p_request,p_user)
 and exists(select 1 from public.project_task_controls c where c.request_id=p_request and c.task_id=p_task and c.owner_type='client')
 and (
   exists(select 1 from public.project_task_members m where m.request_id=p_request and m.task_id=p_task and m.user_id=p_user and m.side='client')
   or exists(select 1 from public.project_client_managers m where m.request_id=p_request and m.user_id=p_user)
   or not exists(select 1 from public.project_task_members m where m.request_id=p_request and m.task_id=p_task and m.side='client')
 );
$$;
revoke all on function public.client_can_respond_to_task(uuid,text,uuid) from public,anon,authenticated,service_role;

-- Private server-authoritative overview. Client reads contain only their own responses.
create function public.project_task_response_workspace(p_request uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare staff boolean :=public.is_inquiry_staff(); actor uuid:=auth.uid(); policies jsonb; responses jsonb; version integer;
begin
 if actor is null or (not staff and not public.has_client_project(p_request)) then
   raise exception 'Project access required' using errcode='42501'; end if;
 select revision into version from public.inquiry_projects where request_id=p_request;
 if version is null then return null;end if;
 select coalesce(jsonb_agg(jsonb_build_object(
   'taskId',c.task_id,'allowed',case when staff then true else public.client_can_respond_to_task(p_request,c.task_id,actor) end,
   'allowDecline',coalesce(p.allow_decline,false),
   'declineGuidance',coalesce(p.decline_guidance,''),'revision',coalesce(p.revision,0)
 ) order by c.task_id),'[]'::jsonb) into policies
 from public.project_task_controls c left join public.project_task_client_policies p
 on p.request_id=c.request_id and p.task_id=c.task_id
 where c.request_id=p_request and c.owner_type='client'
 and (staff or public.client_can_respond_to_task(p_request,c.task_id,actor));
 select coalesce(jsonb_agg(jsonb_build_object(
  'id',r.id,'taskId',r.task_id,'kind',r.kind,'note',r.note,'status',r.status,
  'submittedAt',r.submitted_at,'submittedBy',case when staff then r.submitted_by else null end,
  'reviewNote',r.review_note,'reviewedAt',r.reviewed_at
 ) order by r.submitted_at desc,r.id),'[]'::jsonb) into responses
 from (select * from public.project_client_task_responses
       where request_id=p_request and (staff or submitted_by=actor)
       order by submitted_at desc,id limit 150) r;
 return jsonb_build_object('projectRevision',version,'policies',policies,'responses',responses);
end;$$;
revoke all on function public.project_task_response_workspace(uuid) from public,anon,service_role;
grant execute on function public.project_task_response_workspace(uuid) to authenticated;

-- Clients only submit requests. They never mutate the project task's completed state.
create function public.submit_project_client_task_response(
 p_request uuid,p_task text,p_kind text,p_note text,p_revision integer
) returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.inquiry_projects%rowtype;c public.project_task_controls%rowtype;
 task jsonb; response_id uuid; allow_decline boolean; brief_status text;
begin
 if auth.uid() is null or p_kind is null or p_kind not in ('completion','clarification','postponement','modification','decline')
    or p_note is null or length(btrim(p_note)) not between 5 and 2000 or p_revision is null or p_revision<1
    or p_task is null or length(btrim(p_task)) not between 1 and 100 then
  raise exception 'Invalid client response' using errcode='22023';end if;
 if not public.client_can_respond_to_task(p_request,p_task,auth.uid()) then
  raise exception 'Task response not permitted' using errcode='42501';end if;
 select * into p from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if p.state<>'active' then return jsonb_build_object('result','locked');end if;
 if p.revision<>p_revision then return jsonb_build_object('result','conflict');end if;
 select * into c from public.project_task_controls where request_id=p_request and task_id=p_task;
 if not found or c.owner_type<>'client' then return jsonb_build_object('result','not_found');end if;
 select value into task from jsonb_array_elements(p.body->'tasks') where value->>'id'=p_task;
 if task is null then return jsonb_build_object('result','not_found');end if;
 if task->>'status'='done' and p_kind='completion' then return jsonb_build_object('result','already_done');end if;
 if p_kind='decline' then
   select coalesce(t.allow_decline,false) into allow_decline
   from public.project_task_client_policies t where t.request_id=p_request and t.task_id=p_task;
   if not coalesce(allow_decline,false) then return jsonb_build_object('result','decline_disabled');end if;
   if length(btrim(p_note))<15 then return jsonb_build_object('result','explanation_required');end if;
 end if;
 if p_kind='completion' and (c.blocker_owner is not null or task->>'status'='blocked' or
   (c.depends_on is not null and not exists(select 1 from jsonb_array_elements(p.body->'tasks') d
     where d->>'id'=c.depends_on and d->>'status'='done'))) then
   return jsonb_build_object('result','blocked');end if;
 if exists(select 1 from public.project_client_task_responses r
           where r.request_id=p_request and r.task_id=p_task and r.status='pending') then
  return jsonb_build_object('result','pending');end if;
 insert into public.project_client_task_responses(request_id,task_id,kind,note,submitted_by)
 values(p_request,p_task,p_kind,btrim(p_note),auth.uid()) returning id into response_id;
 return jsonb_build_object('result','saved','id',response_id);
end;$$;
revoke all on function public.submit_project_client_task_response(uuid,text,text,text,integer) from public,anon,service_role;
grant execute on function public.submit_project_client_task_response(uuid,text,text,text,integer) to authenticated;

-- Staff sets an explicit decline policy. Revisions cover policy edits independent of project drafts.
create function public.staff_set_client_task_policy(
 p_request uuid,p_task text,p_allow boolean,p_guidance text,p_revision integer
) returns jsonb language plpgsql security definer set search_path='' as $$
declare project_row public.inquiry_projects%rowtype; policy_row public.project_task_client_policies%rowtype; next_revision integer;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff required' using errcode='42501';end if;
 if p_allow is null or p_guidance is null or length(p_guidance)>2000 or p_revision is null or p_revision<0 then
  raise exception 'Invalid policy' using errcode='22023';end if;
 select * into project_row from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if project_row.state='completed' then return jsonb_build_object('result','locked');end if;
 if not exists(select 1 from public.project_task_controls where request_id=p_request and task_id=p_task and owner_type='client') then
  return jsonb_build_object('result','not_found');end if;
 select * into policy_row from public.project_task_client_policies where request_id=p_request and task_id=p_task for update;
 if coalesce(policy_row.revision,0)<>p_revision then return jsonb_build_object('result','conflict');end if;
 if p_allow and length(btrim(p_guidance))<15 then return jsonb_build_object('result','guidance_required');end if;
 if policy_row.request_id is not null and policy_row.allow_decline=p_allow and policy_row.decline_guidance=btrim(p_guidance) then
   return jsonb_build_object('result','saved','revision',p_revision);end if;
 insert into public.project_task_client_policies(request_id,task_id,allow_decline,decline_guidance,revision,updated_by)
 values(p_request,p_task,p_allow,btrim(p_guidance),1,auth.uid())
 on conflict(request_id,task_id) do update set allow_decline=excluded.allow_decline,decline_guidance=excluded.decline_guidance,
 revision=public.project_task_client_policies.revision+1,updated_by=auth.uid(),updated_at=now()
 returning revision into next_revision;
 insert into public.project_task_client_policy_history(request_id,task_id,previous_policy,next_policy,actor)
 values(p_request,p_task,jsonb_build_object('allowDecline',coalesce(policy_row.allow_decline,false),'guidance',coalesce(policy_row.decline_guidance,''),'revision',coalesce(policy_row.revision,0)),
   jsonb_build_object('allowDecline',p_allow,'guidance',btrim(p_guidance),'revision',next_revision),auth.uid());
 return jsonb_build_object('result','saved','revision',next_revision);
end;$$;
revoke all on function public.staff_set_client_task_policy(uuid,text,boolean,text,integer) from public,anon,service_role;
grant execute on function public.staff_set_client_task_policy(uuid,text,boolean,text,integer) to authenticated;

-- Review completed work without accepting client's declaration as the project source of truth.
create function public.staff_review_client_task_response(
 p_response uuid,p_action text,p_note text,p_revision integer
) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.project_client_task_responses%rowtype; p public.inquiry_projects%rowtype;
 c public.project_task_controls%rowtype; task jsonb; updated_tasks jsonb; result_revision integer;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff required' using errcode='42501';end if;
 if p_action is null or p_action not in ('accept','reject') or p_note is null or length(p_note)>2000 or p_revision is null or p_revision<1 then
   raise exception 'Invalid review action' using errcode='22023';end if;
 select * into r from public.project_client_task_responses where id=p_response;
 if not found then return jsonb_build_object('result','not_found');end if;
 select * into p from public.inquiry_projects where request_id=r.request_id for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 select * into r from public.project_client_task_responses where id=p_response for update;
 if r.status<>'pending' then return jsonb_build_object('result','already_reviewed');end if;
 if p.revision<>p_revision then return jsonb_build_object('result','conflict');end if;
 if p.state='completed' then return jsonb_build_object('result','locked');end if;
 select * into c from public.project_task_controls where request_id=r.request_id and task_id=r.task_id;
 if not found or c.owner_type<>'client' then return jsonb_build_object('result','stale');end if;
 select value into task from jsonb_array_elements(p.body->'tasks') where value->>'id'=r.task_id;
 if task is null then return jsonb_build_object('result','stale');end if;
 if p_action='accept' and r.kind='completion' then
   if exists(select 1 from public.project_phase_states phase where phase.request_id=r.request_id and phase.phase=c.phase and phase.status='completed') then
     return jsonb_build_object('result','phase_closed');end if;
   if task->>'status'='done' then return jsonb_build_object('result','already_done');end if;
   if c.blocker_owner is not null or task->>'status'='blocked' or (c.depends_on is not null and not exists(
     select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done'
   )) then return jsonb_build_object('result','blocked');end if;
   select jsonb_agg(case when t.value->>'id'=r.task_id then jsonb_set(t.value,'{status}','"done"'::jsonb) else t.value end order by t.ord)
   into updated_tasks from jsonb_array_elements(p.body->'tasks') with ordinality t(value,ord);
   update public.inquiry_projects set body=jsonb_set(p.body,'{tasks}',updated_tasks,false),revision=revision+1,
     updated_at=now(),updated_by=auth.uid() where request_id=r.request_id returning revision into result_revision;
   insert into public.project_task_history(request_id,task_id,action,snapshot,actor)
   values(r.request_id,r.task_id,'client_update',jsonb_build_object('kind','staff_completion_approval','responseId',r.id,'task',task),auth.uid());
 else
   result_revision:=p.revision;
 end if;
 update public.project_client_task_responses set status=case when p_action='accept' then 'accepted' else 'rejected' end,
   reviewed_by=auth.uid(),reviewed_at=now(),review_note=btrim(p_note) where id=r.id;
 return jsonb_build_object('result','saved','projectRevision',result_revision);
end;$$;
revoke all on function public.staff_review_client_task_response(uuid,text,text,integer) from public,anon,service_role;
grant execute on function public.staff_review_client_task_response(uuid,text,text,integer) to authenticated;

-- SECURITY: the previous client task RPC could mark tasks completed immediately.
-- Revoke that old entry point and expose a guarded wrapper. The legacy implementation
-- remains callable *only by the definer*, for non-completion status updates.
alter function public.manage_client_project_task(uuid,jsonb) rename to manage_client_project_task_r4c_legacy;
revoke all on function public.manage_client_project_task_r4c_legacy(uuid,jsonb) from public,anon,authenticated,service_role;
create function public.manage_client_project_task(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if p_command->>'status'='done' then return jsonb_build_object('result','staff_review_required');end if;
 if not public.client_can_respond_to_task(p_request_id,coalesce(p_command->>'taskId',''),auth.uid()) then
  return jsonb_build_object('result','not_assigned');end if;
 return public.manage_client_project_task_r4c_legacy(p_request_id,p_command);
end;$$;
revoke all on function public.manage_client_project_task(uuid,jsonb) from public,anon,service_role;
grant execute on function public.manage_client_project_task(uuid,jsonb) to authenticated;

commit;
