# R7D — Project Overview functionality and data connections

Technical implementation delivered on `bivi-dashboard-overhaul`; authenticated UI acceptance pending. `restore` was not modified, merged or deployed. Stop here for user testing before R7E.

## Foundation and environment

- Started with a clean working tree at `c3b871d`, matching fetched `origin/bivi-dashboard-overhaul`. No applicable `AGENTS.md` exists in the repository or ancestor directories. Read the current blueprint and R7B/R7C notes and inspected their actual editing/metric/phase implementations.
- Verified Bivi Supabase project `0011`, ref `xxnvekmbotzcyuhsyxbw`, organization `yxgtzrjcrqonisdemyyi`, active/healthy, PostgreSQL 17.11. Actual ledger remains `project_phase_colors` (`20261021202346`), `r7b_project_integrity` (`20261022165839`), `r7b_calendar_membership` (`20261022170140`). All five R7B integrity triggers and the three fenced draft RPCs are present. Read-only policy inspection confirmed staff-only notes/comments/file links and existing file visibility rules.
- R7B's database behavior and R7C's editing/recovery behavior remain covered by the full platform suite. Their implementation does not imply authenticated live acceptance. The previously documented legacy completed client task without renewed review remains an explicit acceptance/data-review item; this slice does not approve or rewrite it.
- **No migration required.** No schema, project record, approval, RLS policy or audit record was modified. Two attempts to read full hosted function definitions returned connector errors; the smaller identity/ledger/trigger/RPC/policy checks succeeded. No hosted mutation test was performed.

## Authoritative Overview projection

The detail loader composes the saved `ProjectRecord.body`, existing directory identity, formal phase RPC, persisted per-project colors, verified assignment workspace, task schedules/controls, productivity tables and the same audited Activity service used by Activity. There is no new task store, save endpoint or separately maintained total.

Saved totals use R7B's distinct-ID metrics; private draft edits continue through R7C's single `useProjectEditingController`. Compact/advanced views, explicit Save all/Save draft/Discard, generation-fenced recovery, completion/client-review gates, revision checks and immediate-command prerequisites remain. Confirmed commands use existing path revalidation/mutation notifications and `router.refresh()`, preserving mounted editor state.

## Milestones and task actions

- Default scope includes milestones linked to **any saved Active phase**, once per milestone. Legacy task activity does not override saved phase state. Completed milestones sort last with saved relative order preserved; an inactive/completed phase alone does not populate the active scope.
- **All milestones (including history)** and **No linked phase** scopes expose other work. A separate expandable **Work without a milestone** list exposes saved unmilestoned tasks, including completed tasks. Full Tasks & Milestones remains reachable.
- Cards retain saved milestone status, actual due date, all linked phase names/colors, distinct top-level Done/total and nullable completion percentage. Completed deadlines are not labeled overdue. Date-only comparisons use the saved staff timezone. No milestone start date is fabricated.
- Staff and client avatars both use canonical task assignee IDs from `staff_project_assignment_workspace`, intersected with the existing verified roster. Free-text owner labels never establish identity. Empty verified assignments are labeled honestly.
- Overview task actions still open the same R7C task detail component, exposing authorized assignments, nested subtasks, schedule, notes, file links, discussion and work-plan fields. Task deep links now open this complete detail panel rather than bypassing it in the advanced editor. Repeatedly opening the same task after closing its panel now sends a fresh focus request to that same editor; it does not create a second session. Milestone editing still opens the shared advanced editor; Back to tasks & milestones retains the same draft and baseline.
- A removed task/milestone deep link reports that the saved item no longer exists, leaving the work plan and private draft recovery available.

## Counter and priority contracts

Each counter expands its task breakdown. File/note rows link to the full task detail; discussion rows link directly to that task's paginated Discussion. Overview also offers the same in-page task editor action. These are content contexts, not decorative counts.

| Display | Included scope |
| --- | --- |
| Linked files | Distinct accessible `project_files.id` with state `ready`, joined to `project_task_file_links` for saved top-level tasks belonging to this milestone. A file shared by two tasks counts once at milestone level. Withdrawn, pending, inaccessible, cross-project and unrelated files are excluded. |
| Authored task notes | Distinct nonremoved `project_task_notes.id` for those tasks. Excludes private work-plan text, project notes and removed notes. |
| Task discussion comments | Distinct nonremoved `project_comments.id` for those tasks. Excludes project-wide discussion, other milestones and communications. |
| Task completion | Distinct saved top-level task IDs. Subtasks remain separate; empty progress is unknown rather than a fabricated 0%. |

Readers request IDs/relationships rather than note/comment bodies and apply authenticated RLS plus the project filter on **every page**. Exact-count pagination reads all pages, including a smaller server page cap. A failed/truncated/changing-count read returns unavailable, never a partial total or zero. Each source fails independently and offers Retry saved data; genuine successful empty sources show zero. Multiple reads are not a transaction snapshot: concurrent writes can require refresh, and detected count changes fail visibly. Existing bounded task-detail previews are explicitly labeled as previews (50 notes/comments, files from up to 200 ready files).

**Highest task suggestion** is the highest existing calculated suggestion among this milestone's unfinished, unblocked tasks with valid saved start/due intervals and no unresolved dependency. It uses the shared 50%/75% elapsed-time rule. Manual task priorities remain a separate count and per-task breakdown, including urgent overrides. Missing controls/read failures are unavailable; invalid/missing dates, Done, paused and overdue work do not receive fabricated suggestions.

There is no milestone-level manual-priority field or independent milestone start-date source. No such value is invented; cards explicitly show task-derived suggestions/overrides. The communication outbox is service-only and lacks a canonical staff-readable milestone communication projection. **Milestone communication counts remain pending**, with no invented zero or recipient/private-message exposure.

## Recent activity

Overview and Activity use `getProjectActivity` and `ProjectActivityList`: identical actor resolution/photos, links, saved staff timezone, source labels and deterministic newest-first ordering. Overview displays up to five available events and labels the bounded preview, never a total.

Domain activity excludes generic earlier-revision/no-field-change snapshots. Meaningful task/milestone creation, removal, status/title/deadline/relationship changes reconstructed from retained before/after snapshots remain; work-plan note changes now receive a meaningful event without copying their private bodies into the feed. Generic snapshots remain intact in the existing history reader/storage. Stable event IDs deduplicate repeated rows; different source records remain distinct evidence without guessing that they represent the same action. Broader cross-source correlation/event coverage is R7E work.

Existing source windows remain bounded (100 project snapshots, 65 per other audit source, up to 250 displayed domain events). Older changes without retained before/after evidence cannot be reconstructed; this is not a complete lifetime total. Source or actor failure shows an unavailable/retry state on Overview. Activity retains its workspace error/retry boundary. Neither exposes the staff feed to client routes.

## Delivered / Partial / Pending

**Delivered technical implementation:** saved Overview composition; strict active milestone scope with history/unassigned access; stable completed-last cards; all linked phase labels/colors; verified staff/client task assignments; real file/note/discussion counts and drill-downs; shared task suggestions/manual overrides; R7C task editing/detail deep links; missing-item notice; shared domain Activity preview, actors, ordering and refresh; distinct empty/unavailable states.

**Partial:** milestone priority is transparently task-derived because no milestone override/start source exists. Counters cover authoritative files, authored notes and discussion, while communications await a verified authorized source. R7D technical checks do not establish live UI acceptance or complete older R7B/R7C acceptance.

**Pending, preserved in blueprint:**

- R7E verified milestone communications/recipients, broader event sources/correlation, notifications, reminders/emails and upcoming meetings. No placeholder meetings were added.
- Brief relocation: verified organization owner is still operated from the compact task board; Activation snapshot and project title fields remain in the work-plan workspace. Move owner/activation and editable naming to Brief in their agreed slice.
- Dedicated Requests: client response review is still rendered in Tasks & Milestones; no Requests navigation entry exists yet.
- Admin Settings technical history: the workspace still displays preserved project revision/history details. The domain Activity/Overview feed is corrected, but full technical-history relocation is not delivered.
- Proper navigable Calendar month grid and all other agreed roadmap requirements.
- End-of-R7 frontend pass: spacing, card density/redesign, alignment, broad theme/interaction polish. This slice keeps the existing layout; verify focus/touch/light/dark/narrow usability manually.

## Validation

`npm run typecheck` and `npm run verify:platform` passed (**156 tests**, including 10 new R7D tests). `npm run build` passed. Existing build warnings concern Tailwind demo classes, Browserslist data and Help routes opting into client rendering; no deployment was performed. The initial sandbox build failed because Next.js could not open its local worker socket; it was rerun using approved build permissions.

New behavior tests execute real projection/server-reader code with controlled authorized query responses: parallel/shared milestones, completed-last ordering, accessible-ID deduplication, scoped staff/client assignments, exact pagination/server caps, partial/denied/changing reads, real zero versus unavailable, missing controls, manual/calculated priority separation, completed/blocked/undated/overdue/dependency cases, meaningful snapshot events, technical exclusion, event deduplication and actor/source failure. Wiring checks cover the shared saved metric, Activity renderer, existing controller and missing-item notice. The existing R7B database and R7C asynchronous editing suites also pass.

No browser automation tools are exposed in this session. Tests with query doubles do not prove hosted RLS behavior or authenticated browser acceptance. Real staff/client sessions, signed avatar/file visibility, two-session conflicts, narrow/light/dark layouts and live write/refresh behavior require the tests below.

## Exact manual tests

Use a development test project, staff sessions A/B and an authorized client; avoid the known legacy unreviewed task when testing unrelated saves.

1. In Phases save two Active phases. Link milestone A to both and B to one; include completed C and an unrelated completed-phase-only D. Reload Overview: A appears once, A/B precede C with their saved relative order, D is absent. Change one phase to Inactive: the other still selects its linked work. Check saved bars and all associated phase colors/names against Phases.
2. Choose All milestones: D and other historical work are reachable. Choose No linked phase: unassigned milestones appear. Expand Work without a milestone: unmilestoned tasks are reachable, including Done. Open the full work plan from each context.
3. Assign verified staff and client members to different tasks in A. Reload Overview: each appropriate avatar appears once on A; changing free-text owner text does not create an avatar. Remove an assignment/project membership through existing authorized controls and verify its avatar disappears after refresh.
4. Attach the same ready file to two A tasks, attach a second file to one, and add/remove authored notes and discussion comments. The milestone file count is two, not three. Count only nonremoved task notes/comments; project-wide comments and another milestone's records do not count. Withdraw a file: it stops counting. Expand each count and open task details/discussion to verify the saved records. A legitimate empty milestone shows zero content and no fabricated task percentage.
5. Give an open task saved start/due dates and a manual urgent priority. Confirm the calculated task suggestion follows the existing elapsed-time rule, with urgent listed separately. Undated, completed, blocked, dependency-waiting or overdue tasks must not invent a suggestion/start date. Missing/failed controls must not become a zero manual-priority count.
6. Block a productivity/activity read in developer tools or use an unavailable development data source. Confirm unavailable/retry instead of zero or an empty activity claim. Restore access and Retry saved data; existing draft text must remain. For server read failures that cannot be simulated in browser interception, exercise in a controlled development environment rather than changing live policies.
7. Overview → Edit task & subtasks: edit title/deadline/status/relationship. Saved cards/totals remain unchanged until Save all confirms. Open nested subtasks, assignment, notes, files and discussion. Close its detail panel and click the same Overview task action again: it must reopen and focus that panel. Follow the same task URL into Plan: the full detail panel opens. Switch normal/advanced and back with unsaved changes; one draft/baseline persists. Verify completion gates and Save/discard prerequisites for immediate commands.
8. In session A retain an edit; B saves another field, then the same field in a second run. A reconciles without lost edits and requires explicit same-field choices. Trigger validation rejection with an unfinished subtask, correct and retry. Reload restores the private draft. Test delayed save/refresh and Discard as in the R7C checklist; no stale response may resurrect discarded edits or imply unknown success.
9. Make a meaningful task/status, phase/color, assignment, file/note/comment change. Compare Overview's newest available activity with Activity: same event, actor, timestamp and destination. Generic Work plan saved snapshots do not populate the domain feed; real snapshot-derived changes remain. View all activity opens Activity. Save through Overview and check Plan, Phases, Calendar, directory/dashboard and subsequent navigation for saved values.
10. Open a task/milestone URL whose item was removed: see the missing-item notice, usable work plan and recoverable draft. In separate projects link different content; neither project's counts include the other's. As the client, verify staff Overview/activity/productivity routes remain unavailable and private note/file counts/bodies do not leak into client task views. Verify signed avatar/file access with actual accounts.
11. Repeat carousel scopes, count disclosure, shared editor and Activity links by keyboard/touch at narrow width and in light/dark. Save a different user timezone and test due dates around local midnight; completed deadlines stay completed, not overdue.
