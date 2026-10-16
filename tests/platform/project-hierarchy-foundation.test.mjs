import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const sql = read('../../supabase/migrations/202610160032_project_hierarchy_foundation.sql');
const route = read('../../app/api/admin/projects/[id]/hierarchy/route.ts');
const schema = read('../../lib/projects/hierarchy-schema.ts');

test('R3a adds only normalized child records and never modifies the strict parent JSON schema', () => {
  for (const table of ['project_hierarchy_revisions','project_milestone_phases','project_subtasks','project_hierarchy_history']) {
    assert.match(sql, new RegExp(`create table public\\.${table}\\s*\\(`));
  }
  assert.doesNotMatch(sql, /alter table public\.inquiry_projects\s+add column/i);
  assert.match(sql, /primary key \(request_id, milestone_id, phase\)/);
  assert.match(sql, /check \(position between 0 and 49\)/);
});

test('hierarchy mutations require staff, both revisions, a locked source project, and an existing parent', () => {
  assert.match(sql, /auth\.uid\(\)/);
  assert.match(sql, /not public\.is_inquiry_staff\(\)/);
  assert.match(sql, /where request_id=p_request_id for update/);
  assert.match(sql, /project\.revision <>.*expectedProjectRevision/);
  assert.match(sql, /hierarchy\.revision <>.*expectedHierarchyRevision/);
  assert.match(sql, /jsonb_array_elements\(project\.body->'milestones'\)/);
  assert.match(sql, /jsonb_array_elements\(project\.body->'tasks'\)/);
  assert.match(sql, /project\.state = 'completed'/);
});

test('staff RLS is read-only, sidecar writes are RPC-only, and deleting a source parent prunes dependent data', () => {
  assert.match(sql, /revoke all on public\.project_hierarchy_revisions/);
  assert.match(sql, /grant select on public\.project_hierarchy_revisions/);
  assert.equal((sql.match(/for select to authenticated using/g) || []).length, 4);
  assert.match(sql, /security definer set search_path=''/);
  assert.match(sql, /create trigger prune_project_hierarchy_after_project_save/);
  assert.match(sql, /'prune_deleted_parents'/);
  assert.match(sql, /create table public\.project_hierarchy_history/);
});

test('route validates commands, blocks cross-origin writes, and explicitly paginates reads', () => {
  assert.match(route, /getStaffAccess\(\)/);
  assert.match(route, /isSameOrigin\(request\)/);
  assert.match(route, /projectHierarchyCommandSchema\.safeParse\(raw\)/);
  assert.match(route, /\.range\(offset, offset \+ 499\)/);
  assert.match(route, /data\?\.result === 'conflict'/);
  assert.match(schema, /z\.discriminatedUnion\('action'/);
  for (const action of ['set_milestone_phases', 'add_subtask', 'update_subtask', 'remove_subtask']) {
    assert.ok(schema.includes(`z.literal('${action}')`));
  }
});
