# Bivi project roadmap

Current priorities are client onboarding and project management. Resources and Helpdesk pages are outside the current scope.

| Phase | Status | Deliverable |
| --- | --- | --- |
| Service catalog and inquiry intake | Applied by owner | Draft service blueprints, three-step intake, private inquiry storage |
| Internal leads review | Implemented; activation pending | Staff sign-in, filtered inquiry list, detail views, qualified/declined decisions, internal notes and review history |
| Proposal and accepted scope | Implemented; activation pending | Numbered drafts, fixed issued versions, scope and commercial terms, recorded external acceptance |
| Agreement and deposit references | Implemented; activation pending | Evidence records, reversible onboarding-readiness gate and snapshot history |
| Client onboarding | Implemented; activation pending | Staff-managed client-input checklist, contacts, kickoff records, completion and review history |
| Internal project management | Implemented; activation pending | Gated activation, fixed starting snapshots, milestones, tasks, owners, due dates, progress and history |
| Client progress, reviews and delivery links | Implemented; activation pending | Project-scoped client portal, explicit publications, versioned decisions and HTTPS handoff links |
| File exchange | Implemented; activation pending | Private project uploads, stored-file verification, authorized attachment downloads, staff sharing/withdrawal and history |
| Production rollout | Verification tools implemented; live checks pending | Repeatable database/configuration/HTTP checks plus real-account and hosted Storage verification |

Apply the second migration and staff setup described in LEADS_WORKSPACE_SETUP.md before using internal review. A Qualified inquiry means ready for proposal preparation; it does not create a booked project.

Proposal activation: apply the third migration and follow PROPOSALS_SETUP.md. Staff-recorded acceptance preserves the selected scope version; agreement and deposit checks still precede project activation.

Onboarding gate activation: apply the fourth migration and follow ONBOARDING_GATE_SETUP.md. The gate records readiness; checklist and project activation follow in the client-onboarding batch.

Client onboarding activation: apply the fifth migration and follow CLIENT_ONBOARDING_SETUP.md. Completion is bound to the current readiness revision; project activation and task management are next.

Project workspace activation: apply the sixth migration and follow PROJECT_WORKSPACE_SETUP.md. Internal project management is implemented; the client portal and file exchange batches extend it.

Client portal activation: apply the seventh migration and follow CLIENT_PORTAL_SETUP.md. Only assigned clients can access available published updates. The eighth migration adds private file exchange; live production verification remains pending.

File exchange activation: apply the eighth migration and follow FILE_EXCHANGE_SETUP.md. PRODUCTION_VERIFICATION.md tracks the remaining live checks; local simulation is complete, and deployment verification remains pending. Resources and Helpdesk remain outside scope.

Production readiness: follow PRODUCTION_READINESS_SETUP.md. Run `npm run verify:platform`, verify the deployment configuration, then run the HTTP checker against the canonical host. No additional migration is needed. Complete the authenticated checks in PRODUCTION_VERIFICATION.md before marking rollout verified.
