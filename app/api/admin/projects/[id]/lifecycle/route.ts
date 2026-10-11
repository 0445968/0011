import { z } from 'zod';

import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { staffLifecycleCommandSchema } from '@/lib/projects/lifecycle-schema';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi project workspace.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access is required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);

  let raw: unknown;
  try {
    raw = await readAdminJson(request, 8192);
  } catch {
    return adminReply({ error: 'The lifecycle update could not be read.' }, 400);
  }

  const parsed = staffLifecycleCommandSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: parsed.error.issues[0]?.message || 'Check the lifecycle fields.' }, 400);

  try {
    const rpc = parsed.data.action === 'set_phase' ? 'manage_project_lifecycle' : 'manage_project_task_control';
    const { data, error } = await access.client.rpc(rpc, {
      p_request_id: params.id,
      p_command: parsed.data,
    });

    if (error) {
      if (error.code === '23514') return adminReply({ error: error.message || 'Complete delivery gates before advancing the lifecycle.' }, 409);
      return adminReply({ error: error.code === '22023' ? 'Check task references and lifecycle fields.' : 'The lifecycle update could not be saved.' }, error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503);
    }

    const failures: Record<string, [number, string]> = {
      conflict: [409, 'This lifecycle record changed. Reload before continuing.'],
      not_found: [404, 'Project or task not found.'],
      dependency: [409, 'Choose an existing task as the dependency.'],
      brief_required: [409, 'The client-approved project brief is required before moving beyond Discovery.'],
      locked: [409, 'This lifecycle action is unavailable for the current project state.'],
    };
    if (failures[data?.result]) {
      const [status, message] = failures[data.result];
      return adminReply({ error: message }, status);
    }
    if (data?.result !== 'saved') return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
    return adminReply({ saved: true, revision: data.revision });
  } catch {
    return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
  }
}
