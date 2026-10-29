import {revalidateProjectSurfaces} from '@/lib/projects/revalidate';
import { z } from 'zod';
import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { projectTaskScheduleCommandSchema } from '@/lib/projects/schedule-schema';
import { projectTaskScheduleResponseSchema } from '@/lib/projects/schedule-schema';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff sign-in required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  const taskId = new URL(request.url).searchParams.get('taskId');
  let query = access.client.from('project_task_schedule').select('request_id,task_id,start_on,revision,updated_at').eq('request_id', params.id);
  if (taskId) query = query.eq('task_id', taskId);
  const result = await query.order('task_id');
  if (result.error) return adminReply({ error: 'Task schedules could not load. Apply migration 20261021120000_project_task_scheduling.sql.' }, 503);
  const parsed = projectTaskScheduleResponseSchema.safeParse({ rows: result.data ?? [] });
  return parsed.success ? adminReply(parsed.data) : adminReply({ error: 'Invalid saved task schedule.' }, 503);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi workspace.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff sign-in required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  let raw: unknown;
  try { raw = await readAdminJson(request, 4096); }
  catch { return adminReply({ error: 'Invalid schedule request.' }, 400); }
  const parsed = projectTaskScheduleCommandSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Check the task and schedule dates.' }, 400);
  const result = await access.client.rpc('manage_project_task_schedule', {
    p_request: params.id,
    p_task_id: parsed.data.taskId,
    p_start_on: parsed.data.startOn,
    p_project_revision: parsed.data.expectedProjectRevision,
    p_schedule_revision: parsed.data.expectedScheduleRevision,
  });
  if (result.error) return adminReply({ error: result.error.code === '42883'
    ? 'Task scheduling is unavailable. Apply migration 20261021120000_project_task_scheduling.sql.'
    : result.error.code==='22023'?'Check the task start and due dates and times.':'The task schedule could not be saved.' }, result.error.code === '42501' ? 403 : result.error.code==='22023'?400:503);
  const failure: Record<string, [number, string]> = {
    conflict: [409, 'The project or schedule changed. Refresh before editing again.'],
    not_found: [404, 'Task not found in this project.'],
    locked: [409, 'Completed projects are read-only.'],
    invalid_dates: [400, 'A task start date cannot be later than its due date.'],
  };
  if (failure[result.data?.result]) {
    const [status, message] = failure[result.data.result];
    return adminReply({ error: message }, status);
  }
  if(result.data?.result==='saved')revalidateProjectSurfaces(params.id);
  return result.data?.result === 'saved'
    ? adminReply({ saved: true, revision: result.data.revision })
    : adminReply({ error: 'The schedule result could not be confirmed.' }, 503);
}
