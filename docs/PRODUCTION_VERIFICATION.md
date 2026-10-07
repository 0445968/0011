# Bivi production verification

Status: **live verification pending**. Run these checks in a configured staging environment with test files and separate real Supabase staff/client/viewer accounts. Record the deployment SHA, migration versions, tester and date before moving to real client work. This checklist does not claim that a deployed Supabase environment has passed.

## Automated checks

Follow `PRODUCTION_READINESS_SETUP.md` for installation and commands. Automated checks are supporting evidence; authenticated workflow and real Storage tests below remain required.

- [ ] `npm run verify:platform` passes in the installed checkout (test database only).
- [ ] `npm run verify:config` passes with the deployment environment values.
- [ ] `npm run verify:deployment -- https://YOUR_CANONICAL_HOST` passes against the canonical deployed origin.

## Configuration and access

- [ ] All eight migrations are applied once in the same project. Retain a database backup before migration changes.
- [ ] `SUPABASE_URL`, `SUPABASE_ANON_KEY` (or the supported public-key variable), `SUPABASE_SERVICE_ROLE_KEY` and canonical HTTPS `INQUIRY_APP_URL` are configured server-side. Service key is absent from browser bundles/network responses; it is used for inquiry intake only.
- [ ] Staff account is confirmed and active in `inquiry_staff`. Test a nonstaff account and deactivated staff account: staff pages and decisions must be denied.
- [ ] Client accounts are confirmed and assigned to the intended activated project UUID only. Use one approver and one viewer. A separate unassigned account must see no project content.
- [ ] HTTPS cookies are HttpOnly, Secure and SameSite Lax. Staff/client sign-out and expired/forged cookies require new sign-in. A different Origin cannot post decisions/file actions or request download URLs.
- [ ] Existing account-recovery process is documented with the owner; there is no self-service password-reset or invitation flow in this batch. No automatic notifications are sent.

## Storage configuration

Run in the Supabase SQL editor as the trusted administrator:

```sql
select id, public, file_size_limit, allowed_mime_types
from storage.buckets where id = 'bivi-project-files';

select policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects';

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('project_files', 'project_file_history');
```

- [ ] Bucket is private, size limit is `10485760`, MIME allowlist exactly matches migration 008. Project-wide Storage limit permits 10 MiB uploads.
- [ ] Six `bivi_files_*` policies exist: four restrictive guards plus authenticated INSERT/SELECT policies. Audit older policies and custom Storage integrations; no public bucket copy or service-key download proxy bypasses authorization.
- [ ] RLS is enabled on both file tables. Anonymous reads and direct authenticated metadata writes fail. Storage overwrite/delete from ordinary accounts fails even if a broad legacy policy exists.
- [ ] Direct signed upload works from the deployed browser origin. Test a small PDF and a TXT file, and a file near the 10 MiB limit. Confirm actual Storage metadata `size`/`mimetype` matches the reservation and verification succeeds.

## End-to-end onboarding and project management

- [ ] Submit a test inquiry. Retry the same request UUID: one inquiry remains. Verify it only appears to staff.
- [ ] Qualify → draft proposal → issue → record external acceptance. Issued/accepted scope is fixed; a stale revision cannot overwrite it.
- [ ] Record signed agreement and deposit evidence or documented waiver, release readiness, and start onboarding.
- [ ] Complete required inputs with evidence, record held kickoff, then complete onboarding. Incomplete requirements block completion.
- [ ] Activate project, record tasks/milestones/owners/due dates, save, hold/resume and complete/reopen. Gate changes require renewed onboarding review before applicable project decisions.
- [ ] Publish explicit client summary with review requested. Client sees only client-facing data, submits changes, receives a new published version and approves it. Viewer cannot submit a decision. Older versions/duplicate decisions reject safely.

## File exchange and isolation

- [ ] Staff uploads a file: staff can download; assigned client cannot see/download it until shared. Sharing exposes only that project's file to assigned clients.
- [ ] Client uploads an input: uploader and staff can download; another assigned client cannot see it until shared. Viewer upload works, while viewer approval remains denied.
- [ ] Downloads have attachment filenames and short expiry. Refreshing the portal creates a new authorization only after current session/project access is checked.
- [ ] Another project's UUID/file UUID, altered object path and an unreserved Storage upload fail. File listing does not reveal private objects to clients.
- [ ] Zero-byte, oversize, unsupported extension and MIME mismatch are rejected. A mismatched stored object cannot finalize or download.
- [ ] Interrupt after upload but before verification; reload and Finish verification recovers the same file. Repeat verification creates no duplicate history. Expired reservations stay non-downloadable.
- [ ] Two staff tabs sharing/withdrawing the same revision produce a conflict rather than silently overwrite the first action. Withdrawal requires a reason and keeps staff history.
- [ ] Remove sharing: other clients lose new downloads; a client uploader retains their own input. Withdraw: all clients lose it. Revoke membership: that client loses listing, upload verification and new downloads immediately. Allow up to 60 seconds for an already issued download URL to expire.
- [ ] Confirm an already issued upload capability cannot release readable content after revocation; the follow-up verification must be denied.
- [ ] 21st account reservation in one hour returns the upload limit. Project cap and retention/archive owner are documented. Cleanup uses Storage API/dashboard, with exported audit history and no active upload authorizations.
- [ ] Desktop and mobile upload controls, progress/error messages, private/shared status and file history are readable without horizontal scrolling.

## Release record

| Check | Evidence / result |
| --- | --- |
| Deployment SHA and date | Pending |
| Platform / configuration / HTTP verification outputs | Pending |
| Migrations / bucket / policies | Pending |
| Staff, approver, viewer and unassigned account checks | Pending |
| Inquiry → onboarding → project → publication / decision | Pending |
| Upload → verification → sharing → download | Pending |
| Withdrawal, revocation, expiry and recovery | Pending |
| Retention / account recovery owner | Pending |
| Approved for real client work by / date | Pending |

Local implementation checks: TypeScript and production build (test Google Fonts responses), PostgreSQL-compatible migration/RLS tests and browser tests against simulated Supabase authentication/Storage. Record actual deployment results above; simulation does not verify hosted Storage, CORS, production cookies or the project's existing policies.
