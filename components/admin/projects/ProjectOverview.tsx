import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight, CalendarDays, Clock3 } from 'lucide-react';
import { ProfileImage } from '@/components/profile-images/ProfileImage';
import { DirectoryPhases, DirectoryProgress, DirectoryStatus, ProjectTaskStateIcon } from './DirectoryIndicators';
import type { ProjectEvent, ProjectRecord } from '@/lib/projects/data';
import type { ProjectDirectoryContext } from '@/lib/projects/directory-types';
import { projectOverviewSummary } from '@/lib/projects/overview-summary';
import { taskHref } from '@/lib/tasks/links';
import { directoryProgress } from '@/lib/projects/directory-progress';
import type { MilestonePhaseLink, ProjectRosterMember } from '@/lib/projects/overview-data';
import type { ProjectPhaseState } from '@/lib/projects/phase-status';
import type { ProjectPhaseColorMap } from '@/lib/projects/phase-colors';
import { ProjectMemberStack } from './ProjectMemberStack';
import { ProjectMilestonePreviews } from './ProjectMilestonePreviews';

export type OverviewRecord = Pick<ProjectRecord, 'request_id' | 'state' | 'body' | 'updated_at' | 'activated_at' | 'revision' | 'proposal_version'>;

const linkClass = 'inline-flex min-h-[32px] items-center gap-1 text-xs font-medium hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring';
const statusStyles = {
  todo: 'bg-muted text-muted-foreground',
  planned: 'bg-muted text-muted-foreground',
  doing: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  in_progress: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  blocked: 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  done: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
};
const statusLabels = {todo:'To do',planned:'Planned',doing:'In progress',in_progress:'In progress',blocked:'Blocked',done:'Completed'};
function WorkStatus({status}: {status: keyof typeof statusStyles}) {
  return <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium ${statusStyles[status]}`}><ProjectTaskStateIcon status={status} />{statusLabels[status]}</span>;
}
function Panel({title, action, children}: {title:string; action?:ReactNode; children:ReactNode}) {
  return <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
    <header className="flex flex-wrap items-center justify-between gap-x-3 border-b border-border px-4 py-2.5"><h2 className="text-sm font-semibold">{title}</h2>{action}</header>
    {children}
  </section>;
}
function Metric({label, value, detail}: {label:string; value:string; detail:string}) {
  return <div className="min-w-0 rounded-xl border border-border bg-card px-4 py-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{detail}</p></div>;
}

export function ProjectOverview({record, history, context, today, members, milestonePhases, phaseStates, phaseColors}: {
  record: OverviewRecord;
  history: ProjectEvent[];
  context?: ProjectDirectoryContext;
  today: string;
  timezone: string;
  members: ProjectRosterMember[];
  milestonePhases: MilestonePhaseLink[];
  phaseStates: ProjectPhaseState[];
  phaseColors: ProjectPhaseColorMap;
}) {
  const base = `/projects/${record.request_id}`;
  const summary = projectOverviewSummary(record.body, today);
  const progress = directoryProgress(record.body, context?.taskPhases ?? []);
  const activePhases = progress.activePhases.map(item => item.phase);
  if (context?.selectedPhase && !activePhases.includes(context.selectedPhase)) activePhases.unshift(context.selectedPhase);
  const name = context?.company?.name || record.body.title;
  const stamp = (value:string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Not recorded' : new Intl.DateTimeFormat('en-US', {
      month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit', timeZone:'America/Chicago', timeZoneName:'short',
    }).format(date);
  };
  return <div className="space-y-3">
    <header className="grid gap-4 rounded-xl border border-border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <ProfileImage kind="company" subject={context?.company?.id || record.request_id} name={name} path={context?.company?.logoPath} size="h-12 w-12" />
        <div className="min-w-0"><h1 className="break-words text-lg font-semibold tracking-tight sm:text-xl">{name}</h1>
          <p className="mt-1 break-words text-xs text-muted-foreground">{context?.company ? record.body.title : 'Company not assigned'}</p>
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 self-start lg:items-end">
        <DirectoryStatus state={record.state} />
        <ProjectMemberStack members={members} />
      </div>
    </header>

    <section aria-label="Project work summary" className="grid grid-cols-2 gap-2 xl:grid-cols-4">
      <Metric label="Open tasks" value={String(summary.openTasks.length)} detail={`${summary.done} of ${record.body.tasks.length} completed`} />
      <Metric label="Blocked tasks" value={String(summary.blocked)} detail="Recorded task blockers" />
      <Metric label="Past-due open tasks" value={String(summary.overdue)} detail={`${summary.dueToday} due today · ${today}`} />
      <Metric label="Milestones completed" value={`${summary.milestoneDone}/${record.body.milestones.length}`} detail="Saved milestone states" />
    </section>

    <ProjectMilestonePreviews id={record.request_id} body={record.body} members={members} phaseColors={phaseColors}
      activePhases={activePhases} milestonePhases={milestonePhases} />


    <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
      <div className="min-w-0 space-y-3 xl:order-2">
        <Panel title="Open tasks" action={<Link href={`${base}?tab=plan`} className={linkClass}>All tasks & milestones<ArrowUpRight size={13} aria-hidden /></Link>}>
          <div className="flex flex-wrap items-start gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs">
            <CalendarDays size={15} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0"><p className="text-[11px] text-muted-foreground">Earliest open deadline</p>
              {summary.nextDatedTask ? <Link className="mt-1 block break-words font-medium hover:underline" href={taskHref(record.request_id, summary.nextDatedTask.id)}>{summary.nextDatedTask.dueOn} · {summary.nextDatedTask.title}</Link> : <p className="mt-1">{summary.openTasks.length ? 'No dated open tasks' : 'No open tasks'}</p>}
            </div>
          </div>
          <ul className="divide-y divide-border">{summary.openTasks.slice(0,6).map(task => <li key={task.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3">
            <div className="min-w-0 flex-1 basis-40"><Link href={taskHref(record.request_id,task.id)} className="break-words text-xs font-medium hover:underline">{task.title}</Link><p className="mt-1 break-words text-[11px] text-muted-foreground">{task.owner || 'Unassigned'}</p></div>
            <div className="text-right"><WorkStatus status={task.status} /><p className={`mt-1 text-[11px] ${task.dueOn && task.dueOn < today ? 'font-medium text-red-700 dark:text-red-400' : 'text-muted-foreground'}`}>{task.dueOn ? `${task.dueOn}${task.dueOn < today ? ' · Past due' : task.dueOn === today ? ' · Today' : ''}` : 'No due date'}</p></div>
          </li>)}</ul>
          {!summary.openTasks.length && <p className="px-4 py-5 text-xs text-muted-foreground">No open tasks. Add or review work in Tasks & Milestones.</p>}
          {summary.openTasks.length > 6 && <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">Showing 6 of {summary.openTasks.length} open tasks, earliest due dates first.</p>}
        </Panel>
      </div>

      <div className="min-w-0 space-y-3 xl:order-1">
        <Panel title="Phase & task progress" action={<Link href={`${base}?tab=phases`} className={linkClass}>Phases<ArrowUpRight size={13} aria-hidden /></Link>}>
          <div className="space-y-4 p-4"><DirectoryPhases project={record} context={context} formalStates={phaseStates} phaseColors={phaseColors} /><div className="border-t border-border pt-3"><p className="mb-2 text-[11px] text-muted-foreground">Task completion</p><DirectoryProgress project={record} /><p className="mt-2 text-[11px] text-muted-foreground">Completed tasks ÷ all tasks. Phase approval and delivery readiness are separate.</p></div></div>
        </Panel>
        <Panel title="Recent project history" action={<Link href={`${base}/activity`} className={linkClass}>View all activity<ArrowUpRight size={13} aria-hidden /></Link>}>
        <ol tabIndex={0} aria-label="Recent project events" className="max-h-72 divide-y divide-border overflow-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">{history.slice(0,5).map(event => <li key={event.id} className="flex items-start gap-2.5 px-4 py-3"><Clock3 size={14} aria-hidden className="mt-0.5 shrink-0 text-muted-foreground" /><div className="min-w-0"><p className="break-words text-xs font-medium capitalize">{event.action.replaceAll('_',' ')}</p><time dateTime={event.created_at} className="mt-1 block text-[11px] text-muted-foreground">{stamp(event.created_at)}</time>{event.reason && <p className="mt-1 break-words text-xs text-muted-foreground">{event.reason}</p>}</div></li>)}</ol>
        {!history.length && <p className="px-4 py-5 text-xs text-muted-foreground">No recorded project history.</p>}
        {history.length > 5 && <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">Showing the 5 latest project events.</p>}
      </Panel>

      </div>
    </div>
  </div>;
}
