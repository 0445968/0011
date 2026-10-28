import {projectBodySchema, type ProjectBody} from './schema';
import {projectBodiesEqual} from './workplan-merge';

/** Brief only operates on a verified saved work plan; drafts never satisfy completion checks. */
export function canCompleteProject(state:string,body:ProjectBody,gateReady:boolean) {
  return state==='active' && gateReady && body.tasks.length>0
    && body.tasks.every(task=>task.status==='done')
    && body.milestones.every(milestone=>milestone.status==='done');
}

export function canReopenProject(state:string) {
  return state==='completed';
}

/** Invalid or unfinished private work-plan drafts are never silently ignored. */
export function hasUnsavedProjectDraft(draftBody:unknown,savedBody:ProjectBody) {
  if(draftBody===null||draftBody===undefined)return false;
  const parsed=projectBodySchema.safeParse(draftBody);
  if(!parsed.success)return true;
  return !projectBodiesEqual(parsed.data,savedBody);
}
