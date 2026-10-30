begin;
do $reminders$
declare definition text;needle text;replacement text;
begin
 definition:=pg_get_functiondef('public.enqueue_project_deadline_reminders(date)'::regprocedure);
 needle:='where p.state=''active'' and c.owner_type=''client'' and t.value->>''status''<>''done''';
 if strpos(definition,needle)=0 then raise exception 'Deadline reminder source changed';end if;
 execute replace(definition,needle,needle||' and t.value->''archived'' is distinct from ''true''::jsonb');
 definition:=pg_get_functiondef('public.project_communication_allowed(uuid)'::regprocedure);
 needle:='and t->>''status''<>''done''';
 if strpos(definition,needle)=0 then raise exception 'Assignment eligibility source changed';end if;
 definition:=replace(definition,needle,needle||' and t->''archived'' is distinct from ''true''::jsonb');
 needle:='and (o.kind<>''task_request''';
 replacement:='and (o.kind<>''task_deadline'' or exists(select 1 from public.inquiry_projects p cross join lateral jsonb_array_elements(p.body->''tasks'') t cross join unnest(array[''3d'',''due'',''overdue'']) stage where p.request_id=o.request_id and t->>''status''<>''done'' and t->''archived'' is distinct from ''true''::jsonb and o.dedupe_key=''task_deadline:''||(t->>''id'')||'':''||stage||'':''||u.id::text)) '||needle;
 if strpos(definition,needle)=0 then raise exception 'Communication eligibility source changed';end if;
 execute replace(definition,needle,replacement);
end;$reminders$;
commit;
