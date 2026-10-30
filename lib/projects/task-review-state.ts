export type ReviewStates=Record<string,'in_review'|'rejected'|'accepted'>;
export function taskDisplayState(task:{id:string;status:string},reviews:ReviewStates={}){
 return task.status==='done'?'done':task.status==='in_review'||task.status==='rejected'?task.status:reviews[task.id]==='in_review'?'in_review':reviews[task.id]==='rejected'?'rejected':task.status;
}
