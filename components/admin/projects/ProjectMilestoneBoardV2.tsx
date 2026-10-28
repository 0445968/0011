'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { postProjectCommand } from '@/lib/projects/immediate-command';
import { refreshProjectSurfaces } from '@/lib/projects/refresh';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Check, CheckCheck, ChevronDown, ChevronRight, Clock3, Flag, Play, UserRoundPlus, Pencil, Plus, RefreshCcw, RotateCcw, Trash2, X, GripVertical, Info, AlertCircle, StickyNote } from 'lucide-react';
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
import { TaskActivityPreview } from './TaskActivityPreview';
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
  if(priority==='urgent')return <AlertCircle size={16} className="text-red-600 dark:text-red-400" role="img" aria-label="Priority: Urgent"/>;
  const active=priority==='low'?1:priority==='medium'?2:priority==='high'?3:0;
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
    <PopoverTrigger asChild><button type="button" disabled={disabled||busy} className="inline-flex min-h-8 items-center gap-2 rounded-lg px-2 hover:bg-muted disabled:opacity-50" aria-label={'Change task priority, currently '+(current??'not set')}><PriorityBars priority={current}/></button></PopoverTrigger>
    <PopoverContent align="start" className="w-44 space-y-1 p-2">
      {priorityChoices.map(option=><button key={option.label} type="button" className="flex min-h-8 w-full items-center gap-3 rounded-md px-2 text-left text-xs hover:bg-muted" aria-pressed={current===option.value} disabled={busy} onClick={()=>void choose(option.value)}><PriorityBars priority={option.value}/>{option.label}{current===option.value&&<Check size={13}/>}</button>)}
      {error&&<p role="alert" className="p-1 text-[11px] text-destructive">{error}</p>}
    </PopoverContent>
  </Popover>;
}

/** A native date input covers the full icon-and-date control so any click opens
 * the calendar, including when the field has no date. */
function TaskDateCell({label,value,disabled,icon,onChange}:{
  label:string;value:string|null;disabled:boolean;icon:ReactNode;onChange:(value:string|null)=>void;
}){
  const formatted=value?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z')):'—';
  return <label title={label+(value?': '+formatted:': Not set')}
    className="relative inline-flex min-h-8 max-w-full cursor-pointer items-center gap-1.5 rounded-lg px-1.5 text-[11px] text-muted-foreground hover:bg-muted/50 focus-within:ring-2 focus-within:ring-ring has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
    {icon}<span className="truncate tabular-nums">{formatted}</span>
    <input type="date" value={value??''} disabled={disabled} aria-label={label}
      className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      onClick={event=>{try{event.currentTarget.showPicker?.();}catch{ /* Browser's native picker is the fallback. */ }}}
      onChange={event=>onChange(event.currentTarget.value||null)}/>
  </label>;
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

export function ProjectMilestoneBoard({id,revision,body,disabled,dirty,sidecarReady,onTaskChange,onMilestoneChange,onAddTask,onAddMilestone,onEditTask,onEditMilestone,taskControls,onBulkTasks,userId,today,focusTaskId,focusTaskRequest,workflowGate,workflowOverrideReason,onWorkflowOverrideReason,onOverrideTaskStatus,overrideReady,busy,onRemoveTask,onBulkTaskChange,onBulkTaskRemove,advanced=false,onAdvancedToggle,dirtyTaskIds=[],toolbarActions}: {
  onAdvancedToggle?:()=>void;dirtyTaskIds?:string[];toolbarActions?:ReactNode;advanced?:boolean;id:string;revision:number;body:ProjectBody;disabled:boolean;dirty:boolean;sidecarReady:boolean;today:string;focusTaskId?:string|null;focusTaskRequest?:number;
  onTaskChange:(index:number,changes:Partial<Task>)=>void;
  onMilestoneChange:(index:number,changes:Partial<Milestone>)=>void;
  onAddTask:(milestoneId:string|null)=>void;
  onAddMilestone:()=>void; onEditTask:(taskId:string)=>void; onEditMilestone:(milestoneId:string)=>void;
  taskControls:ProjectTaskControl[];
  onBulkTasks:(milestoneId:string,status:'done'|'todo')=>void;
  onBulkTaskChange:(taskIds:string[],changes:Partial<Task>)=>void;
  onBulkTaskRemove:(taskIds:string[])=>void;
  userId:string;
  workflowGate?:ProjectWorkflowGate|null;workflowOverrideReason:string;onWorkflowOverrideReason:(reason:string)=>void;onOverrideTaskStatus:()=>void;overrideReady:boolean;busy:boolean;onRemoveTask:(taskId:string)=>void;
}) {
  const presentation=useTaskPresentation(id,revision);
  const [tagFilter,setTagFilter]=useState('');
  const [selectedTaskIds,setSelectedTaskIds]=useState<string[]>([]);
  const [bulkMessage,setBulkMessage]=useState('');
  const selectedTaskSet=new Set(selectedTaskIds);
  useEffect(()=>{setSelectedTaskIds(previous=>{const valid=previous.filter(taskId=>body.tasks.some(task=>task.id===taskId));return valid.length===previous.length?previous:valid;});},[body.tasks]);
  const tagCatalog=[...new Set(presentation.rows.flatMap(row=>row.tags))].sort();
  const hierarchy=useProjectHierarchy(id,revision,true);
  const assignments=useProjectAssignments(id,revision);
  const [view,setView]=useState<TasksDisplayView>('overview');
  const [sort,setSort]=useState<TaskSort>('default');
  const [visibleColumns,setVisibleColumns]=useState<TaskColumn[]>(['priority','status','milestone','due','assignee']);
  const allowedColumns:TaskColumn[]=['priority','status','milestone','due','assignee','start','phase','tags'];
  // Column order and visibility belong to this project rather than the session.
  useEffect(()=>{
    const defaults:TaskColumn[]=['priority','status','milestone','due','assignee'];
    try {
      const saved=JSON.parse(window.localStorage.getItem('bivi-task-columns:'+id)??'null') as unknown;
      if(Array.isArray(saved)){
        const columns=saved.filter((value):value is TaskColumn=>typeof value==='string'&&allowedColumns.includes(value as TaskColumn));
        setVisibleColumns([...new Set(columns)]);
      }else setVisibleColumns(defaults);
    }catch{setVisibleColumns(defaults);}
  },[id]);
  const changeColumns=(columns:TaskColumn[])=>{
    const sanitized=[...new Set(columns.filter(column=>allowedColumns.includes(column)))];
    setVisibleColumns(sanitized);
    try{window.localStorage.setItem('bivi-task-columns:'+id,JSON.stringify(sanitized));}catch{ /* Keep this session's choice. */ }
  };

  const [showEditor,setShowEditor]=useState(false);
  const [panelTarget,setPanelTarget]=useState<HTMLElement|null>(null);
  const [editorWidth,setEditorWidth]=useState(440);
  const widthStorageKey='bivi-task-editor-width:'+id;
  useEffect(()=>{
    // This dock lives immediately beneath the project sections navigation.
    setPanelTarget(document.getElementById('staff-workspace-task-panel'));
    try{
      const stored=Number(window.localStorage.getItem(widthStorageKey));
      if(Number.isFinite(stored)&&stored>=320&&stored<=800)setEditorWidth(stored);
    }catch{ /* Storage is optional; keep the default. */ }
  },[widthStorageKey]);
  const clampWidth=(next:number)=>Math.max(320,Math.min(Math.min(760,window.innerWidth-320),next));
  const persistWidth=(next:number)=>{
    const width=clampWidth(next);
    setEditorWidth(width);
    try{window.localStorage.setItem(widthStorageKey,String(width));}catch{ /* Session width still applies. */ }
  };
  const [pendingStartDates,setPendingStartDates]=useState<Record<string,string>>({});
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
  // Record the actual transition date after the revision-checked task autosave
  // completes, not before (which could invalidate the workplan revision).
  useEffect(()=>{
    if(!canEditSidecar||schedule.busy!==null)return;
    const pending=Object.entries(pendingStartDates)[0];
    if(!pending)return;
    const [taskId,startDate]=pending;
    const task=body.tasks.find(item=>item.id===taskId);
    const existing=schedule.rows.get(taskId)?.start_on;
    if(!task||!['doing','done'].includes(task.status)||existing){
      setPendingStartDates(previous=>{const next={...previous};delete next[taskId];return next;});return;
    }
    // Capture the transition once. A failed schedule update is reported in the
    // task editor and must not be retried automatically against a stale revision.
    setPendingStartDates(previous=>{const next={...previous};delete next[taskId];return next;});
    void schedule.save(taskId,startDate,task.dueOn,false);
  },[canEditSidecar,schedule.busy,schedule.rows,revision,pendingStartDates,body.tasks]);
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
    if(changes.status&&['doing','done'].includes(changes.status)&&!['doing','done'].includes(task.status)&&!schedule.rows.get(task.id)?.start_on){
      setPendingStartDates(previous=>({...previous,[task.id]:today}));
    }
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
  // Keep the unsaved dot visible even when the edit pencil is hidden.
  const toggleTaskSelection=(taskId:string)=>setSelectedTaskIds(previous=>
    previous.includes(taskId)?previous.filter(id=>id!==taskId):[...previous,taskId]);
  const taskSelectControl=(task:Task)=><input type="checkbox"
    className="bivi-task-select h-4 w-4 shrink-0 cursor-pointer rounded border border-border accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    aria-label={`Select task ${task.title}`} data-selected={selectedTaskSet.has(task.id)?'true':'false'}
    checked={selectedTaskSet.has(task.id)} onClick={event=>event.stopPropagation()}
    onChange={()=>toggleTaskSelection(task.id)}/>;
  const taskEditControl=(task:Task)=><span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center">
    <button type="button" className={miniButton+' bivi-task-edit-button'}
      title={'Edit '+task.title} aria-label={'Edit task '+task.title}
      onClick={()=>openTask(task.id)}><Pencil size={15} aria-hidden/></button>
    {dirtyTaskIds.includes(task.id)&&<span role="status" aria-label="Unsaved task changes"
      title="Changes awaiting autosave" className="pointer-events-none absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600 dark:border-card"/>}
  </span>;
  const taskPreview=(task:Task)=><div key={task.id} className="bivi-task-row flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-xs hover:bg-muted/40"><ProjectTaskStateIcon status={task.status}/><button type="button" className="min-w-0 flex-1 text-left hover:underline" onClick={()=>openTask(task.id)} aria-label={`Open task ${task.title}`}>{task.title}</button>{taskPeople(task)}<span className="inline-flex items-center gap-1 text-muted-foreground"><Flag size={12} aria-hidden/>{task.dueOn||'—'}</span>{taskEditControl(task)}</div>;
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

  const columnWidths='minmax(260px,2.5fr) '+visibleColumns.map(column=>
    column==='tags'||column==='phase'?'minmax(155px,1.2fr)':
    column==='due'||column==='start'?'minmax(140px,1fr)':
    column==='assignee'?'minmax(120px,1fr)':'minmax(100px,0.8fr)').join(' ')+' 42px';
  const tableMinWidth=Math.max(640,302+visibleColumns.reduce((sum,column)=>sum+(
    column==='tags'||column==='phase'?155:
    column==='start'||column==='due'?140:
    column==='assignee'?120:100),0));
  const labelForColumn:Record<TaskColumn,string>={
    priority:'Priority',status:'Status',milestone:'Milestone',due:'Due date',
    assignee:'Assignees',start:'Start date',phase:'Phase',tags:'Tags',
  };
  const columnValue=(task:Task,column:TaskColumn):ReactNode=>{
    if(column==='priority'){
      const priority=taskControls.find(row=>row.taskId===task.id)?.priority??null;
      return <TaskPriorityCell projectId={id} taskId={task.id} priority={priority} revision={revision} disabled={disabled||dirty||!sidecarReady}/>;
    }
    if(column==='status')return statusMenu(task);
    if(column==='milestone'){
      const name=body.milestones.find(item=>item.id===task.milestoneId)?.title??'No milestone';
      return <span className="block truncate text-[11px] text-muted-foreground" title={name}>{task.milestoneId?name:'—'}</span>;
    }
    if(column==='due')return <TaskDateCell label={'Due date for '+task.title} value={task.dueOn}
      disabled={disabled} icon={<Flag size={13} aria-hidden/>}
      onChange={value=>updateTask(task,{dueOn:value})}/>;
    if(column==='start')return <TaskDateCell label={'Start date for '+task.title}
      value={schedule.rows.get(task.id)?.start_on??null}
      disabled={disabled||dirty||!sidecarReady||schedule.busy!==null}
      icon={<Play size={13} aria-hidden/>}
      onChange={value=>{void schedule.save(task.id,value,task.dueOn,dirty);}}/>;
    if(column==='phase'){
      const phases=workplanTaskPhases(task,context);
      return phases.length?<Link href={'/projects/'+id+'?tab=phases'}
        title={phases.map(phase=>projectPhaseLabels[phase]).join(', ')}
        className="inline-flex max-w-full items-center gap-1.5 rounded-md px-1 py-1 hover:bg-muted/50">
        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{backgroundColor:phaseColorFor(phases[0],phaseColors.rows)}}/>
        <span className="min-w-0 truncate text-[11px]">{projectPhaseLabels[phases[0]]}</span>
        {phases.length>1&&<span className="shrink-0 text-[10px] text-muted-foreground">+{phases.length-1}</span>}
      </Link>:<span className="text-[11px] text-muted-foreground">—</span>;
    }
    if(column==='tags'){
      const row=presentation.rows.find(item=>item.task_id===task.id);
      return <div className="flex min-w-0 items-center gap-1">
        <TaskTags projectId={id} projectRevision={revision} row={row} catalog={tagCatalog}
          disabled={disabled||dirty||!sidecarReady} reload={presentation.load}/>
        {Boolean(row?.tags.length)&&<span className="min-w-0 truncate text-[10px] text-muted-foreground" title={row?.tags.join(', ')}>{row?.tags.slice(0,2).join(', ')}{(row?.tags.length??0)>2?'…':''}</span>}
      </div>;
    }
    return <TaskMemberPicker taskId={task.id} controls={assignments} disabled={disabled||dirty||!sidecarReady}/>;
  };
  const statusMenu=(task:Task)=><Popover>
    <PopoverTrigger asChild><button type="button" disabled={disabled} aria-label={'Change status of '+task.title} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-1.5 hover:bg-muted disabled:opacity-50"><ProjectTaskStateIcon status={task.status}/><span className="sr-only">{task.status}</span></button></PopoverTrigger>
    <PopoverContent align="start" className="w-44 space-y-1 p-2">
      {([{value:'todo',label:'Backlog'},{value:'doing',label:'In progress'},{value:'blocked',label:'Blocked'},{value:'done',label:'Completed'}] as {value:Task['status'];label:string}[]).map(option=><button type="button" key={option.value} aria-pressed={task.status===option.value} disabled={disabled} className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left text-xs hover:bg-muted" onClick={()=>updateTask(task,{status:option.value})}><ProjectTaskStateIcon status={option.value}/><span className="flex-1">{option.label}</span>{task.status===option.value&&<Check size={13}/>}</button>)}
    </PopoverContent>
  </Popover>;
  const openFullEditor=(taskId:string)=>{openTask(taskId);};
  const compactRow=(task:Task)=><div role="row" key={task.id} style={{gridTemplateColumns:columnWidths}}
    className={"bivi-task-row grid min-h-12 items-center gap-3 px-5 py-1.5 text-xs transition-colors hover:bg-slate-50 focus-within:bg-slate-50 dark:hover:bg-muted/50 dark:focus-within:bg-muted/50 "+(selectedTaskId===task.id?'bg-blue-50/60 dark:bg-primary/10':'')}>
    <div role="cell" className="flex min-w-0 items-center gap-2">
      {!visibleColumns.includes('status')&&statusMenu(task)}
      <span className="w-14 shrink-0 font-mono text-[10px] text-muted-foreground">{presentation.rows.find(row=>row.task_id===task.id)?.code??'Draft'}</span>
      <button type="button" onClick={()=>openTask(task.id)} className="min-w-0 flex-1 truncate text-left font-medium hover:underline" title={task.title}>{task.title}</button>
    </div>
    {visibleColumns.map(column=><div key={column} role="cell" className="min-w-0 overflow-hidden">{columnValue(task,column)}</div>)}
    <div role="cell">{taskEditControl(task)}</div>
  </div>;
  const selectedTasks=body.tasks.filter(task=>selectedTaskSet.has(task.id));
  const allVisibleSelected=orderedTasks.length>0&&orderedTasks.every(task=>selectedTaskSet.has(task.id));
  const toggleAllVisible=()=>{
    setSelectedTaskIds(previous=>{
      const next=new Set(previous);
      if(orderedTasks.length>0&&orderedTasks.every(task=>next.has(task.id))){
        orderedTasks.forEach(task=>next.delete(task.id));
      }else orderedTasks.forEach(task=>next.add(task.id));
      return [...next];
    });
  };
  const setBulkChange=(changes:Partial<Task>)=>{
    if(disabled||!selectedTasks.length)return;
    onBulkTaskChange(selectedTasks.map(task=>task.id),changes);
    setBulkMessage(`${selectedTasks.length} selected task${selectedTasks.length===1?'':'s'} queued for autosave.`);
  };
  const requestBulkStatus=(status:Task['status'])=>{
    if(disabled||!selectedTasks.length)return;
    if(status==='done'){
      if(!hierarchy.data||hierarchy.data.projectRevision!==revision){
        setBulkMessage('Refresh the saved task hierarchy before marking multiple tasks completed.');
        return;
      }
      const selected=new Set(selectedTasks.map(task=>task.id));
      const blocked=selectedTasks.find(task=>{
        const prerequisite=taskControls.find(control=>control.taskId===task.id)?.dependsOn;
        const prerequisiteTask=prerequisite?body.tasks.find(row=>row.id===prerequisite):null;
        return Boolean(prerequisiteTask&&prerequisiteTask.status!=='done'&&!selected.has(prerequisiteTask.id))||
          subtasks.some(item=>item.taskId===task.id&&item.status!=='done');
      });
      if(blocked){
        setBulkMessage(`Cannot complete “${blocked.title}” while its prerequisites or subtasks remain unfinished.`);
        return;
      }
      setPrompt({title:'Complete selected tasks?',description:`Mark ${selectedTasks.length} selected tasks completed? Dependencies, client requirements and milestones must still pass project validation. Your changes will be submitted through autosave.`,confirm:()=>setBulkChange({status})});
    }else setBulkChange({status});
    if(status==='doing'||status==='done'){
      const pending=Object.fromEntries(selectedTasks.filter(task=>['todo','blocked'].includes(task.status)&&!schedule.rows.get(task.id)?.start_on).map(task=>[task.id,today]));
      setPendingStartDates(previous=>({...previous,...pending}));
    }
  };
  const requestBulkRemove=()=>{
    if(disabled||!selectedTasks.length)return;
    if(!hierarchy.data||hierarchy.data.projectRevision!==revision){
      setBulkMessage('Refresh the saved task hierarchy before removing multiple tasks.');
      return;
    }
    const blocked=selectedTasks.find(task=>subtasks.some(item=>item.taskId===task.id)||
      taskControls.some(control=>control.dependsOn===task.id));
    if(blocked){
      setBulkMessage(`Cannot remove “${blocked.title}”. Remove saved subtasks or reassign dependent tasks first.`);
      return;
    }
    const ids=selectedTasks.map(task=>task.id);
    setPrompt({title:`Remove ${ids.length} tasks?`,description:'Remove these tasks from the work-plan draft? Saved notes, files, discussions and audit history remain recorded. The deletion will be submitted through autosave.',confirm:()=>{
      onBulkTaskRemove(ids);setSelectedTaskIds(previous=>previous.filter(id=>!ids.includes(id)));
      setBulkMessage(`${ids.length} tasks removed from the draft; autosave is pending.`);
    }});
  };
  const copySelectedTaskLinks=()=>{
    const urls=selectedTasks.map(task=>new URL('/projects/'+id+'?tab=plan&task='+encodeURIComponent(task.id),window.location.origin).href);
    if(!urls.length)return;
    void navigator.clipboard.writeText(urls.join('\n')).then(()=>setBulkMessage(`Copied ${urls.length} internal task link${urls.length===1?'':'s'}. Existing access permissions still apply.`)).catch(()=>setBulkMessage('Could not copy links. Check browser clipboard permission.'));
  };
  const sectionGroups=groupWorkplanTasks(orderedTasks,grouping,context).filter(group=>group.tasks.length>0);
  const rowTable=(tasks:Task[],key:string,title?:string)=><section key={key} className="overflow-x-auto bg-white dark:bg-card">
    {title&&<h2 className="bg-slate-50 px-5 py-2 text-xs font-semibold dark:bg-muted/40">{title} <span className="ml-1 font-normal text-muted-foreground">{tasks.length}</span></h2>}
    <div role="table" aria-label={title??'Tasks'} className="w-full" style={{minWidth:tableMinWidth}}>
      <div role="row" style={{gridTemplateColumns:columnWidths}} className="grid min-h-9 items-center gap-3 border-b border-border/70 px-5 text-[11px] font-medium text-muted-foreground">
        <div role="columnheader">Name</div>{visibleColumns.map(column=><div role="columnheader" key={column} draggable title="Drag to reorder columns" className="cursor-grab" onDragStart={event=>{event.dataTransfer.setData('text/plain',column);event.dataTransfer.effectAllowed='move';}} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const source=event.dataTransfer.getData('text/plain') as TaskColumn;if(!visibleColumns.includes(source)||source===column)return;const next=visibleColumns.filter(item=>item!==source);next.splice(next.indexOf(column),0,source);changeColumns(next);}}>{labelForColumn[column]}</div>)}<div role="columnheader"><span className="sr-only">Edit</span></div>
      </div>
      {tasks.map(compactRow)}
    </div>
  </section>;
  const viewTaskButton=(task:Task)=><div key={task.id} className="bivi-task-row flex min-w-0 items-center gap-2 rounded-lg border border-border/60 bg-white p-2 text-xs transition-colors hover:border-border hover:bg-slate-50 dark:bg-card dark:hover:bg-muted/60">
    <button type="button" onClick={()=>openTask(task.id)} className="flex min-w-0 flex-1 items-start gap-2 p-1 text-left">
      <ProjectTaskStateIcon status={task.status}/><span className="min-w-0 flex-1"><span className="block break-words font-medium">{task.title}</span><span className="mt-1 block text-[11px] text-muted-foreground">{task.dueOn?`Due ${task.dueOn}`:'No due date'}</span></span><span className="shrink-0">{taskPeople(task)}</span>
    </button>
    {taskEditControl(task)}
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


  // The full editor is intentionally not a nested task-row preview.
  // Each editable field appears once, with sidecar records remaining revision-safe.
  const editorTaskContent=(task:Task)=>{
    const children=subtasks.filter(item=>item.taskId===task.id);
    const startOn=schedule.rows.get(task.id)?.start_on??null;
    const priority=taskControls.find(row=>row.taskId===task.id)?.priority??null;
    const code=presentation.rows.find(row=>row.task_id===task.id)?.code??'Draft';
    const savedStartEnabled=!disabled&&!dirty&&sidecarReady&&schedule.busy===null;
    const completionBlocked=workflowGate?.taskId===task.id;
    return <div key={task.id} className="space-y-5 pb-6">
      <div className="space-y-2">
        <p className="font-mono text-[11px] text-muted-foreground">{code}</p>
        <div className="rounded-lg border border-border/70 bg-white p-3 dark:bg-card">
          <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Task title</label>
          <NameField title={task.title} disabled={disabled} onChange={title=>updateTask(task,{title})}/>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <section className="min-w-0 space-y-1.5" aria-label="Task status">
          <p className="text-[11px] font-medium text-muted-foreground">Status</p>
          <div className="flex min-h-10 items-center rounded-lg border border-border/70 bg-white px-2 dark:bg-card">{statusMenu(task)}<span className="ml-1 truncate text-xs">{task.status==='todo'?'Backlog':task.status==='doing'?'In progress':task.status==='done'?'Completed':'Blocked'}</span></div>
        </section>
        <section className="min-w-0 space-y-1.5" aria-label="Task priority">
          <p className="text-[11px] font-medium text-muted-foreground">Priority</p>
          <div className="flex min-h-10 items-center rounded-lg border border-border/70 bg-white px-1.5 dark:bg-card">
            <TaskPriorityCell projectId={id} taskId={task.id} priority={priority} revision={revision} disabled={disabled||dirty||!sidecarReady}/>
            <span className="min-w-0 truncate text-xs capitalize">{priority??'Not set'}</span>
          </div>
        </section>
        <label className="min-w-0 space-y-1.5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"><Play size={13} aria-hidden/>Start date</span>
          <input type="date" aria-label={'Start date for '+task.title} title="Start date" className="min-h-10 w-full min-w-0 cursor-pointer rounded-lg border border-border/70 bg-white px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 dark:bg-card"
            disabled={!savedStartEnabled} value={startOn??''}
            onClick={event=>{try{event.currentTarget.showPicker?.();}catch{ /* Native calendar fallback */ }}}
            onChange={event=>void schedule.save(task.id,event.target.value||null,task.dueOn,dirty)}/>
        </label>
        <label className="min-w-0 space-y-1.5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"><Flag size={13} aria-hidden/>Due date</span>
          <input type="date" aria-label={'Due date for '+task.title} title="Due date" className="min-h-10 w-full min-w-0 cursor-pointer rounded-lg border border-border/70 bg-white px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 dark:bg-card"
            disabled={disabled} value={task.dueOn??''}
            onClick={event=>{try{event.currentTarget.showPicker?.();}catch{ /* Native calendar fallback */ }}}
            onChange={event=>updateTask(task,{dueOn:event.target.value||null})}/>
        </label>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={'editor-task-description-'+task.id} className="block text-[11px] font-medium text-muted-foreground">Description</label>
        <textarea id={'editor-task-description-'+task.id} aria-label={'Task description for '+task.title}
          rows={4} maxLength={2000} disabled={disabled}
          className="min-h-24 w-full resize-y rounded-lg border border-border/70 bg-white p-3 text-xs leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 dark:bg-card"
          placeholder="Add a description of this task…" value={task.notes}
          onChange={event=>updateTask(task,{notes:event.target.value})}/>
      </div>

      <TaskTags projectId={id} projectRevision={revision} row={presentation.rows.find(row=>row.task_id===task.id)}
        catalog={tagCatalog} disabled={disabled||dirty||!sidecarReady} reload={presentation.load}/>

      <div className="rounded-lg border border-border/60 bg-white px-3 py-2 dark:bg-card">
        <TaskProductivity projectId={id} taskId={task.id} taskTitle={task.title}
          revision={revision} disabled={disabled||dirty||!sidecarReady} userId={userId} hidePriority/>
      </div>

      {completionBlocked&&<section role="alert" className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
        <p className="font-semibold">{workflowGate?.requirement}</p>
        {workflowGate?.correctiveActions.map(action=><p key={action}>{action}</p>)}
        {workflowGate?.overrideAvailable&&<><label className="block font-medium">Reason for overriding completion review
          <textarea className="mt-1 min-h-16 w-full rounded-md border border-input bg-background p-2 text-xs" maxLength={2000}
          value={workflowOverrideReason} onChange={event=>onWorkflowOverrideReason(event.target.value)} disabled={busy}/>
        </label><button type="button" className="min-h-9 rounded-lg bg-foreground px-3 text-xs font-medium text-background disabled:opacity-50" disabled={busy||!overrideReady||!workflowOverrideReason.trim()} onClick={onOverrideTaskStatus}>Override and change status</button></>}
      </section>}

      <details className="group/ownership rounded-lg border border-border/60 bg-white dark:bg-card">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 text-xs font-semibold [&::-webkit-details-marker]:hidden">
          Ownership &amp; dependencies <ChevronDown size={15} className="transition-transform group-open/ownership:rotate-180"/>
        </summary>
        <div className="space-y-3 border-t border-border/60 p-3">
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">Milestone</p>
            {assignment(task)}
          </div>
          <TaskMemberPicker taskId={task.id} controls={assignments} disabled={disabled||dirty||!sidecarReady}/>
          {dependencyPreview(task)}
          <ProjectLifecycleControls id={id} controls={taskControls} tasks={body.tasks} events={[]} taskOnlyTaskId={task.id}
            taskOnlyDisabled={disabled||dirty||!sidecarReady} showTaskManagement={false}/>
        </div>
      </details>

      <details className="group/subtasks rounded-lg border border-border/60 bg-white dark:bg-card">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 text-xs font-medium [&::-webkit-details-marker]:hidden">
          Subtasks ({hierarchy.data?children.length:'loading'})<ChevronDown size={15} className="transition-transform group-open/subtasks:rotate-180"/>
        </summary>
        <div className="border-t border-border/60 px-2 pb-2">
          <ul>{children.map(item=><SubtaskEditor key={item.id} item={item} disabled={!canEditSidecar} update={updateSubtask} requestRemove={removeSubtask} today={today}/>)}</ul>
          {newSubtaskFor===task.id?<div className="flex items-center gap-2 py-2"><input autoFocus className={nameInput} aria-label="New subtask title" maxLength={300} disabled={!canEditSidecar} value={newSubtaskTitle} onChange={event=>setNewSubtaskTitle(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();void addSubtask(task.id);}}}/>{btn('Save subtask',<Check size={15}/>,()=>{void addSubtask(task.id);},!canEditSidecar||!newSubtaskTitle.trim())}{btn('Cancel',<RotateCcw size={15}/>,()=>setNewSubtaskFor(null))}</div>
          :btn('Add subtask',<Plus size={15}/>,()=>{setNewSubtaskFor(task.id);setNewSubtaskTitle('');},!canEditSidecar||children.length>=50)}
        </div>
      </details>

      {(dirty||!sidecarReady)&&<p role="status" className="text-[11px] text-amber-700 dark:text-amber-300">Task changes are awaiting autosave. Saved assignments and dependencies can be edited after the project save is confirmed.</p>}

      <TaskActivityPreview projectId={id} taskId={task.id} defaultOpen/>

      <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
        <Popover>
          <PopoverTrigger asChild><button type="button" className={miniButton} title="About removing this task" aria-label="About removing this task"><Info size={16}/></button></PopoverTrigger>
          <PopoverContent align="end" className="w-72 text-xs"><p>Removing a task is a work-plan draft change. Existing dependencies must be reassigned first.</p>{children.length>0&&<p className="mt-2">Remove the {children.length} saved subtask{children.length===1?'':'s'} before removing this task.</p>}</PopoverContent>
        </Popover>
        <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          title="Remove task" aria-label={'Remove task '+task.title} disabled={disabled||!hierarchy.data||children.length>0} onClick={()=>onRemoveTask(task.id)}><Trash2 size={16}/></button>
      </div>
    </div>;
  };

  const editorPanel=showEditor?(
    <aside
      aria-label="Full task editor"
      style={{'--task-editor-width':editorWidth+'px'} as CSSProperties}
      className="absolute inset-y-0 right-0 z-30 flex min-h-0 w-[100vw] flex-col border-l border-border bg-white text-slate-950 shadow-lg dark:bg-card dark:text-foreground md:relative md:inset-auto md:z-auto md:h-full md:w-[var(--task-editor-width)] md:max-w-[75vw]"
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize task editor"
        aria-valuemin={320}
        aria-valuemax={760}
        aria-valuenow={editorWidth}
        tabIndex={0}
        title="Drag to resize the task editor. Use arrow keys for precise adjustments."
        className="group absolute inset-y-0 -left-1 z-10 hidden w-2 cursor-col-resize items-center justify-center outline-none focus-visible:bg-blue-500/20 md:flex"
        onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);}}
        onPointerMove={event=>{if(!event.currentTarget.hasPointerCapture(event.pointerId))return;setEditorWidth(clampWidth(window.innerWidth-event.clientX));}}
        onPointerUp={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);persistWidth(window.innerWidth-event.clientX);}}
        onPointerCancel={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);persistWidth(editorWidth);}}
        onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();persistWidth(editorWidth+(event.key==='ArrowLeft'?20:-20));}}}
      >
        <span className="rounded-full border border-border bg-card p-0.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><GripVertical size={14}/></span>
      </div>
      <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold">Edit task</h2>
        <button type="button" className={miniButton} aria-label="Close task editor" title="Close task editor" onClick={()=>setShowEditor(false)}><X size={17}/></button>
      </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 overscroll-contain">
          {selectedTaskId&&openTasks[selectedTaskId]&&(()=>{
            const task=body.tasks.find(row=>row.id===selectedTaskId);
            return task?editorTaskContent(task):null;
          })()}
          {(!selectedTaskId||!openTasks[selectedTaskId])&&<p className="p-3 text-xs text-muted-foreground">Select a task to edit its details.</p>}
        </div>
    </aside>
  ):null;

  return <section aria-label="Project tasks" className="bivi-workplan space-y-3 bg-white text-slate-950 dark:bg-background dark:text-foreground">
    <ProjectWorkplanToolbar actions={toolbarActions} onAdvancedToggle={onAdvancedToggle} advanced={advanced} projectId={id} filters={filters} onChange={change=>setFilters(previous=>({...previous,...change}))}
      view={view} onView={setView} grouping={grouping} onGrouping={setGrouping} sort={sort} onSort={setSort}
      columns={visibleColumns} onColumns={changeColumns} assignees={memberOptions}
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
    <div className="min-w-0">
      <div className="min-w-0 space-y-3">
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
                {items.map(task=><div key={task.id} className="rounded-lg bg-white dark:bg-card">{taskPreview(task)}</div>)}
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
        <footer role="status" className="px-5 py-3 text-[11px] text-muted-foreground">{orderedTasks.length} of {body.tasks.length} tasks · {subtasks.length} saved subtasks</footer>
      </div>
      {showEditor&&editorPanel&&(panelTarget?createPortal(editorPanel,panelTarget):editorPanel)}
    </div>
    <style jsx global>{`
      .bivi-workplan .bivi-task-edit-button { opacity: 0; transition: opacity 120ms ease; }
      .bivi-workplan .bivi-task-row:hover .bivi-task-edit-button,
      .bivi-workplan .bivi-task-row:focus-within .bivi-task-edit-button { opacity: 1; }
      @media (hover: none) { .bivi-workplan .bivi-task-edit-button { opacity: 1; } }
    `}</style>
    <Dialog open={prompt!==null} onOpenChange={open=>{if(!open)setPrompt(null);}}><DialogContent className="bivi-staff-surface"><DialogTitle>{prompt?.title}</DialogTitle><DialogDescription>{prompt?.description}</DialogDescription>{prompt?.blockers&&hasMilestoneCompletionBlockers(prompt.blockers)&&<div className="max-h-56 overflow-auto rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"><p className="font-semibold">Complete these tasks before completing this milestone.</p>{prompt.blockers.needsTask&&<p className="mt-2">Add at least one task to {prompt.blockers.milestoneTitle}.</p>}<ul className="ml-4 mt-2 list-disc space-y-1">{prompt.blockers.tasks.map(task=><li key={task.taskId}><a className="underline" href={`#${taskDomId(task.taskId)}`} onClick={event=>{event.preventDefault();navigateToTask(task.taskId);}}>{task.title}</a>{task.taskIncomplete?' — task is not completed':''}{task.subtasks.map(subtask=><span key={subtask.id}>; unfinished subtask: {subtask.title}</span>)}</li>)}</ul></div>}{prompt?.unavailable&&<p role="alert" className="rounded border border-red-300 p-2 text-xs">Completion is unavailable until the task hierarchy loads.</p>}<DialogFooter><button type="button" className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-muted" onClick={()=>setPrompt(null)}>{prompt?.blockers?'Continue editing':'Cancel'}</button>{(!prompt?.blockers||!hasMilestoneCompletionBlockers(prompt.blockers))&&<button type="button" className="rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background" onClick={()=>{const action=prompt?.confirm;setPrompt(null);action?.();}}>{prompt?.unavailable?'Refresh hierarchy':'Confirm'}</button>}</DialogFooter></DialogContent></Dialog>
  </section>;
}
