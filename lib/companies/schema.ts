import {z} from 'zod';
import {companyProfileSchema,type CompanyProfile} from '@/lib/business/schema';
export const companyEditSchema=z.object({id:z.string().uuid().nullable(),revision:z.number().int().min(0),name:z.string().trim().min(1).max(200),body:companyProfileSchema}).strict();
export type Company=CompanyProfile & {logo_path?:string|null;id:string;public_id:string;name:string;created_at:string;updated_at:string;revision:number;industry_name:string|null;subindustry_name:string|null;ceo_name:string|null;ceo_contact_id:number|null;lead_source:string;source_reference:string;};
