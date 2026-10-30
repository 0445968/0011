# Staff session continuity

The original staff session stored only an access token, with its cookie capped at one hour. Supabase client auto-refresh was disabled and no refresh token was retained. An editor could therefore remain on screen after its credential stopped authorizing saves. This is an access-token expiry, not an application inactivity timer.

The workspace now checks server-verified session expiry and warns five minutes beforehand. Keep working renews the same staff account through an HttpOnly refresh cookie, rotates both credentials and retries pending work-plan autosave without reloading editors. Refresh tokens are host-only, Secure in production, SameSite=Lax, never returned to browser JavaScript, and retained for up to seven days; access cookies remain capped at one hour. Provider session policies and staff membership are still enforced on renewal. Browser Web Locks serialize renewal across same-origin windows.

Older sessions need one inline password sign-in to establish the refresh cookie. Password reauthentication is bound to the original staff ID. At expiry or temporary network failure, the app keeps editors mounted and offers renewal or same-account sign-in rather than navigating away. Retryable auth-network errors and rate limits are unavailable responses, not false sign-outs.

The countdown dialog lists tab titles and registered unsaved editor labels, including private work-plan drafts retained after switching workspace tabs. Browser-local status metadata contains labels/URLs only; same-account browser windows exchange live unsaved status through BroadcastChannel. Work-plan drafts use their existing local/server recovery system. Other editor text is not implicitly published or claimed to be autosaved.

Sign out with unsaved work requires explicit confirmation in the countdown dialog. It flushes work-plan checkpoints, clears all staff session cookies and attempts provider-local revocation, including when the access token has expired. It does not discard private drafts. Normal manual sign-out elsewhere continues to use the navigation guard.

No database migration or provider-wide authentication-policy change is required.
