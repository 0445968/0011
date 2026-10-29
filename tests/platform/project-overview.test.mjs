import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {loadProjectTs} from './load-project-ts.mjs';
const {projectOverviewSummary}=loadProjectTs('lib/projects/overview-summary.ts');
const {taskToday}=loadProjectTs('lib/tasks/links.ts');
const task=(id,status,dueOn)=>({id,title:id,owner:'',notes:'',milestoneId:null,status,dueOn});
const body=(tasks,milestones=[])=>({title:'Project',owner:'',notes:'',tasks,milestones});

test('Overview counts overdue open work without treating completed or undated work as overdue',()=>{
  const source=body([task('future','todo','2026-10-20'),task('past','blocked','2026-10-15'),task('today','doing','2026-10-16'),task('done','done','2026-10-01'),task('undated','todo',null)]);
  const before=structuredClone(source);
  const summary=projectOverviewSummary(source,'2026-10-16');
  assert.equal(summary.overdue,1);assert.equal(summary.dueToday,1);assert.equal(summary.blocked,1);assert.equal(summary.done,1);
  assert.deepEqual(summary.openTasks.map(task=>task.id),['past','today','future','undated']);
  assert.equal(summary.nextDatedTask.id,'past');assert.deepEqual(source,before);
});
test('Overview handles empty and undated plans and sorts milestones without modifying saved order',()=>{
  const empty=projectOverviewSummary(body([]),'2026-10-16');assert.equal(empty.nextDatedTask,null);assert.equal(empty.overdue,0);assert.equal(empty.milestoneDone,0);
  const milestones=[{id:'done',title:'Done',status:'done',dueOn:'2026-09-01'},{id:'later',title:'Later',status:'planned',dueOn:null},{id:'next',title:'Next',status:'in_progress',dueOn:'2026-10-18'}];
  const source=body([task('undated','doing',null)],milestones);const before=structuredClone(source);
  const result=projectOverviewSummary(source,'2026-10-16');assert.equal(result.nextDatedTask,null);assert.equal(result.milestoneDone,1);
  assert.deepEqual(result.milestones.map(item=>item.id),['next','later','done']);assert.deepEqual(source,before);
});
test('Staff-local midnight changes overdue classification without shifting saved date-only deadlines',()=>{
  const now=new Date('2026-10-16T03:00:00Z');
  const source=body([task('deadline','todo','2026-10-15')]);
  const chicago=taskToday('America/Chicago',now),tokyo=taskToday('Asia/Tokyo',now);
  assert.equal(projectOverviewSummary(source,chicago.today).dueToday,1);assert.equal(projectOverviewSummary(source,chicago.today).overdue,0);
  assert.equal(projectOverviewSummary(source,tokyo.today).overdue,1);
  for(const instant of ['2026-03-08T07:59:00Z','2026-03-08T08:01:00Z'])assert.equal(taskToday('America/Chicago',new Date(instant)).today,'2026-03-08');
});
