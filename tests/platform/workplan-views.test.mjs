import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import fs from 'node:fs';
import {loadProjectTs} from './load-project-ts.mjs';
const module={exports:loadProjectTs('lib/projects/workplan-views.ts')};
const {daysRemaining,remainingLabel,milestoneStats,nextStatus,workStatusOrder,milestoneStatusOrder} = module.exports;
test('status icons/labels share deterministic transitions',()=>{
  assert.deepEqual(workStatusOrder.map(status=>nextStatus(status,workStatusOrder)),['doing','blocked','done','todo']);
  assert.deepEqual(milestoneStatusOrder.map(status=>nextStatus(status,milestoneStatusOrder)),['in_progress','done','planned']);
});
test('date-only time remaining and overdue labels are timezone-neutral',()=>{
  assert.equal(daysRemaining('2026-10-20','2026-10-16'),4);
  assert.equal(daysRemaining('2026-10-15','2026-10-16'),-1);
  assert.equal(remainingLabel(-1),'1d overdue');
  assert.equal(remainingLabel(0),'Due today');
  assert.equal(remainingLabel(null),'No deadline');
});
test('milestone progress is derived from saved and draft task state without fabricating completion',()=>{
  const body={tasks:[{id:'one',milestoneId:'m',status:'done'},{id:'two',milestoneId:'m',status:'doing'},{id:'loose',milestoneId:null,status:'done'}]};
  assert.deepEqual(milestoneStats(body,'m'),{total:2,done:1,percent:50,readyForReview:false});
  assert.deepEqual(milestoneStats(body,'other'),{total:0,done:0,percent:null,readyForReview:false});
  assert.equal(milestoneStats({...body,tasks:[{milestoneId:'m',status:'done'}]},'m').readyForReview,true);
});

test('revised R3b board preserves advanced editor and uses app dialogs for confirmations',()=>{
  const board=fs.readFileSync(new URL('../../components/admin/projects/ProjectMilestoneBoardV2.tsx',import.meta.url),'utf8');
  const preview=fs.readFileSync(new URL('../../components/admin/projects/ProjectMilestonePreviews.tsx',import.meta.url),'utf8');
  const phases=fs.readFileSync(new URL('../../components/admin/projects/ProjectPhasesPage.tsx',import.meta.url),'utf8');
  assert.match(board,/\['tasks','milestones'\]/);
  assert.match(board,/<Dialog /);
  assert.doesNotMatch(board,/window\.confirm\(/);
  assert.match(board,/onBulkTasks/);
  assert.match(phases,/set_milestone_phases/);
  assert.match(preview,/overflow-x-auto/);
  assert.match(preview,/milestoneStats/);
});
