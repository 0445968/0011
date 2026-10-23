import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import {ProjectActivityList} from '@/components/admin/projects/ProjectActivityList';
import { WorkspaceRecordDetails } from '@/components/admin/StaffWorkspaceShell';
import { requireStaff } from '@/lib/admin/auth';
import { getInquiry } from '@/lib/admin/inquiries';
import {taskToday} from '@/lib/tasks/links';
import { getProject } from '@/lib/projects/data';
import { getProjectActivity } from '@/lib/projects/activity-data';
import {ProjectPageHeader,ProjectPanel} from '@/components/admin/projects/ProjectVisuals';

export const dynamic = 'force-dynamic';
const filters = [
  { id:'all',label:'All activity' }, { id:'tasks',label:'Tasks' },
  { id:'milestones',label:'Milestones' }, { id:'phases',label:'Phases' },
  { id:'members',label:'Assignments' }, { id:'clients',label:'Client requests' },
  { id:'files',label:'Files' }, { id:'discussion',label:'Discussion' },
  { id:'access',label:'Access' }, { id:'brief',label:'Brief' },
  { id:'project',label:'Project' },{id:'delivery',label:'Delivery'},{id:'forms',label:'Forms/evidence'},{id:'meetings',label:'Meetings'},{id:'communications',label:'Communications'},
] as const;

export default async function ProjectActivityPage({ params,searchParams = {} }: {
  params:{id:string}; searchParams?:{type?:string;cursor?:string;task?:string};
}) {
  const {client,user} = await requireStaff();
  if (!z.string().uuid().safeParse(params.id).success) notFound();
  const [project, inquiry] = await Promise.all([
    getProject(client,params.id),getInquiry(client,params.id),
  ]);
  if (!project.record) notFound();
  const record = project.record;
  const [activity,preferences] = await Promise.all([
    getProjectActivity(client,params.id,record.body,searchParams.cursor,searchParams.task?.slice(0,100)),
    client.from('staff_notification_preferences').select('timezone').eq('user_id',user.id).maybeSingle(),
  ]);
  if(preferences.error)throw new Error('Activity timezone preferences could not load.');
  const {timezone}=taskToday(preferences.data?.timezone||'America/Chicago');
  const selected = filters.some(item => item.id === searchParams.type) ? searchParams.type : 'all';
  const visible = selected === 'all' ? activity.events : activity.events.filter(item => item.source === selected);
  const companyName = inquiry?.payload.company?.trim() || inquiry?.payload.name?.trim() || record.body.title;
  const base = `/projects/${params.id}`;
  return <div className="min-w-0 space-y-3 pb-8">
    <WorkspaceRecordDetails kind="project" id={params.id} title={companyName}
      recordType={record.body.title} status={record.state} />
    <ProjectPageHeader eyebrow="Project workspace" title="Activity" description="Saved project activity, ordered by its source audit records." action={<Link href={base} className="rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Overview</Link>}/>
    {searchParams.task&&<p className="text-[11px]">Task-filtered · <Link className="underline" href={`${base}/activity`}>Clear task filter</Link></p>}
    <details className="rounded-xl border border-border bg-card p-2.5"><summary className="cursor-pointer text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Filter events · {selected==='all'?'All activity':filters.find(item=>item.id===selected)?.label}</summary><nav aria-label="Activity filters" className="mt-2 flex flex-wrap gap-1.5">
      {filters.map(item=><Link key={item.id} href={item.id==='all' ? `${base}/activity` : `${base}/activity?type=${item.id}`}
        aria-current={selected===item.id?'page':undefined}
        className={`rounded-full border px-3 py-1.5 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${selected===item.id?'border-foreground bg-foreground text-background':'border-border bg-card hover:bg-muted'}`}>{item.label}</Link>)}
    </nav></details>
    <ProjectPanel title="Activity timeline" description="One saved action may contain several changes. Pages follow source audit records.">
      {visible.length ? <ProjectActivityList activity={{events:visible,actors:activity.actors}} timezone={timezone} /> : <p className="p-6 text-sm text-muted-foreground">No recorded events match this filter on this page. Continue to older activity if available.</p>}
    </ProjectPanel>
    <nav aria-label="Activity pages" className="flex gap-4 text-xs"><Link className="underline" href={`${base}/activity${selected!=='all'?`?type=${selected}`:''}${searchParams.task?`${selected!=='all'?'&':'?'}task=${encodeURIComponent(searchParams.task)}`:''}`}>Newest</Link>{activity.nextCursor&&<Link className="underline" href={`${base}/activity?${new URLSearchParams({type:selected||'all',cursor:activity.nextCursor,...(searchParams.task?{task:searchParams.task}:{})})}`}>Older</Link>}</nav>
    <p className="text-[10px] text-muted-foreground">Older source records may not contain enough saved detail to reconstruct individual changes.</p>
  </div>;
}
