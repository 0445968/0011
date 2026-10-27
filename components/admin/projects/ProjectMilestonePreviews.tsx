'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import {useRouter} from 'next/navigation';
import type {ProjectPhaseState} from '@/lib/projects/phase-status';
import {milestoneContent,type OverviewContent} from '@/lib/projects/overview-content';
import {daysRemaining,remainingLabel} from '@/lib/projects/workplan-views';
import { ArrowUpRight, CalendarDays, CheckCheck, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';
import type { ProjectBody } from '@/lib/projects/schema';
import { projectPhaseLabels } from '@/lib/projects/lifecycle-schema';
import type { ProjectPhaseColorMap } from '@/lib/projects/phase-colors';
import { phaseColorFor } from '@/lib/projects/phase-colors';
import type { MilestonePhaseLink, ProjectRosterMember } from '@/lib/projects/overview-data';
import { milestoneStats } from '@/lib/projects/workplan-views';
import { activePhaseMilestones } from '@/lib/projects/overview-milestones';
import { calendarHref } from '@/lib/calendar/links';
import { ProjectTaskStateIcon } from './DirectoryIndicators';
import { ProjectMemberStack } from './ProjectMemberStack';

export function ProjectMilestonePreviews({ id, body, phaseStates, milestonePhases, members, phaseColors, content, today }: {
  id: string;
  body: ProjectBody;
  phaseStates: ProjectPhaseState[];
  content:OverviewContent;
  today:string;
  milestonePhases: MilestonePhaseLink[];
  members: ProjectRosterMember[];
  phaseColors: ProjectPhaseColorMap;
}) {
  const carousel = useRef<HTMLDivElement>(null);
  const router=useRouter();
  const [scope,setScope]=useState('active');
  const errors=Object.values(content).flatMap(source=>source.error?[source.error]:[]);
  // Preserve milestone order within each status; finished milestones always move right.
  const visible = scope==='active'?activePhaseMilestones(body,milestonePhases,[],phaseStates):
    body.milestones.filter(milestone=>scope==='all'||!milestonePhases.some(link=>link.milestoneId===milestone.id))
      .sort((a,b)=>Number(a.status==='done')-Number(b.status==='done'));
  const unassignedTasks=body.tasks.filter(task=>!task.milestoneId||!body.milestones.some(m=>m.id===task.milestoneId));

  const move = (direction: -1 | 1) => {
    carousel.current?.scrollBy({ left: 320 * direction, behavior: 'smooth' });
  };

  return <section aria-label="Active-phase milestone carousel" className="min-w-0 space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><h2 className="text-sm font-semibold">Active-phase milestones</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{visible.length} saved · completed last</p>
        <label className="text-xs">Scope <select value={scope} onChange={event=>setScope(event.target.value)} className="rounded border border-border bg-background p-1"><option value="active">Active phases</option><option value="all">All milestones (including history)</option><option value="unassigned">No linked phase</option></select></label></div>
      <div className="flex items-center gap-1.5">
        <button type="button" aria-label="Previous milestones" onClick={() => move(-1)}
          className="rounded-lg border border-border p-1.5 hover:bg-muted"><ChevronLeft size={17} aria-hidden /></button>
        <button type="button" aria-label="Next milestones" onClick={() => move(1)}
          className="rounded-lg border border-border p-1.5 hover:bg-muted"><ChevronRight size={17} aria-hidden /></button>
        <Link href={`/projects/${id}?tab=plan`} className="ml-1 inline-flex items-center gap-1 text-xs font-medium hover:underline">
          Manage <ArrowUpRight size={13} aria-hidden />
        </Link>
      </div>
    </div>
    {!!errors.length&&<div role="alert" className="text-xs text-red-700 dark:text-red-400">{errors.join(' ')} <button type="button" className="underline" onClick={()=>router.refresh()}>Retry saved data</button></div>}
    <details className="text-xs"><summary className="cursor-pointer">Work without a milestone ({unassignedTasks.length})</summary>{unassignedTasks.map(task=><div key={task.id} className="py-1"><Link className="underline" href={`/projects/${id}?tab=plan&task=${encodeURIComponent(task.id)}`}>{task.title}</Link></div>)}</details>
    {visible.length ? <div ref={carousel} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3" role="list">
      {visible.map(milestone => {
        const progress = milestoneStats(body, milestone.id);
        const contents=milestoneContent(body,milestone.id,content,today);
        const href = calendarHref({ event_type: 'milestone', request_id: id, source_id: milestone.id });
        const phases = [...new Set(milestonePhases.filter(link => link.milestoneId === milestone.id).map(link => link.phase))];
        const taskIds = new Set(body.tasks.filter(task => task.milestoneId === milestone.id).map(task => task.id));
        const assigned = members.filter(member => member.assignedTaskIds.some(taskId => taskIds.has(taskId)));
        return <article key={milestone.id} role="listitem"
          className={`w-[260px] min-w-[260px] max-w-[85vw] shrink-0 snap-start rounded-xl border border-border p-3 ${milestone.status === 'done' ? 'bg-muted/70' : 'bg-card'}`}>
          <div>
            <div className="flex items-start justify-between gap-3">
              <Link href={href} className="min-w-0 break-words text-base font-semibold leading-snug hover:underline">{milestone.title}</Link>
              <Link href={href} aria-label={`Open ${milestone.title}`} className="rounded-full border border-border p-1.5 text-muted-foreground hover:bg-muted"><ArrowUpRight size={14} aria-hidden /></Link>
            </div>
            <Link className="mt-2 inline-block text-xs underline" href={`/projects/${id}?tab=plan&milestone=${encodeURIComponent(milestone.id)}`}>Open in Tasks &amp; Milestones</Link>
            <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">{phases.map(phase=><span key={phase} className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground"><span aria-hidden className="h-2.5 w-2.5 rounded-sm border border-black/15 dark:border-white/20" style={{backgroundColor:phaseColorFor(phase,phaseColors)}}/>{projectPhaseLabels[phase]}</span>)}</div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays size={15} aria-hidden /><span>{milestone.dueOn ? `Due ${milestone.dueOn}${milestone.status!=='done'?` · ${remainingLabel(daysRemaining(milestone.dueOn,today))}`:''}` : 'Unscheduled'}</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium ${milestone.status === 'done' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : milestone.status === 'in_progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' : 'bg-muted text-foreground'}`}>
                <ProjectTaskStateIcon status={milestone.status}/>{milestone.status === 'done' ? 'Completed' : milestone.status === 'in_progress' ? 'In progress' : 'Planned'}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">{progress.total ? `${progress.done}/${progress.total} tasks done · ${progress.total-progress.done} open` : 'No tasks assigned yet'}</p>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs"><span className="font-medium">Task completion</span><span className="tabular-nums">{progress.percent === null ? '—' : `${progress.percent}%`}</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full border border-border bg-background"
              role={progress.percent === null ? undefined : 'progressbar'} aria-label={`${milestone.title}: task completion`}
              aria-valuemin={progress.percent === null ? undefined : 0} aria-valuemax={progress.percent === null ? undefined : 100} aria-valuenow={progress.percent ?? undefined}>
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600" style={{width:`${progress.percent ?? 0}%`}} />
            </div>
            <div className="mt-2">{assigned.length?<ProjectMemberStack members={assigned} max={5} size="h-6 w-6"/>:<p className="text-[11px] text-muted-foreground">No verified task assignees</p>}</div>
            <div className="mt-2 space-y-1 text-[11px]">
              {(['files','notes','comments','communications'] as const).map(kind=><details key={kind}><summary className="cursor-pointer">{kind==='files'?'Linked files':kind==='notes'?'Authored task notes':kind==='communications'?'Task notification records':'Task discussion comments'}: {contents[kind]===null?'Unavailable':contents[kind]}</summary>
                <p className="text-[11px] text-muted-foreground">Distinct accessible {kind==='files'?'ready files linked to saved tasks (shared files count once)':kind==='notes'?'nonremoved authored task notes; excludes private work-plan text':kind==='communications'?'outbox IDs per recipient linked explicitly to these tasks; processing events are not a delivery receipt':'nonremoved task discussion comments; excludes project-wide discussion'}. Open a task for its content.</p>
                {contents.tasks.filter(task=>task[kind]!==0).map(task=><div key={task.id} className="py-1"><Link className="underline" href={kind==='communications'?`/projects/${id}/activity?type=communications&task=${encodeURIComponent(task.id)}`:kind==='comments'?`/projects/${id}/discussion?task=${encodeURIComponent(task.id)}`:`/projects/${id}?tab=plan&task=${encodeURIComponent(task.id)}`}>{task.title} ({task[kind]??'Unavailable'})</Link>{kind==='communications'&&<p>{Object.entries(task.communicationStates).map(([state,count])=>`${state}: ${count}`).join(' · ')}</p>}</div>)}
              </details>)}
              <details><summary className="cursor-pointer">Highest task suggestion: {contents.suggestion} · {contents.priorityAvailable?contents.manual.length:'Unavailable'} manual task priorities</summary>
                <p className="text-[11px] text-muted-foreground">Suggestions use saved task start/deadline intervals, excluding completed, blocked and dependency-waiting work. No milestone start date or milestone priority is inferred.</p>
                {contents.tasks.map(task=><p key={task.id}><Link className="underline" href={`/projects/${id}?tab=plan&task=${encodeURIComponent(task.id)}`}>{task.title}</Link>: suggestion {task.suggestion??'Not calculated'}; manual override {task.priorityAvailable?task.manual??'Not set':'Unavailable'}</p>)}
              </details>

            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ListChecks size={15} aria-hidden />{progress.total} tasks</span>
              <span className="inline-flex items-center gap-1.5"><CheckCheck size={15} aria-hidden />{progress.done}/{progress.total} done</span>
            </div>
          </div>
        </article>;
      })}
    </div> : <div className="rounded-xl border border-dashed border-border px-4 py-5 text-xs text-muted-foreground">
      No milestones match this scope. Choose All milestones for history, or manage links in Phases.
    </div>}
  </section>;
}
