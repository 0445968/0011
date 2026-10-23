import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

const migration=readFileSync(new URL('../../supabase/migrations/20261023153830_r8_project_operational_status.sql',import.meta.url),'utf8');
const compatibility=readFileSync(new URL('../../supabase/migrations/20261023154210_r8_reopen_status_compatibility.sql',import.meta.url),'utf8');
const guardCompatibility=readFileSync(new URL('../../supabase/migrations/20261023154642_r8_inactive_guard_old_and_new_project.sql',import.meta.url),'utf8');
const request='00000000-0000-0000-0000-000000000010';
const actor='00000000-0000-0000-0000-000000000001';
const command=(status,revision,projectRevision,extra={})=>({status,expectedRevision:revision,expectedProjectRevision:projectRevision,...extra});

async function setup(){
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;
 create function auth.uid() returns uuid language sql stable as $$select '${actor}'::uuid$$;
 create function public.is_inquiry_staff() returns boolean language sql stable as $$select coalesce(current_setting('bivi.test_staff',true),'true')::boolean$$;
 create table public.inquiry_projects(request_id uuid primary key,public_id text,proposal_version integer default 1,revision integer,state text,body jsonb,updated_at timestamptz default now(),updated_by uuid);
 create table public.project_inquiries(request_id uuid primary key);
 create table public.project_task_controls(request_id uuid,task_id text,owner_type text default 'bivi',phase text default 'discovery',service_id text,blocker_owner text,depends_on text,revision integer default 1,assigned_staff_id uuid,priority text,updated_at timestamptz default now(),primary key(request_id,task_id));
 create table public.project_subtasks(request_id uuid,id text,task_id text,title text,status text);
 create table public.project_milestone_phases(request_id uuid,milestone_id text,phase text);
 create table public.project_phase_states(request_id uuid,phase text,status text,revision integer default 1);
 create table public.project_phase_colors(request_id uuid,phase text,color text);
 create table public.project_lifecycle(request_id uuid primary key,phase text);
 create table public.project_task_schedule(request_id uuid,task_id text,start_on date,updated_at timestamptz default now());
 create table public.project_task_members(request_id uuid,task_id text,user_id uuid,side text);
 create table public.project_task_notes(request_id uuid,id text);
 create table public.project_task_file_links(request_id uuid,id text);
 create table public.project_files(request_id uuid,id text);
 create table public.project_comments(request_id uuid,id text);
 create table public.project_meetings(id uuid,request_id uuid,title text,starts_at timestamptz,ends_at timestamptz,timezone text,status text,organizer uuid,attendees uuid[]);
 create table public.inquiry_staff(user_id uuid,active boolean);
 create table public.project_client_task_responses(id uuid,request_id uuid,task_id text,kind text,status text,submitted_at timestamptz default now());
 create table public.project_event_history(id bigint generated always as identity,request_id uuid,source text,action text,item_id text,actor uuid,details jsonb,created_at timestamptz default now());
 create table public.staff_approvals(request_id uuid,kind text,source_id text,title text,action_label text,waiting_on text,source_status text,approval_key text,updated_at timestamptz default now());
 create table public.inquiry_proposals(request_id uuid,version integer,status text);
 create function public.project_task_completion_approved(uuid,text) returns boolean language sql stable as $$select false$$;
 create function public.project_effective_task_phases(p_request uuid,p_task jsonb) returns setof text language sql stable as $$select c.phase from public.project_task_controls c where c.request_id=p_request and c.task_id=p_task->>'id' union select mp.phase from public.project_milestone_phases mp where mp.request_id=p_request and mp.milestone_id=p_task->>'milestoneId'$$;
 create function public.project_delivery_ready(uuid) returns boolean language sql stable as $$select coalesce(current_setting('bivi.test_delivery_ready',true),'true')::boolean$$;
 create function public.project_closeout_ready(uuid) returns boolean language sql stable as $$select coalesce(current_setting('bivi.test_closeout_ready',true),'true')::boolean$$;
 create function public.project_prerequisites_met(uuid) returns boolean language sql stable as $$select true$$;
 create function public.manage_inquiry_project(p_request uuid,p_command jsonb) returns jsonb language plpgsql as $$begin update public.inquiry_projects set state=case when p_command->>'action'='hold' then 'on_hold' else 'active' end,revision=revision+1 where request_id=p_request;return jsonb_build_object('result','saved');end$$;
 create view public.staff_calendar with(security_invoker=true) as select null::text event_key,null::text event_type,null::uuid request_id,null::text source_id,null::text title,null::date due_on,null::text status,null::boolean is_done,null::text project_title,null::text project_public_id,null::text project_state,null::uuid assigned_staff_id,null::text owner_type,null::uuid[] assignee_ids,null::timestamptz starts_at,null::timestamptz ends_at,null::text meeting_timezone where false;
 create view public.staff_my_tasks with(security_invoker=true) as select null::uuid request_id,null::text project_public_id,null::text project_title,null::text project_sort,null::text project_state,null::integer project_revision,null::text task_id,null::integer control_revision,null::text phase,null::text service_id,null::text blocker_owner,null::text depends_on,null::text title,null::text title_sort,null::text task_status,null::text owner_label,null::date due_on,null::boolean is_blocked,null::timestamptz updated_at,null::integer assignee_count,null::text priority,null::date start_on,null::text[] effective_phases where false;
 select set_config('bivi.test_staff','true',false);`);
 await db.exec(migration);
 await db.exec(compatibility);
 await db.exec(guardCompatibility);
 await db.exec(`insert into public.project_inquiries values('${request}');insert into public.inquiry_projects(request_id,public_id,proposal_version,revision,state,body) values('${request}','P-10',1,1,'active',jsonb_build_object('title','Test project','tasks','[]'::jsonb,'milestones','[]'::jsonb));insert into public.inquiry_proposals values('${request}',1,'accepted');`);
 return db;
}

test('R8 status transitions are revisioned, audited, staff-only, source-verified and non-destructive',async()=>{
 const db=await setup();try{
  const hold=await db.query('select public.manage_project_operational_status($1,$2::jsonb) result',[request,JSON.stringify(command('on_hold',0,1,{reason:'Blocked on supplier'}))]);
  assert.equal(hold.rows[0].result.result,'saved');assert.equal((await db.query('select state from public.inquiry_projects')).rows[0].state,'on_hold');
  const resume=await db.query('select public.manage_project_operational_status($1,$2::jsonb) result',[request,JSON.stringify(command('active',1,2,{reason:'Supplier issue resolved'}))]);
  assert.equal(resume.rows[0].result.result,'saved');assert.equal((await db.query('select state from public.inquiry_projects')).rows[0].state,'active');
  await db.query(`insert into public.staff_approvals(request_id,kind,source_id,title,action_label,waiting_on,source_status,approval_key) values($1,'deliverable','delivery-1','Deliverable review','Await client review','client','pending_review','deliverable:key')`,[request]);
  const waiting=await db.query('select public.manage_project_operational_status($1,$2::jsonb) result',[request,JSON.stringify(command('waiting_on_client',2,3,{reason:'Awaiting signed review',sourceKind:'deliverable',sourceId:'delivery-1'}))]);
  assert.equal(waiting.rows[0].result.status,'waiting_on_client');
  assert.equal((await db.query('select revision,state from public.inquiry_projects')).rows[0].revision,3,'waiting does not revise work-plan data');
  const unresolved=await db.query('select public.manage_project_operational_status($1,$2::jsonb) result',[request,JSON.stringify(command('active',3,3,{reason:'Resume before client review'}))]);assert.equal(unresolved.rows[0].result.result,'blocked');
  const event=(await db.query(`select actor,details from public.project_event_history where action='operational_status_changed' and details->>'newStatus'='waiting_on_client'`)).rows[0];assert.equal(event.actor,actor);assert.equal(event.details.oldStatus,'active');assert.equal(event.details.reason,'Awaiting signed review');
  await db.exec(`delete from public.staff_approvals`);
  assert.equal((await db.query('select public.get_project_operational_status($1) result',[request])).rows[0].result.dependencyResolved,true);
  const premature=await db.query('select public.manage_project_operational_status($1,$2::jsonb) result',[request,JSON.stringify(command('active',3,3,{reason:'Trying too soon'}))]);
  assert.equal(premature.rows[0].result.result,'saved','removed evidence is explicitly resolved, so a deliberate resume is allowed');
  const before=Number((await db.query(`select count(*)::int n from public.project_event_history where action='operational_status_changed'`)).rows[0].n);
  const noop=await db.query('select public.manage_project_operational_status($1,$2::jsonb) result',[request,JSON.stringify(command('active',4,3))]);
  assert.equal(noop.rows[0].result.noop,true);assert.equal(Number((await db.query(`select count(*)::int n from public.project_event_history where action='operational_status_changed'`)).rows[0].n),before);
  const stale=await db.query('select public.manage_project_operational_status($1,$2::jsonb) result',[request,JSON.stringify(command('inactive',3,3,{reason:'Old revision'}))]);assert.equal(stale.rows[0].result.result,'conflict');
  await db.exec(`select set_config('bivi.test_staff','false',false)`);
  await assert.rejects(db.query('select public.manage_project_operational_status($1,$2::jsonb)',[request,JSON.stringify(command('inactive',4,3,{reason:'Unauthorized'}))]),/Staff authorization required/);
 }finally{await db.close();}
});

test('closeout fails closed on empty plans, missing controls, unfinished work, client review, approvals and delivery; unused phases do not block',async()=>{
 const db=await setup();try{
  const empty=await db.query('select public.project_operational_closeout_checklist($1) blockers',[request]);assert.ok(empty.rows[0].blockers.some(b=>b.key==='tasks_empty'));
  const body={title:'Test project',milestones:[{id:'m',title:'Reviewed milestone',status:'done'}],tasks:[{id:'t',title:'Top task',status:'done',milestoneId:'m'}]};
  await db.query('update public.inquiry_projects set body=$2::jsonb where request_id=$1',[request,JSON.stringify(body)]);
  let issues=await db.query('select public.project_operational_closeout_checklist($1) blockers',[request]);assert.ok(issues.rows[0].blockers.some(b=>b.key==='task:t'),'missing task controls block closeout');
  await db.query(`insert into public.project_task_controls(request_id,task_id,owner_type,phase) values($1,'t','client','discovery')`,[request]);
  await db.query(`update public.inquiry_projects set body=jsonb_set(body,'{tasks,0,status}','"todo"') where request_id=$1`,[request]);
  issues=await db.query('select public.project_operational_closeout_checklist($1) blockers',[request]);assert.ok(issues.rows[0].blockers.some(b=>b.key==='task:t'),'unfinished top-level tasks block closeout');
  await db.query(`update public.inquiry_projects set body=jsonb_set(body,'{tasks,0,status}','"done"') where request_id=$1`,[request]);
  await db.query(`insert into public.project_subtasks(request_id,id,task_id,title,status) values($1,'sub','t','Nested work','todo')`,[request]);
  issues=await db.query('select public.project_operational_closeout_checklist($1) blockers',[request]);assert.ok(issues.rows[0].blockers.some(b=>b.key==='subtask:sub'),'unfinished subtasks block closeout');
  await db.query(`update public.project_subtasks set status='done' where id='sub'`);
  await db.query(`insert into public.project_phase_states(request_id,phase,status) values($1,'discovery','completed')`,[request]);
  issues=await db.query('select public.project_operational_closeout_checklist($1) blockers',[request]);assert.ok(issues.rows[0].blockers.some(b=>b.key==='review:t'));
  await db.exec(`create or replace function public.project_task_completion_approved(p_request uuid,p_task text) returns boolean language sql stable as $$select true$$`);
  await db.query(`insert into public.project_lifecycle(request_id,phase) values($1,'handoff')`,[request]);
  await db.query(`insert into public.project_phase_states(request_id,phase,status) values($1,'unused_optional','planning')`,[request]);
  assert.equal((await db.query('select jsonb_array_length(public.project_operational_closeout_checklist($1)) n',[request])).rows[0].n,0,'unassociated optional phases do not block closeout');
  await db.query(`update public.project_phase_states set status='planning' where request_id=$1 and phase='discovery'`,[request]);
  assert.ok((await db.query('select public.project_operational_closeout_checklist($1) blockers',[request])).rows[0].blockers.some(b=>b.key==='phase:discovery'));
  await db.query(`update public.project_phase_states set status='completed' where request_id=$1 and phase='discovery'`,[request]);
  await db.query(`insert into public.staff_approvals(request_id,kind,source_id,title,action_label,waiting_on,source_status,approval_key) values($1,'brief','2','Brief','Review','staff','pending','brief')`,[request]);
  assert.ok((await db.query('select public.project_operational_closeout_checklist($1) blockers',[request])).rows[0].blockers.some(b=>b.key==='approval:brief:2'));
  await db.exec(`delete from public.staff_approvals;select set_config('bivi.test_delivery_ready','false',false)`);
  assert.ok((await db.query('select public.project_operational_closeout_checklist($1) blockers',[request])).rows[0].blockers.some(b=>b.key==='delivery_readiness'));
  await db.exec(`select set_config('bivi.test_delivery_ready','true',false);select set_config('bivi.test_closeout_ready','false',false)`);
  assert.ok((await db.query('select public.project_operational_closeout_checklist($1) blockers',[request])).rows[0].blockers.some(b=>b.key==='closeout_readiness'));
 }finally{await db.close();}
});

test('eligible closeout is explicit; inactive preserves title-only rename, locks work writes and reactivation restores them',async()=>{
 const db=await setup();try{
  const body={title:'Before closeout',milestones:[{id:'m',title:'Final milestone',status:'done'}],tasks:[{id:'t',title:'Final task',status:'done',milestoneId:'m'}]};
  await db.query('update public.inquiry_projects set body=$2::jsonb where request_id=$1',[request,JSON.stringify(body)]);
  await db.query(`insert into public.project_task_controls(request_id,task_id,owner_type,phase) values($1,'t','bivi','discovery')`,[request]);
  await db.query(`insert into public.project_phase_states(request_id,phase,status) values($1,'discovery','completed')`,[request]);
  await db.query(`insert into public.project_lifecycle(request_id,phase) values($1,'handoff')`,[request]);
  assert.equal((await db.query('select jsonb_array_length(public.project_operational_closeout_checklist($1)) n',[request])).rows[0].n,0);
  const closed=await db.query('select public.manage_project_operational_status($1,$2::jsonb) result',[request,JSON.stringify(command('inactive',0,1,{reason:'Final accepted handoff'}))]);assert.equal(closed.rows[0].result.status,'inactive');
  await db.query(`update public.inquiry_projects set body=jsonb_set(body,'{title}','"Renamed after closeout"') where request_id=$1`,[request]);
  await assert.rejects(db.query(`update public.inquiry_projects set body=jsonb_set(body,'{tasks,0,status}','"todo"') where request_id=$1`,[request]),/Inactive/);
  await assert.rejects(db.query(`update public.inquiry_projects set state='completed' where request_id=$1`,[request]),/Inactive/);
  await assert.rejects(db.query(`update public.project_task_controls set phase='production' where request_id=$1`,[request]),/Inactive/);
  await db.query(`insert into public.inquiry_projects(request_id,public_id,proposal_version,revision,state,body) values('00000000-0000-0000-0000-000000000011','P-11',1,1,'active',jsonb_build_object('title','Active project','tasks','[]'::jsonb,'milestones','[]'::jsonb))`);
  await assert.rejects(db.query(`update public.project_task_controls set request_id='00000000-0000-0000-0000-000000000011' where request_id=$1`,[request]),/Inactive/,'updates cannot mutate then detach work from an Inactive project');
  await assert.rejects(db.query(`insert into public.project_client_task_responses(id,request_id,task_id,kind,status) values('00000000-0000-0000-0000-000000000020',$1,'t','change','pending')`,[request]),/Inactive/);
  const resumed=await db.query('select public.manage_project_operational_status($1,$2::jsonb) result',[request,JSON.stringify(command('active',1,1,{reason:'Reopen operational work'}))]);assert.equal(resumed.rows[0].result.status,'active');
  await db.query(`update public.inquiry_projects set body=jsonb_set(body,'{tasks,0,status}','"doing"') where request_id=$1`,[request]);
  assert.equal((await db.query('select body->>\'title\' title from public.inquiry_projects where request_id=$1',[request])).rows[0].title,'Renamed after closeout');
 }finally{await db.close();}
});

test('the established Completed -> On hold reopen transition syncs the R8 status revision and Activity audit',async()=>{
 const db=await setup();try{
  await db.query(`insert into public.project_operational_status(request_id,status,revision,reason) values($1,'active',1,'Previously active')`,[request]);
  await db.query(`update public.inquiry_projects set state='completed',revision=revision+1 where request_id=$1`,[request]);
  await db.query(`update public.inquiry_projects set state='on_hold',revision=revision+1 where request_id=$1`,[request]);
  const row=(await db.query(`select status,revision from public.project_operational_status where request_id=$1`,[request])).rows[0];assert.equal(row.status,'on_hold');assert.equal(row.revision,2);
  const event=(await db.query(`select details from public.project_event_history where action='operational_status_changed'`)).rows[0];assert.equal(event.details.oldStatus,'completed');assert.equal(event.details.newStatus,'on_hold');
 }finally{await db.close();}
});
