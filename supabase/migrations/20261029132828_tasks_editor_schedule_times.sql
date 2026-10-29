-- Optional task times and editable start dates live in the revisioned work plan.
-- Existing date-only bodies, private drafts and calendar permissions stay compatible.
begin;

create function public.valid_project_task_timing(t jsonb, strict_values boolean default true)
returns boolean language plpgsql stable set search_path='' as $$
declare k text; d date; zone text; wall timestamp;
begin
 if t ? 'startOn' and jsonb_typeof(t->'startOn') <> 'null' then
  if jsonb_typeof(t->'startOn') <> 'string' or t->>'startOn' !~ '^\d{4}-\d{2}-\d{2}$' then return false; end if;
  d:=(t->>'startOn')::date;
 end if;
 foreach k in array array['startTime','dueTime'] loop
  if t ? k and jsonb_typeof(t->k) <> 'null' then
   if jsonb_typeof(t->k) <> 'string' or length(t->>k)>5 then return false; end if;
   if strict_values and (t->>k !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
     or nullif(t->>(case k when 'startTime' then 'startOn' else 'dueOn' end),'') is null) then return false; end if;
  end if;
 end loop;
 if t ? 'timeZone' then
  if jsonb_typeof(t->'timeZone') <> 'string' or length(t->>'timeZone') not between 1 and 100 then return false; end if;
  zone:=t->>'timeZone';
  if strict_values and not exists(select 1 from pg_catalog.pg_timezone_names where name=zone) then return false; end if;
 end if;
 if strict_values then
  zone:=coalesce(t->>'timeZone','America/Chicago');
  foreach k in array array['startTime','dueTime'] loop
   if t->>k is not null then
    wall:=((t->>(case k when 'startTime' then 'startOn' else 'dueOn' end))||'T'||(t->>k))::timestamp;
    if ((wall at time zone zone) at time zone zone)<>wall then return false; end if;
   end if;
  end loop;
 end if;
 if strict_values and t->>'startOn' is not null and t->>'dueOn' is not null then
  if (t->>'startOn')::date>(t->>'dueOn')::date then return false; end if;
  if t->>'startOn'=t->>'dueOn' and t->>'startTime' is not null and t->>'dueTime' is not null
   and t->>'startTime'>t->>'dueTime' then return false; end if;
 end if;
 return true;
exception when others then return false;
end;$$;
revoke all on function public.valid_project_task_timing(jsonb,boolean) from public,anon,authenticated,service_role;

create or replace function public.valid_project_body(b jsonb) returns boolean language plpgsql stable set search_path='' as $$
declare k text; item jsonb; collection text; max_len integer; d date;
begin
 if b is null or jsonb_typeof(b)<>'object' or octet_length(b::text)>393216 then return false; end if;
 if (select count(*) from jsonb_object_keys(b))<>5 then return false; end if;
 foreach k in array array['title','owner','notes'] loop
  max_len:=case k when 'notes' then 4000 else 200 end;
  if jsonb_typeof(b->k) is distinct from 'string' or length(b->>k)>max_len then return false; end if;
 end loop;
 if length(btrim(b->>'title'))=0 then return false; end if;
 foreach collection in array array['milestones','tasks'] loop
  if jsonb_typeof(b->collection) is distinct from 'array' then return false; end if;
  if jsonb_array_length(b->collection)>(case collection when 'milestones' then 20 else 100 end) then return false; end if;
  for item in select value from jsonb_array_elements(b->collection) loop
   if collection='tasks' and not public.valid_project_task_timing(item,true) then return false; end if;
   if jsonb_typeof(item)<>'object' or (select count(*) from jsonb_object_keys(case when collection='tasks' then item-array['startOn','startTime','dueTime','timeZone'] else item end))<>(case collection when 'milestones' then 4 else 7 end) then return false; end if;
   foreach k in array array['id','title','status'] loop
    max_len:=case k when 'id' then 100 when 'title' then 300 else 11 end;
    if jsonb_typeof(item->k) is distinct from 'string' or length(item->>k)>max_len or length(btrim(item->>k))=0 then return false; end if;
   end loop;
   if jsonb_typeof(item->'dueOn') is distinct from 'null' then
    if jsonb_typeof(item->'dueOn') is distinct from 'string' or item->>'dueOn'!~'^\d{4}-\d{2}-\d{2}$' then return false; end if;
    d:=(item->>'dueOn')::date;
   end if;
   if collection='milestones' then
    if item->>'status' not in ('planned','in_progress','done') then return false; end if;
   else
    if item->>'status' not in ('todo','doing','blocked','done') or jsonb_typeof(item->'owner') is distinct from 'string' or length(item->>'owner')>200 or jsonb_typeof(item->'notes') is distinct from 'string' or length(item->>'notes')>2000 then return false; end if;
    if jsonb_typeof(item->'milestoneId') is distinct from 'null' then
     if jsonb_typeof(item->'milestoneId') is distinct from 'string' or not exists(select 1 from jsonb_array_elements(b->'milestones') m where m->>'id'=item->>'milestoneId') then return false; end if;
    end if;
   end if;
  end loop;
  if (select count(distinct value->>'id') from jsonb_array_elements(b->collection))<>jsonb_array_length(b->collection) then return false; end if;
 end loop;
 return true;
exception when others then return false;
end;$$;

create or replace function public.valid_project_workplan_draft_body(b jsonb) returns boolean
language plpgsql stable set search_path = '' as $$
declare
  k text;
  item jsonb;
  collection text;
  max_len integer;
  d date;
begin
  if b is null or jsonb_typeof(b) <> 'object' or octet_length(b::text) > 393216
    or (select count(*) from jsonb_object_keys(b)) <> 5 then return false; end if;
  foreach k in array array['title','owner','notes'] loop
    max_len := case k when 'notes' then 4000 else 200 end;
    if jsonb_typeof(b->k) is distinct from 'string' or length(b->>k) > max_len then return false; end if;
  end loop;
  foreach collection in array array['milestones','tasks'] loop
    if jsonb_typeof(b->collection) is distinct from 'array'
      or jsonb_array_length(b->collection) > (case collection when 'milestones' then 20 else 100 end) then return false; end if;
    for item in select value from jsonb_array_elements(b->collection) loop
   if collection='tasks' and not public.valid_project_task_timing(item,false) then return false; end if;
      if jsonb_typeof(item) <> 'object'
        or (select count(*) from jsonb_object_keys(case when collection='tasks' then item-array['startOn','startTime','dueTime','timeZone'] else item end)) <> (case collection when 'milestones' then 4 else 7 end) then return false; end if;
      foreach k in array array['id','title','status'] loop
        max_len := case k when 'id' then 100 when 'title' then 300 else 11 end;
        if jsonb_typeof(item->k) is distinct from 'string' or length(item->>k) > max_len
          or (k in ('id','status') and length(btrim(item->>k)) = 0) then return false; end if;
      end loop;
      if jsonb_typeof(item->'dueOn') is distinct from 'null' then
        if jsonb_typeof(item->'dueOn') is distinct from 'string' or item->>'dueOn' !~ '^\d{4}-\d{2}-\d{2}$' then return false; end if;
        d := (item->>'dueOn')::date;
      end if;
      if collection = 'milestones' then
        if item->>'status' not in ('planned','in_progress','done') then return false; end if;
      else
        if item->>'status' not in ('todo','doing','blocked','done')
          or jsonb_typeof(item->'owner') is distinct from 'string' or length(item->>'owner') > 200
          or jsonb_typeof(item->'notes') is distinct from 'string' or length(item->>'notes') > 2000 then return false; end if;
        if jsonb_typeof(item->'milestoneId') is distinct from 'null'
          and (jsonb_typeof(item->'milestoneId') is distinct from 'string'
            or not exists(select 1 from jsonb_array_elements(b->'milestones') m where m->>'id' = item->>'milestoneId')) then return false; end if;
      end if;
    end loop;
    if (select count(distinct value->>'id') from jsonb_array_elements(b->collection)) <> jsonb_array_length(b->collection) then return false; end if;
  end loop;
  return true;
exception when others then return false;
end;
$$;

-- Validate an untouched legacy start date against newly edited due dates too.
create function public.guard_project_task_timing() returns trigger
language plpgsql security definer set search_path='' as $$
declare t jsonb; legacy date;
begin
 for t in select value from jsonb_array_elements(new.body->'tasks') loop
  if not (t ? 'startOn') then
   select start_on into legacy from public.project_task_schedule where request_id=new.request_id and task_id=t->>'id';
   t:=t||jsonb_build_object('startOn',legacy);
  end if;
  if not public.valid_project_task_timing(t) then raise exception 'Task start and due dates or times are invalid' using errcode='22023'; end if;
 end loop;
 return new;
end;$$;
revoke all on function public.guard_project_task_timing() from public,anon,authenticated,service_role;
create trigger project_task_timing_valid before update of body on public.inquiry_projects
 for each row when (old.body is distinct from new.body) execute function public.guard_project_task_timing();

-- Deferred so newly created tasks have their canonical control rows before the FK write.
create function public.sync_project_task_timing() returns trigger
language plpgsql security definer set search_path='' as $$
declare t jsonb; saved_body jsonb; previous_row public.project_task_schedule%rowtype; next_revision integer;
begin
 select body into saved_body from public.inquiry_projects where request_id=new.request_id;
 for t in select value from jsonb_array_elements(saved_body->'tasks') loop
  if not (t ? 'startOn') then continue; end if;
  select * into previous_row from public.project_task_schedule where request_id=new.request_id and task_id=t->>'id' for update;
  if previous_row.start_on is not distinct from (t->>'startOn')::date then continue; end if;
  if coalesce(current_setting('role',true),'none') not in ('none','service_role') and (auth.uid() is null or not public.is_inquiry_staff()) then raise exception 'Staff authorization required' using errcode='42501'; end if;
  next_revision:=coalesce(previous_row.revision,0)+1;
  insert into public.project_task_schedule(request_id,task_id,start_on,revision,updated_at,updated_by)
   values(new.request_id,t->>'id',(t->>'startOn')::date,next_revision,now(),auth.uid())
   on conflict(request_id,task_id) do update set start_on=excluded.start_on,revision=excluded.revision,updated_at=now(),updated_by=auth.uid();
  insert into public.project_task_schedule_history(request_id,task_id,previous_start_on,next_start_on,revision,actor)
   values(new.request_id,t->>'id',previous_row.start_on,(t->>'startOn')::date,next_revision,auth.uid());
  insert into public.project_task_history(request_id,task_id,action,snapshot,actor)
   values(new.request_id,t->>'id','metadata',jsonb_build_object('change','start_date','before',previous_row.start_on,'after',t->>'startOn','revision',next_revision),auth.uid());
 end loop;
 return null;
end;$$;
revoke all on function public.sync_project_task_timing() from public,anon,authenticated,service_role;
create constraint trigger sync_project_task_timing after update on public.inquiry_projects
 deferrable initially deferred for each row when (old.body is distinct from new.body)
 execute function public.sync_project_task_timing();

-- Existing Calendar start-date controls use the same canonical revision model.
create or replace function public.manage_project_task_schedule(p_request uuid,p_task_id text,p_start_on date,p_project_revision integer,p_schedule_revision integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare project public.inquiry_projects%rowtype; current_row public.project_task_schedule%rowtype; t jsonb; b jsonb; outcome jsonb;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if p_task_id is null or length(btrim(p_task_id)) not between 1 and 100 or p_project_revision is null or p_project_revision<1 or p_schedule_revision is null or p_schedule_revision<0 then raise exception 'Invalid schedule command' using errcode='22023'; end if;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 if project.state='completed' then return jsonb_build_object('result','locked'); end if;
 if project.revision<>p_project_revision then return jsonb_build_object('result','conflict'); end if;
 select value into t from jsonb_array_elements(project.body->'tasks') where value->>'id'=p_task_id;
 if t is null then return jsonb_build_object('result','not_found'); end if;
 select * into current_row from public.project_task_schedule where request_id=p_request and task_id=p_task_id for update;
 if coalesce(current_row.revision,0)<>p_schedule_revision then return jsonb_build_object('result','conflict'); end if;
 if (t ? 'startOn') and (t->>'startOn')::date is not distinct from p_start_on then return jsonb_build_object('result','saved','revision',p_schedule_revision); end if;
 t:=t||jsonb_build_object('startOn',p_start_on);
 if p_start_on is null and t ? 'startTime' then t:=t||jsonb_build_object('startTime',null); end if;
 if not public.valid_project_task_timing(t) then return jsonb_build_object('result','invalid_dates'); end if;
 select jsonb_set(project.body,'{tasks}',jsonb_agg(case when value->>'id'=p_task_id then t else value end order by ord)) into b
  from jsonb_array_elements(project.body->'tasks') with ordinality items(value,ord);
 outcome:=public.manage_inquiry_project(p_request,jsonb_build_object('action','save','expectedRevision',p_project_revision,'body',b));
 if outcome->>'result'<>'saved' then return outcome; end if;
 return jsonb_build_object('result','saved','revision',coalesce(current_row.revision,0)+case when current_row.start_on is distinct from p_start_on then 1 else 0 end);
end;$$;
revoke all on function public.manage_project_task_schedule(uuid,text,date,integer,integer) from public,anon,service_role;
grant execute on function public.manage_project_task_schedule(uuid,text,date,integer,integer) to authenticated;

-- Preserve each existing projection and its authorization predicates. Timed task
-- events use the existing calendar instant fields; date-only events remain dates.
do $projection$
declare definition text; columns_sql text;
begin
 definition:=pg_get_viewdef('public.staff_calendar'::regclass,true);
 select string_agg(case a.attname
  when 'starts_at' then 'coalesce(base.starts_at,timing.instant) as starts_at'
  when 'ends_at' then 'coalesce(base.ends_at,timing.instant) as ends_at'
  when 'meeting_timezone' then 'coalesce(base.meeting_timezone,case when timing.instant is not null then coalesce(task.value->>''timeZone'',''America/Chicago'') end) as meeting_timezone'
  else 'base.'||quote_ident(a.attname) end,',' order by a.attnum) into columns_sql
 from pg_attribute a where a.attrelid='public.staff_calendar'::regclass and a.attnum>0 and not a.attisdropped;
 execute 'create or replace view public.staff_calendar with(security_invoker=true) as select '||columns_sql||
  ' from ('||rtrim(definition,';')||') base left join public.inquiry_projects project on project.request_id=base.request_id
    left join lateral (select value from jsonb_array_elements(project.body->''tasks'') where value->>''id''=base.source_id and base.event_type in (''task'',''task_start'')) task on true
    left join lateral (select case when task.value->>(case base.event_type when ''task_start'' then ''startTime'' else ''dueTime'' end) is not null
      then (base.due_on::text||''T''||(task.value->>(case base.event_type when ''task_start'' then ''startTime'' else ''dueTime'' end)))::timestamp
        at time zone coalesce(task.value->>''timeZone'',''America/Chicago'') end as instant) timing on true';
 definition:=pg_get_viewdef('public.staff_my_tasks'::regclass,true);
 execute 'create or replace view public.staff_my_tasks with(security_invoker=true) as select base.*,task.value->>''startTime'' as start_time,task.value->>''dueTime'' as due_time,coalesce(task.value->>''timeZone'',''America/Chicago'') as time_zone
  from ('||rtrim(definition,';')||') base join public.inquiry_projects project on project.request_id=base.request_id
  cross join lateral jsonb_array_elements(project.body->''tasks'') task(value) where task.value->>''id''=base.task_id';
end;$projection$;
revoke all on public.staff_calendar,public.staff_my_tasks from public,anon,service_role;
grant select on public.staff_calendar,public.staff_my_tasks to authenticated;
commit;
