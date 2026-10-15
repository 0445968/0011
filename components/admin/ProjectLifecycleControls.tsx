'use client';
import {TaskAssignee} from './tasks/TaskAssignee';
import {taskDomId} from '@/lib/tasks/links';
import { useWorkspaceUnsavedChanges } from './workspace/WorkspaceNavigationGuard';

import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  History,
  RotateCcw,
  Save,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ProjectBody } from '@/lib/projects/schema';
import {
  projectPhaseLabels,
  projectPhaseOrder,
  type ProjectPhase,
  type ProjectTaskControl,
} from '@/lib/projects/lifecycle-schema';

type ProjectTask = ProjectBody['tasks'][number];
type OwnershipFilter = 'all' | 'bivi' | 'client';
type PhaseFilter = 'all' | 'current';

type Lifecycle = {
  requestId: string;
  phase: ProjectPhase;
  revision: number;
  updatedAt: string;
};

type Event = {
  id: number;
  task_id: string;
  action: string;
  snapshot: Record<string, unknown>;
  created_at: string;
};

type TaskEntry = {
  task: ProjectTask;
  control: ProjectTaskControl;
};

const PAGE_SIZE = 10;

const fieldClass =
  'h-9 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-60';

const subtleButton =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-muted px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50';

function CompactSelect({
  label,
  value,
  onChange,
  children,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="relative min-w-0">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={`${fieldClass} appearance-none pr-9`}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

/* =========================================================
   TASK CONTROL ROW
   Each task saves independently using its own revision.
   ========================================================= */

function TaskControlRow({
  id,
  task,
  control,
  allTasks,
  expanded,
  onToggle,
}: {
  id: string;
  task: ProjectTask;
  control: ProjectTaskControl;
  allTasks: ProjectTask[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const [ownerType, setOwnerType] = useState(control.ownerType);
  const [phase, setPhase] = useState(control.phase);
  const [serviceId, setServiceId] = useState(control.serviceId ?? '');
  const [dependsOn, setDependsOn] = useState(control.dependsOn ?? '');
  const [blockerOwner, setBlockerOwner] = useState(control.blockerOwner ?? '');
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [message, setMessage] = useState('');

  const dirty =
    ownerType !== control.ownerType ||
    phase !== control.phase ||
    serviceId.trim() !== (control.serviceId ?? '') ||
    dependsOn !== (control.dependsOn ?? '') ||
    blockerOwner !== (control.blockerOwner ?? '');

  const markWorkspaceSaved = useWorkspaceUnsavedChanges(dirty, 'Task settings', save);

  const hasSecondarySettings = Boolean(
    control.dependsOn || control.blockerOwner ||
    control.serviceId || control.clientNote
  );

  async function save() {
    if (!dirty || busy || blocked) return;
    setBusy(true);
    setMessage('');

    try {
      const response = await fetch(
        `/api/admin/projects/${id}/lifecycle`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_task',
            taskId: task.id,
            expectedRevision: control.revision,
            ownerType,
            phase,
            serviceId: serviceId.trim() || null,
            dependsOn: dependsOn || null,
            blockerOwner: blockerOwner || null,
          }),
          signal: AbortSignal.timeout(20000),
        }
      );

      const result = await response.json().catch(() => null);
      if (response.status === 401) {
        window.location.assign('/admin/login');
        return;
      }
      if (response.status === 409) setBlocked(true);
      if (!response.ok || result?.saved !== true) {
        throw new Error(result?.error || 'Task controls could not be saved.');
      }
      markWorkspaceSaved(); window.location.reload();
    } catch (error) {
      if (error instanceof Error &&
          ['TimeoutError', 'TypeError', 'SyntaxError'].includes(error.name)) {
        setBlocked(true);
      }
      setMessage(
        error instanceof Error
          ? error.message
          : 'The result could not be confirmed. Reload before retrying.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Fragment>
      <tr id={taskDomId(task.id,'lifecycle')} tabIndex={-1} style={{scrollMarginTop:'6rem'}} className={expanded ? 'bg-muted/50' : 'hover:bg-muted/30'}>
        <td className="max-w-[290px] px-3 py-2.5 align-middle">
          <p className="truncate text-xs font-semibold" title={task.title}>
            {task.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="capitalize">{task.status.replace('_', ' ')}</span>
            <span aria-hidden="true">·</span>
            <span>{task.dueOn || 'No due date'}</span>
            {task.status === 'blocked' && (
              <span className="font-medium text-red-600 dark:text-red-400">
                · Blocked
              </span>
            )}
          </div>
        </td>

        <td className="px-3 py-2.5 align-middle">
          <CompactSelect
            label={`Responsibility for ${task.title}`}
            value={ownerType}
            disabled={busy || blocked}
            onChange={(value) => setOwnerType(value as 'bivi' | 'client')}
          >
            <option value="bivi">Bivi</option>
            <option value="client">Client</option>
          </CompactSelect>
        </td>

        <td className="px-3 py-2.5 align-middle"><TaskAssignee projectId={id} taskId={task.id} revision={control.revision} assignedId={control.assignedStaffId} label={control.assignedStaffLabel} disabled={control.ownerType==='client'||busy||blocked}/></td>
        <td className="px-3 py-2.5 align-middle">
          <CompactSelect
            label={`Lifecycle phase for ${task.title}`}
            value={phase}
            disabled={busy || blocked}
            onChange={(value) => setPhase(value as ProjectPhase)}
          >
            {projectPhaseOrder.map((value) => (
              <option key={value} value={value}>
                {projectPhaseLabels[value]}
              </option>
            ))}
          </CompactSelect>
        </td>

        <td className="px-3 py-2.5 align-middle text-xs text-muted-foreground">
          {blockerOwner ? `Waiting on ${blockerOwner}` :
            dependsOn ? 'Task dependency' : '—'}
        </td>

        <td className="px-3 py-2.5 align-middle">
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => void save()}
              disabled={!dirty || busy || blocked}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                dirty
                  ? 'bg-foreground text-background hover:opacity-85'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Save size={13} />
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              title={expanded ? 'Hide additional settings' : 'Show additional settings'}
              aria-label={`${expanded ? 'Hide' : 'Show'} settings for ${task.title}`}
              aria-expanded={expanded}
              aria-controls={`lifecycle-task-${task.id}`}
              onClick={onToggle}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground hover:bg-accent"
            >
              <ChevronRight
                size={15}
                className={expanded ? 'rotate-90 transition-transform' : 'transition-transform'}
              />
              <span className="sr-only">{hasSecondarySettings ? 'Settings' : 'More'}</span>
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td
            id={`lifecycle-task-${task.id}`}
            colSpan={6}
            className="bg-muted/30 px-4 py-4"
          >
            <div className="grid gap-3 md:grid-cols-3">
              <label className="block min-w-0 text-[11px] font-medium text-muted-foreground">
                Blocked by task
                <div className="mt-1.5">
                  <CompactSelect
                    label={`Task dependency for ${task.title}`}
                    value={dependsOn}
                    disabled={busy || blocked}
                    onChange={setDependsOn}
                  >
                    <option value="">No task dependency</option>
                    {allTasks
                      .filter((candidate) => candidate.id !== task.id)
                      .map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.title}
                        </option>
                      ))}
                  </CompactSelect>
                </div>
              </label>

              <label className="block min-w-0 text-[11px] font-medium text-muted-foreground">
                Waiting on
                <div className="mt-1.5">
                  <CompactSelect
                    label={`Waiting on for ${task.title}`}
                    value={blockerOwner}
                    disabled={busy || blocked}
                    onChange={setBlockerOwner}
                  >
                    <option value="">No explicit blocker</option>
                    <option value="bivi">Bivi</option>
                    <option value="client">Client</option>
                    <option value="external">External party</option>
                  </CompactSelect>
                </div>
              </label>

              <label className="block min-w-0 text-[11px] font-medium text-muted-foreground">
                Service ID
                <Input
                  maxLength={100}
                  value={serviceId}
                  disabled={busy || blocked}
                  onChange={(event) => setServiceId(event.target.value)}
                  placeholder="Optional service link"
                  className={`${fieldClass} mt-1.5`}
                />
              </label>
            </div>

            {control.clientNote && (
              <div className="mt-3 rounded-lg bg-card px-3 py-2.5">
                <p className="text-[11px] font-semibold">Client note</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-xs text-muted-foreground">
                  {control.clientNote}
                </p>
              </div>
            )}

            <p className="mt-3 text-[11px] text-muted-foreground">
              Task-control revision {control.revision}. Save changes for this task
              before switching pages or filters.
            </p>
            {message && (
              <p role="status" className="mt-2 text-xs text-red-600 dark:text-red-400">
                {message}
              </p>
            )}
            {blocked && (
              <button
                type="button"
                className={`${subtleButton} mt-3`}
                onClick={() => window.location.reload()}
              >
                <RotateCcw size={14} /> Reload latest task
              </button>
            )}
          </td>
        </tr>
      )}

      {!expanded && message && (
        <tr>
          <td colSpan={6} className="px-4 pb-2 text-xs text-red-600 dark:text-red-400">
            {message}{' '}
            {blocked && (
              <button
                type="button"
                className="underline underline-offset-4"
                onClick={() => window.location.reload()}
              >
                Reload
              </button>
            )}
          </td>
        </tr>
      )}
    </Fragment>
  );
}

/* =========================================================
   MAIN LIFECYCLE WORKSPACE
   ========================================================= */

export function ProjectLifecycleControls({
  id,
  lifecycle,
  controls,
  tasks,
  events,
  selectedTask,
}: {
  id: string;
  lifecycle: Lifecycle;
  controls: ProjectTaskControl[];
  tasks: ProjectTask[];
  events: Event[];
  selectedTask?:string;
}) {
  const [phase, setPhase] = useState<ProjectPhase>(lifecycle.phase);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [message, setMessage] = useState('');

  const [query, setQuery] = useState('');
  const [ownership, setOwnership] = useState<OwnershipFilter>('all');
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('all');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const controlByTask = useMemo(
    () => new Map(controls.map((control) => [control.taskId, control])),
    [controls]
  );

  const entries = useMemo<TaskEntry[]>(
    () => tasks.flatMap((task) => {
      const control = controlByTask.get(task.id);
      return control ? [{ task, control }] : [];
    }),
    [tasks, controlByTask]
  );

  const current = entries.filter(
    (entry) => entry.control.phase === lifecycle.phase && entry.task.status !== 'done'
  );
  const waitingClient = current.filter((entry) => entry.control.ownerType === 'client').length;
  const waitingBivi = current.filter((entry) => entry.control.ownerType === 'bivi').length;
  const blockedCount = entries.filter((entry) => entry.task.status === 'blocked').length;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return entries.filter(({ task, control }) =>
      (ownership === 'all' || control.ownerType === ownership) &&
      (phaseFilter === 'all' || control.phase === lifecycle.phase) &&
      (!term || [task.title, task.owner, task.status, control.serviceId ?? '']
        .some((value) => value.toLowerCase().includes(term)))
    );
  }, [entries, ownership, phaseFilter, lifecycle.phase, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  useEffect(()=>{if(!selectedTask)return;const index=entries.findIndex(entry=>entry.task.id===selectedTask);if(index<0)return;setQuery('');setOwnership('all');setPhaseFilter('all');setPage(Math.floor(index/PAGE_SIZE)+1);setExpandedId(selectedTask);},[selectedTask,entries]);
  useEffect(()=>{if(selectedTask&&expandedId===selectedTask){const row=document.getElementById(taskDomId(selectedTask,'lifecycle'));row?.focus({preventScroll:true});row?.scrollIntoView({block:'start'});}},[selectedTask,expandedId,page]);
  const phaseIndex = projectPhaseOrder.indexOf(lifecycle.phase);
  const phaseChanged = phase !== lifecycle.phase;

  async function savePhase() {
    if (!phaseChanged || !reason.trim() || busy || blocked) {
      setMessage('Select a new phase and provide a reason.');
      return;
    }
    setBusy(true);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/projects/${id}/lifecycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_phase',
          expectedRevision: lifecycle.revision,
          phase,
          reason,
        }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json().catch(() => null);
      if (response.status === 401) {
        window.location.assign('/admin/login');
        return;
      }
      if (response.status === 409) setBlocked(true);
      if (!response.ok || result?.saved !== true) {
        throw new Error(result?.error || 'The project phase could not be saved.');
      }
      window.location.reload();
    } catch (error) {
      if (error instanceof Error &&
          ['TimeoutError', 'TypeError', 'SyntaxError'].includes(error.name)) {
        setBlocked(true);
      }
      setMessage(error instanceof Error
        ? error.message
        : 'The result could not be confirmed. Reload before retrying.');
    } finally {
      setBusy(false);
    }
  }

  function changeFilter(fn: () => void) {
    fn();
    setPage(1);
    setExpandedId(null);
  }

  return (
    <div className="space-y-4">
      {/* CURRENT PHASE / STATUS */}
      <section className="rounded-xl bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Project lifecycle
            </p>
            <h2 className="mt-1 font-heading text-lg font-semibold sm:text-xl">
              {projectPhaseLabels[lifecycle.phase]}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Phase {phaseIndex + 1} of {projectPhaseOrder.length} · Revision {lifecycle.revision}
            </p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1.5 text-[11px] font-medium text-foreground">
            {entries.length} tracked tasks
          </span>
        </div>

        <div className="mt-3 grid grid-cols-9 gap-1" aria-label="Project lifecycle progress">
          {projectPhaseOrder.map((value, index) => (
            <div
              key={value}
              title={projectPhaseLabels[value]}
              className={`h-1.5 rounded-full ${
                index <= phaseIndex ? 'bg-foreground' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/60 px-3 py-2.5">
            <p className="font-mono text-[10px] text-muted-foreground">Waiting on client</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{waitingClient}</p>
          </div>
          <div className="rounded-lg bg-muted/60 px-3 py-2.5">
            <p className="font-mono text-[10px] text-muted-foreground">Waiting on Bivi</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{waitingBivi}</p>
          </div>
          <div className="col-span-2 rounded-lg bg-muted/60 px-3 py-2.5 sm:col-span-1">
            <p className="font-mono text-[10px] text-muted-foreground">Blocked tasks</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {blockedCount}
              {blockedCount > 0 && <AlertCircle size={15} className="ml-2 inline-block text-red-600 dark:text-red-400" />}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-border/50 pt-4">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1.5 block text-[11px] font-semibold" htmlFor="project-phase">
              Change lifecycle phase
            </label>
            <CompactSelect
              label="New project lifecycle phase"
              value={phase}
              disabled={busy || blocked}
              onChange={(value) => setPhase(value as ProjectPhase)}
            >
              {projectPhaseOrder.map((value) => (
                <option key={value} value={value}>
                  {projectPhaseLabels[value]}
                </option>
              ))}
            </CompactSelect>
          </div>
          {phaseChanged && (
            <label className="min-w-[240px] flex-[2] text-[11px] font-semibold">
              Reason for change
              <Textarea
                rows={1}
                maxLength={2000}
                value={reason}
                disabled={busy || blocked}
                onChange={(event) => setReason(event.target.value)}
                className="mt-1.5 min-h-9 bg-background text-xs"
                placeholder="Required for audit history"
              />
            </label>
          )}
          <Button
            type="button"
            disabled={!phaseChanged || !reason.trim() || busy || blocked}
            onClick={() => void savePhase()}
            className="h-9 gap-2 rounded-lg px-4 text-xs"
          >
            <Save size={14} /> {busy ? 'Saving…' : 'Save phase'}
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Moving beyond Discovery requires a client-approved project brief.
        </p>
        {message && (
          <p role="status" className="mt-2 text-xs text-red-600 dark:text-red-400">
            {message}
          </p>
        )}
        {blocked && (
          <button
            type="button"
            className={`${subtleButton} mt-2`}
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={14} /> Reload latest phase
          </button>
        )}
      </section>

      {/* COMPACT TASK CONTROLS */}
      <section className="overflow-hidden rounded-xl bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold">Task ownership & blockers</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Task status and due dates are edited under Tasks & milestones.
            </p>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {filtered.length} of {entries.length} tasks
          </span>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border/40 px-4 py-3">
          <div className="relative min-w-[200px] flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Search lifecycle tasks"
              placeholder="Search tasks…"
              value={query}
              onChange={(event) => changeFilter(() => setQuery(event.target.value))}
              className={`${fieldClass} pl-9`}
            />
          </div>
          <div className="min-w-[145px]">
            <CompactSelect
              label="Filter by responsibility"
              value={ownership}
              onChange={(value) => changeFilter(() => setOwnership(value as OwnershipFilter))}
            >
              <option value="all">All owners</option>
              <option value="bivi">Bivi tasks</option>
              <option value="client">Client tasks</option>
            </CompactSelect>
          </div>
          <div className="min-w-[155px]">
            <CompactSelect
              label="Filter by phase"
              value={phaseFilter}
              onChange={(value) => changeFilter(() => setPhaseFilter(value as PhaseFilter))}
            >
              <option value="all">All phases</option>
              <option value="current">Current phase</option>
            </CompactSelect>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] table-fixed text-left text-xs">
            <colgroup>
              <col className="w-[23%]" />
              <col className="w-[14%]" />
              <col className="w-[19%]" />
              <col className="w-[18%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead className="bg-muted/70 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2.5 font-medium">Task</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Responsibility</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Assigned staff</th><th scope="col" className="px-3 py-2.5 font-medium">Phase</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Waiting on</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {visible.map(({ task, control }) => (
                <TaskControlRow
                  key={task.id}
                  id={id}
                  task={task}
                  control={control}
                  allTasks={tasks}
                  expanded={expandedId === task.id}
                  onToggle={() => setExpandedId((current) => current === task.id ? null : task.id)}
                />
              ))}
            </tbody>
          </table>
          {!visible.length && (
            <p className="px-4 py-8 text-center text-xs text-muted-foreground">
              {entries.length
                ? 'No tasks match the current filters.'
                : 'Save a task in the work plan to create lifecycle controls.'}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 px-4 py-3 text-xs">
          <span className="text-muted-foreground">
            Page {currentPage} of {pages} · {PAGE_SIZE} tasks per page
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              aria-label="Previous lifecycle tasks"
              className={subtleButton}
              disabled={currentPage <= 1}
              onClick={() => { setPage(currentPage - 1); setExpandedId(null); }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              type="button"
              aria-label="Next lifecycle tasks"
              className={subtleButton}
              disabled={currentPage >= pages}
              onClick={() => { setPage(currentPage + 1); setExpandedId(null); }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* HISTORY - COLLAPSED BY DEFAULT */}
      {events.length > 0 && (
        <details className="rounded-xl bg-card shadow-sm">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold">
            <History size={15} /> Task-control history
            <span className="text-[11px] font-normal text-muted-foreground">
              {events.length} recent events
            </span>
          </summary>
          <ol className="max-h-[300px] divide-y divide-border/50 overflow-y-auto border-t border-border/40 px-4">
            {events.slice(0, 20).map((event) => (
              <li key={event.id} className="py-2.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{event.action.replaceAll('_', ' ')}</span>
                {' · '}{tasks.find((task) => task.id === event.task_id)?.title || event.task_id}
                {' · '}{new Date(event.created_at).toISOString().replace('T', ' ').slice(0, 16)} UTC
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
