import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source=readFileSync(new URL('../../lib/projects/workplan-filters.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const module={exports:{}};
new Function('module','exports',compiled)(module,module.exports);
const {emptyWorkplanFilters,workplanTaskMatches,workplanMilestoneMatches,workplanTaskPhases,groupWorkplanTasks}=module.exports;
const filters=change=>({...emptyWorkplanFilters,...change});
const task=(id,changes={})=>({id,title:id,notes:'',owner:'',status:'todo',dueOn:null,milestoneId:'shared',...changes});
const body={title:'Project',owner:'',notes:'',milestones:[{id:'shared',title:'Shared milestone',status:'planned',dueOn:null},{id:'empty',title:'Empty milestone',status:'done',dueOn:'2026-10-20'}],tasks:[task('bivi',{status:'doing',dueOn:'2026-10-21'}),task('client',{status:'blocked',dueOn:'2026-10-19'}),task('loose',{milestoneId:null}),task('new',{milestoneId:null})]};
const context={body,links:[{milestoneId:'shared',phase:'discovery'},{milestoneId:'shared',phase:'production'}],controls:[{taskId:'bivi',phase:'direction'}],assignments:[{task_id:'bivi',side:'bivi',assignees:['staff']},{task_id:'client',side:'client',assignees:['client']},{task_id:'loose',side:'bivi',assignees:[]}],today:'2026-10-21'};

test('work filters combine phase, side, assignee, status and deadline on the same task',()=>{
  const selection=filters({phase:'production',side:'client',assignee:'client',status:'blocked',deadline:'overdue'});
  assert.deepEqual(body.tasks.filter(row=>workplanTaskMatches(row,selection,context)).map(row=>row.id),['client']);
  assert.equal(workplanMilestoneMatches(body.milestones[0],selection,context),true);
  assert.equal(workplanMilestoneMatches(body.milestones[0],filters({side:'bivi',status:'blocked'}),context),false,'different children cannot satisfy different criteria');
  assert.equal(workplanTaskMatches(body.tasks[0],filters({query:'shared milestone'}),context),true);
});

test('shared phase associations stay distinct without duplicating task or milestone totals',()=>{
  assert.deepEqual(workplanTaskPhases(body.tasks[0],context),['direction','discovery','production']);
  for(const phase of ['direction','discovery','production'])assert.equal(workplanTaskMatches(body.tasks[0],filters({phase}),context),true);
  assert.equal(body.milestones.filter(row=>workplanMilestoneMatches(row,filters({phase:'production'}),context)).length,1);
  const before=JSON.stringify(context);
  for(const grouping of ['none','milestone','status','side']){
    const groups=groupWorkplanTasks(body.tasks,grouping,context);
    assert.equal(groups.flatMap(group=>group.tasks).length,body.tasks.length);
    assert.equal(new Set(groups.flatMap(group=>group.tasks.map(row=>row.id))).size,body.tasks.length);
  }
  assert.equal(JSON.stringify(context),before);
});

test('missing saved assignments are not invented as unassigned staff or client work',()=>{
  assert.equal(workplanTaskMatches(body.tasks[2],filters({assignee:'unassigned'}),context),true);
  assert.equal(workplanTaskMatches(body.tasks[3],filters({assignee:'unassigned'}),context),false);
  assert.equal(workplanTaskMatches(body.tasks[3],filters({side:'unknown'}),context),true);
  assert.equal(workplanTaskMatches(body.tasks[2],filters({phase:'unassigned'}),context),true);
  assert.equal(workplanMilestoneMatches(body.milestones[1],filters({side:'bivi'}),context),false);
});

test('deadline filters keep undated work unscheduled, use inclusive dates, and exclude completed overdue work',()=>{
  assert.equal(workplanTaskMatches(body.tasks[2],filters({deadline:'undated'}),context),true);
  assert.equal(workplanTaskMatches(body.tasks[2],filters({from:'2026-10-21'}),context),false);
  assert.equal(workplanTaskMatches(body.tasks[0],filters({from:'2026-10-21',to:'2026-10-21'}),context),true);
  assert.equal(workplanTaskMatches(body.tasks[0],filters({from:'2026-10-22',to:'2026-10-21'}),context),false);
  assert.equal(workplanTaskMatches(task('last',{dueOn:'2026-10-27'}),filters({deadline:'next7'}),context),true);
  assert.equal(workplanTaskMatches(task('later',{dueOn:'2026-10-28'}),filters({deadline:'next7'}),context),false);
  assert.equal(workplanTaskMatches(task('done',{status:'done',dueOn:'2026-10-20'}),filters({deadline:'overdue'}),context),false);
  assert.equal(workplanMilestoneMatches(body.milestones[1],filters({status:'done',deadline:'dated'}),context),true);
});
