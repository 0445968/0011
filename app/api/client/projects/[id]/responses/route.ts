import { z } from 'zod';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { getClientAccess } from '@/lib/portal/auth';
import { clientTaskResponseCommandSchema, taskResponseWorkspaceSchema } from '@/lib/projects/task-response-schema';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const access = await getClientAccess();
  if (!access.allowed) return adminReply({ error: 'Client sign-in required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project unavailable.' }, 404);
  const result = await access.client.rpc('project_task_response_workspace', { p_request: params.id });
  if (result.error) return adminReply({ error: 'Task requests could not load. Check migration 036.' }, result.error.code === '42501' ? 403 : 503);
  const parsed = taskResponseWorkspaceSchema.safeParse(result.data);
  return parsed.success ? adminReply(parsed.data) : adminReply({ error: 'Task requests unavailable.' }, 404);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi client portal.' }, 403);
  const access = await getClientAccess();
  if (!access.allowed) return adminReply({ error: 'Client sign-in required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project unavailable.' }, 404);
  let raw: unknown;
  try { raw = await readAdminJson(request, 6144); } catch { return adminReply({ error: 'Invalid task request.' }, 400); }
  const parsed = clientTaskResponseCommandSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Choose a task and enter a short explanation.' }, 400);
  const data = parsed.data;
  const result = await access.client.rpc('submit_project_client_task_response', {
    p_request: params.id, p_task: data.taskId, p_kind: data.kind,
    p_note: data.note, p_revision: data.projectRevision,
  });
  if (result.error) return adminReply({ error: result.error.code === '42501' ? 'You are not assigned to respond to this task.' : 'Task request could not be submitted.' }, result.error.code === '42501' ? 403 : result.error.code === '22023' ? 400 : 503);
  const failures: Record<string, [number, string]> = {
    not_found: [404, 'Task unavailable.'], locked: [409, 'Project is not active.'],
    conflict: [409, 'Project has changed. Refresh before sending a request.'],
    pending: [409, 'A request is already waiting for Bivi review.'],
    decline_disabled: [403, 'Bivi has not enabled declining this task.'],
    explanation_required: [400, 'Provide a fuller explanation for declining.'],
    already_done: [409, 'This task is already completed.'], blocked: [409, 'The task is blocked; request clarification instead.'],
  };
  if (failures[result.data?.result]) {
    const [status, message] = failures[result.data.result];
    return adminReply({ error: message }, status);
  }
  return result.data?.result === 'saved' ? adminReply({ saved: true, id: result.data.id }) : adminReply({ error: 'Request could not be confirmed.' }, 503);
}
