'use client';

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { ProjectBody } from '@/lib/projects/schema';
import { workplanDraftBodySchema } from '@/lib/projects/workplan-draft-schema';

type StoredDraft = { body: ProjectBody; baseRevision: number; updatedAt: string };
type DraftState = 'loading' | 'idle' | 'pending' | 'saving' | 'saved' | 'error' | 'conflict';

type Props = {
  id: string;
  initialRevision: number;
  revision: number;
  body: ProjectBody | undefined;
  savedBody: ProjectBody | undefined;
  enabled: boolean;
  busy: boolean;
  setBody: Dispatch<SetStateAction<ProjectBody | undefined>>;
};

/** Server-backed drafts, intentionally separate from the published project revision. */
export function useProjectWorkDraft({ id, initialRevision, revision, body, savedBody, enabled, busy, setBody }: Props) {
  const url = `/api/admin/projects/${id}/draft`;
  const [ready, setReady] = useState(false);
  const [recoverable, setRecoverable] = useState<StoredDraft | null>(null);
  const [state, setState] = useState<DraftState>('loading');
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const latest = useRef(body);
  latest.current = body;
  const inFlight = useRef<Promise<boolean> | null>(null);
  const lastAttempt = useRef('');

  useEffect(() => {
    if (!enabled) { setReady(false); setState('idle'); return; }
    let active = true;
    setReady(false);
    setState('loading');
    void (async () => {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Saved draft could not be loaded.');
        if (!active) return;
        const draft = json.draft as StoredDraft | null;
        if (draft && !workplanDraftBodySchema.safeParse(draft.body).success) throw new Error('Saved draft is invalid.');
        if (draft && JSON.stringify(draft.body) !== JSON.stringify(savedBody)) {
          setRecoverable(draft);
          setSavedAt(draft.updatedAt);
          setState(draft.baseRevision !== initialRevision ? 'conflict' : 'idle');
        } else {
          setRecoverable(null);
          setState('idle');
        }
        setReady(true);
        setError('');
      } catch (e) {
        if (!active) return;
        setReady(false);
        setState('error');
        setError(e instanceof Error ? e.message : 'Saved draft could not be loaded.');
      }
    })();
    return () => { active = false; };
  // Re-check when the authoritative server project revision changes after a refresh.
  }, [url, initialRevision, enabled]);

  const waitForDraft = useCallback(async () => {
    if (inFlight.current) await inFlight.current;
  }, []);

  const persist = useCallback(async (snapshot: ProjectBody, baseRevision: number) => {
    if (inFlight.current) await inFlight.current;
    const signature = `${baseRevision}:${JSON.stringify(snapshot)}`;
    const promise = (async () => {
      setState('saving');
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: snapshot, baseRevision }),
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Draft could not be saved.');
        lastAttempt.current = signature;
        setSavedAt(json.savedAt || null);
        setError('');
        if (json.conflict) {
          setConflict(true);
          setState('conflict');
        } else if (JSON.stringify(latest.current) === JSON.stringify(snapshot)) {
          setState('saved');
        } else {
          setState('pending');
        }
        return !json.conflict;
      } catch (e) {
        lastAttempt.current = signature;
        setError(e instanceof Error ? e.message : 'Draft could not be saved.');
        setState('error');
        return false;
      }
    })();
    inFlight.current = promise;
    try { return await promise; }
    finally { if (inFlight.current === promise) inFlight.current = null; }
  }, [url]);

  const dirty = Boolean(body && savedBody && JSON.stringify(body) !== JSON.stringify(savedBody));
  useEffect(() => {
    if (!enabled || !ready || !dirty || !body || recoverable || conflict || busy) return;
    const signature = `${revision}:${JSON.stringify(body)}`;
    if (lastAttempt.current === signature) return;
    setState('pending');
    const timer = window.setTimeout(() => { void persist(body, revision); }, 1200);
    return () => window.clearTimeout(timer);
  }, [enabled, ready, dirty, body, recoverable, conflict, busy, revision, persist]);

  const saveDraft = useCallback(async () => {
    if (!ready || !body || !enabled || recoverable || conflict) return false;
    return persist(body, revision);
  }, [ready, body, enabled, recoverable, conflict, persist, revision]);

  const removeDraft = useCallback(async () => {
    await waitForDraft();
    const response = await fetch(url, { method: 'DELETE' });
    const json = await response.json();
    if (!response.ok) {
      setState('error');
      setError(json.error || 'Saved draft could not be removed.');
      return false;
    }
    lastAttempt.current = '';
    setRecoverable(null);
    setConflict(false);
    setSavedAt(null);
    setError('');
    setState('idle');
    return true;
  }, [url, waitForDraft]);

  const flagConflict = useCallback(() => { setConflict(true); setState('conflict'); }, []);

  const restore = useCallback(() => {
    if (!recoverable) return;
    if (recoverable.baseRevision !== revision) {
      setConflict(true);
      setState('conflict');
      return;
    }
    setBody(recoverable.body);
    setConflict(false);
    setState('saved');
    lastAttempt.current = `${revision}:${JSON.stringify(recoverable.body)}`;
    setRecoverable(null);
  }, [recoverable, revision, setBody]);

  return { state, ready, recoverable, conflict, error, savedAt, dirty, saveDraft, removeDraft, restore, waitForDraft, flagConflict };
}
