# Bivi Release 3C — Approvals, Change Requests, QA & Handoff

Base commit: `bb7dfa6d84e42652e9bd1f69c752cbd4e81e6d46`

## Purpose

Migration 013 adds the final structured delivery controls required for the Release 3 launch flow:

- version-specific deliverable approvals and revision rounds
- client/Bivi change requests with evaluation, impact proposal, client decision and application
- required QA checklist
- final release gate
- client receipt confirmation
- handoff checklist
- support dates and terms
- project closeout gate

Progress updates remain separate from deliverable approval. A client approving a news/progress update does not approve a deliverable.

## Apply

1. Confirm migrations 001–012 are already installed.
2. Apply only:

   `supabase/migrations/202610110013_project_approvals_changes_qa_handoff.sql`

3. Run locally:

   ```bash
   npm run typecheck
   npm run verify:platform
   npm run build
   ```

4. Deploy the branch and test with one staff account, one authorized client approver, and one client viewer.

## Required dry run

1. Open an activated project with an approved brief.
2. Add a deliverable and issue version 1.
3. Confirm the viewer can see it but cannot approve it.
4. As the approver, request changes on version 1.
5. Confirm Bivi can issue version 2 / revision round 2.
6. Approve version 2.
7. Submit a client change request.
8. In staff workspace, evaluate it and send an impact proposal with scope, schedule and cost impact.
9. Accept the proposal as the authorized client.
10. Mark the accepted change as applied in staff workspace.
11. Complete or waive all required QA checks with evidence where appropriate.
12. Confirm moving to Delivery fails before the above conditions are satisfied and succeeds after they are satisfied.
13. Release final work.
14. Confirm only an authorized approver can acknowledge receipt.
15. Complete/waive required handoff items.
16. Record support terms, support dates when applicable, and closeout summary.
17. Move to Handoff and complete the project.
18. Confirm completion is rejected if receipt/handoff/support closeout is missing.

## Security checks

- A client assigned to another project must not see these deliverables, changes, QA, handoff or closeout records.
- A normal client viewer can create a change request, but cannot approve deliverables, decide impact proposals, or acknowledge final receipt unless `can_review=true`.
- Clients cannot modify QA or handoff checklist state.
- Clients cannot mark an accepted change as applied.
- Direct table writes remain unavailable to normal client accounts.

## Gate behavior

### Delivery

Advancing the lifecycle into Delivery requires:

- at least one project deliverable
- latest version of every approval-required deliverable approved
- all required QA checks passed or explicitly waived
- no change request in Requested, Evaluating, Proposed or Accepted state

### Handoff

Advancing into Handoff additionally requires the final work to have been released.

### Project completion

Project completion additionally requires:

- client receipt confirmation
- every required handoff item complete or waived
- support terms recorded
- closeout summary recorded
- staff closeout recorded

Existing project task/milestone completion requirements remain in force.

## Next release

After 3C is activated and verified, Release 3D should attach essential email notices and deadline reminders to these now-stable workflow events.
