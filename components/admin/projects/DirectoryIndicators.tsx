'use client';

import Link from 'next/link';
import { Check, Minus } from 'lucide-react';
import { ProfileImage } from '@/components/profile-images/ProfileImage';
import type { ProjectSummary } from '@/lib/projects/data';
import type { ProjectDirectoryContext } from '@/lib/projects/directory-types';
import { directoryProgress } from '@/lib/projects/directory-progress';
import { projectPhaseLabels } from '@/lib/projects/lifecycle-schema';

const projectStatusStyles = {
  active: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200',
  on_hold: 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-200',
  completed: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
};

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

function ProjectStatusIcon({ state }: { state: ProjectSummary['state'] }) {
  if (state === 'completed') return <ProjectTaskStateIcon status="done" />;
  if (state === 'on_hold') return <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-orange-500"><Minus size={10} strokeWidth={3} /></span>;
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-amber-500">
    <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M10 10 V2 A8 8 0 0 1 18 10 Z" fill="currentColor" />
  </svg>;
}

export function DirectoryStatus({ state }: { state: ProjectSummary['state'] }) {
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-1 text-[11px] font-medium ${projectStatusStyles[state]}`}>
    <ProjectStatusIcon state={state} />
    {state === 'active' ? 'In progress' : state === 'on_hold' ? 'On hold' : 'Completed'}
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

const phaseStyles = {
  unknown: 'border-dashed border-border bg-background',
  not_started: 'border-border bg-muted',
  in_progress: 'border-violet-300 bg-violet-200 dark:border-violet-700 dark:bg-violet-900/60',
  completed: 'border-violet-600 bg-violet-600 dark:border-violet-400 dark:bg-violet-500',
};
const phaseText = { unknown: 'No mapped tasks', not_started: 'Tasks not started', in_progress: 'Tasks in progress', completed: 'Tasks completed' };

export function DirectoryPhases({ project, context }: { project: ProjectSummary; context?: ProjectDirectoryContext }) {
  const progress = directoryProgress(project.body, context?.taskPhases ?? []);
  const latestComplete = [...progress.phases].reverse().find(phase => phase.state === 'completed');
  return <div className="min-w-[170px] space-y-2">
    <div className="flex items-stretch gap-1" role="group" aria-label="Task activity by phase">
      {progress.phases.map(phase => <span key={phase.phase}
        title={`${projectPhaseLabels[phase.phase]}: ${phaseText[phase.state]} (${phase.done}/${phase.total}); ${phase.blocked} blocked`}
        className={`h-6 min-w-[6px] flex-1 rounded-[3px] border ${phaseStyles[phase.state]}`}>
        <span className="sr-only">{projectPhaseLabels[phase.phase]}: {phaseText[phase.state]}, {phase.done} of {phase.total}, {phase.blocked} blocked.</span>
      </span>)}
    </div>
    <div className="flex flex-wrap gap-1">
      {progress.activePhases.map(phase => <span key={phase.phase} className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] text-violet-800 dark:bg-violet-950 dark:text-violet-200">{projectPhaseLabels[phase.phase]}{phase.blocked ? ' · blocked' : ''}</span>)}
      {!progress.activePhases.length && <span className="text-[11px] text-muted-foreground">{latestComplete ? `${projectPhaseLabels[latestComplete.phase]} tasks completed` : 'No active phase tasks'}</span>}
    </div>
    <p className="text-[10px] text-muted-foreground">Selected phase: {context?.selectedPhase ? projectPhaseLabels[context.selectedPhase] : 'Not recorded'}{progress.unassigned > 0 ? ` · ${progress.unassigned} unmapped tasks` : ''}</p>
    <details className="text-[10px] text-muted-foreground"><summary className="cursor-pointer">Phase details</summary><ul className="mt-1 space-y-1">{progress.phases.map(phase => <li key={phase.phase}>{projectPhaseLabels[phase.phase]}: {phaseText[phase.state]} ({phase.done}/{phase.total}){phase.blocked ? ` · ${phase.blocked} blocked` : ''}</li>)}</ul><p className="mt-1">Task activity only; formal phase completion remains in Lifecycle.</p></details>
  </div>;
}
