import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');

test('R6 project calendar exposes all planned schedule views and saved source links', () => {
  const calendar = read('components/admin/projects/ProjectCalendar.tsx');
  const page = read('app/admin/(workspace)/projects/[id]/page.tsx');
  const sections = read('lib/admin/workspace/project-sections.ts');
  assert.match(calendar, /'day','week','month','timeline','phases'/);
  assert.match(calendar, /api\/admin\/projects\/\$\{id\}\/schedule/);
  assert.match(calendar, /ProjectLifecycleControls/);
  assert.match(calendar, /ProfileImage/);
  assert.match(calendar, /Task starts/);
  assert.match(read('components/admin/projects/ProjectMilestoneBoardV2.tsx'), /Suggested \{suggested\} priority/);
  assert.match(read('lib/tasks/data.ts'), /start_on:string\|null/);
  assert.match(read('lib/projects/activity-data.ts'), /start_date:'Task start date changed'/);
  assert.match(page, /canonicalRequestedTab = requestedTab === 'lifecycle' \? 'calendar'/);
  assert.match(sections, /id: 'calendar', label: 'Calendar', href: '\?tab=calendar'/);
});

test('task scheduling migration is additive, staff scoped, revision checked, and audited', () => {
  const sql = read('supabase/migrations/20261021120000_project_task_scheduling.sql');
  assert.match(sql, /create table public\.project_task_schedule/);
  assert.match(sql, /create table public\.project_task_schedule_history/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /public\.is_inquiry_staff\(\)/);
  assert.match(sql, /project\.revision<>p_project_revision/);
  assert.match(sql, /insert into public\.project_task_history/);
  assert.match(sql, /'task_start'/);
  assert.doesNotMatch(sql, /drop table|truncate|delete from public\./i);
});
