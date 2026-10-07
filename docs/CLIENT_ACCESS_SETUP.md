# Client access and password recovery

Apply `supabase/migrations/202610070010_client_access.sql` after migrations 001–009, then deploy this patch. Retain the repository’s dependency security updates. Resources and Helpdesk remain outside scope.

## Configuration

Use server-only `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`, with `INQUIRY_APP_URL` set to the canonical HTTPS origin, without a path or query. Local HTTP is permitted only for localhost/127.0.0.1. The service key now performs server-side Auth link generation and request-limit reservations as well as intake; staff membership decisions still use the staff token and database RLS. Never expose the service key in public environment variables.

In Supabase Auth, set Site URL to the canonical origin, allow the exact redirect URL `<origin>/client/confirm`, and configure an email provider suitable for production. Update the **Reset Password** email template link to:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery">Reset password</a>
```

The application supplies RedirectTo as `<origin>/client/confirm`. Default fragment-based reset links do not work with this server-side flow. Keep email styling as desired and test actual delivery. Use the provider’s configured link expiry.

## Staff workflow

Open a saved project → Manage client access. For an existing account, copy the actual UUID from Supabase Auth and assign a viewer. Change review permission or revoke/restore access from the account row. Saves check assignment revisions and retain staff audit history; stale saves require a reload. The screen displays the latest 100 assignments and history records. Manually changing assignments outside this UI must also increment revision and update updated_at; such manual changes do not create application audit entries.

For a new account, confirm its email and prepare an invitation. The server generates a private setup link and assigns the returned Auth user to this project. **It sends no invitation email.** Share the link with the intended client through your existing channel. The link is shown in page memory, cleared on reload and never stored in project history. Avoid copying links into project notes or analytics. Auth generation and project assignment are separate operations: if the result is uncertain, inspect Auth and assignments before retrying; an account may have been created without project access. Assign its returned UUID manually if necessary. Existing accounts should use UUID assignment and password recovery. No self-registration, automatic account deletion or staff-role changes are added.

Assignments grant access only to that project and its available publications/files. Reviewers can approve/request changes; viewers cannot. Revoking membership removes project authorization; already-issued file download URLs can remain usable for their 60-second lifetime. Access history is a separate staff screen, not part of the unified discussion timeline.

## Client workflow

Invitation and recovery links open `/client/confirm`. Opening the page does not consume a token: the client explicitly clicks Continue, then chooses a password of 12–128 characters. The URL token is removed from browser history after the page mounts, and the confirmation page sends no-referrer/no-store headers. Site/server access logs may still capture the original request URL; redact query strings for this route.

Verification stores a temporary encrypted HttpOnly cookie, scoped to the password API, for at most ten minutes (Secure in production). Password submission restores and independently verifies the Auth session before updating the password. A successful update clears setup and application sign-in cookies; the client signs in again. Global refresh-session sign-out is best effort; already-issued access JWTs remain valid until expiry. Rotating the service key invalidates pending setup cookies. No Auth tokens are returned to browser JavaScript or stored in browser local storage.

Forgot password on client sign-in requests an email reset link. Valid-email requests return the same message for existing/nonexistent accounts, delivery failures and quota exhaustion. A configuration/database outage can return a general unavailable response. Database limits allow three requests per normalized email per hour and 100 total per hour, separately for invitation and recovery; only an HMAC email bucket is stored. Provider limits also apply. Review and periodically prune older `portal_auth_limits` rows with a trusted maintenance job.

## Verification

Run `npm run typecheck`, `npm run verify:platform`, the production build, and the deployment checker. Database tests cover assignment authorization, review permissions, stale revisions, no-op history and auth quotas. Crypto tests cover tampering, expiry and key rotation. Local browser tests simulate Auth; they do not demonstrate real SMTP delivery. Complete the migration-010 live checks in PRODUCTION_VERIFICATION.md before treating this feature as activated.

Provider references: [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates) and [password-based Auth](https://supabase.com/docs/guides/auth/passwords).
