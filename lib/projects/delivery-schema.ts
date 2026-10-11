import { z } from 'zod';

const trimmed = (max: number) => z.string().trim().max(max);
const nullableDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();

export const deliverableStatusSchema = z.enum(['pending_review','approved','changes_requested','superseded']);
export const changeRequestStateSchema = z.enum(['requested','evaluating','proposed','accepted','rejected','applied','cancelled']);
export const qaStatusSchema = z.enum(['pending','passed','failed','waived']);
export const handoffStatusSchema = z.enum(['pending','complete','waived']);

export const staffDeliveryCommandSchema = z.discriminatedUnion('action', [
  z.object({action:z.literal('add_deliverable'),deliverableId:trimmed(100).min(1).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/),title:trimmed(300).min(1),description:trimmed(4000),requiresApproval:z.boolean()}).strict(),
  z.object({action:z.literal('issue_deliverable'),deliverableId:trimmed(100).min(1),expectedRevision:z.number().int().positive(),summary:trimmed(4000).min(1),artifactUrl:z.string().trim().max(2000),notes:trimmed(4000)}).strict(),
  z.object({action:z.literal('set_qa'),checkId:trimmed(100).min(1),expectedRevision:z.number().int().positive(),status:qaStatusSchema,notes:trimmed(4000)}).strict(),
  z.object({action:z.literal('set_handoff'),itemId:trimmed(100).min(1),expectedRevision:z.number().int().positive(),status:handoffStatusSchema,notes:trimmed(4000)}).strict(),
  z.object({action:z.literal('release'),expectedRevision:z.number().int().positive(),releaseNotes:trimmed(8000).min(1)}).strict(),
  z.object({action:z.literal('close'),expectedRevision:z.number().int().positive(),supportStart:nullableDate,supportEnd:nullableDate,supportTerms:trimmed(6000).min(1),summary:trimmed(6000).min(1)}).strict(),
]);

export const staffChangeCommandSchema = z.discriminatedUnion('action', [
  z.object({action:z.literal('create'),id:z.string().uuid(),title:trimmed(300).min(1),description:trimmed(8000).min(1)}).strict(),
  z.object({action:z.literal('evaluate'),id:z.string().uuid(),expectedRevision:z.number().int().positive(),staffNote:trimmed(4000).min(1)}).strict(),
  z.object({action:z.literal('propose'),id:z.string().uuid(),expectedRevision:z.number().int().positive(),costImpact:trimmed(3000),scheduleImpact:trimmed(3000),scopeImpact:trimmed(6000).min(1),staffNote:trimmed(4000)}).strict(),
  z.object({action:z.literal('apply'),id:z.string().uuid(),expectedRevision:z.number().int().positive(),staffNote:trimmed(4000).min(1)}).strict(),
  z.object({action:z.literal('cancel'),id:z.string().uuid(),expectedRevision:z.number().int().positive(),staffNote:trimmed(4000).min(1)}).strict(),
]);

export const clientDeliveryCommandSchema = z.discriminatedUnion('action', [
  z.object({action:z.literal('review_deliverable'),deliverableId:trimmed(100).min(1),version:z.number().int().positive(),decision:z.enum(['approved','changes_requested']),note:trimmed(4000)}).strict(),
  z.object({action:z.literal('create_change'),id:z.string().uuid(),title:trimmed(300).min(1),description:trimmed(8000).min(1)}).strict(),
  z.object({action:z.literal('decide_change'),id:z.string().uuid(),expectedRevision:z.number().int().positive(),decision:z.enum(['accepted','rejected']),note:trimmed(4000)}).strict(),
  z.object({action:z.literal('acknowledge_release'),expectedRevision:z.number().int().positive()}).strict(),
]).superRefine((value,ctx)=>{if(value.action==='review_deliverable'&&value.decision==='changes_requested'&&!value.note)ctx.addIssue({code:z.ZodIssueCode.custom,path:['note'],message:'Describe the requested changes.'});});

export type DeliverableStatus=z.infer<typeof deliverableStatusSchema>;
export type ChangeRequestState=z.infer<typeof changeRequestStateSchema>;
export type QaStatus=z.infer<typeof qaStatusSchema>;
export type HandoffStatus=z.infer<typeof handoffStatusSchema>;
