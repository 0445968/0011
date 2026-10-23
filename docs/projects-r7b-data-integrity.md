# R7B — Projects integrity, completion and statistics

Implementation complete; authenticated UI acceptance pending. Development branch: `bivi-dashboard-overhaul`. Production `restore` was not modified or deployed. No applicable `AGENTS.md` was found in the repository or ancestor directories. The working tree started clean at `cba1d51`, matching fetched GitHub state.

## Rules and confirmed fixes

- Preserve all task/milestone IDs and many-to-many milestone phase links. A task's effective phases are its direct control phase **union** its milestone phase links. A direct phase outside those links adds scope; it is not overwritten. Starting work still activates only the established direct phase, preserving independent staff phase decisions.
- Filtering, directory/Overview task evidence, Project Calendar indicators, My Tasks phase filters, client availability and database completion checks use effective membership. Client-created tasks retain their explicitly chosen active direct phase and no invented milestone.
- All linked tasks are required: the existing schema has no optional-task flag. Unfinished subtasks block task Done, required tasks/subtasks block explicit milestone completion, and every applicable task/milestone plus dependency, blocker and review blocks phase closure. QA/Delivery/Handoff use existing delivery approvals, required QA and change-request gates; Handoff also uses existing closeout readiness. Missing controls fail closed.
- Completion inspects the submitted JSON candidate, allowing existing tasks and their milestone to finish in one transaction. New tasks must first be saved to establish ownership/control records before completion. A rejected save rolls back body, revision and audit writes; it does not become a revision conflict. Existing R7A draft generation fencing, reconciliation and conflict choices remain.
- Completed milestones/phases must be reopened before their work is reopened. A dependency cannot be reopened while its dependent remains Done; both can be reopened in one candidate. Subtasks cannot be added/reopened unfinished under a Done parent. Parent removal cannot silently prune child evidence. New orphan controls/subtasks/phase links are rejected.
- Client Done requires current Bivi review. Reopening adds a meaningful audit event and requires an approval newer than that event; old approvals remain in history. The dedicated brief task retains its existing latest-approved-brief review source. Completing one phase does not complete another phase or the project.
- Shared distinct-ID task metrics replace separate percentage/count formulas. Open = Total − Done; blocked task status is a subset of Open. The My Tasks “Blocked or waiting” filter additionally includes dependencies/explicit blocker ownership, as labeled. Subtasks remain separate. Empty task progress is unknown, not 0%. Publication progress remains a separately labeled editorial estimate under the established numeric publication schema; empty plans cannot populate it via “Use saved” progress.
- Saved dashboards receive saved bodies; work-plan draft counts are accompanied by the existing private-draft warning. Filter match counts and page totals describe their own subsets; milestone/project denominators use the complete body. Calendar counts are events (a task start and due date are different events), not task totals. Unavailable reads throw visible load errors rather than returning invented zeros.
- Advanced work-plan, compact board, Overview, Phases, Calendar and My Tasks now use the saved staff timezone for date-only comparisons. Done deadlines no longer receive an overdue label on work-plan cards. Manual priority is explicitly labeled separately from calculated suggestions.
- Calendar's “My calendar” previously omitted secondary assignees. The view now exposes one membership array per event; filtering includes all verified members without event fanout. Established membership validation and deactivation cleanup remain authoritative. The view retains `security_invoker=true` and existing grants.
- Necessary UI fixes only: milestone titles keep a usable row width in three-column mode, validation feedback is actionable, and Phases shows association/legacy completion diagnostics. No card/theme redesign or pending page relocation was included.

## Database and files

Intended project verified: Bivi `0011`, ref `xxnvekmbotzcyuhsyxbw`, organization `yxgtzrjcrqonisdemyyi`, PostgreSQL 17.11, active/healthy.

Applied in dependency order, with Supabase MCP ledger versions:

| Repository migration | Applied name | Actual ledger version |
| --- | --- | --- |
| `20261023130000_r7b_project_integrity.sql` | `r7b_project_integrity` | `20261022165839` |
| `20261023140000_r7b_calendar_membership.sql` | `r7b_calendar_membership` | `20261022170140` |

Both files were generated with `supabase migration new` and then ordered after the existing future-dated color migration. MCP records application timestamps independently of repository filenames. The existing color migration remains recorded as `20261021202346`; earlier R7A objects were verified directly and were not reapplied. No unrelated migration was applied. No records, IDs, approvals, RLS policies or existing audit entries were reset, reassigned or backfilled.

Main changed areas:

- `lib/projects/metrics.ts`, `integrity.ts`, `schema.ts`, `workplan-views.ts`, `overview-summary.ts`, `directory-progress.ts`, `directory-context.ts`, `workplan-filters.ts`: shared metrics, membership, diagnostics and read projections.
- `lib/projects/lifecycle-schema.ts`, `activity-data.ts`, `workplan-save-errors.ts`, `lib/tasks/data.ts`, `lib/calendar/data.ts`: client effective phases, meaningful reopen events, validation classification, timezone and membership filtering.
- Project detail loader; `ProjectWorkspace`, `ProjectMilestoneBoardV2`, `ProjectPhaseCards`, `ProjectPhasesPage`, `ProjectCalendar`, `TaskProductivity`, `ClientProjectTasks`, `ClientPublisher`, main dashboard: necessary display/date/empty-state wiring.
- Project phase, hierarchy, productivity, response and client-task API routes: validation responses remain distinct from conflicts/server failures.
- `tests/platform/project-r7b-integrity.test.mjs`, `load-project-ts.mjs`: focused PostgreSQL/metric tests. Existing Calendar, directory, Overview, work-plan, draft and priority tests now load shared dependencies; Calendar fixtures include the required client review evidence.

## Verification and limits

- `npm run typecheck`, `npm run verify:platform` (130 tests) and `npm run build` passed. Existing build warnings concern ambiguous Tailwind demo classes, stale Browserslist data and `/help/search` rendering. Build is not a deployment.
- New behavior tests exercise the complete R7B migration, nested completion, candidate validation, atomic rejection and unchanged revision/history, genuine conflicts, shared/parallel phases, missing/orphan controls, client review and renewed approval, permission grants, two assignees without fanout, filter membership, empty progress and timezone boundaries. Existing suites continue exercising R7A draft recovery, generation tombstones, same-field conflict choices, phase persistence, colors, aliases and dependent views.
- Hosted checks confirmed all five guards, private helper restrictions, the staff-guarded diagnostic RPC, effective-phase and Calendar membership columns, `security_invoker=true`, and denied anonymous Calendar access. A transaction-local staff read context returned 18 distinct Calendar events and 3 distinct My Tasks identities for the selected staff context; neither read was a project-wide task total. No project write was performed for those read checks.
- Security advisor baseline: seven RLS-without-policy notices, nine anonymous SECURITY DEFINER notices, 84 authenticated SECURITY DEFINER notices and the password-protection notice. R7B adds one expected authenticated-callable **staff-guarded** diagnostics RPC (85 total); private helpers are not executable by authenticated/anonymous roles. Existing unrelated notices remain outside this slice. [Advisor explanations](https://supabase.com/docs/guides/database/database-linter).
- Authenticated browser, second-browser concurrency, real staff/client transitions, touch/keyboard phase access, light/dark and narrow-layout acceptance remain manual. Automated/source checks do not establish live UI acceptance for R7A, dedicated Phases, Tasks & Milestones or R7B.

## Existing data requiring explicit review

Read-only audit found zero missing controls, orphan controls, orphan subtasks or orphan milestone links; seven tasks add a direct phase outside milestone links. These associations are preserved and disclosed in Phases.

Project `EZV7M3E` has one existing completed client “New task” without an accepted completion review. Task link:

`/projects/8f943efa-31a2-4435-81f3-640c98233904?tab=plan&task=69b9c1e0-c636-48ad-a9f0-ca0beff82f68`

Phases shows the missing review. This record was not silently approved or rewritten. Reopen any affected completed phases, then reopen its milestone/task together as necessary; have an authorized client submit completion and Bivi accept it. R7B correctly rejects saves that retain unreviewed client Done. This is outstanding data acceptance work, not a fabricated successful migration backfill.

## Exact manual acceptance

1. Use a development test project. In Phases activate two phases and link one milestone to both. Reload: both remain Active. Change its colors and check saved colors on Overview, Calendar and milestone cards. Focus/tap/hover Overview bars: name and formal status remain accessible.
2. Create and save a task with an unfinished subtask. Mark its parent Done and save: expect validation rejection, unchanged saved task/revision, retained draft, and no false success/conflict. Finish the subtask; finish the task and explicitly review its milestone in the same save: expect success once.
3. Leave an unmilestoned task or linked milestone unfinished; try completing the applicable phase: expect rejection. Finish all applicable work and required reviews; complete only the first phase. Reload: the other phase stays Active and the project stays Active.
4. Attempt to reopen a task beneath a completed milestone/phase or add an unfinished subtask beneath Done: expect a clear rejection. Reopen the phases first, then milestone and task in one candidate; expect success. Reopen a prerequisite while its dependent remains Done: reject; reopen both together: allow.
5. As an authorized client, submit task completion. Verify it stays unfinished until Bivi accepts the response. Reopen it; the previous approval must not permit another direct Done. Submit a fresh completion review and accept it. Check the preserved review/reopen events in Activity.
6. Assign two Bivi staff to one task with start/due dates and a shared milestone. Each staff account should see the task once in My Tasks and the relevant events once in “My calendar.” Filter by either direct or milestone-linked phase. Verify task/project totals are not multiplied.
7. Compare saved task totals/progress on Overview, directory and dashboard. Change Tasks & Milestones filters, grouping, columns and advanced-editor pages; complete denominators stay stable. Make unsaved edits: draft warning appears and saved dashboards stay unchanged. Empty projects show no calculated percentage; completed old deadlines are not overdue.
8. Save a non-Chicago timezone in notification preferences. Check deadlines around local midnight in Overview, compact/advanced work plan, Calendar and My Tasks. Completed/undated tasks remain excluded from overdue totals.
9. Use two sessions. Keep a task title draft in session A; save another field in B. Save A: reconcile to current revision without losing unrelated edits. Edit the same field in both: expose conflict choices. Trigger a validation rejection, fix it, retry, and reload the stored private draft; no repeated revision/draft loop.
10. Open old `?tab=lifecycle` and `?tab=calendar&view=phases` links; expect Phases and reachable lifecycle/dependency/approval actions. General `?tab=calendar` still opens Calendar. Test three-column milestone titles, narrow width, light/dark, keyboard and mobile phase access.

## Remaining scope

Technical implementation delivered; live UI acceptance and explicit repair/review of the legacy client task remain pending. Further confirmed acceptance defects should be repaired before starting another slice. No new roadmap slice was started.

Deferred end-of-R7 frontend pass: card density, spacing, hierarchy presentation, interaction/theme polish and broader layout refinement. Preserve all previously agreed pending work: Brief ownership/activation snapshot and editable project name, dedicated Requests section, Activity preview/history relocations, Admin Settings technical history, proper navigable Calendar month grid, and the remaining R7/R8 requirements. None is marked delivered here.
