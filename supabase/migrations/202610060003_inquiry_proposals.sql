-- Requires inquiry and staff/review migrations. Existing records are preserved.
begin;
create table public.inquiry_proposals (
 request_id uuid not null references public.project_inquiries(request_id) on delete cascade,
 version integer not null check(version > 0), revision integer not null default 0,
 status text not null default 'draft' check(status in ('draft','issued','accepted','declined','superseded')),
 body jsonb not null check(jsonb_typeof(body)='object' and octet_length(body::text)<=65536),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 issued_at timestamptz, accepted_on date, accepted_by text, acceptance_evidence text,
 recorded_by uuid references auth.users(id) on delete set null,
 primary key(request_id,version)
);
create unique index one_accepted_proposal on public.inquiry_proposals(request_id) where status='accepted';
create unique index one_draft_proposal on public.inquiry_proposals(request_id) where status='draft';
alter table public.inquiry_proposals enable row level security;
revoke all on public.inquiry_proposals from public,anon,authenticated;
grant select on public.inquiry_proposals to authenticated;
create policy inquiry_proposals_staff_read on public.inquiry_proposals for select to authenticated using((select public.is_inquiry_staff()));

create function public.valid_proposal_body(b jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare k text; item jsonb; max_len integer;
begin
 if b is null or jsonb_typeof(b)<>'object' or octet_length(b::text)>65536 then return false; end if;
 if (select count(*) from jsonb_object_keys(b))<>9 then return false; end if;
 foreach k in array array['title','summary','deliverables','exclusions','clientInputs','revisions','schedule','fees'] loop
  max_len:=case k when 'title' then 200 when 'deliverables' then 6000 when 'revisions' then 2000 when 'schedule' then 2000 else 4000 end;
  if jsonb_typeof(b->k) is distinct from 'string' or length(b->>k)>max_len then return false; end if;
 end loop;
 -- Nine keys: eight text fields plus service items.
 if length(btrim(b->>'title'))=0 or jsonb_typeof(b->'items') is distinct from 'array' then return false; end if;
 if jsonb_array_length(b->'items')>20 then return false; end if;
 for item in select value from jsonb_array_elements(b->'items') loop
  if jsonb_typeof(item)<>'object' or (select count(*) from jsonb_object_keys(item))<>4 then return false; end if;
  if jsonb_typeof(item->'serviceId') is distinct from 'string' or length(btrim(item->>'serviceId')) not between 1 and 100
   or jsonb_typeof(item->'name') is distinct from 'string' or length(btrim(item->>'name')) not between 1 and 200
   or jsonb_typeof(item->'quantity') is distinct from 'number' then return false; end if;
  if (item->>'quantity')::numeric not between 1 and 1000 or mod((item->>'quantity')::numeric,1)<>0 then return false; end if;
  if jsonb_typeof(item->'blueprintVersion') is distinct from 'null' then
   if jsonb_typeof(item->'blueprintVersion') is distinct from 'number' then return false; end if;
   if (item->>'blueprintVersion')::numeric<1 or mod((item->>'blueprintVersion')::numeric,1)<>0 then return false; end if;
  end if;
 end loop;
 return true;
exception when others then return false;
end;$$;
revoke all on function public.valid_proposal_body(jsonb) from public,anon,authenticated;

create function public.manage_inquiry_proposal(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); action text:=p_command->>'action'; latest integer; current_row public.inquiry_proposals%rowtype;
 inquiry_status text; v integer; expected integer; b jsonb; accepted_date date;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if p_command is null or jsonb_typeof(p_command)<>'object' or action is null or action not in ('create','save','issue','accept','decline') then raise exception 'Invalid command' using errcode='22023'; end if;
 -- All proposal commands for an inquiry serialize on the same parent row.
 select status into inquiry_status from public.project_inquiries where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 select coalesce(max(version),0) into latest from public.inquiry_proposals where request_id=p_request_id;
 if action='create' then
  if jsonb_typeof(p_command->'expectedVersion') is distinct from 'number' or (p_command->>'expectedVersion')!~'^\d+$' then raise exception 'Invalid version' using errcode='22023'; end if;
  if latest<>(p_command->>'expectedVersion')::integer then return jsonb_build_object('result','conflict'); end if;
  if inquiry_status<>'qualified' then return jsonb_build_object('result','not_qualified'); end if;
  if exists(select 1 from public.inquiry_proposals where request_id=p_request_id and status in ('draft','accepted')) then return jsonb_build_object('result','locked'); end if;
  b:=p_command->'body';
  if not public.valid_proposal_body(b) then raise exception 'Invalid scope' using errcode='22023'; end if;
  insert into public.inquiry_proposals(request_id,version,body,recorded_by) values(p_request_id,latest+1,b,actor);
  return jsonb_build_object('result','saved','version',latest+1,'revision',0);
 end if;
 if jsonb_typeof(p_command->'version') is distinct from 'number' or (p_command->>'version')!~'^\d+$'
  or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or (p_command->>'expectedRevision')!~'^\d+$' then raise exception 'Invalid version' using errcode='22023'; end if;
 v:=(p_command->>'version')::integer; expected:=(p_command->>'expectedRevision')::integer;
 select * into current_row from public.inquiry_proposals where request_id=p_request_id and version=v for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 if current_row.revision<>expected then return jsonb_build_object('result','conflict'); end if;
 if v<>latest or current_row.status in ('accepted','declined','superseded') then return jsonb_build_object('result','locked'); end if;
 if action='save' then
  if current_row.status<>'draft' then return jsonb_build_object('result','locked'); end if;
  b:=p_command->'body';
  if not public.valid_proposal_body(b) then raise exception 'Invalid scope' using errcode='22023'; end if;
  update public.inquiry_proposals set body=b where request_id=p_request_id and version=v;
 elsif action='issue' then
  if current_row.status<>'draft' then return jsonb_build_object('result','locked'); end if;
  if inquiry_status<>'qualified' then return jsonb_build_object('result','not_qualified'); end if;
  foreach action in array array['summary','deliverables','exclusions','clientInputs','revisions','schedule','fees'] loop
   if length(btrim(current_row.body->>action))=0 then raise exception 'Complete proposal terms' using errcode='22023'; end if;
  end loop;
  update public.inquiry_proposals set status='superseded',revision=revision+1,updated_at=now(),recorded_by=actor where request_id=p_request_id and status='issued';
  update public.inquiry_proposals set status='issued',issued_at=now() where request_id=p_request_id and version=v;
 elsif action='decline' then
  if current_row.status<>'issued' then return jsonb_build_object('result','locked'); end if;
  update public.inquiry_proposals set status='declined' where request_id=p_request_id and version=v;
 elsif action='accept' then
  if inquiry_status<>'qualified' then return jsonb_build_object('result','not_qualified'); end if;
  if current_row.status<>'issued' then return jsonb_build_object('result','locked'); end if;
  if exists(select 1 from public.inquiry_proposals where request_id=p_request_id and status='accepted') then return jsonb_build_object('result','locked'); end if;
  if jsonb_typeof(p_command->'approver') is distinct from 'string' or length(btrim(p_command->>'approver')) not between 1 and 200
   or jsonb_typeof(p_command->'evidence') is distinct from 'string' or length(btrim(p_command->>'evidence')) not between 1 and 2000
   or (p_command->>'acceptedOn') is null or (p_command->>'acceptedOn')!~'^\d{4}-\d{2}-\d{2}$' then raise exception 'Acceptance details required' using errcode='22023'; end if;
  begin accepted_date:=(p_command->>'acceptedOn')::date; exception when others then raise exception 'Invalid acceptance date' using errcode='22023'; end;
  if accepted_date>current_date then raise exception 'Acceptance cannot be in the future' using errcode='22023'; end if;
  update public.inquiry_proposals set status='accepted',accepted_on=accepted_date,accepted_by=btrim(p_command->>'approver'),acceptance_evidence=btrim(p_command->>'evidence') where request_id=p_request_id and version=v;
 end if;
 update public.inquiry_proposals set revision=revision+1,updated_at=now(),recorded_by=actor where request_id=p_request_id and version=v;
 return jsonb_build_object('result','saved','version',v,'revision',expected+1);
end;$$;
revoke all on function public.manage_inquiry_proposal(uuid,jsonb) from public,anon;
grant execute on function public.manage_inquiry_proposal(uuid,jsonb) to authenticated;
commit;
