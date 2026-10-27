-- R4c phase completion hotfix: staff may explicitly close an active phase with no linked milestones,
-- but phases with unfinished linked milestones or active work remain guarded.
-- Requires migration 035. Replaces only the existing staff RPC; prior privileges are retained.
begin;
create or replace function public.manage_project_phase_state(p_request uuid,p_phase text,p_status text,p_revision integer,p_reason text)
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
 if p_status<>'active' and active_count>0 then return jsonb_build_object('result','active_work','activeCount',active_count);end if;
 if p_status='completed' then
   if old_status<>'active' then return jsonb_build_object('result','must_activate');end if;
   select count(*) into linked_count from public.project_milestone_phases
     where request_id=p_request and phase=p_phase;
   select count(*) into incomplete_count from public.project_milestone_phases link
     where link.request_id=p_request and link.phase=p_phase and not exists(
       select 1 from jsonb_array_elements(project_row.body->'milestones') m
       where m.value->>'id'=link.milestone_id and m.value->>'status'='done'
     );
   if incomplete_count>0 then return jsonb_build_object('result','milestones_incomplete','incompleteCount',incomplete_count);end if;
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
commit;
