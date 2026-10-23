import {z} from 'zod';
import {getStaffAccess} from '@/lib/admin/auth';
import {adminReply,isSameOrigin,readAdminJson} from '@/lib/admin/http';
import {meetingCommandSchema} from '@/lib/projects/meeting-schema';
import {getProjectMeetings} from '@/lib/projects/meeting-data';
import {assignmentWorkspaceSchema} from '@/lib/projects/assignment-schema';
import {revalidateProjectSurfaces} from '@/lib/projects/revalidate';
import {taskToday} from '@/lib/tasks/links';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:{id:string}}){
  const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access required.'},access.status);
  if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
  const page=Math.max(1,Math.min(10000,Math.floor(Number(new URL(request.url).searchParams.get('page'))||1)));
  const meetingId=new URL(request.url).searchParams.get('meeting')??'';
  if(meetingId&&!z.string().uuid().safeParse(meetingId).success)return adminReply({error:'Invalid meeting link.'},400);
  try{
    const [meetings,members,prefs]=await Promise.all([getProjectMeetings(access.client,params.id,{page,meetingId}),access.client.rpc('staff_project_assignment_workspace',{p_request:params.id}),access.client.from('staff_notification_preferences').select('timezone').eq('user_id',access.user.id).maybeSingle()]);
    if(members.error||prefs.error)throw new Error('Meeting members or timezone unavailable.');
    const workspace=assignmentWorkspaceSchema.parse(members.data);
    return adminReply({...meetings,members:[...workspace.staff.map(row=>({...row,kind:'staff'})),...workspace.clients.map(row=>({...row,kind:'client'}))],timezone:taskToday(prefs.data?.timezone||'America/Chicago').timezone,currentStaffId:access.user.id});
  }catch{return adminReply({error:'Meetings or eligible members could not load.'},503);}
}
export async function POST(request:Request,{params}:{params:{id:string}}){
  if(!isSameOrigin(request))return adminReply({error:'Use the project workspace.'},403);
  const access=await getStaffAccess();if(!access.allowed)return adminReply({error:'Staff access required.'},access.status);
  if(!z.string().uuid().safeParse(params.id).success)return adminReply({error:'Project not found.'},404);
  let raw:unknown;try{raw=await readAdminJson(request,14000);}catch{return adminReply({error:'Invalid meeting.'},400);}
  const command=meetingCommandSchema.safeParse(raw);if(!command.success)return adminReply({error:'Check meeting fields and explicit time offsets.'},400);
  const result=await access.client.rpc('manage_project_meeting',{p_request:params.id,p_command:command.data});
  if(result.error)return adminReply({error:result.error.code==='42501'?'Choose authorized current project members.':'Check the meeting timezone, offsets, time range and fields.'},result.error.code==='42501'?403:['22023','22007','23514','23502'].includes(result.error.code)?422:503);
  if(result.data?.result!=='saved')return adminReply({error:result.data?.result==='conflict'?'Meeting changed. Refresh and review the latest saved record before retrying.':'Meeting unavailable or project completed.',code:result.data?.result==='conflict'?'revision_conflict':result.data?.result},result.data?.result==='not_found'?404:409);
  revalidateProjectSurfaces(params.id);return adminReply({saved:true,...result.data});
}
