
'use client';
import {milestoneDomId} from '@/lib/calendar/links';
import {taskDomId} from '@/lib/tasks/links';
import { useWorkspaceUnsavedChanges } from './workspace/WorkspaceNavigationGuard';

import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  History,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import {
  projectBodySchema,
  projectProgress,
  projectStates,
  type ProjectBody,
} from '@/lib/projects/schema';

import type {
  ProjectRecord,
  ProjectEvent,
} from '@/lib/projects/data';

/* =========================================================
   TYPES
   ========================================================= */

type Task = ProjectBody['tasks'][number];
type Milestone = ProjectBody['milestones'][number];

type Command =
  | 'activate'
  | 'save'
  | 'hold'
  | 'resume'
  | 'complete'
  | 'reopen';

type TaskFilter = 'all' | Task['status'];

type Props = {
  selectedTask?:string;
  selectedMilestone?:string;
  id: string;
  record: ProjectRecord | null;
  history: ProjectEvent[];
  gateReady: boolean;
};

/* =========================================================
   CONFIGURATION
   ========================================================= */

const TASK_PAGE_SIZE = 10;
const MILESTONE_PAGE_SIZE = 6;

const inputClass = `
  h-9
  w-full
  min-w-0
  rounded-lg
  border
  border-input
  bg-background
  px-2.5
  text-xs
  text-foreground
  outline-none
  focus:border-foreground/40
  focus:ring-1
  focus:ring-ring
  disabled:opacity-60
`;

const controlClass = `
  inline-flex
  h-9
  shrink-0
  items-center
  justify-center
  gap-1.5
  rounded-lg
  border
  border-border
  bg-background
  px-3
  text-xs
  font-medium
  text-foreground
  hover:bg-muted
  disabled:cursor-not-allowed
  disabled:opacity-50
`;

const confirmation: Record<
  Exclude<Command, 'save'>,
  string
> = {
  activate:
    'Activate a project from the accepted scope and current completed onboarding?',
  hold:
    'Place this project on hold?',
  resume:
    'Resume this project after verifying its current prerequisites?',
  complete:
    'Complete the project using the saved task and milestone records?',
  reopen:
    'Reopen this completed project on hold for review?',
};

/* =========================================================
   COMPACT SELECT
   ========================================================= */

function CompactSelect({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative min-w-0">
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`
          ${inputClass}
          appearance-none
          pl-2.5
          pr-9
        `}
      >
        {children}
      </select>

      <ChevronDown
        aria-hidden="true"
        size={14}
        className="
          pointer-events-none
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          text-muted-foreground
        "
      />
    </div>
  );
}

/* =========================================================
   SECTION TITLE
   ========================================================= */

function SectionTitle({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">
          {title}
        </h2>

        {detail && (
          <span className="text-[11px] text-muted-foreground">
            {detail}
          </span>
        )}
      </div>

      {action}
    </div>
  );
}

/* =========================================================
   PROJECT WORKSPACE
   ========================================================= */

export function ProjectWorkspace({
  id,
  record,
  history,
  gateReady,
  selectedTask,
  selectedMilestone,
}: Props) {
  const router = useRouter();

  /* =======================================================
     EDITOR STATE
     ======================================================= */

  const [body, setBody] = useState<
    ProjectBody | undefined
  >(record?.body);

  const [reason, setReason] = useState('');

  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [message, setMessage] = useState('');

  /* =======================================================
     TASK VIEW
     ======================================================= */

  const [taskFilter, setTaskFilter] =
    useState<TaskFilter>('all');

  const [taskQuery, setTaskQuery] =
    useState('');

  const [taskPage, setTaskPage] =
    useState(1);

  const [milestonePage, setMilestonePage] =
    useState(1);

  const [expandedTaskId, setExpandedTaskId] =
    useState<string | null>(null);

  useEffect(()=>{if(!selectedTask||!record)return;const index=record.body.tasks.findIndex(task=>task.id===selectedTask);if(index<0)return;setTaskFilter('all');setTaskQuery('');setTaskPage(Math.floor(index/TASK_PAGE_SIZE)+1);setExpandedTaskId(selectedTask);},[selectedTask,record]);
  useEffect(()=>{if(selectedTask&&expandedTaskId===selectedTask){const row=document.getElementById(taskDomId(selectedTask));row?.focus({preventScroll:true});row?.scrollIntoView({block:'start'});}},[selectedTask,expandedTaskId,taskPage]);
  useEffect(() => {
    if (!selectedMilestone || !record) return;
    const index = record.body.milestones.findIndex(item => item.id === selectedMilestone);
    if (index >= 0) setMilestonePage(Math.floor(index / MILESTONE_PAGE_SIZE) + 1);
  }, [selectedMilestone, record]);
  useEffect(() => {
    if (!selectedMilestone) return;
    const row = document.getElementById(milestoneDomId(selectedMilestone));
    row?.focus({preventScroll:true});
    row?.scrollIntoView({block:'start'});
  }, [selectedMilestone, milestonePage]);

  /* =======================================================
     STATUS
     ======================================================= */

  const completed =
    record?.state === 'completed';

  const locked =
    busy || blocked || completed;

  const dirty = Boolean(
    record &&
    body &&
    JSON.stringify(body) !==
      JSON.stringify(record.body)
  );

  const markWorkspaceSaved = useWorkspaceUnsavedChanges(dirty, 'Project work plan', () => command('save'));

  const progress = body
    ? projectProgress(body)
    : null;

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  /* =======================================================
     FILTERED TASKS
     ======================================================= */

  const filteredTasks = useMemo(() => {
    if (!body) return [];

    const search = taskQuery
      .trim()
      .toLowerCase();

    return body.tasks
      .map((task, index) => ({
        task,
        index,
      }))
      .filter(
        ({ task }) =>
          (
            taskFilter === 'all' ||
            task.status === taskFilter
          ) &&
          (
            !search ||
            [
              task.title,
              task.owner,
              task.notes,
            ].some((value) =>
              value
                .toLowerCase()
                .includes(search)
            )
          )
      );
  }, [body, taskFilter, taskQuery]);

  const taskPages = Math.max(
    1,
    Math.ceil(
      filteredTasks.length / TASK_PAGE_SIZE
    )
  );

  const visibleTaskPage = Math.min(
    taskPage,
    taskPages
  );

  const visibleTasks = filteredTasks.slice(
    (visibleTaskPage - 1) * TASK_PAGE_SIZE,
    visibleTaskPage * TASK_PAGE_SIZE
  );

  /* =======================================================
     MILESTONE PAGINATION
     ======================================================= */

  const milestonePages = Math.max(
    1,
    Math.ceil(
      (body?.milestones.length ?? 0) /
        MILESTONE_PAGE_SIZE
    )
  );

  const visibleMilestonePage = Math.min(
    milestonePage,
    milestonePages
  );

  const visibleMilestones =
    body?.milestones
      .map((milestone, index) => ({
        milestone,
        index,
      }))
      .slice(
        (visibleMilestonePage - 1) *
          MILESTONE_PAGE_SIZE,
        visibleMilestonePage *
          MILESTONE_PAGE_SIZE
      ) ?? [];

  /* =======================================================
     UPDATE PROJECT FIELDS
     ======================================================= */

  function field<
    K extends keyof ProjectBody
  >(
    key: K,
    value: ProjectBody[K]
  ) {
    setBody((previous) =>
      previous
        ? {
            ...previous,
            [key]: value,
          }
        : previous
    );
  }

  /* =======================================================
     UPDATE TASK
     ======================================================= */

  function editTask(
    index: number,
    changes: Partial<Task>
  ) {
    setBody((previous) =>
      previous
        ? {
            ...previous,
            tasks: previous.tasks.map(
              (task, i) =>
                i === index
                  ? { ...task, ...changes }
                  : task
            ),
          }
        : previous
    );
  }

  /* =======================================================
     UPDATE MILESTONE
     ======================================================= */

  function editMilestone(
    index: number,
    changes: Partial<Milestone>
  ) {
    setBody((previous) =>
      previous
        ? {
            ...previous,
            milestones:
              previous.milestones.map(
                (milestone, i) =>
                  i === index
                    ? {
                        ...milestone,
                        ...changes,
                      }
                    : milestone
              ),
          }
        : previous
    );
  }

  /* =======================================================
     ADD TASK
     ======================================================= */

  function addTask() {
    if (
      !body ||
      body.tasks.length >= 100
    ) {
      return;
    }

    const task: Task = {
      id: crypto.randomUUID(),
      title: 'New task',
      owner: '',
      dueOn: null,
      status: 'todo',
      milestoneId: null,
      notes: '',
    };

    field('tasks', [
      ...body.tasks,
      task,
    ]);

    setTaskFilter('all');
    setTaskQuery('');

    setTaskPage(
      Math.ceil(
        (body.tasks.length + 1) /
          TASK_PAGE_SIZE
      )
    );

    setExpandedTaskId(task.id);
  }

  /* =======================================================
     ADD MILESTONE
     ======================================================= */

  function addMilestone() {
    if (
      !body ||
      body.milestones.length >= 20
    ) {
      return;
    }

    field('milestones', [
      ...body.milestones,
      {
        id: crypto.randomUUID(),
        title: 'New milestone',
        dueOn: null,
        status: 'planned',
      },
    ]);

    setMilestonePage(
      Math.ceil(
        (body.milestones.length + 1) /
          MILESTONE_PAGE_SIZE
      )
    );
  }

  /* =======================================================
     REMOVE TASK
     ======================================================= */

  function removeTask(index: number) {
    if (
      !window.confirm(
        'Remove this task? Its previous saved state remains in history.'
      )
    ) {
      return;
    }

    setBody((previous) =>
      previous
        ? {
            ...previous,
            tasks: previous.tasks.filter(
              (_, i) => i !== index
            ),
          }
        : previous
    );

    setExpandedTaskId(null);
  }

  /* =======================================================
     REMOVE MILESTONE
     ======================================================= */

  function removeMilestone(
    index: number,
    milestoneId: string
  ) {
    if (
      body?.tasks.some(
        (task) =>
          task.milestoneId === milestoneId
      )
    ) {
      return;
    }

    if (
      !window.confirm(
        'Remove this milestone from the work plan?'
      )
    ) {
      return;
    }

    setBody((previous) =>
      previous
        ? {
            ...previous,
            milestones:
              previous.milestones.filter(
                (_, i) => i !== index
              ),
          }
        : previous
    );
  }

  /* =======================================================
     PROJECT COMMANDS
     ======================================================= */

  async function command(action: Command) {
    if (busy || blocked) return;

    /* VALIDATE SAVE */

    if (action === 'save') {
      if (
        !record ||
        completed ||
        !dirty
      ) {
        return;
      }

      if (
        !projectBodySchema
          .safeParse(body)
          .success
      ) {
        setMessage(
          'Check the project title, task names, dates and milestone assignments.'
        );
        return;
      }
    } else {
      /* PROJECT STATE CHANGE */

      if (dirty) {
        setMessage(
          'Save or discard your work-plan changes before changing project state.'
        );
        return;
      }

      if (
        action !== 'activate' &&
        !reason.trim()
      ) {
        return;
      }

      if (
        (
          action === 'activate' ||
          action === 'resume' ||
          action === 'complete'
        ) &&
        !gateReady
      ) {
        return;
      }

      if (
        action === 'complete' &&
        (
          !body?.tasks.length ||
          body.tasks.some(
            (task) =>
              task.status !== 'done'
          ) ||
          body.milestones.some(
            (milestone) =>
              milestone.status !== 'done'
          )
        )
      ) {
        return;
      }

      if (
        !window.confirm(
          confirmation[action]
        )
      ) {
        return;
      }
    }

    setBusy(true);
    setMessage('');

    try {
      const response = await fetch(
        `/api/admin/projects/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            action,
            expectedRevision:
              record?.revision ?? 0,

            ...(action === 'save'
              ? { body }
              : action === 'activate'
                ? {}
                : { reason }),
          }),
          signal:
            AbortSignal.timeout(20000),
        }
      );

      const result =
        await response.json();

      if (
        response.status === 401
      ) {
        router.replace('/admin/login');
        router.refresh();
        return;
      }

      if (
        response.status === 409
      ) {
        setBlocked(true);
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Project could not be saved.'
        );
      }

      markWorkspaceSaved(); window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error &&
          error.name !== 'TimeoutError'
          ? error.message
          : 'The result could not be confirmed. Reload before retrying.'
      );

      if (
        error instanceof Error &&
        [
          'TimeoutError',
          'TypeError',
        ].includes(error.name)
      ) {
        setBlocked(true);
      }
    } finally {
      setBusy(false);
    }
  }

  /* =======================================================
     ACTIVATION VIEW
     ======================================================= */

  if (!record || !body) {
    return (
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">
          Activate project
        </h2>

        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {gateReady
            ? 'The accepted scope, agreement/deposit readiness and onboarding completion are verified.'
            : 'Review qualification, accepted scope, readiness and onboarding before activation.'}
        </p>

        <Button
          type="button"
          className="mt-4"
          disabled={
            busy ||
            blocked ||
            !gateReady
          }
          onClick={() =>
            void command('activate')
          }
        >
          {busy
            ? 'Activating…'
            : 'Activate project'}
        </Button>

        {message && (
          <p
            role="status"
            className="mt-3 text-xs text-destructive"
          >
            {message}
          </p>
        )}

        {blocked && (
          <Button
            type="button"
            variant="outline"
            className="ml-2 mt-3"
            onClick={() =>
              window.location.reload()
            }
          >
            Reload
          </Button>
        )}
      </section>
    );
  }

  /* =======================================================
     MAIN EDITOR
     ======================================================= */

  return (
    <div className="space-y-3 pb-4">

      {/* ===============================================
          COMPACT SUMMARY
          =============================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="font-semibold">
            {projectStates[record.state]} project
          </span>

          <span className="text-muted-foreground">
            {progress?.done ?? 0}/
            {progress?.total ?? 0} tasks ·{' '}
            {progress?.percent ?? 0}%
            complete
          </span>

          {!gateReady && (
            <span className="text-amber-700 dark:text-amber-400">
              Prerequisites need review
            </span>
          )}

          {dirty && (
            <span className="font-semibold text-foreground">
              Unsaved changes
            </span>
          )}
        </div>

        <span className="text-[11px] text-muted-foreground">
          {completed
            ? 'Read-only until reopened'
            : 'Changes are saved together'}
        </span>
      </div>

      {/* ===============================================
          PROJECT DETAILS
          =============================================== */}

      <section className="rounded-xl border border-border bg-card">
        <SectionTitle
          title="Project details"
          detail="Name, owner and internal notes"
        />

        <div className="grid gap-3 px-4 py-3 sm:grid-cols-2">

          <label className="block min-w-0 text-[11px] font-medium text-muted-foreground">
            Project title

            <Input
              className={`${inputClass} mt-1`}
              maxLength={200}
              value={body.title}
              disabled={locked}
              onChange={(event) =>
                field(
                  'title',
                  event.target.value
                )
              }
            />
          </label>

          <label className="block min-w-0 text-[11px] font-medium text-muted-foreground">
            Project owner

            <Input
              className={`${inputClass} mt-1`}
              maxLength={200}
              value={body.owner}
              disabled={locked}
              onChange={(event) =>
                field(
                  'owner',
                  event.target.value
                )
              }
              placeholder="Unassigned"
            />
          </label>

          {/* COLLAPSIBLE INTERNAL NOTES */}

          <details className="rounded-lg border border-border px-3 py-2 sm:col-span-2">
            <summary className="cursor-pointer text-xs font-medium text-foreground">
              Internal project notes{' '}
              {body.notes
                ? '· Added'
                : '· Empty'}
            </summary>

            <Textarea
              aria-label="Internal project notes"
              rows={3}
              maxLength={4000}
              value={body.notes}
              disabled={locked}
              onChange={(event) =>
                field(
                  'notes',
                  event.target.value
                )
              }
              className="mt-3 text-xs"
            />
          </details>
        </div>
      </section>

      {/* ===============================================
          MILESTONES TABLE
          =============================================== */}

      <section className="rounded-xl border border-border bg-card">

        <SectionTitle
          title="Milestones"
          detail={`${body.milestones.length}/20`}
          action={
            <button
              type="button"
              className={controlClass}
              disabled={
                locked ||
                body.milestones.length >= 20
              }
              onClick={addMilestone}
            >
              <Plus size={14} />
              Add milestone
            </button>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">

            <thead className="border-b border-border bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th
                  scope="col"
                  className="w-[41%] px-3 py-2 font-medium"
                >
                  Milestone
                </th>

                <th
                  scope="col"
                  className="w-[21%] px-3 py-2 font-medium"
                >
                  Status
                </th>

                <th
                  scope="col"
                  className="w-[20%] px-3 py-2 font-medium"
                >
                  Due
                </th>

                <th
                  scope="col"
                  className="px-3 py-2 font-medium"
                >
                  Tasks
                </th>

                <th
                  scope="col"
                  className="w-12 px-3 py-2 font-medium"
                />
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {visibleMilestones.map(
                ({ milestone, index }) => {
                  const linked =
                    body.tasks.filter(
                      (task) =>
                        task.milestoneId ===
                        milestone.id
                    ).length;

                  return (
                    <tr
                      key={milestone.id}
                      id={milestoneDomId(milestone.id)}
                      tabIndex={-1}
                      style={{scrollMarginTop:'6rem'}}
                      className="hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
                    >
                      {/* MILESTONE TITLE */}

                      <td className="px-3 py-2">
                        <input
                          aria-label={`Milestone ${index + 1} title`}
                          className={inputClass}
                          value={milestone.title}
                          maxLength={300}
                          disabled={locked}
                          onChange={(event) =>
                            editMilestone(index, {
                              title:
                                event.target.value,
                            })
                          }
                        />
                      </td>

                      {/* MILESTONE STATUS */}

                      <td className="px-3 py-2">
                        <CompactSelect
                          label={`Status for ${milestone.title}`}
                          value={milestone.status}
                          disabled={locked}
                          onChange={(value) =>
                            editMilestone(index, {
                              status:
                                value as Milestone['status'],
                            })
                          }
                        >
                          <option value="planned">
                            Planned
                          </option>

                          <option value="in_progress">
                            In progress
                          </option>

                          <option value="done">
                            Done
                          </option>
                        </CompactSelect>
                      </td>

                      {/* DUE DATE */}

                      <td className="px-3 py-2">
                        <input
                          type="date"
                          aria-label={`Due date for ${milestone.title}`}
                          className={inputClass}
                          value={
                            milestone.dueOn ?? ''
                          }
                          disabled={locked}
                          onChange={(event) =>
                            editMilestone(index, {
                              dueOn:
                                event.target.value ||
                                null,
                            })
                          }
                        />
                      </td>

                      {/* LINKED TASKS */}

                      <td className="px-3 py-2 text-muted-foreground">
                        {linked}
                      </td>

                      {/* REMOVE */}

                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          disabled={
                            locked ||
                            linked > 0
                          }
                          onClick={() =>
                            removeMilestone(
                              index,
                              milestone.id
                            )
                          }
                          title={
                            linked
                              ? 'Reassign linked tasks before removing'
                              : 'Remove milestone'
                          }
                          aria-label={`Remove ${milestone.title}`}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>

          {!body.milestones.length && (
            <p className="px-4 py-5 text-xs text-muted-foreground">
              No milestones yet.
            </p>
          )}
        </div>

        {/* MILESTONE PAGINATION */}

        {milestonePages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2 text-xs">

            <span className="text-muted-foreground">
              Page {visibleMilestonePage} of{' '}
              {milestonePages}
            </span>

            <div className="flex gap-1">
              <button
                type="button"
                className={controlClass}
                disabled={
                  visibleMilestonePage === 1
                }
                onClick={() =>
                  setMilestonePage(
                    visibleMilestonePage - 1
                  )
                }
                aria-label="Previous milestones"
              >
                <ChevronLeft size={14} />
              </button>

              <button
                type="button"
                className={controlClass}
                disabled={
                  visibleMilestonePage ===
                  milestonePages
                }
                onClick={() =>
                  setMilestonePage(
                    visibleMilestonePage + 1
                  )
                }
                aria-label="Next milestones"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ===============================================
          TASKS TABLE
          =============================================== */}

      <section className="rounded-xl border border-border bg-card">

        <SectionTitle
          title="Tasks"
          detail={`${filteredTasks.length} shown · ${body.tasks.length}/100 total`}
          action={
            <button
              type="button"
              className={controlClass}
              disabled={
                locked ||
                body.tasks.length >= 100
              }
              onClick={addTask}
            >
              <Plus size={14} />
              Add task
            </button>
          }
        />

        <p className="border-b border-border px-3 py-2 text-xs text-muted-foreground">Assign verified staff accounts in Lifecycle → Task ownership. Owner labels here are optional display text.</p>
        {/* SEARCH AND STATUS FILTER */}

        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2.5">

          <input
            type="search"
            value={taskQuery}
            onChange={(event) => {
              setTaskQuery(
                event.target.value
              );
              setTaskPage(1);
            }}
            placeholder="Find tasks…"
            aria-label="Find tasks"
            className={`${inputClass} max-w-xs flex-1`}
          />

          <div className="min-w-[140px]">
            <CompactSelect
              label="Filter tasks by status"
              value={taskFilter}
              onChange={(value) => {
                setTaskFilter(
                  value as TaskFilter
                );
                setTaskPage(1);
              }}
            >
              <option value="all">
                All statuses
              </option>

              <option value="todo">
                To do
              </option>

              <option value="doing">
                In progress
              </option>

              <option value="blocked">
                Blocked
              </option>

              <option value="done">
                Done
              </option>
            </CompactSelect>
          </div>
        </div>

        {/* TASK TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[930px] text-left text-xs">

            <thead className="border-b border-border bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th
                  scope="col"
                  className="w-[26%] px-3 py-2 font-medium"
                >
                  Task
                </th>

                <th
                  scope="col"
                  className="w-[17%] px-3 py-2 font-medium"
                >
                  Owner label
                </th>

                <th
                  scope="col"
                  className="w-[16%] px-3 py-2 font-medium"
                >
                  Status
                </th>

                <th
                  scope="col"
                  className="w-[17%] px-3 py-2 font-medium"
                >
                  Due
                </th>

                <th
                  scope="col"
                  className="w-[19%] px-3 py-2 font-medium"
                >
                  Milestone
                </th>

                <th
                  scope="col"
                  className="px-3 py-2 font-medium"
                >
                  Details
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">

              {visibleTasks.map(
                ({ task, index }) => {
                  const expanded =
                    expandedTaskId === task.id;

                  const overdue = Boolean(
                    task.dueOn &&
                    task.dueOn < today &&
                    task.status !== 'done'
                  );

                  return (
                    <Fragment key={task.id}>

                      {/* TASK ROW */}

                      <tr id={taskDomId(task.id)} tabIndex={-1} style={{scrollMarginTop:'6rem'}}
                        className={
                          expanded
                            ? 'bg-muted/30'
                            : 'hover:bg-muted/20'
                        }
                      >
                        {/* TASK TITLE */}

                        <td className="px-3 py-2">
                          <input
                            aria-label={`Task ${index + 1} title`}
                            className={inputClass}
                            value={task.title}
                            maxLength={300}
                            disabled={locked}
                            onChange={(event) =>
                              editTask(index, {
                                title:
                                  event.target.value,
                              })
                            }
                          />
                        </td>

                        {/* OWNER */}

                        <td className="px-3 py-2">
                          <input
                            aria-label={`Owner for ${task.title}`}
                            className={inputClass}
                            value={task.owner}
                            maxLength={200}
                            placeholder="Unassigned"
                            disabled={locked}
                            onChange={(event) =>
                              editTask(index, {
                                owner:
                                  event.target.value,
                              })
                            }
                          />
                        </td>

                        {/* STATUS */}

                        <td className="px-3 py-2">
                          <CompactSelect
                            label={`Status for ${task.title}`}
                            value={task.status}
                            disabled={locked}
                            onChange={(value) =>
                              editTask(index, {
                                status:
                                  value as Task['status'],
                              })
                            }
                          >
                            <option value="todo">
                              To do
                            </option>

                            <option value="doing">
                              In progress
                            </option>

                            <option value="blocked">
                              Blocked
                            </option>

                            <option value="done">
                              Done
                            </option>
                          </CompactSelect>
                        </td>

                        {/* DUE DATE */}

                        <td className="px-3 py-2">
                          <input
                            type="date"
                            aria-label={`Due date for ${task.title}`}
                            className={
                              overdue
                                ? `${inputClass} border-red-500/60`
                                : inputClass
                            }
                            value={
                              task.dueOn ?? ''
                            }
                            disabled={locked}
                            onChange={(event) =>
                              editTask(index, {
                                dueOn:
                                  event.target.value ||
                                  null,
                              })
                            }
                          />
                        </td>

                        {/* MILESTONE */}

                        <td className="px-3 py-2">
                          <CompactSelect
                            label={`Milestone for ${task.title}`}
                            value={
                              task.milestoneId ?? ''
                            }
                            disabled={locked}
                            onChange={(value) =>
                              editTask(index, {
                                milestoneId:
                                  value || null,
                              })
                            }
                          >
                            <option value="">
                              No milestone
                            </option>

                            {body.milestones.map(
                              (milestone) => (
                                <option
                                  key={milestone.id}
                                  value={milestone.id}
                                >
                                  {milestone.title}
                                </option>
                              )
                            )}
                          </CompactSelect>
                        </td>

                        {/* EXPAND DETAILS */}

                        <td className="px-3 py-2">
                          <button
                            type="button"
                            title={
                              expanded
                                ? 'Hide task details'
                                : 'Show task details'
                            }
                            aria-label={`${
                              expanded
                                ? 'Hide'
                                : 'Show'
                            } details for ${task.title}`}
                            aria-expanded={
                              expanded
                            }
                            aria-controls={`project-task-details-${task.id}`}
                            onClick={() =>
                              setExpandedTaskId(
                                expanded
                                  ? null
                                  : task.id
                              )
                            }
                            className={
                              controlClass
                            }
                          >
                            <ChevronRight
                              size={14}
                              className={
                                expanded
                                  ? 'rotate-90 transition-transform'
                                  : 'transition-transform'
                              }
                            />

                            {task.notes
                              ? 'Notes'
                              : 'More'}
                          </button>
                        </td>
                      </tr>

                      {/* EXPANDED TASK DETAILS */}

                      {expanded && (
                        <tr>
                          <td
                            id={`project-task-details-${task.id}`}
                            colSpan={6}
                            className="bg-muted/25 px-4 py-3"
                          >
                            <div className="flex flex-wrap items-end gap-3">

                              <label className="min-w-[220px] flex-1 text-xs font-medium">
                                Task notes /
                                blocker details

                                <Textarea
                                  rows={2}
                                  maxLength={2000}
                                  value={task.notes}
                                  disabled={locked}
                                  onChange={(
                                    event
                                  ) =>
                                    editTask(
                                      index,
                                      {
                                        notes:
                                          event.target.value,
                                      }
                                    )
                                  }
                                  className="mt-1.5 bg-card text-xs"
                                />
                              </label>

                              <button
                                type="button"
                                disabled={locked}
                                onClick={() =>
                                  removeTask(index)
                                }
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-destructive hover:bg-muted disabled:opacity-50"
                              >
                                <Trash2 size={14} />
                                Remove task
                              </button>
                            </div>

                            {overdue && (
                              <p className="mt-2 text-[11px] text-red-600 dark:text-red-400">
                                Overdue (UTC date)
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                }
              )}
            </tbody>
          </table>

          {!visibleTasks.length && (
            <p className="px-4 py-6 text-xs text-muted-foreground">
              No tasks match this view.
            </p>
          )}
        </div>

        {/* TASK PAGINATION */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-xs">

          <span className="text-muted-foreground">
            Showing {visibleTasks.length} of{' '}
            {filteredTasks.length} matching
            tasks · Page {visibleTaskPage} of{' '}
            {taskPages}
          </span>

          <div className="flex gap-2">

            <button
              type="button"
              className={controlClass}
              disabled={
                visibleTaskPage === 1
              }
              onClick={() => {
                setTaskPage(
                  visibleTaskPage - 1
                );

                setExpandedTaskId(null);
              }}
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            <button
              type="button"
              className={controlClass}
              disabled={
                visibleTaskPage ===
                taskPages
              }
              onClick={() => {
                setTaskPage(
                  visibleTaskPage + 1
                );

                setExpandedTaskId(null);
              }}
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ===============================================
          PROJECT DECISIONS
          =============================================== */}

      <details className="rounded-xl border border-border bg-card">

        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
          Project state & decisions
        </summary>

        <div className="space-y-3 border-t border-border px-4 py-4">

          <p className="text-xs text-muted-foreground">
            {gateReady
              ? 'Accepted scope, agreement/deposit readiness and current onboarding are verified.'
              : 'Prerequisites require review before resuming or completing this project.'}
          </p>

          <label className="block text-xs font-medium">
            Decision reason /
            completion summary

            <Textarea
              className="mt-2 text-xs"
              rows={2}
              maxLength={2000}
              value={reason}
              disabled={
                busy ||
                blocked ||
                dirty
              }
              onChange={(event) =>
                setReason(
                  event.target.value
                )
              }
              placeholder="Required for project state changes"
            />
          </label>

          <div className="flex flex-wrap gap-2">

            {record.state === 'active' && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    busy ||
                    blocked ||
                    dirty ||
                    !reason.trim()
                  }
                  onClick={() =>
                    void command('hold')
                  }
                >
                  Place on hold
                </Button>

                <Button
                  type="button"
                  disabled={
                    busy ||
                    blocked ||
                    dirty ||
                    !reason.trim() ||
                    !gateReady ||
                    !body.tasks.length ||
                    body.tasks.some(
                      (task) =>
                        task.status !==
                        'done'
                    ) ||
                    body.milestones.some(
                      (milestone) =>
                        milestone.status !==
                        'done'
                    )
                  }
                  onClick={() =>
                    void command('complete')
                  }
                >
                  Complete project
                </Button>
              </>
            )}

            {record.state === 'on_hold' && (
              <Button
                type="button"
                disabled={
                  busy ||
                  blocked ||
                  dirty ||
                  !reason.trim() ||
                  !gateReady
                }
                onClick={() =>
                  void command('resume')
                }
              >
                Resume project
              </Button>
            )}

            {record.state === 'completed' && (
              <Button
                type="button"
                variant="outline"
                disabled={
                  busy ||
                  blocked ||
                  !reason.trim()
                }
                onClick={() =>
                  void command('reopen')
                }
              >
                Reopen on hold
              </Button>
            )}
          </div>

          {dirty && (
            <p className="text-xs text-muted-foreground">
              Save or discard work-plan
              changes before changing the
              project state.
            </p>
          )}
        </div>
      </details>

      {/* ===============================================
          ACTIVATION SNAPSHOT
          =============================================== */}

      <details className="rounded-xl border border-border bg-card">

        <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold">
          <ClipboardList size={15} />

          Activation snapshot

          <span className="text-xs font-normal text-muted-foreground">
            Scope v{record.proposal_version}
          </span>
        </summary>

        <div className="space-y-4 border-t border-border px-4 py-4 text-xs">

          <p className="text-muted-foreground">
            This accepted scope and onboarding
            snapshot stays fixed as the
            project changes.
          </p>

          <dl className="grid gap-4 sm:grid-cols-2">

            {(
              [
                'summary',
                'deliverables',
                'exclusions',
                'clientInputs',
                'revisions',
                'schedule',
                'fees',
              ] as const
            ).map((key) => (
              <div
                key={key}
                className="min-w-0"
              >
                <dt className="font-semibold capitalize">
                  {(
                    {
                      clientInputs:
                        'Client inputs',
                    } as Record<string, string>
                  )[key] || key}
                </dt>

                <dd className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">
                  {record.scope_snapshot[key]}
                </dd>
              </div>
            ))}

            <div className="min-w-0">
              <dt className="font-semibold">
                Activation references
              </dt>

              <dd className="mt-1 break-words text-muted-foreground">
                Agreement:{' '}
                {
                  record.readiness_snapshot
                    .agreementRef
                }{' '}
                · Deposit:{' '}
                {
                  record.readiness_snapshot
                    .depositStatus
                }{' '}
                · Contact:{' '}
                {
                  record.onboarding_snapshot
                    .contactName
                }{' '}
                · Kickoff:{' '}
                {
                  record.onboarding_snapshot
                    .kickoffDate
                }
              </dd>
            </div>
          </dl>
        </div>
      </details>

      {/* ===============================================
          PROJECT HISTORY
          =============================================== */}

      <details className="rounded-xl border border-border bg-card">

        <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold">
          <History size={15} />

          Project history

          <span className="text-xs font-normal text-muted-foreground">
            {history.length} recent events
          </span>
        </summary>

        <div className="max-h-[360px] space-y-2 overflow-y-auto border-t border-border px-4 py-3">

          {history.map((event) => (
            <details
              key={event.id}
              className="rounded-lg border border-border px-3 py-2 text-xs"
            >
              <summary className="cursor-pointer font-medium">
                {(
                  {
                    activate:
                      'Activated',
                    save:
                      'Work plan saved',
                    hold:
                      'Placed on hold',
                    resume:
                      'Resumed',
                    complete:
                      'Completed',
                    reopen:
                      'Reopened',
                  } as Record<string, string>
                )[event.action] ||
                  event.action}

                <span className="ml-2 font-normal text-muted-foreground">
                  {new Date(
                    event.created_at
                  )
                    .toISOString()
                    .replace('T', ' ')
                    .slice(0, 16)}{' '}
                  UTC
                </span>
              </summary>

              <div className="mt-3 space-y-2 break-words text-muted-foreground">

                <p>
                  Staff:{' '}
                  {event.actor ||
                    'Account removed'}
                </p>

                {event.reason && (
                  <p className="whitespace-pre-wrap">
                    {event.reason}
                  </p>
                )}

                <p className="font-medium text-foreground">
                  Saved work plan ·
                  Revision{' '}
                  {event.snapshot.revision}
                </p>

                <p>
                  {
                    event.snapshot.body
                      .title
                  }{' '}
                  ·{' '}
                  {
                    projectStates[
                      event.snapshot.state
                    ]
                  }{' '}
                  · Owner:{' '}
                  {event.snapshot.body
                    .owner || 'Unassigned'}
                </p>

                {event.snapshot.body
                  .notes && (
                  <p className="whitespace-pre-wrap">
                    {
                      event.snapshot.body
                        .notes
                    }
                  </p>
                )}

                {event.snapshot.body.milestones.map(
                  (milestone) => (
                    <p key={milestone.id}>
                      Milestone:{' '}
                      {milestone.title} ·{' '}
                      {milestone.status} ·{' '}
                      {milestone.dueOn ||
                        'No due date'}
                    </p>
                  )
                )}

                {event.snapshot.body.tasks.map(
                  (task) => (
                    <div key={task.id}>
                      <p>
                        {task.title} ·{' '}
                        {task.status} ·{' '}
                        {task.owner ||
                          'Unassigned'}{' '}
                        ·{' '}
                        {task.dueOn ||
                          'No due date'}{' '}
                        ·{' '}
                        {event.snapshot.body.milestones.find(
                          (milestone) =>
                            milestone.id ===
                            task.milestoneId
                        )?.title ||
                          'No milestone'}
                      </p>

                      {task.notes && (
                        <p className="whitespace-pre-wrap">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </details>
          ))}

          {!history.length && (
            <p className="py-3 text-xs text-muted-foreground">
              No project events yet.
            </p>
          )}
        </div>
      </details>

      {/* ===============================================
          STICKY SAVE BAR
          =============================================== */}

      <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm">

        <div className="min-w-0 text-xs">

          <span className="font-semibold">
            {dirty
              ? 'Unsaved changes'
              : 'All changes saved'}
          </span>

          {completed && (
            <span className="ml-2 text-muted-foreground">
              Read-only until reopened
            </span>
          )}

          {blocked && (
            <p className="mt-1 text-destructive">
              Revision conflict or uncertain
              save. Reload before retrying.
            </p>
          )}

          {message && (
            <p
              role="status"
              className="mt-1 text-destructive"
            >
              {message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">

          {blocked ? (
            <button
              type="button"
              className={controlClass}
              onClick={() =>
                window.location.reload()
              }
            >
              <RotateCcw size={14} />
              Reload
            </button>
          ) : (
            <>
              {dirty && !completed && (
                <button
                  type="button"
                  className={controlClass}
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        'Discard all unsaved project edits?'
                      )
                    ) {
                      setBody(record.body);
                    }
                  }}
                >
                  <RotateCcw size={14} />
                  Discard
                </button>
              )}

              <Button
                type="button"
                disabled={
                  !dirty ||
                  locked
                }
                onClick={() =>
                  void command('save')
                }
                className="gap-2"
              >
                <Save size={15} />

                {busy
                  ? 'Saving…'
                  : 'Save project'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
