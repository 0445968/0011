# R7A — Project phase status saving and closure integrity

## Finding

The phase status popover inherited the work-plan dirty flag and hierarchy sidecar loading state. Editing an ordinary task or milestone could therefore disable independent phase status changes. The UI also treated a successful RPC followed by a failed status refresh as a failed save, leaving the dialog open with a stale revision.

The existing completion RPC checked active tasks by joining task JSON to `project_task_controls`; task rows missing a control record were invisible to that check. It did not check unfinished `project_subtasks`. The migration below makes missing controls and unfinished subtasks explicit blockers. Existing staff authorization, project and phase row locks, revision checks, milestone completion checks, phase audit history, and authenticated-only RPC grant remain in place. Phases remain independent; closing one phase does not close another phase, a milestone, or the project.

## Migration

`supabase/migrations/20261022120000_r7a_phase_completion_integrity.sql` is the R7A SQL file, ordered after every migration currently in this branch, including `20261021120000_project_task_scheduling.sql`. It depends on the phase RPC/tables from migrations 035, 037, and 038; hierarchy/task tables from 012 and 032; and all earlier repository migrations in sequence. For the connected `0011` project, do not run it again: the execution record below verifies its installed RPC logic. For another environment, verify its migration history and prerequisites first, then apply only confirmed-pending migrations in repository order. R7A is additive at the schema/API level and replaces the existing RPC body; it performs no table, row, or history deletion and no data backfill. It retains existing staff-only authorization and phase audit behavior.

### Execution and verification record — 2026-10-21

- **Project identity:** Connected project `0011`, ref `xxnvekmbotzcyuhsyxbw`, is `ACTIVE_HEALTHY` and matches this repository (`0445968/0011`). The repository does not pin a Supabase project ref, so identity was matched by the connected project's name and this repository's remote. The other connected project is inactive and was not queried.
- **Execution status:** R7A is installed in the active database. Read-only inspection found the deployed `manage_project_phase_state(uuid,text,text,integer,text)` body contains the missing-control and unfinished-subtask blockers, staff authorization, phase revision comparison, and phase history insert. The phase state/history, task-control, subtask, and milestone-phase relations and the `phase_completion_evidence` constraint are present.
- **Migration ledger:** The connected Supabase migration-list tool returned an empty list; `supabase_migrations.schema_migrations` is absent in this database. This SQL Editor execution is therefore **verified from its resulting database objects and function body, not from a migration-ledger entry**. No ledger row has been fabricated. The repository file remains the reproducible migration record.
- **Permissions and RLS:** RLS is enabled on phase state/history, task controls, and subtasks. Each has a staff-only SELECT policy. Authenticated has SELECT but no direct INSERT/UPDATE/DELETE on those tables; anon has no SELECT. The RPC is `SECURITY DEFINER` with an empty `search_path`, requires an authenticated Bivi staff identity, is executable by `authenticated`, and is not executable by `anon`.
- **Compatibility and integrity:** The active database is PostgreSQL 17.11. The replacement uses the existing RPC signature/return type and schema columns. Its `CREATE OR REPLACE` preserves the existing function ACL. It adds no tables, constraints, backfills, or row changes; it preserves project/phase locks, stale-revision rejection, the completed-phase timestamp constraint, milestone/task checks, and audit insertion. No destructive SQL is present.
- **Rollback risk:** Replacing the function is reversible by restoring its prior definition from migration 038, but that would reintroduce the missing-control and unfinished-subtask gaps. No schema or data rollback was needed or run.
- **Behavior verification:** Read-only production checks confirmed the deployed function body and grants without invoking its mutating RPC. The platform PGlite test executes the repository RPC SQL against isolated PostgreSQL-compatible test data and covers independent phases, stale revisions, missing controls, unfinished subtasks, and audit insertion. A live phase transition was not invoked against real project data; staff UI acceptance below remains to be completed with the updated application code.
- **Supabase advisors:** The security advisor reports the expected generic warning that authenticated users can call `SECURITY DEFINER` RPCs, including this function; the RPC retains its explicit `auth.uid()` and staff check, and `anon` cannot execute it. The performance advisor reports existing unindexed actor/updated-by foreign keys on phase/task tables; this migration added no foreign keys or tables. No R7A-specific RLS or permission regression was reported by the read-only checks.

## Staff verification

1. Open a staff project, edit a task or milestone without using Save All, then open **Tasks & Milestones → Phases**. Change a phase to Active. The draft remains in the editor and the phase action saves independently.
2. Activate two phases. Verify both remain Active after navigating between other project views.
3. With an Active phase containing an unfinished linked milestone, confirm completion. Expect a specific milestone blocker in the dialog; no phase state changes.
4. Mark all linked milestones complete while leaving an associated task active or blocked. Confirm completion. Expect the active task blocker.
5. With tasks done but a linked subtask unfinished, confirm completion. Expect an unfinished subtask blocker. Mark the subtask done, refresh phase state and retry.
6. If a task control record is missing, confirm completion. Expect the missing-control count and instruction to Save All, refresh, and retry. Verify that Save All reconciles the task metadata.
7. In two staff sessions, update the same phase from both. The stale command must refresh the latest phase revision and present the current server error without overwriting the other change.
8. Simulate a lost POST response after the server saves. Refresh/reconcile must discover the desired status and close the dialog as saved. Simulate a successful POST with a failed GET: the UI must say the save succeeded, retain the returned revision locally, and offer a phase refresh.
9. Verify completing one phase does not change another phase, milestones, project status, lifecycle gates, or client approval state.

Automated checks cover state reconciliation and the migration RPC in an isolated PostgreSQL-compatible database. The production read-only inspection verifies the deployed implementation and security grants, but does not invoke a live phase transition.

The subsequent milestone-save and draft-reconciliation repair is documented separately in [R7A milestone save reconciliation](./projects-r7a-milestone-save-reconciliation.md); it has a distinct migration and execution status.
