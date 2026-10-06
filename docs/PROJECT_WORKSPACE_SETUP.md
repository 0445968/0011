# Project workspace setup

Requires all previous Bivi batches and migrations 001–005, including the onboarding gate and client onboarding patches. No new environment variables are required. The latest proposal workspace design remains intact.

## Install

1. Run `git apply --check Bivi-Project-Workspace.patch`, then `git apply Bivi-Project-Workspace.patch` in your repository after applying the earlier patches.
2. Apply only `supabase/migrations/202610060006_project_workspace.sql` to the same Supabase project. Do not rerun earlier migrations.
3. Restart the application and sign in as active staff. Open a completed onboarding record and follow **Open project workspace / activation**.
4. Confirm activation. The database checks that the inquiry is qualified, the same scope version is accepted, the agreement/deposit gate is ready, and onboarding is complete against that exact current readiness revision.

Activation creates one project per inquiry. It saves fixed copies of the accepted scope, readiness evidence and onboarding body, plus their version/revision references and the activating staff member. Retrying activation cannot create a duplicate. Editing the project work plan does not change these snapshots or the accepted proposal.

## Plan and track work

Open **Projects** in workspace navigation to see activated projects, filter Active / On hold / Completed, and review saved task progress. The list displays 25 projects per page, newest updates first.

Set a project owner and internal notes. Add up to 20 milestones and 100 tasks, with titles, due dates, owners and task notes. Owners are names for assignment records; this version does not send notifications or grant account access. Tasks can link to milestones. Reassign linked tasks before removing a milestone.

Task statuses: To do, In progress, Blocked and Done. Milestone statuses: Planned, In progress and Done. Progress is completed tasks divided by total tasks; it is not an estimate of hours, fees or milestone weighting. No tasks means 0%. Due dates are calendar dates; overdue labels use the current UTC date. Changes remain local until **Save project** succeeds.

## Project decisions

Save edits before changing project state. Every state change requires a reason or completion summary.

- **Place project on hold:** available from Active, including when prerequisites need correction.
- **Resume project:** available from On hold after current prerequisites are verified again.
- **Complete project:** available from Active when at least one task exists, all tasks and milestones are Done, and current prerequisites pass.
- **Reopen project on hold:** available from Completed for corrections; review the work plan and prerequisites before resuming.

Completed work plans are locked. Work-plan records may be saved while a project is on hold or its prerequisites need review, so staff can record blockers and corrections. A changed prerequisite does not silently alter the stored project state; the detail view shows the prerequisite warning. Activation, resume and completion enforce the current gate in the database.

If the agreement/deposit gate changes, reopen/review/recomplete onboarding against its new revision before resuming or completing the project. The project's original activation snapshots remain fixed for historical reference.

The latest 50 history events are shown, including work-plan snapshots, decision reasons, actors and timestamps. Older events remain stored. Removing a task/milestone from the current plan does not erase its earlier saved snapshots. History is internal and does not send client messages.

## Permissions and validation

Only active staff can read projects/history or execute project commands. Anonymous/nonstaff users are excluded by RLS. Authenticated clients cannot directly insert, update or delete records. Commands serialize on the inquiry row, use expected revisions, and write the project plus its history atomically. Invalid dates, duplicate item IDs and orphan milestone references are rejected. Stale or uncertain requests require reloading.

Local validation covers TypeScript, production build using test Google Fonts responses, SQL permissions, activation prerequisites, stale revisions, immutable activation snapshots, milestone/task validation and lifecycle transitions. Production browser testing uses a local Supabase simulation. Real Supabase credentials were unavailable: verify activation, save and hold/resume in the configured environment before operational use.

Resources and Helpdesk remain outside the current roadmap. This batch is the internal project-management foundation. Client-facing progress, approvals/delivery handoff, file exchange and production rollout checks remain subsequent work.
