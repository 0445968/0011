'use client';

import type { ReactNode } from 'react';
import { projectPhaseLabels, projectPhaseOrder } from '@/lib/projects/lifecycle-schema';
import type { WorkplanFilters } from '@/lib/projects/workplan-filters';

const field='min-h-9 w-full min-w-0 rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
function Filter({label,children}:{label:string;children:ReactNode}) {
  return <label className="min-w-0 space-y-1 text-[10px] font-medium text-muted-foreground"><span>{label}</span>{children}</label>;
}

export function ProjectWorkplanToolbar({filters,onChange,columns,onColumns,assignees,phasesReady,assignmentsReady}: {
  filters:WorkplanFilters; onChange:(change:Partial<WorkplanFilters>)=>void;
  columns:1|2|3;onColumns:(columns:1|2|3)=>void;
  assignees:{id:string;label:string}[];phasesReady:boolean;assignmentsReady:boolean;
}) {
  const applied=[filters.phase!=='all',filters.side!=='all',filters.assignee!=='all',filters.status!=='all',filters.deadline!=='all',Boolean(filters.from||filters.to),Boolean(filters.query.trim())].filter(Boolean).length;
  const activeLabels=[filters.query.trim()?`Search: ${filters.query.trim()}`:null,filters.phase!=='all'?`Phase: ${filters.phase==='unassigned'?'Unassigned':projectPhaseLabels[filters.phase]}`:null,filters.side!=='all'?`Side: ${filters.side==='unknown'?'Not saved':filters.side==='bivi'?'Bivi':'Client'}`:null,filters.assignee!=='all'?`Assignee: ${assignees.find(item=>item.id===filters.assignee)?.label??(filters.assignee==='unassigned'?'Unassigned':'Selected')}`:null,filters.status!=='all'?`Status: ${filters.status.replaceAll('_',' ')}`:null,filters.deadline!=='all'?`Deadline: ${filters.deadline==='next7'?'Next 7 days':filters.deadline}`:null,filters.from||filters.to?`Date: ${filters.from||'…'} – ${filters.to||'…'}`:null].filter((item):item is string=>Boolean(item));
  const clear=()=>onChange({query:'',phase:'all',side:'all',assignee:'all',status:'all',deadline:'all',from:'',to:''});
  return <div className="space-y-2 rounded-xl border border-border bg-card p-2.5">
    <div className="flex flex-wrap items-end gap-2">
      <label className="min-w-[180px] flex-1 space-y-1 text-[10px] font-medium text-muted-foreground"><span>Search tasks and milestones</span><input type="search" className={field} placeholder="Title, owner or notes" value={filters.query} onChange={event=>onChange({query:event.target.value})}/></label>
      <fieldset className="space-y-1"><legend className="text-[10px] font-medium text-muted-foreground">Columns</legend><div className="inline-flex gap-1 rounded-lg border border-border p-0.5">{([1,2,3] as const).map(value=><button key={value} type="button" aria-label={`${value} column${value===1?'':'s'}`} aria-pressed={columns===value} onClick={()=>onColumns(value)} className={`min-h-8 min-w-9 rounded-md px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${columns===value?'bg-foreground text-background':'hover:bg-muted'}`}>{value}</button>)}</div></fieldset>
      <details className="relative"><summary className="flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"><span>Filters</span>{applied>0&&<span className="rounded-full bg-foreground px-1.5 text-[10px] text-background">{applied}</span>}</summary>
      <div className="absolute right-0 z-20 mt-1 w-[min(92vw,760px)] rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg">
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
      <Filter label="Phase"><select aria-label="Filter by phase" className={field} disabled={!phasesReady} value={filters.phase} onChange={event=>onChange({phase:event.target.value as WorkplanFilters['phase']})}><option value="all">All phases</option><option value="unassigned">No phase association</option>{projectPhaseOrder.map(phase=><option key={phase} value={phase}>{projectPhaseLabels[phase]}</option>)}</select></Filter>
      <Filter label="Responsible side"><select aria-label="Filter by responsible side" className={field} disabled={!assignmentsReady} value={filters.side} onChange={event=>onChange({side:event.target.value as WorkplanFilters['side']})}><option value="all">All sides</option><option value="bivi">Bivi</option><option value="client">Client</option><option value="unknown">Not saved yet</option></select></Filter>
      <Filter label="Assignee"><select aria-label="Filter by assignee" className={field} disabled={!assignmentsReady} value={filters.assignee} onChange={event=>onChange({assignee:event.target.value})}><option value="all">All assignees</option><option value="unassigned">No assignees</option>{assignees.map(person=><option key={person.id} value={person.id}>{person.label}</option>)}</select></Filter>
      <Filter label="Status"><select aria-label="Filter by work status" className={field} value={filters.status} onChange={event=>onChange({status:event.target.value as WorkplanFilters['status']})}><option value="all">All statuses</option><option value="open">Open</option><option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="blocked">Blocked tasks</option><option value="done">Completed</option></select></Filter>
      <Filter label="Deadline"><select aria-label="Filter by deadline" className={field} value={filters.deadline} onChange={event=>onChange({deadline:event.target.value as WorkplanFilters['deadline']})}><option value="all">All deadlines</option><option value="overdue">Overdue open work</option><option value="today">Due today</option><option value="next7">Next 7 days</option><option value="dated">Has a deadline</option><option value="undated">Unscheduled</option></select></Filter>
    </div>
    <details className="mt-2 text-xs"><summary className="cursor-pointer text-muted-foreground">Custom deadline range</summary><div className="mt-2 grid max-w-md grid-cols-2 gap-2"><Filter label="Due from"><input aria-label="Deadline from" type="date" className={field} value={filters.from} onChange={event=>onChange({from:event.target.value})}/></Filter><Filter label="Due through"><input aria-label="Deadline through" type="date" className={field} value={filters.to} onChange={event=>onChange({to:event.target.value})}/></Filter></div>{filters.from&&filters.to&&filters.from>filters.to&&<p role="alert" className="mt-2 text-red-700 dark:text-red-300">The range starts after its end. Adjust either date.</p>}</details>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2"><p className="max-w-xl text-[10px] text-muted-foreground">Filters use current draft fields and saved phase/member links. Milestone totals still include every linked task.</p><button type="button" onClick={clear} disabled={!applied} className="min-h-8 rounded-lg border border-border px-2.5 text-xs hover:bg-muted disabled:opacity-45">Clear filters</button></div>
      </div></details>
    </div>
    {activeLabels.length>0&&<div className="flex flex-wrap items-center gap-1.5" aria-label="Applied filters">{activeLabels.map(label=><span key={label} className="rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">{label}</span>)}<button type="button" onClick={clear} className="px-1 text-[10px] font-medium underline">Clear</button></div>}
  </div>;
}
