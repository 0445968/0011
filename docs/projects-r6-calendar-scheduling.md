# Projects R6 — Calendar and task scheduling

R6 makes the existing project calendar the visible project Calendar section. Its day, week, month, timeline, and phase schedule views read saved task/milestone dates, phase links/statuses, and verified assignee roster data. Task due dates stay in the canonical project body, so changes continue to feed My Tasks, the staff Calendar, and the client task portal. The timeline adds a staff-managed task start date in a separate, revisioned sidecar table, surfaced in My Tasks and the staff Calendar. Suggested task priority follows saved start/due dates (low before 50% elapsed, medium from 50%, high from 75%); blocked tasks are treated as paused and overdue tasks are labeled overdue rather than assigned a suggestion.

The “Lifecycle, dependencies and approvals” controls now live on the project Phases page. Their RPCs, staff authorization, dependency checks, lifecycle records, and authoritative history remain intact. Existing `?tab=lifecycle` and `?tab=calendar&view=phases` URLs resolve to Phases. General Calendar navigation remains on Calendar.

## Migration

Apply `20261021120000_project_task_scheduling.sql` after all migrations already in the project migration history, including `20261020182923_project_client_ownership_delegation_tasks.sql` and `20261020182924_project_task_productivity.sql`.

The migration is additive. It creates staff-readable, RLS-protected schedule and history tables; schedule writes go through a staff-only RPC with project/schedule revision checks, date ordering validation, and task audit history. It extends `staff_calendar` with task start events. It does not alter or delete existing project dates or records. No task start dates are fabricated or backfilled.

After the SQL has been applied, verify it in the authenticated staff workspace by setting a task start date in Project Calendar and confirming it appears in the shared Calendar. Then verify due date edits from Tasks & Milestones appear in Project Calendar, My Tasks, and the client task view. Until the migration is confirmed applied, do not run database-dependent acceptance checks.

## Existing database checks still required

Confirm whether the R5c/d and R5e/f migrations are already present in the remote migration ledger. If absent, apply them in timestamp order before this migration:

1. `20261020182923_project_client_ownership_delegation_tasks.sql`
2. `20261020182924_project_task_productivity.sql`
3. `20261021120000_project_task_scheduling.sql`
