export type ProjectSaveDomainError = {
  code: string;
  error: string;
};

/** Database check violations are validation outcomes; only the RPC's explicit `conflict` is a revision conflict. */
export function classifyProjectSaveDatabaseError(code: string | undefined, message: string | undefined): ProjectSaveDomainError | null {
  if (code !== '23514') return null;
  const detail = (message ?? '').toLowerCase();
  if (detail.includes('parent task') || detail.includes('unfinished subtasks')) {
    return {code:'task_subtasks_incomplete',error:'Complete unfinished subtasks before completing the parent task. Reopen the parent task before adding or reopening subtasks.'};
  }
  if (detail.includes('applicable tasks')) {
    return {code:'phase_tasks_incomplete',error:'Complete every task and subtask associated with this phase before closing it.'};
  }
  if (detail.includes('deliverable approvals') || detail.includes('handoff closeout')) {
    return {code:'phase_approvals_incomplete',error:'Resolve required deliverable approvals, QA, change requests and handoff closeout in Delivery before closing this phase.'};
  }
  if (detail.includes('dependency')) {
    return { code: 'task_dependencies_incomplete', error: 'Complete prerequisite tasks and resolve blockers before completing this work.' };
  }
  if (detail.includes('client') && (detail.includes('approval') || detail.includes('review'))) {
    return { code: 'client_completion_review_required', error: 'Client task completion requires a current Bivi review. Reopen unreviewed completed work, then submit and accept a fresh completion review.' };
  }
  if (detail.includes('completed milestone')) {
    return { code: 'milestone_reopen_required', error: 'Reopen the completed milestone before changing its tasks.' };
  }
  if (detail.includes('completed phase')) {
    return { code: 'phase_reopen_required', error: 'Reopen the completed phase before starting its tasks.' };
  }
  if (detail.includes('task control')) {
    return { code: 'task_control_missing', error: 'Task setup needs repair before this work can be saved. Save new tasks before completing them. Review missing controls and their intended ownership and phase explicitly.' };
  }
  if (detail.includes('milestone') && (detail.includes('task') || detail.includes('subtask'))) {
    return { code: 'milestone_tasks_incomplete', error: 'Complete these tasks before completing this milestone.' };
  }
  return { code: 'validation_rejected', error: 'The project save failed a task, milestone, or phase rule. Review the work plan and try again.' };
}
