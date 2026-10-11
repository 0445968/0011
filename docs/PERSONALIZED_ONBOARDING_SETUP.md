# Personalized client onboarding and profile

This batch is Release 3A. It requires migrations 001–010, including client access, the account subdomains, and the existing project-file bucket.

## What changes

- Client access can be assigned after accepted scope and the agreement/deposit gate are ready. Project activation is no longer required just to invite the client.
- Each access assignment belongs to a client organization record; direct project authorization remains on `project_clients` so existing RLS stays narrow.
- Clients get a profile at `https://app.bivi.pro/profile`.
- Starting onboarding seeds deduplicated requirements from the accepted service blueprints.
- Client-owned items autosave draft text and can be submitted for staff review.
- Staff can accept, request clarification, waive, add, edit or remove requirements. All item changes keep history.
- Required personalized items must be accepted or waived before staff can complete onboarding.
- Client uploads work during onboarding before project activation.
- Project activation snapshots the accepted personalized onboarding rows in `onboarding_items_snapshot`.

The original staff onboarding checklist remains the final staff verification/kickoff record. This is deliberate: migration 011 does not discard or rewrite the history created by migration 005.

## Install

1. Apply the code patch after the current `restore` baseline.
2. Apply only `supabase/migrations/202610100011_client_profile_personalized_onboarding.sql`. Do not rerun migrations 001–010.
3. Run:

```bash
npm run typecheck
npm run verify:platform
npm run build
```

4. Deploy to the same Vercel project serving `bivi.pro`, `app.bivi.pro`, and `staff.bivi.pro`.

`verify:platform` remains an important regression suite for migrations 001–010. Migration 011 changes the pre-activation workflow and must additionally pass the test-account dry run below before real use.

No new environment variables are required.

## Staff workflow

1. Qualify an inquiry, accept the proposal, and release the agreement/deposit gate.
2. Open **Onboarding** and start the checklist. Bivi generates requirements from the accepted proposal's service blueprint IDs and versions. Shared requirement IDs are generated once even if several services use them.
3. Open **Manage client workspace access** from onboarding. Prepare an invitation or assign an existing Supabase Auth UUID. This can happen before project activation.
4. The client signs in at `app.bivi.pro`, completes their profile, opens onboarding, and submits requirements/files.
5. Review each submission. Accept it, request clarification, or waive it with a reason. Add project-specific requirements or adjust due dates/dependencies when needed.
6. Complete the original staff verification checklist and kickoff record. Final onboarding completion is blocked until every required personalized item is accepted or waived.
7. Activate the project. The normalized onboarding item snapshot is stored on the project alongside the existing scope/readiness/onboarding snapshots.

## Client behavior

Draft text is autosaved after a short idle period. Submission is separate from acceptance. A submitted item becomes read-only until Bivi either accepts it or returns it for clarification.

File-upload requirements use the existing private Supabase Storage bucket and the project file APIs. A client can upload before activation because the access assignment now belongs to the inquiry/workspace rather than requiring an `inquiry_projects` row.

Access-invitation items explicitly tell clients not to paste passwords, recovery codes, private keys, API tokens or other secrets. Use provider invitations or another secure credential-sharing process.

## Existing records

Migration 011 backfills the three legacy onboarding checklist items into the normalized item table so existing records remain readable. It does not invent service-specific requirements for already-started onboarding. For an existing onboarding record, staff can add any missing project-specific requirements manually.

Existing project/client/file foreign keys are moved from `inquiry_projects` to the parent `project_inquiries` record. Existing data remains valid because every active project already has that parent inquiry.

## Verification before a real client

Use a test client account and verify:

- invitation before project activation;
- client sign-in, profile save, and public-site avatar initial;
- dashboard shows the onboarding workspace before a publication exists;
- client draft autosave and explicit submission;
- staff clarification returns the item to the client;
- required items block onboarding completion until accepted/waived;
- onboarding file upload/download permissions;
- revoking access immediately removes onboarding/file visibility;
- completing onboarding then activating a project preserves `onboarding_items_snapshot`;
- another client account cannot read the test project, onboarding rows or files.

Do not use a production client until this dry run passes.
