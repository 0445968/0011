# R7A continuation — milestone saves, draft recovery, and phase feedback

## Confirmed findings

- Saving a newly completed milestone can be rejected by `project_sync_milestone_statuses()` with PostgreSQL SQLSTATE `23514` when a linked task or subtask is unfinished. The project API previously converted every such error to HTTP 409, and `ProjectWorkspace` treated every HTTP 409 as a revision conflict. The rejection therefore appeared as “Revision conflict or uncertain save” and disabled editing even though the transaction rejected the command.
- The completion trigger runs before the `inquiry_projects` row update is committed. Its exception rolls back the row update and all later task-control/history writes in `manage_inquiry_project`; a rejected completion does not advance the revision or add project audit history.
- `ProjectWorkspace` waited only for an active draft request. Its debounce timer was not canceled or included in that wait. A delayed autosave could therefore arrive after draft deletion and recreate the row. Discard also reset the editor from its in-memory baseline instead of fetching the latest saved project.
- Client task completion approval uses `staff_review_client_task_response()` and increments the canonical project revision. The response-review panel did not refresh the Project workspace. The work-plan editor could keep an old revision while the same browser advanced the saved project. The response panel now waits for a clean work-plan editor; a successful response revalidates the server view, and recoverable drafts are reconciled by baseline/draft/latest three-way comparison.
- The milestone trigger previously did not inspect child subtasks or fail closed when an existing saved task had no control row. The new trigger checks both. It accepts a candidate that completes required task rows and the milestone in one Save All command, while still enforcing dependencies and client completion approval.
- The Overview phase display was task activity derived from task controls, not formal `project_phase_states`. Overview now reads formal saved phase states and labels task activity and task completion separately.

## Remaining verification limits

The repository owner reports that the migration was applied to the connected `0011` project. The connected project’s schema and deployed function have not been independently re-read for this continuation. The database trigger, grants, RLS, and RPC behavior remain pending post-application read-only verification. The PGlite tests execute repository SQL against isolated test fixtures; they do not establish live database state.

## Migration

`supabase/migrations/20261022130000_r7a_milestone_draft_reconciliation.sql`.

It is ordered after `20261022120000_r7a_phase_completion_integrity.sql` and depends on the project work-plan tables/RPC (006 and 014), hierarchy/subtask tables (012/032/038), task-response tables/RPC (036), phase status tables/RPC (035/037/038), and work-plan drafts (031). It is transactional but intentionally not a blind re-run script. Do not rerun it if any of its objects or function replacements have already been applied manually.

The migration adds a saved baseline column to private work-plan drafts and a per-staff generation tombstone. It backfills old draft baselines only when history contains the exact base revision; if that exact snapshot is absent, it preserves the draft and requires export or explicit discard instead of guessing an older baseline. It removes direct authenticated draft table write grants and routes draft saves/deletes through staff-checked, generation-locked `SECURITY DEFINER` RPCs. Draft discard returns the current project body and revision while holding the project row lock, pairing the confirmed delete with the baseline the editor adopts. Staff-self draft reads remain RLS protected. It adds bounded draft validation and replaces milestone/subtask guards and the task-response approval function. Project bodies, draft contents, task/subtask rows, milestones, phase states and audit history are not deleted. New milestone completion checks can reject previously accepted invalid transitions; no child task, milestone, phase, or project is automatically completed.

The function changes are transactional. Do not roll back by dropping the generation table or column after deployment: that would remove protection against delayed draft writes. Any rollback should restore the corresponding prior RPC/trigger definitions while preserving private draft rows and generation state.

### Execution and verification record

- **Execution status:** The repository owner reports that the migration has been applied to the connected `0011` project. This reflects that report and is not an independent live-database verification.
- **Migration ledger:** No ledger entry has been created or claimed. The earlier repository record for the previous R7A phase migration is separate from this new migration.
- **Live object and permission checks:** Pending read-only verification after application.
- **Remote behavior checks:** Not run; no mutating RPCs were invoked against Supabase.

## Staff acceptance steps after applying the migration

1. Open a project in Tasks & Milestones. Mark a milestone Completed while a linked task is unfinished. The confirmation lists the task, provides a task link, and keeps the milestone unchanged until blockers are fixed. Cancel and continue editing.
2. Mark the task completed in the same work-plan draft, then complete the milestone and choose Save All once. Expect a saved confirmation and the canonical milestone/task states after refresh.
3. Leave a linked subtask unfinished and try milestone completion. Expect its name in the blocker list. Complete the subtask and retry. Repeat with an unresolved dependency and a client-owned task awaiting staff approval; the server must reject each without changing revision/history.
4. In a second staff session, save a conflicting project-body field. Return to the first session and save. Nonconflicting edits merge; same-field conflicts show both values and require an explicit choice. The draft remains exportable until resolved or discarded.
5. Make a work-plan edit and immediately choose Discard changes. Expect the latest saved project to load and the private draft to disappear. Repeat with a delayed network request; a stale autosave must not recreate the draft.
6. Save a client completion approval from the same browser while the work-plan editor is clean. The editor revalidates at the new project revision. With a dirty work-plan draft, the approval action is disabled until the draft is saved or discarded.
7. In Phases, activate two phases. Save one status change and verify its persistent per-phase saved confirmation appears without using Save All. Open Overview and verify both formal phase states there; completed states show a check. Task activity and task completion remain separately labeled.
8. Simulate a failed post-save refresh. The UI must report the project save as successful with a refresh warning. Simulate a lost save response; the editor must check the authoritative saved body before allowing another attempt.

Automated checks cover the migration trigger and draft RPCs in PGlite, validation/conflict outcome classification, three-way body merging, generation fencing, and independent phase status behavior. They do not replace the live checks above.
