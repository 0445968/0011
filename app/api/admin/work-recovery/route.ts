import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';
export const dynamic='force-dynamic';
export async function GET(){
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access required.'},access.status);
 const result=await access.client.from('staff_work_recovery_preferences').select('retention_days').eq('staff_id',access.user.id).maybeSingle();
 return result.error?adminReply({error:'Recovery preferences unavailable.'},503):adminReply({retentionDays:result.data?.retention_days??30});
}
export async function POST(request:Request){
 if(!isSameOrigin(request))return adminReply({error:'Use the workspace.'},403);
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access required.'},access.status);
 let raw;try{raw=await readAdminJson(request,2048);}catch{return adminReply({error:'Invalid preference.'},400);}
 const parsed=z.object({retentionDays:z.union([z.literal(1),z.literal(7),z.literal(14),z.literal(30),z.literal(60)])}).strict().safeParse(raw);
 if(!parsed.success)return adminReply({error:'Choose a recovery retention period.'},400);
 const result=await access.client.from('staff_work_recovery_preferences').upsert({staff_id:access.user.id,retention_days:parsed.data.retentionDays},{onConflict:'staff_id'});
 return result.error?adminReply({error:'Preference could not save.'},503):adminReply({retentionDays:parsed.data.retentionDays});
}
