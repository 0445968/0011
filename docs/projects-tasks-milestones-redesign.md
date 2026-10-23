# Tasks & Milestones redesign

## Agreed scope

The revised roadmap requires compact cards, 1/2/3-column layouts, filters for phase, responsible side, assignees, status and deadlines, and a top-level Advanced work-plan editor action inside Tasks & Milestones with **Back to tasks & milestones**. This slice implements those requirements and preserves the existing supported task controls. Brief, Requests, history relocation and the Calendar month grid remain separate pending slices.

## Interface and filtering

- Milestones start collapsed and show whole-milestone task completion, due date, saved phase colors and associations. Completed milestones sort last without changing their stored order. Expand to see matching task cards or use Edit milestone for detailed controls.
- Task cards distinguish top-level tasks from their subtasks and show verified responsibility/assignees, deadline, status and phase associations. Open task reveals task fields, milestone assignment, start date, suggested priority, work-plan notes, authored notes, files, comments, subtasks and saved dependencies. Dependencies and approvals remain managed in Phases.
- Tasks can group by milestone, status or responsible side. Each task appears once in a group; shared milestone phases do not duplicate project totals. Unassigned work remains discoverable and explicitly reports when filters hide it.
- Column selection is a maximum: one column on narrow screens, up to two or three at wider widths. Both themes use the existing tokens and persisted per-project phase colors.
- Filters combine on the same task. A task belongs to its canonical task-control phase and its milestone's linked phases. A milestone matches its own searchable/status/date/phase fields or a task matching all filters; responsible-side/assignee filters always require an actual matching task. Missing saved assignment records are labeled unknown, rather than invented as unassigned staff work.
- Search includes task titles, notes, legacy owner labels and milestone titles. Deadline ranges are inclusive date-only comparisons. Overdue excludes completed work. Next 7 days includes today through six days later. Undated work remains unscheduled; date ranges exclude undated work.

## Editing, saving and recovery

- Compact and advanced views share one canonical work-plan draft and Save all action. Switching to Advanced and Back retains filters, card layout and local task details. Existing exact task/milestone deep links still open the appropriate advanced controls. Adding work opens its editor directly.
- Visited task detail panels stay mounted while filtering, grouping or opening another task. Local note/subtask inputs are not discarded by those view changes. Unsaved authored notes and new subtasks participate in the existing workspace navigation guard.
- The workspace identity stays stable across saved project revisions. The R7A draft hook reconciles current in-memory edits against the latest canonical body before considering an older private autosave; clean updates adopt the latest saved body. Existing same-field choices, draft generation fencing, uncertain-save checks, validation blockers and confirmed discard behavior remain intact.
- Task/milestone fields retain the server-backed private draft. Assignments, start dates, priority, authored notes, attachments and subtasks retain their existing revision-checked APIs and staff permissions. Those controls show saving/saved/error feedback, and confirmed writes refresh dependent server views without a full reload. They remain gated while the canonical work plan has unsaved edits.
- No phase editor was reintroduced into Tasks & Milestones. Phases retains color/status management, phase links, dependencies and approvals. Existing Overview, Calendar and Activity backing sources remain authoritative.

## Database and verification

No migration is required. Active Supabase project `0011` (`xxnvekmbotzcyuhsyxbw`) was inspected read-only. Its migration ledger lists `project_phase_colors` at version `20261021202346`; existing R7A objects and authorization/generation guards were independently confirmed. No database rows, RPCs, RLS or migrations were modified.

Implementation and required automated verification are complete: `npm run typecheck` passed; `npm run verify:platform` passed all 125 tests; `npm run build` passed. The first build attempt hit the sandbox IPC port restriction (`EPERM`); the approved build permissions resolved it. Existing Tailwind utility ambiguity and help-page client rendering warnings remain. Browser automation is unavailable in this session, so live staff UI acceptance remains pending. Filter/group/date behavior and revision-refresh/draft recovery have executable automated coverage alongside the existing R7A database tests.

## Manual acceptance

1. Open Tasks & Milestones and switch between Tasks and Milestones. Choose 1, 2 and 3 columns, then check narrow and desktop widths in light and dark themes. Expand/collapse a long milestone; confirm completed milestones sort last.
2. Combine phase, responsible side, assignee, status and deadline filters. Check shared phases, no assignees, unsaved new tasks, overdue work, unscheduled dates and an inclusive custom range. Clear filters to recover all work. Confirm milestone progress still counts its entire task set.
3. Group Tasks by milestone, status and responsible side. Confirm each top-level task appears once, subtasks are counted separately and unassigned tasks remain discoverable.
4. Open a task, edit fields/notes and switch filters, grouping, selected task and card layout. Open Advanced, then Back. Confirm edits remain. Add a task or milestone and verify its detailed controls open. Test existing task/milestone links from Overview, Phases, Calendar and Activity.
5. Save task/milestone edits and reload. Verify the saved result in Overview, Phases, Calendar and Activity. Change assignments, start date, priority, authored notes or files with a clean work plan; confirm saved feedback and dependent displays. Verify comments, file preview, author-only note edits and dependency links still work.
6. Attempt milestone completion with unfinished tasks/subtasks or unresolved dependencies. Expect named validation blockers with navigation to the affected task, no false revision conflict and no lost draft. Complete eligible work and save once.
7. Use two staff sessions to edit the same field, then save the stale draft. Confirm an explicit conflict choice. Check nonconflicting reconciliation, private draft restore/discard and a failed/lost save response. An in-memory edit newer than its autosave must survive a server revision refresh.
8. Leave an authored note or subtask input unsaved and navigate away. Confirm the guard allows staying; return and save or cancel the input. Test the project in its completed/read-only state and verify controls remain disabled.

Stop after this slice for user acceptance. The next pending revised roadmap work is Brief placement and project-name editing.
