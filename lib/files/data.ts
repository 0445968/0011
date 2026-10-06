import 'server-only';
import {z} from 'zod';import type {SupabaseClient} from '@supabase/supabase-js';
const file=z.object({id:z.string().uuid(),request_id:z.string().uuid(),object_path:z.string(),filename:z.string(),size_bytes:z.number().int(),mime_type:z.string(),uploader_id:z.string().uuid().nullable(),state:z.enum(['pending','ready','withdrawn']),shared:z.boolean(),revision:z.number().int(),created_at:z.string(),expires_at:z.string(),updated_at:z.string()});
const event=z.object({id:z.number(),file_id:z.string().uuid(),action:z.string(),revision:z.number(),reason:z.string(),created_at:z.string()});
export type ProjectFile=z.infer<typeof file>;export type FileEvent=z.infer<typeof event>;
export async function projectFiles(client:SupabaseClient,id:string){const {data,error}=await client.from('project_files').select('*').eq('request_id',id).order('created_at',{ascending:false}).limit(200);if(error)throw new Error('Project files could not be loaded. Check the eighth migration.');return z.array(file).parse(data??[]);}
export async function fileHistory(client:SupabaseClient,id:string){const {data,error}=await client.from('project_file_history').select('id,file_id,action,revision,reason,created_at').eq('request_id',id).order('id',{ascending:false}).limit(50);if(error)throw new Error('File history could not be loaded.');return z.array(event).parse(data??[]);}
