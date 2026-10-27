import { z } from 'zod';

export const assignmentSideSchema = z.enum(['bivi', 'client']);
const uuid = z.string().uuid();
const ids = z.array(uuid).max(12).refine(values => new Set(values).size === values.length, 'Duplicate members');

export const projectAssignmentCommandSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('task'),
    taskId: z.string().trim().min(1).max(100),
    side: assignmentSideSchema,
    userIds: ids,
    expectedRevision: z.number().int().positive(),
  }).strict(),
  z.object({
    action: z.literal('managers'),
    userIds: z.array(uuid).max(5).refine(values => new Set(values).size === values.length, 'Duplicate managers'),
    expectedRevision: z.number().int().positive(),
  }).strict(),
]);

const memberSchema = z.object({
  id: uuid,
  label: z.string(),
  avatar_path: z.string().nullable(),
});
export const assignmentWorkspaceSchema = z.object({
  tasks: z.array(z.object({
    task_id: z.string(),
    side: assignmentSideSchema,
    revision: z.number().int().positive(),
    assignees: z.array(uuid),
  })),
  staff: z.array(memberSchema),
  clients: z.array(memberSchema),
  managers: z.array(uuid),
  assignmentRevision: z.number().int().positive(),
  currentStaffId: uuid,
  clientCompany: z.object({ id: uuid, name: z.string(), logo_path: z.string().nullable() }).nullable(),
});
export type ProjectAssignmentWorkspace = z.infer<typeof assignmentWorkspaceSchema>;
