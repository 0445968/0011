-- Follow-up for review workflow status validation and completed-task policy guards.
begin;

-- Extend the existing allow-lists in place. This preserves archive and timing
-- validations introduced by earlier migrations.
do $migration$
declare function_signature text; function_definition text; updated_definition text;
begin
 foreach function_signature in array array[
  'public.valid_project_body(jsonb)',
  'public.valid_project_workplan_draft_body(jsonb)'
 ] loop
  if to_regprocedure(function_signature) is null then continue;end if;
  function_definition:=pg_get_functiondef(function_signature::regprocedure);
  updated_definition:=replace(function_definition,
   '(''todo'',''doing'',''blocked'',''done'')',
   '(''todo'',''doing'',''blocked'',''in_review'',''rejected'',''done'')');
  if updated_definition=function_definition and position('in_review' in function_definition)=0 then
   raise exception 'Could not locate task status allow-list in %',function_signature;
  end if;
  if updated_definition<>function_definition then execute updated_definition;end if;
 end loop;
end;$migration$;

create or replace function public.project_task_review_controls_snapshot(p_request uuid,p_task text)
returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('ownerType',c.owner_type,'requiresClientReview',c.requires_client_review,'phase',c.phase,'dependsOn',c.depends_on,'blockerOwner',c.blocker_owner,
  'effectivePhases',coalesce((select jsonb_agg(x.phase order by x.phase) from public.project_effective_task_phases(p_request,t.value) x(phase)),'[]'::jsonb))
 from public.project_task_controls c join public.inquiry_projects p on p.request_id=c.request_id
 cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
 where c.request_id=p_request and c.task_id=p_task and t.value->>'id'=p_task;
$$;
revoke all on function public.project_task_review_controls_snapshot(uuid,text) from public,anon,authenticated,service_role;
update public.project_task_completion_review_controls snapshot
 set control_snapshot=snapshot.control_snapshot||jsonb_build_object('requiresClientReview',controls.requires_client_review)
 from public.project_task_controls controls
 where controls.request_id=snapshot.request_id and controls.task_id=snapshot.task_id
  and not (snapshot.control_snapshot ? 'requiresClientReview');

create or replace function public.guard_client_review_policy_after_completion() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if old.requires_client_review is distinct from new.requires_client_review and exists(
  select 1 from public.inquiry_projects p cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
  where p.request_id=new.request_id and t.value->>'id'=new.task_id and t.value->>'status'='done'
 ) then raise exception 'Reopen the completed task before changing its client review requirement' using errcode='23514';end if;
 return new;
end;$$;
revoke all on function public.guard_client_review_policy_after_completion() from public,anon,authenticated,service_role;
drop trigger if exists project_client_review_policy_guard on public.project_task_controls;
create trigger project_client_review_policy_guard before update of requires_client_review on public.project_task_controls
 for each row execute function public.guard_client_review_policy_after_completion();

create or replace function public.guard_required_task_review_completion() returns trigger
language plpgsql security definer set search_path='' as $$
declare item jsonb; previous jsonb; control_row public.project_task_controls%rowtype;
begin
 if old.body->'tasks' is not distinct from new.body->'tasks' then return new;end if;
 for item in select value from jsonb_array_elements(new.body->'tasks') loop
  select value into previous from jsonb_array_elements(old.body->'tasks') where value->>'id'=item->>'id';
  if previous is null or previous->>'status'=item->>'status' then continue;end if;
  if item->>'status'='rejected' and not public.is_project_workflow_admin() then raise exception 'staff_task_review_admin_required|task=%',item->>'id' using errcode='23514';end if;
  if item->>'status'<>'done' or previous->>'status'='done' then continue;end if;
  select * into control_row from public.project_task_controls where request_id=new.request_id and task_id=item->>'id';
  if control_row.requires_staff_review and not public.is_project_workflow_admin() then raise exception 'staff_task_review_required|task=%',item->>'id' using errcode='23514';end if;
 end loop;return new;
end;$$;
revoke all on function public.guard_required_task_review_completion() from public,anon,authenticated,service_role;
drop trigger if exists zz_guard_required_task_review_completion on public.inquiry_projects;
create trigger zz_guard_required_task_review_completion before update of body on public.inquiry_projects for each row execute function public.guard_required_task_review_completion();

commit;
