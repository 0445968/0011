# Client onboarding and kickoff setup

This incremental batch requires all earlier Bivi batches, including `Bivi-Onboarding-Gate.patch` and migrations 001–004. It preserves the latest proposal workspace design in the `restore` branch. No new environment variables are required.

## Install and use

1. With the earlier patches applied, run `git apply --check Bivi-Client-Onboarding.patch`, then `git apply Bivi-Client-Onboarding.patch`.
2. Apply only `supabase/migrations/202610060005_client_onboarding.sql` to the same Supabase project. Do not rerun earlier migrations.
3. Restart the application and sign in as active staff. Open a qualified inquiry with accepted scope and a released agreement/deposit gate. From that gate page, choose **Open onboarding checklist and kickoff**.
4. Start the checklist. The database creates three required items: confirm contacts, verify all agreed client inputs, and review assets/access requirements. The accepted proposal's client-input text is displayed above the checklist.
5. Enter the primary contact, contact email and authorized approver. Add additional checklist items for individual deliverables or service-specific inputs. Assign each to Client or Bivi and mark optional items as such. The three core items remain required.
6. Track Pending → Received → Complete. Received means awaiting staff verification and does not satisfy a required item. Complete requires evidence/review notes; Waived requires an explicit reason. Store secure-sharing references rather than passwords or tokens.
7. Record the kickoff date, time and timezone, meeting location and agenda. Once held, record the outcomes and follow-up notes. Held kickoffs cannot have a future date. The application records scheduling details without sending invitations.
8. Save, then choose **Complete onboarding**. The server requires contact details, all required items completed/waived, a held kickoff with notes, a qualified inquiry, and the currently released agreement/deposit gate for the accepted version.

## Completion, holds and corrections

Completed records are locked. Reopen with a reason to make corrections, then save and complete again. Reopening is allowed while the agreement/deposit gate is on hold; saving existing preparation is also allowed. Starting or completing onboarding requires the gate to be ready.

Completion stores the exact readiness revision. If that gate changes after completion—even if subsequently released again—the page shows **Completion needs review**. Reopen and review before completing again. Previous completion snapshots remain in history.

This batch prepares the handoff into project management. It does not create an active project or client login. Future project activation must independently check the accepted version, qualified inquiry, current gate state, completed onboarding state and matching readiness revision in its database transaction.

The history view shows the latest 50 events with evidence snapshots, actors, reasons and timestamps. Older events remain stored. Each command uses a revision check and locks the parent inquiry, preventing stale saves and serializing against proposal/readiness changes. Failed requests write no history.

## Permissions and verification

Only active staff can read onboarding records/history and use its command function. Anonymous/nonstaff users are excluded by RLS, and authenticated users cannot directly write either table. Required core IDs cannot be removed, duplicated or marked optional. Custom checklist items can be edited or removed before completion; staff retain responsibility for matching them to the accepted client inputs.

Local checks cover TypeScript, production build with test Google Fonts responses, RLS/RPC permissions, required evidence, invalid kickoff dates, completion prerequisites, stale revisions, locked completed records, reopening, readiness revision changes and atomic history. A production browser check uses a local Supabase simulation. Real credentials were not available: verify live sign-in and start → save → complete → reopen in your environment before operational use.

Resources and Helpdesk remain outside the roadmap. Next: project activation, milestones, tasks, ownership and progress tracking.
