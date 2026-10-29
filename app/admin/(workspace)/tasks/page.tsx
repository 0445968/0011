import {taskDateTimeLabel} from '@/lib/projects/task-timing';
import Link from 'next/link';
import { requireStaff } from '@/lib/admin/auth';
import { listMyTasks } from '@/lib/tasks/data';
import { taskHref } from '@/lib/tasks/links';
import { projectPhaseLabels } from '@/lib/projects/lifecycle-schema';
import { suggestedTaskPriority } from '@/lib/projects/workplan-views';
import {operationalStatusLabels,type OperationalStatus} from '@/lib/projects/operational-status';

const taskLabels = { todo: 'To do', doing: 'In progress', blocked: 'Blocked', done: 'Done' };

export default async function MyTasksPage({ searchParams: p }: { searchParams: Record<string, string | undefined> }) {
  const { client } = await requireStaff();
  const result = await listMyTasks(client, p);
  function href(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(p)) if (value) params.set(key, value);
    params.set('page', String(page));
    return `/tasks?${params}`;
  }

  return <div className="space-y-5 rounded-xl bg-white p-4 text-slate-950 dark:bg-background dark:text-foreground sm:p-6">
    <header>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold">My Tasks <span className="text-sm font-normal text-muted-foreground">{result.total} tasks</span></h1>
      <p className="mt-2 text-sm text-muted-foreground">Tasks assigned to your active staff account, including shared Bivi assignments. Open a task to update its status or due date using the existing project controls.</p>
      <p className="mt-2 text-xs text-muted-foreground">Due dates are calendar dates. Today: {result.today}.</p>
    </header>
    <form role="search" className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-3 dark:bg-card">
      <input name="q" aria-label="Search my tasks" defaultValue={p.q} placeholder="Task, project or project ID" className="h-11 min-w-[220px] flex-1 rounded border bg-background px-3" />
      <select aria-label="Task status" name="status" defaultValue={p.status || 'open'} className="rounded border bg-background px-3"><option value="open">Open tasks</option><option value="todo">To do</option><option value="doing">In progress</option><option value="blocked">Blocked or waiting</option><option value="done">Done</option><option value="all">All tasks</option></select>
      <select aria-label="Due date" name="due" defaultValue={p.due || ''} className="rounded border bg-background px-3"><option value="">All due dates</option><option value="overdue">Overdue</option><option value="today">Due today</option><option value="upcoming">Upcoming</option><option value="none">No due date</option></select>
      <select aria-label="Project operational status" name="project" defaultValue={p.project || ''} className="rounded border bg-background px-3"><option value="">Operational work (excludes inactive/completed)</option>{(['active','on_hold','waiting_on_client','inactive','completed'] as const).map(status=><option key={status} value={status}>{operationalStatusLabels[status]}</option>)}<option value="all">All operational statuses</option></select>
      <select aria-label="Lifecycle phase" name="phase" defaultValue={p.phase || ''} className="rounded border bg-background px-3"><option value="">All phases</option>{Object.entries(projectPhaseLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select aria-label="Sort tasks" name="sort" defaultValue={p.sort || 'due'} className="rounded border bg-background px-3"><option value="due">Due date</option><option value="project">Project</option><option value="title">Task title</option><option value="updated">Last modified</option></select>
      <select aria-label="Sort direction" name="direction" defaultValue={p.direction || 'asc'} className="rounded border bg-background px-3"><option value="asc">Ascending</option><option value="desc">Descending</option></select>
      <button type="submit" className="min-h-10 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-foreground dark:text-background">Apply filters</button><Link href="/tasks" className="inline-flex min-h-10 items-center rounded-lg border px-4 py-2 text-sm hover:bg-muted">Reset</Link>
    </form>
    <div className="overflow-x-auto rounded-xl border border-border bg-white dark:bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-slate-600 dark:bg-muted/40 dark:text-muted-foreground"><tr>{['Task', 'Project', 'Status', 'Priority', 'Start', 'Due', 'Phase', 'Assignment'].map(label => <th className="p-4 font-medium" key={label}>{label}</th>)}</tr></thead>
        <tbody>{result.rows.map(task => {
          const overdue = task.task_status !== 'done' && !!task.due_on && (task.due_at?Date.parse(task.due_at)<Date.parse(result.now):task.due_on<result.today);
          const suggested = suggestedTaskPriority(task.start_on, task.due_on, result.today, task.task_status === 'blocked');
          return <tr key={`${task.request_id}:${task.task_id}`} className="group border-b border-border/70 transition-colors hover:bg-slate-50 focus-within:bg-slate-50 last:border-0 dark:hover:bg-muted/40 dark:focus-within:bg-muted/40">
            <td className="p-4"><Link className="font-semibold text-slate-950 hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-foreground" href={taskHref(task.request_id, task.task_id)}>{task.title}</Link>{task.is_blocked && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{task.blocker_owner ? `Waiting on ${task.blocker_owner}` : task.depends_on ? 'Waiting on a task dependency' : 'Blocked'}</p>}</td>
            <td className="p-4"><Link href={`/projects/${task.request_id}`} className="hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">{task.project_title}</Link><p className="mt-1 font-mono text-xs text-muted-foreground">{task.project_public_id} · {operationalStatusLabels[task.operational_status as OperationalStatus]}</p></td>
            <td className="p-4">{taskLabels[task.task_status]}</td>
            <td className="p-4">{task.priority ? <span className={`rounded-full border px-2 py-1 text-xs capitalize ${task.priority==='urgent'?'border-red-300 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200':task.priority==='high'?'border-orange-300 bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-200':'border-border bg-muted/40'}`}>{task.priority}</span> : suggested ? <span className="rounded-full border border-border px-2 py-1 text-xs capitalize">Suggested {suggested}</span> : <span className="text-muted-foreground">Not set</span>}</td>
            <td className="p-4">{taskDateTimeLabel(task.start_on,task.start_time,task.time_zone) || 'Not scheduled'}</td>
            <td className="p-4"><span className={overdue ? 'text-red-600 dark:text-red-400' : ''}>{taskDateTimeLabel(task.due_on,task.due_time,task.time_zone) || 'No due date'}{overdue ? ' · Overdue' : ''}</span></td>
            <td className="p-4">{projectPhaseLabels[task.phase]}</td>
            <td className="p-4"><span>{task.assignee_count > 1 ? `You and ${task.assignee_count - 1} other${task.assignee_count === 2 ? '' : 's'}` : 'Assigned to you'}</span><Link className="ml-2 underline" href={taskHref(task.request_id, task.task_id)}>Task settings</Link></td>
          </tr>;
        })}</tbody>
      </table>
      {!result.rows.length && <p className="p-8 text-sm text-muted-foreground">No assigned tasks match. Staff assignment is explicit; existing owner text does not assign an account.</p>}
    </div>
    <nav aria-label="Task pagination" className="flex items-center gap-4 text-sm">{result.page > 1 && <Link href={href(result.page - 1)}>Previous</Link>}<span>Page {result.page} of {Math.max(1, Math.ceil(result.total / 25))}</span>{result.page * 25 < result.total && <Link href={href(result.page + 1)}>Next</Link>}</nav>
  </div>;
}
