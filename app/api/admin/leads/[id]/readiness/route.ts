import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';
import {readinessCommandSchema} from '@/lib/onboarding/schema';
export async function POST(request:Request,{params}:{params:{id:string}}){
 if(!isSameOrigin(request))return adminReply({error:'Use the Bivi workspace to update readiness.'},403);
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access is required.'},access.status);
 if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Inquiry not found.'},404);
 let raw:unknown;try{raw=await readAdminJson(request,24576);}catch{return adminReply({error:'The readiness request could not be read.'},400);}
 const parsed=readinessCommandSchema.safeParse(raw);if(!parsed.success)return adminReply({error:'Check the dates, amount, currency and record fields.'},400);
 try{
  const {data,error}=await access.client.rpc('manage_inquiry_readiness',{p_request_id:params.id,p_command:parsed.data});
  if(error)return adminReply({error:error.code==='22023'?'Check the record dates and required evidence. Dates cannot be in the future.':'Readiness could not be saved.'},error.code==='42501'?403:error.code==='22023'?400:503);
  const failures:Record<string,[number,string]>={conflict:[409,'This record changed. Reload before continuing.'],not_found:[404,'Inquiry or readiness record not found.'],no_accepted_scope:[409,'An accepted proposal is required first.'],locked:[409,'Place readiness on hold before editing these records.'],incomplete:[400,'Save a signed agreement and received deposit or explicit waiver first.'],not_qualified:[409,'The inquiry must be qualified before releasing onboarding readiness.']};
  if(failures[data?.result]){const [status,error]=failures[data.result];return adminReply({error},status);}
  if(data?.result!=='saved')return adminReply({error:'Readiness could not be confirmed. Reload before retrying.'},503);
  return adminReply({revision:data.revision});
 }catch{return adminReply({error:'Readiness could not be confirmed. Reload before retrying.'},503);}
}
