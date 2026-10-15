import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {cleanCompanySearch} from '@/lib/companies/data';
import {formTypes,type FormRecord,type FormTarget} from './links';
export async function listForms(client:SupabaseClient,p:Record<string,string|undefined>) {
 let query=client.from('staff_forms').select('*',{count:'exact'});
 const term=cleanCompanySearch(p.q||'');
 if(term)query=query.or(`title.ilike.%${term}%,contact_name.ilike.%${term}%,company_name.ilike.%${term}%,project_title.ilike.%${term}%,project_public_id.ilike.%${term}%`);
 if(Object.hasOwn(formTypes,p.type||''))query=query.eq('form_type',p.type!);
 if(['pending','submitted','clarification','accepted','waived'].includes(p.status||''))query=query.eq('status',p.status!);
 if(['client','bivi'].includes(p.owner||''))query=query.eq('owner',p.owner!);
 if(p.required==='yes')query=query.eq('required',true);else if(p.required==='no')query=query.eq('required',false);
 if(p.response==='yes')query=query.eq('has_response',true);else if(p.response==='no')query=query.eq('has_response',false);
 if(z.string().uuid().safeParse(p.record).success)query=query.eq('request_id',p.record!);
 const page=Math.max(1,Math.min(100000,Math.floor(Number(p.page)||1)));
 const sort=({updated:'updated_at',due:'due_on',title:'title',company:'company_name'} as Record<string,string>)[p.sort||'']||'updated_at';
 const result=await query.order(sort,{ascending:p.direction==='asc',nullsFirst:false}).order('form_key').range((page-1)*25,page*25-1);
 if(result.error)throw new Error('Forms could not load. Refresh and try again.');
 return{rows:(result.data||[]) as FormRecord[],total:result.count||0,page};
}
export async function listFormTargets(client:SupabaseClient,p:Record<string,string|undefined>) {
 let query=client.from('staff_form_targets').select('*',{count:'exact'});
 const term=cleanCompanySearch(p.q||'');if(term)query=query.or(`contact_name.ilike.%${term}%,company_name.ilike.%${term}%,project_title.ilike.%${term}%,project_public_id.ilike.%${term}%`);
 const page=Math.max(1,Math.min(100000,Math.floor(Number(p.page)||1)));
 const result=await query.order('updated_at',{ascending:false}).order('request_id').range((page-1)*25,page*25-1);
 if(result.error)throw new Error('Onboarding records could not load. Refresh and try again.');
 return{rows:(result.data||[]) as FormTarget[],total:result.count||0,page};
}
