# R4a — Verified project roster and phase-aware previews

Based on `bivi-dashboard-overhaul` commit `3ee11854b555d87f2685b2fba35584ca98e75345`.

## Delivered
- Project Overview header: status on right with an avatar stack; resource links remain in Project areas until the shared project menu-bar migration.
- Project tab secondary text uses actual project title rather than a service type.
- RLS-backed roster: staff are shown only when currently assigned in `project_task_controls` and active in `inquiry_staff`; client accounts require active `project_clients` access. Public staff IDs and entered client profile names identify members. No invented owner identity or unverified organization members.
- Milestone carousel: shows milestones in current selected phase plus phases with task activity, one card per milestone even if linked to multiple phases. All assigned phase labels appear, and completed milestones sort right. Only verified Bivi staff assigned to tasks are shown as milestone assignee avatars.
- Uses current phase-link records and profile image endpoint. New staff-only, read-only roster RPC requires migration 033; no write API changes.

## Not delivered yet
- Client task assignees, project manager defaults, verified project owner ordering, multi-assignee selection, client requests/decline flow and advanced permission changes (R4b).
- Status state machine (`waiting on client`, `inactive`), project menu reorganization and unified activity audit/feed (later slices).

## Acceptance checks
- Check empty and multiple active phases, a multi-phase milestone, completed milestones, no phase links, avatar fallbacks, private photo access, project without members, status placement, tab title and keyboard/trackpad scrolling.
- Run typecheck, platform tests and build. Confirm that auth/RLS blocks unrelated staff/client profile reads and all existing project routes still work.
