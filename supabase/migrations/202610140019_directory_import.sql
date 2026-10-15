begin;
-- Create-only imports: skip duplicates; never overwrite IDs, assignments or portal permissions.
create function public.import_business_records(p_kind text,p_rows jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare entry jsonb; saved jsonb;created_count integer:=0;skipped_count integer:=0;new_id text;
begin
 if not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if p_kind not in ('people','companies') or p_kind is null or jsonb_typeof(p_rows) is distinct from 'array' or jsonb_array_length(p_rows)>100 or octet_length(p_rows::text)>1000000 then raise exception 'Invalid import';end if;
 -- Serialize directory imports so name/email duplicate checks are consistent across retries.
 perform pg_advisory_xact_lock(610140019);
 for entry in select value from jsonb_array_elements(p_rows) loop
 if p_kind='people' then
 if exists(select 1 from public.people_contact_emails e where e.email in(select lower(btrim(value->>'email')) from jsonb_array_elements(entry->'channels'->'emails'))) then skipped_count:=skipped_count+1;continue;end if;
 begin
 saved:=public.save_people_profile(null,0,entry||jsonb_build_object('lead_source','manual','project_roles','[]'::jsonb));
 exception when unique_violation then
 -- A concurrent intake may have created the person after the duplicate check.
 if exists(select 1 from public.people_contact_emails e where e.email in(select lower(btrim(value->>'email')) from jsonb_array_elements(entry->'channels'->'emails'))) then skipped_count:=skipped_count+1;continue;else raise;end if;
 end;
 new_id:=saved->>'id';
 update public.people_contacts set lead_source='import',source_reference='CSV import' where id=new_id::integer;
 else
 if exists(select 1 from public.client_organizations where lower(btrim(name))=lower(btrim(entry->>'name'))) then skipped_count:=skipped_count+1;continue;end if;
 saved:=public.save_company_profile(null,0,entry->>'name',entry->'body');new_id:=saved->>'id';
 update public.company_profiles set lead_source='import',source_reference='CSV import',source_confirmed=true where organization_id=new_id::uuid;
 end if;
 if saved->>'result' is distinct from 'saved' then raise exception 'Import could not be confirmed';end if;
 created_count:=created_count+1;
 end loop;
 return jsonb_build_object('created',created_count,'skipped',skipped_count);
end;$$;
revoke all on function public.import_business_records(text,jsonb) from public,anon,service_role;
grant execute on function public.import_business_records(text,jsonb) to authenticated;
commit;
