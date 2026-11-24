# Bivi Template Studio — Implementation Ledger

> **Ledger status:** initialized 2026-11-23. All application features below are **PENDING**. The only completed work in this initiative is documentation on a **planning branch** in [PR #31](https://github.com/0445968/0011/pull/31), **open/not merged**. This ledger is separate from Bivi Projects' `docs/BIVI_PROGRESS.md` and does not imply any existing staff/client application changes.
>
> Read [MASTER_BLUEPRINT.md](./MASTER_BLUEPRINT.md), [VENDOR_OWNERSHIP_COST_STANDARD.md](./VENDOR_OWNERSHIP_COST_STANDARD.md), and [NEXT_CHAT_HANDOFF.md](./NEXT_CHAT_HANDOFF.md).

## 1. Status vocabulary and evidence requirements

- **PLANNED:** requirements agreed in writing, no implementation.
- **IN PROGRESS:** code work begun on a named branch, no merge/production proof.
- **DELIVERED — CODE:** merged at an exact SHA, no automatic claim of production testing.
- **TESTED — AUTOMATED:** specified tests executed on a commit/environment and recorded.
- **TESTED — STAGING:** staging deployment verified with scenario evidence.
- **ACCEPTED — PRODUCTION:** authorized client/staff performed signoff in intended environment.
- **PARTIAL / REPAIR:** existing implementation insufficient; fix existing source instead of duplicating.
- **DEFERRED:** intentionally postponed with rationale and revisit trigger.
- **BLOCKED:** dependency/approval prevents progress; document exact unblock.

Each batch must log: baseline SHA; branch; PR URL; changed paths; new repo/project IDs if provisioned; vendor approvals/price dates; migrations file vs actual applied version; tests/commands/results; security/role checks; Vercel status if deployed; owner/acceptance; outstanding issues; next batch. Any unexecuted check remains **UNVERIFIED**, not "passed".

## 2. Proven baseline on initial planning date

- Bivi repo: `0445968/0011`; production branch `restore`.
- HEAD observed before new docs branch: `5f584c62dbb9994505fb765a3c428a1ae397a0a8` (merged documentation PR #30 dated 2026-10-30).
- Existing Bivi workspace docs: `AGENTS.md`, `docs/BIVI_MASTER_PLAN.md`, `docs/BIVI_PROGRESS.md`, `docs/BIVI_NEXT_STEPS.md`.
- Existing user-facing staff system: `staff.bivi.pro`, built on Next.js 13.5.x/React 18 + Supabase. Do not copy its version pins blindly into a new template platform; choose supported versions after review.
- Current Studio repository, Studio Supabase, Studio Vercel project, domain, sign-on, client app generator, approved vendor catalog, cost estimator, and integration do **not** exist as proven deployed deliverables in this ledger.
- Initial documentation branch: `planning/bivi-private-template-studio-2026-11-23`. Exact PR and final commit are to be recorded only after creation/merge.
- No database migrations, staff role changes, email sends, vendor purchases, DNS changes or deployments are authorized by this planning document.

## 3. Milestone map

| Batch | Name | Status at creation | First proof / checkpoint |
| --- | --- | --- | --- |
| **BTP-00** | Planning package | **DELIVERED — BRANCH; PR #31 OPEN / NOT MERGED** | Master plan, vendor/cost/ownership standard, ledger, handoff, PR |
| **BTP-01** | Platform repo and contracts | PLANNED | New isolated repo, design tokens, module/estimator contracts, mock fixtures, test harness, approved Bolt gate |
| **BTP-02** | Bolt salon design pilot | PLANNED / WAIT FOR GATE | Website + owner dashboard + staff/customer portal interactive mocks, exported reviewed source, credit metrics |
| **BTP-03** | Functional salon reference | PLANNED | Auth/RLS, booking, customer/staff roles, notifications, provider adapters, real integration tests |
| **BTP-04** | Pet care reuse validation | PLANNED | Same core booking/CRM engine reused, measurable customization hours and safe versioning |
| **BTP-05** | Vendor catalog & estimate engine | PLANNED | Versioned pricing, dependency dedupe, cost scenarios, proposal snapshot and tests |
| **BTP-06** | Ownership, provisioning & handoff | PLANNED | Account registry/technology passport, managed/independent runbooks, transfer drill |
| **BTP-07** | Private Studio v1 | PLANNED | Staff-only authenticated preset/design/module library and previews |
| **BTP-08** | Bivi Workspace linkage | PLANNED | Restricted project linkage and cost proposal data exchange without replacing Bivi authoritative records |
| **BTP-09** | App generator/deployment | PLANNED | Reproducible GitHub/preview starter, audit, rollback, no purchase or production release without approval |
| **BTP-10** | Additional industry families | PLANNED | Mechanic, retail, construction, fitness, B2B, tutoring, content and other presets |
| **BTP-11** | Scale, security & operations | PLANNED | Vendor drift/alerting, maintenance, restores, tenant/security regression, fleet upgrades, independent exit rehearsal |

## 4. Detailed acceptance ledger by batch

### BTP-00 — Plans only
- [x] Read existing Bivi `AGENTS.md` and canonical Projects plan/progress/handoff.
- [x] Verify branch `restore` and base SHA before planning.
- [x] Create private Studio initiative branch (not `restore`).
- [x] Write master blueprint and vendor/ownership/estimator/handoff standard.
- [x] Commit implementation ledger and next-chat handoff.
- [x] Open [PR #31](https://github.com/0445968/0011/pull/31) against the production branch for review; **open/not merged**; do not merge without approval.
- [x] Record branch and [PR #31](https://github.com/0445968/0011/pull/31); docs-only, no features. Check current PR head SHA at time of review.

**Explicitly not done:** new application, vendor selections in production, service account creation, Bolt execution, runtime code changes, tests or signed-in acceptance.

### BTP-01 — Architecture and contracts
- [ ] Verify latest GitHub state and set the new independent repo boundary; use supported stack rather than blindly copying Bivi's older Next.js dependency tree.
- [ ] Adopt workspace/Studio API boundary, staff auth/SSO decision and least-privilege access policy.
- [ ] Define `TemplateManifest`, `ModuleManifest`, `IndustryPreset`, `ClientConfig`, `ProviderPlan`, `EstimateSnapshot`, `TechnologyPassport` and generation state machines.
- [ ] Create library conventions: layouts, design tokens, UI primitives, fixtures, Storybook-like internal component preview approach if justified, responsive and accessibility baseline.
- [ ] Create GitHub CI: lint, typecheck, unit tests, security/dependency checks, build; no fake passing stubs.
- [ ] Define three salon surface page inventories and role/permission matrix; specimen data never includes real clients.
- [ ] Establish first provider shortlist and how to record approvals and verify dates, no paid provider provisioning yet.
- [ ] Complete first **Bolt readiness checklist**: exact prompt objectives/screens, forbidden backends, token/visual system, source export workflow, credit cap, definition of done.
- [ ] **STOP:** before spending Bolt credits, review accepted BTP-01 architecture and provide the first exact Bolt.new prompt to user.

### BTP-02 — Bolt salon UI
- [ ] Front-end only React/TS/Tailwind website screens, dashboard screens, responsive customer/employee portal screens.
- [ ] Include realistic mock appointment flow and states but no fake persistence claims.
- [ ] Demonstrate light/dark where applicable and refined salon-specific UX (not generic recolor).
- [ ] All pages navigable with keyboard, narrow mobile checks, no inaccessible modal/menu basics.
- [ ] Export/commit source and document dependencies/licenses; record credit total and code cleanup hours.
- [ ] Keep separate from production: DESIGN or INTERACTIVE status only.

### BTP-03 — Salon production reference
- [ ] Create isolated test client environment, sample staff/customer roles, explicit service availability policy and time zone.
- [ ] Real backend/RLS, auth/recovery, appointments with conflict protection, audit, staff/customer scoped queries and reminder idempotency.
- [ ] Provider integration (mail and payment only if explicitly scoped), sandbox tests, signed webhooks, retry limits and documented expense assumptions.
- [ ] Protect real data; staging fixtures only; backup/restore verification and security scans.
- [ ] End-to-end: customer booking appears on staff dashboard + both portal views without double records.

### BTP-04 — Prove reuse before scale
- [ ] Pet profile and grooming workflow layered on shared salon booking engine without duplicate CRM/auth.
- [ ] No cross-client data collision; roles scoped to tenant/project; configuration and migration tested.
- [ ] Measure files copied, code reused, hours and new module count. Record what should be abstracted and what should remain industry-specific.
- [ ] Design-system quality review; decide whether next family is mechanic/field service or retail.

### BTP-05 — Pricing and proposal flow
- [ ] Versioned candidate/approved vendor plans; no fixed stale prices in code.
- [ ] Multi-environment provider cost aggregation (no double-count of shared dependencies).
- [ ] Low/base/high scenarios; annual prepay and variable fee distinction; taxes/limitations/exclusions visible.
- [ ] Client-existing tool recognition and incompatible combination warning.
- [ ] Price source/checked-at/expires-at, staff approval and quote snapshot immutability.
- [ ] Sample salon and mechanic test fixtures; exported Bivi proposal data contract (not an uncontrolled direct write).

### BTP-06 — Ownership and handoff
- [ ] Ownership/payer/operator matrix and onboarding owner actions.
- [ ] Technology Passport permissions, renewals, billing alerts, account recovery records with **secret references only**.
- [ ] Managed and independent service agreement checklist; separate maintenance and feature budgets.
- [ ] Test transfer of a sandbox/test client to a separate authorized owner; restore, reissue secrets, revoke access, verify live functionality.
- [ ] Legal/revenue/vendor restrictions and sensitive-sector gates documented.

### BTP-07 — Internal Studio
- [ ] Staff-only access and least privilege, no public catalog route; safe demo preview only.
- [ ] Search/filter by industry, family, surfaces, statuses, dependencies and versions.
- [ ] Brand/theme configuration, module selection, pricing impacts, compatibility guard and version pinning.
- [ ] One-client trial manually generates manifest and records approval; generator may remain manual at this stage.

### BTP-08 — Bivi integration
- [ ] Client/project authorization boundary validated; scope-limited API and idempotent correlation.
- [ ] Project open-in-Studio link, manifest/project reference backfill; accurate deployment status only with evidence.
- [ ] Proposal/estimate snapshots in Bivi, owner/payer support details in permitted client view, no duplicate project/CRM store.
- [ ] Bivi `restore` changes independently reviewed under existing `AGENTS.md` and Projects release rules.

### BTP-09 — Project generator
- [ ] Deterministic generation from manifest; versioned source and dependency lock.
- [ ] Repository creation, staging env and secrets bootstrap, CI + preview deployment; cleanup on failure.
- [ ] No automatic purchases, email invitations, KYC or public-domain go-live.
- [ ] Audit logs, retries, idempotency and permission checks; generate handoff packet draft.

### BTP-10 — Broaden industry library
- [ ] Reuse-first expansion with distinct visual and functional design families.
- [ ] Track third-party software obligations per preset; PWA/mobile gating.
- [ ] Sensitive healthcare, childcare and financial services require separate approval/assessment before handling actual sensitive data.

### BTP-11 — Operational maturity
- [ ] Automated module-version fleet view and safe staged upgrades.
- [ ] Price drift review cadence; alert thresholds and real renewal handling.
- [ ] Security audit, restore drill, customer data export, vendor transfer reality check and client-acceptance evidence.
- [ ] Performance, accessibility, privacy, 3-surface business workflow tests.
- [ ] Document achieved median time-to-preview, effort saved and exception rate; compare against targets not assumptions.

## 5. Release evidence and change history

| Date | Initiative | Branch / PR / SHA | Changes | Checks and limits | Acceptance |
| --- | --- | --- | --- | --- | --- |
| 2026-11-23 | BTP-00 | `planning/bivi-private-template-studio-2026-11-23` ([PR #31](https://github.com/0445968/0011/pull/31) open/not merged) | Planning docs and checklists only | Remote Bivi source/docs inspected; no app tests needed for Markdown-only documents; no production deployment | **Planning review pending** |

**Future entries must use real PR URLs and SHAs**, never invented numbers. Preserve append-only history after accepted batches. A planning PR is not BTP-01 or a deployed feature.

## 6. Decision and risk register

| ID | Question / risk | Provisional direction | Decision gate |
| --- | --- | --- | --- |
| D-01 | New repo / host | Separate Bivi private template-platform repo and Studio subdomain | BTP-01 |
| D-02 | Frontend stack | React/TypeScript/Tailwind/Next.js; responsive PWA first | BTP-01 |
| D-03 | Bivi production modifications | Deferred until BTP-08; narrow integration only | BTP-08 |
| D-04 | Template scope | Private internal production tools; no public gallery | Approved in this plan |
| D-05 | Client apps | Three coordinated surfaces in one default app | Approved in this plan |
| D-06 | Reusable IP | Bivi master library stays Bivi-owned; client rights contract-specific | Legal before first delivery |
| D-07 | Ownership & support | Client-owned, Bivi-managed preferred; independent handoff supported | Policy/legal gate |
| D-08 | Provider shortlist | Candidates only; verify prices, billing, portability | BTP-01 / each quote |
| D-09 | Bolt 20M allocation | 30/25/20/15/10 proposed; pilot first | After BTP-01 |
| D-10 | Credit expiry, unit and actual usage | Unknown until account check; no spend forecast guarantee | Before Bolt prompt |
| D-11 | Client data regulation | Independent legal/security review for sensitive sectors | Before real deployments |
| D-12 | Subscription resale | Optional, not default; no guaranteed consolidated billing | Legal and vendor terms gate |
| D-13 | Retainer/support pricing | Not established; create tier definitions and commercially approve | Before proposals |
| D-14 | Who owns generated repositories at creation | Prefer client-controlled or agreed incubator with transfer plan | BTP-01 |
| D-15 | SSO across Bivi/Studio | Explicit supported identity federation, never shared-cookie assumption | BTP-01 |

## 7. Update protocol for subsequent sessions

1. Read all four Studio documents plus current `AGENTS.md` and existing Bivi trackers if touching Bivi.
2. Fetch current `restore` and new Studio repo HEAD, recent PRs, CI, migrations and deployed environment; never rely on this document's historical baseline for coding.
3. Mark each relevant ledger item as delivered/repair/pending/unverified using code, deployed DB and acceptance evidence.
4. Implement one independently testable batch. Document authorization, spend, data and client ownership consequences before external side effects.
5. Run tests, open PR, wait for review/approval, record actual status and next exact batch; do not claim Bolt-ready until BTP-01 gate is satisfied.
6. If implementation splits into multiple repos, update this ledger (or a cross-linked successor) with both exact PRs and synchronized schema/API versions.
