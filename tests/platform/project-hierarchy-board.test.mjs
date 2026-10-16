import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const code = fs.readFileSync(new URL('../../lib/projects/hierarchy-board.ts', import.meta.url),'utf8');
const module = {exports:{}};
const compiled = ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const phaseOrder=['inquiry','proposal-onboarding','discovery','direction','production','review','qa','delivery','handoff'];
new Function('module','exports','require',compiled)(module,module.exports,(name)=>{
  if(name==='./lifecycle-schema')return {projectPhaseOrder:phaseOrder};
  throw new Error('Unexpected runtime import: '+name);
});
const {groupMilestones,milestoneWork,unassignedTasks}=module.exports;
const sample={title:'Test',owner:'',notes:'',milestones:[
{id:'m1',title:'Discovery workshop',status:'planned',dueOn:null},
{id:'m2',title:'QA handoff',status:'planned',dueOn:null},
{id:'m3',title:'Unassigned',status:'planned',dueOn:null},
],tasks:[{id:'a',title:'A',status:'done',milestoneId:'m1'}, {id:'b',title:'B',status:'todo',milestoneId:'m1'}, {id:'x',title:'X',status:'doing',milestoneId:null}]};

test('milestone cards group by first canonical phase and multi-phase does not duplicate work',()=>{
  const groups=groupMilestones(sample,[{milestoneId:'m1',phase:'production'},{milestoneId:'m1',phase:'discovery'},{milestoneId:'m2',phase:'qa'}]);
  assert.deepEqual(groups.map(x=>x.phase),['discovery','qa',null]);
  assert.deepEqual(groups.flatMap(x=>x.milestones.map(m=>m.id)),['m1','m2','m3']);
});

test('task evidence never infers milestone approval or completion from subtask records',()=>{
  const data=milestoneWork(sample,'m1',[{id:'s',taskId:'a',status:'done'}, {id:'s2',taskId:'b',status:'doing'}]);
  assert.equal(data.taskDone,1);
  assert.equal(data.taskPercent,50);
  assert.equal(data.allTasksDone,false);
  assert.equal(data.subtaskDone,1);
  assert.deepEqual(unassignedTasks(sample).map(t=>t.id),['x']);
});

test('empty milestone progress stays unknown',()=>{
  const data=milestoneWork(sample,'m3',[]);
  assert.equal(data.taskPercent,null);
  assert.equal(data.allTasksDone,false);
});
