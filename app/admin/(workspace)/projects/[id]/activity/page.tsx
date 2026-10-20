import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { Clock3, ArrowUpRight } from 'lucide-react';
import { ProfileImage } from '@/components/profile-images/ProfileImage';
import { WorkspaceRecordDetails } from '@/components/admin/StaffWorkspaceShell';
import { requireStaff } from '@/lib/admin/auth';
import { getInquiry } from '@/lib/admin/inquiries';
import { getProject } from '@/lib/projects/data';
import { getProjectActivity, type ProjectActivityEvent } from '@/lib/projects/activity-data';

export const dynamic = 'force-dynamic';
const filters = [
  { id:'all',label:'All activity' }, { id:'tasks',label:'Tasks' },
  { id:'milestones',label:'Milestones' }, { id:'phases',label:'Phases' },
  { id:'members',label:'Assignments' }, { id:'clients',label:'Client requests' },
  { id:'files',label:'Files' }, { id:'discussion',label:'Discussion' },
  { id:'access',label:'Access' }, { id:'brief',label:'Brief' },
  { id:'project',label:'Project' },
] as const;

function timestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return new Intl.DateTimeFormat('en-US', {
    year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',
    timeZone:'America/Chicago',timeZoneName:'short',
  }).format(date);
}

export default async function ProjectActivityPage({ params,searchParams = {} }: {
  params:{id:string}; searchParams?:{type?:string};
}) {
  const {client} = await requireStaff();
  if (!z.string().uuid().safeParse(params.id).success) notFound();
  const [project, inquiry] = await Promise.all([
    getProject(client,params.id),getInquiry(client,params.id),
  ]);
  if (!project.record) notFound();
  const record = project.record;
  const activity = await getProjectActivity(client,params.id,record.body);
  const selected = filters.some(item => item.id === searchParams.type) ? searchParams.type : 'all';
  const visible = selected === 'all' ? activity.events : activity.events.filter(item => item.source === selected);
  const companyName = inquiry?.payload.company?.trim() || inquiry?.payload.name?.trim() || record.body.title;
  const base = `/projects/${params.id}`;
  return <div className="min-w-0 space-y-5 pb-10">
    <WorkspaceRecordDetails kind="project" id={params.id} title={companyName}
      recordType={record.body.title} status={record.state} />
    <header className="space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Project workspace</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">Project Activity</h1>
        <Link href={base} className="rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted">Overview</Link>
      </div>
      <p className="max-w-3xl text-sm text-muted-foreground">Chronological events sourced from saved project audits. No inferred approvals or invented communication events. Showing up to 250 recent events.</p>
    </header>
    <nav aria-label="Activity filters" className="flex flex-wrap gap-1.5">
      {filters.map(item=><Link key={item.id} href={item.id==='all' ? `${base}/activity` : `${base}/activity?type=${item.id}`}
        aria-current={selected===item.id?'page':undefined}
        className={`rounded-full border px-3 py-1.5 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${selected===item.id?'border-foreground bg-foreground text-background':'border-border bg-card hover:bg-muted'}`}>{item.label}</Link>)}
    </nav>
    <section aria-label="Project activity timeline" className="overflow-hidden rounded-xl border border-border bg-card">
      {visible.length ? <ol className="divide-y divide-border">
        {visible.map((event:ProjectActivityEvent)=>{
          const actor = event.actorId ? activity.actors[event.actorId] : null;
          const actorLabel = actor?.label ?? (event.actorId ? `Account ${event.actorId.slice(0,8)}` : 'Account no longer available');
          return <li key={event.id} className="flex items-start gap-3 px-4 py-4 sm:px-5">
            <div className="mt-0.5 shrink-0">
              {actor?.kind ? <ProfileImage kind={actor.kind} subject={actor.id} name={actor.label} path={actor.avatarPath} size="h-8 w-8" />
                : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground"><Clock3 size={15} aria-hidden="true"/></span>}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={event.href} className="inline-flex max-w-full flex-wrap items-center gap-1.5 break-words text-sm font-semibold hover:underline">
                {event.title}<ArrowUpRight size={13} aria-hidden="true"/>
              </Link>
              {event.detail && <p className="mt-1 break-words text-xs text-muted-foreground">{event.detail}</p>}
              <p className="mt-1.5 text-[11px] text-muted-foreground">{actorLabel} · <time dateTime={event.createdAt}>{timestamp(event.createdAt)}</time> · {event.source}</p>
            </div>
          </li>;
        })}
      </ol> : <p className="p-6 text-sm text-muted-foreground">No recorded events match this filter.</p>}
    </section>
    <p className="text-xs text-muted-foreground">This staff-only timeline uses existing auditable records. Historical changes without retained before-and-after data cannot be reconstructed. Saved snapshots may omit older individual field changes.</p>
  </div>;
}
