-- Additive migration. Requires 202610060001_project_inquiries.sql already applied.
begin;
create table public.inquiry_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.inquiry_staff enable row level security;
revoke all on public.inquiry_staff from public, anon, authenticated;
grant select, insert, update, delete on public.inquiry_staff to service_role;

create function public.is_inquiry_staff() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.inquiry_staff where user_id = auth.uid() and active = true
  );
$$;
revoke all on function public.is_inquiry_staff() from public, anon;
grant execute on function public.is_inquiry_staff() to authenticated;

alter table public.project_inquiries
  add column revision integer not null default 0,
  add column reviewed_at timestamptz,
  add column reviewed_by uuid references auth.users(id) on delete set null,
  add column decision_note text not null default '' check (length(decision_note) <= 2000);

create table public.inquiry_review_history (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.project_inquiries(request_id) on delete cascade,
  reviewed_by uuid references auth.users(id) on delete set null,
  previous_status text not null,
  next_status text not null,
  note text not null check (length(note) <= 2000),
  created_at timestamptz not null default now()
);
alter table public.inquiry_review_history enable row level security;
revoke all on public.inquiry_review_history from public, anon, authenticated;
grant select on public.project_inquiries, public.inquiry_review_history to authenticated;
create policy inquiry_staff_read on public.project_inquiries for select to authenticated
  using ((select public.is_inquiry_staff()));
create policy inquiry_review_staff_read on public.inquiry_review_history for select to authenticated
  using ((select public.is_inquiry_staff()));

create function public.review_project_inquiry(
  p_request_id uuid,
  p_expected_revision integer,
  p_status text,
  p_note text
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  current_row public.project_inquiries%rowtype;
  actor uuid := auth.uid();
begin
  if actor is null or not public.is_inquiry_staff() then
    raise exception 'Staff authorization required' using errcode = '42501';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 or p_status is null
    or p_status not in ('new', 'qualified', 'declined') or p_note is null or length(p_note) > 2000 then
    raise exception 'Invalid review' using errcode = '22023';
  end if;
  select * into current_row from public.project_inquiries where request_id = p_request_id for update;
  if not found then return jsonb_build_object('result', 'not_found'); end if;
  if current_row.revision <> p_expected_revision then return jsonb_build_object('result', 'conflict'); end if;
  if current_row.status = p_status and current_row.decision_note = p_note then
    return jsonb_build_object('result', 'unchanged', 'revision', current_row.revision);
  end if;
  update public.project_inquiries
    set status = p_status, decision_note = p_note, reviewed_by = actor,
        reviewed_at = now(), revision = revision + 1
    where request_id = p_request_id;
  insert into public.inquiry_review_history(request_id, reviewed_by, previous_status, next_status, note)
    values (p_request_id, actor, current_row.status, p_status, p_note);
  return jsonb_build_object('result', 'updated', 'revision', current_row.revision + 1);
end;
$$;
revoke all on function public.review_project_inquiry(uuid, integer, text, text) from public, anon;
grant execute on function public.review_project_inquiry(uuid, integer, text, text) to authenticated;
commit;
