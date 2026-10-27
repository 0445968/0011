'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { refreshProjectSurfaces } from '@/lib/projects/refresh';

export function ProjectBriefRename({ id, initialTitle, initialRevision }: {
  id: string; initialTitle: string; initialRevision: number;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [savedTitle, setSavedTitle] = useState(initialTitle);
  const [revision, setRevision] = useState(initialRevision);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (busy || title.trim() !== savedTitle) return;
    setTitle(initialTitle);
    setSavedTitle(initialTitle);
    setRevision(initialRevision);
  }, [initialTitle, initialRevision, busy, title, savedTitle]);

  async function save() {
    if (busy) return;
    const nextTitle = title.trim();
    if (!nextTitle || nextTitle.length > 200) {
      setError(true); setMessage('Enter a project name from 1 to 200 characters.'); return;
    }
    if (nextTitle === savedTitle) { setMessage('Project name is already saved.'); setError(false); return; }
    setBusy(true); setMessage('Saving project name…'); setError(false);
    try {
      const response = await fetch(`/api/admin/projects/${id}/rename`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: nextTitle, expectedRevision: revision }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (response.status === 409 && result.code === 'revision_conflict') {
        if (typeof result.currentTitle === 'string' && Number.isInteger(result.revision)) {
          setSavedTitle(result.currentTitle); setRevision(result.revision);
          setError(true); setMessage(`Project changed elsewhere. Current saved name: “${result.currentTitle}”. Review your name and retry.`);
        } else { setError(true); setMessage(result.error || 'Project changed elsewhere. Reload the saved name before retrying.'); }
        return;
      }
      if (!response.ok || result.saved !== true || typeof result.title !== 'string' || !Number.isInteger(result.revision)) {
        throw new Error(result.error || 'Project name could not be saved. Your entry is still here.');
      }
      setTitle(result.title); setSavedTitle(result.title); setRevision(result.revision);
      setError(false);
      setMessage(result.refreshWarning || (result.changed ? 'Project name saved.' : 'Project name is already saved.'));
      if (result.changed) refreshProjectSurfaces(id, router);
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : 'Project name could not be saved. Your entry is still here.');
    } finally { setBusy(false); }
  }

  const dirty = title.trim() !== savedTitle;
  return <section aria-label="Project name" className="rounded-xl border border-border bg-card p-3 sm:p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-sm font-semibold">Project name</h2><p className="mt-0.5 text-[11px] text-muted-foreground">Rename the project without changing its work plan.</p></div>
      <span className="rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">Saved revision {revision}</span>
    </div>
    <form className="mt-2 flex max-w-3xl flex-wrap items-center gap-2" onSubmit={event => { event.preventDefault(); void save(); }}>
      <Input aria-label="Project name" maxLength={200} className="min-w-[14rem] flex-1" value={title} disabled={busy}
        onChange={event => { setTitle(event.target.value); setMessage(''); setError(false); }}/>
      <button type="submit" disabled={busy || !dirty} className="rounded-md border border-border px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? 'Saving…' : 'Save name'}
      </button>
      <p aria-live="polite" role={error ? 'alert' : 'status'} className={`basis-full text-[11px] ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
        {message || (dirty ? 'Only the project name will be saved.' : 'Project name is saved.')}
      </p>
    </form>
  </section>;
}
