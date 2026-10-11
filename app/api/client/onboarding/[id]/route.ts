import { z } from 'zod';

import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { clientOnboardingItemCommandSchema } from '@/lib/onboarding/item-schema';
import { getClientAccess } from '@/lib/portal/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi client portal.' }, 403);
  const access = await getClientAccess();
  if (!access.allowed) return adminReply({ error: 'Client sign-in is required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Onboarding not found.' }, 404);

  let raw: unknown;
  try {
    raw = await readAdminJson(request, 16384);
  } catch {
    return adminReply({ error: 'The onboarding response could not be read.' }, 400);
  }

  const parsed = clientOnboardingItemCommandSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Check your onboarding response.' }, 400);

  try {
    const { data, error } = await access.client.rpc('manage_onboarding_item', {
      p_request_id: params.id,
      p_command: parsed.data,
    });
    if (error) return adminReply({ error: 'Your onboarding response could not be saved.' }, error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503);

    const failures: Record<string, [number, string]> = {
      conflict: [409, 'This item changed. Reload before continuing.'],
      not_found: [404, 'Onboarding item not found.'],
      locked: [409, 'This item is no longer open for editing. Reload the page.'],
      dependency: [409, 'Complete the required earlier step before submitting this item.'],
      incomplete: [400, 'Add the required response or upload before submitting this item.'],
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
