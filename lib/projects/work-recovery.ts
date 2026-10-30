import {workplanDraftBodySchema} from './workplan-draft-schema';
import type {ProjectBody} from './schema';
export type RecoveryDraft={body:ProjectBody;baseBody:ProjectBody|null;baseRevision:number;updatedAt:string};
type Checkpoint=RecoveryDraft&{expiresAt:number;discarded?:boolean};
export const recoveryKey=(staffId:string,projectId:string)=>'bivi:work-recovery:v1:'+staffId+':'+projectId;
export function readCheckpoint(storage:Storage,key:string,now=Date.now(),days=60):Checkpoint|null{
 try{const value=JSON.parse(storage.getItem(key)||'null');if(!value)return null;
  if(!Number.isFinite(value.expiresAt)||Math.min(value.expiresAt,Date.parse(value.updatedAt)+days*86400000)<=now){storage.removeItem(key);return null;}
  if(!Number.isInteger(value.baseRevision)||!Number.isFinite(Date.parse(value.updatedAt))||!workplanDraftBodySchema.safeParse(value.body).success||value.baseBody&&!workplanDraftBodySchema.safeParse(value.baseBody).success)return null;
  return value;
 }catch{return null;}
}
export function writeCheckpoint(storage:Storage,key:string,draft:RecoveryDraft,days=30,discarded=false){
 storage.setItem(key,JSON.stringify({...draft,discarded,expiresAt:Date.now()+days*86400000}));
}
