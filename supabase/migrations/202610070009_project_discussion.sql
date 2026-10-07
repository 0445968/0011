-- Requires migrations 001–008. Internal staff collaboration; PostgreSQL 15+.
begin;
create table public.project_comments (
 id uuid primary key,request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 task_id text,task_title text not null default '',body text not null check(length(body)<=4000),
 author_id uuid references auth.users(id) on delete set null,revision integer not null default 1 check(revision>0),
 removed boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(task_id is null or length(task_id) between 1 and 100),check(removed or length(btrim(body))>0)
);
create index project_comments_project_date on public.project_comments(request_id,created_at desc,id desc);
create table public.project_comment_history (
 id bigint generated always as identity primary key,request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 comment_id uuid not null references public.project_comments(id) on delete cascade,action text not null check(action in ('create','edit','remove')),
 revision integer not null,snapshot jsonb not null,actor_id uuid references auth.users(id) on delete set null,created_at timestamptz not null default now()
);
alter table public.project_comments enable row level security;
alter table public.project_comment_history enable row level security;
revoke all on public.project_comments,public.project_comment_history from public,anon,authenticated;
grant select on public.project_comments,public.project_comment_history to authenticated;
create policy comments_staff_read on public.project_comments for select to authenticated using((select public.is_inquiry_staff()));
create policy comment_history_staff_read on public.project_comment_history for select to authenticated using((select public.is_inquiry_staff()));
create function public.manage_project_comment(p_request_id uuid,p_command jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();c public.project_comments;cid uuid;act text:=p_command->>'action';content text;task text;title text;pr public.inquiry_projects;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 perform 1 from public.project_inquiries where request_id=p_request_id for update;
 select * into pr from public.inquiry_projects where request_id=p_request_id;
 if not found then return jsonb_build_object('result','not_found'); end if;
 if jsonb_typeof(p_command->'id') is distinct from 'string' or p_command->>'id'!~'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then raise exception 'Invalid comment ID' using errcode='22023'; end if;
 cid:=(p_command->>'id')::uuid;
 if act in ('create','edit') then
  if jsonb_typeof(p_command->'body') is distinct from 'string' or length(btrim(p_command->>'body')) not between 1 and 4000 then raise exception 'Comment text required' using errcode='22023'; end if;
  content:=btrim(p_command->>'body');
 end if;
 select * into c from public.project_comments where id=cid and request_id=p_request_id for update;
 if act='create' then
  if jsonb_typeof(p_command->'taskId') is distinct from 'null' and (jsonb_typeof(p_command->'taskId') is distinct from 'string' or length(btrim(p_command->>'taskId')) not between 1 and 100) then raise exception 'Invalid task' using errcode='22023'; end if;
  task:=p_command->>'taskId';
  if c.id is not null then
   if c.author_id=actor and c.body=content and c.task_id is not distinct from task and not c.removed and c.revision=1 then return jsonb_build_object('result','saved'); end if;
   return jsonb_build_object('result','conflict');
  end if;
  if exists(select 1 from public.project_comments where id=cid) then return jsonb_build_object('result','conflict'); end if;
  if jsonb_typeof(p_command->'expectedProjectRevision') is distinct from 'number' or p_command->>'expectedProjectRevision'!~'^[0-9]{1,8}$' then raise exception 'Invalid project revision' using errcode='22023'; end if;
  if pr.revision<>(p_command->>'expectedProjectRevision')::integer then return jsonb_build_object('result','conflict'); end if;
  if task is not null then
   select value->>'title' into title from jsonb_array_elements(pr.body->'tasks') where value->>'id'=task;
   if not found then return jsonb_build_object('result','task_missing'); end if;
  end if;
  if (select count(*) from public.project_comments where request_id=p_request_id)>=1000 then return jsonb_build_object('result','limit'); end if;
  insert into public.project_comments(id,request_id,task_id,task_title,body,author_id) values(cid,p_request_id,task,coalesce(title,''),content,actor) returning * into c;
 else
  if c.id is null then return jsonb_build_object('result','not_found'); end if;
  if c.author_id is distinct from actor then raise exception 'Comment author authorization required' using errcode='42501'; end if;
  if jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' then raise exception 'Invalid comment revision' using errcode='22023'; end if;
  if c.revision<>(p_command->>'expectedRevision')::integer or c.removed then return jsonb_build_object('result','conflict'); end if;
  if act='edit' then
   if c.body=content then return jsonb_build_object('result','saved'); end if;
   update public.project_comments set body=content,revision=revision+1,updated_at=now() where id=cid returning * into c;
  elsif act='remove' then
   update public.project_comments set body='',removed=true,revision=revision+1,updated_at=now() where id=cid returning * into c;
  else raise exception 'Invalid comment action' using errcode='22023'; end if;
 end if;
 insert into public.project_comment_history(request_id,comment_id,action,revision,snapshot,actor_id)
 values(p_request_id,cid,act,c.revision,jsonb_build_object('body',c.body,'taskId',c.task_id,'taskTitle',c.task_title,'removed',c.removed),actor);
 return jsonb_build_object('result','saved');
end;$$;
revoke all on function public.manage_project_comment(uuid,jsonb) from public,anon;
grant execute on function public.manage_project_comment(uuid,jsonb) to authenticated;
-- Withdrawal timestamps are readable under the existing publication RLS (clients cannot see withdrawn rows).
grant select(withdrawn_at) on public.project_publications to authenticated;
create view public.project_activity with(security_invoker=true) as
select * from (
 select request_id,'project:'||id::text event_id,'project'::text source,action,reason detail,created_at from public.inquiry_project_history
 union all select request_id,'onboarding:'||id::text,'onboarding',action,reason,created_at from public.inquiry_onboarding_history
 union all select request_id,'readiness:'||id::text,'readiness',action,reason,created_at from public.inquiry_readiness_history
 union all select h.request_id,'file:'||h.id::text,'file',h.action,f.filename||case when h.reason='' then '' else ' · '||h.reason end,h.created_at from public.project_file_history h join public.project_files f on f.id=h.file_id
 union all select request_id,'comment:'||id::text,'comment',action,coalesce(nullif(snapshot->>'taskTitle',''),'Project discussion'),created_at from public.project_comment_history
 union all select request_id,'publication:'||version::text,'publication','publish',body->>'title',created_at from public.project_publications
 union all select request_id,'withdrawal:'||version::text,'publication','withdraw',body->>'title',withdrawn_at from public.project_publications where withdrawn and withdrawn_at is not null
 union all select request_id,'review:'||version::text||':'||user_id::text,'client review',decision,note,created_at from public.project_client_reviews
) activity where (select public.is_inquiry_staff());
revoke all on public.project_activity from public,anon;
grant select on public.project_activity to authenticated;
commit;
