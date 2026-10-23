# Projects compact task UI patch

Base: `0445968/0011`, `bivi-dashboard-overhaul`, commit
`6a86e08a59bb839e0247007de17036ac9af98ba3`.
Do not apply to or deploy `restore` as part of this patch.

## Changes

- One collapsible task row; several tasks can remain open. Visited editors remain
  mounted across tab changes, grouping and filters to retain local notes/settings.
- Normal and advanced views use the same task editor and draft. Advanced switches
  to two columns; its milestone and project-level fields remain available below.
- Milestones show compact task rows. Opening a task switches to Tasks, clears all
  filters and focuses the task. No nested task editor inside milestone cards.
- Dependencies show the prerequisite's title, saved assignees and completion state.
- Empty member slots use a user-plus icon. Start uses Play; Due uses Flag; date
  picker buttons retain native date selection and keyboard entry.
- Responsibility has a proper label. The raw Service ID field is hidden, with its
  stored value preserved when saving other settings.
- Notes/comments/files use icon counters; priority is independently accessible.
  Save outcomes and errors remain visible when note/file details are collapsed.
- Create/assign reusable lowercase task tags in the task editor, remove them,
  filter the board by tag. Tag writes are audited and revision checked.
- Permanent human references supplement existing task IDs: IQ-001, PD-002, etc.
  The numeric sequence is project-wide, allocated when task controls are first
  saved, and never reused after deletion. Prefix uses the phase at that time.
  References remain unchanged if a task subsequently moves phase.
- Legacy reference numbering uses earliest task history, then saved body order
  where history is missing. This is a deterministic backfill, not a claim that
  every historical creation timestamp is known.
- Phases navigation becomes Lifecycle; existing URLs remain compatible.
- Shared Project panels/metrics use fewer borders. The main admin dashboard is
  not redesigned in this patch; Nexdo remains its subsequent layout reference.

## Apply

From a clean checkout of the base development branch (or reconcile newer changes):

```sh
git apply --check /path/to/bivi-projects-compact-ui.patch
git apply /path/to/bivi-projects-compact-ui.patch
npm ci
npm run typecheck
node --test tests/platform/task-presentation.test.mjs tests/platform/project-task-consolidation.test.mjs tests/platform/project-navigation-r5a.test.mjs tests/platform/task-productivity.test.mjs tests/platform/project-workplan-filters.test.mjs tests/platform/workplan-views.test.mjs
```

## Migration required

`supabase/migrations/20261023202200_project_task_presentation.sql`

Apply the migration to the intended linked Supabase development project before
running the updated app. It creates a staff-readable reference/tag table, backfills
references, installs the reference allocation trigger, and adds the audited tag RPC.
It does not rewrite task IDs, statuses, completion approvals or project bodies.
The patch itself does not apply migrations to a remote database. Direct migration
application is already authorized by the project owner; verify the linked target
and pending migration list before pushing. Do not expose migration credentials.

## Acceptance check before the next Projects phase

1. Expand two tasks; collapse one. Change the other task's title and save the work
   plan. Reload and confirm the saved title and Overview progress are unchanged
   except for the intended edit.
2. Type an unsaved task note, change grouping/filter or switch Tasks/Milestones and
   return. The note must still be present. Save it and check its count after reload.
3. Set a prerequisite and save settings. Confirm its name, assignees and status
   appear; Open task must take you to the prerequisite's highlighted task row.
4. Assign/unassign a member; confirm avatars or user-plus. Verify Start and Due
   pickers and saved dates. Change priority with note/file details collapsed and
   confirm visible success or failure feedback.
5. Create a tag, assign it to another task, filter by it and reload. Remove it from
   one task. In a second session, attempt a stale conflicting tag save; it must
   reject rather than overwrite. Check Activity for the tag change.
6. Confirm task references appear after save, remain unchanged after phase moves,
   and deleted task numbers are not reused. Unsaved tasks display Draft.
7. Switch normal/advanced views. All task settings must remain available without
   another page or a second copy of ownership controls. Check narrow screens and
   keyboard navigation; milestone rows should only navigate to task editing.
8. Check the existing Bivi/client completion, reasoned override and task deletion
   flows. This patch intentionally preserves their server validation.
9. Open Lifecycle through both the new label and an old `?tab=phases` link.

## Verification and limits

TypeScript passed. All 16 targeted regression tests passed after the final UI
changes. The new database regression was rerun after adding the inactive-project
lock check and passed again. The initial full platform run passed 193 of 196 tests;
its three failures were source assertions for intentionally removed labels and the
old Phases name. Those assertions were updated and passed in the targeted run.
The full suite was not repeated afterward.

The database test executes the full migration chain in PGlite and exercises
staff/client access, direct-write rejection, normalized tags, revision conflicts,
idempotent retry, audit history, immutable references, non-reuse after removal,
and the inactive-project lock. Focused lint has warnings but no errors.

Repository-wide lint reports existing errors in unrelated pages/components. No
production database migration or deployment was performed. Authenticated browser
acceptance, responsive visual review, and a real multi-session concurrency check
remain necessary in the running admin portal; they are not claimed by the SQL test.
