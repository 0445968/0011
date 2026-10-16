import { z } from 'zod';

import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import {
  projectHierarchyCommandSchema,
  projectHierarchyResponseSchema,
} from '@/lib/projects/hierarchy-schema';

const projectIdSchema = z.string().uuid();
const projectRowSchema = z.object({ revision: z.number().int().positive() });
const revisionRowSchema = z.object({ revision: z.number().int().positive() });
const milestonePhaseRowSchema = z.object({ milestone_id: z.string(), phase: z.string() });
const subtaskRowSchema = z.object({
  id: z.string().uuid(), task_id: z.string(), title: z.string(),
  status: z.enum(['todo', 'doing', 'blocked', 'done']),
  due_on: z.string().nullable(), position: z.number().int().nonnegative(),
  revision: z.number().int().positive(), updated_at: z.string(),
});

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, { params }: RouteContext) {
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access is required.' }, access.status);
  if (!projectIdSchema.safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);

  const [projectResult, revisionResult, phasesResult] = await Promise.all([
    access.client.from('inquiry_projects').select('revision').eq('request_id', params.id).maybeSingle(),
    access.client.from('project_hierarchy_revisions').select('revision').eq('request_id', params.id).maybeSingle(),
    access.client.from('project_milestone_phases').select('milestone_id,phase').eq('request_id', params.id).order('milestone_id'),
  ]);
  if (projectResult.error || revisionResult.error || phasesResult.error) {
    return adminReply({ error: 'Project hierarchy could not be loaded.' }, 503);
  }
  if (!projectResult.data) return adminReply({ error: 'Project not found.' }, 404);
  try {
    const subtasks: z.infer<typeof subtaskRowSchema>[] = [];
    for (let offset = 0; offset < 5000; offset += 500) {
      const page = await access.client.from('project_subtasks')
        .select('id,task_id,title,status,due_on,position,revision,updated_at')
        .eq('request_id', params.id).order('task_id').order('position').order('id')
        .range(offset, offset + 499);
      if (page.error) return adminReply({ error: 'Project subtasks could not be loaded.' }, 503);
      const rows = z.array(subtaskRowSchema).parse(page.data ?? []);
      subtasks.push(...rows);
      if (rows.length < 500) break;
    }
    const project = projectRowSchema.parse(projectResult.data);
    const revision = revisionResult.data ? revisionRowSchema.parse(revisionResult.data).revision : 1;
    const milestonePhases = z.array(milestonePhaseRowSchema).parse(phasesResult.data ?? []);
    const result = projectHierarchyResponseSchema.parse({
      projectRevision: project.revision,
      hierarchyRevision: revision,
      milestonePhases: milestonePhases.map((item) => ({ milestoneId: item.milestone_id, phase: item.phase })),
      subtasks: subtasks.map((item) => ({
        id: item.id, taskId: item.task_id, title: item.title, status: item.status,
        dueOn: item.due_on, position: item.position, revision: item.revision,
        updatedAt: item.updated_at,
      })),
    });
    return adminReply(result);
  } catch {
    return adminReply({ error: 'Project hierarchy contains unexpected data.' }, 503);
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use Bivi to update projects.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access is required.' }, access.status);
  if (!projectIdSchema.safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);

  let raw: unknown;
  try {
    raw = await readAdminJson(request, 8192);
  } catch {
    return adminReply({ error: 'Invalid project hierarchy request.' }, 400);
  }
  const parsed = projectHierarchyCommandSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Check milestone phases or subtask fields.' }, 400);

  const { data, error } = await access.client.rpc('manage_project_hierarchy', {
    p_request_id: params.id,
    p_command: parsed.data,
  });
  if (error) {
    if (error.code === '42501') return adminReply({ error: 'Staff access is required.' }, 403);
    if (error.code === '22023' || error.code === '23514') return adminReply({ error: 'Invalid milestone, phase, or subtask data.' }, 400);
    return adminReply({ error: 'Project hierarchy could not be saved.' }, 503);
  }
  if (data?.result === 'conflict') return adminReply({ error: 'The project changed. Refresh its hierarchy before editing.' }, 409);
  if (data?.result === 'locked') return adminReply({ error: 'Completed projects are read-only.' }, 409);
  if (data?.result === 'not_found') return adminReply({ error: 'Project or task not found.' }, 404);
  if (data?.result !== 'saved') return adminReply({ error: 'The save could not be confirmed.' }, 503);
  return adminReply({ hierarchyRevision: data.hierarchyRevision, subtaskRevision: data.subtaskRevision ?? null });
}
