-- Preserve all existing completion guards while treating review/revision work
-- as active milestone work, consistently with the task editor.
do $migration$
declare definition text;replacement text;
begin
 definition:=pg_get_functiondef('public.project_sync_milestone_statuses()'::regprocedure);
 replacement:=replace(definition,'(''doing'', ''blocked'')','(''doing'', ''blocked'', ''in_review'', ''rejected'')');
 if replacement=definition then raise exception 'Milestone activity condition could not be located';end if;
 execute replacement;
end;$migration$;
