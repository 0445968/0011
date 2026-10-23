-- Human references are immutable; existing UUID/text task IDs remain authoritative.
-- Retain rows after task deletion so a reference is never reused within a project.
create table public.project_task_presentation (
 request_id uuid not null references public.inquiry_projects(request_id) on delete cascade,
 task_id text not null,
 sequence_number bigint not null check(sequence_number>0),
 code text not null,
 tags text[] not null default '{}',
 revision integer not null default 1 check(revision>0),
 primary key(request_id,task_id),
 unique(request_id,sequence_number), unique(request_id,code),
 check(cardinality(tags)<=20)
);
alter table public.project_task_presentation enable row level security;
revoke all on public.project_task_presentation from public,anon,authenticated,service_role;
grant select on public.project_task_presentation to authenticated;
create policy task_presentation_staff_read on public.project_task_presentation for select to authenticated using ((select public.is_inquiry_staff()));

create function public.seed_project_task_presentation() returns trigger
language plpgsql security definer set search_path='' as $$
declare n bigint; prefix text;
begin
 -- Serialize allocation with the same project lock used by work-plan commands.
 perform 1 from public.inquiry_projects where request_id=new.request_id for update;
 if exists(select 1 from public.project_task_presentation where request_id=new.request_id and task_id=new.task_id) then return new;end if;
 select coalesce(max(sequence_number),0)+1 into n from public.project_task_presentation where request_id=new.request_id;
 prefix:=case new.phase when 'inquiry' then 'IQ' when 'proposal-onboarding' then 'PO' when 'discovery' then 'DS' when 'direction' then 'DR' when 'production' then 'PD' when 'review' then 'RV' when 'qa' then 'QA' when 'delivery' then 'DL' when 'handoff' then 'HC' else 'TK' end;
 insert into public.project_task_presentation(request_id,task_id,sequence_number,code)
 values(new.request_id,new.task_id,n,prefix||'-'||lpad(n::text,greatest(3,length(n::text)),'0'));
 return new;
end;$$;
revoke all on function public.seed_project_task_presentation() from public,anon,authenticated,service_role;
create trigger project_task_presentation_seed after insert on public.project_task_controls for each row execute function public.seed_project_task_presentation();

-- Earliest recorded history defines legacy order; body position breaks missing/tied
-- history deterministically. Never claim reconstructed timestamps are creation dates.
with ordered as (
 select c.request_id,c.task_id,c.phase,row_number() over(partition by c.request_id order by
 (select min(h.id) from public.project_task_history h where h.request_id=c.request_id and h.task_id=c.task_id) nulls last,
 (select t.ordinality from public.inquiry_projects p cross join lateral jsonb_array_elements(p.body->'tasks') with ordinality t(value,ordinality) where p.request_id=c.request_id and t.value->>'id'=c.task_id limit 1) nulls last,c.task_id) n
 from public.project_task_controls c
)
insert into public.project_task_presentation(request_id,task_id,sequence_number,code)
select request_id,task_id,n,(case phase when 'inquiry' then 'IQ' when 'proposal-onboarding' then 'PO' when 'discovery' then 'DS' when 'direction' then 'DR' when 'production' then 'PD' when 'review' then 'RV' when 'qa' then 'QA' when 'delivery' then 'DL' when 'handoff' then 'HC' else 'TK' end)||'-'||lpad(n::text,greatest(3,length(n::text)),'0') from ordered;

create function public.set_project_task_tags(p_request uuid,p_task text,p_tags text[],p_revision integer,p_project_revision integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare project public.inquiry_projects%rowtype; item public.project_task_presentation%rowtype; normalized text[];
begin
 if auth.uid() is null or not public.is_inquiry_staff() then raise exception 'Staff authorization required' using errcode='42501';end if;
 if p_tags is null or cardinality(p_tags)>20 or exists(select 1 from unnest(p_tags) tag where tag is null or length(btrim(tag)) not between 1 and 40) then raise exception 'Invalid tags' using errcode='22023';end if;
 select coalesce(array_agg(tag order by tag),'{}'::text[]) into normalized from (select distinct lower(btrim(tag)) tag from unnest(p_tags) tag) t;
 select * into project from public.inquiry_projects where request_id=p_request for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 if project.state='completed' or exists(select 1 from public.project_operational_status where request_id=p_request and status='inactive') then return jsonb_build_object('result','locked');end if;
 if project.revision is distinct from p_project_revision then return jsonb_build_object('result','conflict');end if;
 if not exists(select 1 from jsonb_array_elements(project.body->'tasks') t where t->>'id'=p_task) then return jsonb_build_object('result','not_found');end if;
 select * into item from public.project_task_presentation where request_id=p_request and task_id=p_task for update;
 if not found then return jsonb_build_object('result','not_found');end if;
 -- Idempotent retry after an uncertain response.
 if item.tags=normalized then return jsonb_build_object('result','saved','revision',item.revision);end if;
 if item.revision is distinct from p_revision then return jsonb_build_object('result','conflict');end if;
 update public.project_task_presentation set tags=normalized,revision=revision+1 where request_id=p_request and task_id=p_task;
 insert into public.project_task_history(request_id,task_id,action,snapshot,actor)
 values(p_request,p_task,'metadata',jsonb_build_object('change','tags','before',item.tags,'after',normalized),auth.uid());
 return jsonb_build_object('result','saved','revision',item.revision+1);
end;$$;
revoke all on function public.set_project_task_tags(uuid,text,text[],integer,integer) from public,anon,service_role;
grant execute on function public.set_project_task_tags(uuid,text,text[],integer,integer) to authenticated;
