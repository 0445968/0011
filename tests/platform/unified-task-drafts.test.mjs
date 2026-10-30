import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const migrations=new URL('../../supabase/migrations/',import.meta.url);
test('unified task drafts autosave privately, commit atomically and verify retries',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to authenticated;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id bigint generated always as identity,bucket_id text,name text,metadata jsonb,unique(bucket_id,name));alter table storage.objects enable row level security;grant usage on schema storage to authenticated,anon;grant select,insert,update,delete on storage.objects to authenticated,anon;grant usage on sequence storage.objects_id_seq to authenticated,anon;`);
  for(const file of fs.readdirSync(migrations).filter(name=>name.endsWith('.sql')).sort())await db.exec(fs.readFileSync(new URL(file,migrations),'utf8'));
  const staff=randomUUID(),other=randomUUID(),request=randomUUID(),file=randomUUID(),comment=randomUUID(),note=randomUUID();
  await db.query('insert into auth.users(id,email) values($1,$2),($3,$4)',[staff,'staff@example.com',other,'other@example.com']);
  await db.query('insert into inquiry_staff(user_id,active) values($1,true),($2,true)',[staff,other]);
  await db.query('insert into project_inquiries(request_id,payload,payload_hash) values($1,$2,$3)',[request,{name:'Task test',email:'staff@example.com'},'b'.repeat(64)]);
  await db.query("insert into inquiry_proposals(request_id,version,status,body) values($1,1,'accepted','{}')",[request]);
  const tasks=[{id:'first',title:'First',owner:'',dueOn:null,status:'todo',milestoneId:'mile',notes:''},{id:'second',title:'Second',owner:'',dueOn:null,status:'todo',milestoneId:'mile',notes:''},{id:'outside',title:'Outside',owner:'',dueOn:null,status:'todo',milestoneId:null,notes:''}];
  const body={title:'Task productivity test',owner:'',notes:'',milestones:[{id:'mile',title:'Milestone',dueOn:null,status:'planned',}],tasks};
  await db.query("insert into inquiry_projects(request_id,proposal_version,revision,state,body,scope_snapshot,onboarding_snapshot,readiness_snapshot,activated_readiness_revision,activated_onboarding_revision) values($1,1,1,'active',$2,'{}','{}','{}',1,1)",[request,body]);
  for(const task of tasks)await db.query('insert into project_task_controls(request_id,task_id,owner_type,phase,depends_on) values($1,$2,\'bivi\',\'discovery\',$3)',[request,task.id,task.id==='second'?'first':null]);
  await db.query('insert into project_files(id,request_id,object_path,filename,size_bytes,mime_type,uploader_id,state) values($1,$2,$3,$4,10,$5,$6,\'ready\')',[file,request,`${request}/${file}`,'brief.pdf','application/pdf',staff]);
  await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[staff]);

  await db.exec('reset role');
  await db.query('insert into project_workflow_override_admins(user_id) values($1)',[staff]);
  await db.exec('set role authenticated');
  const get=async()=> (await db.query('select body,revision from inquiry_projects where request_id=$1',[request])).rows[0];
  const controls=async()=> (await db.query("select revision,priority,requires_staff_review,requires_client_review from project_task_controls where request_id=$1 and task_id='first'",[request])).rows[0];
  const tagRevision=(await db.query("select revision from project_task_presentation where request_id=$1 and task_id='first'",[request])).rows[0].revision;
  const draft=structuredClone(body);
  draft.tasks[0].title='Draft rename';
  draft.tasks[0].edits={controlRevision:1,control:{ownerType:'bivi',phase:'discovery',serviceId:'design',dependsOn:null,blockerOwner:'external'},priority:'high',assignment:{side:'bivi',userIds:[other]},review:{requiresStaffReview:true,requiresClientReview:false},tags:{revision:tagRevision,tags:['design'],newTags:[{label:'Design',color:'blue'}]}};
  // Autosave must accept the whole private draft without changing any live field.
  const draftSaved=(await db.query('select save_project_workplan_draft($1,1,$2,$3,0) r',[request,draft,body])).rows[0].r;
  assert.equal(draftSaved.result,'saved');assert.equal((await controls()).priority,null);
  assert.equal((await get()).body.tasks[0].title,'First');
  const saveId=randomUUID();
  const saved=(await db.query('select save_project_workplan_bundle($1,$2,1,$3) r',[request,draft,saveId])).rows[0].r;
  assert.equal(saved.result,'saved');assert.equal(saved.revision,2);
  assert.equal((await controls()).priority,'high');assert.equal((await db.query("select service_id from project_task_controls where request_id=$1 and task_id='first'",[request])).rows[0].service_id,'design');assert.equal((await controls()).requires_staff_review,true);assert.equal((await controls()).requires_client_review,false);
  assert.equal((await get()).body.tasks[0].title,'Draft rename');assert.equal('edits' in (await get()).body.tasks[0],false);
  assert.equal((await db.query("select user_id from project_task_members where request_id=$1 and task_id='first'",[request])).rows[0].user_id,other);
  assert.equal((await db.query("select color from project_task_tag_catalog where request_id=$1 and tag_key='design'",[request])).rows[0].color,'blue');
  assert.equal((await db.query('select save_project_workplan_bundle($1,$2,1,$3) r',[request,draft,saveId])).rows[0].r.revision,2,'same save is idempotent');
  assert.equal((await db.query('select count(*)::int n from project_workplan_save_receipts where request_id=$1',[request])).rows[0].n,1);
  // Nonadmin policy edits roll back the earlier assignment mutation as well.
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[other]);
  const forbidden=structuredClone((await get()).body);forbidden.tasks[0].edits={controlRevision:(await controls()).revision,assignment:{side:'bivi',userIds:[staff]},review:{requiresStaffReview:false,requiresClientReview:false}};
  await assert.rejects(db.query('select save_project_workplan_bundle($1,$2,2,$3)',[request,forbidden,randomUUID()]),/administrator required/);
  assert.equal((await get()).revision,2);assert.equal((await db.query("select user_id from project_task_members where request_id=$1 and task_id='first'",[request])).rows[0].user_id,other);
  // A later completion gate failure also rolls back all metadata changes.
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[staff]);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[other]);
  const invalid=structuredClone((await get()).body);invalid.tasks[0].status='done';invalid.tasks[0].edits={controlRevision:(await controls()).revision,priority:'urgent'};
  await assert.rejects(db.query('select save_project_workplan_bundle($1,$2,2,$3)',[request,invalid,randomUUID()]),/staff_task_review_required/);
  assert.equal((await controls()).priority,'high');assert.equal((await get()).revision,2);
  // Stale sidecar revisions cannot overwrite newer settings.
  const stale=structuredClone((await get()).body);stale.tasks[0].edits={controlRevision:1,priority:'low'};
  await assert.rejects(db.query('select save_project_workplan_bundle($1,$2,2,$3)',[request,stale,randomUUID()]),/settings changed/);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[staff]);
  // New tasks can carry assignees, review flags, tags and priority on their first save.
  const fresh=structuredClone((await get()).body);fresh.tasks.push({id:'new-task',title:'New task',owner:'',notes:'',dueOn:null,status:'todo',milestoneId:null,edits:{controlRevision:0,assignment:{side:'bivi',userIds:[staff]},priority:'medium',review:{requiresStaffReview:false,requiresClientReview:false},tags:{revision:0,tags:['new'],newTags:[{label:'New',color:'green'}]}}});
  const newSaved=(await db.query('select save_project_workplan_bundle($1,$2,2,$3) r',[request,fresh,randomUUID()])).rows[0].r;
  assert.equal(newSaved.result,'saved');assert.ok(newSaved.revision>2);
  assert.equal((await db.query("select priority from project_task_controls where request_id=$1 and task_id='new-task'",[request])).rows[0].priority,'medium');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[other]);
  assert.equal((await db.query('select count(*)::int n from project_workplan_save_receipts where request_id=$1',[request])).rows[0].n,0,'receipts are private to the saving staff member');
 }finally{await db.close();}
});
