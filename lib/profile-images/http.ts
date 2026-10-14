import 'server-only';
import {z} from 'zod';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';
import type {StaffAccess} from '@/lib/admin/auth';
import {validProfilePng,MAX_IMAGE_BYTES} from './png';
const targetSchema=z.object({kind:z.enum(['person','company','staff','client']),subject:z.string().regex(/^(?:[1-9]\d{0,8}|[a-f0-9-]{36})$/)});
export async function imageRequest(request:Request,access:StaffAccess,clientOnly=false){
 if(!access.allowed)return adminReply({error:'Sign-in required.'},access.status);
 const target=targetSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!target.success)return adminReply({error:'Invalid image target.'},400);const {kind,subject}=target.data;
 if(clientOnly&&(kind!=='client'||subject!==access.user.id))return adminReply({error:'Image access denied.'},403);
 const args={p_kind:kind,p_subject:subject};
 try{
 if(request.method==='GET'){const lookup=await access.client.rpc('get_profile_image',args);if(lookup.error||!lookup.data)return new Response(null,{status:404,headers:{'Cache-Control':'no-store'}});const file=await access.client.storage.from('bivi-profile-images').download(lookup.data);if(file.error||!file.data)throw new Error('Image unavailable.');const bytes=new Uint8Array(await file.data.arrayBuffer());if(!validProfilePng(bytes))throw new Error('Invalid image.');return new Response(bytes,{headers:{'Content-Type':'image/png','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});}
 if(!isSameOrigin(request))return adminReply({error:'Use your Bivi account.'},403);
 if(request.method==='DELETE'){const input=z.object({expected:z.string().max(200).nullable()}).strict().parse(await readAdminJson(request,1024));const result=await access.client.rpc('commit_profile_image',{...args,p_expected:input.expected,p_path:null});if(result.error)throw result.error;if(result.data?.result==='conflict')return adminReply({error:'Image changed. Reload before retrying.'},409);return adminReply({saved:true,path:null});}
 if(request.headers.get('content-type')!=='image/png'||Number(request.headers.get('content-length'))>MAX_IMAGE_BYTES||!request.body)return adminReply({error:'Upload a PNG up to 2 MB.'},400);
 const reader=request.body.getReader(),chunks:Uint8Array[]=[];let length=0;try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>MAX_IMAGE_BYTES){await reader.cancel();throw new Error('Image too large.');}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=Buffer.concat(chunks);if(!validProfilePng(bytes))return adminReply({error:'Use a valid image resized to 512 pixels.'},400);
 const reserve=await access.client.rpc('reserve_profile_image',args);if(reserve.error||!reserve.data)throw new Error('Image upload limit or access restriction.');const path=reserve.data;
 const upload=await access.client.storage.from('bivi-profile-images').upload(path,bytes,{contentType:'image/png',upsert:false});if(upload.error)throw new Error('Image upload failed.');
 const result=await access.client.rpc('commit_profile_image',{...args,p_expected:request.headers.get('x-image-expected')||null,p_path:path});if(result.error)throw new Error('Image could not be saved.');if(result.data?.result==='conflict')return adminReply({error:'Image changed. Reload before retrying.'},409);if(result.data?.result!=='saved')throw new Error('Save not confirmed.');return adminReply({saved:true,path});
 }catch{return adminReply({error:'Image could not be saved or loaded. Check access, upload limits and migration 020; reload before retrying.'},503);}
}
