begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('bivi-profile-images','bivi-profile-images',false,2097152,array['image/png']);
create table public.profile_image_uploads(
 path text primary key,kind text not null check(kind in ('person','company','staff','client')),subject text not null,
 actor uuid not null references auth.users(id) on delete cascade,created_at timestamptz not null default now(),committed boolean not null default false
);
create index profile_image_upload_quota on public.profile_image_uploads(actor,created_at);
alter table public.profile_image_uploads enable row level security;
revoke all on public.profile_image_uploads from public,anon,authenticated,service_role;
grant select(user_id,public_id,avatar_path,active) on public.inquiry_staff to authenticated;
create policy staff_image_self_read on public.inquiry_staff for select to authenticated using(user_id=auth.uid() and active);
create function public.profile_image_authorized(p_kind text,p_subject text,p_write boolean) returns boolean language plpgsql stable security definer set search_path='' as $$
begin
 if p_kind='person' then return public.is_inquiry_staff() and exists(select 1 from public.people_contacts where id::text=p_subject);
 elsif p_kind='company' then return public.is_inquiry_staff() and exists(select 1 from public.company_profiles where organization_id::text=p_subject);
 elsif p_kind='staff' then return public.is_inquiry_staff() and (not p_write or p_subject=auth.uid()::text) and exists(select 1 from public.inquiry_staff where user_id::text=p_subject and active);
 elsif p_kind='client' then return (p_subject=auth.uid()::text and exists(select 1 from public.project_clients where user_id=auth.uid() and active)) or (not p_write and public.is_inquiry_staff());
 end if;
 return false;
end;$$;
revoke all on function public.profile_image_authorized(text,text,boolean) from public,anon,service_role;
grant execute on function public.profile_image_authorized(text,text,boolean) to authenticated;
create function public.get_profile_image(p_kind text,p_subject text) returns text language plpgsql stable security definer set search_path='' as $$
declare image_path text;
begin
 if not public.profile_image_authorized(p_kind,p_subject,false) then raise exception 'Image access denied' using errcode='42501';end if;
 if p_kind='person' then select avatar_path into image_path from public.people_contacts where id::text=p_subject;
 elsif p_kind='company' then select logo_path into image_path from public.company_profiles where organization_id::text=p_subject;
 elsif p_kind='staff' then select avatar_path into image_path from public.inquiry_staff where user_id::text=p_subject;
 else select avatar_path into image_path from public.client_profiles where user_id::text=p_subject;
 end if;
 return image_path;
end;$$;
revoke all on function public.get_profile_image(text,text) from public,anon,service_role;
grant execute on function public.get_profile_image(text,text) to authenticated;
create function public.reserve_profile_image(p_kind text,p_subject text) returns text language plpgsql security definer set search_path='' as $$
declare new_path text;
begin
 if not public.profile_image_authorized(p_kind,p_subject,true) then raise exception 'Image access denied' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtext(auth.uid()::text),610140020);
 if (select count(*) from public.profile_image_uploads where actor=auth.uid() and created_at>now()-interval '1 hour')>=20 then raise exception 'Image upload limit reached. Try again later.';end if;
 new_path:=auth.uid()::text||'/'||gen_random_uuid()::text||'.png';
 insert into public.profile_image_uploads(path,kind,subject,actor) values(new_path,p_kind,p_subject,auth.uid());return new_path;
end;$$;
revoke all on function public.reserve_profile_image(text,text) from public,anon,service_role;
grant execute on function public.reserve_profile_image(text,text) to authenticated;
create function public.commit_profile_image(p_kind text,p_subject text,p_expected text,p_path text) returns jsonb language plpgsql security definer set search_path='' as $$
declare current_path text;meta jsonb;
begin
 if not public.profile_image_authorized(p_kind,p_subject,true) then raise exception 'Image access denied' using errcode='42501';end if;
 -- Serializes image changes without granting edits to the rest of a profile.
 perform pg_advisory_xact_lock(hashtext(p_kind||':'||p_subject),610140020);
 if p_kind='client' then insert into public.client_profiles(user_id) values(auth.uid()) on conflict(user_id) do nothing;end if;
 if p_kind='person' then select avatar_path into current_path from public.people_contacts where id::text=p_subject for update;
 elsif p_kind='company' then select logo_path into current_path from public.company_profiles where organization_id::text=p_subject for update;
 elsif p_kind='staff' then select avatar_path into current_path from public.inquiry_staff where user_id::text=p_subject for update;
 else select avatar_path into current_path from public.client_profiles where user_id::text=p_subject for update;end if;
 if current_path is distinct from p_expected then return jsonb_build_object('result','conflict');end if;
 if p_path is not null then
 if not exists(select 1 from public.profile_image_uploads where path=p_path and actor=auth.uid() and kind=p_kind and subject=p_subject and not committed and created_at>now()-interval '10 minutes') then raise exception 'Invalid image reservation';end if;
 select metadata into meta from storage.objects where bucket_id='bivi-profile-images' and name=p_path;
 if meta is null or meta->>'mimetype' is distinct from 'image/png' or coalesce((meta->>'size')::bigint,0) not between 1 and 2097152 then raise exception 'Image upload not verified';end if;
 update public.profile_image_uploads set committed=true where path=p_path;
 end if;
 if p_kind='person' then update public.people_contacts set avatar_path=p_path,revision=revision+1,updated_at=now() where id::text=p_subject;
 elsif p_kind='company' then update public.company_profiles set logo_path=p_path,revision=revision+1,updated_at=now() where organization_id::text=p_subject;
 elsif p_kind='staff' then update public.inquiry_staff set avatar_path=p_path where user_id::text=p_subject;
 else update public.client_profiles set avatar_path=p_path,revision=revision+1,updated_at=now() where user_id::text=p_subject;end if;
 return jsonb_build_object('result','saved','path',p_path);
end;$$;
revoke all on function public.commit_profile_image(text,text,text,text) from public,anon,service_role;
grant execute on function public.commit_profile_image(text,text,text,text) to authenticated;
create function public.can_insert_profile_image(p_path text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profile_image_uploads where path=p_path and actor=auth.uid() and not committed and created_at>now()-interval '10 minutes' and public.profile_image_authorized(kind,subject,true));
$$;
create function public.can_read_profile_image(p_path text) returns boolean language plpgsql stable security definer set search_path='' as $$
declare upload public.profile_image_uploads;
begin
 select * into upload from public.profile_image_uploads where path=p_path and committed;
 if not found or not public.profile_image_authorized(upload.kind,upload.subject,false) then return false;end if;
 return coalesce(public.get_profile_image(upload.kind,upload.subject)=p_path,false);
end;$$;
revoke all on function public.can_insert_profile_image(text),public.can_read_profile_image(text) from public,anon,service_role;
grant execute on function public.can_insert_profile_image(text),public.can_read_profile_image(text) to authenticated;
create policy profile_images_insert on storage.objects for insert to authenticated with check(bucket_id='bivi-profile-images' and public.can_insert_profile_image(name));
create policy profile_images_read on storage.objects for select to authenticated using(bucket_id='bivi-profile-images' and public.can_read_profile_image(name));
-- Restrictive guards also protect against unrelated broad storage policies.
create policy profile_images_insert_guard on storage.objects as restrictive for insert to public with check(bucket_id<>'bivi-profile-images' or public.can_insert_profile_image(name));
create policy profile_images_read_guard on storage.objects as restrictive for select to public using(bucket_id<>'bivi-profile-images' or public.can_read_profile_image(name));
create policy profile_images_update_guard on storage.objects as restrictive for update to public using(bucket_id<>'bivi-profile-images') with check(bucket_id<>'bivi-profile-images');
create policy profile_images_delete_guard on storage.objects as restrictive for delete to public using(bucket_id<>'bivi-profile-images');
commit;
