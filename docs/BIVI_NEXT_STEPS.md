# Bivi — Next Development Steps / Cross-Computer Handoff

**Read with:** [Master Plan](./BIVI_MASTER_PLAN.md) and [Release & Progress Log](./BIVI_PROGRESS.md).  
**Status checked:** 2026-10-30. **Last verified functional release:** merged [PR #29](https://github.com/0445968/0011/pull/29), `restore` `bff39ec15aed096efa6fca786a2d950cf72565d0`; Vercel `staff.bivi.pro` READY at the same SHA; Supabase task-authority migration in live ledger. **This snapshot becomes historical after any newer release.**  
**CURRENT GOAL:** Finish the Project **Tasks** page and its usability before expanding completion reviews and scheduling.  
**NEXT SUBSTANTIVE PATCH:** Task-editor fixes; staff invitation email can be bundled if coherent. **Do not assume a PR number** (a docs-only tracking PR may consume #30).

## First actions in every new chat / on any computer

1. Read `AGENTS.md` and all three `docs/BIVI_*.md` trackers. Latest explicit user instructions override superseded proposals; retain historical scope as acceptance criteria.
2. Fetch current GitHub `restore` HEAD and merged PRs since last log; compare code paths before touching anything. Do not use the historical `bivi-dashboard-overhaul` or pilot patch as the baseline.
3. If working on user's local computer, run `git status --short`, review diffs, protect uncommitted changes and identify current branch. Remote GitHub inspection **cannot** see unsaved files on the user's other computer. Never reset/clean/stash without explicit direction.
4. Read current task components, APIs, actual migration list and installed database objects. Compare migration **names and effects**, not just timestamps, and verify relevant existing automated tests.
5. Classify each request **Delivered / Repair / Pending / Unverified** in the log before coding. Extend established stores and flows; never implement a duplicate version of an existing feature.
6. Implement coherent slice, add focused tests, run `npm run typecheck`, `npm run verify:platform`, `npm run build`, review/PR to `restore` and check Vercel Ready before merge/release. Production-only signed-in flows still need authenticated acceptance.
7. Update progress, next steps, actual SHA and any migrations as part of the release. Do not leave the tracker claiming an unverified behavior is live.

## Priority A — Task editor usability (next implementation)

**Inspect and repair, rather than rebuilding:**

- `components/admin/projects/TaskDraftControlSettings.tsx`: Remove editable **Phase** from Task settings; phase assignment belongs to **milestone view/editor**. Keep legacy phase metadata compatible with existing RPCs/filters; audit readers and writers first. Reword enum `blockerOwner` as organization waiting on (Bivi/Client/External), distinguish `dependsOn` prerequisite, clarify optional `serviceId` as service/request reference.
- `components/admin/projects/ProjectMilestoneBoardV2.tsx`: Existing full editor and `addSubtask` operation already exist. Diagnose disabled creation (loaded hierarchy, draft state, rights from PR #29, parent status, limits, API failures) and show the real reason. Add **Add subtask** to existing `taskActions(task)` right-click/hover menu and route it into the **same** operation. Keep milestone editor and server-side authorization. No second subtask store.
- Task status/ **In Review** group visibility: reuse existing workspace-bar toggles and per-user persistence; when hidden, keep reviews discoverable through filtering/Approvals. Do not create a competing toolbar configuration.
- Assignee row: remove only the unwanted three-line icon. Show verified avatars or an accessible assign-user icon when no assignees; keep assignment available and multi-assignee data authoritative.
- Recent task list: selecting an off-screen or filtered recent task must reveal it, focus and scroll **once**, then stop automatic scrolling during unrelated updates/manual scroll. Preserve deep links and multiple-task navigation.
- Preserve docked/resizable editor, scoped Save task/Save all, private draft and recovery, combined control sidecars, change proposals, creator/owning organization/responsibility, archived tasks, approval gates, client privacy and audit evidence.
- Test task context menu, edit permissions/admin vs manager/staff/client, 409/uncertain writes, dirty draft behavior, narrow widths and light/dark. Do not claim authenticated production acceptance unless exercised.

## Priority B — Explicit staff invitation email (after/with A)

- Inspect `app/api/admin/workspace/staff/route.ts`, `components/admin/settings/StaffAccessSettings.tsx` and `lib/communications/email.ts`. Current “invite” creates private link but **does not send email**.
- Add a deliberate **Send staff invitation** action via the existing Resend sender and configured transactional style. Reconcile Auth creation, reserved role, failure/retry/idempotency/expiration, recipient isolation and provider acceptance.
- Production Vercel environment has `RESEND_API_KEY`, `BIVI_EMAIL_FROM`, `BIVI_EMAIL_REPLY_TO` variable entries, but this is **not proof** the provider/domain works; do not expose values.
- **Never auto-invite the prepared project manager**, run a test send to their address, or treat a prepared role as an active staff member. User must explicitly choose the send in the completed signed-in UI. Preserve the last active admin and manager≠admin rule.

## Next after A/B — workflow in order

1. **Ordered completion approvals:** staff/Bivi/client stages, admin-chosen order and designated reviewer, immutable submitted task version, atomic In Review plus request, reasoned/admin-only override, no early Done.
2. **Review return/resubmit:** required comments, fixed version, supersession, per-organization return display, unread marker, returned/rejected effective urgency while retaining base priority.
3. **Planning/scheduling:** template phase dates, 5/15/30/45-minute and hourly effort, 1–16-hour workday, selected 1–7 workdays/week, timezone/holidays/capacity/dependencies; preview then approve baseline. Early actual starts never silently reset due dates.
4. **Deadline extensions:** proposed later date + reason + review; old approved due date stays until accepted; late completion allowed.
5. **Client review windows, holds, reminders, resume impacts:** reuse R8 status; 24/48/72/custom hours; avoid duplicate waits and no invented effort.
6. **Cross-page acceptance:** Overview, Phases, My Tasks, shared/project calendars, client views, Approvals, Brief, Activity; check timezones and multi-assignees. Mobile/light/dark and role regression acceptance.
7. **Later workspace features:** asset requirements vs deliverables; personal to-do lists; broader dashboard redesign after Projects signoff.

## Production release checklist (current workflow)

- Use a **new branch based on latest `restore`**, no unreviewed direct commits to production.
- Database change: compare current code/remote objects/ledger, add only a necessary forward migration; verify any production SQL against project `xxnvekmbotzcyuhsyxbw`. Migration filename and actual applied version may differ.
- Run `npm run typecheck`, `npm run verify:platform`, `npm run build` and targeted behavior/SQL tests.
- Open PR, ensure checks and Vercel preview pass; merge in the established checked flow. Preview readiness **does not** imply staff authenticated UI works.
- Inspect production deployment: SHA must match new `restore`, state READY, alias `staff.bivi.pro`, protected staff route responds as expected. Do not claim signed-in actions verified without an authenticated session.
- Report: PR/link, merged and deployment SHA, exact behavior delivered, migrations, test totals, user-manual acceptance status, remaining issues and next item. Update [BIVI_PROGRESS.md](./BIVI_PROGRESS.md) and this file.

## New chat opening message (copy/paste)

> Continue Bivi development directly from GitHub repository `0445968/0011`. **First read `AGENTS.md`, `docs/BIVI_MASTER_PLAN.md`, `docs/BIVI_PROGRESS.md` and `docs/BIVI_NEXT_STEPS.md` on the latest `restore` branch.** Inspect current merged PRs, actual source, working tree if available, Supabase migrations/installed functions and Vercel deployment. Mark changes already present as delivered and do not rebuild them. Implement the next substantive Tasks page slice, use the existing hierarchy/draft/approval architecture and release through the checked PR→CI→Vercel→merge workflow. Preserve admin roles, no automatic invitation email, permissions, audit and private drafts. Update the trackers after verification. I only need to share failed command output or decisions that genuinely require me.

## After finishing each patch, update here

| Field | Required entry |
| --- | --- |
| Last verified functional PR/SHA | GitHub PR, exact `restore` and production deployment SHA |
| Last checked Supabase | Migration names / recorded remote versions or “no new SQL” |
| Delivered in latest slice | Specific behaviors, evidence; no duplicate implementation |
| Still broken/unverified | Actual issues and missing acceptance |
| Next substantive slice | **One** actionable scope with files, constraints and definition of done |
| User action needed | Only truly necessary credentials/role decisions or signed-in acceptance; never invent it |

**No production code, migration, role or email was changed merely by creating these tracking documents.**
