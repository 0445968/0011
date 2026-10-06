-- Requires migrations 001–005. Staff project management.
begin;
create table public.inquiry_projects (
 request_id uuid primary key references public.project_inquiries(request_id) on delete cascade,
 proposal_version integer not null,revision integer not null check(revision>0),
 state text not null check(state in ('active','on_hold','completed')),
 body jsonb not null check(jsonb_typeof(body)='object' and octet_length(body::text)<=393216),
 scope_snapshot jsonb not null,onboarding_snapshot jsonb not null,readiness_snapshot jsonb not null,
 activated_readiness_revision integer not null,activated_onboarding_revision integer not null,
 activated_at timestamptz not null default now(),activated_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now(),updated_by uuid references auth.users(id) on delete set null,
 foreign key(request_id,proposal_version) references public.inquiry_proposals(request_id,version)
);
create table public.inquiry_project_history (
 id bigint generated always as identity primary key,request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 action text not null check(action in ('activate','save','hold','resume','complete','reopen')),reason text not null default '' check(length(reason)<=2000),
 snapshot jsonb not null,actor uuid references auth.users(id) on delete set null,created_at timestamptz not null default now()
);
alter table public.inquiry_projects enable row level security;
alter table public.inquiry_project_history enable row level security;
revoke all on public.inquiry_projects,public.inquiry_project_history from public,anon,authenticated;
grant select on public.inquiry_projects,public.inquiry_project_history to authenticated;
create policy projects_staff_read on public.inquiry_projects for select to authenticated using((select public.is_inquiry_staff()));
create policy project_history_staff_read on public.inquiry_project_history for select to authenticated using((select public.is_inquiry_staff()));

create function public.project_prerequisites_met(p_id uuid) returns boolean language sql stable set search_path='' as $$
 select exists(select 1 from public.project_inquiries i
 join public.inquiry_proposals p on p.request_id=i.request_id and p.status='accepted'
 join public.inquiry_readiness g on g.request_id=i.request_id and g.proposal_version=p.version
 join public.inquiry_onboarding o on o.request_id=i.request_id and o.proposal_version=p.version
 where i.request_id=p_id and i.status='qualified' and g.state='ready' and o.state='complete' and o.completed_readiness_revision=g.revision);
$$;
revoke all on function public.project_prerequisites_met(uuid) from public,anon,authenticated;
create function public.valid_project_body(b jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare k text; item jsonb; collection text; max_len integer; d date;
begin
 if b is null or jsonb_typeof(b)<>'object' or octet_length(b::text)>393216 then return false; end if;
 if (select count(*) from jsonb_object_keys(b))<>5 then return false; end if;
 foreach k in array array['title','owner','notes'] loop
  max_len:=case k when 'notes' then 4000 else 200 end;
  if jsonb_typeof(b->k) is distinct from 'string' or length(b->>k)>max_len then return false; end if;
 end loop;
 if length(btrim(b->>'title'))=0 then return false; end if;
 foreach collection in array array['milestones','tasks'] loop
  if jsonb_typeof(b->collection) is distinct from 'array' then return false; end if;
  if jsonb_array_length(b->collection)>(case collection when 'milestones' then 20 else 100 end) then return false; end if;
  for item in select value from jsonb_array_elements(b->collection) loop
   if jsonb_typeof(item)<>'object' or (select count(*) from jsonb_object_keys(item))<>(case collection when 'milestones' then 4 else 7 end) then return false; end if;
   foreach k in array array['id','title','status'] loop
    max_len:=case k when 'id' then 100 when 'title' then 300 else 11 end;
    if jsonb_typeof(item->k) is distinct from 'string' or length(item->>k)>max_len or length(btrim(item->>k))=0 then return false; end if;
   end loop;
   if jsonb_typeof(item->'dueOn') is distinct from 'null' then
    if jsonb_typeof(item->'dueOn') is distinct from 'string' or item->>'dueOn'!~'^\d{4}-\d{2}-\d{2}$' then return false; end if;
    d:=(item->>'dueOn')::date;
   end if;
   if collection='milestones' then
    if item->>'status' not in ('planned','in_progress','done') then return false; end if;
   else
    if item->>'status' not in ('todo','doing','blocked','done') or jsonb_typeof(item->'owner') is distinct from 'string' or length(item->>'owner')>200 or jsonb_typeof(item->'notes') is distinct from 'string' or length(item->>'notes')>2000 then return false; end if;
    if jsonb_typeof(item->'milestoneId') is distinct from 'null' then
     if jsonb_typeof(item->'milestoneId') is distinct from 'string' or not exists(select 1 from jsonb_array_elements(b->'milestones') m where m->>'id'=item->>'milestoneId') then return false; end if;
    end if;
   end if;
  end loop;
  if (select count(distinct value->>'id') from jsonb_array_elements(b->collection))<>jsonb_array_length(b->collection) then return false; end if;
 end loop;
 return true;
exception when others then return false;
end;$$;
revoke all on function public.valid_project_body(jsonb) from public,anon,authenticated;

create function public.manage_inquiry_project(p_request_id uuid,p_command jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();action text:=p_command->>'action';expected integer;current_row public.inquiry_projects%rowtype;
 p public.inquiry_proposals%rowtype;g public.inquiry_readiness%rowtype;o public.inquiry_onboarding%rowtype;
 b jsonb;next_state text;reason text:='';next_revision integer;
begin
 if actor is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501'; end if;
 if p_command is null or jsonb_typeof(p_command)<>'object' or action is null or action not in ('activate','save','hold','resume','complete','reopen') or jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^\d+$' then raise exception 'Invalid command' using errcode='22023'; end if;
 expected:=(p_command->>'expectedRevision')::integer;
 perform 1 from public.project_inquiries where request_id=p_request_id for update;
 if not found then return jsonb_build_object('result','not_found'); end if;
 select * into current_row from public.inquiry_projects where request_id=p_request_id for update;
 if action='activate' then
  if current_row.request_id is not null or expected<>0 then return jsonb_build_object('result','conflict'); end if;
 else
  if current_row.request_id is null then return jsonb_build_object('result','not_found'); end if;
  if current_row.revision<>expected then return jsonb_build_object('result','conflict'); end if;
 end if;
 if action in ('activate','resume','complete') and not public.project_prerequisites_met(p_request_id) then return jsonb_build_object('result','gate_closed'); end if;
 if action<>'activate' and action in ('resume','complete') and not exists(select 1 from public.inquiry_proposals where request_id=p_request_id and version=current_row.proposal_version and status='accepted') then return jsonb_build_object('result','gate_closed'); end if;
 b:=current_row.body;next_state:=current_row.state;next_revision:=expected+1;
 if action='activate' then
  select * into p from public.inquiry_proposals where request_id=p_request_id and status='accepted';
  select * into g from public.inquiry_readiness where request_id=p_request_id;
  select * into o from public.inquiry_onboarding where request_id=p_request_id;
  b:=jsonb_build_object('title',p.body->>'title','owner','','notes','','milestones','[]'::jsonb,'tasks','[]'::jsonb);next_state:='active';
  insert into public.inquiry_projects(request_id,proposal_version,revision,state,body,scope_snapshot,onboarding_snapshot,readiness_snapshot,activated_readiness_revision,activated_onboarding_revision,activated_by,updated_by)
  values(p_request_id,p.version,next_revision,next_state,b,p.body,o.body,g.body,g.revision,o.revision,actor,actor);
 else
  if action='save' then
   if next_state='completed' then return jsonb_build_object('result','locked'); end if;
   b:=p_command->'body';if not public.valid_project_body(b) then raise exception 'Invalid project data' using errcode='22023'; end if;
  else
   if jsonb_typeof(p_command->'reason') is distinct from 'string' or length(btrim(p_command->>'reason')) not between 1 and 2000 then raise exception 'Decision reason required' using errcode='22023'; end if;
   reason:=btrim(p_command->>'reason');
   if action='hold' then
    if next_state<>'active' then return jsonb_build_object('result','locked'); end if;next_state:='on_hold';
   elsif action='resume' then
    if next_state<>'on_hold' then return jsonb_build_object('result','locked'); end if;next_state:='active';
   elsif action='reopen' then
    if next_state<>'completed' then return jsonb_build_object('result','locked'); end if;next_state:='on_hold';
   elsif action='complete' then
    if next_state<>'active' then return jsonb_build_object('result','locked'); end if;
    if jsonb_array_length(b->'tasks')=0 or exists(select 1 from jsonb_array_elements(b->'tasks') where value->>'status'<>'done') or exists(select 1 from jsonb_array_elements(b->'milestones') where value->>'status'<>'done') then return jsonb_build_object('result','incomplete'); end if;next_state:='completed';
   end if;
  end if;
  update public.inquiry_projects set body=b,state=next_state,revision=next_revision,updated_at=now(),updated_by=actor where request_id=p_request_id;
 end if;
 insert into public.inquiry_project_history(request_id,action,reason,snapshot,actor) values(p_request_id,action,reason,jsonb_build_object('revision',next_revision,'state',next_state,'body',b),actor);
 return jsonb_build_object('result','saved','revision',next_revision);
end;$$;
revoke all on function public.manage_inquiry_project(uuid,jsonb) from public,anon;
grant execute on function public.manage_inquiry_project(uuid,jsonb) to authenticated;
commit;
