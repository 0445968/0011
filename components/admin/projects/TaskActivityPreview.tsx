'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, RefreshCcw } from 'lucide-react';

type TaskEvent={id:string;title:string;detail:string|null;createdAt:string;actorId:string|null;source:string};
type TaskActor={label:string};
type TaskHistory={events:TaskEvent[];actors:Record<string,TaskActor>;hasOlder:boolean};

export function TaskActivityPreview({projectId,taskId,defaultOpen=false}:{projectId:string;taskId:string;defaultOpen?:boolean}){
  const [opened,setOpened]=useState(defaultOpen);
  const [generation,setGeneration]=useState(0);
  const [data,setData]=useState<TaskHistory|null>(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    if(!opened)return;
    let active=true;
    const controller=new AbortController();
    setLoading(true);setError('');setData(null);
    void (async()=>{
      try{
        const response=await fetch(`/api/admin/projects/${projectId}/task-activity?taskId=${encodeURIComponent(taskId)}`,{cache:'no-store',signal:controller.signal});
        const json=await response.json();
        if(!response.ok)throw new Error(json.error||'Activity could not load.');
        if(active)setData(json as TaskHistory);
      }catch(cause){
        if(active&&!(cause instanceof Error&&cause.name==='AbortError'))setError(cause instanceof Error?cause.message:'Activity could not load.');
      }finally{if(active)setLoading(false);}
    })();
    return()=>{active=false;controller.abort();};
  },[opened,projectId,taskId,generation]);

  return <details defaultOpen={defaultOpen} className="rounded-lg border border-border/70 bg-background p-3" onToggle={event=>setOpened(event.currentTarget.open)}>
    <summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold"><Activity size={14} aria-hidden/>Task activity</summary>
    {opened&&<div className="mt-3 space-y-2">
      {loading&&<p role="status" className="text-[11px] text-muted-foreground">Loading audited task changes…</p>}
      {error&&<p role="alert" className="text-[11px] text-destructive">{error}</p>}
      {data&&<>
        <ol className="max-h-72 space-y-2 overflow-y-auto">
          {data.events.map(event=><li key={event.id} className="border-l-2 border-border px-3 py-1 text-[11px]">
            <p className="font-medium">{event.title}</p>
            {event.detail&&<p className="mt-0.5 whitespace-pre-wrap break-words text-muted-foreground">{event.detail}</p>}
            <p className="mt-1 text-[10px] text-muted-foreground">
              {event.actorId?data.actors[event.actorId]?.label??'Former team member':'Actor not recorded'}
              {' · '}<time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short'})}</time>
            </p>
          </li>)}
          {!data.events.length&&<li className="text-[11px] text-muted-foreground">No individually attributable task changes were found on this page.</li>}
        </ol>
        {data.hasOlder&&<p className="text-[10px] text-muted-foreground">Older audited changes may be available in the full log.</p>}
      </>}
      <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
        <Link href={`/projects/${projectId}/activity?task=${encodeURIComponent(taskId)}`} className="text-[11px] font-medium underline">View full task history</Link>
        <button type="button" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground" onClick={()=>setGeneration(n=>n+1)}><RefreshCcw size={12}/>Refresh</button>
      </div>
    </div>}
  </details>;
}
