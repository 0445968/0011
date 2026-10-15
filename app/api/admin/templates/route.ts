import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';
import {templateCommand} from '@/lib/templates/schema';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 if(!isSameOrigin(request))return adminReply({error:'Use the staff workspace.'},403);
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff sign-in required.'},access.status);
 let command;try{command=templateCommand.parse(await readAdminJson(request,196608));}catch{return adminReply({error:'Check the template fields and change note.'},400);}
 try {
 const result=await access.client.rpc('manage_staff_template',{p_command:command});
 if(result.error)return adminReply({error:result.error.code==='42501'?'Only the owner can change this template.':'The template could not be saved.'},result.error.code==='42501'?403:result.error.code==='22023'?400:503);
 if(result.data?.result==='not_found')return adminReply({error:'Template unavailable.'},404);
 if(result.data?.result==='conflict'||result.data?.result==='locked')return adminReply({error:result.data.result==='locked'?'Restore this archived template before editing.':'This template changed. Reload before saving.'},409);
 return result.data?.result==='saved'?adminReply(result.data):adminReply({error:'The result could not be confirmed. Reload before retrying.'},503);
 } catch { return adminReply({error:'The result could not be confirmed. Reload before retrying.'},503); }
}
