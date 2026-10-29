-- Keep assigned-task filtering and date labels aligned with the calendar's named-zone instants.
begin;
do $projection$
declare definition text;
begin
 definition:=pg_get_viewdef('public.staff_my_tasks'::regclass,true);
 execute 'create or replace view public.staff_my_tasks with(security_invoker=true) as
  select base.*,
   case when base.start_on is not null and base.start_time is not null then (base.start_on::text||''T''||base.start_time)::timestamp at time zone base.time_zone end as start_at,
   case when base.due_on is not null and base.due_time is not null then (base.due_on::text||''T''||base.due_time)::timestamp at time zone base.time_zone end as due_at
  from ('||rtrim(definition,';')||') base';
end;$projection$;
revoke all on public.staff_my_tasks from public,anon,service_role;
grant select on public.staff_my_tasks to authenticated;

create function public.staff_my_tasks_in_timezone(p_timezone text)
returns setof public.staff_my_tasks language plpgsql stable security invoker set search_path='' as $$
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if not exists(select 1 from pg_catalog.pg_timezone_names where name=p_timezone) then raise exception 'Invalid timezone' using errcode='22023'; end if;
 return query
 select (jsonb_populate_record(null::public.staff_my_tasks,to_jsonb(task)||jsonb_build_object(
  'start_on',case when task.start_at is not null then (task.start_at at time zone p_timezone)::date else task.start_on end,
  'start_time',case when task.start_at is not null then to_char(task.start_at at time zone p_timezone,'HH24:MI') else task.start_time end,
  'due_on',case when task.due_at is not null then (task.due_at at time zone p_timezone)::date else task.due_on end,
  'due_time',case when task.due_at is not null then to_char(task.due_at at time zone p_timezone,'HH24:MI') else task.due_time end,
  'time_zone',p_timezone
 ))).* from public.staff_my_tasks task;
end;$$;
revoke all on function public.staff_my_tasks_in_timezone(text) from public,anon,service_role;
grant execute on function public.staff_my_tasks_in_timezone(text) to authenticated;
commit;
