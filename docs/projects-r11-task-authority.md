# R11 — task authority, proposed changes and manager roles

Task origin now records creator and owning organization independently of responsibility. Existing projects are enrolled; application-created projects enroll on activation. Trusted imported records without an activation actor require explicit trusted enrollment. Client-owned work remains visible to its client when Bivi becomes responsible.

Assigned members can progress permitted tasks. Requirement changes and new tasks proposed by eligible creators, client managers or Bivi project managers remain unpublished until an admin accepts them in Approvals. Admins retain direct editing and review authority. Database guards cover the canonical work plan and settings sidecars, including direct RPC calls. Immutable proposal versions compare task and settings revisions before acceptance; unrelated task changes do not invalidate a proposal. Rejection requires a comment. Sanitized client receipts never disclose internal snapshots or settings.

Submission receipts recover a lost response and distinguish submitted proposals from published changes. Acknowledging a submission removes only its draft version and preserves newer typing. Existing private draft recovery and completion-review gates remain in place.

Workspace staff settings separate project-manager coordination from admin authority. The last active admin cannot be removed. Prepared invitations apply their role when the staff account is enrolled. Production role setup keeps crafterkite@gmail.com as admin and adds project manager; yulda@execs.com has a prepared project-manager invitation role. Yulda has no Auth account yet: an authenticated admin must create the invitation link in Staff access. No invitation email was sent.

Task date columns use one text run, with optional weekday first: `Mon, 09 Nov 2026 11:00 PM`. Weekday, date and time share typography. Timezone remains opt-in.

Migration `20261030203102_task_authority_and_change_approvals.sql` is applied to production. Typecheck, production build and all 251 platform checks pass, including database authorization, proposal privacy, atomic acceptance, revision conflicts, Auth cleanup and draft submission recovery.

Next: unified ordered completion approvals, submitted-version snapshots, return/rejection and admin override flows, followed by scheduling, extension requests and client review windows described in R10. This release does not replace those completion flows with the broader requested approval model. Subtask structural edits remain admin operations; assigned subtask progress retains its existing explicit operation.
