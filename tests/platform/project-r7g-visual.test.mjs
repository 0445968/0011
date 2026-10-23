import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');

test('R7G shared visual primitives stay within staff Projects surfaces', () => {
  const visuals = read('components/admin/projects/ProjectVisuals.tsx');
  const files = read('components/files/ProjectFiles.tsx');
  assert.match(visuals, /ProjectPageHeader/);
  assert.match(visuals, /ProjectMetric/);
  assert.match(visuals, /ProjectPanel/);
  assert.match(files, /staff\?'rounded-xl border border-border bg-card p-3':'rounded-2xl border border-border bg-card p-6'/);
  assert.match(files, /staff\?'mt-3 space-y-3':'mt-8 space-y-6'/);
});

test('R7G work plan keeps all columns and filters with responsive wrapping', () => {
  const toolbar = read('components/admin/projects/ProjectWorkplanToolbar.tsx');
  const board = read('components/admin/projects/ProjectMilestoneBoardV2.tsx');
  const workspace = read('components/admin/ProjectWorkspace.tsx');
  assert.match(toolbar, /\[1,2,3\] as const/);
  assert.match(toolbar, /aria-label=\{`\$\{value\} column/);
  for (const filter of ['Phase', 'Responsible side', 'Assignee', 'Status', 'Deadline']) assert.ok(toolbar.includes(`label="${filter}"`), `missing ${filter} filter`);
  assert.match(toolbar, /Clear filters/);
  assert.match(board, /break-words/);
  assert.match(board, /flex flex-wrap/);
  assert.match(workspace, /Advanced work-plan editor/);
  assert.match(workspace, /Back to tasks &amp; milestones/);
});

test('R7G month grids have navigation, event overflow and project/workspace calendar use', () => {
  const grid = read('components/admin/projects/CalendarMonthGrid.tsx');
  const workspace = read('app/admin/(workspace)/calendar/page.tsx');
  const project = read('components/admin/projects/ProjectCalendar.tsx');
  assert.match(grid, /role="grid"/);
  assert.match(grid, /\+\{extra.length\} more/);
  assert.match(grid, /View \{rows.length\} events/);
  assert.match(workspace, /Previous month/);
  assert.match(workspace, /Next month/);
  assert.match(workspace, />Today</);
  assert.match(workspace, /<CalendarMonthGrid/);
  assert.match(project, /<CalendarMonthGrid/);
});

test('R7G Brief owns editable project identity and verified owner controls', () => {
  const page = read('app/admin/(workspace)/projects/[id]/page.tsx');
  const identity = read('components/admin/projects/ProjectBriefIdentity.tsx');
  const workspace = read('components/admin/ProjectWorkspace.tsx');
  const rename = read('components/admin/projects/ProjectBriefRename.tsx');
  assert.match(page, /tab === 'brief'[\s\S]*ProjectBriefIdentity/);
  assert.match(identity, /ProjectOrganizationOwnerButton/);
  assert.match(identity, /ProjectBriefRename/);
  assert.match(rename, /expectedRevision:\s*revision/);
  assert.match(rename, /Saving…/);
  assert.doesNotMatch(page, /ProjectWorkspace titleOnly/);
  assert.match(workspace, /useProjectEditingController/);
});
