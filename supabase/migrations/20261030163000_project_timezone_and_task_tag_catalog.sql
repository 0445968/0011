-- Project task scheduling defaults and editable, project-scoped task tag labels.
create table public.project_workspace_settings (
 request_id uuid primary key references public.inquiry_projects(request_id) on delete cascade,
 timezone text not null default 'America/Chicago',
 revision integer not null default 1 check(revision>0),
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id) on delete set null,
 check(length(timezone) between 1 and 100)
);
alter table public.project_workspace_settings enable row level security;
revoke all on public.project_workspace_settings from public,anon,authenticated,service_role;
grant select on public.project_workspace_settings to authenticated;
create policy project_workspace_settings_staff_read on public.project_workspace_settings
 for select to authenticated using((select public.is_inquiry_staff()));

insert into public.project_workspace_settings(request_id)
select request_id from public.inquiry_projects on conflict(request_id) do nothing;

create function public.seed_project_workspace_settings() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 insert into public.project_workspace_settings(request_id) values(new.request_id) on conflict(request_id) do nothing;
 return new;
end;$$;
revoke all on function public.seed_project_workspace_settings() from public,anon,authenticated,service_role;
create trigger project_workspace_settings_seed after insert on public.inquiry_projects
 for each row execute function public.seed_project_workspace_settings();

create function public.set_project_workspace_timezone(p_request uuid,p_timezone text,p_revision integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare project public.inquiry_projects%rowtype; setting public.project_workspace_settings%rowtype;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if p_timezone is null or not exists(select 1 from pg_catalog.pg_timezone_names where name=p_timezone) then raise exception 'Invalid project timezone' using errcode='22023';end if;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if project.state='completed' or exists(select 1 from public.project_operational_status where request_id=p_request and status='inactive') then return jsonb_build_object('result','locked');end if;
 select * into setting from public.project_workspace_settings where request_id=p_request for update;
 if not found then insert into public.project_workspace_settings(request_id) values(p_request) returning * into setting;end if;
 if setting.revision is distinct from p_revision then return jsonb_build_object('result','conflict');end if;
 if setting.timezone=p_timezone then return jsonb_build_object('result','saved','revision',setting.revision);end if;
 update public.project_workspace_settings set timezone=p_timezone,revision=revision+1,updated_at=now(),updated_by=auth.uid() where request_id=p_request;
 return jsonb_build_object('result','saved','revision',setting.revision+1);
end;$$;
revoke all on function public.set_project_workspace_timezone(uuid,text,integer) from public,anon,service_role;
grant execute on function public.set_project_workspace_timezone(uuid,text,integer) to authenticated;

create table public.project_task_tag_catalog (
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 tag_key text not null check(length(tag_key) between 1 and 40),
 label text not null check(length(btrim(label)) between 1 and 40),
 color text not null default 'gray' check(color in ('gray','blue','purple','green','yellow','orange','red','pink','cyan')),
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id) on delete set null,
 primary key(request_id,tag_key)
);
create unique index project_task_tag_catalog_label on public.project_task_tag_catalog(request_id,lower(label));
alter table public.project_task_tag_catalog enable row level security;
revoke all on public.project_task_tag_catalog from public,anon,authenticated,service_role;
grant select on public.project_task_tag_catalog to authenticated;
create policy project_task_tag_catalog_staff_read on public.project_task_tag_catalog
 for select to authenticated using((select public.is_inquiry_staff()));

create table public.project_task_tag_history (
 id bigint generated always as identity primary key,
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 tag_key text not null,
 before_value jsonb,
 after_value jsonb not null,
 actor uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
alter table public.project_task_tag_history enable row level security;
revoke all on public.project_task_tag_history from public,anon,authenticated,service_role;
grant select on public.project_task_tag_history to authenticated;
create policy project_task_tag_history_staff_read on public.project_task_tag_history
 for select to authenticated using((select public.is_inquiry_staff()));

insert into public.project_task_tag_catalog(request_id,tag_key,label)
select distinct presentation.request_id,tag,tag
from public.project_task_presentation presentation
cross join lateral unnest(presentation.tags) tag
on conflict(request_id,tag_key) do nothing;

create function public.capture_project_task_tag_catalog() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 insert into public.project_task_tag_catalog(request_id,tag_key,label)
 select new.request_id,tag,tag from unnest(new.tags) tag
 on conflict(request_id,tag_key) do nothing;
 return new;
end;$$;
revoke all on function public.capture_project_task_tag_catalog() from public,anon,authenticated,service_role;
create trigger project_task_tag_catalog_sync after insert or update of tags on public.project_task_presentation
 for each row execute function public.capture_project_task_tag_catalog();

create function public.set_project_task_tags_with_catalog(
 p_request uuid,p_task text,p_tags text[],p_revision integer,p_project_revision integer,
 p_new_tag_label text default null,p_new_tag_color text default 'gray'
) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;new_tag_key text;
begin
 if p_new_tag_label is not null then
  if length(btrim(p_new_tag_label)) not between 1 and 40
    or p_new_tag_color not in ('gray','blue','purple','green','yellow','orange','red','pink','cyan') then
   raise exception 'Invalid task tag' using errcode='22023';
  end if;
  new_tag_key:=lower(btrim(p_new_tag_label));
  if p_tags is null or not (new_tag_key=any(p_tags)) then raise exception 'Assign the new tag before saving' using errcode='22023';end if;
 end if;
 result:=public.set_project_task_tags(p_request,p_task,p_tags,p_revision,p_project_revision);
 if result->>'result'<>'saved' then return result;end if;
 if p_new_tag_label is not null then
  insert into public.project_task_tag_catalog(request_id,tag_key,label,color,updated_at,updated_by)
  values(p_request,new_tag_key,btrim(p_new_tag_label),p_new_tag_color,now(),auth.uid())
  on conflict(request_id,tag_key) do update set label=excluded.label,color=excluded.color,updated_at=now(),updated_by=auth.uid();
  insert into public.project_task_tag_history(request_id,tag_key,after_value,actor)
  values(p_request,new_tag_key,jsonb_build_object('label',btrim(p_new_tag_label),'color',p_new_tag_color),auth.uid());
 end if;
 return result;
end;$$;
revoke all on function public.set_project_task_tags_with_catalog(uuid,text,text[],integer,integer,text,text) from public,anon,service_role;
grant execute on function public.set_project_task_tags_with_catalog(uuid,text,text[],integer,integer,text,text) to authenticated;

create function public.update_project_task_tag(p_request uuid,p_project_revision integer,p_tag_key text,p_label text,p_color text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare project public.inquiry_projects%rowtype;item public.project_task_tag_catalog%rowtype;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if p_label is null or length(btrim(p_label)) not between 1 and 40 or p_color not in ('gray','blue','purple','green','yellow','orange','red','pink','cyan') then raise exception 'Invalid task tag' using errcode='22023';end if;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if project.revision is distinct from p_project_revision then return jsonb_build_object('result','conflict');end if;
 if project.state='completed' or exists(select 1 from public.project_operational_status where request_id=p_request and status='inactive') then return jsonb_build_object('result','locked');end if;
 select * into item from public.project_task_tag_catalog where request_id=p_request and tag_key=p_tag_key for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if exists(select 1 from public.project_task_tag_catalog where request_id=p_request and tag_key<>p_tag_key and lower(label)=lower(btrim(p_label))) then raise exception 'A tag with this label already exists' using errcode='23505';end if;
 if item.label=btrim(p_label) and item.color=p_color then return jsonb_build_object('result','saved');end if;
 update public.project_task_tag_catalog set label=btrim(p_label),color=p_color,updated_at=now(),updated_by=auth.uid() where request_id=p_request and tag_key=p_tag_key;
 insert into public.project_task_tag_history(request_id,tag_key,before_value,after_value,actor)
 values(p_request,p_tag_key,jsonb_build_object('label',item.label,'color',item.color),jsonb_build_object('label',btrim(p_label),'color',p_color),auth.uid());
 return jsonb_build_object('result','saved');
end;$$;
revoke all on function public.update_project_task_tag(uuid,integer,text,text,text) from public,anon,service_role;
grant execute on function public.update_project_task_tag(uuid,integer,text,text,text) to authenticated;
