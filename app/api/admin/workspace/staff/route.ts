import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';
import {accessOrigin,privilegedClient,reserveAuth} from '@/lib/access/server';

const command=z.discriminatedUnion('action',[
 z.object({action:z.literal('invite'),email:z.string().trim().email().max(254)}).strict(),
 z.object({action:z.literal('role'),userId:z.string().uuid(),admin:z.boolean()}).strict(),
 z.object({action:z.literal('active'),userId:z.string().uuid(),active:z.boolean()}).strict(),
]);
async function adminAccess(){const access=await getStaffAccess();if(!access.allowed)return {error:adminReply({error:'Staff access is required.'},access.status)};const result=await access.client.rpc('is_project_workflow_admin');if(result.error)return {error:adminReply({error:'Workspace role could not be checked.'},503)};if(result.data!==true)return {error:adminReply({error:'Only a workspace admin can manage staff access.'},403)};return {access};}
export async function GET(){
 const checked=await adminAccess();if(checked.error)return checked.error;
 try{
  const service=privilegedClient();const [{data:staff,error:staffError},{data:admins,error:adminError},{data:users,error:userError}]=await Promise.all([
   service.from('inquiry_staff').select('user_id,active,public_id,created_at,avatar_path').order('created_at'),
   service.from('project_workflow_override_admins').select('user_id'),
   service.auth.admin.listUsers({page:1,perPage:1000}),
  ]);
  if(staffError||adminError||userError)return adminReply({error:'Staff list could not load.'},503);
  const emailById=new Map(users.users.map(user=>[user.id,user.email??'']));const adminIds=new Set((admins??[]).map(row=>row.user_id));
  return adminReply({staff:(staff??[]).map(row=>({id:row.user_id,email:emailById.get(row.user_id)??'',active:row.active,publicId:row.public_id,createdAt:row.created_at,isAdmin:adminIds.has(row.user_id)}))});
 }catch{return adminReply({error:'Staff list could not load.'},503);}
}
export async function POST(request:Request){
 if(!isSameOrigin(request))return adminReply({error:'Use the Bivi workspace.'},403);
 const checked=await adminAccess();if(checked.error)return checked.error;
 let raw:unknown;try{raw=await readAdminJson(request,4096);}catch{return adminReply({error:'The staff request could not be read.'},400);}
 const parsed=command.safeParse(raw);if(!parsed.success)return adminReply({error:'Check the staff email or access setting.'},400);
 const actor=checked.access.user.id;const service=privilegedClient();
 try{
  if(parsed.data.action==='invite'){
   const inviteEmail=parsed.data.email;
   const users=await service.auth.admin.listUsers({page:1,perPage:1000});if(users.error)return adminReply({error:'Auth accounts could not be checked.'},503);
   const existing=users.data.users.find(user=>user.email?.toLowerCase()===inviteEmail.toLowerCase());
   if(existing){
    const already=await service.from('inquiry_staff').select('user_id').eq('user_id',existing.id).maybeSingle();
    if(already.error)return adminReply({error:'Staff access could not be checked.'},503);
    if(already.data)return adminReply({error:'This account already has staff access.'},409);
    const activated=await service.from('inquiry_staff').upsert({user_id:existing.id,active:true},{onConflict:'user_id'});
    if(activated.error)return adminReply({error:'Existing Auth account could not be added to staff.'},503);
    await service.from('staff_workspace_role_history').insert({user_id:existing.id,action:'invited',actor,detail:{email:inviteEmail.toLowerCase(),existingAuthAccount:true}});
    return adminReply({saved:true,existingAccount:true});
   }
   if(!await reserveAuth('invite',inviteEmail))return adminReply({error:'Invitation limit reached. Try again later.'},429);
   const {data,error}=await service.auth.admin.generateLink({type:'invite',email:inviteEmail,options:{redirectTo:`${accessOrigin()}/confirm`}});
   if(error||!data.user||!data.properties?.hashed_token)return adminReply({error:'Invitation could not be prepared. Check the Auth account before retrying.'},409);
   const inserted=await service.from('inquiry_staff').upsert({user_id:data.user.id,active:true},{onConflict:'user_id'});
   if(inserted.error)return adminReply({error:'Auth invitation was prepared, but staff access could not be activated. Check the staff list before retrying.'},503);
   await service.from('staff_workspace_role_history').insert({user_id:data.user.id,action:'invited',actor,detail:{email:inviteEmail.toLowerCase()}});
   return adminReply({saved:true,inviteUrl:`${accessOrigin()}/confirm?${new URLSearchParams({token_hash:data.properties.hashed_token,type:'invite'})}`});
  }
  const change=parsed.data;
  const current=await service.from('project_workflow_override_admins').select('user_id');if(current.error)return adminReply({error:'Workspace roles could not load.'},503);
  const currentlyAdmin=current.data.some(row=>row.user_id===change.userId);
  const activeAdmins=await service.from('inquiry_staff').select('user_id').eq('active',true).in('user_id',current.data.map(row=>row.user_id));
  if(activeAdmins.error)return adminReply({error:'Workspace roles could not load.'},503);
  if(change.action==='role'&&change.admin){const target=await service.from('inquiry_staff').select('active').eq('user_id',change.userId).maybeSingle();if(target.error||target.data?.active!==true)return adminReply({error:'Activate the staff account before granting admin access.'},409);}
  if(((change.action==='role'&&currentlyAdmin&&!change.admin)||(change.action==='active'&&currentlyAdmin&&!change.active))&&activeAdmins.data.length<=1)return adminReply({error:'Keep at least one active workspace admin.'},409);
  if(change.action==='role'){
   const result=change.admin?await service.from('project_workflow_override_admins').upsert({user_id:change.userId,granted_by:actor},{onConflict:'user_id'}):await service.from('project_workflow_override_admins').delete().eq('user_id',change.userId);
   if(result.error)return adminReply({error:'Workspace role could not be saved.'},503);
   await service.from('staff_workspace_role_history').insert({user_id:change.userId,action:change.admin?'admin_granted':'admin_removed',actor});
  }else{
   const result=await service.from('inquiry_staff').update({active:change.active}).eq('user_id',change.userId).select('user_id').maybeSingle();
   if(result.error||!result.data)return adminReply({error:'Staff access could not be updated.'},503);
   await service.from('staff_workspace_role_history').insert({user_id:change.userId,action:change.active?'activated':'deactivated',actor});
  }
  return adminReply({saved:true});
 }catch{return adminReply({error:'The staff change could not be confirmed. Reload staff settings before retrying.'},503);}
}
