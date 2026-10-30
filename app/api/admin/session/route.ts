import {STAFF_REFRESH_COOKIE,STAFF_EXPIRY_COOKIE,STAFF_REFRESH_MAX_AGE,sessionCookieValues,staffTokenExpiry,staffAuthFailureStatus} from '@/lib/admin/staff-session';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { STAFF_COOKIE, authorizeStaff, createStaffClient, staffAuthConfigured } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';

export const runtime = 'nodejs';
const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(1024), expectedUserId:z.string().uuid().optional() }).strict();

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Please sign in from the Bivi website.' }, 403);
  let raw: unknown;
  try { raw = await readAdminJson(request); } catch { return adminReply({ error: 'Enter your email and password.' }, 400); }
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Enter a valid email and password.' }, 400);
  if (!staffAuthConfigured()) return adminReply({ error: 'Staff sign-in is not configured yet. Complete the workspace setup first.' }, 503);
  try {
    const { data, error } = await createStaffClient().auth.signInWithPassword({email:parsed.data.email,password:parsed.data.password});
    if (error || !data.session) {
      return adminReply({ error: error?.status === 429 ? 'Too many sign-in attempts. Please try again later.' : 'We could not sign you in with these details.' }, error?.status === 429 ? 429 : 401);
    }
    const access = await authorizeStaff(data.session.access_token);
    if (!access.allowed) return adminReply({ error: access.status === 503 ? 'The workspace is temporarily unavailable.' : 'We could not sign you in with these details.' }, access.status === 503 ? 503 : 401);
    if(parsed.data.expectedUserId&&access.user.id!==parsed.data.expectedUserId)return adminReply({error:'Sign in with the same staff account to keep these editors open.'},409);
    const response = adminReply({redirect:'/admin',...sessionStatus(data.session,access.user.id)});
    setSessionCookies(response,data.session);
    return response;
  } catch { return adminReply({ error: 'Sign-in is temporarily unavailable. Please try again.' }, 503); }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Please sign out from the Bivi website.' }, 403);
  let token = cookies().get(STAFF_COOKIE)?.value;
  if(!token&&staffAuthConfigured()){const refresh=cookies().get(STAFF_REFRESH_COOKIE)?.value;if(refresh){try{token=(await createStaffClient().auth.refreshSession({refresh_token:refresh})).data.session?.access_token;}catch{/* Local logout still clears all cookies. */}}}
  // Best-effort revocation at the provider; local logout always removes the workspace cookie.
  if (token && staffAuthConfigured()) {
    try {
      const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      await fetch(`${process.env.SUPABASE_URL}/auth/v1/logout?scope=local`, {
        method: 'POST', headers: { apikey: key, Authorization: `Bearer ${token}` },
        cache: 'no-store', signal: AbortSignal.timeout(10000),
      });
    } catch { /* Cookie removal must still work when the provider is unavailable. */ }
  }
  const response = adminReply({ redirect: '/admin/login' });
  for(const name of [STAFF_COOKIE,STAFF_REFRESH_COOKIE,STAFF_EXPIRY_COOKIE])response.cookies.set(name,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0});
  return response;
}

function sessionStatus(session:{access_token:string;refresh_token:string;expires_in:number;expires_at?:number},userId:string){
 return {expiresAt:sessionCookieValues(session).expiresAt,serverNow:Date.now(),canRenew:Boolean(session.refresh_token),userId};
}
function setSessionCookies(response:ReturnType<typeof adminReply>,session:{access_token:string;refresh_token:string;expires_in:number;expires_at?:number}){
 const options={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/'};
 const timing=sessionCookieValues(session);
 response.cookies.set(STAFF_COOKIE,session.access_token,{...options,maxAge:timing.maxAge});
 response.cookies.set(STAFF_REFRESH_COOKIE,session.refresh_token,{...options,maxAge:STAFF_REFRESH_MAX_AGE});
 response.cookies.set(STAFF_EXPIRY_COOKIE,String(timing.expiresAt),{...options,maxAge:STAFF_REFRESH_MAX_AGE});
}
export async function GET(){
 const token=cookies().get(STAFF_COOKIE)?.value;
 const access=await authorizeStaff(token);
 if(!access.allowed)return adminReply({error:access.status===503?'Session status is temporarily unavailable. Your editors remain open.':'Your staff session needs renewal.',expired:access.status===401,serverNow:Date.now()},access.status);
 const jwtExpiry=staffTokenExpiry(token),stored=Number(cookies().get(STAFF_EXPIRY_COOKIE)?.value);
 const expiresAt=Math.min(jwtExpiry??Infinity,stored>0?stored:Infinity);
 if(!Number.isFinite(expiresAt))return adminReply({error:'Session expiry could not be verified.'},503);
 return adminReply({expiresAt,serverNow:Date.now(),canRenew:Boolean(cookies().get(STAFF_REFRESH_COOKIE)?.value),userId:access.user.id});
}
export async function PUT(request:Request){
 if(!isSameOrigin(request))return adminReply({error:'Renew from the Bivi workspace.'},403);
 let raw;try{raw=await readAdminJson(request,2048);}catch{return adminReply({error:'Invalid session renewal.'},400);}
 const parsed=z.object({expectedUserId:z.string().uuid()}).strict().safeParse(raw);
 if(!parsed.success)return adminReply({error:'Refresh the workspace session status.'},400);
 const refresh=cookies().get(STAFF_REFRESH_COOKIE)?.value;
 if(!refresh)return adminReply({error:'Sign in here to renew this older session without leaving your editors.',reauthenticate:true},401);
 if(!staffAuthConfigured())return adminReply({error:'Session renewal is temporarily unavailable.'},503);
 try{
  const {data,error}=await createStaffClient().auth.refreshSession({refresh_token:refresh});
  const unavailable=staffAuthFailureStatus(error)===503;
  if(error||!data.session)return adminReply({error:unavailable?'Session renewal is temporarily unavailable. Please retry.':'Please sign in here to continue.',reauthenticate:!unavailable},unavailable?503:401);
  const access=await authorizeStaff(data.session.access_token);
  if(!access.allowed){const response=adminReply({error:access.status===503?'Staff membership could not be checked. Please retry.':'Staff access is no longer available.'},access.status);if(access.status===503)response.cookies.set(STAFF_REFRESH_COOKIE,data.session.refresh_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:STAFF_REFRESH_MAX_AGE});return response;}
  if(access.user.id!==parsed.data.expectedUserId)return adminReply({error:'The staff account changed. Keep this workspace open and sign in with the original account.',reauthenticate:true},409);
  const response=adminReply(sessionStatus(data.session,access.user.id));setSessionCookies(response,data.session);return response;
 }catch{return adminReply({error:'Session renewal could not be confirmed. Retry without closing your editors.'},503);}
}
