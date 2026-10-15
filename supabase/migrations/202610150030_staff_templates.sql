begin;
create table public.staff_templates (
 id uuid primary key,owner_id uuid references auth.users(id) on delete set null,
 title text not null check(length(btrim(title)) between 1 and 200),
 kind text not null check(kind in ('project','proposal','brief','message')),
 description text not null default '' check(length(description)<=1000),
 visibility text not null check(visibility in ('personal','workspace')),
 archived boolean not null default false,current_version integer not null check(current_version>0),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table public.staff_template_versions (
 template_id uuid not null references public.staff_templates(id) on delete cascade,
 version integer not null check(version>0),title text not null,kind text not null,description text not null,
 content text not null check(length(btrim(content)) between 1 and 30000),
 visibility text not null check(visibility in ('personal','workspace')),archived boolean not null,
 change_note text not null check(length(btrim(change_note)) between 1 and 500),
 created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now(),
 primary key(template_id,version)
);
create index staff_templates_directory on public.staff_templates(archived,kind,updated_at desc,id);
create index staff_templates_owner on public.staff_templates(owner_id,updated_at desc);
alter table public.staff_templates enable row level security;
alter table public.staff_template_versions enable row level security;
create policy staff_templates_read on public.staff_templates for select to authenticated
 using((select public.is_inquiry_staff()) and (owner_id=(select auth.uid()) or visibility='workspace'));
create policy staff_template_versions_read on public.staff_template_versions for select to authenticated
 using((select public.is_inquiry_staff()) and exists(select 1 from public.staff_templates t where t.id=template_id
 and (t.owner_id=(select auth.uid()) or (t.visibility='workspace' and staff_template_versions.visibility='workspace'))));
revoke all on public.staff_templates,public.staff_template_versions from public,anon,authenticated,service_role;
grant select on public.staff_templates,public.staff_template_versions to authenticated;

create function public.manage_staff_template(p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
<<template_values>>
declare actor uuid:=auth.uid();act text:=p_command->>'action';tid uuid;t public.staff_templates;v public.staff_template_versions;
 title text;kind text;descr text;visibility text;content text;note text;expected integer;next_version integer;archived boolean;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if p_command is null or jsonb_typeof(p_command)<>'object' or act is null or act not in ('create','save','archive','restore','duplicate') then raise exception 'Invalid template action' using errcode='22023';end if;
 if act='create' then
  if jsonb_typeof(p_command->'id') is distinct from 'string' or p_command->>'id'!~'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then raise exception 'Invalid template ID' using errcode='22023';end if;
  tid:=(p_command->>'id')::uuid;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(tid::text,30));
  if exists(select 1 from public.staff_templates where id=tid) then return jsonb_build_object('result','conflict');end if;
  next_version:=1;archived:=false;
 else
  if jsonb_typeof(p_command->'id') is distinct from 'string' or p_command->>'id'!~'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then raise exception 'Invalid template ID' using errcode='22023';end if;
  select * into t from public.staff_templates where id=(p_command->>'id')::uuid for update;
  if not found or (t.owner_id is distinct from actor and t.visibility<>'workspace') then return jsonb_build_object('result','not_found');end if;
  if jsonb_typeof(p_command->'expectedVersion') is distinct from 'number' or p_command->>'expectedVersion'!~'^[1-9][0-9]{0,7}$' then raise exception 'Invalid template version' using errcode='22023';end if;
  expected:=(p_command->>'expectedVersion')::integer;
  if expected<>t.current_version then return jsonb_build_object('result','conflict');end if;
  select * into v from public.staff_template_versions where template_id=t.id and version=t.current_version;
  if not found then raise exception 'Template content unavailable';end if;
  if act='duplicate' then
   tid:=gen_random_uuid();next_version:=1;archived:=false;
   title:=left(t.title,193)||' (copy)';kind:=t.kind;descr:=t.description;visibility:='personal';content:=v.content;note:='Duplicated from an accessible template';
  else
   if t.owner_id is distinct from actor then raise exception 'Only the owner can change this template' using errcode='42501';end if;
   if act='save' and t.archived then return jsonb_build_object('result','locked');end if;
   if act='archive' and t.archived or act='restore' and not t.archived then return jsonb_build_object('result','conflict');end if;
   tid:=t.id;next_version:=t.current_version+1;archived:=case when act='archive' then true when act='restore' then false else t.archived end;
   if act in ('archive','restore') then
    title:=t.title;kind:=t.kind;descr:=t.description;visibility:=t.visibility;content:=v.content;
    note:=case when act='archive' then 'Archived template' else 'Restored template' end;
   end if;
  end if;
 end if;
 if act in ('create','save') then
  if jsonb_typeof(p_command->'title') is distinct from 'string' or jsonb_typeof(p_command->'kind') is distinct from 'string' or jsonb_typeof(p_command->'description') is distinct from 'string' or jsonb_typeof(p_command->'visibility') is distinct from 'string' or jsonb_typeof(p_command->'content') is distinct from 'string' or jsonb_typeof(p_command->'changeNote') is distinct from 'string' then raise exception 'Invalid template fields' using errcode='22023';end if;
  title:=btrim(p_command->>'title');kind:=p_command->>'kind';descr:=btrim(p_command->>'description');visibility:=p_command->>'visibility';content:=p_command->>'content';note:=btrim(p_command->>'changeNote');
 end if;
 if length(title) not between 1 and 200 or kind not in ('project','proposal','brief','message') or length(descr)>1000 or visibility not in ('personal','workspace') or length(btrim(content)) not between 1 and 30000 or length(btrim(note)) not between 1 and 500 then raise exception 'Invalid template fields' using errcode='22023';end if;
 if act in ('create','duplicate') then
  insert into public.staff_templates(id,owner_id,title,kind,description,visibility,archived,current_version) values(tid,actor,title,kind,descr,visibility,archived,next_version);
 else
  update public.staff_templates set title=template_values.title,kind=template_values.kind,description=descr,visibility=template_values.visibility,archived=template_values.archived,current_version=next_version,updated_at=now() where id=tid;
 end if;
 insert into public.staff_template_versions(template_id,version,title,kind,description,content,visibility,archived,change_note,created_by)
 values(tid,next_version,title,kind,descr,content,visibility,archived,note,actor);
 return jsonb_build_object('result','saved','id',tid,'version',next_version);
end;
$$;
revoke all on function public.manage_staff_template(jsonb) from public,anon,service_role;
grant execute on function public.manage_staff_template(jsonb) to authenticated;
commit;
