import {revalidateProjectSurfaces} from '@/lib/projects/revalidate';
import { z } from 'zod';
import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { projectPhaseSchema } from '@/lib/projects/lifecycle-schema';
import { projectPhaseColorsResponseSchema } from '@/lib/projects/phase-colors';

export const dynamic = 'force-dynamic';
const command = z.object({
  phase: projectPhaseSchema,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
  expectedRevision: z.number().int().nonnegative(),
  reason: z.string().trim().max(2000),
}).strict();

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff sign-in required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  const result = await access.client.rpc('staff_project_phase_colors', { p_request: params.id });
  if (result.error) return adminReply({ error: 'Phase colors could not load. Check the phase color migration.' }, 503);
  const parsed = projectPhaseColorsResponseSchema.safeParse(result.data);
  return parsed.success ? adminReply(parsed.data) : adminReply({ error: 'Invalid phase color data.' }, 503);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi workspace.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff sign-in required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  let raw: unknown;
  try { raw = await readAdminJson(request, 4096); }
  catch { return adminReply({ error: 'Invalid phase color request.' }, 400); }
  const parsed = command.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Use a six-digit hex color and a valid phase revision.' }, 400);
  const result = await access.client.rpc('manage_project_phase_color', {
    p_request: params.id,
    p_phase: parsed.data.phase,
    p_color: parsed.data.color,
    p_revision: parsed.data.expectedRevision,
    p_reason: parsed.data.reason,
  });
  if (result.error) {
    console.error('[project phase color save] database failure', { code: result.error.code, message: result.error.message });
    const code = result.error.code || 'unknown';
    const message = code === '42501' ? 'Staff access is required to change phase colors.'
      : code === '22023' ? 'Check the phase and six-digit hex color.'
        : `Phase color could not save (database error ${code}). Check the server logs.`;
    return adminReply({ error: message, diagnosticCode: code }, code === '42501' ? 403 : code === '22023' ? 400 : 503);
  }
  switch (result.data?.result) {
    case 'saved': revalidateProjectSurfaces(params.id); return adminReply({ saved: true, color: result.data.color, revision: result.data.revision });
    case 'conflict': return adminReply({ error: 'This phase color changed in another session. Refresh phase colors.', revision: result.data.revision }, 409);
    case 'locked': return adminReply({ error: 'This project is read-only.' }, 409);
    default: return adminReply({ error: 'Project not found.' }, 404);
  }
}
