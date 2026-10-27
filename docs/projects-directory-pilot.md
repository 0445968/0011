# Projects redesign — D1a directory pilot

Baseline: `0445968/0011`, `bivi-sidebar-phase0`, `6e3e5709748e1c64d4c3b58a9b9277a3b3977fd8`.
This is the first reviewable slice of the October 15 dashboard overhaul plan, not completion of D0/D1 or the full roadmap.
The separate Phase 5 readiness patch is not included or overwritten.

## Scope and proposed visual rules

Projects directory only: existing table plus cards and status-grouped view; company logos/names with the project title as secondary identity; compact page summary; task progress and phase activity. Company images use the existing authenticated image endpoint and initials fallback. Table columns, saved views, inline previews, filters, sorting, pagination and record URLs remain available. The layout is validated in the server page from `?view=cards|grouped` and saved views; legacy saved views default to Table. Column preferences remain intact; existing preferences can enable the new Phase activity column through Columns.

Proposed pilot palette: blue = in progress, amber = on hold, emerald = completed; unknown is dashed neutral. Text/icons accompany colors. These tokens are scoped to the pilot, with explicit light/dark variants. Cards use rounded-xl, 12–16px padding, 12px body/control labels and 11px metadata. Long company/project names wrap; controls retain focus indicators. Mobile cards stack and the table scrolls within its own container. No global styling or shell component changes.

The displayed project label “In progress” maps to the existing `active` value. No stored status is renamed. No migrations, writes, workflow actions or permission changes.

## Evidence rules

Task progress = round(completed task count / total task count × 100). With zero tasks it is unknown, not 0%. This does not represent scope weighting, effort, approval readiness or lifecycle completion.

The phase strip is explicitly task activity, separate from the selected lifecycle phase:
- no mapped current tasks: unknown;
- all mapped tasks todo: not started;
- any doing/blocked task or partial task completion: in progress;
- all mapped tasks done: tasks completed.

Deleted task controls cannot contribute. Unmapped tasks still count toward total task progress and are disclosed separately. Several task groups can be in progress. Finishing Discovery tasks does not activate Direction or certify Discovery approval. The current schema has no independent per-phase completion state; an authoritative phase-completion model remains a later decision.

All enrichment uses the authenticated staff client and existing RLS. It only loads IDs on the server-filtered page, with explicit task-control pagination to avoid silently truncating large pages. Query errors surface instead of fabricating empty data.

Counts in cards/groups and summary labels explicitly distinguish current-page counts from the total matching-project count. Grouped view has no drag-and-drop status changes.

## Baseline protections

Unchanged: `requireStaff`, `listProjects` filters/sorts/count/pagination, all project APIs and migrations, selected project routes, shell/tab/bookmark code, project editor, lifecycle approval/revision/client-access controls, private file links and authenticated company-image handler.

## Review checklist

- Table/Cards/Grouped switch with search/filter/sort/page retained; browser Back restores mode.
- Save a Cards view, switch layouts, reload the saved view; legacy views and column preferences still load.
- Preview tasks/milestones/notes; open workspace, files, discussion, publishing and access links.
- Same-company projects distinguish themselves by project title. Check logos, missing logos and long names.
- Check no tasks, unmapped tasks, multiple active phase groups, blocked tasks, completed tasks without next-phase work and held/completed project states.
- Review light/dark, mobile, keyboard, long labels and empty results with actual signed-in data.

Pending: user visual approval; authenticated before/after comparison with real data; multi-account/live Storage checks; project-detail redesign; company identity elsewhere in shell; D2–D8. Broader rollout waits for pilot review per the supplied plan.

## Validation of this patch

- `npm run typecheck`: passed.
- Targeted Next lint for the six implementation files: passed with no warnings.
- `npm run build`: exited successfully; existing Tailwind ambiguity and public help-page CSR warnings remain.
- `node --test --test-concurrency=2 tests/platform/*.test.mjs`: 54 passed, zero failures.
- Temporary fixture-only browser harness: Table/Cards/Grouped switching, saved layout restoration, reload persistence, expandable source actions, empty results, and mobile overflow checks passed with zero uncaught page errors.
- Desktop/mobile/light/dark screenshots inspected with long labels, no task data and failed-image fallback. This was isolated fixture data, not a signed-in live Supabase or shell acceptance test. The temporary harness is excluded from the patch.
