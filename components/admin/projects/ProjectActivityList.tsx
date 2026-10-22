import Link from 'next/link';
import {Clock3,ArrowUpRight} from 'lucide-react';
import {ProfileImage} from '@/components/profile-images/ProfileImage';
import type {ProjectActivity} from '@/lib/projects/activity-data';

/** Shared actor, timestamp and event presentation for Overview and Activity. */
export function ProjectActivityList({activity,timezone='America/Chicago'}:{activity:ProjectActivity;timezone?:string}) {
  return <ol className="divide-y divide-border">{activity.events.map(event=>{
    const actor=event.actorId?activity.actors[event.actorId]:null;
    const actorLabel=actor?.label??(event.actorId?`Account ${event.actorId.slice(0,8)}`:'Account no longer available');
    const date=new Date(event.createdAt);
    const timestamp=Number.isNaN(date.getTime())?'Unknown time':new Intl.DateTimeFormat('en-US',{
      year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:timezone,timeZoneName:'short',
    }).format(date);
    return <li key={event.id} className="flex items-start gap-3 px-4 py-3">
      <div className="mt-0.5 shrink-0">{actor?.kind?<ProfileImage kind={actor.kind} subject={actor.id} name={actor.label} path={actor.avatarPath} size="h-8 w-8"/>:
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground"><Clock3 size={15} aria-hidden/></span>}</div>
      <div className="min-w-0 flex-1"><Link href={event.href} className="inline-flex max-w-full flex-wrap items-center gap-1.5 break-words text-xs font-semibold hover:underline">{event.title}<ArrowUpRight size={13} aria-hidden/></Link>
        {event.detail&&<p className="mt-1 break-words text-xs text-muted-foreground">{event.detail}</p>}
        <p className="mt-1.5 text-[11px] text-muted-foreground">{actorLabel} · <time dateTime={event.createdAt}>{timestamp}</time> · {event.source}</p>
      </div>
    </li>;
  })}</ol>;
}
