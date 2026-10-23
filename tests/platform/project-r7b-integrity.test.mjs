import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {loadProjectTs} from './load-project-ts.mjs';
const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),'utf8');
const migration=read('supabase/migrations/20261023130000_r7b_project_integrity.sql');
const extract=(file,name)=>read(file).match(new RegExp(`create (?:or replace )?function public\\.${name}\\([\\s\\S]*?\\$\\$;`))[0];
const id='00000000-0000-0000-0000-000000000010';
const actor='00000000-0000-0000-0000-000000000001';
const task=(id,status='todo',milestoneId='m')=>({id,title:id,status,milestoneId,dueOn:null,owner:'',notes:''});
const body=(tasks=[task('t')],status='planned')=>({title:'Project',owner:'',notes:'',milestones:[{id:'m',title:'Shared',status,dueOn:null}],tasks});
async function setup(){
 const db=new PGlite();
 await db.exec(`
 create role anon;create role authenticated;create role service_role;
 create schema auth;
 create function auth.uid() returns uuid language sql stable as $$select '${actor}'::uuid$$;
 create function is_inquiry_staff() returns boolean language sql stable as $$select true$$;
 create function project_prerequisites_met(uuid) returns boolean language sql stable as $$select true$$;
 create table project_inquiries(request_id uuid primary key);
 create table inquiry_proposals(request_id uuid,version integer,status text,body jsonb);
 create table inquiry_readiness(request_id uuid,revision integer,state text,body jsonb);
 create table inquiry_onboarding(request_id uuid,revision integer,state text,body jsonb,proposal_version integer,completed_readiness_revision integer);
 create table inquiry_projects(request_id uuid primary key,public_id text,proposal_version integer,revision integer,state text,body jsonb,updated_at timestamptz,updated_by uuid,scope_snapshot jsonb,onboarding_snapshot jsonb,onboarding_items_snapshot jsonb,readiness_snapshot jsonb,activated_readiness_revision integer,activated_onboarding_revision integer,activated_by uuid);
 create table project_task_controls(request_id uuid,task_id text,owner_type text default 'bivi',phase text default 'discovery',service_id text,depends_on text,blocker_owner text,updated_by uuid,updated_at timestamptz,assigned_staff_id uuid,revision integer default 1,priority text,client_note text,primary key(request_id,task_id));
 create table project_subtasks(id text,request_id uuid,task_id text,status text);
 create table project_milestone_phases(request_id uuid,milestone_id text,phase text);
 create table project_phase_states(request_id uuid,phase text,status text,revision integer default 1,activated_at timestamptz,completed_at timestamptz,updated_at timestamptz,updated_by uuid,primary key(request_id,phase));
 create table project_phase_status_history(request_id uuid,phase text,previous_status text,next_status text,revision integer,reason text,actor uuid);
 create table project_client_task_responses(request_id uuid,task_id text,kind text,status text,reviewed_at timestamptz default now());
 create table project_brief_versions(request_id uuid,version integer,status text);
 create table project_task_members(request_id uuid,task_id text,user_id uuid,side text);
 create table inquiry_staff(user_id uuid,active boolean);
 create table project_task_schedule(request_id uuid,task_id text,start_on date,updated_at timestamptz);
 create table project_lifecycle(request_id uuid,phase text);
 create table project_task_history(request_id uuid,task_id text,action text,snapshot jsonb,actor uuid,created_at timestamptz default now());
 create table inquiry_project_history(request_id uuid,action text,reason text,snapshot jsonb,actor uuid,created_at timestamptz default now());
 create function project_delivery_ready(uuid) returns boolean language sql stable as $$select false$$;
 create function project_closeout_ready(uuid) returns boolean language sql stable as $$select false$$;
 create function project_phase_rank(text) returns integer language sql immutable as $$select case when $1='invalid' then 999 else 1 end$$;
 `);
 await db.exec(extract('supabase/migrations/202610060006_project_workspace.sql','valid_project_body'));
 await db.exec(extract('supabase/migrations/202610140024_my_tasks.sql','manage_inquiry_project'));
 await db.exec(extract('supabase/migrations/20261022120000_r7a_phase_completion_integrity.sql','manage_project_phase_state'));
 await db.exec(migration);
 await db.exec(`create trigger sync_project_milestones_before_update before update of body on inquiry_projects for each row execute function project_sync_milestone_statuses();`);
 await db.query(`insert into inquiry_projects(request_id,revision,state,body) values($1,1,'active',$2)`,[id,body()]);
 await db.query(`insert into project_inquiries values($1)`,[id]);
 await db.query(`insert into project_task_controls(request_id,task_id) values($1,'t')`,[id]);
 await db.query(`insert into project_lifecycle values($1,'discovery')`,[id]);
 return db;
}
const save=(db,candidate,revision=1)=>db.query(`select manage_inquiry_project($1,$2) as result`,[id,{action:'save',expectedRevision:revision,body:candidate}]);

test('R7B full migration: nested completion rejection is atomic, valid same-candidate closure works, true conflicts remain distinct',async()=>{
 const db=await setup();try{
  await db.query(`insert into project_subtasks values('s',$1,'t','todo')`,[id]);
  await assert.rejects(save(db,body([task('t','done')])),/unfinished subtasks/);
  assert.equal((await db.query('select revision from inquiry_projects')).rows[0].revision,1);
  assert.equal((await db.query('select count(*)::int n from inquiry_project_history')).rows[0].n,0);
  await db.exec(`update project_subtasks set status='done'`);
  assert.equal((await save(db,body([task('t','done')],'done'))).rows[0].result.result,'saved');
  assert.equal((await save(db,body(),1)).rows[0].result.result,'conflict');
  await assert.rejects(db.exec(`update project_subtasks set status='todo'`),/Reopen the completed parent task/);
  await assert.rejects(save(db,body([task('t','todo')],'done'),2),/Reopen the completed milestone/);
  assert.equal((await save(db,body(),2)).rows[0].result.result,'saved');
  await db.exec(`update project_subtasks set status='todo'`);
  await assert.rejects(save(db,body([], 'planned'),3),/subtasks explicitly/);
 }finally{await db.close();}
});

test('R7B phase closure checks shared and direct work while parallel active phases stay independent',async()=>{
 const db=await setup();try{
  await db.query(`insert into project_milestone_phases values($1,'m','discovery'),($1,'m','production')`,[id]);
  await db.query(`insert into project_phase_states(request_id,phase,status) values($1,'discovery','active'),($1,'production','active')`,[id]);
  await db.query(`insert into inquiry_staff values($1,true),('00000000-0000-0000-0000-000000000002',true)`,[actor]);
  await db.query(`insert into project_task_members values($1,'t',$2,'bivi'),($1,'t','00000000-0000-0000-0000-000000000002','bivi')`,[id,actor]);
  assert.equal((await db.query(`select count(*)::int n from staff_my_tasks`)).rows[0].n,1,'two assignees do not fan out a task');
  for(const phase of ['discovery','production'])assert.equal((await db.query(`select count(*)::int n from staff_my_tasks where effective_phases @> array[$1]`,[phase])).rows[0].n,1);
  assert.equal((await db.query(`select count(*)::int n from staff_my_tasks limit 1 offset 0`)).rows[0].n,1);
  await assert.rejects(db.exec(`update project_phase_states set status='completed' where phase='discovery'`),/applicable tasks/);
  await save(db,body([task('t','done')],'done'));
  const closed=await db.query(`select manage_project_phase_state($1,'discovery','completed',1,'Reviewed') result`,[id]);
  assert.equal(closed.rows[0].result.result,'saved');
  assert.equal((await db.query(`select status from project_phase_states where phase='production'`)).rows[0].status,'active');
  assert.equal((await db.query('select state from inquiry_projects')).rows[0].state,'active');
  await assert.rejects(save(db,body(),2),/completed phase/);
  await db.exec(`update project_phase_states set status='active' where phase='discovery'`);
  await save(db,body(),2);
  await db.query(`update project_task_controls set phase='direction' where request_id=$1`,[id]);
  assert.deepEqual((await db.query(`select project_effective_task_phases($1,$2) phase`,[id,task('t')])).rows.map(row=>row.phase).sort(),['direction','discovery','production']);
 }finally{await db.close();}
});

test('R7B missing controls, orphan links, client approval, dependency reopening and required delivery approvals fail closed',async()=>{
 const db=await setup();try{
  await db.exec(`delete from project_task_controls`);
  await assert.rejects(save(db,body([task('t','done')])),/Task control record is missing/);
  await db.query(`insert into project_task_controls(request_id,task_id,owner_type) values($1,'t','client')`,[id]);
  await assert.rejects(save(db,body([task('t','done')])),/Bivi review approval/);
  await db.query(`insert into project_client_task_responses(request_id,task_id,kind,status) values($1,'t','completion','accepted')`,[id]);
  await save(db,body([task('t','done')]));
  await save(db,body(),2);
  await assert.rejects(save(db,body([task('t','done')]),3),/Bivi review approval/);
  await db.exec(`update project_client_task_responses set reviewed_at=clock_timestamp()`);
  await save(db,body([task('t','done')]),3);
  await assert.rejects(db.query(`insert into project_milestone_phases values($1,'orphan','production')`,[id]),/parent is missing/);
  await assert.rejects(db.query(`insert into project_subtasks values('orphan',$1,'missing','todo')`,[id]),/parent task is missing/);
  await assert.rejects(db.query(`update project_task_controls set depends_on='missing' where request_id=$1`,[id]),/dependency is missing/);
  await assert.rejects(db.query(`insert into project_phase_states(request_id,phase,status) values($1,'qa','completed')`,[id]),/Required deliverable approvals/);
  assert.equal((await db.query(`select has_function_privilege('authenticated','public.project_task_completion_approved(uuid,text)','EXECUTE') allowed`)).rows[0].allowed,false);
  assert.equal((await db.query(`select has_function_privilege('authenticated','public.staff_project_completion_issues(uuid)','EXECUTE') allowed`)).rows[0].allowed,true);
 }finally{await db.close();}
});

test('R7B unmilestoned work and missing ownership cannot disappear from phase checks or client statistics',async()=>{
 const db=await setup();try{
  await save(db,body([task('t','todo',null)]));
  await db.query(`insert into project_phase_states(request_id,phase,status) values($1,'discovery','active')`,[id]);
  await assert.rejects(db.query(`select manage_project_phase_state($1,'discovery','completed',1,'Reviewed')`,[id]),/applicable tasks/);
  await db.exec(`delete from project_task_controls`);
  const outcome=await db.query(`select manage_project_phase_state($1,'discovery','completed',1,'Reviewed') result`,[id]);
  assert.equal(outcome.rows[0].result.result,'task_controls_missing');
  assert.equal((await db.query(`select revision from project_phase_states`)).rows[0].revision,1);
  await db.exec(`create or replace function is_inquiry_staff() returns boolean language sql stable as $$select false$$`);
  await assert.rejects(db.query(`select staff_project_completion_issues($1)`,[id]),/Staff authorization required/);
 }finally{await db.close();}
});

test('R7B totals are distinct identities, independent of memberships and filter/page slices; empty and timezone boundaries stay truthful',()=>{
 const {taskMetrics,effectiveTaskPhases}=loadProjectTs('lib/projects/metrics.ts');
 const {taskToday}=loadProjectTs('lib/tasks/links.ts');
 const tasks=[{...task('a','done'),dueOn:'2026-10-20'},{...task('b','blocked'),dueOn:'2026-10-21'},task('c')];
 const snapshot=structuredClone(tasks);
 assert.deepEqual(taskMetrics([...tasks,tasks[0]],'2026-10-22'),{total:3,done:1,open:2,blocked:1,percent:33,overdue:1,dueToday:0});
 assert.equal(taskMetrics([],'2026-10-22').percent,null);
 assert.equal(taskMetrics(tasks).overdue,null);
 const phases=effectiveTaskPhases(tasks[0],[{taskId:'a',phase:'direction'}],[{milestoneId:'m',phase:'production'},{milestoneId:'m',phase:'production'},{milestoneId:'m',phase:'discovery'}]);
 assert.equal(phases.length,3);
 const now=new Date('2026-10-22T00:30:00Z');
 assert.equal(taskMetrics(tasks,taskToday('America/Chicago',now).today).overdue,0);
 assert.equal(taskMetrics(tasks,taskToday('UTC',now).today).overdue,1);
 tasks.slice(0,1);tasks.filter(row=>row.status==='blocked');
 assert.equal(taskMetrics(tasks).total,3);assert.deepEqual(tasks,snapshot);
});
