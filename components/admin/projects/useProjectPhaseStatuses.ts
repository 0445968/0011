'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProjectPhase } from '@/lib/projects/lifecycle-schema';
import type { PhaseStatus, ProjectPhaseState } from '@/lib/projects/phase-status';

export function useProjectPhaseStatuses(projectId: string) {
  const [states, setStates] = useState<ProjectPhaseState[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/phases`, { cache:'no-store', signal });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Could not load phases.');
      if (!signal?.aborted) { setStates(json.states); setError(''); }
      return true;
    } catch (cause) {
      if (!signal?.aborted) setError(cause instanceof Error ? cause.message : 'Could not load phases.');
      return false;
    }
  }, [projectId]);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  const save = useCallback(async (phase: ProjectPhase, status: PhaseStatus, reason: string) => {
    if (pending.current || !states) return false;
    const current = states.find(item => item.phase === phase);
    if (!current) return false;
    pending.current = true; setBusy(true); setError('');
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/phases`, {
        method: 'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({phase, status, reason, expectedRevision:current.revision}),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Could not save phase.');
      return await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save phase.'); return false; }
    finally { pending.current = false; setBusy(false); }
  }, [projectId, states, load]);
  return {states, busy, error, load, save};
}
