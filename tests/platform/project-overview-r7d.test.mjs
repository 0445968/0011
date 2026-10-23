import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {loadProjectTs} from './load-project-ts.mjs';
const require=createRequire(import.meta.url);
function serverModule(path) {
  const url=path instanceof URL?path:new URL(`../../${path}`,import.meta.url);
  const module={exports:{}};
  const js=ts.transpileModule(readFileSync(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  new Function('module','exports','require',js)(module,module.exports,name=>name==='server-only'?{}:name.startsWith('.')?serverModule(new URL(`${name}.ts`,url)):require(name));
  return module.exports;
}
const {milestoneContent,readOverviewRows}=loadProjectTs('lib/projects/overview-content.ts');
const {activePhaseMilestones}=loadProjectTs('lib/projects/overview-milestones.ts');
const {snapshots,domainActivity,getProjectActivity}=serverModule('lib/projects/activity-data.ts');
const good=rows=>({rows,error:null}),bad={rows:null,error:'Unavailable'};
const task=(id,milestoneId='m',status='todo')=>({id,title:id,milestoneId,status,dueOn:'2026-10-30',notes:'',owner:''});
const body={title:'Saved',owner:'',notes:'',milestones:[{id:'done',status:'done'},{id:'m',status:'planned'},{id:'history',status:'done'},{id:'unassigned',status:'planned'}],tasks:[task('a'),task('b'),task('c','other'),task('u',null)]};
const content=()=>({files:good([{id:'shared'},{id:'only-a'}]),links:good([{task_id:'a',file_id:'shared'},{task_id:'b',file_id:'shared'},{task_id:'a',file_id:'only-a'},{task_id:'a',file_id:'withdrawn-or-inaccessible'},{task_id:'c',file_id:'only-a'}]),notes:good([{id:'n1',task_id:'a'},{id:'n1',task_id:'a'},{id:'n2',task_id:'b'},{id:'other',task_id:'c'}]),comments:good([{id:'c1',task_id:'b'},{id:'project-comment',task_id:null}]),priorities:good([{task_id:'a',priority:'urgent',blocker_owner:null,depends_on:null},{task_id:'b',priority:null,blocker_owner:null,depends_on:null}]),schedule:good([{task_id:'a',start_on:'2026-10-10'}])});

test('R7D saved parallel phases select shared milestones once, stable completed last; historical/unassigned excluded',()=>{
  const links=[{milestoneId:'done',phase:'discovery'},{milestoneId:'m',phase:'discovery'},{milestoneId:'m',phase:'production'},{milestoneId:'history',phase:'handoff'}];
  const states=[{phase:'discovery',status:'active'},{phase:'production',status:'active'},{phase:'handoff',status:'completed',everActive:true}];
  assert.deepEqual(activePhaseMilestones(body,links,['handoff'],states).map(m=>m.id),['m','done']);
  assert.deepEqual(activePhaseMilestones(body,links,['handoff'],states.map(s=>({...s,status:'planning'}))),[]);
  assert.equal(body.milestones[0].id,'done');
});
test('R7D milestone counts deduplicate shared accessible IDs and exclude other scope/orphan/removed file IDs',()=>{
  const result=milestoneContent(body,'m',content(),'2026-10-22');
  assert.equal(result.files,2);assert.equal(result.notes,2);assert.equal(result.comments,1);
  assert.equal(result.tasks.find(t=>t.id==='a').files,2);
  assert.equal(result.tasks.find(t=>t.id==='b').files,1);
  assert.equal(result.suggestion,'medium');assert.equal(result.manual[0].manual,'urgent');
});
test('R7D unavailable differs from real zero, including manual priority and missing controls',()=>{
  const missing=content();missing.files=bad;missing.notes=bad;missing.priorities=bad;
  const result=milestoneContent(body,'m',missing,'2026-10-22');
  assert.equal(result.files,null);assert.equal(result.notes,null);assert.equal(result.suggestion,'Unavailable');assert.equal(result.priorityAvailable,false);
  const empty=milestoneContent(body,'unassigned',content(),'2026-10-22');assert.equal(empty.files,0);assert.equal(empty.notes,0);assert.equal(empty.comments,0);assert.equal(empty.suggestion,'Not calculated');
  const noControl=content();noControl.priorities=good([]);assert.equal(milestoneContent(body,'m',noControl,'2026-10-22').suggestion,'Unavailable');
});
test('R7D no fabricated suggestion for undated, completed, paused or dependency-waiting tasks',()=>{
  for(const mutation of ['done','blocked','missing-start','overdue','dependency']) {
    const source=structuredClone(body),data=content();
    if(mutation==='done'||mutation==='blocked')source.tasks[0].status=mutation;
    if(mutation==='missing-start')data.schedule=good([]);
    if(mutation==='overdue')source.tasks[0].dueOn='2026-10-01';
    if(mutation==='dependency')data.priorities.rows[0].depends_on='absent';
    assert.equal(milestoneContent(source,'m',data,'2026-10-22').suggestion,'Not calculated',mutation);
  }
});
test('R7D complete pagination handles a server page cap and rejects partial/failed/changing totals',async()=>{
  const rows=Array.from({length:1203},(_,id)=>({id})),calls=[];
  const result=await readOverviewRows(async(from,to)=>{calls.push([from,to]);return {data:rows.slice(from,Math.min(to+1,from+200)),count:rows.length,error:null};},'Notes');
  assert.equal(result.rows.length,1203);assert.equal(calls.length,7);assert.equal(calls[1][0],200);
  for(const read of [async()=>({data:[],count:2,error:null}),async()=>({data:null,count:null,error:'denied'}),async(from)=>({data:[{id:from}],count:from?3:2,error:null})]) {
    const failed=await readOverviewRows(read,'Notes');assert.equal(failed.rows,null);assert.match(failed.error,/unavailable/);
  }
  assert.deepEqual(await readOverviewRows(async()=>({data:[],count:0,error:null}),'Notes'),good([]));
});
test('R7D shared domain feed preserves meaningful snapshot diffs and notes, excludes technical revisions, deduplicates identities',()=>{
  const baseline={id:1,action:'save',snapshot:{body},actor:'actor',created_at:'2026-10-20T00:00:00Z'};
  const changed=structuredClone(body);changed.tasks[0].status='done';changed.tasks[0].notes='private note text';
  const update={...baseline,id:2,snapshot:{body:changed},created_at:'2026-10-21T00:00:00Z'};
  const noop={...update,id:3,created_at:'2026-10-22T00:00:00Z'};
  const events=snapshots([noop,update,baseline],'/projects/p');
  assert.equal(events.filter(e=>e.technical).length,2);
  const feed=domainActivity([...events,...events]);assert.equal(feed.length,2);
  assert.ok(feed.some(e=>e.title==='Task status changed'));assert.ok(feed.some(e=>e.title==='Task work-plan notes updated'));
  assert.ok(feed.every(e=>e.actorId==='actor'&&e.href==='/projects/p?tab=plan&task=a'));
  assert.ok(!JSON.stringify(feed).includes('private note text'));
});

// Authenticated Supabase query double: applies every request/visibility filter,
// exercises real server readers (not only source-string assertions).
function clientFor(tables,rpc=async()=>({data:[],error:null})) {
  const calls=[];
  return {calls,rpc,from(table){
    const filters=[];let count=false,sort=[];
    const run=(from=0,to=999999)=>{
      calls.push({table,filters:[...filters]});
      const rows=(tables[table]??[]).filter(row=>filters.every(([key,value,not])=>not?row[key]!==value:row[key]===value));
      rows.sort((a,b)=>{for(const key of sort){const order=String(a[key]).localeCompare(String(b[key]));if(order)return order;}return 0;});
      return Promise.resolve({data:rows.slice(from,to+1),error:null,count:count?rows.length:null});
    };
    const q={select(_fields,options){count=!!options?.count;return q;},eq(k,v){filters.push([k,v,false]);return q;},not(k,_op,v){filters.push([k,v,true]);return q;},order(k){sort.push(k);return q;},limit(n){return run(0,n-1);},range:run,then(resolve,reject){return run().then(resolve,reject);}};
    return q;
  }};
}
test('R7D real content reader keeps project/removed/state boundaries on all six sources',async()=>{
  const {getProjectOverviewContent}=serverModule('lib/projects/overview-content-data.ts');
  const client=clientFor({project_files:[{id:'ready',request_id:'p',state:'ready'},{id:'other',request_id:'other',state:'ready'},{id:'gone',request_id:'p',state:'withdrawn'}],project_task_notes:[{id:'live',task_id:'a',request_id:'p',removed:false},{id:'removed',task_id:'a',request_id:'p',removed:true}],project_comments:[{id:'thread',task_id:null,request_id:'p',removed:false}]});
  const result=await getProjectOverviewContent(client,'p');
  assert.deepEqual(result.files.rows.map(f=>f.id),['ready']);assert.deepEqual(result.notes.rows.map(n=>n.id),['live']);assert.equal(result.comments.rows.length,0);
  assert.equal(client.calls.length,6);assert.ok(client.calls.every(c=>c.filters.some(([k,v])=>k==='request_id'&&v==='p')));
});
test('R7D verified staff/client assignments use same assignment model and no free-text owner inference',async()=>{
  const {getProjectOverviewExtras}=serverModule('lib/projects/overview-data.ts');
  const staff='11111111-1111-4111-8111-111111111111',clientId='22222222-2222-4222-8222-222222222222';
  const person=id=>({id,label:id,avatar_path:null,task_ids:['obsolete']});
  const assignment={staff:[person(staff)],clients:[person(clientId)],tasks:[{task_id:'a',side:'bivi',revision:1,assignees:[staff]},{task_id:'b',side:'client',revision:1,assignees:[clientId]}],managers:[],assignmentRevision:1,currentStaffId:staff,clientCompany:null};
  const client=clientFor({},async(name,args)=>{assert.equal(Object.values(args)[0],'p');return {error:null,data:name==='staff_project_roster'?{staff:[person(staff)],clients:[person(clientId)]}:assignment};});
  const result=await getProjectOverviewExtras(client,'p');
  assert.deepEqual(result.members.map(m=>[m.kind,m.assignedTaskIds]),[['staff',['a']],['client',['b']]]);
  client.rpc=async()=>({error:'denied',data:null});await assert.rejects(()=>getProjectOverviewExtras(client,'p'),/could not load/);
});
test('R7D Activity reader uses scoped audits and actor identities, and fails honestly when source unavailable',async()=>{
  const calls=[];
  const client={rpc:async(name,args)=>{calls.push({name,args});return {data:{rows:[{source:'phases',key:'phase:1',payload:{id:1,phase:'discovery',previous_status:'planning',next_status:'active',actor:'staff',created_at:'2026-10-22T00:00:00Z'}}],actors:[{id:'staff',label:'Verified staff',kind:'staff',avatarPath:null}],next:null},error:null};}};
  const result=await getProjectActivity(client,'p',body);assert.equal(result.events.length,1);assert.equal(result.actors.staff.label,'Verified staff');assert.equal(calls[0].args.p_request,'p');assert.equal(calls[0].name,'staff_project_activity_page');
  client.rpc=async()=>({error:'permission denied'});await assert.rejects(()=>getProjectActivity(client,'p',body),/audited page/);
});
test('R7D Overview and Activity use shared rendering, saved metrics, existing editor and recoverable missing-item context',()=>{
  const overview=readFileSync('components/admin/projects/ProjectOverview.tsx','utf8'),activity=readFileSync('app/admin/(workspace)/projects/[id]/activity/page.tsx','utf8'),workspace=readFileSync('components/admin/ProjectWorkspace.tsx','utf8');
  assert.match(overview,/projectOverviewSummary\(record.body, today\)/);assert.match(overview,/ProjectActivityList/);assert.match(activity,/ProjectActivityList/);assert.doesNotMatch(overview,/editing\.editTask/);assert.match(overview,/taskHref\(record.request_id,task.id\)/);
  assert.match(workspace,/focusTaskId=\{overviewTaskId\}/);assert.match(workspace,/linked item is no longer/);assert.match(workspace,/useProjectEditingController/);
  assert.match(workspace,/setTaskFocusRequest\(value=>value\+1\)/);
  assert.match(readFileSync('components/admin/projects/ProjectMilestoneBoardV2.tsx','utf8'),/\[focusTaskId,focusTaskRequest\]/);
});
