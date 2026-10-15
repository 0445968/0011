import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import {cleanCompanySearch} from '@/lib/companies/data';
import {templateKinds,type StaffTemplate,type TemplateVersion} from './schema';
export async function listTemplates(client:SupabaseClient,userId:string,p:Record<string,string|undefined>){
 let query=client.from('staff_templates').select('*',{count:'exact'});const q=cleanCompanySearch(p.q||'');if(q)query=query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
 if(Object.hasOwn(templateKinds,p.kind||''))query=query.eq('kind',p.kind!);
 if(p.scope==='mine')query=query.eq('owner_id',userId);else if(p.scope==='workspace')query=query.eq('visibility','workspace');
 if(p.state==='archived')query=query.eq('archived',true);else if(p.state!=='all')query=query.eq('archived',false);
 const page=Math.max(1,Math.min(100000,Math.floor(Number(p.page)||1)));
 const result=await query.order('updated_at',{ascending:false}).order('id').range((page-1)*25,page*25-1);
 if(result.error)throw new Error('Templates could not load. Try again shortly.');return {rows:(result.data||[]) as StaffTemplate[],page,total:result.count||0};
}
export async function getTemplate(client:SupabaseClient,id:string,page=1,version?:number){
 const current=await client.from('staff_templates').select('*').eq('id',id).maybeSingle();if(current.error)throw new Error('Template could not load.');if(!current.data)return null;
 const template=current.data as StaffTemplate;const number=Math.max(1,Math.min(100000,Math.floor(page)||1));
 const [latest,selected,history]=await Promise.all([client.from('staff_template_versions').select('*').eq('template_id',id).eq('version',template.current_version).maybeSingle(),client.from('staff_template_versions').select('*').eq('template_id',id).eq('version',version||template.current_version).maybeSingle(),client.from('staff_template_versions').select('template_id,version,title,kind,visibility,archived,change_note,created_at',{count:'exact'}).eq('template_id',id).order('version',{ascending:false}).range((number-1)*25,number*25-1)]);
 if(latest.error||selected.error||history.error||!latest.data)throw new Error('Template versions could not load. Refresh and retry.');
 return {template,latest:latest.data as TemplateVersion,selected:selected.data as TemplateVersion|null,history:history.data||[],total:history.count||0,page:number};
}
