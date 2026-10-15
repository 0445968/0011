import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import {cleanCompanySearch} from '@/lib/companies/data';
import {proposalStatusLabels,type ProposalStatus} from './schema';
export type ProposalSummary={request_id:string;version:number;revision:number;status:ProposalStatus;title:string;created_at:string;updated_at:string;issued_at:string|null;accepted_on:string|null;inquiry_status:string;contact_name:string;contact_email:string;company_name:string;company_id:string|null;company_public_id:string|null;is_latest:boolean};
export async function listProposalDirectory(client:SupabaseClient,p:Record<string,string|undefined>){
 let query=client.from('proposals_directory').select('*',{count:'exact'});const q=cleanCompanySearch(p.q||'');if(q)query=query.or(`title.ilike.%${q}%,company_name.ilike.%${q}%,company_public_id.ilike.%${q}%,contact_name.ilike.%${q}%,contact_email.ilike.%${q}%`);
 if(p.scope!=='all')query=query.eq('is_latest',true);
 if(Object.keys(proposalStatusLabels).includes(p.status||''))query=query.eq('status',p.status!);
 if(['new','qualified','declined'].includes(p.inquiry||''))query=query.eq('inquiry_status',p.inquiry!);
 const sort=({updated:'updated_at',created:'created_at',issued:'issued_at',accepted:'accepted_on',company:'company_sort',title:'title_sort',status:'status'} as Record<string,string>)[p.sort||'']||'updated_at';
 const page=Math.max(1,Math.min(100000,Math.floor(Number(p.page)||1)));const result=await query.order(sort,{ascending:p.direction==='asc',nullsFirst:false}).order('request_id').order('version',{ascending:false}).range((page-1)*25,page*25-1);
 if(result.error)throw new Error('Proposals could not load. Check migration 023.');return{rows:(result.data||[]) as ProposalSummary[],total:result.count||0,page};
}
