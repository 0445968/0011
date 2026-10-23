import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';
import {revalidateProjectSurfaces} from '@/lib/projects/revalidate';
const command=z.object({taskId:z.string().min(1).max(100),tags:z.array(z.string().trim().min(1).max(40)).max(20),revision:z.number().int().positive(),projectRevision:z.number().int().positive()}).strict();
export async function GET(_request:Request,{params}:{params:{id:string}}){
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access required.'},access.status);
 if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
 const {data,error}=await access.client.from('project_task_presentation').select('task_id,code,tags,revision').eq('request_id',params.id).order('sequence_number');
 if(error)return adminReply({error:'Task references and tags could not load. Check the task presentation migration.'},503);
 return adminReply({rows:data??[]});
}
export async function POST(request:Request,{params}:{params:{id:string}}){
 if(!isSameOrigin(request))return adminReply({error:'Use Bivi to update tags.'},403);
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access required.'},access.status);
 if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
 let raw:unknown;try{raw=await readAdminJson(request,8000);}catch{return adminReply({error:'Invalid tags.'},400);}
 const parsed=command.safeParse(raw);if(!parsed.success)return adminReply({error:'Use up to 20 tags, each 1–40 characters.'},400);
 const c=parsed.data;
 const {data,error}=await access.client.rpc('set_project_task_tags',{p_request:params.id,p_task:c.taskId,p_tags:c.tags,p_revision:c.revision,p_project_revision:c.projectRevision});
 if(error)return adminReply({error:'Tags could not be saved.'},error.code==='42501'?403:error.code==='22023'?400:503);
 if(data?.result!=='saved')return adminReply({error:data?.result==='conflict'?'Tags or project changed. Refresh and review before retrying.':data?.result==='locked'?'This project is read-only. Reopen or reactivate it before editing tags.':'Save the task before assigning tags.'},409);
 revalidateProjectSurfaces(params.id);return adminReply({saved:true,revision:data.revision});
}
