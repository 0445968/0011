import { z } from 'zod';
import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { projectPhaseSchema } from '@/lib/projects/lifecycle-schema';
import { phaseStatusSchema, projectPhaseStatesSchema } from '@/lib/projects/phase-status';

export const dynamic = 'force-dynamic';
const command = z.object({
  phase: projectPhaseSchema,
  status: phaseStatusSchema,
  expectedRevision: z.number().int().nonnegative(),
  reason: z.string().trim().max(2000),
}).strict();

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff sign-in required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  const result = await access.client.rpc('staff_project_phase_states', { p_request: params.id });
  if (result.error) return adminReply({ error: 'Phase statuses could not load. Check migration 035.' }, 503);
  const parsed = projectPhaseStatesSchema.safeParse(result.data);
  return parsed.success ? adminReply(parsed.data) : adminReply({ error: 'Invalid phase data.' }, 503);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi workspace.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff sign-in required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  let raw: unknown;
  try { raw = await readAdminJson(request, 4096); }
  catch { return adminReply({ error: 'Invalid phase request.' }, 400); }
  const parsed = command.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Check phase status and reason.' }, 400);
  const result = await access.client.rpc('manage_project_phase_state', {
    p_request: params.id, p_phase: parsed.data.phase, p_status: parsed.data.status,
    p_revision: parsed.data.expectedRevision, p_reason: parsed.data.reason,
  });
  if (result.error) {
    // Keep PostgreSQL internals in server logs; return actionable, bounded diagnostics.
    console.error('[project phase save] database failure', {
      code: result.error.code,
      message: result.error.message,
      details: result.error.details,
    });
    const code = result.error.code || 'unknown';
    const message = code === '23514'
      ? 'A database constraint rejected the phase change. Verify migration 038, then retry.'
      : code === '42501'
        ? 'The database denied this phase update. Verify staff access and migration 035.'
        : code === '42883'
          ? 'The phase update function is missing. Apply migrations 035, 037 and 038 in order.'
          : code === '22023'
            ? 'Invalid phase change.'
            : `Phase change could not save (database error ${code}). Check the server logs.`;
    return adminReply({ error: message, diagnosticCode: code },
      code === '42501' ? 403 : code === '22023' ? 400 : code === '23514' ? 409 : 503);
  }
  switch (result.data?.result) {
    case 'saved': return adminReply({ saved: true, revision: result.data.revision });
    case 'conflict': return adminReply({ error: 'Phase changed in another session. Refresh phase statuses.' }, 409);
    case 'active_work': return adminReply({ error: `${result.data.activeCount || 'Some'} active or blocked task(s) must be resolved before closing this phase.`, code: 'active_work' }, 409);
    case 'milestones_incomplete': return adminReply({ error: `${result.data.incompleteCount || 'Some'} milestone(s) must be marked Completed before closing this phase.`, code: 'milestones_incomplete' }, 409);
    case 'subtasks_incomplete': return adminReply({ error: `${result.data.incompleteCount || 'Some'} subtask(s) linked to this phase are unfinished. Complete them before closing the phase.`, code: 'subtasks_incomplete' }, 409);
    case 'task_controls_missing': return adminReply({ error: `${result.data.missingCount || 'Some'} task control record(s) are missing. Save All in the work plan to restore task metadata, refresh phases, then retry.`, code: 'task_controls_missing' }, 409);
    case 'must_activate': return adminReply({ error: 'Activate this phase before marking it completed.' }, 409);
    case 'locked': return adminReply({ error: 'This project is read-only.' }, 409);
    default: return adminReply({ error: 'Project not found.' }, 404);
  }
}
