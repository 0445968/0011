import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { createRequire } from 'node:module';

const source = fs.readFileSync(new URL('../../lib/admin/workspace/navigation.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const module = { exports: {} };
new Function('module', 'exports', 'require', js)(module, module.exports, createRequire(import.meta.url));
const nav = module.exports;
const id = 'a0000000-0000-4000-8000-000000000001';

const hookSource = fs.readFileSync(new URL('../../components/admin/workspace/useStaffWorkspaceTabs.ts', import.meta.url), 'utf8');
const hookJs = ts.transpileModule(hookSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const hookModule = { exports: {} };
new Function('module', 'exports', 'require', hookJs)(hookModule, hookModule.exports, name => name.includes('/navigation') ? nav : {});
const state = hookModule.exports;
const tab = (kind = 'project', extra = {}) => ({ key: `${kind}:${id}`, id, kind, title: 'Lumen', href: `/projects/${id}?tab=brief`, pinned: false, lastOpenedAt: 1, ...extra });

test('only implemented destinations are live and middleware rewrites the same routes', () => {
  assert.deepEqual(nav.liveStaffDestinations.map(item => item.id), ['dashboard', 'inquiries', 'people', 'companies', 'projects']);
  for (const item of nav.liveStaffDestinations) {
    assert.equal(nav.staffInternalPath(item.href), item.href === '/' ? '/admin' : `/admin${item.href}`);
    assert.equal(item.permission, 'staff');
  }
  for (const item of nav.staffDestinations.filter(item => item.status !== 'existing')) assert.equal(nav.staffInternalPath(item.href), null);
  assert.equal(nav.staffInternalPath(`/leads/${id}/proposals`), `/admin/leads/${id}/proposals`);
});
test('all inquiry aliases, internal routes, sections and query strings share identity', () => {
  const expected = { key: `inquiry:${id}`, kind: 'inquiry', id, href: `/leads/${id}` };
  for (const route of [`/leads/${id}`, `/admin/leads/${id}/proposals`, `/inquiries/${id}?tab=overview`, `/leads/${id.toUpperCase()}`]) {
    assert.deepEqual(nav.getWorkspaceRecordFromPath(route), expected);
    assert.equal(nav.isStaffDestinationActive(route, '/inquiries'), true);
    assert.equal(nav.isStaffDestinationActive(route, '/projects'), false);
  }
});
test('directory boundaries and invalid record IDs cannot produce false active states', () => {
  for (const route of ['/projects/new', '/projects/not-a-uuid', '/projects', '/admin']) assert.equal(nav.getWorkspaceRecordFromPath(route), null);
  assert.equal(nav.isStaffDestinationActive('/projects-archive', '/projects'), false);
  assert.equal(nav.isStaffDestinationActive('/admin/projects', '/'), false);
  assert.equal(nav.isStaffDestinationActive('/admin/', '/'), true);
  assert.equal(nav.getWorkspaceRecordHref('lead', id), `/leads/${id}`);
});
test('planned navigation identifiers and paths are unique', () => {
  assert.equal(new Set(nav.staffDestinations.map(item => item.id)).size, nav.staffDestinations.length);
  assert.equal(new Set(nav.staffDestinations.map(item => item.href)).size, nav.staffDestinations.length);
  assert.ok(nav.staffDestinations.every(item => nav.staffGroups.some(group => group.id === item.subgroup)));
});

test('saved lead aliases deduplicate in tabs, bookmarks and recently closed records', () => {
  const lead = tab('lead', { href: `/admin/leads/${id}/proposals` });
  const inquiry = tab('inquiry', { href: `/leads/${id}/proposals` });
  globalThis.localStorage = { getItem: () => JSON.stringify({ tabs: [lead, inquiry], bookmarks: [lead, inquiry], recentlyClosed: [lead, inquiry] }) };
  const restored = state.restoreSnapshot('staff');
  for (const list of [restored.tabs, restored.bookmarks, restored.recentlyClosed]) {
    assert.equal(list.length, 1);
    assert.equal(list[0].key, `inquiry:${id}`);
    assert.equal(list[0].kind, 'inquiry');
  }
  assert.equal(restored.tabs[0].href, `/leads/${id}/proposals`);
  assert.equal(restored.bookmarks[0].href, `/leads/${id}`);
});
test('stored external URLs, cross-record URLs and unimplemented contact tabs are rejected', () => {
  for (const href of ['https://example.com', '//example.com', `/projects/a0000000-0000-4000-8000-000000000002`, '/projects\\example']) {
    globalThis.localStorage = { getItem: () => JSON.stringify({ tabs: [tab('project', { href })] }) };
    assert.equal(state.restoreSnapshot('staff').tabs[0].href, `/projects/${id}`);
  }
  globalThis.localStorage = { getItem: () => JSON.stringify({ tabs: [tab('contact')] }) };
  assert.equal(state.restoreSnapshot('staff').tabs.length, 0);
  globalThis.localStorage = { getItem: () => 'corrupted' };
  assert.deepEqual(state.restoreSnapshot('staff'), { tabs: [], bookmarks: [], recentlyClosed: [] });
});
test('tab limit preserves pinned records and keeps a newly visited active record', () => {
  const pinned = Array.from({ length: 30 }, (_, index) => tab('project', { key: String(index), pinned: true }));
  const active = tab('project', { key: 'active' });
  assert.deepEqual(state.limitTabs([...pinned, active]), [...pinned, active]);
  assert.deepEqual(state.limitTabs([tab('project', { key: 'old' }), ...pinned.slice(0, 29), active]).map(item => item.key), [...pinned.slice(0, 29), active].map(item => item.key));
});

test('drag order survives restoration and pinning never changes explicit order', () => {
  const items = [tab('project', { key: 'one', pinned: true }), tab('inquiry', { key: 'two' }), tab('project', { key: 'three' })];
  const reordered = nav.reorderWorkspaceTabs(items, 'three', 'one');
  assert.deepEqual(reordered.map(item => item.key), ['three', 'one', 'two']);
  assert.deepEqual(items.map(item => item.key), ['one', 'two', 'three']);
  assert.equal(reordered[1].pinned, true);
  assert.equal(nav.reorderWorkspaceTabs(items, 'missing', 'one'), items);
  assert.equal(nav.reorderWorkspaceTabs(items, 'one', 'one'), items);
  const secondId = 'a0000000-0000-4000-8000-000000000002';
  const actual = [tab('inquiry', { href: `/leads/${id}` }), tab('project', { id: secondId, key: `project:${secondId}`, href: `/projects/${secondId}`, pinned: true })];
  globalThis.localStorage = { getItem: () => JSON.stringify({ tabs: actual }) };
  assert.deepEqual(state.restoreSnapshot('staff').tabs.map(item => item.key), actual.map(item => item.key));
});

test('People routes use stable numeric contact IDs with at most nine digits', () => {
 for (const value of ['1','999999999','123456789']) {
  assert.deepEqual(nav.getWorkspaceRecordFromPath(`/people/${value}`), {key:`contact:${value}`,id:value,kind:'contact',href:`/people/${value}`});
  assert.equal(nav.isStaffDestinationActive(`/admin/people/${value}`, '/people'),true);
 }
 for (const value of ['0','012345678','1000000000','abc']) assert.equal(nav.getWorkspaceRecordFromPath(`/people/${value}`),null);
});

test('Company records participate in the same navigation identity and persistence contract',()=>{
 const record=nav.getWorkspaceRecordFromPath(`/admin/companies/${id}`);
 assert.deepEqual(record,{key:`company:${id}`,id,kind:'company',href:`/companies/${id}`});
 assert.equal(nav.isStaffDestinationActive(`/companies/${id}`,'/companies'),true);
 globalThis.localStorage={getItem:()=>JSON.stringify({tabs:[tab('company',{href:`/companies/${id}`})]})};
 assert.equal(state.restoreSnapshot('staff').tabs[0].kind,'company');
});
