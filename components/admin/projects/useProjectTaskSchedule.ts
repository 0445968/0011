'use client';
import {refreshProjectSurfaces} from '@/lib/projects/refresh';
import { useCallback, useEffect, useRef, useState } from 'react';
import {postProjectCommand,confirmProjectCommandRead} from '@/lib/projects/immediate-command';
import {useProjectMutationRefresh} from './useProjectMutationRefresh';
import { useRouter } from 'next/navigation';

type Row = { task_id:string; start_on:string|null; revision:number };

export function useProjectTaskSchedule(projectId:string,projectRevision:number,initial:Row[]=[]) {
  const router=useRouter();
  const [rows,setRows]=useState<Map<string,Row>>(()=>new Map(initial.map(row=>[row.task_id,row])));
  const generation=useRef(0),pending=useRef(false);
  const url=`/api/admin/projects/${projectId}/schedule`;
  const [error,setError]=useState('');
  const [busy,setBusy]=useState<string|null>(null);
  const [message,setMessage]=useState('');
  const load=useCallback(async()=>{
    const token=++generation.current;
    try {
      const response=await fetch(`/api/admin/projects/${projectId}/schedule`,{cache:'no-store'});const result=await response.json();
      if(!response.ok)throw new Error(result.error||'Task schedules could not load.');
      if(token!==generation.current)return false;
      confirmProjectCommandRead(url);
      setRows(new Map((result.rows as Row[]).map(row=>[row.task_id,row])));setError('');
      return true;
    } catch(cause) { if(token===generation.current)setError(cause instanceof Error?cause.message:'Task schedules could not load.');return false; }
  },[projectId,url]);
  useEffect(()=>{void load();},[load,projectRevision]);
  useProjectMutationRefresh(projectId,load);
  const save=useCallback(async(taskId:string,startOn:string|null,dueOn:string|null,dirty:boolean)=>{
    if(dirty){setError('Save all or discard the private work-plan edits before saving a start date.');return false;}
    if(pending.current)return false;
    if(startOn&&dueOn&&startOn>dueOn){setError('A task start date cannot be later than its due date.');return false;}
    pending.current=true;++generation.current;setBusy(taskId);setError('');setMessage('');
    try {
      const current=rows.get(taskId);
      const result=await postProjectCommand(url,{taskId,startOn,expectedProjectRevision:projectRevision,expectedScheduleRevision:current?.revision??0});
      ++generation.current;
      setRows(old=>new Map(old).set(taskId,{task_id:taskId,start_on:startOn,revision:result.revision}));setMessage('Task schedule saved.');refreshProjectSurfaces(projectId,router);return true;
    } catch(cause) { setError(cause instanceof Error?cause.message:'Task schedule could not save.');return false; }
    finally { pending.current=false;setBusy(null); }
  },[busy,projectId,projectRevision,rows,router]);
  return {rows,error,busy,message,save,reload:load};
}
