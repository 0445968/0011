begin;
-- Archive is a boolean field on the existing task, never a deletion or completion.
do $validation$
declare signature text;definition text;needle text;
begin
 foreach signature in array array['public.valid_project_body(jsonb)','public.valid_project_workplan_draft_body(jsonb)'] loop
  definition:=pg_get_functiondef(signature::regprocedure);
  needle:='item-array[''startOn'',''startTime'',''dueTime'',''timeZone'']';
  if strpos(definition,needle)=0 then raise exception 'Work-plan validator changed; review archive support';end if;
  definition:=replace(definition,needle,'item-array[''startOn'',''startTime'',''dueTime'',''timeZone'',''archived'']');
  needle:='if collection=''tasks'' and not public.valid_project_task_timing';
  if strpos(definition,needle)=0 then raise exception 'Task timing guard changed';end if;
  definition:=replace(definition,needle,'if collection=''tasks'' and item ? ''archived'' and jsonb_typeof(item->''archived'')<>''boolean'' then return false;end if; '||needle);
  execute definition;
 end loop;
end;$validation$;
do $views$
declare definition text;
begin
 definition:=pg_get_viewdef('public.staff_my_tasks'::regclass,true);
 execute 'create or replace view public.staff_my_tasks with(security_invoker=true) as select base.* from ('||rtrim(definition,';')||') base where not exists(select 1 from public.inquiry_projects p cross join lateral jsonb_array_elements(p.body->''tasks'') t where p.request_id=base.request_id and t->>''id''=base.task_id and t->''archived''=''true''::jsonb)';
 definition:=pg_get_viewdef('public.staff_calendar'::regclass,true);
 execute 'create or replace view public.staff_calendar with(security_invoker=true) as select base.* from ('||rtrim(definition,';')||') base where base.event_type not in (''task'',''task_start'') or not exists(select 1 from public.inquiry_projects p cross join lateral jsonb_array_elements(p.body->''tasks'') t where p.request_id=base.request_id and t->>''id''=base.source_id and t->''archived''=''true''::jsonb)';
end;$views$;
-- Existing review, dependency, phase and milestone gates still inspect the full
-- task array. Archive never changes status or removes controls and history.
commit;
