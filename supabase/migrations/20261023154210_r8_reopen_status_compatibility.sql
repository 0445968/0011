begin;

-- Preserve the established Completed -> On hold reopen path when a project
-- already has an explicit R8 operational row, and prevent completion from
-- being recorded on an Inactive project.
drop trigger if exists r8_inactive_project_body on public.inquiry_projects;
create trigger r8_inactive_project_body before update of body,state on public.inquiry_projects for each row
 when (old.body - 'title' is distinct from new.body - 'title' or (old.state is distinct from new.state and new.state='completed'))
 execute function public.guard_inactive_project_work();

create function public.sync_reopened_project_operational_status() returns trigger
language plpgsql security definer set search_path='' as $$
declare next_revision integer; prior_status text;
begin
 if old.state='completed' and new.state='on_hold' then
   select status,revision into prior_status,next_revision from public.project_operational_status where request_id=new.request_id for update;
   if found and prior_status<>'on_hold' then
     next_revision:=next_revision+1;
     update public.project_operational_status set status='on_hold',revision=next_revision,reason='Project reopened on hold for staff review',waiting_source_kind=null,waiting_source_id=null,updated_at=now(),updated_by=coalesce(auth.uid(),new.updated_by)
       where request_id=new.request_id;
     insert into public.project_event_history(request_id,source,action,item_id,actor,details,created_at)
     values(new.request_id,'project','operational_status_changed',new.request_id::text,coalesce(auth.uid(),new.updated_by),
       jsonb_build_object('oldStatus','completed','newStatus','on_hold','reason','Project reopened on hold for staff review'),now());
   end if;
 end if;
 return new;
end; $$;
revoke all on function public.sync_reopened_project_operational_status() from public,anon,authenticated,service_role;
create trigger r8_sync_reopened_operational_status after update of state on public.inquiry_projects for each row
 when (old.state='completed' and new.state='on_hold') execute function public.sync_reopened_project_operational_status();
commit;
