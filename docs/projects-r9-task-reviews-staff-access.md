# R9 — task review settings and basic staff access

## Task review behavior

- Workspace admins can set review requirements on saved tasks. Bivi-owned tasks can require an internal Bivi review; client-owned tasks require accepted client completion review by default. Admins can update these settings while the task is open.
- When a task with internal review required is set to Completed by staff, the work-plan draft changes it to In Review. Save all persists that state, and the In Review tab appears while such tasks are active. Only a workspace admin can move an In Review task to Completed or Rejected; the database enforces this for direct API writes too.
- Client-owned task completion continues to use the existing submitted-and-accepted review gate. The client review requirement can be configured on the task. The targeted admin completion override remains reasoned and audited.
- Review settings are revision-checked and changes are recorded in `project_task_review_policy_history`. Accepted client review freshness includes the client review requirement; existing review snapshots are migrated without making them stale solely because the field was added.
- `in_review` and `rejected` are accepted in saved and private-draft work plans. In Review appears only while tasks are active there.

## Staff access

- Workspace admin authority remains separate from active staff membership.
- If exactly one active staff account exists at migration time, it becomes the initial workspace admin. An installation with multiple staff accounts is not auto-promoted.
- Workspace admins can invite a new email address or activate an existing Auth account, change admin roles, and deactivate accounts from Settings. Invites create a regular staff account and display a private setup link; no email is sent by this feature.
- The last active workspace admin cannot be removed or deactivated. Staff role changes are recorded in `staff_workspace_role_history`.
- A second test staff account must be created with an email address; new invitations remain regular staff by default.

## Recovery after blocked saves

- A review-gate validation leaves work-plan drafts intact. It no longer forces the editor to jump to the blocked task, and the warning can be dismissed so filtering and unrelated edits continue.
- An uncertain assignee write triggers an authoritative assignment refresh before retry. Retry is enabled only after saved member data reloads successfully.

## Migrations

- `20261030161430_staff_task_review_and_roles.sql`
- `20261030171500_task_review_status_validation.sql`

Both migrations are applied in production.
