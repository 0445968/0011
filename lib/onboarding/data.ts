import 'server-only';
import {z} from 'zod';
import type {SupabaseClient} from '@supabase/supabase-js';
import {readinessBodySchema} from './schema';
const record=z.object({request_id:z.string().uuid(),proposal_version:z.number().int(),revision:z.number().int(),state:z.enum(['pending','ready']),body:readinessBodySchema,released_at:z.string().nullable(),released_by:z.string().nullable(),updated_at:z.string(),updated_by:z.string().nullable()});
export type ReadinessRecord=z.infer<typeof record>;
const event=z.object({id:z.number(),action:z.enum(['save','release','hold']),reason:z.string(),created_at:z.string(),actor:z.string().nullable(),snapshot:z.object({proposalVersion:z.number(),revision:z.number(),state:z.enum(['pending','ready']),body:readinessBodySchema})});
export type ReadinessEvent=z.infer<typeof event>;
export async function getReadiness(client:SupabaseClient,id:string){
 const {data,error}=await client.from('inquiry_readiness').select('*').eq('request_id',id).maybeSingle();
 if(error)throw new Error('Onboarding readiness could not be loaded. Check the fourth migration.');
 const history=await client.from('inquiry_readiness_history').select('*').eq('request_id',id).order('id',{ascending:false}).limit(50);
 if(history.error)throw new Error('Readiness history could not be loaded.');
 return {record:data?record.parse(data):null,history:z.array(event).parse(history.data??[])};
}
