import {z} from 'zod';
const text=(n:number)=>z.string().trim().max(n);
export const coreChecklistIds=['contacts','scope-inputs','assets'] as const;
export const checklistBodySchema=z.object({
 contactName:text(200),contactEmail:text(254).refine(v=>!v||z.string().email().safeParse(v).success),approver:text(200),
 kickoffStatus:z.enum(['pending','scheduled','held']),kickoffDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),kickoffDetails:text(2000),kickoffNotes:text(4000),
 items:z.array(z.object({id:text(100).min(1),title:text(300).min(1),owner:z.enum(['bivi','client']),required:z.boolean(),status:z.enum(['pending','received','complete','waived']),notes:text(2000)}).strict()).min(3).max(30),
}).strict().superRefine((b,ctx)=>{
 if(new Set(b.items.map(i=>i.id)).size!==b.items.length)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Checklist IDs must be unique.'});
 for(const id of coreChecklistIds)if(!b.items.some(i=>i.id===id&&i.required))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Core checklist items must remain required.'});
 if(b.items.some(i=>(i.status==='complete'||i.status==='waived')&&!i.notes))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Completed and waived items require evidence or a reason.'});
});
export type ChecklistBody=z.infer<typeof checklistBodySchema>;
export const checklistCommandSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('start'),expectedRevision:z.literal(0)}).strict(),
 z.object({action:z.literal('save'),expectedRevision:z.number().int().min(1),body:checklistBodySchema}).strict(),
 z.object({action:z.literal('complete'),expectedRevision:z.number().int().min(1)}).strict(),
 z.object({action:z.literal('reopen'),expectedRevision:z.number().int().min(1),reason:text(2000).min(1)}).strict(),
]);
export function outstandingItems(body:ChecklistBody){return body.items.filter(i=>i.required&&!['complete','waived'].includes(i.status));}
