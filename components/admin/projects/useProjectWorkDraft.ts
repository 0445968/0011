'use client';

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { ProjectBody } from '@/lib/projects/schema';
import { workplanDraftBodySchema } from '@/lib/projects/workplan-draft-schema';
import { mergeProjectBodies, type MergeChoice, type WorkplanMergeConflict } from '@/lib/projects/workplan-merge';

type StoredDraft = { body: ProjectBody; baseBody: ProjectBody | null; baseRevision: number; updatedAt: string };
type DraftState = 'loading' | 'idle' | 'pending' | 'saving' | 'saved' | 'error' | 'conflict';
type Rebase = { baseline: ProjectBody; draft: ProjectBody; latest: ProjectBody; revision: number; conflicts: WorkplanMergeConflict[]; choices: Record<string, MergeChoice> };

type Props = {
  id: string;
  initialRevision: number;
  revision: number;
  body: ProjectBody | undefined;
  savedBody: ProjectBody | undefined;
  enabled: boolean;
  busy: boolean;
  setBody: Dispatch<SetStateAction<ProjectBody | undefined>>;
  setSavedBody: Dispatch<SetStateAction<ProjectBody | undefined>>;
  setRevision: Dispatch<SetStateAction<number>>;
};

/** Server-backed drafts with revision baselines and a generation fence for discards. */
export function useProjectWorkDraft({ id, initialRevision, revision, body, savedBody, enabled, busy, setBody, setSavedBody, setRevision }: Props) {
  const url = `/api/admin/projects/${id}/draft`;
  const snapshotUrl = `/api/admin/projects/${id}`;
  const [ready, setReady] = useState(false);
  const [recoverable, setRecoverable] = useState<StoredDraft | null>(null);
  const [state, setState] = useState<DraftState>('loading');
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [rebase, setRebase] = useState<Rebase | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const latest = useRef(body);
  latest.current = body;
  const currentSaved = useRef(savedBody);
  currentSaved.current = savedBody;
  const generation = useRef(0);
  const baseBody = useRef(savedBody);
  const inFlight = useRef<Promise<boolean> | null>(null);
  const lastAttempt = useRef('');
  const timer = useRef<number | null>(null);
  const operation = useRef(0);
  const autosavesSuspended = useRef(false);

  const cancelPendingAutosave = useCallback(() => {
    operation.current += 1;
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const snapshot = useCallback(async () => {
    const response = await fetch(snapshotUrl, { cache: 'no-store' });
    const json = await response.json();
    if (!response.ok || !json.body || !Number.isInteger(json.revision)) {
      throw new Error(json.error || 'The latest saved project could not be loaded.');
    }
    return { body: json.body as ProjectBody, revision: json.revision as number };
  }, [snapshotUrl]);

  const applyRebase = useCallback((baseline: ProjectBody, draft: ProjectBody, latestBody: ProjectBody, latestRevision: number, choices: Record<string, MergeChoice> = {}) => {
    const merged = mergeProjectBodies(baseline, draft, latestBody, choices);
    setSavedBody(latestBody);
    setRevision(latestRevision);
    baseBody.current = latestBody;
    setBody(merged.body);
    setRecoverable({ body: draft, baseBody: baseline, baseRevision: latestRevision, updatedAt: new Date().toISOString() });
    if (merged.conflicts.length) {
      setRebase({ baseline, draft, latest: latestBody, revision: latestRevision, conflicts: merged.conflicts, choices });
      setConflict(true);
      setState('conflict');
    } else {
      setRebase(null);
      setConflict(false);
      setRecoverable(null);
      setState('pending');
      lastAttempt.current = '';
    }
    return merged;
  }, [setBody, setRevision, setSavedBody]);

  const reconcile = useCallback((latestBody: ProjectBody, latestRevision: number) => {
    const baseline = currentSaved.current;
    const draft = latest.current;
    if (!baseline || !draft) throw new Error('The local work-plan baseline is unavailable. Export the draft before reconciling.');
    return applyRebase(baseline, draft, latestBody, latestRevision);
  }, [applyRebase]);

  useEffect(() => {
    if (!enabled) { setReady(false); setState('idle'); return; }
    let active = true;
    setReady(false);
    setState('loading');
    void (async () => {
      try {
        cancelPendingAutosave();
        if (inFlight.current) await inFlight.current;
        const [response, current] = await Promise.all([
          fetch(url, { cache: 'no-store' }), snapshot(),
        ]);
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Saved draft could not be loaded.');
        if (!active) return;
        if (Number.isInteger(json.generation)) generation.current = json.generation;
        const localBody = latest.current;
        const localBaseline = currentSaved.current;
        setError('');
        setSavedBody(current.body);
        setRevision(current.revision);
        baseBody.current = current.body;
        const draft = json.draft as StoredDraft | null;
        if (draft && !workplanDraftBodySchema.safeParse(draft.body).success) throw new Error('Saved draft is invalid. It has not been deleted.');
        if (localBody && localBaseline && JSON.stringify(localBody) !== JSON.stringify(localBaseline)) {
          // A server refresh must reconcile the latest in-memory edit, which can
          // be newer than the private autosave returned by this request.
          applyRebase(localBaseline, localBody, current.body, current.revision);
        } else if (draft && JSON.stringify(draft.body) !== JSON.stringify(current.body)) {
          setSavedAt(draft.updatedAt);
          const baseline = draft.baseBody ?? (draft.baseRevision === current.revision ? current.body : null);
          if (baseline && draft.baseRevision !== current.revision) {
            applyRebase(baseline, draft.body, current.body, current.revision);
          } else if (baseline) {
            setRecoverable(draft);
            setState('idle');
          } else {
            setRecoverable(draft);
            setConflict(true);
            setState('conflict');
            setError('This older draft has no recoverable saved baseline. Export it before choosing Discard draft.');
          }
        } else {
          setBody(current.body);
          setRecoverable(null);
          setConflict(false);
          setRebase(null);
          setState('idle');
        }
        setReady(true);
      } catch (cause) {
        if (!active) return;
        setReady(false);
        setState('error');
        setError(cause instanceof Error ? cause.message : 'Saved draft could not be loaded.');
      }
    })();
    return () => { active = false; };
  // This loads only when the page's authoritative project revision changes or the editor mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, initialRevision, enabled, snapshot, applyRebase, setBody, setRevision, setSavedBody, cancelPendingAutosave]);

  const waitForDraft = useCallback(async () => {
    cancelPendingAutosave();
    if (inFlight.current) await inFlight.current;
  }, [cancelPendingAutosave]);

  const persist = useCallback(async (snapshotBody: ProjectBody, baseRevision: number) => {
    if (inFlight.current) await inFlight.current;
    const op = operation.current;
    const expectedGeneration = generation.current;
    const draftBaseline = baseBody.current ?? currentSaved.current;
    if (!draftBaseline) { setError('The saved work-plan baseline is unavailable.'); setState('error'); return false; }
    const signature = `${baseRevision}:${JSON.stringify(snapshotBody)}`;
    const promise = (async () => {
      setState('saving');
      try {
        const response = await fetch(url, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: snapshotBody, baseRevision, baseBody: draftBaseline, expectedGeneration }),
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Draft could not be saved.');
        generation.current = Math.max(generation.current, json.generation);
        lastAttempt.current = signature;
        if (op !== operation.current || autosavesSuspended.current) return true;
        setSavedAt(json.savedAt || null);
        setError('');
        if (json.conflict) {
          try {
            const current = await snapshot();
            applyRebase(draftBaseline, snapshotBody, current.body, current.revision);
          } catch (cause) {
            setConflict(true);
            setState('conflict');
            setError(cause instanceof Error ? cause.message : 'The draft is based on an older project revision. Load the latest project to reconcile it.');
          }
          return false;
        } else if (JSON.stringify(latest.current) === JSON.stringify(snapshotBody)) {
          setState('saved');
        } else {
          setState('pending');
        }
        return !json.conflict;
      } catch (cause) {
        if (op === operation.current && !autosavesSuspended.current) {
          setError(cause instanceof Error ? cause.message : 'Draft could not be saved.');
          setState('error');
        }
        return false;
      }
    })();
    inFlight.current = promise;
    try { return await promise; }
    finally { if (inFlight.current === promise) inFlight.current = null; }
  }, [url, snapshot, applyRebase]);

  const dirty = Boolean(body && savedBody && JSON.stringify(body) !== JSON.stringify(savedBody));
  useEffect(() => {
    if (!enabled || !ready || !dirty || !body || recoverable || conflict || busy || autosavesSuspended.current) return;
    const signature = `${revision}:${JSON.stringify(body)}`;
    if (lastAttempt.current === signature) return;
    setState('pending');
    if (timer.current !== null) window.clearTimeout(timer.current);
    const op = operation.current;
    timer.current = window.setTimeout(() => {
      timer.current = null;
      if (op === operation.current && !autosavesSuspended.current) void persist(body, revision);
    }, 1200);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = null;
    };
  }, [enabled, ready, dirty, body, recoverable, conflict, busy, revision, persist]);

  const saveDraft = useCallback(async () => {
    if (!ready || !body || !enabled || recoverable || conflict) return false;
    cancelPendingAutosave();
    autosavesSuspended.current = false;
    return persist(body, revision);
  }, [ready, body, enabled, recoverable, conflict, cancelPendingAutosave, persist, revision]);

  const suspendAutosaves = useCallback(async () => {
    autosavesSuspended.current = true;
    cancelPendingAutosave();
    if (inFlight.current) await inFlight.current;
  }, [cancelPendingAutosave]);

  const resumeAutosaves = useCallback(() => { autosavesSuspended.current = false; }, []);

  const readGeneration = useCallback(async () => {
    const response = await fetch(url, { cache: 'no-store' });
    const json = await response.json();
    if (!Number.isInteger(json.generation)) throw new Error(json.error || 'Draft state could not be verified.');
    generation.current = json.generation;
    return generation.current;
  }, [url]);

  const deletePrivateDraft = useCallback(async () => {
    const currentGeneration = await readGeneration();
    const response = await fetch(url, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generation: currentGeneration }),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Saved draft could not be discarded.');
    generation.current = json.generation;
    if (!json.body || !Number.isInteger(json.revision)) throw new Error(json.error || 'The draft discard snapshot could not be verified.');
    return { generation: json.generation as number, body: json.body as ProjectBody, revision: json.revision as number };
  }, [readGeneration, url]);

  /** User-requested discard adopts the latest authoritative body and only clears after DELETE confirms. */
  const discardDraft = useCallback(async () => {
    await suspendAutosaves();
    try {
      const current = await deletePrivateDraft();
      baseBody.current = current.body;
      currentSaved.current = current.body;
      setSavedBody(current.body);
      setRevision(current.revision);
      setBody(current.body);
      setRecoverable(null);
      setRebase(null);
      setConflict(false);
      setSavedAt(null);
      setError('');
      setState('idle');
      lastAttempt.current = '';
      autosavesSuspended.current = false;
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Draft discard could not be confirmed. Your edits remain available.');
      setState('error');
      autosavesSuspended.current = false;
      return false;
    }
  }, [suspendAutosaves, deletePrivateDraft, setSavedBody, setRevision, setBody]);

  /** Clear a private draft after the canonical project save has already succeeded. */
  const clearSavedDraft = useCallback(async () => {
    await suspendAutosaves();
    try {
      await deletePrivateDraft();
      setRecoverable(null);
      setRebase(null);
      setConflict(false);
      setSavedAt(null);
      setError('');
      setState('idle');
      lastAttempt.current = '';
      autosavesSuspended.current = false;
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Saved project is current, but its private draft remains.');
      setState('error');
      autosavesSuspended.current = false;
      return false;
    }
  }, [suspendAutosaves, deletePrivateDraft]);

  const restore = useCallback(() => {
    if (!recoverable || recoverable.baseRevision !== revision) return false;
    setBody(recoverable.body);
    baseBody.current = recoverable.baseBody ?? savedBody;
    setConflict(false);
    setState('saved');
    lastAttempt.current = `${revision}:${JSON.stringify(recoverable.body)}`;
    setRecoverable(null);
    return true;
  }, [recoverable, revision, savedBody, setBody]);

  const chooseConflict = useCallback((path: string, choice: MergeChoice) => {
    if (!rebase) return;
    const choices = { ...rebase.choices, [path]: choice };
    applyRebase(rebase.baseline, rebase.draft, rebase.latest, rebase.revision, choices);
  }, [rebase, applyRebase]);

  return {
    state, ready, recoverable, conflict, rebase, error, savedAt, dirty,
    saveDraft, discardDraft, clearSavedDraft, restore, waitForDraft,
    suspendAutosaves, resumeAutosaves, reconcile, chooseConflict,
  };
}
