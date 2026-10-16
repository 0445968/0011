import type { ProjectBody } from './schema';
import { projectPhaseOrder, type ProjectPhase } from './lifecycle-schema';
import type { ProjectHierarchyResponse } from './hierarchy-schema';

type Milestone = ProjectBody['milestones'][number];
type Task = ProjectBody['tasks'][number];
type Subtask = ProjectHierarchyResponse['subtasks'][number];

export type MilestoneGroup = {
  phase: ProjectPhase | null;
  milestones: Milestone[];
};

/** Multi-phase milestones display once, in their first canonical phase; all assigned phases remain visible on the card. */
export function groupMilestones(body: ProjectBody, links: ProjectHierarchyResponse['milestonePhases']): MilestoneGroup[] {
  const buckets = new Map<ProjectPhase | null, Milestone[]>();
  for (const milestone of body.milestones) {
    const phases = projectPhaseOrder.filter(phase => links.some(link => link.milestoneId === milestone.id && link.phase === phase));
    const primary = phases[0] ?? null;
    buckets.set(primary, [...(buckets.get(primary) ?? []), milestone]);
  }
  return [...projectPhaseOrder, null].filter(phase => buckets.has(phase)).map(phase => ({phase, milestones: buckets.get(phase)!}));
}

export function milestoneWork(body: ProjectBody, milestoneId: string, subtasks: Subtask[]) {
  const tasks = body.tasks.filter(task => task.milestoneId === milestoneId);
  const attached = subtasks.filter(subtask => tasks.some(task => task.id === subtask.taskId));
  const taskDone = tasks.filter(task => task.status === 'done').length;
  const subtaskDone = attached.filter(subtask => subtask.status === 'done').length;
  return {
    tasks,
    subtasks: attached,
    taskDone,
    subtaskDone,
    allTasksDone: tasks.length > 0 && taskDone === tasks.length,
    taskPercent: tasks.length ? Math.round((100 * taskDone) / tasks.length) : null,
  };
}

export function unassignedTasks(body: ProjectBody): Task[] {
  return body.tasks.filter(task => !task.milestoneId || !body.milestones.some(milestone => milestone.id === task.milestoneId));
}
