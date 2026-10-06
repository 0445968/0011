# Project inquiry activation

The new `/get-started` form is a three-step inquiry, not an account or active project. It reuses homepage selections and stores an optional browser draft for seven days. Email resume, file uploads, payments, automated notification emails, and the admin/client dashboards belong to later batches.

## Activate storage

1. Use the intended Supabase project and review/apply `supabase/migrations/202610060001_project_inquiries.sql` once through your normal migration workflow or SQL editor. Do not run it against an unrelated project.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` for local development and in the hosting environment for the relevant deployment. Never expose the privileged key through a `NEXT_PUBLIC_` variable or commit it. `.env.example` contains names only.
3. Optionally set `INQUIRY_APP_URL` to the exact allowed origin, for example `https://bivi.pro`. Otherwise the endpoint requires the origin of its own request URL. If testing a preview domain, omit this value or set it to that preview origin.
4. Restart the local server, or deploy the configured build when ready.
5. Send a test inquiry with an inbox you control. Confirm one row exists in `public.project_inquiries`, inspect the service names/quantities and contact consent, retry the same request ID, and verify it remains one row.
6. Test denied anonymous/authenticated direct access, an invalid payload, an unavailable database, and a retry after an uncertain network result. Confirm clients never see a success message on storage failure.

No live Supabase credentials were available during implementation. The migration has not been applied to a live project. Until configured, valid submissions return HTTP 503 and the UI offers a direct email alternative. The Contact page always offers `mailto:hello@bivi.pro`; clicking it opens the visitor's email application.

## How Bivi receives inquiries in this batch

The source of truth is `public.project_inquiries`. Review new rows in the Supabase dashboard manually while the internal leads dashboard and transactional notifications are being built. This batch does not send acknowledgement or staff emails and does not claim that it does. Assign a person to check new inquiries before enabling the public workflow.

The payload includes normalized contact data, selected service quantities and notes, service names and blueprint versions, custom request, goals, budget, desired start window, and contact consent version. Names and blueprint versions are snapshots for inquiry review, not accepted contractual terms. Created timestamps are recorded by the database. `status` begins at `new`.

## Access and failure behavior

- Tables have RLS enabled and no anonymous or authenticated access grants/policies. There is no public inquiry lookup route. The server uses a dedicated Supabase client with session persistence disabled.
- Only the server role can execute the submission function. It atomically inserts the inquiry and updates shared rate counters.
- A UUID request ID is the retry key. The same ID and normalized payload return the existing receipt; different content with the same ID returns 409. Any client edit generates a new ID.
- Limits are five saved inquiries per normalized email per hour and 200 globally per hour. Email bucket identifiers use a server-side HMAC; raw emails are not stored in rate counters. These are initial abuse controls, not verified email identity or comprehensive bot protection.
- Same-origin JSON, maximum request size, field lengths, catalog IDs, quantity bounds, contact consent, and a honeypot are validated server-side.
- A failed or timed-out save returns an error. Do not turn errors into simulated success, and do not expose database error details to visitors.
- A browser draft is not cross-device recovery. Turning off saving removes the draft where browser storage permits. Drafts are discarded on next access after expiry, not by an out-of-browser deletion job. They contain contact/project information, so offer the existing saving toggle unchanged.

## Maintenance

Rate counter rows can be removed after their window expires. Schedule this through the database's normal maintenance workflow if needed:

```sql
delete from public.inquiry_rate_limits
where window_start < now() - interval '2 days';
```

Set a lead retention policy before operating at scale; do not retain declined inquiries indefinitely by accident. Do not reuse the public inquiry endpoint for authenticated project edits or confidential file exchange.

Official implementation references: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [securing data](https://supabase.com/docs/guides/database/secure-data).

## Scope of navigation changes

Resources/Helpdesk entries were removed from the primary navigation, direct Resources links in the footer, resource results from global search, and the Resources preview on the homepage. The secondary homepage action now points to Work, and primary navigation includes Work and About. Existing route files and legacy menu definitions remain for a later route-retirement decision. Other editorial/demo pages were not redesigned. Global metadata now describes the creative studio rather than a resource library.
