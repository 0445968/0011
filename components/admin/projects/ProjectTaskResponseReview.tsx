'use client';
import {refreshProjectSurfaces} from '@/lib/projects/refresh';

import Link from 'next/link';
import {postProjectCommand,confirmProjectCommandRead} from '@/lib/projects/immediate-command';
import {useProjectMutationRefresh} from './useProjectMutationRefresh';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { taskResponseLabels, taskResponseWorkspaceSchema, type TaskResponseWorkspace } from '@/lib/projects/task-response-schema';
import {ProjectPanel,projectControlClass} from './ProjectVisuals';

type Review = TaskResponseWorkspace['responses'][number];
type Policy = TaskResponseWorkspace['policies'][number];

export function ProjectTaskResponseReview({ id, tasks, focusRequestId,isWorkflowAdmin=false }: {
  id: string;
  focusRequestId?:string;isWorkflowAdmin?:boolean;
  tasks: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [data, setData] = useState<TaskResponseWorkspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [review, setReview] = useState<{ row: Review; decision: 'accept'|'reject'; revision:number } | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [policyEdit, setPolicyEdit] = useState<Policy | null>(null);
  const [guidance, setGuidance] = useState('');
  const [status,setStatus]=useState(focusRequestId?'all':'pending');
  const [kind,setKind]=useState('all');
  const [page,setPage]=useState(1);
  const [focus,setFocus]=useState(focusRequestId??'');
  const [message,setMessage]=useState('');
  const generation=useRef(0),pendingWrite=useRef(false);
  const [workplanDirty, setWorkplanDirty] = useState(false);
  const [workplanReady, setWorkplanReady] = useState(false);

  useEffect(() => {
    const onDirty = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId: string; dirty: boolean; ready: boolean }>).detail;
      if (detail?.projectId === id) { setWorkplanDirty(detail.dirty); setWorkplanReady(detail.ready); }
    };
    window.addEventListener('bivi:project-workplan-dirty', onDirty);
    return () => window.removeEventListener('bivi:project-workplan-dirty', onDirty);
  }, [id]);

  useEffect(()=>{setFocus(focusRequestId??'');setStatus(focusRequestId?'all':'pending');setPage(1);},[focusRequestId]);
  const load = useCallback(async (allowPending=false) => {
    if(pendingWrite.current&&!allowPending)return false;
    const request=++generation.current;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/projects/${id}/responses?${new URLSearchParams({status,kind,page:String(page),...(focus?{request:focus}:{})})}`, { cache: 'no-store' });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error((payload as {error?:string}).error || 'Responses unavailable.');
      const parsed = taskResponseWorkspaceSchema.safeParse(payload);
      if (!parsed.success) throw new Error('Response data could not be verified.');
      if(request!==generation.current)return false;
      confirmProjectCommandRead(`/api/admin/projects/${id}/responses`);
      setData(parsed.data); setError('');return true;
    } catch (cause) { if(request===generation.current)setError(cause instanceof Error ? cause.message : 'Responses unavailable.');return false; }
    finally { if(request===generation.current)setLoading(false); }
  }, [id,status,kind,page,focus]);
  useEffect(() => { void load();return()=>{generation.current+=1;}; }, [load]);
  useProjectMutationRefresh(id,()=>load());
  useEffect(()=>{const tick=()=>{if(document.visibilityState==='visible')void load();};const timer=window.setInterval(tick,60000);document.addEventListener('visibilitychange',tick);return()=>{window.clearInterval(timer);document.removeEventListener('visibilitychange',tick);};},[load]);

  async function send(command: object) {
    if (!workplanReady && (command as {action?: string}).action === 'review') { setError('Wait for the private work-plan draft to load before reviewing this request.'); return false; }
    if (workplanDirty && (command as {action?: string}).action === 'review') { setError('Save or discard the work-plan draft before reviewing this request.'); return false; }
    if(pendingWrite.current)return false;
    pendingWrite.current=true;++generation.current;setBusy(true); setError('');setMessage('');
    try {
      await postProjectCommand(`/api/admin/projects/${id}/responses`,command);
      const refreshed=await load(true);
      setMessage(refreshed?'Saved.':'Saved. Refresh Requests to load the latest results.');
      // Completion approval may advance the canonical project revision. The editor
      // reloads its private draft and three-way reconciles against that saved body.
      refreshProjectSurfaces(id,router);
      return true;
    } catch (cause) { setError(cause instanceof Error && cause.name !== 'TimeoutError' ? cause.message : 'Save status uncertain. Refresh before retrying.'); return false; }
    finally { pendingWrite.current=false;setBusy(false);setLoading(false); }
  }
  const title = (taskId: string) => tasks.find(item => item.id === taskId)?.title || 'Task unavailable';
  const rows=data?.responses??[];
  const person=(uid:string|null|undefined)=>uid?(data?.actors?.[uid]?.label??`Account ${uid.slice(0,8)}`):'Former account';
  const stamp=(value:string)=>new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short',timeZone:data?.timezone||'America/Chicago'}).format(new Date(value));
  return <ProjectPanel title="Client task requests" description="Bivi staff reviews requests. Accepted completion updates the saved task." action={<Button className={projectControlClass} type="button" variant="outline" disabled={busy||loading} onClick={() => void load()}>{loading ? 'Loading…' : 'Refresh'}</Button>}>
    <div className="space-y-3 p-3">
      {!workplanReady&&<p role="status" className="rounded-lg border border-muted p-3 text-xs text-muted-foreground">Checking the private work-plan draft before enabling client task reviews…</p>}
      {workplanDirty&&<p role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">Save or discard the work-plan draft before reviewing a client task request. This keeps both edits on the same saved project revision.</p>}
      <div className="flex flex-wrap gap-3 text-xs"><label>Status <select value={status} className="border border-border bg-background p-1" onChange={event=>{setStatus(event.target.value);setPage(1);}}><option value="pending">Pending</option><option value="reviewed">Reviewed</option><option value="all">All</option></select></label><label>Type <select value={kind} className="border border-border bg-background p-1" onChange={event=>{setKind(event.target.value);setPage(1);}}><option value="all">All types</option>{Object.entries(taskResponseLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>{focus&&<button type="button" className="underline" onClick={()=>{setFocus('');setPage(1);}}>Show all requests</button>}</div>
      <p className="text-xs font-medium">{data?`${data.pendingTotal} pending project requests · ${data.total} matching requests`:'Request counts unavailable until loaded'}</p>
      {rows.map(row => <article id={`request-${row.id}`} key={row.id} className="rounded-lg border border-border p-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="min-w-0"><h3 className="text-sm font-medium"><Link href={`/projects/${id}?tab=plan&task=${encodeURIComponent(row.taskId)}`} className="underline">{title(row.taskId)}</Link></h3><p className="mt-1 text-xs text-muted-foreground">{taskResponseLabels[row.kind]} · {stamp(row.submittedAt)} · {person(row.submittedBy)} · {row.status}</p></div>{row.status==='pending'&&isWorkflowAdmin&&<div className="flex gap-1"><Button size="sm" variant="outline" disabled={busy||!isWorkflowAdmin||!workplanReady||workplanDirty} onClick={() => {setReview({row,decision:'reject',revision:data!.projectRevision});setReviewNote('');}}><X className="mr-1 h-3.5 w-3.5"/>Reject</Button><Button size="sm" disabled={busy||!isWorkflowAdmin||!workplanReady||workplanDirty} onClick={() => {setReview({row,decision:'accept',revision:data!.projectRevision});setReviewNote('');}}><Check className="mr-1 h-3.5 w-3.5"/>Accept</Button></div>}</div>
        <p className="mt-2 whitespace-pre-wrap break-words text-xs">{row.note}</p>
        {row.legacyBaseline&&row.status==='pending'&&<p className="mt-2 text-xs text-amber-800 dark:text-amber-200">Legacy submission without a saved task baseline. Reject and request a fresh submission before accepting.</p>}
        {row.reviewedAt&&<p className="mt-2 text-xs text-muted-foreground">{row.status} by {person(row.reviewedBy)} · {stamp(row.reviewedAt)} · {row.reviewNote||'No decision note'}</p>}
      </article>)}
      {data&&!rows.length&&!loading&&<p className="text-xs text-muted-foreground">No requests match this filter, or the linked request no longer exists in this project.</p>}
      <nav aria-label="Request pages" className="flex gap-3 text-xs"><button type="button" className="underline disabled:opacity-50" disabled={page===1||loading} onClick={()=>setPage(value=>value-1)}>Previous</button><span>Page {page}</span><button type="button" className="underline disabled:opacity-50" disabled={!data||page*25>=(data.total??0)||loading} onClick={()=>setPage(value=>value+1)}>Next</button></nav>
      <details className="border-t border-border pt-3"><summary className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold">Decline policy by client task <ChevronDown size={14}/></summary>
        <div className="mt-3 space-y-2">{data?.policies.map(row => <div key={row.taskId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-xs"><span className="min-w-0 break-words font-medium">{title(row.taskId)}</span><Button size="sm" variant="outline" disabled={busy} onClick={() => {setPolicyEdit(row);setGuidance(row.declineGuidance);}}>{row.allowDecline ? 'Decline allowed · Edit' : 'Decline disabled · Edit'}</Button></div>)}</div>
      </details>
      {message&&<p role="status" className="text-xs">{message}</p>}
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
    <Dialog open={review!==null} onOpenChange={open=>{if(!open&&!busy)setReview(null);}}><DialogContent><DialogTitle>{review?.decision==='accept'?'Accept request':'Reject request'}</DialogTitle><DialogDescription>{review?.row.kind==='completion'&&review?.decision==='accept'?'This will mark the task completed under Bivi staff approval.':'This records Bivi’s decision. Task details will not be changed automatically for other request types.'}</DialogDescription>{review&&data&&review.revision!==data.projectRevision&&<p role="alert" className="text-xs">Saved work changed while this review was open. Cancel and reopen the request after reviewing the latest task.</p>}{(!workplanReady||workplanDirty)&&<p role="alert" className="text-xs text-amber-800">{!workplanReady?'Wait for the private work-plan draft to load.':'Save or discard the work-plan draft before continuing.'}</p>}<Textarea aria-label="Staff response" maxLength={2000} rows={3} disabled={busy||!isWorkflowAdmin||!workplanReady||workplanDirty} placeholder="Optional response to the client" value={reviewNote} onChange={event=>setReviewNote(event.target.value)}/><DialogFooter><Button variant="outline" disabled={busy} onClick={()=>setReview(null)}>Cancel</Button><Button disabled={busy||!data||!workplanReady||workplanDirty} onClick={()=>{if(!review||!data)return;void (async()=>{const done=await send({action:'review',responseId:review.row.id,decision:review.decision,note:reviewNote,projectRevision:review.revision});if(done)setReview(null);})();}}>Confirm</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={policyEdit!==null} onOpenChange={open=>{if(!open&&!busy)setPolicyEdit(null);}}><DialogContent><DialogTitle>Client decline permissions</DialogTitle><DialogDescription>Declining is disabled by default. Explain why client input matters and what risks declining could create.</DialogDescription><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={policyEdit?.allowDecline??false} disabled={busy} onChange={event=>setPolicyEdit(current=>current?{...current,allowDecline:event.target.checked}:null)}/>Allow this client task to be declined</label><Textarea aria-label="Decline risk guidance" value={guidance} disabled={busy} maxLength={2000} rows={4} onChange={event=>setGuidance(event.target.value)}/><DialogFooter><Button variant="outline" disabled={busy} onClick={()=>setPolicyEdit(null)}>Cancel</Button><Button disabled={busy||!policyEdit||(policyEdit.allowDecline&&guidance.trim().length<15)} onClick={()=>{if(!policyEdit)return;void (async()=>{const done=await send({action:'policy',taskId:policyEdit.taskId,allowDecline:policyEdit.allowDecline,declineGuidance:guidance,expectedRevision:policyEdit.revision});if(done)setPolicyEdit(null);})();}}>Save policy</Button></DialogFooter></DialogContent></Dialog>
  </ProjectPanel>;
}
