-- Additive; requires migrations 001, 002 and 003.
begin;
create table public.inquiry_readiness (
 request_id uuid primary key references public.project_inquiries(request_id) on delete cascade,
 proposal_version integer not null, revision integer not null check(revision>0),
 state text not null default 'pending' check(state in ('pending','ready')),
 body jsonb not null check(jsonb_typeof(body)='object' and octet_length(body::text)<=24576),
 released_at timestamptz, released_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now(), updated_by uuid references auth.users(id) on delete set null,
 foreign key(request_id,proposal_version) references public.inquiry_proposals(request_id,version)
);
create table public.inquiry_readiness_history (
 id bigint generated always as identity primary key,
 request_id uuid not null references public.inquiry_readiness(request_id) on delete cascade,
 action text not null check(action in ('save','release','hold')),
 reason text not null default '' check(length(reason)<=2000),
 snapshot jsonb not null, actor uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
alter table public.inquiry_readiness enable row level security;
alter table public.inquiry_readiness_history enable row level security;
revoke all on public.inquiry_readiness,public.inquiry_readiness_history from public,anon,authenticated;
grant select on public.inquiry_readiness,public.inquiry_readiness_history to authenticated;
create policy readiness_staff_read on public.inquiry_readiness for select to authenticated using((select public.is_inquiry_staff()));
create policy readiness_history_staff_read on public.inquiry_readiness_history for select to authenticated using((select public.is_inquiry_staff()));

create function public.valid_readiness_body(b jsonb) returns boolean
language plpgsql stable set search_path='' as $$
declare k text; d date; max_len integer;
begin
 if b is null or jsonb_typeof(b)<>'object' or octet_length(b::text)>24576 then return false; end if;
 if (select count(*) from jsonb_object_keys(b))<>11 then return false; end if;
 foreach k in array array['agreementStatus','agreementRef','signatory','depositStatus','depositAmount','currency','depositRef','waiverReason','notes'] loop
  max_len:=case k when 'signatory' then 200 when 'notes' then 4000 when 'depositAmount' then 12 when 'currency' then 3 when 'agreementStatus' then 7 when 'depositStatus' then 8 else 2000 end;
  if jsonb_typeof(b->k) is distinct from 'string' or length(b->>k)>max_len then return false; end if;
 end loop;
 if b->>'agreementStatus' not in ('pending','signed') or b->>'depositStatus' not in ('pending','received','waived') then return false; end if;
 if b->>'depositAmount'!~'^(|[0-9]{1,9}(\.[0-9]{1,2})?)$' or b->>'currency'!~'^(|[A-Z]{3})$' then return false; end if;
 foreach k in array array['signedOn','depositOn'] loop
  if jsonb_typeof(b->k) is distinct from 'null' then
   if jsonb_typeof(b->k) is distinct from 'string' or b->>k!~'^\d{4}-\d{2}-\d{2}$' then return false; end if;
   d:=(b->>k)::date; if d>current_date then return false; end if;
  end if;
 end loop;
 if b->>'agreementStatus'='signed' and (length(btrim(b->>'agreementRef'))=0 or length(btrim(b->>'signatory'))=0 or jsonb_typeof(b->'signedOn')='null') then return false; end if;
 if b->>'depositStatus'='received' and (coalesce(nullif(b->>'depositAmount','')::numeric,0)<=0 or length(b->>'currency')<>3 or length(btrim(b->>'depositRef'))=0 or jsonb_typeof(b->'depositOn')='null') then return false; end if;
 if b->>'depositStatus'='waived' and length(btrim(b->>'waiverReason'))=0 then return false; end if;
 return true;
exception when others then return false;
end;$$;
revoke all on function public.valid_readiness_body(jsonb) from public,anon,authenticated;

create function public.manage_inquiry_readiness(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); action text:=p_command->>'action'; expected integer;
 current_row public.inquiry_readiness%rowtype; accepted_version integer; inquiry_status text;
 b jsonb; new_state text; reason text:=''; next_revision integer;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if p_command is null or jsonb_typeof(p_command)<>'object' or action is null or action not in ('save','release','hold')
  or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^\d+$' then raise exception 'Invalid command' using errcode='22023'; end if;
 expected:=(p_command->>'expectedRevision')::integer;
 -- Shared parent lock also serializes against proposal and inquiry decisions.
 select status into inquiry_status from public.project_inquiries where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 select version into accepted_version from public.inquiry_proposals where request_id=p_request_id and status='accepted';
 if not found then return jsonb_build_object('result','no_accepted_scope'); end if;
 select * into current_row from public.inquiry_readiness where request_id=p_request_id for update;
 if not found then
  if action<>'save' then return jsonb_build_object('result','not_found'); end if;
  if expected<>0 then return jsonb_build_object('result','conflict'); end if;
 else
  if current_row.revision<>expected then return jsonb_build_object('result','conflict'); end if;
  if current_row.proposal_version<>accepted_version then return jsonb_build_object('result','no_accepted_scope'); end if;
 end if;
 b:=current_row.body; new_state:=coalesce(current_row.state,'pending');
 if action='save' then
  if new_state='ready' then return jsonb_build_object('result','locked'); end if;
  b:=p_command->'body';if not public.valid_readiness_body(b) then raise exception 'Invalid readiness evidence' using errcode='22023'; end if;
 elsif action='release' then
  if new_state='ready' then return jsonb_build_object('result','locked'); end if;
  if inquiry_status<>'qualified' then return jsonb_build_object('result','not_qualified'); end if;
  if not public.valid_readiness_body(b) or b->>'agreementStatus'<>'signed' or b->>'depositStatus' not in ('received','waived') then return jsonb_build_object('result','incomplete'); end if;
  new_state:='ready';
 elsif action='hold' then
  if new_state<>'ready' then return jsonb_build_object('result','locked'); end if;
  if jsonb_typeof(p_command->'reason') is distinct from 'string' or length(btrim(p_command->>'reason')) not between 1 and 2000 then raise exception 'Hold reason required' using errcode='22023'; end if;
  reason:=btrim(p_command->>'reason');new_state:='pending';
 end if;
 next_revision:=expected+1;
 insert into public.inquiry_readiness(request_id,proposal_version,revision,state,body,released_at,released_by,updated_by)
 values(p_request_id,accepted_version,next_revision,new_state,b,case when new_state='ready' then now() end,case when new_state='ready' then actor end,actor)
 on conflict(request_id) do update set revision=excluded.revision,state=excluded.state,body=excluded.body,released_at=excluded.released_at,released_by=excluded.released_by,updated_at=now(),updated_by=actor;
 insert into public.inquiry_readiness_history(request_id,action,reason,snapshot,actor)
 values(p_request_id,action,reason,jsonb_build_object('proposalVersion',accepted_version,'revision',next_revision,'state',new_state,'body',b),actor);
 return jsonb_build_object('result','saved','revision',next_revision);
end;$$;
revoke all on function public.manage_inquiry_readiness(uuid,jsonb) from public,anon;
grant execute on function public.manage_inquiry_readiness(uuid,jsonb) to authenticated;
commit;
