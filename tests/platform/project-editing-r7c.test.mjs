import test from 'node:test';
import assert from 'node:assert/strict';
import {projectEditor,plan,copy,deferred} from './project-editor-harness.mjs';
import {loadProjectTs} from './load-project-ts.mjs';

test('shared editor saves equivalent title/status/date/relationship edits with one revision model',async()=>{
 for(const surface of ['Overview','Plan']){
  const work=projectEditor();await work.flush();
  work.edit(body=>{body.tasks[0].title='Shared title';body.tasks[0].dueOn='2026-11-01';body.tasks[0].status='doing';body.tasks[0].milestoneId=null;body.milestones[0].title='Shared milestone';});
  assert.equal(await work.current.save(),true,surface);await work.flush();
  assert.equal(work.server.body.tasks[0].title,'Shared title');assert.equal(work.current.dirty,false);assert.equal(work.current.savedRevision,2);
  work.unmount();
 }
});

test('typing during a canonical save is retained; duplicate submissions and stale server props cannot erase it',async()=>{
 const gate=deferred(),work=projectEditor({controls:{postGate:gate}});await work.flush();
 work.edit(body=>{body.tasks[0].title='Submitted';});
 const save=work.current.save();await work.flush();
 assert.equal(await work.current.save(),false);
 work.edit(body=>{body.tasks[0].title='Typed later';body.tasks[0].notes='New note';});
 gate.resolve();assert.equal(await save,false);await work.flush();
 assert.equal(work.server.posts,1);assert.equal(work.server.body.tasks[0].title,'Submitted');
 assert.equal(work.current.body.tasks[0].title,'Typed later');assert.equal(work.current.body.tasks[0].notes,'New note');assert.equal(work.current.dirty,true);
 work.props.record={body:copy(plan),revision:1,state:'active'};work.render();await work.flush();
 assert.equal(work.current.body.tasks[0].title,'Typed later');work.unmount();
});

test('normal/advanced switching preserves the same draft, validation state and baseline',async()=>{
 const work=projectEditor({controls:{validation:true}});await work.flush();work.edit(body=>{body.tasks[0].title='Unsaved normal edit';});
 work.current.setAdvanced(true);await work.flush();assert.equal(work.current.advanced,true);assert.equal(work.current.body.tasks[0].title,'Unsaved normal edit');
 await work.current.save();await work.flush();const message=work.current.message;
 work.current.setAdvanced(false);await work.flush();assert.equal(work.current.message,message);assert.equal(work.current.savedRevision,1);assert.equal(work.current.dirty,true);assert.equal(work.current.body.tasks[0].title,'Unsaved normal edit');work.unmount();
});

test('two-session conflicts reconcile the whole baseline and retain same-field conflict choices',async()=>{
 const work=projectEditor();await work.flush();work.edit(body=>{body.tasks[0].title='Local title';});
 work.server.body.tasks[0].dueOn='2026-11-02';work.server.revision=2;
 assert.equal(await work.current.save(),false);await work.flush();
 assert.equal(work.current.body.tasks[0].title,'Local title');assert.equal(work.current.body.tasks[0].dueOn,'2026-11-02');
 work.server.body.tasks[0].title='Remote title';work.server.revision=3;
 assert.equal(await work.current.save(),false);await work.flush();assert.equal(work.current.drafts.conflict,true);
 work.current.drafts.chooseConflict(work.current.drafts.rebase.conflicts[0].path,'draft');await work.flush();
 assert.equal(await work.current.save(),true);await work.flush();assert.equal(work.server.body.tasks[0].title,'Local title');work.unmount();
});

test('a conflict survives the in-flight render and a refreshed server revision until an explicit choice',async()=>{
 const gate=deferred(),work=projectEditor({controls:{postGate:gate}});await work.flush();work.edit(body=>{body.tasks[0].title='Local title';});
 work.server.body.tasks[0].title='Remote title';work.server.revision=2;
 const saving=work.current.save();await work.flush();gate.resolve();await saving;await work.flush();
 assert.equal(work.current.drafts.conflict,true);
 work.props.record={body:copy(work.server.body),revision:2,state:'active'};work.render();await work.flush();
 assert.equal(work.current.drafts.conflict,true);assert.equal(work.current.body.tasks[0].title,'Local title');
 work.current.drafts.chooseConflict(work.current.drafts.rebase.conflicts[0].path,'latest');await work.flush();assert.equal(work.current.drafts.conflict,false);assert.equal(work.current.body.tasks[0].title,'Remote title');work.unmount();
});

test('validation rejection remains correctable and does not become a revision conflict or draft loop',async()=>{
 const work=projectEditor({controls:{validation:true}});await work.flush();work.edit(body=>{body.tasks[0].status='done';});
 assert.equal(await work.current.save(),false);await work.flush();assert.equal(work.current.savedRevision,1);assert.equal(work.current.drafts.conflict,false);assert.equal(work.current.dirty,true);
 work.controls.validation=false;work.edit(body=>{body.tasks[0].status='doing';});assert.equal(await work.current.save(),true);await work.flush();assert.equal(work.current.savedRevision,2);work.unmount();
});

test('confirmed save with refresh failure stays saved; lost response verifies the submission without losing later edits',async()=>{
 const work=projectEditor({controls:{refreshFails:true}});await work.flush();work.edit(body=>{body.tasks[0].title='Saved';});
 assert.equal(await work.current.save(),true);await work.flush();assert.equal(work.current.savedRevision,2);assert.match(work.current.message,/saved/i);assert.equal(work.current.saveOutcomeUnknown,false);work.unmount();
 const gate=deferred(),lost=projectEditor({controls:{postGate:gate,loseReply:true}});await lost.flush();lost.edit(body=>{body.title='Submitted';});const saving=lost.current.save();await lost.flush();lost.edit(body=>{body.notes='After submission';});gate.resolve();await saving;await lost.flush();assert.equal(lost.server.posts,1);assert.equal(lost.current.body.notes,'After submission');assert.equal(lost.current.dirty,true);lost.unmount();
});

test('unknown outcome blocks repeat writes until a saved read reconciles; late unmounted responses are ignored',async()=>{
 const work=projectEditor({controls:{loseReply:true,readFails:false}});await work.flush();work.controls.readFails=true;work.edit(body=>{body.title='Pending';});await work.current.save();await work.flush();
 assert.equal(work.current.saveOutcomeUnknown,true);assert.equal(await work.current.save(),false);assert.equal(work.server.posts,1);
 work.controls.readFails=false;await work.current.checkUncertainSave();await work.flush();assert.equal(work.current.saveOutcomeUnknown,false);assert.equal(work.current.dirty,false);work.unmount();
 const gate=deferred(),late=projectEditor({controls:{postGate:gate}});await late.flush();late.edit(body=>{body.title='Request';});const saved=late.current.save();await late.flush();late.unmount();gate.resolve();assert.equal(await saved,false);
});

test('immediate command notifications read the matching body and revision and preserve pending private edits',async()=>{
 const work=projectEditor();await work.flush();work.edit(body=>{body.tasks[0].title='Private';});
 work.server.body.tasks[0].dueOn='2026-11-15';work.server.revision=2;work.notify();await work.flush();
 assert.equal(work.current.savedRevision,2);assert.equal(work.current.savedBody.tasks[0].dueOn,'2026-11-15');assert.equal(work.current.body.tasks[0].title,'Private');assert.equal(work.current.body.tasks[0].dueOn,'2026-11-15');work.unmount();
});

test('discard waits for delayed autosave and adopts latest baseline; reload can restore a private draft',async()=>{
 const gate=deferred(),work=projectEditor({controls:{draftGate:gate}});await work.flush();work.edit(body=>{body.title='Private';});work.fireTimers();await work.flush();
 const discarded=work.current.discard();await work.flush();assert.equal(work.server.deletes,0);
 work.server.body.notes='Other session';work.server.revision=2;gate.resolve();assert.equal(await discarded,true);await work.flush();
 assert.equal(work.current.body.notes,'Other session');assert.equal(work.current.dirty,false);assert.equal(work.server.draft,null);work.fireTimers();await work.flush();assert.equal(work.server.draft,null);work.unmount();
 const restore=projectEditor({server:{draft:{body:{...copy(plan),title:'Recover me'},baseBody:copy(plan),baseRevision:1,updatedAt:'2026-10-22T12:00:00Z'},generation:1}});await restore.flush();assert.equal(restore.current.drafts.restore(),true);await restore.flush();assert.equal(restore.current.body.title,'Recover me');restore.unmount();
});

test('completed restrictions and private-draft generations prevent unauthorized application or another-session draft deletion',async()=>{
 const work=projectEditor();await work.flush();work.edit(body=>{body.title='Private';});work.server.generation=7;work.server.draft={body:{...copy(plan),title:'Other tab'},baseBody:copy(plan),baseRevision:1,updatedAt:'2026-10-22T12:00:00Z'};
 assert.equal(await work.current.discard(),false);await work.flush();assert.equal(work.server.draft.body.title,'Other tab');assert.equal(work.current.body.title,'Private');work.unmount();
 const completed=projectEditor();await completed.flush();completed.props.record={...completed.props.record,state:'completed'};completed.render();await completed.flush();completed.edit(body=>{body.title='Forbidden';});assert.equal(await completed.current.save(),false);assert.equal(completed.server.posts,0);completed.unmount();
});

test('edits made after a discard begins remain recoverable and block leaving',async()=>{
 const gate=deferred(),work=projectEditor({controls:{deleteGate:gate}});await work.flush();work.edit(body=>{body.title='Discard this';});
 const discarding=work.current.discard();await work.flush();work.edit(body=>{body.title='New edit after discard';});gate.resolve();assert.equal(await discarding,false);await work.flush();
 assert.equal(work.current.body.title,'New edit after discard');assert.equal(work.server.draft,null);assert.equal(work.current.dirty,true);work.unmount();
});
