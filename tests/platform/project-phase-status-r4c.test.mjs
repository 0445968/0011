import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

const code = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
function loadHelper(source) {
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 } });
  const exports = {};
  vm.runInNewContext(compiled.outputText, { exports, module:{exports} });
  return exports;
}
const phaseSource = code('lib/projects/phase-status.ts');
const overviewSource = code('lib/projects/overview-milestones.ts');
const sql = code('supabase/migrations/202610160035_parallel_phase_states.sql');

// Helpers have type-only imports, except Zod in phase-status, so test the pure functions
// by evaluating exactly their authored code without rebuilding runtime schemas.
const { activePhaseMilestones } = loadHelper(overviewSource);
function body() { return {milestones:[{id:'a',status:'planned'}, {id:'b',status:'done'}, {id:'c',status:'planned'}],tasks:[]}; }
const links=[{milestoneId:'a',phase:'production'}, {milestoneId:'b',phase:'discovery'}, {milestoneId:'b',phase:'production'}, {milestoneId:'c',phase:'handoff'}];
const states=[
  {phase:'production',status:'active',everActive:true},
  {phase:'discovery',status:'completed',everActive:true},
  {phase:'handoff',status:'planning',everActive:false},
];

test('parallel active phase includes planning milestones; historical completed remains at right',()=>{
  assert.deepEqual(activePhaseMilestones(body(),links,[],states).map(m=>m.id),['a','b']);
});
test('multi-phase completed milestone appears exactly once',()=>{
  assert.equal(activePhaseMilestones(body(),links,[],states).filter(m=>m.id==='b').length,1);
});
test('no unrelated future milestone or unapproved inactive work',()=>{
  const s=states.map(s=>s.phase==='production'?{...s,status:'planning'}:s);
  assert.deepEqual(activePhaseMilestones(body(),links,[],s).map(m=>m.id),['b']);
});
test('migration maintains protected staff-only phase statuses and server-side syncing',()=>{
  for(const fragment of [
    'project_phase_states enable row level security',
    'is_inquiry_staff()',
    'create trigger sync_project_milestones_before_update',
    'create trigger activate_project_phases_after_update',
    "task.value->>'status' in ('doing','blocked')",
    "old_status<>'active'",
    "linked_count=0 or incomplete_count>0",
    "'milestones_incomplete'",
    'phase_history_project',
  ]) assert.ok(sql.includes(fragment),`Missing ${fragment}`);
});
test('phase editor uses an in-app dialog and saved independent states',()=>{
  const component=code('components/admin/projects/ProjectPhaseCards.tsx');
  assert.match(component,/DialogContent/);
  assert.match(component,/useProjectPhaseStatuses/);
  assert.doesNotMatch(component,/window\.confirm/);
  assert.match(phaseSource,/expectedMilestoneStatus/);
});
