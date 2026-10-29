import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {loadProjectTs} from './load-project-ts.mjs';
import {projectEditor,plan,copy} from './project-editor-harness.mjs';
const {projectBodySchema}=loadProjectTs('lib/projects/schema.ts');
const {workplanDraftBodySchema}=loadProjectTs('lib/projects/workplan-draft-schema.ts');
const {mergeProjectBodies}=loadProjectTs('lib/projects/workplan-merge.ts');
const {taskStartOn}=loadProjectTs('lib/projects/task-timing.ts');
const read=path=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const migrationName=readdirSync(new URL('../../supabase/migrations/',import.meta.url)).find(name=>name.endsWith('_tasks_editor_schedule_times.sql'));
const migration=read('supabase/migrations/'+migrationName);
const timing={startOn:'2026-11-01',startTime:'09:30',dueOn:'2026-11-01',dueTime:'10:30',timeZone:'America/Chicago'};

test('date-only plans remain compatible; invalid and reversed times cannot publish',()=>{
 assert.equal(projectBodySchema.safeParse(plan).success,true);
 for(const edit of [{startTime:'25:00'},{startOn:'2026-02-30'},{startOn:null,startTime:'09:00'},{startTime:'11:00',dueTime:'10:00'},{timeZone:'Invalid/Zone'},{startOn:'2026-03-08',startTime:'02:30',dueOn:'2026-03-08',dueTime:'04:00'}]){
  const body=copy(plan);Object.assign(body.tasks[0],timing,edit);
  assert.equal(projectBodySchema.safeParse(body).success,false,JSON.stringify(edit));
  if(!('startOn' in edit))assert.equal(workplanDraftBodySchema.safeParse(body).success,true,'draft remains editable');
 }
 assert.equal(taskStartOn(plan.tasks[0],'2026-10-01'),'2026-10-01');
 assert.equal(taskStartOn({...plan.tasks[0],startOn:null},'2026-10-01'),null);
});

test('new optional timing fields survive rebases and conflicts remain explicit',()=>{
 const baseline=copy(plan),draft=copy(plan),latest=copy(plan);
 Object.assign(draft.tasks[0],timing);latest.tasks[0].title='Remote title';
 const result=mergeProjectBodies(baseline,draft,latest);
 assert.equal(result.body.tasks[0].startTime,'09:30');assert.equal(result.body.tasks[0].title,'Remote title');assert.equal(result.conflicts.length,0);
 latest.tasks[0].startTime='08:30';
 assert.ok(mergeProjectBodies(baseline,draft,latest).conflicts.some(row=>row.path==='tasks.t.startTime'));
});

test('task times back up privately and single-task save preserves other drafts',async()=>{
 const work=projectEditor();await work.flush();
 work.edit(body=>{Object.assign(body.tasks[0],timing);body.tasks.push({...copy(plan.tasks[0]),id:'other',startOn:'2026-12-01',startTime:'13:30',timeZone:'UTC'});});
 work.fireTimers();await work.flush();assert.equal(work.server.posts,0);assert.equal(work.server.draft.body.tasks[0].dueTime,'10:30');
 await work.current.save('t');await work.flush();
 assert.equal(work.server.body.tasks[0].startTime,'09:30');assert.equal(work.server.body.tasks.length,1);
 assert.equal(work.current.body.tasks[1].startTime,'13:30');assert.equal(work.current.dirty,true);work.unmount();
});

test('PostgreSQL migration preserves date-only data and atomically projects saved schedules',async()=>{
 const db=new PGlite();
 const id='00000000-0000-0000-0000-000000000010';
 try{
  await db.exec(`
   create role anon;create role authenticated;create role service_role;create schema auth;
   create function auth.uid() returns uuid language sql stable as $$ select '00000000-0000-0000-0000-000000000001'::uuid $$;
   create function public.is_inquiry_staff() returns boolean language sql stable as $$ select true $$;
   create table public.inquiry_projects(request_id uuid primary key,body jsonb,revision integer,state text);
   create table public.project_task_controls(request_id uuid,task_id text,primary key(request_id,task_id));
   create table public.project_task_schedule(request_id uuid,task_id text,start_on date,revision integer,updated_at timestamptz,updated_by uuid,primary key(request_id,task_id),foreign key(request_id,task_id) references public.project_task_controls(request_id,task_id));
   create table public.project_task_schedule_history(request_id uuid,task_id text,previous_start_on date,next_start_on date,revision integer,actor uuid);
   create table public.project_task_history(request_id uuid,task_id text,action text,snapshot jsonb,actor uuid);
   create view public.staff_calendar with(security_invoker=true) as
    select p.request_id,t.value->>'id' as source_id,'task'::text as event_type,(t.value->>'dueOn')::date as due_on,null::timestamptz as starts_at,null::timestamptz as ends_at,null::text as meeting_timezone
    from public.inquiry_projects p cross join lateral jsonb_array_elements(p.body->'tasks') t(value) where t.value->>'dueOn' is not null;
   create view public.staff_my_tasks with(security_invoker=true) as select p.request_id,t.value->>'id' as task_id from public.inquiry_projects p cross join lateral jsonb_array_elements(p.body->'tasks') t(value);
   create function public.manage_inquiry_project(p_request uuid,p_command jsonb) returns jsonb language plpgsql as $$
   begin
    if not public.valid_project_body(p_command->'body') then raise exception 'Invalid body'; end if;
    if not exists(select 1 from public.inquiry_projects where request_id=p_request and revision=(p_command->>'expectedRevision')::int) then return jsonb_build_object('result','conflict'); end if;
    update public.inquiry_projects set body=p_command->'body',revision=revision+1 where request_id=p_request;
    insert into public.project_task_controls select p_request,value->>'id' from jsonb_array_elements(p_command->'body'->'tasks') on conflict do nothing;
    return jsonb_build_object('result','saved');
   end;$$;
  `);
  await db.exec(migration);
  const validate=async body=>(await db.query('select public.valid_project_body($1::jsonb) as valid',[JSON.stringify(body)])).rows[0].valid;
  assert.equal(await validate(plan),true);
  const body=copy(plan);Object.assign(body.tasks[0],timing);
  assert.equal(await validate(body),true);
  assert.equal(await validate({...body,tasks:[{...body.tasks[0],dueTime:'08:00'}]}),false);
  assert.equal(await validate({...body,tasks:[{...body.tasks[0],unexpected:'field'}]}),false);
  await db.query('insert into public.inquiry_projects values ($1,$2,1,\'active\')',[id,JSON.stringify(plan)]);
  await db.query('insert into public.project_task_controls values ($1,\'t\')',[id]);
  await db.query('select public.manage_inquiry_project($1,$2)',[id,JSON.stringify({expectedRevision:1,body})]);
  assert.equal((await db.query('select start_on::text from public.project_task_schedule')).rows[0].start_on,'2026-11-01');
  assert.equal((await db.query('select start_time,due_time,time_zone from public.staff_my_tasks')).rows[0].due_time,'10:30');
  assert.equal((await db.query("select to_char(starts_at at time zone 'UTC','YYYY-MM-DD HH24:MI') as instant from public.staff_calendar")).rows[0].instant,'2026-11-01 16:30','DST fall-back day uses Chicago standard time');
  const moved=await db.query("select public.manage_project_task_schedule($1,'t','2026-10-30',2,1) as result",[id]);
  assert.equal(moved.rows[0].result.result,'saved');
  const current=(await db.query('select body from public.inquiry_projects')).rows[0].body;
  assert.equal(current.tasks[0].startOn,'2026-10-30');assert.equal(current.tasks[0].startTime,'09:30');
  assert.equal((await db.query("select public.manage_project_task_schedule($1,'t','2026-10-29',2,1) as result",[id])).rows[0].result.result,'conflict');
  assert.equal((await db.query("select has_function_privilege('anon','public.sync_project_task_timing()','execute') as allowed")).rows[0].allowed,false);
  // New task FK targets are created after body UPDATE, before deferred schedule projection.
  current.tasks.push({...copy(plan.tasks[0]),id:'new',startOn:'2026-10-29'});
  await db.query('select public.manage_inquiry_project($1,$2)',[id,JSON.stringify({expectedRevision:3,body:current})]);
  assert.equal((await db.query("select count(*)::int as count from public.project_task_schedule where task_id='new'")).rows[0].count,1);
 }finally{await db.close();}
});
