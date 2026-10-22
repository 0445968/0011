import {revalidateProjectSurfaces} from '@/lib/projects/revalidate';
import { z } from 'zod';
import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { staffTaskResponseCommandSchema, taskResponseWorkspaceSchema } from '@/lib/projects/task-response-schema';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project unavailable.' }, 404);
  const result = await access.client.rpc('project_task_response_workspace', { p_request: params.id });
  if (result.error) return adminReply({ error: 'Client task responses could not load. Check migration 036.' }, 503);
  const parsed = taskResponseWorkspaceSchema.safeParse(result.data);
  return parsed.success ? adminReply(parsed.data) : adminReply({ error: 'Project unavailable.' }, 404);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the staff workspace.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project unavailable.' }, 404);
  let raw: unknown;
  try { raw = await readAdminJson(request, 6144); } catch { return adminReply({ error: 'Invalid response action.' }, 400); }
  const parsed = staffTaskResponseCommandSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Check the review or policy details.' }, 400);
  const command = parsed.data;
  const result = command.action === 'policy'
    ? await access.client.rpc('staff_set_client_task_policy', {
        p_request: params.id, p_task: command.taskId, p_allow: command.allowDecline,
        p_guidance: command.declineGuidance, p_revision: command.expectedRevision,
      })
    : await access.client.rpc('staff_review_client_task_response', {
        p_response: command.responseId, p_action: command.decision,
        p_note: command.note, p_revision: command.projectRevision,
      });
  if (result.error) return adminReply({ error: result.error.code === '23514' ? 'Completion rejected. Complete subtasks, resolve dependencies, and reopen affected completed milestones or phases before review.' : 'The action could not be saved.',code:result.error.code==='23514'?'validation_rejected':'database_error' }, result.error.code === '23514' ? 422 : 503);
  const failures: Record<string, [number, string]> = {
    not_found: [404, 'Task or request no longer exists.'],
    conflict: [409, 'Another edit was saved. Refresh and retry.'],
    locked: [409, 'Completed projects are locked.'],
    guidance_required: [400, 'Describe the impact of a client decline (at least 15 characters).'],
    already_reviewed: [409, 'This request has already been reviewed.'],
    stale: [409, 'Task assignment changed. Review the task before acting.'],
    blocked: [409, 'Task is blocked. Resolve dependencies first.'],
    phase_closed: [409, 'This phase is completed. Reopen it before approving additional work.'],
    already_done: [409, 'The task is already complete.'],
  };
  if (failures[result.data?.result]) {
    const [status, message] = failures[result.data.result];
    return adminReply({ error: message }, status);
  }
  if(result.data?.result==='saved')revalidateProjectSurfaces(params.id);
  return result.data?.result === 'saved' ? adminReply({ saved: true, projectRevision: result.data.projectRevision, revision: result.data.revision }) : adminReply({ error: 'Action could not be confirmed.' }, 503);
}
