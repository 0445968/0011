import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {launchCases, verifyLaunch} from '../../scripts/verify-launch.mjs';

const origins = {publicOrigin: 'https://bivi.test', clientOrigin: 'https://app.bivi.test', staffOrigin: 'https://staff.bivi.test'};
const cases = launchCases(origins);

function expected(input, init) {
  const url = new URL(input);
  const entry = cases.find(item => item.origin === url.origin && item.path === url.pathname + url.search && (item.method || 'GET') === init.method && (!item.method || (item.requestOrigin || item.origin) === init.headers.Origin));
  assert.ok(entry, `unexpected probe: ${init.method} ${url}`);
  return entry;
}

function response(entry) {
  if (entry.redirectOrigin) return new Response(null, {status: entry.status, headers: {location: entry.redirectOrigin + entry.redirectPath + (entry.redirectSearch || '')}});
  if (entry.jsonError) return Response.json({error: 'Denied'}, {status: entry.status, headers: {'cache-control': 'no-store'}});
  return new Response('<html><meta name="robots" content="noindex"><input type="password"></html>', {status: entry.status, headers: {'content-type': 'text/html', ...(entry.noStore ? {'cache-control': 'no-store'} : {})}});
}

test('launch probes cover every implemented directory and keep anonymous writes harmless', () => {
  const source = fs.readFileSync(new URL('../../lib/admin/workspace/navigation.ts', import.meta.url), 'utf8');
  const js = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText;
  const module = {exports: {}};
  new Function('module', 'exports', js)(module, module.exports);
  for (const item of module.exports.liveStaffDestinations) {
    assert.ok(cases.some(entry => entry.origin === origins.staffOrigin && entry.path === item.href && entry.status === 307 && entry.redirectPath === '/admin/login'), item.href);
  }
  const identities = cases.map(entry => [entry.origin, entry.path, entry.method || 'GET', entry.requestOrigin || ''].join('|'));
  assert.equal(new Set(identities).size, identities.length, 'each probe has a distinct request');
  for (const entry of cases.filter(entry => entry.method)) assert.ok(entry.status >= 400, 'no probe expects a successful write');
  for (const path of ['/api/admin/people', '/api/admin/companies', '/api/admin/notifications']) {
    for (const origin of [origins.publicOrigin, origins.clientOrigin]) assert.ok(cases.some(entry => entry.path === path && entry.origin === origin && entry.status === 404));
  }
});

test('launch verification checks all surfaces without cookies or redirect following', async () => {
  let calls = 0;
  const report = await verifyLaunch(origins, {log() {}, fetchImpl: async (input, init) => {
    calls++;
    assert.equal(init.credentials, 'omit');
    assert.equal(init.redirect, 'manual');
    assert.equal(init.cache, 'no-store');
    assert.equal(init.headers.Cookie, undefined);
    assert.ok(init.signal instanceof AbortSignal);
    if (init.method !== 'GET') assert.equal(init.body, '{}');
    return response(expected(input, init));
  }});
  assert.equal(report.passed, true);
  assert.equal(calls, cases.length);
});

test('launch verification rejects missing auth, wrong redirects, private fields, and cacheable errors', async () => {
  const failures = [
    [entry => entry.path === '/settings', () => new Response('Public page'), 'expected HTTP 307, received 200'],
    [entry => entry.path === '/settings', () => new Response(null, {status: 307, headers: {location: 'https://unrelated.test/admin/login'}}), 'expected redirect'],
    [entry => entry.path === '/api/admin/notifications' && entry.status === 401 && !entry.method, () => Response.json({error: 'Denied', rows: [{secret: true}]}, {status: 401, headers: {'cache-control': 'no-store'}}), 'expected an error-only response'],
    [entry => entry.path === '/api/admin/notifications' && entry.status === 401 && !entry.method, () => Response.json({error: 'Denied'}, {status: 401}), 'error response must not be cached'],
    [entry => entry.origin === origins.clientOrigin && entry.path === '/login', () => new Response('<meta name="robots" content="noindex">', {headers: {'content-type': 'text/html'}}), 'expected password sign-in form'],
  ];
  for (const [matches, invalid, reason] of failures) {
    const report = await verifyLaunch(origins, {log() {}, fetchImpl: async (input, init) => {
      const entry = expected(input, init);
      return matches(entry) ? invalid() : response(entry);
    }});
    assert.equal(report.passed, false);
    assert.ok(report.results.some(result => result.reason?.startsWith(reason)), reason);
  }
});

test('launch verification reports network failures and continues checking remaining routes', async () => {
  let calls = 0;
  const report = await verifyLaunch(origins, {log() {}, fetchImpl: async () => {calls++; throw new Error('network unavailable');}});
  assert.equal(report.passed, false);
  assert.equal(calls, cases.length);
  assert.ok(report.results.every(result => result.reason === 'request failed or timed out'));
});
