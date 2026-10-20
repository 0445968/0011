'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProjectPhase } from '@/lib/projects/lifecycle-schema';
import type { PhaseStatus, ProjectPhaseState } from '@/lib/projects/phase-status';

export function useProjectPhaseStatuses(projectId: string) {
  const [states, setStates] = useState<ProjectPhaseState[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const requestGeneration = useRef(0);

  // Ignore stale responses without aborting fetches during React effect cleanup.
  const load = useCallback(async (isActive: () => boolean = () => true) => {
    const currentGeneration = ++requestGeneration.current;
    const isCurrent = () => isActive() && currentGeneration === requestGeneration.current;
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/phases`, { cache: 'no-store' });
      const json = await response.json();
      if (!isCurrent()) return false;
      if (!response.ok) throw new Error(json.error || 'Could not load phases.');
      setStates(json.states);
      setError('');
      return true;
    } catch (cause) {
      if (isCurrent()) setError(cause instanceof Error ? cause.message : 'Could not load phases.');
      return false;
    }
  }, [projectId]);

  useEffect(() => {
    let active = true;
    setStates(null);
    setError('');
    void load(() => active);
    return () => { active = false; };
  }, [load]);

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
