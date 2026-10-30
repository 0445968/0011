'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import type {ProjectTaskControl} from '@/lib/projects/lifecycle-schema';
import {postProjectCommand,ProjectCommandError} from '@/lib/projects/immediate-command';
import {refreshProjectSurfaces} from '@/lib/projects/refresh';

export function TaskReviewRequirements({projectId,projectRevision,control,disabled}:{projectId:string;projectRevision:number;control:ProjectTaskControl;disabled:boolean}){
 const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [message,setMessage]=useState('');
 async function update(field:'requiresStaffReview'|'requiresClientReview',value:boolean){
  if(busy||disabled)return;setBusy(true);setError('');setMessage('');
  try{await postProjectCommand(`/api/admin/projects/${projectId}/task-review-policy`,{taskId:control.taskId,requiresStaffReview:field==='requiresStaffReview'?value:control.requiresStaffReview,requiresClientReview:field==='requiresClientReview'?value:control.requiresClientReview,expectedControlRevision:control.revision,expectedProjectRevision:projectRevision});setMessage('Review requirement saved.');refreshProjectSurfaces(projectId,router);}
  catch(cause){setError(cause instanceof ProjectCommandError?cause.message:cause instanceof Error?cause.message:'Review requirement could not be saved.');}
  finally{setBusy(false);}
 }
 return <section className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3" aria-label="Task review requirements">
  <p className="text-xs font-semibold">Completion review</p>
  {control.ownerType==='bivi'&&<label className="flex min-h-9 items-center gap-2 text-xs"><input type="checkbox" checked={control.requiresStaffReview} disabled={disabled||busy} onChange={event=>void update('requiresStaffReview',event.target.checked)}/>Require Bivi staff review before completion</label>}
  {control.ownerType==='client'&&<label className="flex min-h-9 items-center gap-2 text-xs"><input type="checkbox" checked={control.requiresClientReview} disabled={disabled||busy} onChange={event=>void update('requiresClientReview',event.target.checked)}/>Require an accepted client-task completion review</label>}
  <p className="text-[11px] text-muted-foreground">A staff-owned task that is marked Completed will route to In Review. An authorized reviewer can then complete or reject it. Client-owned tasks use the client completion-review gate.</p>
  {message&&<p role="status" className="text-[11px] text-emerald-700">{message}</p>}{error&&<p role="alert" className="text-[11px] text-destructive">{error}</p>}
 </section>;
}
