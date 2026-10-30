import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(request:Request){
 const headers={'Cache-Control':'no-store'};
 if(!process.env.CRON_SECRET||request.headers.get('authorization')!==`Bearer ${process.env.CRON_SECRET}`)return NextResponse.json({error:'Unauthorized.'},{status:401,headers});
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return NextResponse.json({error:'Recovery cleanup is not configured.'},{status:503,headers});
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const result=await client.from('project_workplan_recovery').delete().lt('expires_at',new Date().toISOString());
 return NextResponse.json(result.error?{error:'Recovery cleanup failed.'}:{cleaned:true},{status:result.error?503:200,headers});
}
