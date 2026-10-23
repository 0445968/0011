'use client';
import {useProjectMutationRefresh} from './useProjectMutationRefresh';
import {refreshProjectSurfaces} from '@/lib/projects/refresh';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectPhase } from '@/lib/projects/lifecycle-schema';
import type { PhaseStatus, ProjectPhaseState } from '@/lib/projects/phase-status';
import { reconcilePhaseStatusSave, updatePhaseState } from '@/lib/projects/phase-save';

export type PhaseSaveResult =
  | { outcome: 'saved' }
  | { outcome: 'saved_refresh_failed' }
  | { outcome: 'failed'; error: string };

const failed = (error: string): PhaseSaveResult => ({ outcome: 'failed', error });

export function useProjectPhaseStatuses(projectId: string, initialStates?: ProjectPhaseState[]) {
  const router = useRouter();
  const [states, setStates] = useState<ProjectPhaseState[] | null>(initialStates ?? null);
  const [savedByPhase, setSavedByPhase] = useState<Record<string, { status: PhaseStatus; at: string }>>({});
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
    if (!initialStates) setStates(null);
    setError('');
    void load(() => active);
    return () => { active = false; };
  }, [load]);

  useProjectMutationRefresh(projectId,()=>load());
  const save = useCallback(async (phase: ProjectPhase, status: PhaseStatus, reason: string) => {
    if (pending.current || !states) return failed('Saved phase statuses are unavailable. Refresh them before retrying.');
    let currentStates = states;
    pending.current = true; setBusy(true); setError('');
    if (needsReconcile.current) {
      const refreshed = await load();
      if (!refreshed) { pending.current = false; setBusy(false); return failed('Phase statuses could not refresh. Retry before saving again.'); }
      needsReconcile.current = false;
      currentStates = refreshed;
    }
    const current = currentStates.find(item => item.phase === phase);
    if (!current) { pending.current = false; setBusy(false); return failed('This project phase is unavailable. Refresh phase statuses.'); }
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
        setSavedByPhase(previous => ({ ...previous, [phase]: { status, at: new Date().toISOString() } }));
        needsReconcile.current = true;
        setRefreshWarning('The phase change was saved. Its display could not refresh; use Refresh phases to reconcile before another change.');
        refreshProjectSurfaces(projectId,router);
        return { outcome: 'saved_refresh_failed' } as const;
      }
      if (result.outcome === 'saved') {
        setError('');
        setSavedByPhase(previous => ({ ...previous, [phase]: { status, at: new Date().toISOString() } }));
        refreshProjectSurfaces(projectId,router);
        return { outcome: 'saved' } as const;
      }
      if (result.uncertain) needsReconcile.current = true;
      const message = result.error || 'The phase change was not confirmed. Refresh phase statuses before retrying.';
      setError(message);
      return failed(message);
    } catch (cause) {
      needsReconcile.current = true;
      const message = cause instanceof Error ? cause.message : 'Could not save phase.';
      const refreshed = await load();
      const actionable = refreshed ? message : `${message} The save outcome is uncertain. Refresh phase statuses before retrying.`;
      setError(actionable);
      return failed(actionable);
    }
    finally { pending.current = false; setBusy(false); }
  }, [projectId, states, load, router]);
  return {states, busy, error, refreshWarning, savedByPhase, load, save};
}
