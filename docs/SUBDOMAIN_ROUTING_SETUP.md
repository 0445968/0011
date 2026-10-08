# Bivi account subdomains

This release keeps the public website and the two authenticated workspaces in the same Next.js deployment while giving each surface its own canonical hostname and clean external paths.

## Canonical surfaces

- `https://bivi.pro` — public website and project inquiry flow.
- `https://app.bivi.pro` — client account, with `/` as the client dashboard and `/login`, `/projects/...`, `/security`, `/mfa`, `/recover`, `/confirm`, and `/password` as public client paths.
- `https://staff.bivi.pro` — staff workspace, with `/` as the staff dashboard and `/login`, `/leads/...`, and `/projects/...` as public staff paths. Administrators use this same workspace and should receive additional permissions through the existing server-side staff authorization model rather than a separate admin hostname.

The existing `/client/*` and `/admin/*` route trees remain internal implementation routes. Middleware rewrites clean subdomain URLs to those routes and redirects old public `/client/*` and `/admin/*` URLs to their canonical subdomain equivalents. This avoids moving the recently added Google sign-in, MFA, recovery, project, file, review, discussion, and access pages.

## Vercel / DNS

Attach all three domains to the same Vercel project and production branch:

- `bivi.pro`
- `app.bivi.pro`
- `staff.bivi.pro`

Follow Vercel's displayed DNS records for the apex and subdomains. Do not point the subdomains at a separate application unless the deployment architecture changes later.

Configure production environment values:

```env
INQUIRY_APP_URL=https://bivi.pro
NEXT_PUBLIC_BIVI_APP_URL=https://app.bivi.pro
NEXT_PUBLIC_BIVI_STAFF_URL=https://staff.bivi.pro
```

These values are origins, not secrets. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only as before.

For local clean-host testing, browsers that resolve `.localhost` can use values such as:

```env
INQUIRY_APP_URL=http://localhost:3001
NEXT_PUBLIC_BIVI_APP_URL=http://app.localhost:3001
NEXT_PUBLIC_BIVI_STAFF_URL=http://staff.localhost:3001
```

Without local subdomain configuration, the legacy `/client/*` and `/admin/*` paths continue to work on an unrecognized preview/local hostname.

## Supabase Auth

Use `https://app.bivi.pro` for client-facing Auth redirects. Add the exact redirect URL:

```text
https://app.bivi.pro/confirm
```

The Reset Password email template should continue to use the supplied redirect target and hashed token:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery">Reset password</a>
```

The client access code now builds invitation/recovery origins from `NEXT_PUBLIC_BIVI_APP_URL`, not from the public inquiry origin.

If Google Identity Services is enabled, add `https://app.bivi.pro` to the appropriate authorized JavaScript origins in the Google Cloud OAuth client configuration. Keep `bivi.pro` only where the public site itself requires it.

## Session isolation and public navbar

The real Supabase bearer-token cookies remain host-only:

- client token on `app.bivi.pro`
- staff token on `staff.bivi.pro`

They are **not** widened to `.bivi.pro`.

The public navbar checks a small credentialed CORS endpoint on each account host. The endpoint accepts only the configured public Bivi origin and returns only:

- whether the account is authenticated,
- whether it is a client or staff session,
- a single display initial.

It does not return the email address or bearer token. Staff wins if a browser happens to have both a staff and client session, so an administrator visiting `bivi.pro` is sent to `staff.bivi.pro` by “Go to dashboard.” Logout is performed against the relevant account host and clears only that host's authentication cookie.

The initial prefers Auth metadata (`given_name`, `first_name`, `full_name`, or `name`) and falls back to the first character of the account email when no first name metadata exists.

## Verification before launch

1. Run `npm run typecheck`, `npm run verify:platform`, and `npm run build`.
2. Run `npm run verify:config` with the three production origins configured.
3. Verify `bivi.pro/client/login` redirects to `app.bivi.pro/login`.
4. Verify `bivi.pro/admin` redirects to `staff.bivi.pro/`.
5. Verify `app.bivi.pro/` redirects an anonymous browser to the clean `app.bivi.pro/login` URL, not a visible `/client/login` URL.
6. Verify `staff.bivi.pro/` does the same for staff login.
7. Test password login, Google login, MFA challenge, password recovery, and a generated client invitation on `app.bivi.pro` with test accounts.
8. Log into a client account, open `bivi.pro`, and confirm the navbar shows the first-name initial, “Go to dashboard,” and “Log out.” Repeat with a staff/admin account.
9. Confirm client and staff cookies are host-only in browser developer tools and are not present on `bivi.pro`.
10. Confirm unauthorized client/staff APIs on the wrong account hostname return 404 and that project/RLS authorization still passes the existing platform test suite.
