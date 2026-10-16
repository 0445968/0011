# Bivi Projects — revised R3b layout (D1 Milestone board)

Base: `bivi-dashboard-overhaul` at `936c3ab5759d26569fb80579b8e315fc3e69e564` (R3b already applied). This incremental patch **does not reapply R3b**.

## Project Overview
- A horizontally scrollable row of compact read-only milestone previews replaces the old plain milestones list.
- Milestone previews show only authoritative fields: name, due date, status, task count, completed count, and task-derived progress. Completion mutes the card.
- There is no reliable per-milestone message, file, member or priority count in the current Overview data. These are deliberately not fabricated; they follow with R4/R5 and the cross-project activity work.
- Each card deep-links into the existing Tasks & Milestones editor at the selected milestone. All other Overview panels remain.

## Tasks & Milestones
- **Milestones view:** one full-width, collapsible milestone card per row. Large click-to-edit title with a separate Pencil button. Muted completed cards. Task rows nested underneath. Icon-only add/reset/complete actions with explanatory accessible labels.
- **Tasks view:** a single list of all tasks with milestone reassignment via a compact selector popover, including unassigned work.
- **Phases view:** each phase shows assigned milestones and a checkbox popover for assigning one milestone to multiple phases. These assignments save through the existing R3a sidecar API after Save All.
- Status icon or text badge cycles status. No native select input is used in the primary board for statuses. Task titles are borderless until Edit is pressed; completed task titles are struck through. Due date controls are borderless, and a date-only Central-time days-remaining label is shown with red overdue text.
- Subtask edits continue to use revision-controlled R3a sidecar writes, including subtask title, status, due date and deletion. Existing protections still apply.
- Confirmations for bulk updates, milestone completion and subtask deletion now use the app's Radix Dialog, not browser `confirm()`.
- The collapsible **Advanced work-plan editor is unchanged**. It retains legacy fields, action validations and project-decision flows until R4's member/assignee controls are implemented.

## State and security boundaries
- Task/milestone field edits remain in the R2 private draft and require Save All. Hierarchy phase-link and subtask edits remain separate, immediate and revision checked; the UI blocks sidecar writes while there are uncommitted work-plan edits.
- This patch adds no database migration or backend permission change. A completed milestone is not formal phase approval or project handoff readiness.
- Staff/Client responsible-side icons, verified assignees, client project-manager defaults, client request/decline workflows, file/message counters and activity/meeting links are later slices requiring account-scoped source data and permissions.

## Acceptance
- Confirm Overview preview scrolling and milestone deep links at mobile widths.
- Check all three work-plan views with empty, long, completed, and multi-phase milestones. Edit tasks and subtasks, then verify saves and navigation guards.
- Check dark mode, keyboard access to status buttons, phase checkboxes, Collapse, and dialogs.
- Run `npm run typecheck`, `npm run verify:platform`, `npm run build` before committing. Test with a real account and Supabase R3a migration.
