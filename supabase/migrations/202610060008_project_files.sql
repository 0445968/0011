-- Requires migrations 001–007 and Supabase Storage. Run as the migration owner.
begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('bivi-project-files','bivi-project-files',false,10485760,array['application/pdf','image/png','image/jpeg','image/webp','application/zip','text/plain'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create table public.project_files (
 id uuid primary key,request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 object_path text unique not null,filename text not null,size_bytes integer not null check(size_bytes between 1 and 10485760),mime_type text not null,
 uploader_id uuid references auth.users(id) on delete set null,state text not null default 'pending' check(state in ('pending','ready','withdrawn')),
 shared boolean not null default false,revision integer not null default 0,created_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '2 hours',updated_at timestamptz not null default now(),
 check(object_path=request_id::text||'/'||id::text),check(not shared or state='ready')
);
create index project_files_project_created on public.project_files(request_id,created_at desc);
create table public.project_file_history (
 id bigint generated always as identity primary key,file_id uuid not null references public.project_files(id) on delete cascade,
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,action text not null,revision integer not null,reason text not null default '',
 actor_id uuid references auth.users(id) on delete set null,created_at timestamptz not null default now()
);
alter table public.project_files enable row level security;
alter table public.project_file_history enable row level security;
revoke all on public.project_files,public.project_file_history from public,anon,authenticated;
grant select on public.project_files,public.project_file_history to authenticated;
create policy project_file_read on public.project_files for select to authenticated using(
 (select public.is_inquiry_staff()) or (state<>'withdrawn' and public.has_client_project(request_id) and (shared or uploader_id=auth.uid()))
);
create policy project_file_history_staff on public.project_file_history for select to authenticated using((select public.is_inquiry_staff()));
create function public.can_upload_project_file(p_path text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.project_files f where f.object_path=p_path and f.state='pending' and f.uploader_id=auth.uid() and f.expires_at>now()
 and (public.is_inquiry_staff() or public.has_client_project(f.request_id)));
$$;
create function public.can_download_project_file(p_path text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.project_files f where f.object_path=p_path and f.state='ready'
 and (public.is_inquiry_staff() or (public.has_client_project(f.request_id) and (f.shared or f.uploader_id=auth.uid()))));
$$;
revoke all on function public.can_upload_project_file(text),public.can_download_project_file(text) from public,anon;
grant execute on function public.can_upload_project_file(text),public.can_download_project_file(text) to authenticated;
-- Restrictive guards prevent an existing broad Storage policy from granting access to this bucket.
create policy bivi_files_insert_guard on storage.objects as restrictive for insert to public with check(bucket_id<>'bivi-project-files' or public.can_upload_project_file(name));
create policy bivi_files_select_guard on storage.objects as restrictive for select to public using(bucket_id<>'bivi-project-files' or public.can_download_project_file(name));
create policy bivi_files_update_guard on storage.objects as restrictive for update to public using(bucket_id<>'bivi-project-files') with check(bucket_id<>'bivi-project-files');
create policy bivi_files_delete_guard on storage.objects as restrictive for delete to public using(bucket_id<>'bivi-project-files');
create policy bivi_files_insert on storage.objects for insert to authenticated with check(bucket_id='bivi-project-files' and public.can_upload_project_file(name));
create policy bivi_files_select on storage.objects for select to authenticated using(bucket_id='bivi-project-files' and public.can_download_project_file(name));
create function public.manage_project_file(p_request_id uuid,p_command jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();staff boolean:=public.is_inquiry_staff();f public.project_files;fid uuid;act text:=p_command->>'action';fn text;sz integer;mt text;expected_mime text;obj jsonb;why text;
begin
 if actor is null then raise exception 'Authorization required' using errcode='42501'; end if;
 -- One project lock serializes quota checks, file actions and prior workflow decisions.
 perform 1 from public.project_inquiries where request_id=p_request_id for update;
 if not staff then
  perform 1 from public.project_clients where request_id=p_request_id and user_id=actor and active for update;
  if not found then raise exception 'Project access required' using errcode='42501'; end if;
 end if;
 if not exists(select 1 from public.inquiry_projects where request_id=p_request_id) then return jsonb_build_object('result','not_found'); end if;
 if jsonb_typeof(p_command->'id') is distinct from 'string' or p_command->>'id'!~'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then raise exception 'Invalid file ID' using errcode='22023'; end if;
 fid:=(p_command->>'id')::uuid;
 select * into f from public.project_files where id=fid and request_id=p_request_id for update;
 if act='reserve' then
  fn:=p_command->>'filename';mt:=p_command->>'mime';
  if jsonb_typeof(p_command->'filename') is distinct from 'string' or length(fn) not between 1 and 180 or fn~'[[:cntrl:]/\\]' or fn in ('.','..') or fn<>btrim(fn) or jsonb_typeof(p_command->'size') is distinct from 'number' or p_command->>'size'!~'^[0-9]{1,8}$' then raise exception 'Invalid file details' using errcode='22023'; end if;
  sz:=(p_command->>'size')::integer;
  expected_mime:=case lower(substring(fn from '\.([^.]+)$')) when 'pdf' then 'application/pdf' when 'png' then 'image/png' when 'jpg' then 'image/jpeg' when 'jpeg' then 'image/jpeg' when 'webp' then 'image/webp' when 'zip' then 'application/zip' when 'txt' then 'text/plain' end;
  if sz not between 1 and 10485760 or expected_mime is null or mt is distinct from expected_mime then raise exception 'Unsupported file type or size' using errcode='22023'; end if;
  if f.id is not null then
   if f.uploader_id=actor and f.filename=fn and f.size_bytes=sz and f.mime_type=mt and f.state='pending' and f.expires_at>now() then return jsonb_build_object('result','reserved','id',f.id,'path',f.object_path); end if;
   return jsonb_build_object('result','conflict');
  end if;
  if exists(select 1 from public.project_files where id=fid) then return jsonb_build_object('result','conflict'); end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text,8));
  if (select count(*) from public.project_files where request_id=p_request_id)>=200 or (select count(*) from public.project_files where uploader_id=actor and created_at>now()-interval '1 hour')>=20 then return jsonb_build_object('result','limit'); end if;
  insert into public.project_files(id,request_id,object_path,filename,size_bytes,mime_type,uploader_id)
   values(fid,p_request_id,p_request_id::text||'/'||fid::text,fn,sz,mt,actor) returning * into f;
  insert into public.project_file_history(file_id,request_id,action,revision,actor_id) values(fid,p_request_id,'reserved',0,actor);
  return jsonb_build_object('result','reserved','id',fid,'path',f.object_path);
 end if;
 if f.id is null then return jsonb_build_object('result','not_found'); end if;
 if act='finalize' then
  if f.uploader_id is distinct from actor then raise exception 'Uploader authorization required' using errcode='42501'; end if;
  if f.state='ready' then return jsonb_build_object('result','saved'); end if;
  if f.state<>'pending' or f.expires_at<=now() then return jsonb_build_object('result','conflict'); end if;
  select metadata into obj from storage.objects where bucket_id='bivi-project-files' and name=f.object_path;
  if obj is null then return jsonb_build_object('result','not_uploaded'); end if;
  if obj->>'size' is distinct from f.size_bytes::text or obj->>'mimetype' is distinct from f.mime_type then return jsonb_build_object('result','mismatch'); end if;
  update public.project_files set state='ready',revision=revision+1,updated_at=now() where id=fid returning * into f;
 else
  if not staff then raise exception 'Staff authorization required' using errcode='42501'; end if;
  if jsonb_typeof(p_command->'expectedRevision') is distinct from 'number' or p_command->>'expectedRevision'!~'^[0-9]{1,8}$' then raise exception 'Invalid revision' using errcode='22023'; end if;
  if f.revision<>(p_command->>'expectedRevision')::integer or f.state='withdrawn' then return jsonb_build_object('result','conflict'); end if;
  if act in ('share','private') and f.state='ready' then
   update public.project_files set shared=(act='share'),revision=revision+1,updated_at=now() where id=fid returning * into f;
  elsif act='withdraw' then
   why:=p_command->>'reason';if jsonb_typeof(p_command->'reason') is distinct from 'string' or length(btrim(why)) not between 1 and 2000 then raise exception 'Withdrawal reason required' using errcode='22023'; end if;
   update public.project_files set state='withdrawn',shared=false,revision=revision+1,updated_at=now() where id=fid returning * into f;
  else raise exception 'Invalid file action' using errcode='22023'; end if;
 end if;
 insert into public.project_file_history(file_id,request_id,action,revision,reason,actor_id) values(fid,p_request_id,act,f.revision,coalesce(btrim(why),''),actor);
 return jsonb_build_object('result','saved');
end;$$;
revoke all on function public.manage_project_file(uuid,jsonb) from public,anon;
grant execute on function public.manage_project_file(uuid,jsonb) to authenticated;
commit;
