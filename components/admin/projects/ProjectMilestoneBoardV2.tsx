Warning: truncated output (original token count: 23614)
Total output lines: 865

'use client';
import {taskDisplayState,type ReviewStates} from '@/lib/projects/task-review-state';
import {useProjectMutationRefresh} from './useProjectMutationRefresh';
import {useTaskWorkspace} from '../workspace/TaskWorkspaceContext';
import {WorkspaceRecordDetails} from '../StaffWorkspaceShell';
import {taskRecordId} from '@/lib/admin/workspace/navigation';
import {TaskRowMenu,TaskActionButton,type TaskAction} from './TaskActionMenu';
import {TaskInlineText} from './TaskInlineText';
import {TaskCategory} from './TaskCategory';

import { useCallback,useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useRouter,useSearchParams } from 'next/navigation';
import { postProjectCommand } from '@/lib/projects/immediate-command';
import { refreshProjectSurfaces } from '@/lib/projects/refresh';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Check, CheckCheck, ChevronDown, ChevronRight, Clock3, Flag, Rocket, UserRoundPlus, Pencil, SquareArrowOutUpRight, Plus, RefreshCcw, RotateCcw, Trash2, X, GripVertical, Info, AlertCircle, StickyNote, Folder, ArrowLeft } from 'lucide-react';
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
import {TaskTags,TaskTagChip,useTaskPresentation} from './TaskPresentation';
import { TaskProductivity } from './TaskProductivity';
import {compareTaskDeadlines,taskDeadlineDay,taskDeadlineLabel,taskEvent,localDateTime,taskIsOverdue,effectiveTaskPriority} from '@/lib/projects/deadlines';
import {useProjectClock} from './useProjectClock';
import { taskStartOn, taskTimeLabel, taskDateTimeLabel, DEFAULT_TASK_TIME_ZONE } from '@/lib/projects/task-timing';
import { WorkplanDraftReminder } from './WorkplanDraftReminder';
import { TaskActivityPreview } from './TaskActivityPreview';
import { useProjectTaskSchedule } from './useProjectTaskSchedule';
import { hasMilestoneCompletionBlockers, milestoneCompletionBlockers } from '@/lib/projects/workplan-completion';
import { taskDomId,taskHref } from '@/lib/tasks/links';
import { phaseColorFor } from '@/lib/projects/phase-colors';
import { useProjectPhaseColors } from './useProjectPhaseColors';
import { ProjectWorkplanToolbar, type TasksDisplayView, type TaskSort, type TaskColumn } from './ProjectWorkplanToolbar';
import { MilestoneOrderBoard } from './MilestoneOrderBoard';
import { emptyWorkplanFilters, groupWorkplanTasks, workplanMilestoneMatches, workplanTaskMatches, workplanTaskPhases, type WorkplanFilters, type TaskGrouping } from '@/lib/projects/workplan-filters';
import { ProfileImage } from '@/components/profile-images/ProfileImage';
import { ProjectLifecycleControls } from '@/components/admin/ProjectLifecycleControls';
import { TaskReviewRequirements } from './TaskReviewRequirements';
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
function TaskPriorityCell({projectId,taskId,priority,revision,disabled,overdue=false,saveRequired=false}:{
  projectId:string;taskId:string;priority:string|null|undefined;revision:number;disabled:boolean;overdue?:boolean;saveRequired?:boolean;
}){
  const router=useRouter();
  const [current,setCurrent]=useState(priority??null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>setCurrent(priority??null),[priority]);
  async function choose(value:string|null){
    if(busy||disabled||saveRequired||current===value)return;
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
    <PopoverTrigger asChild><button type="button" disabled={disabled||busy} className="inline-flex min-h-8 items-center gap-2 rounded-lg px-2 hover:bg-muted disabled:opacity-50" aria-label={'Change task priority, currently '+(overdue?'urgent (overdue)':current??'not set')}><PriorityBars priority={overdue?'urgent':current}/><span className="capitalize">{overdue?'Urgent':current??'Not set'}</span></button></PopoverTrigger>
    <PopoverContent align="start" className="w-44 space-y-1 p-2">
      {priorityChoices.map(option=><button key={option.label} type="button" className="flex min-h-8 w-full items-center gap-3 rounded-md px-2 text-left text-xs hover:bg-muted" aria-pressed={current===option.value} disabled={busy||disabled||saveRequired} onClick={()=>void choose(option.value)}><PriorityBars priority={option.value}/>{option.label}{current===option.value&&<Check size={13}/>}</button>)}
      {saveRequired&&<p role="status" className="p-1 text-[11px] text-muted-foreground">Save this new task once before assigning its priority.</p>}{overdue&&<p className="p-1 text-[11px] text-muted-foreground">Urgent while overdue. Your chosen priority returns when completed or rescheduled.</p>}
      {error&&<p role="alert" className="p-1 text-[11px] text-destructive">{error}</p>}
    </PopoverContent>
  </Popover>;
}

/** A native date input covers the full icon-and-date control so any click opens
 * the calendar, including when the field has no date. */
function TaskDateCell({label,value,disabled,icon,onChange,overdue=false,emptyLabel='—'}:{
  label:string;value:string|null;disabled:boolean;icon:ReactNode;overdue?:boolean;emptyLabel?:string;onChange:(value:string|null)=>void;
}){
  const formatted=value?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z')):emptyLabel;
  return <label title={label+(value?': '+formatted:': Not set')}
    className={(overdue?'text-red-600 dark:text-red-400 ':'text-muted-foreground ')+"relative inline-flex min-h-8 max-w-full cursor-pointer items-center gap-1.5 rounded-lg px-1.5 text-[11px] hover:bg-muted/50 focus-within:ring-2 focus-within:ring-ring has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"}>
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
const weekdayLabel=(date:string)=>new Intl.DateTimeFormat('en-US',{weekday:'short',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));

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

export function ProjectMilestoneBoard({id,revision,body,disabled,dirty,sidecarReady,onTaskChange,onMilestoneChange,onAddTask,onDuplicateTask,onAddMilestone,onEditTask,onEditMilestone,taskControls,isWorkflowAdmin=false,onBulkTasks,userId,today:initialToday,timezone=DEFAULT_TASK_TIME_ZONE,asOf,focusTaskId,focusTaskRequest,workflowGate,workflowOverrideReason,o…15614 tokens truncated…ons} onAdvancedToggle={onAdvancedToggle} advanced={advanced} projectId={id} filters={filters} onChange={change=>setFilters(previous=>({...previous,...change}))}
      view={view} onView={next=>{setView(next);if(next==='milestone')setSort('default');}} grouping={grouping} onGrouping={setGrouping} sort={sort} onSort={setSort}
      columns={visibleColumns} onColumns={changeColumns} showColumnLabels={showColumnLabels} onShowColumnLabels={changeColumnLabels} showDateWeekday={showDateWeekday} onShowDateWeekday={weekday=>saveDateDisplay(weekday,showDateTime)} showDateTime={showDateTime} onShowDateTime={time=>saveDateDisplay(showDateWeekday,time)} assignees={memberOptions}
      phasesReady={Boolean(hierarchy.data)} assignmentsReady={Boolean(assignments.data)}
      tagFilter={tagFilter} onTagFilter={setTagFilter} tags={tagCatalog.map(tag=>({value:tag.tag_key,label:tag.label}))}
      showEditor={showEditor} onToggleEditor={()=>{if(showEditor)closeEditor();else{clearEditorTask();setShowEditor(true);}}}
      onAddTask={()=>onAddTask(null)} onAddMilestone={onAddMilestone} disabled={disabled||archivedView}
      selectedCount={selectedTasks.length} visibleCount={orderedTasks.length} allVisibleSelected={allVisibleSelected}
      onToggleAllVisible={toggleAllVisible} onClearSelection={()=>setSelectedTaskIds([])}
      onBulkStatus={requestBulkStatus} onBulkDueDate={date=>setBulkChange({dueOn:date})}
      onBulkMilestone={milestoneId=>setBulkChange({milestoneId})}
      onBulkDelete={requestBulkRemove} onCopySelectedLinks={copySelectedTaskLinks}
      milestoneChoices={body.milestones.map(milestone=>({id:milestone.id,title:milestone.title}))}/>
    {bulkMessage&&<p role="status" className="mx-4 flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2 text-xs"><span>{bulkMessage}</span><button type="button" aria-label="Dismiss bulk action message" onClick={()=>setBulkMessage('')}><X size={14}/></button></p>}
    {presentation.error&&<p role="alert" className="text-xs text-destructive">{presentation.error} <button type="button" className="underline" onClick={()=>void presentation.load()}>Retry tags</button></p>}
    {assignments.error&&<p role="alert" className="text-xs text-destructive">{assignments.error}<button type="button" className="ml-2 underline" onClick={()=>void assignments.load()}>Retry members</button></p>}
    {schedule.error&&<p role="alert" className="text-xs text-destructive">{schedule.error}<button type="button" className="ml-2 underline" onClick={()=>void schedule.reload()}>Retry schedule</button></p>}
    {hierarchy.error&&<p role="alert" className="text-xs text-destructive">{hierarchy.error}<button type="button" className="ml-2 underline" onClick={()=>void hierarchy.load()}>Retry hierarchy</button></p>}
    {hierarchy.conflict&&<p role="alert" className="text-xs text-destructive">Project data changed. Refresh before editing linked records.</p>}
    {(hierarchy.busy||assignments.busy||schedule.busy)&&<p role="status" className="text-xs text-muted-foreground">Saving task details…</p>}
    {(hierarchy.message||assignments.message||schedule.message)&&<p role="status" className="text-xs text-emerald-700 dark:text-emerald-300">{[hierarchy.message,assignments.message,schedule.message].filter(Boolean).join(' ')}</p>}
    <WorkplanDraftReminder key={userId} userId={userId} projectId={id} dirty={dirty}/>
    {newSubtaskFor&&newSubtaskTitle.trim()&&<p role="status" className="text-xs text-amber-800 dark:text-amber-200">Unsaved subtask for {body.tasks.find(task=>task.id===newSubtaskFor)?.title}. <button type="button" className="underline" onClick={()=>openTask(newSubtaskFor)}>Return to editor</button>.</p>}
    <div className="min-w-0">
      <div className="min-w-0 space-y-3">
        {view==='overview'&&<div className="space-y-3">{(grouping==='none'?[{key:'all',label:'Tasks',tasks:orderedTasks}]:sectionGroups).map(group=>rowTable(group.tasks,group.key,grouping==='none'?undefined:group.label))}</div>}
        {view==='milestone'&&<MilestoneOrderBoard
          milestones={matchingMilestones} tasks={orderedTasks} folderColor={milestoneFolderColor}
          disabled={disabled} addDisabled={body.tasks.length>=100} canReorder={canReorderMilestones}
          orderDirty={orderDirty} saving={busy} saveIssue={orderSaveIssue} verifyRequired={orderVerifyRequired} onVerifySave={onVerifyOrder} onMove={onReorderTask}
          onAddTask={onAddTask} onSave={onSaveOrder} renderTask={taskPreview}
        />}
        {view==='list'&&<div className="space-y-3">{(grouping==='none'?[{key:'all',label:'Tasks',tasks:orderedTasks}]:sectionGroups).map(group=><TaskCategory key={group.key} title={group.label} count={group.tasks.length} selection={categorySelection(group.tasks,group.label)} onAdd={()=>onAddTask(null)} onSelect={()=>selectCategory(group.tasks,true)} onClear={()=>selectCategory(group.tasks,false)}>{group.tasks.map(viewTaskButton)}</TaskCategory>)}</div>}
        
        {view==='kanban'&&<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{(['todo','doing','blocked','done'] as const).map(status=><section key={status} className="min-w-0 rounded-xl bg-slate-50 p-2 dark:bg-muted/30"><h2 className="mb-2 px-2 text-xs font-semibold capitalize">{status==='todo'?'Backlog':status==='doing'?'In progress':status==='done'?'Completed':'Blocked'} <span className="text-muted-foreground">{orderedTasks.filter(task=>task.status===status).length}</span></h2><div className="space-y-2">{orderedTasks.filter(task=>task.status===status).map(viewTaskButton)}</div></section>)}</div>}
        {view==='timeline'&&<div className="space-y-3">{[...new Set(dateTasks.map(dueDay))].map(date=><section key={date!}><h2 className="mb-2 border-b border-border pb-1 text-xs font-semibold"><Flag size={13} className="mr-1 inline" aria-hidden/>Due {date}</h2><div className="space-y-1">{dateTasks.filter(task=>dueDay(task)===date).map(viewTaskButton)}</div></section>)}{undatedTasks.length>0&&<section><h2 className="mb-2 text-xs font-semibold">Without deadlines</h2><div className="space-y-1">{undatedTasks.map(viewTaskButton)}</div></section>}</div>}
        {view==='gantt'&&<div className="space-y-2 rounded-xl border border-border p-3">
          <p className="text-[11px] text-muted-foreground">Task bars align to the earliest saved start date and latest saved due date. Tasks with missing dates remain visible.</p>
          {firstStart&&lastDue&&<div className="flex justify-between gap-2 text-[11px] font-medium text-muted-foreground"><span>{firstStart}</span><span>{lastDue}</span></div>}
          {orderedTasks.map(task=>{
            const startEvent=taskEvent(task,'start',timezone,schedule.rows.get(task.id)?.start_on??null);
            const endEvent=taskEvent(task,'due',timezone);
            const start=startEvent.date;
            const end=endEvent.date;
            const valid=Boolean(start&&end&&start<=end&&firstStart);
            const offset=valid?Math.max(0,dayDifference(start!,firstStart!)):0;
            const duration=valid?Math.max(1,dayDifference(end!,start!)+1):0;
            const left=offset/rangeDays*100;
            const width=Math.max(0,Math.min(100-left,duration/rangeDays*100));
            return <div key={task.id} className="bivi-task-row grid gap-2 border-b border-border/40 py-2 sm:grid-cols-[minmax(175px,1fr)_minmax(180px,2fr)]">
              <div className="flex min-w-0 items-center gap-2">{taskSelectControl(task)}<button type="button" className="min-w-0 truncate text-left text-xs font-medium hover:underline" onClick={()=>openTask(task.id)}>{task.title}</button></div>
              <div className="min-w-0">
                <p className="mb-1 text-[10px] text-muted-foreground">{taskDateTimeLabel(start,startEvent.time,startEvent.timeZone)||'Not started'} → {taskDateTimeLabel(end,endEvent.time,endEvent.timeZone)||'—'}</p>
                {valid?<div className="relative h-4 w-full overflow-hidden rounded bg-slate-100 dark:bg-muted"><div className="absolute inset-y-0 rounded bg-blue-500/80" style={{left:`${left}%`,width:`${width}%`}} title={`${duration} calendar days from ${start} through ${end}`}/></div>:<span className="text-[10px] text-muted-foreground">Set start and due dates to display the schedule bar.</span>}
              </div>
            </div>;
          })}
        </div>}
        {view==='calendar'&&<div className="rounded-xl border border-border"><div className="flex items-center justify-between border-b border-border p-3"><button type="button" className={miniButton} aria-label="Previous month" onClick={()=>shiftMonth(-1)}><ChevronRight size={16} className="rotate-180"/></button><h2 className="text-sm font-semibold">{new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(monthDate)}</h2><button type="button" className={miniButton} aria-label="Next month" onClick={()=>shiftMonth(1)}><ChevronRight size={16}/></button></div><div className="grid grid-cols-7 border-b border-border text-center text-[10px] font-medium text-muted-foreground">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day=><div key={day} className="py-2">{day}</div>)}</div><div className="grid grid-cols-7">{dates.map((date,index)=><div key={index} className="min-h-20 border-b border-r border-border/40 p-1 text-[10px]"><span className="text-muted-foreground">{date?.slice(-2)??''}</span>{dateTasks.filter(task=>dueDay(task)===date).map(task=><div key={task.id} className="bivi-task-row mt-1 flex min-w-0 items-center gap-1 rounded bg-blue-50 px-1 py-0.5 dark:bg-blue-950">{taskSelectControl(task)}<button type="button" title={taskDeadlineLabel(task,timezone)+' · '+task.title} onClick={()=>openTask(task.id)} className="min-w-0 flex-1 truncate text-left text-[10px] text-blue-950 hover:underline dark:text-blue-100">{task.title}</button></div>)}</div>)}</div><p className="p-2 text-[11px] text-muted-foreground">Calendar dates use {timezone}. {undatedTasks.length} tasks without a due date are excluded from this calendar, not deleted.</p></div>}
        {!orderedTasks.length&&<p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">{body.tasks.length?'No tasks match the current filters.':'No tasks yet. Use + to create one.'}</p>}
        <footer className="flex items-center justify-between gap-3 px-5 py-3 text-[11px] text-muted-foreground"><span role="status">{orderedTasks.length} of {body.tasks.length} tasks (including archived) · {subtasks.length} saved subtasks</span><button type="button" aria-pressed={archivedView} className="min-h-9 rounded-lg border border-border px-3 text-xs" onClick={()=>{setSelectedTaskIds([]);setArchivedView(value=>!value);}}>{archivedView?'Show active tasks':'Archived ('+body.tasks.filter(task=>task.archived).length+')'}</button></footer>
      </div>
      {showEditor&&editorPanel&&(panelTarget?createPortal(editorPanel,panelTarget):editorPanel)}
    </div>
    <style jsx global>{`
      .bivi-task-toolbar details:not([open]) > :not(summary) { display: none; }
      @media (max-width: 639px) { .bivi-task-toolbar details[open] > :not(summary) { position: fixed; left: 12px; right: 12px; width: auto; max-width: calc(100vw - 24px); max-height: 75vh; overflow-y: auto; } }
      .bivi-workplan .bivi-group-select { opacity: 0; transition: opacity 120ms ease; }
      .bivi-workplan .bivi-task-group:hover .bivi-group-select,
      .bivi-workplan .bivi-group-select:focus-visible,
      .bivi-workplan .bivi-group-select[data-selected="true"] { opacity: 1; }
      @keyframes bivi-draft-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(234,179,8,.1); } 50% { box-shadow: 0 0 0 7px rgba(234,179,8,.45); } }
      .bivi-draft-pulse { animation: bivi-draft-pulse 1s ease-in-out 4; }
      @media (prefers-reduced-motion: reduce) { .bivi-draft-pulse { animation: none; outline: 3px solid #EAB308; outline-offset: 2px; } }
      @media (hover: none) { .bivi-workplan .bivi-group-select { opacity: 1; } }
      .bivi-workplan .bivi-task-select { opacity: 0; transition: opacity 120ms ease; }
      .bivi-workplan .bivi-task-row:hover .bivi-task-select,
      .bivi-workplan .bivi-task-row:focus-within .bivi-task-select,
      .bivi-workplan .bivi-task-select[data-selected="true"] { opacity: 1; }
      .bivi-workplan .bivi-task-edit-button { opacity: 0; transition: opacity 120ms ease; }
      .bivi-workplan .bivi-task-row:hover .bivi-task-edit-button,
      .bivi-workplan .bivi-task-row:focus-within .bivi-task-edit-button { opacity: 1; }
      @media (hover: none) { .bivi-workplan .bivi-task-edit-button, .bivi-workplan .bivi-task-select { opacity: 1; } }
    `}</style>
    <Dialog open={renameTaskId!==null} onOpenChange={open=>{if(!open)setRenameTaskId(null);}}><DialogContent><DialogTitle>Rename task</DialogTitle><DialogDescription>The new name stays in your draft until you save.</DialogDescription><form onSubmit={event=>{event.preventDefault();const task=body.tasks.find(item=>item.id===renameTaskId);if(task&&renameValue.trim()){updateTask(task,{title:renameValue.trim()});setRenameTaskId(null);}}}><input autoFocus aria-label="Task name" maxLength={300} value={renameValue} onChange={event=>setRenameValue(event.target.value)} className="min-h-10 w-full rounded border bg-background p-2 text-sm"/><button type="submit" disabled={disabled||!renameValue.trim()} className="mt-3 rounded bg-foreground px-3 py-2 text-xs text-background">Rename in draft</button></form></DialogContent></Dialog>
    <Dialog open={moveTaskId!==null} onOpenChange={open=>{if(!open)setMoveTaskId(null);}}><DialogContent><DialogTitle>Move task</DialogTitle><DialogDescription>Choose a milestone in this project. The move stays in your draft until you save.</DialogDescription><div className="max-h-80 overflow-auto">{[{id:null,title:'No milestone'},...body.milestones].map(milestone=><button type="button" key={milestone.id??'none'} disabled={disabled} className="block min-h-10 w-full rounded px-3 text-left text-sm hover:bg-muted" onClick={()=>{const task=body.tasks.find(item=>item.id===moveTaskId);if(task)updateTask(task,{milestoneId:milestone.id});setMoveTaskId(null);}}>{milestone.title}</button>)}</div></DialogContent></Dialog>
    <Dialog open={prompt!==null} onOpenChange={open=>{if(!open)setPrompt(null);}}><DialogContent className="bivi-staff-surface"><DialogTitle>{prompt?.title}</DialogTitle><DialogDescription>{prompt?.description}</DialogDescription>{prompt?.blockers&&hasMilestoneCompletionBlockers(prompt.blockers)&&<div className="max-h-56 overflow-auto rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"><p className="font-semibold">Complete these tasks before completing this milestone.</p>{prompt.blockers.needsTask&&<p className="mt-2">Add at least one task to {prompt.blockers.milestoneTitle}.</p>}<ul className="ml-4 mt-2 list-disc space-y-1">{prompt.blockers.tasks.map(task=><li key={task.taskId}><a className="underline" href={`#${taskDomId(task.taskId)}`} onClick={event=>{event.preventDefault();navigateToTask(task.taskId);}}>{task.title}</a>{task.taskIncomplete?' — task is not completed':''}{task.subtasks.map(subtask=><span key={subtask.id}>; unfinished subtask: {subtask.title}</span>)}</li>)}</ul></div>}{prompt?.unavailable&&<p role="alert" className="rounded border border-red-300 p-2 text-xs">Completion is unavailable until the task hierarchy loads.</p>}<DialogFooter><button type="button" className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-muted" onClick={()=>setPrompt(null)}>{prompt?.blockers?'Continue editing':'Cancel'}</button>{(!prompt?.blockers||!hasMilestoneCompletionBlockers(prompt.blockers))&&<button type="button" className="rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background" onClick={()=>{const action=prompt?.confirm;setPrompt(null);action?.();}}>{prompt?.unavailable?'Refresh hierarchy':'Confirm'}</button>}</DialogFooter></DialogContent></Dialog>
  </section>;
}
