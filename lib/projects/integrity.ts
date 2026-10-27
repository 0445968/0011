import type {ProjectBody} from './schema';
import type {ProjectPhase} from './lifecycle-schema';

/** Diagnostics never repair associations by inference or delete orphan evidence. */
export function projectIntegrityIssues(body:ProjectBody,controls:readonly {taskId:string;phase:ProjectPhase}[],links:readonly {milestoneId:string;phase:ProjectPhase}[],subtasks:readonly {id:string;taskId:string}[]) {
  const tasks=new Set(body.tasks.map(task=>task.id));
  const milestones=new Set(body.milestones.map(row=>row.id));
  const issues:string[]=[];
  for(const task of body.tasks){
    const control=controls.find(row=>row.taskId===task.id);
    if(!control)issues.push(`${task.title}: missing saved task controls. Completion is blocked until explicitly repaired.`);
    if(task.milestoneId&&!milestones.has(task.milestoneId))issues.push(`${task.title}: milestone reference is missing.`);
    const phases=links.filter(row=>row.milestoneId===task.milestoneId).map(row=>row.phase);
    if(control&&phases.length&&!phases.includes(control.phase))issues.push(`${task.title}: direct phase ${control.phase} adds scope outside its milestone phases. Review both associations; neither is overwritten.`);
  }
  for(const control of controls)if(!tasks.has(control.taskId))issues.push(`Orphan task controls: ${control.taskId}.`);
  for(const link of links)if(!milestones.has(link.milestoneId))issues.push(`Orphan milestone phase link: ${link.milestoneId}.`);
  for(const subtask of subtasks)if(!tasks.has(subtask.taskId))issues.push(`Orphan subtask: ${subtask.id}.`);
  return issues;
}
