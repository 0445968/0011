import {z} from 'zod';
export const templateKinds={project:'Project',proposal:'Proposal',brief:'Brief',message:'Message'} as const;
export const templateFields=z.object({title:z.string().trim().min(1).max(200),kind:z.enum(['project','proposal','brief','message']),description:z.string().trim().max(1000),visibility:z.enum(['personal','workspace']),content:z.string().max(30000).refine(value=>!!value.trim(),'Enter template content.'),changeNote:z.string().trim().min(1).max(500)}).strict();
export const templateCommand=z.discriminatedUnion('action',[
 templateFields.extend({action:z.literal('create'),id:z.string().uuid()}).strict(),
 templateFields.extend({action:z.literal('save'),id:z.string().uuid(),expectedVersion:z.number().int().min(1).max(99999999)}).strict(),
 z.object({action:z.enum(['archive','restore','duplicate']),id:z.string().uuid(),expectedVersion:z.number().int().min(1).max(99999999)}).strict(),
]);
export type TemplateFields=z.infer<typeof templateFields>;
export interface StaffTemplate {id:string;owner_id:string|null;title:string;kind:keyof typeof templateKinds;description:string;visibility:'personal'|'workspace';archived:boolean;current_version:number;created_at:string;updated_at:string;}
export interface TemplateVersion {template_id:string;version:number;title:string;kind:keyof typeof templateKinds;description:string;content:string;visibility:'personal'|'workspace';archived:boolean;change_note:string;created_at:string;created_by:string|null;}
