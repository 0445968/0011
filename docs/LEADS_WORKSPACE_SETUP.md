# Bivi leads workspace setup

This batch adds `/admin/login`, a protected inquiry list at `/admin`, and detail/review pages at `/admin/leads/[id]`. It builds on the catalog/intake batch you already applied. Existing inquiries are preserved.

## Activate staff access

1. Apply only the new migration `supabase/migrations/202610060002_inquiry_staff_and_reviews.sql` to the same Supabase project where the original inquiry migration was applied. Do not re-run the first migration.
2. Add `SUPABASE_ANON_KEY` to `.env.local` and the relevant hosting environment. Use the project's publishable/anon API key, not the service-role key. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported if already configured. Keep the existing `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and optional `INQUIRY_APP_URL` values from intake setup.
3. In Supabase Authentication, use an existing confirmed email/password user or create your staff user through the dashboard. Copy its actual user UUID. This application does not register users or send invitations or password-reset emails.
4. In the Supabase SQL editor, grant staff access with the actual UUID:

```sql
insert into public.inquiry_staff (user_id, active)
values ('REPLACE_WITH_YOUR_AUTH_USER_UUID'::uuid, true)
on conflict (user_id) do update set active = true;
```

5. Restart your local app or deploy the configured source when ready. Visit `/admin/login` and sign in with that user's email/password.
6. Submit a test inquiry through `/get-started`, open it in `/admin`, set Qualified with an internal note, and confirm the detail view and review history update. The status change does not send email or create an active project.

To remove staff access immediately:

```sql
update public.inquiry_staff
set active = false
where user_id = 'REPLACE_WITH_YOUR_AUTH_USER_UUID'::uuid;
```

Membership is checked on every protected server request, including API writes. Revocation therefore prevents subsequent reads and decisions even if a sign-in cookie has not expired.

## Session behavior

The server checks Supabase identity using `auth.getUser(token)`, then checks the database staff membership. Being signed in alone does not grant workspace access. The access token is stored in an HttpOnly cookie, with Secure enabled in production, SameSite Lax, and no domain override. Passwords are never saved to browser draft storage or returned by the API.

Sessions last until the access token expires, capped at one hour. This first version intentionally requires signing in again afterward; it does not persist refresh tokens or silently extend staff sessions. Sign-out removes the workspace cookie and attempts to revoke the provider session. Protected reads use no-store fetches and dynamic rendering.

## Database permissions and decisions

`inquiry_staff` cannot be read or edited directly by anonymous or authenticated clients. Only a trusted database administrator/server role manages membership.

Authenticated users may read inquiries and review history only when the RLS policy verifies active staff membership. There is no direct authenticated update grant on inquiries, and no direct authenticated insert/update grant on review history.

The `review_project_inquiry` function rechecks staff membership, locks the inquiry row, compares the supplied revision, records the authenticated actor, updates the decision, and inserts review history in the same transaction. A caller cannot choose a different reviewer ID. Repeated unchanged decisions do not create duplicate history entries. An outdated revision returns a conflict instead of overwriting a newer decision.

The UI shows New, Qualified, and Declined. Qualified means a fit for proposal preparation; it does not establish signed scope, payment, or a booked project. Notes and history remain internal. Reopening a declined inquiry or changing an existing note is recorded as another decision.

## Operational use

Review new inquiries manually in the workspace. The list is newest first with status filters and 25 items per page. Detail views include submitted contact data, goals, service quantities, notes, custom requests, budget, preferred start window, and the latest 50 review records. Dates are explicitly displayed in UTC. There is no automatic outbound email in this batch.

If loading fails, check the migration and project key configuration. The UI displays a retryable error, not a fabricated empty list. Never change RLS to public access to resolve a setup problem.

The earlier public intake setup instructions still apply. After this batch, the next workflow is proposal and accepted-scope records, followed by agreement/deposit references and project onboarding.

## Validation limits

Local checks cover TypeScript, SQL permissions and review transactions, and HTTP rendering/protected-page/API behavior. Production compilation is checked with mocked Google Fonts responses because the existing demo font download fails in this environment. Interactive browser behavior and real Supabase sign-in still require an environment check. No live Supabase credentials were available in the development workspace. Confirm a real sign-in and a real inquiry review in your configured environment before using the workflow operationally.

Official reference: https://supabase.com/docs/reference/javascript/auth-getuser
