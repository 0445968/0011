begin;

-- Keep one staff-only source contract for displaying and revalidating client
-- dependencies. A client-owned task qualifies only when unfinished Bivi work
-- explicitly depends on it and the client task is currently actionable.
create function public.project_operational_waiting_sources(p_request uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare p public.inquiry_projects%rowtype; sources jsonb; diagnostics jsonb;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 select * into p from public.inquiry_projects where request_id=p_request;
 if not found then return jsonb_build_object('result','not_found','sources','[]'::jsonb,'diagnostics','[]'::jsonb); end if;

 with task_rows as (
   select t.value task,c.task_id,c.owner_type,c.phase,c.depends_on,c.blocker_owner
   from jsonb_array_elements(coalesce(p.body->'tasks','[]'::jsonb)) t(value)
   join public.project_task_controls c on c.request_id=p_request and c.task_id=t.value->>'id'
 ), dependency_candidates as (
   select source.task_id,source.task->>'title' title,source.task->>'status' task_status,source.phase,
     source.depends_on source_dependency,source.blocker_owner source_blocker,
     string_agg(distinct dependent.task->>'title',', ' order by dependent.task->>'title') dependent_titles,
     bool_or((source.depends_on is null or upstream.task->>'status'='done') and
       exists(select 1 from public.project_effective_task_phases(p_request,source.task) effective_phase(phase_name) join public.project_phase_states ps on ps.request_id=p_request and ps.phase=effective_phase.phase_name and ps.status='active')) phase_and_dependency_ready,
     bool_or(upstream.task is not null and upstream.task->>'status'='done') upstream_done
   from task_rows dependent
   join task_rows source on source.task_id=dependent.depends_on and source.owner_type='client'
   join jsonb_array_elements(coalesce(p.body->'tasks','[]'::jsonb)) dependent_json(value) on dependent_json.value->>'id'=dependent.task_id
   join jsonb_array_elements(coalesce(p.body->'tasks','[]'::jsonb)) source_json(value) on source_json.value->>'id'=source.task_id
   left join lateral (select d.value task from jsonb_array_elements(coalesce(p.body->'tasks','[]'::jsonb)) d(value) where d.value->>'id'=source.depends_on limit 1) upstream on true
   where dependent.owner_type='bivi' and dependent.blocker_owner='client'
     and dependent_json.value->>'status'<>'done' and source_json.value->>'status'<>'done'
   group by source.task_id,source.task,source.phase,source.depends_on,source.blocker_owner
 ),
 source_rows as (
   select 'approval'::text kind,a.approval_key::text source_id,a.title,
     a.source_status::text source_status,'Approval'::text type_label,a.action_label::text context,a.updated_at
   from public.staff_approvals a where a.request_id=p_request and a.waiting_on='client'
   union all
   select 'task_request',r.id::text,coalesce(t.value->>'title','Client task')||' · client request',
     'pending','Client action',r.kind, r.submitted_at
   from public.project_client_task_responses r
   left join lateral (select task.value from jsonb_array_elements(coalesce(p.body->'tasks','[]'::jsonb)) task(value) where task.value->>'id'=r.task_id limit 1) t on true
   where r.request_id=p_request and r.status='pending'
     and exists(select 1 from public.project_clients pc where pc.request_id=p_request and pc.user_id=r.submitted_by and pc.active)
   union all
   select 'client_task_dependency',d.task_id,d.title,d.task_status,'Client task dependency',
     'Blocks required Bivi work: '||d.dependent_titles,coalesce((select c.updated_at from public.project_task_controls c where c.request_id=p_request and c.task_id=d.task_id),p.updated_at)
   from dependency_candidates d
   where d.task_status<>'blocked' and d.source_blocker is null
     and (d.source_dependency is null or d.upstream_done)
     and d.phase_and_dependency_ready
     and exists(select 1 from public.project_clients pc where pc.request_id=p_request and pc.active)
 )
 select coalesce(jsonb_agg(jsonb_build_object('kind',s.kind,'source_id',s.source_id,'title',s.title,'source_status',s.source_status,'type',s.type_label,'context',s.context,'approval_key',s.source_id) order by s.updated_at desc), '[]'::jsonb)
 into sources from source_rows s;

 with task_rows as (
   select t.value task,c.task_id,c.owner_type,c.phase,c.depends_on,c.blocker_owner
   from jsonb_array_elements(coalesce(p.body->'tasks','[]'::jsonb)) t(value)
   join public.project_task_controls c on c.request_id=p_request and c.task_id=t.value->>'id'
 ), candidates as (
   select source.task_id,source.task->>'title' title,source.task->>'status' task_status,source.phase,
     source.depends_on source_dependency,source.blocker_owner source_blocker,
     string_agg(distinct dependent.task->>'title',', ' order by dependent.task->>'title') dependent_titles,
     bool_or((source.depends_on is null or upstream.task->>'status'='done') and
       exists(select 1 from public.project_effective_task_phases(p_request,source.task) effective_phase(phase_name) join public.project_phase_states ps on ps.request_id=p_request and ps.phase=effective_phase.phase_name and ps.status='active')) phase_and_dependency_ready,
     bool_or(upstream.task is not null and upstream.task->>'status'='done') upstream_done
   from task_rows dependent join task_rows source on source.task_id=dependent.depends_on and source.owner_type='client'
   join jsonb_array_elements(coalesce(p.body->'tasks','[]'::jsonb)) dependent_json(value) on dependent_json.value->>'id'=dependent.task_id
   join jsonb_array_elements(coalesce(p.body->'tasks','[]'::jsonb)) source_json(value) on source_json.value->>'id'=source.task_id
   left join lateral (select d.value task from jsonb_array_elements(coalesce(p.body->'tasks','[]'::jsonb)) d(value) where d.value->>'id'=source.depends_on limit 1) upstream on true
   where dependent.owner_type='bivi' and dependent.blocker_owner='client'
     and dependent_json.value->>'status'<>'done' and source_json.value->>'status'<>'done'
   group by source.task_id,source.task,source.phase,source.depends_on,source.blocker_owner
 )
 select coalesce(jsonb_agg(jsonb_build_object('kind','client_task_dependency','source_id',d.task_id,'title',d.title,'message',
     case
       when not exists(select 1 from public.project_clients pc where pc.request_id=p_request and pc.active) then 'No active client member can act on this task. Restore project client access first.'
       when d.source_blocker is not null then 'This client task is still blocked by '||replace(d.source_blocker,'_',' ')||'. Clear its saved blocker in Phases so the client can update it.'
       when d.task_status='blocked' or (d.source_dependency is not null and not d.upstream_done) then 'This client task has an unresolved prerequisite. Resolve or remove that dependency in Phases before waiting on this action.'
       when not d.phase_and_dependency_ready then 'This client task is not in an active phase. Activate its phase in Phases before waiting on it.'
       else 'This client task is not currently actionable. Review its saved task controls in Phases.' end,
     'href',case when not exists(select 1 from public.project_clients pc where pc.request_id=p_request and pc.active) then '/projects/'||p_request||'?tab=access' else '/projects/'||p_request||'?tab=phases' end)), '[]'::jsonb)
 into diagnostics from candidates d
 where d.task_status='blocked' or d.source_blocker is not null or (d.source_dependency is not null and not d.upstream_done)
    or not d.phase_and_dependency_ready or not exists(select 1 from public.project_clients pc where pc.request_id=p_request and pc.active);

 return jsonb_build_object('result','ok','sources',sources,'diagnostics',diagnostics);
end; $$;
revoke all on function public.project_operational_waiting_sources(uuid) from public,anon,service_role;
grant execute on function public.project_operational_waiting_sources(uuid) to authenticated;

create function public.project_operational_waiting_source_open(p_request uuid,p_kind text,p_source_id text) returns boolean
language plpgsql stable security definer set search_path='' as $$
declare source_data jsonb;
begin
 source_data:=public.project_operational_waiting_sources(p_request);
 if exists(select 1 from jsonb_array_elements(coalesce(source_data->'sources','[]'::jsonb)) r where r->>'kind'=p_kind and r->>'source_id'=p_source_id) then return true; end if;
 -- Historical R8 approval references stored the approval kind and raw source id.
 if exists(select 1 from public.staff_approvals a where a.request_id=p_request and a.waiting_on='client' and a.kind=p_kind and a.source_id=p_source_id) then return true; end if;
 if p_kind='task_request' and exists(select 1 from public.project_client_task_responses r where r.request_id=p_request and r.id::text=p_source_id and r.status='pending') then return true; end if;
 -- Keep a task dependency unresolved when its saved Bivi relationship remains,
 -- even if the client task temporarily needs a blocker/access repair.
 if p_kind='client_task_dependency' then
   return exists(
     select 1 from jsonb_array_elements(coalesce((select body->'tasks' from public.inquiry_projects where request_id=p_request),'[]'::jsonb)) source_task(value)
     join public.project_task_controls client_control on client_control.request_id=p_request and client_control.task_id=source_task.value->>'id' and client_control.owner_type='client'
     join public.project_task_controls bivi_control on bivi_control.request_id=p_request and bivi_control.depends_on=client_control.task_id and bivi_control.owner_type='bivi' and bivi_control.blocker_owner='client'
     join jsonb_array_elements(coalesce((select body->'tasks' from public.inquiry_projects where request_id=p_request),'[]'::jsonb)) bivi_task(value) on bivi_task.value->>'id'=bivi_control.task_id
     where source_task.value->>'id'=p_source_id and source_task.value->>'status'<>'done' and bivi_task.value->>'status'<>'done'
   );
 end if;
 return false;
end; $$;
revoke all on function public.project_operational_waiting_source_open(uuid,text,text) from public,anon,service_role;
grant execute on function public.project_operational_waiting_source_open(uuid,text,text) to authenticated;

create or replace function public.get_project_operational_status(p_request uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare p public.inquiry_projects%rowtype; s public.project_operational_status%rowtype; effective text; ready boolean; resolved boolean:=false; source_data jsonb; direct_blockers jsonb:='[]'::jsonb;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 select * into p from public.inquiry_projects where request_id=p_request;
 if not found then return jsonb_build_object('result','not_found'); end if;
 select * into s from public.project_operational_status where request_id=p_request;
 effective:=case when p.state='completed' then 'completed' else coalesce(s.status,p.state) end;
 if effective='waiting_on_client' then
   resolved:=not public.project_operational_waiting_source_open(p_request,s.waiting_source_kind,s.waiting_source_id);
   source_data:=public.project_operational_waiting_sources(p_request);
   select coalesce(jsonb_agg(jsonb_build_object('key','dependency:'||(d->>'source_id'),'label',d->>'message','href',d->>'href')),'[]'::jsonb)
   into direct_blockers from jsonb_array_elements(coalesce(source_data->'diagnostics','[]'::jsonb)) d where d->>'source_id'=s.waiting_source_id;
 end if;
 ready:=jsonb_array_length(public.project_operational_closeout_checklist(p_request))=0;
 return jsonb_build_object('result','ok','status',effective,'executionState',p.state,'revision',coalesce(s.revision,0),'projectRevision',p.revision,'reason',s.reason,'waitingSourceKind',s.waiting_source_kind,'waitingSourceId',s.waiting_source_id,'dependencyResolved',resolved,'dependencyBlockers',direct_blockers,'closeoutEligible',ready,'blockers',public.project_operational_closeout_checklist(p_request));
end; $$;
revoke all on function public.get_project_operational_status(uuid) from public,anon,service_role;
grant execute on function public.get_project_operational_status(uuid) to authenticated;

create or replace function public.manage_project_operational_status(p_request uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); action text:=p_command->>'status'; reason text:=btrim(coalesce(p_command->>'reason','')); expected integer; expected_project integer; current_status text; next_revision integer; p public.inquiry_projects%rowtype; s public.project_operational_status%rowtype; manager_result jsonb; source_kind text:=p_command->>'sourceKind'; v_source_id text:=p_command->>'sourceId'; blockers jsonb; old_status text; changed_at timestamptz:=now();
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if jsonb_typeof(p_command) is distinct from 'object' or action not in ('active','on_hold','waiting_on_client','inactive') or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or jsonb_typeof(p_command->'expectedProjectRevision') is distinct from 'number' then raise exception 'Invalid operational status command' using errcode='22023'; end if;
 expected:=(p_command->>'expectedRevision')::integer; expected_project:=(p_command->>'expectedProjectRevision')::integer;
 perform 1 from public.project_inquiries where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 select * into p from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 select * into s from public.project_operational_status where request_id=p_request for update;
 current_status:=case when p.state='completed' then 'completed' else coalesce(s.status,p.state) end;
 if expected<>coalesce(s.revision,0) or expected_project<>p.revision then return jsonb_build_object('result','conflict','status',current_status,'revision',coalesce(s.revision,0),'projectRevision',p.revision); end if;
 if current_status='completed' then return jsonb_build_object('result','blocked','blockers',jsonb_build_array(jsonb_build_object('key','completed','label','Use the existing authorized Reopen project action before changing operational status.','href','/projects/'||p_request||'?tab=overview'))); end if;
 if action=current_status then return jsonb_build_object('result','saved','status',current_status,'revision',coalesce(s.revision,0),'projectRevision',p.revision,'noop',true); end if;
 if action in ('on_hold','inactive','waiting_on_client') and length(reason) not between 1 and 2000 then return jsonb_build_object('result','invalid','field','reason','message','Enter a reason between 1 and 2000 characters.'); end if;
 if action='active' and current_status in ('on_hold','waiting_on_client','inactive') and length(reason) not between 1 and 2000 then return jsonb_build_object('result','invalid','field','reason','message','Enter a reason between 1 and 2000 characters to resume or reactivate the project.'); end if;
 if action='waiting_on_client' then
   if current_status not in ('active','on_hold') or p.state not in ('active','on_hold') then return jsonb_build_object('result','blocked','blockers',jsonb_build_array(jsonb_build_object('key','status','label','Waiting on client requires an active or explicitly held project.','href','/projects/'||p_request||'?tab=brief'))); end if;
   if source_kind is null or v_source_id is null or not exists(select 1 from jsonb_array_elements(coalesce((public.project_operational_waiting_sources(p_request)->'sources'),'[]'::jsonb)) r where r->>'kind'=source_kind and r->>'source_id'=v_source_id) then
     return jsonb_build_object('result','blocked','blockers',jsonb_build_array(jsonb_build_object('key','dependency','label','The selected client dependency is no longer eligible. Refresh the list and resolve the linked task or approval requirements.','href','/projects/'||p_request||'?tab=phases')));
   end if;
 elsif action='inactive' then
   if p.state<>'active' then return jsonb_build_object('result','blocked','blockers',jsonb_build_array(jsonb_build_object('key','execution','label','Resume the execution state before final closeout.','href','/projects/'||p_request||'?tab=brief'))); end if;
   blockers:=public.project_operational_closeout_checklist(p_request);
   if jsonb_array_length(blockers)>0 then return jsonb_build_object('result','blocked','blockers',blockers); end if;
 elsif action='active' then
   if current_status='waiting_on_client' and public.project_operational_waiting_source_open(p_request,s.waiting_source_kind,s.waiting_source_id) then
     return jsonb_build_object('result','blocked','blockers',jsonb_build_array(jsonb_build_object('key','dependency','label','The recorded client dependency is still unresolved. Resolve it before explicitly resuming work.','href','/projects/'||p_request||'?tab=phases')));
   end if;
   if not public.project_prerequisites_met(p_request) or not exists(select 1 from public.inquiry_proposals where request_id=p_request and version=p.proposal_version and status='accepted') then return jsonb_build_object('result','blocked','blockers',jsonb_build_array(jsonb_build_object('key','activation','label','Resolve project activation prerequisites and confirm the current accepted scope before resuming work.','href','/projects/'||p_request||'?tab=brief'))); end if;
 end if;
 if action='on_hold' and p.state='active' then
   manager_result:=public.manage_inquiry_project(p_request,jsonb_build_object('action','hold','expectedRevision',p.revision,'reason',reason));
   if manager_result->>'result'<>'saved' then return jsonb_build_object('result',case when manager_result->>'result'='conflict' then 'conflict' else 'blocked' end,'detail',manager_result); end if;
 elsif action='active' and current_status='on_hold' and p.state='on_hold' then
   manager_result:=public.manage_inquiry_project(p_request,jsonb_build_object('action','resume','expectedRevision',p.revision,'reason',coalesce(nullif(reason,''),'Operational status resumed')));
   if manager_result->>'result'<>'saved' then return jsonb_build_object('result',case when manager_result->>'result'='conflict' then 'conflict' else 'blocked' end,'detail',manager_result); end if;
 elsif action='waiting_on_client' and p.state='on_hold' then
   if not public.project_prerequisites_met(p_request) or not exists(select 1 from public.inquiry_proposals where request_id=p_request and version=p.proposal_version and status='accepted') then return jsonb_build_object('result','blocked','blockers',jsonb_build_array(jsonb_build_object('key','activation','label','Resolve activation prerequisites and confirm the current accepted scope before enabling client work.','href','/projects/'||p_request||'?tab=brief'))); end if;
   manager_result:=public.manage_inquiry_project(p_request,jsonb_build_object('action','resume','expectedRevision',p.revision,'reason',reason));
   if manager_result->>'result'<>'saved' then return jsonb_build_object('result',case when manager_result->>'result'='conflict' then 'conflict' else 'blocked' end,'detail',manager_result); end if;
 end if;
 select * into p from public.inquiry_projects where request_id=p_request;
 next_revision:=coalesce(s.revision,0)+1; old_status:=current_status;
 insert into public.project_operational_status(request_id,status,revision,reason,waiting_source_kind,waiting_source_id,updated_at,updated_by)
 values(p_request,action,next_revision,coalesce(nullif(reason,''),case when action='active' then 'Staff resumed project work' else '' end),case when action='waiting_on_client' then source_kind end,case when action='waiting_on_client' then v_source_id end,changed_at,actor)
 on conflict(request_id) do update set status=excluded.status,revision=excluded.revision,reason=excluded.reason,waiting_source_kind=excluded.waiting_source_kind,waiting_source_id=excluded.waiting_source_id,updated_at=excluded.updated_at,updated_by=excluded.updated_by;
 insert into public.project_event_history(request_id,source,action,item_id,actor,details,created_at)
 values(p_request,'project','operational_status_changed',p_request::text,actor,jsonb_build_object('oldStatus',old_status,'newStatus',action,'reason',reason,'waitingSourceKind',case when action='waiting_on_client' then source_kind end,'waitingSourceId',case when action='waiting_on_client' then v_source_id end),changed_at);
 return jsonb_build_object('result','saved','status',action,'revision',next_revision,'projectRevision',p.revision,'savedAt',changed_at,'reason',reason);
end; $$;
revoke all on function public.manage_project_operational_status(uuid,jsonb) from public,anon,service_role;
grant execute on function public.manage_project_operational_status(uuid,jsonb) to authenticated;

commit;
