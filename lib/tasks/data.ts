import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import {cleanCompanySearch} from '@/lib/companies/data';
import {taskToday} from './links';
import {projectPhaseLabels} from '@/lib/projects/lifecycle-schema';
export type MyTask={request_id:string;project_public_id:string;project_title:string;project_state:string;operational_status:'active'|'on_hold'|'waiting_on_client'|'inactive'|'completed';task_id:string;title:string;task_status:'todo'|'doing'|'blocked'|'done';start_on:string|null;due_on:string|null;start_at?:string|null;due_at?:string|null;start_time?:string|null;due_time?:string|null;time_zone?:string;is_blocked:boolean;blocker_owner:string|null;depends_on:string|null;phase:keyof typeof projectPhaseLabels;updated_at:string;assignee_count:number;priority:'low'|'medium'|'high'|'urgent'|null};
export async function listMyTasks(client:SupabaseClient,p:Record<string,string|undefined>){
 const preferences=!p.tz ? await client.from('staff_notification_preferences').select('timezone').maybeSingle() : null;
 if(preferences?.error)throw new Error('Task timezone preferences could not load.');
 const now=new Date().toISOString();
 const {today,timezone}=taskToday(p.tz||preferences?.data?.timezone||'America/Chicago',new Date(now));let query=client.rpc('staff_my_tasks_in_timezone',{p_timezone:timezone},{count:'exact'}).select('*');const term=cleanCompanySearch(p.q||'');if(term)query=query.or(`title.ilike.%${term}%,project_title.ilike.%${term}%,project_public_id.ilike.%${term}%`);
 if(p.status==='blocked')query=query.eq('is_blocked',true);else if(['todo','doing','done'].includes(p.status||''))query=query.eq('task_status',p.status!);else if(p.status!=='all')query=query.neq('task_status','done');
 if(['active','on_hold','waiting_on_client','inactive','completed'].includes(p.project||''))query=query.eq('operational_status',p.project!);else if(p.project!=='all')query=query.not('operational_status','in','(inactive,completed)');
 if(Object.keys(projectPhaseLabels).includes(p.phase||''))query=query.contains('effective_phases',[p.phase!]);
 if(p.due==='overdue')query=query.or(`due_at.lt.${now},and(due_at.is.null,due_on.lt.${today})`).neq('task_status','done');if(p.due==='today')query=query.eq('due_on',today);if(p.due==='upcoming')query=query.gt('due_on',today);if(p.due==='none')query=query.is('due_on',null);
 const sort=({due:'due_on',project:'project_sort',title:'title_sort',updated:'updated_at'} as Record<string,string>)[p.sort||'']||'due_on';const page=Math.max(1,Math.min(100000,Math.floor(Number(p.page)||1)));query=query.order(sort,{ascending:p.direction!=='desc',nullsFirst:false});if(sort==='due_on')query=query.order('due_at',{ascending:p.direction!=='desc',nullsFirst:p.direction==='desc'});const result=await query.order('request_id').order('task_id').range((page-1)*25,page*25-1);if(result.error)throw new Error('My Tasks could not load.');return{rows:(result.data||[]) as MyTask[],page,total:result.count||0,today,timezone,now};
}
