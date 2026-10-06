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
| File exchange | Next | Private file storage, uploads, download permissions and handoff records |
| Production rollout | Planned | Live environment verification, access review and end-to-end operating checks |

Apply the second migration and staff setup described in LEADS_WORKSPACE_SETUP.md before using internal review. A Qualified inquiry means ready for proposal preparation; it does not create a booked project.

Proposal activation: apply the third migration and follow PROPOSALS_SETUP.md. Staff-recorded acceptance preserves the selected scope version; agreement and deposit checks still precede project activation.

Onboarding gate activation: apply the fourth migration and follow ONBOARDING_GATE_SETUP.md. The gate records readiness; checklist and project activation follow in the client-onboarding batch.

Client onboarding activation: apply the fifth migration and follow CLIENT_ONBOARDING_SETUP.md. Completion is bound to the current readiness revision; project activation and task management are next.

Project workspace activation: apply the sixth migration and follow PROJECT_WORKSPACE_SETUP.md. Internal project management is implemented; client-facing progress and delivery are subsequent work.

Client portal activation: apply the seventh migration and follow CLIENT_PORTAL_SETUP.md. Only assigned clients can access available published updates. File exchange and live production verification remain subsequent work.
