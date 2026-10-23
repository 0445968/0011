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
import {ProjectPageHeader,ProjectPanel,projectControlClass} from './ProjectVisuals';

type Lifecycle = { requestId:string; phase:ProjectPhase; revision:number; updatedAt:string };
type Event = { id:number; task_id:string; action:string; snapshot:Record<string,unknown>; created_at:string };
type PhaseLinkCommand = Extract<Parameters<ReturnType<typeof useProjectHierarchy>['save']>[0],{action:'set_milestone_phases'}>;

export function ProjectPhasesPage({id,revision,body,lifecycle,controls,events,phaseStates,phaseColors,readOnly,completionIssues,selectedTask}: {
  id:string; revision:number; body:ProjectBody; lifecycle:Lifecycle; controls:ProjectTaskControl[]; events:Event[]; selectedTask?:string;
  phaseStates:ProjectPhaseState[]; phaseColors:ProjectPhaseColor[];
  readOnly:boolean; completionIssues:string[];
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
    <ProjectPageHeader eyebrow="Project settings" title="Phases" description="Saved status, configured colors, deadlines and linked work."
      action={<button type="button" disabled={hierarchy.busy} onClick={()=>{void hierarchy.load();void colors.refresh().catch(()=>undefined);}} className={projectControlClass}><RefreshCcw size={13} aria-hidden/>Refresh</button>}/>
    {completionIssues.length>0&&<div role="alert" className="rounded-lg border border-amber-300 p-3 text-xs"><p className="font-semibold">Completion evidence needs review</p><ul className="mt-2 list-disc pl-4">{completionIssues.map((issue,index)=><li key={index}>{issue}</li>)}</ul></div>}
    {colors.loadError&&<p role="alert" className="rounded-lg border border-red-300 p-3 text-xs text-red-700 dark:text-red-300">{colors.loadError}<button type="button" onClick={()=>{void colors.refresh().catch(()=>undefined);}} className="ml-2 underline">Refresh colors</button></p>}
    {hierarchy.error&&<p role="alert" className="rounded-lg border border-red-300 p-3 text-xs text-red-700 dark:text-red-300">{hierarchy.error}</p>}
    {hierarchy.conflict&&<p role="alert" className="rounded-lg border border-amber-300 p-3 text-xs text-amber-900 dark:text-amber-200">Project or hierarchy revision changed. Refresh phase data before editing.</p>}
    {!hierarchy.data&&<p role="status" className="rounded-lg border border-border p-3 text-xs text-muted-foreground">Loading phase links and subtasks…</p>}
    {hierarchy.data&&<ProjectPhaseCards
      id={id} body={body} links={hierarchy.data.milestonePhases} initialStates={phaseStates}
      colorRows={colors.rows} colorFeedback={colors.feedback} colorSaving={colors.saving} onSaveColor={(phase,color)=>colors.save(phase,color)}
      controls={controls} subtasks={subtasks}
      disabled={readOnly||hierarchy.busy||hierarchy.conflict||hierarchy.data.projectRevision!==revision}
      onAssignMilestone={assign}
    />}
    <ProjectPanel title="Lifecycle, dependencies and approvals" description="Revision-checked task and phase controls">
      <details className="group" open={Boolean(selectedTask)}>
      <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Open lifecycle controls</summary>
      <div className="border-t border-border p-3">
        <ProjectLifecycleControls key={id} id={id} lifecycle={lifecycle} controls={controls} tasks={body.tasks} events={events} selectedTask={selectedTask}/>
      </div>
      </details>
    </ProjectPanel>
  </div>;
}
