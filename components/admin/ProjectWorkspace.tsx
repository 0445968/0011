
'use client';
import {milestoneDomId} from '@/lib/calendar/links';
import Link from 'next/link';
import {taskDomId} from '@/lib/tasks/links';
import { DirectoryStatus, ProjectTaskStateIcon } from './projects/DirectoryIndicators';
import { ProjectMilestoneBoard } from './projects/ProjectMilestoneBoardV2';
import type { ProjectTaskControl } from '@/lib/projects/lifecycle-schema';
import { useProjectEditingController } from './projects/useProjectEditingController';
import {postProjectCommand} from '@/lib/projects/immediate-command';
import {refreshProjectSurfaces} from '@/lib/projects/refresh';
import {ProjectPageHeader} from './projects/ProjectVisuals';
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
  overview?: ReactNode;
  savedToday: string;
  selectedTask?:string;
  selectedMilestone?:string;
  taskControls?: ProjectTaskControl[];
  id: string;
  userId: string;
  record: ProjectRecord | null;
  history: ProjectEvent[];
  gateReady: boolean;
  operationalStatus?: import('@/lib/projects/operational-status').OperationalStatus;
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
  status = false,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  status?: boolean;
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
          ${status ? value === 'done' ? '!border-emerald-200 !bg-emerald-50 !text-emerald-800 dark:!border-emerald-800 dark:!bg-emerald-950 dark:!text-emerald-200' : value === 'blocked' ? '!border-amber-200 !bg-amber-50 !text-amber-900 dark:!border-amber-800 dark:!bg-amber-950 dark:!text-amber-200' : value === 'doing' || value === 'in_progress' ? '!border-amber-300 !bg-amber-50 !text-amber-800 dark:!border-amber-700 dark:!bg-amber-950 dark:!text-amber-200' : '' : ''}
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
  overview,
  savedToday,
  id,
  userId,
  record,
  history,
  gateReady,
  operationalStatus,
  selectedTask,
  selectedMilestone,
  taskControls = [],
}: Props) {
  const router = useRouter();

  /* =======================================================
     EDITOR STATE
     ======================================================= */

  const controller=useProjectEditingController(id,record,Boolean(selectedMilestone));
  const {body,savedRevision,setBody,busy,setBusy,blocked,setBlocked,
    message,setMessage,saveOutcomeUnknown,setSaveOutcomeUnknown,serverBlockers,setServerBlockers,workflowGate,setWorkflowGate,dirty,drafts,advanced,setAdvanced}=controller;
  const [reason,setReason]=useState('');
  const [workflowOverrideReason,setWorkflowOverrideReason]=useState('');
  const [overviewTaskId,setOverviewTaskId]=useState<string|null>(selectedTask??null);
  const [taskFocusRequest,setTaskFocusRequest]=useState(0);
  useEffect(()=>{if(selectedTask){setOverviewTaskId(selectedTask);setTaskFocusRequest(value=>value+1);}},[selectedTask]);
  useEffect(()=>{if(workflowGate){setAdvanced(false);setOverviewTaskId(workflowGate.taskId);setTaskFocusRequest(value=>value+1);}},[workflowGate?.taskId]);
  function focusTaskDetails(taskId:string) {
    setAdvanced(false);setOverviewTaskId(taskId);
    setTaskFocusRequest(value=>value+1);
  }
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

  const [editorFocus, setEditorFocus] = useState<string | null>(null);
  function openAdvanced(taskId?: string, milestoneId?: string) {
    setAdvanced(true);
    if (taskId) {
      const index = body?.tasks.findIndex(task=>task.id===taskId) ?? -1;
      setTaskFilter('all'); setTaskQuery('');
      if (index>=0) setTaskPage(Math.floor(index/TASK_PAGE_SIZE)+1);
      setExpandedTaskId(taskId); setOverviewTaskId(taskId); setTaskFocusRequest(value=>value+1); setEditorFocus(taskDomId(taskId));
    } else if (milestoneId) {
      const index = body?.milestones.findIndex(item=>item.id===milestoneId) ?? -1;
      if (index>=0) setMilestonePage(Math.floor(index/MILESTONE_PAGE_SIZE)+1);
      setEditorFocus(milestoneDomId(milestoneId));
    } else setEditorFocus('project-advanced-editor');
  }
  function returnToWorkplan() {
    setAdvanced(false); setEditorFocus(null);
    window.requestAnimationFrame(()=>{
      const cards=document.getElementById('project-workplan-cards');
      cards?.focus({preventScroll:true}); cards?.scrollIntoView({block:'start'});
    });
  }
  useEffect(()=>{
    if (!advanced || !editorFocus) return;
    const row=document.getElementById(editorFocus);
    row?.focus({preventScroll:true}); row?.scrollIntoView({block:'center'});
  },[advanced,editorFocus,taskPage,milestonePage]);

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
  const inactive = operationalStatus === 'inactive';

  const locked =
    busy || blocked || completed || inactive;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('bivi:project-workplan-dirty', { detail: { projectId: id, dirty, ready: drafts.ready&&!drafts.recoverable&&!drafts.conflict } }));
  }, [id, dirty, drafts.ready,drafts.recoverable,drafts.conflict]);

  const markWorkspaceSaved = useWorkspaceUnsavedChanges(dirty, 'Project work plan', async () => {
    const saved = await command('save');
    if (saved !== true) throw new Error('Project changes were not saved. Review the editor message.');
  },async()=>{if(!await controller.discard())throw new Error('Private draft discard could not be confirmed. Your edits remain available.');});

  const today=savedToday;

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

  function addTask(milestoneId: string | null = null) {
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
      milestoneId,
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
    return task.id;
  }

  async function bulkMilestoneTasks(milestoneId:string,status:'done'|'todo'){
    if(!body||!savedRevision||dirty||busy)return;
    const taskIds=body.tasks.filter(task=>task.milestoneId===milestoneId).map(task=>task.id);
    if(!taskIds.length)return;
    setBusy(true);setMessage('');
    try{
      const result=await postProjectCommand(`/api/admin/projects/${id}/task-productivity`,{action:'bulk_status',expectedProjectRevision:savedRevision,taskIds,status});
      await controller.checkUncertainSave();
      setMessage(`${result.changed??taskIds.length} tasks saved. The editor was reconciled against the saved project.`);
      refreshProjectSurfaces(id,router);
    }catch(cause){setMessage(cause instanceof Error?cause.message:'Bulk task update could not save.');}
    finally{setBusy(false);}
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

    const milestoneId = crypto.randomUUID();
    field('milestones', [
      ...body.milestones,
      {
        id: milestoneId,
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
    return milestoneId;
  }

  /* =======================================================
     REMOVE TASK
     ======================================================= */

  function removeTask(taskId: string) {
    const task = body?.tasks.find(item=>item.id===taskId);
    if (!task) return;
    const dependent = taskControls.find(control=>control.dependsOn===task.id);
    if (dependent) {
      setMessage(`Cannot remove “${task.title}” while “${body?.tasks.find(item=>item.id===dependent.taskId)?.title ?? dependent.taskId}” depends on it. Change that dependency first in Tasks & Milestones.`);
      return;
    }
    if (
      !window.confirm(
        `Remove “${task.title}” from the work plan? Existing activity, notes, files and discussion history stay recorded. Save changes to confirm removal.`
      )
    ) {
      return;
    }

    setBody((previous) =>
      previous
        ? {
            ...previous,
            tasks: previous.tasks.filter(item=>item.id!==taskId),
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
    if (busy || blocked) return false;

    if(action==='save')return controller.save();
    {
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
              savedRevision,

            ...(action === 'activate'
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

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Project could not be saved.'
        );
      }

      markWorkspaceSaved();
      router.refresh();
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Project could not be saved.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function overrideTaskStatus() {
    const gate=workflowGate;
    if (!gate || !gate.overrideAvailable || !workflowOverrideReason.trim() || busy || !savedRevision) return false;
    setBusy(true);setMessage('Saving admin workflow override…');
    await drafts.suspendAutosaves();
    try {
      const result=await postProjectCommand(`/api/admin/projects/${id}/task-status-override`,{
        taskId:gate.taskId,targetStatus:gate.targetStatus,expectedProjectRevision:savedRevision,reason:workflowOverrideReason.trim(),
      });
      if (!result.body || !Number.isInteger(result.revision)) throw new Error('The override was saved, but its canonical task and revision could not be confirmed. Refresh before retrying.');
      const merged=drafts.reconcile(result.body,result.revision);
      setWorkflowGate(null);setServerBlockers([]);setWorkflowOverrideReason('');
      setMessage(`Admin workflow override saved for “${gate.title}”.${merged.conflicts.length?' Review the draft conflicts before saving.':' Other unsaved work-plan edits remain in your private draft.'}`);
      refreshProjectSurfaces(id,router);
      return true;
    } catch(cause) {
      setMessage(cause instanceof Error?cause.message:'The override could not be confirmed. Your work-plan draft remains available.');
      return false;
    } finally {
      drafts.resumeAutosaves();setBusy(false);
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
              void controller.checkUncertainSave()
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
    <>
    {overview}
    {((selectedTask&&!record.body.tasks.some(task=>task.id===selectedTask))||(selectedMilestone&&!record.body.milestones.some(item=>item.id===selectedMilestone)))&&<p role="status" className="text-xs text-amber-800 dark:text-amber-200">The linked item is no longer in the saved project. Browse Tasks &amp; Milestones below; any private draft remains recoverable.</p>}
    {overview&&<Link className="inline-flex rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted" href={`/projects/${id}?tab=plan`}>Open Tasks</Link>}
    <div hidden={Boolean(overview)} className="space-y-3 rounded-xl bg-white p-3 text-slate-950 dark:bg-background dark:text-foreground sm:p-4">

      {/* ===============================================
          COMPACT SUMMARY
          =============================================== */}

      <ProjectPageHeader compact title={advanced ? 'Advanced work-plan editor' : 'Tasks'} description={completed ? 'Read-only until reopened' : 'Work-plan edits stay private until you apply them.'}
        action={<><button type="button" className={controlClass} onClick={()=>advanced ? returnToWorkplan() : openAdvanced()}>{advanced ? 'Back to tasks' : 'Advanced editor'}</button><DirectoryStatus state={record.state} operationalStatus={operationalStatus} />{dirty && <span className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">Draft changed</span>}</>}/>
      {!gateReady && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">Prerequisites need review before resuming or completing this project.</p>}
      {drafts.recoverable && (
        <section role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-300 bg-violet-50 p-3 text-xs text-violet-900 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-100">
          <div><p className="font-semibold">A private work-plan draft is available.</p><p className="mt-1">Last saved: {new Date(drafts.recoverable.updatedAt).toLocaleString('en-US', {timeZone:'America/Chicago'})}. {drafts.rebase ? 'Review the conflicting fields below.' : drafts.recoverable.baseRevision !== savedRevision ? 'Its saved baseline needs reconciliation before it can be restored.' : 'Restore it to continue editing.'}</p></div>
          <div className="flex flex-wrap gap-2"><button type="button" className={controlClass} disabled={Boolean(drafts.rebase) || drafts.recoverable.baseRevision !== savedRevision} onClick={drafts.restore}>Restore draft</button><button type="button" className={controlClass} onClick={() => { const blob = new Blob([JSON.stringify(drafts.recoverable?.body,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`bivi-project-${id}-draft.json`;link.click();URL.revokeObjectURL(url); }}>Export draft</button><button type="button" className={controlClass} onClick={() => { if (window.confirm('Permanently delete your saved draft and load the latest saved project?')) void controller.discard().then(ok => { if (ok) setMessage('The private draft was discarded. The latest saved project is loaded.'); }); }}>Discard draft</button></div>
        </section>
      )}
      {drafts.rebase && <section aria-label="Resolve project draft conflicts" className="space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"><div><p className="font-semibold">The saved project changed. Resolve these fields before saving.</p><p className="mt-1">Nonconflicting edits are already combined. Each choice applies only to the field shown.</p></div>{drafts.rebase.conflicts.map(conflict => <article key={conflict.path} className="rounded-md border border-amber-300/70 bg-background/70 p-3 dark:border-amber-800"><p className="font-semibold">{conflict.label}</p><div className="mt-2 grid gap-2 md:grid-cols-2"><div><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Your draft</p><pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap break-words rounded bg-muted p-2">{JSON.stringify(conflict.draft, null, 2)}</pre><button type="button" className={`${controlClass} mt-2`} onClick={() => drafts.chooseConflict(conflict.path, 'draft')}>Keep my edit</button></div><div><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Latest saved value</p><pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap break-words rounded bg-muted p-2">{JSON.stringify(conflict.latest, null, 2)}</pre><button type="button" className={`${controlClass} mt-2`} onClick={() => drafts.chooseConflict(conflict.path, 'latest')}>Use saved value</button></div></div></article>)}</section>}
      {drafts.conflict && !drafts.rebase && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">The private draft’s original saved baseline is unavailable, so it cannot be merged safely. Export it to keep a copy, then discard it only if you want to load the latest saved project.</p>}
      {drafts.error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"><p>Draft reconciliation unavailable: {drafts.error}. Your edits remain in the editor until a discard is confirmed.</p><button type="button" className={controlClass} disabled={busy} onClick={() => { if (window.confirm('Discard the private draft and load the latest saved project?')) void controller.discard().then(ok => { if (ok) setMessage('The private draft was discarded. The latest saved project is loaded.'); }); }}>Discard draft and load latest</button></div>}
      {serverBlockers.length > 0 && <section role="alert" className="space-y-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-950 dark:border-red-800 dark:bg-red-950 dark:text-red-100"><p className="font-semibold">Complete these tasks before completing this milestone.</p>{serverBlockers.map(milestone => <div key={milestone.milestoneId}><p className="font-medium">{milestone.milestoneTitle}{milestone.needsTask ? ' — add at least one linked task' : ''}</p><ul className="ml-4 mt-1 list-disc">{milestone.tasks.map(task => <li key={task.taskId}><a className="underline" href={`#${taskDomId(task.taskId)}`} onClick={event=>{event.preventDefault();openAdvanced(task.taskId);}}>{task.title}</a>{task.taskIncomplete ? ' — task is not completed' : ''}{task.subtasks.map(subtask => <span key={subtask.id}>; unfinished subtask: {subtask.title}</span>)}</li>)}</ul></div>)}</section>}
      {workflowGate && <section role="alert" aria-label="Task workflow requirement" className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
        <p className="font-semibold">{workflowGate.title}: {workflowGate.requirement}</p>
        <p>The status change is still a private draft. <button type="button" className="underline" onClick={()=>focusTaskDetails(workflowGate.taskId)}>Open the highlighted task settings</button> to review its saved and draft values.</p>
        <ul className="ml-4 list-disc">{workflowGate.correctiveActions.map(action=><li key={action}>{action}</li>)}</ul>
        {!workflowGate.overrideAvailable&&<p className="font-medium">This action is available only to a designated project workflow admin, and only for a new client-task completion transition.</p>}
      </section>}


      <div id="project-workplan-cards" tabIndex={-1} className="scroll-mt-24 focus:outline-none">
      <ProjectMilestoneBoard
        advanced={advanced}
        focusTaskId={overviewTaskId}
        focusTaskRequest={taskFocusRequest}
        today={today}
        id={id}
        userId={userId}
        revision={savedRevision}
        body={body}
        disabled={locked || drafts.conflict}
        dirty={dirty}
        sidecarReady={drafts.ready && !drafts.recoverable && !drafts.conflict}
        onTaskChange={editTask}
        onMilestoneChange={editMilestone}
        onAddTask={milestoneId=>{const taskId=addTask(milestoneId);if(taskId)focusTaskDetails(taskId);}}
        onAddMilestone={()=>{const milestoneId=addMilestone();if(milestoneId)openAdvanced(undefined,milestoneId);}}
        onEditTask={taskId=>focusTaskDetails(taskId)}
        onEditMilestone={milestoneId=>openAdvanced(undefined,milestoneId)}
        taskControls={taskControls}
        workflowGate={workflowGate}
        workflowOverrideReason={workflowOverrideReason}
        onWorkflowOverrideReason={setWorkflowOverrideReason}
        onOverrideTaskStatus={()=>void overrideTaskStatus()}
        overrideReady={drafts.ready&&drafts.recoverable===null&&!drafts.conflict}
        busy={busy}
        onRemoveTask={removeTask}
        onBulkTasks={bulkMilestoneTasks}
      />
      </div>

      <section id="project-advanced-editor" tabIndex={-1} hidden={!advanced} aria-label="Advanced work-plan editor" className="scroll-mt-24 rounded-xl border border-border bg-card focus:outline-none">
        <p className="p-3 text-xs text-muted-foreground">Detailed task and milestone controls share your current draft. Use Back to tasks &amp; milestones to return without discarding edits.</p>
      <div>
        <div className="grid min-w-0 items-start gap-3 lg:grid-cols-2">
      <section className="min-w-0 rounded-xl border border-border bg-card">
        <SectionTitle
          title="Project details"
          detail="Legacy owner label and internal notes"
          action={<Link className="text-[11px] font-medium underline" href={`/projects/${id}?tab=brief`}>Name and verified owner in Brief</Link>}
        />

        <div className="grid gap-3 px-4 py-3 sm:grid-cols-2 xl:grid-cols-1">

          <label className="block min-w-0 text-[11px] font-medium text-muted-foreground">
            Legacy owner label · not verified

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

          <details className="rounded-lg border border-border px-3 py-2 sm:col-span-2 xl:col-span-1">
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

      <section className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-medium">Milestone editing is now in Lifecycle.</p>
        <Link href={`/projects/${id}?tab=phases`} className="mt-2 inline-flex rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted">Open Lifecycle milestones</Link>
      </section>

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
                <Link href={`/projects/${id}?tab=brief`} className="inline-flex min-h-9 items-center rounded-md border border-border px-3 text-xs font-medium hover:bg-muted">Change operational status in Brief</Link>

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

            {record.state === 'on_hold' && <Link href={`/projects/${id}?tab=brief`} className="inline-flex min-h-9 items-center rounded-md border border-border px-3 text-xs font-medium hover:bg-muted">Resume through operational status in Brief</Link>}

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
              ? 'Unsaved task & milestone fields'
              : 'Task & milestone fields saved'}
          </span>
          {!completed && <p className="mt-1 text-[11px] text-muted-foreground" role="status">Draft: {drafts.state === 'saving' ? 'Saving…' : drafts.state === 'saved' ? 'Autosaved privately' : drafts.state === 'pending' ? 'Pending autosave' : drafts.state === 'loading' ? 'Checking saved drafts…' : drafts.state === 'conflict' ? 'Conflict — review required' : drafts.state === 'error' ? 'Save unavailable' : 'Ready to autosave'}</p>}

          {completed && (
            <span className="ml-2 text-muted-foreground">
              Read-only until reopened
            </span>
          )}

          {blocked && (
            <p className="mt-1 text-destructive">
              The latest saved project could not be loaded after a revision conflict. Reload to reconcile before saving.
            </p>
          )}

          {message && (
            <p
              role="status"
              className={`mt-1 ${message.toLowerCase().includes('saved') && !message.toLowerCase().includes('could not') ? 'text-emerald-700 dark:text-emerald-300' : 'text-destructive'}`}
            >
              {message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className={controlClass} disabled={busy} onClick={()=>void controller.checkUncertainSave()}>Refresh saved data</button>

          {blocked ? (
            <button
              type="button"
              className={controlClass}
              onClick={() =>
                void controller.checkUncertainSave()
              }
            >
              <RotateCcw size={14} />
              Reload
            </button>
          ) : (
            <>
              {saveOutcomeUnknown && <button type="button" className={controlClass} disabled={busy} onClick={() => void controller.checkUncertainSave()}>Check save status</button>}
              {dirty && !completed && (
                <button
                  type="button"
                  className={controlClass}
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        'Discard work-plan edits, remove the private draft, and load the latest saved project?'
                      )
                    ) {
                      void controller.discard().then(ok => {
                        if (ok) {
                          setMessage('Work-plan edits were discarded. The latest saved project is loaded.');
                          setServerBlockers([]);
                          setSaveOutcomeUnknown(false);
                        }
                      });
                    }
                  }}
                >
                  <RotateCcw size={14} />
                  Discard changes
                </button>
              )}

              <Button
                type="button"
                variant="outline"
                disabled={!dirty || busy || saveOutcomeUnknown || !drafts.ready || Boolean(drafts.recoverable) || drafts.conflict}
                onClick={() => void drafts.saveDraft()}
                className="gap-2"
              >
                Save draft
              </Button>
              <Button
                type="button"
                disabled={!dirty || locked || saveOutcomeUnknown || !drafts.ready || Boolean(drafts.recoverable) || drafts.conflict}
                onClick={() => void command('save')}
                className="gap-2"
              >
                <Save size={15} />
                {busy ? 'Saving…' : 'Save all'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
