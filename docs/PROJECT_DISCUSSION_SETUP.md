# Project discussion and activity

Requires the private file exchange and production readiness batches, with migrations 001–008 already applied.

## Install

1. Run `git apply --check Bivi-Project-Discussion.patch`, then `git apply Bivi-Project-Discussion.patch`.
2. Apply only `supabase/migrations/202610070009_project_discussion.sql` in the same Supabase project. Do not rerun earlier migrations. The activity view uses PostgreSQL 15+ security-invoker support, as the existing portal does.
3. Restart the application. Open an activated project and choose **Discussion and activity**.
4. Run `npm run typecheck` and `npm run verify:platform`. The HTTP verifier now checks the discussion page and comments API as well: 43 checks total.

## Staff comments

Choose Whole project or a saved task. Comments accept 1–4,000 characters of plain text. Unsaved tasks do not appear; save the work plan first. Use the task links to filter discussion. Each view displays 25 comments per page; removed entries remain as placeholders.

All active staff can read internal comments. Only the author can edit or remove their own comment. Clients, viewers and inactive staff cannot read comments or their history. These comments do not appear in the client portal or trigger email/notifications. Staff accounts retain the existing workspace-wide access model.

A task title is recorded when its comment is created. If the task is renamed or removed, earlier comments retain that title and removed tasks receive a label. Removing a task does not delete its discussion. Staff can discuss active, held or completed projects; comments do not change task status, project scope or completion gates.

New comments are bound to the saved project revision; edits/removals use a comment revision. If another update wins, reload before continuing. Creation uses a fixed comment UUID for retries of the same submitted text/subject, avoiding duplicate records after an uncertain response. Edits/removals cannot overwrite a newer revision. Removing a comment clears its current text and retains staff-only history, including prior versions. It is not permanent erasure and there is no restore button in this batch.

Each project supports 1,000 comments including removed entries. Administrators can read `project_comment_history` for the original text, revisions, actors and timestamps under the existing trusted access process. Authenticated users cannot write comment/history tables directly.

## Unified activity

The staff-only timeline combines project decisions/saves, readiness/onboarding history, file actions, publication/withdrawal events, client review decisions and comment actions for the same inquiry/project UUID. It is ordered newest first, with a stable event ID tie-breaker, and shows 25 records per page. Times are UTC.

The feed includes earlier records already stored by these workflows. It does not reconstruct events that were never recorded, log every field change separately, send reminders or change client visibility. Comment text is shown in the discussion, while the feed identifies the comment action and subject. Existing workflow-specific histories remain available.

## Verification

Local checks cover migration 009; author-only editing/removal; direct-write denial; client/anonymous/revoked-staff isolation; idempotent creation; stale project/comment revisions; removed-task context; retained comment history; and the unified feed. Browser checks use simulated Supabase authentication/database access to test posting, editing, removal, staff author restrictions, activity display and mobile layout. Production build passes with test Google Fonts responses.

After installing, test with two real staff accounts and a client account. Create a task comment, edit it as its author, verify the second staff account cannot edit/remove it, remove the task and confirm context remains, then remove the comment and confirm its placeholder/activity. Confirm a client cannot access the page or API. Run the updated HTTP verifier against your canonical deployment.

The owner reported the preceding live verification complete on 2026-10-07. That does not verify this newly added migration or interface; perform the checks above after deployment. Resources and Helpdesk remain outside scope.
