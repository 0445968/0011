-- R4a: read-only staff roster derived from authenticated project membership and task assignments.
-- Requires 202610140020_profile_images.sql and 202610160032_project_hierarchy_foundation.sql.
begin;

create function public.staff_project_roster(p_request_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare staff_rows jsonb; client_rows jsonb;
begin
  if auth.uid() is null or not public.is_inquiry_staff() then
    raise exception 'Staff authorization required' using errcode = '42501';
  end if;
  if not exists(select 1 from public.inquiry_projects where request_id = p_request_id) then
    raise exception 'Project not found' using errcode = '22023';
  end if;

  select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.label), '[]'::jsonb)
  into staff_rows from (
    select s.user_id as id,
           coalesce(nullif(btrim(u.raw_user_meta_data->>'full_name'), ''),
             nullif(u.email, ''), 'Bivi staff ' || s.public_id) as label,
           s.avatar_path,
           jsonb_agg(distinct c.task_id) as task_ids
    from public.project_task_controls c
    join public.inquiry_staff s on s.user_id = c.assigned_staff_id and s.active
    left join auth.users u on u.id = s.user_id
    where c.request_id = p_request_id and c.owner_type = 'bivi'
    group by s.user_id, s.public_id, s.avatar_path, u.raw_user_meta_data, u.email
  ) row_data;

  select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.label), '[]'::jsonb)
  into client_rows from (
    select pc.user_id as id,
           coalesce(nullif(btrim(concat_ws(' ', nullif(cp.first_name,''), nullif(cp.last_name,''))),''),
             'Client project member') as label,
           cp.avatar_path
    from public.project_clients pc
    left join public.client_profiles cp on cp.user_id = pc.user_id
    where pc.request_id = p_request_id and pc.active
  ) row_data;

  return jsonb_build_object('staff',staff_rows,'clients',client_rows);
end;
$$;
revoke all on function public.staff_project_roster(uuid) from public, anon, service_role;
grant execute on function public.staff_project_roster(uuid) to authenticated;
commit;
