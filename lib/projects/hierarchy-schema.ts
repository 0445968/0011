import { z } from 'zod';
import { projectPhaseSchema } from './lifecycle-schema';

const projectRevision = z.number().int().positive();
const sourceId = z.string().trim().min(1).max(100);
const subtaskId = z.string().uuid();
const dueOn = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();
const status = z.enum(['todo', 'doing', 'blocked', 'done']);
const base = {
  expectedProjectRevision: projectRevision,
  expectedHierarchyRevision: projectRevision,
};

export const projectHierarchyCommandSchema = z.discriminatedUnion('action', [
  z.object({
    ...base,
    action: z.literal('set_milestone_phases'),
    milestoneId: sourceId,
    phases: z.array(projectPhaseSchema).max(9).refine(
      (items) => new Set(items).size === items.length,
      'Duplicate phases are not allowed.'
    ),
  }).strict(),
  z.object({
    ...base,
    action: z.literal('add_subtask'),
    taskId: sourceId,
    subtaskId,
    title: z.string().trim().min(1).max(300),
    status,
    dueOn,
  }).strict(),
  z.object({
    ...base,
    action: z.literal('update_subtask'),
    taskId: sourceId,
    subtaskId,
    expectedSubtaskRevision: projectRevision,
    title: z.string().trim().min(1).max(300),
    status,
    dueOn,
  }).strict(),
  z.object({
    ...base,
    action: z.literal('remove_subtask'),
    taskId: sourceId,
    subtaskId,
    expectedSubtaskRevision: projectRevision,
  }).strict(),
]);

export type ProjectHierarchyCommand = z.infer<typeof projectHierarchyCommandSchema>;

export const projectHierarchyResponseSchema = z.object({
  projectRevision: projectRevision,
  hierarchyRevision: projectRevision,
  milestonePhases: z.array(z.object({
    milestoneId: sourceId,
    phase: projectPhaseSchema,
  })),
  subtasks: z.array(z.object({
    id: subtaskId,
    taskId: sourceId,
    title: z.string(),
    status,
    dueOn,
    position: z.number().int().nonnegative(),
    revision: projectRevision,
    updatedAt: z.string(),
  })),
});

export type ProjectHierarchyResponse = z.infer<typeof projectHierarchyResponseSchema>;
