-- Persist per-project phase color overrides with staff-only reads and audited writes.
begin;

create table public.project_phase_colors (
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  phase text not null check (phase in ('inquiry','proposal-onboarding','discovery','direction','production','review','qa','delivery','handoff')),
  color text check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key (request_id, phase)
);

create table public.project_phase_color_history (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  phase text not null check (phase in ('inquiry','proposal-onboarding','discovery','direction','production','review','qa','delivery','handoff')),
  previous_color text check (previous_color is null or previous_color ~ '^#[0-9A-Fa-f]{6}$'),
  next_color text check (next_color is null or next_color ~ '^#[0-9A-Fa-f]{6}$'),
  revision integer not null check (revision > 0),
  reason text not null default '' check (length(reason) <= 2000),
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index project_phase_color_history_project on public.project_phase_color_history(request_id, id desc);

alter table public.project_phase_colors enable row level security;
alter table public.project_phase_color_history enable row level security;
revoke all on public.project_phase_colors, public.project_phase_color_history from public, anon, authenticated, service_role;
grant select on public.project_phase_colors, public.project_phase_color_history to authenticated;
create policy phase_colors_staff_read on public.project_phase_colors for select to authenticated
  using ((select public.is_inquiry_staff()));
create policy phase_color_history_staff_read on public.project_phase_color_history for select to authenticated
  using ((select public.is_inquiry_staff()));

create function public.staff_project_phase_colors(p_request uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare result jsonb; project_version integer;
begin
  if auth.uid() is null or not public.is_inquiry_staff() then
    raise exception 'Staff authorization required' using errcode = '42501';
  end if;
  select revision into project_version from public.inquiry_projects where request_id = p_request;
  if project_version is null then raise exception 'Project not found' using errcode = '22023'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'phase', names.phase, 'color', setting.color, 'revision', coalesce(setting.revision, 0)
  ) order by names.position), '[]'::jsonb) into result
  from (values (1,'inquiry'),(2,'proposal-onboarding'),(3,'discovery'),(4,'direction'),
    (5,'production'),(6,'review'),(7,'qa'),(8,'delivery'),(9,'handoff')) names(position, phase)
  left join public.project_phase_colors setting on setting.request_id = p_request and setting.phase = names.phase;
  return jsonb_build_object('projectRevision', project_version, 'colors', result);
end;
$$;
revoke all on function public.staff_project_phase_colors(uuid) from public, anon, service_role;
grant execute on function public.staff_project_phase_colors(uuid) to authenticated;

create function public.manage_project_phase_color(
  p_request uuid, p_phase text, p_color text, p_revision integer, p_reason text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); project_row public.inquiry_projects%rowtype;
  previous_color text; current_revision integer; next_revision integer;
begin
  if actor is null or not public.is_inquiry_staff() then
    raise exception 'Staff authorization required' using errcode = '42501';
  end if;
  if p_phase not in ('inquiry','proposal-onboarding','discovery','direction','production','review','qa','delivery','handoff')
    or p_revision is null or p_revision < 0
    or (p_color is not null and p_color !~ '^#[0-9A-Fa-f]{6}$')
    or p_reason is null or length(p_reason) > 2000 then
    raise exception 'Invalid phase color command' using errcode = '22023';
  end if;

  select * into project_row from public.inquiry_projects where request_id = p_request for update;
  if not found then return jsonb_build_object('result', 'not_found'); end if;
  if project_row.state = 'completed' then return jsonb_build_object('result', 'locked'); end if;

  select color, revision into previous_color, current_revision
    from public.project_phase_colors where request_id = p_request and phase = p_phase for update;
  current_revision := coalesce(current_revision, 0);
  if current_revision <> p_revision then
    return jsonb_build_object('result', 'conflict', 'revision', current_revision);
  end if;
  next_revision := current_revision + 1;
  insert into public.project_phase_colors(request_id, phase, color, revision, updated_at, updated_by)
    values (p_request, p_phase, upper(p_color), next_revision, now(), actor)
  on conflict (request_id, phase) do update set
    color = excluded.color, revision = excluded.revision, updated_at = excluded.updated_at, updated_by = excluded.updated_by;
  insert into public.project_phase_color_history(request_id, phase, previous_color, next_color, revision, reason, actor)
    values (p_request, p_phase, previous_color, upper(p_color), next_revision, p_reason, actor);
  return jsonb_build_object('result', 'saved', 'revision', next_revision, 'color', upper(p_color));
end;
$$;
revoke all on function public.manage_project_phase_color(uuid, text, text, integer, text) from public, anon, service_role;
grant execute on function public.manage_project_phase_color(uuid, text, text, integer, text) to authenticated;

commit;
