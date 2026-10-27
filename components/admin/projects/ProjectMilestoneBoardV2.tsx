'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { postProjectCommand } from '@/lib/projects/immediate-command';
import { refreshProjectSurfaces } from '@/lib/projects/refresh';
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
import { ProjectWorkplanToolbar, type TasksDisplayView, type TaskSort, type TaskColumn } from './ProjectWorkplanToolbar';
import { emptyWorkplanFilters, groupWorkplanTasks, workplanMilestoneMatches, workplanTaskMatches, workplanTaskPhases, type WorkplanFilters, type TaskGrouping } from '@/lib/projects/workplan-filters';
import { ProfileImage } from '@/components/profile-images/ProfileImage';
import { ProjectLifecycleControls } from '@/components/admin/ProjectLifecycleControls';
import type { ProjectWorkflowGate } from '@/lib/projects/workplan-save-outcome';

const priorityChoices: {value:string|null;label:string}[]=[
  {value:null,label:'Not set'}, {value:'low',label:'Low'},
  {value:'medium',label:'Medium'}, {value:'high',label:'High'},
  {value:'urgent',label:'Urgent'},
];
function PriorityBars({priority}:{priority:string|null|undefined}){
  const active=priority==='low'?1:priority==='medium'?2:priority==='high'||priority==='urgent'?3:0;
  const color=active===3?'bg-red-500':active===2?'bg-amber-400':'bg-emerald-500';
  return <span className="inline-flex items-center gap-0.5" role="img" aria-label={'Priority: '+(priority||'Not set')}>
    {[0,1,2].map(index=><span key={index} className={'h-3.5 w-1 rounded-[2px] '+(index<active?color:'bg-zinc-300 dark:bg-zinc-600')}/>)}
  </span>;
}
function TaskPriorityCell({projectId,taskId,priority,revision,disabled}:{
  projectId:string;taskId:string;priority:string|null|undefined;revision:number;disabled:boolean;
}){
  const router=useRouter();
  const [current,setCurrent]=useState(priority??null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>setCurrent(priority??null),[priority]);
  async function choose(value:string|null){
    if(busy||disabled||current===value)return;
    setBusy(true);setError('');
    try{
      await postProjectCommand('/api/admin/projects/'+projectId+'/task-productivity',{
        action:'priority',taskId,priority:value,expectedProjectRevision:revision,
      });
      setCurrent(value);
      refreshProjectSurfaces(projectId,router);
    }catch(cause){setError(cause instanceof Error?cause.message:'Priority could not be updated.');}
    finally{setBusy(false);}
  }
  return <Popover>
    <PopoverTrigger asChild><button type="button" disabled={disabled||busy} className="inline-flex min-h-8 items-center gap-2 rounded-lg px-2 hover:bg-muted disabled:opacity-50" aria-label={'Change task priority, currently '+(current??'not set')}><PriorityBars priority={current}/><ChevronDown size={12} className="text-muted-foreground"/></button></PopoverTrigger>
    <PopoverContent align="start" className="w-44 space-y-1 p-2">
      {priorityChoices.map(option=><button key={option.label} type="button" className="flex min-h-8 w-full items-center gap-3 rounded-md px-2 text-left text-xs hover:bg-muted" aria-pressed={current===option.value} disabled={busy} onClick={()=>void choose(option.value)}><PriorityBars priority={option.value}/>{option.label}{current===option.value&&<Check size={13}/>}</button>)}
      {error&&<p role="alert" className="p-1 text-[11px] text-destructive">{error}</p>}
    </PopoverContent>
  </Popover>;
}

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

export function ProjectMilestoneBoard({id,revision,body,disabled,dirty,sidecarReady,onTaskChange,onMilestoneChange,onAddTask,onAddMilestone,onEditTask,onEditMilestone,taskControls,onBulkTasks,userId,today,focusTaskId,focusTaskRequest,workflowGate,workflowOverrideReason,onWorkflowOverrideReason,onOverrideTaskStatus,overrideReady,busy,onRemoveTask,advanced=false,onAdvancedToggle,dirtyTaskIds=[]}: {
  onAdvancedToggle?:()=>void;dirtyTaskIds?:string[];advanced?:boolean;id:string;revision:number;body:ProjectBody;disabled:boolean;dirty:boolean;sidecarReady:boolean;today:string;focusTaskId?:string|null;focusTaskRequest?:number;
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
  const [view,setView]=useState<TasksDisplayView>('overview');
  const [sort,setSort]=useState<TaskSort>('default');
  const [visibleColumns,setVisibleColumns]=useState<TaskColumn[]>(['priority','status','milestone','due','assignee']);

  const [showEditor,setShowEditor]=useState(false);
  const [calendarMonth,setCalendarMonth]=useState(today.slice(0,7));
  const [filters,setFilters]=useState<WorkplanFilters>({...emptyWorkplanFilters});

  const [grouping,setGrouping]=useState<TaskGrouping>('status');
  const [selectedTaskId,setSelectedTaskId]=useState<string|null>(null);
  const [openTasks,setOpenTasks]=useState<Record<string,boolean>>({});
  const [visitedTasks,setVisitedTasks]=useState<Record<string,boolean>>({});
  function openTask(taskId:string) {
    setFilters({...emptyWorkplanFilters}); setTagFilter(''); setView('overview'); setGrouping('none'); setShowEditor(true);
    setSelectedTaskId(taskId); setVisitedTasks({[taskId]:true}); setOpenTasks({[taskId]:true});
  }
  useEffect(()=>{if(focusTaskId)openTask(focusTaskId);},[focusTaskId,focusTaskRequest]);
  useEffect(()=>{if(selectedTaskId&&showEditor){const row=document.getElementById(taskDomId(selectedTaskId));row?.focus({preventScroll:true});row?.scrollIntoView({block:'center',behavior:'smooth'});}},[selectedTaskId,focusTaskRequest,showEditor]);
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
  const cardGrid='grid grid-cols-1 items-start gap-3 md:grid-cols-2 xl:grid-cols-3';
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
    return <details key={task.id} id={taskDomId(task.id)} tabIndex={-1} open={Boolean(openTasks[task.id])} onToggle={event=>{const open=event.currentTarget.open;if(open){setVisitedTasks({[task.id]:true});setOpenTasks({[task.id]:true});setSelectedTaskId(task.id);}else setOpenTasks(previous=>({...previous,[task.id]:false}));}} className={`group scroll-mt-24 min-w-0 rounded-lg transition-colors hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-ring ${selectedTaskId===task.id?'bg-primary/5':'open:bg-muted/20'}`}>
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

  const priorityOrder:Record<string,number>={urgent:0,high:1,medium:2,low:3};
  const orderedTasks=[...matchingTasks].sort((a,b)=>{
    if(sort==='title')return a.title.localeCompare(b.title);
    if(sort==='due')return (a.dueOn??'9999-12-31').localeCompare(b.dueOn??'9999-12-31');
    if(sort==='priority')return (priorityOrder[taskControls.find(row=>row.taskId===a.id)?.priority??'']??4)-(priorityOrder[taskControls.find(row=>row.taskId===b.id)?.priority??'']??4);
    return body.tasks.findIndex(row=>row.id===a.id)-body.tasks.findIndex(row=>row.id===b.id);
  });

  const columnWidths='minmax(220px,3fr) '+visibleColumns.map(column=>column==='assignee'?'minmax(100px,1.2fr)':'minmax(105px,1fr)').join(' ')+' 42px';
  const labelForColumn:Record<TaskColumn,string>={priority:'Priority',status:'Status',milestone:'Milestone',due:'Due date',assignee:'Assignees'};
  const columnValue=(task:Task,column:TaskColumn):ReactNode=>{
    if(column==='priority'){const priority=taskControls.find(row=>row.taskId===task.id)?.priority??null;return <TaskPriorityCell projectId={id} taskId={task.id} priority={priority} revision={revision} disabled={disabled||dirty||!sidecarReady}/>;}
    if(column==='status')return statusMenu(task);
    if(column==='milestone')return <span className="truncate text-[11px] text-muted-foreground" title={body.milestones.find(item=>item.id===task.milestoneId)?.title??'No milestone'}>{body.milestones.find(item=>item.id===task.milestoneId)?.title??'—'}</span>;
    if(column==='due')return <label className="inline-flex min-h-8 items-center gap-1 text-[11px] text-muted-foreground"><Flag size={12} aria-hidden/><input type="date" aria-label={'Due date for '+task.title} className="w-[120px] cursor-pointer bg-transparent px-1 text-[11px] outline-none focus-visible:ring-2" disabled={disabled} value={task.dueOn??''} onChange={event=>updateTask(task,{dueOn:event.target.value||null})}/></label>;
    return <TaskMemberPicker taskId={task.id} controls={assignments} disabled={disabled||dirty||!sidecarReady}/>;
  };
  const statusMenu=(task:Task)=><Popover>
    <PopoverTrigger asChild><button type="button" disabled={disabled} aria-label={'Change status of '+task.title} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-1.5 hover:bg-muted disabled:opacity-50"><ProjectTaskStateIcon status={task.status}/><span className="sr-only">{task.status}</span><ChevronDown size={12} className="text-muted-foreground"/></button></PopoverTrigger>
    <PopoverContent align="start" className="w-44 space-y-1 p-2">
      {([{value:'todo',label:'Backlog'},{value:'doing',label:'In progress'},{value:'blocked',label:'Blocked'},{value:'done',label:'Completed'}] as {value:Task['status'];label:string}[]).map(option=><button type="button" key={option.value} aria-pressed={task.status===option.value} disabled={disabled} className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left text-xs hover:bg-muted" onClick={()=>updateTask(task,{status:option.value})}><ProjectTaskStateIcon status={option.value}/><span className="flex-1">{option.label}</span>{task.status===option.value&&<Check size={13}/>}</button>)}
    </PopoverContent>
  </Popover>;
  const openFullEditor=(taskId:string)=>{openTask(taskId);};
  const compactRow=(task:Task)=><div role="row" key={task.id} style={{gridTemplateColumns:columnWidths}} className={`grid min-h-12 items-center gap-3 px-3 py-1.5 text-xs transition-colors hover:bg-slate-50 focus-within:bg-slate-50 dark:hover:bg-muted/50 dark:focus-within:bg-muted/50 ${selectedTaskId===task.id?'bg-blue-50/60 dark:bg-primary/10':''}`}>
    <div role="cell" className="flex min-w-0 items-center gap-2">{statusMenu(task)}<span className="w-14 shrink-0 font-mono text-[10px] text-muted-foreground">{presentation.rows.find(row=>row.task_id===task.id)?.code??'Draft'}</span><button type="button" onClick={()=>openTask(task.id)} className="min-w-0 flex-1 truncate text-left font-medium hover:underline" title={task.title}>{task.title}</button>{dirtyTaskIds.includes(task.id)&&<span role="status" title="Task changes awaiting autosave" aria-label="Unsaved task changes" className="h-2 w-2 shrink-0 rounded-full bg-blue-600"/>}</div>
    {visibleColumns.map(column=><div key={column} role="cell" className="min-w-0 truncate">{columnValue(task,column)}</div>)}
    <div role="cell"><button type="button" className={miniButton} title={`Full editor for ${task.title}`} aria-label={`Edit task ${task.title}`} onClick={()=>openFullEditor(task.id)}><Pencil size={15}/></button></div>
  </div>;
  const sectionGroups=groupWorkplanTasks(orderedTasks,grouping,context).filter(group=>group.tasks.length>0);
  const rowTable=(tasks:Task[],key:string,title?:string)=><section key={key} className="overflow-x-auto bg-white dark:bg-card">
    {title&&<h2 className="bg-slate-50 px-3 py-2 text-xs font-semibold dark:bg-muted/40">{title} <span className="ml-1 font-normal text-muted-foreground">{tasks.length}</span></h2>}
    <div role="table" aria-label={title??'Tasks'} className="w-full min-w-[640px]">
      <div role="row" style={{gridTemplateColumns:columnWidths}} className="grid min-h-9 items-center gap-3 border-b border-border/70 px-3 text-[11px] font-medium text-muted-foreground">
        <div role="columnheader">Name</div>{visibleColumns.map(column=><div role="columnheader" key={column} draggable title="Drag to reorder columns" className="cursor-grab" onDragStart={event=>{event.dataTransfer.setData('text/plain',column);event.dataTransfer.effectAllowed='move';}} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const source=event.dataTransfer.getData('text/plain') as TaskColumn;if(!visibleColumns.includes(source)||source===column)return;const next=visibleColumns.filter(item=>item!==source);next.splice(next.indexOf(column),0,source);setVisibleColumns(next);}}>{labelForColumn[column]}</div>)}<div role="columnheader"><span className="sr-only">Edit</span></div>
      </div>
      {tasks.map(compactRow)}
    </div>
  </section>;
  const viewTaskButton=(task:Task)=><div key={task.id} className="flex min-w-0 items-center gap-2 rounded-lg border border-border/60 bg-white p-2 text-xs transition-colors hover:border-border hover:bg-slate-50 dark:bg-card dark:hover:bg-muted/60">
    <button type="button" onClick={()=>openTask(task.id)} className="flex min-w-0 flex-1 items-start gap-2 p-1 text-left">
      <ProjectTaskStateIcon status={task.status}/><span className="min-w-0 flex-1"><span className="block break-words font-medium">{task.title}</span><span className="mt-1 block text-[11px] text-muted-foreground">{task.dueOn?`Due ${task.dueOn}`:'No due date'}</span></span><span className="shrink-0">{taskPeople(task)}</span>
    </button>
    <button type="button" title={`Open full editor for ${task.title}`} aria-label={`Edit task ${task.title}`} className={miniButton} onClick={()=>openFullEditor(task.id)}><Pencil size={14}/></button>
  </div>;
  const dateTasks=orderedTasks.filter(task=>task.dueOn).sort((a,b)=>(a.dueOn??'').localeCompare(b.dueOn??''));
  const intervals=orderedTasks.map(task=>({task,start:schedule.rows.get(task.id)?.start_on??null,end:task.dueOn})).filter(item=>item.start&&item.end&&item.start<=item.end);
  const firstStart=intervals.map(item=>item.start!).sort()[0];
  const lastDue=intervals.map(item=>item.end!).sort().at(-1);
  const dayDifference=(end:string,start:string)=>Math.round((Date.parse(`${end}T12:00:00Z`)-Date.parse(`${start}T12:00:00Z`))/86400000);
  const rangeDays=firstStart&&lastDue?Math.max(1,dayDifference(lastDue,firstStart)+1):1;
  const undatedTasks=orderedTasks.filter(task=>!task.dueOn);
  const monthDate=new Date(`${calendarMonth}-01T12:00:00Z`);
  const monthOffset=monthDate.getUTCDay();
  const monthDays=new Date(Date.UTC(monthDate.getUTCFullYear(),monthDate.getUTCMonth()+1,0)).getUTCDate();
  const shiftMonth=(offset:number)=>{const next=new Date(Date.UTC(monthDate.getUTCFullYear(),monthDate.getUTCMonth()+offset,1));setCalendarMonth(next.toISOString().slice(0,7));};
  const dates=Array.from({length:Math.ceil((monthOffset+monthDays)/7)*7},(_,index)=>{
    const n=index-monthOffset+1;return n>=1&&n<=monthDays?`${calendarMonth}-${String(n).padStart(2,'0')}`:null;
  });
  return <section aria-label="Project tasks" className="bivi-workplan space-y-3 bg-white text-slate-950 dark:bg-background dark:text-foreground">
    <ProjectWorkplanToolbar onAdvancedToggle={onAdvancedToggle} advanced={advanced} projectId={id} filters={filters} onChange={change=>setFilters(previous=>({...previous,...change}))}
      view={view} onView={setView} grouping={grouping} onGrouping={setGrouping} sort={sort} onSort={setSort}
      columns={visibleColumns} onColumns={setVisibleColumns} assignees={memberOptions}
      phasesReady={Boolean(hierarchy.data)} assignmentsReady={Boolean(assignments.data)}
      tagFilter={tagFilter} onTagFilter={setTagFilter} tags={tagCatalog}
      showEditor={showEditor} onToggleEditor={()=>{if(!selectedTaskId&&body.tasks[0])openTask(body.tasks[0].id);else setShowEditor(open=>!open);}}
      onAddTask={()=>onAddTask(null)} onAddMilestone={onAddMilestone} disabled={disabled}/>
    {presentation.error&&<p role="alert" className="text-xs text-destructive">{presentation.error} <button type="button" className="underline" onClick={()=>void presentation.load()}>Retry tags</button></p>}
    {assignments.error&&<p role="alert" className="text-xs text-destructive">{assignments.error}<button type="button" className="ml-2 underline" onClick={()=>void assignments.load()}>Retry members</button></p>}
    {schedule.error&&<p role="alert" className="text-xs text-destructive">{schedule.error}<button type="button" className="ml-2 underline" onClick={()=>void schedule.reload()}>Retry schedule</button></p>}
    {hierarchy.error&&<p role="alert" className="text-xs text-destructive">{hierarchy.error}<button type="button" className="ml-2 underline" onClick={()=>void hierarchy.load()}>Retry hierarchy</button></p>}
    {hierarchy.conflict&&<p role="alert" className="text-xs text-destructive">Project data changed. Refresh before editing linked records.</p>}
    {(hierarchy.busy||assignments.busy||schedule.busy)&&<p role="status" className="text-xs text-muted-foreground">Saving task details…</p>}
    {(hierarchy.message||assignments.message||schedule.message)&&<p role="status" className="text-xs text-emerald-700 dark:text-emerald-300">{[hierarchy.message,assignments.message,schedule.message].filter(Boolean).join(' ')}</p>}
    {dirty&&<p role="status" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">Unsaved work-plan edits. Use Save all before changing saved assignments, notes or files.</p>}
    {newSubtaskFor&&newSubtaskTitle.trim()&&<p role="status" className="text-xs text-amber-800 dark:text-amber-200">Unsaved subtask for {body.tasks.find(task=>task.id===newSubtaskFor)?.title}. <button type="button" className="underline" onClick={()=>openTask(newSubtaskFor)}>Return to editor</button>.</p>}
    <div className={showEditor?'grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(330px,380px)]':'min-w-0'}>
      <div className="min-w-0 space-y-3">
        <p role="status" className="text-[11px] text-muted-foreground">{orderedTasks.length} of {body.tasks.length} tasks · {subtasks.length} saved subtasks</p>
        {view==='overview'&&<div className="space-y-3">{(grouping==='none'?[{key:'all',label:'Tasks',tasks:orderedTasks}]:sectionGroups).map(group=>rowTable(group.tasks,group.key,grouping==='none'?undefined:group.label))}</div>}
        {view==='milestone'&&<div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
          {matchingMilestones.map(milestone=>{
            const items=orderedTasks.filter(task=>task.milestoneId===milestone.id);
            const stats=milestoneStats(body,milestone.id);
            return <section key={milestone.id} className="min-w-0 overflow-hidden rounded-xl bg-slate-50 dark:bg-muted/30">
              <div className="flex items-start justify-between gap-2 px-3 py-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold" title={milestone.title}>{milestone.title}</h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">{stats.done} of {stats.total} completed</p>
                </div>
                <button type="button" className={miniButton} title={'Add task to '+milestone.title} disabled={disabled} onClick={()=>onAddTask(milestone.id)}><Plus size={15}/></button>
              </div>
              <div className="max-h-[65vh] space-y-1 overflow-y-auto px-2 pb-3">
                {items.map(task=><div key={task.id} className="rounded-lg bg-white dark:bg-card">{taskPreview(task)}{dirtyTaskIds.includes(task.id)&&<span className="ml-3 inline-block h-2 w-2 rounded-full bg-blue-600" title="Unsaved task changes"/>}</div>)}
                {!items.length&&<p className="px-2 py-3 text-xs text-muted-foreground">No matching tasks</p>}
              </div>
            </section>;
          })}
          {orderedTasks.some(task=>!task.milestoneId)&&<section className="rounded-xl bg-slate-50 p-3 dark:bg-muted/30"><h2 className="mb-3 text-sm font-semibold">No milestone</h2>{orderedTasks.filter(task=>!task.milestoneId).map(task=><div key={task.id} className="mb-1 rounded-lg bg-white dark:bg-card">{taskPreview(task)}</div>)}</section>}
        </div>}
        {view==='list'&&<div className="space-y-3">{(grouping==='none'?[{key:'all',label:'Tasks',tasks:orderedTasks}]:sectionGroups).map(group=><section key={group.key} className="space-y-1">{grouping!=='none'&&<h2 className="text-xs font-semibold">{group.label} <span className="text-muted-foreground">{group.tasks.length}</span></h2>}{group.tasks.map(viewTaskButton)}</section>)}</div>}
        
        {view==='kanban'&&<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{(['todo','doing','blocked','done'] as const).map(status=><section key={status} className="min-w-0 rounded-xl bg-slate-50 p-2 dark:bg-muted/30"><h2 className="mb-2 px-2 text-xs font-semibold capitalize">{status==='todo'?'Backlog':status==='doing'?'In progress':status==='done'?'Completed':'Blocked'} <span className="text-muted-foreground">{orderedTasks.filter(task=>task.status===status).length}</span></h2><div className="space-y-2">{orderedTasks.filter(task=>task.status===status).map(viewTaskButton)}</div></section>)}</div>}
        {view==='timeline'&&<div className="space-y-3">{[...new Set(dateTasks.map(task=>task.dueOn))].map(date=><section key={date!}><h2 className="mb-2 border-b border-border pb-1 text-xs font-semibold"><Flag size={13} className="mr-1 inline" aria-hidden/>Due {date}</h2><div className="space-y-1">{dateTasks.filter(task=>task.dueOn===date).map(viewTaskButton)}</div></section>)}{undatedTasks.length>0&&<section><h2 className="mb-2 text-xs font-semibold">Without deadlines</h2><div className="space-y-1">{undatedTasks.map(viewTaskButton)}</div></section>}</div>}
        {view==='gantt'&&<div className="space-y-2 rounded-xl border border-border p-3">
          <p className="text-[11px] text-muted-foreground">Task bars align to the earliest saved start date and latest saved due date. Tasks with missing dates remain visible.</p>
          {firstStart&&lastDue&&<div className="flex justify-between gap-2 text-[11px] font-medium text-muted-foreground"><span>{firstStart}</span><span>{lastDue}</span></div>}
          {orderedTasks.map(task=>{
            const start=schedule.rows.get(task.id)?.start_on??null;
            const end=task.dueOn;
            const valid=Boolean(start&&end&&start<=end&&firstStart);
            const offset=valid?Math.max(0,dayDifference(start!,firstStart!)):0;
            const duration=valid?Math.max(1,dayDifference(end!,start!)+1):0;
            const left=offset/rangeDays*100;
            const width=Math.max(0,Math.min(100-left,duration/rangeDays*100));
            return <div key={task.id} className="grid gap-2 border-b border-border/40 py-2 sm:grid-cols-[minmax(150px,1fr)_minmax(180px,2fr)]">
              <button type="button" className="text-left text-xs font-medium hover:underline" onClick={()=>openTask(task.id)}>{task.title}</button>
              <div className="min-w-0">
                <p className="mb-1 text-[10px] text-muted-foreground">{start??'Start not set'} → {end??'Due not set'}</p>
                {valid?<div className="relative h-4 w-full overflow-hidden rounded bg-slate-100 dark:bg-muted"><div className="absolute inset-y-0 rounded bg-blue-500/80" style={{left:`${left}%`,width:`${width}%`}} title={`${duration} calendar days from ${start} through ${end}`}/></div>:<span className="text-[10px] text-muted-foreground">Set start and due dates to display the schedule bar.</span>}
              </div>
            </div>;
          })}
        </div>}
        {view==='calendar'&&<div className="rounded-xl border border-border"><div className="flex items-center justify-between border-b border-border p-3"><button type="button" className={miniButton} aria-label="Previous month" onClick={()=>shiftMonth(-1)}><ChevronRight size={16} className="rotate-180"/></button><h2 className="text-sm font-semibold">{new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(monthDate)}</h2><button type="button" className={miniButton} aria-label="Next month" onClick={()=>shiftMonth(1)}><ChevronRight size={16}/></button></div><div className="grid grid-cols-7 border-b border-border text-center text-[10px] font-medium text-muted-foreground">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day=><div key={day} className="py-2">{day}</div>)}</div><div className="grid grid-cols-7">{dates.map((date,index)=><div key={index} className="min-h-20 border-b border-r border-border/40 p-1 text-[10px]"><span className="text-muted-foreground">{date?.slice(-2)??''}</span>{dateTasks.filter(task=>task.dueOn===date).map(task=><button type="button" key={task.id} title={task.title} onClick={()=>openTask(task.id)} className="mt-1 block w-full truncate rounded bg-blue-50 px-1 py-0.5 text-left text-[10px] text-blue-950 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-100">{task.title}</button>)}</div>)}</div><p className="p-2 text-[11px] text-muted-foreground">{undatedTasks.length} tasks without a due date are excluded from this calendar, not deleted.</p></div>}
        {!orderedTasks.length&&<p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">{body.tasks.length?'No tasks match the current filters.':'No tasks yet. Use + to create one.'}</p>}
      </div>
      <aside hidden={!showEditor} aria-label="Full task editor" className="min-w-0 self-start rounded-xl border border-border bg-slate-50/50 dark:bg-card xl:sticky xl:top-5">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2"><h2 className="min-w-0 truncate text-sm font-semibold">Edit task{selectedTaskId?`: ${body.tasks.find(task=>task.id===selectedTaskId)?.title??''}`:''}</h2><button type="button" className={miniButton} aria-label="Hide task editor" onClick={()=>setShowEditor(false)}><ChevronRight size={16}/></button></div>
        <div className="max-h-[75vh] overflow-y-auto p-2">
          {selectedTaskId&&openTasks[selectedTaskId]&&(()=>{
            const task=body.tasks.find(row=>row.id===selectedTaskId);
            return task?<div key={task.id}>
              {taskRow(task)}
              {dependencyPreview(task)}
              <Link href={'/projects/'+id+'/activity?task='+encodeURIComponent(task.id)} className="mt-3 inline-flex items-center gap-1 px-3 text-xs font-medium underline">View all task activity</Link>
            </div>:null;
          })()}
          {(!selectedTaskId||!openTasks[selectedTaskId])&&<p className="p-3 text-xs text-muted-foreground">Select a task to edit its details.</p>}
        </div>
      </aside>
    </div>
    <style jsx global>{`.bivi-workplan input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0; width: 0; padding: 0; }`}</style>
    <Dialog open={prompt!==null} onOpenChange={open=>{if(!open)setPrompt(null);}}><DialogContent className="bivi-staff-surface"><DialogTitle>{prompt?.title}</DialogTitle><DialogDescription>{prompt?.description}</DialogDescription>{prompt?.blockers&&hasMilestoneCompletionBlockers(prompt.blockers)&&<div className="max-h-56 overflow-auto rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"><p className="font-semibold">Complete these tasks before completing this milestone.</p>{prompt.blockers.needsTask&&<p className="mt-2">Add at least one task to {prompt.blockers.milestoneTitle}.</p>}<ul className="ml-4 mt-2 list-disc space-y-1">{prompt.blockers.tasks.map(task=><li key={task.taskId}><a className="underline" href={`#${taskDomId(task.taskId)}`} onClick={event=>{event.preventDefault();navigateToTask(task.taskId);}}>{task.title}</a>{task.taskIncomplete?' — task is not completed':''}{task.subtasks.map(subtask=><span key={subtask.id}>; unfinished subtask: {subtask.title}</span>)}</li>)}</ul></div>}{prompt?.unavailable&&<p role="alert" className="rounded border border-red-300 p-2 text-xs">Completion is unavailable until the task hierarchy loads.</p>}<DialogFooter><button type="button" className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-muted" onClick={()=>setPrompt(null)}>{prompt?.blockers?'Continue editing':'Cancel'}</button>{(!prompt?.blockers||!hasMilestoneCompletionBlockers(prompt.blockers))&&<button type="button" className="rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background" onClick={()=>{const action=prompt?.confirm;setPrompt(null);action?.();}}>{prompt?.unavailable?'Refresh hierarchy':'Confirm'}</button>}</DialogFooter></DialogContent></Dialog>
  </section>;
}
