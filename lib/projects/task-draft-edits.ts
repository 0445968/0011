import {z} from 'zod';
import {projectPhaseSchema} from './lifecycle-schema';
const revision=z.number().int().nonnegative();
const ids=z.array(z.string().uuid()).max(12).refine(items=>new Set(items).size===items.length);
const tag=z.object({label:z.string().trim().min(1).max(40),color:z.enum(['gray','blue','purple','green','yellow','orange','red','pink','cyan'])}).strict();
export const taskDraftEditsSchema=z.object({
 controlRevision:revision.optional(),
 assignment:z.object({side:z.enum(['bivi','client']),userIds:ids}).strict().optional(),
 priority:z.enum(['low','medium','high','urgent']).nullable().optional(),
 review:z.object({requiresStaffReview:z.boolean(),requiresClientReview:z.boolean()}).strict().optional(),
 control:z.object({ownerType:z.enum(['bivi','client']),phase:projectPhaseSchema,serviceId:z.string().max(100).nullable(),dependsOn:z.string().max(100).nullable(),blockerOwner:z.enum(['bivi','client','external']).nullable()}).strict().optional(),
 tags:z.object({revision,tags:z.array(z.string().trim().min(1).max(40)).max(20),newTags:z.array(tag).max(20)}).strict().optional(),
}).strict();
export type TaskDraftEdits=z.infer<typeof taskDraftEditsSchema>;
