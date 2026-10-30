'use client';
import {taskDeadlineLabel,taskDeadlineDay,taskIsOverdue,localDateTime} from '@/lib/projects/deadlines';
import {useProjectClock} from './useProjectClock';
import Link from 'next/link';
import {ProjectUpcomingMeetings} from './ProjectUpcomingMeetings';
import type {ProjectMeeting} from '@/lib/projects/meeting-schema';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { ProfileImage } from '@/components/profile-images/ProfileImage';
import { DirectoryPhases, DirectoryProgress, DirectoryStatus, ProjectTaskStateIcon } from './DirectoryIndicators';
import type { ProjectRecord } from '@/lib/projects/data';
import type { ProjectDirectoryContext } from '@/lib/projects/directory-types';
import { projectOverviewSummary } from '@/lib/projects/overview-summary';
import { taskHref } from '@/lib/tasks/links';
import {useRouter} from 'next/navigation';
import {ProjectActivityList} from './ProjectActivityList';
import type {ProjectActivity} from '@/lib/projects/activity-data';
import type {OperationalStatus} from '@/lib/projects/operational-status';
import type {OverviewContent} from '@/lib/projects/overview-content';
import {distinctById} from '@/lib/projects/metrics';
import type { MilestonePhaseLink, ProjectRosterMember } from '@/lib/projects/overview-data';
import type { ProjectPhaseState } from '@/lib/projects/phase-status';
import type { ProjectPhaseColorMap } from '@/lib/projects/phase-colors';
import { ProjectMemberStack } from './ProjectMemberStack';
import { ProjectMilestonePreviews } from './ProjectMilestonePreviews';
import {ProjectMetric,ProjectPanel} from './ProjectVisuals';

export type OverviewRecord = Pick<ProjectRecord, 'request_id' | 'state' | 'body' | 'updated_at' | 'activated_at' | 'revision' | 'proposal_version'>;

const linkClass = 'inline-flex min-h-[32px] items-center gap-1 text-xs font-medium hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring';
const statusStyles = {
  todo: 'bg-muted text-muted-foreground',
  planned: 'bg-muted text-muted-foreground',
  doing: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  in_review: 'bg-fuchsia-50 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200',
  rejected: 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200',
  in_progress: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  blocked: 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  done: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
};
const statusLabels = {todo:'To do',planned:'Planned',doing:'In progress',in_progress:'In progress',blocked:'Blocked',in_review:'In review',rejected:'Rejected',done:'Completed'};
function WorkStatus({status}: {status: keyof typeof statusStyles}) {
  return <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium ${statusStyles[status]}`}><ProjectTaskStateIcon status={status} />{statusLabels[status]}</span>;
}
export function ProjectOverview({record, activityResult, content, meetings, context, today:initialToday, timezone, asOf, members, milestonePhases, phaseStates, phaseColors, operationalStatus}: {
  record: OverviewRecord;
  activityResult:{data:ProjectActivity|null;error:string|null};
  content:OverviewContent;
  meetings:{rows:ProjectMeeting[]|null;total:number|null};
  context?: ProjectDirectoryContext;
  today: string;
  timezone: string;asOf?:string;
  members: ProjectRosterMember[];
  milestonePhases: MilestonePhaseLink[];
  phaseStates: ProjectPhaseState[];
  phaseColors: ProjectPhaseColorMap;
  operationalStatus: OperationalStatus;
}) {
  const router=useRouter();
  const base = `/projects/${record.request_id}`;
  const now=useProjectClock(asOf);
  const today=localDateTime(now,timezone).date;
  const summary = projectOverviewSummary(record.body, today,{now,timezone});
  const pastDue=(task:typeof record.body.tasks[number])=>taskIsOverdue(task,{today,now,timezone});
  const name = context?.company?.name || record.body.title;
  return <div className="space-y-3">
    <header className="grid gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <ProfileImage kind="company" subject={context?.company?.id || record.request_id} name={name} path={context?.company?.logoPath} size="h-10 w-10" />
        <div className="min-w-0"><h1 className="break-words text-lg font-semibold tracking-tight sm:text-xl">{name}</h1>
          <p className="mt-1 break-words text-xs text-muted-foreground">{context?.company ? record.body.title : 'Company not assigned'}</p>
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 self-start lg:items-end">
        <DirectoryStatus state={record.state} operationalStatus={operationalStatus} />
        <ProjectMemberStack members={members} />
      </div>
    </header>

    <section aria-label="Project work summary" className="grid grid-cols-2 gap-2 xl:grid-cols-4">
      <ProjectMetric label="Active open tasks" value={summary.openTasks.length} detail={`${summary.done} of ${distinctById(record.body.tasks).length} completed · includes archived tasks`} />
      <ProjectMetric label="Blocked tasks" value={summary.blocked} detail="Saved Blocked status · subset of Open" />
      <ProjectMetric label="Past-due open tasks" value={summary.overdue} detail={`${summary.dueToday} due today · ${today}`} />
      <ProjectMetric label="Milestones completed" value={`${summary.milestoneDone}/${record.body.milestones.length}`} detail="Saved milestone states" />
    </section>

    <ProjectMilestonePreviews id={record.request_id} body={record.body} members={members} phaseColors={phaseColors}
      phaseStates={phaseStates} milestonePhases={milestonePhases} content={content} today={today} timezone={timezone} />


    <ProjectUpcomingMeetings id={record.request_id} rows={meetings.rows} total={meetings.total} timezone={timezone}/>
    <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
      <div className="min-w-0 space-y-3 xl:order-2">
        <ProjectPanel title="Open tasks" action={<Link href={`${base}?tab=plan`} className={linkClass}>View all<ArrowUpRight size={13} aria-hidden /></Link>}>
          <div className="flex flex-wrap items-start gap-2 border-b border-border bg-muted/30 px-3 py-2 text-xs">
            <CalendarDays size={15} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0"><p className="text-[11px] text-muted-foreground">Earliest open deadline</p>
              {summary.nextDatedTask ? <Link className="mt-1 block break-words font-medium hover:underline" href={taskHref(record.request_id, summary.nextDatedTask.id)}>{taskDeadlineLabel(summary.nextDatedTask,timezone)} · {summary.nextDatedTask.title}</Link> : <p className="mt-1">{summary.openTasks.length ? 'No dated open tasks' : 'No open tasks'}</p>}
            </div>
          </div>
          <ul className="divide-y divide-border">{summary.openTasks.slice(0,5).map(task => <li key={task.id} className="flex flex-wrap items-start justify-between gap-2 px-3 py-2">
            <div className="min-w-0 flex-1 basis-40"><Link href={taskHref(record.request_id,task.id)} className="break-words text-xs font-medium hover:underline">{task.title}</Link><p className="mt-1 break-words text-[11px] text-muted-foreground">{task.owner || 'Unassigned'}</p></div>
            <div className="text-right"><WorkStatus status={task.status} /><p className={`mt-1 text-[11px] ${pastDue(task) ? 'font-medium text-red-700 dark:text-red-400' : 'text-muted-foreground'}`}>{task.dueOn ? `${taskDeadlineLabel(task,timezone)}${pastDue(task) ? ' · Past due' : taskDeadlineDay(task,timezone) === today ? ' · Today' : ''}` : 'No due date'}</p></div>
          </li>)}</ul>
          {!summary.openTasks.length && <p className="px-4 py-5 text-xs text-muted-foreground">No open tasks. Add or review work in Tasks & Milestones.</p>}
          {summary.openTasks.length > 5 && <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">Showing 5 of {summary.openTasks.length} · earliest deadline first.</p>}
        </ProjectPanel>
      </div>

      <div className="min-w-0 space-y-3 xl:order-1">
        <ProjectPanel title="Phase & task progress" action={<Link href={`${base}?tab=phases`} className={linkClass}>View phases<ArrowUpRight size={13} aria-hidden /></Link>}>
          <div className="space-y-3 p-3"><DirectoryPhases project={record} context={context} formalStates={phaseStates} phaseColors={phaseColors} /><div className="border-t border-border pt-2"><p className="mb-2 text-[10px] text-muted-foreground">Task completion</p><DirectoryProgress project={record} /><p className="mt-1 text-[10px] text-muted-foreground">Task progress includes archived tasks. Archiving does not satisfy completion or phase approval.</p></div></div>
        </ProjectPanel>
        <ProjectPanel title="Recent activity" action={<Link href={`${base}/activity`} className={linkClass}>View all<ArrowUpRight size={13} aria-hidden /></Link>}>
          {activityResult.data?<><ProjectActivityList activity={{...activityResult.data,events:activityResult.data.events.slice(0,4)}} timezone={timezone}/>
            {!activityResult.data.events.length&&<p className="px-4 py-5 text-xs text-muted-foreground">No recorded domain activity in the retained audit window.</p>}
            <p className="px-3 py-1.5 text-[10px] text-muted-foreground">Latest audited events · up to 4, not a total.</p></>:
            <p role="alert" className="p-4 text-xs">{activityResult.error}<button type="button" className="ml-2 underline" onClick={()=>router.refresh()}>Retry activity</button></p>}
        </ProjectPanel>

      </div>
    </div>
  </div>;
}
