import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';
import {companyEditSchema} from '@/lib/companies/schema';
import {listCompanies,listAssignmentProjects} from '@/lib/companies/data';
import {companyRoleSchema} from '@/lib/business/schema';
import {contactId} from '@/lib/people/schema';
export async function GET(request:Request){const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff sign-in is required.'},access.status);const p=new URL(request.url).searchParams;try{return adminReply(p.get('action')==='projects'?await listAssignmentProjects(access.client,p.get('q')||'',Number(p.get('page'))||1):await listCompanies(access.client,Object.fromEntries(p)));}catch{return adminReply({error:'The company workspace could not load. Check migration 017.'},503);}}
const person=z.object({action:z.literal('person'),id:contactId,company:z.string().uuid().nullable(),revision:z.number().int().min(1),title:z.string().trim().max(200),role:companyRoleSchema}).strict();
const project=z.object({action:z.literal('project'),id:z.string().uuid(),company:z.string().uuid().nullable(),revision:z.number().int().min(1)}).strict();
const note=z.object({action:z.literal('note'),company:z.string().uuid(),body:z.string().trim().min(1).max(4000)}).strict();
export async function POST(request:Request){if(!isSameOrigin(request))return adminReply({error:'Use the staff workspace.'},403);const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff sign-in is required.'},access.status);
 try{const raw=await readAdminJson(request,16384);const edit=companyEditSchema.safeParse(raw),p=person.safeParse(raw),r=project.safeParse(raw),n=note.safeParse(raw);let result;
 if(edit.success){const d=edit.data;result=await access.client.rpc('save_company_profile',{p_id:d.id,p_revision:d.revision,p_name:d.name,p_body:d.body});}
 else if(p.success){const d=p.data;result=await access.client.rpc('assign_person_company',{p_contact:d.id,p_company:d.company,p_title:d.title,p_role:d.role,p_revision:d.revision});}
 else if(r.success){const d=r.data;result=await access.client.rpc('assign_project_company',{p_request:d.id,p_company:d.company,p_revision:d.revision});}
 else if(n.success){result=await access.client.rpc('add_company_note',{p_company:n.data.company,p_body:n.data.body});}
 else return adminReply({error:'Check the company fields and assignment details.'},400);
 if(result.error)return adminReply({error:result.error.code==='23505'?'This company already has an active CEO. Change the existing CEO assignment first.':'The change could not be saved. Reload before retrying.'},result.error.code==='23505'?409:503);
 if(result.data?.result==='conflict')return adminReply({error:'This record changed in another session. Reload before saving.'},409);if(result.data?.result==='not_found')return adminReply({error:'Record unavailable.'},404);
 if(!n.success&&!['saved','assigned'].includes(result.data?.result))return adminReply({error:'The result could not be confirmed.'},503);return adminReply(n.success?{saved:true}:{...result.data});
 }catch{return adminReply({error:'The change could not be saved. Reload before retrying.'},400);}}
