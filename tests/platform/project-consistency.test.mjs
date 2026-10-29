import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProjectTs} from './load-project-ts.mjs';
import {projectEditor,plan,copy} from './project-editor-harness.mjs';
const {taskEvent,taskDeadlineDay,taskIsOverdue,compareTaskDeadlines}=loadProjectTs('lib/projects/deadlines.ts');
const {taskMetrics,effectiveTaskPhases}=loadProjectTs('lib/projects/metrics.ts');
const {projectOverviewSummary}=loadProjectTs('lib/projects/overview-summary.ts');
const {workplanTaskMatches,emptyWorkplanFilters}=loadProjectTs('lib/projects/workplan-filters.ts');
const {calendarItemOverdue}=loadProjectTs('lib/calendar/links.ts');
const {taskHref}=loadProjectTs('lib/tasks/links.ts');
const task=(id,changes={})=>({...copy(plan.tasks[0]),id,title:id,...changes});
const now='2026-10-29T16:00:00Z',today='2026-10-29',timezone='America/Chicago';
const early=task('late alphabetically',{title:'Z first',dueOn:'2026-10-30',dueTime:'00:30',timeZone:'Asia/Tokyo'});
const later=task('later',{title:'A later',dueOn:'2026-10-30',dueTime:'02:00',timeZone:'Asia/Tokyo'});
const allDay=task('all-day',{dueOn:today});

test('Tasks filters, Overview counts and calendar dates share timed deadline semantics',()=>{
 const body={...copy(plan),tasks:[later,allDay,early,task('done',{...early,id:'done',status:'done'})]};
 const context={body,links:[],controls:[],assignments:[],today,timezone,now};
 const metrics=taskMetrics(body.tasks,today,{timezone,now});
 assert.equal(taskDeadlineDay(early,timezone),today);
 assert.deepEqual(taskEvent(early,'due',timezone),{date:today,time:'10:30',timeZone:timezone,instant:Date.parse('2026-10-29T15:30:00Z')});
 assert.equal(taskIsOverdue(early,context),true);assert.equal(taskIsOverdue(later,context),false);assert.equal(taskIsOverdue(allDay,context),false);
 assert.equal(metrics.overdue,1);assert.equal(metrics.dueToday,3);assert.equal(metrics.total,4);
 assert.deepEqual(body.tasks.filter(item=>workplanTaskMatches(item,{...emptyWorkplanFilters,deadline:'overdue'},context)).map(item=>item.id),[early.id]);
 assert.equal(projectOverviewSummary(body,today,{timezone,now}).nextDatedTask.id,early.id);
 assert.deepEqual([allDay,later,early].sort((a,b)=>compareTaskDeadlines(a,b,timezone)).map(item=>item.id),[early.id,later.id,allDay.id]);
});

test('date-only tasks float by calendar day; timed starts and DST instants retain identity',()=>{
 assert.equal(taskEvent(allDay,'due','Asia/Tokyo').date,today);
 const start=task('start',{startOn:'2026-10-30',startTime:'00:15',timeZone:'Asia/Tokyo'});
 assert.equal(taskEvent(start,'start',timezone).date,today);
 assert.equal(taskEvent(start,'start',timezone).time,'10:15');
 const fold=task('fold',{dueOn:'2026-11-01',dueTime:'01:30',timeZone:timezone});
 assert.equal(taskEvent(fold,'due','UTC').instant,Date.parse('2026-11-01T07:30:00Z'));
 const old={is_done:false,due_on:'2026-10-01',starts_at:'2026-10-01T10:00:00Z'};
 assert.equal(calendarItemOverdue({...old,event_type:'task_start'},today,now),false);
 assert.equal(calendarItemOverdue({...old,event_type:'task'},today,now),true);
 assert.equal(calendarItemOverdue({...old,event_type:'milestone'},today,now),true);
});

test('counts use task identities, preserve multiple phase scope and link to the canonical editor',()=>{
 const body={...copy(plan),tasks:[early,early,later]};
 assert.equal(taskMetrics(body.tasks,today,{timezone,now}).total,2);
 assert.deepEqual(effectiveTaskPhases(early,[{taskId:early.id,phase:'discovery'}],[{milestoneId:'m',phase:'production'},{milestoneId:'m',phase:'production'}]),['discovery','production']);
 const href=taskHref('project',early.id);const url=new URL(href,'https://example.test');
 assert.equal(url.searchParams.get('tab'),'plan');assert.equal(url.searchParams.get('task'),early.id);
});

test('private date edits stay out of saved readers until the explicit task save',async()=>{
 const work=projectEditor();await work.flush();
 work.edit(body=>{Object.assign(body.tasks[0],{dueOn:early.dueOn,dueTime:early.dueTime,timeZone:early.timeZone});});
 work.fireTimers();await work.flush();
 assert.equal(work.server.body.tasks[0].dueTime,undefined);
 assert.equal(projectOverviewSummary(work.server.body,today,{timezone,now}).overdue,0);
 await work.current.save('t');await work.flush();
 assert.equal(projectOverviewSummary(work.server.body,today,{timezone,now}).overdue,1);
 work.unmount();
});

import {PGlite} from '@electric-sql/pglite';
import {readFileSync,readdirSync} from 'node:fs';
import {randomUUID} from 'node:crypto';

test('saved task instants, timezone filters, assignments and draft isolation agree in PostgreSQL',async()=>{
 const db=new PGlite();const migrations=new URL('../../supabase/migrations/',import.meta.url);
 const staff=randomUUID(),second=randomUUID(),client=randomUUID(),project=randomUUID();
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role;
   create schema auth;create table auth.users(id uuid primary key,email text);
   create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
   grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to authenticated;
   create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
   create table storage.objects(id bigint generated always as identity,bucket_id text,name text,metadata jsonb,unique(bucket_id,name));
   alter table storage.objects enable row level security;grant usage on schema storage to authenticated,anon;
   grant select,insert,update,delete on storage.objects to authenticated,anon;grant usage on sequence storage.objects_id_seq to authenticated,anon;`);
  for(const file of readdirSync(migrations).filter(file=>file.endsWith('.sql')).sort())await db.exec(readFileSync(new URL(file,migrations),'utf8'));
  await db.query('insert into auth.users(id,email) values($1,$2),($3,$4),($5,$6)',[staff,'one@example.test',second,'two@example.test',client,'client@example.test']);
  await db.query('insert into inquiry_staff(user_id,active) values($1,true),($2,true)',[staff,second]);
  await db.query('insert into project_inquiries(request_id,payload,payload_hash) values($1,$2,$3)',[project,{name:'Consistency fixture',email:'client@example.test'},'a'.repeat(64)]);
  await db.query("insert into inquiry_proposals(request_id,version,status,body) values($1,1,'accepted','{}')",[project]);
  const saved={...copy(plan),milestones:[],tasks:[{...early,milestoneId:null,startOn:'2026-10-30',startTime:'00:15'}, {...later,milestoneId:null}, {...allDay,milestoneId:null},task('fold',{milestoneId:null,dueOn:'2026-11-01',dueTime:'01:30',timeZone:timezone})]};
  const initial={...saved,tasks:saved.tasks.map(({startOn,startTime,dueTime,timeZone,...rest})=>rest)};
  await db.query("insert into inquiry_projects(request_id,proposal_version,revision,state,body,scope_snapshot,onboarding_snapshot,readiness_snapshot,activated_readiness_revision,activated_onboarding_revision) values($1,1,1,'active',$2,'{}','{}','{}',1,1)",[project,initial]);
  for(const item of saved.tasks)await db.query("insert into project_task_controls(request_id,task_id,owner_type,phase) values($1,$2,'bivi','discovery')",[project,item.id]);
  const actor=async id=>{await db.exec('reset role;set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
  await actor(staff);
  for(const item of saved.tasks)assert.equal((await db.query('select assign_project_task($1,$2,$3,1) as result',[project,item.id,staff])).rows[0].result.result,'saved');
  assert.equal((await db.query('select manage_inquiry_project($1,$2) as result',[project,{action:'save',expectedRevision:1,body:saved}])).rows[0].result.result,'saved');
  const rows=(await db.query("select * from staff_my_tasks_in_timezone('America/Chicago') order by due_on,due_at nulls last")).rows;
  const projected=rows.find(row=>row.task_id===early.id);
  assert.equal(new Date(projected.due_on).toISOString().slice(0,10),today);assert.equal(projected.due_time,'10:30');assert.equal(projected.start_time,'10:15');
  assert.equal(new Date(projected.due_at).toISOString(),'2026-10-29T15:30:00.000Z');
  assert.equal(new Date(rows.find(row=>row.task_id==='fold').due_at).toISOString(),'2026-11-01T07:30:00.000Z');
  const calendar=(await db.query('select * from staff_calendar where request_id=$1 and source_id=$2',[project,early.id])).rows;
  assert.equal(new Date(calendar.find(row=>row.event_type==='task').starts_at).getTime(),new Date(projected.due_at).getTime());
  assert.equal(new Date(calendar.find(row=>row.event_type==='task_start').starts_at).getTime(),new Date(projected.start_at).getTime());
  const overdue=(await db.query("select task_id from staff_my_tasks_in_timezone('America/Chicago') where task_status<>'done' and (due_at<$1::timestamptz or (due_at is null and due_on<$2::date))",[now,today])).rows.map(row=>row.task_id);
  assert.deepEqual(overdue,[early.id]);
  const draft=copy(saved);draft.tasks[0].dueTime='20:00';
  await db.query('select save_project_workplan_draft($1,2,$2,$3,0)',[project,draft,saved]);
  assert.equal((await db.query('select due_time from staff_my_tasks where task_id=$1',[early.id])).rows[0].due_time,'00:30','private backup cannot leak into saved reads');
  const revision=(await db.query('select revision from project_task_controls where request_id=$1 and task_id=$2',[project,early.id])).rows[0].revision;
  await db.query("select staff_project_assign_members($1,'task',$2,'bivi',$3,$4)",[project,early.id,[staff,second],revision]);
  assert.equal((await db.query("select count(*)::int as count from staff_my_tasks_in_timezone('America/Chicago') where task_id=$1",[early.id])).rows[0].count,1);
  await actor(second);const secondary=(await db.query("select * from staff_my_tasks_in_timezone('America/Chicago')")).rows;
  assert.equal(secondary.length,1);assert.equal(secondary[0].assignee_count,2);
  await actor(client);await assert.rejects(db.query("select * from staff_my_tasks_in_timezone('America/Chicago')"),/Staff authorization/);
  await db.exec('reset role;set role anon');await assert.rejects(db.query("select * from staff_my_tasks_in_timezone('America/Chicago')"),/permission denied/);
 }finally{await db.close();}
});
