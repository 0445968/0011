# Bivi R4c/R4d: Phase completion feedback hotfix

- Explains completion blockers **inside the modal**, including names of unfinished linked milestones and active/blocked linked tasks. Backend errors stay visible in the modal, not behind it.
- An active phase with **no linked milestones** can now be manually completed if it has no active tasks. This requires migration `202610160037_phase_completion_feedback.sql`.
- A phase with unfinished linked milestones or active work **cannot** be marked completed. The staff member must complete/review the milestones and resolve in-progress or blocked tasks, or correct the links. A planning phase must first be activated.
- Keeps independent phases, milestone statuses, activity history and review approvals intact. No status change is automatically inferred from clicking Confirm.
- Patch does not change the abort cleanup hook; apply the separate `bivi-r4c-phase-abort-fix.patch` if that error still occurs.

Run `npm run typecheck && npm run verify:platform && npm run build`, then deploy/test as staff. Test completing a phase with 0 milestones, a phase with 1 unfinished milestone, a phase with active tasks, and a fully completed phase. Verify that closing an unrelated phase does not modify other phase records.
