import Link from 'next/link';
import { requireStaff } from '@/lib/admin/auth';
import { listMyTasks } from '@/lib/tasks/data';
import { taskHref } from '@/lib/tasks/links';
import { projectPhaseLabels } from '@/lib/projects/lifecycle-schema';
import { suggestedTaskPriority } from '@/lib/projects/workplan-views';

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
  const zones = Array.from(new Set(['America/Chicago', 'America/Bogota', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'UTC', result.timezone]));

  return <div className="space-y-6">
    <header>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold">My Tasks <span className="text-sm font-normal text-muted-foreground">{result.total} tasks</span></h1>
      <p className="mt-2 text-sm text-muted-foreground">Tasks assigned to your active staff account, including shared Bivi assignments. Open a task to update its status or due date using the existing project controls.</p>
      <p className="mt-2 text-xs text-muted-foreground">Due dates are calendar dates. Today: {result.today} ({result.timezone}).</p>
    </header>
    <form className="flex flex-wrap gap-3">
      <input name="q" aria-label="Search my tasks" defaultValue={p.q} placeholder="Task, project or project ID" className="h-11 min-w-[220px] flex-1 rounded border bg-background px-3" />
      <select aria-label="Task status" name="status" defaultValue={p.status || 'open'} className="rounded border bg-background px-3"><option value="open">Open tasks</option><option value="todo">To do</option><option value="doing">In progress</option><option value="blocked">Blocked or waiting</option><option value="done">Done</option><option value="all">All tasks</option></select>
      <select aria-label="Due date" name="due" defaultValue={p.due || ''} className="rounded border bg-background px-3"><option value="">All due dates</option><option value="overdue">Overdue</option><option value="today">Due today</option><option value="upcoming">Upcoming</option><option value="none">No due date</option></select>
      <select aria-label="Project state" name="project" defaultValue={p.project || ''} className="rounded border bg-background px-3"><option value="">Active / on-hold projects</option><option value="active">Active projects</option><option value="on_hold">On-hold projects</option><option value="completed">Completed projects</option><option value="all">All project states</option></select>
      <select aria-label="Lifecycle phase" name="phase" defaultValue={p.phase || ''} className="rounded border bg-background px-3"><option value="">All phases</option>{Object.entries(projectPhaseLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select aria-label="Timezone for due filters" name="tz" defaultValue={result.timezone} className="rounded border bg-background px-3">{zones.map(zone => <option key={zone}>{zone}</option>)}</select>
      <select aria-label="Sort tasks" name="sort" defaultValue={p.sort || 'due'} className="rounded border bg-background px-3"><option value="due">Due date</option><option value="project">Project</option><option value="title">Task title</option><option value="updated">Last modified</option></select>
      <select aria-label="Sort direction" name="direction" defaultValue={p.direction || 'asc'} className="rounded border bg-background px-3"><option value="asc">Ascending</option><option value="desc">Descending</option></select>
      <button className="rounded bg-foreground px-4 py-2 text-background">Apply filters</button><Link href="/tasks" className="rounded border px-4 py-2 text-sm">Reset</Link>
    </form>
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/40"><tr>{['Task', 'Project', 'Status', 'Priority', 'Start', 'Due', 'Phase', 'Assignment'].map(label => <th className="p-4 font-medium" key={label}>{label}</th>)}</tr></thead>
        <tbody>{result.rows.map(task => {
          const overdue = task.task_status !== 'done' && !!task.due_on && task.due_on < result.today;
          const suggested = suggestedTaskPriority(task.start_on, task.due_on, result.today, task.task_status === 'blocked');
          return <tr key={`${task.request_id}:${task.task_id}`} className="border-b last:border-0">
            <td className="p-4"><Link className="font-semibold hover:underline" href={taskHref(task.request_id, task.task_id)}>{task.title}</Link>{task.is_blocked && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{task.blocker_owner ? `Waiting on ${task.blocker_owner}` : task.depends_on ? 'Waiting on a task dependency' : 'Blocked'}</p>}</td>
            <td className="p-4"><Link href={`/projects/${task.request_id}`} className="underline">{task.project_title}</Link><p className="mt-1 font-mono text-xs text-muted-foreground">{task.project_public_id} · {task.project_state.replaceAll('_', ' ')}</p></td>
            <td className="p-4">{taskLabels[task.task_status]}</td>
            <td className="p-4">{task.priority ? <span className={`rounded-full border px-2 py-1 text-xs capitalize ${task.priority==='urgent'?'border-red-300 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200':task.priority==='high'?'border-orange-300 bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-200':'border-border bg-muted/40'}`}>{task.priority}</span> : suggested ? <span className="rounded-full border border-border px-2 py-1 text-xs capitalize">Suggested {suggested}</span> : <span className="text-muted-foreground">Not set</span>}</td>
            <td className="p-4">{task.start_on || 'Not scheduled'}</td>
            <td className="p-4"><span className={overdue ? 'text-red-600 dark:text-red-400' : ''}>{task.due_on || 'No due date'}{overdue ? ' · Overdue' : ''}</span></td>
            <td className="p-4">{projectPhaseLabels[task.phase]}</td>
            <td className="p-4"><span>{task.assignee_count > 1 ? `You and ${task.assignee_count - 1} other${task.assignee_count === 2 ? '' : 's'}` : 'Assigned to you'}</span><Link className="ml-2 underline" href={taskHref(task.request_id, task.task_id, 'lifecycle')}>Task settings</Link></td>
          </tr>;
        })}</tbody>
      </table>
      {!result.rows.length && <p className="p-8 text-sm text-muted-foreground">No assigned tasks match. Staff assignment is explicit; existing owner text does not assign an account.</p>}
    </div>
    <div className="flex gap-4 text-sm">{result.page > 1 && <Link href={href(result.page - 1)}>Previous</Link>}<span>Page {result.page} of {Math.max(1, Math.ceil(result.total / 25))}</span>{result.page * 25 < result.total && <Link href={href(result.page + 1)}>Next</Link>}</div>
  </div>;
}
