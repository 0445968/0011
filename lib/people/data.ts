import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Person } from './schema';
export const PEOPLE_PAGE_SIZE = 25;
export async function listPeople(client: SupabaseClient, options: { search?: string; label?: string; sort?: string; direction?: string; page?: number; inquiry?: string }) {
 const page=Math.max(1,Math.min(100000,options.page||1));
 let query=client.from('people_directory').select('*',{count:'exact'});
 const term=(options.search||'').trim().slice(0,100).replace(/[%_(),\\]/g,' ').trim();
 if(term){ if(/^[1-9]\d{0,8}$/.test(term)) query=query.eq('id',Number(term)); else query=query.or(`name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,company_name.ilike.%${term}%,company_search.ilike.%${term}%`); }
 if(['lead','client','partner','collaborator','vendor'].includes(options.label||''))query=query.contains('labels',[options.label!]);
 if(options.inquiry){const links=await client.from('people_inquiry_links').select('contact_id').eq('request_id',options.inquiry).limit(100);if(links.error)throw new Error('People relationships could not load.');query=query.in('id',(links.data||[]).map(l=>l.contact_id));}
 const sort=options.sort==='company'?'company_sort':options.sort==='updated'?'updated_at':options.sort==='id'?'id':'name_sort';
 const result=await query.order(sort,{ascending:options.direction!=='desc'}).order('id').range((page-1)*25,page*25-1);
 if(result.error)throw new Error('People could not load. Apply the People database migration and try again.');
 const rows=(result.data||[]) as Person[];
 const links=rows.length?await client.from('people_inquiry_links').select('contact_id,request_id,company_name').in('contact_id',rows.map(row=>row.id)): {data:[],error:null};
 if(links.error)throw new Error('People relationships could not load.');
 return {rows,total:result.count||0,page,links:links.data||[]};
}
