'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Check, CheckCheck, ChevronDown, ChevronRight, Clock3, Flag, Play, UserRoundPlus, Pencil, Plus, RefreshCcw, RotateCcw, Trash2 } from 'lucide-react';
import type { ProjectBody } from '@/lib/projects/schema';
import { projectPhaseLabels, type ProjectTaskControl } from '@/lib/projects/lifecycle-schema';
import { milestoneStats, nextStatus, workStatusOrder, milestoneStatusOrder, daysRemaining, remainingLabel, suggestedTaskPriority, type WorkplanView } from '@/lib/projects/workplan-views';
import type { ProjectHierarchyResponse } from '@/lib/projects/hierarchy-schema';
import { useProjectHierarchy } from './useProjectHierarchy';
import { ProjectManagersButton, TaskMemberPicker, useProjectAssignments } from './ProjectAssignments';
import { expectedMilestoneStatus } from '@/lib/projects/phase-status';
import { ProjectTaskStateIcon } from './DirectoryIndicators';
import { useWorkspaceUnsavedChanges } from '../workspace/WorkspaceNavigationGuard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {TaskTags,useTaskPresentation} from './TaskPresentation';
import { TaskProductivity } from './TaskProductivity';
import { useProjectTaskSchedule } from './useProjectTaskSchedule';
import { hasMilestoneCompletionBlockers, milestoneCompletionBlockers } from '@/lib/projects/workplan-completion';
import { taskDomId } from '@/lib/tasks/links';
import { phaseColorFor } from '@/lib/projects/phase-colors';
import { useProjectPhaseColors } from './useProjectPhaseColors';
import { ProjectWorkplanToolbar } from './ProjectWorkplanToolbar';
import { emptyWorkplanFilters, groupWorkplanTasks, workplanMilestoneMatches, workplanTaskMatches, workplanTaskPhases, type WorkplanFilters, type TaskGrouping } from '@/lib/projects/workplan-filters';
import { ProfileImage } from '@/components/profile-images/ProfileImage';
import { ProjectLifecycleControls } from '@/components/admin/ProjectLifecycleControls';
import type { ProjectWorkflowGate } from '@/lib/projects/workplan-save-outcome';

type Task = ProjectBody['tasks'][number];
type Milestone = ProjectBody['milestones'][number];
type Subtask = ProjectHierarchyResponse['subtasks'][number];

const miniButton = 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40';
const dateClass = 'min-w-0 max-w-[150px] bg-transparent px-1 py-1 text-xs text-muted-foreground outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
const nameInput = 'w-full min-w-0 rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

type Prompt = { title: string; description: string; confirm: () => void; blockers?: ReturnType<typeof milestoneCompletionBlockers>; unavailable?: boolean };

function StatusButton({status, disabled, onChange, label}: {
  status: WorkplanStatus; disabled: boolean; onChange: () => void; label?:string;
}) {
  const text = status === 'done' ? 'Completed' : status === 'doing' || status === 'in_progress' ? 'In progress' : status === 'blocked' ? 'Blocked' : status === 'planned' ? 'Planned' : 'To do';
  return <button type="button" disabled={disabled} onClick={onChange} title={`Change status: ${text}`} aria-label={`Change ${label ?? 'item'} status from ${text}`} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 ${status === 'done' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : status === 'doing' || status === 'in_progress' ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200' : status === 'blocked' ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200' : 'border-border bg-muted/40 text-muted-foreground'}`}><ProjectTaskStateIcon status={status}/><span>{text}</span></button>;
}
type WorkplanStatus = Task['status'] | Milestone['status'];

function NameField({title, completed, disabled, large = false, onChange}: {
  title:string; completed?:boolean; disabled:boolean; large?:boolean; onChange:(title:string)=>void;
}) {
  const [editing,setEditing] = useState(false);
  return <div className="flex min-w-0 flex-1 items-center gap-1.5">
    {editing && !disabled ? <input autoFocus aria-label="Edit title" className={nameInput} value={title} maxLength={300} onChange={event=>onChange(event.target.value)} onBlur={()=>setEditing(false)} onKeyDown={event=>{if(event.key==='Enter')event.currentTarget.blur();}} />
      : <span className={`min-w-0 flex-1 break-words ${large ? 'text-lg font-semibold' : 'text-sm font-medium'} ${completed ? 'text-muted-foreground line-through' : ''}`}>{title}</span>}
    {!disabled && !editing && <button type="button" className={miniButton} aria-label={`Edit title: ${title}`} title="Edit title" onClick={()=>setEditing(true)}><Pencil size={14} aria-hidden /></button>}
  </div>;
}

function Remaining({dueOn,today,completed}:{dueOn:string|null;today:string;completed:boolean}) {
  const days=daysRemaining(dueOn,today);
  return <span className={`inline-flex items-center gap-1 text-xs tabular-nums ${!completed && days!==null && days<0 ? 'font-medium text-red-600 dark:text-red-400' : 'text-muted-foreground'}`} title={dueOn ?? 'No due date'}><Clock3 size={13} aria-hidden/>{completed ? dueOn?`Completed · due ${dueOn}`:'Completed' : remainingLabel(days)}</span>;
}

function SubtaskEditor({item,disabled,update,requestRemove,today}: {
  item:Subtask;disabled:boolean;update:(item:Subtask,changes:{title:string;status:Subtask['status'];dueOn:string|null})=>Promise<boolean>;requestRemove:(item:Subtask)=>void;today:string;
}) {
  const [baseline,setBaseline]=useState(item);
  const [title,setTitle]=useState(item.title);
  const [dueOn,setDueOn]=useState(item.dueOn??'');
  const [editing,setEditing]=useState(false);
  const dirty=title!==baseline.title||dueOn!==(baseline.dueOn??'');
  const stale=item.revision>baseline.revision;
  useEffect(()=>{if(!dirty&&item.revision>baseline.revision){setBaseline(item);setTitle(item.title);setDueOn(item.dueOn??'');}},[item,dirty,baseline.revision]);
  async function save() {if(!dirty)return true;if(stale||!title.trim())return false;const saved=await update(baseline,{title:title.trim(),status:baseline.status,dueOn:dueOn||null});if(saved)setBaseline({...baseline,title:title.trim(),dueOn:dueOn||null,revision:baseline.revision+1});return saved;}
  useWorkspaceUnsavedChanges(dirty,`Subtask: ${item.title}`,async()=>{if(!(await save()))throw new Error('Subtask could not save.');});
  return <li className="flex flex-wrap items-center gap-2 border-t border-border/60 px-3 py-2 text-xs sm:flex-nowrap">
    <div className="flex min-w-[160px] flex-1 items-center gap-2 pl-5"><button type="button" disabled={disabled||dirty||stale} onClick={()=>{void update(item,{title:item.title,status:nextStatus(item.status,workStatusOrder),dueOn:item.dueOn});}} className="rounded-full focus-visible:ring-2" aria-label={`Change subtask status: ${item.title}`}><ProjectTaskStateIcon status={item.status}/></button>
      {editing?<input autoFocus className={nameInput} value={title} maxLength={300} disabled={disabled} onChange={event=>setTitle(event.target.value)} onBlur={()=>{setEditing(false);void save();}} onKeyDown={event=>{if(event.key==='Enter')event.currentTarget.blur();}}/>:<span className={`min-w-0 flex-1 break-words ${item.status==='done'?'line-through text-muted-foreground':''}`}>{title}</span>}
      {!disabled&&!editing&&<button className={miniButton} type="button" aria-label={`Edit subtask ${title}`} onClick={()=>setEditing(true)}><Pencil size={13} aria-hidden/></button>}
    </div>
    <StatusButton label={`subtask ${title}`} status={item.status} disabled={disabled||dirty||stale} onChange={()=>{void update(item,{title:item.title,status:nextStatus(item.status,workStatusOrder),dueOn:item.dueOn});}}/>
    {stale&&dirty&&<span role="alert" className="text-[11px] text-amber-800 dark:text-amber-200">Saved subtask: {item.title}, due {item.dueOn??'unscheduled'}. Local edits retained. <button type="button" className="underline" onClick={()=>{setBaseline(item);setTitle(item.title);setDueOn(item.dueOn??'');}}>Use saved</button> <button type="button" className="underline" onClick={()=>setBaseline(item)}>Keep my edits after review</button></span>}
    <Remaining dueOn={item.dueOn} today={today} completed={item.status==='done'}/>
    <input type="date" className={dateClass} aria-label={`Subtask due date ${title}`} value={dueOn} disabled={disabled} onChange={event=>setDueOn(event.target.value)} onBlur={()=>{void save();}}/>
    <button type="button" className={miniButton} disabled={disabled} onClick={()=>requestRemove(item)} aria-label={`Remove subtask ${title}`} title="Remove subtask"><Trash2 size={14} aria-hidden/></button>
  </li>;
}

export function ProjectMilestoneBoard({id,revision,body,disabled,dirty,sidecarReady,onTaskChange,onMilestoneChange,onAddTask,onAddMilestone,onEditTask,onEditMilestone,taskControls,onBulkTasks,userId,today,focusTaskId,focusTaskRequest,workflowGate,workflowOverrideReason,onWorkflowOverrideReason,onOverrideTaskStatus,overrideReady,busy,onRemoveTask,advanced=false}: {
  advanced?:boolean;id:string;revision:number;body:ProjectBody;disabled:boolean;dirty:boolean;sidecarReady:boolean;today:string;focusTaskId?:string|null;focusTaskRequest?:number;
  onTaskChange:(index:number,changes:Partial<Task>)=>void;
  onMilestoneChange:(index:number,changes:Partial<Milestone>)=>void;
  onAddTask:(milestoneId:string|null)=>void;
  onAddMilestone:()=>void; onEditTask:(taskId:string)=>void; onEditMilestone:(milestoneId:string)=>void;
  taskControls:ProjectTaskControl[];
  onBulkTasks:(milestoneId:string,status:'done'|'todo')=>void;
  userId:string;
  workflowGate?:ProjectWorkflowGate|null;workflowOverrideReason:string;onWorkflowOverrideReason:(reason:string)=>void;onOverrideTaskStatus:()=>void;overrideReady:boolean;busy:boolean;onRemoveTask:(taskId:string)=>void;
}) {
  const presentation=useTaskPresentation(id,revision);
  const [tagFilter,setTagFilter]=useState('');
  const tagCatalog=[...new Set(presentation.rows.flatMap(row=>row.tags))].sort();
  const hierarchy=useProjectHierarchy(id,revision,true);
  const assignments=useProjectAssignments(id,revision);
  const [view,setView]=useState<WorkplanView>('tasks');
  const [filters,setFilters]=useState<WorkplanFilters>({...emptyWorkplanFilters});
  const [columns,setColumns]=useState<1|2|3>(1);
  const [grouping,setGrouping]=useState<TaskGrouping>('milestone');
  const [selectedTaskId,setSelectedTaskId]=useState<string|null>(null);
  const [openTasks,setOpenTasks]=useState<Record<string,boolean>>({});
  const [visitedTasks,setVisitedTasks]=useState<Record<string,boolean>>({});
  function openTask(taskId:string) {
    setFilters({...emptyWorkplanFilters}); setTagFilter(''); setView('tasks'); setGrouping('none');
    setSelectedTaskId(taskId); setVisitedTasks(previous=>({...previous,[taskId]:true})); setOpenTasks(previous=>({...previous,[taskId]:true}));
  }
  useEffect(()=>{if(focusTaskId)openTask(focusTaskId);},[focusTaskId,focusTaskRequest]);
  useEffect(()=>{if(selectedTaskId&&view==='tasks'){const row=document.getElementById(taskDomId(selectedTaskId));row?.focus({preventScroll:true});row?.scrollIntoView({block:'center',behavior:'smooth'});}},[selectedTaskId,focusTaskRequest,view,filters]);
  const [prompt,setPrompt]=useState<Prompt|null>(null);
  const [newSubtaskFor,setNewSubtaskFor]=useState<string|null>(null);
  const [newSubtaskTitle,setNewSubtaskTitle]=useState('');
  const [expanded,setExpanded]=useState<Record<string,boolean>>({});
  const schedule=useProjectTaskSchedule(id,revision);
  const phaseColors=useProjectPhaseColors(id,[]);
  const canEditSidecar=!disabled&&!dirty&&sidecarReady&&!hierarchy.busy&&!hierarchy.conflict&&hierarchy.data?.projectRevision===revision;
  const phaseLinks=hierarchy.data?.milestonePhases??[];
  const subtasks=hierarchy.data?.subtasks??[];
  const context={body,links:phaseLinks,controls:taskControls,assignments:assignments.data?.tasks??[],today};
  const matchingTasks=body.tasks.filter(task=>workplanTaskMatches(task,filters,context)&&(!tagFilter||presentation.rows.find(row=>row.task_id===task.id)?.tags.includes(tagFilter)));
  const matchingMilestones=body.milestones.filter(milestone=>workplanMilestoneMatches(milestone,filters,context)&&(!tagFilter||matchingTasks.some(task=>task.milestoneId===milestone.id)))
    .sort((a,b)=>Number(a.status==='done')-Number(b.status==='done'));
  const cardGrid=advanced?'grid grid-cols-1 items-start gap-3 xl:grid-cols-2':columns===1?'grid grid-cols-1 items-start gap-3':columns===2?'grid grid-cols-1 items-start gap-3 md:grid-cols-2':'grid grid-cols-1 items-start gap-3 md:grid-cols-2 xl:grid-cols-3';
  const memberOptions=[...new Map([...(assignments.data?.staff??[]),...(assignments.data?.clients??[])].map(person=>[person.id,person])).values()];
  const btn=(name:string, icon:ReactNode, action:()=>void, unavailable=false)=> <button type="button" className={miniButton} title={name} aria-label={name} disabled={unavailable} onClick={action}>{icon}</button>;
  const updateMilestone=(milestone:Milestone,changes:Partial<Milestone>)=>{const index=body.milestones.findIndex(item=>item.id===milestone.id);if(index>=0)onMilestoneChange(index,changes);};
  const updateTask=(task:Task,changes:Partial<Task>)=>{
    const index=body.tasks.findIndex(item=>item.id===task.id);if(index<0)return;
    onTaskChange(index,changes);
    // Synchronize both old and newly assigned milestones in the draft.
    const nextBody={...body,tasks:body.tasks.map(item=>item.id===task.id?{...item,...changes}:item)};
    const impacted=new Set([task.milestoneId,changes.milestoneId??task.milestoneId]);
    for(const milestoneId of impacted){
      if(!milestoneId)continue;
      const milestone=body.milestones.find(item=>item.id===milestoneId);
      if(!milestone||milestone.status==='done')continue;
      const next=expectedMilestoneStatus(nextBody,milestoneId);
      if(next&&next!==milestone.status)updateMilestone(milestone,{status:next});
      const tasks=nextBody.tasks.filter(item=>item.milestoneId===milestoneId);
      if(tasks.length&&tasks.every(item=>item.status==='done')&&task.status!=='done'){
        setPrompt({title:'Milestone ready for review',description:`All tasks in “${milestone.title}” are done. Completion still requires explicit review.`,confirm:()=>updateMilestone(milestone,{status:'done'})});
      }
    }
  };
  const updateSubtask=(item:Subtask,changes:{title:string;status:Subtask['status'];dueOn:string|null})=>hierarchy.save({action:'update_subtask',taskId:item.taskId,subtaskId:item.id,expectedSubtaskRevision:item.revision,...changes});
  const addSubtask=async(taskId:string)=>{if(!canEditSidecar||!newSubtaskTitle.trim())return false;const success=await hierarchy.save({action:'add_subtask',taskId,subtaskId:crypto.randomUUID(),title:newSubtaskTitle.trim(),status:'todo',dueOn:null});if(success){setNewSubtaskTitle('');setNewSubtaskFor(null);}return success;};
  useWorkspaceUnsavedChanges(Boolean(newSubtaskFor&&newSubtaskTitle.trim()),'New project subtask',async()=>{
    if(!newSubtaskFor||!canEditSidecar)throw new Error('Save the work plan before saving the new subtask.');
    if(!await addSubtask(newSubtaskFor))throw new Error('The new subtask was not saved. Review the hierarchy error.');
  });
  const removeSubtask=(item:Subtask)=>setPrompt({title:'Remove subtask?',description:`Delete “${item.title}”? This is recorded through the hierarchy audit trail.`,confirm:()=>{void hierarchy.save({action:'remove_subtask',taskId:item.taskId,subtaskId:item.id,expectedSubtaskRevision:item.revision});}});
  const assignment=(task:Task)=> <Popover><PopoverTrigger asChild><button type="button" disabled={disabled} className="max-w-[190px] truncate rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted" aria-label={`Assign milestone for ${task.title}`} title="Assign to a milestone">{body.milestones.find(item=>item.id===task.milestoneId)?.title??'No milestone'} <ChevronDown className="inline h-3 w-3" aria-hidden/></button></PopoverTrigger><PopoverContent align="start" className="max-h-64 w-64 overflow-auto p-2"><p className="mb-2 px-2 text-[11px] font-medium text-muted-foreground">Move task to milestone</p>{[{id:null,title:'No milestone'},...body.milestones].map(m=><button key={m.id??'none'} type="button" className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-xs hover:bg-muted" onClick={()=>updateTask(task,{milestoneId:m.id})}><span className="truncate">{m.title}</span>{task.milestoneId===m.id&&<Check size={14} aria-hidden/>}</button>)}</PopoverContent></Popover>;
  const taskRow=(task:Task)=>{
    const children=subtasks.filter(item=>item.taskId===task.id);
    const startOn=schedule.rows.get(task.id)?.start_on??null;
    const suggested=suggestedTaskPriority(startOn,task.dueOn,today,task.status==='blocked');
    return <details key={task.id} id={taskDomId(task.id)} tabIndex={-1} open={Boolean(openTasks[task.id])} onToggle={event=>{const open=event.currentTarget.open;if(open)setVisitedTasks(previous=>previous[task.id]?previous:{...previous,[task.id]:true});setOpenTasks(previous=>previous[task.id]===open?previous:{...previous,[task.id]:open});}} className={`group scroll-mt-24 min-w-0 rounded-lg transition-colors hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-ring ${selectedTaskId===task.id?'bg-primary/5':'open:bg-muted/20'}`}>
      <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-3 px-3 py-2 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
        <ChevronRight size={14} className="shrink-0 transition-transform group-open:rotate-90" aria-hidden/>
        <ProjectTaskStateIcon status={task.status}/>
        <span className="font-mono text-[10px] text-muted-foreground">{presentation.rows.find(row=>row.task_id===task.id)?.code??'Draft'}</span><span className="min-w-32 flex-1 font-medium">{task.title}</span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] capitalize">{taskControls.find(control=>control.taskId===task.id)?.priority??'No priority'}</span><span className="text-muted-foreground">{task.status.replace('_',' ')}</span>
        <span className="inline-flex items-center gap-1 text-muted-foreground"><Flag size={12} aria-hidden/>{task.dueOn||'No due date'}</span>
        {taskPeople(task)}
      </summary>
      {visitedTasks[task.id]&&<div className="space-y-3 px-3 pb-3 sm:pl-10">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button type="button" disabled={disabled} title="Change task status" aria-label={`Change status of ${task.title}`} className="rounded-full focus-visible:ring-2" onClick={()=>updateTask(task,{status:nextStatus(task.status,workStatusOrder)})}><ProjectTaskStateIcon status={task.status}/></button>
        <div className="min-w-[160px] flex-[2] basis-48"><NameField title={task.title} completed={task.status==='done'} disabled={disabled} onChange={title=>updateTask(task,{title})}/></div>
        <StatusButton status={task.status} disabled={disabled} onChange={()=>updateTask(task,{status:nextStatus(task.status,workStatusOrder)})} label={`task ${task.title}`}/>
        <div className="shrink-0">{assignment(task)}</div>
        <TaskMemberPicker taskId={task.id} controls={assignments} disabled={disabled||dirty||!sidecarReady} />
        <Remaining dueOn={task.dueOn} today={today} completed={task.status==='done'}/>
        <label className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"><button type="button" title="Choose start date" aria-label={`Choose start date for ${task.title}`} disabled={disabled||dirty||!sidecarReady} onClick={event=>{const input=event.currentTarget.parentElement?.querySelector('input');input?.focus();input?.showPicker?.();}}><Play size={12} aria-hidden/></button>Start <input type="date" className={dateClass} aria-label={`Start date for ${task.title}`} disabled={disabled||dirty||!sidecarReady||schedule.busy!==null} value={startOn??''} onChange={event=>void schedule.save(task.id,event.target.value||null,task.dueOn,dirty)}/></label>
        <label className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"><button type="button" title="Choose due date" aria-label={`Choose due date for ${task.title}`} disabled={disabled} onClick={event=>{const input=event.currentTarget.parentElement?.querySelector('input');input?.focus();input?.showPicker?.();}}><Flag size={12} aria-hidden/></button>Due <input type="date" className={dateClass} aria-label={`Due date for ${task.title}`} disabled={disabled} value={task.dueOn??''} onChange={event=>updateTask(task,{dueOn:event.target.value||null})}/></label>
        {suggested&&<span className="rounded-full border border-border px-2 py-1 text-[10px] text-muted-foreground" title="Suggested from the saved start date, deadline, and today">Suggested {suggested} priority</span>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-[11px] font-medium">Task notes / description<textarea aria-label={`Task notes and description for ${task.title}`} className="mt-1 min-h-20 w-full rounded-lg border border-input bg-background p-2 text-xs" maxLength={2000} disabled={disabled} value={task.notes} onChange={event=>updateTask(task,{notes:event.target.value})}/></label><div className="space-y-2 text-[11px] text-muted-foreground"><p>Milestone phases: {phaseLinks.filter(link=>link.milestoneId===task.milestoneId).map(link=>projectPhaseLabels[link.phase]).join(', ')||'None'}</p></div></div>
      <TaskTags projectId={id} projectRevision={revision} row={presentation.rows.find(row=>row.task_id===task.id)} catalog={tagCatalog} disabled={disabled||dirty||!sidecarReady} reload={presentation.load}/>
      <TaskProductivity projectId={id} taskId={task.id} taskTitle={task.title} revision={revision} disabled={disabled||dirty||!sidecarReady} userId={userId} />
      {workflowGate?.taskId===task.id&&<section role="alert" className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"><p className="font-semibold">{workflowGate.requirement}</p>{workflowGate.correctiveActions.map(action=><p key={action}>{action}</p>)}{workflowGate.overrideAvailable&&<><label className="block font-medium">Reason for overriding this completion review<textarea className="mt-1 min-h-16 w-full rounded-md border border-input bg-background p-2 text-xs" maxLength={2000} value={workflowOverrideReason} onChange={event=>onWorkflowOverrideReason(event.target.value)} disabled={busy}/></label><button type="button" className="min-h-9 rounded-lg bg-foreground px-3 text-xs font-medium text-background disabled:opacity-50" disabled={busy||!overrideReady||!workflowOverrideReason.trim()} onClick={onOverrideTaskStatus}>Override and change status</button></>}</section>}
      {(dirty||!sidecarReady)&&<p role="status" className="text-[11px] text-amber-800 dark:text-amber-200">Save or discard the work-plan draft before changing ownership, blockers or dependencies.</p>}
      <ProjectLifecycleControls id={id} controls={taskControls} tasks={body.tasks} events={[]} taskOnlyTaskId={task.id} taskOnlyDisabled={disabled||dirty||!sidecarReady} showTaskManagement={false}/>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2"><span className="text-[10px] text-muted-foreground">Remove is a draft change; dependent work must be reassigned first.{hierarchy.data&&children.length?` Remove the ${children.length} subtask${children.length===1?'':'s'} explicitly before removing this task.`:''}{!hierarchy.data?' Removal is unavailable until the hierarchy loads.':''}</span><button type="button" disabled={disabled||!hierarchy.data||children.length>0} onClick={()=>onRemoveTask(task.id)} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-destructive/40 px-2.5 text-xs text-destructive hover:bg-destructive/5 disabled:opacity-50"><Trash2 size={13} aria-hidden/>Remove task</button></div>
      <details className="mt-1 pl-6 text-xs"><summary className="cursor-pointer py-1 text-muted-foreground">Subtasks ({hierarchy.data?children.length:'loading'})</summary>
        <ul>{children.map(item=><SubtaskEditor key={item.id} item={item} disabled={!canEditSidecar} update={updateSubtask} requestRemove={removeSubtask} today={today}/>)}</ul>
        {newSubtaskFor===task.id?<div className="flex flex-wrap items-center gap-2 py-2"><input autoFocus className={nameInput} aria-label="New subtask title" maxLength={300} disabled={!canEditSidecar} value={newSubtaskTitle} onChange={e=>setNewSubtaskTitle(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void addSubtask(task.id);}}}/>{btn('Save subtask',<Check size={15}/>,()=>{void addSubtask(task.id);},!canEditSidecar||!newSubtaskTitle.trim())}{btn('Cancel',<RotateCcw size={15}/>,()=>setNewSubtaskFor(null))}</div>:<div>{btn('Add subtask',<Plus size={15}/>,()=>{setNewSubtaskFor(task.id);setNewSubtaskTitle('');},!canEditSidecar||children.length>=50||Boolean(newSubtaskTitle.trim()&&newSubtaskFor!==task.id))}</div>}
      </details>
      </div>}
    </details>;
  };
  const reviewMilestoneCompletion=(milestone:Milestone)=>{
    if(!hierarchy.data||hierarchy.data.projectRevision!==revision){
      setPrompt({title:'Milestone tasks could not be checked',description:'Refresh the saved task and subtask hierarchy before completing this milestone.',confirm:()=>{void hierarchy.load();},unavailable:true});
      return;
    }
    const blockers=milestoneCompletionBlockers(body,milestone.id,subtasks);
    setPrompt({title:'Complete milestone?',description:hasMilestoneCompletionBlockers(blockers)
      ?'Complete these tasks before completing this milestone.'
      :`Review “${milestone.title}” and confirm its completion.`,blockers,confirm:()=>updateMilestone(milestone,{status:'done'})});
  };
  const navigateToTask=(taskId:string)=>{openTask(taskId);setPrompt(null);};
  const taskPeople=(task:Task)=>{
    const assigned=assignments.data?.tasks.find(item=>item.task_id===task.id);
    const people=(assigned?.side==='client'?assignments.data?.clients:assignments.data?.staff)??[];
    return <span className="inline-flex items-center gap-1">{!assigned?.assignees.length?<span title="No members assigned" aria-label="No members assigned"><UserRoundPlus size={16}/></span>:assigned.assignees.map(personId=>{const person=people.find(item=>item.id===personId);return person?<span key={personId} title={person.label}><ProfileImage kind={assigned.side==='client'?'client':'staff'} subject={person.id} name={person.label} path={person.avatar_path} size="h-6 w-6"/><span className="sr-only">{person.label}</span></span>:null;})}</span>;
  };
  const dependencyPreview=(task:Task)=>{
    const dependencyId=taskControls.find(item=>item.taskId===task.id)?.dependsOn;
    if(!dependencyId)return null;
    const prerequisite=body.tasks.find(item=>item.id===dependencyId);
    const dependencyAssignment=assignments.data?.tasks.find(item=>item.task_id===dependencyId);
    const dependencyPeople=dependencyAssignment?.side==='client'?assignments.data?.clients:assignments.data?.staff;
    const assigneeNames=dependencyAssignment?.assignees.map(personId=>dependencyPeople?.find(person=>person.id===personId)?.label).filter(Boolean).join(', ');
    return <div className="flex flex-wrap items-center gap-2 px-3 pb-2 text-[11px] text-muted-foreground"><span>Requires</span>{prerequisite?<><button type="button" className="font-medium text-foreground hover:underline" onClick={()=>openTask(prerequisite.id)}>{prerequisite.title}</button>{taskPeople(prerequisite)}{assigneeNames&&<span>{assigneeNames}</span>}<span>{prerequisite.status==='done'?'Completed':'Incomplete'}</span></>:<span>Dependency unavailable</span>}</div>;
  };
  const taskCard=(task:Task)=> <article key={task.id} className="min-w-0">{taskRow(task)}{dependencyPreview(task)}</article>;
  const taskPreview=(task:Task)=><div key={task.id} className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-xs hover:bg-muted/40"><ProjectTaskStateIcon status={task.status}/><button type="button" className="min-w-0 flex-1 text-left hover:underline" onClick={()=>openTask(task.id)} aria-label={`Open task ${task.title}`}>{task.title}</button>{taskPeople(task)}<span className="inline-flex items-center gap-1 text-muted-foreground"><Flag size={12} aria-hidden/>{task.dueOn||'—'}</span></div>;
  const milestoneCard=(milestone:Milestone)=>{
    const stats=milestoneStats(body,milestone.id);
    const isOpen=expanded[milestone.id]===true;
    const phases=phaseLinks.filter(link=>link.milestoneId===milestone.id).map(link=>link.phase);
    return <article key={milestone.id} className={`min-w-0 self-start overflow-hidden rounded-xl ${milestone.status==='done'?'bg-muted/60':'bg-card'}`}>
      <div className="space-y-2 p-3">
        <div className="flex min-w-0 items-start gap-2">
          <button type="button" aria-expanded={isOpen} aria-label={`${isOpen?'Collapse':'Expand'} ${milestone.title}`} className={`${miniButton} mt-0.5`} onClick={()=>setExpanded(old=>({...old,[milestone.id]:!isOpen}))}>{isOpen?<ChevronDown size={17}/>:<ChevronRight size={17}/>}</button>
          <div className="min-w-0 flex-1"><span className="text-[9px] uppercase tracking-wide text-muted-foreground">Milestone</span><NameField title={milestone.title} completed={milestone.status==='done'} disabled={disabled} onChange={title=>updateMilestone(milestone,{title})}/><p className="mt-0.5 text-[10px] text-muted-foreground">{stats.done}/{stats.total} top-level tasks done</p></div>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 pl-9">
          <button type="button" onClick={()=>onEditMilestone(milestone.id)} className="min-h-8 rounded-lg border border-border px-2 text-[11px] hover:bg-muted">Edit</button>
          <StatusButton status={milestone.status} disabled={disabled} label={`milestone ${milestone.title}`} onChange={()=>{const next=nextStatus(milestone.status,milestoneStatusOrder);if(next==='done')reviewMilestoneCompletion(milestone);else updateMilestone(milestone,{status:next});}}/>
          <Remaining dueOn={milestone.dueOn} today={today} completed={milestone.status==='done'}/>
          <label className="text-[10px] text-muted-foreground">Deadline <input type="date" aria-label={`Due date for milestone ${milestone.title}`} value={milestone.dueOn??''} className={dateClass} disabled={disabled} onChange={event=>updateMilestone(milestone,{dueOn:event.target.value||null})}/></label>
        </div>
        {phases.length>0&&<div className="flex flex-wrap gap-1.5 pl-9">{phases.map(phase=><Link key={phase} href={`/projects/${id}?tab=phases`} className="inline-flex min-h-7 items-center gap-1 rounded-md border border-border px-2 text-[10px] text-muted-foreground hover:bg-muted"><span aria-hidden className="h-2 w-2 rounded-sm border border-black/15 dark:border-white/20" style={{backgroundColor:phaseColorFor(phase,phaseColors.rows)}}/>{projectPhaseLabels[phase]}</Link>)}</div>}
        <div className="flex items-center gap-2 pl-9 text-[10px] text-muted-foreground"><div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600" style={{width:`${stats.percent??0}%`}}/></div>{stats.percent===null?'No task progress':`${stats.percent}% tasks done`}</div>
      </div>
      {isOpen&&<div className="bg-background/40"><div className="flex items-center justify-between gap-3 px-4 py-2"><span className="text-[11px] font-semibold">{matchingTasks.filter(task=>task.milestoneId===milestone.id).length} matching / {stats.total} tasks</span><div className="flex items-center gap-1">{btn('Mark all tasks completed',<CheckCheck size={16}/>,()=>setPrompt({title:'Complete all tasks?',description:`Update ${stats.total} task${stats.total===1?'':'s'} in “${milestone.title}” in one audited project revision. Blocked tasks and unmet dependencies will be rejected. Save other work-plan edits first.`,confirm:()=>onBulkTasks(milestone.id,'done')}),disabled||dirty||!stats.total)}{btn('Mark all tasks not started',<RotateCcw size={15}/>,()=>setPrompt({title:'Reset task statuses?',description:`Return ${stats.total} task${stats.total===1?'':'s'} in “${milestone.title}” to To do in one audited project revision? Active tasks may depend on this work. Save other work-plan edits first.`,confirm:()=>onBulkTasks(milestone.id,'todo')}),disabled||dirty||!stats.total)}{btn('Add task',<Plus size={16}/>,()=>onAddTask(milestone.id),disabled||body.tasks.length>=100)}</div></div><div className="space-y-2 px-3 pb-3">{matchingTasks.filter(task=>task.milestoneId===milestone.id).map(taskPreview)}{stats.total>0&&!matchingTasks.some(task=>task.milestoneId===milestone.id)&&<p className="text-xs text-muted-foreground">No tasks match the current filters. Milestone progress still includes all linked tasks.</p>}</div>{!stats.total&&<p className="px-4 py-4 text-xs text-muted-foreground">No tasks. Use + to add one.</p>}{stats.readyForReview&&milestone.status!=='done'&&<button type="button" disabled={disabled} onClick={()=>reviewMilestoneCompletion(milestone)} className="m-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">All tasks done — review milestone completion</button>}</div>}
    </article>;
  };
  return <section aria-label="Project tasks and milestones" className="bivi-workplan space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Expand tasks to edit. You can keep several open.</p><div className="flex flex-wrap gap-2"><button type="button" disabled={disabled||body.milestones.length>=20} onClick={onAddMilestone} className="min-h-8 rounded-lg border border-border px-2.5 text-xs hover:bg-muted disabled:opacity-50">Add milestone</button><button type="button" disabled={disabled||body.tasks.length>=100} onClick={()=>onAddTask(null)} className="min-h-8 rounded-lg border border-border px-2.5 text-xs hover:bg-muted disabled:opacity-50">Add task</button><ProjectManagersButton controls={assignments} disabled={disabled||dirty||!sidecarReady}/>{btn('Refresh hierarchy',<RefreshCcw size={15}/>,()=>{void hierarchy.load();},hierarchy.busy)}</div></div>
    <div className="flex flex-wrap items-center justify-between gap-2"><div role="tablist" aria-label="Work-plan view" className="inline-flex gap-1 rounded-xl border border-border bg-muted/40 p-1">{(['tasks','milestones'] as const).map(item=><button role="tab" aria-selected={view===item} key={item} type="button" onClick={()=>setView(item)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${view===item?'bg-card shadow-sm':'text-muted-foreground hover:bg-muted'}`}>{item}</button>)}</div><nav aria-label="Related project sections" className="flex flex-wrap gap-3 text-[11px]"><Link className="underline" href={`/projects/${id}?tab=phases`}>Lifecycle</Link><Link className="underline" href={`/projects/${id}?tab=calendar`}>Calendar</Link><Link className="underline" href={`/projects/${id}?tab=brief`}>Brief</Link><Link className="underline" href={`/projects/${id}/activity`}>Activity</Link></nav></div>
    <ProjectWorkplanToolbar filters={filters} onChange={change=>setFilters(previous=>({...previous,...change}))} columns={columns} onColumns={setColumns} assignees={memberOptions} phasesReady={Boolean(hierarchy.data)} assignmentsReady={Boolean(assignments.data)}/>
    <div className="flex flex-wrap items-center gap-2 text-xs"><label>Tag <select aria-label="Filter by tag" className="rounded-md bg-muted/40 px-2 py-1.5" value={tagFilter} onChange={event=>setTagFilter(event.target.value)}><option value="">All tags</option>{tagCatalog.map(tag=><option key={tag} value={tag}>{tag}</option>)}</select></label>{presentation.error&&<p role="alert" className="text-destructive">{presentation.error}<button type="button" className="ml-2 underline" onClick={()=>void presentation.load()}>Retry</button></p>}</div>
    {((!hierarchy.data&&!hierarchy.error)||(!assignments.data&&!assignments.error))&&<p role="status" className="text-xs text-muted-foreground">Loading saved phase associations and project members…</p>}
    {assignments.error&&<p role="alert" className="rounded-lg border border-red-200 p-3 text-xs text-red-700 dark:text-red-300">{assignments.error}<button type="button" className="ml-2 underline" onClick={()=>void assignments.load()}>Retry members</button></p>}
    {schedule.error&&<p role="alert" className="rounded-lg border border-red-200 p-3 text-xs text-red-700 dark:text-red-300">{schedule.error}<button type="button" className="ml-2 underline" onClick={()=>void schedule.reload()}>Refresh saved schedules</button></p>}
    {hierarchy.error&&<p role="alert" className="rounded-lg border border-red-200 p-3 text-xs text-red-700 dark:text-red-300">{hierarchy.error}</p>}
    {hierarchy.conflict&&<p role="alert" className="text-xs text-red-700 dark:text-red-300">Project changes detected. Refresh hierarchy before continuing.</p>}
    {(hierarchy.busy||assignments.busy||schedule.busy)&&<p role="status" className="text-xs text-muted-foreground">Saving task details…</p>}
    {(hierarchy.message||assignments.message||schedule.message)&&<p role="status" className="text-xs text-emerald-700 dark:text-emerald-300">{[hierarchy.message,assignments.message,schedule.message].filter(Boolean).join(' ')}</p>}
    {dirty&&<p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-900 dark:bg-amber-950 dark:text-amber-200">Task and milestone edits are in your private draft. Save all before changing saved assignments, schedules, priorities or subtasks.</p>}
    {newSubtaskFor&&newSubtaskTitle.trim()&&<p role="status" className="text-xs text-amber-800 dark:text-amber-200">New subtask draft for {body.tasks.find(task=>task.id===newSubtaskFor)?.title}. <button type="button" className="underline" onClick={()=>openTask(newSubtaskFor)}>Return to its task to save or cancel</button>.</p>}
    {/* Keep visited detail editors mounted across filters and internal view changes. */}
    <div className="flex flex-wrap items-center justify-between gap-2"><p role="status" className="text-[11px] text-muted-foreground">{matchingTasks.length} / {body.tasks.length} tasks · {matchingMilestones.length} / {body.milestones.length} milestones match · {hierarchy.data?`${subtasks.length} saved subtasks counted separately`:'Subtasks loading…'}</p>{view==='tasks'&&<label className="flex items-center gap-2 text-[11px] text-muted-foreground">Group tasks<select aria-label="Group tasks" className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground" value={grouping} onChange={event=>setGrouping(event.target.value as TaskGrouping)}><option value="none">No grouping</option><option value="milestone">Milestone</option><option value="status">Status</option><option value="side">Responsible side</option></select></label>}</div>
    {view==='milestones'&&<div className="space-y-3"><div className={cardGrid}>{matchingMilestones.map(milestoneCard)}</div>{!matchingMilestones.length&&<p className="rounded-xl border border-dashed border-border p-5 text-xs text-muted-foreground">{body.milestones.length?'No milestones match. Clear or adjust the filters to see more work.':'No milestones yet. Choose Add milestone to create one in the advanced editor.'}</p>}{body.tasks.some(task=>!task.milestoneId)&&<section className="rounded-xl border border-dashed border-border bg-muted/20 p-3"><h3 className="mb-3 text-xs font-semibold">Unassigned tasks · {body.tasks.filter(task=>!task.milestoneId).length} total</h3><div className={cardGrid}>{matchingTasks.filter(task=>!task.milestoneId).map(taskPreview)}</div>{!matchingTasks.some(task=>!task.milestoneId)&&<p className="text-xs text-muted-foreground">Unassigned tasks are hidden by the current filters.</p>}</section>}</div>}
    <div hidden={view!=='tasks'}><div className={cardGrid}>{groupWorkplanTasks(body.tasks,grouping,context).flatMap(group=>[
      <h3 key={`group-${group.key}`} hidden={!group.tasks.some(task=>matchingTasks.includes(task))} className="col-span-full mt-2 text-xs font-semibold">{group.label} <span className="font-normal text-muted-foreground">· {group.tasks.filter(task=>matchingTasks.includes(task)).length}</span></h3>,
      ...group.tasks.map(task=><div key={task.id} hidden={!matchingTasks.includes(task)}>{taskCard(task)}</div>)
    ])}</div>{!matchingTasks.length&&<p className="p-5 text-xs text-muted-foreground">{body.tasks.length?'No tasks match. Adjust the filters to see more work.':'No tasks yet. Choose Add task to get started.'}</p>}</div>
    <style jsx global>{`.bivi-workplan input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0; width: 0; padding: 0; }`}</style>
    <Dialog open={prompt!==null} onOpenChange={open=>{if(!open)setPrompt(null);}}><DialogContent className="bivi-staff-surface"><DialogTitle>{prompt?.title}</DialogTitle><DialogDescription>{prompt?.description}</DialogDescription>{prompt?.blockers&&hasMilestoneCompletionBlockers(prompt.blockers)&&<div className="max-h-56 overflow-auto rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"><p className="font-semibold">Complete these tasks before completing this milestone.</p>{prompt.blockers.needsTask&&<p className="mt-2">Add at least one task to {prompt.blockers.milestoneTitle}.</p>}<ul className="ml-4 mt-2 list-disc space-y-1">{prompt.blockers.tasks.map(task=><li key={task.taskId}><a className="underline" href={`#${taskDomId(task.taskId)}`} onClick={event=>{event.preventDefault();navigateToTask(task.taskId);}}>{task.title}</a>{task.taskIncomplete?' — task is not completed':''}{task.subtasks.map(subtask=><span key={subtask.id}>; unfinished subtask: {subtask.title}</span>)}</li>)}</ul></div>}{prompt?.unavailable&&<p role="alert" className="rounded border border-red-300 p-2 text-xs">Completion is unavailable until the task hierarchy loads.</p>}<DialogFooter><button type="button" className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-muted" onClick={()=>setPrompt(null)}>{prompt?.blockers?'Continue editing':'Cancel'}</button>{(!prompt?.blockers||!hasMilestoneCompletionBlockers(prompt.blockers))&&<button type="button" className="rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background" onClick={()=>{const action=prompt?.confirm;setPrompt(null);action?.();}}>{prompt?.unavailable?'Refresh hierarchy':'Confirm'}</button>}</DialogFooter></DialogContent></Dialog>
  </section>;
}
