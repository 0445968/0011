'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import type {ProjectMeeting} from '@/lib/projects/meeting-schema';
import {meetingState} from '@/lib/projects/meeting-time';
export function ProjectUpcomingMeetings({id,rows,total,timezone}:{id:string;rows:ProjectMeeting[]|null;total:number|null;timezone:string}){
  const router=useRouter();
  return <section className="space-y-2 rounded-xl border border-border bg-card p-4"><div className="flex justify-between gap-3"><h2 className="text-sm font-semibold">Upcoming &amp; ongoing meetings</h2><Link href={`/projects/${id}?tab=calendar`} className="text-xs underline">Project Calendar</Link></div>
    {rows===null?<p role="alert" className="text-xs">Meetings unavailable. <button type="button" className="underline" onClick={()=>router.refresh()}>Retry meetings</button></p>:<>
      {!rows.length&&<p className="text-xs text-muted-foreground">No scheduled upcoming or ongoing meetings.</p>}
      <ul className="space-y-2">{rows.map(row=><li key={row.id} className="text-xs"><Link className="font-medium underline" href={`/projects/${id}?tab=calendar&meeting=${row.id}#meeting-${row.id}`}>{row.title}</Link> · {meetingState(row)}<p className="text-muted-foreground">{new Intl.DateTimeFormat('en-US',{timeZone:timezone,dateStyle:'medium',timeStyle:'short'}).format(new Date(row.starts_at))} – {new Intl.DateTimeFormat('en-US',{timeZone:timezone,dateStyle:'medium',timeStyle:'short'}).format(new Date(row.ends_at))} · {timezone}</p></li>)}</ul>
      {!!total&&total>rows.length&&<p className="text-xs text-muted-foreground">Showing {rows.length} of {total}; see Project Calendar for all meetings.</p>}
    </>}
  </section>;
}
