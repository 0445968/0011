-- Requires migrations 001–004. Staff-managed client onboarding.
begin;
create table public.inquiry_onboarding (
 request_id uuid primary key references public.project_inquiries(request_id) on delete cascade,
 proposal_version integer not null,revision integer not null check(revision>0),
 state text not null check(state in ('in_progress','complete')),
 body jsonb not null check(jsonb_typeof(body)='object' and octet_length(body::text)<=98304),
 completed_readiness_revision integer,completed_at timestamptz,completed_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now(),updated_by uuid references auth.users(id) on delete set null,
 foreign key(request_id,proposal_version) references public.inquiry_proposals(request_id,version)
);
create table public.inquiry_onboarding_history (
 id bigint generated always as identity primary key,request_id uuid not null references public.inquiry_onboarding(request_id) on delete cascade,
 action text not null check(action in ('start','save','complete','reopen')),reason text not null default '' check(length(reason)<=2000),
 snapshot jsonb not null,actor uuid references auth.users(id) on delete set null,created_at timestamptz not null default now()
);
alter table public.inquiry_onboarding enable row level security;
alter table public.inquiry_onboarding_history enable row level security;
revoke all on public.inquiry_onboarding,public.inquiry_onboarding_history from public,anon,authenticated;
grant select on public.inquiry_onboarding,public.inquiry_onboarding_history to authenticated;
create policy onboarding_staff_read on public.inquiry_onboarding for select to authenticated using((select public.is_inquiry_staff()));
create policy onboarding_history_staff_read on public.inquiry_onboarding_history for select to authenticated using((select public.is_inquiry_staff()));

create function public.valid_onboarding_body(b jsonb) returns boolean
language plpgsql stable set search_path='' as $$
declare k text; item jsonb; max_len integer; d date;
begin
 if b is null or jsonb_typeof(b)<>'object' or octet_length(b::text)>98304 then return false; end if;
 if (select count(*) from jsonb_object_keys(b))<>8 then return false; end if;
 foreach k in array array['contactName','contactEmail','approver','kickoffStatus','kickoffDetails','kickoffNotes'] loop
  max_len:=case k when 'contactEmail' then 254 when 'kickoffStatus' then 9 when 'kickoffDetails' then 2000 when 'kickoffNotes' then 4000 else 200 end;
  if jsonb_typeof(b->k) is distinct from 'string' or length(b->>k)>max_len then return false; end if;
 end loop;
 if b->>'contactEmail'<>'' and b->>'contactEmail'!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then return false; end if;
 if b->>'kickoffStatus' not in ('pending','scheduled','held') then return false; end if;
 if jsonb_typeof(b->'kickoffDate') is distinct from 'null' then
  if jsonb_typeof(b->'kickoffDate') is distinct from 'string' or b->>'kickoffDate'!~'^\d{4}-\d{2}-\d{2}$' then return false; end if;
  d:=(b->>'kickoffDate')::date;
 end if;
 if b->>'kickoffStatus' in ('scheduled','held') and (d is null or length(btrim(b->>'kickoffDetails'))=0) then return false; end if;
 if b->>'kickoffStatus'='held' and (d>current_date or length(btrim(b->>'kickoffNotes'))=0) then return false; end if;
 if jsonb_typeof(b->'items') is distinct from 'array' then return false; end if;
 if jsonb_array_length(b->'items') not between 3 and 30 then return false; end if;
 for item in select value from jsonb_array_elements(b->'items') loop
  if jsonb_typeof(item)<>'object' or (select count(*) from jsonb_object_keys(item))<>6 then return false; end if;
  foreach k in array array['id','title','owner','status','notes'] loop
   max_len:=case k when 'id' then 100 when 'title' then 300 when 'notes' then 2000 else 8 end;
   if jsonb_typeof(item->k) is distinct from 'string' or length(item->>k)>max_len then return false; end if;
  end loop;
  if length(btrim(item->>'id'))=0 or length(btrim(item->>'title'))=0 or item->>'owner' not in ('client','bivi') or item->>'status' not in ('pending','received','complete','waived') or jsonb_typeof(item->'required') is distinct from 'boolean' then return false; end if;
  if item->>'status' in ('complete','waived') and length(btrim(item->>'notes'))=0 then return false; end if;
 end loop;
 if (select count(distinct value->>'id') from jsonb_array_elements(b->'items'))<>jsonb_array_length(b->'items') then return false; end if;
 foreach k in array array['contacts','scope-inputs','assets'] loop
  if not exists(select 1 from jsonb_array_elements(b->'items') where value->>'id'=k and value->'required'='true'::jsonb) then return false; end if;
 end loop;
 return true;
exception when others then return false;
end;$$;
revoke all on function public.valid_onboarding_body(jsonb) from public,anon,authenticated;

create function public.manage_inquiry_onboarding(p_request_id uuid,p_command jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); action text:=p_command->>'action'; expected integer; inquiry_status text;
 gate public.inquiry_readiness%rowtype; current_row public.inquiry_onboarding%rowtype;
 b jsonb; next_state text; reason text:=''; next_revision integer; completed_gate integer;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if p_command is null or jsonb_typeof(p_command)<>'object' or action is null or action not in ('start','save','complete','reopen') or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^\d+$' then raise exception 'Invalid command' using errcode='22023'; end if;
 expected:=(p_command->>'expectedRevision')::integer;
 select status into inquiry_status from public.project_inquiries where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 select * into gate from public.inquiry_readiness where request_id=p_request_id;
 select * into current_row from public.inquiry_onboarding where request_id=p_request_id for update;
 if action='start' then
  if current_row.request_id is not null or expected<>0 then return jsonb_build_object('result','conflict'); end if;
 else
  if current_row.request_id is null then return jsonb_build_object('result','not_found'); end if;
  if current_row.revision<>expected then return jsonb_build_object('result','conflict'); end if;
 end if;
 if action in ('start','complete') and (inquiry_status<>'qualified' or gate.state is distinct from 'ready' or not exists(select 1 from public.inquiry_proposals where request_id=p_request_id and version=gate.proposal_version and status='accepted') or (action='complete' and current_row.proposal_version<>gate.proposal_version)) then return jsonb_build_object('result','gate_closed'); end if;
 next_state:=coalesce(current_row.state,'in_progress');b:=current_row.body;
 if action='start' then
  b:=jsonb_build_object('contactName','','contactEmail','','approver','','kickoffStatus','pending','kickoffDate',null,'kickoffDetails','','kickoffNotes','','items',jsonb_build_array(
   jsonb_build_object('id','contacts','title','Confirm primary contact and authorized approver','owner','client','required',true,'status','pending','notes',''),
   jsonb_build_object('id','scope-inputs','title','Collect and verify all client inputs in the accepted scope','owner','client','required',true,'status','pending','notes',''),
   jsonb_build_object('id','assets','title','Review existing assets and access requirements','owner','client','required',true,'status','pending','notes','')));
 elsif action='save' then
  if next_state='complete' then return jsonb_build_object('result','locked'); end if;
  b:=p_command->'body';if not public.valid_onboarding_body(b) then raise exception 'Invalid onboarding evidence' using errcode='22023'; end if;
 elsif action='complete' then
  if next_state='complete' then return jsonb_build_object('result','locked'); end if;
  if not public.valid_onboarding_body(b) or length(btrim(b->>'contactName'))=0 or length(btrim(b->>'contactEmail'))=0 or length(btrim(b->>'approver'))=0 or b->>'kickoffStatus'<>'held' or exists(select 1 from jsonb_array_elements(b->'items') where value->'required'='true'::jsonb and value->>'status' not in ('complete','waived')) then return jsonb_build_object('result','incomplete'); end if;
  next_state:='complete';completed_gate:=gate.revision;
 elsif action='reopen' then
  if next_state<>'complete' then return jsonb_build_object('result','locked'); end if;
  if jsonb_typeof(p_command->'reason') is distinct from 'string' or length(btrim(p_command->>'reason')) not between 1 and 2000 then raise exception 'Reopen reason required' using errcode='22023'; end if;
  reason:=btrim(p_command->>'reason');next_state:='in_progress';
 end if;
 next_revision:=expected+1;
 insert into public.inquiry_onboarding(request_id,proposal_version,revision,state,body,completed_readiness_revision,completed_at,completed_by,updated_by)
 values(p_request_id,coalesce(current_row.proposal_version,gate.proposal_version),next_revision,next_state,b,completed_gate,case when next_state='complete' then now() end,case when next_state='complete' then actor end,actor)
 on conflict(request_id) do update set revision=excluded.revision,state=excluded.state,body=excluded.body,completed_readiness_revision=excluded.completed_readiness_revision,completed_at=excluded.completed_at,completed_by=excluded.completed_by,updated_at=now(),updated_by=actor;
 insert into public.inquiry_onboarding_history(request_id,action,reason,snapshot,actor) values(p_request_id,action,reason,jsonb_build_object('revision',next_revision,'proposalVersion',coalesce(current_row.proposal_version,gate.proposal_version),'state',next_state,'body',b,'readinessRevision',completed_gate),actor);
 return jsonb_build_object('result','saved','revision',next_revision);
end;$$;
revoke all on function public.manage_inquiry_onboarding(uuid,jsonb) from public,anon;
grant execute on function public.manage_inquiry_onboarding(uuid,jsonb) to authenticated;
commit;
