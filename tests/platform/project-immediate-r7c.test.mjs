import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProjectTs} from './load-project-ts.mjs';
import {deferred,plan,copy} from './project-editor-harness.mjs';

test('immediate transport prevents duplicate commands, distinguishes rejection/conflict and requires read reconciliation after unknown outcomes',async()=>{
 const {postProjectCommand,confirmProjectCommandRead}=loadProjectTs('lib/projects/immediate-command.ts');
 const original=globalThis.fetch,gate=deferred();let calls=0,status=200,payload={saved:true,revision:2};
 globalThis.fetch=async()=>{calls++;await gate.promise;return {ok:status<400,status,json:async()=>payload};};
 try{
  const first=postProjectCommand('/schedule',{expectedProjectRevision:1});
  await assert.rejects(postProjectCommand('/schedule',{}),error=>error.kind==='busy');gate.resolve();assert.equal((await first).saved,true);assert.equal(calls,1);
  status=422;payload={error:'Completion gate',code:'validation_rejected'};await assert.rejects(postProjectCommand('/schedule',{}),error=>error.kind==='validation');
  status=409;payload={error:'Changed',code:'revision_conflict'};await assert.rejects(postProjectCommand('/schedule',{}),error=>error.kind==='conflict');
  payload={error:'Project locked',code:'project_locked'};await assert.rejects(postProjectCommand('/schedule',{}),error=>error.kind==='rejected');
  status=503;payload={error:'Response lost'};await assert.rejects(postProjectCommand('/schedule',{}),error=>error.kind==='unknown');const count=calls;
  await assert.rejects(postProjectCommand('/schedule',{}),error=>error.kind==='unknown');assert.equal(calls,count);
  confirmProjectCommandRead('/schedule?task=t');status=200;payload={saved:true,revision:3};await postProjectCommand('/schedule',{});assert.equal(calls,count+1);
  payload={};await assert.rejects(postProjectCommand('/schedule',{}),error=>error.kind==='unknown');
  const {interpretProjectSaveOutcome}=loadProjectTs('lib/projects/workplan-save-outcome.ts');
  assert.equal(interpretProjectSaveOutcome(200,{}).kind,'unknown');
 }finally{globalThis.fetch=original;}
});

test('uncertain hierarchy verification requires a newer revision and exact stable IDs/fields',()=>{
 const {hierarchyCommandSaved}=loadProjectTs('lib/projects/immediate-results.ts');
 const command={action:'add_subtask',taskId:'t',subtaskId:'s',title:'Child',status:'todo',dueOn:null};
 const data={projectRevision:2,hierarchyRevision:3,milestonePhases:[{milestoneId:'m',phase:'discovery'},{milestoneId:'m',phase:'production'}],subtasks:[{id:'s',taskId:'t',title:'Child',status:'todo',dueOn:null}]};
 assert.equal(hierarchyCommandSaved(command,data,2),true);assert.equal(hierarchyCommandSaved(command,data,3),false);
 assert.equal(hierarchyCommandSaved({...command,subtaskId:'another'},data,2),false);
 assert.equal(hierarchyCommandSaved({...command,title:'Edited since submission'},data,2),false);
 assert.equal(hierarchyCommandSaved({action:'set_milestone_phases',milestoneId:'m',phases:['production','discovery']},data,2),true);
});

test('body equality ignores JSON object order but preserves task ordering and real edits',()=>{
 const {projectBodiesEqual,mergeProjectBodies}=loadProjectTs('lib/projects/workplan-merge.ts');
 const reordered={tasks:copy(plan.tasks).map(({notes,...rest})=>({notes,...rest})),milestones:copy(plan.milestones),notes:'',owner:'',title:'Project'};
 assert.equal(projectBodiesEqual(plan,reordered),true);assert.equal(projectBodiesEqual(mergeProjectBodies(plan,plan,reordered).body,plan),true);
 reordered.tasks[0].title='Real change';assert.equal(projectBodiesEqual(plan,reordered),false);
});

test('navigation waits for every persisted discard and stays blocked if one fails',async()=>{
 const {discardWorkspaceEditors}=loadProjectTs('lib/admin/workspace/navigation-discard.ts');
 const gate=deferred(),steps=[];
 const leaving=discardWorkspaceEditors([{discard:async()=>{await gate.promise;steps.push('project');}},{discard:async()=>{steps.push('note');}}]).then(()=>steps.push('navigate'));
 assert.deepEqual(steps,[]);gate.resolve();await leaving;assert.deepEqual(steps,['project','note','navigate']);
 let navigated=false;
 await assert.rejects(discardWorkspaceEditors([{discard:async()=>{throw new Error('Generation conflict');}}]).then(()=>{navigated=true;}),/Generation conflict/);
 assert.equal(navigated,false);
});
