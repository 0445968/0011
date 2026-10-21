'use client';

import { useCallback } from 'react';
import { RefreshCcw } from 'lucide-react';
import type { ProjectBody } from '@/lib/projects/schema';
import type { ProjectPhase, ProjectTaskControl } from '@/lib/projects/lifecycle-schema';
import type { ProjectPhaseState } from '@/lib/projects/phase-status';
import type { ProjectPhaseColor } from '@/lib/projects/phase-colors';
import type { ProjectHierarchyResponse } from '@/lib/projects/hierarchy-schema';
import { ProjectLifecycleControls } from '@/components/admin/ProjectLifecycleControls';
import { ProjectPhaseCards } from './ProjectPhaseCards';
import { useProjectHierarchy } from './useProjectHierarchy';
import { useProjectPhaseColors } from './useProjectPhaseColors';

type Lifecycle = { requestId:string; phase:ProjectPhase; revision:number; updatedAt:string };
type Event = { id:number; task_id:string; action:string; snapshot:Record<string,unknown>; created_at:string };
type PhaseLinkCommand = Extract<Parameters<ReturnType<typeof useProjectHierarchy>['save']>[0],{action:'set_milestone_phases'}>;

export function ProjectPhasesPage({id,revision,body,lifecycle,controls,events,phaseStates,phaseColors,readOnly}: {
  id:string; revision:number; body:ProjectBody; lifecycle:Lifecycle; controls:ProjectTaskControl[]; events:Event[];
  phaseStates:ProjectPhaseState[]; phaseColors:ProjectPhaseColor[];
  readOnly:boolean;
}) {
  const hierarchy=useProjectHierarchy(id,revision,true);
  const colors=useProjectPhaseColors(id,phaseColors);
  const links=hierarchy.data?.milestonePhases ?? [];
  const subtasks=hierarchy.data?.subtasks ?? [];
  const assign=useCallback((milestone:ProjectBody['milestones'][number],phase:ProjectPhase,checked:boolean)=>{
    const current=links.filter(link=>link.milestoneId===milestone.id).map(link=>link.phase);
    const next=checked?[...current,phase]:current.filter(item=>item!==phase);
    const command:PhaseLinkCommand={action:'set_milestone_phases',milestoneId:milestone.id,phases:[...new Set(next)]};
    void hierarchy.save(command);
  },[hierarchy,links]);

  return <div className="space-y-3">
    <header className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Project settings</p><h1 className="mt-1 text-lg font-semibold">Phases</h1><p className="mt-1 text-xs text-muted-foreground">Saved phase status, colors, deadlines, milestones, and lifecycle controls.</p></div>
      <button type="button" disabled={hierarchy.busy} onClick={()=>{void hierarchy.load();void colors.refresh().catch(()=>undefined);}} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs hover:bg-muted disabled:opacity-50"><RefreshCcw size={13} aria-hidden/>Refresh phase data</button>
    </header>
    {colors.loadError&&<p role="alert" className="rounded-lg border border-red-300 p-3 text-xs text-red-700 dark:text-red-300">{colors.loadError}<button type="button" onClick={()=>{void colors.refresh().catch(()=>undefined);}} className="ml-2 underline">Refresh colors</button></p>}
    {hierarchy.error&&<p role="alert" className="rounded-lg border border-red-300 p-3 text-xs text-red-700 dark:text-red-300">{hierarchy.error}</p>}
    {hierarchy.conflict&&<p role="alert" className="rounded-lg border border-amber-300 p-3 text-xs text-amber-900 dark:text-amber-200">Project or hierarchy revision changed. Refresh phase data before editing.</p>}
    {!hierarchy.data&&<p role="status" className="rounded-lg border border-border p-3 text-xs text-muted-foreground">Loading phase links and subtasks…</p>}
    {hierarchy.data&&<ProjectPhaseCards
      id={id} body={body} links={hierarchy.data.milestonePhases} initialStates={phaseStates}
      colorRows={colors.rows} colorFeedback={colors.feedback} colorSaving={colors.saving} onSaveColor={(phase,color)=>{void colors.save(phase,color);}}
      controls={controls} subtasks={subtasks}
      disabled={readOnly||hierarchy.busy||hierarchy.conflict||hierarchy.data.projectRevision!==revision}
      onAssignMilestone={assign}
    />}
    <details className="rounded-xl border border-border bg-card">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Lifecycle, dependencies and approvals</summary>
      <div className="border-t border-border p-3 sm:p-4">
        <p className="mb-3 text-xs text-muted-foreground">Task assignment, dependencies, ownership and lifecycle approvals use the existing revision-checked staff controls and audit history.</p>
        <ProjectLifecycleControls key={`${revision}:${lifecycle.revision}`} id={id} lifecycle={lifecycle} controls={controls} tasks={body.tasks} events={events}/>
      </div>
    </details>
  </div>;
}
