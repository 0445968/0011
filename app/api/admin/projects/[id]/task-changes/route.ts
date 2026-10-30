import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';
import {revalidateProjectSurfaces} from '@/lib/projects/revalidate';
import {revalidatePath} from 'next/cache';
const command=z.object({proposalId:z.string().uuid(),version:z.number().int().positive(),decision:z.enum(['accept','reject']),note:z.string().trim().max(2000)}).strict();
export async function GET(request:Request,{params}:{params:{id:string}}){
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access required.'},access.status);
 if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
 const proposalId=new URL(request.url).searchParams.get('proposalId');if(proposalId&&!z.string().uuid().safeParse(proposalId).success)return adminReply({error:'Proposal not found.'},404);
 let query=access.client.from('project_task_change_proposals').select('id,task_id,version,created_by,owning_side,base_task,candidate_task,base_settings,status,submitted_at,reviewed_at,review_note').eq('request_id',params.id).order('submitted_at',{ascending:false}).limit(100);
 query=proposalId?query.eq('id',proposalId):query.in('status',['pending','rejected']);
 const [authority,proposals,members]=await Promise.all([access.client.rpc('staff_project_task_authority',{p_request:params.id}),query,access.client.rpc('staff_project_assignment_workspace',{p_request:params.id})]);
 if(authority.error||proposals.error||members.error)return adminReply({error:'Task ownership and proposals could not load.'},503);
 const people=[...(members.data?.staff??[]),...(members.data?.clients??[])];
 return adminReply({authority:authority.data,proposals:proposals.data??[],proposerLabels:Object.fromEntries(people.map((person:{id:string;label:string})=>[person.id,person.label]))});
}
export async function POST(request:Request,{params}:{params:{id:string}}){
 if(!isSameOrigin(request))return adminReply({error:'Use the Bivi workspace.'},403);
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access required.'},access.status);
 if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
 let raw:unknown;try{raw=await readAdminJson(request,4096);}catch{return adminReply({error:'Review could not be read.'},400);}
 const parsed=command.safeParse(raw);if(!parsed.success)return adminReply({error:'Choose a proposal and review decision.'},400);
 const c=parsed.data;const {data,error}=await access.client.rpc('review_project_task_change',{p_request:params.id,p_proposal:c.proposalId,p_version:c.version,p_decision:c.decision,p_note:c.note});
 if(error)return adminReply({error:error.code==='42501'?'Only a workspace admin can accept or reject task changes.':error.code==='22023'?'Add a comment when rejecting changes.':error.message||'Task changes could not be applied.'},error.code==='42501'?403:error.code==='22023'?400:422);
 if(data?.result==='stale')return adminReply({error:'The saved task or its settings changed after submission. Ask the author to refresh and resubmit; this proposal has not been applied.'},409);
 if(data?.result!=='saved')return adminReply({error:'This proposal changed or is no longer pending. Refresh it before reviewing.'},409);
 revalidateProjectSurfaces(params.id);revalidatePath('/approvals');return adminReply({saved:true});
}
