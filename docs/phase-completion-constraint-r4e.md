# R4e — Phase completion constraint and assignment cleanup hotfix

Base: `bivi-dashboard-overhaul` at `2b5713e23c947e306b01b8bd9067fc37e2b06b67` (R4d + hotfix).

## Cause and changes

- A database `CHECK` requires **both** `activated_at` and `completed_at` when a phase is Completed. The R4c/037 RPC attempted `INSERT ... ON CONFLICT DO UPDATE`, but its proposed `completed` row had `activated_at = NULL`, so it can fail constraint validation before updating the already-active row. **038** generates a valid proposed row while keeping all staff authorization, phase revision, unfinished milestone and active-work guards. No phase is automatically approved.
- React strict-mode cleanup called `controller.abort()` in `useProjectAssignments`, which could surface as an unhandled AbortError in Next.js. The hook now ignores obsolete loads with a generation counter and a local effect lifecycle flag, as already done in the phase-status hook.
- The phase API now logs PostgreSQL error details on the **server only** and gives the staff UI a short database error code and actionable migration hint if a failure persists. This does not expose database SQL statements to clients.

## Apply order

1. Apply the `.patch` to `bivi-dashboard-overhaul` after R4d and the earlier phase hotfix.
2. Run `npm run typecheck`, `npm run verify:platform`, `npm run build`.
3. Commit and push after successful validation.
4. Execute `202610160038_phase_completion_constraint_fix.sql` in the Supabase SQL Editor **after migration 037**. Never rerun earlier migrations that have already executed.
5. Reload Projects and test phase completion on a phase with no unfinished milestones or active tasks; verify that the popup closes and the completed state persists across reloads. Rapidly enter/leave the task editor to verify no unhandled assignment `AbortError`.

## Limits

The focused tests validate the guard text and the code paths, not a running Supabase database. If the phase still fails, share the returned `diagnosticCode` or the server console's `[project phase save]` entry. Do not paste secrets or user tokens.
