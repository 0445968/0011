# Private project file exchange

Requires the client portal patch and migrations 001–007. This batch preserves the revised onboarding interface on `restore`. No new environment variables or dependencies are required.

## Install

1. Run `git apply --check Bivi-File-Exchange.patch`, then `git apply Bivi-File-Exchange.patch` after the client portal batch.
2. Apply only `supabase/migrations/202610060008_project_files.sql` as the migration owner in your existing Supabase project. Supabase Storage must already be available. The migration creates the **private** `bivi-project-files` bucket, file metadata, action history and Storage policies.
3. Restart the application. Open an activated project and choose **Manage project files**. Assigned clients use the Project files section in their existing portal project page. Publish at least one available client update so the project appears in the portal.
4. Follow `PRODUCTION_VERIFICATION.md` before using real client materials. Local verification used simulated Storage and authentication; real Supabase upload/download behavior still needs verification.

## Permissions

| Action | Staff | Active assigned client | Other account / anonymous |
| --- | --- | --- | --- |
| Upload to activated project | Yes | Yes, including viewers | No |
| Read pending reservation | Yes | Own only | No |
| Download verified unshared file | Yes | Own upload only | No |
| Download shared file | Yes | Yes | No |
| Share / remove sharing | Yes | No | No |
| Withdraw file with reason | Yes | No | No |
| Read action history | Yes | No | No |
| Overwrite / delete stored object | Trusted Storage administrator only | No | No |

Client upload ownership alone does not preserve access after assignment is revoked. Removing sharing keeps a client uploader's access to their own file; withdrawal removes access for all clients. Withdrawn files cannot be restored through the interface: upload a replacement. Objects are retained privately for administrative retention/cleanup, and staff retain metadata/history. Staff also cannot download withdrawn objects through the application.

Uploads accept PDF, PNG, JPG/JPEG, WebP, ZIP and TXT, 1 byte through 10 MiB. The server checks extension, declared MIME type and size; the bucket enforces its MIME allowlist and maximum size. Verification reads actual stored size/MIME metadata before enabling downloads. This does not inspect file contents or scan for malware. Files download as attachments; HTML/SVG are excluded. Review supplied files before distributing them.

Metadata writes use the authenticated account through a locked database function. Clients cannot insert/update file metadata directly or supply arbitrary object paths. A reservation fixes the project, opaque file UUID, uploader, filename, MIME type and size. Uploads cannot overwrite existing objects. Storage SELECT requires a verified file and current project access. Restrictive policies guard this bucket even when an older permissive policy covers all buckets; audit remaining Storage policies during rollout.

## Upload recovery and limits

The browser uploads bytes directly to the private bucket through a scoped signed upload URL, then requests verification. Account JWTs and the service key are never returned to the browser. Signed upload URLs are valid for two hours and operate without further account authentication. An already issued URL may still upload after account revocation; verification and every new download require current authorization. A pending reservation expires after two hours, matching the upload window.

If bytes reached storage but verification did not finish, use **Finish verification** on the same pending record. Verification is idempotent. If the object is absent, mismatched or the reservation expired, ask staff to withdraw it and upload a replacement. A failed signing request leaves a visible pending reservation; resolve Storage configuration before retrying. The upload UI never blindly retries an uncertain request. Staff sharing/withdrawal uses revision checks; reload after conflicting edits.

Each account can reserve 20 files per hour across projects. Each project can retain 200 reservations, including failed/withdrawn entries. The cap deliberately limits accumulated private storage: at most 2,000 MiB of uploaded files per project before administrative maintenance. Archive/cleanup is manual in this batch. Before reclaiming slots, export the audit records, wait at least two hours after the last upload authorization, remove objects through the Supabase Storage dashboard/API, then delete only the corresponding selected metadata as a trusted administrator. Do not delete `storage.objects` rows directly; that does not delete stored bytes. Metadata deletion cascades file history, so retain the export first. No automatic cleanup runs.

## Download and handoff

The Download button requests a fresh authorization using the staff/client session and returns a signed attachment URL valid for 60 seconds. Membership revocation, removal of sharing and withdrawal block new authorizations. Already issued URLs can remain usable until expiry, and downloaded copies remain with recipients. Do not put these temporary URLs into published delivery links; use the portal file list. Sharing/withdrawal timestamps, revisions, actors and reasons are recorded for staff. This is a handoff record, not proof that every recipient downloaded/read a file.

References: [signed uploads](https://supabase.com/docs/reference/javascript/file-buckets-createsigneduploadurl), [signed downloads](https://supabase.com/docs/reference/javascript/storage-from-createsignedurl), [bucket restrictions](https://supabase.com/docs/guides/storage/buckets/creating-buckets), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Storage schema and deletion](https://supabase.com/docs/guides/storage/schema/design).
