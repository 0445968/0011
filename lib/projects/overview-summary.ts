import type { ProjectBody } from './schema';
import { distinctById, taskMetrics } from './metrics';

/** Date-only deadlines are compared to the staff member's local calendar day. */
export function projectOverviewSummary(body: ProjectBody, today: string) {
  const metrics=taskMetrics(body.tasks,today);
  const openTasks = distinctById(body.tasks).filter(task => task.status !== 'done').sort((a, b) =>
    (a.dueOn ?? '9999-12-31').localeCompare(b.dueOn ?? '9999-12-31') || a.title.localeCompare(b.title)
  );
  const milestones = [...body.milestones].sort((a, b) =>
    Number(a.status === 'done') - Number(b.status === 'done') ||
    (a.dueOn ?? '9999-12-31').localeCompare(b.dueOn ?? '9999-12-31') || a.title.localeCompare(b.title)
  );
  return {
    openTasks,
    milestones,
    done: metrics.done,
    blocked: metrics.blocked,
    overdue: metrics.overdue,
    dueToday: metrics.dueToday,
    milestoneDone: body.milestones.filter(milestone => milestone.status === 'done').length,
    nextDatedTask: openTasks.find(task => task.dueOn !== null) ?? null,
  };
}
