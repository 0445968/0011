import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';
import {accessOrigin,privilegedClient,reserveAuth} from '@/lib/access/server';

const command=z.discriminatedUnion('action',[
 z.object({action:z.literal('invite'),email:z.string().trim().email().max(254),teamRole:z.enum(['staff','project_manager']).default('staff')}).strict(),
 z.object({action:z.literal('role'),userId:z.string().uuid(),admin:z.boolean()}).strict(),
 z.object({action:z.literal('team_role'),userId:z.string().uuid(),teamRole:z.enum(['staff','project_manager'])}).strict(),
 z.object({action:z.literal('active'),userId:z.string().uuid(),active:z.boolean()}).strict(),
]);
async function adminAccess(){const access=await getStaffAccess();if(!access.allowed)return {error:adminReply({error:'Staff access is required.'},access.status)};const result=await access.client.rpc('is_project_workflow_admin');if(result.error)return {error:adminReply({error:'Workspace role could not be checked.'},503)};if(result.data!==true)return {error:adminReply({error:'Only a workspace admin can manage staff access.'},403)};return {access};}
export async function GET(){
 const checked=await adminAccess();if(checked.error)return checked.error;
 try{
  const service=privilegedClient();const [{data:staff,error:staffError},{data:admins,error:adminError},{data:users,error:userError},roles,prepared]=await Promise.all([
   service.from('inquiry_staff').select('user_id,active,public_id,created_at,avatar_path').order('created_at'),
   service.from('project_workflow_override_admins').select('user_id'),
   service.auth.admin.listUsers({page:1,perPage:1000}),
   checked.access!.client.from('staff_team_roles').select('user_id,team_role'),
   checked.access!.client.from('staff_invitation_roles').select('email,team_role').order('prepared_at',{ascending:false}),
  ]);
  if(staffError||adminError||userError||roles.error||prepared.error)return adminReply({error:'Staff list could not load.'},503);
  const emailById=new Map(users.users.map(user=>[user.id,user.email??'']));const adminIds=new Set((admins??[]).map(row=>row.user_id));
  const activeEmails=new Set((staff??[]).map(row=>emailById.get(row.user_id)?.toLowerCase()));
  return adminReply({preparedInvitations:(prepared.data??[]).filter(row=>!activeEmails.has(row.email)),staff:(staff??[]).map(row=>({id:row.user_id,email:emailById.get(row.user_id)??'',active:row.active,publicId:row.public_id,createdAt:row.created_at,isAdmin:adminIds.has(row.user_id),teamRole:roles.data?.find(role=>role.user_id===row.user_id)?.team_role??'staff'}))});
 }catch{return adminReply({error:'Staff list could not load.'},503);}
}
export async function POST(request:Request){
 if(!isSameOrigin(request))return adminReply({error:'Use the Bivi workspace.'},403);
 const checked=await adminAccess();if(checked.error)return checked.error;
 let raw:unknown;try{raw=await readAdminJson(request,4096);}catch{return adminReply({error:'The staff request could not be read.'},400);}
 const parsed=command.safeParse(raw);if(!parsed.success)return adminReply({error:'Check the staff email or access setting.'},400);
 try{
  if(parsed.data.action==='invite'){
   const service=privilegedClient();const inviteEmail=parsed.data.email;
   const users=await service.auth.admin.listUsers({page:1,perPage:1000});if(users.error)return adminReply({error:'Auth accounts could not be checked.'},503);
   const existing=users.data.users.find(user=>user.email?.toLowerCase()===inviteEmail.toLowerCase());
   if(existing){
    const already=await service.from('inquiry_staff').select('user_id').eq('user_id',existing.id).maybeSingle();
    if(already.error)return adminReply({error:'Staff access could not be checked.'},503);
    if(already.data)return adminReply({error:'This account already has staff access.'},409);
   const prepared=await checked.access!.client.rpc('manage_workspace_staff_role',{p_user:null,p_action:'prepare_invite',p_value:parsed.data.teamRole,p_email:inviteEmail});
   if(prepared.error)return adminReply({error:'Invitation role could not be prepared.'},503);
    const activated=await service.from('inquiry_staff').upsert({user_id:existing.id,active:true},{onConflict:'user_id'});
    if(activated.error)return adminReply({error:'Existing Auth account could not be added to staff.'},503);

    return adminReply({saved:true,existingAccount:true});
   }
   const prepared=await checked.access!.client.rpc('manage_workspace_staff_role',{p_user:null,p_action:'prepare_invite',p_value:parsed.data.teamRole,p_email:inviteEmail});
   if(prepared.error)return adminReply({error:'Invitation role could not be prepared.'},503);
   if(!await reserveAuth('invite',inviteEmail))return adminReply({error:'Invitation limit reached. Try again later.'},429);
   const {data,error}=await service.auth.admin.generateLink({type:'invite',email:inviteEmail,options:{redirectTo:`${accessOrigin()}/confirm`}});
   if(error||!data.user||!data.properties?.hashed_token)return adminReply({error:'Invitation could not be prepared. Check the Auth account before retrying.'},409);
   const inserted=await service.from('inquiry_staff').upsert({user_id:data.user.id,active:true},{onConflict:'user_id'});
   if(inserted.error)return adminReply({error:'Auth invitation was prepared, but staff access could not be activated. Check the staff list before retrying.'},503);

   return adminReply({saved:true,inviteUrl:`${accessOrigin()}/confirm?${new URLSearchParams({token_hash:data.properties.hashed_token,type:'invite'})}`});
  }
  const change=parsed.data;
  const result=await checked.access!.client.rpc('manage_workspace_staff_role',{p_user:change.userId,p_action:change.action==='role'?'admin':change.action,p_value:change.action==='role'?String(change.admin):change.action==='active'?String(change.active):change.teamRole,p_email:null});
  if(result.error)return adminReply({error:result.error.code==='23514'?result.error.message:'Staff access could not be updated.'},result.error.code==='42501'?403:result.error.code==='23514'?409:503);
  if(result.data?.result!=='saved')return adminReply({error:'Staff account not found.'},404);
  return adminReply({saved:true});
 }catch{return adminReply({error:'The staff change could not be confirmed. Reload staff settings before retrying.'},503);}
}
