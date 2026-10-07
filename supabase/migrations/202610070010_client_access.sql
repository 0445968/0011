-- Requires migrations 001–009. Staff assignments and server-only Auth request limits.
begin;
alter table public.project_clients add column revision integer not null default 1 check(revision>0),add column updated_at timestamptz not null default now();
grant select on public.project_clients to authenticated;
create policy client_assignments_staff_read on public.project_clients for select to authenticated using((select public.is_inquiry_staff()));
create table public.project_access_history(id bigint generated always as identity primary key,request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,user_id uuid not null,active boolean not null,can_review boolean not null,revision integer not null,actor_id uuid references auth.users(id) on delete set null,created_at timestamptz not null default now());
alter table public.project_access_history enable row level security;
revoke all on public.project_access_history from public,anon,authenticated;
grant select on public.project_access_history to authenticated;
create policy access_history_staff_read on public.project_access_history for select to authenticated using((select public.is_inquiry_staff()));
create function public.manage_project_client(p_request_id uuid,p_command jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();uid uuid;current public.project_clients;expected integer;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if jsonb_typeof(p_command->'userId') is distinct from 'string' or p_command->>'userId'!~'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' or jsonb_typeof(p_command->'active') is distinct from 'boolean' or jsonb_typeof(p_command->'canReview') is distinct from 'boolean' then raise exception 'Invalid assignment' using errcode='22023'; end if;
 uid:=(p_command->>'userId')::uuid;expected:=(p_command->>'expectedRevision')::integer;
 perform 1 from public.project_inquiries where request_id=p_request_id for update;
 if not exists(select 1 from public.inquiry_projects where request_id=p_request_id) or not exists(select 1 from auth.users where id=uid) then return jsonb_build_object('result','not_found'); end if;
 select * into current from public.project_clients where request_id=p_request_id and user_id=uid for update;
 if coalesce(current.revision,0)<>expected then return jsonb_build_object('result','conflict'); end if;
 if current.user_id is not null and current.active=(p_command->>'active')::boolean and current.can_review=(p_command->>'canReview')::boolean then return jsonb_build_object('result','saved'); end if;
 insert into public.project_clients(request_id,user_id,active,can_review,revision) values(p_request_id,uid,(p_command->>'active')::boolean,(p_command->>'canReview')::boolean,1)
 on conflict(request_id,user_id) do update set active=excluded.active,can_review=excluded.can_review,revision=public.project_clients.revision+1,updated_at=now() returning * into current;
 insert into public.project_access_history(request_id,user_id,active,can_review,revision,actor_id) values(p_request_id,uid,current.active,current.can_review,current.revision,actor);
 return jsonb_build_object('result','saved');
end;$$;
revoke all on function public.manage_project_client(uuid,jsonb) from public,anon;
grant execute on function public.manage_project_client(uuid,jsonb) to authenticated;
create table public.portal_auth_limits(kind text not null,bucket text not null,window_start timestamptz not null,count integer not null default 0,primary key(kind,bucket,window_start));
alter table public.portal_auth_limits enable row level security;
revoke all on public.portal_auth_limits from public,anon,authenticated;
grant select,insert,update,delete on public.portal_auth_limits to service_role;
create function public.reserve_portal_auth_action(p_kind text,p_bucket text) returns boolean language plpgsql security invoker set search_path='' as $$
declare w timestamptz:=date_trunc('hour',now());g integer;b integer;
begin
 if p_kind is null or p_kind not in ('recovery','invite') or p_bucket is null or p_bucket!~'^[a-f0-9]{64}$' then raise exception 'Invalid auth request' using errcode='22023'; end if;
 insert into public.portal_auth_limits(kind,bucket,window_start) values(p_kind,'global',w) on conflict do nothing;
 select count into g from public.portal_auth_limits where kind=p_kind and bucket='global' and window_start=w for update;
 if g>=100 then return false; end if;
 insert into public.portal_auth_limits(kind,bucket,window_start) values(p_kind,p_bucket,w) on conflict do nothing;
 select count into b from public.portal_auth_limits where kind=p_kind and bucket=p_bucket and window_start=w for update;
 if b>=3 then return false; end if;
 update public.portal_auth_limits set count=count+1 where kind=p_kind and window_start=w and bucket in ('global',p_bucket);
 return true;
end;$$;
revoke all on function public.reserve_portal_auth_action(text,text) from public,anon,authenticated;
grant execute on function public.reserve_portal_auth_action(text,text) to service_role;
commit;
