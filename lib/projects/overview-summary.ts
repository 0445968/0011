import {compareTaskDeadlines,type DeadlineContext} from './deadlines';
import type { ProjectBody } from './schema';
import { distinctById, taskMetrics } from './metrics';

/** Saved deadlines share the viewer's calendar day and exact instants for timed tasks. */
export function projectOverviewSummary(body: ProjectBody, today: string,context?:Omit<DeadlineContext,'today'>) {
  const metrics=taskMetrics(body.tasks,today,context);
  const openTasks = distinctById(body.tasks).filter(task => !task.archived&&task.status !== 'done').sort((a, b) =>
    compareTaskDeadlines(a,b,context?.timezone) || a.title.localeCompare(b.title)
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
