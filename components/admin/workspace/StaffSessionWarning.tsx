'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {liveUnsavedTabs} from './WorkspaceNavigationGuard';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {readUnsavedTabs,type UnsavedTab} from '@/lib/admin/workspace/unsaved-tabs';
import {countdownLabel,sessionSecondsLeft,SESSION_WARNING_MS} from '@/lib/admin/session-countdown';
import {usePathname,useSearchParams} from 'next/navigation';

type Session={expiresAt:number;serverNow:number;canRenew:boolean;userId:string};
export function StaffSessionWarning({staffId,email,tabs,onSignOut}:{staffId:string;email:string;tabs:{key:string;title:string;href:string}[];onSignOut:()=>Promise<boolean|undefined>}){
 const [session,setSession]=useState<Session|null>(null),[clock,setClock]=useState(Date.now()),[offset,setOffset]=useState(0);
 const [expired,setExpired]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[reauth,setReauth]=useState(false),[password,setPassword]=useState('');
 const [confirmSignOut,setConfirmSignOut]=useState(false);
 const [dirtyTabs,setDirtyTabs]=useState<UnsavedTab[]>([]),[statusIssue,setStatusIssue]=useState(false);
 const windowId=useRef('');
 const knownExpiry=useRef<number|null>(null);
 const pending=useRef(false),generation=useRef(0),active=useRef(true);
 const path=usePathname(),search=useSearchParams().toString();
 const accept=useCallback((data:Session,renewed=false)=>{if(data.userId!==staffId)throw new Error('The signed-in account changed. Sign in with the original staff account to preserve these editors.');if(!Number.isFinite(data.expiresAt)||!Number.isFinite(data.serverNow))throw new Error('Session expiry could not be verified.');const peerRenewal=knownExpiry.current!==null&&data.expiresAt>knownExpiry.current+1000;knownExpiry.current=data.expiresAt;if(peerRenewal&&!renewed)window.dispatchEvent(new Event('bivi:staff-session-renewed'));setOffset(data.serverNow-Date.now());setSession(data);setExpired(false);setStatusIssue(false);setError('');if(renewed||data.expiresAt-data.serverNow>SESSION_WARNING_MS){setReauth(false);setPassword('');setConfirmSignOut(false);}},[staffId]);
 const check=useCallback(async()=>{
  const request=++generation.current;
  try{const response=await fetch('/api/admin/session',{cache:'no-store',signal:AbortSignal.timeout(20000)});const data=await response.json();if(!active.current||request!==generation.current||pending.current)return;
   if(response.status===401){setExpired(true);setStatusIssue(false);return;}
   if(!response.ok)throw new Error(data.error||'Session status could not be checked.');accept(data);
  }catch(cause){if(active.current&&request===generation.current&&!pending.current){setStatusIssue(true);setError(cause instanceof Error?cause.message:'Session status unavailable. Retry without closing your work.');}}
 },[accept]);
 const invalidate=useCallback(()=>{active.current=false;generation.current++;},[]);
 useEffect(()=>{active.current=true;void check();const timer=window.setInterval(()=>{setClock(Date.now());},1000);const poll=window.setInterval(()=>{void check();},60000);
  const focus=()=>{setClock(Date.now());void check();};window.addEventListener('focus',focus);document.addEventListener('visibilitychange',focus);
  return()=>{invalidate();clearInterval(timer);clearInterval(poll);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',focus);};
 },[check,invalidate]);
 useEffect(()=>{
  if(!windowId.current)windowId.current=crypto.randomUUID();
  const peers=new Map<string,{rows:UnsavedTab[];seen:number}>();
  const channel=typeof BroadcastChannel==='undefined'?null:new BroadcastChannel('bivi:unsaved-session:'+staffId);
  const broadcast=()=>channel?.postMessage({type:'snapshot',id:windowId.current,rows:liveUnsavedTabs(staffId)});
  const read=()=>{let stored:UnsavedTab[]=[];try{stored=readUnsavedTabs(window.localStorage,staffId);}catch{/* Live metadata remains available. */}
   const remote=[...peers.values()].filter(peer=>Date.now()-peer.seen<90000).flatMap(peer=>peer.rows);
   const merged=new Map([...stored,...remote,...liveUnsavedTabs(staffId)].map(tab=>[tab.key+'::'+tab.label,tab]));setDirtyTabs([...merged.values()]);
  };
  const localChange=()=>{read();broadcast();};
  const request=()=>{read();channel?.postMessage({type:'request'});};
  if(channel)channel.onmessage=event=>{const data=event.data;if(data?.type==='request')broadcast();else if(data?.type==='snapshot'&&typeof data.id==='string'&&Array.isArray(data.rows)&&data.id!==windowId.current){peers.set(data.id,{rows:data.rows.filter((row:UnsavedTab)=>typeof row?.key==='string'&&typeof row?.label==='string'&&typeof row?.href==='string'&&row.href.startsWith('/')&&!row.href.startsWith('//')).slice(0,100),seen:Date.now()});read();}};
  request();broadcast();window.addEventListener('storage',read);window.addEventListener('bivi:unsaved-tabs',localChange);window.addEventListener('bivi:session-unsaved-request',request);const timer=window.setInterval(localChange,30000);
  return()=>{channel?.close();window.removeEventListener('storage',read);window.removeEventListener('bivi:unsaved-tabs',localChange);window.removeEventListener('bivi:session-unsaved-request',request);clearInterval(timer);};
 },[staffId,path,search]);

 const seconds=sessionSecondsLeft(session?.expiresAt??null,clock+offset);
 const warning=expired||statusIssue||(seconds!==null&&seconds*1000<=SESSION_WARNING_MS);
 const open=warning;
 useEffect(()=>{if(open)window.dispatchEvent(new Event('bivi:session-unsaved-request'));},[open]);
 async function keepWorking(){
  if(pending.current)return;pending.current=true;setBusy(true);setError('');generation.current++;
  try{
   const renew=async()=>{
    if(!reauth){
     const status=await fetch('/api/admin/session',{cache:'no-store',signal:AbortSignal.timeout(20000)});if(status.ok){const data=await status.json();if(data.userId===staffId&&data.expiresAt-data.serverNow>SESSION_WARNING_MS){accept(data,true);return;}}
    }
    const response=await fetch('/api/admin/session',{method:reauth?'POST':'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(reauth?{email,password,expectedUserId:staffId}:{expectedUserId:staffId}),signal:AbortSignal.timeout(25000)});
    const data=await response.json();if(!response.ok){if(data.reauthenticate){setReauth(true);setPassword('');}throw new Error(data.error||'Session renewal could not be confirmed.');}accept(data,true);
   };
   if(navigator.locks)await navigator.locks.request('bivi-staff-session-renew',renew);else await renew();
   window.dispatchEvent(new Event('bivi:staff-session-renewed'));
  }catch(cause){setError(cause instanceof Error?cause.message:'Session renewal failed. Your editors remain open.');}
  finally{pending.current=false;setBusy(false);}
 }
 async function finishSignOut(){
  if(pending.current)return;pending.current=true;setBusy(true);setError('');
  try{window.dispatchEvent(new Event('bivi:staff-signing-out'));if(await onSignOut()!==true)throw new Error('Sign out could not be confirmed. Your editors remain open.');}
  catch(cause){setError(cause instanceof Error?cause.message:'Sign out failed. Please retry.');}
  finally{pending.current=false;setBusy(false);}
 }
 const groups=[...new Set(dirtyTabs.map(tab=>tab.key))].map(key=>({key,rows:dirtyTabs.filter(row=>row.key===key)}));
 return <Dialog open={open} onOpenChange={()=>{}}><DialogContent className="max-h-[85dvh] overflow-y-auto" onEscapeKeyDown={event=>event.preventDefault()} onInteractOutside={event=>event.preventDefault()}>
  <DialogTitle>{expired||seconds===0?'Your session needs renewal':statusIssue?'Check your staff session':'Keep working?'}</DialogTitle>
  <DialogDescription>{statusIssue?'Session status could not be confirmed. Your editors remain open.':expired||seconds===0?'Your session has expired. Renew or sign in here before saving; your open editors stay in place.':'Your staff session is about to expire. Keep working to renew it, or sign out.'}</DialogDescription>
  {seconds!==null&&!statusIssue&&<p className="font-mono text-2xl tabular-nums" aria-label="Time until session expires">{countdownLabel(expired?0:seconds)}</p>}
  <section aria-label="Tabs with unsaved changes"><h3 className="text-sm font-semibold">Tabs with unsaved changes ({groups.length})</h3>{groups.length?<ul className="mt-2 space-y-2">{groups.map(group=><li key={group.key} className="rounded-lg bg-muted p-3 text-sm"><p className="font-medium">{tabs.find(tab=>tab.key===group.key)?.title??group.rows[0].label}</p><p className="text-xs text-muted-foreground">{[...new Set(group.rows.map(row=>row.label))].join(', ')}{group.rows.some(row=>row.draft)?' · Private draft pending':''}</p></li>)}</ul>:<p className="mt-2 text-sm text-muted-foreground">No registered unsaved edits or pending drafts.</p>}</section>
  {reauth&&<label className="text-sm">Password for {email}<input type="password" autoComplete="current-password" value={password} onChange={event=>setPassword(event.target.value)} className="mt-2 min-h-10 w-full rounded border bg-background px-3" maxLength={1024} onKeyDown={event=>{if(event.key==='Enter'&&password)void keepWorking();}}/></label>}
  {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
  {confirmSignOut&&<p role="alert" className="rounded bg-muted p-3 text-sm">Work-plan drafts and recovery checkpoints are kept when you sign out. Other unsaved editor text may be lost. Keep working to save it first.</p>}
  <div className="flex flex-wrap justify-end gap-2">{confirmSignOut&&<button type="button" disabled={busy} className="min-h-10 rounded border px-3 text-sm" onClick={()=>setConfirmSignOut(false)}>Cancel sign out</button>}<button type="button" disabled={busy} className="min-h-10 rounded border px-3 text-sm" onClick={()=>{if(groups.length&&!confirmSignOut)setConfirmSignOut(true);else void finishSignOut();}}>{confirmSignOut?'Sign out now':'Sign out'}</button><button type="button" disabled={busy||reauth&&!password} className="min-h-10 rounded bg-foreground px-3 text-sm text-background disabled:opacity-50" onClick={()=>void keepWorking()}>{busy?'Renewing…':reauth?'Sign in and keep working':'Keep working'}</button></div>
 </DialogContent></Dialog>;
}
