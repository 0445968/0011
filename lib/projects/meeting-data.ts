import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import {meetingSchema} from './meeting-schema';
export async function getProjectMeetings(client:SupabaseClient,id:string,{upcoming=false,page=1,limit=25,now=new Date(),meetingId=''}={}) {
  let query=client.from('project_meetings').select('*',{count:'exact'}).eq('request_id',id);
  if(meetingId)query=query.eq('id',meetingId);
  if(upcoming)query=query.eq('status','scheduled').gt('ends_at',now.toISOString());
  const result=await query.order('starts_at').order('id').range((page-1)*limit,page*limit-1);
  if(result.error||result.count===null)throw new Error('Project meetings unavailable. Retry saved data.');
  return {rows:meetingSchema.array().parse(result.data),total:result.count};
}
