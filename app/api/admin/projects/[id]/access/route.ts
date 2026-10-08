import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';import {getProject} from '@/lib/projects/data';import {accessOrigin,privilegedClient,reserveAuth} from '@/lib/access/server';
const command=z.discriminatedUnion('action',[
 z.object({action:z.literal('assign'),userId:z.string().uuid(),expectedRevision:z.number().int().min(0).max(99999999),active:z.boolean(),canReview:z.boolean()}).strict(),
 z.object({action:z.literal('invite'),email:z.string().trim().email().max(254),canReview:z.boolean()}).strict()
]);
export async function POST(request:Request,{params}:{params:{id:string}}){
 if(!isSameOrigin(request))return adminReply({error:'Use the project access screen.'},403);
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access is required.'},access.status);
 if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
 let raw:unknown;try{raw=await readAdminJson(request,4096);}catch{return adminReply({error:'The access request could not be read.'},400);}
 const parsed=command.safeParse(raw);if(!parsed.success)return adminReply({error:'Check the email or account ID and access options.'},400);
 let createdUserId:string|undefined;
 try{
  const {record}=await getProject(access.client,params.id);if(!record)return adminReply({error:'Project not found.'},404);
  let assignment:object,link:string|undefined;
  if(parsed.data.action==='invite'){
   const origin=accessOrigin();if(!await reserveAuth('invite',parsed.data.email))return adminReply({error:'Invitation limit reached. Try again later.'},429);
   const {data,error}=await privilegedClient().auth.admin.generateLink({type:'invite',email:parsed.data.email,options:{redirectTo:origin+'/confirm'}});
   if(error||!data.user||!data.properties?.hashed_token)return adminReply({error:'Invitation could not be prepared. For an existing account, assign its Auth account ID. Check Auth before retrying.'},409);
   createdUserId=data.user.id;assignment={userId:createdUserId,expectedRevision:0,active:true,canReview:parsed.data.canReview};
   link=origin+'/client/confirm?'+new URLSearchParams({token_hash:data.properties.hashed_token,type:'invite'});
  }else{const {action,...rest}=parsed.data;assignment=rest;}
  const {data,error}=await access.client.rpc('manage_project_client',{p_request_id:params.id,p_command:assignment});
  if(error||data?.result!=='saved')return adminReply({error:data?.result==='conflict'?'Access changed. Reload before retrying.':data?.result==='not_found'?'Project or Auth account not found.':'Access could not be confirmed. Reload and check Auth before retrying.',...(createdUserId?{userId:createdUserId}:{})},data?.result==='conflict'?409:data?.result==='not_found'?404:503);
  return adminReply({saved:true,...(link?{link,userId:createdUserId}:{})});
 }catch{return adminReply({error:'Access could not be confirmed. Reload and check Auth before retrying.',...(createdUserId?{userId:createdUserId}:{})},503);}
}
