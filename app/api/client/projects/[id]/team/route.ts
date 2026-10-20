import { z } from 'zod';
import { getClientAccess } from '@/lib/portal/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { clientProjectTeamCommandSchema, clientProjectAssignmentWorkspaceSchema } from '@/lib/projects/client-team-schema';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const access = await getClientAccess();
  if (!access.allowed) return adminReply({ error: 'Client sign-in required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project unavailable.' }, 404);
  const result = await access.client.rpc('client_project_assignment_workspace', { p_request: params.id });
  if (result.error) return adminReply({ error: 'Project team could not load.' }, result.error.code === '42501' ? 403 : 503);
  const parsed = clientProjectAssignmentWorkspaceSchema.safeParse(result.data);
  return parsed.success ? adminReply(parsed.data) : adminReply({ error: 'Project team data was invalid.' }, 503);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi client portal.' }, 403);
  const access = await getClientAccess();
  if (!access.allowed) return adminReply({ error: 'Client sign-in required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project unavailable.' }, 404);
  let raw: unknown;
  try { raw = await readAdminJson(request, 8192); } catch { return adminReply({ error: 'Invalid project team change.' }, 400); }
  const parsed = clientProjectTeamCommandSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Check the project team change.' }, 400);
  const command = parsed.data;
  const result = command.action === 'create_task'
    ? await access.client.rpc('client_create_project_task', { p_request: params.id, p_title: command.title, p_notes: command.notes, p_phase: command.phase, p_user_ids: command.userIds, p_project_revision: command.projectRevision })
    : await access.client.rpc('client_manage_project_team', { p_request: params.id, p_action: command.action, p_task_id: command.action === 'task' ? command.taskId : null, p_user_ids: command.userIds, p_revision: command.expectedRevision });
  if (result.error) return adminReply({ error: result.error.code === '22023' ? 'Check the selected project members and task details.' : 'Project team change could not be saved.' }, result.error.code === '42501' ? 403 : result.error.code === '22023' ? 400 : 503);
  const outcome = result.data?.result;
  const failures: Record<string, [number, string]> = {
    conflict: [409, 'The project team changed. Refresh before saving again.'],
    not_found: [404, 'Project task was not found.'],
    locked: [409, 'Project is not active for client changes.'],
    phase_closed: [409, 'Choose a currently active project phase.'],
  };
  if (failures[outcome]) return adminReply({ error: failures[outcome][1] }, failures[outcome][0]);
  return outcome === 'saved' ? adminReply({ saved: true, taskId: result.data?.taskId ?? null }) : adminReply({ error: 'The project team change could not be confirmed.' }, 503);
}
