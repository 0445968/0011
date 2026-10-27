import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { projectTaskScheduleResponseSchema } from './schedule-schema';

export async function getProjectTaskSchedule(client: SupabaseClient, requestId: string) {
  const result = await client.from('project_task_schedule')
    .select('request_id,task_id,start_on,revision,updated_at')
    .eq('request_id', requestId).order('task_id');
  if (result.error) throw new Error('Task schedules could not load. Apply migration 20261021120000_project_task_scheduling.sql.');
  return projectTaskScheduleResponseSchema.parse({ rows: result.data ?? [] }).rows;
}
