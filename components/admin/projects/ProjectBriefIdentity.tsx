'use client';

import {ProjectOrganizationOwnerButton,useProjectAssignments} from './ProjectAssignments';
import {ProjectBriefRename} from './ProjectBriefRename';
import {ProjectMetric,ProjectPanel} from './ProjectVisuals';
import {formatSafeDateTime,safeTimeZone} from '@/lib/date-format';

export function ProjectBriefIdentity({id,state,activatedAt,proposalVersion,revision,title,timezone='America/Chicago'}:{
  id:string;state:string;activatedAt:string|null;proposalVersion:number;revision:number;title:string;timezone?:string;
}) {
  const assignments=useProjectAssignments(id);
  const activation=formatSafeDateTime(activatedAt,timezone,{absent:'Not activated',invalid:'Activation date unavailable'});
  const displayTimezone=safeTimeZone(timezone);
  return <ProjectPanel title="Project identity" description="Verified ownership and activation details">
    <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-3">
      <ProjectMetric label="Lifecycle state" value={state.replaceAll('_',' ')} detail="Saved project state"/>
      <ProjectMetric label="Activated" value={activation} detail={activatedAt?`Shown in ${displayTimezone}`:'Activation has not been recorded'}/>
      <ProjectMetric label="Accepted scope" value={`Version ${proposalVersion}`} detail={`Current project revision ${revision}`}/>
    </div>
    <div className="space-y-3 p-3"><ProjectBriefRename id={id} initialTitle={title} initialRevision={revision}/>
      <ProjectOrganizationOwnerButton projectId={id} controls={assignments} disabled={state==='completed'||assignments.busy}/></div>
  </ProjectPanel>;
}
