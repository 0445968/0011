-- Private, per-staff work plan drafts. Never modifies the published project.
begin;

create table public.project_workplan_drafts (
  request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
  staff_id uuid not null references auth.users(id) on delete cascade,
  base_revision integer not null check (base_revision > 0),
  body jsonb not null check (jsonb_typeof(body) = 'object' and octet_length(body::text) <= 393216),
  updated_at timestamptz not null default now(),
  primary key (request_id, staff_id)
);

alter table public.project_workplan_drafts enable row level security;
revoke all on public.project_workplan_drafts from public, anon, authenticated, service_role;
grant select, insert, update, delete on public.project_workplan_drafts to authenticated;

create policy workplan_draft_staff_self_select on public.project_workplan_drafts
  for select to authenticated
  using (staff_id = (select auth.uid()) and (select public.is_inquiry_staff()));
create policy workplan_draft_staff_self_insert on public.project_workplan_drafts
  for insert to authenticated
  with check (staff_id = (select auth.uid()) and (select public.is_inquiry_staff()));
create policy workplan_draft_staff_self_update on public.project_workplan_drafts
  for update to authenticated
  using (staff_id = (select auth.uid()) and (select public.is_inquiry_staff()))
  with check (staff_id = (select auth.uid()) and (select public.is_inquiry_staff()));
create policy workplan_draft_staff_self_delete on public.project_workplan_drafts
  for delete to authenticated
  using (staff_id = (select auth.uid()) and (select public.is_inquiry_staff()));

commit;
