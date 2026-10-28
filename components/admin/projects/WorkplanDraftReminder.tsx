'use client';

import { useEffect, useState } from 'react';

/** Informational only: dismissing this never saves or discards task edits. */
export function WorkplanDraftReminder({userId,dirty}:{userId:string;dirty:boolean}) {
  const storageKey='bivi:workplan-draft-reminder:v1:'+userId;
  const [ready,setReady]=useState(false);
  const [hidden,setHidden]=useState(false);
  const [dismissed,setDismissed]=useState(false);

  useEffect(()=>{
    try{setHidden(window.localStorage.getItem(storageKey)==='hidden');}
    catch{setHidden(false);}
    setReady(true);
    const sync=(event:StorageEvent)=>{
      if(event.key===storageKey||event.key===null)setHidden(event.newValue==='hidden');
    };
    window.addEventListener('storage',sync);
    return()=>window.removeEventListener('storage',sync);
  },[storageKey]);

  // Dismiss applies to this batch of edits; a new batch can show the reminder.
  useEffect(()=>{if(!dirty)setDismissed(false);},[dirty]);

  function hideFutureReminders(){
    setHidden(true);
    try{window.localStorage.setItem(storageKey,'hidden');}
    catch{ /* Keep it hidden for this visit if browser storage is unavailable. */ }
  }

  if(!ready||!dirty||hidden||dismissed)return null;
  const actionClass='min-h-8 rounded-md px-2 text-xs font-medium underline underline-offset-2 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:hover:bg-amber-900';
  return <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
    <p role="status" className="min-w-0 flex-1">Unsaved work-plan edits. Use Save all changes to apply this draft. Priority, start date, tags and assignees are edited directly in the full task editor.</p>
    <div className="flex shrink-0 flex-wrap items-center gap-1" aria-label="Draft reminder options">
      <button type="button" className={actionClass} title="Hide this reminder for the current unsaved edits" onClick={()=>setDismissed(true)}>Dismiss</button>
      <button type="button" className={actionClass} title="Hide this reminder across projects for your account in this browser" onClick={hideFutureReminders}>Don’t show again</button>
    </div>
  </div>;
}
