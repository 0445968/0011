-- R4c. Explicit parallel project phases, auditable transitions, milestone/task synchronization.
-- Requires migrations 001–034. Legacy lifecycle remains authoritative for existing publication gates.
begin;

create table public.project_phase_states (
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 phase text not null check (phase in ('inquiry','proposal-onboarding','discovery','direction','production','review','qa','delivery','handoff')),
 status text not null default 'planning' check (status in ('planning','active','completed')),
 revision integer not null default 1 check (revision > 0),
 activated_at timestamptz,
 completed_at timestamptz,
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id) on delete set null,
 primary key(request_id,phase),
 constraint phase_completion_evidence check(status <> 'completed' or (activated_at is not null and completed_at is not null))
);
create index project_phase_states_active on public.project_phase_states(request_id,status);
create table public.project_phase_status_history (
 id bigint generated always as identity primary key,
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 phase text not null,
 previous_status text not null,
 next_status text not null,
 revision integer not null,
 reason text not null default '' check(length(reason) <= 2000),
 actor uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
create index phase_history_project on public.project_phase_status_history(request_id,id desc);
alter table public.project_phase_states enable row level security;
alter table public.project_phase_status_history enable row level security;
revoke all on public.project_phase_states,public.project_phase_status_history from public,anon,authenticated,service_role;
grant select on public.project_phase_states,public.project_phase_status_history to authenticated;
create policy phase_states_staff_read on public.project_phase_states for select to authenticated using ((select public.is_inquiry_staff()));
create policy phase_history_staff_read on public.project_phase_status_history for select to authenticated using ((select public.is_inquiry_staff()));

-- Visited history proves previous activity, NOT approval. Do not infer phase completion.
insert into public.project_phase_states(request_id,phase,status,activated_at,updated_at)
select h.request_id,h.phase,'planning',min(h.created_at),min(h.created_at)
from (
 select request_id,previous_phase as phase,created_at from public.project_lifecycle_history
 union all select request_id,next_phase as phase,created_at from public.project_lifecycle_history
) h group by h.request_id,h.phase
on conflict do nothing;
insert into public.project_phase_states(request_id,phase,status,activated_at,updated_at)
select request_id,phase,'active',updated_at,updated_at from public.project_lifecycle
on conflict(request_id,phase) do update
 set status='active',activated_at=coalesce(public.project_phase_states.activated_at,excluded.activated_at),
     updated_at=excluded.updated_at;

-- Shared server-owned derivation: a milestone with any active/blocked tasks is In progress.
-- Completion remains an explicitly reviewed action; completed milestones never auto-reopen.
create function public.project_sync_milestone_statuses() returns trigger
language plpgsql security definer set search_path='' as $$
declare b jsonb; m jsonb; tasks jsonb; next_status text; index_number integer := 0;
begin
 if old.body is not distinct from new.body then return new; end if;
 b := new.body;
 for m in select value from jsonb_array_elements(b->'milestones') loop
   if m->>'status' = 'done' then
     if coalesce((select old_m.value->>'status' from jsonb_array_elements(old.body->'milestones') old_m
       where old_m.value->>'id'=m->>'id'),'planned') <> 'done' then
       if not exists(select 1 from jsonb_array_elements(b->'tasks') t where t.value->>'milestoneId'=m->>'id')
         or exists(select 1 from jsonb_array_elements(b->'tasks') t
           where t.value->>'milestoneId'=m->>'id' and t.value->>'status'<>'done') then
         raise exception 'Review and complete all milestone tasks first' using errcode='23514';
       end if;
     elsif exists(
       select 1 from jsonb_array_elements(b->'tasks') t
       join jsonb_array_elements(old.body->'tasks') previous on previous.value->>'id'=t.value->>'id'
       where t.value->>'milestoneId'=m->>'id' and previous.value->>'status'='done'
         and t.value->>'status'<>'done'
     ) then
       raise exception 'Reopen the completed milestone before reopening tasks' using errcode='23514';
     end if;
   else
     select coalesce(jsonb_agg(t.value),'[]'::jsonb) into tasks
       from jsonb_array_elements(b->'tasks') t where t.value->>'milestoneId' = m->>'id';
     next_status := case when exists(
       select 1 from jsonb_array_elements(tasks) t
       where t.value->>'status' in ('doing','blocked')
     ) then 'in_progress' else 'planned' end;
     if m->>'status' is distinct from next_status then
       b := jsonb_set(b,array['milestones',index_number::text,'status'],to_jsonb(next_status),false);
     end if;
   end if;
   index_number := index_number + 1;
 end loop;
 new.body := b;
 return new;
end;$$;
revoke all on function public.project_sync_milestone_statuses() from public,anon,authenticated,service_role;
create trigger sync_project_milestones_before_update before update of body on public.inquiry_projects
 for each row execute function public.project_sync_milestone_statuses();

-- Task starts activate ONLY the task's canonical control phase, not every phase on a
-- multi-phase milestone. Once explicitly Active, other phases remain independently Active.
create function public.project_activate_work_phases() returns trigger
language plpgsql security definer set search_path='' as $$
declare phase_name text; task_row jsonb; previous_task jsonb;
begin
 if new.body is not distinct from old.body then return new; end if;
 for task_row in select value from jsonb_array_elements(new.body->'tasks') loop
   if task_row->>'status' not in ('doing','blocked') then continue; end if;
   select value into previous_task from jsonb_array_elements(old.body->'tasks') old_tasks(value)
     where value->>'id' = task_row->>'id';
   if previous_task->>'status' in ('doing','blocked') then continue; end if;
   select phase into phase_name from public.project_task_controls
     where request_id=new.request_id and task_id=task_row->>'id';
   if phase_name is null then continue; end if;
   if exists(select 1 from public.project_phase_states p where p.request_id=new.request_id and p.phase=phase_name and p.status='completed') then
     raise exception 'Reopen the completed phase before starting its tasks' using errcode='23514';
   end if;
   insert into public.project_phase_states(request_id,phase,status,activated_at,updated_by)
     values(new.request_id,phase_name,'active',now(),auth.uid())
   on conflict(request_id,phase) do update set status='active',revision=public.project_phase_states.revision+1,
     activated_at=coalesce(public.project_phase_states.activated_at,now()),completed_at=null,updated_at=now(),updated_by=auth.uid()
   where public.project_phase_states.status='planning';
   if found then
     insert into public.project_phase_status_history(request_id,phase,previous_status,next_status,revision,reason,actor)
       select new.request_id,phase_name,'planning','active',p.revision,'Task started',auth.uid()
       from public.project_phase_states p where p.request_id=new.request_id and p.phase=phase_name;
   end if;
 end loop;
 return new;
end;$$;
revoke all on function public.project_activate_work_phases() from public,anon,authenticated,service_role;
create trigger activate_project_phases_after_update after update of body on public.inquiry_projects
 for each row execute function public.project_activate_work_phases();

-- New projects and legacy lifecycle transitions seed their canonical phase without
-- deactivating any other concurrently active phase.
create function public.project_activate_lifecycle_phase() returns trigger
language plpgsql security definer set search_path='' as $$
declare saved_revision integer;
begin
 insert into public.project_phase_states(request_id,phase,status,activated_at,updated_by)
 values(new.request_id,new.phase,'active',now(),auth.uid())
 on conflict(request_id,phase) do update
   set status='active',revision=public.project_phase_states.revision+1,
       activated_at=coalesce(public.project_phase_states.activated_at,now()),
       completed_at=null,updated_at=now(),updated_by=auth.uid()
 where public.project_phase_states.status='planning'
 returning revision into saved_revision;
 if saved_revision is not null then
   insert into public.project_phase_status_history(request_id,phase,previous_status,next_status,revision,reason,actor)
   values(new.request_id,new.phase,'planning','active',saved_revision,'Lifecycle phase entered',auth.uid());
 end if;
 return new;
end;$$;
revoke all on function public.project_activate_lifecycle_phase() from public,anon,authenticated,service_role;
create trigger activate_lifecycle_phase_on_entry after insert or update of phase on public.project_lifecycle
 for each row execute function public.project_activate_lifecycle_phase();

create function public.staff_project_phase_states(p_request uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb; version integer;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then
   raise exception 'Staff authorization required' using errcode='42501'; end if;
 select revision into version from public.inquiry_projects where request_id=p_request;
 if version is null then raise exception 'Project not found' using errcode='22023';end if;
 select coalesce(jsonb_agg(jsonb_build_object(
   'phase',names.phase,'status',coalesce(p.status,'planning'),'revision',coalesce(p.revision,0),
   'everActive',p.activated_at is not null,'activatedAt',p.activated_at,'completedAt',p.completed_at
 ) order by names.position),'[]'::jsonb) into result
 from (values (1,'inquiry'),(2,'proposal-onboarding'),(3,'discovery'),(4,'direction'),
   (5,'production'),(6,'review'),(7,'qa'),(8,'delivery'),(9,'handoff')) names(position,phase)
 left join public.project_phase_states p on p.request_id=p_request and p.phase=names.phase;
 return jsonb_build_object('projectRevision',version,'states',result);
end;$$;
revoke all on function public.staff_project_phase_states(uuid) from public,anon,service_role;
grant execute on function public.staff_project_phase_states(uuid) to authenticated;

create function public.manage_project_phase_state(p_request uuid,p_phase text,p_status text,p_revision integer,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare project_row public.inquiry_projects%rowtype;current_row public.project_phase_states%rowtype;
 linked_count integer;incomplete_count integer;active_count integer;next_revision integer;old_status text;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then
  raise exception 'Staff authorization required' using errcode='42501';end if;
 if public.project_phase_rank(p_phase)=999 or p_status not in ('planning','active','completed') or p_revision < 0
     or p_reason is null or length(p_reason)>2000 then
  raise exception 'Invalid phase command' using errcode='22023';end if;
 select * into project_row from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if project_row.state='completed' then return jsonb_build_object('result','locked');end if;
 select * into current_row from public.project_phase_states where request_id=p_request and phase=p_phase for update;
 if coalesce(current_row.revision,0)<>p_revision then return jsonb_build_object('result','conflict');end if;
 old_status:=coalesce(current_row.status,'planning');
 if old_status=p_status then return jsonb_build_object('result','saved','revision',p_revision);end if;
 select count(*) into active_count from public.project_task_controls c
 join lateral jsonb_array_elements(project_row.body->'tasks') task on task.value->>'id'=c.task_id
 where c.request_id=p_request and task.value->>'status' in ('doing','blocked')
   and (c.phase=p_phase or exists (
     select 1 from public.project_milestone_phases link
     where link.request_id=p_request and link.phase=p_phase
       and link.milestone_id=task.value->>'milestoneId'));
 if p_status<>'active' and active_count>0 then return jsonb_build_object('result','active_work');end if;
 if p_status='completed' then
   if old_status<>'active' then return jsonb_build_object('result','must_activate');end if;
   select count(*) into linked_count from public.project_milestone_phases
     where request_id=p_request and phase=p_phase;
   select count(*) into incomplete_count from public.project_milestone_phases link
     where link.request_id=p_request and link.phase=p_phase and not exists(
       select 1 from jsonb_array_elements(project_row.body->'milestones') m
       where m.value->>'id'=link.milestone_id and m.value->>'status'='done'
     );
   if linked_count=0 or incomplete_count>0 then return jsonb_build_object('result','milestones_incomplete');end if;
 end if;
 next_revision:=p_revision+1;
 insert into public.project_phase_states(request_id,phase,status,revision,activated_at,completed_at,updated_at,updated_by)
 values(p_request,p_phase,p_status,next_revision,
   case when p_status='active' then now() else null end,
   case when p_status='completed' then now() else null end,now(),auth.uid())
 on conflict(request_id,phase) do update set
   status=excluded.status,revision=excluded.revision,
   activated_at=case when excluded.status='active' then coalesce(public.project_phase_states.activated_at,now())
     else public.project_phase_states.activated_at end,
   completed_at=case when excluded.status='completed' then now() else null end,
   updated_at=now(),updated_by=auth.uid();
 insert into public.project_phase_status_history(request_id,phase,previous_status,next_status,revision,reason,actor)
 values(p_request,p_phase,old_status,p_status,next_revision,p_reason,auth.uid());
 return jsonb_build_object('result','saved','revision',next_revision);
end;$$;
revoke all on function public.manage_project_phase_state(uuid,text,text,integer,text) from public,anon,service_role;
grant execute on function public.manage_project_phase_state(uuid,text,text,integer,text) to authenticated;
commit;
