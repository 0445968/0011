# R4c — parallel phase states and synchronized milestone activity

Apply R4b first. Run migration `202610160035_parallel_phase_states.sql` after 034.

- Phase states are `Planning`, `Active`, `Completed` and are separately saved, staff-only and audited. Multiple phases may be active simultaneously.
- Legacy `project_lifecycle.phase` remains for existing gates; a prior visit is marked as historically active, **not assumed completed**.
- Phase controls in the Phases view open an app confirmation dialog. Completion requires at least one assigned milestone and all linked milestones manually completed, with no active task in that phase or linked milestone.
- Every server-side update of project task JSON derives noncompleted milestone statuses: in-progress/blocked task => in progress; otherwise planning. Completed milestones require manual approval and remain completed. Staff review is required to reopen a completed milestone with task changes.
- Started tasks activate their canonical task-control phase automatically, without activating every phase of a multi-phase milestone.
- Overview uses explicit Active phases, plus completed milestones from historically active phases. Completed cards sort last. No fake phase approvals or historic activity are generated.
- Ordinary tasks/milestones keep the private R2 draft and Save All. Phase changes are independent immediately-saved operations guarded by revision checks; they do not reload the page.

## Required live verification

1. Run migration and open a project with existing task controls.
2. Mark Discovery and Production Active; both remain active. Verify the Overview shows milestones assigned to either phase.
3. Start a task: its incomplete milestone becomes In progress after Save All and its task-control phase becomes Active. Reset the task: the milestone returns to Planning while phase remains Active.
4. Complete all tasks, then explicitly mark the milestone Completed, then close its phase through the phase dialog.
5. Confirm historic approved milestones stay visible, muted and rightmost. Shared milestones appear once in Overview, once under each linked phase.
6. Try to complete a phase with active tasks or unfinished milestones; verify a rejected command and no status change.
7. In two staff sessions, change the same phase: the stale revision should receive a 409 and require refresh.
8. Verify client sessions cannot call the staff phase API or directly write phase tables. Confirm the legacy client portal still functions.

**Known work for follow-up:** unify the new phase actions into the project activity feed; replace generic save history with field-level events; support explicit phase reopen and milestone reopened-task review dialogs everywhere; migrate older lifecycle approvals only after validation. No change is made to the client portal UI in this patch.
