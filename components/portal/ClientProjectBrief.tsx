'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { ProjectBriefVersion } from '@/lib/projects/brief-data';

const fields: { key: keyof ProjectBriefVersion['body']; label: string }[] = [
  { key: 'objectives', label: 'Objectives' },
  { key: 'audience', label: 'Audience' },
  { key: 'context', label: 'Discovery context' },
  { key: 'scope', label: 'Scope' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'assets', label: 'Assets & access' },
  { key: 'notes', label: 'Notes' },
];

export function ClientProjectBrief({
  id,
  version,
  canReview,
}: {
  id: string;
  version: ProjectBriefVersion | null;
  canReview: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  if (!version) {
    return (
      <section className="rounded-[22px] border border-border bg-card p-6">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Project brief</p>
        <h2 className="mt-2 font-heading text-2xl font-semibold">Bivi is preparing your brief</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">The brief will summarize the agreed scope and discovery information before the project moves beyond Discovery.</p>
      </section>
    );
  }

  async function decide(decision: 'approved' | 'changes_requested') {
    if (!version) return;
    if (decision === 'changes_requested' && !note.trim()) {
      setMessage('Describe the changes you need before submitting.');
      return;
    }
    if (!window.confirm(decision === 'approved' ? 'Approve this exact project brief version?' : 'Send this brief back to Bivi with your requested changes?')) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/client/projects/${id}/brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: version.version, decision, note }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The brief review could not be saved.');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'The result could not be confirmed. Reload before retrying.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[22px] border border-border bg-card p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Project brief · version {version.version}</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold">{version.body.title}</h2>
        </div>
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium capitalize">{version.status.replace('_', ' ')}</span>
      </div>

      <dl className="mt-6 space-y-5">
        {fields.map(({ key, label }) => version.body[key] ? (
          <div key={key}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="mt-2 whitespace-pre-wrap text-sm leading-6">{version.body[key]}</dd>
          </div>
        ) : null)}
      </dl>

      {version.decisionNote && (
        <div className="mt-6 rounded-xl bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Review note</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{version.decisionNote}</p>
        </div>
      )}

      {version.status === 'pending' && canReview && (
        <div className="mt-7 border-t border-border pt-6">
          <label htmlFor="brief-review-note" className="mb-2 block text-sm font-medium">Review note</label>
          <Textarea id="brief-review-note" rows={4} maxLength={4000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional when approving; required when requesting changes." />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" disabled={busy} onClick={() => void decide('approved')}>Approve brief</Button>
            <Button type="button" variant="outline" disabled={busy || !note.trim()} onClick={() => void decide('changes_requested')}>Request changes</Button>
          </div>
        </div>
      )}

      {version.status === 'pending' && !canReview && (
        <p className="mt-6 text-sm text-muted-foreground">This brief is awaiting an authorized project approver.</p>
      )}
      {message && <p role="status" className="mt-4 text-sm text-muted-foreground">{message}</p>}
    </section>
  );
}
