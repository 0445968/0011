import 'server-only';
import {z} from 'zod';import type {SupabaseClient} from '@supabase/supabase-js';import {checklistBodySchema} from './checklist-schema';
const schema=z.object({request_id:z.string().uuid(),proposal_version:z.number().int(),revision:z.number().int(),state:z.enum(['in_progress','complete']),body:checklistBodySchema,completed_readiness_revision:z.number().nullable(),completed_at:z.string().nullable(),completed_by:z.string().nullable(),updated_at:z.string()});
export type ChecklistRecord=z.infer<typeof schema>;
const event=z.object({id:z.number(),action:z.enum(['start','save','complete','reopen']),reason:z.string(),actor:z.string().nullable(),created_at:z.string(),snapshot:z.object({revision:z.number(),proposalVersion:z.number(),state:z.enum(['in_progress','complete']),body:checklistBodySchema,readinessRevision:z.number().nullable()})});
export type ChecklistEvent=z.infer<typeof event>;
export async function getChecklist(client:SupabaseClient,id:string){
 const result=await client.from('inquiry_onboarding').select('*').eq('request_id',id).maybeSingle();if(result.error)throw new Error('Onboarding could not be loaded. Check the fifth migration.');
 const history=await client.from('inquiry_onboarding_history').select('*').eq('request_id',id).order('id',{ascending:false}).limit(50);if(history.error)throw new Error('Onboarding history could not be loaded.');
 return {record:result.data?schema.parse(result.data):null,history:z.array(event).parse(history.data??[])};
}
