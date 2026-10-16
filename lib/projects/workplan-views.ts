import type { ProjectBody } from './schema';

export type WorkplanView = 'tasks' | 'milestones' | 'phases';
export type WorkStatus = 'todo' | 'doing' | 'blocked' | 'done';
export type MilestoneStatus = 'planned' | 'in_progress' | 'done';

export const workStatusOrder: WorkStatus[] = ['todo', 'doing', 'blocked', 'done'];
export const milestoneStatusOrder: MilestoneStatus[] = ['planned', 'in_progress', 'done'];

export function nextStatus<T extends string>(status: T, order: readonly T[]): T {
  const current = order.indexOf(status);
  return order[(current + 1) % order.length] ?? order[0] ?? status;
}

/** Date-only deadlines: compare calendar dates without locale-dependent timestamps. */
export function daysRemaining(dueOn: string | null, today: string): number | null {
  if (!dueOn || !/^\d{4}-\d{2}-\d{2}$/.test(dueOn) || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return null;
  const end = Date.parse(`${dueOn}T12:00:00Z`);
  const start = Date.parse(`${today}T12:00:00Z`);
  if (!Number.isFinite(end) || !Number.isFinite(start)) return null;
  return Math.round((end - start) / 86400000);
}

export function remainingLabel(days: number | null) {
  if (days === null) return 'No deadline';
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  return `${days}d left`;
}

export function milestoneStats(body: ProjectBody, milestoneId: string) {
  const tasks = body.tasks.filter(task => task.milestoneId === milestoneId);
  const done = tasks.filter(task => task.status === 'done').length;
  return { total: tasks.length, done, percent: tasks.length ? Math.round(done / tasks.length * 100) : null,
    readyForReview: tasks.length > 0 && done === tasks.length };
}
