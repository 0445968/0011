# Release 3D — Essential email and deadline communication

Migration 014 adds Bivi's transactional client-email outbox, workflow notices, bounded deadline reminders and retry state. Apply it only after migrations 001–013.

## Environment variables

Add these server-side variables in Vercel Production and Preview as appropriate:

- `RESEND_API_KEY` — Resend API key with email-send permission.
- `BIVI_EMAIL_FROM` — verified sender, for example `Bivi <hello@bivi.pro>`.
- `BIVI_EMAIL_REPLY_TO` — optional reply-to mailbox.
- `CRON_SECRET` — random secret of at least 16 characters.

Keep all four values server-only. Do not prefix any of them with `NEXT_PUBLIC_`.

The implementation uses Resend's REST email endpoint and an idempotency key for each outbox row. No additional npm dependency is required.

## Messages covered

The workflow can send:

- inquiry acknowledgement;
- new client workspace invitation or restored/new workspace access;
- onboarding clarification request;
- project brief approval request;
- client-facing project-update review request;
- deliverable version approval request;
- change-impact proposal decision request;
- final release / receipt-confirmation request;
- project completion notice;
- client-owned project task and onboarding deadlines.

Deadline reminders are intentionally bounded. A still-open due item can produce at most three reminder stages: three days before, on the due date, and one overdue notice. Dedupe keys prevent the daily job from repeatedly sending the same stage.

## Delivery behavior

Workflow APIs attempt to flush their newly queued messages immediately after the business action succeeds. Email failure never rolls back the project action. Unsent rows remain queued and use bounded retry delays.

`vercel.json` schedules `/api/cron/communications` once per day at 14:00 UTC. The daily cadence is compatible with Vercel Hobby limits and is sufficient for due-date reminders and retry recovery. Production cron requests are authenticated with `CRON_SECRET` in the Authorization header.

The outbox itself is service-role only. Client/staff authenticated sessions cannot read action links or invitation tokens directly from the table. After an invitation email is sent, its stored token-bearing action path is cleared.

## Public login redirect

Release 3D keeps the canonical account entry point explicit: requests to `https://bivi.pro/login` are redirected to `https://app.bivi.pro/login`, preserving the query string. Deployment verification now checks this behavior on the production public domain.

## Verification

After applying migration 014 and setting environment variables:

```bash
npm run verify:config
npm run typecheck
npm run verify:platform
npm run build
```

Then deploy a preview and test normal project actions. The Vercel cron itself only runs against Production deployments, so after Production deployment verify `/api/cron/communications` with the configured bearer secret or use the Vercel Cron Jobs panel.

Recommended dry run:

1. Submit a new inquiry and confirm one acknowledgement arrives.
2. Invite a test client and confirm the invite opens `app.bivi.pro/confirm`.
3. Confirm `bivi.pro/login?source=test` redirects to `app.bivi.pro/login?source=test`.
4. Request an onboarding clarification and confirm the client receives one action email.
5. Issue a brief review, project-update review and deliverable review; confirm authorized reviewers receive each message once.
6. Propose a change request and confirm one decision email.
7. Release final work and confirm the authorized reviewer receives the receipt-confirmation email.
8. Set a client task/onboarding due date to three days ahead and run the secured cron route; confirm one reminder.
9. Run the cron route again the same day and confirm no duplicate reminder is sent.
10. Temporarily use an invalid Resend key, enqueue a test workflow email, run the cron route, and confirm the row is retried rather than the project action failing.
11. Restore the valid key and confirm the queued retry sends.
12. Complete the project and confirm the completion email arrives.

Do not test invitation retry with a real client account unless you intend to invalidate/reissue its setup link.
