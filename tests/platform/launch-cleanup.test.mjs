import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function source(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
}

test('unfinished Help and Resources entry points stay out of launch discovery', () => {
  const settings = source('components/layout/settings/SettingsPanel.tsx');
  const footer = source('components/layout/Footer.tsx');
  const search = source('data/search.ts');
  const utilitySearch = source('components/layout/navbar/NavbarUtilityPanel.tsx');
  const searchPage = source('app/search/page.tsx');

  assert.doesNotMatch(settings, /SupportSection/);
  assert.doesNotMatch(footer, /href:\s*['"]\/(?:guides|inspiration|resources|help)/);

  const order = search.match(/export const searchTypeOrder:[\s\S]*?=\s*\[([\s\S]*?)\];/);
  assert.ok(order, 'searchTypeOrder must remain declared');
  assert.doesNotMatch(order[1], /['"]resource['"]/);

  assert.doesNotMatch(utilitySearch, /Search projects, services, resources/i);
  assert.doesNotMatch(searchPage, /articles, resources, and services/i);
  for (const surface of ['help', 'resources', 'guides', 'inspiration']) {
    const layout = source(`app/${surface}/layout.tsx`);
    assert.match(layout, /index:\s*false/);
    assert.match(layout, /follow:\s*false/);
  }
});
