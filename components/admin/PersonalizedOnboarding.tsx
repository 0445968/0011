'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { OnboardingItem, OnboardingItemDefinition, OnboardingItemType, OnboardingPhase } from '@/lib/onboarding/item-schema';

const types: { value: OnboardingItemType; label: string }[] = [
  { value: 'information_request', label: 'Information request' },
  { value: 'questionnaire', label: 'Questionnaire' },
  { value: 'file_upload', label: 'File upload' },
  { value: 'access_invitation', label: 'Access invitation' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'approval', label: 'Approval' },
];

const phases: { value: OnboardingPhase; label: string }[] = [
  { value: 'proposal-onboarding', label: 'Proposal & onboarding' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'direction', label: 'Direction' },
  { value: 'production', label: 'Production' },
  { value: 'review', label: 'Review' },
  { value: 'qa', label: 'QA' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'handoff', label: 'Handoff' },
  { value: 'inquiry', label: 'Inquiry' },
];

function definitionFromItem(item: OnboardingItem): OnboardingItemDefinition {
  return {
    itemKey: item.itemKey,
    title: item.title,
    owner: item.owner,
    itemType: item.itemType,
    required: item.required,
    dueOn: item.dueOn,
    serviceIds: item.serviceIds,
    phase: item.phase,
    dependsOn: item.dependsOn,
    prompt: item.prompt,
    assessmentSlug: item.assessmentSlug,
  };
}

type Command = Record<string, unknown>;

function ItemEditor({
  item,
  allItems,
  locked,
  busy,
  command,
}: {
  item: OnboardingItem;
  allItems: OnboardingItem[];
  locked: boolean;
  busy: boolean;
  command: (body: Command) => Promise<void>;
}) {
  const [definition, setDefinition] = useState(() => definitionFromItem(item));
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');

  function field<K extends keyof OnboardingItemDefinition>(key: K, value: OnboardingItemDefinition[K]) {
    setDefinition((current) => ({ ...current, [key]: value }));
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{item.itemKey}</p>
          <h3 className="mt-2 font-heading text-xl font-semibold">{item.title}</h3>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">{item.status.replace('_', ' ')}</span>
      </div>

      {item.response && (
        <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Client response</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{item.response}</p>
        </div>
      )}

      {item.staffNotes && <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">Staff note: {item.staffNotes}</p>}
      {item.waiverReason && <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">Waiver: {item.waiverReason}</p>}

      <details className="mt-5 rounded-xl border border-border p-4">
        <summary className="cursor-pointer text-sm font-medium">Edit requirement</summary>
        <fieldset disabled={locked || busy} className="mt-5 grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Edit onboarding requirement</legend>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm" htmlFor={`title-${item.itemKey}`}>Title</label>
            <Input id={`title-${item.itemKey}`} maxLength={300} value={definition.title} onChange={(e) => field('title', e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm" htmlFor={`owner-${item.itemKey}`}>Owner</label>
            <select id={`owner-${item.itemKey}`} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" value={definition.owner} onChange={(e) => field('owner', e.target.value as 'client' | 'bivi')}>
              <option value="client">Client</option>
              <option value="bivi">Bivi</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm" htmlFor={`type-${item.itemKey}`}>Type</label>
            <select id={`type-${item.itemKey}`} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" value={definition.itemType} onChange={(e) => field('itemType', e.target.value as OnboardingItemType)}>
              {types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm" htmlFor={`due-${item.itemKey}`}>Due date</label>
            <Input id={`due-${item.itemKey}`} type="date" value={definition.dueOn ?? ''} onChange={(e) => field('dueOn', e.target.value || null)} />
          </div>
          <div>
            <label className="mb-2 block text-sm" htmlFor={`phase-${item.itemKey}`}>Phase</label>
            <select id={`phase-${item.itemKey}`} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" value={definition.phase ?? ''} onChange={(e) => field('phase', (e.target.value || null) as OnboardingPhase | null)}>
              <option value="">No phase</option>
              {phases.map((phase) => <option key={phase.value} value={phase.value}>{phase.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm" htmlFor={`dependency-${item.itemKey}`}>Blocked by</label>
            <select id={`dependency-${item.itemKey}`} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" value={definition.dependsOn ?? ''} onChange={(e) => field('dependsOn', e.target.value || null)}>
              <option value="">No dependency</option>
              {allItems.filter((candidate) => candidate.itemKey !== item.itemKey).map((candidate) => <option key={candidate.itemKey} value={candidate.itemKey}>{candidate.title}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-3 self-end pb-3 text-sm">
            <input type="checkbox" checked={definition.required} onChange={(e) => field('required', e.target.checked)} /> Required
          </label>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm" htmlFor={`prompt-${item.itemKey}`}>Client prompt / instructions</label>
            <Textarea id={`prompt-${item.itemKey}`} rows={4} maxLength={4000} value={definition.prompt} onChange={(e) => field('prompt', e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => command({ action: 'update', itemKey: item.itemKey, expectedRevision: item.revision, item: definition })}>Save requirement</Button>
          </div>
        </fieldset>
      </details>

      <fieldset disabled={locked || busy} className="mt-5 space-y-3">
        <legend className="sr-only">Review onboarding requirement</legend>
        <label htmlFor={`note-${item.itemKey}`} className="block text-sm">Review note / clarification request</label>
        <Textarea id={`note-${item.itemKey}`} rows={3} maxLength={4000} value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="flex flex-wrap gap-3">
          {(item.status === 'submitted' || (item.owner === 'bivi' && ['pending', 'clarification'].includes(item.status))) && (
            <Button type="button" onClick={() => command({ action: 'accept', itemKey: item.itemKey, expectedRevision: item.revision, note })}>Accept item</Button>
          )}
          {item.owner === 'client' && ['submitted', 'accepted'].includes(item.status) && (
            <Button type="button" variant="outline" disabled={!note.trim()} onClick={() => command({ action: 'clarify', itemKey: item.itemKey, expectedRevision: item.revision, note })}>Request clarification</Button>
          )}
        </div>

        <label htmlFor={`reason-${item.itemKey}`} className="block pt-2 text-sm">Waiver / removal reason</label>
        <Textarea id={`reason-${item.itemKey}`} rows={2} maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="flex flex-wrap gap-3">
          {item.status !== 'waived' && <Button type="button" variant="outline" disabled={!reason.trim()} onClick={() => command({ action: 'waive', itemKey: item.itemKey, expectedRevision: item.revision, reason })}>Waive item</Button>}
          <Button type="button" variant="outline" disabled={!reason.trim()} onClick={() => {
            if (window.confirm(`Remove “${item.title}” from this project's onboarding? The removal stays in history.`)) {
              void command({ action: 'remove', itemKey: item.itemKey, expectedRevision: item.revision, reason });
            }
          }}>Remove item</Button>
        </div>
      </fieldset>

      {item.serviceIds.length > 0 && <p className="mt-4 text-xs text-muted-foreground">Services: {item.serviceIds.join(', ')}</p>}
    </article>
  );
}

export function PersonalizedOnboarding({ id, items, locked }: { id: string; items: OnboardingItem[]; locked: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [message, setMessage] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPrompt, setNewPrompt] = useState('');

  async function command(body: Command) {
    if (busy || blocked) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/leads/${id}/onboarding/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (response.status === 409 || response.status >= 500) setBlocked(true);
      if (!response.ok) throw new Error(data.error || 'The onboarding item could not be saved.');
      setMessage('Onboarding requirement saved.');
      setNewTitle('');
      setNewPrompt('');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'The result could not be confirmed. Reload before retrying.');
    } finally {
      setBusy(false);
    }
  }

  const requiredOutstanding = items.filter((item) => item.required && !['accepted', 'waived'].includes(item.status)).length;

  return (
    <section className="mt-8 space-y-5">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Personalized onboarding</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold">Client requirements</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">These items are visible in the client portal. Submitted items still require Bivi acceptance before onboarding can be completed.</p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium">{requiredOutstanding} required outstanding</span>
        </div>

        <details className="mt-6 rounded-xl border border-border p-4">
          <summary className="cursor-pointer text-sm font-medium">Add a custom requirement</summary>
          <fieldset disabled={locked || busy} className="mt-4 space-y-4">
            <legend className="sr-only">Add custom onboarding requirement</legend>
            <Input value={newTitle} maxLength={300} onChange={(e) => setNewTitle(e.target.value)} placeholder="Requirement title" />
            <Textarea value={newPrompt} maxLength={4000} rows={3} onChange={(e) => setNewPrompt(e.target.value)} placeholder="Instructions for the client" />
            <Button type="button" disabled={!newTitle.trim()} onClick={() => command({
              action: 'add',
              item: {
                itemKey: `custom-${crypto.randomUUID()}`,
                title: newTitle.trim(),
                owner: 'client',
                itemType: 'information_request',
                required: true,
                dueOn: null,
                serviceIds: [],
                phase: 'discovery',
                dependsOn: null,
                prompt: newPrompt,
                assessmentSlug: null,
              },
            })}>Add requirement</Button>
          </fieldset>
        </details>
      </div>

      {items.map((item) => <ItemEditor key={`${item.itemKey}:${item.revision}`} item={item} allItems={items} locked={locked} busy={busy || blocked} command={command} />)}
      {!items.length && <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Start onboarding to generate requirements from the accepted services.</p>}
      {message && <p role="status" className="text-sm">{message}</p>}
      {blocked && <Button type="button" variant="outline" onClick={() => window.location.reload()}>Reload onboarding</Button>}
    </section>
  );
}
