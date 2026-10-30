# Bivi — Consolidated Projects Completion & Workspace Development Master Plan

> **Persistent Bivi planning record.** This is the complete consolidated plan prepared on 2026-10-30. It is a requirements baseline, **not** a claim that every item remains pending. For changes merged after PR #29, read [BIVI_PROGRESS.md](./BIVI_PROGRESS.md) and [BIVI_NEXT_STEPS.md](./BIVI_NEXT_STEPS.md) first. Use current source, migration state and deployment as evidence. The historical PR/patch numbers below are snapshots or candidate labels, not fixed future PR numbers. The introduction of this tracking documentation itself consumes a PR number; do not identify a feature patch by a guessed PR number. No instructions in this document authorize contacting staff, sending invites, or changing permissions without explicit user action.


**Current baseline:** 30 October 2026  
**Repository:** https://github.com/0445968/0011  
**Production branch:** `restore` — the sole branch currently tracked for production  
**Verified GitHub HEAD / production SHA:** `bff39ec15aed096efa6fca786a2d950cf72565d0` — merged PR #29  
**Production URL:** https://staff.bivi.pro  
**Supabase project:** `xxnvekmbotzcyuhsyxbw`  
**Primary focus:** Finish the **project Tasks page, task editor, approval/return workflow, scheduling and production acceptance**. Then complete the connected Projects system before broadening the rest of the workspace.  
**Document status:** Consolidated planning and repository/database/deployment read-only audit. **No code, database rows, staff accounts, emails, commits, pull requests or deployments were changed by the creation of this document.**

---

## 1. How to use this as the source of truth

This file replaces the *implementation order*, not the historical detail, of:

1. `Bivi_Projects_R7_Completion_Blueprint.md` (historical R7 scope)
2. `Bivi_Projects_Refinement_Roadmap.md` (R1–R7 and refinement scope)
3. `Bivi_Pending_Changes_Dashboard_Overhaul_Plan.md` (broader Bivi workspace scope)
4. `bivi-project-workplan-pilot.patch` (obsolete **D1c historical visual reference**, **never apply directly** to current source)
5. The user's more recent **Bivi Projects: Remaining Work Plan**, including the reported production Patch #29 state and new requirements.

The source of truth for what **exists** is the current `restore` code, current migrations and production deployment; for what **should exist**, the latest explicit user requirements take precedence over older unimplemented plans. Prior implementation descriptions and PR notes are evidence, not substitutes for an authenticated user test. Do not confuse a feature implemented in code with a feature accepted in production.

### Status vocabulary (must be used in every future handoff)

- **DELIVERED — code:** implemented on `restore`, with a matching deployment when verified; may still need production UI acceptance.
- **DELIVERED — tested:** an actual specified test passed, with environment/date recorded. SQL checks, automated tests and authenticated browser tests are distinct.
- **PARTIAL / REPAIR:** foundation exists, but the user-observed behavior, permission pathway or completion is not satisfactory. **Fix/extend**, do not create competing implementation.
- **PENDING:** not implemented in current baseline or not proven implemented.
- **DEFERRED:** valid requirement intentionally ordered later; not dropped.
- **UNVERIFIED:** not enough evidence to call it implemented or functioning; audit first.

**Mandatory first step in every coding chat:** re-fetch `restore` HEAD, list PRs merged since this document, inspect the local `git status --short` and working tree, read `AGENTS.md`, inspect impacted code and *live* migration state. Update the status matrix below **before writing patches**. Never run a patch against the SHA above if `restore` has moved.

---

## 2. Verified baseline and evidence — 30 October 2026

| System | Verified observation | Limit |
|---|---|---|
| GitHub | `restore` HEAD `bff39ec…`, commit title **Add governed task-change approvals, manager roles and weekday-first dates (#29)**; PR #29 merged | Local VS Code working tree was **not** accessible; always inspect it before work |
| Vercel | Deployment `dpl_67pJJq3sJgdBpovPVhnQ1rdJtD4F`, target production, state **READY**, `staff.bivi.pro` alias, SHA exactly `bff39ec…` | Login-gated staff workflows were **not** tested through the authenticated browser |
| Supabase | Migration list includes `20261030203102 task_authority_and_change_approvals`, alongside earlier draft/review/status migrations | Migration listing and PR test notes do not prove each signed-in UI path; compare deployed functions/triggers on affected changes |
| Resend configuration | Vercel production has variable names `RESEND_API_KEY`, `BIVI_EMAIL_FROM`, `BIVI_EMAIL_REPLY_TO` | Presence does not verify value validity, verified sending domain, Resend acceptance or actual inbox delivery. **Values were not read.** |
| Staff access | Existing API generates Auth invite link; UI displays link for copying; no send-through-Resend behavior in inspected route | **No invitation email was sent as part of this review** |
| Test history | PR #29 reports typecheck/build and **251 platform checks**, including targeted database authority/conflict checks | Historical claim from PR, **not** tests rerun in this review |

### Migration identity warning — very important

Supabase's recorded versions are **not always the same as repository filename prefixes**. Examples observed:

- Recorded `20261030155348 project_timezone_and_task_tag_catalog` versus repository `20261030163000_project_timezone_and_task_tag_catalog.sql`.
- Recorded `20261030163307 task_review_status_validation` versus repository `20261030171500_task_review_status_validation.sql`.
- Older R7B/phase-colors versions also differ between the live ledger and repo filenames.

Therefore **never** infer “missing migration” solely because a file timestamp does not match the ledger. Match migration **name, installed database objects/RPC function signatures, dependencies and effects**. Do not reapply old R7A–R11 or Patch #29 SQL. Create a *new* migration only for a genuinely missing schema change; inspect migrations and rollback/permission consequences first. Follow the actual project CLI procedure for new migration filenames.

### Fixed security/account requirements

- `crafterkite@gmail.com`: active workspace admin **and** project manager; **never remove the admin role** or bypass last-admin protection.
- `yulda@execs.com`: prepared project-manager role; as last recorded, **not yet an Auth user/invited account**. Do not create, resend or send an invitation until the user explicitly takes that action in the deployed Staff access interface.
- Project manager ≠ workspace admin. Project managers cannot approve privileged task changes or use admin override merely by being managers.
- Preserve RLS, staff/client organization boundaries, signed files, private notes/drafts, revision checks, audit logs and stable project/task IDs.
- Do not claim an invitation was delivered because an Auth link was prepared or an email request was queued.

---

## 3. Completed implementation registry — DO NOT BUILD AGAIN

These were confirmed by merged GitHub PRs, current source/docs, and (where listed) migrations. The remaining task is regression verification or targeted improvement, **not repeating their implementation**.

| Feature family already introduced | Evidence | Remaining distinction |
|---|---|---|
| Initial compact Projects directory, overview, milestone UI, phase/milestone/subtask hierarchy, multiple assignees, parallel formal phases and shared project data | R1–R7 repository docs, current components and migrations | End-to-end acceptance still applies; do not replay the obsolete pilot patch |
| R7A phase-save repair, milestone reconciliation, R7B integrity/metrics, R7C shared editing, R7D Overview, R7E activity/requests/meetings, R7G visual primitives | `docs/projects-r7a-*`, `projects-r7b-*`, `projects-r7c-*`, `projects-r7d-*`, `projects-r7e-*`, `projects-r7g-*` | **R7F cross-page acceptance unverified**; not a greenfield project. Authenticated/browser QA remains outstanding |
| R8 operational status (Active, On hold, Waiting on client, Inactive), closeout guards, project review overrides | `docs/projects-r8-*`, R8 migrations | Preserve independently of execution state and publishing; do not introduce second operational status truth |
| Docked/resizable full task editor and independent workspace tabs | PR #5 and #20 | Keep width preference, task IDs, saved tab state and existing deep links |
| Chrome-style tab strip, neutral strip background, border removal and color accent | PR #8 and #9 | Keep workspace shell appearance rather than redesigning again |
| Task selection, bulk actions, multiple views, collapsed categories, toolbar menus, row hover actions, task ordering and drag/drop | PR #7–#11, #18–#19 | Existing behavior may need specific usability fixes; do not rebuild task table wholesale |
| Project state & decisions / Activation snapshot / Project history relocated from Tasks to Brief | PR #12 | Do not move these back into Tasks |
| Explicit Save all / Save task, recoverable drafts, recent-task list, grouped row controls | PR #13–#15, #23, #28 | Protect correct scoped saves, conflict handling and draft recovery |
| Task starts/due dates with times, timezone and matching Calendar/My Tasks projections | PR #15–#17 and #26 | Do not create a competing schedule store; scheduling **estimation** still pending |
| Right-click task actions (rename, duplicate, move, link/share), archive/restore, recent tasks and dedicated tabs | PR #19–#21 | **Add subtask is not yet in the task right-click menu** |
| Overdue **effective Urgent** status while preserving selected priority, red due dates and updated status/icons | PR #22–#23 | Extend urgent computation to specified **Rejected + under-24-hour** cases, not overwrite base priority |
| Staff session expiration notice and explicit session renewal with draft preservation | PR #24 | No new session framework needed |
| Responsive task toolbar/search and workspace bar controls under profile menu | PR #18 and #25 | Make the specified **In Review / status bars** hideable through existing controls, not new settings store |
| Project timezone default moved into Brief; task tag catalog, colors and weekday/time display preferences | PR #26 | A full searchable IANA timezone picker remains part of *broader* settings roadmap |
| Basic per-task staff/client review requirements; `in_review`/`rejected` status validation; staff access and invite-link creation | PR #27 | **Ordered multi-stage completion approvals and invitation email sending remain pending** |
| Review-required work prevents premature milestone completion; assignment and review settings included in a single atomic private draft save with receipts | PR #28 | Preserve this transaction model when future approval policy fields are added |
| Task creator/owning organization/responsible side separation, versioned **task-change proposals** to Approvals, manager role protections | PR #29 | **Do not confuse task-change proposals with ordered completion approvals**, which are next |
| Real project meeting records and calendar linkage | R7E docs and migration | Do not create a second meetings table; external calendar invitations/synchronization remain future integration work |

**Relevant PR list:** https://github.com/0445968/0011/pulls?q=is%3Apr+is%3Amerged and specifically [#5](https://github.com/0445968/0011/pull/5), [#8](https://github.com/0445968/0011/pull/8), [#9](https://github.com/0445968/0011/pull/9), [#12](https://github.com/0445968/0011/pull/12), [#13](https://github.com/0445968/0011/pull/13), [#18](https://github.com/0445968/0011/pull/18), [#19](https://github.com/0445968/0011/pull/19), [#20](https://github.com/0445968/0011/pull/20), [#21](https://github.com/0445968/0011/pull/21), [#22](https://github.com/0445968/0011/pull/22), [#23](https://github.com/0445968/0011/pull/23), [#24](https://github.com/0445968/0011/pull/24), [#25](https://github.com/0445968/0011/pull/25), [#26](https://github.com/0445968/0011/pull/26), [#27](https://github.com/0445968/0011/pull/27), [#28](https://github.com/0445968/0011/pull/28), [#29](https://github.com/0445968/0011/pull/29).

### Four especially important source-level findings

1. `components/admin/projects/TaskDraftControlSettings.tsx` **still renders** a Phase `<select>`, `Blocker owner` enum (Bivi / Client / External), and `Service reference` text input. This is **work to change** under the next UI slice; it is not already fixed.
2. `components/admin/projects/ProjectMilestoneBoardV2.tsx` already has `addSubtask` and a **full-editor “Add subtask” action**, but it is disabled when the editor lacks the relevant sidecar permissions/readiness or the child limit is reached. User reports being unable to add a subtask. **Investigate the actual guard/error/dirty-state interaction, not create another subtask store.** Right-click task actions do not currently list Add subtask in the inspected actions array.
3. The current recent-task selection effect invokes `scrollIntoView()` while the selected task/editor is active; the requested behavior is **one deliberate jump if the task is outside the visible list, followed by free manual scrolling**. Fix the effect/request semantics without breaking selection/focus and deep links.
4. `app/api/admin/workspace/staff/route.ts` calls Supabase `auth.admin.generateLink(type:'invite')`; `components/admin/settings/StaffAccessSettings.tsx` offers **Create invitation link / Copy this private invitation link**. Neither uses `lib/communications/email.ts` for this action. **Email-send integration is pending.**

---

## 4. Immediate patch queue — finish the Tasks page first

The patch numbers **#30 onward are planning labels only**, not assertions about existing PRs. Always use the next real number and update this section after a merge. Bundle small changes into a coherent PR; do not release tiny one-line fixes unless explicitly requested.

### PATCH NEXT / candidate #30A — Task editor usability and permission repair (highest priority)

**Goal:** User can work comfortably in one canonical full task editor, with all existing authorization and draft guarantees retained.

**A. Task fields and phase assignment**

- Remove **Phase** selection from the *task editor and task-specific settings*. Phase membership is managed via **milestone view/editor only**. Preserve and audit the legacy direct task-phase field used by existing filters/gates; define read-only effective phase via the linked milestone(s), with a documented fallback/reconciliation for tasks lacking milestone phase links. **Do not delete the database column or silently rewrite old records** until every consumer is audited (Calendar, My Tasks, client creation, dependency/closeout checks, phase completion).
- Label `blockerOwner` according to its actual enum meaning: a **responsible organization for a blocker**, not a selectable individual. Suggested label: **“Waiting on”** with Bivi / Client / External and helper text. Keep prerequisites (`dependsOn`) visibly separate from blocker responsibility.
- Clarify the free-text `serviceId` field as **“Related service/request ID (optional)”** or an equivalent clear label. Explain it is an internal link/reference; do not call it a required task service identity. Preserve saved values and existing links.
- Keep status, owner/creator/owning-org, responsibility, assignees, tags, due date, start date and approval settings visibly distinct so a phase or responsibility change does not silently change review policy.

**B. Subtasks**

- Diagnose the existing full-editor **Add subtask** action: check actual hierarchy data readiness, `canEditTaskSidecar` and `canEditSidecar`, user role, pending private draft, archived/completed parent, 50-child limit, and responses from the existing hierarchy RPC. Display the precise reason when unavailable. Ensure eligible users can add subtask via the **existing** endpoint and stable IDs, permissions and audit. Admin-only structural permissions from R11 must remain enforced; assigned users may progress existing subtasks only as allowed.
- Add **Add subtask** to task right-click / hover action menu and keyboard/touch equivalent. It should open the same subtask creation workflow, not a duplicate implementation. Preserve the existing milestone editor operation.
- If a task has an unsaved work-plan draft, present an accurate prerequisite or safe draft-preserving operation—never silently discard, overwrite, or bypass task-change approvals.

**C. Editor, table and bars**

- Make the requested **In Review and task-status tab/category strip** hideable from the **existing** workspace bar-visibility settings alongside current hideable bars. Reuse existing per-user persistence and toggles. Keep review items discoverable in Approvals/filtering when the strip is hidden.
- Assignee row: remove the **three-line/menu icon** for the assignee control only; show assigned verified member avatars directly, and **User+ / assign-user icon** when none. Keep keyboard-accessible assignment, clear permissions and multi-assignee behavior. Do not remove task row's unrelated context menu.
- Opening a task from **Recently opened**: if missing from visible filter/page, reveal it and make **one** intentional focus/scroll jump. Subsequent editing, rerendering and manual scroll must not auto-jump again. Reset one-shot focus request only for a new explicit navigation. Do not break deep-linked task focus or current selection restoration.
- Preserve resizable workspace-level drawer, multi-task tabs, toolbar menu outside-click close, row hover controls, collapsed categories, responsive search, drag ordering, private note/comment drafts, archive and recovery.
- Reconcile any other minor task-table requests against the current implemented UI before adding them; record individual before/after behavior, not “redesign Tasks again.”

**D. Authorization and save boundary**

- PR #29 task creators/owners/managers/side distinctions remain authoritative. Read-only or proposal-only users must not be offered a false direct-save path. Task setting changes use the R10/R11 combined private draft / Save task / Save all / proposal routing as applicable. Subtask structural operations retain their existing explicit RPC until an intentional unified model is designed.
- Handle 409, failed/uncertain write, permissions, unrelated drafts and reopening completed milestones without data loss. Add targeted component and database/authorization tests.

**Definition of done:** Each requested control is reachable and named correctly; eligible staff can create a subtask from the full editor and context menu, unauthorized users get an explanation and no write, Phase no longer editable on Tasks, existing linked phase logic remains correct, assignee control is icon/avatar-first, bar toggles persist, and a recent-task jump happens at most once per deliberate selection.

### PATCH NEXT / candidate #30B — Staff invitation emails (can ship with #30A if one manageable reviewed PR)

- Reuse `lib/communications/email.ts` and the existing transactional communications style/configuration. **Do not create a second mail transport.**
- Add an explicit **Send staff invitation** action in Settings → Staff access. Keep safe non-sending preparation/copy behavior only if useful; avoid confusing “create” and “send.” Do not auto-send to prepared invites.
- Use the Supabase Auth invite activation link; send only to that invited address. Preserve staff/project-manager prepared-role handling; never grant admin override via project-manager role. Last-admin protection remains.
- Assess Auth link generation's side effects, resend/expired link handling, idempotency, prepared-role reservation, and outcomes where Auth succeeds but Resend fails. Persist enough status for safe retry/reconciliation, show **prepared / email queued / provider accepted / failed / activated** accurately, and avoid duplicating invitations. Do not claim inbox delivery without receipt evidence.
- Keep token/activation link out of logs, exceptions, analytics and public API responses other than the currently intended admin-only safe copy UI. Do not send an email until a signed-in admin explicitly chooses this action after deployment.
- Production variable names `RESEND_API_KEY`, `BIVI_EMAIL_FROM`, `BIVI_EMAIL_REPLY_TO` **are present**, but validate provider/domain acceptance in a controlled test; do not read or print secrets.
- Test existing-user activation, new Auth account, expired link, retry, delivery failure, role application and unauthorized caller. No invitation to `yulda@execs.com` is to be created/sent during implementation/testing without explicit user action.

**Definition of done:** deliberate admin send results in an accurately recorded provider action; no invisible email sending; no duplicate Auth accounts or privilege escalation; errors are clear and retryable; invite link remains private; production provider validation is recorded without exposing secrets.

### PATCH FOLLOWING / candidate #31 — Ordered task completion approvals (major workflow)

**Different from PR #29 task-change proposals**; reuse existing `in_review` / `rejected` state and approval/Requests infrastructure instead of replacing it.

- A task may require **Bivi admin**, **client**, **both**, or policy-allowed none; admin selects authorized stage order. For Bivi-owned work needing client approval, enforce the requirement that Bivi admin approval occurs before the client stage.
- Assign a verified project contact as eligible client reviewer when applicable. Have **one designated reviewer whose acceptance completes the task** at the relevant final stage. Bivi final authority remains explicit; a manager role never grants an override.
- Eligible staff/client members **Submit completion**: transactionally persist a version-bound approval request and move the task to **In Review**. They must not bypass client-created-task completion restrictions. If status mutation is submitted as part of a private draft, preserve existing Save task/Save all and atomic review submission semantics.
- Admin-only manual In Review/Rejected controls; admin override shows outstanding reviewers, requires a recorded bypass reason and keeps audit evidence.
- Routing: Bivi admin queue first for Bivi-owned client-reviewed tasks; then client stage, with client decisions also visible in Bivi Approvals as appropriate. No false “completed” counts before every required stage has been accepted.
- Show **In Review** and **Rejected** groups/tabs at the top while they have active entries; use requested icon palette **loader / purple-pink** for In Review, **octagon-x** for Rejected, **clock-fading** for In Progress. These groups remain hideable under the existing bar preference as specified in #30A.
- Confirm completion through authoritative server gates; do not let child tasks, dependencies, milestone/phase closure or an old Bivi approval accidentally bypass a fresh stage.

**Definition of done:** both approval orders allowed by policy, version-checked atomic submission, correct stage visibility/admin actions, correct user/organization isolation, no premature `Done`, and transaction rollbacks verified.

### PATCH FOLLOWING / candidate #32 — Versioned review, return, release and urgency

- Each review binds to a **fixed saved task version/snapshot**. New task edits remain recoverable drafts and require a new submission/update; an earlier acceptance never approves changed work. Superseded requests cease reminders.
- Require a task comment when **sending a revised version** or **releasing/returning a review**. Reuse authorized comment links/files/contacts/assets where currently supported. Comments appear in task discussion; show a per-user **unread comment marker beside task name**.
- Return semantics: work sent back to the receiving team resumes **In Progress** and is **effective Urgent** for Bivi staff where specified; the other organization sees **Rejected** until it is resumed. Define organization-specific projection without storing contradictory global task statuses.
- Rejected work overdue or due in **less than 24 hours** becomes **effective Urgent**, without mutating the user's manually selected/base priority. Urgency clears/restores appropriately on completion, accepted reschedule or resolution. Respect existing PR #22 overdue urgency behavior and timezone calculations.
- Audited comments/returns, exact recipients, permission-scoped unread state, retry/dedupe and no notification spam.

**Definition of done:** changed versions cannot be approved by stale decisions, every release/return carries a comment, recipient sees the right status, unread/urgent indicators clear correctly, no base priority corruption.

### PATCH AFTER REVIEW / candidate #33 — Baseline planning and dependency scheduling

- Admin-defined template **phase start/due dates** before project activation. Reuse existing formal phase/milestone/task model and project Calendar; do not add competing task records.
- Effort presets **5/15/30/45 minutes, whole hours**, plus permissible 5-minute increments; configurable **1–16 hours/day** and **1–7 selected workdays/week**; account for timezone, holidays and DST.
- Generate previewable dependency/capacity schedule: task order, direct prerequisites, milestone/phase constraints, multiple assignees, parallel work, realistic working hours and review windows. Reject dependency cycles and impossible plans with actionable explanations.
- Preserve immutable **approved baseline** separate from calculated preview, actual start/end and forecast. Starting/completing early **never silently moves approved deadlines**. Eligible staff can adjust own actual task start and private My Tasks target/goal date without changing approved deadline.
- Starting a future phase early explicitly asks whether to activate it, records the real start and preserves independent active phases; prerequisite bypass needs authorization.
- Phase dates cap the latest milestone/task completion; a task attached to multiple phases uses the **latest applicable deadline**. Milestone completion only after all required tasks/subtasks and approvals are complete; no premature auto-approval.

**Definition of done:** reproducible preview/approval with same inputs, no silent baseline shifts, phase and dependency limits, capacity/timezone validation and deterministic tests.

### PATCH AFTER BASELINE / candidate #34 — Extension approval and late completion

- A task can be completed **after** due date. Later-than-baseline proposed due dates require a **Deadline extension request** with reason and proposed date; pending decision does **not** alter approved due date.
- Route approvals to authorized administrator/reviewer, with accepted/rejected decision, revision, audit and notifications. No silent sibling/phase rescheduling or mutation of existing approved baseline. Preserve personal goal date vs shared approved deadline.
- Show due/overdue/extension state on Tasks, My Tasks, Overview, relevant calendar, and Approvals through one read model. Keep manual priority and effective urgency separate.

**Definition of done:** declined/pending request leaves baseline untouched; approved request applies exactly one intended scope with audit, even after concurrent edits.

### PATCH AFTER EXTENSIONS / candidate #35 — Client review windows, holds and resume impact

- Configurable client review SLA **24/48/72/custom hours** (explicit elapsed vs working hours), reminders/escalations, stop-on-decision/supersession, quiet hours and reasonable deduplication.
- If client review exceeds threshold, alert **admin**; admin may place project on hold using existing R8 operational/hold model; staff may continue authorized independent work as appropriate. “Viewed” ≠ “Approved.”
- On resume, present overdue approval time, real hold duration and dependency-based downstream impact as **different quantities**. Admin chooses **keep baseline**, **preview/accept affected shift**, or **set feasible target date**. Do not double-count overlapping waits; never add waiting to task effort; completed/unrelated dates remain fixed.
- Avoid a second Waiting on client/On hold state machine. Respect existing operational status and explicit resume requirements.

**Definition of done:** pause/reminder/release state is coherent, no duplicate escalation, schedule impact is honest and review clock does not reset without cause.

---

## 5. Remaining Projects integration / usability acceptance (cross-cutting)

This work is **not** a restart of R7; it is a measured acceptance/repair pass concurrent with or after the new task workflow slices.

**R7F and end-to-end regression work is UNVERIFIED.** The legacy R7 blueprint had an R7F cross-page matrix but no verified completion evidence. Test/edit only a broken projection:

| Action | Screens that must agree | Existing foundation to preserve |
|---|---|---|
| Task text, status, start/due dates, archive | Project Tasks, Overview, project directory, My Tasks, shared/project Calendar and authorized client portal | Saved project revisions, private draft scope, time instant projections and effective urgency |
| Add/remove assignee | Task avatar row, milestone previews, My Tasks Mine, calendar Mine, notifications | Verified multi-assignees and RLS; no duplicate events or inflated task totals |
| Subtask/task/milestone/phase completion | Parent readiness, R7B gates, R8 closeout, approvals and activity | Separate formal phase states, shared milestones, review freshness and audit |
| Client task completion / return | Requests, task detail, Approvals, client view, comments and activity | Existing client review and stage-specific authority, no fake `Done` |
| Notes/comments/file links | Detail counters, activity, file previews, notifications | Private note ownership, RLS and signed file URLs |
| Meetings | Project and shared Calendar, upcoming Overview | Real R7E meeting records; no fabricated meetings, invitations or sync |
| Operational project status | Brief, Overview, directory, dashboard, My Tasks and both calendars | Existing Active / On hold / Waiting on client / Inactive and separate project completion |
| Deep links, desktop/mobile | Workspace task tab, project Tasks, legacy lifecycle/phase links and Back | Stable task IDs, tab persistence, protected navigation and draft warning |

**R7G visual acceptance still pending:** 390/768/1280/1440 pixel views, 1440×900 practical density, light/dark, long headings, multiple assignees, nested subtasks, no clipped sticky controls, keyboard/touch, empty/error/high-volume states. Do not copy untested layouts to every dashboard page.

**Shared metrics contract:** count distinct saved top-level tasks in project completion; show subtasks separately, deduplicate shared milestones and multi-phase membership, never average project percentages to get global completion; keep formal active phases distinct from progress evidence. Empty plan is **No tasks**, failed read is **Unavailable**, private-draft metrics are labeled **Draft**. Overdue uses saved viewer timezone and exact instant for timed due dates. Files/comments/activities are permission-scoped and never invented.

**Project subpages already exist and need acceptance, not recreation:** Overview, Tasks & Milestones, Phases, Calendar, Brief, Delivery, Access, Discussion, Files, Activity, Publishing, Requests/reviews and directory. Preserve three directory views, existing phase colors/statuses, approved Brief governance relocation and R8 closeout.

---

## 6. Broader roadmap — retained but sequenced **after Projects**

The older Dashboard Overhaul plan contains valid requirements. They are intentionally **not** permission to rebuild existing features in the current Tasks sprint. For every item below, first inventory what now exists, then implement missing behavior.

### Stage B1 — Final Projects UX and product contracts

- Sign off Tasks and full editor, ordered reviews, scheduling, extension approval, and Projects cross-page acceptance above.
- Consolidate reusable compact UI patterns (headers, metrics, phase/progress bars, avatar stacks, dense rows, drawers, conflict/error states) without changing shell styling or public/client portal unintentionally.
- Complete remaining task **asset requirement directory** separately from deliverables: blueprint-defined expected asset types, uploads that satisfy multiple requirements, relevant suggestions, required-vs-delivered progress and file permission rules.
- Add private **personal to-do lists** attachable to projects, tasks, messages, files/assets, meetings, etc., with categories, featured items and profile/dashboard management. Define privacy and linked-record deletion handling.
- Finish a user-accepted design/data contract and actual screenshots for Projects before broad page rollout.

### Stage B2 — Settings, shell additions and global Tasks

- Finish requested top-bar profile menu destinations where missing: Notifications, Edit profile, Workspace settings and Activity; preserve current styling, blue notification dot and existing account actions.
- Dedicated Settings sidebar that *replaces*, rather than duplicates, the workspace sidebar; Return to dashboard, Profile, Notifications, Appearance, Storage, Security, Activity. Existing Staff access remains protected.
- Searchable, keyboard-accessible **full IANA timezone** picker in applicable settings. Current Project workspace timezone control uses a **short hard-coded dropdown**; do not treat that as full requirement completion.
- Expand cross-project My Tasks/global Tasks from its existing working directory with integrated creation/management, task dashboard and filters; reuse canonical project task services and R11 permissions.
- Continue one-source status/assignee/role model across shell, directory and task record tabs.

### Stage B3 — Page-by-page design rollout and relationships

- Staff Dashboard more useful project/approval/overdue/meeting/activity stats (no invented revenue), drilldowns and real aggregate counts.
- Inquiries and each inquiry subpage, retaining qualification → proposal → agreement/deposit → onboarding → activation locks.
- People directory/record: expandable cards, source/activity filters, real Activity overview, Details / Emails / Tasks / Communications / Files / Access / Notes and authorized invite-to-project flows.
- Companies directory/record: compact summary, real Activity feed, inquiry/project/task previews and People / Files / Communications / Access / Notes.
- Clients directory: **companies with current or historical projects**, filtered by actual project facts; no duplicate client identity.
- Approvals and other staff pages use approved compact design, with dedicated approval task stages rather than a new unrelated queue.

### Stage B4 — Calendar, Files and external integration

- Extend existing project/shared calendar: day/week/month/agenda/timeline as appropriate, real meeting/task/custom category filters, assignee/company imagery, timezone correctness and source links.
- External Google Calendar links/export vs actual two-way sync are **different features**. Decide connection/privacy rules before two-way sync. Add audited share/email reminder flows only where permissions allow.
- Extend existing Files/Storage: thumbnails, safe previews, folders created on first project upload/share, context menus, type icons, search/views, archive/trash/restore, usage/limits and image optimization. Use current Supabase Storage/RLS and signed links; do not duplicate blobs to make folders.
- Email communications evidence distinguishes queued, provider accepted and delivered; no fabricated signatures, emails or meetings.

### Stage B5 — Blueprints and content workspaces

- Unify **Templates + Services** navigation as **Blueprints** without deleting the respective data models or old routes. Service-specific default blueprint + variants, versioning, snapshots, archive and application to a **reviewable task/subtask/milestone draft** before finalization, with idempotency.
- Combine Forms + Proposals staff workspace (final name pending) while preserving existing proposal issue/acceptance histories, forms submissions and links. New proposal action selects the permitted inquiry/company and blueprint before edit/issue.

### Stage B6 — Business tools after stabilization

- Reports (real source data), Team directory, Billing/ledger; follow their earlier Phase 5 readiness/security decisions. No invented accounting figures or placeholder features merely to pass a build.

**Design invariant across B1–B6:** Workspace navigation category order **Workspace above Clients & Sales**; Overview not expandable; notifications in top bar; sidebar child record visibility controlled by expandable type; preserve Chrome-style task tabs with color accent, drag/reorder/pin/bookmark and guarded close/refresh.

---

## 7. Engineering and checked production release procedure

**Never assume an old branch remains authoritative.** Historical branches (`bivi-dashboard-overhaul`, `bivi-sidebar-phase0`) are context only; current deployment runs `restore`.

1. **Start:** fetch the latest `restore` SHA and last merged PRs, inspect local `git status --short` / diffs and relevant docs including `AGENTS.md`. Preserve every uncommitted edit; **never automatically reset, clean, discard or stash**. Work from fresh `restore` on a new coherent feature branch, unless the user specifically directs otherwise.
2. **Dedup audit:** for each proposed behavior, list code component, API/RPC, table, migration, existing test, status (delivered/partial/pending) and acceptance evidence. Search routes and data readers before new schema. Prefer modify/reuse existing controller, approval queue, hierarchy RPC, communication sender and task UI.
3. **Implementation:** bundle related minor UI requests; avoid tiny independent patches. Honor project task authority, client privacy, last-admin protection, phase/closeout gates, revision checks, private drafts and explicit versus immediate save boundaries. No fake successful action messages.
4. **Database:** inspect actual live migration ledger **and installed RPC/trigger signatures**; compare repository names and earlier timestamp mismatches; add only genuinely new forward migration when needed. Protect production data, RLS and execution grants. Verify schema and privilege effects after an authorized application. Never rerun `20261030203102_task_authority_and_change_approvals` or earlier scripts just because filename differs.
5. **Automated checks:** run `npm run typecheck`, `npm run verify:platform`, `npm run build` and relevant focused tests. For policy/SQL changes, add actual database behavior tests (authorized and unauthorized actors, stale revision, rollback, idempotency, RLS). A green build alone is not acceptance.
6. **PR and release:** open PR to `restore`, inspect changed files and CI/GitHub checks, await Vercel preview **Ready** and review patch; merge through the approved checked workflow. Remember Preview admin login is inaccessible for the user's testing, so preview success is **not** signed-in QA.
7. **Production proof:** verify current `restore` HEAD, exact production Vercel deployment SHA, **Ready** state and `staff.bivi.pro` alias, and unauthenticated route health. **Do not claim signed-in workflow tested unless an authenticated session actually exercised it.** Give the user a short scenario checklist to verify in production safely, preferably with non-sensitive test records.
8. **After each release:** append a ledger entry to this file or a versioned successor: PR # and link, starting/final SHA, feature statuses, schema migrations (repo name and actual live version), tested environments/commands, manual user acceptance, blockers, next patch. Mark delivered rows **once** and do not re-add them to the pending queue.

### Required security / regression test themes

- Admin vs manager vs eligible staff vs assigned client vs unrelated client vs anonymous; prepared invite versus active Auth user; last admin preservation.
- Two concurrent browsers, private drafts, 409, lost response, retries, conflict resolution, saved revisions and changes typed during save.
- Parallel phases, shared milestones, orphan/missing control records, prerequisites, unfinished subtasks, archive, reopen, client approval freshness and no premature closeout.
- Task-change proposals **versus** completion approvals, stage order, fixed version, admin override, client privacy, return/supersession, comments/unread counts and notification deduplication.
- Timed deadlines, date-only deadlines, IANA timezone/DST, exact time thresholds for under-24-hour urgency, day rollover, hold/wait computation and baseline schedule preservation.
- Files/storage signed URLs, private notes, calendar deep links, task identity, user-facing error states, long labels, touch/keyboard, light/dark and 390/768/1280/1440 layouts.
- Email: recipient isolation, no leaked activation link, explicit send, failed-send retries, verified provider configuration and no auto-send merely by preparing a role.

---

## 8. Execution / decision log for future chats

**What is already live:** Production matches GitHub PR #29 as of this review. The current task authoring/permission/proposal/draft foundation exists; basic review controls exist; `Resend` configuration names are present. **Do not start by creating them again.**

**What the user wants next:** first make Tasks editor usable (blocker/service labels, Phase restricted to milestone editor, subtask access/context menu, hideable bars, avatar-only assignee, one-shot recent jump), and enable explicit staff invitation **email**. Then ordered completion approvals, versioned review/returns, schedule, extensions and review windows. Projects acceptance and later dashboard development follow.

**Questions resolved by requirement precedence:**

- **Production branch:** use current `restore`, not the historical `bivi-dashboard-overhaul` branch; the earlier “do not deploy restore” rule applied to historical unapproved work. Future implementations still use checked PR/production approval and verifications.
- **Task phase:** old R7 conceptual direct phase fallback is compatibility metadata, **not permission to keep an editable Phase selector in Tasks**; authoritative user interface for assigning phase is milestone editor.
- **Subtasks:** already have storage and an existing Add subtask UI: **repair guard/exposure, reuse endpoint**. No duplicate migration absent a proven defect.
- **Task-change approval vs completion approval:** first exists (PR #29); ordered, versioned completion stages remain separate future work.
- **Urgency:** overdue effective Urgent already exists; extend to rejected/return and short due-window without changing manually selected priority.
- **Meetings/operational status/phase states:** already exist; integrate/validate, do not build new replacement models.
- **Invitation:** prepared role or Auth link is **not a sent email**; no invitation is auto-sent.

**Still requiring actual user/engineering decisions only when reached:** authorized stage order where Bivi-owned work is Bivi-first; exact designated client approver behavior and reassignment; whether review SLA uses business or elapsed hours; official working calendar/holiday policy; blueprint defaults and versions; document/asset requirement types; external calendar integration and recipient privacy; unified forms/proposals navigation title. These decisions do not block Patch #30.

**Explicit limits of this audit:** Read-only inspection of remote GitHub, Vercel deployment and Supabase migration listing. No user's local git working tree, account login, production task mutation, live email delivery, provider domain verification, visual screenshot pass or full integration run was performed. Previously merged PR descriptions were used for past test evidence, not independently rerun here.

---

## 9. Copy/paste opening prompt for the next implementation chat

> Continue Bivi Projects using **`Bivi_Projects_Consolidated_Master_Plan_2026-10-30.md`** as the master roadmap, not the old R7/D1c plans. Repository `0445968/0011`; production branch `restore`; Supabase `xxnvekmbotzcyuhsyxbw`; production `staff.bivi.pro`. As of 30 October, deployed/merged PR #29 is `bff39ec15aed096efa6fca786a2d950cf72565d0`—verify the current HEAD rather than assuming it is unchanged. Read `AGENTS.md`, inspect current working tree, current component/API/SQL and migration ledger; note differing migration filename timestamps vs live versions. **Do not reimplement any feature listed DELIVERED.**
>
> Start with **Patch #30A task editor fixes** and bundle **#30B staff invitation email** if coherent and safely testable. Task fixes: clarify Blocker / Service reference; Phase choice exclusively in milestone editor; repair existing full-editor Add subtask permissions and expose it in task context menu; In Review/task-status bar visibility toggle via existing controls; avatar/assign-user only in assignee row; one-shot recent-task jump without scroll hijack. Preserve PR #29 creator/owning org/responsibility, task-change proposals and manager-vs-admin distinction; PR #28 atomic settings drafts and all saved draft/conflict/recovery behavior. Invite emails reuse existing `lib/communications/email.ts`, are **explicitly triggered only**, and never send to the prepared manager automatically. Tests + reviewed PR to `restore` + CI/Vercel Ready + exact SHA verification; signed-in workflows need actual authenticated testing, not preview claims. After each release update Delivered/Partial/Pending with PR, SHA, SQL ledger, tests and next slice. **Do not stop merely because the prior chat did not remember progress; inspect the current source and continue.** Do not assume successful terminal output must be pasted unless there is an error.

## 10. Release ledger template (append, never overwrite history)

| PR / date | Starting SHA → deployed SHA | Delivered or repaired (exactly) | Migration file → live ledger version | Automated evidence | Signed-in production acceptance | Remaining blocker / next |
|---|---|---|---|---|---|---|
| **#29 / 2026-10-30** | `915681f` → `bff39ec` | Task authority/proposals, manager roles, weekday-first dates | `20261030203102_task_authority_and_change_approvals` → `20261030203102` | PR reports 251 platform checks, typecheck, build, database checks | **Not independently verified** in this review | #30 task UX + explicit invite email; then ordered completion review |
| Next | *Record after release* | *Exact behavior* | *None, or actual migration* | *Commands/results* | *Pass/Fail/Not tested* | *Next concrete action* |

**End of master plan.**