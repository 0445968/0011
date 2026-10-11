import { z } from 'zod';

import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { staffProjectBriefCommandSchema } from '@/lib/projects/brief-schema';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi project workspace.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access is required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);

  let raw: unknown;
  try {
    raw = await readAdminJson(request, 65536);
  } catch {
    return adminReply({ error: 'The project brief could not be read.' }, 400);
  }

  const parsed = staffProjectBriefCommandSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: parsed.error.issues[0]?.message || 'Check the project brief.' }, 400);

  try {
    const { data, error } = await access.client.rpc('manage_project_brief', {
      p_request_id: params.id,
      p_command: parsed.data,
    });
    if (error) return adminReply({ error: error.code === '22023' ? 'Check the project brief fields.' : 'The project brief could not be saved.' }, error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503);

    const failures: Record<string, [number, string]> = {
      conflict: [409, 'This brief changed. Reload before continuing.'],
      not_found: [404, 'Project brief not found.'],
      incomplete: [400, 'Complete the title, objectives and scope before requesting client approval.'],
      locked: [409, 'This brief action is unavailable. Reload before continuing.'],
    };
    if (failures[data?.result]) {
      const [status, message] = failures[data.result];
      return adminReply({ error: message }, status);
    }
    if (data?.result !== 'saved') return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
    return adminReply({ saved: true, revision: data.revision, version: data.version ?? null });
  } catch {
    return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
  }
}
