import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd(), false, { info() {}, error() {} });

const fixtureId = '00000000-0000-4000-8000-000000000001';
const foreignOrigin = 'https://bivi-verification.invalid';

function normalizedOrigin(value, { allowHttp = false } = {}) {
  const url = new URL(value);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.hostname.endsWith('.localhost');
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/' ||
    (url.protocol !== 'https:' && !(allowHttp && local && url.protocol === 'http:'))
  ) {
    throw new Error('invalid_origin');
  }
  return url.origin;
}

function derivedOrigins(rawPublic, allowHttp) {
  const publicOrigin = normalizedOrigin(
    rawPublic || process.env.INQUIRY_APP_URL || 'https://bivi.pro',
    { allowHttp }
  );
  const publicUrl = new URL(publicOrigin);

  const defaultClient = publicUrl.hostname === 'bivi.pro'
    ? 'https://app.bivi.pro'
    : `${publicUrl.protocol}//app.${publicUrl.host}`;
  const defaultStaff = publicUrl.hostname === 'bivi.pro'
    ? 'https://staff.bivi.pro'
    : `${publicUrl.protocol}//staff.${publicUrl.host}`;

  return {
    publicOrigin,
    clientOrigin: normalizedOrigin(process.env.NEXT_PUBLIC_BIVI_APP_URL || defaultClient, { allowHttp }),
    staffOrigin: normalizedOrigin(process.env.NEXT_PUBLIC_BIVI_STAFF_URL || defaultStaff, { allowHttp }),
  };
}

function redirectCase(label, fromOrigin, path, toOrigin, toPath, search = '') {
  return { label, origin: fromOrigin, path: `${path}${search}`, status: 307, redirectOrigin: toOrigin, redirectPath: toPath, redirectSearch: search };
}

export function launchCases(origins) {
  const { publicOrigin, clientOrigin, staffOrigin } = origins;
  return [
    { label: 'Public homepage', origin: publicOrigin, path: '/', status: 200, html: true },
    { label: 'Public intake', origin: publicOrigin, path: '/get-started', status: 200, html: true },
    redirectCase('Public login enters client app', publicOrigin, '/login', clientOrigin, '/login', '?source=launch-check'),
    redirectCase('Legacy public client path enters client app', publicOrigin, '/client', clientOrigin, '/'),
    redirectCase('Legacy public staff path enters staff app', publicOrigin, '/admin', staffOrigin, '/'),

    { label: 'Client login', origin: clientOrigin, path: '/login', status: 200, html: true, login: true },
    { label: 'Client recovery', origin: clientOrigin, path: '/recover', status: 200, html: true },
    { label: 'Client dashboard requires authentication', origin: clientOrigin, path: '/', status: 307, redirectOrigin: clientOrigin, redirectPath: '/client/login' },
    { label: 'Client project requires authentication', origin: clientOrigin, path: `/projects/${fixtureId}`, status: 307, redirectOrigin: clientOrigin, redirectPath: '/client/login' },
    redirectCase('Client surface rejects staff paths', clientOrigin, '/admin', staffOrigin, '/'),
    redirectCase('Client surface returns marketing pages to public site', clientOrigin, '/about', publicOrigin, '/about'),

    { label: 'Staff login', origin: staffOrigin, path: '/login', status: 200, html: true, login: true },
    { label: 'Staff dashboard requires authentication', origin: staffOrigin, path: '/', status: 307, redirectOrigin: staffOrigin, redirectPath: '/admin/login' },
    { label: 'Staff projects require authentication', origin: staffOrigin, path: '/projects', status: 307, redirectOrigin: staffOrigin, redirectPath: '/admin/login' },
    redirectCase('Staff surface rejects client paths', staffOrigin, '/client', clientOrigin, '/'),
    redirectCase('Staff surface returns marketing pages to public site', staffOrigin, '/about', publicOrigin, '/about'),

    { label: 'Communication cron rejects anonymous calls', origin: publicOrigin, path: '/api/cron/communications', status: 401, jsonError: true, noStore: true },
    { label: 'Public surface hides staff APIs', origin: publicOrigin, path: '/api/admin/session', method: 'POST', status: 404, noStore: true },
    { label: 'Public surface hides client APIs', origin: publicOrigin, path: '/api/client/session', method: 'POST', status: 404, noStore: true },
    { label: 'Staff API rejects foreign origin', origin: staffOrigin, path: `/api/admin/projects/${fixtureId}`, method: 'POST', requestOrigin: foreignOrigin, status: 403, jsonError: true, noStore: true },
    { label: 'Client API rejects foreign origin', origin: clientOrigin, path: `/api/client/projects/${fixtureId}/tasks`, method: 'POST', requestOrigin: foreignOrigin, status: 403, jsonError: true, noStore: true },
  ];
}

export async function verifyLaunch(origins, { fetchImpl = fetch, log = console.log } = {}) {
  const results = [];

  for (const entry of launchCases(origins)) {
    let reason = '';
    try {
      const url = new URL(entry.path, entry.origin);
      const method = entry.method || 'GET';
      const headers = {};
      if (method !== 'GET') {
        headers['Content-Type'] = 'application/json';
        headers.Origin = entry.requestOrigin || entry.origin;
      }
      const response = await fetchImpl(url, {
        method,
        redirect: 'manual',
        credentials: 'omit',
        cache: 'no-store',
        headers,
        ...(method !== 'GET' ? { body: '{}' } : {}),
        signal: AbortSignal.timeout(15000),
      });
      const body = await response.text();

      if (response.status !== entry.status) {
        reason = `expected HTTP ${entry.status}, received ${response.status}`;
      } else if (entry.redirectOrigin) {
        const location = response.headers.get('location');
        const target = location ? new URL(location, entry.origin) : null;
        if (
          !target ||
          target.origin !== entry.redirectOrigin ||
          target.pathname !== entry.redirectPath ||
          (entry.redirectSearch !== undefined && target.search !== entry.redirectSearch)
        ) {
          reason = `expected redirect to ${entry.redirectOrigin}${entry.redirectPath}${entry.redirectSearch || ''}`;
        }
      } else if (entry.html) {
        if (!response.headers.get('content-type')?.includes('text/html')) {
          reason = 'expected HTML response';
        } else if (entry.login && !/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(body)) {
          reason = 'expected login page to be noindex';
        }
      } else if (entry.jsonError) {
        if (!response.headers.get('content-type')?.includes('application/json')) {
          reason = 'expected JSON error response';
        } else {
          let payload;
          try { payload = JSON.parse(body); } catch { reason = 'invalid JSON response'; }
          if (!reason && (!payload || typeof payload.error !== 'string')) reason = 'expected JSON error payload';
        }
      }

      if (!reason && entry.noStore && !response.headers.get('cache-control')?.includes('no-store')) {
        reason = 'error response must not be cached';
      }
    } catch {
      reason = 'request failed or timed out';
    }

    const result = { label: entry.label, passed: !reason, ...(reason ? { reason } : {}) };
    results.push(result);
    log(`${result.passed ? 'PASS' : 'FAIL'} ${entry.label}${reason ? `: ${reason}` : ''}`);
  }

  const failed = results.filter((result) => !result.passed).length;
  log(`Launch surface checks: ${results.length - failed}/${results.length} passed across public, client and staff domains.`);
  return { passed: failed === 0, results };
}

async function main() {
  const args = process.argv.slice(2);
  const allowHttp = args.includes('--allow-http');
  const positionals = args.filter((arg) => !arg.startsWith('--'));
  if (args.some((arg) => arg.startsWith('--') && arg !== '--allow-http') || positionals.length > 1) {
    console.error('Usage: npm run verify:launch -- [https://bivi.pro]\nLocal: npm run verify:launch -- http://localhost:3001 --allow-http');
    process.exitCode = 1;
    return;
  }

  let origins;
  try {
    origins = derivedOrigins(positionals[0], allowHttp);
  } catch {
    console.error('Public, client and staff origins must be canonical HTTPS origins. Local HTTP requires --allow-http.');
    process.exitCode = 1;
    return;
  }

  const report = await verifyLaunch(origins);
  process.exitCode = report.passed ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
