'use client';
import {taskDeadlineDay,taskDeadlineLabel} from '@/lib/projects/deadlines';
import {taskHref} from '@/lib/tasks/links';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, CircleDashed, Minus, Plus } from 'lucide-react';
import { effectiveTaskPhases, taskMetrics } from '@/lib/projects/metrics';
import { projectIntegrityIssues } from '@/lib/projects/integrity';
import type { ProjectBody } from '@/lib/projects/schema';
import { projectPhaseLabels, projectPhaseOrder, type ProjectPhase } from '@/lib/projects/lifecycle-schema';
import { phaseProgress, type PhaseStatus, type ProjectPhaseState } from '@/lib/projects/phase-status';
import type { ProjectPhaseColor } from '@/lib/projects/phase-colors';
import { DEFAULT_PROJECT_PHASE_COLOR, phaseColorFor, phaseTextColor } from '@/lib/projects/phase-colors';
import type { ProjectHierarchyResponse } from '@/lib/projects/hierarchy-schema';
import type { ProjectTaskControl } from '@/lib/projects/lifecycle-schema';
import { milestoneStats } from '@/lib/projects/workplan-views';
import { ProjectTaskStateIcon } from './DirectoryIndicators';
import { useProjectPhaseStatuses } from './useProjectPhaseStatuses';
import {useWorkspaceUnsavedChanges} from '../workspace/WorkspaceNavigationGuard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {ProjectMetric} from './ProjectVisuals';

const statuses: {status:PhaseStatus;label:string}[] = [
  { status:'planning',label:'Inactive' }, { status:'active',label:'Active' }, { status:'completed',label:'Completed' },
];

function PhaseIcon({status,color=DEFAULT_PROJECT_PHASE_COLOR}: {status:PhaseStatus;color?:string}) {
  if (status === 'completed') return <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full" style={{backgroundColor:color,color:phaseTextColor(color)}}><Check size={13} strokeWidth={3}/></span>;
  if (status === 'active') return <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white dark:bg-background" style={{borderColor:color}}><span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor:color}}/></span>;
  return <CircleDashed className="h-5 w-5 text-slate-400" aria-hidden="true"/>;
}

function label(date:string) {
  return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
}

function PhaseColorControl({phase,row,saving,disabled,feedback,onSave}: {
  phase:ProjectPhase; row:ProjectPhaseColor; saving:boolean; disabled:boolean; feedback?:{kind:'saved'|'error';message:string}; onSave:(phase:ProjectPhase,color:string|null)=>Promise<boolean>;
}) {
  const current = row.color?.toUpperCase() ?? null;
  const [draft,setDraft] = useState(current ?? DEFAULT_PROJECT_PHASE_COLOR);
  const [baseline,setBaseline]=useState({color:current??DEFAULT_PROJECT_PHASE_COLOR,revision:row.revision});
  const dirty=draft.toUpperCase()!==baseline.color;
  const stale=row.revision>baseline.revision;
  useEffect(()=>{if(!dirty){setDraft(current??DEFAULT_PROJECT_PHASE_COLOR);setBaseline({color:current??DEFAULT_PROJECT_PHASE_COLOR,revision:row.revision});}},[current,row.revision,dirty]);
  async function save(value:string|null){
    if(stale||disabled||saving)return false;
    const saved=await onSave(phase,value);
    if(saved){setDraft(previous=>previous===draft?value??DEFAULT_PROJECT_PHASE_COLOR:previous);setBaseline({color:value??DEFAULT_PROJECT_PHASE_COLOR,revision:row.revision+1});}
    return saved;
  }
  useWorkspaceUnsavedChanges(dirty,`${projectPhaseLabels[phase]} phase color`,async()=>{if(!await save(draft.toUpperCase()))throw new Error('Phase color needs review or could not save.');});
  return <div className="flex flex-wrap items-center gap-2">
    <label className="flex min-h-8 items-center gap-2 rounded-lg border border-border bg-background px-2 text-[11px]">
      <span>Color</span><input aria-label={`${projectPhaseLabels[phase]} phase color`} type="color" value={draft} disabled={saving||disabled} onChange={event=>setDraft(event.target.value.toUpperCase())} className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0 disabled:opacity-50"/>
      <span className="font-mono text-muted-foreground">{draft.toUpperCase()}</span>
    </label>
    <button type="button" disabled={saving||disabled||!dirty||stale} onClick={()=>void save(draft.toUpperCase())} className="min-h-8 rounded-lg border border-border px-2.5 text-[11px] font-medium hover:bg-muted disabled:opacity-45">{saving?'Saving…':'Save color'}</button>
    <button type="button" disabled={saving||disabled||current===null||stale} onClick={()=>void save(null)} className="min-h-8 rounded-lg px-2 text-[11px] text-muted-foreground underline hover:text-foreground disabled:opacity-45">Reset default</button>
    {stale&&dirty&&<span role="alert" className="text-[11px]">Saved color changed to {current??DEFAULT_PROJECT_PHASE_COLOR}. <button type="button" className="underline" onClick={()=>{setDraft(current??DEFAULT_PROJECT_PHASE_COLOR);setBaseline({color:current??DEFAULT_PROJECT_PHASE_COLOR,revision:row.revision});}}>Use saved</button> <button type="button" className="underline" onClick={()=>setBaseline({color:current??DEFAULT_PROJECT_PHASE_COLOR,revision:row.revision})}>Keep my color after review</button></span>}
    {feedback&&<span role={feedback.kind==='error'?'alert':'status'} className={`text-[11px] ${feedback.kind==='error'?'text-red-700 dark:text-red-300':'text-emerald-700 dark:text-emerald-300'}`}>{feedback.message}</span>}
  </div>;
}

export function ProjectPhaseCards({id,body,links,initialStates,colorRows,colorFeedback,colorSaving,onSaveColor,controls,subtasks,disabled,onAssignMilestone,timezone='America/Chicago'}: {
  id:string; body:ProjectBody;timezone?:string; links:ProjectHierarchyResponse['milestonePhases']; initialStates:ProjectPhaseState[];
  colorRows:Record<ProjectPhase,ProjectPhaseColor>; colorFeedback:Partial<Record<ProjectPhase,{kind:'saved'|'error';message:string}>>;
  colorSaving:ProjectPhase|null; onSaveColor:(phase:ProjectPhase,color:string|null)=>Promise<boolean>;
  controls:ProjectTaskControl[]; subtasks:ProjectHierarchyResponse['subtasks'];
  disabled:boolean; onAssignMilestone:(milestone:ProjectBody['milestones'][number],phase:ProjectPhase,checked:boolean)=>void;
}) {
  const phases = useProjectPhaseStatuses(id,initialStates);
  const [prompt, setPrompt] = useState<{phase:ProjectPhase;status:PhaseStatus}|null>(null);
  const [reason, setReason] = useState('');
  const [dialogError, setDialogError] = useState('');
  const promptMilestones = prompt ? body.milestones.filter(milestone => links.some(link => link.phase === prompt.phase && link.milestoneId === milestone.id)) : [];
  const unfinished = promptMilestones.filter(milestone => milestone.status !== 'done');
  const activeLinkedTasks = prompt ? body.tasks.filter(task => (task.status === 'doing' || task.status === 'blocked') &&
    promptMilestones.some(milestone => milestone.id === task.milestoneId)) : [];
  const currentPromptStatus = prompt ? phases.states?.find(item => item.phase === prompt.phase)?.status : null;
  const closeDialog = () => { setPrompt(null); setReason(''); setDialogError(''); };
  const perform = async () => {
    if (!prompt || phases.busy) return;
    setDialogError('');
    const result = await phases.save(prompt.phase,prompt.status,reason.trim());
    if (result.outcome === 'saved' || result.outcome === 'saved_refresh_failed') closeDialog();
    else setDialogError(result.error);
  };
  const savedStates = phases.states ?? initialStates;
  const activeCount = savedStates.filter(item=>item.status==='active').length;
  const completedCount = savedStates.filter(item=>item.status==='completed').length;
  const linkedMilestones = new Set(links.map(link=>link.milestoneId));
  const unassignedMilestones = body.milestones.filter(milestone=>!linkedMilestones.has(milestone.id));
  const unassignedTasks = body.tasks.filter(task=>!controls.some(control=>control.taskId===task.id)
    &&!(task.milestoneId&&links.some(link=>link.milestoneId===task.milestoneId)));
  const issues=projectIntegrityIssues(body,controls,links,subtasks);
  for(const task of body.tasks){
    const closed=effectiveTaskPhases(task,controls,links).filter(phase=>savedStates.some(state=>state.phase===phase&&state.status==='completed'));
    if(task.status!=='done'&&closed.length)issues.push(`${task.title}: unfinished work belongs to completed phases (${closed.map(phase=>projectPhaseLabels[phase]).join(', ')}). Reopen those phases before changing the work.`);
    if(task.status==='done'&&subtasks.some(item=>item.taskId===task.id&&item.status!=='done'))issues.push(`${task.title}: completed parent has unfinished subtasks. Reopen affected ancestors and the task before continuing.`);
  }
  const totals=taskMetrics(body.tasks);
  return <section aria-label="Project phase management" className="space-y-3">
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <ProjectMetric label="Phases" value={projectPhaseOrder.length}/>
      <ProjectMetric label="Active phases" value={activeCount}/>
      <ProjectMetric label="Completed phases" value={completedCount}/>
      <ProjectMetric label="Project work" value={<span className="text-sm">{body.milestones.length} milestones · {totals.total} tasks</span>} detail={`${subtasks.length} subtasks · counted separately`}/>
    </div>
    {issues.length>0&&<details className="rounded-lg border border-amber-300 p-3 text-xs"><summary>Association checks · {issues.length} item(s) to review</summary><ul className="mt-2 list-disc pl-4">{issues.map((issue,index)=><li key={index}>{issue}</li>)}</ul></details>}
    <p className="text-[11px] text-muted-foreground">Phase date ranges are derived from linked task and milestone due dates only. A phase with no saved due dates remains unscheduled.</p>
    {phases.error&&<div role="alert" className="rounded-lg border border-red-300 p-3 text-xs text-red-700 dark:text-red-300">{phases.error}<button type="button" onClick={()=>{void phases.load();}} className="ml-2 underline">Refresh statuses</button></div>}
    {phases.refreshWarning&&<div role="status" className="rounded-lg border border-amber-300 p-3 text-xs text-amber-900 dark:text-amber-200">{phases.refreshWarning}<button type="button" onClick={()=>{void phases.load();}} className="ml-2 underline">Refresh phases</button></div>}
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <ul className="divide-y divide-border">
        {projectPhaseOrder.map(phase=>{
          const state=phases.states?.find(item=>item.phase===phase) ?? initialStates.find(item=>item.phase===phase);
          const status=state?.status??'planning';
          const phaseName=projectPhaseLabels[phase];
          const related=body.milestones.filter(milestone=>links.some(link=>link.phase===phase&&link.milestoneId===milestone.id));
          const relatedIds=new Set(related.map(item=>item.id));
          const phaseTasks=new Map(body.tasks.filter(task=>effectiveTaskPhases(task,controls,links).includes(phase)).map(task=>[task.id,task]));
          const tasks=[...phaseTasks.values()];
          const children=subtasks.filter(item=>phaseTasks.has(item.taskId));
          const progress=phaseProgress(body,related.map(milestone=>milestone.id));
          const dates=[...tasks.map(task=>taskDeadlineDay(task,timezone)),...related.map(milestone=>milestone.dueOn)].filter((date):date is string=>Boolean(date)).sort();
          const color=phaseColorFor(phase,colorRows);
          return <li key={phase}>
            <details className="group">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 hover:bg-muted/30 [&::-webkit-details-marker]:hidden sm:px-4">
                <ChevronDown size={14} aria-hidden className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"/>
                <span className="min-w-[130px] flex-1 text-xs font-semibold">{phaseName}</span>
                <span className="text-[10px] text-muted-foreground">{related.length} milestones · {tasks.length} tasks · {children.length} subtasks</span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium ${status==='planning'?'border-border bg-muted text-muted-foreground':'border-border bg-card text-foreground'}`}><PhaseIcon status={status} color={color}/>{status==='planning'?'Inactive':status==='active'?'Active':'Completed'}</span>
                <span className="w-full pl-6 text-[10px] text-muted-foreground sm:w-auto sm:pl-0">{status==='active'?(dates.length?`Derived deadlines · ${label(dates[0])}${dates.at(-1)!==dates[0]?` – ${label(dates.at(-1)!)}`:''}`:'No saved deadlines'):'Phase dates are shown when active'}</span>
              </summary>
              <div className="space-y-3 border-t border-border bg-background/40 px-3 py-3 sm:px-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Popover><PopoverTrigger asChild><button type="button" disabled={disabled||!phases.states||phases.busy} title={`Change ${phaseName} status`} aria-label={`Change ${phaseName} status`} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-medium hover:bg-muted disabled:opacity-50"><PhaseIcon status={status}/>Change status</button></PopoverTrigger><PopoverContent align="start" className="w-40 p-1">{statuses.map(option=><button key={option.status} type="button" className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs hover:bg-muted" disabled={option.status===status} onClick={()=>{setPrompt({phase,status:option.status});setReason('');setDialogError('');}}><PhaseIcon status={option.status}/>{option.label}</button>)}</PopoverContent></Popover>
                  <PhaseColorControl phase={phase} row={colorRows[phase]} saving={colorSaving===phase} disabled={disabled} feedback={colorFeedback[phase]} onSave={onSaveColor}/>
                  {phases.savedByPhase[phase]&&<span role="status" className="text-[11px] text-emerald-700 dark:text-emerald-300">Saved as {phases.savedByPhase[phase].status==='active'?'Active':phases.savedByPhase[phase].status==='completed'?'Completed':'Inactive'} at {new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'}).format(new Date(phases.savedByPhase[phase].at))}</span>}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-medium">Milestones in {phaseName}</p>
                  <Popover><PopoverTrigger asChild><button type="button" disabled={disabled} className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-[11px] hover:bg-muted disabled:opacity-40"><Plus size={13} aria-hidden/>Assign milestones</button></PopoverTrigger><PopoverContent align="end" className="max-h-72 overflow-y-auto p-2"><p className="px-2 py-1 text-xs font-semibold">Link milestones to {phaseName}</p>{body.milestones.map(milestone=>{const checked=relatedIds.has(milestone.id);return <label key={milestone.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs hover:bg-muted"><input type="checkbox" checked={checked} disabled={disabled} onChange={event=>onAssignMilestone(milestone,phase,event.target.checked)}/><span>{milestone.title}</span></label>})}</PopoverContent></Popover>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {related.map(milestone=>{
                    const stats=milestoneStats(body,milestone.id);
                    const milestoneTasks=tasks.filter(task=>task.milestoneId===milestone.id);
                    return <article key={milestone.id} className="min-w-0 rounded-lg border border-border bg-card p-2.5">
                      <div className="flex items-start gap-2"><span aria-hidden className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm border border-black/15 dark:border-white/20" style={{backgroundColor:color}}/><div className="min-w-0 flex-1"><Link href={`/projects/${id}?tab=plan&milestone=${encodeURIComponent(milestone.id)}`} className="break-words text-xs font-medium hover:underline">{milestone.title}</Link><p className="mt-0.5 text-[10px] text-muted-foreground">{stats.done}/{stats.total} tasks · {milestone.dueOn?`Due ${label(milestone.dueOn)}`:'No saved due date'}</p></div><span className="text-[10px] capitalize text-muted-foreground">{milestone.status==='done'?'Completed':milestone.status==='in_progress'?'In progress':'Planned'}</span></div>
                      {milestoneTasks.length>0&&<ul className="mt-2 space-y-1 border-t border-border pt-2">{milestoneTasks.map(task=><li key={task.id} className="flex items-center gap-2 text-[10px]"><ProjectTaskStateIcon status={task.status}/><Link href={taskHref(id,task.id)} className="min-w-0 flex-1 truncate hover:underline">{task.title}</Link><span className="text-muted-foreground">{taskDeadlineLabel(task,timezone)||'Unscheduled'}</span></li>)}</ul>}
                    </article>;
                  })}
                  {!related.length&&<p className="text-[11px] text-muted-foreground">No milestones assigned to this phase.</p>}
                </div>
                {tasks.some(task=>!task.milestoneId)&&<div className="rounded-lg border border-dashed border-border p-2.5"><p className="mb-1 text-[11px] font-medium">Unassigned tasks linked to this phase</p><ul className="space-y-1">{tasks.filter(task=>!task.milestoneId).map(task=><li key={task.id} className="flex items-center gap-2 text-[10px]"><ProjectTaskStateIcon status={task.status}/><Link href={taskHref(id,task.id)} className="min-w-0 flex-1 truncate hover:underline">{task.title}</Link><span className="text-muted-foreground">{taskDeadlineLabel(task,timezone)||'Unscheduled'}</span></li>)}</ul></div>}
                {progress.total>0&&<p className="text-[10px] text-muted-foreground">{progress.completed}/{progress.total} linked milestones completed.</p>}
              </div>
            </details>
          </li>;
        })}
      </ul>
    </div>
    <details className="rounded-xl border border-dashed border-border bg-card">
      <summary className="cursor-pointer px-3 py-2.5 text-xs font-semibold">Unassigned work · {unassignedMilestones.length} milestones · {unassignedTasks.length} tasks</summary>
      <div className="grid gap-3 border-t border-border p-3 sm:grid-cols-2">
        <div><p className="mb-1 text-[11px] font-medium">Milestones without phase links</p>{unassignedMilestones.length?<ul className="space-y-1">{unassignedMilestones.map(milestone=><li key={milestone.id}><Link className="text-[11px] hover:underline" href={`/projects/${id}?tab=plan&milestone=${encodeURIComponent(milestone.id)}`}>{milestone.title}</Link></li>)}</ul>:<p className="text-[10px] text-muted-foreground">None</p>}</div>
        <div><p className="mb-1 text-[11px] font-medium">Tasks without a phase</p>{unassignedTasks.length?<ul className="space-y-1">{unassignedTasks.map(task=><li key={task.id}><Link className="text-[11px] hover:underline" href={taskHref(id,task.id)}>{task.title}</Link></li>)}</ul>:<p className="text-[10px] text-muted-foreground">None</p>}</div>
      </div>
    </details>
    <Dialog open={!!prompt} onOpenChange={open=>{if(!open&&!phases.busy)closeDialog();}}>
      <DialogContent className="bivi-staff-surface max-h-[85dvh] overflow-y-auto">
        <DialogTitle>{prompt?.status==='completed'?'Complete phase?':prompt?.status==='active'?'Activate phase?':'Set phase inactive?'}</DialogTitle>
        <DialogDescription>Change {prompt && projectPhaseLabels[prompt.phase]} to {prompt?.status==='planning'?'Inactive':prompt?.status}. This change is audited. Completing a phase never automatically completes its milestones or other phases.</DialogDescription>
        {prompt?.status==='completed'&&<div className="space-y-2 rounded-lg bg-muted/50 p-3 text-xs">
          {currentPromptStatus!=='active'&&<p className="font-medium text-amber-700 dark:text-amber-300">This phase must be Active before it can be completed.</p>}
          {unfinished.length>0&&<div><p className="font-semibold text-amber-700 dark:text-amber-300">{unfinished.length} linked milestone{unfinished.length===1?'':'s'} still need completion and review.</p><ul className="mt-1 list-inside list-disc">{unfinished.map(milestone=><li key={milestone.id}>{milestone.title}</li>)}</ul></div>}
          {activeLinkedTasks.length>0&&<div><p className="font-semibold text-amber-700 dark:text-amber-300">{activeLinkedTasks.length} linked task{activeLinkedTasks.length===1?' is':'s are'} still active or blocked.</p><ul className="mt-1 list-inside list-disc">{activeLinkedTasks.slice(0,5).map(task=><li key={task.id}>{task.title}</li>)}</ul></div>}
          {!promptMilestones.length&&<p>No milestones are linked to this phase. The server checks saved data when you confirm.</p>}
          {promptMilestones.length>0&&unfinished.length===0&&activeLinkedTasks.length===0&&<p>The server checks saved task, subtask, and milestone data when you confirm.</p>}
        </div>}
        {(dialogError||phases.error)&&<p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">{dialogError||phases.error}</p>}
        <label className="block text-xs font-medium">Reason <textarea value={reason} maxLength={2000} onChange={event=>setReason(event.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-input bg-background p-2 text-sm" placeholder="Add an audit note for this phase change"/></label>
        <DialogFooter><button type="button" disabled={phases.busy} className="rounded-lg border px-3 py-2 text-xs" onClick={closeDialog}>Cancel</button><button type="button" disabled={phases.busy} className="rounded-lg bg-foreground px-3 py-2 text-xs text-background disabled:opacity-50" onClick={()=>{void perform();}}>{phases.busy?'Saving…':'Confirm change'}</button></DialogFooter>
      </DialogContent>
    </Dialog>
  </section>;
}
