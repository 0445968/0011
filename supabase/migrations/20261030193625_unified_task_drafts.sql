begin;

-- Changing responsibility alone must not silently enable completion review.
drop trigger if exists project_task_review_policy_defaults_update on public.project_task_controls;

-- Metadata lives only in the private draft; the existing canonical task shape
-- and all existing sidecar audit/authorization functions remain authoritative.
create function public.strip_project_task_draft_edits(b jsonb) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_set(b,'{tasks}',coalesce((select jsonb_agg(t.value-'edits' order by t.ordinality)
 from jsonb_array_elements(b->'tasks') with ordinality t(value,ordinality)),'[]'::jsonb));
$$;
revoke all on function public.strip_project_task_draft_edits(jsonb) from public,anon,authenticated,service_role;

alter function public.valid_project_workplan_draft_body(jsonb) rename to valid_project_workplan_draft_body_before_bundle;
create function public.valid_project_workplan_draft_body(b jsonb) returns boolean
language plpgsql stable set search_path='' as $$
begin
 if not public.valid_project_workplan_draft_body_before_bundle(public.strip_project_task_draft_edits(b)) then return false;end if;
 if exists(select 1 from jsonb_array_elements(b->'tasks') t where t ? 'edits' and (
  jsonb_typeof(t->'edits')<>'object' or exists(select 1 from jsonb_object_keys(t->'edits') k where k not in ('controlRevision','assignment','priority','review','control','tags'))
 )) then return false;end if;
 return true;
exception when others then return false;
end;$$;
revoke all on function public.valid_project_workplan_draft_body(jsonb) from public,anon,authenticated,service_role;

create table public.project_workplan_save_receipts (
 save_id uuid primary key,
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 staff_id uuid not null references auth.users(id) on delete cascade,
 payload_hash text not null,
 expected_revision integer not null,
 saved_revision integer not null,
 created_at timestamptz not null default now()
);
alter table public.project_workplan_save_receipts enable row level security;
revoke all on public.project_workplan_save_receipts from public,anon,authenticated,service_role;
grant select on public.project_workplan_save_receipts to authenticated;
create policy project_workplan_save_receipts_self on public.project_workplan_save_receipts
 for select to authenticated using(staff_id=(select auth.uid()) and (select public.is_inquiry_staff()));
create index project_workplan_save_receipts_staff on public.project_workplan_save_receipts(staff_id);
create index project_workplan_save_receipts_request on public.project_workplan_save_receipts(request_id,staff_id);

create function public.assert_project_bundle_saved(result jsonb) returns void
language plpgsql set search_path='' as $$
begin
 if result->>'result'='saved' then return;end if;
 if result->>'result'='conflict' then raise exception 'Task settings changed. Review saved settings before retrying.' using errcode='40001';end if;
 raise exception 'Task setting rejected: %',coalesce(result->>'result','unconfirmed') using errcode='23514';
end;$$;
revoke all on function public.assert_project_bundle_saved(jsonb) from public,anon,authenticated,service_role;

create function public.save_project_workplan_bundle(p_request uuid,p_body jsonb,p_revision integer,p_save_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare project public.inquiry_projects%rowtype;receipt public.project_workplan_save_receipts%rowtype;
 item jsonb;edits jsonb;result jsonb;clean jsonb;seed jsonb;new_tasks jsonb;task_key text;
 existing_tag_keys text[];control_revision integer;tag_revision integer;next_revision integer;new_tag jsonb;tag_row public.project_task_tag_catalog%rowtype;
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if p_save_id is null or p_revision is null or not public.valid_project_workplan_draft_body(p_body) then raise exception 'Invalid task draft' using errcode='22023';end if;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 select * into receipt from public.project_workplan_save_receipts where save_id=p_save_id;
 if found then
  if receipt.staff_id<>auth.uid() or receipt.request_id<>p_request or receipt.payload_hash<>md5(p_body::text) or receipt.expected_revision<>p_revision then raise exception 'Save identifier already used' using errcode='22023';end if;
  if project.revision<>receipt.saved_revision then return jsonb_build_object('result','conflict');end if;
  return jsonb_build_object('result','saved','revision',receipt.saved_revision);
 end if;
 if project.revision<>p_revision then return jsonb_build_object('result','conflict');end if;
 if project.state='completed' or exists(select 1 from public.project_operational_status where request_id=p_request and status='inactive') then return jsonb_build_object('result','locked');end if;
 clean:=public.strip_project_task_draft_edits(p_body);
 if not public.valid_project_body(clean) then raise exception 'Invalid task fields' using errcode='22023';end if;
 -- Preflight all revisions before changing any task. All following writes roll
 -- back together if any setting, authorization or completion rule fails.
 for item in select value from jsonb_array_elements(p_body->'tasks') loop
  edits:=item->'edits';if edits is null then continue;end if;task_key:=item->>'id';
  if edits ?| array['assignment','priority','review','control'] then
   select c.revision into control_revision from public.project_task_controls c where c.request_id=p_request and c.task_id=task_key for update;
   if coalesce(control_revision,0) is distinct from (edits->>'controlRevision')::integer then raise exception 'Task settings changed for %. Reopen its settings and review saved values.',task_key using errcode='40001';end if;
  end if;
  if edits ? 'tags' then
   select t.revision into tag_revision from public.project_task_presentation t where t.request_id=p_request and t.task_id=task_key for update;
   if coalesce(tag_revision,0) is distinct from (edits->'tags'->>'revision')::integer then raise exception 'Task tags changed for %. Review saved tags.',task_key using errcode='40001';end if;
  end if;
 end loop;
 select coalesce(array_agg(tag_key),'{}'::text[]) into existing_tag_keys from public.project_task_tag_catalog where request_id=p_request;
 next_revision:=p_revision;
 -- Seed new task identities inside this transaction so assignments and tags
 -- can be drafted before a task's first explicit save.
 select jsonb_agg(jsonb_set(t,'{status}','"todo"'::jsonb)) into new_tasks
 from jsonb_array_elements(clean->'tasks') t where not exists(select 1 from jsonb_array_elements(project.body->'tasks') old_task where old_task->>'id'=t->>'id');
 if new_tasks is not null then
  seed:=jsonb_set(project.body,'{tasks}',(project.body->'tasks')||new_tasks);
  seed:=jsonb_set(seed,'{milestones}',(project.body->'milestones')||coalesce((select jsonb_agg(jsonb_set(m,'{status}','"planned"'::jsonb)) from jsonb_array_elements(clean->'milestones') m where not exists(select 1 from jsonb_array_elements(project.body->'milestones') old_m where old_m->>'id'=m->>'id')),'[]'::jsonb));
  result:=public.manage_inquiry_project(p_request,jsonb_build_object('action','save','expectedRevision',next_revision,'body',seed));
  perform public.assert_project_bundle_saved(result);next_revision:=(result->>'revision')::integer;
 end if;
 for item in select value from jsonb_array_elements(p_body->'tasks') loop
  edits:=item->'edits';if edits is null then continue;end if;task_key:=item->>'id';
  select revision into control_revision from public.project_task_controls where request_id=p_request and task_id=task_key;
  if edits ? 'assignment' then
   result:=public.staff_project_assign_members(p_request,'task',task_key,edits->'assignment'->>'side',array(select jsonb_array_elements_text(edits->'assignment'->'userIds')::uuid),control_revision);
   perform public.assert_project_bundle_saved(result);
  end if;
  if edits ? 'control' then
   select revision into control_revision from public.project_task_controls where request_id=p_request and task_id=task_key;
   if edits ? 'assignment' and edits->'control'->>'ownerType'<>edits->'assignment'->>'side' then raise exception 'Task responsibility selections disagree' using errcode='22023';end if;
   result:=public.manage_project_task_control(p_request,(edits->'control')||jsonb_build_object('action','update_task','taskId',task_key,'expectedRevision',control_revision));
   perform public.assert_project_bundle_saved(result);
  end if;
  if edits ? 'review' then
   select revision into control_revision from public.project_task_controls where request_id=p_request and task_id=task_key;
   result:=public.set_project_task_review_policy(p_request,task_key,(edits->'review'->>'requiresStaffReview')::boolean,(edits->'review'->>'requiresClientReview')::boolean,control_revision,next_revision);
   perform public.assert_project_bundle_saved(result);
  end if;
  if edits ? 'priority' then
   result:=public.manage_project_task_productivity(p_request,jsonb_build_object('action','priority','taskId',task_key,'priority',edits->'priority','expectedProjectRevision',next_revision));
   perform public.assert_project_bundle_saved(result);
  end if;
  if edits ? 'tags' then
   select revision into tag_revision from public.project_task_presentation where request_id=p_request and task_id=task_key;
   result:=public.set_project_task_tags(p_request,task_key,array(select jsonb_array_elements_text(edits->'tags'->'tags')),tag_revision,next_revision);
   perform public.assert_project_bundle_saved(result);
   for new_tag in select value from jsonb_array_elements(edits->'tags'->'newTags') loop
    select * into tag_row from public.project_task_tag_catalog where request_id=p_request and tag_key=lower(btrim(new_tag->>'label'));
    if not (tag_row.tag_key=any(existing_tag_keys)) then
     result:=public.update_project_task_tag(p_request,next_revision,tag_row.tag_key,new_tag->>'label',new_tag->>'color');
     perform public.assert_project_bundle_saved(result);
    end if;
   end loop;
  end if;
 end loop;
 result:=public.manage_inquiry_project(p_request,jsonb_build_object('action','save','expectedRevision',next_revision,'body',clean));
 perform public.assert_project_bundle_saved(result);
 insert into public.project_workplan_save_receipts(save_id,request_id,staff_id,payload_hash,expected_revision,saved_revision)
 values(p_save_id,p_request,auth.uid(),md5(p_body::text),p_revision,(result->>'revision')::integer);
 return result;
end;$$;
revoke all on function public.save_project_workplan_bundle(uuid,jsonb,integer,uuid) from public,anon,service_role;
grant execute on function public.save_project_workplan_bundle(uuid,jsonb,integer,uuid) to authenticated;
commit;
