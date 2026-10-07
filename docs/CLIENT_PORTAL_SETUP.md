# Client progress, approval and delivery portal

Requires all earlier patches and migrations 001–006. No new environment variables are required. This batch preserves the current proposal design on `restore`.

## Install

1. After earlier patches, run `git apply --check Bivi-Client-Portal.patch`, then `git apply Bivi-Client-Portal.patch`.
2. Apply only `supabase/migrations/202610060007_client_portal.sql` in the same Supabase project. The latest-updates view uses PostgreSQL 15+ security-invoker support. Do not rerun earlier migrations.
3. Restart the configured application. Sign in as staff, open an activated project, then choose **Publish client progress and delivery**.

## Assign client access

Use an existing confirmed Supabase email/password account or create a confirmed client account through the Supabase Authentication dashboard. Copy its actual UUID. Migration 010 adds staff-prepared invitation links and password recovery; follow CLIENT_ACCESS_SETUP.md. Self-registration remains unavailable.

In the SQL editor, assign that account to an activated project's inquiry UUID:

```sql
insert into public.project_clients (request_id, user_id, active, can_review)
values (
  'REPLACE_WITH_PROJECT_INQUIRY_UUID'::uuid,
  'REPLACE_WITH_CLIENT_AUTH_UUID'::uuid,
  true,
  true
)
on conflict (request_id, user_id)
do update set active = excluded.active, can_review = excluded.can_review;
```

Use `can_review = false` for a viewer who should read updates without submitting decisions. Only a trusted database administrator/server role manages these assignments. Client email alone does not grant access.

Clients sign in at `/client/login`. The portal lists assigned projects with available published updates. Assignment by itself does not expose an internal project or display an unpublished project. Each project is isolated by RLS. Clients cannot read staff inquiry data, task notes, onboarding records, agreement/deposit evidence or other clients' review notes.

To remove portal access:

```sql
update public.project_clients
set active = false
where request_id = 'REPLACE_WITH_PROJECT_INQUIRY_UUID'::uuid
  and user_id = 'REPLACE_WITH_CLIENT_AUTH_UUID'::uuid;
```

Revocation prevents subsequent portal reads and reviews even if a cookie has not expired. Client and staff cookies are separate, HttpOnly, SameSite Lax and Secure in production. Identity is verified with Supabase on every protected server request. Sessions last until token expiry, capped at one hour, with no persistent refresh token.

## Publish and review

Prepare an explicit client-facing title, summary, next steps, progress, milestone titles/dates/statuses and HTTPS delivery/review links. The publisher can copy saved milestone progress into the editor, but nothing is automatically published. Review the preview before confirming publication. The portal never fetches internal work-plan records.

Updates are numbered and their content is fixed. Publish a newer version for a correction. The latest available version is shown first, with up to 20 previous available versions on the detail page. The client list shows 25 projects per page.

Enable **Request approval or changes for this version** when a decision is needed. An active assigned approver may submit one immutable decision per version: Approved or Changes requested. Requested changes require a note. The authenticated client account and timestamp are recorded by the database. An older version cannot receive a new decision after a newer available update is published. Each client sees their own decisions; staff see all project review decisions, up to 50 in the publisher view.

Approval applies to the displayed update and its linked materials. It does not replace the accepted proposal or automatically complete the internal project. Staff review feedback and decide the next project action through the existing workspace. Publication and review do not send notifications or email.

## Delivery and withdrawal

Delivery uses external HTTPS links, with client-facing labels and notes. Private uploaded-file exchange is available after migration 008; follow FILE_EXCHANGE_SETUP.md. Grant intended clients access at the file provider; portal membership does not change external file permissions. Links without embedded usernames/passwords are supported; never paste account passwords or access tokens into summaries or notes. Time-limited file links expire according to their provider and should be republished when replaced.

**Withdraw version** hides that update from client access while retaining its staff record. If the latest version is withdrawn, the portal shows the newest remaining available update. Withdraw all versions to hide published updates. Project file access is managed separately through file withdrawal or assignment revocation. Previously received client decisions remain stored. Already shared external links must be revoked separately at the provider when needed; withdrawal cannot remove copies already downloaded.

## Verification

Local checks cover TypeScript, production build using test Google Fonts responses, project membership, viewer/approver permissions, internal-data isolation, publication validation, immutable versions, stale/duplicate review rejection, withdrawal and membership revocation. The production browser workflow uses a local Supabase simulation. Real credentials were unavailable: test with separate real staff/client/viewer accounts, verify only assigned projects appear, publish → request changes → republish → approve, then verify withdrawal and revocation in your configured environment.

Resources and Helpdesk remain outside the roadmap. Next work: production rollout verification. Client account recovery and notification handling remain future work when selected.
