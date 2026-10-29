import {z} from 'zod';
import {validTaskTiming} from './task-timing';
import {taskMetrics} from './metrics';
const text=(n:number)=>z.string().trim().max(n);const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();
export const projectBodySchema=z.object({title:text(200).min(1),owner:text(200),notes:text(4000),milestones:z.array(z.object({id:text(100).min(1),title:text(300).min(1),dueOn:date,status:z.enum(['planned','in_progress','done'])}).strict()).max(20),tasks:z.array(z.object({archived:z.boolean().optional(),id:text(100).min(1),title:text(300).min(1),owner:text(200),dueOn:date,startOn:date.optional(),startTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),dueTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),timeZone:z.string().max(100).refine(value=>{try{new Intl.DateTimeFormat('en-US',{timeZone:value});return true;}catch{return false;}},'Choose a valid timezone.').optional(),status:z.enum(['todo','doing','blocked','done']),milestoneId:text(100).nullable(),notes:text(2000)}).strict()).max(100)}).strict().superRefine((b,ctx)=>{
 for(const task of b.tasks)if(!validTaskTiming(task))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Check task start and due dates and times.'});
 for(const list of [b.milestones,b.tasks])if(new Set(list.map(x=>x.id)).size!==list.length)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Duplicate IDs.'});
 if(b.tasks.some(t=>t.milestoneId!==null&&!b.milestones.some(m=>m.id===t.milestoneId)))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Invalid milestone.'});
});
export type ProjectBody=z.infer<typeof projectBodySchema>;
export const projectCommandSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('activate'),expectedRevision:z.literal(0)}).strict(),
 z.object({action:z.literal('save'),expectedRevision:z.number().int().min(1),body:projectBodySchema}).strict(),
 z.object({action:z.enum(['hold','resume','complete','reopen']),expectedRevision:z.number().int().min(1),reason:text(2000).min(1)}).strict(),
]);
export const projectStates={active:'Active',on_hold:'On hold',completed:'Completed'};
export function projectProgress(body:ProjectBody){return taskMetrics(body.tasks);}
