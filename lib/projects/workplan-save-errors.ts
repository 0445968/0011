export type ProjectSaveDomainError = {
  code: string;
  error: string;
};

/** Database check violations are validation outcomes; only the RPC's explicit `conflict` is a revision conflict. */
export function classifyProjectSaveDatabaseError(code: string | undefined, message: string | undefined): ProjectSaveDomainError | null {
  if (code !== '23514') return null;
  const detail = (message ?? '').toLowerCase();
  if (detail.includes('dependency')) {
    return { code: 'task_dependencies_incomplete', error: 'Complete prerequisite tasks and resolve blockers before completing this milestone.' };
  }
  if (detail.includes('client') && (detail.includes('approval') || detail.includes('review'))) {
    return { code: 'client_completion_review_required', error: 'Approve the client task completion before completing this milestone.' };
  }
  if (detail.includes('completed milestone')) {
    return { code: 'milestone_reopen_required', error: 'Reopen the completed milestone before changing its tasks.' };
  }
  if (detail.includes('completed phase')) {
    return { code: 'phase_reopen_required', error: 'Reopen the completed phase before starting its tasks.' };
  }
  if (detail.includes('task control')) {
    return { code: 'task_control_missing', error: 'Task setup needs repair before this milestone can be completed. Refresh the hierarchy and contact an administrator if it continues.' };
  }
  if (detail.includes('milestone') && (detail.includes('task') || detail.includes('subtask'))) {
    return { code: 'milestone_tasks_incomplete', error: 'Complete these tasks before completing this milestone.' };
  }
  return { code: 'validation_rejected', error: 'The project save failed a task, milestone, or phase rule. Review the work plan and try again.' };
}
