import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('phase upsert completed candidate carries activation evidence before ON CONFLICT', () => {
  const sql = read('supabase/migrations/202610160038_phase_completion_constraint_fix.sql');
  assert.match(sql, /case when p_status in \('active','completed'\) then now\(\) else null end/);
  assert.match(sql, /phase_status_history/);
  assert.match(sql, /if old_status<>'active' then return jsonb_build_object\('result','must_activate'\)/);
  assert.match(sql, /if incomplete_count>0 then return jsonb_build_object\('result','milestones_incomplete'/);
  assert.match(sql, /if p_status<>'active' and active_count>0 then return jsonb_build_object\('result','active_work'/);
});

test('assignment hook ignores stale requests instead of aborting fetch during effect cleanup', () => {
  const source = read('components/admin/projects/ProjectAssignments.tsx');
  assert.match(source, /requestGeneration/);
  assert.match(source, /return \(\) => \{ active = false; \}/);
  assert.doesNotMatch(source, /controller\.abort\(\)/);
  assert.doesNotMatch(source, /new AbortController\(\)/);
});

test('phase route surfaces bounded diagnostic and keeps low-level error in server logs', () => {
  const source = read('app/api/admin/projects/[id]/phases/route.ts');
  assert.match(source, /console\.error\('\[project phase save\] database failure'/);
  assert.match(source, /diagnosticCode: code/);
  assert.match(source, /code === '23514'/);
});
