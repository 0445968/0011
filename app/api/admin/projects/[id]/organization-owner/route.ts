import { z } from 'zod';
import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';

const command = z.object({ userId: z.string().uuid() }).strict();

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff sign-in required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project unavailable.' }, 404);
  const result = await access.client.rpc('staff_project_organization_owner', { p_request: params.id });
  if (result.error) return adminReply({ error: 'Organization owner could not load.' }, 503);
  return adminReply({ ownerId: result.data ?? null });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the staff workspace.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff sign-in required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project unavailable.' }, 404);
  let parsed: z.infer<typeof command>;
  try { parsed = command.parse(await readAdminJson(request, 2048)); } catch { return adminReply({ error: 'Choose a verified project member.' }, 400); }
  const result = await access.client.rpc('staff_set_project_organization_owner', { p_request: params.id, p_user: parsed.userId });
  if (result.error) return adminReply({ error: result.error.code === '22023' ? 'Choose an active client member with access to this project.' : 'Organization owner could not be verified.' }, result.error.code === '42501' ? 403 : result.error.code === '22023' ? 400 : 503);
  return result.data?.saved ? adminReply({ saved: true }) : adminReply({ error: 'Organization owner could not be verified.' }, 503);
}
