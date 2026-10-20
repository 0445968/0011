import { z } from 'zod';

const uuid = z.string().uuid();
const memberIds = z.array(uuid).min(1).max(12).refine(values => new Set(values).size === values.length);

export const clientProjectTeamCommandSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('managers'), userIds: z.array(uuid).max(5).refine(values => new Set(values).size === values.length), expectedRevision: z.number().int().positive() }).strict(),
  z.object({ action: z.literal('task'), taskId: z.string().trim().min(1).max(100), userIds: memberIds, expectedRevision: z.number().int().positive() }).strict(),
  z.object({ action: z.literal('create_task'), title: z.string().trim().min(1).max(300), notes: z.string().trim().max(2000), phase: z.string().min(1).max(40), userIds: memberIds, projectRevision: z.number().int().positive() }).strict(),
]);

export const clientProjectAssignmentWorkspaceSchema = z.object({
  currentUserId: uuid,
  ownerId: uuid.nullable(),
  isOwner: z.boolean(),
  isManager: z.boolean(),
  members: z.array(z.object({ id: uuid, name: z.string() })),
  managers: z.array(uuid),
  tasks: z.array(z.object({ taskId: z.string(), revision: z.number().int().positive(), assignees: z.array(uuid) })),
  assignmentRevision: z.number().int().positive(),
  activePhases: z.array(z.string()),
});

export type ClientProjectAssignmentWorkspace = z.infer<typeof clientProjectAssignmentWorkspaceSchema>;
