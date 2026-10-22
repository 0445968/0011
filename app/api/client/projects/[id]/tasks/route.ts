import {revalidateProjectSurfaces} from '@/lib/projects/revalidate';
import { z } from 'zod';

import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { getClientAccess } from '@/lib/portal/auth';
import { clientTaskCommandSchema } from '@/lib/projects/lifecycle-schema';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi client portal.' }, 403);
  const access = await getClientAccess();
  if (!access.allowed) return adminReply({ error: 'Client sign-in is required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);

  let raw: unknown;
  try {
    raw = await readAdminJson(request, 8192);
  } catch {
    return adminReply({ error: 'The task update could not be read.' }, 400);
  }

  const parsed = clientTaskCommandSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: parsed.error.issues[0]?.message || 'Check the task update.' }, 400);

  try {
    const { data, error } = await access.client.rpc('manage_client_project_task', {
      p_request_id: params.id,
      p_command: parsed.data,
    });
    if(error?.code==='23514')return adminReply({error:'This change requires Bivi to reopen completed work or resolve completion requirements first.',code:'validation_rejected'},422);
    if (error) return adminReply({ error: error.code === '22023' ? 'Check the task update.' : 'The task could not be saved.' }, error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503);

    const failures: Record<string, [number, string]> = {
      conflict: [409, 'The project changed. Reload before continuing.'],
      not_found: [404, 'Client task not found.'],
      dependency: [409, 'Complete the blocking task before continuing.'],
      blocked: [409, 'Bivi has marked this task as blocked. Review the blocker before continuing.'],
      phase_closed: [409, 'This task is not available in the current project phase yet.'],
      approval_required: [409, 'Approve the project brief from the brief section instead of completing this task manually.'],
      staff_review_required: [409, 'Submit completed work for Bivi review instead of marking it done directly.'],
      not_assigned: [403, 'This task is assigned to a different client member.'],
      locked: [409, 'This project is not open for client task updates.'],
    };
    if (failures[data?.result]) {
      const [status, message] = failures[data.result];
      return adminReply({ error: message }, status);
    }
    if (data?.result !== 'saved') return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
    revalidateProjectSurfaces(params.id);
    return adminReply({ saved: true, projectRevision: data.projectRevision, controlRevision: data.controlRevision, status: data.status });
  } catch {
    return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
  }
}
