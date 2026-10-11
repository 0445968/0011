-- Requires migrations 001–013. Durable transactional client email outbox,
-- workflow-triggered notices, bounded deadline reminders and retry support.
begin;

/* =========================================================
   COMMUNICATION OUTBOX
   ========================================================= */

create table public.project_communication_outbox (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.project_inquiries(request_id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete set null,
  recipient_email text not null check(length(btrim(recipient_email)) between 3 and 254),
  kind text not null check(kind in (
    'inquiry_acknowledgement','workspace_invitation','workspace_access',
    'onboarding_action','onboarding_deadline','brief_review','project_review',
    'deliverable_review','change_review','release_ready','project_complete',
    'task_deadline'
  )),
  dedupe_key text not null unique check(length(dedupe_key) between 1 and 240),
  subject text not null check(length(btrim(subject)) between 1 and 300),
  body_text text not null check(length(btrim(body_text)) between 1 and 8000),
  action_surface text not null default 'client' check(action_surface in ('public','client')),
  action_path text not null default '/' check(length(action_path) between 1 and 4000),
  status text not null default 'queued' check(status in ('queued','sending','sent','failed','cancelled')),
  attempts integer not null default 0 check(attempts between 0 and 20),
  max_attempts integer not null default 5 check(max_attempts between 1 and 10),
  next_attempt_at timestamptz not null default now(),
  claimed_at timestamptz,
  sent_at timestamptz,
  provider_message_id text check(provider_message_id is null or length(provider_message_id) <= 300),
  last_error text not null default '' check(length(last_error) <= 2000),
  metadata jsonb not null default '{}'::jsonb check(jsonb_typeof(metadata)='object' and octet_length(metadata::text)<=16384),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_communication_queue on public.project_communication_outbox(status,next_attempt_at,created_at);
create index project_communication_project on public.project_communication_outbox(request_id,created_at desc);

alter table public.project_communication_outbox enable row level security;
revoke all on public.project_communication_outbox from public,anon,authenticated;
grant select,insert,update,delete on public.project_communication_outbox to service_role;

create function public.communication_project_title(p_request_id uuid) returns text
language sql stable security definer set search_path='' as $$
  select coalesce(
    (select nullif(btrim(p.body->>'title'),'') from public.inquiry_projects p where p.request_id=p_request_id),
    (select nullif(btrim(pr.body->>'title'),'') from public.inquiry_proposals pr where pr.request_id=p_request_id and pr.status='accepted' order by pr.version desc limit 1),
    (select nullif(btrim(i.payload->>'company'),'') from public.project_inquiries i where i.request_id=p_request_id),
    (select nullif(btrim(i.payload->>'name'),'') from public.project_inquiries i where i.request_id=p_request_id),
    'Bivi project'
  );
$$;
revoke all on function public.communication_project_title(uuid) from public,anon,authenticated;

create function public.queue_project_client_communications(
  p_request_id uuid,
  p_kind text,
  p_event_key text,
  p_subject text,
  p_body text,
  p_action_path text,
  p_reviewers_only boolean default false
) returns integer
language plpgsql security definer set search_path='' as $$
declare queued integer:=0;
begin
  if p_kind not in ('workspace_access','onboarding_action','onboarding_deadline','brief_review','project_review','deliverable_review','change_review','release_ready','project_complete','task_deadline')
    or length(btrim(p_event_key)) not between 1 and 160
    or length(btrim(p_subject)) not between 1 and 300
    or length(btrim(p_body)) not between 1 and 8000
    or p_action_path is null or length(p_action_path) not between 1 and 4000 then
    raise exception 'Invalid communication payload' using errcode='22023';
  end if;

  insert into public.project_communication_outbox(
    request_id,recipient_user_id,recipient_email,kind,dedupe_key,subject,body_text,action_surface,action_path
  )
  select p_request_id,pc.user_id,btrim(u.email),p_kind,
    left(p_kind||':'||p_event_key||':'||pc.user_id::text,240),
    btrim(p_subject),btrim(p_body),'client',p_action_path
  from public.project_clients pc
  join auth.users u on u.id=pc.user_id
  where pc.request_id=p_request_id and pc.active
    and (not p_reviewers_only or pc.can_review)
    and u.email is not null and length(btrim(u.email)) between 3 and 254
  on conflict(dedupe_key) do nothing;

  get diagnostics queued=row_count;
  return queued;
end;$$;
revoke all on function public.queue_project_client_communications(uuid,text,text,text,text,text,boolean) from public,anon,authenticated;

create function public.queue_direct_project_communication(
  p_request_id uuid,
  p_user_id uuid,
  p_kind text,
  p_event_key text,
  p_subject text,
  p_body text,
  p_action_path text
) returns jsonb
language plpgsql security definer set search_path='' as $$
declare email_value text;row_id uuid;
begin
  if p_kind not in ('workspace_invitation','workspace_access')
    or length(btrim(p_event_key)) not between 1 and 160
    or length(btrim(p_subject)) not between 1 and 300
    or length(btrim(p_body)) not between 1 and 8000
    or p_action_path is null or length(p_action_path) not between 1 and 4000 then
    raise exception 'Invalid direct communication' using errcode='22023';
  end if;
  if not exists(select 1 from public.project_clients where request_id=p_request_id and user_id=p_user_id and active) then
    return jsonb_build_object('result','not_found');
  end if;
  select btrim(email) into email_value from auth.users where id=p_user_id;
  if email_value is null or length(email_value) not between 3 and 254 then return jsonb_build_object('result','no_email'); end if;

  insert into public.project_communication_outbox(
    request_id,recipient_user_id,recipient_email,kind,dedupe_key,subject,body_text,action_surface,action_path
  ) values(
    p_request_id,p_user_id,email_value,p_kind,left(p_kind||':'||p_event_key||':'||p_user_id::text,240),
    btrim(p_subject),btrim(p_body),'client',p_action_path
  ) on conflict(dedupe_key) do nothing returning id into row_id;

  if row_id is null then return jsonb_build_object('result','duplicate'); end if;
  return jsonb_build_object('result','queued','id',row_id);
end;$$;
revoke all on function public.queue_direct_project_communication(uuid,uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.queue_direct_project_communication(uuid,uuid,text,text,text,text,text) to service_role;

/* =========================================================
   AUTOMATIC WORKFLOW NOTICES
   ========================================================= */

create function public.queue_inquiry_acknowledgement() returns trigger
language plpgsql security definer set search_path='' as $$
declare email_value text;
begin
  email_value:=btrim(coalesce(new.payload->>'email',''));
  if length(email_value) between 3 and 254 then
    insert into public.project_communication_outbox(
      request_id,recipient_email,kind,dedupe_key,subject,body_text,action_surface,action_path
    ) values(
      new.request_id,email_value,'inquiry_acknowledgement',
      'inquiry_acknowledgement:'||new.request_id::text||':'||lower(email_value),
      'We received your Bivi project request',
      'Thanks for reaching out to Bivi. Your project request has been received. We will review the details and follow up with the next step.',
      'public','/'
    ) on conflict(dedupe_key) do nothing;
  end if;
  return new;
end;$$;
create trigger project_inquiry_acknowledgement after insert on public.project_inquiries
for each row execute function public.queue_inquiry_acknowledgement();

create function public.queue_onboarding_action_email() returns trigger
language plpgsql security definer set search_path='' as $$
declare title_value text;
begin
  if new.owner='client' and new.status='clarification' and old.status is distinct from new.status then
    title_value:=public.communication_project_title(new.request_id);
    perform public.queue_project_client_communications(
      new.request_id,'onboarding_action',new.item_key||':r'||new.revision::text,
      'Bivi needs an onboarding clarification',
      'Bivi needs a clarification for "'||new.title||'" on '||title_value||'. Open your onboarding workspace to review the note and resubmit the item.',
      '/onboarding/'||new.request_id::text,false
    );
  end if;
  return new;
end;$$;
create trigger onboarding_item_communication after update of status on public.inquiry_onboarding_items
for each row execute function public.queue_onboarding_action_email();

create function public.queue_brief_review_email() returns trigger
language plpgsql security definer set search_path='' as $$
declare title_value text;
begin
  if new.status='pending' then
    title_value:=public.communication_project_title(new.request_id);
    perform public.queue_project_client_communications(
      new.request_id,'brief_review','v'||new.version::text,
      'Project brief ready for approval',
      'Project brief version '||new.version::text||' for '||title_value||' is ready for your review and approval.',
      '/projects/'||new.request_id::text,true
    );
  end if;
  return new;
end;$$;
create trigger project_brief_review_communication after insert on public.project_brief_versions
for each row execute function public.queue_brief_review_email();

create function public.queue_project_publication_review_email() returns trigger
language plpgsql security definer set search_path='' as $$
declare title_value text;
begin
  if coalesce((new.body->>'reviewRequested')::boolean,false) then
    title_value:=public.communication_project_title(new.request_id);
    perform public.queue_project_client_communications(
      new.request_id,'project_review','v'||new.version::text,
      'A Bivi project update needs your review',
      'Bivi published project update '||new.version::text||' for '||title_value||' and requested your review.',
      '/projects/'||new.request_id::text,true
    );
  end if;
  return new;
exception when others then return new;
end;$$;
create trigger project_publication_review_communication after insert on public.project_publications
for each row execute function public.queue_project_publication_review_email();

create function public.queue_deliverable_review_email() returns trigger
language plpgsql security definer set search_path='' as $$
declare title_value text;deliverable_title text;
begin
  if new.status='pending_review' then
    title_value:=public.communication_project_title(new.request_id);
    select title into deliverable_title from public.project_deliverables where request_id=new.request_id and deliverable_id=new.deliverable_id;
    perform public.queue_project_client_communications(
      new.request_id,'deliverable_review',new.deliverable_id||':v'||new.version::text,
      'A Bivi deliverable is ready for approval',
      coalesce(deliverable_title,new.deliverable_id)||' version '||new.version::text||' for '||title_value||' is ready for your review.',
      '/projects/'||new.request_id::text,true
    );
  end if;
  return new;
end;$$;
create trigger deliverable_review_communication after insert on public.project_deliverable_versions
for each row execute function public.queue_deliverable_review_email();

create function public.queue_change_review_email() returns trigger
language plpgsql security definer set search_path='' as $$
declare title_value text;
begin
  if new.state='proposed' and old.state is distinct from new.state then
    title_value:=public.communication_project_title(new.request_id);
    perform public.queue_project_client_communications(
      new.request_id,'change_review',new.id::text||':r'||new.revision::text,
      'A project change needs your decision',
      'Bivi prepared the impact proposal for "'||new.title||'" on '||title_value||'. Review the scope, schedule and cost impact before accepting or rejecting it.',
      '/projects/'||new.request_id::text,true
    );
  end if;
  return new;
end;$$;
create trigger change_request_review_communication after update of state on public.project_change_requests
for each row execute function public.queue_change_review_email();

create function public.queue_release_email() returns trigger
language plpgsql security definer set search_path='' as $$
declare title_value text;
begin
  if new.release_state='released' and old.release_state is distinct from new.release_state then
    title_value:=public.communication_project_title(new.request_id);
    perform public.queue_project_client_communications(
      new.request_id,'release_ready','r'||new.revision::text,
      'Your Bivi final release is ready',
      'The final release for '||title_value||' is ready. Open the project workspace to review the release and confirm receipt.',
      '/projects/'||new.request_id::text,true
    );
  end if;
  return new;
end;$$;
create trigger project_release_communication after update of release_state on public.project_closeout
for each row execute function public.queue_release_email();

create function public.queue_project_complete_email() returns trigger
language plpgsql security definer set search_path='' as $$
declare title_value text;
begin
  if new.state='completed' and old.state is distinct from new.state then
    title_value:=public.communication_project_title(new.request_id);
    perform public.queue_project_client_communications(
      new.request_id,'project_complete','r'||new.revision::text,
      'Your Bivi project is complete',
      title_value||' has been marked complete. Your project workspace remains available for the final handoff record and project files.',
      '/projects/'||new.request_id::text,false
    );
  end if;
  return new;
end;$$;
create trigger project_complete_communication after update of state on public.inquiry_projects
for each row execute function public.queue_project_complete_email();

/* =========================================================
   BOUNDED DEADLINE REMINDERS
   Three possible reminders per client-owned due item: 3 days before,
   due today, and one overdue notice. Dedupe keys prevent repeats.
   ========================================================= */

create function public.enqueue_project_deadline_reminders(p_today date default current_date) returns integer
language plpgsql security definer set search_path='' as $$
declare rec record;stage text;queued integer:=0;added integer;title_value text;
begin
  for rec in
    select p.request_id,t.value->>'id' task_id,t.value->>'title' task_title,(t.value->>'dueOn')::date due_on
    from public.inquiry_projects p
    join public.project_lifecycle l on l.request_id=p.request_id
    cross join lateral jsonb_array_elements(p.body->'tasks') t(value)
    join public.project_task_controls c on c.request_id=p.request_id and c.task_id=t.value->>'id'
    where p.state='active' and c.owner_type='client' and t.value->>'status'<>'done'
      and c.blocker_owner is null and public.project_phase_rank(c.phase)<=public.project_phase_rank(l.phase)
      and (c.depends_on is null or exists(select 1 from jsonb_array_elements(p.body->'tasks') d where d->>'id'=c.depends_on and d->>'status'='done'))
      and t.value->>'dueOn' ~ '^\d{4}-\d{2}-\d{2}$'
      and ((t.value->>'dueOn')::date=p_today+3 or (t.value->>'dueOn')::date=p_today or (t.value->>'dueOn')::date<p_today)
  loop
    stage:=case when rec.due_on=p_today+3 then '3d' when rec.due_on=p_today then 'due' else 'overdue' end;
    title_value:=public.communication_project_title(rec.request_id);
    added:=public.queue_project_client_communications(
      rec.request_id,'task_deadline',rec.task_id||':'||stage,
      case stage when '3d' then 'A Bivi project task is due soon' when 'due' then 'A Bivi project task is due today' else 'A Bivi project task is overdue' end,
      '"'||rec.task_title||'" for '||title_value||' is '||case stage when '3d' then 'due on '||rec.due_on::text when 'due' then 'due today' else 'past its due date of '||rec.due_on::text end||'. Open your project workspace to review the task.',
      '/projects/'||rec.request_id::text,false
    );
    queued:=queued+added;
  end loop;

  for rec in
    select i.request_id,i.item_key,i.title,i.due_on
    from public.inquiry_onboarding_items i
    where i.owner='client' and i.status in ('pending','clarification') and i.due_on is not null
      and (i.due_on=p_today+3 or i.due_on=p_today or i.due_on<p_today)
      and (i.depends_on is null or exists(select 1 from public.inquiry_onboarding_items d where d.request_id=i.request_id and d.item_key=i.depends_on and d.status in ('accepted','waived')))
  loop
    stage:=case when rec.due_on=p_today+3 then '3d' when rec.due_on=p_today then 'due' else 'overdue' end;
    title_value:=public.communication_project_title(rec.request_id);
    added:=public.queue_project_client_communications(
      rec.request_id,'onboarding_deadline',rec.item_key||':'||stage,
      case stage when '3d' then 'A Bivi onboarding item is due soon' when 'due' then 'A Bivi onboarding item is due today' else 'A Bivi onboarding item is overdue' end,
      '"'||rec.title||'" for '||title_value||' is '||case stage when '3d' then 'due on '||rec.due_on::text when 'due' then 'due today' else 'past its due date of '||rec.due_on::text end||'. Open onboarding to review the requirement.',
      '/onboarding/'||rec.request_id::text,false
    );
    queued:=queued+added;
  end loop;

  return queued;
end;$$;
revoke all on function public.enqueue_project_deadline_reminders(date) from public,anon,authenticated;
grant execute on function public.enqueue_project_deadline_reminders(date) to service_role;

/* =========================================================
   SERVICE-ROLE CLAIM / RETRY QUEUE
   ========================================================= */

create function public.claim_project_communications(p_limit integer default 20,p_request_id uuid default null)
returns setof public.project_communication_outbox
language plpgsql security definer set search_path='' as $$
begin
  update public.project_communication_outbox set status='queued',claimed_at=null,next_attempt_at=now(),updated_at=now()
  where status='sending' and claimed_at<now()-interval '15 minutes' and attempts<max_attempts;

  return query
  with picked as (
    select id from public.project_communication_outbox
    where status='queued' and next_attempt_at<=now() and attempts<max_attempts
      and (p_request_id is null or request_id=p_request_id)
    order by next_attempt_at,created_at
    for update skip locked
    limit greatest(1,least(coalesce(p_limit,20),50))
  )
  update public.project_communication_outbox o
  set status='sending',attempts=o.attempts+1,claimed_at=now(),updated_at=now()
  from picked where o.id=picked.id
  returning o.*;
end;$$;
revoke all on function public.claim_project_communications(integer,uuid) from public,anon,authenticated;
grant execute on function public.claim_project_communications(integer,uuid) to service_role;

create function public.finish_project_communication(p_id uuid,p_provider_id text default null,p_error text default null) returns text
language plpgsql security definer set search_path='' as $$
declare row_value public.project_communication_outbox%rowtype;next_status text;delay interval;
begin
  select * into row_value from public.project_communication_outbox where id=p_id for update;
  if row_value.id is null then return 'not_found'; end if;
  if p_error is null then
    update public.project_communication_outbox set status='sent',sent_at=now(),provider_message_id=nullif(left(p_provider_id,300),''),last_error='',claimed_at=null,
      action_path=case when kind='workspace_invitation' then '/' else action_path end,updated_at=now() where id=p_id;
    return 'sent';
  end if;

  next_status:=case when row_value.attempts>=row_value.max_attempts then 'failed' else 'queued' end;
  delay:=case row_value.attempts when 1 then interval '5 minutes' when 2 then interval '30 minutes' when 3 then interval '2 hours' else interval '8 hours' end;
  update public.project_communication_outbox set status=next_status,last_error=left(p_error,2000),claimed_at=null,
    next_attempt_at=case when next_status='queued' then now()+delay else next_attempt_at end,updated_at=now()
  where id=p_id;
  return next_status;
end;$$;
revoke all on function public.finish_project_communication(uuid,text,text) from public,anon,authenticated;
grant execute on function public.finish_project_communication(uuid,text,text) to service_role;

commit;
