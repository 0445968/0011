import { z } from 'zod';
import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply } from '@/lib/admin/http';
import { getProject } from '@/lib/projects/data';
import { getProjectActivity } from '@/lib/projects/activity-data';

/** Read-only, staff-authenticated view of a single task's audited history. */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access is required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  const taskId = new URL(request.url).searchParams.get('taskId');
  if (!taskId || !z.string().trim().min(1).max(100).safeParse(taskId).success) return adminReply({ error: 'Task not found.' }, 400);
  try {
    const { record } = await getProject(access.client, params.id);
    if (!record) return adminReply({ error: 'Project not found.' }, 404);
    if (!record.body.tasks.some(task => task.id === taskId)) return adminReply({ error: 'Task no longer exists in this project.' }, 404);
    const page = await getProjectActivity(access.client, params.id, record.body, undefined, taskId);
    return adminReply({ events: page.events.slice(0, 15), actors: page.actors, hasOlder: Boolean(page.nextCursor) });
  } catch {
    return adminReply({ error: 'Task activity is unavailable. Use the full project activity page to retry.' }, 503);
  }
}
