# Bivi — Vendor, Ownership, Cost Estimation and Secure Handoff Standard

> **Status: policy proposal / not implemented.** Dated 2026-11-23. This is a starting operational standard, not legal advice, vendor approval, a signed client agreement, or a price quote. Review provider terms, current prices, security obligations and relevant law before use. Cross-reference [MASTER_BLUEPRINT.md](./MASTER_BLUEPRINT.md).

## 1. Core policy

**Client-owned, Bivi-managed, transfer-ready** is the preferred arrangement. Separate four questions for **every** service: (1) legal/account owner, (2) payer and renewal authority, (3) daily technical operator, (4) data controller/processor or equivalent legal relationship. These roles may differ. Never equate having an administrator login with owning an account.

Supported service models:

| Model | Account/billing | Technical administration | Exit |
| --- | --- | --- | --- |
| **A. Client-direct managed (default)** | Client is account owner and pays vendors directly | Bivi invited with scoped role; retainer covers defined operations | Revoke delegated Bivi access; client keeps accounts |
| **B. Bivi consolidated managed** | Eligible technical vendors contracted/billed through Bivi; critical domain, merchant, identity and business data still client-controlled | Bivi | Contractually defined transfer/export, billing reconciliation, no unsupported provider transfer claims |
| **C. Independent** | Client is direct owner/payer | Client or nominated replacement provider | Verified handoff and Bivi revocation; no ongoing maintenance assumed |

Do not promise "one bill" when a vendor requires direct merchant contracts, identity/KYC approval or nontransferable terms. Billing consolidation should be an optional service requiring finance/legal review and transparent vendor pass-through versus Bivi service fees.

## 2. Ownership and active-usage matrix

| Asset/service | Preferred account owner | Payer | Day-to-day operator | Client must actively use? | Handoff boundary |
| --- | --- | --- | --- | --- | --- |
| Business domain and DNS | Client business | Client | Bivi delegated DNS access | Rarely | Registrar credentials/recovery, locks, records, expiry and transfer policy |
| Business inbox / calendars | Client business | Client | Client, Bivi delegated IT when contracted | Yes | Mailboxes, aliases, admin, export and retention |
| Merchant account / payouts | Client business and required KYC signers | Client via processing fees | Client finance; Bivi technical checkout/webhook | As needed | Merchant admin, payouts/refunds/disputes, webhooks/secrets |
| Vercel application hosting | Prefer client-owned team/project | Client direct or Bivi consolidated | Bivi | No | Project/team access, domain bindings, env var migration and logs |
| Supabase DB/Auth/Storage | Prefer client-owned project/organization | Client direct or Bivi consolidated | Bivi | No | DB+object export/restore, auth constraints, backups and RLS |
| Automated email | Prefer client-owned dedicated account/domain | Client or Bivi consolidated | Bivi | No | Sender, DNS, templates, logs, suppression/export policy |
| Marketing email | Prefer client-owned | Client | Client marketing or Bivi if contracted | Often | Lists/consent, templates, export, unsubscribe state |
| SMS/voice numbers | Prefer client-owned | Client or Bivi consolidated | Bivi technical; client business consent | No/occasional | Number/registration portability, opt-in evidence |
| External SaaS (POS, Shopify, booking provider) | Client | Client | Client operator + Bivi adapter | Possibly | Vendor account, sync/export, ownership of records |
| Application client-specific source | As client contract specifies; prefer transfer-ready dedicated repo | Agreed | Bivi during project/retainer | No | Licensed runtime packages, build/README, CI and access |
| Bivi Studio, master templates, Bivi reusable IP | Bivi | Bivi | Bivi | Never | Excluded from client transfer; runtime licensing explained |
| Client content/brands/business records | Client (subject to third-party and legal rights) | Client | Client; Bivi as authorized service provider | Yes through app | Complete usable export and deletion/retention policy |
| Bivi operational project/contract ledger | Bivi | Bivi | Bivi | Client sees authorized excerpts | Export only client-entitled records and deliverables |

Account minimization: count **accounts owned**, **accounts paid**, and **accounts actively used** separately. The client should generally only need daily access to business email, their business dashboard and financial tools; technical provider access exists for recovery/billing, not routine work.

### Critical actions that require the real owner

- Domain purchase/registrant details and DNS authorization when needed.
- Stripe/Square/Shopify merchant onboarding, beneficial-owner KYC, payouts, disputes, terms acceptance.
- Credit card entry and billed upgrades where vendor policies require.
- Business inbox identity verification and MFA/recovery.
- Approval of SMS registration, lawful consent programs and domain-based email identities.
- Final production signoff, ownership acknowledgment, IP/license and transfer terms.

Bivi should send concise **owner action requests** with one task, why needed, official service URL, deadline, verification status and fallback. Never request passwords or card numbers in a Bivi form.

## 3. Preferred provider catalog (initial research choices)

Status is **CANDIDATE**, not deployed/contracted or necessarily cheapest. Store alternatives to avoid lock-in and accommodate what the client already uses.

| Capability | Default to evaluate | Alternatives / trigger | Key cost drivers | Transfer and privacy considerations |
| --- | --- | --- | --- | --- |
| Domain/DNS | Cloudflare/selected client registrar | Existing registrar; managed DNS | domain TLD, renewals, premium names, privacy | Client registrant ownership, MFA, domain lock |
| React/Next hosting | Vercel | Other vetted hosting if workloads/pricing require | paid seats, bandwidth, functions, build, environments | Project/team transfer, env vars, DNS and usage billing |
| Database/Auth/Storage | Supabase | Managed PostgreSQL/auth stack under requirements | plan, org/project count, storage, MAU, egress, compute, backups | DB+storage export, auth portability, RLS |
| Business email/calendar | Google Workspace | Microsoft 365/existing provider | seats, tier, annual contract, archive | Ownership of domain, recovery, mail export |
| Transactional email | Resend | Other tested transactional provider | sends/day/month, dedicated IP, domains, retention | DNS SPF/DKIM/DMARC, sender and suppression |
| Marketing email | Brevo | Existing Mailchimp/Klaviyo/etc | contacts, sends, automation, seats | consent list, unsubscribe logs, export |
| Scheduled DB tasks | Supabase Cron | Vercel Cron for app-triggered tasks; queue workers for durable jobs | DB/job limits, compute, monitoring | inventory cron definitions and clock rules |
| Application job queues | Evaluate when workload needs it | Managed queue/worker; Postgres queue if supported | invocations, retries, storage | replay/idempotency/dead-letter, export |
| Online payments | Stripe for bespoke apps | Square for POS, Shopify for commerce, existing provider | GMV, count, card mix, refunds, chargebacks | Client KYC, funds/payout ownership, webhook secrets |
| Storefront/POS | Shopify or Square where fit | Custom ecommerce when explicitly justified | plan, POS hardware/seats, apps, payment processing | products, customers, checkout and subscription data |
| SMS/voice | Twilio | Existing vetted SMS provider | message segments, destination, sender rental/registration | opt-in/STOP, messaging compliance, number transfer |
| Monitoring/error | Vercel logs + evaluated Sentry/uptime service | Client chosen monitoring | events, log retention, alert/seat limits | PII minimization, pager ownership and export |
| Analytics | Privacy-appropriate native/provider option | GA4 or existing tool | traffic/retention, vendor plan | consent, cookie policies, privacy |
| Storage/files | Supabase Storage by default | Dedicated object storage for high volume | GB stored, bandwidth, transforms, backups | complete blob export, signed URLs |
| Maps/geocoding | Only if location/dispatch needed | Existing provider | maps/geocode requests, licensing | data leakage and rate caps |
| E-sign | Client's existing provider if contract workflow requires | One vetted provider later | signatures, envelopes, seats | executed-document ownership and archive |
| Specialized vertical systems | Integrate rather than replace | Clinic EHR, childcare systems, finance, etc. | per-user/license/data sync | regulated data and vendor eligibility review |

**Important vendor gating rules:**
- Email is **three products**: human inbox, transactional application email and marketing email. Do not provision all three by default.
- Cron and reminders: start with the **existing app/DB** scheduler when reliability needs allow; use durable idempotent queues for critical retryable work.
- Payments: prefer an existing client POS/merchant system where workflows require it; never add a second payment provider without comparing costs, reporting and reconciliation.
- Commerce: assess Shopify/Square instead of reinventing order management and tax/shipping/PCI workflows.
- Regulated industries: require a data-flow threat model, applicable law and contract assessment, and vendor-specific suitability; no generic claim of HIPAA, COPPA, PCI or finance compliance.

## 4. Vendor onboarding due diligence and change control

For each approved service create a record:
- canonical vendor + product + plan + region + provider account reference (not secret);
- business purpose and which module needs it; optional alternatives and compatibility;
- agreement/ToS/DPAs, subcontractor notices, retention/data residency, security attestations;
- owner, payer, technical admin, security incident contact and invoice contact;
- MFA setup, delegated access capability, recovery route, backup/export/transfer route;
- plan minimum, seats/projects, included usage, tiers/overages, tax estimate, renewal/cancellation terms;
- source link, effective date, verified date, review expiry, original currency and FX policy;
- test/production capability, webhook/source verification, rate limits, SLA and support;
- selection state **candidate → approved → active → deprecated** with approver/reason.

Never approve a vendor from memory alone. Prices and transfer options are time-sensitive and must be checked before a client quotation. Record vendor price data, **not actual API keys**; keep secret references in managed credentials vault/hosting secret store.

## 5. Estimation data contracts

**ProviderPlan**: vendor ID, plan ID and name, region/currency, version, plan status, reference/source URL, checked date, billing interval (monthly, annual-prepaid, metered), per-seat/per-location/per-project capacity, included quotas, hard minimum, feature limits, setup fees, first-year promo terms, taxes excluded, exception notes.

**UsageScenario**: low/expected/high; staff seats, locations, visitors, MAU, appointment transactions, GMV, card count, email sends, SMS segments, storage and egress, compute and scheduled jobs; assumptions, evidence, client-confirmed flags, created/updated times.

**ModuleDependency**: module ID, version, capabilities required, provider class, non-substitutable constraints, usage driver, environment multiplier, alternative adapters, dependency relationship, legal/security notes.

**ClientService**: client/project references, provider, owner/payer/operator, service external ID, intended environment, data classes, billing authorization status, renewal date, risk grade, secret-vault ref, handoff owner and vendor contract state.

**EstimateSnapshot**: immutable ID, client/proposal, selected surfaces/preset/module versions, pricing snapshot IDs, usage scenario, provider decision tree, assumptions, low/base/high detailed line items, cost totals in native + proposal currency, excluded fees, review/approval/date.

### Cost engine rules

1. Build dependency graph from **selected features**, not page count.
2. De-duplicate shared infrastructure within a particular account/environment; add incremental seats/projects/usage and mandated separate environments. Modules may share providers but not automatically share tenant data.
3. Include client-existing subscriptions only when confirmed; calculate incremental cost rather than charging for an existing paid account twice. Note when upgrade is required.
4. Model **monthly equivalents** and **actual payment due dates** separately (annual prepaid and setup fees are not paid evenly each month).
5. Separate recurring subscriptions, one-off setup, variable operational usage, payment processing, hardware, external agency services, taxes and Bivi service fees.
6. Use different calculation methods per vendor: `base + seats × seat_price + locations × location_price + projects × project_price + usage/overage + add-ons`. Apply usage tiers, included quotas, minimum commitments, tier switches and volume caps. Do not calculate negative credits.
7. Model payment fees separately: `processed_volume × processor_percentage + settled_transaction_count × fixed_fee + cross-border/dispute/refund/instant-payout addons` under region/card/merchant assumptions.
8. Include low/expected/high and a "first year cash" projection and optional 3-year cost view; mark unknown fees explicitly.
9. Cap silent overages where the vendor permits; notify technical owner/client on threshold events with rate limit and approval workflow.
10. Stamp all forecasts with generated date, tariff version, currency/FX assumptions and **expires/revalidate-by** date. Recalculate before sending proposals; do not rewrite existing signed snapshots.

### Illustrative non-binding cost scenario

For a two-employee salon proposal, the estimate should show line items for domain/year, hosting/month, DB/month, human email seats/month, transactional email (free-tier or paid threshold), SMS only if activated, payment processor percentage + per-transaction, optional commerce/POS, and Bivi maintenance separately. It must show expected transactions, appointments and messages. Do not hardcode $20 hosting, $25 DB, or any other current-looking price as an unverified default in the implementation.

### Proposal attachment format

1. **Upfront Bivi build fee** (milestones/payment terms, change policy).
2. **Required fixed third-party subscriptions** by owner/payer, monthly rate + annual equivalent and real payment schedule.
3. **Optional subscriptions** with business reason and alternative.
4. **Variable usage** per assumption plus low/base/high.
5. **Payment processing** examples showing percentage and per-transaction fees (separate from software).
6. **Bivi maintenance & management** optional tier, precise included/omitted tasks and escalation.
7. **New features/retainer** separately priced; not confused with preventive operations.
8. **Assumptions, expiry, exclusions, renewals, taxes, client approvals, transfer and exit rights**.

## 6. Client-facing Technology Passport

One readable panel in Bivi Client Portal:
- Business name/project and operational status (grounded from available provider data, not inferred "green").
- Services grouped as **Website & hosting**, **Business data**, **Payments**, **Email & messaging**, **Integrations**, **Support**.
- Forecast monthly equivalent plus actual next bills and annual obligations, plan/renewal, owner/payer, Bivi management status.
- "Action needed" area: owner KYC, MFA, payment update, domain renewal, overage approval, acceptance.
- "Access & ownership" area: who legally owns account, recovery contact, provider owner link, support path.
- Privacy-preserving technical status and outage notices; never display secrets, staff-only logs or customer records outside authorized scopes.

Client may own 5–8 provider accounts yet use only their website dashboard, business inbox and Stripe/Square financial console. No assertion that a consolidated Bivi dashboard replaces legally required provider admin functions.

## 7. Account creation runbook

**Before creating an account:**
- Confirm client legal entity, authorized contact, approved email, tax/billing region, owner/payer/operator model, quote approval and provider license.
- Determine whether client has existing accounts and whether existing domains/POS/subscriptions should be reused.
- Secure owner invitation and recovery identity: MFA, backup recovery codes under client control, secondary contact and emergency exit plan.
- Obtain explicit authorization for spend and account creation; store no raw credit cards or passwords.

**Provision:**
- Create account under designated owner using official provider flow; owner accepts terms/KYC.
- Invite Bivi with least privilege; segregate dev/staging/prod; set limits and alert email; configure API keys in approved secret store.
- Record IDs and invoice/renewal contacts in Technology Passport, not in unrestricted notes.
- Confirm domain/email DNS and no accidental sender spoofing; test webhooks and sandbox charges before real transactions.
- Set billing overage policies, backup and access review dates.

**Recurring review:**
- Usage and spend vs quote/threshold, upcoming renewals, vendor plan and seat rightsizing.
- MFA/role access review, secret rotation as appropriate, restore exercise and failure alerts.
- Keep vendor tariffs verified and licenses compatible with any module upgrade.

## 8. Retainer versus independent paths

### Managed service agreement
Include supported environments, operating window, incident severity/response times, backups and restore frequency, security upgrades, deploy changes, uptime monitoring, vendor incident management, owner approvals, budget caps, exclusions (new features, content writing, vendor price increases), availability during non-business hours, cancellation term and transfer assistance. A "maintenance" subscription does not imply unlimited custom development.

### Independent completion and transfer
At proposal time include a **handoff-ready deliverables schedule**, support-end date and any agreed transitional training. Obtain client acknowledgment that post-termination patches, renewals, alerts, backup and security response become their or successor's responsibility. Never withhold data or previously contracted delivery rights as leverage for a retainer; follow agreement/legal requirements for final invoices.

### Both use the same technical architecture
Avoid a managed-only database or Bivi-locked payment identity that later forces rebuilding. Bivi can keep delegated roles only while agreed. Clarify that ongoing Bivi reusable runtime package licenses may continue under an agreed perpetual/term license, independent of the ongoing maintenance contract.

## 9. Secure handoff checklist and evidence

Use an explicit ledger with **Not started / Blocked / Verified / Accepted / N/A** per item, owner, evidence link and timestamp.

| Area | Verify before signoff |
| --- | --- |
| Legal/finance | Contract scope, IP/license, final invoice, service terms, owner/payer and transfer eligibility |
| Domain/DNS | Client registrar identity, MFA/recovery, DNS export, SSL/TLS and certificate renewal, delegation |
| Email | Business mail admin, verified sender/DNS, mailbox continuity, suppression/unsubscribe data, SPF/DKIM/DMARC |
| Payments | Client merchant ownership, payouts/disputes, webhooks, live/test separation, reconciliation, account/legal eligibility |
| GitHub/source | Dedicated repo rights, branch protections, dependency licenses, tags/releases, build/deploy steps and ownership |
| Hosting | Client team/project access, verified domains, staging/production vars, deployment rollback and usage alerts |
| Data | PostgreSQL schema/migrations, user/auth portability constraints, DB backup **restore test**, object storage export, retention/deletion |
| Integrations | Inventory APIs, credentials, quotas, webhooks, queues/cron, secrets and rotation plan |
| Security | MFA/recovery verified, server RLS, least privilege, audit retention, vulnerability inventory, incident contacts |
| Operations | Monitoring alerts route to successor, logs and runbook, restore/backup frequency, SLA end date and escalation |
| Access shutdown | Revoke Bivi staff/team roles not retained, rotate affected secrets, invalidate service tokens, verify no orphaned admins |
| Client acceptance | Handoff packet and training, actual login/deploy/restore check by recipient or authorized successor, dated signoff |

**Transfer is not universally supported by clicking "transfer account."** For nontransferable vendor entities, plan a new owner-controlled account, data migration and cutover, subject to vendor rules. Keep a reversible migration window and test transactional continuity before revoking old access.

### Never send in a handoff PDF or email
Database passwords, API private keys, OAuth client secrets, service-role keys, recovery codes, raw customer exports and unredacted tokens. Use secure role transfers, owner-run credential resets or an expiring encrypted secrets exchange with separate authentication.

### Handoff acceptance criteria
Client or appointed successor can (a) authenticate as owner, (b) identify and pay renewals, (c) deploy a nonproduction change, (d) restore supported backup into isolation, (e) manage an authorized user, (f) locate integrations/cron and receive an alert, and (g) operate payment/email flows without Bivi's privileged accounts. If any item cannot be completed, record the limitation and corrective owner before marking accepted.

## 10. Legal/security review gates

- Bivi counsel: licensing, work-for-hire/source rights, managed subscription pass-through, limitation of liability, transition and IP terms.
- Tax/accounting: sales/use tax and software services, payment facilitator/reseller risks, provider billing, refunds and annual commitments.
- Data protection: client data controller/processor roles, retention/deletion, DPA and subprocessors, incident obligations and transfer region.
- Healthcare/childcare/finance: applicable regulated data scope, consent and legal protections, eligible vendors and written client signoff.
- Client-specific compliance checks must precede real personal/sensitive data import. A generic design mockup has **no compliance certification**.

## 11. Implementation tests for this standard

- Adding two modules that both need Supabase counts shared project/plan costs once, while correctly counting additional compute/projects and environments.
- Replacing bespoke checkout with Shopify removes incompatible redundant hosting/checkout costs; payment processing remains independently displayed.
- Existing Microsoft 365 plan is reused rather than adding Google Workspace without need.
- Annual plan shows total first-year upfront liability even when monthly equivalent appears small.
- SMS and marketing emails are **off** unless enabled, with consent and fee assumptions.
- Seat and transaction-volume changes update only relevant cost lines; high case exceeds expected case consistently.
- Expired vendor pricing blocks proposal finalization or requires explicit exception/reverification.
- Client managed → independent handoff successfully removes Bivi access while preserving business operations.
- Inability to export/transfer a particular vendor account is surfaced **before** proposal and assigned an exit mitigation.
- A non-admin Bivi staff user cannot read arbitrary client account metadata or billing details; no secrets exposed in API responses.

## 12. First follow-up deliverable

In BTP-01 create: versioned catalog schemas and example fixtures, costing test scenarios, onboarding/handoff checklists as machine-readable definitions, and a policy decision log. **Do not sign clients up for services, submit KYC or purchase paid plans as part of this planning work.**
