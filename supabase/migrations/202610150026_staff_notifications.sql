begin;
create table public.staff_notification_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
 tasks boolean not null default true, deadlines boolean not null default true,
 approvals boolean not null default true, timezone text not null default 'America/Chicago'
);
create table public.staff_notification_reads (
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 event_key text not null check (length(event_key) between 1 and 500),
 read_at timestamptz not null default now(), primary key(user_id,event_key)
);
alter table public.staff_notification_preferences enable row level security;
alter table public.staff_notification_reads enable row level security;
create policy notification_preferences_own on public.staff_notification_preferences for all to authenticated
 using(user_id=(select auth.uid()) and (select public.is_inquiry_staff()))
 with check(user_id=(select auth.uid()) and (select public.is_inquiry_staff()));
create policy notification_reads_own on public.staff_notification_reads for all to authenticated
 using(user_id=(select auth.uid()) and (select public.is_inquiry_staff()))
 with check(user_id=(select auth.uid()) and (select public.is_inquiry_staff()));
revoke all on public.staff_notification_preferences,public.staff_notification_reads from public,anon,service_role;
grant select,insert,update,delete on public.staff_notification_preferences,public.staff_notification_reads to authenticated;

-- An actionable inbox derived from authoritative records, not a historical audit log.
-- Resolved/deleted/reassigned items disappear. Keys track meaningful state, never polling time.
create view public.staff_notification_events with(security_invoker=true) as
with preferences as (
 select coalesce((select timezone from public.staff_notification_preferences where user_id=auth.uid()),'America/Chicago') as timezone
),clock as (
 select (now() at time zone case when exists(select 1 from pg_timezone_names z where z.name=p.timezone) then p.timezone else 'America/Chicago' end)::date as today from preferences p
)
select 'task:'||t.request_id||':'||md5(t.task_id) as event_key,'tasks'::text as category,
 'Task assigned to you'::text as title,t.title as detail,t.project_title,t.request_id,t.task_id,
 null::text as kind,null::text as source_id,null::integer as version,false as needs_reviewer,
 t.due_on,t.updated_at as occurred_at
from public.staff_my_tasks t where t.task_status<>'done' and t.project_state<>'completed'
union all
select 'deadline:'||t.request_id||':'||md5(t.task_id)||':'||t.due_on||':'||case when t.due_on<c.today then 'overdue' when t.due_on=c.today then 'today' else 'upcoming' end, 'deadlines',
 case when t.due_on<c.today then 'Task overdue' when t.due_on=c.today then 'Task due today' else 'Task due soon' end,
 t.title,t.project_title,t.request_id,t.task_id,null,null,null,false,t.due_on,t.updated_at
from public.staff_my_tasks t cross join clock c where t.task_status<>'done' and t.project_state<>'completed' and t.due_on<=c.today+7
union all
select 'approval:'||a.approval_key||':'||a.source_status||':'||a.needs_reviewer,'approvals',
 a.action_label,a.title,a.project_title,a.request_id,null,a.kind,a.source_id,a.version,a.needs_reviewer,null,a.updated_at
from public.staff_approvals a where a.waiting_on='staff';
revoke all on public.staff_notification_events from public,anon,service_role;
grant select on public.staff_notification_events to authenticated;
create view public.staff_notification_inbox with(security_invoker=true) as
select e.*,r.read_at from public.staff_notification_events e
left join public.staff_notification_reads r on r.user_id=auth.uid() and r.event_key=e.event_key
left join public.staff_notification_preferences p on p.user_id=auth.uid()
where case e.category when 'tasks' then coalesce(p.tasks,true) when 'deadlines' then coalesce(p.deadlines,true) else coalesce(p.approvals,true) end;
revoke all on public.staff_notification_inbox from public,anon,service_role;
grant select on public.staff_notification_inbox to authenticated;

create function public.staff_notifications_feed(p_page integer default 1,p_unread boolean default false,p_category text default 'all',p_limit integer default 25)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb; total integer; unread integer; prefs jsonb; page_number integer:=greatest(1,least(coalesce(p_page,1),100000)); page_size integer:=greatest(1,least(coalesce(p_limit,25),25));
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if p_category not in ('all','tasks','deadlines','approvals') then raise exception 'Invalid category' using errcode='22023'; end if;
 select count(*) into unread from public.staff_notification_inbox where read_at is null;
 select count(*) into total from public.staff_notification_inbox where (not p_unread or read_at is null) and (p_category='all' or category=p_category);
 select coalesce(jsonb_agg(to_jsonb(item)),'[]'::jsonb) into result from (
 select * from public.staff_notification_inbox where (not p_unread or read_at is null) and (p_category='all' or category=p_category)
 order by (read_at is null) desc,occurred_at desc,event_key limit page_size offset (page_number-1)*page_size
 ) item;
 select to_jsonb(p)-'user_id' into prefs from public.staff_notification_preferences p where user_id=auth.uid();
 return jsonb_build_object('rows',result,'total',total,'unread',unread,'page',page_number,'limit',page_size,'preferences',coalesce(prefs,'{"tasks":true,"deadlines":true,"approvals":true,"timezone":"America/Chicago"}'::jsonb));
end;
$$;
create function public.set_staff_notification_read(p_key text default null,p_read boolean default true)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if p_key is null and not p_read then raise exception 'Choose one notification' using errcode='22023'; end if;
 if p_key is not null and not exists(select 1 from public.staff_notification_inbox where event_key=p_key) then raise exception 'Notification no longer available' using errcode='22023'; end if;
 if p_read then
 insert into public.staff_notification_reads(user_id,event_key) select auth.uid(),event_key from public.staff_notification_inbox where (p_key is null or event_key=p_key) and read_at is null on conflict(user_id,event_key) do nothing;
 else delete from public.staff_notification_reads where user_id=auth.uid() and event_key=p_key;
 end if;
 -- Keep actionable read state; prune resolved state whose read timestamp is over 90 days old.
 delete from public.staff_notification_reads r where r.user_id=auth.uid() and r.read_at<now()-interval '90 days' and not exists(select 1 from public.staff_notification_events e where e.event_key=r.event_key);
end;
$$;
create function public.save_staff_notification_preferences(p_tasks boolean,p_deadlines boolean,p_approvals boolean,p_timezone text)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if p_tasks is null or p_deadlines is null or p_approvals is null or p_timezone is null or not exists(select 1 from pg_timezone_names where name=p_timezone) then raise exception 'Invalid preferences' using errcode='22023'; end if;
 insert into public.staff_notification_preferences(user_id,tasks,deadlines,approvals,timezone) values(auth.uid(),p_tasks,p_deadlines,p_approvals,p_timezone)
 on conflict(user_id) do update set tasks=excluded.tasks,deadlines=excluded.deadlines,approvals=excluded.approvals,timezone=excluded.timezone;
end;
$$;
revoke all on function public.staff_notifications_feed(integer,boolean,text,integer),public.set_staff_notification_read(text,boolean),public.save_staff_notification_preferences(boolean,boolean,boolean,text) from public,anon,service_role;
grant execute on function public.staff_notifications_feed(integer,boolean,text,integer),public.set_staff_notification_read(text,boolean),public.save_staff_notification_preferences(boolean,boolean,boolean,text) to authenticated;
commit;
