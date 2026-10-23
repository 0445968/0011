import Link from 'next/link';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {requireStaff} from '@/lib/admin/auth';
import {listCalendar} from '@/lib/calendar/data';
import {calendarDateLabel, calendarHref, calendarMonth} from '@/lib/calendar/links';
import {CalendarMonthGrid,type CalendarGridItem} from '@/components/admin/projects/CalendarMonthGrid';
import {ProjectPageHeader,ProjectPanel} from '@/components/admin/projects/ProjectVisuals';

export const dynamic = 'force-dynamic';
const field = 'h-11 min-w-0 rounded-lg border border-border bg-background px-3 text-sm';
const button = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const statuses: Record<string, string> = {todo:'To do', doing:'In progress', blocked:'Blocked', planned:'Planned', in_progress:'In progress', done:'Done'};

export default async function CalendarPage({searchParams:p}: {searchParams:Record<string, string | undefined>}) {
  const {client, user} = await requireStaff();
  const result = await listCalendar(client, user.id, p);
  const zones = Array.from(new Set(['America/Chicago', 'America/Bogota', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'UTC', result.timezone]));
  function href(changes:Record<string, string | undefined>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({...p, tz:result.timezone, ...changes})) if (value) params.set(key, value);
    return `/calendar?${params}`;
  }
  const groups = Array.from(new Set(result.rows.map(row => row.due_on)));
  const pages = Math.max(1, Math.ceil(result.total / 25));
  const monthLabel = new Intl.DateTimeFormat('en-US', {month:'long', year:'numeric', timeZone:'UTC'}).format(new Date(`${result.month}-01T12:00:00Z`));
  const view=p.view==='agenda'?'agenda':'month';
  const monthItems:CalendarGridItem[]=result.monthRows.map(item=>({key:item.event_key,date:item.due_on,title:item.title,href:calendarHref(item),kind:item.event_type==='meeting'?'Meeting':item.event_type==='milestone'?'Milestone':item.event_type==='task_start'?'Task starts':'Task due',detail:`${statuses[item.status]||item.status} · ${item.project_title}`,color:item.event_type==='meeting'?'#2563EB':item.event_type==='milestone'?'#059669':item.is_done?'#64748B':'#7C3AED'}));
  const dayHref=(date:string)=>href({view:'agenda',from:date,to:date,page:undefined});

  return <div className="space-y-6">
    <ProjectPageHeader eyebrow="Workspace" title="Calendar" description={`Project task and milestone dates, plus saved meetings · Today ${result.today} · ${result.timezone}`}
      action={<div role="group" aria-label="Calendar view" className="inline-flex rounded-lg border border-border p-0.5">{(['month','agenda'] as const).map(value=><Link key={value} aria-current={view===value?'page':undefined} href={href({view:value,page:undefined})} className={`rounded-md px-2.5 py-1.5 text-xs capitalize ${view===value?'bg-foreground text-background':'text-muted-foreground hover:bg-muted'}`}>{value}</Link>)}</div>}/>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-semibold">{monthLabel}</h2>
      <nav aria-label="Calendar months" className="flex flex-wrap gap-2">
        <Link aria-label="Previous month" className={button} href={href({month:calendarMonth(result.month, -1), from:undefined, to:undefined, page:undefined})}><ChevronLeft size={16}/><span className="sr-only">Previous month</span></Link>
        <Link className={button} href={href({month:result.today.slice(0, 7), from:undefined, to:undefined, page:undefined})}>Today</Link>
        <Link aria-label="Next month" className={button} href={href({month:calendarMonth(result.month, 1), from:undefined, to:undefined, page:undefined})}><ChevronRight size={16}/><span className="sr-only">Next month</span></Link>
      </nav>
    </div>

    <form className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="month" value={result.month}/>
      <input type="hidden" name="view" value={view}/>
      <label className="space-y-1 text-xs sm:col-span-2"><span>Search</span><input className={`${field} w-full`} name="q" defaultValue={p.q} maxLength={100} placeholder="Task, milestone, project or project ID"/></label>
      <label className="space-y-1 text-xs"><span>From</span><input type="date" required name="from" defaultValue={result.from} className={`${field} w-full`}/></label>
      <label className="space-y-1 text-xs"><span>Through</span><input type="date" required name="to" defaultValue={result.to} className={`${field} w-full`}/></label>
      <label className="space-y-1 text-xs"><span>Type</span><select name="kind" defaultValue={p.kind || 'all'} className={`${field} w-full`}><option value="all">Tasks and milestones</option><option value="task">Tasks</option><option value="meeting">Meetings</option><option value="milestone">Milestones</option></select></label>
      <label className="space-y-1 text-xs"><span>Scope</span><select name="scope" defaultValue={p.scope || 'all'} className={`${field} w-full`}><option value="all">All workspace dates</option><option value="mine">My assigned tasks</option></select></label>
      <label className="space-y-1 text-xs"><span>Status</span><select name="status" defaultValue={p.status || 'open'} className={`${field} w-full`}><option value="open">Outstanding</option><option value="done">Done</option><option value="all">All statuses</option></select></label>
      <label className="space-y-1 text-xs"><span>Projects</span><select name="project" defaultValue={p.project || ''} className={`${field} w-full`}><option value="">Active and on hold</option><option value="active">Active</option><option value="on_hold">On hold</option><option value="completed">Completed</option><option value="all">All project states</option></select></label>
      <label className="space-y-1 text-xs sm:col-span-2"><span>Timezone for today and overdue labels</span><select name="tz" defaultValue={result.timezone} className={`${field} w-full`}>{zones.map(zone => <option key={zone}>{zone}</option>)}</select></label>
      <div className="flex items-end gap-2 sm:col-span-2"><button className="min-h-11 rounded-lg bg-foreground px-4 text-sm text-background">Apply filters</button><Link className={button} href="/calendar">Reset</Link></div>
    </form>

    {result.warning && <p role="status" className="rounded-lg border border-border p-3 text-sm">{result.warning}</p>}
    <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
      <p>{view==='month'?`${result.monthTotal} events in the selected month filters`:`${result.total} dates · ${result.from} through ${result.to}`}</p>
      <p>Task and milestone due dates have no scheduled time.</p>
    </div>
    {result.monthTruncated&&view==='month'&&<p role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">This month has more than 1,000 matching events. Day lists show exact filtered records and pagination.</p>}
    {p.scope === 'mine' && <p className="text-xs text-muted-foreground">My assigned tasks uses your verified staff assignment. Milestones remain available under All workspace dates.</p>}

    {view==='month'?<CalendarMonthGrid month={result.month} today={result.today} items={monthItems} overflowHref={dayHref}/>
    :groups.length ? <div className="space-y-4">{groups.map(date => <section key={date} aria-labelledby={`calendar-${date}`}>
      <div className="mb-3 flex flex-wrap items-center gap-3"><h3 id={`calendar-${date}`} className="text-sm font-semibold"><time dateTime={date}>{calendarDateLabel(date)}</time></h3>{date === result.today && <span className="rounded-full bg-muted px-2 py-1 text-xs">Today</span>}</div>
      <ul className="divide-y divide-border/60 rounded-xl border border-border bg-card">{result.rows.filter(row => row.due_on === date).map(item => {
        const overdue = item.event_type!=='meeting' && !item.is_done && item.due_on < result.today;
        return <li key={item.event_key} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
          <div className="min-w-0"><p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{item.event_type === 'meeting'?'Meeting':item.event_type === 'milestone' ? 'Milestone due' : item.event_type === 'task_start' ? 'Task starts' : 'Task due'}</p><Link href={calendarHref(item)} className="break-words text-sm font-semibold hover:underline">{item.title}</Link>{item.starts_at&&<p className="text-xs">{new Intl.DateTimeFormat('en-US',{timeZone:result.timezone,dateStyle:'medium',timeStyle:'short'}).format(new Date(item.starts_at))} – {new Intl.DateTimeFormat('en-US',{timeZone:result.timezone,dateStyle:'medium',timeStyle:'short'}).format(new Date(item.ends_at!))} · {result.timezone}</p>}<p className="mt-1 break-words text-xs text-muted-foreground"><Link href={`/projects/${item.request_id}`} className="hover:underline">{item.project_title}</Link> · {item.project_public_id}{item.project_state === 'on_hold' ? ' · Project on hold' : item.project_state === 'completed' ? ' · Project completed' : ''}</p></div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-muted px-2.5 py-1">{statuses[item.status] || item.status}</span>{overdue && <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-red-700 dark:text-red-300">Overdue</span>}</div>
        </li>;
      })}</ul>
    </section>)}</div> : <ProjectPanel title="No dates match these filters" description="Choose a different range, or add a task or milestone deadline in a project."><div className="p-6 text-xs text-muted-foreground">There are no matching events for the selected period.</div></ProjectPanel>}

    {view==='agenda'&&<nav aria-label="Agenda pages" className="flex flex-wrap items-center justify-between gap-3 text-sm">
      {result.page > 1 ? <Link className={button} href={href({page:String(result.page - 1)})}>Previous</Link> : <span/>}
      <p className="text-xs text-muted-foreground">Page {result.page} of {pages}</p>
      {result.page < pages ? <Link className={button} href={href({page:String(result.page + 1)})}>Next</Link> : <span/>}
    </nav>}
  </div>;
}
