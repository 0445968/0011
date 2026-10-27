import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
function loadPhaseSave() {
  const source = read('lib/projects/phase-save.ts');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 } });
  const exports = {};
  vm.runInNewContext(compiled.outputText, { exports, module: { exports } });
  return exports;
}
const phases = [
  { phase: 'discovery', status: 'active', revision: 4, everActive: true, activatedAt: 'a', completedAt: null },
  { phase: 'production', status: 'planning', revision: 2, everActive: false, activatedAt: null, completedAt: null },
];

test('phase status updates preserve concurrently active phases and independent revisions', () => {
  const { updatePhaseState } = loadPhaseSave();
  const next = updatePhaseState(phases, 'production', 'active', 3);
  assert.equal(next.find(item => item.phase === 'discovery').status, 'active');
  assert.equal(next.find(item => item.phase === 'discovery').revision, 4);
  assert.equal(next.find(item => item.phase === 'production').status, 'active');
  assert.equal(next.find(item => item.phase === 'production').revision, 3);
});

test('a stale phase write reconciles from the latest saved revision before another attempt', async () => {
  const { reconcilePhaseStatusSave } = loadPhaseSave();
  let refreshCalls = 0;
  const result = await reconcilePhaseStatusSave({
    phase: 'production', status: 'active', expectedRevision: 2,
    write: async () => ({ saved: false, error: 'Phase changed in another session.' }),
    refresh: async () => { refreshCalls++; return phases.map(item => item.phase === 'production' ? { ...item, status: 'planning', revision: 3 } : item); },
    applySaved: () => assert.fail('A stale write must not be reported as saved when the target state is absent.'),
  });
  assert.equal(refreshCalls, 1);
  assert.equal(result.outcome, 'failed');
  assert.equal(result.states.find(item => item.phase === 'production').revision, 3);
});

test('a successful phase write remains saved when its refresh fails', async () => {
  const { reconcilePhaseStatusSave } = loadPhaseSave();
  let appliedRevision = 0;
  const result = await reconcilePhaseStatusSave({
    phase: 'production', status: 'active', expectedRevision: 2,
    write: async () => ({ saved: true, revision: 3 }), refresh: async () => null,
    applySaved: revision => { appliedRevision = revision; },
  });
  assert.equal(result.outcome, 'saved_refresh_failed');
  assert.equal(appliedRevision, 3);
});

test('a lost write response is reconciled before the desired state is retried', async () => {
  const { reconcilePhaseStatusSave } = loadPhaseSave();
  let writes = 0;
  let appliedRevision = 0;
  const result = await reconcilePhaseStatusSave({
    phase: 'production', status: 'active', expectedRevision: 2,
    write: async () => { writes++; throw new Error('connection lost'); },
    refresh: async () => phases.map(item => item.phase === 'production' ? { ...item, status: 'active', revision: 3 } : item),
    applySaved: revision => { appliedRevision = revision; },
  });
  assert.equal(result.outcome, 'saved');
  assert.equal(writes, 1);
  assert.equal(appliedRevision, 3);
});

test('phase actions remain available through dirty work-plan drafts and migration reports missing controls and subtasks', () => {
  const board = read('components/admin/projects/ProjectMilestoneBoardV2.tsx');
  const workspace = read('components/admin/ProjectWorkspace.tsx');
  const cards = read('components/admin/projects/ProjectPhaseCards.tsx');
  const phases = read('components/admin/projects/ProjectPhasesPage.tsx');
  const sql = read('supabase/migrations/20261022120000_r7a_phase_completion_integrity.sql');
  const route = read('app/api/admin/projects/[id]/phases/route.ts');
  assert.doesNotMatch(board, /view==='phases'/);
  assert.doesNotMatch(workspace, /phaseStatusDisabled/);
  assert.match(phases, /<ProjectPhaseCards/);
  assert.match(phases, /<ProjectLifecycleControls/);
  assert.match(cards, /disabled=\{disabled\|\|!phases\.states\|\|phases\.busy\}/);
  assert.doesNotMatch(cards, /disabled=\{phases\.busy\|\|Boolean\(completeBlocked\)\}/);
  assert.match(sql, /'task_controls_missing'/);
  assert.match(sql, /'subtasks_incomplete'/);
  assert.match(sql, /project_phase_status_history/);
  assert.match(sql, /coalesce\(current_row\.revision,0\)<>p_revision/);
  assert.match(route, /subtask\(s\).*unfinished/);
  assert.match(route, /Save All in the work plan to restore task metadata/);
});
