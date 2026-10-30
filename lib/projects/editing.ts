import {projectBodySchema,type ProjectBody} from './schema';
import {normalizeWorkplanBodyForSave,projectBodiesEqual} from './workplan-merge';
import {interpretProjectSaveOutcome} from './workplan-save-outcome';

export type SavedProject={body:ProjectBody;revision:number;saveId?:string};
export async function readSavedProject(id:string,saveId?:string):Promise<SavedProject>{
  const response=await fetch(`/api/admin/projects/${id}${saveId?"?saveId="+encodeURIComponent(saveId):""}`,{cache:'no-store',signal:AbortSignal.timeout(20000)});
  const json=await response.json();
  const body=projectBodySchema.safeParse(json.body);
  if(!response.ok||!body.success||!Number.isInteger(json.revision))throw new Error(json.error||'The latest saved project could not be verified.');
  return {body:body.data,revision:json.revision,saveId:json.saveId};
}

/** The captured submission, never the changing editor body, determines an uncertain result. */
export function savedCandidateMatches(candidate:ProjectBody,expectedRevision:number,latest:SavedProject,saveId?:string){
  if(candidate.tasks.some(task=>task.edits)&&(!saveId||latest.saveId!==saveId))return false;
  return latest.revision>expectedRevision&&projectBodiesEqual(latest.body,normalizeWorkplanBodyForSave(candidate));
}

export async function submitProjectWorkplan(id:string,candidate:ProjectBody,revision:number,saveId?:string){
  const response=await fetch(`/api/admin/projects/${id}`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'save',expectedRevision:revision,body:candidate,...(saveId?{saveId}:{})}),signal:AbortSignal.timeout(20000)});
  const outcome=interpretProjectSaveOutcome(response.status,await response.json());
  if(outcome.kind==='saved'&&outcome.revision<=revision)throw new Error('The returned saved revision could not be verified. Check save status before retrying.');
  return outcome;
}
