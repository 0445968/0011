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
  return <div className="space-y-3 rounded-xl border border-border bg-card p-3">
    <div className="flex flex-wrap items-end gap-3">
      <label className="min-w-[160px] flex-1 space-y-1 text-[10px] font-medium text-muted-foreground"><span>Search work</span><input type="search" className={field} placeholder="Task, milestone, owner or notes…" value={filters.query} onChange={event=>onChange({query:event.target.value})}/></label>
      <fieldset className="space-y-1"><legend className="text-[10px] font-medium text-muted-foreground">Card columns</legend><div className="inline-flex gap-1 rounded-lg border border-border p-0.5">{([1,2,3] as const).map(value=><button key={value} type="button" aria-label={`${value} column${value===1?'':'s'}`} aria-pressed={columns===value} onClick={()=>onColumns(value)} className={`min-h-8 min-w-9 rounded-md px-2 text-xs focus-visible:ring-2 focus-visible:ring-ring ${columns===value?'bg-foreground text-background':'hover:bg-muted'}`}>{value}</button>)}</div></fieldset>
    </div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      <Filter label="Phase"><select aria-label="Filter by phase" className={field} disabled={!phasesReady} value={filters.phase} onChange={event=>onChange({phase:event.target.value as WorkplanFilters['phase']})}><option value="all">All phases</option><option value="unassigned">No phase association</option>{projectPhaseOrder.map(phase=><option key={phase} value={phase}>{projectPhaseLabels[phase]}</option>)}</select></Filter>
      <Filter label="Responsible side"><select aria-label="Filter by responsible side" className={field} disabled={!assignmentsReady} value={filters.side} onChange={event=>onChange({side:event.target.value as WorkplanFilters['side']})}><option value="all">All sides</option><option value="bivi">Bivi</option><option value="client">Client</option><option value="unknown">Not saved yet</option></select></Filter>
      <Filter label="Assignee"><select aria-label="Filter by assignee" className={field} disabled={!assignmentsReady} value={filters.assignee} onChange={event=>onChange({assignee:event.target.value})}><option value="all">All assignees</option><option value="unassigned">No assignees</option>{assignees.map(person=><option key={person.id} value={person.id}>{person.label}</option>)}</select></Filter>
      <Filter label="Status"><select aria-label="Filter by work status" className={field} value={filters.status} onChange={event=>onChange({status:event.target.value as WorkplanFilters['status']})}><option value="all">All statuses</option><option value="open">Open</option><option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="blocked">Blocked tasks</option><option value="done">Completed</option></select></Filter>
      <Filter label="Deadline"><select aria-label="Filter by deadline" className={field} value={filters.deadline} onChange={event=>onChange({deadline:event.target.value as WorkplanFilters['deadline']})}><option value="all">All deadlines</option><option value="overdue">Overdue open work</option><option value="today">Due today</option><option value="next7">Next 7 days</option><option value="dated">Has a deadline</option><option value="undated">Unscheduled</option></select></Filter>
      <div className="flex items-end"><button type="button" onClick={()=>onChange({query:'',phase:'all',side:'all',assignee:'all',status:'all',deadline:'all',from:'',to:''})} className="min-h-9 rounded-lg border border-border px-3 text-xs hover:bg-muted">Clear filters</button></div>
    </div>
    <details className="text-xs"><summary className="cursor-pointer text-muted-foreground">Custom deadline range</summary><div className="mt-2 grid max-w-md grid-cols-2 gap-2"><Filter label="Due from"><input aria-label="Deadline from" type="date" className={field} value={filters.from} onChange={event=>onChange({from:event.target.value})}/></Filter><Filter label="Due through"><input aria-label="Deadline through" type="date" className={field} value={filters.to} onChange={event=>onChange({to:event.target.value})}/></Filter></div>{filters.from&&filters.to&&filters.from>filters.to&&<p role="alert" className="mt-2 text-red-700 dark:text-red-300">The range starts after its end. Adjust either date.</p>}</details>
    <p className="text-[10px] text-muted-foreground">Filters use the current work-plan draft and saved phase/member associations. Milestones match their own fields or a task that matches every filter. Progress always counts the whole milestone.</p>
  </div>;
}
