'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Flag, Plus, Save, Trash2 } from 'lucide-react';
import type { ProjectBody } from '@/lib/projects/schema';
import { milestoneStats } from '@/lib/projects/workplan-views';
import { ProjectTaskStateIcon } from './DirectoryIndicators';
import { useProjectEditingController } from './useProjectEditingController';
import { useWorkspaceUnsavedChanges } from '../workspace/WorkspaceNavigationGuard';

type Milestone=ProjectBody['milestones'][number];
type RecordSource={body:ProjectBody;revision:number;state:string};
const field='min-h-9 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
const button='inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50';

export function ProjectLifecycleMilestones({id,record,createOnOpen=false}:{
  id:string;record:RecordSource;createOnOpen?:boolean;
}) {
  const editor=useProjectEditingController(id,record);
  const {body,setBody,dirty,drafts,busy,blocked,message,saveOutcomeUnknown,serverBlockers}=editor;
  const readonly=record.state==='completed'||blocked||saveOutcomeUnknown||Boolean(drafts.conflict);
  const creationHandled=useRef(false);
  const [expanded,setExpanded]=useState<string|null>(null);
  const acknowledge=useWorkspaceUnsavedChanges(dirty,'Project milestone draft',async()=>{
    if(!await editor.save())throw new Error('Review and save milestone changes before leaving Lifecycle.');
  });
  function addMilestone(){
    if(!body||readonly||!drafts.ready||drafts.recoverable||body.milestones.length>=20)return;
    const id=crypto.randomUUID();
    const item:Milestone={id,title:'New milestone',dueOn:null,status:'planned'};
    setBody(previous=>previous?{...previous,milestones:[...previous.milestones,item]}:previous);
    setExpanded(id);
  }
  useEffect(()=>{
    if(!createOnOpen||creationHandled.current||!body||readonly||!drafts.ready||drafts.recoverable||body.milestones.length>=20)return;
    creationHandled.current=true;
    const id=crypto.randomUUID();
    setBody(previous=>previous?{...previous,milestones:[...previous.milestones,{id,title:'New milestone',dueOn:null,status:'planned'}]}:previous);
    setExpanded(id);
  },[createOnOpen,body,readonly,drafts.ready,drafts.recoverable,setBody]);
  function updateMilestone(id:string,changes:Partial<Milestone>){
    setBody(previous=>previous?{...previous,milestones:previous.milestones.map(item=>item.id===id?{...item,...changes}:item)}:previous);
  }
  function removeMilestone(item:Milestone){
    if(!body||body.tasks.some(task=>task.milestoneId===item.id))return;
    if(!window.confirm(`Remove “${item.title}”? Save milestones to confirm. Historical activity is retained.`))return;
    setBody(previous=>previous?{...previous,milestones:previous.milestones.filter(row=>row.id!==item.id)}:previous);
  }
  async function save(){
    if(await editor.save())acknowledge();
  }
  return <section id="project-lifecycle-milestones" aria-label="Milestone editor" className="space-y-3 rounded-xl border border-border bg-white p-3 text-foreground dark:bg-card">
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3"><div><h2 className="text-sm font-semibold">Milestones</h2><p className="mt-1 text-[11px] text-muted-foreground">Manage milestones here alongside their phases. Task editing stays in Tasks. Changes use the same revision-checked work-plan draft.</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={readonly||!drafts.ready||Boolean(drafts.recoverable)||!body||body.milestones.length>=20} onClick={addMilestone} className={button}><Plus size={14}/>Add milestone</button>
        <button type="button" disabled={readonly||busy||!dirty||!drafts.ready||Boolean(drafts.recoverable)} onClick={()=>{void save();}} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background disabled:opacity-50"><Save size={14}/>Save milestones</button>
      </div>
    </header>
    {drafts.recoverable&&<div role="status" className="space-y-2 rounded-lg border border-violet-300 bg-violet-50 p-3 text-xs text-violet-900 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-100"><p>A private project draft exists. Restore or discard it before editing milestones. This also affects any work-plan changes in that draft.</p><button type="button" className={button} disabled={Boolean(drafts.rebase)||drafts.recoverable.baseRevision!==editor.savedRevision} onClick={drafts.restore}>Restore draft</button><button type="button" className={button} onClick={()=>{if(window.confirm('Discard the private project work-plan draft?'))void editor.discard();}}>Discard draft</button></div>}
    {drafts.rebase&&<div role="alert" className="space-y-2 rounded-lg border border-amber-300 p-3 text-xs"><p className="font-semibold">Resolve saved-project conflicts before continuing.</p>{drafts.rebase.conflicts.map(conflict=><div key={conflict.path} className="rounded-md border border-border p-2"><p>{conflict.label}</p><div className="mt-1 flex gap-2"><button type="button" className={button} onClick={()=>drafts.chooseConflict(conflict.path,'draft')}>Keep my edit</button><button type="button" className={button} onClick={()=>drafts.chooseConflict(conflict.path,'latest')}>Use saved value</button></div></div>)}</div>}
    {drafts.error&&<p role="alert" className="text-xs text-destructive">{drafts.error}</p>}
    {serverBlockers.length>0&&<div role="alert" className="rounded-lg border border-amber-300 p-3 text-xs"><p className="font-semibold">Milestone completion requires finished tasks and subtasks.</p>{serverBlockers.map(row=><p key={row.milestoneId}>{row.milestoneTitle}: {row.tasks.map(task=>task.title).join(', ')||'Add a task'}</p>)}</div>}
    {message&&<p role="status" className="text-xs text-muted-foreground">{message}</p>}
    {saveOutcomeUnknown&&<button type="button" className={button} onClick={()=>{void editor.checkUncertainSave();}}>Check save status</button>}
    {dirty&&<p role="status" className="text-xs text-amber-700 dark:text-amber-300">Unsaved milestone draft. Save before leaving Lifecycle.</p>}
    {!body&&<p className="text-xs text-muted-foreground">Loading project milestones…</p>}
    {body&&<div className="divide-y divide-border/60">{[...body.milestones].sort((a,b)=>Number(a.status==='done')-Number(b.status==='done')).map(item=>{
      const stats=milestoneStats(body,item.id);
      const children=body.tasks.filter(task=>task.milestoneId===item.id);
      const isExpanded=expanded===item.id;
      return <article key={item.id} className="py-2 transition-colors hover:bg-slate-50 dark:hover:bg-muted/40">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" aria-label={`${isExpanded?'Collapse':'Expand'} milestone ${item.title}`} aria-expanded={isExpanded} className="min-w-0 flex-1 py-2 text-left text-xs font-medium" onClick={()=>setExpanded(isExpanded?null:item.id)}><ProjectTaskStateIcon status={item.status}/><span className="ml-2">{item.title}</span><span className="ml-2 text-[11px] font-normal text-muted-foreground">{stats.done}/{stats.total} tasks done</span></button>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Flag size={13}/>{item.dueOn??'No due date'}</span>
          <span className="text-[11px] capitalize text-muted-foreground">{item.status==='in_progress'?'In progress':item.status==='done'?'Completed':'Planned'}</span>
          <button type="button" className={button} onClick={()=>setExpanded(isExpanded?null:item.id)}>{isExpanded?'Close':'Edit'}</button>
        </div>
        {isExpanded&&<div className="space-y-3 rounded-lg bg-muted/25 p-3">
          <label className="block text-[11px] font-medium">Milestone name<input className={field} maxLength={300} disabled={readonly} value={item.title} onChange={e=>updateMilestone(item.id,{title:e.target.value})}/></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[11px] font-medium">Status<select className={field} disabled={readonly} value={item.status} onChange={e=>updateMilestone(item.id,{status:e.target.value as Milestone['status']})}><option value="planned">Planned</option><option value="in_progress">In progress</option><option value="done">Completed — server validation required</option></select></label>
            <label className="block text-[11px] font-medium">Due date<input type="date" className={field} disabled={readonly} value={item.dueOn??''} onChange={e=>updateMilestone(item.id,{dueOn:e.target.value||null})}/></label>
          </div>
          <div><p className="text-[11px] font-medium">Associated tasks ({children.length})</p><div className="mt-1 space-y-1">{children.map(task=><Link key={task.id} href={`/projects/${id}?tab=plan&task=${encodeURIComponent(task.id)}`} className="flex items-center gap-2 rounded-md p-2 text-xs hover:bg-muted"><ProjectTaskStateIcon status={task.status}/>{task.title}</Link>)}{!children.length&&<p className="text-[11px] text-muted-foreground">No associated tasks yet. Assign tasks from the full Tasks editor.</p>}</div></div>
          <button type="button" disabled={readonly||children.length>0} onClick={()=>removeMilestone(item)} className="inline-flex min-h-8 items-center gap-1.5 text-xs text-destructive disabled:opacity-40"><Trash2 size={13}/>Remove milestone</button>
        </div>}
      </article>;
    })}{body.milestones.length===0&&<p className="py-5 text-xs text-muted-foreground">No milestones yet. Use Add milestone to create one.</p>}</div>}
  </section>;
}
