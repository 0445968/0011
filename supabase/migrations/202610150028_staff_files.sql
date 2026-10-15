begin;
create index project_files_directory_created on public.project_files(created_at desc,id);
create index project_files_directory_uploader on public.project_files(uploader_id,created_at desc);
create index project_files_directory_state_type on public.project_files(state,mime_type,created_at desc);

-- Resolve uploader labels only for staff, without granting direct reads of staff accounts.
create function public.staff_file_uploader(p_user uuid)
returns table(uploader_type text,uploader_label text) language sql stable security definer set search_path='' as $$
 select case when s.user_id is not null then 'staff' when cp.user_id is not null then 'client' else 'former' end,
 case when s.user_id is not null then 'Staff · '||s.public_id
 when cp.user_id is not null then coalesce(nullif(btrim(cp.first_name||' '||cp.last_name),''),'Client')||' · '||cp.public_id
 else 'Former or unavailable account' end
 from (select p_user as user_id) actor
 left join public.inquiry_staff s on s.user_id=actor.user_id
 left join public.client_profiles cp on cp.user_id=actor.user_id
 where public.is_inquiry_staff();
$$;
revoke all on function public.staff_file_uploader(uuid) from public,anon,service_role;
grant execute on function public.staff_file_uploader(uuid) to authenticated;

create view public.staff_file_directory with(security_invoker=true) as
select f.id,f.request_id,f.filename,f.size_bytes,f.mime_type,f.uploader_id,f.state,f.shared,f.created_at,f.updated_at,
 coalesce(p.body->>'title','Project') as project_title,p.public_id as project_public_id,p.state as project_state,
 o.id as company_id,o.name as company_name,o.public_id as company_public_id,u.uploader_type,u.uploader_label
from public.project_files f join public.inquiry_projects p on p.request_id=f.request_id
left join public.client_organizations o on o.id=p.company_id
left join lateral public.staff_file_uploader(f.uploader_id) u on true
where (select public.is_inquiry_staff());
revoke all on public.staff_file_directory from public,anon,service_role;
grant select on public.staff_file_directory to authenticated;

-- Record successful URL authorizations without changing file state or revision.
create function public.record_staff_file_access(p_request uuid,p_file uuid,p_action text)
returns void language plpgsql security definer set search_path='' as $$
declare f public.project_files;
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if p_action is null or p_action not in ('preview','download') then raise exception 'Invalid access action' using errcode='22023';end if;
 select * into f from public.project_files where request_id=p_request and id=p_file and state='ready';
 if not found then raise exception 'File unavailable' using errcode='22023';end if;
 insert into public.project_file_history(file_id,request_id,action,revision,actor_id) values(f.id,f.request_id,p_action,f.revision,auth.uid());
end;
$$;
revoke all on function public.record_staff_file_access(uuid,uuid,text) from public,anon,service_role;
grant execute on function public.record_staff_file_access(uuid,uuid,text) to authenticated;
commit;
