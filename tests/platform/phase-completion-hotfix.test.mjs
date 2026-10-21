import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(path,'utf8');
const migration = read('supabase/migrations/202610160037_phase_completion_feedback.sql');
const dialog = read('components/admin/projects/ProjectPhaseCards.tsx');
const route = read('app/api/admin/projects/[id]/phases/route.ts');
test('phase close permits empty phases but blocks active work and unfinished milestones', () => {
 assert.match(migration,/if incomplete_count>0 then/);
 assert.doesNotMatch(migration,/if linked_count=0 or incomplete_count>0/);
 assert.match(migration,/activeCount/);
 assert.match(migration,/incompleteCount/);
 assert.match(migration,/if old_status<>'active'/);
});
test('dialog previews blockers, lets the server decide saved state, and shows actionable errors', () => {
 assert.match(dialog,/unfinished\.map/);
 assert.match(dialog,/activeLinkedTasks\.slice/);
 assert.match(dialog,/role="alert"/);
 assert.match(dialog,/onClick=\{closeDialog\}/);
 assert.doesNotMatch(dialog,/Boolean\(completeBlocked\)/);
 assert.match(dialog,/The server checks saved data when you confirm/);
 assert.match(dialog,/phases\.error && <p/);
 assert.match(route,/result\.data\.incompleteCount/);
});
