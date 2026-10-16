'use client';
import Link from 'next/link';
import { Check, Circle, Minus } from 'lucide-react';
import { ProfileImage } from '@/components/profile-images/ProfileImage';
import type { ProjectSummary } from '@/lib/projects/data';
import type { ProjectDirectoryContext } from '@/lib/projects/directory-types';
import { directoryProgress } from '@/lib/projects/directory-progress';
import { projectPhaseLabels } from '@/lib/projects/lifecycle-schema';

const statusStyles = {
  active: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800',
  on_hold: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
  completed: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
};
export function DirectoryStatus({ state }: { state: ProjectSummary['state'] }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium ${statusStyles[state]}`}>
    {state === 'completed' ? <Check size={12} aria-hidden /> : state === 'on_hold' ? <Minus size={12} aria-hidden /> : <Circle size={10} aria-hidden />}
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
  return <div className="min-w-[100px]" title="Completed tasks divided by all tasks. Does not indicate phase approval or delivery readiness.">
    <div className="flex justify-between gap-3 text-[11px]"><span className="font-semibold">{progress.percent}%</span><span className="text-muted-foreground">{progress.done}/{progress.total} tasks</span></div>
    <div role="progressbar" aria-label={`${project.body.title}: task completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent} aria-valuetext={`${progress.done} of ${progress.total} tasks completed`} className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-blue-600 dark:bg-blue-400" style={{width:`${progress.percent}%`}} /></div>
  </div>;
}
const phaseStyles = {
  unknown: 'border-dashed border-border bg-background text-muted-foreground',
  not_started: 'border-border bg-muted text-muted-foreground',
  in_progress: 'border-blue-500 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  completed: 'border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
};
const phaseText = {unknown:'No mapped tasks', not_started:'Tasks not started', in_progress:'Tasks in progress', completed:'Tasks completed'};
export function DirectoryPhases({ project, context }: { project: ProjectSummary; context?: ProjectDirectoryContext }) {
  const progress = directoryProgress(project.body, context?.taskPhases ?? []);
  const latestComplete = [...progress.phases].reverse().find(phase => phase.state === 'completed');
  return <div className="min-w-[190px] space-y-2">
    <div className="flex gap-1" role="group" aria-label="Task activity by phase">
      {progress.phases.map((phase, index) => <span key={phase.phase} title={`${projectPhaseLabels[phase.phase]}: ${phaseText[phase.state]} (${phase.done}/${phase.total}); ${phase.blocked} blocked`} className={`flex h-5 min-w-0 flex-1 items-center justify-center rounded-sm border text-[9px] ${phaseStyles[phase.state]}`}>
        <span aria-hidden>{phase.state === 'completed' ? '✓' : phase.state === 'in_progress' ? '•' : index + 1}</span>
        <span className="sr-only">{projectPhaseLabels[phase.phase]}: {phaseText[phase.state]}, {phase.done} of {phase.total}, {phase.blocked} blocked.</span>
      </span>)}
    </div>
    <div className="flex flex-wrap gap-1">
      {progress.activePhases.map(phase => <span key={phase.phase} className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-800 dark:bg-blue-950 dark:text-blue-200">{projectPhaseLabels[phase.phase]}{phase.blocked ? ' · blocked' : ''}</span>)}
      {!progress.activePhases.length && <span className="text-[11px] text-muted-foreground">{latestComplete ? `${projectPhaseLabels[latestComplete.phase]} tasks completed` : 'No active phase tasks'}</span>}
    </div>
    <p className="text-[10px] text-muted-foreground">Selected phase: {context?.selectedPhase ? projectPhaseLabels[context.selectedPhase] : 'Not recorded'}{progress.unassigned > 0 ? ` · ${progress.unassigned} unmapped tasks` : ''}</p>
    <details className="text-[10px] text-muted-foreground"><summary className="cursor-pointer">Phase details</summary><ul className="mt-1 space-y-1">{progress.phases.map(phase => <li key={phase.phase}>{projectPhaseLabels[phase.phase]}: {phaseText[phase.state]} ({phase.done}/{phase.total}){phase.blocked ? ` · ${phase.blocked} blocked` : ''}</li>)}</ul><p className="mt-1">Task activity only; phase approvals remain in Lifecycle.</p></details>
  </div>;
}
