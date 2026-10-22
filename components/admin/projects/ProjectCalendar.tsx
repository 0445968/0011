'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProfileImage } from '@/components/profile-images/ProfileImage';
import { ProjectMemberStack } from './ProjectMemberStack';
import { milestoneDomId } from '@/lib/calendar/links';
import { taskHref } from '@/lib/tasks/links';
import { projectPhaseLabels, type ProjectPhase, type ProjectTaskControl } from '@/lib/projects/lifecycle-schema';
import type { ProjectTaskScheduleRow } from '@/lib/projects/schedule-schema';
import type { ProjectPhaseColorMap } from '@/lib/projects/phase-colors';
import { phaseColorFor } from '@/lib/projects/phase-colors';
import { effectiveTaskPhases } from '@/lib/projects/metrics';
import type { ProjectBody } from '@/lib/projects/schema';
import type { ProjectRosterMember, MilestonePhaseLink } from '@/lib/projects/overview-data';

type View = 'day' | 'week' | 'month' | 'timeline';
type Task = ProjectBody['tasks'][number];
type Event = { key:string; title:string; date:string|null; dateKind:'start'|'due'; type:'task'|'milestone'; id:string; status:string; task?:Task };

const button = 'rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring';

function isoDate(d:Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function shift(date:Date, days:number) { const copy=new Date(date);copy.setDate(copy.getDate()+days);return copy; }
function label(date:string) { return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`)); }

export function ProjectCalendar({id,body,projectRevision,controls,phaseColors,schedule,members,milestonePhases,today}: {
  id:string; body:ProjectBody; projectRevision:number; controls:ProjectTaskControl[]; phaseColors:ProjectPhaseColorMap;
  schedule:ProjectTaskScheduleRow[];members:ProjectRosterMember[];milestonePhases:MilestonePhaseLink[];today:string;
}) {
  const [view,setView]=useState<View>('month');
  const [anchor,setAnchor]=useState(()=>new Date(`${today}T12:00:00`));
  const [starts,setStarts]=useState(()=>new Map(schedule.map(row=>[row.task_id,row.start_on])));
  const [revisions,setRevisions]=useState(()=>new Map(schedule.map(row=>[row.task_id,row.revision])));
  const [message,setMessage]=useState('');
  const [saving,setSaving]=useState<string|null>(null);
  const allEvents=useMemo<Event[]>(()=>[
    ...body.tasks.map(task=>({key:`task:${task.id}`,title:task.title,date:task.dueOn,dateKind:'due' as const,type:'task' as const,id:task.id,status:task.status,task})),
    ...body.milestones.filter(item=>item.dueOn).map(item=>({key:`milestone:${item.id}`,title:item.title,date:item.dueOn,dateKind:'due' as const,type:'milestone' as const,id:item.id,status:item.status})),
  ].sort((a,b)=>(a.date??'9999-12-31').localeCompare(b.date??'9999-12-31')||a.title.localeCompare(b.title)),[body]);
  const assigned=(taskId:string)=>members.filter(person=>person.assignedTaskIds.includes(taskId));
  const phasesForEvent=(event:Event)=>event.type==='task'
    ? effectiveTaskPhases(body.tasks.find(task=>task.id===event.id)!,controls,milestonePhases)
    : milestonePhases.filter(link=>link.milestoneId===event.id).map(link=>link.phase);
  const saveStart=async(taskId:string,value:string)=>{
    setSaving(taskId);setMessage('');
    try {
      const response=await fetch(`/api/admin/projects/${id}/schedule`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({taskId,startOn:value||null,expectedProjectRevision:projectRevision,expectedScheduleRevision:revisions.get(taskId)||0})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'Schedule could not save.');
      setStarts(old=>new Map(old).set(taskId,value||null));setRevisions(old=>new Map(old).set(taskId,result.revision));setMessage('Task schedule saved.');
    } catch(error) { setMessage(error instanceof Error?error.message:'Schedule could not save.'); }
    finally { setSaving(null); }
  };
  const period=useMemo(()=>{
    if(view==='day')return {from:isoDate(anchor),to:isoDate(anchor)};
    if(view==='week'){const start=shift(anchor,-((anchor.getDay()+6)%7));return {from:isoDate(start),to:isoDate(shift(start,6))};}
    if(view==='month'){const start=new Date(anchor.getFullYear(),anchor.getMonth(),1);const end=new Date(anchor.getFullYear(),anchor.getMonth()+1,0);return {from:isoDate(start),to:isoDate(end)};}
    return null;
  },[anchor,view]);
  const calendarEvents=allEvents.flatMap(event=>event.type==='task'&&starts.get(event.id)?[event,{...event,key:`task-start:${event.id}`,date:starts.get(event.id)!,dateKind:'start' as const}]:[event]);
  const visible=period?calendarEvents.filter(item=>item.date!==null&&item.date>=period.from&&item.date<=period.to):calendarEvents;
  function navigate(dir:number){if(view==='day')setAnchor(old=>shift(old,dir));else if(view==='week')setAnchor(old=>shift(old,dir*7));else setAnchor(old=>new Date(old.getFullYear(),old.getMonth()+dir,1,12));}
  const eventLink=(event:Event)=>event.type==='task'?taskHref(id,event.id):`/projects/${id}?tab=plan&milestone=${encodeURIComponent(event.id)}#${encodeURIComponent(milestoneDomId(event.id))}`;
  const header=period?`${label(period.from)}${period.from!==period.to?` – ${label(period.to)}`:''}`:'Project schedule';
  const timelineDates=allEvents.flatMap(event=>[event.date,event.type==='task'?starts.get(event.id)??null:null]).filter((value):value is string=>Boolean(value)).sort();
  const timelineStart=timelineDates[0]??today;
  const timelineEnd=timelineDates[timelineDates.length-1]??today;
  const timelineSpan=Math.max(1,(Date.parse(`${timelineEnd}T12:00:00Z`)-Date.parse(`${timelineStart}T12:00:00Z`))/86400000);
  const timelineBar=(event:Event)=>{
    const start=event.type==='task'?starts.get(event.id)??event.date:event.date;
    const end=event.date??start;
    if(!start||!end)return null;
    const day=(value:string)=>(Date.parse(`${value}T12:00:00Z`)-Date.parse(`${timelineStart}T12:00:00Z`))/86400000;
    const left=Math.max(0,Math.min(100,day(start)/timelineSpan*100));
    const width=event.date===start?1.2:Math.max(1.2,Math.min(100-left,(day(end)-day(start))/timelineSpan*100));
    const phase=phasesForEvent(event)[0];
    return <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${event.title}: ${start} to ${end}`}><span className="absolute top-0 h-full min-w-[5px] rounded-full" style={{left:`${left}%`,width:`${width}%`,backgroundColor:phase?phaseColorFor(phase,phaseColors):'#64748B'}}/></div>;
  };
  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Project calendar</p><h1 className="mt-1 text-2xl font-semibold">{header}</h1><p className="mt-1 text-xs text-muted-foreground">Saved task and milestone dates stay connected to the work plan and shared Calendar.</p></div>
      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Project schedule view">{(['day','week','month','timeline'] as const).map(item=><button key={item} role="tab" aria-selected={view===item} className={`${button} capitalize ${view===item?'bg-foreground text-background':''}`} onClick={()=>setView(item)}>{item}</button>)}</div></header>
    {period&&<div className="flex items-center justify-between"><button aria-label="Previous period" className={button} onClick={()=>navigate(-1)}><ChevronLeft size={16}/></button><div className="flex gap-2"><button className={button} onClick={()=>setAnchor(new Date(`${today}T12:00:00`))}>Today</button><button className={button} onClick={()=>navigate(1)} aria-label="Next period"><ChevronRight size={16}/></button></div></div>}
    {view==='timeline'?<section className="overflow-x-auto rounded-xl border border-border bg-card"><div className="min-w-[720px]"><div className="grid grid-cols-[minmax(210px,1fr)_minmax(340px,2fr)] border-b px-4 py-3 text-xs font-semibold"><span>Task or milestone</span><span className="flex justify-between"><time dateTime={timelineStart}>{label(timelineStart)}</time><time dateTime={timelineEnd}>{label(timelineEnd)}</time></span></div>{allEvents.map(event=>{const start=event.type==='task'?starts.get(event.id):null;return <div key={event.key} className="grid grid-cols-[minmax(210px,1fr)_minmax(340px,2fr)] items-center gap-3 border-b px-4 py-3"><div><Link className="text-xs font-medium hover:underline" href={eventLink(event)}>{event.title}</Link><p className="mt-1 text-[10px] capitalize text-muted-foreground">{event.type} · {event.status}</p></div><div>{event.type==='task'&&<label className="text-[10px] text-muted-foreground">Start <input type="date" className="ml-1 rounded border bg-background px-1 py-1 text-xs" aria-label={`Start date for ${event.title}`} disabled={saving===event.id} value={start||''} onChange={e=>void saveStart(event.id,e.target.value)}/></label>}<span className="ml-3 text-[10px] text-muted-foreground">Due {event.date?label(event.date):'unscheduled'}</span>{timelineBar(event)}<div className="mt-2 flex items-center justify-between"><div className="flex gap-1">{phasesForEvent(event).map(phase=><span key={phase} title={projectPhaseLabels[phase]} aria-label={projectPhaseLabels[phase]} className="h-2.5 w-2.5 rounded-full border border-black/10 dark:border-white/20" style={{backgroundColor:phaseColorFor(phase,phaseColors)}}/>)}</div><div className="flex -space-x-2">{event.type==='task'&&assigned(event.id).slice(0,4).map(person=><ProfileImage key={person.id} kind={person.kind} subject={person.id} name={person.name} path={person.avatarPath} size="h-6 w-6"/> )}</div></div></div></div>})}{!allEvents.length&&<p className="p-5 text-xs text-muted-foreground">No saved tasks or milestones. Add work in Tasks & Milestones.</p>}</div></section>
      :<div className="space-y-5">{Array.from(new Set(visible.flatMap(event=>event.date?[event.date]:[]))).map(date=><section key={date}><h2 className="mb-2 text-xs font-semibold"><time dateTime={date}>{label(date)}</time>{date===today?' · Today':''}</h2><div className="rounded-xl border border-border bg-card">{visible.filter(item=>item.date===date).map(item=><div key={item.key} className="flex flex-wrap items-center gap-3 border-b p-4 last:border-0"><span className="inline-flex shrink-0 items-center gap-0.5">{phasesForEvent(item).length?phasesForEvent(item).map(phase=><span key={phase} title={projectPhaseLabels[phase]} aria-label={projectPhaseLabels[phase]} className="h-2.5 w-2.5 rounded-full border border-black/10 dark:border-white/20" style={{backgroundColor:phaseColorFor(phase,phaseColors)}}/>):<span className={`h-2.5 w-2.5 rounded-full ${item.type==='task'?'bg-blue-500':'bg-emerald-500'}`} aria-hidden/>}</span><div className="min-w-0 flex-1"><Link href={eventLink(item)} className="text-sm font-medium hover:underline">{item.title}</Link><p className="text-xs text-muted-foreground">{item.type==='task'?item.dateKind==='start'?'Task starts':'Task due':'Milestone due'} · {item.status}</p></div>{item.type==='task'&&<ProjectMemberStack members={assigned(item.id)} max={4} size="h-7 w-7"/>}</div>)}</div></section>)}{!visible.some(event=>event.date)&&<p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No saved tasks or milestones in this period.</p>}</div>}
    {message&&<p role="status" className="text-xs text-muted-foreground">{message}</p>}
  </div>;
}
