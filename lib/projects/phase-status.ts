import { z } from 'zod';
import { projectPhaseSchema } from './lifecycle-schema';
import type { ProjectBody } from './schema';

export const phaseStatusSchema = z.enum(['planning', 'active', 'completed']);
export type PhaseStatus = z.infer<typeof phaseStatusSchema>;
export const projectPhaseStateSchema = z.object({
  phase: projectPhaseSchema,
  status: phaseStatusSchema,
  revision: z.number().int().nonnegative(),
  everActive: z.boolean(),
  activatedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});
export const projectPhaseStatesSchema = z.object({
  projectRevision: z.number().int().positive(),
  states: z.array(projectPhaseStateSchema),
});
export type ProjectPhaseState = z.infer<typeof projectPhaseStateSchema>;

/** A completed milestone requires explicit review. No running tasks means Planning. */
export function expectedMilestoneStatus(body: ProjectBody, milestoneId: string) {
  const milestone = body.milestones.find(item => item.id === milestoneId);
  if (!milestone) return null;
  if (milestone.status === 'done') return 'done' as const;
  const tasks = body.tasks.filter(task => task.milestoneId === milestoneId);
  return tasks.some(task => task.status === 'doing' || task.status === 'blocked' || task.status === 'in_review' || task.status === 'rejected')
    ? 'in_progress' as const : 'planned' as const;
}

export function phaseProgress(body: ProjectBody, milestoneIds: string[]) {
  const linked = body.milestones.filter(item => milestoneIds.includes(item.id));
  const completed = linked.filter(item => item.status === 'done').length;
  return { total: linked.length, completed, allDone: linked.length > 0 && completed === linked.length };
}
