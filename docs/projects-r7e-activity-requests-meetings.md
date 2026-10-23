# R7E — Activity, Requests, notifications and meetings

Status: implementation delivered to `bivi-dashboard-overhaul`; authenticated UI acceptance and external delivery configuration remain pending. Built on development head `03558d6` (R7D) and committed in two R7E commits. The `restore` branch was not changed or deployed.

## Foundation and database

The working tree was clean at the fetched development head before R7E. R7B/R7C/R7D sources and protections were inspected; the full migration test database exercises their completion, revision, draft, authorization and activity behavior together with the new migration.

The intended hosted project was `0011`, Supabase ref `xxnvekmbotzcyuhsyxbw`, organization `yxgtzrjcrqonisdemyyi`, on PostgreSQL 17.11. The migration ledger already contained `project_phase_colors` (`20261021202346`), `r7b_project_integrity` (`20261022165839`), and `r7b_calendar_membership` (`20261022170140`). No suitable project meeting/booking source existed, so the additive migration introduced one. No reset, unrelated migration, live project data write, or notification message was performed.

Applied migration:

- File: `supabase/migrations/20261023150000_r7e_project_events_requests_notifications.sql`
- Name: `r7e_project_events_requests_notifications`
- Hosted ledger version: `20261022195347`

Hosted read-only verification confirmed the three new tables have RLS enabled, the existing shared Calendar view remains `security_invoker`, anonymous execution is denied for checked RPCs, private queue/baseline/worker helpers are not executable by `authenticated`, and their public staff/client wrappers are granted as intended. The Activity RPC returned 25 raw source records; the shared Calendar returned 18 existing events. There were no meeting or task-linked communication records before this feature created any. Hosted role-level write flows were not exercised.

The security advisor returned the same four grouped categories as before application (RLS without policies, security-definer execution, and leaked-password protection). These grouped findings include multiple objects; the new RPCs were separately checked for grants and guards. No unrelated advisor cleanup was included. See [Supabase database linter documentation](https://supabase.com/docs/guides/database/database-linter).

## Delivered behavior

### Audited Activity

Project Activity and Overview use the same authorized Activity service. It reads source records through stable keyset pagination ordered by timestamp and source key. Snapshot differences are computed with a predecessor baseline across page boundaries; a missing predecessor does not create a fabricated creation event. Technical save snapshots remain intact in the database but are filtered from the domain feed. Supported task, subtask, milestone, phase, assignment, file, note, discussion, request/review, brief, readiness, delivery, handoff, publishing, access, communication-processing, meeting, and other domain records retain their actor and source provenance when the source records provide them. Duplicate representations of the same underlying action are collapsed; distinct changes in one save remain separate. Exact item links open Requests, Calendar, or the related project content.

Activity pages contain up to 25 raw source records; a source record can yield multiple domain changes. The UI does not claim a total event count. Filtering applies to each loaded page while older/newer source cursors remain available. Overview shows a short preview from this same feed. Historical recipient membership is not reconstructed from today's roster: file shares expose verified recipients captured in the source record; unknown historical recipients remain unknown.

The repository has no authoritative electronic signature receipt source. Existing staff readiness/signing evidence is shown only as readiness evidence, not represented as a client signature. The migration records future QA, handoff and closeout actions where those source tables exist, without inventing historical coverage. No provider delivery receipt is inferred from a queued or provider-accepted email.

### Requests

Client task requests and staff review now live under the dedicated Requests project section. The existing request types, decline policy, reasons, project/task revisions, explicit Bivi review gate, and non-completion semantics remain. Filters cover request state and type, with requester, submitted/reviewed time, decision, reason and linked task. Notification and client receipt links target the exact request; legacy `responses` links resolve to Requests.

The database captures a private task/control baseline at submission. Accepting completion checks that baseline, current revisions and completion requirements before marking the task Done atomically. A changed or removed task cannot be accepted as if unchanged; staff may close a stale request with an explicit rejection without mutating newer task work. Repeated decisions are idempotent. Legacy requests lacking a trustworthy captured baseline fail closed for acceptance and must be rejected and resubmitted; no private baseline is exposed through the client receipt API. A request the client submitted can still be read through its own safe receipt even when it is outside the normal bounded project task list.

### Existing notification and email infrastructure

Domain actions persist deduplicated intent in the existing communication outbox within the same transaction. Assignment, request, decision and approval signals use eligible current members and preferences; authorization is rechecked when a worker claims/sends. Retries keep the same outbox record/idempotency key, revoked or obsolete recipients are skipped, and an email provider failure does not undo a committed domain action. Attempt-aware completion prevents an old worker from overwriting a later attempt. The existing staff notification inbox/read state and top-bar indicator remain in use; no parallel inbox or delivery store was added.

Only the existing **email outbox/Resend path** is implemented as an external delivery channel. Provider acceptance is reported as sent, not delivered. No delivery webhook/receipt integration exists. The dispatcher stops retrying after 23 hours from first attempt and leaves the record for manual reconciliation, inside Resend's documented 24-hour idempotency-key window: [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys). The deployment schedule was changed to every 10 minutes in repository config; deployed cron configuration and production delivery are not verified.

At implementation time, local configuration checks showed `RESEND_API_KEY`, `BIVI_EMAIL_FROM`, and `CRON_SECRET` were absent; Supabase URL and service key were present. No secret values were printed. The test transport exercised acceptance, retry, revocation, unknown outcome and stale-attempt cases without sending messages. Email delivery, queued cron execution, and recipient experience remain pending configuration and a controlled test recipient/transport. No real client was sent a test message.

### Project meetings

The migration adds revision-checked project meeting records with title, explicit start/end instants, named IANA timezone, eligible organizer and attendees, scheduled/cancelled status, optional location and HTTPS meeting URL, audit source and staff-only database read policy. The project Calendar has create, edit, cancel, pagination and exact meeting deep links. Selection only records attendees; it does not send invitations or synchronize an external calendar. Overview lists real upcoming/ongoing meetings, excluding cancelled and ended records. Ongoing means start time has passed and end time has not. Shared Calendar uses the saved/user timezone for the day boundary and retains timed meeting bounds; task/milestone due dates remain date-only.

Local time conversion rejects nonexistent DST wall times and requires an explicit offset for repeated wall times. Changing the saved display timezone changes presentation, not the stored instant. If an attendee or organizer becomes ineligible during an edit, that selection is shown as unavailable and must be removed/replaced explicitly. A now read-only or completed project can still discard an open meeting form. There is no external invitation action in this slice.

### Refresh and privacy

Confirmed request, meeting and other supported mutations revalidate the affected project and shared surfaces through the existing refresh path: Requests, Activity/Overview, task statistics, notification count, and project/shared Calendar. Readers refresh on visible return and do not replace a pending work-plan mutation. Private request baselines, internal email bodies, and cross-project/client-only records are not included in Activity descriptions or staff-only counters. Missing sources are presented as unavailable/pending rather than fabricated zero values.

## Validation

Focused R7E behavior tests cover DST gaps/folds and non-hour offsets, meeting create/edit/cancel/revisions/time ranges/attendee authorization, ongoing and cancelled state, project/client boundaries, request baseline and duplicate/stale review behavior, atomic completion/rejection, notification deduplication/retry/revocation/unknown outcomes, Activity pagination/order/predecessors/deduplication/actors, exact deep links, and safe historical recipient behavior.

Recorded local checks after the implementation and final meeting form adjustments:

- `npm run typecheck` — passed.
- `npm run verify:platform` — 167 tests passed.
- `npm run build` — passed.
- `git diff --check` — passed.

The all-migrations PGlite suite tests database behavior under authenticated, client and service roles. Hosted verification was read-only after migration. Authenticated browser acceptance, actual browser layout in narrow/light/dark modes, live recipient delivery, deployed cron schedule, external delivery receipts, and external calendar sync were not verified.

## Manual acceptance checklist

Use a development project with two active staff members, one eligible client member and a second client organization/account that must be denied.

1. Open Activity and Overview. Confirm matching actors, ordering, event links and privacy. Page older than 25 source records; confirm stable ordering, no duplicates at the boundary, and no false creation event for a snapshot lacking a predecessor. Open task, file, request, brief, meeting and communication links.
2. Open Requests. Filter pending/reviewed and each request type; verify task, requester, submitted time, reason and decision. Follow a client request notification/deep link and an old `tab=responses` URL. Submit duplicate review attempts and open a stale request after editing the task elsewhere. Confirm stale completion cannot overwrite newer work, rejection does not change task fields, and an accepted completion updates task totals only once.
3. Submit client completion with an unfinished subtask, then complete the subtask and request again. Confirm Bivi review is required before Done. Accept postponement/modification/clarification and confirm task deadline/scope/status remain unchanged unless the review explicitly changes them.
4. In a development/test transport only, assign eligible staff/client members and exercise request and approval decisions. Confirm existing inbox read/unread/preferences and blue dot, deduplicated retry, revoked-recipient skip, and truthful queued/sent/failed/unknown states. Do not send test messages to real clients.
5. Create a project meeting with eligible organizer/attendees. Verify the persisted record in Project Calendar, Overview and shared Calendar. Confirm attendee selection sends no invitation. Edit it in two sessions and verify revision conflict recovery; cancel it and confirm it is excluded from Upcoming. Check an ongoing meeting, an ended meeting, a DST gap, both offsets of a DST fold, a non-hour timezone such as `Asia/Kathmandu`, and user display-timezone changes.
6. Follow a meeting link from Activity or shared Calendar; verify it opens that exact meeting in the correct project Calendar. Try a missing ID and a cross-project/client ID; confirm a useful unavailable state without exposing another project's meeting.
7. Remove eligibility from an attendee/organizer while an edit is open. Confirm the removed attendee remains visible until explicitly removed, a replacement organizer can be chosen, and Discard remains available if the project becomes read-only.
8. Keep an unrelated work-plan draft open while saving a meeting or reviewing a request. Confirm it remains recoverable and navigation/save conflicts are clear. Check unavailable source/error versus a real empty list, and review narrow, light and dark layouts.

## Delivered / Partial / Pending

- **Delivered:** audited shared Activity source and stable source pagination; Requests navigation and review; database-backed project meetings; reuse of the existing staff notification and email outbox; cross-view revalidation; focused behavior tests and repository documentation.
- **Partial:** notifications have durable intent, existing inbox behavior, and a tested Resend email worker path. External delivery configuration, deployed cron and real recipient delivery remain unverified. Historical electronic signature receipts, old file-share recipients not present in source, and provider delivery receipts are not fabricated.
- **Pending:** authenticated UI acceptance for R7E and prior phases/Tasks/Overview slices; controlled real/test-provider delivery; deployed cron confirmation; Brief project name/verified owner/Activation relocation; Admin Settings technical revision-history relocation; Calendar month grid; broader missing audit-source coverage where no authoritative source exists; end-of-R7 visual refinement. R7F has not started.
