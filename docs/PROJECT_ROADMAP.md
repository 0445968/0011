# Bivi project roadmap

Current priorities are client onboarding and project management. Resources and Helpdesk pages are outside the current scope.

| Phase | Status | Deliverable |
| --- | --- | --- |
| Service catalog and inquiry intake | Applied by owner | Draft service blueprints, three-step intake, private inquiry storage |
| Internal leads review | Implemented; owner reports verified | Staff sign-in, filtered inquiry list, detail views, qualified/declined decisions, internal notes and review history |
| Proposal and accepted scope | Implemented; owner reports verified | Numbered drafts, fixed issued versions, scope and commercial terms, recorded external acceptance |
| Agreement and deposit references | Implemented; owner reports verified | Evidence records, reversible onboarding-readiness gate and snapshot history |
| Client onboarding | Implemented; owner reports verified | Staff-managed client-input checklist, contacts, kickoff records, completion and review history |
| Internal project management | Implemented; owner reports verified | Gated activation, fixed starting snapshots, milestones, tasks, owners, due dates, progress and history |
| Client progress, reviews and delivery links | Implemented; owner reports verified | Project-scoped client portal, explicit publications, versioned decisions and HTTPS handoff links |
| File exchange | Implemented; owner reports verified | Private project uploads, stored-file verification, authorized attachment downloads, staff sharing/withdrawal and history |
| Production rollout | Prior workflow verified by owner, 2026-10-07 | Repeatable checks and owner-reported live verification; enhancements need separate verification |
| Project discussion and activity | Implemented; activation pending | Internal task/project comments, author edits/removal and a unified staff timeline |
| Account recovery and invitations | Planned | Client access setup and recovery flows |
| Notifications and deadlines | Planned | Project updates, review alerts and deadline reminders |

Apply the second migration and staff setup described in LEADS_WORKSPACE_SETUP.md before using internal review. A Qualified inquiry means ready for proposal preparation; it does not create a booked project.

Proposal activation: apply the third migration and follow PROPOSALS_SETUP.md. Staff-recorded acceptance preserves the selected scope version; agreement and deposit checks still precede project activation.

Onboarding gate activation: apply the fourth migration and follow ONBOARDING_GATE_SETUP.md. The gate records readiness; checklist and project activation follow in the client-onboarding batch.

Client onboarding activation: apply the fifth migration and follow CLIENT_ONBOARDING_SETUP.md. Completion is bound to the current readiness revision; project activation and task management are next.

Project workspace activation: apply the sixth migration and follow PROJECT_WORKSPACE_SETUP.md. Internal project management is implemented; the client portal and file exchange batches extend it.

Client portal activation: apply the seventh migration and follow CLIENT_PORTAL_SETUP.md. Only assigned clients can access available published updates. The eighth migration adds private file exchange; prior live verification was reported complete by the owner on 2026-10-07.

File exchange activation: apply the eighth migration and follow FILE_EXCHANGE_SETUP.md. PRODUCTION_VERIFICATION.md tracks the remaining live checks; local simulation is complete, and the owner reported prior deployment verification complete on 2026-10-07. Resources and Helpdesk remain outside scope.

Production readiness: follow PRODUCTION_READINESS_SETUP.md. Run `npm run verify:platform`, verify the deployment configuration, then run the HTTP checker against the canonical host. No additional migration is needed. Retain the authenticated-check evidence in PRODUCTION_VERIFICATION.md; the owner reported the prior workflow verified on 2026-10-07.

Enhancement activation: apply migration 009 and follow PROJECT_DISCUSSION_SETUP.md. The owner reported prior live verification complete on 2026-10-07; new enhancements still require installation and live checks.
