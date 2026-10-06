-- Apply to the intended Supabase project before enabling the submission endpoint.
-- Incoming leads only: this does not create client accounts or active projects.
begin;

create table public.project_inquiries (
  request_id uuid primary key,
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 51200),
  payload_hash text not null check (length(payload_hash) = 64),
  status text not null default 'new' check (status in ('new', 'qualified', 'declined')),
  created_at timestamptz not null default now()
);

create table public.inquiry_rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (bucket, window_start)
);

alter table public.project_inquiries enable row level security;
alter table public.inquiry_rate_limits enable row level security;
revoke all on public.project_inquiries, public.inquiry_rate_limits from public, anon, authenticated;
grant select, insert, update on public.project_inquiries to service_role;
grant select, insert, update, delete on public.inquiry_rate_limits to service_role;
-- Deliberately no anon/authenticated policies. There is no public lead lookup endpoint.

create function public.submit_project_inquiry(
  p_request_id uuid,
  p_payload jsonb,
  p_payload_hash text,
  p_email_bucket text
) returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  existing_hash text;
  hour_start timestamptz := date_trunc('hour', now());
  global_count integer;
  email_count integer;
  email_key text := 'email:' || p_email_bucket;
begin
  if p_request_id is null or p_payload_hash is null or p_email_bucket is null
    or p_payload is null or length(p_payload_hash) <> 64 or length(p_email_bucket) <> 64 then
    raise exception 'Invalid inquiry parameters';
  end if;

  -- Serialize retries of the same key even before its row exists.
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  select payload_hash into existing_hash from public.project_inquiries where request_id = p_request_id;
  if found then
    if existing_hash = p_payload_hash then return 'duplicate'; end if;
    return 'conflict';
  end if;

  -- Shared database counters work across server instances. Lock in a consistent order.
  insert into public.inquiry_rate_limits (bucket, window_start) values ('global', hour_start)
    on conflict do nothing;
  select request_count into global_count from public.inquiry_rate_limits
    where bucket = 'global' and window_start = hour_start for update;
  if global_count >= 200 then return 'rate_limited'; end if;

  insert into public.inquiry_rate_limits (bucket, window_start) values (email_key, hour_start)
    on conflict do nothing;
  select request_count into email_count from public.inquiry_rate_limits
    where bucket = email_key and window_start = hour_start for update;
  if email_count >= 5 then return 'rate_limited'; end if;

  insert into public.project_inquiries (request_id, payload, payload_hash)
    values (p_request_id, p_payload, p_payload_hash);
  update public.inquiry_rate_limits set request_count = request_count + 1
    where window_start = hour_start and bucket in ('global', email_key);
  return 'created';
end;
$$;

revoke all on function public.submit_project_inquiry(uuid, jsonb, text, text) from public, anon, authenticated;
grant execute on function public.submit_project_inquiry(uuid, jsonb, text, text) to service_role;
commit;
