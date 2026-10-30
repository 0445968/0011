'use client';

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {readCheckpoint,writeCheckpoint,recoveryKey} from '@/lib/projects/work-recovery';
import type { ProjectBody } from '@/lib/projects/schema';
import { workplanDraftBodySchema } from '@/lib/projects/workplan-draft-schema';
import { projectBodiesEqual, mergeProjectBodies, type MergeChoice, type WorkplanMergeConflict } from '@/lib/projects/workplan-merge';

type StoredDraft = { body: ProjectBody; baseBody: ProjectBody | null; baseRevision: number; updatedAt: string };
type DraftState = 'loading' | 'idle' | 'pending' | 'saving' | 'saved' | 'error' | 'conflict';
type Rebase = { baseline: ProjectBody; draft: ProjectBody; latest: ProjectBody; revision: number; conflicts: WorkplanMergeConflict[]; choices: Record<string, MergeChoice> };

type Props = {
  id: string;
  userId?:string;
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
export function useProjectWorkDraft({ id, userId, initialRevision, revision, body, savedBody, enabled, busy, setBody, setSavedBody, setRevision }: Props) {
  const url = `/api/admin/projects/${id}/draft`;
  const snapshotUrl = `/api/admin/projects/${id}`;
  const checkpointKey=userId?recoveryKey(userId,id):null;
  const retention=useRef(30);
  const [recoveryPrompt,setRecoveryPrompt]=useState(false);
  const [recoveryCopy,setRecoveryCopy]=useState<StoredDraft|null>(null);
  const [checkpointError,setCheckpointError]=useState('');
  const [loadRequest,setLoadRequest]=useState(0);
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
  const loadedInitialRevision=useRef<number|null>(null);
  const unresolved=useRef(rebase);
  unresolved.current=rebase;

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
    if (!enabled) { loadedInitialRevision.current=null;setReady(false); setState('idle'); return; }
    if (busy) return;
    if(loadedInitialRevision.current===initialRevision&&loadRequest===0)return;
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
        retention.current=[1,7,14,30,60].includes(json.retentionDays)?json.retentionDays:30;
        const local=checkpointKey?readCheckpoint(window.localStorage,checkpointKey,Date.now(),retention.current):null;
        const previous=json.recovery as StoredDraft|null;
        setRecoveryCopy(local?.discarded?local:previous&&workplanDraftBodySchema.safeParse(previous.body).success?previous:null);
        let draft = json.draft as StoredDraft | null;
        if(local&&!local.discarded&&(!draft||Date.parse(local.updatedAt)>Date.parse(draft.updatedAt)))draft=local;
        if (draft && !workplanDraftBodySchema.safeParse(draft.body).success) throw new Error('Saved draft is invalid. It has not been deleted.');
        if(unresolved.current){
          const previous=unresolved.current;
          applyRebase(previous.baseline,previous.draft,current.body,current.revision,previous.choices);
        } else if (localBody && localBaseline && !projectBodiesEqual(localBody,localBaseline)) {
          // A server refresh must reconcile the latest in-memory edit, which can
          // be newer than the private autosave returned by this request.
          applyRebase(localBaseline, localBody, current.body, current.revision);
        } else if (draft && !projectBodiesEqual(draft.body,current.body)) {
          setSavedAt(draft.updatedAt);
          const baseline = draft.baseBody ?? (draft.baseRevision === current.revision ? current.body : null);
          setRecoverable({...draft,baseBody:baseline});setRecoveryPrompt(true);
          setConflict(!baseline);
          setState(baseline?'idle':'conflict');
          if(!baseline)setError('This draft has no saved baseline. Export it before discarding.');
        } else {
          setBody(current.body);
          setRecoverable(null);
          setConflict(false);
          setRebase(null);
          setState('idle');
        }
        setReady(true);
        loadedInitialRevision.current=initialRevision;setLoadRequest(0);
      } catch (cause) {
        if (!active) return;
        setReady(false);
        setState('error');
        setError(cause instanceof Error ? cause.message : 'Saved draft could not be loaded.');
      }
    })();
    return () => { active = false; };
  // Reconcile after authoritative revisions and after a coordinated command settles.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, initialRevision,loadRequest, enabled, busy, snapshot, applyRebase, setBody, setRevision, setSavedBody, cancelPendingAutosave,checkpointKey]);

  const waitForDraft = useCallback(async () => {
    cancelPendingAutosave();
    if (inFlight.current) await inFlight.current;
  }, [cancelPendingAutosave]);

  const persist = useCallback(async (snapshotBody: ProjectBody, baseRevision: number, baselineOverride?:ProjectBody|null) => {
    if (inFlight.current) await inFlight.current;
    const op = operation.current;
    const expectedGeneration = generation.current;
    const draftBaseline = baselineOverride??baseBody.current??currentSaved.current;
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
        setRecoveryCopy({body:snapshotBody,baseBody:draftBaseline,baseRevision,updatedAt:json.savedAt||new Date().toISOString()});
        lastAttempt.current = signature;
        if (op !== operation.current || autosavesSuspended.current) return true;
        setSavedAt(json.savedAt || null);
        setError('');
        if (json.conflict) {
          try {
            const current = await snapshot();
            applyRebase(draftBaseline, latest.current ?? snapshotBody, current.body, current.revision);
          } catch (cause) {
            setConflict(true);
            setState('conflict');
            setError(cause instanceof Error ? cause.message : 'The draft is based on an older project revision. Load the latest project to reconcile it.');
          }
          return false;
        } else if (latest.current&&projectBodiesEqual(latest.current,snapshotBody)) {
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

  const dirty = Boolean(body && savedBody && !projectBodiesEqual(body,savedBody));
  const checkpoint=useCallback((discarded=false)=>{
    if(!checkpointKey||!latest.current||!currentSaved.current||projectBodiesEqual(latest.current,currentSaved.current))return;
    try{writeCheckpoint(window.localStorage,checkpointKey,{body:latest.current,baseBody:currentSaved.current,baseRevision:revision,updatedAt:new Date().toISOString()},retention.current,discarded);setCheckpointError('');}
    catch{setCheckpointError('Local recovery storage is unavailable. Wait for server Draft saved before leaving.');}
  },[checkpointKey,revision]);
  useEffect(()=>{if(enabled&&ready&&dirty&&!recoverable)checkpoint();},[enabled,ready,dirty,body,recoverable,checkpoint]);
  useEffect(()=>{
    if(!checkpointKey)return;
    const flush=()=>checkpoint();
    const preference=(event:Event)=>{retention.current=Number((event as CustomEvent).detail)||30;checkpoint();};
    window.addEventListener('beforeunload',flush);window.addEventListener('pagehide',flush);window.addEventListener('bivi:staff-signing-out',flush);window.addEventListener('bivi:recovery-retention',preference);
    return()=>{window.removeEventListener('beforeunload',flush);window.removeEventListener('pagehide',flush);window.removeEventListener('bivi:staff-signing-out',flush);window.removeEventListener('bivi:recovery-retention',preference);};
  },[checkpoint,checkpointKey]);

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

  useEffect(()=>{
    if(!checkpointKey)return;
    const renewed=()=>{if(enabled&&!ready){setLoadRequest(value=>value+1);return;}if(enabled&&ready&&dirty&&!recoverable&&!conflict&&!busy&&latest.current){cancelPendingAutosave();void persist(latest.current,revision);}};
    window.addEventListener('bivi:staff-session-renewed',renewed);return()=>window.removeEventListener('bivi:staff-session-renewed',renewed);
  },[checkpointKey,enabled,ready,dirty,recoverable,conflict,busy,revision,persist,cancelPendingAutosave]);

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

  const deletePrivateDraft = useCallback(async () => {
    const currentGeneration = generation.current;
    const response = await fetch(url, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generation: currentGeneration }),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Saved draft could not be discarded.');
    generation.current = json.generation;
    if (!json.body || !Number.isInteger(json.revision)) throw new Error(json.error || 'The draft discard snapshot could not be verified.');
    return { generation: json.generation as number, body: json.body as ProjectBody, revision: json.revision as number };
  }, [url]);

  /** User-requested discard adopts the latest authoritative body and only clears after DELETE confirms. */
  const discardDraft = useCallback(async () => {
    const discardedBody=latest.current;
    const copy=recoverable??(discardedBody&&currentSaved.current?{body:discardedBody,baseBody:currentSaved.current,baseRevision:revision,updatedAt:new Date().toISOString()}:null);
    if(copy&&checkpointKey){try{writeCheckpoint(window.localStorage,checkpointKey,copy,retention.current,true);}catch{setCheckpointError('Local recovery unavailable; server copies remain available.');}}
    if(copy)setRecoveryCopy(copy);
    await suspendAutosaves();
    try {
      if(copy&&!await persist(copy.body,copy.baseRevision,copy.baseBody))throw new Error('Recovery backup could not be confirmed. Your edits remain available.');
      const current = await deletePrivateDraft();
      if(discardedBody&&latest.current&&!projectBodiesEqual(discardedBody,latest.current)){
        applyRebase(discardedBody,latest.current,current.body,current.revision);
        setSavedAt(null);setError('The requested draft was discarded; newer edits remain for review.');
        lastAttempt.current='';autosavesSuspended.current=false;return false;
      }
      baseBody.current = current.body;
      currentSaved.current = current.body;
      setSavedBody(current.body);
      setRevision(current.revision);
      const newer=discardedBody&&latest.current ? mergeProjectBodies(discardedBody,latest.current,current.body) : null;
      setBody(newer?.body??current.body);
      setRecoverable(null);setRecoveryPrompt(false);
      setRebase(null);
      setConflict(false);
      setSavedAt(null);
      setError('');
      setState('idle');
      lastAttempt.current = '';
      autosavesSuspended.current = false;
      return true;
    } catch (cause) {
      if(copy&&checkpointKey){try{writeCheckpoint(window.localStorage,checkpointKey,copy,retention.current,false);}catch{/* Existing server backup remains. */}}
      setError(cause instanceof Error ? cause.message : 'Draft discard could not be confirmed. Your edits remain available.');
      setState('error');
      autosavesSuspended.current = false;
      return false;
    }
  }, [suspendAutosaves, deletePrivateDraft, setSavedBody, setRevision, setBody,applyRebase,recoverable,revision,checkpointKey,persist]);

  /** Clear a private draft after the canonical project save has already succeeded. */
  const clearSavedDraft = useCallback(async (submitted?:ProjectBody) => {
    await suspendAutosaves();
    try {
      await deletePrivateDraft();
      if(checkpointKey&&(!submitted||latest.current&&projectBodiesEqual(latest.current,submitted))){try{window.localStorage.removeItem(checkpointKey);}catch{/* Server recovery remains. */}}
      setRecoverable(null);setRecoveryPrompt(false);
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
  }, [suspendAutosaves, deletePrivateDraft,checkpointKey]);

  const restore = useCallback(() => {
    if(!recoverable||!savedBody)return false;
    setRecoveryPrompt(false);
    if(recoverable.baseRevision!==revision){
      if(!recoverable.baseBody)return false;
      applyRebase(recoverable.baseBody,recoverable.body,savedBody,revision);return true;
    }
    setBody(recoverable.body);
    baseBody.current=recoverable.baseBody??savedBody;
    setConflict(false);setState('pending');lastAttempt.current='';setRecoverable(null);return true;
  },[recoverable,revision,savedBody,setBody,applyRebase]);
  const reviewRecovery=useCallback(()=>{if(!recoveryCopy)return;setRecoverable(recoveryCopy);setRecoveryPrompt(true);},[recoveryCopy]);

  const chooseConflict = useCallback((path: string, choice: MergeChoice) => {
    if (!rebase) return;
    const choices = { ...rebase.choices, [path]: choice };
    applyRebase(rebase.baseline, rebase.draft, rebase.latest, rebase.revision, choices);
  }, [rebase, applyRebase]);

  const acceptSubmitted=useCallback((submitted:ProjectBody,canonical:ProjectBody,nextRevision:number)=>{
    const before=currentSaved.current??canonical;const local=latest.current??submitted;
    const remaining={...local,tasks:local.tasks.flatMap(task=>{
      const sent=submitted.tasks.find(item=>item.id===task.id);const saved=before.tasks.find(item=>item.id===task.id);
      if(sent&&projectBodiesEqual({...before,tasks:[sent]},{...before,tasks:[task]})&&(!saved||!projectBodiesEqual({...before,tasks:[sent]},{...before,tasks:[saved]})))return saved?[saved]:[];
      return [task];
    })};
    return applyRebase(before,remaining,canonical,nextRevision);
  },[applyRebase]);

  const acceptSaved=useCallback((submitted:ProjectBody,canonical:ProjectBody,nextRevision:number)=>{
    // Only the submitted snapshot is acknowledged. Edits typed later remain a draft.
    return applyRebase(submitted,latest.current??submitted,canonical,nextRevision);
  },[applyRebase]);

  return {
    state, ready, recoverable, recoveryCopy,reviewRecovery,recoveryPrompt,setRecoveryPrompt,checkpointError, conflict, rebase, error, savedAt, dirty,
    saveDraft, discardDraft, clearSavedDraft, restore, waitForDraft,
    suspendAutosaves, resumeAutosaves, reconcile, chooseConflict, acceptSaved,acceptSubmitted,
  };
}
