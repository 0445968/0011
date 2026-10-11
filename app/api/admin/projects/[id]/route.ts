import { z } from 'zod';

import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { dispatchProjectCommunications } from '@/lib/communications/email';
import { getInquiry } from '@/lib/admin/inquiries';
import { getOnboardingItems } from '@/lib/onboarding/item-data';
import { listProposals } from '@/lib/proposals/data';
import { projectCommandSchema } from '@/lib/projects/schema';
import { projectLaunchSeed } from '@/lib/projects/launch-seed';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi workspace to update projects.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access is required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);

  let raw: unknown;
  try {
    raw = await readAdminJson(request, 393216);
  } catch {
    return adminReply({ error: 'The project request could not be read.' }, 400);
  }

  const parsed = projectCommandSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Check task and milestone fields and the decision reason.' }, 400);

  try {
    let command: Record<string, unknown> = parsed.data;

    if (parsed.data.action === 'activate') {
      const [inquiry, proposals, onboardingItems] = await Promise.all([
        getInquiry(access.client, params.id),
        listProposals(access.client, params.id),
        getOnboardingItems(access.client, params.id),
      ]);
      const accepted = proposals.find((proposal) => proposal.status === 'accepted');
      if (!inquiry || !accepted) return adminReply({ error: 'Accept the current project scope before activation.' }, 409);
      const seed = projectLaunchSeed(inquiry, accepted, onboardingItems);
      command = {
        ...parsed.data,
        seedTasks: seed.tasks,
        seedControls: seed.controls,
        briefSeed: seed.brief,
      };
    }

    const { data, error } = await access.client.rpc('manage_inquiry_project', {
      p_request_id: params.id,
      p_command: command,
    });
    if (error) {
      if (error.code === '23514') return adminReply({ error: error.message || 'Complete handoff and closeout before completing the project.' }, 409);
      return adminReply({ error: error.code === '22023' ? 'Check task references, dates and required fields.' : 'Project could not be saved.' }, error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503);
    }

    const failures: Record<string, [number, string]> = {
      conflict: [409, 'This project changed. Reload before continuing.'],
      not_found: [404, 'Inquiry or project not found.'],
      gate_closed: [409, 'Review qualification, accepted scope, readiness and completed onboarding first.'],
      locked: [409, 'This action is unavailable in the current project state. Reload to review it.'],
      dependency: [409, 'A remaining task depends on a task you removed. Update the task dependency first.'],
      incomplete: [400, 'Record at least one task and complete all tasks and milestones before completing the project.'],
    };
    if (failures[data?.result]) {
      const [status, message] = failures[data.result];
      return adminReply({ error: message }, status);
    }
    if (data?.result !== 'saved') return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
    await dispatchProjectCommunications({ requestId: params.id, limit: 10 });
    return adminReply({ revision: data.revision });
  } catch {
    return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
  }
}
