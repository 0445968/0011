'use client';

import { useState } from 'react';
import { ChevronDown, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import type { ProjectBody } from '@/lib/projects/schema';
import { projectPhaseLabels, projectPhaseOrder } from '@/lib/projects/lifecycle-schema';
import { groupMilestones, milestoneWork, unassignedTasks } from '@/lib/projects/hierarchy-board';
import type { ProjectHierarchyResponse } from '@/lib/projects/hierarchy-schema';
import { ProjectTaskStateIcon } from './DirectoryIndicators';
import { useProjectHierarchy } from './useProjectHierarchy';
import { useWorkspaceUnsavedChanges } from '../workspace/WorkspaceNavigationGuard';

type Task = ProjectBody['tasks'][number];
type Milestone = ProjectBody['milestones'][number];
type Subtask = ProjectHierarchyResponse['subtasks'][number];

const fieldClass = 'min-w-0 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50';
const actionClass = 'inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50';

function SubtaskEditor({item, disabled, update, remove}: {
  item: Subtask; disabled: boolean;
  update: (item: Subtask, changes: {title: string; status: Subtask['status']; dueOn: string | null}) => Promise<boolean>;
  remove: (item: Subtask) => Promise<boolean>;
}) {
  const [title, setTitle] = useState(item.title);
  const [dueOn, setDueOn] = useState(item.dueOn ?? '');
  const hasEdits = title !== item.title || dueOn !== (item.dueOn ?? '');
  async function commit() {
    if (!hasEdits) return true;
    if (!title.trim()) return false;
    return update(item, {title: title.trim(), status: item.status, dueOn: dueOn || null});
  }
  useWorkspaceUnsavedChanges(hasEdits, `Subtask: ${item.title}`, async () => {
    if (!(await commit())) throw new Error('Subtask edits could not be saved.');
  });
  return <li className="grid gap-2 border-t border-border/50 py-2 sm:grid-cols-[minmax(0,1fr)_108px_120px_auto] sm:items-center">
    <div className="flex min-w-0 items-center gap-2 pl-4">
      <ProjectTaskStateIcon status={item.status} />
      <input aria-label={`Subtask title: ${item.title}`} className={fieldClass} value={title} maxLength={300} disabled={disabled} onChange={event => setTitle(event.target.value)} onBlur={() => {void commit();}} onKeyDown={event => {if (event.key === 'Enter') event.currentTarget.blur();}} />
    </div>
    <select aria-label={`Status for subtask ${item.title}`} className={fieldClass} disabled={disabled} value={item.status} onChange={event => {void update(item, {title:item.title,status:event.target.value as Subtask['status'],dueOn:item.dueOn});}}>
      <option value="todo">To do</option><option value="doing">In progress</option><option value="blocked">Blocked</option><option value="done">Done</option>
    </select>
    <input type="date" aria-label={`Due date for subtask ${item.title}`} className={fieldClass} disabled={disabled} value={dueOn} onChange={event => setDueOn(event.target.value)} onBlur={() => {void commit();}} />
    <button type="button" className={actionClass} disabled={disabled} aria-label={`Delete subtask ${item.title}`} onClick={() => {if (window.confirm(`Delete subtask “${item.title}”?`)) void remove(item);}}><Trash2 size={13} aria-hidden /></button>
  </li>;
}

export function ProjectMilestoneBoard({id, revision, body, disabled, dirty, sidecarReady, onTaskChange, onMilestoneChange, onAddTask, onBulkTasks}: {
  id: string;
  revision: number;
  body: ProjectBody;
  disabled: boolean;
  dirty: boolean;
  sidecarReady: boolean;
  onTaskChange: (index:number, changes: Partial<Task>) => void;
  onMilestoneChange: (index:number, changes: Partial<Milestone>) => void;
  onAddTask: (milestoneId:string|null) => void;
  onBulkTasks: (milestoneId:string, status:'done'|'todo') => void;
}) {
  const hierarchy = useProjectHierarchy(id, revision, true);
  const [newSubtaskFor, setNewSubtaskFor] = useState<string|null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const canEditSidecar = !disabled && !dirty && sidecarReady && !hierarchy.busy && !hierarchy.conflict && hierarchy.data?.projectRevision === revision;
  const groups = groupMilestones(body, hierarchy.data?.milestonePhases ?? []);
  const orphans = unassignedTasks(body);

  function changeTask(task: Task, changes: Partial<Task>) {
    const index = body.tasks.findIndex(row => row.id === task.id);
    if (index < 0) return;
    onTaskChange(index, changes);
    if ((changes.status === 'doing' || changes.status === 'blocked') && task.milestoneId) {
      const milestoneIndex = body.milestones.findIndex(item => item.id === task.milestoneId);
      if (milestoneIndex >= 0 && body.milestones[milestoneIndex].status === 'planned') {
        onMilestoneChange(milestoneIndex, {status:'in_progress'});
      }
    }
  }
  async function addSubtask(taskId: string) {
    if (!canEditSidecar || !newSubtaskTitle.trim()) return;
    const success = await hierarchy.save({action:'add_subtask', taskId, subtaskId:crypto.randomUUID(), title:newSubtaskTitle.trim(), status:'todo', dueOn:null});
    if (success) { setNewSubtaskTitle(''); setNewSubtaskFor(null); }
  }
  async function updateSubtask(item:Subtask, changes:{title:string;status:Subtask['status'];dueOn:string|null}) {
    return hierarchy.save({action:'update_subtask', taskId:item.taskId, subtaskId:item.id, expectedSubtaskRevision:item.revision, ...changes});
  }
  async function removeSubtask(item:Subtask) {
    return hierarchy.save({action:'remove_subtask',taskId:item.taskId,subtaskId:item.id,expectedSubtaskRevision:item.revision});
  }
  function taskRow(task: Task) {
    const children = hierarchy.data?.subtasks.filter(subtask => subtask.taskId === task.id) ?? [];
    const isSaved = body.tasks.some(row => row.id === task.id) && !dirty;
    return <li key={task.id} className="border-t border-border/70 px-3 py-2.5">
      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_116px_132px] md:items-center">
        <div className="flex min-w-0 items-center gap-2"><ProjectTaskStateIcon status={task.status} /><input className={fieldClass} aria-label={`Task title: ${task.title}`} maxLength={300} value={task.title} disabled={disabled} onChange={event => changeTask(task,{title:event.target.value})} /></div>
        <select className={fieldClass} aria-label={`Status for task ${task.title}`} value={task.status} disabled={disabled} onChange={event => changeTask(task,{status:event.target.value as Task['status']})}><option value="todo">To do</option><option value="doing">In progress</option><option value="blocked">Blocked</option><option value="done">Done</option></select>
        <input className={`${fieldClass} ${task.dueOn && task.dueOn < new Date().toISOString().slice(0,10) && task.status !== 'done' ? 'text-red-600 dark:text-red-400' : ''}`} type="date" aria-label={`Due date for task ${task.title}`} value={task.dueOn ?? ''} disabled={disabled} onChange={event => changeTask(task,{dueOn:event.target.value || null})} />
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 pl-6 text-[11px] text-muted-foreground"><span>{task.owner || 'No owner label'}</span><span>{children.length} subtasks</span></div>
      <details className="mt-2 pl-6 text-xs"><summary className="cursor-pointer text-muted-foreground">Subtasks <ChevronDown aria-hidden className="inline h-3 w-3" /></summary>
        <ul className="mt-2">{children.map(item => <SubtaskEditor key={`${item.id}:${item.revision}`} item={item} disabled={!canEditSidecar} update={updateSubtask} remove={removeSubtask} />)}</ul>
        {!children.length && <p className="py-2 text-muted-foreground">No subtasks for this task.</p>}
        {newSubtaskFor === task.id ? <div className="mt-2 flex flex-wrap gap-2"><input autoFocus aria-label="New subtask title" className={`${fieldClass} flex-1`} maxLength={300} value={newSubtaskTitle} disabled={!canEditSidecar} onChange={event => setNewSubtaskTitle(event.target.value)} onKeyDown={event => {if(event.key === 'Enter'){event.preventDefault();void addSubtask(task.id);}}}/><button type="button" className={actionClass} disabled={!canEditSidecar || !newSubtaskTitle.trim()} onClick={() => {void addSubtask(task.id);}}>Add</button><button type="button" className={actionClass} onClick={() => setNewSubtaskFor(null)}>Cancel</button></div> : <button type="button" className={actionClass} disabled={!canEditSidecar || !isSaved || children.length >= 50} onClick={() => {setNewSubtaskTitle('');setNewSubtaskFor(task.id);}}><Plus size={13} aria-hidden/>Add subtask</button>}
      </details>
    </li>;
  }

  return <section aria-label="Milestone-centered work plan" className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-base font-semibold">Milestones and nested work</h2><p className="mt-1 text-xs text-muted-foreground">Task and milestone fields use Save All; phase assignments and subtasks save immediately.</p></div><button type="button" className={actionClass} disabled={hierarchy.busy} onClick={() => {void hierarchy.load();}}><RefreshCcw size={13} aria-hidden /> Refresh hierarchy</button></div>
    {hierarchy.error && <p role="alert" className="rounded-lg border border-red-300 px-3 py-2 text-xs text-red-700 dark:text-red-300">{hierarchy.error}</p>}
    {hierarchy.conflict && <p role="alert" className="text-xs text-red-700 dark:text-red-300">Another change was saved. Refresh the hierarchy before editing.</p>}
    {dirty && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">Save All project edits before changing phase links or subtasks. Your work-plan draft remains available.</p>}
    {!hierarchy.data && !hierarchy.error && <p className="text-xs text-muted-foreground">Loading milestone phases and subtasks…</p>}
    {groups.map(group => <div key={group.phase ?? 'unassigned'} className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">{group.phase ? projectPhaseLabels[group.phase] : 'Unassigned milestones'}</h3>
      <div className="flex snap-x gap-3 overflow-x-auto pb-2">{group.milestones.map(milestone => {
        const index = body.milestones.findIndex(item => item.id === milestone.id);
        const work = milestoneWork(body,milestone.id,hierarchy.data?.subtasks ?? []);
        const phases = hierarchy.data?.milestonePhases.filter(link => link.milestoneId === milestone.id).map(link => link.phase) ?? [];
        return <article key={milestone.id} id={`board-${encodeURIComponent(milestone.id)}`} className="w-full min-w-0 shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card sm:w-[430px]">
          <div className="space-y-3 p-3">
            <div className="flex items-center gap-2"><ProjectTaskStateIcon status={milestone.status} /><input className={`${fieldClass} font-semibold`} aria-label={`Milestone title ${milestone.title}`} maxLength={300} value={milestone.title} disabled={disabled} onChange={event => onMilestoneChange(index,{title:event.target.value})}/></div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">{work.taskDone}/{work.tasks.length} tasks completed · {work.subtaskDone}/{work.subtasks.length} subtasks</span><span className="font-medium">{work.taskPercent === null ? 'No tasks' : `${work.taskPercent}%`}</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`${milestone.title} task completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={work.taskPercent ?? undefined}><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600" style={{width:`${work.taskPercent ?? 0}%`}}/></div>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_142px]"><select className={fieldClass} disabled={disabled} value={milestone.status} aria-label={`Status for milestone ${milestone.title}`} onChange={event => onMilestoneChange(index,{status:event.target.value as Milestone['status']})}><option value="planned">Planned</option><option value="in_progress">In progress</option><option value="done">Completed</option></select><input type="date" className={fieldClass} value={milestone.dueOn ?? ''} disabled={disabled} aria-label={`Due date for milestone ${milestone.title}`} onChange={event => onMilestoneChange(index,{dueOn:event.target.value || null})}/></div>
            {work.allTasksDone && milestone.status !== 'done' && <button type="button" disabled={disabled} className={`${actionClass} border-emerald-300 text-emerald-700 dark:text-emerald-300`} onClick={() => {if(window.confirm('All tasks are done. Mark this milestone completed?')) onMilestoneChange(index,{status:'done'});}}>Mark milestone completed?</button>}
            <details className="text-xs"><summary className="cursor-pointer font-medium text-violet-700 dark:text-violet-300">Phase assignments ({phases.length})</summary><div className="mt-2 flex flex-wrap gap-2">{projectPhaseOrder.map(phase => <label key={phase} className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px]"><input type="checkbox" checked={phases.includes(phase)} disabled={!canEditSidecar} onChange={event => {const next=event.target.checked ? [...phases,phase] : phases.filter(item => item !== phase); void hierarchy.save({action:'set_milestone_phases',milestoneId:milestone.id,phases:projectPhaseOrder.filter(item => next.includes(item))});}}/>{projectPhaseLabels[phase]}</label>)}</div></details>
          </div>
          <div className="border-t border-border bg-muted/20"><div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"><h4 className="text-xs font-semibold">Tasks</h4><div className="flex flex-wrap gap-1"><button type="button" className={actionClass} disabled={disabled || !work.tasks.length} onClick={() => {if(window.confirm('Mark all tasks in this milestone complete?')) onBulkTasks(milestone.id,'done');}}>Complete all</button><button type="button" className={actionClass} disabled={disabled || !work.tasks.length} onClick={() => {if(window.confirm('Mark all tasks in this milestone not started?')) onBulkTasks(milestone.id,'todo');}}>Unmark all</button><button type="button" className={actionClass} disabled={disabled || body.tasks.length>=100} onClick={() => onAddTask(milestone.id)}><Plus size={13} aria-hidden />Task</button></div></div><ul>{work.tasks.map(taskRow)}</ul>{!work.tasks.length && <p className="px-3 py-3 text-xs text-muted-foreground">No tasks yet. Add the first task to this milestone.</p>}</div>
        </article>;
      })}</div>
    </div>)}
    {!body.milestones.length && <div className="rounded-xl border border-dashed border-border p-5 text-xs text-muted-foreground">No milestones yet. Expand Advanced work-plan editor to create your first milestone.</div>}
    {!!orphans.length && <section className="rounded-xl border border-border bg-card"><div className="flex justify-between gap-2 p-3"><h3 className="text-sm font-semibold">Tasks without a milestone</h3><button className={actionClass} type="button" disabled={disabled || body.tasks.length>=100} onClick={() => onAddTask(null)}><Plus size={13} aria-hidden />Task</button></div><ul>{orphans.map(task => <li key={task.id} className="space-y-2 border-t border-border px-3 py-2"><div className="flex items-center gap-2"><ProjectTaskStateIcon status={task.status}/><span className="text-xs font-medium">{task.title}</span></div><select aria-label={`Assign milestone for ${task.title}`} className={fieldClass} disabled={disabled} value={task.milestoneId ?? ''} onChange={event => changeTask(task,{milestoneId:event.target.value || null})}><option value="">No milestone</option>{body.milestones.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></li>)}</ul></section>}
    <p className="text-[11px] text-muted-foreground">Phase links and subtasks require saved parent records. The advanced editor retains task notes, ownership labels, milestone removal and all existing controls. Phase approvals still occur in the Lifecycle section.</p>
  </section>;
}
