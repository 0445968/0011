import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');

test('R5a uses one record section configuration for the bar and View menu', () => {
  const config = read('lib/admin/workspace/project-sections.ts');
  const shell = read('components/admin/StaffWorkspaceShell.tsx');
  const menu = read('components/admin/workspace/WorkspaceMenuBar.tsx');
  for (const id of ['overview','plan','lifecycle','brief','delivery','files','discussion','access','publishing']) {
    assert.match(config, new RegExp(`id: '${id}'`));
  }
  assert.match(config, /id: 'activity', label: 'Activity', href: '\/activity'/);
  assert.match(config, /id: 'calendar', label: 'Calendar', href: null/);
  assert.match(shell, /projectRecordSections\.map/);
  assert.match(menu, /projectRecordSections\.map/);
  assert.match(shell, /projectSectionHref\(base, section\)/);
  assert.match(menu, /projectSectionHref\(projectBase, section\)/);
});

test('R5a removes duplicate Overview areas and moves record to Publishing', () => {
  const overview = read('components/admin/projects/ProjectOverview.tsx');
  const publishing = read('app/admin/(workspace)/projects/[id]/publish/page.tsx');
  assert.doesNotMatch(overview, /title="Project areas"/);
  assert.doesNotMatch(overview, /title="Project record"/);
  assert.match(overview, /xl:order-1/);
  assert.match(overview, /xl:order-2/);
  assert.match(publishing, /aria-label="Project record"/);
  assert.match(publishing, /Source inquiry/);
});
