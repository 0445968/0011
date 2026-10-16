'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProjectHierarchyCommand, ProjectHierarchyResponse } from '@/lib/projects/hierarchy-schema';

type WithoutRevisions<T> = T extends unknown ? Omit<T, 'expectedProjectRevision' | 'expectedHierarchyRevision'> : never;
type EditableCommand = WithoutRevisions<ProjectHierarchyCommand>;

/** Server-authoritative, revision-checked sidecar for phases/subtasks; never changes legacy project JSON. */
export function useProjectHierarchy(id: string, projectRevision: number, enabled: boolean) {
  const [data, setData] = useState<ProjectHierarchyResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const pending = useRef(false);
  const url = `/api/admin/projects/${id}/hierarchy`;

  const load = useCallback(async () => {
    try {
      const response = await fetch(url, {cache: 'no-store'});
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Project hierarchy could not load.');
      setData(json as ProjectHierarchyResponse);
      setConflict(false);
      setError('');
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Project hierarchy could not load.');
      return false;
    }
  }, [url]);

  useEffect(() => {
    if (!enabled) { setData(null); return; }
    let current = true;
    void (async () => {
      try {
        const response = await fetch(url, {cache:'no-store'});
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Project hierarchy could not load.');
        if (!current) return;
        setData(json as ProjectHierarchyResponse);
        setError('');
        setConflict(false);
      } catch (cause) {
        if (current) setError(cause instanceof Error ? cause.message : 'Project hierarchy could not load.');
      }
    })();
    return () => { current = false; };
  }, [enabled, url, projectRevision]);

  const save = useCallback(async (command: EditableCommand) => {
    if (pending.current || !data || conflict || data.projectRevision !== projectRevision) {
      setError('Save or reload the latest project before editing phases and subtasks.');
      return false;
    }
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(url, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ ...command, expectedProjectRevision: data.projectRevision, expectedHierarchyRevision: data.hierarchyRevision }),
      });
      const json = await response.json();
      if (!response.ok) {
        if (response.status === 409) setConflict(true);
        throw new Error(json.error || 'Hierarchy changes could not be saved.');
      }
      // Refresh the sidecar only: the Next.js page, draft state and editing scroll position remain intact.
      const fresh = await load();
      if (!fresh) setConflict(true);
      return fresh;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Hierarchy changes could not be saved.');
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }, [data, conflict, projectRevision, url, load]);

  return { data, busy, error, conflict, load, save };
}
