import type { Priority, Status, Task, Subtask } from '@/data/demos/kanban';
import { priorityOrder, statusMeta } from '@/data/demos/kanban';

// --- Date formatting ---

export function formatDueDate(iso: string | null): string {
  if (!iso) return 'No due date';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDueDateLong(iso: string | null): string {
  if (!iso) return 'No due date';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function relativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date('2026-08-22T10:00:00');
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// --- Due date state ---

export type DueState = 'overdue' | 'today' | 'upcoming' | 'none';

export function getDueState(iso: string | null, status: Status): DueState {
  if (!iso) return 'none';
  if (status === 'done') return 'none';
  const today = new Date('2026-08-22T00:00:00');
  const due = new Date(iso + 'T00:00:00');
  const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  return 'upcoming';
}

// --- Progress / stats ---

export function subtaskProgress(subtasks: Subtask[]): { done: number; total: number; pct: number } {
  const total = subtasks.length;
  const done = subtasks.filter((s) => s.done).length;
  return { done, total, pct: total > 0 ? (done / total) * 100 : 0 };
}

export function projectProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === 'done').length;
  return Math.round((done / tasks.length) * 100);
}

export function projectStats(tasks: Task[]) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const review = tasks.filter((t) => t.status === 'review').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const backlog = tasks.filter((t) => t.status === 'backlog').length;
  const overdue = tasks.filter((t) => getDueState(t.dueDate, t.status) === 'overdue').length;
  return { total, done, inProgress, review, todo, backlog, overdue, pct: projectProgress(tasks) };
}

// --- Priority helpers ---

export function priorityRank(p: Priority): number {
  return priorityOrder.indexOf(p);
}

// --- Filtering ---

export interface Filters {
  assigneeId: string | null;
  priority: Priority | null;
  labelId: string | null;
  status: Status | null;
  dueState: DueState | null;
  myTasks: boolean;
}

export const emptyFilters: Filters = {
  assigneeId: null,
  priority: null,
  labelId: null,
  status: null,
  dueState: null,
  myTasks: false,
};

export function activeFilterCount(f: Filters): number {
  let count = 0;
  if (f.assigneeId) count++;
  if (f.priority) count++;
  if (f.labelId) count++;
  if (f.status) count++;
  if (f.dueState) count++;
  if (f.myTasks) count++;
  return count;
}

export function matchFilters(task: Task, filters: Filters, currentUserId: string): boolean {
  if (filters.assigneeId && !task.assigneeIds.includes(filters.assigneeId)) return false;
  if (filters.priority && task.priority !== filters.priority) return false;
  if (filters.labelId && !task.labelIds.includes(filters.labelId)) return false;
  if (filters.status && task.status !== filters.status) return false;
  if (filters.dueState && getDueState(task.dueDate, task.status) !== filters.dueState) return false;
  if (filters.myTasks && !task.assigneeIds.includes(currentUserId)) return false;
  return true;
}

export function matchSearch(task: Task, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (task.title.toLowerCase().includes(q)) return true;
  if (task.description.toLowerCase().includes(q)) return true;
  // Check label names via labelIds — handled by caller via label map
  return false;
}

// --- Sorting ---

export type SortKey = 'manual' | 'priority' | 'dueDate' | 'updated';

export function sortTasks(tasks: Task[], sort: SortKey): Task[] {
  const arr = [...tasks];
  switch (sort) {
    case 'priority':
      arr.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
      break;
    case 'dueDate':
      arr.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
      break;
    case 'updated':
      arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      break;
    case 'manual':
    default:
      arr.sort((a, b) => a.order - b.order);
      break;
  }
  return arr;
}

// --- Grouping by status ---

export function tasksByStatus(tasks: Task[]): Record<Status, Task[]> {
  const groups: Record<Status, Task[]> = {
    'backlog': [],
    'todo': [],
    'in-progress': [],
    'review': [],
    'done': [],
  };
  for (const t of tasks) groups[t.status].push(t);
  for (const key of Object.keys(groups) as Status[]) {
    groups[key].sort((a, b) => a.order - b.order);
  }
  return groups;
}

export function statusLabel(s: Status): string {
  return statusMeta[s].label;
}
