import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {loadProjectTs} from './load-project-ts.mjs';
const {taskMetrics}=loadProjectTs('lib/projects/metrics.ts');
const {meetingTimeChoices,meetingState,meetingWallTime}=loadProjectTs('lib/projects/meeting-time.ts');
const {activityCursor,encodeActivityCursor}=loadProjectTs('lib/projects/activity-pagination.ts');
const {processCommunicationAttempt}=loadProjectTs('lib/communications/transport.ts');
const {calendarHref}=loadProjectTs('lib/calendar/links.ts');
const {notificationHref}=loadProjectTs('lib/notifications/types.ts');
test('R7E meeting input rejects DST gaps and invalid dates, disambiguates folds and preserves named-zone wall times',()=>{
  assert.deepEqual(meetingTimeChoices('2026-03-08T02:30','America/Chicago'),[]);
  const fold=meetingTimeChoices('2026-11-01T01:30','America/Chicago');assert.equal(fold.length,2);assert.deepEqual(fold.map(c=>c.offset).sort(),['-05:00','-06:00']);
  for(const choice of fold)assert.equal(meetingWallTime(choice.value,'America/Chicago'),'2026-11-01T01:30');
  assert.equal(meetingTimeChoices('2026-10-22T12:00','Asia/Kathmandu')[0].offset,'+05:45');
  assert.equal(meetingTimeChoices('2026-02-30T10:00','UTC').length,0);assert.equal(meetingTimeChoices('2026-10-22T10:00','Invalid/Zone').length,0);
  const m={starts_at:'2026-10-22T10:00:00Z',ends_at:'2026-10-22T11:00:00Z',status:'scheduled'};
  assert.equal(meetingState(m,new Date('2026-10-22T10:00:00Z')),'ongoing');assert.equal(meetingState(m,new Date(m.ends_at)),'past');assert.equal(meetingState({...m,status:'cancelled'}),'cancelled');
});
test('R7E cursors and notification/calendar deep links preserve exact request/meeting identity',()=>{
  const cursor={at:'2026-10-22T12:00:00+00:00',key:'project:12'};assert.deepEqual(activityCursor(encodeActivityCursor(cursor)),cursor);assert.throws(()=>activityCursor('invalid'),/Invalid/);
  assert.equal(notificationHref({event_key:'signal:id',request_id:'p',kind:null,source_id:'/projects/p?tab=requests&request=r'}),'/projects/p?tab=requests&request=r');
  assert.equal(notificationHref({event_key:'signal:id',request_id:'p',kind:null,source_id:'https://evil.invalid'}),'/projects/p');
  assert.equal(calendarHref({event_type:'meeting',request_id:'p',source_id:'m'}),'/projects/p?tab=calendar&meeting=m#meeting-m');
});
test('R7E test transport handles idempotent retry, revocation, provider acceptance followed by finish failure, and stale finish',async()=>{
  const provider=new Map(),calls=[];let fail=true;
  const transport={authorize:async()=>true,deliver:async key=>{calls.push(key);if(fail)throw new Error('test transport unavailable');if(!provider.has(key))provider.set(key,'test-provider-id');return provider.get(key);},finish:async(_id,error)=>error?'queued':'sent'};
  assert.equal(await processCommunicationAttempt({id:'stable',attempts:1},transport),'retry');fail=false;
  assert.equal(await processCommunicationAttempt({id:'stable',attempts:2},transport),'sent');assert.equal(await processCommunicationAttempt({id:'stable',attempts:3},transport),'sent');assert.equal(provider.size,1);assert.ok(calls.every(key=>key==='stable'));
  let delivered=false;
  assert.equal(await processCommunicationAttempt({id:'revoked',attempts:1},{...transport,authorize:async()=>false,deliver:async()=>{delivered=true;return 'bad';}}),'skipped');assert.equal(delivered,false);
  const errors=[];assert.equal(await processCommunicationAttempt({id:'accepted',attempts:1},{...transport,finish:async(_id,error)=>{errors.push(error);throw new Error('recording unavailable');}}),'unknown');assert.deepEqual(errors,[null]);
  assert.equal(await processCommunicationAttempt({id:'stale',attempts:1},{...transport,finish:async()=> 'not_claimed'}),'unknown');
});

test('R7E full database: meetings, audit pages, request decisions and reliable notification intents',async t=>{
  const db=new PGlite();
  const staff=randomUUID(),second=randomUUID(),client=randomUUID(),outsider=randomUUID(),project=randomUUID(),otherProject=randomUUID(),org=randomUUID(),foreignOrg=randomUUID();
  const actor=async uid=>{await db.exec('reset role;set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);};
  const owner=async()=>db.exec('reset role');
  const call=async(name,args)=> (await db.query(`select ${name}(${args.map((_,i)=>`$${i+1}`).join(',')}) result`,args)).rows[0].result;
  const task=(id,side='client')=>({id,title:id,owner:side,notes:'',status:'todo',milestoneId:null,dueOn:null});
  const body={title:'R7E test',owner:'',notes:'',milestones:[],tasks:[task('client-task'),task('staff-task','bivi')]};
  try{
    await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to authenticated;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id bigint generated always as identity,bucket_id text,name text,metadata jsonb,unique(bucket_id,name));alter table storage.objects enable row level security;grant usage on schema storage to authenticated,anon;grant select,insert,update,delete on storage.objects to authenticated,anon;grant usage on sequence storage.objects_id_seq to authenticated,anon;`);
    const root=new URL('../../supabase/migrations/',import.meta.url);
    for(const name of fs.readdirSync(root).filter(name=>name.endsWith('.sql')).sort())await db.exec(fs.readFileSync(new URL(name,root),'utf8'));
    for(const [uid,email] of [[staff,'staff@example.test'],[second,'second@example.test'],[client,'client@example.test'],[outsider,'outsider@example.test']])await db.query('insert into auth.users(id,email) values($1,$2)',[uid,email]);
    await db.query('insert into inquiry_staff(user_id) values($1),($2)',[staff,second]);
    await db.query("insert into client_organizations(id,name) values($1,'Project company'),($2,'Other company')",[org,foreignOrg]);
    await db.query('insert into client_organization_members(organization_id,user_id) values($1,$2),($3,$4)',[org,client,foreignOrg,outsider]);
    for(const id of [project,otherProject]){
      await db.query("insert into project_inquiries(request_id,payload,payload_hash) values($1,'{}',repeat('a',64))",[id]);
      await db.query("insert into inquiry_proposals(request_id,version,status,body) values($1,1,'accepted','{}')",[id]);
      await db.query("insert into inquiry_projects(request_id,proposal_version,revision,state,body,scope_snapshot,onboarding_snapshot,readiness_snapshot,activated_readiness_revision,activated_onboarding_revision,company_id) values($1,1,1,'active',$2,'{}','{}','{}',1,1,$3)",[id,body,id===project?org:foreignOrg]);
      await db.query("insert into project_task_controls(request_id,task_id,owner_type,phase) values($1,'client-task','client','discovery'),($1,'staff-task','bivi','discovery')",[id]);
      await db.query("insert into project_phase_states(request_id,phase,status) values($1,'discovery','active')",[id]);
    }
    await db.query('insert into project_clients(request_id,user_id,active,can_review) values($1,$2,true,true),($1,$3,true,true)',[project,client,outsider]);
    await db.query('insert into project_task_members(request_id,task_id,user_id,side) values($1,\'client-task\',$2,\'client\')',[project,client]);

    assert.equal(decodeURIComponent(await call('project_signal_url_component',['a&雪'])), 'a&雪');
    const mid=randomUUID();const meeting={action:'save',id:mid,expectedRevision:0,title:'Verified meeting',startsAt:'2026-11-01T01:30:00-05:00',endsAt:'2026-11-01T01:30:00-06:00',timezone:'America/Chicago',organizer:staff,attendees:[client,second],location:'Studio',meetingUrl:''};
    await t.test('meeting create/edit/cancel, revisions, DST, time ranges and membership boundaries',async()=>{
      await actor(client);await assert.rejects(call('manage_project_meeting',[project,meeting]),/Staff authorization/);
      await actor(staff);assert.equal((await call('manage_project_meeting',[project,meeting])).result,'saved');
      assert.equal((await call('manage_project_meeting',[project,meeting])).result,'conflict');
      assert.equal((await call('manage_project_meeting',[otherProject,{...meeting,expectedRevision:1}])).result,'not_found');
      await assert.rejects(call('manage_project_meeting',[project,{...meeting,id:randomUUID(),attendees:[outsider]}]),/eligible/);
      await assert.rejects(call('manage_project_meeting',[project,{...meeting,id:randomUUID(),endsAt:meeting.startsAt}]),/check constraint/);
      await assert.rejects(call('manage_project_meeting',[project,{...meeting,id:randomUUID(),startsAt:'2026-03-08T02:30:00-06:00'}]),/offset does not match/);
      assert.equal((await call('manage_project_meeting',[project,{...meeting,expectedRevision:1,title:'Updated meeting'}])).revision,2);
      const event=(await db.query("select * from staff_calendar_in_timezone('Asia/Tokyo','2026-11-01','2026-11-30') where event_type='meeting'")).rows[0];assert.equal(event.source_id,mid);assert.ok(event.assignee_ids.includes(second));assert.equal(event.assignee_ids.filter(uid=>uid===second).length,1);
      assert.equal((await call('manage_project_meeting',[project,{action:'cancel',id:mid,expectedRevision:2}])).revision,3);
      assert.equal((await db.query("select count(*)::int n from project_meetings where status='scheduled' and ends_at>now() and id=$1",[mid])).rows[0].n,0);
      await actor(client);assert.equal((await db.query('select * from project_meetings')).rows.length,0);assert.equal((await db.query('select * from project_event_history')).rows.length,0);
    });
    await t.test('request completion is explicit, atomic, review-gated and stale/duplicate-safe',async()=>{
      await actor(outsider);await assert.rejects(call('submit_project_client_task_response',[project,'client-task','completion','Ready for Bivi review',1]),/not permitted/);
      await actor(client);const submitted=await call('submit_project_client_task_response',[project,'client-task','completion','Ready for Bivi review',1]);assert.equal(submitted.result,'saved');
      const responseId=submitted.id;assert.equal((await call('submit_project_client_task_response',[project,'client-task','completion','Retry request',1])).result,'pending');
      await actor(staff);assert.equal((await call('staff_review_client_task_response',[responseId,'accept','Reviewed',999])).result,'conflict');
      await owner();const child=randomUUID();await db.query("insert into project_subtasks(request_id,id,task_id,title,position,status) values($1,$2,'client-task','Required child',0,'todo')",[project,child]);
      await actor(staff);await assert.rejects(call('staff_review_client_task_response',[responseId,'accept','Must reject atomically',1]),/unfinished subtasks/);
      await owner();assert.equal((await db.query('select status from project_client_task_responses where id=$1',[responseId])).rows[0].status,'pending');assert.equal((await db.query('select revision from inquiry_projects where request_id=$1',[project])).rows[0].revision,1);assert.equal((await db.query("select count(*)::int n from project_communication_outbox where kind='task_decision' and metadata->>'responseId'=$1",[responseId])).rows[0].n,0);
      await db.query("update project_subtasks set status='done' where id=$1",[child]);await actor(staff);
      assert.equal((await call('staff_review_client_task_response',[responseId,'accept','Reviewed',1])).result,'saved');
      assert.equal((await call('staff_review_client_task_response',[responseId,'accept','Duplicate',2])).result,'already_reviewed');
      await owner();const saved=(await db.query('select body,revision from inquiry_projects where request_id=$1',[project])).rows[0];assert.equal(saved.body.tasks[0].status,'done');assert.equal(saved.revision,2);assert.equal(taskMetrics(saved.body.tasks).done,1);assert.equal(taskMetrics(saved.body.tasks).open,1);
      const signals=(await db.query("select kind,dedupe_key from project_communication_outbox where request_id=$1 and kind in ('task_request','task_decision')",[project])).rows;assert.equal(signals.filter(row=>row.kind==='task_decision').length,1);assert.equal(signals.filter(row=>row.kind==='task_request').length,2);assert.equal(new Set(signals.map(row=>row.dedupe_key)).size,3);
      // Reopen explicitly, then a non-completion review must not mutate work.
      const next=structuredClone(saved.body);next.tasks[0].status='todo';await db.query('update inquiry_projects set body=$2,revision=revision+1 where request_id=$1',[project,next]);
      await actor(client);const request=await call('submit_project_client_task_response',[project,'client-task','postponement','Please consider a later deadline',3]);assert.equal(request.result,'saved');
      await actor(staff);assert.equal((await call('staff_review_client_task_response',[request.id,'accept','Decision only',3])).result,'saved');
      await owner();assert.deepEqual((await db.query('select body from inquiry_projects where request_id=$1',[project])).rows[0].body,next);
      await actor(client);const stale=await call('submit_project_client_task_response',[project,'client-task','clarification','Please clarify this task',3]);
      await owner();next.tasks[0].title='Changed after submission';await db.query('update inquiry_projects set body=$2,revision=revision+1 where request_id=$1',[project,next]);
      await actor(staff);assert.equal((await call('staff_review_client_task_response',[stale.id,'accept','Stale',4])).result,'stale');assert.equal((await call('staff_review_client_task_response',[stale.id,'reject','Please resubmit',4])).result,'saved');
    });
    await t.test('approval intents deduplicate existing queue messages and respect verified reviewers',async()=>{
      await owner();
      await db.query("insert into project_brief_versions(request_id,version,body,status,published_by) values($1,1,'{}','pending',$2)",[project,staff]);
      const queued=(await db.query("select recipient_user_id,dedupe_key from project_communication_outbox where request_id=$1 and kind='brief_review'",[project])).rows;
      assert.equal(queued.filter(row=>row.recipient_user_id===client).length,1);
      // Old best-effort trigger can have queued an ineligible organization member;
      // authorization MUST exclude it before delivery even if the old row exists.
      const forged=queued.find(row=>row.recipient_user_id===outsider);
      if(forged){const row=(await db.query('select id from project_communication_outbox where dedupe_key=$1',[forged.dedupe_key])).rows[0];await db.exec('set role service_role');assert.equal(await call('project_communication_allowed',[row.id]),false);await owner();}
      await db.query("update project_brief_versions set status='approved',decided_at=now(),decided_by=$2 where request_id=$1 and version=1",[project,client]);
      assert.equal((await db.query("select count(*)::int n from project_communication_outbox where request_id=$1 and kind='approval_decision'",[project])).rows[0].n,2);
    });
    await t.test('future file shares preserve verified recipients; private/legacy recipient NULL remains unknown',async()=>{
      await owner();const file=randomUUID();await db.query("insert into project_files(id,request_id,object_path,filename,size_bytes,mime_type,uploader_id,state) values($1,$2,$3,'Evidence.pdf',10,'application/pdf',$4,'ready')",[file,project,`${project}/${file}`,staff]);
      await db.query("insert into project_file_history(file_id,request_id,action,revision,actor_id) values($1,$2,'private',1,$3),($1,$2,'share',2,$3)",[file,project,staff]);
      const records=(await db.query('select action,recipient_ids from project_file_history where file_id=$1 order by revision',[file])).rows;assert.equal(records[0].recipient_ids,null);assert.deepEqual(records[1].recipient_ids,[client]);
    });
    await t.test('notification retries, preferences, revoked access, blue-dot feed state and atomic intent',async()=>{
      await owner();await db.query("insert into project_task_members(request_id,task_id,user_id,side) values($1,'staff-task',$2,'bivi')",[project,second]);
      await actor(second);const feed=await call('staff_notifications_feed',[1,false,'all',25]);assert.ok(feed.rows.some(row=>row.category==='tasks'));const before=feed.unread;await call('set_staff_notification_read',[null,true]);assert.equal((await call('staff_notifications_feed',[1,false,'all',25])).unread,0);assert.ok(before>0);
      await owner();await db.query('update project_clients set active=false where request_id=$1 and user_id=$2',[project,client]);await db.exec('set role service_role');
      const claimed=(await db.query('select id,attempts,recipient_user_id from claim_project_communications(50,$1)',[project])).rows;assert.ok(!claimed.some(row=>row.recipient_user_id===client));
      const queued=claimed.find(row=>row.recipient_user_id===second);assert.ok(queued);assert.equal(await call('authorize_project_communication_attempt',[queued.id,queued.attempts]),true);
      assert.equal(await call('finish_project_communication_attempt',[queued.id,queued.attempts,null,'test failure']),'queued');
      assert.equal(await call('finish_project_communication_attempt',[queued.id,queued.attempts,'stale',null]),'not_claimed');
      await owner();await db.query('update project_communication_outbox set next_attempt_at=now() where id=$1',[queued.id]);await db.exec('set role service_role');
      const retry=(await db.query('select * from claim_project_communications(50,$1)',[project])).rows.find(row=>row.id===queued.id);assert.equal(retry.attempts,queued.attempts+1);
      assert.equal(await call('finish_project_communication_attempt',[retry.id,retry.attempts,'test-provider-id',null]),'sent');
      await owner();await db.query('update inquiry_staff set active=false where user_id=$1',[second]);await db.exec('set role service_role');assert.equal(await call('project_communication_allowed',[queued.id]),false);
      await owner();const n=(await db.query("select count(*)::int n from project_event_history where source='communications' and action='retry_queued'")).rows[0].n;assert.ok(n>=1);
      // Failed transaction rolls back action AND intent, never just one of them.
      const total=(await db.query('select count(*)::int n from project_communication_outbox')).rows[0].n;
      await db.exec('begin');await db.query("insert into project_client_task_responses(request_id,task_id,kind,note,submitted_by) values($1,'client-task','clarification','Transaction test',$2)",[project,client]);await db.exec('rollback');
      assert.equal((await db.query('select count(*)::int n from project_communication_outbox')).rows[0].n,total);
    });
    await t.test('cross-organization, revoked client and legacy-baseline reads/reviews fail closed',async()=>{
      await owner();const historical=randomUUID();await db.query("insert into project_client_task_responses(id,request_id,task_id,kind,note,submitted_by) values($1,$2,'staff-task','clarification','Legacy own request',$3)",[historical,project,outsider]);await db.query('delete from project_request_baselines where response_id=$1',[historical]);
      await actor(outsider);assert.equal((await db.query('select * from project_request_baselines')).rows.length,0);assert.equal((await db.query('select * from project_client_task_responses where id=$1',[historical])).rows.length,0);await assert.rejects(call('project_task_response_workspace',[project]),/Project access/);await assert.rejects(call('client_project_request_receipt',[project,historical]),/Project access/);
      await actor(client);await assert.rejects(call('client_project_request_receipt',[project,historical]),/Project access/);
      await actor(staff);assert.equal((await call('staff_review_client_task_response',[historical,'accept','Legacy acceptance',4])).result,'baseline_missing');
      assert.equal((await call('staff_review_client_task_response',[historical,'reject','Please resubmit',4])).result,'saved');
      // Staff can reject stale/removed work without mutating the current task.
    });
    await t.test('stable Activity pages cross snapshot boundaries without false task creation, preserve actors and reject client access',async()=>{
      await owner();const clean=structuredClone(body);
      for(let i=0;i<60;i++){clean.tasks[1].title=`Version ${i}`;await db.query("insert into inquiry_project_history(request_id,action,snapshot,actor,created_at) values($1,'save',$2,$3,$4)",[project,{body:clean,revision:i+1},staff,new Date(Date.UTC(2025,0,1,0,i)).toISOString()]);}
      await actor(staff);let cursor=null,pages=0,keys=new Set(),foundPredecessor=false,previous=null;
      do{const page=await call('staff_project_activity_page',[project,cursor?.at??null,cursor?.key??null,7]);assert.ok(Array.isArray(page.rows));for(const row of page.rows){if(previous){assert.ok(Date.parse(previous.at)>=Date.parse(row.at));if(previous.at===row.at)assert.ok(previous.key>row.key);}previous=row;assert.ok(!keys.has(row.key),`duplicate ${row.key}`);keys.add(row.key);if(row.source==='project'&&row.payload.previous_snapshot)foundPredecessor=true;}if(page.rows.some(row=>row.payload.actor===staff))assert.ok(page.actors.some(person=>person.id===staff));cursor=page.next;pages++;}while(cursor&&pages<100);
      assert.ok(pages>8);assert.ok(keys.size>=60);assert.equal(foundPredecessor,true);assert.equal(cursor,null);
      const other=await call('staff_project_activity_page',[otherProject,null,null,50]);assert.ok(other.rows.every(row=>row.payload.request_id===otherProject));
      await actor(client);await assert.rejects(call('staff_project_activity_page',[project,null,null,25]),/Staff authorization/);await assert.rejects(call('staff_calendar_in_timezone',['UTC',null,null]),/Staff authorization/);
    });
  }finally{await db.close();}
});
