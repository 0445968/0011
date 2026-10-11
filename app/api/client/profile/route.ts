import { z } from 'zod';

import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { getClientAccess } from '@/lib/portal/auth';

const profileCommand = z.object({
  expectedRevision: z.number().int().min(0).max(99999999),
  firstName: z.string().trim().max(100),
  lastName: z.string().trim().max(100),
  jobTitle: z.string().trim().max(160),
  phone: z.string().trim().max(50),
  timezone: z.string().trim().max(80),
}).strict();

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi client portal.' }, 403);
  const access = await getClientAccess();
  if (!access.allowed) return adminReply({ error: 'Client sign-in is required.' }, access.status);

  let raw: unknown;
  try {
    raw = await readAdminJson(request, 4096);
  } catch {
    return adminReply({ error: 'Your profile could not be read.' }, 400);
  }

  const parsed = profileCommand.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Check your profile details.' }, 400);

  try {
    const { data, error } = await access.client.rpc('save_client_profile', { p_command: parsed.data });
    if (error) return adminReply({ error: 'Your profile could not be saved.' }, error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503);
    if (data?.result === 'conflict') return adminReply({ error: 'Your profile changed. Reload before saving again.' }, 409);
    if (data?.result !== 'saved') return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
    return adminReply({ saved: true, revision: data.revision });
  } catch {
    return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
  }
}
