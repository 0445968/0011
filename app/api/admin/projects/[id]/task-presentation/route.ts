import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';
import {revalidateProjectSurfaces} from '@/lib/projects/revalidate';
const colors=z.enum(['gray','blue','purple','green','yellow','orange','red','pink','cyan']);
const command=z.discriminatedUnion('action',[
 z.object({action:z.literal('assign'),taskId:z.string().min(1).max(100),tags:z.array(z.string().trim().min(1).max(40)).max(20),revision:z.number().int().positive(),projectRevision:z.number().int().positive(),newTag:z.object({label:z.string().trim().min(1).max(40),color:colors}).strict().optional()}).strict(),
 z.object({action:z.literal('catalog'),tagKey:z.string().min(1).max(40),label:z.string().trim().min(1).max(40),color:colors,projectRevision:z.number().int().positive()}).strict(),
]);
export async function GET(_request:Request,{params}:{params:{id:string}}){
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access required.'},access.status);
 if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
 const [rows,catalog]=await Promise.all([
  access.client.from('project_task_presentation').select('task_id,code,tags,revision').eq('request_id',params.id).order('sequence_number'),
  access.client.from('project_task_tag_catalog').select('tag_key,label,color').eq('request_id',params.id).order('label'),
 ]);
 if(rows.error||catalog.error)return adminReply({error:'Task references and tags could not load. Check the task presentation migration.'},503);
 return adminReply({rows:rows.data??[],catalog:catalog.data??[]});
}
export async function POST(request:Request,{params}:{params:{id:string}}){
 if(!isSameOrigin(request))return adminReply({error:'Use Bivi to update tags.'},403);
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access required.'},access.status);
 if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
 let raw:unknown;try{raw=await readAdminJson(request,8000);}catch{return adminReply({error:'Invalid tags.'},400);}
 const parsed=command.safeParse(raw);if(!parsed.success)return adminReply({error:'Check the task tag fields.'},400);
 const c=parsed.data;
 const result=c.action==='assign'
  ? await access.client.rpc('set_project_task_tags_with_catalog',{p_request:params.id,p_task:c.taskId,p_tags:c.tags,p_revision:c.revision,p_project_revision:c.projectRevision,p_new_tag_label:c.newTag?.label??null,p_new_tag_color:c.newTag?.color??'gray'})
  : await access.client.rpc('update_project_task_tag',{p_request:params.id,p_project_revision:c.projectRevision,p_tag_key:c.tagKey,p_label:c.label,p_color:c.color});
 if(result.error)return adminReply({error:result.error.code==='23505'?'A tag with this name already exists.':'Tags could not be saved.'},result.error.code==='42501'?403:['22023','23505'].includes(result.error.code)?400:503);
 const data=result.data;
 if(data?.result&&data.result!=='saved')return adminReply({error:data.result==='conflict'?'Tags or project changed. Refresh and review before retrying.':data.result==='locked'?'This project is read-only. Reopen or reactivate it before editing tags.':c.action==='assign'?'Save the task before assigning tags.':'Tag not found.'},409);
 revalidateProjectSurfaces(params.id);return adminReply({saved:true,revision:data?.revision});
}
