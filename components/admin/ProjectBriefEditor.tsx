'use client';
import {approvalDomId} from '@/lib/approvals/links';
import { useWorkspaceUnsavedChanges } from './workspace/WorkspaceNavigationGuard';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  projectBriefBodySchema,
  type ProjectBriefBody,
} from '@/lib/projects/brief-schema';
import type {
  ProjectBriefDraft,
  ProjectBriefVersion,
} from '@/lib/projects/brief-data';

const fields: { key: keyof ProjectBriefBody; label: string; rows: number }[] = [
  { key: 'objectives', label: 'Objectives', rows: 4 },
  { key: 'audience', label: 'Audience', rows: 4 },
  { key: 'context', label: 'Discovery context', rows: 6 },
  { key: 'scope', label: 'Accepted scope', rows: 7 },
  { key: 'requirements', label: 'Requirements and client responsibilities', rows: 5 },
  { key: 'timeline', label: 'Timeline and sequencing', rows: 4 },
  { key: 'assets', label: 'Assets and access', rows: 5 },
  { key: 'notes', label: 'Brief notes', rows: 4 },
];

export function ProjectBriefEditor({
  id,
  draft,
  versions,
}: {
  id: string;
  draft: ProjectBriefDraft | null;
  versions: ProjectBriefVersion[];
}) {
  const router = useRouter();
  const [body, setBody] = useState<ProjectBriefBody | null>(draft?.body ?? null);
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [message, setMessage] = useState('');

  const dirty = Boolean(draft && body && JSON.stringify(body) !== JSON.stringify(draft.body));
  const markWorkspaceSaved = useWorkspaceUnsavedChanges(dirty, 'Project brief', () => command('save'));

  if (!draft || !body) {
    return (
      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-heading text-xl font-semibold">Project brief</h2>
        <p className="mt-3 text-sm text-muted-foreground">The brief will be created when the project is activated.</p>
      </section>
    );
  }

  const valid = projectBriefBodySchema.safeParse(body).success;
  const reviewReady = Boolean(body.title.trim() && body.objectives.trim() && body.scope.trim());

  function field<K extends keyof ProjectBriefBody>(key: K, value: ProjectBriefBody[K]) {
    setBody((current) => current ? { ...current, [key]: value } : current);
  }

  async function command(action: 'save' | 'request_review') {
    if (!draft) return;
    if (action === 'save' && !valid) {
      setMessage('Check the project brief fields before saving.');
      return;
    }
    if (action === 'request_review' && (!reviewReady || dirty)) {
      setMessage(dirty ? 'Save brief changes before requesting approval.' : 'Complete the title, objectives and scope first.');
      return;
    }
    if (action === 'request_review' && !window.confirm('Publish a fixed brief version for the authorized client approver?')) return;

    setBusy(true);
    setBlocked(false);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/projects/${id}/brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          expectedRevision: draft.revision,
          ...(action === 'save' ? { body } : {}),
        }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (response.status === 409) setBlocked(true);
      if (!response.ok) throw new Error(data.error || 'The project brief could not be saved.');
      markWorkspaceSaved(); window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'The result could not be confirmed. Reload before retrying.');
      if (error instanceof Error && ['TypeError', 'TimeoutError'].includes(error.name)) setBlocked(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Discovery gate</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold">Project brief</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Review the generated draft, save your edits, then issue a fixed version for client approval. The lifecycle cannot move beyond Discovery until a brief version is approved.</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs">Draft revision {draft.revision}</span>
      </div>

      <fieldset disabled={busy || blocked} className="mt-6 space-y-5">
        <legend className="sr-only">Project brief draft</legend>
        <div>
          <label htmlFor="brief-title" className="mb-2 block text-sm font-medium">Brief title</label>
          <Input id="brief-title" maxLength={200} value={body.title} onChange={(event) => field('title', event.target.value)} />
        </div>
        {fields.map(({ key, label, rows }) => (
          <div key={key}>
            <label htmlFor={`brief-${key}`} className="mb-2 block text-sm font-medium">{label}</label>
            <Textarea id={`brief-${key}`} rows={rows} value={body[key]} onChange={(event) => field(key, event.target.value)} />
          </div>
        ))}
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => void command('save')} disabled={!dirty}>Save brief</Button>
          <Button type="button" variant="outline" onClick={() => void command('request_review')} disabled={dirty || !reviewReady}>Request client approval</Button>
        </div>
      </fieldset>

      {message && <p role="status" className="mt-4 text-sm text-muted-foreground">{message}</p>}
      {blocked && <Button type="button" variant="outline" className="mt-3" onClick={() => window.location.reload()}>Reload brief</Button>}

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="font-heading text-xl font-semibold">Issued brief versions</h3>
        <div className="mt-4 space-y-4">
          {versions.map((version) => (
            <details id={approvalDomId('brief',String(version.version),version.version)} key={version.version} className="rounded-xl border border-border p-4">
              <summary className="cursor-pointer text-sm font-medium">Version {version.version} · {version.status.replace('_', ' ')}</summary>
              <div className="mt-4 space-y-3 text-sm">
                <p className="whitespace-pre-wrap"><strong>Objectives:</strong> {version.body.objectives}</p>
                <p className="whitespace-pre-wrap"><strong>Scope:</strong> {version.body.scope}</p>
                {version.decisionNote && <p className="whitespace-pre-wrap"><strong>Client note:</strong> {version.decisionNote}</p>}
                <p className="text-xs text-muted-foreground">Issued {new Date(version.publishedAt).toISOString()}</p>
              </div>
            </details>
          ))}
          {!versions.length && <p className="text-sm text-muted-foreground">No brief version has been issued yet.</p>}
        </div>
      </div>
    </section>
  );
}
