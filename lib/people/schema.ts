import {channelDetailsSchema,contactStatusSchema,sourceSchema,companyRoleSchema,projectRoleSchema} from '@/lib/business/schema';
import { z } from 'zod';
export const peopleLabels = { lead: { name: 'Leads', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' }, client: { name: 'Clients', color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' }, partner: { name: 'Partners', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200' }, collaborator: { name: 'Collaborators', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' }, vendor: { name: 'Vendors', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' } } as const;
export const personSchema = z.object({ name: z.string().trim().min(1).max(200), email: z.string().trim().toLowerCase().email().max(254), phone: z.string().trim().max(80), company_name: z.string().trim().max(200), labels: z.array(z.enum(['lead','client','partner','collaborator','vendor'])).min(1).max(5), notes: z.string().max(4000) }).strict();
export type PersonBody = z.infer<typeof personSchema>;
export type Person = PersonBody & { id: number; public_id?: string;avatar_path?:string|null; job_title?: string; company_role?: 'ceo'|'owner'|'executive'|'employee'|'advisor'|'other'; company_id?: string|null; assigned_company_name?: string|null;referral_contact_id?:number|null;referral_company_id?:string|null; company_address?: Record<string,string>|null; status?:'active'|'inactive'|'archived';lead_source?:'get_started'|'project_onboarding'|'referral'|'manual'|'import'|'legacy';source_reference?:string;revision: number; created_at: string; updated_at: string };
export const contactId = z.union([z.number(), z.string().regex(/^[1-9]\d{0,8}$/).transform(Number)]).pipe(z.number().int().min(1).max(999999999));

export const expandedPersonSchema = personSchema.extend({
 company_id:z.string().uuid().nullable().optional(),referral_contact_id:contactId.nullable().optional(),referral_company_id:z.string().uuid().nullable().optional(),
 channels:channelDetailsSchema,job_title:z.string().trim().max(200),company_role:companyRoleSchema,
 status:contactStatusSchema,lead_source:sourceSchema,source_reference:z.string().trim().max(500),
 project_roles:z.array(z.object({request_id:z.string().uuid(),role:projectRoleSchema}).strict()).max(200)
}).superRefine((body,ctx)=>{
 if(body.email!==body.channels.emails.find(e=>e.is_primary)?.email||body.phone!==(body.channels.phones.find(p=>p.is_primary)?.phone||''))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Primary contact details must match.'});
 if(new Set(body.project_roles.map(p=>p.request_id)).size!==body.project_roles.length)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Duplicate project role.'});
});
export type ExpandedPersonBody=z.infer<typeof expandedPersonSchema>;
