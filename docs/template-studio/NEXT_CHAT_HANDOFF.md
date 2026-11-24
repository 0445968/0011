# Bivi Template Studio — Next-Chat Implementation Handoff

**Last planning update:** 2026-11-23. **State:** BTP-00 planning documentation; **no Studio code, service accounts, deployments, or Bolt work have been created** by this plan. Branch `planning/bivi-private-template-studio-2026-11-23` was based on Bivi `restore` commit `5f584c62dbb9994505fb765a3c428a1ae397a0a8`; verify newer HEAD/PR before writing any code.

## Required reading, in order

1. `docs/template-studio/MASTER_BLUEPRINT.md`
2. `docs/template-studio/VENDOR_OWNERSHIP_COST_STANDARD.md`
3. `docs/template-studio/IMPLEMENTATION_LEDGER.md`
4. This file (`docs/template-studio/NEXT_CHAT_HANDOFF.md`)
5. If modifying existing Bivi app: `AGENTS.md`, `docs/BIVI_MASTER_PLAN.md`, `docs/BIVI_PROGRESS.md`, `docs/BIVI_NEXT_STEPS.md` on current `restore`.

**Bivi production branch is `restore` and production staff workspace is `staff.bivi.pro`.** Existing Bivi Projects work remains its own priority/ledger. Do not modify its task/approval systems under the pretense of building Template Studio.

## Approved strategic decisions from the discussion

- The system is for **Bivi internal reuse only**. Do not create public template sales/catalog.
- Proposed **independent private Studio** on a Bivi subdomain (candidate `studio.bivi.pro`), with independent repo/deployment/database, integrated into Bivi Workspace through scoped links/APIs later.
- **One three-part client solution:** public site, owner/staff dashboard, customer/employee mobile portal using shared backend; responsive PWA first, not three compulsory separately hosted apps.
- React/TypeScript/Tailwind, likely Next.js for final apps; choose supported versions fresh. Keep design and domain modules separable.
- Prepare website/dashboard/mobile designs, industry presets, business modules, vendor adapters and client configurations **before** client onboarding. Initial test industry salon, reuse proof pet grooming.
- Bivi Workspace owns client/project/proposal/maintenance/handoff records; Studio owns templates/module versions/generator manifest and internal preview.
- **Client-owned, Bivi-managed, transfer-ready** default; client should not need to visit 6 technical vendor consoles daily. Alternative managed vendor billing and independent handoff only under explicit terms.
- Vendors are **candidates** (Vercel, Supabase, Cloudflare, Google Workspace or Microsoft 365, Resend, Brevo where needed, Stripe/Square/Shopify, Twilio if needed, Supabase/Vercel cron). Validate plans and prices for each quote; avoid duplicate subscriptions and forced extra accounts.
- Proposal estimator must show fixed monthly/annual, annual prepaid cash, usage-based costs, processing fees, one-off build and setup, optional Bivi maintenance and separate feature retainer; provide low/base/high plus verified-at price source and ownership/payer details.
- Sensitive healthcare, childcare and financial workflows need independent privacy/legal/vendor eligibility gates.

## Next substantive batch: BTP-01 (not BTP-02)

**Goal:** Create the foundation for the future `bivi-template-platform` repository and codify the contract/fixture/design system that makes Bolt output reusable.

### Work to implement
1. Refresh Bivi repository HEAD and PR state, inspect branch/scope; do not edit `restore` directly.
2. Confirm a name and access model for the independent new repo and whether the Studio hostname is authorized; avoid creating/purchasing any external resource without explicit action or established authorization.
3. Scaffold monorepo as proposed, with `apps/studio` initially minimal and **private**, packages for UI, theme/tokens, module contracts, industry presets, vendor/estimator schema, fixture data, and tests. No elaborate Studio admin interface yet.
4. Choose supported React/Next/TS/Tailwind versions and reusable component licenses after current review; record choices.
5. Define JSON schema/typed runtime contracts for surfaces, roles, modules, presets, themes, vendor dependencies, client configuration and output manifest; include version pinning and compatibility errors.
6. Define salon page inventory for **all three surfaces**, including mobile customer **and** staff experiences, with mock data and acceptance cases.
7. Create a concrete owner/customer/staff permission matrix and negative authorization test plan.
8. Define vendor price catalog schema, cost-scenario fixture and policy/test for deduplicating provider requirements. Do not claim live prices without verification.
9. Establish lint/typecheck/build/test scripts; all must genuinely execute and pass for scaffolding.
10. Record decisions, new repo URL/PR, exact SHA/tests and remaining issues in Studio ledger.
11. Prepare a **Bolt start gate review** and, if satisfied, give the user the exact first Bolt.new prompt for BTP-02.

### Definition of done
- New repo has predictable package boundaries and reproducible green starter CI.
- Salon pages and module interfaces are specified enough that Bolt can generate only **front-end mock-data screens** without inventing architecture.
- Design tokens and handoff/export workflow agreed; roles and shared backend contracts documented.
- Vendor metadata/cost requirements and data/ownership policies represented in stable types/schemas.
- Scope and mock-versus-production labels are clear, no production side effects.
- User is given an exact Bolt credit-capped **salon website** prompt only after this review; subsequent prompts for salon dashboard and portal follow in ordered slices.

## When to use Bolt — hard stop

**NOT YET** at BTP-00. The first eligible moment is **after BTP-01 acceptance**, at the start of **BTP-02**.

At that point provide:
1. A copy-ready Bolt prompt referencing the approved repo structure, exact versions/design tokens and page inventory.
2. Explicit "no auth, no DB, no Stripe, no cron, no real email/API, no secrets" instructions for the first visual slice.
3. Realistic fictitious demo salon data, interaction and responsive requirements, file/component conventions and a build/QA/export checklist.
4. A first credit budget cap and stop/go checkpoint based on the account's actual credit units, expiry and pilot consumption, not assumed token economics.
5. Stepwise subsequent prompts: website → dashboard → customer portal → staff portal → refinement, not one vague all-in-one request.
6. A requirement to commit exported Bolt changes to the new template-platform repo for code review before any backend work.

**Do not paste a made-up generic Bolt prompt now**; the eventual prompt should cite real contracts and project paths created in BTP-01. If user specifically decides to experiment early, label it an isolated disposable visual exploration unrelated to production and require explicit choice.

## Existing Bivi integration guardrails

- Do not reuse Bivi production DB, identities, staff roles or current task/approval stores for Studio by convenience.
- SSO across separate auth projects is nontrivial; define supported federation/session architecture or use separately scoped login with explicit authorization.
- Bivi Workspace client and project IDs are the authoritative link; Studio may record references, never duplicate Bivi client ledgers as a competing truth.
- No external emails/invites, domain changes, billed vendor subscriptions, Stripe live transactions, KYC, production database migrations or privileged grants without subsequent user approval.
- Production Bivi process: source review, tests, branch/PR, merge only through established process; user authenticated acceptance is separate from a green build.

## Suggested continuation instruction for next chat

> Continue **Bivi Private Template Studio** implementation, starting with **BTP-01**. Repo of record for planning is `0445968/0011`. Before changes read `docs/template-studio/MASTER_BLUEPRINT.md`, `VENDOR_OWNERSHIP_COST_STANDARD.md`, `IMPLEMENTATION_LEDGER.md`, `NEXT_CHAT_HANDOFF.md` on current GitHub, plus Bivi `AGENTS.md` and its three original trackers if touching `restore`. Refresh HEAD/open PRs and do not overwrite existing Bivi Projects work. Scaffold the separate private `bivi-template-platform` architecture, React design system, typed module/preset/vendor/cost contracts, salon three-surface page inventories, fictitious fixtures and automated starter checks as one coherent BTP-01 batch. Open a PR, update ledger and document the first Bolt gate. **Do not use Bolt or supply its first production prompt until BTP-01 contracts and scaffolding are accepted.** Do not subscribe to vendors, send email/invitations or deploy Bivi production without explicit approval. I only need to provide errors, required approvals, or account actions.

## Release-reporting template

Record in user-facing summary and ledger:
- BTP batch and state (PLANNED/CODE/TESTED/ACCEPTED)
- Repository / branch / PR / exact SHA
- Functional changes vs documentation-only changes
- Files and migrations actually changed
- Tests executed, results and tests not run
- Studio/Bivi deployment and auth acceptance (or none)
- External purchases, invites, emails, secrets and billing action status (or none)
- Client ownership/IP/vendor decisions still unresolved
- Next exact batch, with Bolt gate status

**Do not mark a deployment complete based on a proposed Vercel URL, successful PR creation, or a polished Bolt mockup.**
