import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import {z} from 'zod';
import {proposalBodySchema, type ProposalBody} from './schema';
import type {InquiryRecord} from '@/lib/admin/inquiries';
import {getServiceBlueprint} from '@/data/serviceCatalog';
const record=z.object({request_id:z.string().uuid(),version:z.number().int(),revision:z.number().int(),status:z.enum(['draft','issued','accepted','declined','superseded']),body:proposalBodySchema,created_at:z.string(),updated_at:z.string(),issued_at:z.string().nullable(),accepted_on:z.string().nullable(),accepted_by:z.string().nullable(),acceptance_evidence:z.string().nullable(),recorded_by:z.string().nullable()});
export type ProposalRecord=z.infer<typeof record>;
export async function listProposals(client:SupabaseClient,id:string){
  const {data,error}=await client.from('inquiry_proposals').select('*').eq('request_id',id).order('version',{ascending:false});
  if(error)throw new Error('Proposals could not be loaded. Check the proposal migration.');
  return z.array(record).parse(data??[]);
}
export function proposalSeed(inquiry:InquiryRecord):ProposalBody{
  const blueprints=inquiry.payload.services.map(s=>getServiceBlueprint(s.serviceId));
  const collect=(key:'deliverables'|'exclusions')=>blueprints.flatMap((b,i)=>b?[`${inquiry.payload.services[i].serviceName||b.name}:`,...b[key].map(x=>`• ${x}`)]:[]).join('\n');
  return proposalBodySchema.parse({title:`${inquiry.payload.company||inquiry.payload.name} — project proposal`.slice(0,200),summary:inquiry.payload.goals.slice(0,4000),items:inquiry.payload.services.slice(0,20).map(s=>({serviceId:s.serviceId,name:s.serviceName||getServiceBlueprint(s.serviceId)?.name||s.serviceId,quantity:Math.min(1000,Math.max(1,Math.floor(s.quantity))),blueprintVersion:s.blueprintVersion??null})),deliverables:collect('deliverables').slice(0,6000),exclusions:collect('exclusions').slice(0,4000),clientInputs:'',revisions:'',schedule:'',fees:''});
}
