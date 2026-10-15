import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply} from '@/lib/admin/http';
export const dynamic='force-dynamic';
export async function GET(request:Request){const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff sign-in required.'},access.status);const params=new URL(request.url).searchParams;const result=await access.client.rpc('staff_assignment_options',{p_search:(params.get('q')||'').slice(0,100),p_page:Math.max(1,Math.min(10000,Math.floor(Number(params.get('page'))||1)))});return result.error?adminReply({error:'Staff accounts could not load. Check migration 024.'},503):adminReply(result.data);}
