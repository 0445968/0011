# Tasks editor and scheduling follow-up — October 29, 2026

Implemented from the merged draft-save and dismissible-reminder baseline on `restore`.

- Dismissing either reminder option pulses the Draft changes button for four seconds. Reduced motion uses a temporary yellow outline.
- Closing the full editor clears its selected task and row highlight. Reopening shows the five most recent task IDs for this staff member/project/browser; Show more expands to ten. Reopening a recent task moves it to the front. Removed tasks are excluded.
- Columns includes a persisted Show column labels toggle. Category selection lives beside the group title, selects only filtered tasks in that group, and appears on hover/focus or while selected. Global selection remains in Quick actions.
- The first move out of Backlog seeds a missing start date. Start dates can be manually edited, including while other draft fields are dirty. Later status changes preserve a set start date.
- Start and due dates support optional minute-level times and a named time zone, defaulting to America/Chicago. Date-only tasks remain valid. Dates and times use the private draft, Save task and Save all flows. Impossible daylight-saving clock times are rejected; repeated clock times use the later occurrence in the calendar projection.
- Milestone folders use the linked phase color, with a neutral fallback. Both the table column and Milestones board use the same source.

## Data and compatibility

Optional `startOn`, `startTime`, `dueTime` and `timeZone` fields are stored in the revisioned task JSON. Private-draft validators accept them, and three-way merge handles optional fields introduced after the baseline. Published validation checks real dates, clock times, named zones and chronological order.

The migration keeps the existing staff-only schedule table as a projection for older readers. A deferred trigger writes starts after new task controls exist. The existing Calendar start-date RPC now updates the canonical work plan with the same project/schedule revision checks. Calendar events use the existing instant fields; My Tasks receives optional times. Existing authorization, completion, review and operational-state checks still run through the canonical save RPC.

## Acceptance

Platform tests cover private backup, isolated task saves, new-field rebases, invalid times, daylight-saving conversion, atomic schedule projection, new task foreign keys and stale writes. Existing Calendar and My Tasks tests now expect start edits to advance the project revision.

Browser acceptance covers group-only selection, hidden headings, editor close/reopen, recent tasks, optional times, dismissal pulse and narrow-screen layout. Authenticated production acceptance remains the final user check.


## Cross-page deadline consistency

Timed task deadlines now share exact instants across Tasks, Overview, Lifecycle, project calendar and workspace calendar. Displays and day filters use the staff timezone; date-only deadlines remain floating calendar dates. Overdue counts use the actual deadline time and exclude completed tasks and start-date markers. Sorting uses day and time, with date-only deadlines at the end of the day.

Assigned-task projections preserve staff authorization, task identity and assignee counts. Private task drafts remain excluded from saved summaries until explicitly saved. Task settings links open the canonical full editor.

Small requests are bundled into the next substantive patch unless explicitly requested as a separate release; this policy is recorded in AGENTS.md.
