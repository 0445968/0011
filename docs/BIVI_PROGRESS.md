# Bivi — Development Progress & Release Ledger

**Purpose:** Durable, cross-computer record of what actually shipped, what was only tested in code, and what remains to accept. Do not rebuild already-delivered features. Updated at every release together with `BIVI_NEXT_STEPS.md`.  
**Initial verified snapshot:** 2026-10-30, `restore` at `bff39ec15aed096efa6fca786a2d950cf72565d0` (merged PR #29).  
**Authoritative work plan:** [BIVI_MASTER_PLAN.md](./BIVI_MASTER_PLAN.md). **Current handoff:** [BIVI_NEXT_STEPS.md](./BIVI_NEXT_STEPS.md).

## 1. Evidence and status policy

- **DELIVERED — code:** feature exists in merged `restore` code; a matching production deployment must be verified separately.
- **DELIVERED — tested:** specify the actual environment, command or signed-in scenario, result and date. CI, isolated database tests and authenticated production UI acceptance are **different** evidence.
- **PARTIAL / REPAIR:** working foundation exists but requested behavior is missing, broken or confusing; extend the canonical implementation, never duplicate the data model.
- **PENDING:** not implemented or not verified to exist; audit source before adding.
- **DEFERRED:** still part of approved requirements but later in sequence.
- **UNVERIFIED:** evidence insufficient. Never translate this into either “done” or “broken.”
- User-observed behavior takes precedence over an automated test's narrower success claim.

At the beginning of every implementation: fetch current `restore` and merged PRs since the last entry, inspect any local uncommitted changes (if available), current source, applicable tests, Supabase **live** migration ledger and deployed database objects, and Vercel SHA. Append evidence to this file **after** verified work. Never silently reset the local tree.

## 2. Verified baseline on 2026-10-30

| Surface | Verified | Limitation |
| --- | --- | --- |
| GitHub production branch | `restore` HEAD `bff39ec15aed096efa6fca786a2d950cf72565d0`; PR #29 merged | This value is historical after the next merge |
| Vercel | Deployment `dpl_67pJJq3sJgdBpovPVhnQ1rdJtD4F` READY, alias `staff.bivi.pro`, exact PR #29 SHA | Signed-in staff Tasks flow was **not** manually verified |
| Supabase | Project `xxnvekmbotzcyuhsyxbw` migration listing includes `20261030203102_task_authority_and_change_approvals` | Migration history is not signed-in feature acceptance |
| Email configuration | Vercel production has environment variable entries `RESEND_API_KEY`, `BIVI_EMAIL_FROM`, `BIVI_EMAIL_REPLY_TO` | No credentials read; provider/domain/send/inbox delivery unverified |
| Invitations | Staff access prepares Supabase Auth invite link for copying | No invitation email sent; prepared-role record is not an active Auth account |
| Source review | Inspected task board, task-setting component, staff invitation route and existing mail sender | User's original computer's working tree inaccessible remotely |

**Migration identity pitfall:** The live ledger sometimes uses a different version timestamp than the repository file with the same migration name (e.g. `project_timezone_and_task_tag_catalog` and `task_review_status_validation`, plus earlier R7B/color entries). Compare **name, installed function/trigger schema, dependencies and behavior** before deciding SQL is missing. Never replay old R7A–R11 or PR #29 migrations based on filename mismatch.

## 3. Implemented feature registry — do not reimplement

| Code delivered | Evidence | What remains |
| --- | --- | --- |
| Compact Projects structure and directory, dedicated Phases, parallel active phases, milestones and subtasks, multi-assignees, ownership and task productivity | R1–R7 docs, current components and SQL | Signed-in multi-account regression testing |
| R7A phase status/save and reconciliation; R7B hierarchy completion and metrics; R7C shared editing; R7D Overview; R7E requests/notifications/project meetings; R7G visual components | `docs/projects-r7*.md`, corresponding migrations | R7F end-to-end acceptance and light/dark/device visual QA; do not recreate these foundations |
| Operational project status Active/On hold/Waiting on client/Inactive, explicit closeout and overrides | R8 docs and migrations | Confirm coherent UI and no unauthorized override |
| Docked, resizable full editor and Chrome-like multi-task/workspace tabs | PR #5, #8, #20 | Preserve resize, tab persistence, pin/bookmark and links |
| Task table columns, grouping, filters, selection, bulk actions, menus, ordering, multi-view milestone drag/drop | PR #7–11, #18–19 | Fix precise usability problems rather than rebuild toolbar |
| Brief owns Project state & decisions, Activation snapshot and Project history | PR #12 | Do not restore duplicate panels to Tasks |
| Explicit Save task/Save all, private drafts, recovery, discard, lost-response receipts and conflict checks | PR #13–15, #23, #28 | Keep draft and immediate mutation boundaries clear |
| Task start/due with time/timezone, cross-calendar/My Tasks projection, native picker and display options | PR #15–17, #26, #29 | Future **capacity/dependency schedule generation** is separate |
| Context menu rename/duplicate/move/link/share; dedicated task tabs; archive/restore | PR #19–21 | Add **Add subtask** context action using existing hierarchy operation |
| Overdue effective urgency without overwriting manual priority | PR #22–23 | Extend to returned/rejected work with under-24-hour rule |
| Session warning/renewal and safe navigation | PR #24–25 | Regression checks only |
| Project tag catalog, colors, project timezone and weekday-first date option | PR #26, #29 | Do not add second tag/timezone store |
| Initial staff/client review flags, In Review/Rejected status, Staff access and Auth link generation | PR #27 | **Ordered completion approvals and actual invitation emails pending** |
| Atomic combined task/settings draft saves; task reviewing does not auto-complete milestone | PR #28 | Preserve combined revision checks |
| Creator vs owning organization vs responsible side, proposed task changes in Approvals, separate project-manager role | PR #29; `docs/projects-r11-task-authority.md` | **Completion** approvals are distinct and not delivered by these change proposals |

### Specific unresolved source findings (2026-10-30)

1. `components/admin/projects/TaskDraftControlSettings.tsx` still presents editable **Phase**, **Blocker owner** (organization enum), and **Service reference**. Phase assignment should be editable only in milestone view/editor; clarify the other two labels without deleting saved data.
2. `components/admin/projects/ProjectMilestoneBoardV2.tsx` already contains `addSubtask` and full-editor **Add subtask**, but availability depends on sidecar/hierarchy permissions, loaded state and other guards. Investigate why the user cannot add a subtask and reuse the same operation for the task right-click menu. No second subtask table.
3. The recent-task selection effect can call `scrollIntoView` on state changes; make one explicit jump per deliberate selection, then release manual scrolling. Keep deep links.
4. `app/api/admin/workspace/staff/route.ts` generates Auth invite links; `StaffAccessSettings.tsx` displays copy link; sending through `lib/communications/email.ts` is not present in that route.
5. Hiding In Review/task-status group with the existing workspace bar settings and simplifying the assignee row still need source/behavior changes.

## 4. Outstanding work, in dependency order

| Priority | Status | Work | Evidence needed before calling done |
| --- | --- | --- | --- |
| 1 | PARTIAL / REPAIR | Task-editor labels and phase restriction; fix existing Add subtask permissions; context-menu subtask action; hideable task-status/In Review strip; avatar/assign-user control; one-shot recent navigation | Focused UI + authorization tests and authenticated acceptance |
| 2 | PENDING | Explicit staff invitation emails via existing Resend sender and prepared-role/Auth flow; safe retry and accurate provider state | Provider acceptance + real opt-in send, no test email to prepared manager |
| 3 | PENDING | Ordered Bivi/client completion stages, designated approvers, version-atomic In Review submission and reasoned admin overrides | Matrix for each role, stage order, authorization, stale revisions, no premature Done |
| 4 | PENDING | Versioned review replacements/returns, required comments, per-org projected state, unread indicator, rejected/returned urgency | Supersession, privacy, comments and notification tests |
| 5 | PENDING | Phase template scheduling, effort/workday capacity, dependency and baseline forecast preview | Deterministic schedule/timezone/cycle tests and approval |
| 6 | PENDING | Deadline extension requests and completion after due date | Existing deadline remains until approval; audit |
| 7 | PENDING | Client review windows, holds, reminders, resumption and schedule impact | Correct clock semantics, no duplicate delay/time or false deliverability |
| 8 | PARTIAL / UNVERIFIED | Project cross-page R7F and visual R7G acceptance; repair specific discrepancies | Signed-in multi-role checks at multiple widths |
| 9 | DEFERRED | Asset requirements vs deliverables; personal to-do lists; wider workspace UX | Separate scoped roadmap after Projects completion |

Older `R7`/`R8` labels are **historical phase names**; do not schedule all of their implementation again. Candidate patch numbers in old blueprints are planning labels, not reserved GitHub PR numbers.

## 5. Current release evidence (append-only)

| PR / date | Source → final production SHA | Delivered | DB change (repository name → actual ledger version) | Checks | Signed-in production acceptance | Next |
| --- | --- | --- | --- | --- | --- | --- |
| [#29](https://github.com/0445968/0011/pull/29) / 2026-10-30 | `915681f` → `bff39ec` | Task ownership/creation and change proposals; managers; optional weekday-first dates | `20261030203102_task_authority_and_change_approvals` → `20261030203102` | PR reports typecheck, build, 251 platform checks and database regressions | **Not tested** in signed-in browser by this audit | Task editor usability; staff email invitation; ordered completion approval |
| Documentation setup [#30](https://github.com/0445968/0011/pull/30) / 2026-10-30 | Documentation branch `bivi-persistent-dev-tracking-20261030`; verify merged SHA once deployed | Documentation only, no task/DB behavior | None | GitHub diff and CI if available | Not applicable | Next substantive task patch |

**The documentation-only PR is #30. It is not the task-editor feature patch and does not alter any application feature status.**

**Append a row after every release** with actual PR, merged/deployed SHA, tests and user acceptance. Keep prior entries; only update this snapshot header when a new known release baseline is verified. A documentation-only release must never be marked as delivering planned application features.

## 6. Non-negotiable protections

- Never remove the currently active workspace administrator or silently elevate project manager to admin.
- The prepared team/project-manager role is **not an Auth account**. Do not create/send/resend invitations without the user's deliberate signed-in UI action.
- Never leak private drafts, internal notes, staff email invitation tokens or cross-client content. Keep RLS, staff/client organization boundaries and audited permissions.
- Milestones, phases, project execution and operational status use their **existing** authoritative stores. No duplicate task, meeting, deadline or review store.
- Review stages and proposed task changes are separate workflows. No old review can approve changed work.
- Successful CI does not prove authenticated product behavior. Report code delivered vs automated test vs user acceptance separately.
- Production is `restore` and user tests signed-in admin through production (Preview does not expose their authenticated portal); always verify exact Vercel SHA and Ready before treating a release as live.
- Bundle small UI tweaks into a substantive patch unless the user requests a separate patch. Do not ask the user to paste successful terminal output.

## 7. Required after-merge update checklist

1. Refresh `restore` SHA, merged PR evidence, Supabase ledger/installed functions (if SQL), and matching Vercel production Ready deployment.
2. Move only **verified** features from outstanding to delivered; keep user-reported unresolved behaviors explicitly PARTIAL.
3. Record migration filename **and** actual applied version, or “none.” Never infer production SQL applied from a Git commit.
4. Record commands and whether signed-in checks occurred. Distinguish provider accepted email vs actual inbox delivery.
5. Set exactly one next substantive work slice in [BIVI_NEXT_STEPS.md](./BIVI_NEXT_STEPS.md).
6. Commit both tracking updates as part of the same tested release, or in an explicitly linked follow-up if deployment evidence becomes available only afterward. Do not fabricate a completed check.
