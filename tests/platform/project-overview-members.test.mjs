import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const content = fs.readFileSync(new URL('../../lib/projects/overview-milestones.ts',import.meta.url),'utf8');
const mod = {exports:{}};
new Function('module','exports',ts.transpileModule(content,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(mod,mod.exports);
const {activePhaseMilestones} = mod.exports;
const m=(id,status)=>({id,status,title:id,dueOn:null});

test('Overview includes all linked milestones for concurrent phases once, completed last',()=>{
 const body={milestones:[m('a','done'),m('b','planned'),m('c','in_progress'),m('d','planned')]};
 const links=[{milestoneId:'a',phase:'discovery'},{milestoneId:'b',phase:'production'},
  {milestoneId:'b',phase:'discovery'},{milestoneId:'c',phase:'discovery'},
  {milestoneId:'d',phase:'handoff'}];
 const original=structuredClone(body);
 const result=activePhaseMilestones(body,links,['discovery','production']);
 assert.deepEqual(result.map(x=>x.id),['b','c','a']);
 assert.deepEqual(body,original);
});

test('Overview does not invent unlinked milestones or active phase membership',()=>{
 const body={milestones:[m('unlinked','planned'),m('planned','planned')]};
 const links=[{milestoneId:'planned',phase:'production'}];
 assert.deepEqual(activePhaseMilestones(body,links,['discovery']),[]);
 assert.deepEqual(activePhaseMilestones(body,links,['production']).map(x=>x.id),['planned']);
});
