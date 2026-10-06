-- Requires migrations 001–006. Explicitly published, project-scoped client data.
begin;
create table public.project_clients (
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 active boolean not null default true,can_review boolean not null default false,
 primary key(request_id,user_id)
);
alter table public.project_clients enable row level security;
revoke all on public.project_clients from public,anon,authenticated;
grant select,insert,update,delete on public.project_clients to service_role;
create function public.has_client_project(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.project_clients where request_id=p_id and user_id=auth.uid() and active);
$$;
create function public.can_review_project(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.project_clients where request_id=p_id and user_id=auth.uid() and active and can_review);
$$;
revoke all on function public.has_client_project(uuid),public.can_review_project(uuid) from public,anon;
grant execute on function public.has_client_project(uuid),public.can_review_project(uuid) to authenticated;
create table public.project_publications (
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 version integer not null check(version>0),body jsonb not null check(jsonb_typeof(body)='object' and octet_length(body::text)<=147456),
 created_at timestamptz not null default now(),created_by uuid references auth.users(id) on delete set null,withdrawn boolean not null default false,withdrawn_at timestamptz,withdrawn_by uuid references auth.users(id) on delete set null,
 primary key(request_id,version)
);
create table public.project_client_reviews (
 request_id uuid not null,version integer not null,user_id uuid not null references auth.users(id) on delete cascade,
 decision text not null check(decision in ('approved','changes_requested')),note text not null check(length(note)<=4000),created_at timestamptz not null default now(),
 primary key(request_id,version,user_id),foreign key(request_id,version) references public.project_publications(request_id,version) on delete cascade
);
alter table public.project_publications enable row level security;
alter table public.project_client_reviews enable row level security;
revoke all on public.project_publications,public.project_client_reviews from public,anon,authenticated;
grant select(request_id,version,body,created_at,withdrawn) on public.project_publications to authenticated;
grant select on public.project_client_reviews to authenticated;
create policy published_project_read on public.project_publications for select to authenticated using((select public.is_inquiry_staff()) or (not withdrawn and public.has_client_project(request_id)));
create policy project_review_read on public.project_client_reviews for select to authenticated using((select public.is_inquiry_staff()) or (user_id=auth.uid() and public.has_client_project(request_id)));
-- PostgreSQL 15+ security-invoker view preserves underlying RLS and column grants.
create view public.client_project_latest with(security_invoker=true) as
 select distinct on(request_id) request_id,version,body,created_at from public.project_publications where not withdrawn order by request_id,version desc;
revoke all on public.client_project_latest from public,anon;
grant select on public.client_project_latest to authenticated;

create function public.valid_publication_body(b jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare k text;item jsonb;d date;max_len integer;
begin
 if b is null or jsonb_typeof(b)<>'object' or octet_length(b::text)>147456 or (select count(*) from jsonb_object_keys(b))<>7 then return false; end if;
 foreach k in array array['title','summary','nextSteps'] loop
  max_len:=case k when 'title' then 200 else 4000 end;
  if jsonb_typeof(b->k) is distinct from 'string' or length(b->>k)>max_len then return false; end if;
 end loop;
 if length(btrim(b->>'title'))=0 or length(btrim(b->>'summary'))=0 or jsonb_typeof(b->'reviewRequested') is distinct from 'boolean' or jsonb_typeof(b->'progress') is distinct from 'number' then return false; end if;
 if (b->>'progress')::numeric not between 0 and 100 or mod((b->>'progress')::numeric,1)<>0 then return false; end if;
 foreach k in array array['milestones','deliveries'] loop
  if jsonb_typeof(b->k) is distinct from 'array' then return false; end if;
  if jsonb_array_length(b->k)>20 then return false; end if;
 end loop;
 for item in select value from jsonb_array_elements(b->'milestones') loop
  if jsonb_typeof(item)<>'object' or (select count(*) from jsonb_object_keys(item))<>3 or jsonb_typeof(item->'title') is distinct from 'string' or length(btrim(item->>'title')) not between 1 and 300 or jsonb_typeof(item->'status') is distinct from 'string' or item->>'status' not in ('planned','in_progress','done') then return false; end if;
  if jsonb_typeof(item->'dueOn') is distinct from 'null' then
   if jsonb_typeof(item->'dueOn') is distinct from 'string' or item->>'dueOn'!~'^\d{4}-\d{2}-\d{2}$' then return false; end if;d:=(item->>'dueOn')::date;
  end if;
 end loop;
 for item in select value from jsonb_array_elements(b->'deliveries') loop
  if jsonb_typeof(item)<>'object' or (select count(*) from jsonb_object_keys(item))<>4 then return false; end if;
  foreach k in array array['id','label','url','notes'] loop
   max_len:=case k when 'id' then 100 when 'label' then 300 else 2000 end;
   if jsonb_typeof(item->k) is distinct from 'string' or length(item->>k)>max_len then return false; end if;
  end loop;
  if length(btrim(item->>'id'))=0 or length(btrim(item->>'label'))=0 or item->>'url'!~'^https://[^/?#[:space:]@]+([/?#][^[:space:]]*)?$' then return false; end if;
 end loop;
 if (select count(distinct value->>'id') from jsonb_array_elements(b->'deliveries'))<>jsonb_array_length(b->'deliveries') then return false; end if;
 return true;
exception when others then return false;
end;$$;
revoke all on function public.valid_publication_body(jsonb) from public,anon,authenticated;
create function public.publish_project_update(p_request_id uuid,p_command jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare latest integer;b jsonb;actor uuid:=auth.uid();
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if jsonb_typeof(p_command->'expectedVersion') is distinct from 'number' or p_command->>'expectedVersion'!~'^\d+$' then raise exception 'Invalid version' using errcode='22023'; end if;
 perform 1 from public.project_inquiries where request_id=p_request_id for update;
 if not exists(select 1 from public.inquiry_projects where request_id=p_request_id) then return jsonb_build_object('result','not_found'); end if;
 select coalesce(max(version),0) into latest from public.project_publications where request_id=p_request_id;
 if latest<>(p_command->>'expectedVersion')::integer then return jsonb_build_object('result','conflict'); end if;
 if p_command->>'action'='withdraw' then
  if jsonb_typeof(p_command->'version') is distinct from 'number' or p_command->>'version'!~'^\d+$' then raise exception 'Invalid version' using errcode='22023'; end if;
  update public.project_publications set withdrawn=true,withdrawn_at=now(),withdrawn_by=actor where request_id=p_request_id and version=(p_command->>'version')::integer and not withdrawn;
  if not found then return jsonb_build_object('result','conflict'); end if;
  return jsonb_build_object('result','saved','version',latest);
 end if;
 if p_command->>'action' is distinct from 'publish' then raise exception 'Invalid action' using errcode='22023'; end if;
 b:=p_command->'body';if not public.valid_publication_body(b) then raise exception 'Invalid publication' using errcode='22023'; end if;
 insert into public.project_publications(request_id,version,body,created_by) values(p_request_id,latest+1,b,actor);
 return jsonb_build_object('result','saved','version',latest+1);
end;$$;
revoke all on function public.publish_project_update(uuid,jsonb) from public,anon;
grant execute on function public.publish_project_update(uuid,jsonb) to authenticated;
create function public.review_project_publication(p_request_id uuid,p_command jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare latest integer;v integer;actor uuid:=auth.uid();b jsonb;decision text:=p_command->>'decision';note text:=p_command->>'note';
begin
 if actor is null then raise exception 'Client authorization required' using errcode='42501'; end if;
 perform 1 from public.project_inquiries where request_id=p_request_id for update;
 -- Lock membership so administrative revocation and a decision cannot race.
 perform 1 from public.project_clients where request_id=p_request_id and user_id=actor and active and can_review for update;
 if not found then raise exception 'Client reviewer authorization required' using errcode='42501'; end if;
 if jsonb_typeof(p_command->'version') is distinct from 'number' or p_command->>'version'!~'^\d+$' or decision is null or decision not in ('approved','changes_requested') or jsonb_typeof(p_command->'note') is distinct from 'string' or length(note)>4000 or (decision='changes_requested' and length(btrim(note))=0) then raise exception 'Invalid review' using errcode='22023'; end if;
 v:=(p_command->>'version')::integer;
 select max(version) into latest from public.project_publications where request_id=p_request_id and not withdrawn;
 if latest is null then return jsonb_build_object('result','not_found'); end if;
 if v<>latest or exists(select 1 from public.project_client_reviews where request_id=p_request_id and version=v and user_id=actor) then return jsonb_build_object('result','conflict'); end if;
 select body into b from public.project_publications where request_id=p_request_id and version=v;
 if b->'reviewRequested'<>'true'::jsonb then return jsonb_build_object('result','review_closed'); end if;
 insert into public.project_client_reviews(request_id,version,user_id,decision,note) values(p_request_id,v,actor,decision,btrim(note));
 return jsonb_build_object('result','saved');
end;$$;
revoke all on function public.review_project_publication(uuid,jsonb) from public,anon;
grant execute on function public.review_project_publication(uuid,jsonb) to authenticated;
commit;
