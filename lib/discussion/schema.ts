import {z} from 'zod';
const text=z.string().trim().min(1).max(4000);
export const commentCommandSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('create'),id:z.string().uuid(),body:text,taskId:z.string().min(1).max(100).nullable(),expectedProjectRevision:z.number().int().min(1).max(99999999)}).strict(),
 z.object({action:z.literal('edit'),id:z.string().uuid(),body:text,expectedRevision:z.number().int().min(1).max(99999999)}).strict(),
 z.object({action:z.literal('remove'),id:z.string().uuid(),expectedRevision:z.number().int().min(1).max(99999999)}).strict(),
]);
