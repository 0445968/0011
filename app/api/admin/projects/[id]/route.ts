import {revalidateProjectSurfaces} from '@/lib/projects/revalidate';
import { z } from 'zod';

import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { dispatchProjectCommunications } from '@/lib/communications/email';
import { getInquiry } from '@/lib/admin/inquiries';
import { getOnboardingItems } from '@/lib/onboarding/item-data';
import { listProposals } from '@/lib/proposals/data';
import { projectBodySchema, projectCommandSchema } from '@/lib/projects/schema';
import { projectLaunchSeed } from '@/lib/projects/launch-seed';
import { classifyProjectSaveDatabaseError } from '@/lib/projects/workplan-save-errors';
import { milestoneCompletionBlockers } from '@/lib/projects/workplan-completion';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access is required.' }, access.status);
  const { data, error } = await access.client.from('inquiry_projects')
    .select('request_id,state,body,revision').eq('request_id', params.id).maybeSingle();
  if (error) return adminReply({ error: 'The saved project could not be loaded.' }, 503);
  if (!data) return adminReply({ error: 'Project not found.' }, 404);
  const body = projectBodySchema.safeParse(data.body);
  if (!body.success || !Number.isInteger(data.revision)) return adminReply({ error: 'The saved project could not be verified.' }, 503);
  return adminReply({ requestId: data.request_id, state: data.state, body: body.data, revision: data.revision });
}

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
      const domainError = classifyProjectSaveDatabaseError(error.code, error.message);
      if (domainError && parsed.data.action === 'save') {
        const blockers: unknown[] = [];
        if (domainError.code === 'milestone_tasks_incomplete') {
          const current = await access.client.from('inquiry_projects').select('body').eq('request_id', params.id).maybeSingle();
          const latestBody = projectBodySchema.safeParse(current.data?.body);
          const nextBody = projectBodySchema.safeParse(parsed.data.body);
          if (latestBody.success && nextBody.success) {
            const closing = nextBody.data.milestones.filter(item => item.status === 'done'
              && latestBody.data.milestones.find(saved => saved.id === item.id)?.status !== 'done');
            const taskIds = nextBody.data.tasks.filter(task => closing.some(milestone => milestone.id === task.milestoneId)).map(task => task.id);
            const subtasks = taskIds.length
              ? await access.client.from('project_subtasks').select('id,task_id,title,status').eq('request_id', params.id).in('task_id', taskIds)
              : { data: [], error: null };
            if (!subtasks.error) for (const milestone of closing) {
              const value = milestoneCompletionBlockers(nextBody.data, milestone.id,
                (subtasks.data ?? []).map(item => ({ id: item.id, taskId: item.task_id, title: item.title, status: item.status })));
              blockers.push({ milestoneId: milestone.id, milestoneTitle: value.milestoneTitle, needsTask: value.needsTask, tasks: value.tasks });
            }
          }
        }
        return adminReply({ error: domainError.error, code: domainError.code, blockers }, 422);
      }
      if (error.code === '23514' && parsed.data.action !== 'save') {
        return adminReply({ error: error.message || 'The project transition failed a completion rule.', code: 'project_transition_rejected' }, 409);
      }
      if (parsed.data.action === 'save' && error.code === '22023') return adminReply({ error: 'Check task references, dates and required fields.', code: 'invalid_project_body' }, 400);
      return adminReply({ error: error.code === '22023' ? 'Check task references, dates and required fields.' : 'Project could not be saved.' }, error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503);
    }

    const failures: Record<string, [number, string, string]> = {
      conflict: [409, 'This project changed. Reconcile your draft with the latest saved project.', 'revision_conflict'],
      not_found: [404, 'Inquiry or project not found.', 'not_found'],
      gate_closed: [409, 'Review qualification, accepted scope, readiness and completed onboarding first.', 'project_gate_closed'],
      locked: [409, 'This action is unavailable in the current project state. Refresh to review it.', 'project_locked'],
      dependency: [409, 'A remaining task depends on a task you removed. Update the task dependency first.', 'task_dependency_reference'],
      incomplete: [400, 'Record at least one task and complete all tasks and milestones before completing the project.', 'project_incomplete'],
    };
    if (failures[data?.result]) {
      const [status, message, code] = failures[data.result];
      return adminReply({ error: message, code }, status);
    }
    if (data?.result !== 'saved') return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
  revalidateProjectSurfaces(params.id);
    if (parsed.data.action === 'save') {
      const fresh = await access.client.from('inquiry_projects').select('body,revision').eq('request_id', params.id).maybeSingle();
      const canonical = projectBodySchema.safeParse(fresh.data?.body);
      if (fresh.error || !fresh.data || !canonical.success) {
        return adminReply({ saved: true, revision: data.revision, refreshWarning: 'Project changes were saved, but the saved body could not be refreshed.' });
      }
      try { await dispatchProjectCommunications({ requestId: params.id, limit: 10 }); }
      catch { /* The database commit already succeeded; communication dispatch is a follow-up. */ }
      return adminReply({ saved: true, body: canonical.data, revision: fresh.data.revision });
    }
    try { await dispatchProjectCommunications({ requestId: params.id, limit: 10 }); }
    catch { /* The project transition has already committed. */ }
    return adminReply({ revision: data.revision, saved: true });
  } catch {
    return adminReply({ error: 'The result could not be confirmed. Reload before retrying.' }, 503);
  }
}
