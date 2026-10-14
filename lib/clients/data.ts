import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import {cleanCompanySearch} from '@/lib/companies/data';
import type {Company} from '@/lib/companies/schema';
export const clientWorkLabels={active:'Active work',on_hold:'On hold',completed:'Completed work',onboarding:'Accepted inquiry'} as const;
export type ClientCompany=Company & {primary_contact_id:number|null;primary_contact_name:string|null;primary_contact_email:string|null;project_count:number;active_projects:number;held_projects:number;completed_projects:number;accepted_inquiries:number;active_people:number;linked_accounts:number;portal_accounts:number;work_status:keyof typeof clientWorkLabels;last_activity:string};
export async function listClients(client:SupabaseClient,p:Record<string,string|undefined>){
 let query=client.from('clients_directory').select('*',{count:'exact'});const q=cleanCompanySearch(p.q||'');if(q)query=query.or(`name.ilike.%${q}%,public_id.ilike.%${q}%,legal_name.ilike.%${q}%,primary_contact_name.ilike.%${q}%`);
 if(Object.keys(clientWorkLabels).includes(p.status||''))query=query.eq('work_status',p.status!);if(p.industry)query=query.eq('industry_id',p.industry);if(p.access==='enabled')query=query.gt('portal_accounts',0);if(p.access==='none')query=query.eq('portal_accounts',0);
 const page=Math.max(1,Math.min(100000,Number(p.page)||1));const sort=({name:'name_sort',activity:'last_activity',projects:'active_projects',id:'public_id'} as Record<string,string>)[p.sort||'']||'name_sort';
 const result=await query.order(sort,{ascending:p.direction!=='desc'}).order('id').range((page-1)*25,page*25-1);if(result.error)throw new Error('Clients could not load. Check migration 022.');return{rows:(result.data||[]) as ClientCompany[],total:result.count||0,page};
}
