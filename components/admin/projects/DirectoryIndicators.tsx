'use client';

import Link from 'next/link';
import { Check, Minus } from 'lucide-react';
import { ProfileImage } from '@/components/profile-images/ProfileImage';
import type { ProjectSummary } from '@/lib/projects/data';
import type { ProjectDirectoryContext } from '@/lib/projects/directory-types';
import { directoryProgress } from '@/lib/projects/directory-progress';
import { projectPhaseLabels, projectPhaseOrder } from '@/lib/projects/lifecycle-schema';
import type { ProjectPhaseState } from '@/lib/projects/phase-status';
import type { ProjectPhaseColorMap } from '@/lib/projects/phase-colors';
import { activePhaseFill, phaseColorFor, phaseTextColor } from '@/lib/projects/phase-colors';
import {operationalStatusFor,operationalStatusLabels,operationalStatusStyles,type OperationalStatus} from '@/lib/projects/operational-status';

/** A visual state, not a measured percentage of completion. */
export function ProjectTaskStateIcon({
  status,
  size = 'h-4 w-4',
}: {
  status: 'todo' | 'doing' | 'blocked' | 'done' | 'planned' | 'in_progress';
  size?: string;
}) {
  if (status === 'done') {
    return <span role="img" aria-label="Completed" className={`inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white ${size}`}>
      <Check size={11} strokeWidth={3} aria-hidden="true" />
    </span>;
  }
  if (status === 'doing' || status === 'in_progress') {
    return <span role="img" aria-label="In progress" className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-amber-500 bg-white dark:bg-background ${size}`}>
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-400" />
    </span>;
  }
  if (status === 'blocked') {
    return <span role="img" aria-label="Blocked" className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-red-500 bg-red-50 dark:bg-red-950 ${size}`}>
      <Minus size={10} strokeWidth={3} className="text-red-600 dark:text-red-300" aria-hidden="true" />
    </span>;
  }
  return <span role="img" aria-label="Not started" className={`inline-block shrink-0 rounded-full border-2 border-dashed border-slate-400 bg-transparent dark:border-slate-500 ${size}`} />;
}

function ProjectStatusIcon({ state }: { state: OperationalStatus }) {
  if (state === 'completed') return <ProjectTaskStateIcon status="done" />;
  if (state === 'on_hold') return <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-orange-500"><Minus size={10} strokeWidth={3} /></span>;
  if (state === 'waiting_on_client') return <span aria-hidden="true" className="h-3 w-3 rounded-full border-2 border-blue-600 bg-blue-100 dark:border-blue-300 dark:bg-blue-950" />;
  if (state === 'inactive') return <span aria-hidden="true" className="h-3 w-3 rounded-sm border border-muted-foreground bg-muted" />;
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-amber-500">
    <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M10 10 V2 A8 8 0 0 1 18 10 Z" fill="currentColor" />
  </svg>;
}

export function DirectoryStatus({ state, operationalStatus }: { state: ProjectSummary['state']; operationalStatus?: OperationalStatus }) {
  const status=operationalStatusFor(state,operationalStatus);
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-1 text-[11px] font-medium ${operationalStatusStyles[status]}`}>
    <ProjectStatusIcon state={status} />
    {operationalStatusLabels[status]}
  </span>;
}

export function DirectoryIdentity({ project, context }: { project: ProjectSummary; context?: ProjectDirectoryContext }) {
  const name = context?.company?.name || project.body.title;
  return <div className="flex min-w-0 items-center gap-2.5">
    <ProfileImage kind="company" subject={context?.company?.id || project.request_id} name={name} path={context?.company?.logoPath} size="h-9 w-9" />
    <div className="min-w-0">
      <Link href={`/admin/projects/${project.request_id}`} className="block break-words text-xs font-semibold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">{name}</Link>
      <p className="mt-0.5 break-words text-[11px] text-muted-foreground">{context?.company ? project.body.title : 'Company not assigned'}</p>
    </div>
  </div>;
}

export function DirectoryProgress({ project }: { project: ProjectSummary }) {
  const progress = directoryProgress(project.body, []);
  if (progress.percent === null) return <span className="text-xs text-muted-foreground">Not enough data</span>;
  return <div className="min-w-[100px]" title="Completed tasks divided by all tasks; not phase approval or delivery readiness.">
    <div className="flex justify-between gap-3 text-[11px]"><span className="font-semibold">{progress.percent}%</span><span className="text-muted-foreground">{progress.done}/{progress.total} tasks</span></div>
    <div role="progressbar" aria-label={`${project.body.title}: task completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent} aria-valuetext={`${progress.done} of ${progress.total} tasks completed`} className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950">
      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600" style={{ width: `${progress.percent}%` }} />
    </div>
  </div>;
}

export function DirectoryPhases({ project, context, formalStates, phaseColors = {} }: { project: ProjectSummary; context?: ProjectDirectoryContext; formalStates: ProjectPhaseState[]; phaseColors?: ProjectPhaseColorMap }) {
  const progress = directoryProgress(project.body, context?.taskPhases ?? []);
  const saved = new Map((formalStates ?? []).map(item=>[item.phase,item.status]));
  const projectId=project.request_id;
  return <div className="min-w-[170px] space-y-2">
    <div className="flex items-center gap-0.5" role="group" aria-label="Saved project phase statuses">
      {projectPhaseOrder.map(phase=>{
        const formal=saved.get(phase)??'planning';
        const state=formal==='completed'?'completed':formal==='active'?'in_progress':'not_started';
        const status=state==='completed'?'Completed':state==='in_progress'?'Active':'Inactive';
        const color=phaseColorFor(phase,phaseColors);
        const fill=activePhaseFill(color);
        return <Link key={phase} href={`/projects/${projectId}?tab=phases`} title={`${projectPhaseLabels[phase]}: ${status}`}
          aria-label={`${projectPhaseLabels[phase]}: ${status}. Open Phases.`}
          className="group relative flex h-8 min-w-[16px] flex-1 items-center justify-center rounded-[3px] border border-transparent outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring"
          data-phase-status={state}>
          <span aria-hidden className={`absolute inset-x-0 inset-y-1.5 rounded-[3px] border ${state==='completed'?'border-transparent':state==='in_progress'?'border-transparent':'border-dashed border-border bg-muted'}`}
            style={state==='completed'?{backgroundColor:color}:state==='in_progress'?{backgroundColor:fill.light}:undefined}/>
          {state==='in_progress'&&<span aria-hidden className="absolute inset-x-0 inset-y-1.5 hidden rounded-[3px] dark:block" style={{backgroundColor:fill.dark}}/>}
          {state==='completed'&&<Check aria-hidden size={10} className="relative z-[1] drop-shadow" style={{color:phaseTextColor(color)}}/>}
          {state==='in_progress'&&<span aria-hidden className="relative z-[1] h-1.5 w-1.5 rounded-full border border-violet-950/60 bg-white dark:border-white dark:bg-zinc-900"/>}
          {state==='not_started'&&<Minus aria-hidden size={10} className="relative z-[1] text-muted-foreground"/>}
          <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[10px] text-popover-foreground shadow-md group-hover:block group-focus-visible:block">{projectPhaseLabels[phase]} · {status}</span>
          <span className="sr-only">{projectPhaseLabels[phase]}: {status}.</span>
        </Link>;
      })}
    </div>
    {progress.unassigned>0&&<p className="text-[10px] text-muted-foreground">{progress.unassigned} unmapped tasks</p>}
  </div>;
}
