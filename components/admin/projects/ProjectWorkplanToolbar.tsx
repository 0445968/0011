'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Activity, Columns3, Filter, ListFilter, Menu, PanelRightClose, PanelRightOpen, Plus, Search, SlidersHorizontal, X, Table2, KanbanSquare, GanttChart, List, CalendarDays, Clock3, Settings2, LayoutGrid, ChevronDown, Check, ArrowUp, ArrowDown, ListChecks, Copy, Trash2, CalendarClock, ArrowRightLeft } from 'lucide-react';
import { projectPhaseLabels, projectPhaseOrder } from '@/lib/projects/lifecycle-schema';
import type { WorkplanFilters, TaskGrouping } from '@/lib/projects/workplan-filters';

export type TasksDisplayView = 'overview' | 'kanban' | 'gantt' | 'list' | 'calendar' | 'timeline' | 'milestone';
export type TaskSort = 'default' | 'title' | 'due' | 'priority';
export type TaskColumn = 'priority' | 'status' | 'milestone' | 'due' | 'assignee' | 'start' | 'phase' | 'tags';

const field = 'min-h-9 w-full min-w-0 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
const control = 'inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
const views: {value:TasksDisplayView;label:string;icon:typeof Table2}[] = [
  {value:'overview',label:'Table',icon:Table2}, {value:'kanban',label:'Kanban',icon:KanbanSquare}, {value:'milestone',label:'Milestones',icon:LayoutGrid}, {value:'gantt',label:'Gantt',icon:GanttChart},
  {value:'list',label:'List',icon:List}, {value:'calendar',label:'Calendar',icon:CalendarDays}, {value:'timeline',label:'Timeline',icon:Clock3},
];
const tableColumns: {value:TaskColumn;label:string}[] = [
  {value:'priority',label:'Priority'}, {value:'status',label:'Status'}, {value:'milestone',label:'Milestone'},
  {value:'due',label:'Due date'}, {value:'assignee',label:'Assignees'},
  {value:'start',label:'Start date'}, {value:'phase',label:'Phase'}, {value:'tags',label:'Tags'},
];

function Field({label,children}:{label:string;children:ReactNode}) {
  return <label className="min-w-0 space-y-1 text-[11px] font-medium text-muted-foreground"><span>{label}</span>{children}</label>;
}
export function ProjectWorkplanToolbar({projectId,filters,onChange,view,onView,grouping,onGrouping,sort,onSort,columns,onColumns,showColumnLabels=true,onShowColumnLabels,assignees,phasesReady,assignmentsReady,
  tagFilter,onTagFilter,tags,showEditor,onToggleEditor,onAddTask,onAddMilestone,disabled=false,onAdvancedToggle,advanced=false,actions,
  selectedCount=0, visibleCount=0, allVisibleSelected=false, onToggleAllVisible, onClearSelection, onBulkStatus, onBulkDueDate, onBulkMilestone, onBulkDelete, onCopySelectedLinks, milestoneChoices=[]}: {
  actions?:ReactNode;onAdvancedToggle?:()=>void;advanced?:boolean;projectId:string;filters:WorkplanFilters;onChange:(changes:Partial<WorkplanFilters>)=>void;
  view:TasksDisplayView;onView:(view:TasksDisplayView)=>void;grouping:TaskGrouping;onGrouping:(value:TaskGrouping)=>void;
  sort:TaskSort;onSort:(value:TaskSort)=>void;columns:TaskColumn[];onColumns:(values:TaskColumn[])=>void;
  showColumnLabels?:boolean;onShowColumnLabels:(show:boolean)=>void;
  assignees:{id:string;label:string}[];phasesReady:boolean;assignmentsReady:boolean;
  tagFilter:string;onTagFilter:(tag:string)=>void;tags:string[];
  showEditor:boolean;onToggleEditor:()=>void;onAddTask:()=>void;onAddMilestone:()=>void;disabled?:boolean;
  selectedCount?:number;visibleCount?:number;allVisibleSelected?:boolean;
  onToggleAllVisible:()=>void;onClearSelection:()=>void;
  onBulkStatus:(status:'todo'|'doing'|'blocked'|'done')=>void;
  onBulkDueDate:(date:string|null)=>void;onBulkMilestone:(milestoneId:string|null)=>void;
  onBulkDelete:()=>void;onCopySelectedLinks:()=>void;
  milestoneChoices?:{id:string;title:string}[];
}) {
  const [searchOpen,setSearchOpen]=useState(false);
  const toolbarRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const closeDetails=(except?:HTMLDetailsElement|null)=>{
      toolbarRef.current?.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(menu=>{
        if(menu!==except)menu.open=false;
      });
    };
    const onPointerDown=(event:PointerEvent)=>{
      const target=event.target;
      if(!(target instanceof Node))return;
      const active=toolbarRef.current?.contains(target)
        ? (target instanceof Element?target.closest('details'):target.parentElement?.closest('details'))
        : null;
      closeDetails(active instanceof HTMLDetailsElement?active:null);
    };
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        closeDetails();
      }
    };
    document.addEventListener('pointerdown',onPointerDown,true);
    document.addEventListener('keydown',onKeyDown,true);
    return ()=>{
      document.removeEventListener('pointerdown',onPointerDown,true);
      document.removeEventListener('keydown',onKeyDown,true);
    };
  },[]);

  const applied=[filters.phase!=='all',filters.side!=='all',filters.assignee!=='all',filters.status!=='all',filters.deadline!=='all',Boolean(filters.from||filters.to),Boolean(filters.query.trim()),Boolean(tagFilter)].filter(Boolean).length;
  const clear=()=>{onChange({query:'',phase:'all',side:'all',assignee:'all',status:'all',deadline:'all',from:'',to:''});onTagFilter('');};
  const selectView=(next:TasksDisplayView,button:HTMLButtonElement)=>{onView(next);const menu=button.closest('details');if(menu)menu.open=false;};
  const chooseGroup=(next:TaskGrouping,button:HTMLButtonElement)=>{onGrouping(next);const menu=button.closest('details');if(menu)menu.open=false;};
  const chooseSort=(next:TaskSort,button:HTMLButtonElement)=>{onSort(next);const menu=button.closest('details');if(menu)menu.open=false;};
  const moveColumn=(column:TaskColumn,delta:number)=>{const index=columns.indexOf(column);const other=index+delta;if(index<0||other<0||other>=columns.length)return;const next=[...columns];[next[index],next[other]]=[next[other],next[index]];onColumns(next);};
  const currentView=views.find(option=>option.value===view)??views[0];
  const CurrentViewIcon=currentView.icon;
  const popup='absolute z-40 mt-1 min-w-44 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-xl';
  const optionClass='flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-xs hover:bg-muted';
  return <div ref={toolbarRef} className="bivi-task-toolbar sticky top-0 z-30 bg-white px-4 py-3 text-slate-950 dark:bg-card dark:text-foreground">
    <div className="flex min-w-0 flex-wrap items-center gap-2 overflow-visible" aria-label="Task view and tools">
      <details className="relative shrink-0">
        <summary className={control+' cursor-pointer list-none [&::-webkit-details-marker]:hidden'} title="Choose task view"><CurrentViewIcon size={16}/><span className="hidden sm:inline">{currentView.label}</span><ChevronDown size={13}/></summary>
        <div className={popup+' left-0'}>{views.map(item=><button type="button" key={item.value} className={optionClass} aria-pressed={view===item.value} onClick={event=>selectView(item.value,event.currentTarget)}><item.icon size={15}/><span className="flex-1">{item.label}</span>{view===item.value&&<Check size={14}/>}</button>)}</div>
      </details>
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
      <details className="relative shrink-0"><summary className={control+' cursor-pointer list-none [&::-webkit-details-marker]:hidden'}><ListFilter size={15}/>Group by<ChevronDown size={13}/></summary>
        <div className={popup+' left-0'}>{([{value:'status',label:'Status'},{value:'side',label:'Responsibility'},{value:'none',label:'None'}] as {value:TaskGrouping;label:string}[]).map(item=><button type="button" key={item.value} className={optionClass} onClick={event=>chooseGroup(item.value,event.currentTarget)}><span className="flex-1">{item.label}</span>{grouping===item.value&&<Check size={14}/>}</button>)}</div>
      </details>
      <details className="relative shrink-0"><summary className={control+' cursor-pointer list-none [&::-webkit-details-marker]:hidden'}><SlidersHorizontal size={15}/>Sort by<ChevronDown size={13}/></summary>
        <div className={popup+' left-0'}>{([{value:'default',label:'Manual order'},{value:'due',label:'Due date'},{value:'priority',label:'Priority'},{value:'title',label:'Name'}] as {value:TaskSort;label:string}[]).map(item=><button type="button" key={item.value} className={optionClass} onClick={event=>chooseSort(item.value,event.currentTarget)}><span className="flex-1">{item.label}</span>{sort===item.value&&<Check size={14}/>}</button>)}</div>
      </details>
      <details className="relative"><summary className={`${control} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}><Columns3 size={14}/>Columns</summary><fieldset className="absolute right-0 z-30 mt-1 min-w-40 space-y-2 rounded-xl border border-border bg-popover p-3 text-xs shadow-lg"><legend className="sr-only">Visible task columns</legend><label className="flex items-center gap-2 border-b border-border pb-2"><input type="checkbox" checked={showColumnLabels} onChange={event=>onShowColumnLabels(event.target.checked)}/>Show column labels</label>{tableColumns.map(col=><div key={col.value} className="flex items-center gap-1"><label className="flex flex-1 items-center gap-2"><input type="checkbox" checked={columns.includes(col.value)} onChange={e=>onColumns(e.target.checked?[...columns,col.value]:columns.filter(x=>x!==col.value))}/>{col.label}</label><button type="button" aria-label={"Move "+col.label+" left"} disabled={!columns.includes(col.value)||columns.indexOf(col.value)===0} className="rounded p-1 hover:bg-muted disabled:opacity-30" onClick={()=>moveColumn(col.value,-1)}><ArrowUp size={13}/></button><button type="button" aria-label={"Move "+col.label+" right"} disabled={!columns.includes(col.value)||columns.indexOf(col.value)===columns.length-1} className="rounded p-1 hover:bg-muted disabled:opacity-30" onClick={()=>moveColumn(col.value,1)}><ArrowDown size={13}/></button></div>)}</fieldset></details>
      <details className="relative shrink-0">
        <summary className={control+' cursor-pointer list-none [&::-webkit-details-marker]:hidden'} title="Quick actions for selected tasks" aria-label="Quick actions for selected tasks"><ListChecks size={15}/><span className="hidden lg:inline">Quick actions</span>{selectedCount>0&&<span className="rounded-full bg-blue-600 px-1.5 text-[10px] text-white">{selectedCount}</span>}<ChevronDown size={13}/></summary>
        <div className={popup+' left-0 w-60 max-h-[75vh] overflow-auto'} aria-label="Bulk task actions">
          <p className="mb-2 px-2 text-[11px] font-semibold">{selectedCount} task{selectedCount===1?'':'s'} selected</p>
          <button type="button" className={optionClass} disabled={!visibleCount} onClick={event=>{onToggleAllVisible();event.currentTarget.closest('details')!.open=false;}}><Check size={14}/>{allVisibleSelected?'Deselect visible tasks':'Select all visible tasks'}</button>
          <button type="button" className={optionClass} disabled={!selectedCount} onClick={event=>{onClearSelection();event.currentTarget.closest('details')!.open=false;}}><X size={14}/>Clear selection</button>
          <div className="my-2 border-t border-border"/>
          <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground">Change status</p>
          {([{status:'todo',label:'Backlog'},{status:'doing',label:'In progress'},{status:'blocked',label:'Blocked'},{status:'done',label:'Completed'}] as const).map(item=><button key={item.status} type="button" disabled={!selectedCount||disabled} className={optionClass} onClick={event=>{onBulkStatus(item.status);event.currentTarget.closest('details')!.open=false;}}><Check size={14}/>{item.label}</button>)}
          <div className="my-2 border-t border-border"/>
          <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground">Move to milestone</p>
          <div className="max-h-44 overflow-y-auto">
            {[{id:null,title:'No milestone'},...milestoneChoices].map(item=><button key={item.id??'none'} type="button" disabled={!selectedCount||disabled} className={optionClass} onClick={event=>{onBulkMilestone(item.id);event.currentTarget.closest('details')!.open=false;}}><ArrowRightLeft size={14}/><span className="min-w-0 truncate">{item.title}</span></button>)}
          </div>
          <label className="my-2 flex items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-muted"><CalendarClock size={14}/>Due date
            <input type="date" aria-label="Set due date for selected tasks" className="min-w-0 w-32 bg-transparent text-xs" disabled={!selectedCount||disabled} onChange={event=>{if(event.currentTarget.value){onBulkDueDate(event.currentTarget.value);event.currentTarget.closest('details')!.open=false;}}}/>
          </label>
          <button type="button" className={optionClass} disabled={!selectedCount||disabled} onClick={event=>{onBulkDueDate(null);event.currentTarget.closest('details')!.open=false;}}>Clear due dates</button>
          <div className="my-2 border-t border-border"/>
          <button type="button" className={optionClass} disabled={!selectedCount} onClick={event=>{onCopySelectedLinks();event.currentTarget.closest('details')!.open=false;}}><Copy size={14}/>Copy internal task links</button>
          <button type="button" className={optionClass+' text-destructive'} disabled={!selectedCount||disabled} onClick={event=>{onBulkDelete();event.currentTarget.closest('details')!.open=false;}}><Trash2 size={14}/>Remove selected tasks…</button>
        </div>
      </details>
      <div className="min-w-0 flex-1"/>
      <button type="button" title="Search tasks" aria-label="Search tasks" aria-expanded={searchOpen} className={control} onClick={()=>setSearchOpen(value=>!value)}><Search size={15}/></button>
      <button type="button" className={control} title={showEditor?'Hide task editor':'Show task editor'} aria-label={showEditor?'Hide task editor':'Show task editor'} aria-pressed={showEditor} onClick={onToggleEditor}>{showEditor?<PanelRightClose size={15}/>:<PanelRightOpen size={15}/>}</button>
      <details className="relative shrink-0"><summary className={control+' cursor-pointer list-none [&::-webkit-details-marker]:hidden'} aria-label="Add task or milestone"><Plus size={16}/><Menu size={13}/></summary>
        <div className={popup+' right-0'}><button type="button" disabled={disabled} className={optionClass} onClick={event=>{onAddTask();const menu=event.currentTarget.closest('details');if(menu)menu.open=false;}}>Add task</button><Link href={'/projects/'+projectId+'?tab=phases&newMilestone=1'} className={optionClass}>Add milestone in Lifecycle</Link></div>
      </details>
      {actions}
    </div>
    {(searchOpen||Boolean(filters.query))&&<div className="mt-2 flex items-center gap-2 rounded-lg border border-input bg-background px-2"><Search size={14}/><input autoFocus type="search" className="min-h-9 min-w-0 flex-1 bg-transparent text-xs outline-none" placeholder="Search tasks" value={filters.query} onChange={event=>onChange({query:event.target.value})}/><button type="button" aria-label="Close search" onClick={()=>{onChange({query:''});setSearchOpen(false);}}><X size={14}/></button></div>}
  </div>;
}
