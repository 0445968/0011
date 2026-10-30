/** Expiry is display metadata only. Authorization still uses Supabase getUser. */
export function staffTokenExpiry(token:string|undefined){
 try{const exp=JSON.parse(Buffer.from(token?.split('.')[1]??'','base64url').toString()).exp;return typeof exp==='number'&&Number.isFinite(exp)?exp*1000:null;}catch{return null;}
}
export const STAFF_REFRESH_COOKIE='bivi_staff_refresh';
export const STAFF_EXPIRY_COOKIE='bivi_staff_expiry';
export const STAFF_REFRESH_MAX_AGE=7*86400;
export function sessionCookieValues(session:{access_token:string;refresh_token:string;expires_in:number;expires_at?:number},now=Date.now()){
 const expiresAt=Math.min(session.expires_at?session.expires_at*1000:Infinity,now+Math.min(session.expires_in,3600)*1000);
 return {expiresAt,maxAge:Math.max(1,Math.floor((expiresAt-now)/1000))};
}

export function staffAuthFailureStatus(error:{status?:number;name?:string}|null|undefined){return error&&(error.status===0||error.status===408||error.status===429||error.status!==undefined&&error.status>=500||error.name==='AuthRetryableFetchError')?503:401;}
