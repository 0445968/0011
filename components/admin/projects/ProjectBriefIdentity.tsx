'use client';

import {ProjectOrganizationOwnerButton,useProjectAssignments} from './ProjectAssignments';
import {ProjectMetric,ProjectPanel} from './ProjectVisuals';

export function ProjectBriefIdentity({id,state,activatedAt,proposalVersion,revision,timezone='America/Chicago'}:{
  id:string;state:string;activatedAt:string|null;proposalVersion:number;revision:number;timezone?:string;
}) {
  const assignments=useProjectAssignments(id);
  const activation=activatedAt?new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short',timeZone:timezone,timeZoneName:'short'}).format(new Date(activatedAt)):'Not activated';
  return <ProjectPanel title="Project identity" description="Verified ownership and activation details">
    <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-3">
      <ProjectMetric label="Lifecycle state" value={state.replaceAll('_',' ')} detail="Saved project state"/>
      <ProjectMetric label="Activated" value={activation} detail={activatedAt?`Shown in ${timezone}`:'Activation has not been recorded'}/>
      <ProjectMetric label="Accepted scope" value={`Version ${proposalVersion}`} detail={`Current project revision ${revision}`}/>
    </div>
    <div className="p-3"><ProjectOrganizationOwnerButton projectId={id} controls={assignments} disabled={state==='completed'||assignments.busy}/></div>
  </ProjectPanel>;
}
