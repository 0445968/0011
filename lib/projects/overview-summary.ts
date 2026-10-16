import type { ProjectBody } from './schema';

/** Date-only deadlines are compared to the staff member's local calendar day. */
export function projectOverviewSummary(body: ProjectBody, today: string) {
  const openTasks = body.tasks.filter(task => task.status !== 'done').sort((a, b) =>
    (a.dueOn ?? '9999-12-31').localeCompare(b.dueOn ?? '9999-12-31') || a.title.localeCompare(b.title)
  );
  const milestones = [...body.milestones].sort((a, b) =>
    Number(a.status === 'done') - Number(b.status === 'done') ||
    (a.dueOn ?? '9999-12-31').localeCompare(b.dueOn ?? '9999-12-31') || a.title.localeCompare(b.title)
  );
  return {
    openTasks,
    milestones,
    done: body.tasks.length - openTasks.length,
    blocked: openTasks.filter(task => task.status === 'blocked').length,
    overdue: openTasks.filter(task => task.dueOn !== null && task.dueOn < today).length,
    dueToday: openTasks.filter(task => task.dueOn === today).length,
    milestoneDone: body.milestones.filter(milestone => milestone.status === 'done').length,
    nextDatedTask: openTasks.find(task => task.dueOn !== null) ?? null,
  };
}
