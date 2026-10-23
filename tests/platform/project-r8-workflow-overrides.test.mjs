import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),'utf8');
const extract=(file,name)=>read(file).match(new RegExp(`create (?:or replace )?function public\\.${name}\\([\\s\\S]*?\\$\\$;`))[0];
const migration=read('supabase/migrations/20261023181806_r8_task_status_validation_overrides.sql');
const freshnessMigration=read('supabase/migrations/20261023182352_r8_relevant_review_freshness.sql');
const integrity='supabase/migrations/20261023130000_r7b_project_integrity.sql';
const workspace='supabase/migrations/202610140024_my_tasks.sql';
const projectId='00000000-0000-0000-0000-000000000010';
const admin='00000000-0000-0000-0000-000000000001';
const otherStaff='00000000-0000-0000-0000-000000000002';
const client='00000000-0000-0000-0000-000000000003';
const task=(id,status='todo',milestoneId=null)=>({id,title:id,status,milestoneId,dueOn:null,owner:'',notes:''});
const body=tasks=>({title:'Project',owner:'',notes:'',milestones:[],tasks});

async function setup(initialTasks=[task('legacy-client','done'),task('bivi-task')]){
 const db=new PGlite();
 await db.exec(`
  create role anon;create role authenticated;create role service_role;
  create schema auth;
  create table auth.users(id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('app.test_uid',true),'')::uuid$$;
  create table public.inquiry_staff(user_id uuid primary key,active boolean not null default true);
  create function public.is_inquiry_staff() returns boolean language sql stable as $$select exists(select 1 from public.inquiry_staff where user_id=auth.uid() and active)$$;
  create table project_inquiries(request_id uuid primary key);
  create table inquiry_proposals(request_id uuid,version integer,status text,body jsonb);
  create table inquiry_readiness(request_id uuid,revision integer,state text,body jsonb);
  create table inquiry_onboarding(request_id uuid,revision integer,state text,body jsonb,proposal_version integer,completed_readiness_revision integer);
  create table inquiry_projects(request_id uuid primary key,public_id text,proposal_version integer,revision integer,state text,body jsonb,updated_at timestamptz default now(),updated_by uuid,scope_snapshot jsonb,onboarding_snapshot jsonb,onboarding_items_snapshot jsonb,readiness_snapshot jsonb,activated_readiness_revision integer,activated_onboarding_revision integer,activated_by uuid);
  create table project_task_controls(request_id uuid,task_id text,owner_type text default 'bivi',phase text default 'discovery',service_id text,depends_on text,blocker_owner text,updated_by uuid,updated_at timestamptz default now(),assigned_staff_id uuid,revision integer default 1,priority text,client_note text,primary key(request_id,task_id));
  create table project_subtasks(id text,request_id uuid,task_id text,status text);
  create table project_milestone_phases(request_id uuid,milestone_id text,phase text);
  create table project_phase_states(request_id uuid,phase text,status text,revision integer default 1,activated_at timestamptz,completed_at timestamptz,updated_at timestamptz,updated_by uuid,primary key(request_id,phase));
  create table project_task_members(request_id uuid,task_id text,user_id uuid,side text);
  create table project_task_schedule(request_id uuid,task_id text,start_on date,updated_at timestamptz);
  create table project_lifecycle(request_id uuid,phase text);
  create table project_task_history(request_id uuid,task_id text,action text,snapshot jsonb,actor uuid,created_at timestamptz default now());
  create table inquiry_project_history(request_id uuid,action text,reason text,snapshot jsonb,actor uuid,created_at timestamptz default now());
  create table project_client_task_responses(id uuid primary key,request_id uuid,task_id text,kind text,status text,reviewed_at timestamptz);
  create table project_request_baselines(response_id uuid primary key,request_id uuid,submitted_task jsonb,submitted_control_revision integer);
  create table project_brief_versions(request_id uuid,version integer,status text);
  create table project_event_history(id bigint generated always as identity primary key,request_id uuid,source text,action text,item_id text,actor uuid,recipients uuid[] not null default '{}',details jsonb not null default '{}',created_at timestamptz not null default now());
  create table project_operational_status(request_id uuid,status text);
  create function project_prerequisites_met(uuid) returns boolean language sql stable as $$select true$$;
  create function project_delivery_ready(uuid) returns boolean language sql stable as $$select false$$;
  create function project_closeout_ready(uuid) returns boolean language sql stable as $$select false$$;
  create function project_phase_rank(text) returns integer language sql immutable as $$select case when $1='invalid' then 999 else 1 end$$;
 `);
 await db.exec(extract('supabase/migrations/202610060006_project_workspace.sql','valid_project_body'));
 await db.exec(extract(workspace,'manage_inquiry_project'));
 await db.exec(extract(integrity,'project_effective_task_phases'));
 await db.exec(extract(integrity,'project_task_completion_approved'));
 await db.exec(extract(integrity,'guard_project_work_integrity'));
 await db.exec(extract(integrity,'guard_project_child_integrity'));
 await db.exec(extract(integrity,'project_sync_milestone_statuses'));
 await db.query(`insert into auth.users(id) values($1),($2),($3)`,[admin,otherStaff,client]);
 await db.query(`insert into inquiry_staff values($1,true),($2,true)`,[admin,otherStaff]);
 await db.query(`insert into project_inquiries values($1)`,[projectId]);
 await db.query(`insert into inquiry_projects(request_id,revision,state,body) values($1,1,'active',$2)`,[projectId,body(initialTasks)]);
 await db.query(`insert into project_lifecycle values($1,'discovery')`,[projectId]);
 for(const item of initialTasks)await db.query(`insert into project_task_controls(request_id,task_id,owner_type) values($1,$2,$3)`,[projectId,item.id,item.id.startsWith('legacy-client')||item.id.startsWith('client-')?'client':'bivi']);
 await db.exec(`create trigger zz_project_work_integrity before update of body,state on inquiry_projects for each row execute function guard_project_work_integrity();
  create trigger zz_project_control_integrity before insert or update on project_task_controls for each row execute function guard_project_child_integrity();
  create trigger project_milestone_status_sync before update of body on inquiry_projects for each row execute function project_sync_milestone_statuses();`);
 await db.exec(migration);
 await db.exec(freshnessMigration);
 await db.query(`select set_config('app.test_uid',$1,false)`,[admin]);
 return db;
}
const save=(db,next,revision)=>db.query('select manage_inquiry_project($1,$2) result',[projectId,{action:'save',expectedRevision:revision,body:next}]);
const savedBody=async db=>(await db.query('select body,revision from inquiry_projects where request_id=$1',[projectId])).rows[0];

test('unchanged legacy completed client tasks do not block an unrelated Bivi task edit',async()=>{
 const db=await setup();try{
  const current=(await savedBody(db)).body;
  const candidate=body(current.tasks.map(item=>item.id==='bivi-task'?{...item,status:'doing'}:item));
  const result=(await save(db,candidate,1)).rows[0].result;
  assert.equal(result.result,'saved');
  assert.equal((await savedBody(db)).body.tasks.find(item=>item.id==='legacy-client').status,'done');
  assert.equal((await savedBody(db)).body.tasks.find(item=>item.id==='bivi-task').status,'doing');
 }finally{await db.close();}
});

test('new client completion still requires a fresh accepted review baseline',async()=>{
 const db=await setup([task('client-new')]);try{
  await assert.rejects(save(db,body([task('client-new','done')]),1),/client_completion_review_required\|task=client-new/);
  assert.equal((await savedBody(db)).revision,1);
  assert.equal((await db.query('select count(*)::int n from inquiry_project_history')).rows[0].n,0);
  const response='00000000-0000-0000-0000-000000000090';
  await db.query(`insert into project_client_task_responses values($1,$2,'client-new','completion','accepted',now())`,[response,projectId]);
  await db.query(`insert into project_request_baselines values($1,$2,$3,1)`,[response,projectId,task('client-new')]);
  assert.equal((await save(db,body([task('client-new','done')]),1)).rows[0].result.result,'saved');
 }finally{await db.close();}
});

test('accepted review becomes stale only after that task work or its controls change',async()=>{
 const db=await setup([task('client-fresh')]);try{
  const response='00000000-0000-0000-0000-000000000091';
  await db.query(`insert into project_client_task_responses values($1,$2,'client-fresh','completion','accepted',now())`,[response,projectId]);
  await db.query(`insert into project_request_baselines values($1,$2,$3,1)`,[response,projectId,task('client-fresh')]);
  await db.query(`insert into project_task_history(request_id,task_id,action,snapshot,actor) values($1,'client-fresh','client_update',jsonb_build_object('kind','staff_completion_approval','responseId',$2::text,'task',$3::jsonb),$4)`,[projectId,response,task('client-fresh'),admin]);
  await save(db,body([task('client-fresh','done')]),1);
  const latest=(await savedBody(db)).body;
  assert.equal(latest.tasks[0].status,'done','the submitted accepted completion should persist');
  await save(db,{...latest,title:'Renamed project'},2);
  assert.equal((await savedBody(db)).revision,3,'project-title changes do not stale task review');
  await db.query(`update project_task_controls set priority='high',revision=revision+1 where request_id=$1 and task_id='client-fresh'`,[projectId]);
  const afterMetadata=(await savedBody(db)).body;
  const unrelated=body(afterMetadata.tasks.map(item=>item.id==='bivi-task'?{...item,status:'doing'}:item));
  assert.equal((await save(db,unrelated,3)).rows[0].result.result,'saved','unrelated priority/control revision changes do not stale the accepted review');
  const approvedTask=unrelated.tasks.find(item=>item.id==='client-fresh');
  const evidence=await db.query(`select s.control_snapshot,public.project_task_review_controls_snapshot($1,'client-fresh') current,public.project_task_completion_gate_satisfied($1,'client-fresh',$2::jsonb) gate from project_task_completion_review_controls s where response_id=$3`,[projectId,approvedTask,response]);
  assert.equal(evidence.rows[0].gate,true,JSON.stringify(evidence.rows[0]));
  await assert.rejects(db.query(`update project_task_controls set phase='production',revision=revision+1 where request_id=$1 and task_id='client-fresh'`,[projectId]),/client_completion_review_required/,'completion-relevant control edits require reopening completed work first');
  assert.equal((await db.query(`select phase from project_task_controls where request_id=$1 and task_id='client-fresh'`,[projectId])).rows[0].phase,'discovery');
  const edited=body([task('client-fresh','done')]);edited.tasks[0].title='Materially revised work';
  await assert.rejects(save(db,edited,4),/client_completion_review_required\|task=client-fresh/);
  assert.equal((await savedBody(db)).revision,4);
 }finally{await db.close();}
});

test('admin override is reasoned, auditable, targeted, survives unrelated saves, and cannot authorize a later completion',async()=>{
 const db=await setup([task('client-override'),task('bivi-other')]);try{
  await db.query(`insert into project_workflow_override_admins(user_id) values($1)`,[admin]);
  const result=(await db.query(`select manage_project_task_status_override($1,'client-override','done',1,'Approved operational exception') result`,[projectId])).rows[0].result;
  assert.equal(result.result,'saved');
  assert.equal(result.revision,2);
  const override=(await db.query('select gate,reason,source_status,target_status,overridden_gates,actor from project_task_workflow_overrides')).rows[0];
  assert.deepEqual(override,{gate:'client_completion_review',reason:'Approved operational exception',source_status:'todo',target_status:'done',overridden_gates:['client_completion_review'],actor:admin});
  assert.equal((await db.query(`select count(*)::int n from project_client_task_responses`)).rows[0].n,0,'override does not manufacture client review evidence');
  assert.equal((await db.query(`select source,action,item_id,details->>'reason' reason from project_event_history`)).rows[0].reason,'Approved operational exception');
  const after=(await savedBody(db)).body;
  const unrelated=body(after.tasks.map(item=>item.id==='bivi-other'?{...item,status:'doing'}:item));
  assert.equal((await save(db,unrelated,2)).rows[0].result.result,'saved');
  const reopened=body(unrelated.tasks.map(item=>item.id==='client-override'?{...item,status:'todo'}:item));
  assert.equal((await save(db,reopened,3)).rows[0].result.result,'saved');
  const recommit=body(reopened.tasks.map(item=>item.id==='client-override'?{...item,status:'done'}:item));
  await assert.rejects(save(db,recommit,4),/client_completion_review_required\|task=client-override/);
  assert.equal((await db.query(`select count(*)::int n from project_task_workflow_overrides`)).rows[0].n,1,'old evidence remains historical');
 }finally{await db.close();}
});

test('override requires explicit admin capability, a reason, a fresh project revision, and same-project task ownership',async()=>{
 const db=await setup([task('client-guarded')]);try{
  await assert.rejects(db.query(`select manage_project_task_status_override($1,'client-guarded','done',1,'No admin grant')`,[projectId]),/Project workflow administrator access required/);
  await db.query(`insert into project_workflow_override_admins(user_id) values($1)`,[admin]);
  await assert.rejects(db.query(`select manage_project_task_status_override($1,'client-guarded','done',1,'')`,[projectId]),/Invalid workflow override command/);
  assert.equal((await db.query(`select manage_project_task_status_override($1,'client-guarded','done',2,'stale') result`,[projectId])).rows[0].result.result,'conflict');
  assert.equal((await db.query(`select manage_project_task_status_override('00000000-0000-0000-0000-000000000099','client-guarded','done',1,'wrong project') result`)).rows[0].result.result,'not_found');
  assert.equal((await savedBody(db)).revision,1);
  await db.query(`insert into project_subtasks values('subtask',$1,'client-guarded','todo')`,[projectId]);
  assert.equal((await db.query(`select manage_project_task_status_override($1,'client-guarded','done',1,'Must finish nested work first') result`,[projectId])).rows[0].result.result,'subtasks_incomplete');
  assert.equal((await savedBody(db)).revision,1);
  assert.equal((await db.query(`select count(*)::int n from project_task_workflow_overrides`)).rows[0].n,0);
  assert.equal((await db.query(`select has_function_privilege('anon','public.manage_project_task_status_override(uuid,text,text,integer,text)','EXECUTE') allowed`)).rows[0].allowed,false);
 }finally{await db.close();}
});

test('classifier returns an item-scoped corrective gate instead of mislabeling validation as a conflict',()=>{
 const source=read('lib/projects/workplan-save-errors.ts');
 assert.match(source,/client_completion_review_required\|task=/);
 assert.match(source,/correctiveActions/);
 assert.match(source,/current accepted Bivi review/);
});
