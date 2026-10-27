'use client';
import {postProjectCommand,confirmProjectCommandRead,ProjectCommandError} from '@/lib/projects/immediate-command';
import {hierarchyCommandSaved} from '@/lib/projects/immediate-results';
import {useProjectMutationRefresh} from './useProjectMutationRefresh';
import {refreshProjectSurfaces} from '@/lib/projects/refresh';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectHierarchyCommand, ProjectHierarchyResponse } from '@/lib/projects/hierarchy-schema';

type WithoutRevisions<T> = T extends unknown ? Omit<T, 'expectedProjectRevision' | 'expectedHierarchyRevision'> : never;
type EditableCommand = WithoutRevisions<ProjectHierarchyCommand>;

/** Server-authoritative, revision-checked sidecar for phases/subtasks; never changes legacy project JSON. */
export function useProjectHierarchy(id: string, projectRevision: number, enabled: boolean) {
  const router=useRouter();
  const [data, setData] = useState<ProjectHierarchyResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [message, setMessage] = useState('');
  const pending = useRef(false);
  const generation=useRef(0);
  const latestData=useRef<ProjectHierarchyResponse|null>(null);
  const url = `/api/admin/projects/${id}/hierarchy`;

  const load = useCallback(async () => {
    const token=++generation.current;
    try {
      const response = await fetch(url, {cache: 'no-store'});
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Project hierarchy could not load.');
      if(token!==generation.current)return false;
      confirmProjectCommandRead(url);
      latestData.current=json as ProjectHierarchyResponse;
      setData(json as ProjectHierarchyResponse);
      setConflict(false);
      setError('');
      return true;
    } catch (cause) {
      if(token===generation.current)setError(cause instanceof Error ? cause.message : 'Project hierarchy could not load.');
      return false;
    }
  }, [url]);

  useEffect(() => {
    if (!enabled) { setData(null); return; }
    void load();
    return()=>{++generation.current;};
  }, [enabled, load, projectRevision]);
  useProjectMutationRefresh(id,load);

  const save = useCallback(async (command: EditableCommand) => {
    if (pending.current || !data || conflict || data.projectRevision !== projectRevision) {
      setError('Save or reload the latest project before editing phases and subtasks.');
      return false;
    }
    pending.current = true;
    ++generation.current;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await postProjectCommand(url,{...command,expectedProjectRevision:data.projectRevision,expectedHierarchyRevision:data.hierarchyRevision});
      // Refresh the sidecar only: the Next.js page, draft state and editing scroll position remain intact.
      const fresh = await load();
      if (!fresh) setConflict(true);
      setMessage(fresh ? 'Task hierarchy saved.' : 'Task hierarchy saved. Refresh its display before another change.');
      refreshProjectSurfaces(id,router);
      return true;
    } catch (cause) {
      if(cause instanceof ProjectCommandError&&cause.kind==='unknown'){
        const fresh=await load();
        if(fresh&&latestData.current&&hierarchyCommandSaved(command,latestData.current,data.hierarchyRevision)){
          setMessage('Task hierarchy saved and verified after the response was lost.');refreshProjectSurfaces(id,router);return true;
        }
      }
      setError(cause instanceof Error ? cause.message : 'Hierarchy changes could not be saved.');
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }, [data, conflict, projectRevision, url, load, router]);

  return { data, busy, error, conflict, message, load, save };
}
