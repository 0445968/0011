begin;
alter policy task_notes_staff_read on public.project_task_notes using ((select public.is_inquiry_staff()) and author_id=(select auth.uid()));
alter policy task_note_history_staff_read on public.project_task_note_history using ((select public.is_inquiry_staff()) and exists(select 1 from public.project_task_notes n where n.id=note_id and n.author_id=(select auth.uid())));
-- Audit readers are SECURITY DEFINER: apply ownership inside each reader too.
do $privacy$
declare definition text;needle text;replacement text;
begin
 definition:=pg_get_functiondef('public.staff_project_activity_page(uuid,timestamptz,text,integer,text)'::regprocedure);
 needle:='from public.project_task_note_history h where h.request_id=p_request and (true)';
 replacement:='from public.project_task_note_history h where h.request_id=p_request and exists(select 1 from public.project_task_notes n where n.id=h.note_id and n.author_id=auth.uid())';
 if strpos(definition,needle)=0 then raise exception 'Task activity note projection changed; review privacy filter';end if;
 execute replace(definition,needle,replacement);
 definition:=pg_get_functiondef('public.staff_project_activity_actors(uuid)'::regprocedure);
 needle:='from public.project_task_note_history where request_id=p_request';
 replacement:='from public.project_task_note_history where request_id=p_request and actor_id=auth.uid()';
 if strpos(definition,needle)=0 then raise exception 'Task activity actors projection changed; review privacy filter';end if;
 execute replace(definition,needle,replacement);
end;$privacy$;
commit;
