# Tasks and workspace expansion

Requested 29 October 2026. Baseline: production PR #17, bfa439ef0be7b7316d26a250ca0d05b2ba74af58. This is the implementation scope; items below describe the full requested scope.

## Released foundation (PR #18)

Implemented: whole menu-bar and record-section-bar visibility in Workspace Settings; top-bar right-click menu and an accessible hamburger button for bar visibility, sidebar expansion and guarded refresh; transparent task-row hover; inline responsive search; collapsible Table/List categories with add, select, clear and collapse actions; removal of the Requests explanatory link. Existing task drafts and selection identities are preserved. No database migration is required.

Remaining in subsequent coordinated patches: per-task action/context menus and archive semantics; workspace task tabs/sidebar subitems; editor/title/description/tabs; colored tags; weekday/time column toggles; list subtasks; asset types/requirements/deliverables; review flow; private to-do lists. Review routing defaults to internal or client, chosen per task, following the recommendation in the conversation.

## Editor and task menu patch

Implemented in this patch: click-to-edit task title and description, empty Add description action, muted description editing surface, Activity/Files/Comments/Private Notes tabs preserving drafts, author-only task-note reads and activity history, and shared right-click/action-button menus for rename, duplicate, move to a milestone, copy link and share. All work-plan edits remain drafts until Save task or Save all. Duplicate creates a fresh To do task from title, description, due timing and milestone; assignments, tags, dependencies, files, history and start timing are independent. Sharing respects existing record access.

Migration: private_task_notes, recorded remotely as 20261029193740. Existing staff task notes and their history are now visible only to their authors; note mutation already requires author identity. Direct reads and privileged activity readers enforce the same ownership. Notes with no remaining author stay inaccessible.

Remaining: reversible archive, dedicated workspace task tabs/open-tab hover action, sidebar subitem preferences, colored tags, weekday/time column options, subtask list visibility, assets/deliverables, review flow and personal to-do lists. Move currently means moving between milestones in the same project; cross-project moves require explicit handling of dependencies and related records.

## Workspace task tabs patch

Implemented: explicit Open in workspace tab action/hover button for saved tasks; stable task record identity keyed by project and case-sensitive task ID; multiple task tabs distinct from the parent project; pin/bookmark/recently-closed restoration; preserved task titles; safe canonical links; project section navigation from task tabs; account-scoped sidebar choices for projects, tasks, inquiries, people and companies. Hiding a record type in the sidebar preserves tabs and bookmarks. Regular task-editor links retain project-tab behavior. Unsaved work must be saved before opening a saved task in a dedicated workspace tab. No migration is required.

Reversible archive remains a separate backend patch: it must retain dependencies, subtask history and completion obligations across all saved views. Milestone record tabs/sidebar choices remain pending alongside other future subitem types.

## Reversible task archive (migration 20261029201158)

Implemented: archive/restore actions add a boolean archive state to the existing work-plan task and remain private drafts until Save task or Save all. Archived view and direct task links provide Restore in draft. The same task identity, status, subtasks, dependencies, assignments, files, notes, comments and history are preserved. Archived tasks remain part of overall project completion/progress and unfinished archived work still blocks milestones, phases and dependencies. Active deadline summaries, personal My Tasks, project calendar and workspace calendar omit archived tasks. Overview labels distinguish active open work from overall completion. Archive/restore changes appear in project task activity.

Migration 20261029201903 suppresses new client task deadline reminders for archived tasks and checks archive state before sending queued deadline/assignment messages. Restore makes eligible pending reminders actionable again; no messages are sent by the migration.

Archive does not remove tasks from the existing project task limit. Restore retains the original status; it does not create a new task or bypass client review. The editor presents archived tasks as read-only until restored. No task history is deleted.

## 1. Workspace controls and task interaction

- Remove the Requests/decline-policy explanatory link from Tasks.
- Expose saved File/Edit/View menu visibility in Workspace Settings alongside record tab visibility.
- Right-click the logo/top bar to open a hamburger-style workspace menu with bar visibility controls and Refresh. Provide keyboard and touch access too; refresh must honor unsaved-work protection.
- Make task-row hover backgrounds and outlines transparent while retaining keyboard focus indication.
- Keep search adjacent to its toolbar button when space permits; wrap below on narrow screens.
- Shared task context/action menu: rename, duplicate, move task, copy link, share, archive. Hover actions: edit, open in workspace tab, actions.
- Define duplicate/move/archive using existing permissions, revisions, associations and private-draft safeguards. Archive is reversible and distinct from delete. Sharing never grants access implicitly.
- Collapsible task categories with counts and a three-dot menu: add task, select category tasks, category-wide actions. Empty header space toggles collapse; child controls do not.
- Show/hide subtasks in task lists, preserving hierarchy and distinct selection identities.
- Independent weekday and time display options for start/due columns. Match supplied weekday/date reference.

## 2. Task editor, tags and navigation

- Task title is plain text until clicked; inline editing has no permanent input border or edit button.
- Empty description offers Add description. Existing description edits on click in a muted box, darker while editing.
- Preserve private draft, Save task and Save all semantics, including keyboard commit/cancel and safe navigation.
- Activity, Files, Comments and Notes (private) become sliding/underlined tabs matching the reference. Preserve contents, counts and drafts when changing tabs. Verify private notes authorization.
- Colored label tags default to gray. Create/select color in task editor; manage names/colors in Project Brief. Stable tag identity keeps references intact when renamed.
- Tasks can open as distinct persistent workspace tabs, with canonical record identity and direct links.
- Workspace Settings controls which project records, milestones, tasks and other supported subitems appear in sidebar. Settings must not discard open tabs or bookmarks.

## 3. Required assets and deliverables

Terminology: Asset types is the reusable directory in Templates; Required assets is the task checklist; Deliverables are actual uploaded files or links satisfying requirements.

- Asset types have stable identity, name, category, description and optional uploaded preview.
- Starter categories: content/strategy (copy, mission/vision, research, brief, sitemap); brand/design (logo, palette, typography, UX flow, wireframe, UI design, presentation); media (company/stock photo, company/stock video, illustration, audio); web/functionality (form, contact details, page, integration, development); validation (testing, feedback, review, report, accessibility/compliance); operations (marketing, support, list).
- Requirements and delivered files remain separate entities; task columns summarize requirement fulfillment.
- Attach deliverables by upload or link and assign one or more asset types. Suggest task-required types first; allow full directory selection.
- One deliverable can satisfy multiple requirements. Multiple deliverables can satisfy one requirement. Removing the last qualifying deliverable makes that requirement outstanding again.
- Preserve task/project ownership, file access, revisions, audit history and existing completion gates. Directory previews are not task deliverables.
- Define whether review-required requirements count as supplied versus approved; do not equate upload with review approval.

## 4. In Review

- Add visible In Review task category/status with spark icon matching reference.
- For review-required tasks, Complete initiates an explicit Send for review confirmation; confirmation transitions to In Review, not Done.
- Review acceptance completes the task; changes requested returns it to actionable work with feedback.
- Admins may manually change review state under existing authorization/audit rules. Regular users cannot bypass review via bulk edits, drafts, direct API calls or alternate views.
- Preserve existing client review/approval and dependency gates; define reviewer routing before implementing the migration.

## 5. Personal to-do lists

- Private lists owned by the signed-in user, with a default Main list and user-created categories/lists.
- Manage from avatar menu; optional top-bar to-do button controlled in Workspace Settings.
- Choose the list featured on the main dashboard.
- To-do items can reference supported assets, projects, messages, tasks, meetings and other records through typed links. References respect source permissions and handle archived/deleted records.
- Personal completion is independent of project task completion and approval state.

## Delivery and verification

Bundle smaller requests with the next substantive patch; no standalone small-change releases unless explicitly requested. Use coherent patches in the sequence above, preserving every requirement. Apply required Supabase migrations with matching repository versions and report them. Verify drafts, authorization, review bypass prevention, reversible archive, duplicate/move integrity, asset fulfillment recalculation, private list isolation, keyboard/touch controls and responsive layout. Production deployment follows the established checked-PR workflow because the user's admin portal is inaccessible in preview.


## Task controls and overdue feedback (next bundle)
- Inline priority popover in lists and full editor; pending draft/save reconciliation is explained in the popover rather than hiding the control.
- Calculated overdue Urgent priority retains manual priority, returns after completion/rescheduling, and sorts consistently. My Tasks uses the same overdue meaning.
- Red overdue date text, filled phase-colored milestone folders at 60% opacity, diagonal rocket start icon, empty start-date calendar control, blue Tags button, conditional Description heading.
- Archived toggle moves into the count footer. Category focus no longer keeps the selection checkbox visible after collapsing.

## Queued additions from latest feedback
- Logo-row breadcrumbs on the left; workspace bar visibility menu in the staff avatar menu.
- Single-row responsive toolbar: labels disappear from right-side Save controls first, then left-side filters; mobile Filters menu and horizontally scrollable labeled filter row.
- Desktop search slides into reserved space, otherwise expands as a full-width second row without moving toolbar controls. Mobile full-width search above filters. Keep the toggle in the toolbar, omit the field icon in expanded mode.
- Move task timezone editing to Project Brief with explicit project-default and existing-task timezone semantics.
- Colored tag catalog and date-column weekday/time display preferences remain queued.


## Work recovery and task controls follow-up
- Existing saved task priority and assignees can be edited without saving unrelated task drafts. Assignment popovers open beside their triggers in table, list, milestone previews and full editor. New task records must exist before sidecar assignment.
- Empty task starts read Not started; due dates retain the dash. Clock-fading In progress, purple-pink Loader In review, and Octagon-X Rejected.
- Review displays/categories derive from the latest existing completion-review request; completed tasks leave active review categories. Generalized client-review routing for staff-owned tasks remains in the review-workflow roadmap.
- Local per-staff/project checkpoints protect edits before server debounce; server private drafts remain authoritative and recover through an upfront prompt. Recovery rebases against newer canonical projects and requires choices for conflicting fields.
- Discard flushes a recoverable server snapshot first. The last recovery copy remains accessible in Draft changes, even after intentional discard; discard does not automatically restore it on reload.
- Workspace Work recovery settings preserve copies for 1/7/14/30/60 days (30 default). RLS hides expired copies immediately; a daily authenticated cleanup removes them. Primary intentionally saved private drafts are distinct from expiring recovery copies.
- Internal navigation/refresh and standard reload shortcuts offer Save changes, Save as draft, Discard and Stay. Browser Reload/Close retains the browser's standard warning because custom beforeunload dialogs are prohibited by browsers.
- Migration: workplan_recovery adds private recovery storage, retention preferences, trigger-only snapshot preservation and security-invoker review display view.
