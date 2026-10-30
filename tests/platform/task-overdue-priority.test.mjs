import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProjectTs} from './load-project-ts.mjs';
const {effectiveTaskPriority,taskIsOverdue}=loadProjectTs('lib/projects/deadlines.ts');
const context={today:'2026-10-30',now:'2026-10-30T15:00:00Z',timezone:'America/Chicago'};
const task={id:'t',title:'Task',status:'todo',dueOn:'2026-10-29',notes:'',owner:'',milestoneId:null};
test('overdue urgency preserves manual priority through completion, reschedule and archive',()=>{
 const before=structuredClone(task);
 for(const priority of [null,'low','medium','high','urgent']){
  assert.equal(effectiveTaskPriority(task,priority,context),'urgent');
  assert.equal(effectiveTaskPriority({...task,status:'done'},priority,context),priority);
  assert.equal(effectiveTaskPriority({...task,dueOn:'2026-11-01'},priority,context),priority);
  assert.equal(effectiveTaskPriority({...task,archived:true},priority,context),priority);
 }
 assert.deepEqual(task,before);
 assert.equal(effectiveTaskPriority({...task,dueOn:null},'low',context),'low');
});
test('same-day timed deadlines change urgency at their actual timezone-aware instant',()=>{
 const timed={...task,dueOn:'2026-10-30',dueTime:'09:30',timeZone:'America/Chicago'};
 assert.equal(effectiveTaskPriority(timed,'low',{...context,now:'2026-10-30T14:29:00Z'}),'low');
 assert.equal(effectiveTaskPriority(timed,'low',context),'urgent');
 assert.equal(taskIsOverdue({...task,dueOn:context.today},context),false,'date-only deadlines last the full day');
});
