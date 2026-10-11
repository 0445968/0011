import { z } from 'zod';

import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { getClientAccess } from '@/lib/portal/auth';
import { clientProjectBriefReviewSchema } from '@/lib/projects/brief-schema';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi client portal.' }, 403);
  const access = await getClientAccess();
  if (!access.allowed) return adminReply({ error: 'Client sign-in is required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);

  let raw: unknown;
  try {
    raw = await readAdminJson(request, 8192);
  } catch {
    return adminReply({ error: 'The brief review could not be read.' }, 400);
  }

  const parsed = clientProjectBriefReviewSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: parsed.error.issues[0]?.message || 'Check the brief review.' }, 400);

  try {
    const { data, error } = await access.client.rpc('review_project_brief', {
      p_request_id: params.id,
      p_command: parsed.data,
    });
    if (error) return adminReply({ error: 'The brief review could not be saved.' }, error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503);

    const failures: Record<string, [number, string]> = {
      conflict: [409, 'This brief version changed. Reload before continuing.'],
      not_found: [404, 'Project brief not found.'],
      review_closed: [409, 'This brief version is no longer awaiting your review.'],
      locked: [409, 'This project is no longer open for brief decisions.'],
    };
    if (failures[data?.result]) {
      const [status, message] = failures[data.result];
      return adminReply({ error: message }, status);
    }
    if (data?.result !== 'saved') return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
    return adminReply({ saved: true });
  } catch {
    return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
  }
}
