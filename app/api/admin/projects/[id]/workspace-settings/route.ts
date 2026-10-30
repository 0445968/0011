import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';

const command=z.object({timezone:z.string().min(1).max(100),revision:z.number().int().positive()}).strict();

export async function GET(_request:Request,{params}:{params:{id:string}}){
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access required.'},access.status);
 if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
 const {data,error}=await access.client.from('project_workspace_settings').select('timezone,revision').eq('request_id',params.id).maybeSingle();
 if(error)return adminReply({error:'Project timezone settings could not load.'},503);
 return adminReply(data??{timezone:'America/Chicago',revision:1});
}

export async function POST(request:Request,{params}:{params:{id:string}}){
 if(!isSameOrigin(request))return adminReply({error:'Use the Bivi project workspace.'},403);
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access required.'},access.status);
 if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
 let raw:unknown;try{raw=await readAdminJson(request,4000);}catch{return adminReply({error:'Invalid project timezone settings.'},400);}
 const parsed=command.safeParse(raw);if(!parsed.success)return adminReply({error:'Choose a valid project timezone.'},400);
 const {data,error}=await access.client.rpc('set_project_workspace_timezone',{p_request:params.id,p_timezone:parsed.data.timezone,p_revision:parsed.data.revision});
 if(error)return adminReply({error:error.code==='22023'?'Choose a valid IANA timezone.':'Project timezone could not be saved.'},error.code==='42501'?403:error.code==='22023'?400:503);
 if(data?.result!=='saved')return adminReply({error:data?.result==='conflict'?'Project settings changed. Reload and try again.':data?.result==='locked'?'This project is read-only.':'Project not found.'},data?.result==='locked'||data?.result==='conflict'?409:404);
 return adminReply({saved:true,timezone:parsed.data.timezone,revision:data.revision});
}
