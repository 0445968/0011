# R7G Projects visual blueprint

## Scope

This is the staff admin Projects visual foundation. It reuses the application's existing shell, typography, semantic theme tokens and phase-color utilities. Components live under `components/admin/projects` so later admin pages can adopt them without changing public pages or client portal presentation.

## Shared components

- `ProjectPageHeader`: compact eyebrow, title, optional description and action area. Use one page title and place navigation/context actions beside it.
- `ProjectPanel`: consistent semantic card with a compact title/description/action header and a content area.
- `ProjectMetric`: small tabular summary metric; only use where the value is authoritative and available.
- `ProjectFeedback`: contextual status, saving or error message near the action it describes.
- `projectControlClass`: baseline size, border, hover and visible focus treatment for staff project controls.
- `CalendarMonthGrid`: Monday-first month grid with semantic rows/cells, linked events, overflow disclosure and a mobile event disclosure.

## Layout rules

- Keep Projects content in one main page scroll where possible. Prefer compact toolbars and progressive disclosure over tall, always-expanded lists.
- Work-plan cards use the selected 1/2/3 column layout, `min-w-0`, naturally wrapping titles and a second flex-wrapping controls row. Never force title/status/deadline/assignees into one unbreakable line.
- Work-plan filter controls stay available in an on-demand Advanced filters disclosure. Applied filters remain visible and can be cleared together.
- Keep task details collapsed until requested. Preserve all existing actions and the shared draft/save controller.
- Overview uses one compact identity/metric row, the existing formal phase bars, one horizontal milestone preview, a bounded recent activity preview and an actionable bounded task preview. Do not add permanent phase labels or a second saved-status block.
- Phases use compact rows and collapsible breakdowns. Keep each active phase's saved deadline visible, including parallel active phases.
- Calendar month views show a weekday grid with previous/next/Today navigation. Busy cells disclose extra events, and narrow screens disclose the day's events without shrinking desktop event text.
- Staff Projects may use compact file panels. Client portal file spacing and typography remain on their existing branch of the conditional styles.
- Use theme tokens (`border-border`, `bg-card`, `bg-muted`, `text-muted-foreground`, etc.) and `focus-visible` rings; do not hard-code light-only surfaces.
- Draft feedback describes that editor's draft only. A private autosave is not canonical project save confirmation.

## R7G implementation status

- Implemented: shared visual primitives; tighter Overview, directory, work plan, Phases, Brief, Activity, Requests/review and file/discussion/access/publishing surfaces; editable project name and verified owner on Brief; real month grid in project and workspace Calendars; preserved agenda view and existing work-plan editor/controller.
- No database changes were required.
- Pending visual acceptance: rendered comparisons at 390, 768, 1280 and 1440 pixels in light/dark themes; populated/empty data variants; long titles, many assignees, expanded subtasks and busy dates; keyboard/focus and contrast review. This environment has no browser automation/runtime tool, so screenshots and rendered-page claims are unavailable here.
- Pending technical acceptance: authenticated live save, permission and cross-session checks remain those documented in R7A–R7E. R7F has no implementation notes/commit in this branch and remains unverified.

## Manual review checklist

1. At 390/768/1280/1440px, inspect directory, Overview, Tasks & Milestones at 1/2/3 columns, Phases, Brief, Calendar, Requests, Activity, Files, Discussion, Access, Delivery and Publishing.
2. Repeat in light/dark themes. Verify focus visibility, no clipped/stuck controls, adequate title width, and no content behind sticky controls.
3. Try long milestone/task titles, many assignees, blocked and completed work, unassigned items, expanded task/subtask details and empty projects.
4. Check both calendars' month navigation, Today, event details and busy-day overflow; confirm agenda view and task/milestone links remain usable.
5. On Brief, change project name through the shared draft/save path and verify the verified organization owner control and activation/proposal snapshot.
6. Change work-plan filters, clear them, open Advanced, return to tasks, and confirm current draft and selected view survive.
7. Verify owner/status, files, request review and delivery actions remain permission-gated and their save/error feedback is local to the action.
