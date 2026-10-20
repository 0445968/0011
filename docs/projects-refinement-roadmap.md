# Bivi Projects — Refinements and implementation sequence

Baseline: `0445968/0011`, `bivi-dashboard-overhaul`, following D1a–D1c. Preserve the shared shell and working projects, permissions, history, and revision checks.

## Slice R1 — visual tokens, Overview organization, no-full-reload work-plan saves (this patch)
- Project In progress: yellow/amber badge with partially filled pie icon; Completed: solid green checked circle. On hold remains distinct.
- Task markers: To do = grey dashed empty ring; In progress = yellow center with white gap and yellow outline; Done = solid green circle/check; Blocked = red distinct ring.
- Phase activity: nine purple/neutral upright bars with rounded corners, no numbers. Solid purple means mapped tasks all done, pale purple means tasks underway. Existing hover/accessible descriptions are retained. **These are task-evidence states, not formal phase approvals.**
- Project task-progress bars use a green/teal gradient. Overdue date text is red.
- Overview: project history above record; internal notes removed from Overview (retained in work-plan editor); links to all presently implemented project areas are discoverable. The history panel still contains recorded project events, **not** an invented unified activity feed.
- All history/update timestamps are formatted in `America/Chicago` (CST in winter, CDT in summer). Date-only deadlines remain based on the user's saved timezone.
- Work-plan `Save changes` no longer uses a full page reload on success: client baseline/revision update from the confirmed API response, `router.refresh()` for fresh server data, and drafts retained on failures. Lifecycle transitions still reload in R1. Autosave and saved drafts require a separate transactional implementation.

## R2 — robust unsaved changes and drafts (next technical foundation)
- Autosave debounced work-plan drafts with stable project and user keys, guarded server persistence, revision-aware merge/conflicts, explicit Save all, Save draft, Discard all. Never save destructive bulk edits without authorization.
- Route transitions, tab switches, browser reload, and page close must warn appropriately. Persist drafts across reload intentionally, not by concealing unsaved state.
- Verify concurrency across two browsers, 409 recovery, updated baseline/revisions, saving while typing, and no page reload for normal edits.

## R3 — canonical work hierarchy (migration and API)
- Project > Phase > Milestone > Task > Subtask. Milestone-to-phase many-to-many links and explicit per-phase completion state. Preserve existing task and milestone IDs; backfill associations without guessing.
- Subtasks, start dates, due dates, explicit status, completion percent, verified assignees, priorities (calculated), comments, files, communications, and notes. Avoid overloading the legacy text `owner` field or old JSON schema without migration.
- Milestone starts In progress when any related task begins. When all related tasks finish, prompt to mark milestone completed; when all applicable milestones finish, prompt to close each phase. Never silently close a phase or project; respect cross-phase assignments and revision checks.
- Bulk Mark all / Unmark all with preview, confirmation, permission checks, and one atomic revision; obey blocked/dependency conditions.

## R4 — verified multi-assignee membership and avatars
- Project member avatar stack (owner first, then staff/client accounts), hover names, fallback initials, private signed-image access. Confirm actual owner identity: legacy owner label is not a verified user ID.
- Task owner type Bivi or Client; default current staff user for Bivi and assigned client project manager for Client (only if a verified manager exists). Explicit Select assignees lookup restricted to project's authorized staff or project-linked client company; multi-assignee relationship, permissions, email notifications and audit entries.
- Display assignee avatars in task rows and milestone cards; exclude unrelated client users.

## R5 — milestone-centered Work Plan
- Replace separate Tasks/Milestones lists with a milestone card per milestone; tasks and nested subtasks, due dates, status, calculated priority, attachments counter/preview, linked communications and notes inside.
- Unassigned tasks area remains accessible; never silently hide work outside a milestone. Compact card scrolling and keyboard/touch interactions. Project files link and per-task permission-bounded file previews.
- Automatic suggested priority after a confirmed start date: low until 50% of elapsed scheduled duration; medium from 50%; high from 75%, matching 50% and 25% time remaining. An overdue item is overdue irrespective of priority. Handle zero/invalid intervals, pauses, revisions, and milestone/phase derived dates explicitly.

## R6 — Calendar replaces Lifecycle as visible project tab
- Project calendar with day/week/month/timeline/phase schedule views; colored phases, assignee photos and task/milestone deadlines. Existing lifecycle ownership, blockers, assignments and approval actions move into Task Plan/phase panels before the old tab is hidden.
- Keep old `/projects/[id]?tab=lifecycle` deep links working via redirect/alias until all workflows are moved; do not remove authoritative lifecycle APIs or history.

## R7 — enriched Project Overview
- One horizontally scrollable row of cards for milestones in **active phases**, showing status, done/total, deadlines, member avatars, activity counts, communications and notes counts, and calculated priority.
- Inline task editor actions on Overview (revision-checked, same draft/save model), including status/assignee and nested tasks.
- Project-wide chronological activity feed below milestone cards: task create/complete/reassign/date/priority; milestone/phase changes; brief edits; form signatures; project file shares (with recipient); reminders/emails; project access; communications and notes. Preserve event provenance, authors, timestamp, actor photos, recipients, privacy limits, and dedupe.
- Upcoming project meetings card from the project calendar, only verified events and attendees; notes belong to milestone/plan contexts, not the Overview body.
- Keep navigation to Files, Discussion, Access, Publishing, Brief and Delivery.

## Required validation
- Unit tests for state symbols and phase progress semantics; all three directory views, collapsed/expanded tasks, combined task-status colors in both themes.
- Live logged-in and second-browser verification for saved edits, RLS, project role boundaries, signed images, files and emails.
- No forced page reload for ordinary saved edits; draft recovery and conflicts are visible and recoverable.
- No fake phase approvals, priority dates, members, files, communication events or activity counts. Production remains on `restore` until acceptance.

## Follow-up requirements — Oct 16 (incorporate across R4–R8)
- **Milestone carousel:** Show every milestone linked to the current phase and any concurrently active task phases; show all associated phase labels. Completed milestones move to the right, retaining stable order within their group. Milestones from unrelated inactive phases do not fill the carousel. Provide arrow controls and horizontal touch/keyboard scrolling.
- **Project header:** Remove resource buttons from the title card; put project status on its right. Use the company as primary tab identity, with the actual project title as secondary text rather than the service-derived project type.
- **Project areas/navigation:** Move the Overview, Tasks & Milestones, Calendar/Lifecycle, Brief, Delivery, Files, Discussion, Access, Activity and Publishing links into the existing project menu/tab navigation. Keep existing deep links working. Retire the redundant Project areas card only after those routes are reachable from the menu bar.
- **Project operational status:** Support **Active, On hold, Waiting on client, Inactive**. Waiting on client must come from explicit verified dependency or project status evidence, not simply any client task. Inactive is a deliberate staff-only closeout action after the final stage, with authorization, audit history and a distinct published/completed lifecycle concept. Do not relabel current `completed` records as `inactive` without a migration and review of portal/API behavior.
- **Project activity tab:** Replace generic `save` labels with detailed audited change descriptions for task creation (one/multiple), task title/status/due-date edits, milestone or phase edits, assignment changes, project name edits and all other project settings. Include discussion, form signatures, brief versions, file sharing/recipients, reminders, communications, access, publishing and approvals with correct actors/timestamps/privacy boundaries. No fabricated events; backfill only data the existing audit history actually supports.
- **Overview layout:** Exchange the positions of Open tasks and Project activity. Move the internal Project record card to Publishing. Upcoming meetings, milestone communications/notes counters and task-editing controls arrive as verified backing sources become available.
- **R4a roster scope:** Show avatars only for verified active project client access and actively assigned staff accounts; client-to-individual task assignment, a verified project owner, client managers and multi-assignee relationships require a separate schema/API. Do not mistake the legacy `owner` text field for an authenticated owner identity.
- **R4b permissions:** Bivi controls Responsible side and client-decline policy; organizational project managers may assign their own active members. Client-request workflows (clarification, postponement, modification, conditional decline) require explicit audit-safe states and server authorization before UI controls are enabled.

## R4d — client requests and Bivi review (this patch)
- Task completion by clients is **submitted for review**, never directly marked complete. Staff acceptance is the only review path that sets a client task Done. Direct legacy `done` RPC calls are rejected server-side.
- Client clarification/postponement/modification/conditional decline requests are auditable and reviewed by staff. Accepting a non-completion request does **not** silently edit deadline, scope, or status.
- Conditional decline starts disabled; staff can enable it per client task with a risk and contribution message. Clients must read the in-app warning and submit a reason.
- Manager self-delegation, client-created tasks, communications notifications, unified Activity timeline and staff/client completion notifications remain follow-up work requiring separate permissions and audit checks.

## R5c — verified client organization ownership and delegation
- Establish an authenticated organization owner only through an explicit staff verification tied to an active client organization member; never infer identity from the legacy owner label, a contact role, or a user-editable profile field.
- Let the verified organization owner designate up to five project managers from active project-access members of that same organization. Keep project access, organization membership, owner status, and assignment revisions independently checked server-side.
- Let designated project managers assign client-owned tasks to themselves or other active, authorized members of the linked organization. Record actor, before/after membership, and task revision in the existing audit sources.
- Keep Bivi-only controls and client decline policy under Bivi staff authorization. Preserve current client response and staff-review gates.

## R5d — client-created tasks and complete My Tasks membership
- Let a verified owner or designated project manager create a client-owned task only in an active project phase, with project revision checking, project/task limits, an eligible client assignee, and an audit snapshot. Client creation must not change Bivi-owned work, dates, scope, or completion approvals.
- Update My Tasks to include every active Bivi assignee in `project_task_members`, while preserving existing primary assignments, filters, pagination, dependency state, and staff-only RLS. Do not show client-owned work in the staff queue.
- Use the same verified project organization and active project-access boundary for every client assignee; reject forged IDs, cross-organization access, stale revisions, completed projects, and inactive accounts at the database boundary.

## R5e — milestone-centered Work Plan and complete task hierarchy
- Replace the separate Tasks/Milestones lists with milestone cards, nested tasks/subtasks, accessible scrolling, explicit unassigned work, and linked phase labels for active/concurrent phases. Keep completed milestones ordered last and retain stable ordering.
- Preserve existing IDs and drafts; add dates, status, completion percent, and calculated suggested priority only from confirmed task data. Handle invalid/zero intervals, pauses, overdue work, cross-phase assignments, and revision conflicts explicitly.

## R5f — task files, communications, notes, and activity integration
- Add permission-bounded task file previews and links to existing project files, discussion, communications, and notes within the relevant task/milestone context. Show counters only when backed by real records.
- Extend the audited timeline with supported task assignment, task creation, comment, file, client request/review, and notification events. Preserve provenance, recipient privacy, actor identity, timestamps, ordering, and deduplication; add no synthetic events. Use the existing communications queue for notifications when that integration is scheduled and verified.

## R8 — verified project operational status and closeout
- Support Active, On hold, Waiting on client, and Inactive as distinct operational states. Waiting on client requires explicit verified dependency/status evidence; a client-owned task alone is not evidence.
- Make Inactive a deliberate, authorized staff closeout after the final stage, with an audit entry and a lifecycle concept distinct from publication/completion. Review portal/API behavior and migrate completed records only through an explicit reviewed migration; never relabel them implicitly.
