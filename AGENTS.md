# Patch workflow

Bundle small change requests into the next substantive patch. Do not create a separate patch or pull request containing only a small change unless the user explicitly asks for it to be released separately.

## Bivi Projects continuity (required before a project patch)

Read `docs/BIVI_MASTER_PLAN.md`, `docs/BIVI_PROGRESS.md` and `docs/BIVI_NEXT_STEPS.md` from the **current branch** before project work. Re-fetch `restore` HEAD and latest merged PRs, inspect the actual source and migrations, then classify each requested change as already delivered, repair, pending or unverified; never reimplement an existing feature because an older chat/plan says it is pending. Preserve local uncommitted work. The canonical task/project stores, revisioned draft/approval flow and roles are authoritative.

When a coherent feature patch ships, update `BIVI_PROGRESS.md` with PR, release SHA, actual migration identity, tests and signed-in acceptance status, and update `BIVI_NEXT_STEPS.md` to reflect the next executable slice. `BIVI_MASTER_PLAN.md` holds the full scope, not the latest implementation status. Docs-only updates should never be reported as delivering application functionality. Production is `restore`; use the checked PR/CI/Vercel flow. The user validates staff functions in production; Preview Ready alone is not authenticated acceptance. Never send staff invitation emails without deliberate user action.

## Private Template Studio initiative (separate, documentation-led)

For future work on the **Bivi private Template Studio / client application factory**, read `docs/template-studio/README.md`, `MASTER_BLUEPRINT.md`, `INDUSTRY_PRESET_MATRIX.md`, `VENDOR_OWNERSHIP_COST_STANDARD.md`, `IMPLEMENTATION_LEDGER.md`, and `NEXT_CHAT_HANDOFF.md` from the current branch. This is **not** the existing Bivi Projects roadmap; keep its batch status and repository/infrastructure separate. Studio has no public template catalog. Do not claim a Studio feature or vendor integration is delivered from planning docs. **Do not begin production Bolt work or supply its final prompt until the BTP-01 architecture/contract gate is accepted.** Do not create paid vendor accounts, send emails, buy domains or alter Bivi production merely to fulfill a planning phase.
