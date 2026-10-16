'use client';

import { useState } from 'react';
import { Check, ChevronDown, CircleDashed, Plus } from 'lucide-react';
import type { ProjectBody } from '@/lib/projects/schema';
import { projectPhaseLabels, projectPhaseOrder, type ProjectPhase } from '@/lib/projects/lifecycle-schema';
import { phaseProgress, type PhaseStatus } from '@/lib/projects/phase-status';
import type { ProjectHierarchyResponse } from '@/lib/projects/hierarchy-schema';
import { milestoneStats } from '@/lib/projects/workplan-views';
import { ProjectTaskStateIcon } from './DirectoryIndicators';
import { useProjectPhaseStatuses } from './useProjectPhaseStatuses';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const statuses: {status:PhaseStatus;label:string}[] = [
  { status:'planning',label:'Planning' }, { status:'active',label:'Active' }, { status:'completed',label:'Completed' },
];

function PhaseIcon({status}: {status:PhaseStatus}) {
  if (status === 'completed') return <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white"><Check size={13} strokeWidth={3}/></span>;
  if (status === 'active') return <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-violet-600 bg-white dark:bg-background"><span className="h-2.5 w-2.5 rounded-full bg-violet-500"/></span>;
  return <CircleDashed className="h-5 w-5 text-slate-400" aria-hidden="true"/>;
}

export function ProjectPhaseCards({id,body,links,disabled,onAssignMilestone}: {
  id:string; body:ProjectBody;
  links:ProjectHierarchyResponse['milestonePhases'];
  disabled:boolean;
  onAssignMilestone:(milestone:ProjectBody['milestones'][number],phase:ProjectPhase,checked:boolean)=>void;
}) {
  const phases = useProjectPhaseStatuses(id);
  const [prompt, setPrompt] = useState<{phase:ProjectPhase;status:PhaseStatus}|null>(null);
  const [reason, setReason] = useState('');
  const perform = async () => {
    if (!prompt) return;
    const success = await phases.save(prompt.phase,prompt.status,reason.trim());
    if (success) {setPrompt(null);setReason('');}
  };
  return <section aria-label="Parallel project phase statuses" className="space-y-3">
    <p className="text-xs text-muted-foreground">Phases can be active at the same time. Only Bivi staff can formally complete a phase, after all its milestones are reviewed.</p>
    {phases.error && <div role="alert" className="rounded-lg border border-red-300 p-3 text-xs text-red-700 dark:text-red-300">{phases.error} <button type="button" onClick={()=>{void phases.load();}} className="ml-2 underline">Retry</button></div>}
    {!phases.states && !phases.error && <p role="status" className="text-xs text-muted-foreground">Loading saved phase statuses…</p>}
    {projectPhaseOrder.map(phase => {
      const state=phases.states?.find(item=>item.phase===phase);
      const status=state?.status??'planning';
      const related=body.milestones.filter(m=>links.some(link=>link.phase===phase&&link.milestoneId===m.id));
      const progress=phaseProgress(body,related.map(m=>m.id));
      const phaseName=projectPhaseLabels[phase];
      return <details key={phase} className={`group overflow-hidden rounded-xl border border-border ${status==='completed'?'bg-muted/60':'bg-card'}`}>
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
          <span className="rounded-md p-1 group-open:rotate-180"><ChevronDown size={16} aria-hidden/></span>
          <span className="min-w-0 flex-1">
            <span className={`block text-sm font-semibold ${status==='completed'?'text-muted-foreground line-through':'text-foreground'}`}>{phaseName}</span>
            <span className="mt-1 block text-[11px] text-muted-foreground">{progress.completed}/{progress.total} milestones completed</span>
          </span>
          <Popover><PopoverTrigger asChild><button type="button" onClick={event=>event.stopPropagation()} disabled={disabled||!phases.states||phases.busy} aria-label={`Change ${phaseName} status`} className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium hover:bg-muted disabled:opacity-50">
            <PhaseIcon status={status}/>{status==='active'?'Active':status==='completed'?'Completed':'Planning'}
          </button></PopoverTrigger><PopoverContent align="end" className="w-40 p-1">{statuses.map(option=><button key={option.status} type="button" className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs hover:bg-muted" disabled={option.status===status} onClick={()=>{setPrompt({phase,status:option.status});setReason('');}}><PhaseIcon status={option.status}/>{option.label}</button>)}</PopoverContent></Popover>
        </summary>
        <div className="border-t border-border px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium">Milestones in {phaseName}</p>
            <div className="flex gap-2">
              <Popover><PopoverTrigger asChild><button type="button" disabled={disabled} className="rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-40"><Plus size={13} className="inline" aria-hidden/> Assign milestones</button></PopoverTrigger><PopoverContent align="end" className="max-h-72 overflow-y-auto p-2"><p className="px-2 py-1 text-xs font-semibold">Link milestones to this phase</p>{body.milestones.map(m=>{const linked=related.some(x=>x.id===m.id);return <label key={m.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs hover:bg-muted"><input type="checkbox" checked={linked} disabled={disabled} onChange={event=>onAssignMilestone(m,phase,event.target.checked)}/><span>{m.title}</span></label>})}</PopoverContent></Popover>

            </div>
          </div>
          {status==='active'&&progress.allDone&&<p className="mt-3 text-xs text-emerald-700 dark:text-emerald-300">All linked milestones are completed. Review and mark this phase Completed using Change status.</p>}
          <div className="mt-3 grid gap-2 md:grid-cols-2">{related.map(m=>{
            const stats=milestoneStats(body,m.id);
            return <div key={m.id} className={`rounded-lg border border-border p-3 ${m.status==='done'?'bg-muted/70':'bg-background'}`}>
              <div className="flex items-center gap-2"><ProjectTaskStateIcon status={m.status}/><span className={`min-w-0 flex-1 break-words text-xs font-medium ${m.status==='done'?'text-muted-foreground line-through':''}`}>{m.title}</span><span className="text-[11px] text-muted-foreground">{stats.done}/{stats.total}</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-600" style={{width:`${stats.percent??0}%`}}/></div>
            </div>;
          })}</div>
          {!related.length&&<p className="py-3 text-xs text-muted-foreground">No milestones assigned to this phase.</p>}
        </div>
      </details>;
    })}
    <Dialog open={!!prompt} onOpenChange={open=>{if(!open&&!phases.busy)setPrompt(null);}}><DialogContent className="bivi-staff-surface"><DialogTitle>{prompt?.status==='completed'?'Complete phase?':prompt?.status==='active'?'Activate phase?':'Return phase to Planning?'}</DialogTitle><DialogDescription>Change {prompt&&projectPhaseLabels[prompt.phase]} to {prompt?.status}. The status is saved independently and audited. Active work must be resolved before closing the phase.</DialogDescription><label className="text-xs font-medium">Reason (optional)<textarea className="mt-1 w-full rounded-lg border border-input bg-background p-2 text-xs" maxLength={2000} rows={2} value={reason} onChange={e=>setReason(e.target.value)} /></label><DialogFooter><button type="button" className="rounded-lg border px-3 py-2 text-xs" disabled={phases.busy} onClick={()=>setPrompt(null)}>Cancel</button><button type="button" className="rounded-lg bg-foreground px-3 py-2 text-xs text-background disabled:opacity-50" disabled={phases.busy} onClick={()=>{void perform();}}>{phases.busy?'Saving…':'Confirm change'}</button></DialogFooter></DialogContent></Dialog>
  </section>;
}
