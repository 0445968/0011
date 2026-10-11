'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { OnboardingItem, OnboardingItemStatus } from '@/lib/onboarding/item-schema';

const typeLabels: Record<OnboardingItem['itemType'], string> = {
  questionnaire: 'Questionnaire',
  assessment: 'Assessment',
  file_upload: 'File upload',
  access_invitation: 'Access invitation',
  information_request: 'Information request',
  approval: 'Approval',
};

function statusLabel(status: OnboardingItemStatus) {
  return {
    pending: 'Action needed',
    submitted: 'Submitted',
    clarification: 'Needs clarification',
    accepted: 'Accepted',
    waived: 'Waived',
  }[status];
}

function ClientItemCard({ item }: { item: OnboardingItem }) {
  const router = useRouter();
  const [response, setResponse] = useState(item.response);
  const [revision, setRevision] = useState(item.revision);
  const [status, setStatus] = useState(item.status);
  const [lastSaved, setLastSaved] = useState(item.response);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [blocked, setBlocked] = useState(false);
  const inFlight = useRef(false);

  const editable = item.owner === 'client' && ['pending', 'clarification'].includes(status) && !blocked;

  async function persist(action: 'save' | 'submit', value = response) {
    if (inFlight.current || blocked) return false;
    inFlight.current = true;
    setSaveState('saving');
    setMessage('');

    try {
      const result = await fetch(`/api/client/onboarding/${item.requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, itemKey: item.itemKey, expectedRevision: revision, response: value }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await result.json();
      if (result.status === 409) setBlocked(true);
      if (!result.ok) throw new Error(data.error || 'The onboarding item could not be saved.');

      setRevision(data.revision);
      setStatus(data.status);
      setLastSaved(value);
      setSaveState('saved');
      if (action === 'submit') {
        setMessage('Submitted to Bivi for review.');
        router.refresh();
      }
      return true;
    } catch (error) {
      setSaveState('error');
      setMessage(
        error instanceof Error && error.name !== 'TimeoutError'
          ? error.message
          : 'The save could not be confirmed. Reload before retrying.'
      );
      return false;
    } finally {
      inFlight.current = false;
    }
  }

  useEffect(() => {
    if (!editable || response === lastSaved || inFlight.current) return;
    setSaveState('idle');
    const timer = window.setTimeout(() => {
      void persist('save', response);
    }, 900);
    return () => window.clearTimeout(timer);
    // persist intentionally uses the revision belonging to this rendered item state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, lastSaved, revision, editable]);

  return (
    <article className="rounded-[22px] border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full border border-border px-2.5 py-1">{typeLabels[item.itemType]}</span>
            {item.required && <span className="rounded-full border border-border px-2.5 py-1">Required</span>}
            {item.dueOn && <span className="rounded-full border border-border px-2.5 py-1">Due {item.dueOn}</span>}
          </div>
          <h3 className="mt-3 font-heading text-xl font-semibold">{item.title}</h3>
          {item.prompt && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{item.prompt}</p>}
        </div>
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium">{statusLabel(status)}</span>
      </div>

      {item.dependsOn && (
        <p className="mt-4 text-xs text-muted-foreground">This item unlocks after <span className="font-mono">{item.dependsOn}</span> is accepted or waived.</p>
      )}

      {status === 'clarification' && item.staffNotes && (
        <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide">Bivi requested clarification</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{item.staffNotes}</p>
        </div>
      )}

      {status === 'waived' && item.waiverReason && (
        <p className="mt-5 text-sm text-muted-foreground">Waived by Bivi: {item.waiverReason}</p>
      )}

      {item.owner === 'bivi' ? (
        <p className="mt-5 text-sm text-muted-foreground">Bivi owns this step. No action is required from you right now.</p>
      ) : editable ? (
        <div className="mt-5">
          <label htmlFor={`response-${item.itemKey}`} className="mb-2 block text-sm font-medium">
            {item.itemType === 'file_upload' ? 'File note / reference' : 'Your response'}
          </label>
          <Textarea
            id={`response-${item.itemKey}`}
            value={response}
            rows={5}
            maxLength={12000}
            onChange={(event) => setResponse(event.target.value)}
            placeholder={item.itemType === 'file_upload' ? 'Upload files below. Add a note here if Bivi should know which files belong to this item.' : 'Add your response…'}
          />
          {item.itemType === 'access_invitation' && (
            <p className="mt-2 text-xs font-medium text-muted-foreground">Never paste passwords, recovery codes, private keys, API tokens or other secrets here. Invite Bivi through the provider whenever possible.</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" disabled={saveState === 'saving' || blocked} onClick={() => void persist('submit')}>
              {saveState === 'saving' ? 'Saving…' : 'Submit to Bivi'}
            </Button>
            <span className="text-xs text-muted-foreground">
              {saveState === 'saving' ? 'Saving draft…' : saveState === 'saved' ? 'Draft saved' : saveState === 'error' ? 'Save needs attention' : response !== lastSaved ? 'Autosave pending…' : 'Saved'}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your submitted response</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{response || 'No written response.'}</p>
        </div>
      )}

      {message && <p role="status" className="mt-4 text-sm text-muted-foreground">{message}</p>}
      {blocked && <Button type="button" variant="outline" className="mt-3" onClick={() => window.location.reload()}>Reload item</Button>}
    </article>
  );
}

export function ClientOnboardingWorkspace({
  title,
  state,
  items,
}: {
  title: string;
  state: 'in_progress' | 'complete';
  items: OnboardingItem[];
}) {
  const required = items.filter((item) => item.required);
  const accepted = required.filter((item) => ['accepted', 'waived'].includes(item.status)).length;
  const actionCount = items.filter((item) => item.owner === 'client' && ['pending', 'clarification'].includes(item.status)).length;

  return (
    <div className="space-y-7">
      <section className="rounded-[24px] border border-border bg-card p-6 sm:p-7">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Onboarding</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {state === 'complete'
            ? 'Your onboarding record is complete. Bivi will use the accepted information as the project moves into production.'
            : actionCount > 0
              ? `${actionCount} ${actionCount === 1 ? 'item needs' : 'items need'} your attention. Draft responses save automatically.`
              : 'Your current items are with Bivi for review.'}
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs">
          <span className="rounded-full bg-muted px-3 py-1.5">{accepted}/{required.length} required items accepted</span>
          <span className="rounded-full bg-muted px-3 py-1.5">{actionCount} action {actionCount === 1 ? 'item' : 'items'}</span>
        </div>
      </section>

      <section className="space-y-4" aria-label="Onboarding requirements">
        {items.map((item) => <ClientItemCard key={item.itemKey} item={item} />)}
        {!items.length && <p className="rounded-[22px] border border-border bg-card p-6 text-sm text-muted-foreground">Bivi is preparing your personalized onboarding checklist.</p>}
      </section>
    </div>
  );
}
