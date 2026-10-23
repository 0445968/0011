# Projects redesign — D1c Tasks & Milestones

Baseline: `0445968/0011`, `bivi-dashboard-overhaul` at `86da7037090979e1d5ac51cafb0f8c1756ac85f8` (D1a/D1b already committed). Apply this increment on that development branch. It changes `components/admin/ProjectWorkspace.tsx` and this document only.

## Layout

The task editor is now the main column; project details and milestone cards occupy a side column at wide desktop widths. Narrower screens stack the panels. The task table retains its own horizontal scroll area rather than widening the page.

Task title, status and deadline remain editable in the main row. Owner/milestone context is visible under the title; its editing controls move into the existing expanded details row beside task notes/blocker details and removal. The original source array index is retained through filtering/pagination. Task and milestone DOM IDs and selected-item focus/pagination are unchanged.

Milestone cards retain title, status, due date, linked-task count, removal constraints and pagination. Status selections use the pilot semantic palette with text labels. The work summary reflects the current draft: task completion, open/blocked tasks and completed milestones. Empty task progress is unknown rather than a fabricated percentage. Unsaved progress is labeled as draft.

## Protected behavior

All field/edit/add/remove/command function bodies, activation UI, project decision controls, activation snapshots, audit-history rendering and sticky save bar are unchanged. This includes validation, maximum task/milestone counts, linked-milestone removal protection, dirty navigation handling, saved project revisions, confirmations, uncertain/conflict lockout, completed-project read-only mode and server APIs/RLS.

Verified staff assignment remains in Lifecycle; owner labels here are the existing display text. No schema changes, new task-management fields, subtasks, blueprint application or external integration are introduced in this visual slice. The editor's pre-existing UTC overdue display rule remains explicit; the later shared timezone work is still pending.

## Validation and review

- TypeScript and targeted Next lint passed.
- Existing platform suite: 61 passed, zero failures.
- Compared original/current source blocks: all edit/add/remove/command handlers, activation view, decisions, snapshots, history and save bar are unchanged.
- Isolated fixture browser: edit a filtered task's title/owner/milestone/notes, verify the original task array index and expected revision in the request, then simulate a 409 and confirm lockout.
- Unsaved navigation with Stay, task/milestone selected-item pagination/focus, task add/discard, milestone add, completed read-only state, empty plan and activation gate checks passed with no uncaught page errors.
- Desktop, 390px mobile and dark/light fixture screenshots inspected; no horizontal page overflow. The wide task table scrolls within its container.

Review with authenticated project data, including notes, long names, many tasks/milestones, existing source links, saved drafts and actual permission boundaries. This is local/fixture validation, not live Supabase/Storage or multi-account release acceptance.

Next visual slice: Lifecycle, followed by Brief and Delivery. Broader roadmap and full live acceptance remain pending.

Final production build passed. Existing public-site Tailwind and help-page CSR warnings remain.
