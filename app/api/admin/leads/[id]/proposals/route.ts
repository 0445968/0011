import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';
import {proposalCommandSchema} from '@/lib/proposals/schema';
export async function POST(request:Request,{params}:{params:{id:string}}){
  if(!isSameOrigin(request))return adminReply({error:'Use the Bivi workspace to save proposals.'},403);
  const access=await getStaffAccess();
  if(!access.allowed)return adminReply({error:'Staff access is required.'},access.status);
  if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Inquiry not found.'},404);
  let raw:unknown;try{raw=await readAdminJson(request,65536);}catch{return adminReply({error:'The proposal request could not be read.'},400);}
  const parsed=proposalCommandSchema.safeParse(raw);
  if(!parsed.success)return adminReply({error:'Check the proposal fields and required acceptance details.'},400);
  try{
    const {data,error}=await access.client.rpc('manage_inquiry_proposal',{p_request_id:params.id,p_command:parsed.data});
    if(error)return adminReply({error:error.code==='22023'?'Complete the scope, inputs, revisions, schedule and fee terms before issuing; check acceptance details.':'The proposal could not be saved.'},error.code==='42501'?403:error.code==='22023'?400:503);
    const errors:Record<string,[number,string]>={conflict:[409,'This proposal changed. Reload before continuing.'],not_found:[404,'Inquiry or proposal not found.'],not_qualified:[409,'Qualify the inquiry before creating or issuing a proposal.'],locked:[409,'This version is fixed. Reload to see the current workflow.']};
    if(errors[data?.result]){const [status,message]=errors[data.result];return adminReply({error:message},status);}
    if(data?.result!=='saved')return adminReply({error:'The proposal result could not be confirmed.'},503);
    return adminReply({version:data.version,revision:data.revision});
  }catch{return adminReply({error:'The proposal could not be confirmed. Reload before retrying.'},503);}
}
