import type { ProjectBody } from './schema';

export type CompletionSubtask = { id: string; taskId: string; title: string; status: string };
export type MilestoneTaskBlocker = {
  taskId: string;
  title: string;
  taskIncomplete: boolean;
  subtasks: { id: string; title: string }[];
};
export type MilestoneCompletionBlockers = {
  milestoneId: string;
  milestoneTitle: string;
  needsTask: boolean;
  tasks: MilestoneTaskBlocker[];
};

export function milestoneCompletionBlockers(
  body: ProjectBody,
  milestoneId: string,
  subtasks: CompletionSubtask[],
): MilestoneCompletionBlockers {
  const milestone = body.milestones.find(item => item.id === milestoneId);
  const tasks = body.tasks.filter(task => task.milestoneId === milestoneId).flatMap(task => {
    const unfinished = subtasks.filter(item => item.taskId === task.id && item.status !== 'done');
    const taskIncomplete = task.status !== 'done';
    return taskIncomplete || unfinished.length
      ? [{ taskId: task.id, title: task.title+(task.archived?' (Archived — restore to complete)':''), taskIncomplete, subtasks: unfinished.map(item => ({ id: item.id, title: item.title })) }]
      : [];
  });
  return { milestoneId, milestoneTitle: milestone?.title ?? 'Milestone', needsTask: !body.tasks.some(task => task.milestoneId === milestoneId), tasks };
}

export function hasMilestoneCompletionBlockers(blockers: MilestoneCompletionBlockers) {
  return blockers.needsTask || blockers.tasks.length > 0;
}
