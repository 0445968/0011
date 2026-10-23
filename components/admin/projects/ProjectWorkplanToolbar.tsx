'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Activity, Columns3, Filter, ListFilter, Menu, PanelRightClose, PanelRightOpen, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { projectPhaseLabels, projectPhaseOrder } from '@/lib/projects/lifecycle-schema';
import type { WorkplanFilters, TaskGrouping } from '@/lib/projects/workplan-filters';

export type TasksDisplayView = 'overview' | 'kanban' | 'gantt' | 'list' | 'calendar' | 'table' | 'timeline';
export type TaskSort = 'default' | 'title' | 'due' | 'priority';
export type TaskColumn = 'priority' | 'status' | 'milestone' | 'due' | 'assignee';

const field = 'min-h-9 w-full min-w-0 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
const control = 'inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
const views: {value:TasksDisplayView;label:string}[] = [
  {value:'overview',label:'Overview'}, {value:'kanban',label:'Kanban'}, {value:'gantt',label:'Gantt'},
  {value:'list',label:'List'}, {value:'calendar',label:'Calendar'}, {value:'table',label:'Table'}, {value:'timeline',label:'Timeline'},
];
const tableColumns: {value:TaskColumn;label:string}[] = [
  {value:'priority',label:'Priority'}, {value:'status',label:'Status'}, {value:'milestone',label:'Milestone'},
  {value:'due',label:'Due date'}, {value:'assignee',label:'Assignees'},
];

function Field({label,children}:{label:string;children:ReactNode}) {
  return <label className="min-w-0 space-y-1 text-[11px] font-medium text-muted-foreground"><span>{label}</span>{children}</label>;
}
export function ProjectWorkplanToolbar({projectId,filters,onChange,view,onView,grouping,onGrouping,sort,onSort,columns,onColumns,assignees,phasesReady,assignmentsReady,
  tagFilter,onTagFilter,tags,showEditor,onToggleEditor,onAddTask,onAddMilestone,disabled=false}: {
  projectId:string;filters:WorkplanFilters;onChange:(changes:Partial<WorkplanFilters>)=>void;
  view:TasksDisplayView;onView:(view:TasksDisplayView)=>void;grouping:TaskGrouping;onGrouping:(value:TaskGrouping)=>void;
  sort:TaskSort;onSort:(value:TaskSort)=>void;columns:TaskColumn[];onColumns:(values:TaskColumn[])=>void;
  assignees:{id:string;label:string}[];phasesReady:boolean;assignmentsReady:boolean;
  tagFilter:string;onTagFilter:(tag:string)=>void;tags:string[];
  showEditor:boolean;onToggleEditor:()=>void;onAddTask:()=>void;onAddMilestone:()=>void;disabled?:boolean;
}) {
  const [searchOpen,setSearchOpen]=useState(false);
  const applied=[filters.phase!=='all',filters.side!=='all',filters.assignee!=='all',filters.status!=='all',filters.deadline!=='all',Boolean(filters.from||filters.to),Boolean(filters.query.trim()),Boolean(tagFilter)].filter(Boolean).length;
  const clear=()=>{onChange({query:'',phase:'all',side:'all',assignee:'all',status:'all',deadline:'all',from:'',to:''});onTagFilter('');};
  return <div className="space-y-2 border-b border-border bg-white pb-3 text-slate-950 dark:bg-card dark:text-foreground">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <nav className="flex min-w-0 flex-wrap gap-1" aria-label="Task view">
        {views.map(item=><button key={item.value} type="button" aria-pressed={view===item.value} onClick={()=>onView(item.value)}
          className={`min-h-9 rounded-lg px-2.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${view===item.value?'bg-slate-100 text-slate-950 shadow-sm dark:bg-muted dark:text-foreground':'text-muted-foreground hover:bg-muted'}`}>{item.label}</button>)}
      </nav>
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" title="Search tasks" aria-label="Search tasks" aria-expanded={searchOpen} className={control} onClick={()=>setSearchOpen(value=>!value)}><Search size={15}/></button>
        <Link className={control} href={`/projects/${projectId}/activity?type=tasks`} title="Task activity log"><Activity size={15}/><span className="hidden sm:inline">Activity</span></Link>
        <button type="button" className={control} title={showEditor?'Hide task editor':'Show task editor'} aria-label={showEditor?'Hide task editor':'Show task editor'} aria-pressed={showEditor} onClick={onToggleEditor}>{showEditor?<PanelRightClose size={15}/>:<PanelRightOpen size={15}/>}</button>
        <details className="relative"><summary className={`${control} cursor-pointer list-none [&::-webkit-details-marker]:hidden`} aria-label="Add task or milestone"><Plus size={16}/><Menu size={13}/></summary>
          <div className="absolute right-0 z-30 mt-1 w-48 space-y-1 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg">
            <button type="button" disabled={disabled} onClick={onAddTask} className="w-full rounded-md px-3 py-2 text-left text-xs hover:bg-muted disabled:opacity-50">Add task</button>
            <Link href={`/projects/${projectId}?tab=phases&newMilestone=1`} className="block w-full rounded-md px-3 py-2 text-left text-xs hover:bg-muted">Add milestone in Lifecycle</Link>
          </div>
        </details>
      </div>
    </div>
    {(searchOpen||Boolean(filters.query))&&<div className="flex items-center gap-2 rounded-lg border border-input bg-background px-2"><Search size={14} className="shrink-0 text-muted-foreground"/><input autoFocus type="search" className="min-h-9 min-w-0 flex-1 bg-transparent text-xs outline-none" placeholder="Search task names, descriptions, and milestones" value={filters.query} onChange={event=>onChange({query:event.target.value})}/><button type="button" aria-label="Close search" onClick={()=>{onChange({query:''});setSearchOpen(false);}}><X size={14}/></button></div>}
    <div className="flex flex-wrap items-center gap-2">
      <details className="relative"><summary className={`${control} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}><Filter size={14}/>Filters{applied>0&&<span className="rounded bg-foreground px-1.5 text-[10px] text-background">{applied}</span>}</summary>
        <div className="absolute left-0 z-30 mt-1 w-[min(91vw,720px)] rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Phase"><select aria-label="Filter by phase" className={field} disabled={!phasesReady} value={filters.phase} onChange={e=>onChange({phase:e.target.value as WorkplanFilters['phase']})}><option value="all">All phases</option><option value="unassigned">No phase</option>{projectPhaseOrder.map(phase=><option key={phase} value={phase}>{projectPhaseLabels[phase]}</option>)}</select></Field>
            <Field label="Responsibility"><select aria-label="Filter by responsible side" className={field} disabled={!assignmentsReady} value={filters.side} onChange={e=>onChange({side:e.target.value as WorkplanFilters['side']})}><option value="all">All</option><option value="bivi">Bivi</option><option value="client">Client</option><option value="unknown">Not saved</option></select></Field>
            <Field label="Assignee"><select aria-label="Filter by assignee" className={field} disabled={!assignmentsReady} value={filters.assignee} onChange={e=>onChange({assignee:e.target.value})}><option value="all">Everyone</option><option value="unassigned">No assignees</option>{assignees.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></Field>
            <Field label="Status"><select aria-label="Filter by work status" className={field} value={filters.status} onChange={e=>onChange({status:e.target.value as WorkplanFilters['status']})}><option value="all">All statuses</option><option value="open">Open</option><option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="done">Completed</option></select></Field>
            <Field label="Deadline"><select aria-label="Filter by deadline" className={field} value={filters.deadline} onChange={e=>onChange({deadline:e.target.value as WorkplanFilters['deadline']})}><option value="all">All</option><option value="overdue">Overdue open</option><option value="today">Today</option><option value="next7">Next 7 days</option><option value="dated">Has due date</option><option value="undated">No due date</option></select></Field>
            <Field label="Tag"><select aria-label="Filter by tag" className={field} value={tagFilter} onChange={e=>onTagFilter(e.target.value)}><option value="">All tags</option>{tags.map(t=><option key={t} value={t}>{t}</option>)}</select></Field>
            <Field label="Due from"><input aria-label="Deadline from" type="date" className={field} value={filters.from} onChange={e=>onChange({from:e.target.value})}/></Field>
            <Field label="Due through"><input aria-label="Deadline through" type="date" className={field} value={filters.to} onChange={e=>onChange({to:e.target.value})}/></Field>
          </div>
          {filters.from&&filters.to&&filters.from>filters.to&&<p role="alert" className="mt-2 text-xs text-destructive">The date range starts after it ends.</p>}
          <button type="button" disabled={!applied} onClick={clear} className="mt-3 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted disabled:opacity-50">Clear filters</button>
        </div>
      </details>
      <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><ListFilter size={14}/>Group by<select aria-label="Group tasks" className="min-h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground" value={grouping} onChange={e=>onGrouping(e.target.value as TaskGrouping)}><option value="status">Status</option><option value="milestone">Milestone</option><option value="side">Responsibility</option><option value="none">None</option></select></label>
      <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><SlidersHorizontal size={14}/>Sort by<select aria-label="Sort tasks" className="min-h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground" value={sort} onChange={e=>onSort(e.target.value as TaskSort)}><option value="default">Manual order</option><option value="due">Due date</option><option value="priority">Priority</option><option value="title">Name</option></select></label>
      <details className="relative"><summary className={`${control} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}><Columns3 size={14}/>Columns</summary><fieldset className="absolute right-0 z-30 mt-1 min-w-40 space-y-2 rounded-xl border border-border bg-popover p-3 text-xs shadow-lg"><legend className="sr-only">Visible task columns</legend>{tableColumns.map(col=><label key={col.value} className="flex items-center gap-2"><input type="checkbox" checked={columns.includes(col.value)} onChange={e=>onColumns(e.target.checked?[...columns,col.value]:columns.filter(x=>x!==col.value))}/>{col.label}</label>)}</fieldset></details>
      {applied>0&&<button type="button" onClick={clear} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X size={12}/>Clear {applied}</button>}
    </div>
  </div>;
}
