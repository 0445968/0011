'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// Client-safe values; server data access modules are never imported into this component.
type Status = 'new' | 'qualified' | 'declined';
export function InquiryReview({ id, initialStatus, initialNote, revision }: { id: string; initialStatus: Status; initialNote: string; revision: number }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [note, setNote] = useState(initialNote);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [conflict, setConflict] = useState(false);
  useEffect(() => { setStatus(initialStatus); setNote(initialNote); setConflict(false); }, [initialStatus, initialNote, revision]);
  async function save() {
    setBusy(true); setMessage(''); setConflict(false);
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note, expectedRevision: revision }), signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (response.status === 401) { router.replace('/admin/login'); router.refresh(); return; }
      if (response.status === 409) setConflict(true);
      if (!response.ok) throw new Error(data.error || 'Could not save the decision.');
      setMessage('Decision saved.'); router.refresh();
    } catch (err) { setMessage(err instanceof Error && err.name !== 'TimeoutError' ? err.message : 'The decision could not be confirmed. Reload this inquiry before trying again.'); }
    finally { setBusy(false); }
  }
  return <section className="rounded-2xl border border-border bg-card p-6">
    <h2 className="font-heading text-xl font-semibold">Review decision</h2>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Qualification records fit for a proposal. It doesn’t book the project or send a message to the client.</p>
    <fieldset disabled={busy} className="mt-5 space-y-5">
      <legend className="sr-only">Review inquiry</legend>
      <div><label htmlFor="review-status" className="mb-2 block text-sm font-medium">Status</label><select id="review-status" value={status} onChange={(e) => { setStatus(e.target.value as Status); setMessage(''); }} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"><option value="new">New</option><option value="qualified">Qualified</option><option value="declined">Declined</option></select></div>
      <div><label htmlFor="review-note" className="mb-2 block text-sm font-medium">Internal decision note</label><Textarea id="review-note" maxLength={2000} value={note} onChange={(e) => { setNote(e.target.value); setMessage(''); }} rows={5} className="rounded-xl" /><p className="mt-1 text-xs text-muted-foreground">{note.length} / 2,000 characters. Visible to staff only.</p></div>
      <Button type="button" disabled={conflict} className="h-11 w-full rounded-[18px] font-mono" onClick={save}>{busy ? 'Saving…' : 'Save decision'}</Button>
    </fieldset>
    {message && <p role="status" className="mt-4 text-sm">{message}</p>}
    {conflict && <Button type="button" variant="outline" className="mt-3 rounded-xl" onClick={() => window.location.reload()}>Reload inquiry</Button>}
  </section>;
}
