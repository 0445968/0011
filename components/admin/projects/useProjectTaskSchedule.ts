'use client';
import { useCallback, useEffect, useState } from 'react';

type Row = { task_id:string; start_on:string|null; revision:number };

export function useProjectTaskSchedule(projectId:string,projectRevision:number) {
  const [rows,setRows]=useState<Map<string,Row>>(new Map());
  const [error,setError]=useState('');
  const [busy,setBusy]=useState<string|null>(null);
  const load=useCallback(async()=>{
    try {
      const response=await fetch(`/api/admin/projects/${projectId}/schedule`,{cache:'no-store'});const result=await response.json();
      if(!response.ok)throw new Error(result.error||'Task schedules could not load.');
      setRows(new Map((result.rows as Row[]).map(row=>[row.task_id,row])));setError('');
    } catch(cause) { setError(cause instanceof Error?cause.message:'Task schedules could not load.'); }
  },[projectId]);
  useEffect(()=>{void load();},[load,projectRevision]);
  const save=useCallback(async(taskId:string,startOn:string|null,dueOn:string|null,dirty:boolean)=>{
    if(dirty||busy)return false;
    if(startOn&&dueOn&&startOn>dueOn){setError('A task start date cannot be later than its due date.');return false;}
    setBusy(taskId);setError('');
    try {
      const current=rows.get(taskId);
      const response=await fetch(`/api/admin/projects/${projectId}/schedule`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({taskId,startOn,expectedProjectRevision:projectRevision,expectedScheduleRevision:current?.revision??0})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'Task schedule could not save.');
      setRows(old=>new Map(old).set(taskId,{task_id:taskId,start_on:startOn,revision:result.revision}));return true;
    } catch(cause) { setError(cause instanceof Error?cause.message:'Task schedule could not save.');return false; }
    finally { setBusy(null); }
  },[busy,projectId,projectRevision,rows]);
  return {rows,error,busy,save,reload:load};
}
