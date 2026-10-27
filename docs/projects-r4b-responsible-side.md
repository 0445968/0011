# Bivi Projects — R4b Responsible side & verified assignees (staff pilot)

Baseline: GitHub `0445968/0011`, branch `bivi-dashboard-overhaul`, after R4a commit `1fa66dec2d54760fe7ae90267c4d7e80d265a4e6`.

## What changes

- `project_task_members` stores 0–12 *verified* Bivi-staff or client-project members per task. A task has one authoritative **Responsible side** (Bivi or Client) in `project_task_controls.owner_type`.
- Staff choose responsible side and multiple assignees from a filtered picker. Bivi defaults to the signed-in staff user on switching sides. Client defaults to designated project managers, if any. The staff can override either default.
- Up to five client project managers can be designated by staff from active **project-access members who also belong to the project's client organization**. Users outside those boundaries cannot be assigned, even by sending a forged POST request.
- The picker shows the Bivi icon or a verified client-company logo, with profile pictures, names on hover and a multi-select dialog.
- Changes go to a single revision-checked RPC, never through direct table writes. All changes leave an actor/time/before/after event. The page does not reload.
- Existing *primary* Bivi task assignment remains in `project_task_controls.assigned_staff_id` for compatibility. All active Bivi assignees now appear in My Tasks from `project_task_members`.
- This migration backfills confirmed single Bivi assignees only. It does not guess client managers or derive identity from the old free-text task-owner label.

## Deliberately deferred

- Client self-service delegation and client-created tasks are implemented in R5c/R5d through staff-verified organization ownership, project access checks, audit history, and revision-checked database functions.
- Client task response choices (request clarification/postponement/modification, conditional decline with risk guidance), staff final approval, and notifications are later audited workflow patches.
- Changing responsibility in this pilot is distinct from the R2 work-plan draft Save All. Do not have dirty project edits while using the picker; finish Save All first.
- Existing `Lifecycle` task-owner selectors can edit the same single-assignee control. Concurrent edits will be rejected by revision checks; refresh the picker to reconcile. Phase approval and delivery gates stay unchanged.
- Project-wide avatar stack, milestone avatar rollups and the Activity feed will be reconciled to all multi-assignee records in the next Overview/activity integration patch. Existing Overview images still use the pre-R4b roster projection.

## Deployment and acceptance

1. Run `202610160034_project_multi_assignees.sql` in the Supabase SQL Editor (after migration 033).
2. Run TypeScript, platform tests, and production build locally.
3. Test Bivi/Client switching, default project managers, multi-selection, unrelated-company denial, completed-project lock, and concurrent changes (409).
4. Test profile-image privacy, task status editing, R2 drafts and Save All, and the legacy My Tasks primary-assignee view.
5. Keep production `restore` unchanged until the new assignments and client workflows are accepted.
