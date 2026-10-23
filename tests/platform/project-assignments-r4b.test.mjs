import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../../supabase/migrations/202610160034_project_multi_assignees.sql', import.meta.url), 'utf8');
const route = readFileSync(new URL('../../app/api/admin/projects/[id]/assignees/route.ts', import.meta.url), 'utf8');
const board = readFileSync(new URL('../../components/admin/projects/ProjectMilestoneBoardV2.tsx', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../../components/admin/projects/ProjectAssignments.tsx', import.meta.url), 'utf8');

test('staff RLS, private management, company eligibility and audit are explicit', () => {
  assert.match(sql, /enable row level security/g);
  assert.match(sql, /public\.is_inquiry_staff\(\)/);
  assert.match(sql, /project_client_member_eligible/);
  assert.match(sql, /create table public\.project_assignment_events/);
  assert.match(sql, /revoke all on public\.project_task_members/);
  assert.match(sql, /where pc\.request_id=p_request and pc\.user_id=p_user and pc\.active/);
  assert.match(sql, /client_organization_members/);
  assert.match(sql, /if c\.revision<>p_revision/);
  assert.match(sql, /from public\.project_task_controls where request_id=p_request and task_id=p_task_id for update/);
});

test('existing primary Bivi assignee is preserved while multi-assignees are stored', () => {
  assert.match(sql, /assigned_staff_id=case when p_side='bivi' then p_user_ids\[1\] else null end/);
  assert.match(sql, /insert into public\.project_task_members/);
  assert.match(sql, /from public\.project_task_controls c join public\.inquiry_staff s/);
});

test('project picker remains staff-only, revision-checked, and no-reload', () => {
  assert.match(route, /getStaffAccess/);
  assert.match(route, /isSameOrigin/);
  assert.match(route, /projectAssignmentCommandSchema/);
  assert.match(route, /expectedRevision/);
  assert.doesNotMatch(ui, /window\.location\.reload/);
  assert.match(ui, /data\.managers/);
  assert.match(ui, /currentStaffId/);
  assert.match(board, /TaskMemberPicker/);
  assert.match(board, /ProjectManagersButton/);
});
