# Bivi launch verification

This is the final Release 3 activation checklist. It assumes migrations 001–014 are applied in order and the `restore` branch contains Releases 3A–3D.

## 1. Production configuration

Confirm the production environment contains:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` or the existing public Supabase key used by the app
- `SUPABASE_SERVICE_ROLE_KEY`
- `INQUIRY_APP_URL=https://bivi.pro`
- `NEXT_PUBLIC_BIVI_APP_URL=https://app.bivi.pro`
- `NEXT_PUBLIC_BIVI_STAFF_URL=https://staff.bivi.pro`
- `RESEND_API_KEY`
- `BIVI_EMAIL_FROM`
- optional `BIVI_EMAIL_REPLY_TO`
- `CRON_SECRET`

Run:

```bash
npm run verify:config
npm run typecheck
npm run verify:platform
npm run build
npm run verify:launch -- https://bivi.pro
```

The launch verifier checks the public, client and staff domains together, including the `bivi.pro/login` redirect, anonymous auth gates, cross-surface redirects, foreign-origin API rejection and anonymous cron denial.

## 2. Public discovery check

Before launch, confirm the public navigation does not advertise unfinished Help/Resources surfaces. Their source remains in the repository for future work, but they should not be exposed through Preferences, footer links or search filters.

Check desktop and mobile versions of:

- navbar
- Preferences panel
- footer
- global search
- full `/search` page

## 3. Full inquiry-to-closeout dry run

Use a dedicated test client and a new test inquiry. Do not reuse a real client project.

### Inquiry and qualification

1. Submit `/get-started` as the test client.
2. Confirm the inquiry is saved once and the acknowledgement email is delivered once.
3. Open the lead on `staff.bivi.pro`.
4. Qualify it and record internal notes.
5. Create and issue a proposal.
6. Record acceptance of the exact proposal version.
7. Record agreement and deposit evidence until readiness is `ready`.

### Client access and personalized onboarding

1. Invite the test client before project activation.
2. Confirm the invitation link enters `app.bivi.pro` and account setup succeeds.
3. Confirm the client profile can be completed.
4. Open personalized onboarding requirements.
5. Test autosaved text, file upload and a staff clarification request.
6. Confirm the clarification email is queued/sent.
7. Resubmit, accept or waive every required onboarding item.
8. Complete the staff verification checklist and kickoff requirement.
9. Mark onboarding complete.

### Project activation, brief and tasks

1. Activate the project.
2. Confirm the project starts in Discovery.
3. Confirm service-derived Bivi/client tasks and task controls were seeded.
4. Edit and issue project brief version 1.
5. Confirm the authorized client reviewer receives the brief review email.
6. Request brief changes, revise and issue version 2.
7. Approve version 2.
8. Confirm the lifecycle cannot advance beyond Discovery before the latest brief is approved and can advance afterward.
9. Complete at least one normal client-owned task and verify dependency/blocker behavior.

### Progress, files and discussion

1. Upload a private project file from staff and share it with the client.
2. Upload a client file.
3. Confirm unrelated users cannot access either file.
4. Add staff discussion/activity entries.
5. Publish a progress update with review requested.
6. Confirm the review request email is sent and the exact update decision is stored.

### Deliverables and revision rounds

1. Create an approval-required deliverable.
2. Issue deliverable version 1.
3. Confirm the client receives a deliverable-review email.
4. Request changes.
5. Issue version 2 / revision round 2.
6. Approve version 2.
7. Confirm approval is tied to version 2 rather than the deliverable generically.

### Change requests

1. Create a client-originated change request.
2. Evaluate it in staff.
3. Publish cost, schedule and scope impact.
4. Confirm the client receives the change-proposal email.
5. Accept it as the client.
6. Apply it as staff.
7. Repeat once with rejection to verify both branches.

### QA, delivery and handoff

1. Attempt to enter Delivery before QA/approvals are complete and confirm it is blocked.
2. Pass or validly waive all required QA checks.
3. Confirm all required deliverables are approved and no change request is unresolved.
4. Move to Delivery.
5. Release final work and confirm the release email is sent.
6. Acknowledge receipt as the authorized client reviewer.
7. Complete or validly waive all required handoff items.
8. Record support dates/terms and the closeout summary.
9. Move to Handoff and complete the project.
10. Confirm the completion email is delivered.

## 4. Deadline reminder check

Create a temporary client-owned project task and onboarding item with controlled due dates. Run the communication cron manually with the correct bearer token in a safe environment and verify the bounded schedule:

- 3 days before due date
- due date
- one overdue reminder

Confirm repeated cron runs do not duplicate the same reminder window.

## 5. Isolation and revocation

Verify with two unrelated test client accounts:

- Client A cannot open Client B's project URL.
- Client A cannot download Client B's files.
- Client A cannot review Client B's brief, deliverables or changes.
- A non-reviewer project member can view allowed project material but cannot make reviewer-only decisions.
- Revoking a project assignment immediately removes project access.
- Public `bivi.pro` cannot expose staff/client private API responses.
- Staff and client authentication cookies remain isolated to their own hosts.

## 6. Final sign-off

Do not treat the workflow as launch-ready until all of these are true:

- configuration checks pass
- platform tests pass
- production build passes
- three-domain launch verifier passes
- one complete inquiry-to-closeout dry run passes
- one unrelated-client isolation test passes
- email delivery and cron reminders are confirmed
- unfinished Help/Resources surfaces remain undiscoverable
- launch service catalog and commercial assumptions are finalized

Record any failure as a launch blocker or an explicitly accepted follow-up before opening the workflow to real clients.
