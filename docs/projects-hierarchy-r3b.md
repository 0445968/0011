# Bivi Projects R3b — Milestone-centered editing

Prerequisite: R2 draft/saving feature and R3a hierarchy SQL + API must both be deployed. Branch: `bivi-dashboard-overhaul`.

## What's introduced

- The **primary plan view** groups milestone cards under their canonical first assigned phase. Additional phase associations display on the card and are preserved. Unassigned milestones/tasks are never inferred into a phase.
- Inline edits for saved project milestone titles/status/deadlines and task titles/status/deadlines use the **same R2 ProjectBody draft and Save All workflow**, without a full-page reload. Starting a task updates a planned milestone to *In progress* in the unsaved draft. When all parent tasks are done, staff can explicitly confirm marking its milestone complete; no automatic approval is inferred.
- Milestone task counters, an evidence-based green progress bar, phase checkboxes for multi-phase membership, per-milestone `Complete all` / `Unmark all` buttons with confirmation, and nested subtask management.
- Subtasks and phase links are **server-backed, immediately saved** through the R3a revision-checked hierarchy API. Their edits are blocked while a legacy ProjectBody draft has unsaved modifications. Save All the parent work plan first. A 409 prevents further edits until hierarchy reload.
- The existing task table, notes, owner labels, milestone remove controls, and all workflow guardrails remain accessible in the collapsible **Advanced work-plan editor**, rather than being deleted.

## Important limits

- R2 drafts cover the legacy ProjectBody fields. Hierarchy edits are committed individually to the separate R3a tables; they are **not part of Save Draft / Save All**.
- Subtasks do not automatically change the parent task status. A completed task list does not formally complete a milestone or phase. Phase approval still requires Lifecycle workflows.
- A task newly created in a local draft must first be saved before subtasks can be attached. Same for newly created milestones and phase association changes.
- This slice does not implement verified multi-assignees, per-task file counts, milestone notes/communication records, phase completion confirmation, activity feed, or calendar tab. They remain later steps.
- Sidebar title/metadata remains in the existing Project workspace shell. Projects stay protected by existing staff authentication, RPC validation, RLS, and optimistic revisions.

## Acceptance checklist

1. Apply R3a migration in Supabase if not already done. Confirm hierarchy endpoint GET returns `projectRevision`, `hierarchyRevision`, `milestonePhases`, `subtasks`.
2. Add a milestone in Advanced editor and Save All. Then assign one or more phases using its milestone card.
3. Add a task inside that milestone; verify autosaved draft, Save All and no full reload.
4. Add/edit/remove a subtask after Save All; verify data survives refresh and audit history records a change.
5. Open existing task notes, owner labels, milestone removal, and lifecycle controls through Advanced editor; confirm no regression.
6. Try concurrent hierarchy edits in two tabs; 409 must block stale edits. Confirm non-staff/clients cannot call this endpoint.
7. Confirm bulk Complete All and Unmark All update the draft, not the published project until Save All.
8. Run `npm run typecheck`, `npm run verify:platform`, and `npm run build`.
