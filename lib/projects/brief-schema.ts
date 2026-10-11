import { z } from 'zod';

const text = (max: number) => z.string().trim().max(max);

export const projectBriefBodySchema = z.object({
  title: text(200).min(1),
  objectives: text(6000),
  audience: text(4000),
  context: text(8000),
  scope: text(8000),
  requirements: text(6000),
  timeline: text(4000),
  assets: text(6000),
  notes: text(4000),
}).strict();

export type ProjectBriefBody = z.infer<typeof projectBriefBodySchema>;

export const projectBriefStatusSchema = z.enum([
  'pending',
  'approved',
  'changes_requested',
  'superseded',
]);

export type ProjectBriefStatus = z.infer<typeof projectBriefStatusSchema>;

export const staffProjectBriefCommandSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('save'),
    expectedRevision: z.number().int().positive(),
    body: projectBriefBodySchema,
  }).strict(),
  z.object({
    action: z.literal('request_review'),
    expectedRevision: z.number().int().positive(),
  }).strict(),
]);

export const clientProjectBriefReviewSchema = z.object({
  version: z.number().int().positive(),
  decision: z.enum(['approved', 'changes_requested']),
  note: text(4000),
}).strict().superRefine((value, context) => {
  if (value.decision === 'changes_requested' && !value.note) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['note'],
      message: 'Describe the changes you need.',
    });
  }
});
