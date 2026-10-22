import {projectBodySchema,type ProjectBody} from './schema';
import {normalizeWorkplanBodyForSave,projectBodiesEqual} from './workplan-merge';
import {interpretProjectSaveOutcome} from './workplan-save-outcome';

export type SavedProject={body:ProjectBody;revision:number};
export async function readSavedProject(id:string):Promise<SavedProject>{
  const response=await fetch(`/api/admin/projects/${id}`,{cache:'no-store',signal:AbortSignal.timeout(20000)});
  const json=await response.json();
  const body=projectBodySchema.safeParse(json.body);
  if(!response.ok||!body.success||!Number.isInteger(json.revision))throw new Error(json.error||'The latest saved project could not be verified.');
  return {body:body.data,revision:json.revision};
}

/** The captured submission, never the changing editor body, determines an uncertain result. */
export function savedCandidateMatches(candidate:ProjectBody,expectedRevision:number,latest:SavedProject){
  return latest.revision>expectedRevision&&projectBodiesEqual(latest.body,normalizeWorkplanBodyForSave(candidate));
}

export async function submitProjectWorkplan(id:string,candidate:ProjectBody,revision:number){
  const response=await fetch(`/api/admin/projects/${id}`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'save',expectedRevision:revision,body:candidate}),signal:AbortSignal.timeout(20000)});
  const outcome=interpretProjectSaveOutcome(response.status,await response.json());
  if(outcome.kind==='saved'&&outcome.revision<=revision)throw new Error('The returned saved revision could not be verified. Check save status before retrying.');
  return outcome;
}
