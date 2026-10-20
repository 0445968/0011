-- R5b: resolve only actors present in audited project history, for Bivi staff.
-- Existing audit data and RLS remain authoritative; no backfill or synthetic events.
begin;

create function public.staff_project_activity_actors(p_request uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is null or not public.is_inquiry_staff() then
    raise exception 'Staff authorization required' using errcode = '42501';
  end if;
  if not exists(select 1 from public.inquiry_projects where request_id = p_request) then
    raise exception 'Project not found' using errcode = '22023';
  end if;
  with history_actors as (
    select actor as uid from public.inquiry_project_history where request_id=p_request
    union select actor from public.project_phase_status_history where request_id=p_request
    union select actor from public.project_hierarchy_history where request_id=p_request
    union select actor from public.project_assignment_events where request_id=p_request
    union select actor from public.project_task_history where request_id=p_request
    union select actor_id from public.project_file_history where request_id=p_request
    union select actor_id from public.project_comment_history where request_id=p_request
    union select actor_id from public.project_access_history where request_id=p_request
    union select submitted_by from public.project_client_task_responses where request_id=p_request
    union select reviewed_by from public.project_client_task_responses where request_id=p_request
    union select published_by from public.project_brief_versions where request_id=p_request
    union select decided_by from public.project_brief_versions where request_id=p_request
    union select actor from public.project_task_client_policy_history where request_id=p_request
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', a.uid,
    'label', coalesce(
      nullif(btrim(u.raw_user_meta_data->>'full_name'), ''),
      nullif(btrim(concat_ws(' ', cp.first_name, cp.last_name)), ''),
      nullif(u.email, ''), 'Former account'
    ),
    'kind', case when s.user_id is not null then 'staff'
                 when cp.user_id is not null then 'client' else null end,
    'avatarPath', case when s.user_id is not null then s.avatar_path
                       when cp.user_id is not null then cp.avatar_path else null end
  ) order by a.uid::text), '[]'::jsonb) into result
  from history_actors a
  left join auth.users u on u.id=a.uid
  left join public.inquiry_staff s on s.user_id=a.uid
  left join public.client_profiles cp on cp.user_id=a.uid
  where a.uid is not null;
  return result;
end;
$$;
revoke all on function public.staff_project_activity_actors(uuid) from public, anon, service_role;
grant execute on function public.staff_project_activity_actors(uuid) to authenticated;
commit;
