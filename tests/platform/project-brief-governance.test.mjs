import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadProjectTs} from './load-project-ts.mjs';

const {canCompleteProject,canReopenProject,hasUnsavedProjectDraft}=loadProjectTs('lib/projects/brief-governance.ts');

const body=()=>({
  title:'Rebrand',owner:'Bivi',notes:'',
  milestones:[{id:'m1',title:'Discovery',status:'done',dueOn:null}],
  tasks:[{id:'t1',title:'Define audience',owner:'Bivi',notes:'',status:'done',milestoneId:'m1',dueOn:null}],
});

test('project completion is based on saved tasks, milestone status and verified prerequisites',()=>{
  const saved=body();
  assert.equal(canCompleteProject('active',saved,true),true);
  assert.equal(canCompleteProject('on_hold',saved,true),false);
  assert.equal(canCompleteProject('completed',saved,true),false);
  assert.equal(canCompleteProject('active',saved,false),false);
  assert.equal(canCompleteProject('active',{...saved,tasks:[]},true),false);
  assert.equal(canCompleteProject('active',{...saved,tasks:[{...saved.tasks[0],status:'doing'}]},true),false);
  assert.equal(canCompleteProject('active',{...saved,milestones:[{...saved.milestones[0],status:'in_progress'}]},true),false);
  assert.equal(canReopenProject('completed'),true);
  assert.equal(canReopenProject('on_hold'),false);
  assert.equal(canReopenProject('active'),false);
});

test('Brief transitions reject unfinished, malformed and task-reordered private drafts',()=>{
  const saved=body();
  assert.equal(hasUnsavedProjectDraft(null,saved),false);
  assert.equal(hasUnsavedProjectDraft(undefined,saved),false);
  assert.equal(hasUnsavedProjectDraft(structuredClone(saved),saved),false);
  assert.equal(hasUnsavedProjectDraft({...saved,tasks:[{...saved.tasks[0],notes:'Unsaved note'}]},saved),true);
  assert.equal(hasUnsavedProjectDraft({...saved,tasks:[{...saved.tasks[0],status:'todo'}]},saved),true);
  assert.equal(hasUnsavedProjectDraft({...saved,tasks:[{...saved.tasks[0],title:''}]},saved),true);
  const twoTasks={...saved,tasks:[saved.tasks[0],{...saved.tasks[0],id:'t2',title:'Logo'}]};
  assert.equal(hasUnsavedProjectDraft({...twoTasks,tasks:[...twoTasks.tasks].reverse()},twoTasks),true);
});

test('project governance is rendered under Brief, never as extra Tasks cards',()=>{
  const page=readFileSync(new URL('../../app/admin/(workspace)/projects/[id]/page.tsx',import.meta.url),'utf8');
  const tasks=readFileSync(new URL('../../components/admin/ProjectWorkspace.tsx',import.meta.url),'utf8');
  const panels=readFileSync(new URL('../../components/admin/projects/ProjectBriefGovernance.tsx',import.meta.url),'utf8');
  assert.match(page,/tab === 'brief'[\s\S]*?<ProjectBriefGovernance /);
  assert.doesNotMatch(tasks,/<summary[^>]*>[\s\S]{0,200}Project state & decisions/);
  for(const section of ['Project state & decisions','Activation snapshot','Project history']) {
    assert.ok(panels.includes(section),section+' must remain available under Brief');
  }
  for(const field of ['summary','deliverables','exclusions','clientInputs','revisions','schedule','fees']) {
    assert.ok(panels.includes("'"+field+"'"),field+' must remain in the activation snapshot');
  }
  assert.match(panels,/onClick=\{\(\)=>void changeState\('complete'\)\}/);
  assert.match(panels,/onClick=\{\(\)=>void changeState\('reopen'\)\}/);
  assert.match(panels,/event\.snapshot\.body\.tasks\.map/);
});
