'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import {
  taskResponseKinds, taskResponseLabels, taskResponseWorkspaceSchema,
  type TaskResponseWorkspace,
} from '@/lib/projects/task-response-schema';

type Kind = typeof taskResponseKinds[number];

export function ClientTaskResponseActions({ projectId, taskId, projectRevision, disabled, completed, completionUnavailable = false }: {
  projectId: string;
  taskId: string;
  projectRevision: number;
  disabled: boolean;
  completed: boolean;
  completionUnavailable?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<TaskResponseWorkspace | null>(null);
  const [kind, setKind] = useState<Kind>('completion');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const policy = data?.policies.find(row => row.taskId === taskId);
  const pending = data?.responses.find(row => row.taskId === taskId && row.status === 'pending');

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    void fetch(`/api/client/projects/${projectId}/responses`, { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        const payload: unknown = await response.json();
        if (!response.ok) throw new Error((payload as {error?:string}).error ?? 'Requests unavailable.');
        const parsed = taskResponseWorkspaceSchema.safeParse(payload);
        if (!parsed.success) throw new Error('Task requests could not be loaded.');
        if (!controller.signal.aborted) setData(parsed.data);
      })
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Request unavailable.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, projectId]);

  async function submit() {
    if (busy || !policy?.allowed || pending || !note.trim() || data?.projectRevision !== projectRevision) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/client/projects/${projectId}/responses`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, kind, note: note.trim(), projectRevision }),
        signal: AbortSignal.timeout(20000),
      });
      const payload = await response.json();
      if (!response.ok || !payload.saved) throw new Error(payload.error || 'Request was not saved.');
      setSuccess(`${taskResponseLabels[kind]} sent for Bivi review.`);
      setNote('');
      setOpen(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error && cause.name !== 'TimeoutError' ? cause.message : 'Request status uncertain. Refresh before retrying.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <Button type="button" variant="outline" disabled={disabled} onClick={() => { setKind(completed || completionUnavailable ? 'clarification' : 'completion'); setSuccess(''); setOpen(true); }}>
      <MessageSquarePlus className="mr-1.5 h-4 w-4" aria-hidden="true" /> Requests &amp; review
    </Button>
    {success && <p role="status" className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">{success}</p>}
    <Dialog open={open} onOpenChange={value => { if (!busy) setOpen(value); }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogTitle>Task request for Bivi</DialogTitle>
        <DialogDescription>Requests are reviewed by Bivi staff. Submitting completed work does not mark the task complete until Bivi approves it.</DialogDescription>
        {loading ? <p role="status" className="text-sm">Loading task permissions…</p> : <>
          {!policy?.allowed && <p className="text-sm text-muted-foreground">You are not an eligible assignee or project manager for this task.</p>}
          {pending && <p role="status" className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">A {pending.kind} request is awaiting staff review. You cannot submit another request for this task until that review is completed.</p>}
          {data && data.projectRevision !== projectRevision && <p role="alert" className="text-sm text-red-600">Project details changed. Refresh the project before sending a request.</p>}
          {policy?.allowed && !pending && <>
            <fieldset className="space-y-2"><legend className="mb-2 text-xs font-semibold">What do you need?</legend>
              {taskResponseKinds.filter(item => (!completed && !completionUnavailable || item !== 'completion') && (item !== 'decline' || policy.allowDecline)).map(item =>
                <label key={item} className="flex cursor-pointer items-center gap-2 text-sm"><input type="radio" name={`task-response-${taskId}`} checked={kind === item} onChange={() => setKind(item)} />{taskResponseLabels[item]}</label>
              )}
            </fieldset>
            {kind === 'decline' && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"><strong>Before declining:</strong> {policy.declineGuidance} Your contribution may affect project timelines, the quality of the deliverable, or the final results. Please explain your reasons so Bivi can assess the impact.</p>}
            <label className="block text-sm font-medium" htmlFor={`request-note-${taskId}`}>Your explanation</label>
            <Textarea id={`request-note-${taskId}`} rows={4} maxLength={2000} disabled={busy} value={note} onChange={event => setNote(event.target.value)} placeholder={kind === 'completion' ? 'Describe what you completed and how Bivi can verify it.' : 'Explain what you need from Bivi.'} />
          </>}
        </>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <DialogFooter><Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" disabled={loading || busy || !policy?.allowed || !!pending || note.trim().length < (kind === 'decline' ? 15 : 5) || data?.projectRevision !== projectRevision} onClick={() => void submit()}>{busy ? 'Sending…' : kind === 'completion' ? 'Submit for approval' : 'Send request'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}
