# R4d — Client response and review rollout

1. Apply R4b (034) and R4c (035) migrations; confirm active task assignment and parallel phase statuses. Patch 036 is **not standalone**.
2. Apply patch 036. It renames the old direct-completion RPC, revokes execution, and creates a client-safe wrapper that accepts only non-completion updates. Do not undo migration 036 merely by reverting application code: the authorization changes belong at the database boundary.
3. Verify active, verified organization members with client tasks can submit requests; Bivi staff can review and set conditional decline guidance. Completed tasks must remain uncompleted until staff approval.
4. Verify pending request uniqueness, submitted/reviewed history, rejected response recovery, stale project revision 409, and no cross-project/client-account leakage.
5. Before adding client manager self-delegation: implement explicit organization-owner authorization for manager designation and scoped member reassignments; ensure task assignment edits are audit logged.
6. Before adding richer Activity: unify response events, phase history and saved task diffs into a server-authored event stream, not client-written labels. Include communications later via transactional queue dispatch.
