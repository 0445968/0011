# Repeatable production-readiness checks

Apply after the private file exchange patch. This batch adds verification tools; it does not change project data, publish a deployment or require a ninth migration. Resources and Helpdesk remain outside scope.

## Install and run local checks

From the repository root:

```sh
git apply --check Bivi-Production-Readiness.patch
git apply Bivi-Production-Readiness.patch
npm ci
npm run typecheck
npm run verify:platform
```

Use Node 20 or newer (your Node 24 setup works). `@electric-sql/pglite` is pinned as a development dependency. The database suite starts a fresh in-memory PostgreSQL-compatible database, applies migrations 001–008 and checks private intake, idempotency/rate limits, staff authorization, proposal immutability, readiness and onboarding gates, project decisions, client/viewer isolation, review version conflicts, file sharing/withdrawal, upload caps and expiry. A simulated Storage schema includes an intentionally broad old policy to verify that restrictive guards prevent unauthorized bucket access.

The suite runs without Supabase credentials and never connects to your hosted database. All records are test fixtures and are discarded. Additional tests verify that the configuration/deployment tools fail when keys are missing/exposed or endpoints do not enforce expected access boundaries.

## Check environment configuration

```sh
npm run verify:config
```

This loads production environment files through the existing Next environment loader, using the same checkout and supplied process environment. Run with the environment used by the deployment; having correct local values does not verify Vercel settings. The command checks Supabase origin, public and privileged key presence/separation, canonical application origin and accidental privileged key exposure through `NEXT_PUBLIC_` variables. Legacy JWT keys are checked for their declared role/expiry; decoding is not cryptographic verification. Newer key values are checked for configuration presence/exposure, not validity at Supabase. No key values are printed and no network calls are made.

Set `INQUIRY_APP_URL` to the canonical HTTPS application origin with no path, credentials, query or fragment. Preview environments need their own matching origin for writes. For deliberate local testing only, `npm run verify:config -- --local` permits HTTP localhost origins; all other configuration checks still apply. Missing values cause a nonzero exit rather than a green report.

Do not paste key values into chat or commit environment files. Verify the deployed environment's values in its existing settings.

## Check the deployed application

Replace the placeholder with the real canonical host:

```sh
npm run verify:deployment -- https://YOUR_CANONICAL_HOST
```

For local production-server checks, run `npm run build`, then `npm run start -- --port 3001` in one terminal, and:

```sh
npm run verify:deployment -- http://localhost:3001 --allow-http
```

The checker makes 40 requests: public intake/sign-in pages; unauthenticated staff/client page redirects; anonymous API denial; foreign-origin request denial; malformed sign-in-body rejection; no public intake read endpoint; JSON error shape and no-store headers. It sends no cookies or credentials, uses placeholder IDs and empty JSON bodies, and does not submit valid inquiries, sign in, upload, publish, review or modify data. It does not follow redirects automatically. Each failed/blocked request makes the final command exit nonzero.

Use a directly reachable deployment. Hosting-provider protection, a preview URL that redirects to production, or a mismatched canonical origin may cause failures before application checks complete. Run against the canonical origin; retain hosting access controls and use your existing authorized access process rather than disabling them to get a passing report.

The HTTP check does **not** verify active staff/client accounts, hosted RLS policies, actual bucket contents, signed-file bytes, upload CORS or Secure cookie behavior. Complete `docs/PRODUCTION_VERIFICATION.md` with separate real accounts and test files. Do not mark rollout complete based on an unauthenticated smoke test alone.

## Release evidence

Record the commit/deployment SHA, environment and date alongside the output of `verify:platform`, `verify:config` and `verify:deployment`. These commands print no credentials and return nonzero on failures. Review output before sharing logs from any other command. Use the existing release-record table in `PRODUCTION_VERIFICATION.md` for the remaining authenticated workflow and Storage results.

Implementation verification: platform/configuration/deployment-verifier tests passed; TypeScript passed; all 40 HTTP checks passed against the local production server. The application production build was previously verified with test Google Fonts responses. No real deployed endpoint or Supabase credentials were supplied for this batch, so live verification remains pending.
