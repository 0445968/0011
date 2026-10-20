# R4d — Client task requests and staff review

Requires migrations 001–035 and `202610160036_project_client_task_responses.sql`. It depends on the multi-assignee R4b and parallel-phase R4c changes being applied, validated, and migrated first.

- Client actions: submit completion evidence for staff approval, request clarification, request postponement, request modification, and optionally decline a task. The client cannot delete or mark staff-assigned work completed directly.
- Default decline permission is off. Bivi staff can enable it task-by-task with at least 15 characters of risk and contribution guidance. A client must explain a decline and see the warning in a Radix dialog.
- Requests require project access **and** verified organization membership plus task assignment, project-manager designation, or a legacy unassigned-client-task fallback. The fallback avoids locking existing clients out of their previously accessible tasks.
- Requests are append-only (one pending per task). Staff can accept/reject, record comments, and approve completion through a project-revision-checked RPC. Accepting clarification/postponement/modification/decline acknowledges the request only; it does NOT change any task date, scope, or project state automatically.
- Direct client `done` writes via the legacy RPC are blocked at the database boundary; the old function is renamed and execute permission revoked. The guarded wrapper retains client `todo`/`doing` and note edits for backward compatibility.
- Response history is retained per project and shown to eligible staff, with client users able to read only their own responses. No browser `alert` or `confirm` is used. No direct client writes to policy, project task responses, or project records.
- R5c/R5d add staff-verified organization ownership, owner-managed project managers, manager task delegation, and client-created tasks through separate audited and revision-checked APIs. R4d does not automatically send email; notification delivery should use the existing Bivi communications queue in a future patch.
- The work-plan Save All and draft autosave controls remain untouched. Client requests and staff reviews are separate deliberate server transactions. Approving completion increments the canonical project revision, so open work-plan drafts may require reconciliation.

## Live QA checklist

1. Apply migration 036 **after** 034–035. Confirm RLS and RPC grants from client/staff/anonymous sessions.
2. Client with verified project membership opens task, submits completion with evidence. Task remains In progress until a staff member accepts.
3. Staff accepts completion: task becomes Done and milestone synchronization takes effect. Verify project history and response audit.
4. Reject a client completion: task does not become Done. Submit a new request after rejection.
5. Client tries decline when disabled or with insufficient explanation: reject in UI and RPC. Staff enables decline with guidance; verify risk dialog and recorded response.
6. Client submits clarification/postponement/modification: no automatic task status, date, or scope mutation.
7. Unassigned staff user and unrelated-company client cannot access/submit; direct calls to legacy renamed RPC must fail. Two concurrent reviews do not double-complete.
8. Open two staff work-plan tabs. Approving completion in one must cause revision conflict/reconciliation in the other, never silent overwrite.
