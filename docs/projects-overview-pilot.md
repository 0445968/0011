# Projects redesign — D1b Overview

Baseline: `0445968/0011` / `bivi-dashboard-overhaul` after directory pilot commit `01ba9e538b80229989ab4a4428544f9a25650fcb`. The D1a directory patch is required and already committed on this branch; this Overview patch does not repeat it.

## Scope

Project detail Overview only: company identity/logo with project title, project status, resource links, compact work metrics, linked open tasks and milestones, phase/task evidence, record metadata, notes and a recent history timeline. The existing inner-page pilot palette is reused without global styling or shell changes.

All task/milestone links use the existing URL helpers, preserving arbitrary IDs and editor focus. No mutation controls are added. Existing Tasks & Milestones, Lifecycle, Brief and Delivery editor blocks, activation gate, revision keys, approval focus, unknown-item notices and workflow handlers are preserved exactly. Existing tabs and workspace metadata remain unchanged. The Source inquiry link targets the existing `/leads/[id]` detail route.

Only Overview requests company/phase context and the authenticated user's timezone preference. It uses the same notification-preference timezone source as Calendar, with the existing America/Chicago fallback. No second preference store is introduced. Query errors surface instead of producing fabricated evidence.

## Display semantics

- Open tasks exclude done tasks; sort by due date, with undated tasks last. Show up to six with an explicit count and link to the full plan.
- Past-due open tasks have a date before today in the staff member's saved timezone. Today is not overdue. Date-only deadlines remain unchanged and are never converted through UTC.
- Earliest open deadline is a date-based summary, not an invented priority or automatic next workflow step.
- Milestones display incomplete items first, then date. Show up to five and link to the authoritative editor. Source ordering is not mutated.
- Phase activity/task progress retain the D1a evidence rules. Completing tasks does not imply phase approval or delivery readiness.
- Company identity comes from the existing company relationship. Missing company/logo uses a project title/initials fallback.
- History is the existing project audit history, not a fabricated combined communications feed. The five latest supplied project events are shown, with reasons when recorded.
- Owner is the existing project owner label, not an inferred verified assignment. Proposal version is the project's original accepted version.

## Review

Check a project with real data in Overview, including long names, missing images, empty tasks/milestones/notes/history, blocked and overdue tasks, multiple phase groups, held/completed states and dates around local midnight. Follow task/milestone links and confirm the intended editor item opens. Review both themes and narrow widths. Confirm all existing editors and saved drafts behave as before.

This is an incremental D1 slice, not completion of the entire project-detail redesign. Tasks & Milestones, Lifecycle, Brief, Delivery, related file/discussion/publishing/access pages and shell-wide company identity remain pending visual work. Live authenticated multi-account and Storage acceptance remain pending.

## Validation

- TypeScript and targeted Next lint passed.
- Platform suite: 61 passed, zero failures (including D1a and the three new Overview deadline/order tests).
- Activation gate and existing editor render blocks compared byte-for-byte against the branch baseline: unchanged.
- Fixture browser checks: encoded task deep links, keyboard phase-details disclosure, empty states and 390px viewport checks passed with zero uncaught page errors.
- Desktop/mobile/light/dark screenshots reviewed. A narrow mobile heading was corrected by stacking the header; notes/history now use the side column, with keyboard-focusable scrolling for long content.
- These are fixture/local checks. Signed-in live data, real image storage, shell integration and multi-account acceptance still require review.
- Final production build passed after the responsive corrections; existing public-site Tailwind/CSR warnings remain.
