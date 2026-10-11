import { z } from 'zod';

import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { checklistCommandSchema } from '@/lib/onboarding/checklist-schema';
import { personalizedOnboardingSeed } from '@/lib/onboarding/personalize';
import { listProposals } from '@/lib/proposals/data';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi workspace to update onboarding.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access is required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Inquiry not found.' }, 404);

  let raw: unknown;
  try {
    raw = await readAdminJson(request, 98304);
  } catch {
    return adminReply({ error: 'The onboarding request could not be read.' }, 400);
  }

  const parsed = checklistCommandSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Check contacts, checklist fields, and evidence or waiver notes.' }, 400);

  try {
    let command: Record<string, unknown> = parsed.data;
    if (parsed.data.action === 'start') {
      const proposals = await listProposals(access.client, params.id);
      const accepted = proposals.find((proposal) => proposal.status === 'accepted');
      if (!accepted) return adminReply({ error: 'Accept the project scope before starting onboarding.' }, 409);
      command = { ...parsed.data, seedItems: personalizedOnboardingSeed(accepted) };
    }

    const { data, error } = await access.client.rpc('manage_inquiry_onboarding', {
      p_request_id: params.id,
      p_command: command,
    });
    if (error) return adminReply({ error: error.code === '22023' ? 'Check kickoff dates and onboarding requirements.' : 'Onboarding could not be saved.' }, error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503);

    const failures: Record<string, [number, string]> = {
      conflict: [409, 'This onboarding record changed. Reload before continuing.'],
      not_found: [404, 'Inquiry or onboarding not found.'],
      gate_closed: [409, 'The qualified inquiry and agreement/deposit gate must be ready first.'],
      locked: [409, 'Reopen completed onboarding before editing.'],
      incomplete: [400, 'Accept or waive every required personalized item, complete the staff verification checklist, contacts and held kickoff before completing onboarding.'],
    };
    if (failures[data?.result]) {
      const [status, message] = failures[data.result];
      return adminReply({ error: message }, status);
    }
    if (data?.result !== 'saved') return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
    return adminReply({ revision: data.revision });
  } catch {
    return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
  }
}
