Warning: truncated output (original token count: 11047)
Total output lines: 1064


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
import {expectedMilestoneStatus} from '@/lib/projects/phase-status';
import {reorderProjectTasks} from '@/lib/projects/task-manual-order';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
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
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Bell,
  FileClock,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  projectBodySchema,
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
  savedToday: string;timezone?:string;asOf?:string;
  selectedTask?:string;
  selectedMilestone?:string;
  taskControls?: ProjectTaskControl[];
  isWorkflowAdmin?:boolean;
  id: string;
  userId: string;
  record: ProjectRecord | null;
  history: ProjectEvent[];
  gateReady: boolean;
  operationalStatus?: import('@/lib/projects/operational-status').OperationalStatus;
  projectTimezone?:string;
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
  savedToday,timezone,asOf,
  id,
  userId,
  record,
  gateReady,
  operationalStatus,
  projectTimezone,
  selectedTask,
  selectedMilestone,
  taskControls = [],
  isWorkflowAdmin=false,
}: Props) {
  const router = useRouter();

  /* =======================================================
     EDITOR STATE
     ======================================================= */

  const controller=useProjectEditingController(id,record,Boolean(selectedMilestone),userId);
  const {body,savedBody,savedRevision,setBody,busy,setBusy,blocked,setBlocked,
    message,setMessage,saveOutcomeUnknown,setSaveOutcomeUnknown,serverBlockers,setServerBlockers,workflowGate,setWorkflowGate,dirty,drafts,advanced,setAdvanced,savePhase}=controller;
  const [lastReadMessage,setLastReadMessage]=useState('');
  const [reason,setReason]=useState('');
  const [workflowOverrideReason,setWorkflowOverrideReason]=useState('');
  const [overviewTaskId,setOverviewTaskId]=useState<string|null>(selectedTask??null);
  const [taskFocusRequest,setTaskFocusRequest]=useState(0);
  useEffect(()=>{if(selectedTask){setOverviewTaskId(selectedTask);setTaskFocusRequest(value=>value+1);}},[selectedTask]);
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

  const markWorkspaceSaved = useWorkspaceUnsavedChanges(dirty||Boolean(drafts.recoverable), 'Project work plan', async () => {
    const saved = await command('save');
    if (saved !== true) throw new Error('Project changes were not saved. Review the editor message.');
  },async()=>{if(!await controller.discard())throw new Error('Private draft discard could not be confirmed. Your edits remain available.');},async()=>{if(!await drafts.saveDraft())throw new Error('Draft could not be saved. Stay to keep your edits.');});

  // Private draft backups are handled by the controller. Canonical saves
  // require Save all changes or Save task in the full editor.

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
    setWorkflowGate(current=>current?.taskId===body?.tasks[index]?.id&&changes.status&&changes.status!=='done'?null:current);
    setBody((previous) => previous ? {
      ...previous,
      tasks: previous.tasks.map((task, i) => {
        if(i!==index)return task;
        const control=taskControls.find(row=>row.taskId===task.id);
        const requested=changes.status==='done'&&control?.requiresStaffReview&&(!isWorkflowAdmin||task.status!=='in_review')?'in_review':changes.status;
        return {...task,...changes,...(requested?{status:requested}:{})};
      }),
    } : previous);
  }

  /* =======================================================
     MULTI-TASK DRAFT EDITING
     ======================================================= */

  function bulkEditTasks(taskIds:string[],changes:Partial<Task>){
    if(!body||locked||drafts.conflict||saveOutcomeUnknown||!taskIds.length)return;
    const selected=new Set(taskIds);
    setBody(previous=>{
      if(!previous)return previous;
      const candidate={...previous,tasks:previous.tasks.map(task=>{
        if(!selected.has(task.id))return task;
        const control=taskControls.find(row=>row.taskId===task.id);
        const status=changes.status==='done'&&control?.requiresStaffReview&&(!isWorkflowAdmin||task.status!=='in_review')?'in_review':changes.status;
        return {...task,...changes,...(status?{status}:{})};
      })};
      if(!('status' in changes)&&!('milestoneId' in changes))return candidate;
      return {...candidate,milestones:candidate.milestones.map(milestone=>{
        if(milestone.status==='done')return milestone;
        const expected=expectedMilestoneStatus(candidate,milestone.id);
        // A milestone is only completed through its explicit review flow.
        return expected&&expected!=='done'&&expected!==milestone.status
          ? {...milestone,status:expected}:milestone;
      })};
    });
    setMessage(`${selected.size} task change${selected.size===1?'':'s'} added to the work-plan draft. Use Save all changes to apply them.`);
  }

  function bulkRemoveTasks(taskIds:string[]){
    if(!body||locked||drafts.conflict||saveOutcomeUnknown||!taskIds.length)return;
    const selected=new Set(taskIds);
    const dependent=taskControls.find(control=>selected.has(cont…3047 tokens truncated…or);
  const showMessageDot=hasTaskMessage&&lastReadMessage!==taskMessageKey;
  const toolbarIcon='relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-white hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 dark:bg-card';
  const toolbarActions=!overview?<div className="ml-1 flex shrink-0 items-center gap-1.5" aria-label="Workplan save and messages">
    <button type="button" className={toolbarIcon} title="Refresh saved data" aria-label="Refresh saved task data" disabled={busy} onClick={()=>void controller.checkUncertainSave()}><RefreshCw size={16}/></button>
    <button type="button" className={toolbarIcon.replace('w-9','w-auto')+' gap-1.5 px-3'} title={busy?'Saving changes':savePhase==='failed'?'Retry saving workplan':'Save all changes'} aria-label={savePhase==='failed'?'Retry saving workplan':'Save all changes'} disabled={!dirty||locked||saveOutcomeUnknown||!drafts.ready||Boolean(drafts.recoverable)||Boolean(drafts.conflict)} onClick={()=>void command('save')}><Save size={16}/><span className="hidden text-xs xl:inline">Save all changes</span></button>
    <details className="relative">
      <summary className={toolbarIcon+' cursor-pointer list-none [&::-webkit-details-marker]:hidden '+(draftPulse?'bivi-draft-pulse':'')} title="Draft changes" aria-label="Draft changes"><FileClock size={16}/>{dirty&&<span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400"/>}</summary>
      <div className="absolute right-0 z-50 mt-2 min-w-56 rounded-xl border border-border bg-white p-3 text-xs shadow-xl dark:bg-card">
        <p className="mb-2 font-medium">{drafts.recoverable?'Recovery draft awaiting review':dirty?'Draft changes — waiting for you to save':'All task changes saved'}</p>
        <p className="mb-3 text-muted-foreground">Private draft: {drafts.state==='saving'?'Saving…':drafts.state==='saved'?'Backed up':drafts.state==='pending'?'Pending':drafts.state==='conflict'?'Conflict — review required':drafts.state==='error'?'Unavailable':'Ready'}</p>
        <button type="button" className="block w-full rounded-lg px-2 py-2 text-left hover:bg-muted disabled:opacity-40" disabled={!dirty||busy||saveOutcomeUnknown||!drafts.ready||Boolean(drafts.recoverable)||Boolean(drafts.conflict)} onClick={()=>void drafts.saveDraft()}>Back up private draft</button>
        {drafts.recoverable&&<button type="button" className="block w-full rounded-lg px-2 py-2 text-left hover:bg-muted" onClick={()=>drafts.setRecoveryPrompt(true)}>Review available draft…</button>}
        {drafts.recoveryCopy&&<button type="button" disabled={dirty} title={dirty?'Back up or discard current edits before restoring an older recovery copy':undefined} className="block w-full rounded-lg px-2 py-2 text-left hover:bg-muted disabled:opacity-40" onClick={drafts.reviewRecovery}>Recover last autosaved version…</button>}
        <button type="button" className="block w-full rounded-lg px-2 py-2 text-left hover:bg-muted disabled:opacity-40" disabled={!dirty||busy} onClick={()=>{if(window.confirm('Discard work-plan edits and the private draft?'))void controller.discard();}}>Discard changes…</button>
      </div>
    </details>
    <details className="relative" onToggle={event=>{if(event.currentTarget.open)setLastReadMessage(taskMessageKey);}}>
      <summary className={toolbarIcon+' cursor-pointer list-none [&::-webkit-details-marker]:hidden'} title="Task messages" aria-label="Task messages"><Bell size={16}/>{showMessageDot&&<span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-blue-600"/>}</summary>
      <div className="absolute right-0 z-50 mt-2 w-[min(90vw,380px)] space-y-3 rounded-xl border border-border bg-white p-3 text-xs shadow-xl dark:bg-card">
        <p className="font-semibold">Task messages</p>
        {drafts.recoverable&&<div className="space-y-2 rounded-lg bg-violet-50 p-3 text-violet-950 dark:bg-violet-950 dark:text-violet-100">
          <p className="font-semibold">A private work-plan draft is available</p>
          <p>Last saved: {new Date(drafts.recoverable.updatedAt).toLocaleString('en-US',{timeZone:'America/Chicago'})}. Restore it to resume editing, or export a backup before discarding.</p>
          {drafts.recoverable.baseRevision!==savedRevision&&<p className="font-medium">The draft baseline differs from the saved project. Reconciliation is required.</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={controlClass} disabled={Boolean(drafts.rebase)||!drafts.recoverable.baseBody} onClick={drafts.restore}>Restore</button>
            <button type="button" className={controlClass} onClick={()=>{const blob=new Blob([JSON.stringify(drafts.recoverable?.body,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='bivi-project-'+id+'-draft.json';link.click();URL.revokeObjectURL(url);}}>Export</button>
            <button type="button" className={controlClass} onClick={()=>{if(window.confirm('Permanently discard the private draft?'))void controller.discard();}}>Discard</button>
          </div>
        </div>}
        {message&&<p role="status" className="rounded-lg bg-muted p-2">{message}</p>}
        {drafts.error&&<p role="alert" className="text-destructive">{drafts.error}</p>}
        {blocked&&<p role="alert" className="text-destructive">Revision conflict. Refresh to reconcile before saving.</p>}
        {saveOutcomeUnknown&&<p role="alert">Save result uncertain. Use Refresh to verify before retrying.</p>}
        {!hasTaskMessage&&<p className="text-muted-foreground">No new messages. Changes stay in your private draft until you save.</p>}
      </div>
    </details>
    <Dialog open={Boolean(drafts.recoverable)&&drafts.recoveryPrompt&&!drafts.rebase} onOpenChange={drafts.setRecoveryPrompt}><DialogContent><DialogTitle>Recover your work-plan draft?</DialogTitle><DialogDescription>A private autosave differs from the manually saved project. Restore it to review changes before saving. Discard keeps a recovery copy for your chosen retention period.</DialogDescription><p className="text-xs text-muted-foreground">Autosaved {drafts.recoverable?new Date(drafts.recoverable.updatedAt).toLocaleString():''}</p><div className="flex gap-2"><button type="button" className={controlClass} disabled={!drafts.recoverable?.baseBody} onClick={drafts.restore}>Recover draft</button><button type="button" className={controlClass} onClick={()=>void controller.discard()}>Use saved version</button><button type="button" className={controlClass} onClick={()=>drafts.setRecoveryPrompt(false)}>Review later</button></div></DialogContent></Dialog>
    {drafts.checkpointError&&<p role="alert" className="text-xs text-destructive">{drafts.checkpointError}</p>}
  </div>:null;

  /* =======================================================
     MAIN EDITOR
     ======================================================= */

  return (
    <>
    {overview}
    {((selectedTask&&!record.body.tasks.some(task=>task.id===selectedTask))||(selectedMilestone&&!record.body.milestones.some(item=>item.id===selectedMilestone)))&&<p role="status" className="text-xs text-amber-800 dark:text-amber-200">The linked item is no longer in the saved project. Browse Tasks &amp; Milestones below; any private draft remains recoverable.</p>}
    {overview&&<Link className="inline-flex rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted" href={`/projects/${id}?tab=plan`}>Open Tasks</Link>}
    <div hidden={Boolean(overview)} className="space-y-3 bg-white p-0 text-slate-950 dark:bg-background dark:text-foreground">

      {/* ===============================================
          COMPACT SUMMARY
          =============================================== */}

      {!gateReady && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">Prerequisites need review before resuming or completing this project.</p>}
      {drafts.rebase && <section aria-label="Resolve project draft conflicts" className="space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"><div><p className="font-semibold">The saved project changed. Resolve these fields before saving.</p><p className="mt-1">Nonconflicting edits are already combined. Each choice applies only to the field shown.</p></div>{drafts.rebase.conflicts.map(conflict => <article key={conflict.path} className="rounded-md border border-amber-300/70 bg-background/70 p-3 dark:border-amber-800"><p className="font-semibold">{conflict.label}</p><div className="mt-2 grid gap-2 md:grid-cols-2"><div><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Your draft</p><pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap break-words rounded bg-muted p-2">{JSON.stringify(conflict.draft, null, 2)}</pre><button type="button" className={`${controlClass} mt-2`} onClick={() => drafts.chooseConflict(conflict.path, 'draft')}>Keep my edit</button></div><div><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Latest saved value</p><pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap break-words rounded bg-muted p-2">{JSON.stringify(conflict.latest, null, 2)}</pre><button type="button" className={`${controlClass} mt-2`} onClick={() => drafts.chooseConflict(conflict.path, 'latest')}>Use saved value</button></div></div></article>)}</section>}
      {drafts.conflict && !drafts.rebase && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">The private draft’s original saved baseline is unavailable, so it cannot be merged safely. Export it to keep a copy, then discard it only if you want to load the latest saved project.</p>}
      {drafts.recoverable&&!drafts.rebase&&<p role="status" className="rounded-lg bg-violet-50 p-3 text-xs text-violet-950 dark:bg-violet-950 dark:text-violet-100">Review the available recovery draft before editing. <button type="button" className="underline" onClick={()=>drafts.setRecoveryPrompt(true)}>Review draft</button></p>}
      {drafts.error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"><p>Draft reconciliation unavailable: {drafts.error}. Your edits remain in the editor until a discard is confirmed.</p><button type="button" className={controlClass} disabled={busy} onClick={() => { if (window.confirm('Discard the private draft and load the latest saved project?')) void controller.discard().then(ok => { if (ok) setMessage('The private draft was discarded. The latest saved project is loaded.'); }); }}>Discard draft and load latest</button></div>}
      {serverBlockers.length > 0 && <section role="alert" className="space-y-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-950 dark:border-red-800 dark:bg-red-950 dark:text-red-100"><p className="font-semibold">Complete these tasks before completing this milestone.</p>{serverBlockers.map(milestone => <div key={milestone.milestoneId}><p className="font-medium">{milestone.milestoneTitle}{milestone.needsTask ? ' — add at least one linked task' : ''}</p><ul className="ml-4 mt-1 list-disc">{milestone.tasks.map(task => <li key={task.taskId}><a className="underline" href={`#${taskDomId(task.taskId)}`} onClick={event=>{event.preventDefault();openAdvanced(task.taskId);}}>{task.title}</a>{task.taskIncomplete ? ' — task is not completed' : ''}{task.subtasks.map(subtask => <span key={subtask.id}>; unfinished subtask: {subtask.title}</span>)}</li>)}</ul></div>)}</section>}
      {workflowGate && <section role="alert" aria-label="Task workflow requirement" className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
        <div className="flex items-start justify-between gap-3"><p className="font-semibold">{workflowGate.title}: {workflowGate.requirement}</p><button type="button" className="shrink-0 underline" onClick={()=>setWorkflowGate(null)}>Dismiss</button></div>
        <p>The status change is still a private draft. <button type="button" className="underline" onClick={()=>focusTaskDetails(workflowGate.taskId)}>Open the highlighted task settings</button> to review its saved and draft values.</p>
        <ul className="ml-4 list-disc">{workflowGate.correctiveActions.map(action=><li key={action}>{action}</li>)}</ul>
        {!workflowGate.overrideAvailable&&<p className="font-medium">This action is available only to a designated project workflow admin, and only for a new client-task completion transition.</p>}
      </section>}


      <div id="project-workplan-cards" tabIndex={-1} className="scroll-mt-24 focus:outline-none">
      <ProjectMilestoneBoard
        advanced={advanced}
        focusTaskId={overviewTaskId}
        focusTaskRequest={taskFocusRequest}
        today={today} timezone={projectTimezone??timezone} asOf={asOf}
        id={id}
        userId={userId}
        revision={savedRevision}
        body={body}
        disabled={locked || drafts.conflict || !drafts.ready || Boolean(drafts.recoverable)}
        dirty={dirty}
        sidecarReady={drafts.ready && !drafts.recoverable && !drafts.conflict}
        toolbarActions={toolbarActions}
        dirtyTaskIds={body.tasks.filter(task=>!savedBody?.tasks.some(saved=>saved.id===task.id&&JSON.stringify(saved)===JSON.stringify(task))).map(task=>task.id)}
        onTaskChange={editTask}
        onMilestoneChange={editMilestone}
        onDuplicateTask={duplicateTask}
        onAddTask={milestoneId=>{const taskId=addTask(milestoneId);if(taskId)focusTaskDetails(taskId);}}
        onAddMilestone={()=>router.push('/projects/'+id+'?tab=phases&newMilestone=1')}
        onEditTask={taskId=>focusTaskDetails(taskId)}
        onEditMilestone={milestoneId=>router.push('/projects/'+id+'?tab=phases&milestone='+encodeURIComponent(milestoneId))}
        taskControls={taskControls}
        isWorkflowAdmin={isWorkflowAdmin}
        workflowGate={workflowGate}
        workflowOverrideReason={workflowOverrideReason}
        onWorkflowOverrideReason={setWorkflowOverrideReason}
        onOverrideTaskStatus={()=>void overrideTaskStatus()}
        overrideReady={drafts.ready&&drafts.recoverable===null&&!drafts.conflict}
        busy={busy}
        onRemoveTask={removeTask}
        onBulkTasks={bulkMilestoneTasks}
        onBulkTaskChange={bulkEditTasks}
        onBulkTaskRemove={bulkRemoveTasks}
        onReorderTask={reorderTask}
        onSaveTask={taskId=>{void controller.save(taskId);}}
        taskSaveDisabled={locked||saveOutcomeUnknown||!drafts.ready||Boolean(drafts.recoverable)||Boolean(drafts.conflict)}
        onSaveOrder={()=>{void command('save');}}
        onVerifyOrder={()=>{void controller.checkUncertainSave();}}
        orderSaveIssue={saveOutcomeUnknown
          ? 'The save result could not be verified. Verify the saved project before retrying.'
          : drafts.conflict ? 'The saved project changed. Resolve the draft conflicts before saving this order.'
          : savePhase==='failed'&&dirty ? message || 'The last save did not complete. Review work-plan requirements, then retry.' : null}
        orderVerifyRequired={saveOutcomeUnknown}
        orderDirty={Boolean(savedBody&&JSON.stringify(body.tasks.map(task=>[task.id,task.milestoneId]))!==JSON.stringify(savedBody.tasks.map(task=>[task.id,task.milestoneId])))}
      />
      </div>

      {/* Project governance, accepted activation scope and audit history now live in Brief. */}


    </div>
    </>
  );
}
