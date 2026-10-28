import type { ProjectBody } from './schema';

type Task = ProjectBody['tasks'][number];

/**
 * The order of body.tasks is the project's canonical manual completion order.
 * Milestone columns are a different presentation of that same ordered list.
 *
 * This function never changes a task's status, owner, dates or dependencies.
 * It returns the original body for invalid or unchanged requests.
 */
export function reorderProjectTasks(
  body: ProjectBody,
  taskId: string,
  destinationMilestoneId: string | null,
  overTaskId: string | null,
  position: 'before' | 'after' | 'end' = 'end',
): ProjectBody {
  const moving = body.tasks.find(task => task.id === taskId);
  if (!moving) return body;

  const sourceMilestone = body.milestones.find(m => m.id === moving.milestoneId);
  const destinationMilestone = body.milestones.find(m => m.id === destinationMilestoneId);
  if (destinationMilestoneId !== null && !destinationMilestone) return body;

  // A completed milestone must be reopened through the lifecycle review,
  // rather than edited implicitly by a drag.
  if (sourceMilestone?.status === 'done' || destinationMilestone?.status === 'done') return body;
  if (overTaskId === taskId) return body;

  const overTask = overTaskId === null ? null : body.tasks.find(task => task.id === overTaskId);
  if (overTaskId !== null && (!overTask || overTask.milestoneId !== destinationMilestoneId)) return body;

  const milestoneIds = body.milestones.map(m => m.id);
  const groups = new Map<string | null, Task[]>([...milestoneIds, null].map(id => [id, []]));
  for (const task of body.tasks) {
    if (task.id === taskId) continue;
    // Preserve legacy tasks with missing milestones rather than silently losing them.
    if (!groups.has(task.milestoneId)) groups.set(task.milestoneId, []);
    groups.get(task.milestoneId)!.push(task);
  }

  const destination = groups.get(destinationMilestoneId);
  if (!destination) return body;
  const inserted: Task = moving.milestoneId === destinationMilestoneId
    ? moving : { ...moving, milestoneId: destinationMilestoneId };
  const overIndex = overTaskId === null ? -1 : destination.findIndex(task => task.id === overTaskId);
  if (overTaskId !== null && overIndex < 0) return body;
  const insertionIndex = overIndex < 0 ? destination.length : overIndex + (position === 'after' ? 1 : 0);
  destination.splice(insertionIndex, 0, inserted);

  // All task groups now follow the project's milestone order, with unassigned
  // tasks last. This keeps manual order consistent between Milestones and Table.
  const next = [...groups.values()].flat();
  if (next.length !== body.tasks.length) return body;
  const unchanged = next.every((task, index) =>
    task.id === body.tasks[index].id && task.milestoneId === body.tasks[index].milestoneId);
  return unchanged ? body : { ...body, tasks: next };
}
