# Bivi Private Template Studio — Master Implementation Blueprint

> **Status: PLANNED / documentation only.** Created 2026-11-23 for Bivi's future private client-production system. Nothing in this document constitutes an implemented Studio, active vendor integration, verified quote, approved legal agreement, or permission to deploy. Read the [Implementation Ledger](./IMPLEMENTATION_LEDGER.md), [Industry Preset Matrix](./INDUSTRY_PRESET_MATRIX.md), [Vendor/Ownership/Cost Standard](./VENDOR_OWNERSHIP_COST_STANDARD.md), and [Next-Chat Handoff](./NEXT_CHAT_HANDOFF.md) alongside this plan.
>
> **Repository of record for this plan:** https://github.com/0445968/0011. **Existing Bivi production:** `restore`, `staff.bivi.pro`. **Existing Bivi Projects planning:** `docs/BIVI_MASTER_PLAN.md`, `docs/BIVI_PROGRESS.md`, `docs/BIVI_NEXT_STEPS.md`. These remain authoritative for the **existing** workspace; this plan is a **parallel, new product initiative**, not a replacement or permission to alter Bivi production. The proposed Studio hostname `studio.bivi.pro` is **not claimed to be configured or reserved**.

## 0. Executive decision record

Bivi will build a **private, staff-only application-production system** that minimizes the time from client onboarding to a working, branded client application. **There is no public template catalog, third-party template marketplace, drag-and-drop Wix competitor, or requirement to sell templates.** All reusable assets belong within Bivi's private internal workflow.

A client solution is, by default, **one business platform with three coordinated surfaces**:

1. **Public website** — marketing, services, contact, lead conversion, catalog, ordering or booking as applicable.
2. **Owner/staff dashboard** — internal operations: orders, customers, employees, projects, scheduling, approvals, reports.
3. **Customer/employee mobile portal** — role-specific responsive web/PWA experience, not automatically a separate app-store app.

Each surface shares approved contracts, a coherent data model and authoritative server-side permissions. A three-surface package is a **default option**, not a requirement to charge each client for features they do not need. One Next.js app with route groups, separate layouts and permission boundaries is the preferred initial output; split applications or native Expo apps only when needs justify the cost.

Bivi's existing staff workspace remains the **commercial and delivery system of record** (companies, contacts, proposals, projects, approvals, invoices, support, service ownership); the independent Studio is the **software assembly system of record** (template versions, design kits, module selection, industry presets, generation and preview manifests, compatibility checks). They integrate through authenticated scoped APIs and identifiers; they do not share production databases by default.

### Success measures (initial targets, not promises)

- For a client who fits a tested preset: produce a **branded, functional preview within one business day** after receiving required assets and approvals; separately measure time to production release.
- Target **80–90% preassembled coverage** for standard projects, measured against a defined bill of features rather than claiming all projects are 90% complete.
- Produce an explainable **low / expected / high** cost projection, with dated assumptions and itemized owner/payer, before the proposal is sent.
- Client operates primarily through their business application and a Bivi technology summary, not a maze of technical provider dashboards.
- Exit readiness exists **before** production launch: a client can move to independent operations or another provider without surrendering business data or a proprietary Bivi template library.
- New design families must demonstrate reuse in a **second industry** before a library is declared stable.

## 1. Non-goals and protections

- No public storefront, discoverable source gallery, external template license selling, resale marketplace or customer-facing builder.
- No forced migration or rewrite of Bivi's current Projects, People, Companies or portal during the initial Studio phases.
- No direct commits to `restore`, no production DNS or Supabase changes, and no emails / invites / billing subscriptions without explicit later authorization.
- No uncontrolled AI-generated backend code, fabricated API integrations, fake payments, hardcoded secrets, placeholder compliance claims or features described as production ready solely because a UI demo works.
- No "one size fits all" SaaS code that collapses sensitive healthcare/childcare/finance data into a generic open database.
- No assumption that a vendor's advertised starting price equals an accurate client bill.
- No client lock-in created by Bivi owning indispensable client identity, domain, payment merchant account or client data.

## 2. Boundaries and system architecture

**A. Bivi Workspace (existing repository):**
- Remains authoritative for client organization, Bivi staff and assignments, internal project/contract, pricing and proposal decisions, billing arrangement, maintenance agreement, approvals and handoff status.
- Adds only narrowly scoped Studio project links, technology passport, proposal-cost snapshots and service records in later approved workspace batches. Reuse current access patterns/RLS; no second client/contact/project store.
- Navigation entry opens private Studio by a deep link, rather than embedding Studio in existing Workspace code.

**B. Bivi Template Platform (future separate repository):**
- New proposed GitHub repo: `bivi-template-platform` (name not yet provisioned); deployed as a distinct Vercel project and candidate private hostname `studio.bivi.pro`.
- Separate Supabase project/environment for Studio's own catalog, generated-project manifests, role access, vendor metadata and cost rules. Do **not** point it at the current Bivi production DB.
- Reference architecture: monorepo with `apps/studio`, `apps/showcase-internal`, `packages/ui`, `packages/themes`, `packages/layouts`, `packages/domain-contracts`, `packages/module-interfaces`, `packages/vendor-adapters`, `packages/estimator`, `templates/{family}/{preset}`, `tooling`, `tests`, `docs`.
- Prefer React + TypeScript + Tailwind + Next.js App Router for final web projects; component foundation evaluated by maintainability, accessibility and license (e.g. Radix/shadcn/ui), not assumed to be automatically compatible with the existing Bivi theme.
- API contracts/schema validation, immutable template/module releases, semantic versions, signed/auditable generation manifests. Use pins and a controlled update path so a library change cannot break existing clients without review.
- Minimum security: staff-only access; no public download; least-privilege read/write roles; event/audit logging; rate limits; idempotent generation endpoints; malware/source-dependency scanning.

**C. Each client project (generated output):**
- Default: dedicated repository, independent production deployment, appropriate client-specific Supabase project, protected environment variables and domain.
- One client app may host `/(site)`, `/(dashboard)`, `/(portal)` route groups and role-aware layouts; the actual URL strategy is configurable (one domain or subdomains). Never assume that a route-group label itself implements security.
- Server-verified roles + organization scopes + RLS/storage rules; backups and restores; client-specific identity; separate staging/production; independent billing/ownership metadata.
- Templates contain source for client-facing screens and the agreed licensed runtime dependencies. Studio itself and cross-client administration tools are **not** embedded in the client app.
- High-risk or specialized projects may need dedicated vendors, separate environments or a different architecture based on review.

**Integration Bivi ↔ Studio:** use signed short-lived requests/service-to-service credentials, explicit allowlisted scopes, idempotency and correlation IDs; exchange minimum identifiers and approved fields only. No passing passwords, reusable JWTs, provider secrets or customer data in deep-link query strings. Client project creation posts back references such as `bivi_project_id`, generated project ID, GitHub/Vercel references, selected versions and preview state. Studio never directly mutates Bivi project task/milestone/approval stores.

## 3. Three-surface application specification

### Public website
Common routes: home, services/products, details, about/team, pricing/quotes, reviews/portfolio, contact/lead capture, policies, booking/checkout where applicable, privacy/accessibility. Prepare SEO/meta/structured-data options, responsive navigation, forms, content blocks, 404/error/empty/loading states and performance baseline.

### Owner and staff dashboard
Core layouts: classic sidebar SaaS, scheduling-first, commerce operations, projects/workspace, field-service dispatch and analytics/executive views. Standard interactions: tables (search/filter/sort/pagination), calendar, Kanban, status and reporting, bulk actions, editable forms, audit trails, notifications, responsive mobile layouts and permissions-driven navigation.

### Mobile portal
Role-specific customer and employee experiences: authentication, profile, bookings/classes/orders, receipts/invoices, messages/notifications, documents, approvals and status; employee shift list/jobs, assignments, task completion, customer visit notes and scheduling where authorized. PWA first when suitable, including offline/notification behavior only if explicitly implemented and tested. Expo/native only where push, camera, background location, offline complexity or app-store requirements justify another operational surface.

### Cross-surface consistency tests
Appointment booked publicly appears on correct staff calendar and customer account; order recorded once; payment webhooks update one authoritative payment state; employee cannot view another organization's work; cancellation/reschedule propagates correctly; time zones and notification idempotency hold; mobile layout does not leak administrative controls.

## 4. Reusable design and module model

**Design tokens:** color ramps, typography, spacing, radii, shadows, borders, motion, breakpoints and high-contrast modes; theme-specific tokens, not search-and-replace styling. Preserve the **existing Bivi site typography and UI**; a future Studio can have its own Bivi-branded UI.

**Reusable component tiers:**
1. Accessibility-tested primitives (buttons, dialogs, inputs, menus, tables, chart wrappers).
2. Layouts and screen patterns (sidebar, tabs, filters, calendar shell, editor, card, forms, onboarding flows).
3. Business modules (server interfaces + UI + migrations + tests + audit) with explicit config and ownership.
4. Industry presets (composition, role matrix, terminology, pages, rules and recommended vendors).
5. Client configuration (branding, content, enabled features, settings, account ownership, production endpoints).

**Module contract must include:** stable module ID/version, surface availability, dependencies, migrations/schema compatibility, required roles/scopes, authorization tests, external service adapters, configuration schema, generated routes/UI slots, accessibility/locale/timezone support, demo fixtures, rollback/downgrade policy, billing dependencies and estimated usage drivers, handoff requirements, operational runbook, production readiness level.

**Readiness labels:** DESIGN (visual/mock data), INTERACTIVE (client-side demo), INTEGRATED (real backend but incomplete hardening), PRODUCTION-READY (audited, tested, monitored with runbook). Do not silently promote across labels.

**Core platform modules:** identity/account recovery, organizations and membership, role permission policy, CRM contacts/companies, staff rosters, file storage, activity/audit, notifications, consent, configurable forms, settings, search and analytics.

**Business modules:** appointments/availability; classes and attendance; memberships; estimates/quotes/invoices; work orders and dispatch; inventory/catalog; orders and fulfillment; digital entitlements; payments/refunds/webhooks; projects/milestones/tasks; client requests and approvals; messaging; reporting; scheduling/cron/workflows; marketing integrations; document signing; loyalty and reviews as optional extensions.

**Data design:** shared canonical entities and safe module-specific tables; no duplicate contacts/orders/tasks per view. Use stable IDs and explicit tenant/organization ID, recorded ownership and timestamps. Modules must expose supported events and adapters instead of importing each other's UI internals.

## 5. Industry coverage and sequencing

| Family | Initial industry presets | Defining variation |
| --- | --- | --- |
| Appointments & personal care | beauty salon, spa, barbershop, pet grooming | services, staff/resource availability, deposits, packages |
| Retail & commerce | online store, boutique, brick-and-mortar shop, digital product store | products, POS/Shopify/Square integration, order/fulfillment/entitlement |
| Field service & repair | mechanic shop, HVAC, cleaning, home maintenance, landscaping | dispatch, estimates, work orders, parts, client updates |
| Project & event services | construction, renovation, event planning, agency | milestones, assets, approvals, contractor/customer collaboration |
| Membership & fitness | gym, fitness/yoga/dance studio, clubs | subscriptions, classes, attendance, capacity |
| Education & childcare | tutoring, training, childcare | learner/guardian identity, scheduling, attendance, permissions |
| Health & care | clinic, wellness, home care | intake, scheduling, care-team workflows; elevated privacy gates |
| B2B & professional | consulting, accounting, legal-adjacent services, agencies | CRM, proposals, client portal, projects, invoices |
| Content & media | newsroom, content creator, paid community | editorial CMS, role workflows, publishing, subscriptions |
| Financial operations | bookkeeping, advisors, finance services | statements, invoice/reporting, approval trails; regulated-data review |
| Other later | hospitality, real estate, nonprofits, specialty services | add when requested/validated by sales pipeline |

**Pilot order:** salon → pet grooming reuse validation → mechanic or field service → retail/commerce → construction/projects → fitness → B2B → education/content → sensitive regulated sectors after controls. Do not fabricate production compliance for healthcare, childcare or financial services; legal/privacy, consent, age restrictions and vendor agreements must be evaluated before onboarding real sensitive records.

**Visual diversity:** each family has distinctive client journeys, terminology, navigation priority and information architecture, not just different colors. Target 4–6 website architectures, 6–8 dashboard architectures, customer and employee portal foundations, and then multiple themed industry presets. These are planning ranges, not guaranteed credit output.

## 6. Client onboarding-to-delivery workflow (target state)

1. **Lead/discovery in Bivi:** record industry, locations, staff/user counts, monthly transactions, existing tools, compliance concerns, domain, brand assets, payments, required three surfaces and desired support model; mark assumptions versus confirmed facts.
2. **Scope recommendation:** module compatibility engine suggests industry preset and website/dashboard/portal surfaces; Bivi staff reviews gaps, integration alternatives and required customization.
3. **Technology estimate:** resolve shared dependencies, query verified price catalog, evaluate expected usage and include low/base/high totals, owner/payer and excluded fees; identify services that must be client-approved or established manually.
4. **Proposal and contract in Bivi:** separate build fee, mandatory/optional fixed subscriptions, variable transaction usage, annual commitments and optional support/feature retainers; explicitly identify IP/license and transfer rights.
5. **Owner account provisioning:** confirm ownership email, register/verify domain and payment/business accounts in client's legal entity; enable MFA and recovery; delegate Bivi access. No passwords exchanged by email. Client performs KYC/terms acceptance/payment authorization when required.
6. **Create application in Studio:** choose pinned versions, preset, three surfaces, theme, modules, access policy, provider adapters, domain/subdomains; run compatibility and cost checks; generate project manifest and repository.
7. **Preview:** inject approved branded copy/images/assets, demo data or properly partitioned test data, connect staging services, issue preview link to Bivi project; capture requested changes and approval history.
8. **Integration/test:** configure actual provider accounts and scoped credentials, webhooks, email DNS/auth, payments in test mode, scheduling, retries/idempotency, permission checks, performance/accessibility/security scans and backup restore.
9. **Launch:** obtain go-live authorization, verify billing alert contacts, finish DNS/routing, deploy production, verify real transactions only with consent, capture signed-off acceptance.
10. **Operate or transfer:** managed service monitors and maintains under SLA; independent client receives complete operational handoff and verified access revocation. Both are supported without rebuilding.

Bivi's **client-facing experience** should show website status, estimated spend/renewals, who is responsible, support requests and required client approvals — not expose Vercel env vars or Supabase SQL. Technical accounts may be client-owned and rarely used.

## 7. Ownership, billing and IP policy summary

- Default **client-owned, Bivi-managed** production domain, merchant/payment identity, business mail, production application service accounts and business data. Bivi receives delegated least-privilege access. Client remains able to recover access.
- Alternative **Bivi-consolidated managed services** for clients requesting one invoice, only with written terms for vendor resale/limits, service responsibility, pass-through/markup, data export, transfer rights and termination. Never imply Bivi can transfer an account when a provider restricts transfers.
- Source: default separate client application repository under agreed ownership with licenses to Bivi's pre-existing libraries and third-party dependencies. Contract must distinguish Bivi-owned Studio, reusable components, bespoke paid work, brand assets, source distribution, ongoing runtime licenses and post-termination rights. Legal review required.
- Payment accounts/KYC, domain registration and customer data should remain under client's business identity; business owner retains emergency admin recovery and direct billing visibility where relevant.
- Retainer **maintenance/operations** separate from **feature/change development**; define response times, included hours, vendor outages, backup retention and security response responsibilities.
- Standalone exit is always an accepted lifecycle path, with tested transfer and credential rotation.

See [Vendor / Ownership / Cost Standard](./VENDOR_OWNERSHIP_COST_STANDARD.md) for the authoritative matrix, cost schema and handoff checklist.

## 8. Approved-vendor program and integration strategy

A **governed shortlist**, not a forced provider for all situations:

- Hosting/deployment: Vercel preferred for compatible Next.js apps; evaluate plan, seats, bandwidth and client ownership.
- Database/auth/storage: Supabase candidate default, isolated per client as appropriate; enforce RLS/tenant boundaries, migrations, backups and recovery.
- Domain/DNS: client-owned registrar; Cloudflare as DNS/registrar candidate where appropriate.
- Business inbox/calendar: Google Workspace or client's existing Microsoft 365; never use an automated-email provider as a replacement for a human inbox.
- Transactional email: Resend candidate; verify sender, SPF/DKIM/DMARC, opt-in, volume, templates and deliverability.
- Marketing email: Brevo or established client tool only when marketing is in scope; consent/unsubscribe requirements.
- Payments: Stripe for bespoke checkout/subscriptions, or Square/Shopify where business/POS/ecommerce needs make it a better fit; client merchant onboarding.
- SMS/voice: Twilio or compatible existing provider only when required; number registration, opt-in, fees, geographic limitations and STOP handling.
- Cron: prefer Supabase Cron for database workflows; Vercel Cron for relevant application triggers; durable queues/workers for guaranteed/retried async workloads. Avoid multiplying third-party schedulers.
- Analytics/monitoring: privacy-conscious analytics, error monitoring, logs and uptime checks; vendors chosen by project privacy/volume constraints.
- Search/maps/e-sign/storage/AI and vertical SaaS: add adapters on demand, review DPA, data residency, permissions, cost and export.

The catalog records **approved / candidate / exception / deprecated**, pricing verification dates and platform tests. Product names here are candidates, not claims of current contracted use or guaranteed current price.

## 9. Cost estimator and proposal engine

The system calculates the **architecture's actual dependencies**, not "sum the prices of all selected modules."

### Records
Provider; product/plan; jurisdiction/currency; billing interval; included units; per-seat/per-location/per-project base; included usage/overage/tiers; setup and verification fees; discounts/promotions expiry; tax notes; contract minimum/renewal; owner; payer; management mode; source URL and verified-at date; compatible modules; data and transfer constraints.

### Calculation
- Resolve required and optional features to vendor capabilities; reuse existing client subscriptions when verified.
- De-duplicate shared hosting/database/mail/scheduler dependencies **per deployable environment**, but account for billed seats, production+staging projects, multiple locations, addons and enterprise tiers.
- For each cost item: `fixed + seats × seat_rate + locations × location_rate + projects × project_rate + usage_tiers + overages + optional add-ons`, respecting units and billing frequency.
- Keep payment processing separate as `volume × percentage + transaction_count × fixed_fee + other card/cross-border/refund fees`; this is a variable charge.
- Produce monthly equivalent and **actual annual cash schedule** separately: annual prepaid bills must not masquerade as monthly cash flow. Show base/low/high scenarios and expected first-year total.
- Include assumed volumes, forecast horizon, possible alerts (e.g. approaching tier limits, expected costs +20%), and required approval for upgrades.
- Do not state legal, tax, compliance, SLA or cost guarantees without review. Refresh pricing before client-facing proposal and quote date.
- Proposal has **one-time build**, **fixed vendor subscriptions**, **variable usage/processing**, **optional Bivi maintenance**, **optional change retainer**, **one-time setup/transfer fees**, and exclusions.
- Keep a snapshot of vendor price inputs, selected options, estimate version, approver and client acceptance within Bivi Workspace. No silent changing prior quotes when price catalog updates.

### Client-facing readability
Expose a "technology passport": plain-language service name/purpose, paid-by, owner, Bivi's delegated role, monthly/annual forecast, renewal date, usage risk, status, and direct owner login/recovery guidance. Advanced technical fields stay staff-only. Never store credentials in the passport.

## 10. Security, privacy, reliability and exit standards

- Tenant isolation in DB and object storage; RLS policies and server-side authorization for **every** protected action; review multi-tenant joins and support impersonation rights.
- MFA for owners/staff; SSO only once a proper federation approach is specified (cross-Supabase projects do **not** automatically share sessions); dedicated service credentials, least-privilege grants, expiring scoped tokens, no secrets in the Git repo or client-side bundles.
- Production/staging segregation; secure per-client secrets; secret rotation and owner recovery procedures; signed webhook validation, replay protection and idempotency; phishing/spam controls and rate limits.
- Verified DNS/mail domain control and deliverability; scheduling timezone rules, queue/retry dead-letter path for operational tasks; monitoring, alert owners, backups and periodic restore drill.
- Accessibility baseline: keyboard navigation, focus, contrast, labels, form error handling, reduced motion; responsive test grid; browser compatibility; semantic structure.
- Performance budget for mobile and desktop, image optimization, caching and API/database indexes; measure, do not claim.
- Contracts/DPA and retention/deletion obligations for customer data; regulated healthcare, finance and childcare deployments need independent privacy/security/legal gates and vendor eligibility checks.
- Handoff must verify domain, billing, source/license, deployment, database/backups, secrets, DNS/mail, cron/queues, webhooks, payments, integrations, documentation, support transition, and removal of excess Bivi access. Record evidence and client acceptance, not only a checkbox.

## 11. Bolt.new allocation and usage gate

**Available planning budget stated by user: approximately 20 million Bolt credits.** Confirm credit unit, current balance, expiration/rollover and actual billing behavior inside Bolt before committing to a forecast.

Proposed starting allocation (adjust from measured pilot):
- **30% / 6M**: website layout families, full-page suites, responsive design.
- **25% / 5M**: dashboard layout families and complex UI states.
- **20% / 4M**: customer and employee mobile portal layouts.
- **15% / 3M**: industry-specific identity/interaction variants.
- **10% / 2M**: accessibility/responsive polish, experimental reserve.

**Use Bolt for:** front-end React/TypeScript visual systems, screen/page inventories, navigation, interactions backed by local fixtures, responsive states, brand/style explorations, design QA and component extraction candidates.

**Do not spend Bolt heavily on:** separate auth/database/payment/cron systems for each template, production infrastructure, complicated migrations, client secrets, or integrations needing authoritative business rules. Use GitHub/Codex + tests for engineering standardization.

**Bolt start condition (hard gate):** BTP-01 has an approved module/design contract, documented React/Tailwind conventions and folder structure, three-surface page list, realistic non-sensitive seed data, explicit output constraints, and a new repository branch with baseline checks. Only then begin **BTP-02 salon front-end pilot**. The first Bolt prompt must be written and supplied **at that gate**, not guessed now.

**Bolt pilot process:** one family / one coherent screen slice at a time; export/commit immediately; review semantic structure, license, accessibility, responsive behavior, component dependencies and mock-vs-real markings; measure actual credit usage, generation time and cleanup hours. Set a per-project budget cap and stop/adjust if results are repetitive. Do not generate 20 more variations before validating reuse in pet grooming.

## 12. Batch delivery plan (implementation in future chats)

Each batch must have a branch, exact baseline, PR, changed paths, scoped tests, security/role checks, status ledger update and acceptance record. Do not merge directly into Bivi `restore` without the existing release procedure.

| ID | Batch | Dependencies | Deliverable / acceptance gate |
| --- | --- | --- | --- |
| BTP-00 | **Planning and records** | None | These canonical documents committed to Bivi planning branch and PR; no code/production change |
| BTP-01 | **Platform foundation & standards** | BTP-00 | Approve independent repo structure, runtime versions, design tokens, module/config/vendor contracts, test harness, starter fixtures, workspace link integration specification; lint/typecheck/build green; **Bolt gate review** |
| BTP-02 | **Bolt salon front-end pilot** | BTP-01 accepted | Three polished, responsive salon surfaces with page inventory, mock data, accessible interactions, committed export, source review, credit/cleanup measurements; **DESIGN/INTERACTIVE**, not production |
| BTP-03 | **Salon reference production workflow** | BTP-02 | Real isolated tenant/auth, CRM, booking/availability, notifications, roles, staff/customer portal, vendor adapters, migrations, audit and E2E tests; live test only with approval |
| BTP-04 | **Second-industry reuse proof** | BTP-03 | Pet grooming variant generated from common booking/CRM components; report diff, copy/paste count, configuration gaps, hours, and shared-vs-specific boundary |
| BTP-05 | **Vendor catalog & estimate engine** | BTP-01 & real module dependency data | Auditable versions/pricing snapshots, scenario calculator, proposal payload, existing-account dedupe, alerts and cost tests |
| BTP-06 | **Account ownership & handoff operations** | BTP-03 & BTP-05 | Technology passport, ownership/payer records, onboarding checklist, recovery and transfer drill, managed/independent flows, permission tests |
| BTP-07 | **Private Studio app v1** | BTP-04–06 | Staff-only catalog, previews, preset/module/branding selection, readiness/compatibility/status dashboard, no marketplace |
| BTP-08 | **Bivi Workspace integration** | BTP-07 | Scoped deep link, approved API mappings, proposal estimate import, project references, approvals, technology summary; no duplicate authoritative records |
| BTP-09 | **Project generator & provisioning** | BTP-07–08 | Deterministic versioned generation, repo/preview workflow, audit/idempotency/rollback, human gate before paid account/domain/prod actions |
| BTP-10 | **Industry breadth** | BTP-04 proof | Mechanic/field service, retail/commerce, construction/projects, fitness/B2B, tutoring/content etc. with new contracts/tests and differentiated UX |
| BTP-11 | **Operational hardening and scale** | BTP-09 | Vulnerability scans, observability, restore drills, maintenance/upgrade fleet view, cost variance reporting, accessibility/performance and handoff signoff |

**Parallelization rule:** Bolt can work on approved visual slices after BTP-01, while engineering progresses on BTP-03–06; never treat an unreviewed Bolt mock-up as a production module. Separate Studio deployment and Bivi Workspace integration are later, after artifacts prove their shape.

### Initial decisions to record in BTP-01 (do not silently assume)
- Authorized Studio hostname and DNS ownership; separate repository name and access team.
- Whether new client repositories live under Bivi organization, client organization, or start with a Bivi incubator under explicit transfer terms.
- Common app route structure and what requires multiple deployments.
- Licensing strategy for Bivi reusable runtime packages and client offboarding.
- Primary provider selection, billing ownership, expected support and partner/reseller requirements.
- Standard retainer scopes, rate rules and handoff deliverables.
- Target privacy/compliance sector eligibility and client-contract requirements.
- Bolt credit confirmation and pilot budget stop-loss.

## 13. Definition of done and QA requirements

**For a design template:** complete desktop/tablet/mobile views, accessible navigation, representative empty/error/loading states, realistic but fake fixture data, every requested screen reachable, tokens/typography documented, no backend claim.

**For a functional module:** server contract and migrations tested; tenant/role matrix, auth denial tests, concurrency/idempotency, integration retries, privacy and backup/export included; documented setup, upgrade and rollback.

**For an industry preset:** recommended modules compatible, industry language and workflows correct, three surfaces coherent, estimated vendors resolvable, branding configurable, no copied per-client secrets or hardcoded business data.

**For a client generator:** version pinning, deterministic manifest, checked credentials, environment isolation, preview successful, generation idempotent, error cleanup/rollback, cost snapshot and owner/payer mapping, no accidental public data.

**For client release:** documented customer acceptance, real production tests with explicit permission, service owner/billing/renewals recorded, monitored and backup tested, support responsibility assigned, handoff export ready.

**For "complete platform":** staff can produce a repeatable salon and a meaningfully different second-industry client application from approved assets, generate an intelligible costed proposal, deploy an isolated test project, and execute a simulated secure handoff without needing to rebuild.

## 14. Risks, mitigations and dependency notes

- **Template sprawl:** require a core family/variant decision, reuse score and version maintenance budget.
- **AI code quality:** use Bolt only for scoped UI, review and test everything before accepting exports.
- **Vendor costs drift:** source-dated tariff records, estimate approvals, price refresh on proposal; no stale fixed "current price" embedded.
- **Account proliferation:** client-owned technical accounts with delegated Bivi admin, one technology passport, consolidated *management* even where billing remains direct.
- **Unexpected vendor lock-in:** export and transfer drills, replaceable adapters, contract/license review.
- **Double-counting subscriptions:** one graph of dependencies and environments, unit-aware usage scenarios.
- **Security/privacy:** never put business data or secrets in demo fixtures; sensitive-vertical release gate.
- **Bivi roadmap conflict:** do not alter or overtake existing Bivi Projects queue; Studio has own ledger and PRs.
- **Preview mistaken for launch:** record design, integrated, tested and client-accepted statuses independently.
- **Native app cost explosion:** PWA first, Expo only under documented requirement and separate upkeep model.
- **Scope creep:** client variations are configuration until a logged exception warrants new module work.

## 15. Next action

**Start BTP-01 only after this planning PR is accepted.** Independently provision the template-platform repository with shared contracts, fixtures, theme tokens and skeleton checks. At its completion, evaluate the Bolt start gate and deliver the **first exact Bolt.new prompt** for the salon website/dashboard/mobile pilot. **Do not start spending Bolt credits merely to produce Studio screens or random industry variants before that gate.**

The operational sequence and state live in [IMPLEMENTATION_LEDGER.md](./IMPLEMENTATION_LEDGER.md) and [NEXT_CHAT_HANDOFF.md](./NEXT_CHAT_HANDOFF.md); this document should not be treated as a live feature-status ledger.
