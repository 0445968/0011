import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply} from '@/lib/admin/http';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:{id:string}}){
 if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
 const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access required.'},access.status);
 const result=await access.client.from('staff_task_review_states').select('task_id,status').eq('request_id',params.id);
 return result.error?adminReply({error:'Review states unavailable.'},503):adminReply({states:Object.fromEntries((result.data??[]).map(row=>[row.task_id,row.status==='pending'?'in_review':row.status==='rejected'?'rejected':'accepted']))});
}
