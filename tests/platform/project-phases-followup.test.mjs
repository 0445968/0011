import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('Phases owns formal state, color, breakdown and Lifecycle while Calendar remains a distinct route', () => {
  const sections = read('lib/admin/workspace/project-sections.ts');
  const page = read('app/admin/(workspace)/projects/[id]/page.tsx');
  const phases = read('components/admin/projects/ProjectPhasesPage.tsx');
  const board = read('components/admin/projects/ProjectMilestoneBoardV2.tsx');
  const calendar = read('components/admin/projects/ProjectCalendar.tsx');
  assert.match(sections, /phases/);
  assert.match(page, /requestedTab === 'lifecycle' \|\| legacyPhaseView/);
  assert.match(page, /requestedTab === 'calendar' && searchParams\.view === 'phases'/);
  assert.match(page, /tab === 'calendar'/);
  assert.match(phases, /<ProjectPhaseCards/);
  assert.match(phases, /<ProjectLifecycleControls/);
  assert.doesNotMatch(board, /ProjectPhaseCards/);
  assert.doesNotMatch(calendar, /ProjectLifecycleControls/);
});

test('one persisted per-project color source feeds Overview, Calendar and milestone indicators accessibly', () => {
  const migration = read('supabase/migrations/20261023120000_project_phase_colors.sql');
  const colors = read('lib/projects/phase-colors.ts');
  const overview = read('components/admin/projects/DirectoryIndicators.tsx');
  const calendar = read('components/admin/projects/ProjectCalendar.tsx');
  const board = read('components/admin/projects/ProjectMilestoneBoardV2.tsx');
  const cards = read('components/admin/projects/ProjectPhaseCards.tsx');
  assert.match(migration, /primary key \(request_id, phase\)/);
  assert.match(migration, /color ~ '\^#\[0-9A-Fa-f\]\{6\}\$'/);
  assert.match(migration, /project_phase_color_history/);
  assert.match(migration, /current_revision := coalesce\(current_revision, 0\);[\s\S]*current_revision <> p_revision/);
  assert.match(migration, /auth\.uid\(\) is null or not public\.is_inquiry_staff\(\)/);
  assert.match(colors, /DEFAULT_PROJECT_PHASE_COLOR = '#7C3AED'/);
  assert.match(colors, /activePhaseFill/);
  assert.match(colors, /phaseTextColor/);
  assert.match(overview, /aria-label=\{`\$\{projectPhaseLabels\[phase\]\}: \$\{status\}/);
  assert.match(overview, /group-focus-visible:block/);
  assert.match(calendar, /phaseColorFor\(phase,phaseColors\)/);
  assert.match(board, /phaseColorFor\(phase,phaseColors\.rows\)/);
  assert.match(cards, /Save color/);
  assert.match(cards, /Derived deadlines/);
  assert.match(cards, /Unassigned work/);
});
