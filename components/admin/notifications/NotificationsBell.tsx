'use client';
import Link from 'next/link';
import {useState} from 'react';
import {Bell} from 'lucide-react';
import {Popover,PopoverContent,PopoverTrigger} from '@/components/ui/popover';
import {useNotifications} from './useNotifications';
import {NotificationsInbox} from './NotificationsInbox';
export function NotificationsBell() {
 const [open,setOpen]=useState(false);
 const {feed,error,refresh}=useNotifications('limit=1');
 return <Popover open={open} onOpenChange={next=>{setOpen(next);if(next)void refresh();}}>
  <PopoverTrigger asChild><button type="button" aria-label={error?'Notifications unavailable':feed?`Notifications, ${feed.unread} unread`:'Notifications, loading'} title={error?'Notifications unavailable':'Notifications'} className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Bell size={18} aria-hidden="true"/>{!!feed?.unread&&<span aria-hidden="true" className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-card"/>}</button></PopoverTrigger>
  <PopoverContent align="end" className="bivi-staff-surface max-h-[min(75vh,680px)] w-[min(380px,calc(100vw-2rem))] overflow-y-auto rounded-xl border-border bg-popover p-4 text-popover-foreground shadow-lg">
   <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">Notifications</h2><Link href="/notifications" onClick={()=>setOpen(false)} className="text-xs underline underline-offset-4">View all</Link></div>
   {open&&<NotificationsInbox compact onNavigate={()=>setOpen(false)}/>}
  </PopoverContent>
 </Popover>;
}
