# R8 task-editing consolidation

Branch: `bivi-dashboard-overhaul`. This slice consolidates the existing Projects task controls and repairs task-removal integrity. Manual Requests/Publishing/client portal expansion remains pending.

## Canonical editing model

- **Tasks & Milestones → Tasks** owns the task rows and their grouped **Task settings & actions** disclosures. Draft task fields use the existing shared work-plan controller and **Save all**. Assignment, ownership/blocker/dependency, schedule, hierarchy, productivity, and file commands keep their established immediate-save boundaries and revision/authorization checks.
- **Advanced work-plan editor** remains within Tasks & Milestones and edits the same work-plan body/draft/baseline. It links to the task's shared settings disclosure for sidecar controls. Returning to Tasks preserves the mounted board, draft, filters and selected task.
- Overview, milestone previews and Phases show concise task context and open the canonical Tasks view. Phase status/color, lifecycle and approvals remain in Phases; task ownership/blockers/dependencies moved to the task settings disclosure. Calendar, Requests and Activity task links retain stable IDs and resolve to the task view where the link was task-specific.
- **Open task** clears board filters, selects the Tasks view, opens/focuses the task row, scrolls it into view and applies a visible focus highlight. Legacy task links from phase/lifecycle routes map to Tasks; generic Calendar links stay on Calendar. Missing/removed tasks keep the page-level explanation.

The disclosure exposes title/notes, status, milestone, start/deadline, suggested/manual priority, assignment, task controls, subtasks, notes/files/comments/links, removal and the established actions. It labels draft Save all separately from immediate sidecar saves. Client completion override appears in that task disclosure after its review gate rejects the draft, with a required reason, only when the existing explicit workflow-admin capability is true.

## Completion and removal findings

The active Supabase function and repository R8 migration both gate completion when a **candidate task** changes to `Done` without current Bivi review (or when project closeout rechecks applicable work). The task-removal UI submits the work-plan body with the removed ID absent. A removal-only candidate therefore does not run the removed task through the completion gate. Local PGlite regression now proves a completed client task can be removed without review evidence and that no approval is fabricated. Ordinary new client completion still rejects without review; the targeted, audited admin override remains the explicit alternative.

The exact user-reported completion-review message on task removal could not be reproduced from the current R8 save/RPC/trigger behavior. If it persists in the live UI after this fix, the runtime likely included a separate candidate status transition or used stale/incompatible code; capture the project/task ID and failed request body/response to isolate it. No task was reopened or approved during this work.

The existing post-save cleanup silently pruned subtasks when a parent task was removed. New migration `20261023192405_project_task_removal_integrity` adds a before-update integrity trigger. It blocks removal while subtasks remain and while a remaining task depends on the removed task. Subtasks must be explicitly handled first. Existing task history and linked notes/files/discussion are not deleted by this guard. The normal task disclosure disables removal until hierarchy data is loaded and all subtasks are handled; the server remains authoritative for the advanced editor and concurrent changes. Rejected saves preserve revision and history.

## New-task visibility

Creation appends a stable-ID task to the shared draft body and resets the task filter/page; the normal view selects the task immediately. A task with a milestone appears in that milestone; an unassigned task appears in the Tasks view and Unassigned work scope. Confirmed Save all is required before saved lists/statistics change. My Tasks requires eligible assignment and scope. Calendar requires a saved task date. Because the user's missing destination was unspecified, no unique visibility failure was attributed.

## Database and verification

The connected project was verified as `0011` (`xxnvekmbotzcyuhsyxbw`, healthy). Before applying the additive trigger migration, the ledger ended at `20261023182352 r8_relevant_review_freshness`. It now contains `20261023192405 project_task_removal_integrity`. Read-only verification confirmed the trigger/function definition and that anon/authenticated cannot execute the trigger function directly. No project/task records were edited by this migration.

The new database regression uses PGlite and the same removal trigger SQL. It covers removal without a review, removal blocked by outstanding subtasks with no partial revision, plus existing R8 completion-gate/override regressions. UI source-level checks cover canonical menus, Phases ownership, deep-link selection, and removal of Overview preview editors. `npm run typecheck` passed. `npm run verify:platform` passed (196/196). `npm run build` passed; Next emitted existing Tailwind arbitrary-value ambiguity warnings and client-rendering notices for `/help/contact/demo` and `/help/search`. These checks do not replace authenticated browser acceptance.

The workflow override capability remains explicitly unassigned in the live database (the R8 role model has no staff-admin role). No account was guessed or granted override access. Until a trusted operator provisions a verified admin, live staff can use the normal current-review flow but no live user can exercise the override.

## Manual acceptance

1. In a non-production test project, open Tasks & Milestones → Tasks. Expand **Task settings & actions** and verify work-plan fields, task controls, assignees, schedule, priority, subtasks, notes/files/discussion and removal are grouped there. Make a title/status edit, confirm draft feedback, then Save all.
2. Open Advanced work-plan editor, change a task field, use **Open shared task settings**, make an ownership/dependency change, then return to Advanced and back. Confirm work-plan edits, board filters/view and save baseline remain intact. Confirm immediate ownership changes are disabled with an explanation while the work-plan draft is dirty.
3. Open an Overview, milestone or Phases task link while filters hide the task. Confirm the route is Tasks, filters clear, the correct stable-ID row opens, focus/highlight is visible, and it scrolls into view. Use browser Back. Test a removed task link and legacy `?tab=phases&task=...` and `?tab=lifecycle&task=...` links. Confirm ordinary Calendar links still open Calendar.
4. Attempt client task completion without Bivi review. Confirm the task remains unsaved and the affected row shows the exact review requirement. With an explicitly provisioned workflow admin, enter a reason and choose **Override and change status** once. Confirm the task saves, audit/activity identifies the override and reason, and no client review is fabricated. Reopen/edit and verify the old override does not authorize another completion.
5. Remove a client-owned task that is already Done but lacks review. Confirm removal itself does not request completion review. Try removing a parent with a subtask or a task with a dependent child; expect an actionable blocker with no saved revision change. Explicitly remove/reassign the subtask/dependency and retry.
6. Add an unassigned task and a milestone-linked task. Confirm both show immediately in the current draft view; the linked one appears in its milestone and the unassigned one in Unassigned work. Save, then verify saved totals. Verify My Tasks only after eligible assignment and Calendar only after an applicable date.
7. Check a narrow viewport, light/dark appearance, keyboard traversal, and touch opening/closing of grouped task settings.

## Delivered / Partial / Pending

- **Delivered in code:** grouped task settings in the canonical Tasks view; shared lifecycle control component; Advanced editor returns to the same task settings; Overview/milestone task inline editors removed; Phases task controls hidden with canonical link; task-specific legacy links resolve to Tasks; task removal is stable-ID based and has server-side dependency/subtask integrity checks; regression tests added. Required automated checks passed.
- **Partial:** exact previously reported completion-review message on removal was not reproducible against the currently installed R8 guard; current SQL makes removal-only saves bypass that completion gate and tests prove this. Authenticated UI and real concurrency acceptance remain pending.
- **Pending:** provisioning a verified workflow admin before live override testing; authenticated browser/two-session acceptance; follow-up Requests/Publishing/client portal work.
