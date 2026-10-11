import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { changeRequestStateSchema, deliverableStatusSchema, handoffStatusSchema, qaStatusSchema } from './delivery-schema';

const deliverable=z.object({request_id:z.string().uuid(),deliverable_id:z.string(),title:z.string(),description:z.string(),requires_approval:z.boolean(),revision:z.number().int().positive(),updated_at:z.string()});
const version=z.object({request_id:z.string().uuid(),deliverable_id:z.string(),version:z.number().int().positive(),revision_round:z.number().int().positive(),summary:z.string(),artifact_url:z.string().nullable(),notes:z.string(),status:deliverableStatusSchema,created_at:z.string(),decided_at:z.string().nullable(),decision_note:z.string()});
const change=z.object({id:z.string().uuid(),request_id:z.string().uuid(),revision:z.number().int().positive(),title:z.string(),description:z.string(),requester_type:z.enum(['client','bivi']),state:changeRequestStateSchema,cost_impact:z.string(),schedule_impact:z.string(),scope_impact:z.string(),staff_note:z.string(),client_note:z.string(),created_at:z.string(),updated_at:z.string(),proposed_at:z.string().nullable(),decided_at:z.string().nullable(),applied_at:z.string().nullable()});
const qa=z.object({request_id:z.string().uuid(),check_id:z.string(),title:z.string(),required:z.boolean(),status:qaStatusSchema,notes:z.string(),revision:z.number().int().positive(),updated_at:z.string()});
const handoff=z.object({request_id:z.string().uuid(),item_id:z.string(),title:z.string(),required:z.boolean(),status:handoffStatusSchema,notes:z.string(),revision:z.number().int().positive(),updated_at:z.string()});
const closeout=z.object({request_id:z.string().uuid(),revision:z.number().int().positive(),release_state:z.enum(['preparing','released']),release_notes:z.string(),released_at:z.string().nullable(),client_receipt_at:z.string().nullable(),support_start:z.string().nullable(),support_end:z.string().nullable(),support_terms:z.string(),closeout_summary:z.string(),closed_at:z.string().nullable(),updated_at:z.string()});

export type ProjectDeliverable=z.infer<typeof deliverable>;
export type ProjectDeliverableVersion=z.infer<typeof version>;
export type ProjectChangeRequest=z.infer<typeof change>;
export type ProjectQaCheck=z.infer<typeof qa>;
export type ProjectHandoffItem=z.infer<typeof handoff>;
export type ProjectCloseout=z.infer<typeof closeout>;

export async function getProjectDelivery(client:SupabaseClient,requestId:string){
 const [deliverables,versions,changes,qaChecks,handoffItems,closeoutRow]=await Promise.all([
  client.from('project_deliverables').select('request_id,deliverable_id,title,description,requires_approval,revision,updated_at').eq('request_id',requestId).order('created_at',{ascending:true}),
  client.from('project_deliverable_versions').select('request_id,deliverable_id,version,revision_round,summary,artifact_url,notes,status,created_at,decided_at,decision_note').eq('request_id',requestId).order('created_at',{ascending:false}),
  client.from('project_change_requests').select('id,request_id,revision,title,description,requester_type,state,cost_impact,schedule_impact,scope_impact,staff_note,client_note,created_at,updated_at,proposed_at,decided_at,applied_at').eq('request_id',requestId).order('created_at',{ascending:false}),
  client.from('project_qa_checks').select('request_id,check_id,title,required,status,notes,revision,updated_at').eq('request_id',requestId).order('check_id',{ascending:true}),
  client.from('project_handoff_items').select('request_id,item_id,title,required,status,notes,revision,updated_at').eq('request_id',requestId).order('item_id',{ascending:true}),
  client.from('project_closeout').select('request_id,revision,release_state,release_notes,released_at,client_receipt_at,support_start,support_end,support_terms,closeout_summary,closed_at,updated_at').eq('request_id',requestId).maybeSingle(),
 ]);
 if(deliverables.error||versions.error||changes.error||qaChecks.error||handoffItems.error||closeoutRow.error)throw new Error('Delivery controls could not be loaded. Apply migration 013.');
 return {deliverables:z.array(deliverable).parse(deliverables.data??[]),versions:z.array(version).parse(versions.data??[]),changes:z.array(change).parse(changes.data??[]),qaChecks:z.array(qa).parse(qaChecks.data??[]),handoffItems:z.array(handoff).parse(handoffItems.data??[]),closeout:closeoutRow.data?closeout.parse(closeoutRow.data):null};
}
