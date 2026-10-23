import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';
import {revalidateProjectSurfaces} from '@/lib/projects/revalidate';

export const dynamic='force-dynamic';
const commandSchema=z.object({status:z.enum(['active','on_hold','waiting_on_client','inactive']),reason:z.string().max(2000).optional().default(''),sourceKind:z.string().max(40).optional(),sourceId:z.string().max(200).optional(),expectedRevision:z.number().int().min(0),expectedProjectRevision:z.number().int().min(0)}).strict();
export async function GET(request:Request,{params}:{params:{id:string}}){
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access is required.'},access.status);
 if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
 if(new URL(request.url).searchParams.get('view')!=='waiting-sources')return adminReply({error:'Unknown operational status view.'},400);
 const {data,error}=await access.client.rpc('project_operational_waiting_sources',{p_request:params.id});
 if(error){if(error.code==='42501')return adminReply({error:'Staff access is required to load client dependencies.'},403);return adminReply({error:'Dependency list could not load. Retry the check.'},503);}
 if(data?.result==='not_found')return adminReply({error:'Project not found.'},404);
 if(data?.result!=='ok'||!Array.isArray(data.sources)||!Array.isArray(data.diagnostics))return adminReply({error:'Dependency list could not load. Retry the check.'},503);
 return adminReply({result:'ok',sources:data.sources,diagnostics:data.diagnostics});
}

export async function POST(request:Request,{params}:{params:{id:string}}){
 if(!isSameOrigin(request))return adminReply({error:'Use the Bivi workspace to change project status.'},403);
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access is required.'},access.status);
 if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
 let raw:unknown;try{raw=await readAdminJson(request,8192);}catch{return adminReply({error:'The status request could not be read.'},400);}
 const parsed=commandSchema.safeParse(raw);if(!parsed.success)return adminReply({error:'Review the status, reason and revision information.'},400);
 const {data,error}=await access.client.rpc('manage_project_operational_status',{p_request:params.id,p_command:parsed.data});
 if(error){if(error.code==='42501')return adminReply({error:'Staff access is required to change operational status.'},403);return adminReply({error:'Operational status could not be saved.'},503);}
 if(data?.result==='not_found')return adminReply({error:'Project not found.'},404);
 if(data?.result==='conflict')return adminReply({error:'Project status changed in another session. Refresh and reconcile.',result:'conflict'},409);
 if(data?.result==='invalid')return adminReply({error:data.message||'The transition details are invalid.',result:'invalid'},400);
 if(data?.result==='blocked')return adminReply({error:'This transition has outstanding requirements.',result:'blocked',blockers:data.blockers??[]},422);
 if(data?.result!=='saved'||!Number.isInteger(data.revision)||!Number.isInteger(data.projectRevision))return adminReply({error:'The saved status could not be confirmed. Refresh before retrying.'},503);
 if(!data.noop)revalidateProjectSurfaces(params.id);
 return adminReply({result:'saved',status:data.status,revision:data.revision,projectRevision:data.projectRevision,noop:Boolean(data.noop)});
}
