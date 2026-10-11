import { z } from 'zod';

import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { staffChangeCommandSchema, staffDeliveryCommandSchema } from '@/lib/projects/delivery-schema';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi project workspace.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access is required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);

  let raw: unknown;
  try { raw = await readAdminJson(request, 32768); }
  catch { return adminReply({ error: 'The delivery update could not be read.' }, 400); }

  const delivery = staffDeliveryCommandSchema.safeParse(raw);
  const change = staffChangeCommandSchema.safeParse(raw);
  if (!delivery.success && !change.success) {
    const issue = delivery.error?.issues[0]?.message || change.error?.issues[0]?.message;
    return adminReply({ error: issue || 'Check the delivery fields.' }, 400);
  }

  try {
    const rpc = delivery.success ? 'manage_project_delivery' : 'manage_project_change_request';
    const command = delivery.success ? delivery.data : change.data;
    const { data, error } = await access.client.rpc(rpc, { p_request_id: params.id, p_command: command });
    if (error) return adminReply({ error: error.code === '22023' ? 'Check the delivery or change-request fields.' : 'The delivery update could not be saved.' }, error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503);

    const failures: Record<string, [number, string]> = {
      conflict: [409, 'This record changed. Reload before continuing.'],
      not_found: [404, 'Project or delivery record not found.'],
      locked: [409, 'This action is unavailable in the current state.'],
      review_open: [409, 'A deliverable version is already awaiting client review.'],
      note_required: [400, 'Add the required evidence or waiver note.'],
      delivery_not_ready: [409, 'Complete required QA, deliverable approvals, and open change requests before release.'],
      handoff_incomplete: [409, 'Complete handoff and obtain client receipt confirmation before closeout.'],
    };
    if (failures[data?.result]) {
      const [status, message] = failures[data.result];
      return adminReply({ error: message }, status);
    }
    if (data?.result !== 'saved') return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
    return adminReply({ saved: true, revision: data?.revision, state: data?.state, version: data?.version, round: data?.round, status: data?.status });
  } catch {
    return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
  }
}
