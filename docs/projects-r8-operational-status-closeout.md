# R8 — Project operational status and closeout

## Status model

The operational status is a staff-managed layer stored in `project_operational_status`; it does not replace `inquiry_projects.state`, which remains the execution lifecycle used by existing activation, completion, completion review and reopen behavior.

| Existing execution state | Operational status when no R8 choice exists | Relationship |
| --- | --- | --- |
| `active` | Active | Work is operationally active. |
| `on_hold` | On hold | The existing hold/resume RPC remains authoritative and is invoked by R8 transitions. |
| `completed` | Completed | Historical completion remains intact and separate from Inactive. Use the existing reopen action first. |

Explicit R8 states are Active, On hold, Waiting on client, and Inactive. Publishing/release state remains separate; publication does not mean completed or inactive. The migration inserts no historical status rows and performs no data mapping. Old completed and on-hold projects keep their existing execution state and get a derived display until staff deliberately records an operational change.

All transitions use `manage_project_operational_status`, with operational and project revision checks, a project lock, and one audit event. An unchanged request is a no-op. A conflict, invalid reason, missing evidence or closeout blocker does not change project revision, operational revision or audit history. Hold/resume also run `manage_inquiry_project` in the same transaction, preserving its existing authorization, prerequisites, state history and revisions.

Waiting on client is allowed only from Active and requires a reason plus a still-open client-facing record in `staff_approvals` or a pending `project_client_task_responses` row. A client-owned task alone is not evidence. The status query reports when that exact source has resolved. Staff must then explicitly return the project to Active; it never transitions automatically.

Inactive requires Active execution state and an empty closeout checklist. The checklist checks at least one task, every top-level task and subtask, existing task controls, current Bivi approval for client-completed tasks, every milestone's explicit Done status, saved completion for phases attached to work, outstanding approval/request records, lifecycle Handoff, authoritative delivery readiness and existing release/receipt/support/handoff closeout requirements. It checks only phases associated with tasks or milestones; unused phases do not block. Missing controls block. Each blocker links to the owning staff surface. The task progress bar is not a closeout decision.

Returning from On hold uses existing resume prerequisites. Returning from Waiting on client is blocked until the recorded source resolves, then checks current activation prerequisites and accepted scope. Reactivating Inactive also checks prerequisites and accepted scope and requires a reason. Completed projects continue to require the existing authorized Reopen action first; the reopen command advances an existing R8 row to On hold and records a matching Activity event.

## Editing rules by state

- **Active:** existing work-plan editing, assignments, phase/schedule controls, reviews, delivery and existing permissions apply.
- **On hold:** the execution hold remains saved. Staff can use Brief to resume or can continue request/review work needed to resolve a hold. The R8 layer does not disable the existing staff review route.
- **Waiting on client:** staff can use the request/approval/brief/delivery surfaces that resolve the selected evidence. Staff explicitly resumes after the source resolves.
- **Inactive:** project, task hierarchy, task assignments/dates/notes/files, phases, lifecycle, project files, discussion and meetings are read-only at the database trigger boundary. Targeted title-only rename remains independent. Staff can inspect all history and use the authorized reactivation transition. Reactivation does not modify the project body or any work-plan draft.
- **Completed execution:** existing completed-project restrictions and authorized reopen behavior remain authoritative.

## Admin surfaces and scopes

- Brief contains the only R8 operational transition editor, with status-specific reason/source inputs and the linked closeout checklist.
- Overview, Projects directory, workspace project identity, dashboard project previews, My Tasks and project/shared Calendar use the same status label mapping.
- Directory defaults to all accessible projects. Inactive and Completed are explicit filters; neither is hidden from the directory.
- My Tasks and shared Calendar default to operational work (Active, On hold and Waiting on client); each has explicit Inactive, Completed and All filters. Their counts apply the selected scope and filters, not all projects.
- Completion remains separately shown by existing execution/history controls. Publishing remains in Delivery/Publishing.
- Operational transitions appear in Activity with actor, timestamp, old/new status, reason and a link to Brief. The existing notification infrastructure is not invoked because an operational status transition does not itself require a client notification.

## Persistence and security

Migration `20261023153830_r8_project_operational_status.sql` adds an RLS-protected sidecar with no backfill, three staff-gated RPCs for checklist/read/transition, the staff directory read model, operational status in existing staff Calendar/My Tasks read models, Activity history writes, and inactive-work write guards. Follow-up migration `20261023154210_r8_reopen_status_compatibility.sql` keeps the established Completed → On hold reopen path synchronized with an existing R8 row and blocks legacy completion from Inactive. The RPCs deny anonymous/client callers at the database boundary. The API also requires same-origin staff access. No client portal status-management screen or client status disclosure was added.

## Validation and acceptance

Focused PGlite tests cover revisioned transitions, hold/resume integration, verified waiting-source resolution, no-op/audit behavior, conflict and staff authorization, empty plans, missing controls, client Bivi review, pending approvals, required delivery checks and optional unassociated phases. The full platform suite and build/typecheck are recorded with the R8 delivery commit. Authenticated live cross-account, two-session and browser checks remain manual acceptance work; RLS/RPC source and local database behavior do not prove those live UI outcomes.

## Delivery status

- Implemented: sidecar status model and compatibility mapping; targeted transitions; closeout checklist; inactive write protection; common status displays/filters; Activity event; Completed reopen compatibility; tests and roadmap update.
- Historical data mapping: none. No old Completed project was relabeled.
- Live acceptance pending: all transition paths in the authenticated UI, dependency resolution while the page stays open, two-session conflict behavior, client/anonymous boundary checks against live auth and navigation consistency after revalidation.
