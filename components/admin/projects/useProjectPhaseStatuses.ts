'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProjectPhase } from '@/lib/projects/lifecycle-schema';
import type { PhaseStatus, ProjectPhaseState } from '@/lib/projects/phase-status';
import { reconcilePhaseStatusSave, updatePhaseState } from '@/lib/projects/phase-save';

export type PhaseSaveResult = 'saved' | 'saved_refresh_failed' | 'failed';

export function useProjectPhaseStatuses(projectId: string) {
  const [states, setStates] = useState<ProjectPhaseState[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refreshWarning, setRefreshWarning] = useState('');
  const pending = useRef(false);
  const needsReconcile = useRef(false);
  const requestGeneration = useRef(0);

  // Ignore stale responses without aborting fetches during React effect cleanup.
  const load = useCallback(async (isActive: () => boolean = () => true) => {
    const currentGeneration = ++requestGeneration.current;
    const isCurrent = () => isActive() && currentGeneration === requestGeneration.current;
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/phases`, { cache: 'no-store' });
      const json = await response.json();
      if (!isCurrent()) return null;
      if (!response.ok) throw new Error(json.error || 'Could not load phases.');
      setStates(json.states);
      setError('');
      setRefreshWarning('');
      return json.states as ProjectPhaseState[];
    } catch (cause) {
      if (isCurrent()) setError(cause instanceof Error ? cause.message : 'Could not load phases.');
      return null;
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
    if (pending.current || !states) return 'failed' as const;
    let currentStates = states;
    pending.current = true; setBusy(true); setError('');
    if (needsReconcile.current) {
      const refreshed = await load();
      if (!refreshed) { pending.current = false; setBusy(false); return 'failed' as const; }
      needsReconcile.current = false;
      currentStates = refreshed;
    }
    const current = currentStates.find(item => item.phase === phase);
    if (!current) { pending.current = false; setBusy(false); return 'failed' as const; }
    try {
      const result = await reconcilePhaseStatusSave({
        phase, status, expectedRevision: current.revision,
        write: async () => {
          const response = await fetch(`/api/admin/projects/${projectId}/phases`, {
            method: 'POST', headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({phase, status, reason, expectedRevision:current.revision}),
          });
          const json = await response.json();
          return response.ok
            ? { saved: true as const, revision: json.revision as number }
            : { saved: false as const, error: json.error || 'Could not save phase.' };
        },
        refresh: async () => {
          return await load();
        },
        applySaved: (revision) => setStates(previous => previous ? updatePhaseState(previous, phase, status, revision).map(item => item.phase === phase
          ? { ...item, everActive: item.everActive || status === 'active' || status === 'completed',
            activatedAt: status === 'active' || status === 'completed' ? item.activatedAt ?? new Date().toISOString() : item.activatedAt,
            completedAt: status === 'completed' ? new Date().toISOString() : null }
          : item) : previous),
      });
      if (result.states) setStates(result.states);
      if (result.outcome === 'saved_refresh_failed') {
        needsReconcile.current = true;
        setRefreshWarning('The phase change was saved. Its display could not refresh; use Refresh phases to reconcile before another change.');
        return 'saved_refresh_failed' as const;
      }
      if (result.outcome === 'saved') { setError(''); return 'saved' as const; }
      if (result.uncertain) needsReconcile.current = true;
      setError(result.error || 'The phase change was not confirmed. Refresh phase statuses before retrying.');
      return 'failed' as const;
    } catch (cause) {
      needsReconcile.current = true;
      const message = cause instanceof Error ? cause.message : 'Could not save phase.';
      const refreshed = await load();
      if (!refreshed) setError(`${message} The save outcome is uncertain. Refresh phase statuses before retrying.`);
      return 'failed' as const;
    }
    finally { pending.current = false; setBusy(false); }
  }, [projectId, states, load]);
  return {states, busy, error, refreshWarning, load, save};
}
