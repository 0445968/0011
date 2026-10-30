import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';
import {revalidateProjectSurfaces} from '@/lib/projects/revalidate';

const command=z.object({taskId:z.string().trim().min(1).max(100),requiresStaffReview:z.boolean(),requiresClientReview:z.boolean(),expectedControlRevision:z.number().int().positive(),expectedProjectRevision:z.number().int().positive()}).strict();
export async function POST(request:Request,{params}:{params:{id:string}}){
 if(!isSameOrigin(request))return adminReply({error:'Use the Bivi workspace.'},403);
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access is required.'},access.status);
 if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
 let raw:unknown;try{raw=await readAdminJson(request,4096);}catch{return adminReply({error:'The task review setting could not be read.'},400);}
 const parsed=command.safeParse(raw);if(!parsed.success)return adminReply({error:'Choose valid task review settings.'},400);
 const {data,error}=await access.client.rpc('set_project_task_review_policy',{p_request:params.id,p_task:parsed.data.taskId,p_requires_staff:parsed.data.requiresStaffReview,p_requires_client:parsed.data.requiresClientReview,p_control_revision:parsed.data.expectedControlRevision,p_project_revision:parsed.data.expectedProjectRevision});
 if(error)return adminReply({error:error.code==='42501'?'Only a designated workspace admin can change task review requirements.':error.code==='23514'?'Reopen the completed task before changing its review requirement.':'Task review settings could not be saved.'},error.code==='42501'?403:error.code==='22023'?400:503);
 if(data?.result==='conflict')return adminReply({error:'The task changed. Refresh it before changing review requirements.',code:'revision_conflict'},409);
 if(data?.result==='locked')return adminReply({error:'Review settings cannot be changed on an inactive or completed project.'},409);
 if(data?.result==='not_found')return adminReply({error:'Task or project no longer exists.'},404);
 if(data?.result!=='saved')return adminReply({error:'Task review settings could not be confirmed.'},503);
 revalidateProjectSurfaces(params.id);return adminReply({saved:true,revision:data.revision});
}
