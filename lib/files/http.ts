import 'server-only';
import {z} from 'zod';import {getStaffAccess} from '@/lib/admin/auth';import {getClientAccess} from '@/lib/portal/auth';import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';import {FILE_BUCKET,fileCommandSchema} from './schema';
export async function fileCommand(request:Request,id:string,staff:boolean){
 if(!isSameOrigin(request))return adminReply({error:'Use the project file workspace.'},403);
 const access=await (staff?getStaffAccess():getClientAccess());if(!access.allowed)return adminReply({error:'Sign-in is required.'},access.status);
 if(!z.string().uuid().safeParse(id).success)return adminReply({error:'Project not found.'},404);
 let raw:unknown;try{raw=await readAdminJson(request,4096);}catch{return adminReply({error:'File details could not be read.'},400);}
 const parsed=fileCommandSchema.safeParse(raw);if(!parsed.success)return adminReply({error:'Check the file name, type, size and action.'},400);
 const command=parsed.data;if(!staff&&!['reserve','finalize'].includes(command.action))return adminReply({error:'Staff access is required.'},403);
 try{
  const {data,error}=await access.client.rpc('manage_project_file',{p_request_id:id,p_command:command});
  if(error)return adminReply({error:'The file action could not be saved.'},error.code==='42501'?403:error.code==='22023'?400:503);
  if(data?.result==='reserved'){
   const signed=await access.client.storage.from(FILE_BUCKET).createSignedUploadUrl(data.path,{upsert:false});
   if(signed.error||!signed.data)return adminReply({error:'Upload authorization failed. Check Storage setup before retrying.'},503);
   return adminReply({id:data.id,signedUrl:signed.data.signedUrl});
  }
  if(data?.result==='saved')return adminReply({saved:true});
  const messages:Record<string,string>={conflict:'The file changed or the upload expired. Reload before continuing.',not_found:'Project file not found.',limit:'The upload limit was reached. Contact Bivi for assistance.',not_uploaded:'The upload has not reached storage. Retry finishing after the upload completes.',mismatch:'The stored file does not match its reservation. Ask staff to withdraw it and upload again.'};
  return adminReply({error:messages[data?.result]||'The result could not be confirmed. Reload before retrying.'},data?.result==='not_found'?404:data?.result==='limit'?429:data?.result in messages?409:503);
 }catch{return adminReply({error:'The result could not be confirmed. Reload before retrying.'},503);}
}
export async function fileDownload(request:Request,projectId:string,fileId:string,staff:boolean){
 if(!isSameOrigin(request))return adminReply({error:'Download from the project workspace.'},403);
 const access=await (staff?getStaffAccess():getClientAccess());if(!access.allowed)return adminReply({error:'Sign-in is required.'},access.status);
 if(!z.string().uuid().safeParse(projectId).success||!z.string().uuid().safeParse(fileId).success)return adminReply({error:'File not found.'},404);
 try{
  const {data,error}=await access.client.from('project_files').select('object_path,filename,state').eq('request_id',projectId).eq('id',fileId).maybeSingle();
  if(error)return adminReply({error:'File access could not be checked.'},503);
  if(!data||data.state!=='ready')return adminReply({error:'File not found.'},404);
  const signed=await access.client.storage.from(FILE_BUCKET).createSignedUrl(data.object_path,60,{download:data.filename});
  if(signed.error||!signed.data)return adminReply({error:'The download could not be authorized.'},503);
  return adminReply({url:signed.data.signedUrl});
 }catch{return adminReply({error:'The download could not be authorized.'},503);}
}
