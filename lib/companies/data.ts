import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import {z} from 'zod';
import type {Company} from './schema';
export function cleanCompanySearch(value:string){return value.trim().slice(0,100).replace(/[%_(),\\"]/g,' ').trim();}
export async function listCompanies(client:SupabaseClient,p:Record<string,string|undefined>){
 let query=client.from('company_directory').select('*',{count:'exact'});const q=cleanCompanySearch(p.q||'');if(q)query=query.or(`name.ilike.%${q}%,public_id.ilike.%${q}%,legal_name.ilike.%${q}%`);
 if(['prospect','active','inactive','archived'].includes(p.status||''))query=query.eq('status',p.status!);
 if(p.industry)query=query.eq('industry_id',p.industry);if(p.subindustry)query=query.eq('subindustry_id',p.subindustry);
 if(/^[A-Z]{2}$/.test(p.country||''))query=query.eq('country',p.country!);if(p.city)query=query.ilike('city',`%${cleanCompanySearch(p.city)}%`);
 const sort=({name:'name_sort',id:'public_id',updated:'updated_at',industry:'industry_name'} as Record<string,string>)[p.sort||'']||'name_sort';const page=Math.max(1,Math.min(100000,Number(p.page)||1));
 const result=await query.order(sort,{ascending:p.direction!=='desc'}).order('id').range((page-1)*25,page*25-1);if(result.error)throw new Error('Companies could not load. Check the company workspace migration.');return{rows:(result.data||[]) as Company[],total:result.count||0,page};
}
export async function listAssignmentProjects(client:SupabaseClient,q:string,page=1){const term=cleanCompanySearch(q);let query=client.from('staff_project_assignment_directory').select('*',{count:'exact'});if(term)query=query.or(`title.ilike.%${term}%,public_id.ilike.%${term}%`);page=Math.max(1,Math.min(100000,page||1));const result=await query.order('activated_at',{ascending:false}).order('request_id').range((page-1)*25,page*25-1);if(result.error)throw new Error('Projects could not load.');return{rows:result.data||[],total:result.count||0,page};}
export const companyQueryId=z.string().uuid();
