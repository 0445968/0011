import test from 'node:test';
import assert from 'node:assert/strict';
import {projectEditor,deferred} from './project-editor-harness.mjs';
test('submitted task requirements leave the published task unchanged and clear only the submitted draft',async()=>{
 const work=projectEditor({controls:{submitForApproval:true}});try{await work.flush();work.edit(body=>{body.tasks[0].title='Proposed title';});assert.equal(await work.current.save(),true);await work.flush();assert.equal(work.server.body.tasks[0].title,'Task');assert.equal(work.server.submittedBody.tasks[0].title,'Proposed title');assert.equal(work.current.dirty,false);assert.match(work.current.message,/submitted for Bivi admin approval/);}finally{work.unmount();}
});
test('proposal receipts recover lost responses without treating an unchanged project as a failed save',async()=>{
 const work=projectEditor({controls:{submitForApproval:true,loseReply:true}});try{await work.flush();work.edit(body=>{body.tasks[0].edits={controlRevision:1,priority:'high'};});assert.equal(await work.current.save(),true);await work.flush();assert.equal(work.server.posts,1);assert.equal(work.server.revision,1);assert.equal(work.current.dirty,false);assert.equal(work.current.saveOutcomeUnknown,false);}finally{work.unmount();}
});
test('new edits typed during proposal submission remain a draft without creating a false conflict',async()=>{
 const gate=deferred();const work=projectEditor({controls:{submitForApproval:true,postGate:gate}});try{await work.flush();work.edit(body=>{body.tasks[0].title='Submitted title';});const pending=work.current.save();await work.flush();work.edit(body=>{body.tasks[0].title='Newer draft title';});gate.resolve();assert.equal(await pending,false);await work.flush();assert.equal(work.current.body.tasks[0].title,'Newer draft title');assert.equal(work.current.dirty,true);assert.equal(work.current.drafts.conflict,false);assert.equal(work.server.submittedBody.tasks[0].title,'Submitted title');}finally{work.unmount();}
});
