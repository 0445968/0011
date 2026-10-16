import { z } from 'zod';
import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { assignmentWorkspaceSchema, projectAssignmentCommandSchema } from '@/lib/projects/assignment-schema';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff sign-in required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  const result = await access.client.rpc('staff_project_assignment_workspace', { p_request: params.id });
  if (result.error) return adminReply({ error: 'Project assignments could not load. Check migration 034.' }, 503);
  const valid = assignmentWorkspaceSchema.safeParse(result.data);
  if (!valid.success) return adminReply({ error: 'Project assignment data was invalid.' }, 503);
  return adminReply(valid.data);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi workspace.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff sign-in required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  let json: unknown;
  try { json = await readAdminJson(request, 4096); }
  catch { return adminReply({ error: 'Invalid assignment request.' }, 400); }
  const parsed = projectAssignmentCommandSchema.safeParse(json);
  if (!parsed.success) return adminReply({ error: 'Choose valid and distinct project members.' }, 400);
  const payload = parsed.data;
  const result = await access.client.rpc('staff_project_assign_members', {
    p_request: params.id,
    p_action: payload.action,
    p_task_id: payload.action === 'task' ? payload.taskId : null,
    p_side: payload.action === 'task' ? payload.side : null,
    p_user_ids: payload.userIds,
    p_revision: payload.expectedRevision,
  });
  if (result.error) {
    return adminReply({ error: result.error.code === '22023'
      ? 'Choose active, eligible members of the correct responsible side.'
      : 'Project assignments could not be saved.' }, result.error.code === '22023' ? 400 : 503);
  }
  const outcome = result.data?.result;
  if (outcome === 'conflict') return adminReply({ error: 'Task responsibility changed. Reopen the picker to review the latest assignment.' }, 409);
  if (outcome === 'locked') return adminReply({ error: 'Completed projects cannot be reassigned.' }, 409);
  if (outcome === 'not_found') return adminReply({ error: 'Task or project no longer exists.' }, 404);
  if (outcome !== 'saved') return adminReply({ error: 'Assignment could not be confirmed.' }, 503);
  return adminReply({ saved: true, revision: result.data?.revision ?? null });
}
