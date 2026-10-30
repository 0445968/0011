import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {loadProjectTs} from './load-project-ts.mjs';
import {plan,projectEditor,deferred} from './project-editor-harness.mjs';
const {recoveryKey,readCheckpoint,writeCheckpoint}=loadProjectTs('lib/projects/work-recovery.ts');
const {taskDisplayState}=loadProjectTs('lib/projects/task-review-state.ts');
test('local recovery isolates staff and project, expires on retention changes, and preserves discarded snapshots',()=>{
 const items=new Map();const storage={setItem:(k,v)=>items.set(k,v),getItem:k=>items.get(k)??null,removeItem:k=>items.delete(k)};
 const key=recoveryKey('staff-a','p');const draft={body:plan,baseBody:plan,baseRevision:1,updatedAt:new Date().toISOString()};
 writeCheckpoint(storage,key,draft,60,true);
 assert.equal(readCheckpoint(storage,key).discarded,true);assert.equal(readCheckpoint(storage,recoveryKey('staff-b','p')),null);
 assert.equal(readCheckpoint(storage,key,Date.now()+2*86400000,1),null);assert.equal(items.has(key),false);
 storage.setItem(key,'{"expiresAt":9999999999999,"body":{}}');assert.equal(readCheckpoint(storage,key),null);
});
test('review categories reflect latest completion request and completion clears the active review display',()=>{
 assert.equal(taskDisplayState({id:'t',status:'doing'},{t:'in_review'}),'in_review');
 assert.equal(taskDisplayState({id:'t',status:'doing'},{t:'rejected'}),'rejected');
 assert.equal(taskDisplayState({id:'t',status:'done'},{t:'rejected'}),'done');
});
test('discard flushes the latest edit to a server draft before deleting it',async()=>{
 const work=projectEditor();await work.flush();work.edit(body=>body.tasks[0].title='Latest edit before debounce');
 assert.equal(work.server.draft,null);assert.equal(await work.current.discard(),true);await work.flush();
 assert.equal(work.current.body.tasks[0].title,'Task');assert.equal(work.current.drafts.recoveryCopy.body.tasks[0].title,'Latest edit before debounce');
 assert.equal(work.server.deletes,1);work.unmount();
});
test('database keeps private discarded recovery, enforces retention preferences and rejects cross-staff reads',async()=>{
 const db=new PGlite();
 const staff='00000000-0000-0000-0000-000000000001',project='00000000-0000-0000-0000-000000000010';
 try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${staff}');create function auth.uid() returns uuid language sql stable as $$select current_setting('test.uid',true)::uuid$$;create function public.is_inquiry_staff() returns boolean language sql stable as $$select true$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create table public.inquiry_projects(request_id uuid primary key);insert into public.inquiry_projects values('${project}');create table public.project_workplan_drafts(request_id uuid,staff_id uuid,body jsonb,base_body jsonb,base_revision integer,updated_at timestamptz);create table public.project_client_task_responses(id uuid,request_id uuid,task_id text,status text,kind text,submitted_at timestamptz);`);
 await db.exec(readFileSync(new URL('../../supabase/migrations/20261030134515_workplan_recovery.sql',import.meta.url),'utf8'));
 await db.query('insert into public.project_workplan_drafts values($1,$2,$3,$3,1,now())',[project,staff,JSON.stringify(plan)]);
 await db.exec(`delete from public.project_workplan_drafts;set role authenticated;select set_config('test.uid','${staff}',false);`);
 assert.equal((await db.query('select body from public.project_workplan_recovery')).rows.length,1);
 await db.exec(`insert into public.staff_work_recovery_preferences values('${staff}',7);`);
 const days=await db.query('select extract(epoch from expires_at-captured_at)/86400 as days from public.project_workplan_recovery');assert.equal(Number(days.rows[0].days),7);
 await assert.rejects(db.exec(`update public.staff_work_recovery_preferences set retention_days=2`));
 await db.exec(`select set_config('test.uid','00000000-0000-0000-0000-000000000002',false)`);assert.equal((await db.query('select * from public.project_workplan_recovery')).rows.length,0);
 await db.exec(`reset role;update public.project_workplan_recovery set expires_at=now()-interval '1 second';set role authenticated;select set_config('test.uid','${staff}',false);`);assert.equal((await db.query('select * from public.project_workplan_recovery')).rows.length,0);
 }finally{await db.close();}
});
test('reload before debounce recovers the newer local edit and never publishes it',async()=>{
 const first=projectEditor({userId:'staff'});await first.flush();first.edit(body=>body.tasks[0].notes='Typed immediately before interruption');await first.flush();
 assert.equal(first.server.draft,null);const storage=first.storage;first.unmount();
 const next=projectEditor({userId:'staff',storage});await next.flush();
 assert.equal(next.current.body.tasks[0].notes,'');assert.equal(next.current.drafts.recoverable.body.tasks[0].notes,'Typed immediately before interruption');
 assert.equal(next.current.drafts.recoveryPrompt,true);next.current.drafts.restore();await next.flush();
 assert.equal(next.current.body.tasks[0].notes,'Typed immediately before interruption');assert.equal(next.server.posts,0);next.unmount();
});
test('intentional discard stays discarded on reload while its last checkpoint remains recoverable',async()=>{
 const first=projectEditor({userId:'staff'});await first.flush();first.edit(body=>body.tasks[0].title='Accidentally discarded');await first.flush();
 await first.current.discard();await first.flush();const storage=first.storage;first.unmount();
 const next=projectEditor({userId:'staff',storage});await next.flush();assert.equal(next.current.drafts.recoverable,null);
 assert.equal(next.current.drafts.recoveryCopy.body.tasks[0].title,'Accidentally discarded');next.current.drafts.reviewRecovery();await next.flush();assert.equal(next.current.drafts.recoveryPrompt,true);next.unmount();
});

test('new edits typed during a manual save retain their interruption checkpoint',async()=>{
 const first=projectEditor({userId:'staff'});await first.flush();first.edit(body=>body.tasks[0].title='Submitted title');await first.flush();
 first.controls.postGate=deferred();const saving=first.current.save();await first.flush();first.edit(body=>body.tasks[0].notes='Newer than submitted save');await first.flush();
 first.controls.postGate.resolve();await saving;await first.flush();assert.equal(first.server.body.tasks[0].notes,'');
 const storage=first.storage;first.unmount();const next=projectEditor({userId:'staff',storage,server:{body:first.server.body,revision:first.server.revision}});await next.flush();
 assert.equal(next.current.drafts.recoverable.body.tasks[0].notes,'Newer than submitted save');next.unmount();
});
