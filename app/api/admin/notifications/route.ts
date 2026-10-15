import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply, isSameOrigin, readAdminJson} from '@/lib/admin/http';
export const dynamic = 'force-dynamic';
const mutation = z.discriminatedUnion('action', [
 z.object({action:z.literal('read'), key:z.string().min(1).max(500), read:z.boolean()}).strict(),
 z.object({action:z.literal('read_all')}).strict(),
 z.object({action:z.literal('preferences'), tasks:z.boolean(), deadlines:z.boolean(), approvals:z.boolean(), timezone:z.string().min(1).max(100)}).strict(),
]);
export async function GET(request:Request) {
 const access=await getStaffAccess();
 if(!access.allowed) return adminReply({error:'Staff sign-in required.'},access.status);
 const p=new URL(request.url).searchParams;
 const category=p.get('category')||'all';
 if(!['all','tasks','deadlines','approvals'].includes(category)) return adminReply({error:'Invalid category.'},400);
 const result=await access.client.rpc('staff_notifications_feed', {
  p_page:Math.max(1,Math.min(100000,Math.floor(Number(p.get('page'))||1))),
  p_unread:p.get('unread')==='true', p_category:category,
  p_limit:Math.max(1,Math.min(25,Math.floor(Number(p.get('limit'))||25))),
 });
 return result.error ? adminReply({error:'Notifications could not load. Check migration 026.'},503) : adminReply(result.data);
}
export async function POST(request:Request) {
 if(!isSameOrigin(request)) return adminReply({error:'Use the staff workspace.'},403);
 const access=await getStaffAccess();
 if(!access.allowed) return adminReply({error:'Staff sign-in required.'},access.status);
 let data:z.infer<typeof mutation>;
 try {data=mutation.parse(await readAdminJson(request));}
 catch {return adminReply({error:'Check the notification settings.'},400);}
 const result=data.action==='preferences'
  ? await access.client.rpc('save_staff_notification_preferences',{p_tasks:data.tasks,p_deadlines:data.deadlines,p_approvals:data.approvals,p_timezone:data.timezone})
  : await access.client.rpc('set_staff_notification_read',{p_key:data.action==='read'?data.key:null,p_read:data.action==='read'?data.read:true});
 if(result.error) return adminReply({error:result.error.code==='22023'?'The item is no longer available or the timezone is invalid. Refresh and retry.':'Notifications could not be saved.'},result.error.code==='22023'?400:503);
 return adminReply({saved:true});
}
