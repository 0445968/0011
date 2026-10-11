# Bivi project roadmap

Current priorities are completing the Release 3 client workflow. Resources and Helpdesk pages are outside the current scope.

| Phase | Status | Deliverable |
| --- | --- | --- |
| Service catalog and inquiry intake | Applied by owner | Draft service blueprints, three-step intake, private inquiry storage |
| Internal leads review | Implemented; owner reports verified | Staff sign-in, filtered inquiry list, detail views, qualified/declined decisions, internal notes and review history |
| Proposal and accepted scope | Implemented; owner reports verified | Numbered drafts, fixed issued versions, scope and commercial terms, recorded external acceptance |
| Agreement and deposit references | Implemented; owner reports verified | Evidence records, reversible onboarding-readiness gate and snapshot history |
| Personalized client onboarding | Implemented; activation pending | Service-driven requirements, pre-activation client access, autosaved client responses, staff acceptance/clarification/waivers, onboarding uploads and client profile |
| Internal project management | Implemented; owner reports verified | Gated activation, fixed starting snapshots, milestones, tasks, owners, due dates, progress and history |
| Client progress, reviews and delivery links | Implemented; owner reports verified | Project-scoped client portal, explicit publications, versioned decisions and HTTPS handoff links |
| File exchange | Implemented; owner reports verified | Private project/onboarding uploads, stored-file verification, authorized downloads, staff sharing/withdrawal and history |
| Production rollout | Prior workflow verified by owner, 2026-10-07 | Repeatable checks and owner-reported live verification; enhancements need separate verification |
| Project discussion and activity | Implemented; activation pending | Internal task/project comments, author edits/removal and a unified staff timeline |
| Account recovery and invitations | Implemented; activation pending | Staff access assignments, private invitation links and client password recovery |
| Project brief and client tasks | Next | Structured brief review, lifecycle phase, client/Bivi task ownership, dependencies and next-action dashboard |
| Approvals, change requests, QA and handoff | Planned | Version-linked approvals, revision rounds, scope changes, QA, final release, support and closeout |
| Essential email and deadline communication | Planned | Onboarding/action/review/delivery notices and bounded reminders |

Apply migrations in order. A Qualified inquiry remains a lead until the accepted scope, agreement/deposit readiness and onboarding gates are satisfied.

Migration 011 activation: apply `202610100011_client_profile_personalized_onboarding.sql` after migration 010 and follow `PERSONALIZED_ONBOARDING_SETUP.md`. It allows client workspace access after the accepted scope and agreement/deposit gate are ready, before project activation. Staff still owns final onboarding completion and project activation.

The next Release 3 batch is the project brief and client-task model. Notifications are intentionally later so alerts are attached to stable actions rather than temporary workflow states.
