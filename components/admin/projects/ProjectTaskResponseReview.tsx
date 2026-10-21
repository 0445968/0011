'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { taskResponseLabels, taskResponseWorkspaceSchema, type TaskResponseWorkspace } from '@/lib/projects/task-response-schema';

type Review = TaskResponseWorkspace['responses'][number];
type Policy = TaskResponseWorkspace['policies'][number];

export function ProjectTaskResponseReview({ id, tasks }: {
  id: string;
  tasks: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [data, setData] = useState<TaskResponseWorkspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [review, setReview] = useState<{ row: Review; decision: 'accept'|'reject' } | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [policyEdit, setPolicyEdit] = useState<Policy | null>(null);
  const [guidance, setGuidance] = useState('');
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/projects/${id}/responses`, { cache: 'no-store' });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error((payload as {error?:string}).error || 'Responses unavailable.');
      const parsed = taskResponseWorkspaceSchema.safeParse(payload);
      if (!parsed.success) throw new Error('Response data could not be verified.');
      setData(parsed.data); setError('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Responses unavailable.'); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  async function send(command: object) {
    if (!workplanReady && (command as {action?: string}).action === 'review') { setError('Wait for the private work-plan draft to load before reviewing this request.'); return false; }
    if (workplanDirty && (command as {action?: string}).action === 'review') { setError('Save or discard the work-plan draft before reviewing this request.'); return false; }
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/admin/projects/${id}/responses`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command), signal: AbortSignal.timeout(20000),
      });
      const payload = await response.json();
      if (!response.ok || !payload.saved) throw new Error(payload.error || 'Change could not be saved.');
      await load();
      // Completion approval may advance the canonical project revision. The editor
      // reloads its private draft and three-way reconciles against that saved body.
      router.refresh();
      return true;
    } catch (cause) { setError(cause instanceof Error && cause.name !== 'TimeoutError' ? cause.message : 'Save status uncertain. Refresh before retrying.'); return false; }
    finally { setBusy(false); }
  }
  const title = (taskId: string) => tasks.find(item => item.id === taskId)?.title || 'Task unavailable';
  const pending = data?.responses.filter(item => item.status === 'pending') ?? [];
  return <section aria-label="Client task requests and policies" className="rounded-xl border border-border bg-card">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4"><div><h2 className="text-sm font-semibold">Client task requests</h2><p className="mt-1 text-xs text-muted-foreground">Bivi staff reviews completions and client requests. Completion approval changes the canonical task status.</p></div><Button type="button" variant="outline" disabled={busy||loading} onClick={() => void load()}>{loading ? 'Loading…' : 'Refresh'}</Button></div>
    <div className="space-y-3 p-4">
      {!workplanReady&&<p role="status" className="rounded-lg border border-muted p-3 text-xs text-muted-foreground">Checking the private work-plan draft before enabling client task reviews…</p>}
      {workplanDirty&&<p role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">Save or discard the work-plan draft before reviewing a client task request. This keeps both edits on the same saved project revision.</p>}
      <p className="text-xs font-medium">{pending.length} pending requests</p>
      {pending.map(row => <article key={row.id} className="rounded-lg border border-border p-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="min-w-0"><h3 className="text-sm font-medium">{title(row.taskId)}</h3><p className="mt-1 text-xs text-muted-foreground">{taskResponseLabels[row.kind]} · {new Date(row.submittedAt).toLocaleString('en-US',{timeZone:'America/Chicago'})}</p></div><div className="flex gap-1"><Button size="sm" variant="outline" disabled={busy||!workplanReady||workplanDirty} onClick={() => {setReview({row,decision:'reject'});setReviewNote('');}}><X className="mr-1 h-3.5 w-3.5"/>Reject</Button><Button size="sm" disabled={busy||!workplanReady||workplanDirty} onClick={() => {setReview({row,decision:'accept'});setReviewNote('');}}><Check className="mr-1 h-3.5 w-3.5"/>Accept</Button></div></div>
        <p className="mt-2 whitespace-pre-wrap break-words text-xs">{row.note}</p>
      </article>)}
      {!pending.length && <p className="text-xs text-muted-foreground">No requests are waiting for review.</p>}
      <details className="border-t border-border pt-3"><summary className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold">Decline policy by client task <ChevronDown size={14}/></summary>
        <div className="mt-3 space-y-2">{data?.policies.map(row => <div key={row.taskId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-xs"><span className="min-w-0 break-words font-medium">{title(row.taskId)}</span><Button size="sm" variant="outline" disabled={busy} onClick={() => {setPolicyEdit(row);setGuidance(row.declineGuidance);}}>{row.allowDecline ? 'Decline allowed · Edit' : 'Decline disabled · Edit'}</Button></div>)}</div>
      </details>
      {!!data?.responses.filter(row=>row.status!=='pending').length && <details className="border-t border-border pt-3"><summary className="cursor-pointer text-xs font-semibold">Reviewed request history</summary><ul className="mt-2 space-y-2">{data.responses.filter(row=>row.status!=='pending').map(row => <li key={row.id} className="text-xs"><span className="font-medium">{title(row.taskId)} — {taskResponseLabels[row.kind]}</span><span className="ml-2 text-muted-foreground">{row.status}</span>{row.reviewNote && <p className="mt-1 text-muted-foreground">{row.reviewNote}</p>}</li>)}</ul></details>}
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
    <Dialog open={review!==null} onOpenChange={open=>{if(!open&&!busy)setReview(null);}}><DialogContent><DialogTitle>{review?.decision==='accept'?'Accept request':'Reject request'}</DialogTitle><DialogDescription>{review?.row.kind==='completion'&&review?.decision==='accept'?'This will mark the task completed under Bivi staff approval.':'This records Bivi’s decision. Task details will not be changed automatically for other request types.'}</DialogDescription>{(!workplanReady||workplanDirty)&&<p role="alert" className="text-xs text-amber-800">{!workplanReady?'Wait for the private work-plan draft to load.':'Save or discard the work-plan draft before continuing.'}</p>}<Textarea aria-label="Staff response" maxLength={2000} rows={3} disabled={busy||!workplanReady||workplanDirty} placeholder="Optional response to the client" value={reviewNote} onChange={event=>setReviewNote(event.target.value)}/><DialogFooter><Button variant="outline" disabled={busy} onClick={()=>setReview(null)}>Cancel</Button><Button disabled={busy||!data||!workplanReady||workplanDirty} onClick={()=>{if(!review||!data)return;void (async()=>{const done=await send({action:'review',responseId:review.row.id,decision:review.decision,note:reviewNote,projectRevision:data.projectRevision});if(done)setReview(null);})();}}>Confirm</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={policyEdit!==null} onOpenChange={open=>{if(!open&&!busy)setPolicyEdit(null);}}><DialogContent><DialogTitle>Client decline permissions</DialogTitle><DialogDescription>Declining is disabled by default. Explain why client input matters and what risks declining could create.</DialogDescription><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={policyEdit?.allowDecline??false} disabled={busy} onChange={event=>setPolicyEdit(current=>current?{...current,allowDecline:event.target.checked}:null)}/>Allow this client task to be declined</label><Textarea aria-label="Decline risk guidance" value={guidance} disabled={busy} maxLength={2000} rows={4} onChange={event=>setGuidance(event.target.value)}/><DialogFooter><Button variant="outline" disabled={busy} onClick={()=>setPolicyEdit(null)}>Cancel</Button><Button disabled={busy||!policyEdit||(policyEdit.allowDecline&&guidance.trim().length<15)} onClick={()=>{if(!policyEdit)return;void (async()=>{const done=await send({action:'policy',taskId:policyEdit.taskId,allowDecline:policyEdit.allowDecline,declineGuidance:guidance,expectedRevision:policyEdit.revision});if(done)setPolicyEdit(null);})();}}>Save policy</Button></DialogFooter></DialogContent></Dialog>
  </section>;
}
