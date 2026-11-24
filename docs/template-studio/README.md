# Bivi Private Template Studio — Planning Index

**Private Bivi client-production infrastructure — not a public template catalog.**

This folder is the canonical planning package for the proposed Bivi Template Studio. Prepared 2026-11-23; **documentation only**, no Studio service or template application is represented as deployed.

| Document | Purpose |
| --- | --- |
| [MASTER_BLUEPRINT.md](./MASTER_BLUEPRINT.md) | Mission, three-surface architecture, reusable module families, Bivi boundary, workflow, Bolt credit strategy, phased batches and definitions of done |
| [INDUSTRY_PRESET_MATRIX.md](./INDUSTRY_PRESET_MATRIX.md) | Industry-by-industry website/dashboard/mobile pages, modules, provider dependencies, reuse tests and sensitive-sector constraints |
| [VENDOR_OWNERSHIP_COST_STANDARD.md](./VENDOR_OWNERSHIP_COST_STANDARD.md) | Approved vendor **candidate** process, owner/payer/operator roles, pricing estimator, proposals, managed vs independent support, secure handoff |
| [IMPLEMENTATION_LEDGER.md](./IMPLEMENTATION_LEDGER.md) | Planned BTP-00 through BTP-11 batches, states, checks, release evidence and decision register |
| [NEXT_CHAT_HANDOFF.md](./NEXT_CHAT_HANDOFF.md) | Exact BTP-01 next action, repository continuity rules and the hard gate for the first Bolt prompt |

## Where this sits within Bivi

- Current Bivi app repository: [0445968/0011](https://github.com/0445968/0011), production branch `restore`, current staff workspace `staff.bivi.pro`.
- Existing Projects/workspace roadmap **remains authoritative for that codebase**: [BIVI_MASTER_PLAN.md](../BIVI_MASTER_PLAN.md), [BIVI_PROGRESS.md](../BIVI_PROGRESS.md), [BIVI_NEXT_STEPS.md](../BIVI_NEXT_STEPS.md).
- Studio will be **a separate private application and future repository**, linked back to Bivi client/proposal/project operations at a later gated batch. Candidate domain `studio.bivi.pro` is not yet provisioned.
- First implementation batch: **BTP-01 — platform architecture and reusable contracts**.
- **Bolt status: NOT YET.** First real Bolt prompt is delivered once BTP-01 is accepted; then BTP-02 designs a salon website, dashboard, and customer/staff mobile portal with mock data.

## Planning/implementation discipline

Each future coding session reads the four Bivi baseline documents if touching Bivi source, and the Studio index + master/ledger/handoff for Studio work. Re-check GitHub HEAD/PRs, avoid restoring old patches or altering Bivi production as a side effect, and record actual tests, deployments and acceptance evidence. Do not conflate planning with delivered behavior or auto-provision billable accounts, secrets, domains, email or merchant services.
