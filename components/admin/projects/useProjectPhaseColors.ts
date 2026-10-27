'use client';
import {useProjectMutationRefresh} from './useProjectMutationRefresh';
import {refreshProjectSurfaces} from '@/lib/projects/refresh';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectPhase } from '@/lib/projects/lifecycle-schema';
import { phaseColorRows, projectPhaseColorsResponseSchema, type ProjectPhaseColor } from '@/lib/projects/phase-colors';

type Feedback = { kind: 'saved' | 'error'; message: string };

export function useProjectPhaseColors(projectId: string, initial: ProjectPhaseColor[]) {
  const router = useRouter();
  const [rows, setRows] = useState(() => phaseColorRows(initial));
  const [feedback, setFeedback] = useState<Partial<Record<ProjectPhase, Feedback>>>({});
  const [saving, setSaving] = useState<ProjectPhase | null>(null);
  const [loadError, setLoadError] = useState('');
  const pending = useRef(false);
  const generation=useRef(0);

  const refresh = useCallback(async () => {
    const token=++generation.current;
    const response = await fetch(`/api/admin/projects/${projectId}/phase-colors`, { cache: 'no-store' });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Phase colors could not refresh.');
    const parsed = projectPhaseColorsResponseSchema.parse(json);
    if(token!==generation.current)return phaseColorRows(parsed.colors);
    setRows(phaseColorRows(parsed.colors));
    setLoadError('');
    return phaseColorRows(parsed.colors);
  }, [projectId]);

  useEffect(() => { void refresh().catch(cause=>setLoadError(cause instanceof Error?cause.message:'Phase colors could not load.'));return()=>{++generation.current;}; },[refresh]);

  useProjectMutationRefresh(projectId,()=>refresh().catch(cause=>setLoadError(cause instanceof Error?cause.message:'Phase colors could not refresh.')));
  const save = useCallback(async (phase: ProjectPhase, color: string | null) => {
    if (pending.current) return false;
    const expectedRevision = rows[phase].revision;
    pending.current = true;
    ++generation.current;
    setSaving(phase);
    setFeedback(previous => ({ ...previous, [phase]: undefined }));
    const setError = (message: string) => setFeedback(previous => ({ ...previous, [phase]: { kind: 'error', message } }));
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/phase-colors`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, color, expectedRevision, reason: color ? 'Phase color updated by staff' : 'Phase color reset to default' }),
      });
      const json = await response.json();
      if (!response.ok || json.saved!==true) {
        if (response.status === 409) {
          try { await refresh(); } catch { /* Preserve the conflict message if refresh is also unavailable. */ }
        }
        throw new Error(json.error || 'Phase color could not save.');
      }
      ++generation.current;
      setRows(previous => ({ ...previous, [phase]: { phase, color: json.color, revision: json.revision } }));
      setFeedback(previous => ({ ...previous, [phase]: { kind: 'saved', message: color ? 'Color saved.' : 'Default color restored.' } }));
      refreshProjectSurfaces(projectId,router);
      return true;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Phase color could not save.';
      // A dropped response can follow a committed command. Reconcile before reporting failure.
      try {
        const fresh = await refresh();
        const saved = fresh[phase];
        if (saved.revision > expectedRevision && saved.color?.toUpperCase() === color?.toUpperCase()) {
          setFeedback(previous => ({ ...previous, [phase]: { kind: 'saved', message: color ? 'Color saved.' : 'Default color restored.' } }));
          refreshProjectSurfaces(projectId,router);
          return true;
        }
      } catch { /* Keep the original actionable failure. */ }
      setError(message);
      return false;
    } finally {
      pending.current = false;
      setSaving(null);
    }
  }, [projectId, rows, refresh, router]);

  return { rows, feedback, saving, loadError, refresh, save };
}
