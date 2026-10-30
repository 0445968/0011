import test from 'node:test';
import assert from 'node:assert/strict';
import {projectEditor,copy,plan,deferred} from './project-editor-harness.mjs';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

test('Tasks page effects cannot automatically apply the draft',()=>{
 const source=readFileSync(new URL('../../components/admin/ProjectWorkspace.tsx',import.meta.url),'utf8');
 const file=ts.createSourceFile('ProjectWorkspace.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(node){
  if(ts.isCallExpression(node)&&node.expression.getText(file)==='useEffect'){
   assert.doesNotMatch(node.arguments[0].getText(file),/controller\.save\(|command\(['"]save['"]\)/);
  }
  ts.forEachChild(node,visit);
 }
 visit(file);
 assert.match(source,/Save all changes/);
 assert.match(source,/onSaveTask=\{taskId=>\{void controller\.save\(taskId\)/);
});

test('draft backup never applies task edits until an explicit save',async()=>{
 const work=projectEditor();await work.flush();
 work.edit(body=>{body.tasks[0].title='Draft title';});
 work.fireTimers();await work.flush();
 assert.equal(work.server.posts,0);
 assert.equal(work.server.body.tasks[0].title,'Task');
 assert.equal(work.server.draft.body.tasks[0].title,'Draft title');
 await work.current.save();await work.flush();
 assert.equal(work.server.body.tasks[0].title,'Draft title');
 assert.equal(work.current.dirty,false);work.unmount();
});

test('Save task applies only the selected task and preserves unrelated drafts',async()=>{
 const work=projectEditor();await work.flush();
 work.edit(body=>{body.tasks[0].title='Save this task';body.notes='Keep project note private';body.tasks.push({...copy(plan.tasks[0]),id:'other',title:'Other draft'});});
 await work.current.save('t');await work.flush();
 assert.equal(work.server.body.tasks[0].title,'Save this task');
 assert.equal(work.server.body.notes,'');assert.equal(work.server.body.tasks.length,1);
 assert.equal(work.current.body.notes,'Keep project note private');
 assert.equal(work.current.body.tasks[1].title,'Other draft');assert.equal(work.current.dirty,true);
 work.fireTimers();await work.flush();assert.equal(work.server.draft.body.tasks.length,2);
 await work.current.save();await work.flush();assert.equal(work.server.body.tasks.length,2);work.unmount();
});

test('Save task retains newer edits made during the request',async()=>{
 const gate=deferred(),work=projectEditor({controls:{postGate:gate}});await work.flush();
 work.edit(body=>{body.tasks[0].title='Submitted';});
 const saving=work.current.save('t');await work.flush();
 work.edit(body=>{body.tasks[0].title='Newer draft';});
 gate.resolve();await saving;await work.flush();
 assert.equal(work.server.body.tasks[0].title,'Submitted');
 assert.equal(work.current.body.tasks[0].title,'Newer draft');assert.equal(work.current.dirty,true);work.unmount();
});

test('Save task requires Save all for a new draft milestone',async()=>{
 const work=projectEditor();await work.flush();
 work.edit(body=>{body.milestones.push({...copy(plan.milestones[0]),id:'new'});body.tasks[0].milestoneId='new';});
 assert.equal(await work.current.save('t'),false);assert.equal(work.server.posts,0);
 await work.flush();assert.match(work.current.message,/Save all changes/);work.unmount();
});

test('Save task can create a new task without applying a different draft',async()=>{
 const work=projectEditor();await work.flush();
 work.edit(body=>{body.tasks[0].title='Unrelated draft';body.tasks.push({...copy(plan.tasks[0]),id:'new',title:'New task'});});
 await work.current.save('new');await work.flush();
 assert.equal(work.server.body.tasks[0].title,'Task');assert.equal(work.server.body.tasks[1].title,'New task');
 assert.equal(work.current.body.tasks[0].title,'Unrelated draft');work.unmount();
});

test('task settings join the same draft and are acknowledged after an uncertain explicit save',async()=>{
 const work=projectEditor({controls:{loseReply:true}});try{
  await work.flush();
  work.edit(body=>{body.tasks[0].edits={controlRevision:1,priority:'high',assignment:{side:'bivi',userIds:[]},review:{requiresStaffReview:true,requiresClientReview:false}};});
  work.fireTimers();await work.flush();
  assert.equal(work.server.posts,0);assert.equal(work.server.draft.body.tasks[0].edits.priority,'high');
  assert.equal(await work.current.save('t'),true);await work.flush();
  assert.equal(work.server.posts,1);assert.equal(work.current.dirty,false);
  assert.equal(work.current.body.tasks[0].edits,undefined);
 }finally{work.unmount();}
});
