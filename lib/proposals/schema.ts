import { z } from 'zod';
const text = (max: number) => z.string().trim().max(max);
export const proposalBodySchema = z.object({
  title: text(200).min(1), summary: text(4000),
  items: z.array(z.object({ serviceId: text(100).min(1), name: text(200).min(1), quantity: z.number().int().min(1).max(1000), blueprintVersion: z.number().int().min(1).nullable() }).strict()).max(20),
  deliverables: text(6000), exclusions: text(4000), clientInputs: text(4000),
  revisions: text(2000), schedule: text(2000), fees: text(4000),
}).strict();
export type ProposalBody = z.infer<typeof proposalBodySchema>;
export const proposalCommandSchema = z.discriminatedUnion('action', [
  z.object({action:z.literal('create'),expectedVersion:z.number().int().min(0),body:proposalBodySchema}).strict(),
  z.object({action:z.literal('save'),version:z.number().int().min(1),expectedRevision:z.number().int().min(0),body:proposalBodySchema}).strict(),
  z.object({action:z.enum(['issue','decline']),version:z.number().int().min(1),expectedRevision:z.number().int().min(0)}).strict(),
  z.object({action:z.literal('accept'),version:z.number().int().min(1),expectedRevision:z.number().int().min(0),approver:text(200).min(1),acceptedOn:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),evidence:text(2000).min(1)}).strict(),
]);
export const proposalStatusLabels = {draft:'Draft',issued:'Issued',accepted:'Accepted',declined:'Declined',superseded:'Superseded'};
export type ProposalStatus = keyof typeof proposalStatusLabels;
