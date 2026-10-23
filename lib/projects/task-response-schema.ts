import { z } from 'zod';

export const taskResponseKinds = [
  'completion', 'clarification', 'postponement', 'modification', 'decline',
] as const;

export const clientTaskResponseCommandSchema = z.object({
  taskId: z.string().trim().min(1).max(100),
  kind: z.enum(taskResponseKinds),
  note: z.string().trim().min(5).max(2000),
  projectRevision: z.number().int().positive(),
}).strict();

export const staffTaskResponseCommandSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('policy'),
    taskId: z.string().trim().min(1).max(100),
    allowDecline: z.boolean(),
    declineGuidance: z.string().max(2000),
    expectedRevision: z.number().int().nonnegative(),
  }).strict(),
  z.object({
    action: z.literal('review'),
    responseId: z.string().uuid(),
    decision: z.enum(['accept', 'reject']),
    note: z.string().trim().max(2000),
    projectRevision: z.number().int().positive(),
  }).strict(),
]);

export const taskResponseWorkspaceSchema = z.object({
  projectRevision: z.number().int().positive(),
  total:z.number().optional(), pendingTotal:z.number().optional(), timezone:z.string().optional(),
  actors:z.record(z.object({id:z.string(),label:z.string(),kind:z.string().nullable(),avatarPath:z.string().nullable()})).optional(),
  policies: z.array(z.object({
    taskId: z.string(),
    allowed: z.boolean(),
    allowDecline: z.boolean(),
    declineGuidance: z.string(),
    revision: z.number().int().nonnegative(),
  })),
  responses: z.array(z.object({
    id: z.string().uuid(),
    taskId: z.string(),
    kind: z.enum(taskResponseKinds),
    note: z.string(),
    status: z.enum(['pending', 'accepted', 'rejected']),
    submittedAt: z.string(),
    submittedBy: z.string().uuid().nullable(),
    reviewNote: z.string(),
    reviewedAt: z.string().nullable(),
    reviewedBy:z.string().nullable().optional(), legacyBaseline:z.boolean().optional(),
  })),
});
export type TaskResponseWorkspace = z.infer<typeof taskResponseWorkspaceSchema>;

export const taskResponseLabels: Record<typeof taskResponseKinds[number], string> = {
  completion: 'Submit for completion review',
  clarification: 'Request clarification',
  postponement: 'Request postponement',
  modification: 'Request modification',
  decline: 'Decline task',
};
