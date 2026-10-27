# R7C — Shared Project editing and reliable save behavior

Implementation delivered; authenticated browser acceptance pending. Work is limited to `bivi-dashboard-overhaul`; `restore` is not modified, merged or deployed.

## Foundation verified

The working tree started clean at `086d525`, matching the fetched development branch. No applicable `AGENTS.md` exists in the repository or ancestor directories. The Projects blueprint, R7A save/draft notes, Tasks & Milestones implementation notes and R7B report were inspected before implementation.

Supabase project `0011` (`xxnvekmbotzcyuhsyxbw`, organization `yxgtzrjcrqonisdemyyi`) remains healthy. Actual ledger:

| Name | Remote version |
| --- | --- |
| `project_phase_colors` | `20261021202346` |
| `r7b_project_integrity` | `20261022165839` |
| `r7b_calendar_membership` | `20261022170140` |

All five R7B guards, the fenced draft discard RPC and Calendar membership projection are installed. The private completion helper remains unavailable to authenticated users. One saved client task still lacks a current completion review; R7B correctly flags it rather than inventing approval. R7B's technical implementation is verified; its live acceptance is **not** assumed complete. No records or schema were changed during this verification.

## Editing inventory and shared model

| Surface/action | Persistence boundary | Revisions and shared behavior |
| --- | --- | --- |
| Compact Plan and advanced editor: task/milestone title, status, due date, task-to-milestone relationship, work-plan notes | Private work-plan body; debounce/Save draft persists only the private draft. **Save all** explicitly applies it. | One `useProjectEditingController` and `useProjectWorkDraft`; project body and expected project revision travel together. Same validators, reconciliation and R7B database gates. |
| Overview task and milestone editing | Opens the same work-plan component/controller in the current page, with task details or selected milestone fields. | No separate Overview task store or save endpoint. Saved Overview statistics remain independent of private draft values. Task details expose existing subtasks, assignment, schedule, productivity and dependency navigation. |
| Formal phase transitions and colors | Existing explicit immediate phase/color commands | Independent phase/color revisions; authoritative reload/verification and per-phase feedback. Simultaneous active phases remain supported. Pending color selection is retained on refresh and requires review if its saved revision changes. |
| Responsible side and assignees | Existing explicit assignment command | Opened control revision is retained with local selections. Incoming saved changes require Use saved or Keep selections after review. Assignment membership and manager revisions remain independent. |
| Milestone-to-phase links and subtasks | Existing explicit hierarchy command | Project, hierarchy and applicable subtask revisions remain checked. Unknown hierarchy results are verified by stable IDs and exact submitted fields. Dirty subtask editors stay mounted across revision refreshes. |
| Calendar and Plan task start dates | One shared schedule hook/command | Expected project and per-task schedule revisions; date validation, stale-read protection, confirmed-save feedback and explicit refresh before retrying an unknown result. |
| Authored task notes, manual priority and file links | Existing explicit productivity command | Existing author/permission checks and project/note revisions. Unknown results can be verified against stable note IDs, priority and authoritative linked file IDs. New note IDs survive an uncertain retry. Work-plan notes remain separate private fields. |
| Lifecycle/dependency settings and client review | Existing explicit authorized commands | No ordinary full-page reload. Opened settings revisions are retained with local values; review is required when newer settings arrive. Client review still requires work-plan draft readiness and no unapplied work-plan edits. |

The compact board retains its prerequisite notice and disables conflicting immediate actions until the work-plan draft is restored/reconciled and saved or discarded. Save all/Save draft/Discard/Refresh saved data remain reachable in the shared editor. The advanced editor stays mounted inside that same editor, with Back to tasks & milestones; changing internal view does not create another session or clear validation.

## Confirmed defects repaired

- Canonical save success previously assigned the entire response body over local state. The controller now acknowledges the captured submission and merges in edits typed later. Later edits remain unsaved, rather than being reported as part of the confirmed save.
- Lost-response verification previously compared against the changing current body. It now verifies the actual submitted snapshot and revision; an uncertain result blocks another submission until reconciliation.
- Autosave conflict handling previously rebased an older captured draft. It now uses the newest in-memory edit. Pending saves defer competing server-prop loads; unresolved conflict choices survive subsequent authoritative revision refreshes.
- JSON object key order previously affected equality, allowing identical merged and saved bodies to appear dirty. Shared comparison ignores object property order while preserving array order and actual field changes.
- Draft deletion previously fetched the newest generation and could discard a different tab's newer private draft. It now deletes only the generation this editor loaded/created; a generation mismatch preserves the other draft. Delayed autosaves are awaited and fenced.
- “Discard and leave” previously only removed navigation's local registration. It now awaits the real persisted discard before navigating. Failed discard keeps navigation blocked. Edits made after discard starts remain recoverable and prevent leaving.
- Calendar duplicated Plan's schedule mutation path. Both now use the same schedule hook, revision handling and feedback.
- The hierarchy API did not explicitly return `saved:true` after its successful RPC. It now does, matching the other immediate APIs. Confirmed save followed by failed reader refresh remains reported as saved; it is not treated as an unapplied command.
- Revision-keyed Phases/lifecycle and subtask remounts could replace unsaved local selections. Stable instances and opened-revision review controls preserve local values instead of silently adopting newer tokens.
- Successful HTTP responses without verifiable save confirmation now count as **unknown**, not rejected/saved. Immediate command transport prevents duplicate requests and requires a successful authoritative read before retry after an unknown result. Validation rejection and explicit revision conflict codes remain distinct.

## Refresh and permissions

`lib/projects/revalidate.ts` invalidates the internal and clean staff project/detail/activity, directory, dashboard, My Tasks, Calendar and authorized client project paths after confirmed mutations. Existing dynamic Supabase/RLS reads remain authoritative. `lib/projects/refresh.ts` notifies mounted readers even when an independent sidecar revision changes without changing `inquiry_projects.revision`, then uses `router.refresh()`.

The shared controller reads/reconciles the canonical body and its matching revision after immediate mutations. It never repairs a stale whole-body draft by replacing only `expectedRevision`. A confirmed save offers Refresh saved data when the display needs recovery. Ordinary work-plan, scheduling, phase, assignment, hierarchy and lifecycle saves do not force a full page reload.

Server staff/client authorization, completed-project restrictions, RLS, audit history and R7B completion/review gates remain authoritative. No new permissions, task store, approval model or database mutation path was introduced.

## Files and migrations

**No migration required.** No migration was prepared or applied for R7C. Existing IDs, data, approvals, RLS and audit sources were preserved.

Main implementation: `useProjectEditingController.ts`, `useProjectWorkDraft.ts`, `ProjectEditingContext.tsx`, `ProjectWorkspace.tsx`, Overview/detail loading and the existing task/milestone components; shared editing/transport/result/refresh/revalidation helpers in `lib/projects`; immediate command hooks and settings editors; navigation discard coordination. Editing API routes now invalidate saved read paths, and task productivity exposes authorized linked IDs for exact uncertain-result verification.

## Validation and live limitations

Final checks passed: `npm run typecheck`, `npm run verify:platform` (**146 tests**) and `npm run build`. Platform verification includes all R7B PostgreSQL completion/atomicity/security tests. The build retains existing Tailwind/Browserslist and `/help/search` rendering warnings; it is not a deployment.

New asynchronous hook/transport behavior tests cover shared field edits, normal/advanced switching, typing during save, duplicate suppression, stale props/unmounted responses, whole-baseline reconciliation, same-field choices across refreshed revisions, validation correction/retry, confirmed save with failed refresh, lost/unverifiable responses, same-session immediate notifications, delayed autosave/discard, another-session generation protection, reload restoration, completed-project restrictions, exact hierarchy verification, property-order equality and awaited navigation discard. The harness runs controller/draft hooks with controlled React hook state and transport; it does not replace real authenticated browser tests.

No browser automation tools are exposed in this session. Authenticated browser interaction, two real sessions, actual staff/client sidecar writes, light/dark, narrow layouts and focus/touch behavior remain manual acceptance. No live project record was edited to claim acceptance. The existing R7B legacy client review issue remains outstanding.

## Exact manual tests

Use a development test project and two staff sessions; do not use production `restore`.

1. Overview → Open tasks → **Edit task & subtasks**. Edit title, due date, status and milestone association in task details. Confirm the private draft indicator changes while saved Overview totals stay unchanged. Save all; Refresh saved data; navigate to Plan, Phases, Calendar, directory and dashboard and verify the saved values. Open an active milestone's **Edit milestone** action and save its fields through the same controls.
2. In Tasks & Milestones edit a title without saving. Open **Advanced work-plan editor**, edit another field, then **Back to tasks & milestones**. Both edits, the same revision and validation state must remain. Test existing `?tab=plan&task=...` and `?tab=plan&milestone=...` deep links.
3. Throttle requests in browser developer tools. Start Save all, then type another edit before the input becomes disabled (or use a controlled delayed response). Only the submitted snapshot should be saved. Newer typing must remain visibly unsaved for another Save all; repeated save clicks must not create duplicate revisions.
4. Trigger an R7B completion rejection using an unfinished subtask. Confirm the draft is retained without revision/conflict churn. Correct the task status or complete the child work first, then retry. The completed-project and client-review gates must still apply from Overview and Plan.
5. Session A keeps a private title edit; B changes a deadline and saves. A's Save all must reconcile the deadline while retaining its title. Repeat with both changing the same title: A must choose Keep my edit or Use saved. Refresh while that conflict is displayed; the choice must remain required.
6. With unapplied work-plan edits, inspect assignment, schedule, productivity and subtask controls: the Save all/Discard prerequisite must be clear. Save/discard the work plan, then use those immediate actions. Confirm each reports saving/saved/error truthfully and subsequent commands use matching authoritative revisions. In Calendar edit the same task's start date and verify it in Plan/My Tasks.
7. In two sessions open assignment, lifecycle, subtask or color editing controls. Change the saved value in B, then refresh A. A's local selection/text must remain; inspect the displayed incoming saved value and explicitly choose Use saved or Keep after review before retrying. No field should be overwritten just because a revision changed.
8. Simulate a successful save followed by a failed refresh. The editor must say saved and offer refresh, retain newer edits, and avoid a duplicate POST. Simulate a lost/unverifiable POST response: Check save status or refresh the relevant saved reader must precede retry. Verify notes/subtasks/file links do not duplicate when an uncertain write is found by its stable ID.
9. Type a private draft and reload after **Autosaved privately** appears. Restore it. With a delayed autosave in flight, choose **Discard changes**; the newest saved baseline must load, and the delayed response must not recreate the discarded draft. Use another tab to update the private draft generation: A must not silently delete B's newer draft.
10. With dirty work-plan edits click another project section. **Stay** preserves them; **Save and stay** applies them explicitly; **Discard and leave** must wait for confirmed draft deletion. Force DELETE failure and confirm navigation stays blocked with recoverable edits. Test narrow/light/dark layouts and keyboard access to the new edit/review/refresh controls.

## Delivered / Partial / Pending

- **Delivered:** shared controller and Overview editing; one compact/advanced draft; revised save/discard/reconciliation behavior; immediate transport/revision coordination; connected-surface invalidation; focused automated behavior and existing database tests.
- **Partial:** live acceptance of R7B/R7C and existing Phases/Tasks & Milestones behavior; browser/failure simulation and real account boundaries still need the tests above.
- **Pending:** explicit review/reopening of the legacy unreviewed client task, end-of-R7 visual refinement, and all previously agreed Brief/Requests/Activity/Admin Settings relocations, Calendar month grid and remaining roadmap work. No following slice is started.
