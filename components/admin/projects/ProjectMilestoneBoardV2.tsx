'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Check, CheckCheck, ChevronDown, ChevronRight, Clock3, Pencil, Plus, RefreshCcw, RotateCcw, Trash2 } from 'lucide-react';
import type { ProjectBody } from '@/lib/projects/schema';
import { projectPhaseLabels, projectPhaseOrder } from '@/lib/projects/lifecycle-schema';
import type { ProjectPhase } from '@/lib/projects/lifecycle-schema';
import { milestoneStats, nextStatus, workStatusOrder, milestoneStatusOrder, daysRemaining, remainingLabel, type WorkplanView } from '@/lib/projects/workplan-views';
import { taskToday } from '@/lib/tasks/links';
import type { ProjectHierarchyResponse } from '@/lib/projects/hierarchy-schema';
import { useProjectHierarchy } from './useProjectHierarchy';
import { ProjectManagersButton, ProjectOrganizationOwnerButton, TaskMemberPicker, useProjectAssignments } from './ProjectAssignments';
import { ProjectPhaseCards } from './ProjectPhaseCards';
import { expectedMilestoneStatus } from '@/lib/projects/phase-status';
import { ProjectTaskStateIcon } from './DirectoryIndicators';
import { useWorkspaceUnsavedChanges } from '../workspace/WorkspaceNavigationGuard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TaskProductivity } from './TaskProductivity';

type Task = ProjectBody['tasks'][number];
type Milestone = ProjectBody['milestones'][number];
type Subtask = ProjectHierarchyResponse['subtasks'][number];

const miniButton = 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40';
const dateClass = 'min-w-0 max-w-[150px] bg-transparent px-1 py-1 text-xs text-muted-foreground outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
const nameInput = 'w-full min-w-0 rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

type Prompt = { title: string; description: string; confirm: () => void };

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
  return <span className={`inline-flex items-center gap-1 text-xs tabular-nums ${!completed && days!==null && days<0 ? 'font-medium text-red-600 dark:text-red-400' : 'text-muted-foreground'}`} title={dueOn ?? 'No due date'}><Clock3 size={13} aria-hidden/>{remainingLabel(days)}</span>;
}

function SubtaskEditor({item,disabled,update,requestRemove,today}: {
  item:Subtask;disabled:boolean;update:(item:Subtask,changes:{title:string;status:Subtask['status'];dueOn:string|null})=>Promise<boolean>;requestRemove:(item:Subtask)=>void;today:string;
}) {
  const [title,setTitle]=useState(item.title);
  const [dueOn,setDueOn]=useState(item.dueOn??'');
  const [editing,setEditing]=useState(false);
  const dirty=title!==item.title||dueOn!==(item.dueOn??'');
  async function save() {if(!dirty)return true;if(!title.trim())return false;return update(item,{title:title.trim(),status:item.status,dueOn:dueOn||null});}
  useWorkspaceUnsavedChanges(dirty,`Subtask: ${item.title}`,async()=>{if(!(await save()))throw new Error('Subtask could not save.');});
  return <li className="flex flex-wrap items-center gap-2 border-t border-border/60 px-3 py-2 text-xs sm:flex-nowrap">
    <div className="flex min-w-[160px] flex-1 items-center gap-2 pl-5"><button type="button" disabled={disabled||dirty} onClick={()=>{void update(item,{title:item.title,status:nextStatus(item.status,workStatusOrder),dueOn:item.dueOn});}} className="rounded-full focus-visible:ring-2" aria-label={`Change subtask status: ${item.title}`}><ProjectTaskStateIcon status={item.status}/></button>
      {editing?<input autoFocus className={nameInput} value={title} maxLength={300} disabled={disabled} onChange={event=>setTitle(event.target.value)} onBlur={()=>{setEditing(false);void save();}} onKeyDown={event=>{if(event.key==='Enter')event.currentTarget.blur();}}/>:<span className={`min-w-0 flex-1 break-words ${item.status==='done'?'line-through text-muted-foreground':''}`}>{title}</span>}
      {!disabled&&!editing&&<button className={miniButton} type="button" aria-label={`Edit subtask ${title}`} onClick={()=>setEditing(true)}><Pencil size={13} aria-hidden/></button>}
    </div>
    <StatusButton label={`subtask ${title}`} status={item.status} disabled={disabled||dirty} onChange={()=>{void update(item,{title:item.title,status:nextStatus(item.status,workStatusOrder),dueOn:item.dueOn});}}/>
    <Remaining dueOn={item.dueOn} today={today} completed={item.status==='done'}/>
    <input type="date" className={dateClass} aria-label={`Subtask due date ${title}`} value={dueOn} disabled={disabled} onChange={event=>setDueOn(event.target.value)} onBlur={()=>{void save();}}/>
    <button type="button" className={miniButton} disabled={disabled} onClick={()=>requestRemove(item)} aria-label={`Remove subtask ${title}`} title="Remove subtask"><Trash2 size={14} aria-hidden/></button>
  </li>;
}

export function ProjectMilestoneBoard({id,revision,body,disabled,dirty,sidecarReady,onTaskChange,onMilestoneChange,onAddTask,onBulkTasks,userId}: {
  id:string;revision:number;body:ProjectBody;disabled:boolean;dirty:boolean;sidecarReady:boolean;
  onTaskChange:(index:number,changes:Partial<Task>)=>void;
  onMilestoneChange:(index:number,changes:Partial<Milestone>)=>void;
  onAddTask:(milestoneId:string|null)=>void;
  onBulkTasks:(milestoneId:string,status:'done'|'todo')=>void;
  userId:string;
}) {
  const hierarchy=useProjectHierarchy(id,revision,true);
  const assignments=useProjectAssignments(id);
  const [view,setView]=useState<WorkplanView>('milestones');
  const [prompt,setPrompt]=useState<Prompt|null>(null);
  const [newSubtaskFor,setNewSubtaskFor]=useState<string|null>(null);
  const [newSubtaskTitle,setNewSubtaskTitle]=useState('');
  const [expanded,setExpanded]=useState<Record<string,boolean>>({});
  const today=taskToday('America/Chicago').today;
  const canEditSidecar=!disabled&&!dirty&&sidecarReady&&!hierarchy.busy&&!hierarchy.conflict&&hierarchy.data?.projectRevision===revision;
  const phaseLinks=hierarchy.data?.milestonePhases??[];
  const subtasks=hierarchy.data?.subtasks??[];
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
  const setPhases=(milestone:Milestone,phase:ProjectPhase,checked:boolean)=>{
    const current=phaseLinks.filter(link=>link.milestoneId===milestone.id).map(link=>link.phase);
    const next=checked?[...current,phase]:current.filter(item=>item!==phase);
    void hierarchy.save({action:'set_milestone_phases',milestoneId:milestone.id,phases:projectPhaseOrder.filter(item=>next.includes(item))});
  };
  const updateSubtask=(item:Subtask,changes:{title:string;status:Subtask['status'];dueOn:string|null})=>hierarchy.save({action:'update_subtask',taskId:item.taskId,subtaskId:item.id,expectedSubtaskRevision:item.revision,...changes});
  const addSubtask=async(taskId:string)=>{if(!canEditSidecar||!newSubtaskTitle.trim())return;const success=await hierarchy.save({action:'add_subtask',taskId,subtaskId:crypto.randomUUID(),title:newSubtaskTitle.trim(),status:'todo',dueOn:null});if(success){setNewSubtaskTitle('');setNewSubtaskFor(null);}};
  const removeSubtask=(item:Subtask)=>setPrompt({title:'Remove subtask?',description:`Delete “${item.title}”? This is recorded through the hierarchy audit trail.`,confirm:()=>{void hierarchy.save({action:'remove_subtask',taskId:item.taskId,subtaskId:item.id,expectedSubtaskRevision:item.revision});}});
  const assignment=(task:Task)=> <Popover><PopoverTrigger asChild><button type="button" disabled={disabled} className="max-w-[190px] truncate rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted" aria-label={`Assign milestone for ${task.title}`} title="Assign to a milestone">{body.milestones.find(item=>item.id===task.milestoneId)?.title??'No milestone'} <ChevronDown className="inline h-3 w-3" aria-hidden/></button></PopoverTrigger><PopoverContent align="start" className="max-h-64 w-64 overflow-auto p-2"><p className="mb-2 px-2 text-[11px] font-medium text-muted-foreground">Move task to milestone</p>{[{id:null,title:'No milestone'},...body.milestones].map(m=><button key={m.id??'none'} type="button" className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-xs hover:bg-muted" onClick={()=>updateTask(task,{milestoneId:m.id})}><span className="truncate">{m.title}</span>{task.milestoneId===m.id&&<Check size={14} aria-hidden/>}</button>)}</PopoverContent></Popover>;
  const taskRow=(task:Task)=>{
    const children=subtasks.filter(item=>item.taskId===task.id);
    return <li key={task.id} className="border-t border-border/70 px-3 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button type="button" disabled={disabled} title="Change task status" aria-label={`Change status of ${task.title}`} className="rounded-full focus-visible:ring-2" onClick={()=>updateTask(task,{status:nextStatus(task.status,workStatusOrder)})}><ProjectTaskStateIcon status={task.status}/></button>
        <div className="min-w-[160px] flex-[2] basis-48"><NameField title={task.title} completed={task.status==='done'} disabled={disabled} onChange={title=>updateTask(task,{title})}/></div>
        <StatusButton status={task.status} disabled={disabled} onChange={()=>updateTask(task,{status:nextStatus(task.status,workStatusOrder)})} label={`task ${task.title}`}/>
        <div className="shrink-0">{assignment(task)}</div>
        <TaskMemberPicker taskId={task.id} controls={assignments} disabled={disabled||dirty||!sidecarReady} />
        <Remaining dueOn={task.dueOn} today={today} completed={task.status==='done'}/>
        <input type="date" className={dateClass} aria-label={`Due date for ${task.title}`} disabled={disabled} value={task.dueOn??''} onChange={event=>updateTask(task,{dueOn:event.target.value||null})}/>
      </div>
      <TaskProductivity projectId={id} taskId={task.id} taskTitle={task.title} revision={revision} disabled={disabled||dirty} userId={userId} />
      <details className="mt-1 pl-6 text-xs"><summary className="cursor-pointer py-1 text-muted-foreground">Subtasks ({children.length})</summary>
        <ul>{children.map(item=><SubtaskEditor key={`${item.id}:${item.revision}`} item={item} disabled={!canEditSidecar} update={updateSubtask} requestRemove={removeSubtask} today={today}/>)}</ul>
        {newSubtaskFor===task.id?<div className="flex flex-wrap items-center gap-2 py-2"><input autoFocus className={nameInput} aria-label="New subtask title" maxLength={300} disabled={!canEditSidecar} value={newSubtaskTitle} onChange={e=>setNewSubtaskTitle(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void addSubtask(task.id);}}}/>{btn('Save subtask',<Check size={15}/>,()=>{void addSubtask(task.id);},!canEditSidecar||!newSubtaskTitle.trim())}{btn('Cancel',<RotateCcw size={15}/>,()=>setNewSubtaskFor(null))}</div>:<div>{btn('Add subtask',<Plus size={15}/>,()=>{setNewSubtaskFor(task.id);setNewSubtaskTitle('');},!canEditSidecar||children.length>=50)}</div>}
      </details>
    </li>;
  };
  const milestoneCard=(milestone:Milestone)=>{
    const stats=milestoneStats(body,milestone.id);
    const isOpen=expanded[milestone.id]!==false;
    const phases=phaseLinks.filter(link=>link.milestoneId===milestone.id).map(link=>link.phase);
    return <article key={milestone.id} className={`min-w-0 overflow-hidden rounded-xl border border-border ${milestone.status==='done'?'bg-muted/60':'bg-card'}`}>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <button type="button" aria-expanded={isOpen} aria-label={`${isOpen?'Collapse':'Expand'} ${milestone.title}`} className={miniButton} onClick={()=>setExpanded(old=>({...old,[milestone.id]:!isOpen}))}>{isOpen?<ChevronDown size={17}/>:<ChevronRight size={17}/>}</button>
        <div className="min-w-[200px] flex-1"><NameField title={milestone.title} large completed={milestone.status==='done'} disabled={disabled} onChange={title=>updateMilestone(milestone,{title})}/><p className="mt-1 text-[11px] text-muted-foreground">{stats.done}/{stats.total} tasks completed</p></div>
        <StatusButton status={milestone.status} disabled={disabled} label={`milestone ${milestone.title}`} onChange={()=>{const next=nextStatus(milestone.status,milestoneStatusOrder);if(next==='done'){setPrompt({title:'Complete milestone?',description:`Mark “${milestone.title}” completed? Review its tasks before confirming.`,confirm:()=>updateMilestone(milestone,{status:'done'})});}else updateMilestone(milestone,{status:next});}}/>
        <Remaining dueOn={milestone.dueOn} today={today} completed={milestone.status==='done'}/>
        <input type="date" aria-label={`Due date for milestone ${milestone.title}`} value={milestone.dueOn??''} className={dateClass} disabled={disabled} onChange={event=>updateMilestone(milestone,{dueOn:event.target.value||null})}/>
        <Popover><PopoverTrigger asChild><button type="button" className="rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-50" disabled={!canEditSidecar} title="Manage phases">Phases ({phases.length}) <ChevronDown size={12} className="inline" aria-hidden/></button></PopoverTrigger><PopoverContent align="end" className="max-h-72 overflow-auto p-2"><p className="px-2 py-1 text-xs font-semibold">Assign milestone to phases</p>{projectPhaseOrder.map(phase=><label key={phase} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs hover:bg-muted"><input type="checkbox" disabled={!canEditSidecar} checked={phases.includes(phase)} onChange={e=>setPhases(milestone,phase,e.target.checked)}/>{projectPhaseLabels[phase]}</label>)}</PopoverContent></Popover>
      </div>
      <div className="mx-4 mb-3 flex items-center gap-3 text-[11px] text-muted-foreground"><div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600" style={{width:`${stats.percent??0}%`}}/></div>{stats.percent===null?'No tasks':`${stats.percent}%`}</div>
      {isOpen&&<div className="border-t border-border bg-background/40"><div className="flex items-center justify-between gap-3 px-4 py-2"><span className="text-xs font-semibold">Tasks</span><div className="flex items-center gap-1">{btn('Mark all tasks completed',<CheckCheck size={16}/>,()=>setPrompt({title:'Complete all tasks?',description:`Update ${stats.total} task${stats.total===1?'':'s'} in “${milestone.title}” in one audited project revision. Blocked tasks and unmet dependencies will be rejected. Save other work-plan edits first.`,confirm:()=>onBulkTasks(milestone.id,'done')}),disabled||dirty||!stats.total)}{btn('Mark all tasks not started',<RotateCcw size={15}/>,()=>setPrompt({title:'Reset task statuses?',description:`Return ${stats.total} task${stats.total===1?'':'s'} in “${milestone.title}” to To do in one audited project revision? Active tasks may depend on this work. Save other work-plan edits first.`,confirm:()=>onBulkTasks(milestone.id,'todo')}),disabled||dirty||!stats.total)}{btn('Add task',<Plus size={16}/>,()=>onAddTask(milestone.id),disabled||body.tasks.length>=100)}</div></div><ul>{body.tasks.filter(task=>task.milestoneId===milestone.id).map(taskRow)}</ul>{!stats.total&&<p className="px-4 py-4 text-xs text-muted-foreground">No tasks. Use + to add one.</p>}{stats.readyForReview&&milestone.status!=='done'&&<button type="button" disabled={disabled} onClick={()=>setPrompt({title:'Complete milestone?',description:`All tasks in “${milestone.title}” are done. Mark the milestone completed after review?`,confirm:()=>updateMilestone(milestone,{status:'done'})})} className="m-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">All tasks done — review milestone completion</button>}</div>}
    </article>;
  };
  return <section aria-label="Project tasks, milestones and phases" className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-base font-semibold">Work plan</h2><p className="mt-1 text-xs text-muted-foreground">Task and milestone edits use the private draft and Save All. Phase links and subtasks save through the hierarchy API.</p></div><div className="flex flex-wrap gap-2"><ProjectManagersButton controls={assignments} disabled={disabled||dirty||!sidecarReady} />{btn('Refresh hierarchy',<RefreshCcw size={15}/>,()=>{void hierarchy.load();},hierarchy.busy)}</div></div>
    <ProjectOrganizationOwnerButton projectId={id} controls={assignments} disabled={disabled||dirty||!sidecarReady} />
    <div role="tablist" aria-label="Work-plan view" className="inline-flex gap-1 rounded-xl border border-border bg-muted/40 p-1">{(['tasks','milestones','phases'] as const).map(item=><button role="tab" aria-selected={view===item} key={item} type="button" onClick={()=>setView(item)} className={`rounded-lg px-4 py-2 text-xs font-medium capitalize focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${view===item?'bg-card shadow-sm':'text-muted-foreground hover:bg-muted'}`}>{item}</button>)}</div>
    {assignments.error&&<p role="alert" className="rounded-lg border border-red-200 p-3 text-xs text-red-700">{assignments.error}</p>}
    {hierarchy.error&&<p role="alert" className="rounded-lg border border-red-200 p-3 text-xs text-red-700">{hierarchy.error}</p>}
    {hierarchy.conflict&&<p role="alert" className="text-xs text-red-600">Project changes detected. Refresh hierarchy before continuing.</p>}
    {dirty&&<p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">Save All your task and milestone edits before editing phase links and subtasks.</p>}
    {view==='milestones'&&<div className="space-y-3">{body.milestones.map(milestoneCard)}{!body.milestones.length&&<p className="rounded-xl border border-dashed border-border p-5 text-xs text-muted-foreground">Create your first milestone in the Advanced work-plan editor.</p>}{body.tasks.some(task=>!task.milestoneId)&&<div className="rounded-xl border border-border bg-card p-3"><h3 className="text-sm font-semibold">Unassigned tasks</h3><ul>{body.tasks.filter(task=>!task.milestoneId).map(taskRow)}</ul></div>}</div>}
    {view==='tasks'&&<section className="rounded-xl border border-border bg-card"><div className="flex items-center justify-between gap-2 p-3"><h3 className="text-sm font-semibold">All tasks ({body.tasks.length})</h3>{btn('Add unassigned task',<Plus size={16}/>,()=>onAddTask(null),disabled||body.tasks.length>=100)}</div><ul>{body.tasks.map(taskRow)}</ul>{!body.tasks.length&&<p className="px-4 py-5 text-xs text-muted-foreground">No tasks yet.</p>}</section>}
    {view==='phases'&&<ProjectPhaseCards id={id} body={body} links={phaseLinks}
      disabled={disabled||dirty||!sidecarReady||!hierarchy.data||hierarchy.busy||hierarchy.conflict}
      onAssignMilestone={setPhases} />}
    <p className="text-[11px] text-muted-foreground">Phase assignments support multiple phases. Phase completion is explicitly reviewed in the Phases view; legacy Lifecycle gates remain separate. Staff-verified organization ownership and client-side task delegation are supported alongside existing response review.</p>
    <Dialog open={prompt!==null} onOpenChange={open=>{if(!open)setPrompt(null);}}><DialogContent className="bivi-staff-surface"><DialogTitle>{prompt?.title}</DialogTitle><DialogDescription>{prompt?.description}</DialogDescription><DialogFooter><button type="button" className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-muted" onClick={()=>setPrompt(null)}>Cancel</button><button type="button" className="rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background" onClick={()=>{const action=prompt?.confirm;setPrompt(null);action?.();}}>Confirm</button></DialogFooter></DialogContent></Dialog>
  </section>;
}
