import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

import {loadProjectTs} from './load-project-ts.mjs';
const module={exports:loadProjectTs('lib/projects/workplan-views.ts')};
const {suggestedTaskPriority}=module.exports;

test('suggested task priority follows confirmed schedule progress and pauses blocked or overdue work',()=>{
  const start='2026-01-01',due='2026-01-21';
  assert.equal(suggestedTaskPriority(start,due,'2026-01-10'),'low');
  assert.equal(suggestedTaskPriority(start,due,'2026-01-11'),'medium');
  assert.equal(suggestedTaskPriority(start,due,'2026-01-16'),'high');
  assert.equal(suggestedTaskPriority(start,due,'2026-01-22'),null);
  assert.equal(suggestedTaskPriority(start,due,'2026-01-16',true),null);
  assert.equal(suggestedTaskPriority(start,start,'2026-01-01'),null);
  assert.equal(suggestedTaskPriority('2026-02-30',due,'2026-01-10'),null);
});
