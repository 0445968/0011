'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowUpRight, CalendarDays, CheckCheck, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';
import type { ProjectBody } from '@/lib/projects/schema';
import type { ProjectPhase } from '@/lib/projects/lifecycle-schema';
import { projectPhaseLabels } from '@/lib/projects/lifecycle-schema';
import type { MilestonePhaseLink, ProjectRosterMember } from '@/lib/projects/overview-data';
import { milestoneStats } from '@/lib/projects/workplan-views';
import { activePhaseMilestones } from '@/lib/projects/overview-milestones';
import { calendarHref } from '@/lib/calendar/links';
import { ProjectTaskStateIcon } from './DirectoryIndicators';
import { ProjectMemberStack } from './ProjectMemberStack';

export function ProjectMilestonePreviews({ id, body, activePhases, milestonePhases, members }: {
  id: string;
  body: ProjectBody;
  activePhases: ProjectPhase[];
  milestonePhases: MilestonePhaseLink[];
  members: ProjectRosterMember[];
}) {
  const carousel = useRef<HTMLDivElement>(null);
  // Preserve milestone order within each status; finished milestones always move right.
  const visible = activePhaseMilestones(body, milestonePhases, activePhases);

  const move = (direction: -1 | 1) => {
    carousel.current?.scrollBy({ left: 320 * direction, behavior: 'smooth' });
  };

  return <section aria-label="Active-phase milestone carousel" className="min-w-0 space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-sm font-semibold">Active-phase milestones</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{visible.length} linked milestones · completed at the end</p></div>
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
    {visible.length ? <div ref={carousel} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3" role="list">
      {visible.map(milestone => {
        const progress = milestoneStats(body, milestone.id);
        const href = calendarHref({ event_type: 'milestone', request_id: id, source_id: milestone.id });
        const phases = milestonePhases.filter(link => link.milestoneId === milestone.id).map(link => link.phase);
        const taskIds = new Set(body.tasks.filter(task => task.milestoneId === milestone.id).map(task => task.id));
        const assigned = members.filter(member => member.assignedTaskIds.some(taskId => taskIds.has(taskId)));
        return <article key={milestone.id} role="listitem"
          className={`flex w-[270px] min-w-[270px] max-w-[85vw] shrink-0 snap-start flex-col justify-between rounded-2xl border border-border p-4 shadow-sm sm:w-[305px] sm:min-w-[305px] ${milestone.status === 'done' ? 'bg-muted/70' : 'bg-card'}`}>
          <div>
            <div className="flex items-start justify-between gap-3">
              <Link href={href} className="min-w-0 break-words text-base font-semibold leading-snug hover:underline">{milestone.title}</Link>
              <Link href={href} aria-label={`Open ${milestone.title}`} className="rounded-full border border-border p-1.5 text-muted-foreground hover:bg-muted"><ArrowUpRight size={14} aria-hidden /></Link>
            </div>
            <p className="mt-2 line-clamp-2 text-[11px] font-medium text-violet-700 dark:text-violet-300">
              {phases.map(phase => projectPhaseLabels[phase]).join(' · ')}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays size={15} aria-hidden /><span>{milestone.dueOn ? `Due ${milestone.dueOn}` : 'No due date'}</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium ${milestone.status === 'done' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : milestone.status === 'in_progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' : 'bg-muted text-foreground'}`}>
                <ProjectTaskStateIcon status={milestone.status}/>{milestone.status === 'done' ? 'Completed' : milestone.status === 'in_progress' ? 'In progress' : 'Planned'}
              </span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{progress.total ? `${progress.total - progress.done} remaining tasks` : 'No tasks assigned yet'}</p>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm"><span className="font-medium">Milestone progress</span><span className="tabular-nums">{progress.percent === null ? '—' : `${progress.percent}%`}</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full border border-border bg-background"
              role={progress.percent === null ? undefined : 'progressbar'} aria-label={`${milestone.title}: task completion`}
              aria-valuemin={progress.percent === null ? undefined : 0} aria-valuemax={progress.percent === null ? undefined : 100} aria-valuenow={progress.percent ?? undefined}>
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600" style={{width:`${progress.percent ?? 0}%`}} />
            </div>
            {!!assigned.length && <div className="mt-3"><ProjectMemberStack members={assigned} max={5} size="h-7 w-7"/></div>}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ListChecks size={15} aria-hidden />{progress.total} tasks</span>
              <span className="inline-flex items-center gap-1.5"><CheckCheck size={15} aria-hidden />{progress.done} done</span>
            </div>
          </div>
        </article>;
      })}
    </div> : <div className="rounded-xl border border-dashed border-border px-4 py-5 text-xs text-muted-foreground">
      No milestones are linked to the current or actively worked phases. Assign phases in Tasks & Milestones to display them here.
    </div>}
  </section>;
}
