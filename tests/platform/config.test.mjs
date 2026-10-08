
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const script = fileURLToPath(
  new URL('../../scripts/verify-config.mjs', import.meta.url)
);

const valid = {
  SUPABASE_URL: 'https://database.example.invalid',
  SUPABASE_ANON_KEY: 'public-fixture-key',
  SUPABASE_SERVICE_ROLE_KEY: 'private-fixture-key',
  INQUIRY_APP_URL: 'https://site.example.invalid',
  NEXT_PUBLIC_BIVI_APP_URL: 'https://app.example.invalid',
  NEXT_PUBLIC_BIVI_STAFF_URL: 'https://staff.example.invalid',
};

function run(env, args = []) {
  const cwd = mkdtempSync(join(tmpdir(), 'bivi-config-'));

  try {
    return spawnSync(
      process.execPath,
      [script, ...args],
      {
        cwd,
        env: {
          PATH: process.env.PATH,
          ...env,
        },
        encoding: 'utf8',
        timeout: 15000,
      }
    );
  } finally {
    rmSync(cwd, {
      recursive: true,
      force: true,
    });
  }
}

test(
  'Configuration preflight validates keys, origins, isolation and public exposure',
  () => {
    // Valid production configuration.
    assert.equal(run(valid).status, 0);

    // Missing configuration.
    assert.notEqual(run({}).status, 0);

    assert.notEqual(
      run({
        ...valid,
        NEXT_PUBLIC_BIVI_APP_URL: '',
      }).status,
      0
    );

    assert.notEqual(
      run({
        ...valid,
        NEXT_PUBLIC_BIVI_STAFF_URL: '',
      }).status,
      0
    );

    // Insecure Supabase origin.
    assert.notEqual(
      run({
        ...valid,
        SUPABASE_URL: 'http://remote.example.invalid',
      }).status,
      0
    );

    // Invalid public website origin.
    assert.notEqual(
      run({
        ...valid,
        INQUIRY_APP_URL:
          'https://user:password@site.example.invalid',
      }).status,
      0
    );

    assert.notEqual(
      run({
        ...valid,
        INQUIRY_APP_URL:
          'https://site.example.invalid/path',
      }).status,
      0
    );

    // Invalid client and staff origins.
    assert.notEqual(
      run({
        ...valid,
        NEXT_PUBLIC_BIVI_APP_URL:
          'http://app.example.invalid',
      }).status,
      0
    );

    assert.notEqual(
      run({
        ...valid,
        NEXT_PUBLIC_BIVI_STAFF_URL:
          'https://staff.example.invalid/path',
      }).status,
      0
    );

    // Each application must have its own hostname.
    assert.notEqual(
      run({
        ...valid,
        NEXT_PUBLIC_BIVI_APP_URL:
          valid.INQUIRY_APP_URL,
      }).status,
      0
    );

    assert.notEqual(
      run({
        ...valid,
        NEXT_PUBLIC_BIVI_STAFF_URL:
          valid.NEXT_PUBLIC_BIVI_APP_URL,
      }).status,
      0
    );

    // Public and privileged keys must differ.
    assert.notEqual(
      run({
        ...valid,
        SUPABASE_ANON_KEY:
          valid.SUPABASE_SERVICE_ROLE_KEY,
      }).status,
      0
    );

    // Privileged credentials must never be public.
    const exposed = run({
      ...valid,
      NEXT_PUBLIC_BAD_KEY:
        valid.SUPABASE_SERVICE_ROLE_KEY,
    });

    assert.notEqual(exposed.status, 0);

    assert.ok(
      !exposed.stdout.includes(
        valid.SUPABASE_SERVICE_ROLE_KEY
      )
    );

    assert.ok(
      !exposed.stderr.includes(
        valid.SUPABASE_SERVICE_ROLE_KEY
      )
    );

    assert.notEqual(
      run({
        ...valid,
        NEXT_PUBLIC_OTHER_KEY: 'sb_secret_fixture',
      }).status,
      0
    );

    // HTTP localhost is disallowed in production mode.
    assert.notEqual(
      run({
        ...valid,
        INQUIRY_APP_URL: 'http://localhost:3001',
      }).status,
      0
    );

    // Local testing explicitly allows localhost origins.
    const local = {
      ...valid,
      INQUIRY_APP_URL: 'http://localhost:3001',
      NEXT_PUBLIC_BIVI_APP_URL:
        'http://app.localhost:3001',
      NEXT_PUBLIC_BIVI_STAFF_URL:
        'http://staff.localhost:3001',
    };

    assert.equal(
      run(local, ['--local']).status,
      0
    );

    assert.notEqual(
      run(local).status,
      0
    );
  }
);

test(
  'Configuration preflight rejects reversed roles and expired legacy JWTs',
  () => {
    function token(payload) {
      return (
        'eyJhbGciOiJIUzI1NiJ9.' +
        Buffer.from(
          JSON.stringify(payload)
        ).toString('base64url') +
        '.fixture'
      );
    }

    assert.notEqual(
      run({
        ...valid,
        SUPABASE_ANON_KEY: token({
          role: 'service_role',
        }),
      }).status,
      0
    );

    assert.notEqual(
      run({
        ...valid,
        NEXT_PUBLIC_UNUSED_KEY: token({
          role: 'service_role',
        }),
      }).status,
      0
    );

    assert.notEqual(
      run({
        ...valid,
        SUPABASE_SERVICE_ROLE_KEY: token({
          role: 'anon',
        }),
      }).status,
      0
    );

    assert.notEqual(
      run({
        ...valid,
        SUPABASE_ANON_KEY: token({
          role: 'anon',
          exp: 1,
        }),
      }).status,
      0
    );
  }
);
