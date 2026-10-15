'use client';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {notificationHref} from '@/lib/notifications/types';
import {guardWorkspaceNavigation} from '../workspace/WorkspaceNavigationGuard';
import {NotificationPreferencesForm} from './NotificationPreferencesForm';
import {useNotifications} from './useNotifications';
const control='rounded-lg border border-border bg-background px-3 py-2 text-xs disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
export function NotificationsInbox({compact=false,onNavigate}:{compact?:boolean;onNavigate?:()=>void}) {
 const [page,setPage]=useState(1);
 const [unread,setUnread]=useState(false);
 const [category,setCategory]=useState('all');
 const [editing,setEditing]=useState(false);
 const {feed,error,busy,refresh,mutate}=useNotifications(new URLSearchParams({page:String(page),unread:String(unread),category,limit:compact?'6':'25'}).toString());
 useEffect(()=>{if(feed&&page>1&&feed.total<=(page-1)*feed.limit)setPage(Math.max(1,Math.ceil(feed.total/feed.limit)));},[feed,page]);
 return <div className="space-y-4">
  <div className="flex flex-wrap items-center gap-2">
   <button className={control} disabled={!feed?.unread||busy} onClick={()=>void mutate({action:'read_all'})}>Mark all read</button>
   <button className={control} disabled={busy} onClick={()=>void refresh()}>Refresh</button>
   {!compact&&<button className={control} disabled={!feed||busy} aria-expanded={editing} onClick={()=>{if(editing)guardWorkspaceNavigation(()=>setEditing(false));else setEditing(true);}}>Preferences</button>}
   <span className="ml-auto text-xs text-muted-foreground" role="status">{feed?`${feed.unread} unread`:error?'Unavailable':'Loading…'}</span>
  </div>
  {!compact&&<div className="flex flex-wrap items-center gap-3">
   <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unread} onChange={e=>{setUnread(e.target.checked);setPage(1);}}/>Unread only</label>
   <label className="text-sm">Type <select className={control} value={category} onChange={e=>{setCategory(e.target.value);setPage(1);}}><option value="all">All</option><option value="tasks">Assigned tasks</option><option value="deadlines">Deadlines</option><option value="approvals">Approvals</option></select></label>
  </div>}
  {editing&&<div className="rounded-xl border border-border p-4"><NotificationPreferencesForm /></div>}
  {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
  {feed&&feed.rows.length===0&&<p className="py-8 text-center text-sm text-muted-foreground">{unread?'You’re all caught up.':'No notifications with these preferences and filters.'}</p>}
  {feed&&<ul className="divide-y divide-border/60">{feed.rows.map(item=><li key={item.event_key} className="flex items-start gap-3 py-4">
   <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.read_at?'bg-transparent':'bg-blue-500'}`}/>
   <div className="min-w-0 flex-1">
    <Link href={notificationHref(item)} onClick={onNavigate} className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className={`block text-sm ${item.read_at?'font-medium':'font-semibold'}`}>{item.title}</span><span className="mt-1 block break-words text-xs">{item.detail}</span><span className="mt-1 block text-xs text-muted-foreground">{item.project_title}{item.due_on?` · Due ${item.due_on}`:''}</span></Link>
    <button className="mt-2 text-xs text-muted-foreground underline underline-offset-4 disabled:opacity-50" disabled={busy} onClick={()=>void mutate({action:'read',key:item.event_key,read:!item.read_at})}>Mark {item.read_at?'unread':'read'}</button>
   </div>
  </li>)}</ul>}
  {feed&&!compact&&feed.total>feed.limit&&<div className="flex items-center justify-between gap-3"><button className={control} disabled={busy||page<=1} onClick={()=>setPage(page-1)}>Previous</button><span className="text-xs">Page {page} of {Math.ceil(feed.total/feed.limit)}</span><button className={control} disabled={busy||page*feed.limit>=feed.total} onClick={()=>setPage(page+1)}>Next</button></div>}
 </div>;
}
