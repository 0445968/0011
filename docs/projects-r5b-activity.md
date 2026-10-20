# R5b — Audited Project Activity

Adds a staff-only project Activity tab at `/projects/[id]/activity` and makes the existing disabled R5a menu item navigable. Requires additive migration `202610200039_project_activity_actors.sql` after 038.

Data is read from the existing, RLS-protected project, phase, hierarchy, task-control, assignment, file, discussion, access, brief, client-response and decline-policy audit tables. Audit events are not edited and no new events are invented. Saved project JSON snapshots are diffed only when two consecutive retained snapshots exist, producing task/milestone create/remove/title/status/due-date and project title/owner-label descriptions where supported. Other changes are explicitly labeled `Other project details updated`.

The migration creates an authenticated **staff-only** actor lookup function. It reads only IDs that appear in the specified project's audited sources, so former assignees and reviewers can still be named. It does not grant access to private auth tables or disclose user email to clients.

The staff Activity page shows up to 250 recent events across bounded source queries, with filters, actor/time, links to existing sections, and profile images when present. There is no client Activity endpoint, no historical backfill and no fictitious approvals, recipients or reminders. Broader publication/notification delivery event coverage and paginated archival access can be added as their audited sources are standardized.

Verify on actual staff account: actors with/without profile photos, cross-project isolation, multiple task field edits in one Save All, phase completion, client request + review, file and discussion changes. A client and anonymous browser must not access `/projects/[id]/activity` or the staff-only actor RPC. Run typecheck, platform tests, build. Do not deploy before migration 039 is applied.
