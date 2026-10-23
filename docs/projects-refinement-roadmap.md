# Bivi Projects — Refinements and implementation sequence

Baseline: `0445968/0011`, `bivi-dashboard-overhaul`, following D1a–D1c. Preserve the shared shell and working projects, permissions, history, and revision checks.

## R8 task-editing consolidation — current follow-up

The canonical task-editing location is **Tasks & Milestones → Tasks**. Each task owns one accessible, grouped settings menu/inline disclosure for title and notes, status and authorized completion override, responsibility and eligible assignees, ownership/blockers/dependencies, milestone and phase associations, start/deadline/priority, subtasks, files/links/discussion, removal and existing task actions. Draft fields use the shared work-plan controller and explicit Save all. Existing immediate sidecar commands keep their own clear save feedback and revision/permission rules. Do not create another task store, editor, preview, drawer or task-detail page.

The Advanced work-plan editor is an alternate view of the same body, draft, baseline, validation and save controller. Equivalent settings use shared command/components. Switching views preserves the task draft and filters/view when practical. Task settings in Overview, milestone previews, Phases, Calendar, Requests and Activity are concise summaries; links resolve to the stable task ID in Tasks & Milestones. Open task clears/relaxes transient filters, reveals, scrolls to, focuses and highlights the row; missing/removed/inaccessible items get a useful explanation. Preserve legacy task links through the shared resolver. General Calendar links remain Calendar links.

Phases owns phase status/color, lifecycle and approval controls. Remove task ownership/blocker/dependency editors from Phases and task-specific preview/editor controls from all other project surfaces. Those pages link back to Tasks & Milestones while retaining useful counts/context.

Client task Done still requires current Bivi review unless an explicitly authorized workflow admin chooses **Override and change status** with a required reason. Keep that targeted override auditable and distinct from approval; it applies only to one task transition and cannot bypass project boundaries, revisions, dependencies, subtasks or integrity rules. Task removal is a separate authorization/integrity path: it is not completion, keeps audit/history, blocks dependent tasks and outstanding subtasks with corrective steps, and never silently deletes related work. Requests/Publishing/client portal remain separate pending roadmap work; do not create synthetic requests.

New-task visibility is scoped: newly created tasks appear immediately in the current draft task list; linked tasks appear in their milestone and unassigned tasks in Unassigned work. Saved lists and project metrics update only after confirmed Save all. My Tasks requires eligible assignment/scope; Calendar requires an applicable date. Active filters and navigation can hide a record, so report the actual scope checked rather than claiming every record appears everywhere.

Implementation and acceptance notes: [R8 task-editing consolidation](./projects-task-editing-consolidation.md). Requests/Publishing expansion remains pending until this slice is accepted.

## Revised Projects follow-up requirements — 2026-10-21

The dedicated Phases page, shared formal phase indicators, Tasks & Milestones slice, and R7B/R7C/R7D technical work are implemented with authenticated UI acceptance pending. R7E technical implementation is delivered in code and its additive migration is applied; external email/cron setup and authenticated UI acceptance remain pending. Keep remaining revised scope explicitly pending until its own implementation and verification are complete.

### R7E — Activity, notifications, Requests and meetings (implemented; live acceptance pending)
- Replace bounded Activity reads with stable audit pagination, preserving predecessor snapshots across pages; inventory real task/hierarchy, phase, assignment, note/comment/file, request, brief, readiness/signature evidence, delivery/handoff/publishing/access and communication sources. Never infer signatures or delivery receipts from unrelated state.
- Finish dedicated Requests navigation/review with status/type filters, verified requester/timestamps/decisions, deep links and old aliases. Preserve explicit completion review, revision checks, decline policy and non-completion semantics.
- Extend existing staff notification inbox and communication outbox with transactional, deduplicated intent, verified recipients/preferences, send-time authorization, retry and truthful processing evidence. Preserve blue dot/read state. Test transport only; no unsolicited real-client tests.
- No suitable project meeting source exists. Add minimal project meetings with explicit timezone/offset, verified organizer/attendees, revisions, scheduled/cancelled status, optional location/URL, audit and functional Calendar commands. Reuse in Overview/shared Calendar; ongoing = started but not ended, cancelled excluded. No automatic invitations or external sync.
- The dedicated Requests section now owns client task request review. Activity uses stable source-record keyset pagination with snapshot predecessor baselines; Overview shares its domain event source. Meetings are first-party project records used by Project Calendar, Overview and the shared Calendar. Existing communication delivery and staff notification infrastructure is extended in place.
- Reuse shared refresh and R7B/R7C guards/drafts. Current layout stays provisional. R7E implementation details, applied migration, verification and manual tests: [R7E implementation and acceptance](projects-r7e-activity-requests-meetings.md). Stop after R7E for user acceptance; R7F, prior pending Brief/Admin Settings relocations and broad visual work remain pending.

### R7D — complete Overview data connections (implemented; live UI acceptance pending)
- Use saved project, formal phases/colors, verified assignments, schedule, productivity and the shared audited Activity service. Keep R7B distinct-ID metrics and the R7C controller; private previews never alter saved totals.
- Default milestone scope is any saved Active phase, once per milestone, stable completed-last order. Explicit All/unassigned scopes keep historical and unassigned work reachable; show every associated phase, actual due date, task completion and verified staff/client assignees.
- Count distinct accessible ready file IDs linked to tasks, nonremoved authored task notes and nonremoved task discussion comments; aggregate across milestone tasks without counting bounded previews. Counts open the corresponding task content context. Unavailable sources show retry, not zero. No milestone-level priority field or staff-readable milestone communication source exists: distinguish task suggestions/manual priorities and record missing sources as pending.
- Recent activity must reuse Activity's domain events, actor mapping, ordering and deduplication; generic revision snapshots stay preserved outside the domain feed. Meaningful snapshot-derived changes remain. R7E adds broader event coverage, notifications and verified meetings.
- Existing layout and R7B/R7C protections are preserved. Typecheck, 156 platform tests and build pass; authenticated browser acceptance is pending. [Implementation, source contracts, limitations and exact manual tests](projects-r7d-overview.md). Brief name/owner/activation, Requests, Admin Settings technical history, Calendar grid and end-of-R7 visual work remain pending. Stop after R7D for user testing.

### R7B — data integrity, completion and statistics (implemented; live UI acceptance pending)
- Preserve Project → Phase → Milestone → Task → Subtask IDs and milestone many-to-many phase links. Effective task phases are the union of the direct control phase and linked milestone phases; these are independent associations, not a contradiction. Do not infer missing associations. Keep unassigned work visible; surface orphan/missing records.
- All linked tasks are required: the existing model has no optional-task flag. Unfinished subtasks block task completion; unfinished tasks block explicit milestone review. Client completion requires recorded Bivi review. Phase closure validates every applicable task, milestone, subtask, dependency and approval. Parallel phases remain independent.
- Validate the submitted candidate atomically, including legitimate same-save task/milestone completion. Rejections must preserve revision, audit and drafts. Reopening requires reopening completed ancestors/dependents explicitly first or in the same candidate.
- Shared distinct-ID metrics: Open = Total − Done, Blocked is a subset of Open, subtasks separate, no join inflation, empty progress unknown, overdue excludes Done and uses the saved user timezone. Filters/pages are labeled subsets, never project totals. Unavailable reads fail visibly. Draft counts remain labeled and isolated from saved dashboards.
- Verify R7A save/conflict/recovery and phase foundations through behavior/database tests; live UI acceptance remains pending until exercised in authenticated sessions.
- Layout remains provisional. Only necessary operability fixes belong here, including milestone title width in three-column mode. Defer card density, spacing, theme polish and other visual refinements to the end-of-R7 frontend pass. Pending Brief/Requests/history relocations, Calendar month grid and all other agreed requirements remain pending.
- Implementation, applied migration ledger, known legacy review exception and exact acceptance steps: [R7B implementation](projects-r7b-data-integrity.md). Technical checks and hosted read checks are distinct from authenticated browser acceptance. No acceptance claim is made for the earlier Phases or Tasks & Milestones slices.

### R7C — shared editing and reliable saves (implemented; live UI acceptance pending)
- Overview task/milestone actions open the same work-plan editor used by Tasks & Milestones. Compact/advanced views, selected deep links, recovery, explicit Save all/Save draft/Discard and dirty navigation use one controller and baseline. Overview statistics continue to display saved data.
- Work-plan titles, statuses, deadlines, task-to-milestone links and notes remain private edits until Save all confirms the canonical save. Phase/color, assignment, hierarchy/subtask, schedule, authored note and file commands retain their explicit immediate-save boundaries and existing permissions/R7B gates.
- Submitted snapshots are distinct from later typing. Validate/reconcile/confirm/unknown/refresh-failed results remain distinct; duplicate writes and stale responses are guarded. Discard fences the generation actually loaded, waits for pending autosaves, adopts the authoritative body and does not delete another session's newer draft. Navigation discard waits for persisted deletion.
- Saved mutations revalidate affected staff/client paths and notify mounted readers. Revisions are paired with their authoritative bodies or sidecar data; refreshing does not replace a token while retaining an obsolete body. Controls with pending local selections require explicit review against newer saved revisions.
- R7B migrations and guards were verified read-only; its UI acceptance and legacy client review exception remain pending. No R7C migration is required. [Inventory, implementation and acceptance steps](projects-r7c-shared-editing.md).
- Final R7C technical checks passed: typecheck, 146 platform tests and build. Authenticated browser acceptance remains pending; no production deployment was performed.
- Layout remains provisional. No broader redesign, pending relocation, Calendar grid or following roadmap slice is included. End-of-R7 frontend refinement remains pending.

### Dedicated Phases and shared indicators — implemented; live UI acceptance pending
- Add **Phases** to project navigation. Move phase customization/statuses, deadlines, compact stats and breakdowns, plus “Lifecycle, dependencies and approvals” from Calendar into Phases. Keep task assignment, dependency and approval actions reachable through authoritative APIs/RPCs, permissions, revisions, and audit sources; avoid competing editors.
- Preserve old phase and lifecycle deep links with aliases or redirects. General Calendar links must continue to open Calendar.
- Overview reuses its existing phase bars to show authoritative saved formal states: Inactive is neutral, Active uses the light phase color, and Completed uses the solid phase color. Do not add a separate saved-status block or permanent phase-name badges. Preserve simultaneous active phases and map stored `planning` to the intended Inactive display without introducing another status model.
- Phase name and status are available on hover, keyboard focus, and mobile; provide a non-color distinction to assistive technology. Keep task-completion percentage separately labeled.
- Staff can configure each phase color in Phases. Use a single persisted, per-project authoritative color source (unless an established scope already governs it), revision checks, authorization, and audit history. Share display/color utilities across Overview bars, Project Calendar, milestone indicators/cards, and other phase displays. Validate colors, support light/dark readability, preserve stable phase IDs/associations, and retain established purple defaults when unset. Never make browser storage the authoritative source or recolor unrelated projects.
- Phases provides a compact project summary, unique project totals for phases/milestones/top-level tasks, active/completed phase counts, and a collapsible milestone/task breakdown per phase. Phase breakdowns can overlap and must not be summed into project totals; subtasks are separate from top-level tasks, and unassigned work remains discoverable.
- Every active phase visibly shows its deadline information, including when several phases are active. Use existing task/milestone dates. Any derived range must be labeled derived and its derivation documented; missing dates remain unscheduled.
- Use compact rows and progressive disclosure instead of long expanded lists or several tall scrolling panels. Phase status/color actions show saving, saved, and error feedback beside the affected phase. They save independently of Save tasks & milestones, keep R7A validation/conflict/recovery behavior, and do not claim success from optimistic UI alone.
- Refresh Overview, Calendar, and affected cards consistently after a saved phase change without losing unrelated drafts or forcing a full reload.
- Preserve all existing permissions, revisions, audit history, saved data, IDs, RLS, and approvals. Prepare reviewed additive migrations and apply only after verifying the intended Bivi project and migration ledger; verify resulting schema/RPC behavior. Do not reset the database or apply unrelated changes.

### Tasks & Milestones — implemented; live UI acceptance pending
- **Tasks & Milestones:** Compact cards, 1/2/3-column layouts, and filters for phase, responsible side, assignees, status, and deadlines. Open the advanced work-plan editor inside this section through a top-level action and provide “Back to tasks & milestones.”
- Implementation and acceptance details: [Tasks & Milestones redesign](./projects-tasks-milestones-redesign.md). Existing R7A draft generation, validation, conflict and recovery protections remain required. Validate combined filters, grouping, responsive columns, internal editor navigation, drafts, revision changes and dependent displays. Run typecheck, platform verification and build before pushing; live UI acceptance remains a separate status.

### Remaining revised requirements — pending
- **Brief:** Move verified organization owner and Activation snapshot here; make project name editable here.
- **Requests:** Delivered in R7E: client task requests and staff review are in the dedicated Requests project section. Authenticated UI acceptance remains pending.
- **Activity and Admin Settings:** R7D delivers Overview’s real Recent activity preview through the shared domain Activity service, preserving meaningful snapshot-derived changes and all audit records. Moving the remaining technical save/revision history from the work-plan workspace to Admin Settings is still pending.
- **Calendar:** Provide a proper month grid with previous/next/today navigation, alongside useful existing views.
- **Phases live acceptance:** Verify simultaneous phase activation across reload; independent phase completion; saved formal-state bars; persisted color propagation; hover/focus/mobile labels; shared/missing-date stats; relocated lifecycle actions/deep links; draft/revision recovery; and light/dark/narrow layouts. This acceptance remains pending. Never modify, merge into, or deploy `restore`; stop after each implementation slice for user testing.

### Implementation status — 2026-10-21
- Phases/shared-indicator code and automated checks are complete: `npm run typecheck` passed, `npm run verify:platform` passed (118 tests), and `npm run build` passed. Interactive staff acceptance of state changes, color propagation, narrow/dark layouts, and draft/conflict behavior is pending user testing; no live project phase or color records were changed.
- Applied `20261023120000_project_phase_colors.sql` to active Supabase project `0011` (`xxnvekmbotzcyuhsyxbw`). Schema, RLS policies, table grants and RPC execution grants were verified read-only. The Supabase migration listing is empty and `supabase_migrations.schema_migrations` is absent, so there is no database ledger entry to report.
- All other revised requirements listed as pending above remain pending.
- Subsequent read-only verification for the Tasks & Milestones slice found the migration ledger now present with `project_phase_colors` at remote version `20261021202346`. The repository migration file is `20261023120000_project_phase_colors.sql`; it was not reapplied. R7A phase guards, draft baseline columns, generation table/RPC checks, RLS and authenticated-only draft RPC grants are installed.
- Tasks & Milestones implementation is complete. Typecheck passed, platform verification passed (125 tests), and the production build passed. The slice adds compact cards and responsive columns, all agreed filters, task grouping and persistent internal editing views; it retains the dedicated Phases page and R7A protections. No migration or database mutation was required. Browser automation was unavailable, so live UI acceptance remains pending in [the slice acceptance checklist](./projects-tasks-milestones-redesign.md#manual-acceptance). Brief, Requests, history relocation and the Calendar month grid remain pending.

## Slice R1 — visual tokens, Overview organization, no-full-reload work-plan saves (this patch)
- Project In progress: yellow/amber badge with partially filled pie icon; Completed: solid green checked circle. On hold remains distinct.
- Task markers: To do = grey dashed empty ring; In progress = yellow center with white gap and yellow outline; Done = solid green circle/check; Blocked = red distinct ring.
- Historical R1 behavior: phase activity bars reflected task evidence. This is superseded by the revised formal saved-status indicators above; task completion remains separately labeled progress.
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

## R6 — Calendar and Lifecycle Controls (historical placement, superseded)
- Calendar currently provides the existing day/week/month/timeline views, colored phase indicators, assignee photos and task/milestone deadlines. The revised roadmap requires a proper navigable month grid; that is pending above.
- Lifecycle, dependency, assignment and approval controls now live in Phases. Old `/projects/[id]?tab=lifecycle` and `?tab=calendar&view=phases` links resolve to Phases; general Calendar links still resolve to Calendar. Authoritative APIs, permissions and history remain.

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
- Implemented on `bivi-dashboard-overhaul` in `docs/projects-r8-operational-status-closeout.md` and migrations `20261023153830_r8_project_operational_status.sql` and `20261023154210_r8_reopen_status_compatibility.sql`.
- Operational state is a revisioned, staff-only sidecar. Existing execution states and historical Completed rows are preserved; no historical mapping/backfill was performed. On hold reuses existing hold/resume behavior; Waiting on client requires a currently eligible approval, pending client request or actionable client task explicitly blocking unfinished Bivi work; Inactive requires the explicit closeout checklist and remains distinct from publishing/completion. The selector and transactional command share eligibility rules and report task-control blockers.
- Added consistent operational status labels and directory/My Tasks/Calendar filters, Brief transition controls and closeout links, Activity entries, and database guards against operational edits while Inactive.
- Local focused database tests, typecheck, platform verification and build are part of R8 delivery. Live authenticated acceptance remains pending for transition UX, cross-account authorization, dependency refresh and two-session conflict checks.
- Inactive and Completed remain explicitly discoverable in the directory. My Tasks and Calendar default to operational work and expose explicit Inactive, Completed and All scopes.

### R8 follow-up 1 — task-status validation and reasoned admin workflow overrides
- Validate submitted task candidates against the saved baseline. An unchanged historical completed client task must not block an unrelated task edit or status change.
- Completion-review freshness is tied to that task's submitted work and completion-relevant control snapshot, not unrelated project metadata, priority, assignment or project-wide revision churn. Ownership, phase, dependency and blocker changes remain gated.
- Return a structured task gate with the affected task, unmet requirement, corrective actions and whether a designated workflow admin can override it.
- The only supported override gate in this slice is the current Bivi review requirement for an explicit transition of one client task to Done. It requires a reason and a transactional task/project revision check. It does not create client/Bivi approval evidence or bypass task dependencies, subtasks, closed phases, RLS, project boundaries, invalid references or conflicts.
- Override evidence is immutable and scoped to the task work revision and exact Done transition. Reopening or materially changing that task makes the old override inapplicable while retaining its audit record.
- The repository currently has active/inactive staff membership, but no Bivi admin role. A separate workflow-override capability is service-managed, defaults to nobody and cannot be granted by staff or clients. Account provisioning remains an explicit deployment administration step; do not infer an admin from being the only active staff member.
- Validation, UI and delivery details: [R8 task-status follow-up](./projects-r8-task-status-overrides.md).

### Requests / Publishing / client portal — pending follow-up slices
- **A. Manual inbound and outbound Requests:** Never create requests automatically from task changes. Admin-created outbound requests select incomplete client tasks. Admins can record externally received inbound requests with provenance. Requests support subject, description, links, permission-bounded files and project contacts; can be added to My Tasks, assigned to a team member or linked to existing work without removing existing authorized request access. Prevent duplicate task creation. Define explicit completion/review policy and reasoned admin override.
- **B. Publishing integration:** Publish/send one request or explicitly include requests in a project update. Publishing lists included requests and linked tasks, previews exact client-visible text and attachments, preserves published versions, prevents duplicate publication/notifications, and distinguishes publication from verified delivery.
- **C. Client portal follow-up:** Add manual request submission, responses, attachments and review decisions, a client approval-required preference for inbound requests, portal visibility and notifications. Do not synthesize requests to fill empty lists.

## R7G — compact Projects frontend and reusable visual blueprint

- Implemented on `bivi-dashboard-overhaul`: shared staff Projects visual primitives and documented design/layout rules in `docs/projects-r7g-visual-blueprint.md`.
- Tightened Overview, Tasks & Milestones, Phases, directory, Brief, Activity, Requests/review, Files, Discussion, Access, Publishing and both project/workspace Calendar surfaces. Work-plan editing, filters, navigation, phase colors, permissions and existing save controller remain in place.
- Workspace and project Calendar now render a navigable month grid with a preserved agenda/day-list option and overflow access. Brief now owns project name editing, verified organization owner controls and activation/proposal snapshot.
- No database migration was required. No R7F implementation was found in local history/notes; R7F remains unverified rather than assumed delivered.
- Automated checks are recorded in the R7G delivery notes. Rendered viewport/theme comparisons and authenticated live UI acceptance remain pending because this environment has no browser automation runtime or live authenticated session.
- R7G is implementation-complete for the scoped presentation changes, pending user visual acceptance. Do not start R8 or redesign other dashboard pages without a new request.
