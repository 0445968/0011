import { z } from 'zod';
import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { projectBodySchema } from '@/lib/projects/schema';
import { revalidateProjectSurfaces } from '@/lib/projects/revalidate';

const projectId = z.string().uuid();
const command = z.object({
  taskId: z.string().trim().min(1).max(100),
  targetStatus: z.literal('done'),
  expectedProjectRevision: z.number().int().positive(),
  reason: z.string().trim().min(1).max(2000),
}).strict();

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi project workspace.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access is required.' }, access.status);
  if (!projectId.safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  let raw: unknown;
  try { raw = await readAdminJson(request, 4096); } catch { return adminReply({ error: 'The override request could not be read.' }, 400); }
  const parsed = command.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Enter a reason and choose the task status to change.' }, 400);

  const { data, error } = await access.client.rpc('manage_project_task_status_override', {
    p_request: params.id,
    p_task: parsed.data.taskId,
    p_status: parsed.data.targetStatus,
    p_expected_revision: parsed.data.expectedProjectRevision,
    p_reason: parsed.data.reason,
  });
  if (error) return adminReply({ error: error.code === '42501' ? 'Only a designated project workflow admin can override this gate.' : 'The override could not be saved. Refresh the task before retrying.' }, error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503);
  const outcomes: Record<string, [number, string, string]> = {
    not_found: [404, 'Project or task not found.', 'not_found'],
    conflict: [409, 'The project changed in another session. Reconcile the draft before retrying.', 'revision_conflict'],
    locked: [409, 'Completed or inactive projects cannot be changed.', 'project_locked'],
    unchanged: [409, 'This task is already Done. Reopen it before requesting a new status transition.', 'task_unchanged'],
    unsupported_gate: [422, 'This override is only available for a client task blocked by its completion review requirement.', 'override_gate_unsupported'],
    review_current: [409, 'A current Bivi review is already recorded. Save the task normally.', 'review_current'],
    missing_control: [422, 'Task ownership controls are missing. Repair task setup before changing its status.', 'task_control_missing'],
    subtasks_incomplete: [422, 'Complete the unfinished subtasks before completing this task.', 'task_subtasks_incomplete'],
    dependency_incomplete: [422, 'Resolve the task dependency and blockers before completing this task.', 'task_dependencies_incomplete'],
    phase_closed: [422, 'Reopen the completed phase before changing this task.', 'phase_reopen_required'],
  };
  if (outcomes[data?.result]) {
    const [status, message, code] = outcomes[data.result];
    return adminReply({ error: message, code, taskId: parsed.data.taskId, requirement: message, overrideAvailable: false }, status);
  }
  if (data?.result !== 'saved' || !Number.isInteger(data.revision)) return adminReply({ error: 'The override result could not be confirmed. Refresh before retrying.' }, 503);

  const fresh = await access.client.from('inquiry_projects').select('body,revision').eq('request_id', params.id).maybeSingle();
  const body = projectBodySchema.safeParse(fresh.data?.body);
  if (fresh.error || !fresh.data || !body.success || fresh.data.revision !== data.revision) {
    revalidateProjectSurfaces(params.id);
    return adminReply({ saved: true, revision: data.revision, refreshWarning: 'The status override was saved, but the canonical task view could not be refreshed.' });
  }
  revalidateProjectSurfaces(params.id);
  return adminReply({ saved: true, body: body.data, revision: fresh.data.revision, overrideId: data.overrideId });
}
