import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { readOverviewRows, type OverviewContent } from './overview-content';

/** Authenticated staff client only. RLS and request filters apply to EVERY page.
 * Read IDs/relationships only; never fetch private bodies to calculate counts. */
export async function getProjectOverviewContent(client:SupabaseClient,requestId:string):Promise<OverviewContent> {
  const [files,links,notes,comments,priorities,schedule]=await Promise.all([
    readOverviewRows((from,to)=>client.from('project_files').select('id',{count:'exact'}).eq('request_id',requestId).eq('state','ready').order('id').range(from,to),'Linked files'),
    readOverviewRows((from,to)=>client.from('project_task_file_links').select('task_id,file_id',{count:'exact'}).eq('request_id',requestId).order('task_id').order('file_id').range(from,to),'File links'),
    readOverviewRows((from,to)=>client.from('project_task_notes').select('id,task_id',{count:'exact'}).eq('request_id',requestId).eq('removed',false).order('id').range(from,to),'Authored task notes'),
    readOverviewRows((from,to)=>client.from('project_comments').select('id,task_id',{count:'exact'}).eq('request_id',requestId).eq('removed',false).not('task_id','is',null).order('id').range(from,to),'Task discussion'),
    readOverviewRows((from,to)=>client.from('project_task_controls').select('task_id,priority,blocker_owner,depends_on',{count:'exact'}).eq('request_id',requestId).order('task_id').range(from,to),'Manual task priorities'),
    readOverviewRows((from,to)=>client.from('project_task_schedule').select('task_id,start_on',{count:'exact'}).eq('request_id',requestId).order('task_id').range(from,to),'Task schedules'),
  ]);
  return {files,links,notes,comments,priorities,schedule};
}
