export type ProjectSaveDomainError = {
  code: string;
  error: string;
  workflowGate?: {
    type: 'task'; taskId: string; targetStatus: 'done'; gate: 'client_completion_review';
    requirement: string; correctiveActions: string[];
  };
};

/** Database check violations are validation outcomes; only the RPC's explicit `conflict` is a revision conflict. */
export function classifyProjectSaveDatabaseError(code: string | undefined, message: string | undefined): ProjectSaveDomainError | null {
  if (code !== '23514') return null;
  const detail = (message ?? '').toLowerCase();
  if (detail.includes('task_removal_blocked|subtasks=')) {
    const taskId=(message??'').match(/task_removal_blocked\|subtasks=([^\s|]+)/i)?.[1];
    return {code:'task_removal_subtasks',error:`Remove or reassign the subtasks${taskId?` of task ${taskId}`:''} explicitly before removing the parent task.`};
  }
  if (detail.includes('task_removal_blocked|dependency=')) {
    const taskId=(message??'').match(/task_removal_blocked\|dependency=([^\s|]+)/i)?.[1];
    return {code:'task_removal_dependency',error:`Another task${taskId?` (${taskId})`:''} depends on this task. Change that dependency before removing it.`};
  }
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
  if (detail.includes('client_completion_review_required|task=')) {
    const taskId = (message ?? '').match(/client_completion_review_required\|task=([^\s|]+)/i)?.[1];
    return {
      code: 'client_completion_review_required',
      error: 'This client task needs a current Bivi completion review before it can be marked Done.',
      ...(taskId ? { workflowGate: {
        type: 'task' as const, taskId, targetStatus: 'done' as const, gate: 'client_completion_review' as const,
        requirement: 'A current accepted Bivi review of this task is required.',
        correctiveActions: ['Submit and accept a fresh client completion review.', 'A designated project workflow admin may override this review gate with a recorded reason.'],
      } } : {}),
    };
  }
  if(detail.includes('staff_task_review_required|task=')){
    const taskId=(message??'').match(/staff_task_review_required\|task=([^\s|]+)/i)?.[1];
    return {code:'staff_task_review_required',error:`${taskId?`Task ${taskId}`:'This task'} must enter In Review before it can be completed.`};
  }
  if(detail.includes('staff_task_review_admin_required|task=')){
    return {code:'staff_task_review_admin_required',error:'Only a workspace admin can reject a task from In Review.'};
  }
  if (detail.includes('client') && (detail.includes('approval') || detail.includes('review'))) {
    return { code: 'client_completion_review_required', error: 'Client task completion requires a current Bivi review.' };
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
