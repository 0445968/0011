# Bivi Projects — R3a hierarchy foundation

Base: `bivi-dashboard-overhaul` after R1, with R2 applied first. This is an **additive, non-visual** first slice of R3, not the completed hierarchical editor.

## Data introduced

- `project_milestone_phases`: a milestone can belong to **multiple existing nine-phase lifecycle values**. Existing milestones have no inferred assignments; all previously unlinked milestones remain visibly unassigned when the R3b editor is added.
- `project_subtasks`: up to 50 ordered subtasks per task, with stable UUID, title, status, optional date-only deadline, independent optimistic revision, and attribution. These do **not** yet alter parent task completion automatically.
- `project_hierarchy_revisions`: independent per-project revision counter for this normalized layer, plus a second guard against stale legacy `inquiry_projects.revision`.
- `project_hierarchy_history`: immutable event entries for staff-initiated hierarchy edits and automatic pruning of deleted parent tasks/milestones.

Subtasks and milestone phase links are sidecars to the legacy strict `ProjectBody` JSON schema. Their parent IDs are validated against the saved authoritative task/milestone arrays under a locked project record, rather than guessing associations or rewriting client-facing JSON. A trigger prunes orphan links/subtasks within the legacy save transaction when parent records are removed.

## API (staff-only)

`GET /api/admin/projects/[id]/hierarchy` returns `projectRevision`, `hierarchyRevision`, `milestonePhases`, and `subtasks`. Subtasks are paginated server-side to avoid silent Supabase row truncation.

`POST /api/admin/projects/[id]/hierarchy` accepts exactly one command, validated by `projectHierarchyCommandSchema`, through a single RLS-protected, `SECURITY DEFINER` RPC:

- `set_milestone_phases`: `{ action, expectedProjectRevision, expectedHierarchyRevision, milestoneId, phases }` — `phases` can be an empty array (clear) or distinct phase names.
- `add_subtask`: `{ action, expectedProjectRevision, expectedHierarchyRevision, taskId, subtaskId, title, status, dueOn }`.
- `update_subtask`: same plus `expectedSubtaskRevision`.
- `remove_subtask`: `{ action, expectedProjectRevision, expectedHierarchyRevision, taskId, subtaskId, expectedSubtaskRevision }`.

On conflict the API responds with 409; a completed project is locked. Direct table writes are not granted to staff or clients. A client cannot use these endpoints; client task APIs and project approvals remain unchanged. Every successful hierarchy change increments `hierarchyRevision` atomically and records its actor/action.

## Migration sequence

Run R2 `202610160031_project_workplan_drafts.sql` first, then `202610160032_project_hierarchy_foundation.sql`, in Supabase SQL Editor. Both are additive. No client-visible subtask data is exposed until explicit permission/UI work is reviewed.

## Deliberately deferred to R3b/R4/R5

This patch does **not** yet add the nested milestone card UI, draft support for hierarchy changes, phase-completion approvals/prompts, bulk completion, verified multi-assignees, attachment counters, or automatic parent/milestone progression. R3b will wire the editor to this API without changing the legacy `manage_inquiry_project` request body; later slices will add phase completion review with explicit confirmation. Until then, R2 autosaving covers legacy task/milestone edits only.

## Testing

Run `npm run typecheck`, `npm run verify:platform`, and `npm run build` after applying. Then, in a staff-authenticated test environment, verify initial empty GET, multiple phase assignments, subtask add/update/remove, invalid parent/phase rejection, independent revision 409, project revision 409 after work-plan save, completed project lock, orphan pruning, history actor rows, revoked staff denial, and client/anonymous denial. Migration and RLS must also be tested in Supabase: static platform tests cannot certify database execution.
