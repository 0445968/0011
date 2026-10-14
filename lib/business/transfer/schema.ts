import {z} from 'zod';
import {expandedPersonSchema} from '@/lib/people/schema';
import {companyProfileSchema} from '@/lib/business/schema';
export const personFields=['name','email','phone','labels','status','job_title','company_name','notes','emails_json','phones_json'] as const;
export const companyFields=['name','status','website','legal_name','organization_type','industry_id','subindustry_id','line1','line2','city','region','postal_code','country','founding_year','employee_count'] as const;
export const transferSchema=z.object({kind:z.enum(['people','companies']),csv:z.string().max(500000),mapping:z.record(z.string().max(100),z.number().int().min(0).max(60)),action:z.enum(['preview','import'])}).strict();
export function mapRecord(kind:'people'|'companies',row:string[],mapping:Record<string,number>){
 const get=(key:string)=>(mapping[key]===undefined?'':row[mapping[key]]||'').trim();
 if(kind==='people'){const email=get('email').toLowerCase(),phone=get('phone');return expandedPersonSchema.parse({name:get('name'),email,phone,company_name:get('company_name'),labels:(get('labels')||'lead').split(';').map(v=>v.trim()),notes:get('notes'),status:get('status')||'active',job_title:get('job_title'),company_role:'other',lead_source:'manual',source_reference:'',project_roles:[],channels:{emails:get('emails_json')?JSON.parse(get('emails_json')):[{email,kind:'work',is_primary:true}],phones:get('phones_json')?JSON.parse(get('phones_json')):phone?[{phone,kind:'work',is_primary:true}]:[]}});}
 return {name:z.string().min(1).max(200).parse(get('name')),body:companyProfileSchema.parse({status:get('status')||'prospect',website:get('website'),legal_name:get('legal_name'),organization_type:get('organization_type'),industry_id:get('industry_id')||null,subindustry_id:get('subindustry_id')||null,address:Object.fromEntries(['line1','line2','city','region','postal_code','country'].map(key=>[key,get(key)])),founding_year:get('founding_year')?Number(get('founding_year')):null,employee_count:get('employee_count')?Number(get('employee_count')):null})};
}
