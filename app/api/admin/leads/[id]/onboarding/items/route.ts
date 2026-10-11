import { z } from 'zod';

import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { staffOnboardingItemCommandSchema } from '@/lib/onboarding/item-schema';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi onboarding workspace.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access is required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Onboarding not found.' }, 404);

  let raw: unknown;
  try {
    raw = await readAdminJson(request, 32768);
  } catch {
    return adminReply({ error: 'The onboarding item could not be read.' }, 400);
  }

  const parsed = staffOnboardingItemCommandSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: parsed.error.issues[0]?.message || 'Check the onboarding item.' }, 400);

  try {
    const { data, error } = await access.client.rpc('manage_onboarding_item', {
      p_request_id: params.id,
      p_command: parsed.data,
    });
    if (error) return adminReply({ error: error.code === '22023' ? 'Check the onboarding item fields.' : 'The onboarding item could not be saved.' }, error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503);

    const failures: Record<string, [number, string]> = {
      conflict: [409, 'This onboarding item changed. Reload before continuing.'],
      not_found: [404, 'Onboarding item not found.'],
      locked: [409, 'Reopen completed onboarding before changing its requirements.'],
      dependency: [409, 'Another onboarding item depends on this requirement. Update that dependency first.'],
    };
    if (failures[data?.result]) {
      const [status, message] = failures[data.result];
      return adminReply({ error: message }, status);
    }
    if (data?.result !== 'saved') return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
    return adminReply({ saved: true, revision: data.revision, status: data.status });
  } catch {
    return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
  }
}
