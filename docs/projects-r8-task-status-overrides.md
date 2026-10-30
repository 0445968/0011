# R8 follow-up 1 — task-status validation and workflow overrides

## Confirmed defect

`guard_project_work_integrity` originally iterated every candidate task and rechecked the client completion-review gate for each task whose candidate status was `done`. The Tasks & Milestones editor submits a full work-plan body, so an unchanged historical client task could reject a status change to an unrelated Bivi task. The database also treated any accepted completion response after the last reopen as current, even when that task's submitted work or its own task-control revision had changed.

The fix compares each task in the submitted candidate with its saved task. Completion gates run for a changed task or project completion; unchanged legacy completed work remains visible for repair but does not veto unrelated writes. Review freshness compares the accepted request baseline against the current candidate task (excluding the deliberate todo/in-progress → Done transition) and a snapshot of completion-relevant controls. Project title, priority, assignment metadata and other unrelated project fields do not alter that baseline. Ownership, phase, dependency and blocker changes remain relevant; completed client tasks must be reopened before those controls change.

## Supported override

The single gate supported here is **current Bivi completion review required** while changing one client-owned task to Done. The normal save reports the task ID, requirement, next steps and whether the signed-in user has the explicit override capability. A designated admin may enter a non-empty reason and choose **Override and change status** once.

The targeted RPC locks the project and task, checks project revision, task ownership, project state, subtasks, blockers, dependency and phase eligibility, then changes only that task's status. The RPC records an immutable override event with actor, reason, timestamp, before/after task data and the exact gate. It does not write or alter a client response, accepted review, approval, sibling task, milestone, phase or project operational state.

`project_task_work_versions` advances only when that task's saved body changes. An override remains valid for that exact task snapshot/version and completion-relevant control snapshot. Reopening or editing the task advances its version; the old override remains in the audit trail but cannot authorize a later completion. Existing Bivi review records remain distinct and are never fabricated.

### Authorization

The active/inactive staff membership remains distinct from workspace-admin authority. Migration `20261023181806_r8_task_status_validation_overrides.sql` added a service-managed admin capability table. Migration `20261030161430_staff_task_review_and_roles.sql` bootstraps the sole active staff account as the initial workspace admin only when exactly one active account exists; multiple-account installations still require trusted designation. The first admin can invite or activate a second account and manage admin access from Settings. Admin eligibility is evaluated through `is_project_workflow_admin`; regular staff cannot grant themselves permission. The production project had exactly one active staff account, so that account was safely bootstrapped as the initial admin. Migration `20261023182352_r8_relevant_review_freshness.sql` records completion-relevant control snapshots so assignment/priority metadata does not stale approvals while ownership, phase, dependency and blocker changes do. Completed client-task controls can be changed only after the task is reopened; repairing an absent control row does not complete or approve work.

Provision an explicitly verified admin from a trusted database administration context after confirming their staff identity:

```sql
insert into public.project_workflow_override_admins(user_id, granted_by)
select s.user_id, auth.uid()
from public.inquiry_staff s
where s.user_id = '<verified-staff-user-uuid>' and s.active
on conflict (user_id) do nothing;
```

This statement is an operator runbook example; it is not executed by the application or this migration.

## Pending request slices

- **Manual Requests:** no automatic task-triggered request creation; admin-authored outbound requests for incomplete client tasks; admin recording of externally received inbound requests with provenance; subject, description, links, permission-bounded files and project contacts; My Tasks/team assignment/existing-work linking that preserves request access; duplicate-task prevention; explicit completion/review policy and reasoned admin override.
- **Publishing:** individual request publication or explicit inclusion in an update; publication lists requests and linked tasks; exact client-visible preview including attachments; immutable versions and duplicate notification protection; publication status remains distinct from verified delivery.
- **Client portal:** manual submission, responses, attachments and staff decisions; approval-required preference for inbound requests; portal visibility and notifications. Requests remain empty until a real request is entered.

## Verification and acceptance

Behavior/database coverage is in `tests/platform/project-r8-workflow-overrides.test.mjs`. Automated checks prove source-level/database behavior in local PGlite. They do not prove authenticated browser behavior or cross-account live authorization. The active Supabase project has one active staff account and no pre-existing admin role; the new capability is intentionally unassigned until the account is explicitly verified and provisioned by a trusted operator.
