import { z } from 'zod';
import { industries } from './industries';
export const businessIdSchema = z.string().regex(/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{7}$/);
export const contactStatusSchema = z.enum(['active','inactive','archived']);
export const companyStatusSchema = z.enum(['prospect','active','inactive','archived']);
export const sourceSchema = z.enum(['get_started','project_onboarding','referral','manual','import','legacy']);
export const companyRoleSchema = z.enum(['ceo','owner','executive','employee','advisor','other']);
export const projectRoleSchema = z.enum(['','project_manager','decision_maker','approver','primary_contact','contributor','consultant','supplier','observer']);
export const emailEntrySchema = z.object({ email:z.string().trim().toLowerCase().email().max(254),kind:z.enum(['work','personal','other']),is_primary:z.boolean() }).strict();
export const phoneEntrySchema = z.object({ phone:z.string().trim().min(1).max(80),kind:z.enum(['work','personal','other']),is_primary:z.boolean() }).strict();
export const channelDetailsSchema=z.object({ emails:z.array(emailEntrySchema).min(1).max(20),phones:z.array(phoneEntrySchema).max(20) }).superRefine((value,context)=>{
 if(value.emails.filter(entry=>entry.is_primary).length!==1)context.addIssue({code:z.ZodIssueCode.custom,path:['emails'],message:'Choose exactly one primary email.'});
 if(value.phones.length&&value.phones.filter(entry=>entry.is_primary).length!==1)context.addIssue({code:z.ZodIssueCode.custom,path:['phones'],message:'Choose exactly one primary phone.'});
 if(new Set(value.emails.map(entry=>entry.email)).size!==value.emails.length)context.addIssue({code:z.ZodIssueCode.custom,path:['emails'],message:'An email can only appear once.'});
 if(new Set(value.phones.map(entry=>entry.phone)).size!==value.phones.length)context.addIssue({code:z.ZodIssueCode.custom,path:['phones'],message:'A phone number can only appear once.'});
});
export const companyAddressSchema=z.object({line1:z.string().max(200).optional(),line2:z.string().max(200).optional(),city:z.string().max(200).optional(),region:z.string().max(200).optional(),postal_code:z.string().max(200).optional(),country:z.string().regex(/^([A-Z]{2})?$/).optional()}).strict();
export const companyProfileSchema=z.object({ status:companyStatusSchema,website:z.union([z.literal(''),z.string().url().max(2000).refine(value=>/^https?:\/\//.test(value))]),address:companyAddressSchema,industry_id:z.string().nullable(),subindustry_id:z.string().nullable(),legal_name:z.string().trim().max(200),organization_type:z.string().trim().max(100),founding_year:z.number().int().min(1800).max(2200).nullable(),employee_count:z.number().int().min(0).max(1000000000).nullable() }).strict().superRefine((value,context)=>{
 const industry=industries.find(industry=>industry.id===value.industry_id);
 if(value.industry_id&&!industry)context.addIssue({code:z.ZodIssueCode.custom,path:['industry_id'],message:'Choose a listed industry.'});
 if(value.subindustry_id&&!industry?.subindustries.some(subindustry=>subindustry.id===value.subindustry_id))context.addIssue({code:z.ZodIssueCode.custom,path:['subindustry_id'],message:'Choose a subindustry belonging to this industry.'});
});
export type ContactChannelDetails=z.infer<typeof channelDetailsSchema>;
export type CompanyProfile=z.infer<typeof companyProfileSchema>;
