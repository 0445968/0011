export type ReviewStates=Record<string,'in_review'|'rejected'|'accepted'>;
export function taskDisplayState(task:{id:string;status:string},reviews:ReviewStates={}){
 return task.status==='done'?'done':reviews[task.id]==='in_review'?'in_review':reviews[task.id]==='rejected'?'rejected':task.status;
}
