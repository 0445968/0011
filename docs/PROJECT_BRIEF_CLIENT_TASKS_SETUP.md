# Release 3B — Project brief and client tasks

This batch builds on Release 3A. It requires migrations 001–011 and the committed client profile/personalized onboarding code. No new environment variables are required.

## What this batch adds

- A nine-phase project lifecycle record separate from project state.
- Versioned project briefs with a staff draft and fixed client-review versions.
- A client-approved brief gate before moving beyond Discovery.
- Service-seeded project tasks at activation.
- Client/Bivi task ownership metadata without replacing the existing project task record.
- Simple task dependencies and blocker ownership.
- A sanitized client task view with a clear next action and Waiting on Client / Waiting on Bivi counts.
- Client task status updates for client-owned tasks only.
- Client project access before the first progress publication.
- Conservative backfill for existing projects: existing tasks remain Bivi-only until staff explicitly changes ownership.

The existing `inquiry_projects.body.tasks` array remains the source of truth for task title, due date, milestone, execution status and internal notes. Migration 012 adds `project_task_controls` only for lifecycle/visibility/dependency metadata; it does not create a competing task system.

## Install

1. Make sure the repository includes Release 3A and migration `202610100011_client_profile_personalized_onboarding.sql`.
2. Apply the code patch and run local checks:

   ```bash
   npm run typecheck
   npm run verify:platform
   npm run build
   ```

3. Apply **only** `supabase/migrations/202610110012_project_brief_client_tasks.sql` to the same Supabase project. Do not rerun migrations 001–011.
4. Redeploy the branch before testing browser flows so application code and database functions are on the same release.

## Staff verification

Use a test inquiry that has already passed the accepted-scope, readiness and personalized-onboarding gates.

1. Open the project workspace in `staff.bivi.pro` and activate the project.
2. Confirm activation creates:
   - the project work plan,
   - lifecycle phase **Discovery**,
   - service-derived Bivi/client tasks,
   - a project brief draft.
3. Confirm old/preexisting projects still load and their existing tasks are marked Bivi-owned by default.
4. In **Project lifecycle and client tasks**, verify you can change:
   - Bivi/client ownership,
   - lifecycle phase,
   - service association,
   - dependency,
   - blocker ownership.
5. Verify a task cannot depend on a missing task and cannot depend on itself.
6. Edit and save the generated project brief.
7. Issue the brief for client approval.
8. Confirm the Bivi “prepare brief” task becomes complete and the client brief-review task becomes available.
9. Attempt to advance the lifecycle beyond Discovery before approval. It must be rejected. If Bivi issues a newer brief version while still in Discovery, the newer version—not an older approval—must be approved before advancing.

## Client verification

Use an assigned client account. If testing approval, the account must have **Allow reviews** enabled.

1. Open `app.bivi.pro`.
2. Confirm an active project has an **Open project** action even before Bivi publishes a progress update.
3. Open the project and confirm:
   - current lifecycle phase is visible,
   - only client-owned tasks are exposed,
   - internal task notes are not exposed,
   - the next actionable client task is clear,
   - Waiting on Client / Waiting on Bivi counts are sensible.
4. Confirm a future-phase task cannot be updated early.
5. Confirm a task with an unfinished dependency cannot be completed.
6. Confirm a task with a Bivi/external blocker cannot be updated by the client.
7. Start and complete an ordinary client-owned task. Reload and confirm its state persists.
8. Save a client task note and confirm staff can see the note in task controls.
9. Review the fixed project brief version:
   - request changes with a required note,
   - confirm Bivi’s brief task reopens and the client brief task blocks,
   - have staff revise/reissue the brief,
   - approve the new version.
10. Confirm an approved brief allows staff to advance from Discovery to Direction.

## Isolation and safety checks

- Sign in as a different client and confirm the project cannot be opened.
- Confirm a viewer without review permission can read the brief but cannot approve or request changes.
- Confirm a client cannot see Bivi-owned tasks, internal project notes, task-control history or the editable brief draft.
- Revoke client access and confirm project/brief/task access disappears.
- Confirm direct table writes remain blocked for normal authenticated clients.

## Existing projects

Migration 012 backfills existing projects without attempting to infer which old tasks are safe for clients. Existing tasks become Bivi-owned in `project_task_controls`. Staff can explicitly change selected tasks to Client when appropriate.

Existing projects receive a brief draft seeded from the preserved accepted-scope snapshot. No historical client approval is invented.

## Expected next batch

Release 3C is **Approvals, Change Requests, QA & Handoff**. It should build on the lifecycle and versioned-brief foundations created here rather than adding another parallel workflow model.
